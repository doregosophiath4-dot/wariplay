'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =====================================================
// SVG ICONS
// =====================================================
const BoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const CrownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 14h14v2H5v-2z" />
  </svg>
)

// =====================================================
// CONSTANTES DU JEU
// =====================================================
const DIRS: [number, number][] = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [1, 1], [-1, 1], [1, -1]
]

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export default function OthelloPage() {
  // Refs
  const boardRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cellRefsRef = useRef<any[][]>([])
  const gridRef = useRef<string[][]>([])
  const turnRef = useRef<string>('black')
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const animationFrameRef = useRef<number>(0)

  // States
  const [scoreBlack, setScoreBlack] = useState(2)
  const [scoreWhite, setScoreWhite] = useState(2)
  const [turn, setTurn] = useState('black')
  const [message, setMessage] = useState('')
  const [gameState, setGameState] = useState(0)

  // =====================================================
  // CANVAS GLOW
  // =====================================================
  const drawCanvasGlow = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || canvas.width === 0) return

    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)

    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, 'rgba(255,210,90,0.03)')
    grad.addColorStop(0.6, 'rgba(180,120,50,0.02)')
    grad.addColorStop(1, 'rgba(80,50,20,0.03)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    const now = Date.now() / 900
    for (let i = 0; i < 28; i++) {
      const x = (Math.sin(now + i * 0.9) * 0.25 + 0.5) * w
      const y = (Math.cos(now * 0.6 + i * 1.2) * 0.25 + 0.5) * h
      ctx.beginPath()
      ctx.arc(x, y, Math.max(1.5, w * 0.012), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 210, 120, ${0.04 + Math.sin(now + i) * 0.02})`
      ctx.fill()
    }

    ctx.beginPath()
    ctx.rect(3, 3, w - 6, h - 6)
    ctx.strokeStyle = 'rgba(255,200,100,0.2)'
    ctx.lineWidth = 1.2
    ctx.stroke()

    animationFrameRef.current = requestAnimationFrame(drawCanvasGlow)
  }, [])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = canvas?.parentElement
    if (!canvas || !container) return
    const rect = container.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width
      canvas.height = rect.height
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }
  }, [])

  const resizeCanvasAndDraw = useCallback(() => {
    resizeCanvas()
    drawCanvasGlow()
  }, [resizeCanvas, drawCanvasGlow])

  // =====================================================
  // LOGIQUE DU JEU
  // =====================================================
  const canFlip = useCallback((row: number, col: number, color: string): boolean => {
    const grid = gridRef.current
    const opp = color === 'black' ? 'white' : 'black'
    for (const [dx, dy] of DIRS) {
      let r = row + dx
      let c = col + dy
      let hasOpp = false
      while (r >= 0 && r < 8 && c >= 0 && c < 8 && grid[r][c] === opp) {
        hasOpp = true
        r += dx
        c += dy
      }
      if (hasOpp && r >= 0 && r < 8 && c >= 0 && c < 8 && grid[r][c] === color) {
        return true
      }
    }
    return false
  }, [])

  const getValidMoves = useCallback((color: string): [number, number][] => {
    const grid = gridRef.current
    const moves: [number, number][] = []
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (!grid[i][j] && canFlip(i, j, color)) {
          moves.push([i, j])
        }
      }
    }
    return moves
  }, [canFlip])

  const flipPieces = useCallback((row: number, col: number, color: string): [number, number][] => {
    const grid = gridRef.current
    const opp = color === 'black' ? 'white' : 'black'
    const flipped: [number, number][] = []
    for (const [dx, dy] of DIRS) {
      let r = row + dx
      let c = col + dy
      const line: [number, number][] = []
      while (r >= 0 && r < 8 && c >= 0 && c < 8 && grid[r][c] === opp) {
        line.push([r, c])
        r += dx
        c += dy
      }
      if (line.length && r >= 0 && r < 8 && c >= 0 && c < 8 && grid[r][c] === color) {
        flipped.push(...line)
      }
    }
    for (const [fr, fc] of flipped) {
      grid[fr][fc] = color
    }
    return flipped
  }, [])

  const updateScoreUI = useCallback(() => {
    const grid = gridRef.current
    let b = 0
    let w = 0
    for (const row of grid) {
      for (const v of row) {
        if (v === 'black') b++
        else if (v === 'white') w++
      }
    }
    setScoreBlack(b)
    setScoreWhite(w)
  }, [])

  const renderBoard = useCallback(() => {
    const grid = gridRef.current
    const currentTurn = turnRef.current
    const valid = getValidMoves(currentTurn)
    const cellRefs = cellRefsRef.current

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (!cellRefs[i] || !cellRefs[i][j]) continue
        const { cell, disc } = cellRefs[i][j]
        const value = grid[i][j]
        const isValid = !value && valid.some(([r, c]) => r === i && c === j)

        if (cell) {
          if (isValid) {
            cell.classList.add('valid-cell')
          } else {
            cell.classList.remove('valid-cell')
          }
        }

        if (disc) {
          if (value) {
            disc.className = `disc-othello ${value === 'black' ? 'disc-black' : 'disc-white'}`
          } else {
            disc.className = 'disc-othello disc-hidden'
          }
        }
      }
    }
    updateScoreUI()
  }, [getValidMoves, updateScoreUI])

  const endGame = useCallback(() => {
    const grid = gridRef.current
    let b = 0
    let w = 0
    for (const row of grid) {
      for (const v of row) {
        if (v === 'black') b++
        else if (v === 'white') w++
      }
    }
    if (b > w) {
      setMessage(`Victoire Noir — ${b} contre ${w}`)
    } else if (w > b) {
      setMessage(`Victoire Blanc — ${w} contre ${b}`)
    } else {
      setMessage(`Egalite parfaite — ${b} partout`)
    }
    renderBoard()
  }, [renderBoard])

  const switchTurnAfterDelay = useCallback((flippedCount: number) => {
    const currentTurn = turnRef.current
    const nextTurn = currentTurn === 'black' ? 'white' : 'black'
    turnRef.current = nextTurn
    setTurn(nextTurn)

    let valid = getValidMoves(nextTurn)
    if (valid.length === 0) {
      const oppTurn = nextTurn === 'black' ? 'white' : 'black'
      const oppValid = getValidMoves(oppTurn)
      if (oppValid.length === 0) {
        endGame()
        return
      } else {
        turnRef.current = oppTurn
        setTurn(oppTurn)
        const nextValid = getValidMoves(oppTurn)
        if (nextValid.length === 0) {
          endGame()
          return
        } else {
          setMessage(`${oppTurn === 'black' ? 'Blanc' : 'Noir'} passe — tour automatique.`)
          setTimeout(() => {
            setMessage(prev => prev.includes('passe') ? '' : prev)
          }, 2000)
        }
      }
    } else {
      setMessage('')
    }
    renderBoard()
    setGameState(s => s + 1)
  }, [getValidMoves, endGame, renderBoard])

  const onClickCell = useCallback((i: number, j: number) => {
    const grid = gridRef.current
    const currentTurn = turnRef.current

    if (grid[i][j]) return
    if (!canFlip(i, j, currentTurn)) return

    grid[i][j] = currentTurn

    const cellRefs = cellRefsRef.current
    if (cellRefs[i] && cellRefs[i][j] && cellRefs[i][j].disc) {
      cellRefs[i][j].disc.className = `disc-othello ${currentTurn === 'black' ? 'disc-black' : 'disc-white'} disc-new`
      setTimeout(() => {
        if (cellRefs[i] && cellRefs[i][j] && cellRefs[i][j].disc) {
          cellRefs[i][j].disc.classList.remove('disc-new')
        }
      }, 400)
    }

    const flippedList = flipPieces(i, j, currentTurn)

    if (flippedList.length) {
      flippedList.forEach(([fr, fc], idx) => {
        setTimeout(() => {
          if (cellRefs[fr] && cellRefs[fr][fc] && cellRefs[fr][fc].disc) {
            cellRefs[fr][fc].disc.classList.add('disc-flipping')
            setTimeout(() => {
              if (cellRefs[fr] && cellRefs[fr][fc] && cellRefs[fr][fc].disc) {
                cellRefs[fr][fc].disc.className = `disc-othello ${currentTurn === 'black' ? 'disc-black' : 'disc-white'}`
                cellRefs[fr][fc].disc.classList.remove('disc-flipping')
              }
            }, 200)
          }
        }, idx * 50)
      })
    }

    const animDelay = Math.min(flippedList.length * 50 + 400, 700)
    setTimeout(() => {
      switchTurnAfterDelay(flippedList.length)
    }, animDelay)

    setGameState(s => s + 1)
  }, [canFlip, flipPieces, switchTurnAfterDelay])

  // =====================================================
  // CONSTRUCTION DU PLATEAU
  // =====================================================
  const buildBoardUI = useCallback(() => {
    const boardDiv = boardRef.current
    if (!boardDiv) return

    boardDiv.innerHTML = ''
    const cellRefs: any[][] = []

    for (let i = 0; i < 8; i++) {
      cellRefs[i] = []
      for (let j = 0; j < 8; j++) {
        const cellDiv = document.createElement('div')
        cellDiv.className = 'othello-cell'

        const hintDot = document.createElement('div')
        hintDot.className = 'othello-hint-dot'

        const discEl = document.createElement('div')
        discEl.className = 'disc-othello disc-hidden'

        cellDiv.appendChild(hintDot)
        cellDiv.appendChild(discEl)

        const row = i
        const col = j
        cellDiv.addEventListener('click', () => onClickCell(row, col))

        boardDiv.appendChild(cellDiv)
        cellRefs[i][j] = { cell: cellDiv, disc: discEl }
      }
    }

    cellRefsRef.current = cellRefs
  }, [onClickCell])

  // =====================================================
  // INITIALISATION
  // =====================================================
  const initGame = useCallback(() => {
    const grid: string[][] = Array.from({ length: 8 }, () => Array(8).fill(''))
    grid[3][3] = 'white'
    grid[4][4] = 'white'
    grid[3][4] = 'black'
    grid[4][3] = 'black'
    gridRef.current = grid
    turnRef.current = 'black'
    setTurn('black')
    setMessage('')

    if (cellRefsRef.current.length === 0) {
      buildBoardUI()
    }

    setTimeout(() => {
      renderBoard()
      resizeCanvasAndDraw()
    }, 50)
  }, [buildBoardUI, renderBoard, resizeCanvasAndDraw])

  // =====================================================
  // EFFECTS
  // =====================================================
  useEffect(() => {
    initGame()

    const container = boardRef.current?.parentElement
    if (container && window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(() => {
        resizeCanvasAndDraw()
      })
      resizeObserverRef.current.observe(container)
    }

    window.addEventListener('resize', resizeCanvasAndDraw)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
      window.removeEventListener('resize', resizeCanvasAndDraw)
    }
  }, [initGame, resizeCanvasAndDraw])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0704] p-4">
      
      <style>{`
        .othello-cell {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.05s linear;
          border-right: 1px solid rgba(210, 180, 100, 0.35);
          border-bottom: 1px solid rgba(210, 180, 100, 0.35);
          box-shadow: inset 0 0 0 1px rgba(255, 220, 120, 0.08);
        }
        .othello-cell:nth-child(8n) {
          border-right: none;
        }
        .othello-cell:nth-last-child(-n+8) {
          border-bottom: none;
        }
        .othello-cell:active {
          transform: scale(0.97);
        }

        .othello-hint-dot {
          position: absolute;
          width: 22%;
          height: 22%;
          min-width: 10px;
          min-height: 10px;
          border-radius: 50%;
          background: radial-gradient(circle, #ffe6aa, #ffcf6e);
          box-shadow: 0 0 10px #ffcf6e, 0 0 4px #ffb347;
          opacity: 0;
          transform: scale(0.5);
          transition: opacity 0.2s, transform 0.2s cubic-bezier(0.34, 1.2, 0.64, 1);
          pointer-events: none;
          z-index: 5;
        }
        .valid-cell .othello-hint-dot {
          opacity: 0.85;
          transform: scale(1);
        }

        .disc-othello {
          width: 88%;
          height: 88%;
          border-radius: 50%;
          position: absolute;
          top: 6%;
          left: 6%;
          transition: box-shadow 0.2s, transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.3s;
        }
        .disc-hidden {
          transform: scale(0);
          opacity: 0;
        }
        .disc-black {
          transform: scale(1);
          opacity: 1;
          background: radial-gradient(circle at 38% 32%, #4b4b4b, #0a0a0a 70%);
          box-shadow: 0 4px 10px rgba(0,0,0,0.9), inset 0 1px 3px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.5);
        }
        .disc-black::after {
          content: '';
          position: absolute;
          width: 28%;
          height: 14%;
          border-radius: 50%;
          background: rgba(255,255,240,0.25);
          top: 18%;
          left: 20%;
          filter: blur(1px);
          transform: rotate(-28deg);
        }
        .disc-white {
          transform: scale(1);
          opacity: 1;
          background: radial-gradient(circle at 38% 32%, #ffffff, #e2d6c0 68%);
          box-shadow: 0 4px 10px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.1);
        }
        .disc-white::after {
          content: '';
          position: absolute;
          width: 28%;
          height: 14%;
          border-radius: 50%;
          background: rgba(255,255,245,0.8);
          top: 18%;
          left: 20%;
          filter: blur(1px);
          transform: rotate(-28deg);
        }
        .disc-new {
          animation: burstPop 0.35s cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
        }
        .disc-flipping {
          animation: elegantFlip 0.5s ease-out forwards;
        }

        @keyframes burstPop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.1) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes elegantFlip {
          0% { transform: scale(1) rotateY(0deg); }
          45% { transform: scale(0.95) rotateY(100deg); }
          55% { transform: scale(0.96) rotateY(100deg); }
          100% { transform: scale(1) rotateY(360deg); }
        }
      `}</style>

      <div
        className="flex flex-col items-center gap-4 sm:gap-5 px-4 sm:px-5 py-5 sm:py-8 rounded-[48px] w-full max-w-[720px] mx-auto shadow-[inset_0_1px_3px_rgba(255,215,150,0.08),0_25px_40px_rgba(0,0,0,0.6)]"
        style={{ background: 'linear-gradient(145deg, #1e160e 0%, #0f0c08 100%)' }}
      >
        
        {/* Titre */}
        <div className="text-center">
          <div className="text-[clamp(9px,3vw,11px)] tracking-[0.35em] text-[#c6aa82] uppercase font-light drop-shadow-[0_1px_2px_black]">
            OTHELLO · LUMIERE ET OMBRE
          </div>
          <div
            className="text-[clamp(22px,6vw,30px)] font-bold tracking-[0.06em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
            style={{
              background: 'linear-gradient(135deg, #f3e6c2, #c2a16b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <CrownIcon /> STRATEGIE <CrownIcon />
          </div>
        </div>

        {/* HUD */}
        <div className="flex items-center gap-[clamp(12px,4vw,28px)] bg-[rgba(20,16,10,0.75)] backdrop-blur-xl border border-[rgba(200,170,110,0.4)] rounded-[80px] px-[clamp(16px,5vw,32px)] py-2 shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,245,190,0.1)] flex-wrap justify-center">
          
          {/* Joueur Noir */}
          <div className="flex items-center gap-[clamp(6px,2vw,14px)]">
            <div className="w-[clamp(26px,7vw,36px)] h-[clamp(26px,7vw,36px)] rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.25)]"
              style={{ background: 'radial-gradient(circle at 35% 32%, #5e5e5e, #111111 75%)' }} />
            <div>
              <div className="text-[clamp(11px,3vw,14px)] font-semibold text-[#e0c8a0] tracking-[0.08em]">NOIR</div>
              <div className="text-[clamp(20px,6vw,28px)] font-extrabold text-[#f7e5c2] drop-shadow-[0_2px_5px_black] leading-none">{scoreBlack}</div>
            </div>
          </div>

          {/* Separateur */}
          <div className="w-[2px] h-[clamp(28px,7vw,40px)] bg-gradient-to-b from-transparent via-[#c8aa70] to-transparent" />

          {/* Indicateur de tour */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-[clamp(8px,2.5vw,10px)] text-[#ad9272] tracking-[0.2em]">TOUR</div>
            <div
              className="w-[clamp(16px,4.5vw,22px)] h-[clamp(16px,4.5vw,22px)] rounded-full transition-all duration-300 filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
              style={{
                background: turn === 'black'
                  ? 'radial-gradient(circle at 38% 30%, #5f5f5f, #171717)'
                  : 'radial-gradient(circle at 38% 30%, #fff, #e2cfaa)',
                boxShadow: turn === 'black'
                  ? '0 0 6px rgba(0,0,0,0.9), inset 0 1px 2px rgba(255,255,255,0.2)'
                  : '0 0 10px #ffeaac, inset 0 1px 2px white',
              }}
            />
          </div>

          {/* Separateur */}
          <div className="w-[2px] h-[clamp(28px,7vw,40px)] bg-gradient-to-b from-transparent via-[#c8aa70] to-transparent" />

          {/* Joueur Blanc */}
          <div className="flex items-center gap-[clamp(6px,2vw,14px)]">
            <div>
              <div className="text-[clamp(11px,3vw,14px)] font-semibold text-[#e0c8a0] tracking-[0.08em]">BLANC</div>
              <div className="text-[clamp(20px,6vw,28px)] font-extrabold text-[#f7e5c2] drop-shadow-[0_2px_5px_black] leading-none">{scoreWhite}</div>
            </div>
            <div className="w-[clamp(26px,7vw,36px)] h-[clamp(26px,7vw,36px)] rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.5),inset_0_1px_3px_white]"
              style={{ background: 'radial-gradient(circle at 35% 32%, #fefef7, #cfc5b0 70%)' }} />
          </div>
        </div>

        {/* Plateau */}
        <div className="relative w-full flex justify-center filter drop-shadow-[0_18px_28px_rgba(0,0,0,0.7)]">
          <div className="relative w-[min(85vw,85vh,560px)] h-[min(85vw,85vh,560px)] aspect-square">
            
            {/* Grille du plateau */}
            <div
              ref={boardRef}
              className="absolute inset-0 rounded-2xl border-[3px] border-[#c49a6c] z-[2] grid grid-cols-8 grid-rows-8 gap-0 shadow-[inset_0_0_0_2px_rgba(255,215,140,0.25),inset_0_0_20px_rgba(0,0,0,0.5),0_0_0_6px_#6b4e2a,0_0_0_9px_#3d2a14]"
              style={{ background: 'linear-gradient(135deg, #1f5e12 0%, #134009 45%, #0f3708 100%)' }}
            />

            {/* Canvas glow */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-2xl"
              width="560"
              height="560"
            />
          </div>
        </div>

        {/* Message */}
        <div className="h-9 text-center px-3 flex items-center justify-center">
          {message && (
            <span className="text-[clamp(11px,3vw,14px)] font-medium bg-[rgba(0,0,0,0.55)] backdrop-blur-md inline-block px-5 py-1.5 rounded-[50px] text-[#ecdcaa] tracking-[0.5px] max-w-[90vw]">
              {message}
            </span>
          )}
        </div>

        {/* Bouton Nouvelle Partie */}
        <div className="flex gap-5 mt-1.5">
          <button
            onClick={initGame}
            className="bg-[rgba(30,25,18,0.85)] border border-[#b4925e] text-[#e7cfaa] text-[clamp(12px,3.5vw,14px)] font-semibold px-6 py-2 rounded-[40px] cursor-pointer backdrop-blur-sm transition-all duration-200 tracking-[1px] hover:bg-[#b8844b40] hover:border-[#e7bc7c] hover:text-[#ffefcf] hover:scale-[1.02] flex items-center gap-2"
          >
            <BoltIcon /> NOUVELLE PARTIE <BoltIcon />
          </button>
        </div>
      </div>
    </div>
  )
}