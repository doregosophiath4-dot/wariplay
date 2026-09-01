'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =====================================================
// SVG ICONS
// =====================================================
const DiceIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
    <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
    <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
  </svg>
)

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
)

const ScrollIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14" />
    <path d="M5 2v20" />
    <path d="M19 2v20" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="12" y2="16" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const StarSVG = ({ strokeColor = "#aaa" }: { strokeColor?: string }) => (
  <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full pointer-events-none">
    <polygon points="20,4 24,15 36,15 27,23 30,35 20,28 10,35 13,23 4,15 16,15" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

const ArrowGreenSVG = () => (
  <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full pointer-events-none">
    <polygon points="20,30 10,14 30,14" fill="#2ECC40" />
  </svg>
)

const ArrowYellowSVG = () => (
  <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full pointer-events-none">
    <polygon points="10,20 24,10 24,30" fill="#FFD700" />
  </svg>
)

const ArrowRedSVG = () => (
  <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full pointer-events-none">
    <polygon points="30,20 16,10 16,30" fill="#E74C3C" />
  </svg>
)

const ArrowBlueSVG = () => (
  <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full pointer-events-none">
    <polygon points="20,10 10,26 30,26" fill="#2196F3" />
  </svg>
)

// =====================================================
// COULEURS DU JEU
// =====================================================
const COLORS: Record<string, string> = {
  red: '#E74C3C',
  green: '#2ECC40',
  yellow: '#FFD700',
  blue: '#2196F3',
}

const COLOR_NAMES: Record<string, string> = {
  red: 'Rouge',
  green: 'Vert',
  yellow: 'Jaune',
  blue: 'Bleu',
}

// =====================================================
// CLASSE LUDO GAME
// =====================================================
class LudoGame {
  static CONFIG = {
    EXIT_NUMBER: 6,
    BONUS_CAPTURE: 20,
    BONUS_ARRIVEE: 10,
    PENALTY_3_SIX: 'skip' as const,
  }

  allPlayers = ['red', 'green', 'yellow', 'blue'] as const
  players: string[]
  inactivePlayers: string[]
  playerSet: Set<string>
  paths: Record<string, string[]>
  homePaths: Record<string, string[]>
  startPositions: Record<string, string>
  safePositions: Set<string>
  pieces: Record<string, { position: string }[]>
  currentPlayer: string
  diceValue: number | null = null
  consecutiveSixes = 0
  gameEnded = false
  canClickPiece = false
  bonusMovePending = false
  bonusMoveAmount = 0
  lastMovedPieceIndex: number | null = null
  isAnimating = false
  wins: Record<string, number>
  onStateChange: () => void
  onNotification: (msg: string, type: string) => void
  onPieceMoving: ((color: string, index: number, path: string[], startPos: { x: number; y: number }) => Promise<void>) | null = null

  constructor(
    activePlayers: string[],
    wins: Record<string, number>,
    onStateChange: () => void,
    onNotification: (msg: string, type: string) => void
  ) {
    this.players = [...activePlayers]
    this.inactivePlayers = this.allPlayers.filter((c) => !this.players.includes(c))
    this.playerSet = new Set(this.players)
    this.wins = wins
    this.onStateChange = onStateChange
    this.onNotification = onNotification

    this.paths = {}
    this.allPlayers.forEach((startColor) => {
      const order = ['red', 'green', 'yellow', 'blue']
      const start = order.indexOf(startColor)
      const segments: string[] = []
      for (let i = 0; i < 4; i++) {
        const color = order[(start + i) % 4]
        for (let n = 1; n <= 13; n++) {
          segments.push(`${color[0]}${n}`)
        }
      }
      this.paths[startColor] = segments
    })

    this.homePaths = {
      red: ['rh1', 'rh2', 'rh3', 'rh4', 'rh5'],
      green: ['gh1', 'gh2', 'gh3', 'gh4', 'gh5'],
      yellow: ['yh1', 'yh2', 'yh3', 'yh4', 'yh5'],
      blue: ['bh1', 'bh2', 'bh3', 'bh4', 'bh5'],
    }

    this.startPositions = { red: 'r1', green: 'g1', yellow: 'y1', blue: 'b1' }
    this.safePositions = new Set(['r1', 'g1', 'y1', 'b1', 'r6', 'g6', 'y6', 'b6'])

    this.pieces = {}
    this.allPlayers.forEach((c) => {
      this.pieces[c] = [0, 1, 2, 3].map(() => ({ position: 'home' }))
    })

    this.currentPlayer = this.players[0]
  }

  _name(c: string) { return COLOR_NAMES[c] || c }

  _pathIndex(player: string, pos: string) {
    const hi = this.homePaths[player].indexOf(pos)
    if (hi !== -1) return this.paths[player].length + hi
    return this.paths[player].indexOf(pos)
  }

  _getPiecesAt(pos: string) {
    const res: { player: string; index: number }[] = []
    this.players.forEach((color) => {
      this.pieces[color].forEach((piece, idx) => {
        if (piece.position === pos) res.push({ player: color, index: idx })
      })
    })
    return res
  }

  _countOwnPiecesAt(player: string, pos: string) {
    return this.pieces[player].filter((p) => p.position === pos).length
  }

  _isBarrier(pos: string, movingPlayer: string) {
    const byColor: Record<string, number> = {}
    this._getPiecesAt(pos).forEach((p) => {
      if (!byColor[p.player]) byColor[p.player] = 0
      byColor[p.player]++
    })
    return Object.entries(byColor).some(([c, n]) => n >= 2 && c !== movingPlayer)
  }

  _newPosition(player: string, currentIdx: number, steps: number) {
    const path = this.paths[player]
    const hp = this.homePaths[player]
    const ni = currentIdx + steps

    if (currentIdx >= path.length) {
      const newHi = currentIdx - path.length + steps
      return newHi < hp.length ? hp[newHi] : null
    }

    for (let i = 1; i <= steps; i++) {
      const ci = currentIdx + i
      if (ci < path.length && this._isBarrier(path[ci], player)) return null
    }

    if (ni >= path.length) {
      const hi = ni - path.length
      return hi < hp.length ? hp[hi] : null
    }
    return path[ni]
  }

  _canPlayerMove(player: string) {
    return this.pieces[player].some((p) => {
      if (p.position === 'home') return this.diceValue === LudoGame.CONFIG.EXIT_NUMBER
      if (p.position === 'finished') return false
      const idx = this._pathIndex(player, p.position)
      return idx !== -1 && this._newPosition(player, idx, this.diceValue!) !== null
    })
  }

  _canMovePiece(player: string, piece: { position: string }) {
    if (piece.position === 'home') return this.diceValue === LudoGame.CONFIG.EXIT_NUMBER
    if (piece.position === 'finished') return false
    const idx = this._pathIndex(player, piece.position)
    return idx !== -1 && this._newPosition(player, idx, this.diceValue!) !== null
  }

  rollDice() {
    if (this.gameEnded || this.isAnimating) return
    if (this.canClickPiece) {
      this.onNotification("Cliquez d'abord sur un pion !", 'warning')
      return
    }

    const val = Math.floor(Math.random() * 6) + 1
    this.diceValue = val

    if (val === 6) {
      this.consecutiveSixes++
      if (this.consecutiveSixes === 3) {
        this.onNotification('Trois 6 consecutifs ! Tour perdu.', 'warning')
        this.consecutiveSixes = 0
        this._nextPlayer()
        return
      }
    } else {
      this.consecutiveSixes = 0
    }

    if (!this._canPlayerMove(this.currentPlayer)) {
      this.onNotification(`${this._name(this.currentPlayer)} ne peut pas jouer`, 'info')
      setTimeout(() => this._nextPlayer(), 1500)
      return
    }

    this.canClickPiece = true
    this.onStateChange()
  }

  async movePiece(pieceIndex: number) {
    if (!this.canClickPiece || this.isAnimating) return

    const player = this.currentPlayer
    const piece = this.pieces[player][pieceIndex]
    let captured = false
    let arrived = false

    if (piece.position === 'home' && this.diceValue === LudoGame.CONFIG.EXIT_NUMBER) {
      const startPos = this.startPositions[player]
      const victims = this._getPiecesAt(startPos).filter((p) => p.player !== player)
      victims.forEach((v) => {
        this.pieces[v.player][v.index].position = 'home'
        captured = true
      })
      if (captured) this.onNotification(`Ecrasement ! ${this._name(player)} capture !`, 'capture')

      if (this.onPieceMoving) {
        this.isAnimating = true
        const baseEl = document.getElementById(`${player}-base-${pieceIndex}`)
        if (baseEl) {
          const startRect = baseEl.getBoundingClientRect()
          await this.onPieceMoving(player, pieceIndex, [startPos], {
            x: startRect.left + startRect.width / 2,
            y: startRect.top + startRect.height / 2,
          })
        }
        this.isAnimating = false
      }

      piece.position = startPos
      this.lastMovedPieceIndex = pieceIndex
    } else if (piece.position !== 'home' && piece.position !== 'finished') {
      const idx = this._pathIndex(player, piece.position)
      if (idx !== -1) {
        const newPos = this._newPosition(player, idx, this.diceValue!)
        if (newPos) {
          const path = this.paths[player]
          const hp = this.homePaths[player]
          const animPath: string[] = []

          for (let i = 1; i <= this.diceValue!; i++) {
            const ni = idx + i
            if (idx >= path.length) {
              const hi = (idx - path.length) + i
              if (hi < hp.length) animPath.push(hp[hi])
            } else if (ni >= path.length) {
              const hi = ni - path.length
              if (hi < hp.length) animPath.push(hp[hi])
            } else {
              if (ni < path.length) animPath.push(path[ni])
            }
          }

          if (animPath.length > 0) {
            const startCell = document.getElementById(piece.position)
            if (startCell && this.onPieceMoving) {
              this.isAnimating = true
              const startRect = startCell.getBoundingClientRect()
              await this.onPieceMoving(player, pieceIndex, animPath, {
                x: startRect.left + startRect.width / 2,
                y: startRect.top + startRect.height / 2,
              })
              this.isAnimating = false
            }
          }

          piece.position = animPath.length > 0 ? animPath[animPath.length - 1] : piece.position
          this.lastMovedPieceIndex = pieceIndex

          captured = this._checkCapture(player, piece.position)

          if (this._isPieceFinished(player, piece.position)) {
            piece.position = 'finished'
            arrived = true
            this.onNotification(`${this._name(player)} a rentre un pion !`, 'success')
            this._checkWin(player)
          }
        }
      }
    }

    this._finishMove(captured, arrived)
  }

  _finishMove(captured: boolean, arrived: boolean) {
    this.canClickPiece = false

    if (this.gameEnded) return

    const player = this.currentPlayer
    let extraTurn = this.diceValue === 6

    if (captured && LudoGame.CONFIG.BONUS_CAPTURE > 0) {
      this.bonusMovePending = true
      this.bonusMoveAmount = LudoGame.CONFIG.BONUS_CAPTURE
      this.onNotification(`Bonus capture : +${LudoGame.CONFIG.BONUS_CAPTURE} cases !`, 'success')
      extraTurn = true
    }

    if (arrived && LudoGame.CONFIG.BONUS_ARRIVEE > 0) {
      this.bonusMovePending = true
      this.bonusMoveAmount = LudoGame.CONFIG.BONUS_ARRIVEE
      this.onNotification(`Bonus arrivee : +${LudoGame.CONFIG.BONUS_ARRIVEE} cases !`, 'success')
      extraTurn = true
    }

    if (extraTurn) {
      setTimeout(() => {
        this.diceValue = null
        if (this.bonusMovePending) {
          this.diceValue = this.bonusMoveAmount
          this.bonusMovePending = false
          this.bonusMoveAmount = 0
          if (this._canPlayerMove(player)) {
            this.canClickPiece = true
            this.onNotification(`${this._name(player)} joue son bonus !`, 'success')
            this.onStateChange()
          } else {
            this.onNotification('Bonus impossible, tour passe.', 'info')
            this._nextPlayer()
          }
        } else {
          this.onNotification(`${this._name(player)} rejoue !`, 'success')
        }
        this.onStateChange()
      }, 300)
    } else {
      setTimeout(() => this._nextPlayer(), 500)
    }

    this.onStateChange()
  }

  _checkCapture(player: string, pos: string) {
    if (this.safePositions.has(pos)) return false
    let captured = false
    this.players.forEach((other) => {
      if (other === player) return
      this.pieces[other].forEach((piece) => {
        if (piece.position === pos) {
          piece.position = 'home'
          this.onNotification(`${this._name(player)} capture ${this._name(other)} !`, 'capture')
          captured = true
        }
      })
    })
    return captured
  }

  _isPieceFinished(player: string, pos: string) {
    const hp = this.homePaths[player]
    return hp.indexOf(pos) === hp.length - 1
  }

  _checkWin(player: string) {
    if (this.pieces[player].every((p) => p.position === 'finished')) {
      this.gameEnded = true
      this.wins[player]++
      setTimeout(() => this.onNotification(`${this._name(player)} a gagne !`, 'win'), 500)
    }
  }

  _nextPlayer() {
    const i = this.players.indexOf(this.currentPlayer)
    this.currentPlayer = this.players[(i + 1) % this.players.length]
    this.diceValue = null
    this.consecutiveSixes = 0
    this.canClickPiece = false
    this.lastMovedPieceIndex = null
    this.bonusMovePending = false
    this.bonusMoveAmount = 0
    this.onStateChange()
  }

  getMovablePieces(): number[] {
    const player = this.currentPlayer
    const movable: number[] = []
    this.pieces[player].forEach((piece, idx) => {
      if (piece.position === 'home' && this.diceValue === LudoGame.CONFIG.EXIT_NUMBER) {
        const startPos = this.startPositions[player]
        if (this._countOwnPiecesAt(player, startPos) < 2) movable.push(idx)
      } else if (piece.position !== 'home' && piece.position !== 'finished') {
        if (this._canMovePiece(player, piece)) movable.push(idx)
      }
    })
    return movable
  }

  isPlayerActive(color: string): boolean {
    return this.playerSet.has(color)
  }
}

// =====================================================
// PARTICULES BACKGROUND
// =====================================================
const ParticlesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      color: string
    }[] = []

    const colors = ['#00c896', '#6c5ce7', '#ff6b35', '#ffd166', '#ff4757', '#2ed573', '#2196F3', '#E74C3C']

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const draw = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
      })

      ctx.globalAlpha = 1

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = particles[i].color
            ctx.globalAlpha = 0.05 * (1 - dist / 120)
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      requestAnimationFrame(draw)
    }

    draw()

    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export default function LudoPage() {
  const [showPlayerModal, setShowPlayerModal] = useState(true)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [selectedCount, setSelectedCount] = useState(4)
  const [game, setGame] = useState<LudoGame | null>(null)
  const [gameState, setGameState] = useState(0)
  const [diceValue, setDiceValue] = useState<number | null>(null)
  const [diceRolling, setDiceRolling] = useState(false)
  const [notification, setNotification] = useState<{ msg: string; type: string } | null>(null)
  const [wins, setWins] = useState<Record<string, number>>({ red: 0, green: 0, yellow: 0, blue: 0 })
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [animatingPiece, setAnimatingPiece] = useState<{
    color: string
    index: number
    left: number
    top: number
    visible: boolean
  } | null>(null)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  const showNotification = useCallback((msg: string, type: string) => {
    setNotification({ msg, type })
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current)
    notificationTimeoutRef.current = setTimeout(() => setNotification(null), 3000)
  }, [])

  const refreshState = useCallback(() => setGameState((s) => s + 1), [])

  const animatePieceMovement = useCallback(async (
    color: string,
    index: number,
    path: string[],
    startPos: { x: number; y: number }
  ) => {
    setAnimatingPiece({
      color,
      index,
      left: startPos.x,
      top: startPos.y,
      visible: true,
    })

    for (let i = 0; i < path.length; i++) {
      const targetCell = document.getElementById(path[i])
      if (targetCell) {
        const targetRect = targetCell.getBoundingClientRect()
        setAnimatingPiece({
          color,
          index,
          left: targetRect.left + targetRect.width / 2,
          top: targetRect.top + targetRect.height / 2,
          visible: true,
        })
      }
      await new Promise((resolve) => setTimeout(resolve, 250))
    }

    setAnimatingPiece(null)
  }, [])

  const startGame = () => {
    const pool = ['red', 'green', 'yellow', 'blue']
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const colors = pool.slice(0, selectedCount)
    setShowPlayerModal(false)
    setTimeout(() => {
      const g = new LudoGame(colors, wins, refreshState, showNotification)
      g.onPieceMoving = animatePieceMovement
      setGame(g)
      refreshState()
    }, 100)
  }

  const handleRollDice = () => {
    if (!game) return
    setDiceRolling(true)
    setTimeout(() => {
      game.rollDice()
      setDiceValue(game.diceValue)
      setDiceRolling(false)
      refreshState()
    }, 500)
  }

  const handleBasePieceClick = (color: string, index: number) => {
    if (!game || game.currentPlayer !== color) return
    const piece = game.pieces[color][index]
    if (piece.position !== 'home') return
    const movable = game.getMovablePieces()
    if (!movable.includes(index)) return
    game.movePiece(index)
    setDiceValue(game.diceValue)
    refreshState()
  }

  const handleBoardPieceClick = (color: string, pieceIndex: number) => {
    if (!game || game.currentPlayer !== color) return
    if (!game.canClickPiece) return
    const movable = game.getMovablePieces()
    if (!movable.includes(pieceIndex)) return
    game.movePiece(pieceIndex)
    setDiceValue(game.diceValue)
    refreshState()
  }

  const resetGame = () => {
    setGame(null)
    setDiceValue(null)
    setAnimatingPiece(null)
    setShowPlayerModal(true)
    refreshState()
  }

  const renderBoard = () => {
    if (!game) return null

    const renderPiecesOnCell = (cellId: string) => {
      const piecesOnCell = game.players.flatMap((c) =>
        game.pieces[c]
          .map((p, idx) => ({ ...p, color: c, idx }))
          .filter((p) => p.position === cellId)
      )
      const n = piecesOnCell.length
      if (n === 0) return null

      const getPosition = (index: number, total: number) => {
        const offset = 8
        if (total === 1) return { top: '50%', left: '50%' }
        if (total === 2) {
          if (index === 0) return { top: '50%', left: `${50 - offset}%` }
          return { top: '50%', left: `${50 + offset}%` }
        }
        if (total === 3) {
          if (index === 0) return { top: `${50 - offset}%`, left: '50%' }
          if (index === 1) return { top: `${50 + offset}%`, left: `${50 - offset}%` }
          return { top: `${50 + offset}%`, left: `${50 + offset}%` }
        }
        if (index === 0) return { top: `${50 - offset}%`, left: `${50 - offset}%` }
        if (index === 1) return { top: `${50 - offset}%`, left: `${50 + offset}%` }
        if (index === 2) return { top: `${50 + offset}%`, left: `${50 - offset}%` }
        return { top: `${50 + offset}%`, left: `${50 + offset}%` }
      }

      return piecesOnCell.map((p, j) => {
        if (animatingPiece && animatingPiece.color === p.color && animatingPiece.index === p.idx) {
          return null
        }

        const pos = getPosition(j, n)
        const isCurrentPlayer = game.currentPlayer === p.color
        const isMovable = isCurrentPlayer && game.canClickPiece && game.getMovablePieces().includes(p.idx)

        return (
          <i
            key={`${p.color}-${p.idx}-${cellId}`}
            onClick={() => {
              if (isMovable) handleBoardPieceClick(p.color, p.idx)
            }}
            className={`fa-solid fa-location-pin placed-piece absolute ${
              isMovable ? 'cursor-pointer z-[300]' : 'cursor-default z-[150]'
            }`}
            style={{
              top: pos.top,
              left: pos.left,
              transform: 'translate(-50%, -50%)',
              color: COLORS[p.color],
              fontSize: '1.2rem',
              filter: isMovable
                ? 'brightness(1.5) drop-shadow(0 0 10px gold)'
                : 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
              WebkitTextStrokeWidth: '2px',
              WebkitTextStrokeColor: 'white',
              pointerEvents: isMovable ? 'auto' : 'none',
              transition: 'all 0.2s ease',
            }}
          />
        )
      })
    }

    const isActive = (color: string) => game.isPlayerActive(color)

    const renderBasePieces = (color: string) => {
      const playerActive = isActive(color)
      return [0, 1, 2, 3].map((i) => {
        const piece = game.pieces[color][i]
        const isHome = piece.position === 'home'
        const isMovable =
          playerActive && game.currentPlayer === color && game.canClickPiece && game.getMovablePieces().includes(i)
        const isBeingAnimated = animatingPiece && animatingPiece.color === color && animatingPiece.index === i

        if (!playerActive) {
          return (
            <div
              key={i}
              id={`${color}-base-${i}`}
              className="w-[60%] h-[60%] rounded-full shadow-inner"
              style={{ background: COLORS[color] }}
            />
          )
        }

        return (
          <div
            key={i}
            id={`${color}-base-${i}`}
            className="w-[60%] h-[60%] rounded-full flex items-center justify-center shadow-inner relative"
            style={{ background: COLORS[color] }}
          >
            {isHome && !isBeingAnimated && (
              <i
                onClick={() => handleBasePieceClick(color, i)}
                className={`fa-solid fa-location-pin piece absolute ${
                  isMovable ? 'cursor-pointer z-[300]' : 'cursor-default z-[100]'
                }`}
                style={{
                  color: COLORS[color],
                  fontSize: '1.5rem',
                  filter: isMovable
                    ? 'brightness(1.5) drop-shadow(0 0 10px gold)'
                    : 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
                  WebkitTextStrokeWidth: '2px',
                  WebkitTextStrokeColor: 'white',
                  transform: isMovable ? 'scale(1.3)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
              />
            )}
          </div>
        )
      })
    }

    return (
      <div
        className="w-full max-w-[500px] aspect-square bg-white rounded-2xl overflow-hidden border-2 border-gray-700 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative flex-shrink-0"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridTemplateRows: 'repeat(5, 1fr)',
          gridTemplateAreas: `
            'red-board red-board green-path green-board green-board'
            'red-board red-board green-path green-board green-board'
            'red-path red-path win-zone yellow-path yellow-path'
            'blue-board blue-board blue-path yellow-board yellow-board'
            'blue-board blue-board blue-path yellow-board yellow-board'
          `,
        }}
      >
        {/* Pion en mouvement */}
        {animatingPiece && animatingPiece.visible && (
          <div
            className="fixed z-[500] pointer-events-none"
            style={{
              left: animatingPiece.left,
              top: animatingPiece.top,
              transform: 'translate(-50%, -50%)',
              transition:
                'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <i
              className="fa-solid fa-location-pin"
              style={{
                color: COLORS[animatingPiece.color],
                fontSize: '1.5rem',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) brightness(1.3)',
                WebkitTextStrokeWidth: '2px',
                WebkitTextStrokeColor: 'white',
              }}
            />
          </div>
        )}

        {/* Coin Rouge */}
        <div style={{ gridArea: 'red-board', background: COLORS.red }} className="p-2 flex items-center justify-center">
          <div className="w-[80%] h-[80%] bg-white rounded-2xl grid grid-cols-2 grid-rows-2 items-center justify-items-center shadow-inner">
            {renderBasePieces('red')}
          </div>
        </div>

        {/* Coin Vert */}
        <div style={{ gridArea: 'green-board', background: COLORS.green }} className="p-2 flex items-center justify-center">
          <div className="w-[80%] h-[80%] bg-white rounded-2xl grid grid-cols-2 grid-rows-2 items-center justify-items-center shadow-inner">
            {renderBasePieces('green')}
          </div>
        </div>

        {/* Coin Jaune */}
        <div style={{ gridArea: 'yellow-board', background: COLORS.yellow }} className="p-2 flex items-center justify-center">
          <div className="w-[80%] h-[80%] bg-white rounded-2xl grid grid-cols-2 grid-rows-2 items-center justify-items-center shadow-inner">
            {renderBasePieces('yellow')}
          </div>
        </div>

        {/* Coin Bleu */}
        <div style={{ gridArea: 'blue-board', background: COLORS.blue }} className="p-2 flex items-center justify-center">
          <div className="w-[80%] h-[80%] bg-white rounded-2xl grid grid-cols-2 grid-rows-2 items-center justify-items-center shadow-inner">
            {renderBasePieces('blue')}
          </div>
        </div>

        {/* Zone HOME */}
        <div style={{ gridArea: 'win-zone' }} className="relative overflow-hidden bg-white">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            <polygon points="50,50 0,0 100,0" fill={COLORS.green} />
            <polygon points="50,50 100,0 100,100" fill={COLORS.red} />
            <polygon points="50,50 100,100 0,100" fill={COLORS.blue} />
            <polygon points="50,50 0,100 0,0" fill={COLORS.yellow} />
            <text x="50" y="25" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="bold" fill="white" transform="rotate(180,50,25)">HOME</text>
            <text x="75" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="bold" fill="white" transform="rotate(270,75,50)">HOME</text>
            <text x="50" y="75" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="bold" fill="white">HOME</text>
            <text x="25" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="bold" fill="white" transform="rotate(90,25,50)">HOME</text>
          </svg>
          {game.players.map((color) => {
            const finishedCount = game.pieces[color].filter((p) => p.position === 'finished').length
            const basePos: Record<string, { top: string; left: string }> = {
              red: { top: '65%', left: '65%' },
              green: { top: '35%', left: '65%' },
              yellow: { top: '35%', left: '35%' },
              blue: { top: '65%', left: '35%' },
            }
            return Array.from({ length: finishedCount }, (_, i) => (
              <div
                key={`${color}-home-${i}`}
                className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md z-20"
                style={{
                  background: COLORS[color],
                  top: `calc(${basePos[color].top} - ${i * 12}px)`,
                  left: `calc(${basePos[color].left} - ${i * 12}px)`,
                }}
              />
            ))
          })}
        </div>

        {/* Chemin Vert */}
        <div style={{ gridArea: 'green-path' }} className="grid grid-cols-3 grid-rows-6">
          {[
            'r11', 'r12', 'r13',
            'r10', 'gh1', 'g1',
            'r9', 'gh2', 'g2',
            'r8', 'gh3', 'g3',
            'r7', 'gh4', 'g4',
            'r6', 'gh5', 'g5',
          ].map((id) => {
            const isGreenHome = id.startsWith('gh')
            const isGreenStart = id === 'g1'
            const isStar = id === 'r6' || id === 'g1'
            return (
              <div
                key={id}
                id={id}
                className="border border-black/10 relative flex items-center justify-center bg-white"
                style={isGreenHome || isGreenStart ? { background: COLORS.green, opacity: isGreenStart ? 1 : 0.9 } : {}}
              >
                {id === 'r12' && <ArrowGreenSVG />}
                {isStar && <StarSVG strokeColor={isGreenStart ? 'rgba(255,255,255,0.85)' : '#aaa'} />}
                {renderPiecesOnCell(id)}
              </div>
            )
          })}
        </div>

        {/* Chemin Rouge */}
        <div style={{ gridArea: 'red-path' }} className="grid grid-cols-6 grid-rows-3">
          {[
            'r13', 'r1', 'r2', 'r3', 'r4', 'r5',
            'b12', 'rh1', 'rh2', 'rh3', 'rh4', 'rh5',
            'b11', 'b10', 'b9', 'b8', 'b7', 'b6',
          ].map((id) => {
            const isRedHome = id.startsWith('rh')
            const isRedStart = id === 'r1'
            const isStar = id === 'r1' || id === 'b6'
            return (
              <div
                key={id}
                id={id}
                className="border border-black/10 relative flex items-center justify-center bg-white"
                style={isRedHome || isRedStart ? { background: COLORS.red, opacity: isRedStart ? 1 : 0.9 } : {}}
              >
                {id === 'b12' && <ArrowYellowSVG />}
                {isStar && <StarSVG strokeColor={isRedStart ? 'rgba(255,255,255,0.85)' : '#aaa'} />}
                {renderPiecesOnCell(id)}
              </div>
            )
          })}
        </div>

        {/* Chemin Jaune */}
        <div style={{ gridArea: 'yellow-path' }} className="grid grid-cols-6 grid-rows-3">
          {[
            'g6', 'g7', 'g8', 'g9', 'g10', 'g11',
            'yh5', 'yh4', 'yh3', 'yh2', 'yh1', 'g12',
            'y5', 'y4', 'y3', 'y2', 'y1', 'g13',
          ].map((id) => {
            const isYellowHome = id.startsWith('yh')
            const isYellowStart = id === 'y1'
            const isStar = id === 'y1' || id === 'g6'
            return (
              <div
                key={id}
                id={id}
                className="border border-black/10 relative flex items-center justify-center bg-white"
                style={isYellowHome || isYellowStart ? { background: COLORS.yellow, opacity: isYellowStart ? 1 : 0.9 } : {}}
              >
                {id === 'g12' && <ArrowRedSVG />}
                {isStar && <StarSVG strokeColor={isYellowStart ? 'rgba(255,255,255,0.85)' : '#aaa'} />}
                {renderPiecesOnCell(id)}
              </div>
            )
          })}
        </div>

        {/* Chemin Bleu */}
        <div style={{ gridArea: 'blue-path' }} className="grid grid-cols-3 grid-rows-6">
          {[
            'b5', 'bh5', 'y6',
            'b4', 'bh4', 'y7',
            'b3', 'bh3', 'y8',
            'b2', 'bh2', 'y9',
            'b1', 'bh1', 'y10',
            'y13', 'y12', 'y11',
          ].map((id) => {
            const isBlueHome = id.startsWith('bh')
            const isBlueStart = id === 'b1'
            const isStar = id === 'b1' || id === 'y6'
            return (
              <div
                key={id}
                id={id}
                className="border border-black/10 relative flex items-center justify-center bg-white"
                style={isBlueHome || isBlueStart ? { background: COLORS.blue, opacity: isBlueStart ? 1 : 0.9 } : {}}
              >
                {id === 'y12' && <ArrowBlueSVG />}
                {isStar && <StarSVG strokeColor={isBlueStart ? 'rgba(255,255,255,0.85)' : '#aaa'} />}
                {renderPiecesOnCell(id)}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden bg-[#0a0a1a]">
      
      {/* Particules background */}
      <ParticlesBackground />

      {/* Contenu principal */}
      <div className="relative z-10 w-full max-w-[950px] mx-auto p-3 sm:p-4 min-h-screen flex flex-col items-center justify-center">
        
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-8 w-full">
          
          {/* Plateau */}
          {renderBoard()}

          {/* Controles - avec defilement horizontal si necessaire */}
          {game && (
            <div className="w-full lg:w-auto overflow-x-auto scrollbar-none">
              <div className="flex lg:flex-col items-center gap-3 sm:gap-4 bg-white/[0.04] backdrop-blur-xl rounded-2xl p-4 border border-white/[0.06] shadow-xl min-w-fit">
                
                {/* Ligne 1 : Info joueur + De + Boutons */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  
                  {/* Info joueur */}
                  <div
                    className="text-center text-white font-bold text-sm sm:text-lg py-2 px-3 rounded-xl border-2 transition-all duration-300 whitespace-nowrap"
                    style={{
                      background: `${COLORS[game.currentPlayer]}20`,
                      borderColor: COLORS[game.currentPlayer],
                    }}
                  >
                    {COLOR_NAMES[game.currentPlayer]}
                  </div>

                  {/* De */}
                  <button
                    onClick={handleRollDice}
                    disabled={game.isAnimating || game.gameEnded}
                    className={`w-16 h-16 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shadow-xl border-[3px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-white to-gray-100 border-gray-200 text-gray-700 hover:scale-105 active:scale-95 flex-shrink-0 ${
                      diceRolling ? 'animate-[spin_0.5s_ease-out]' : ''
                    }`}
                  >
                    {diceValue ? (
                      <span className="text-3xl sm:text-5xl font-black">{diceValue}</span>
                    ) : (
                      <span className="text-emerald-400">
                        <DiceIcon />
                      </span>
                    )}
                  </button>

                  {/* Boutons */}
                  <div className="flex lg:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={resetGame}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 sm:py-2.5 sm:px-4 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold text-xs uppercase tracking-wide shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                    >
                      <RefreshIcon /> Nouvelle
                    </button>
                    <button
                      onClick={() => setShowRulesModal(true)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 sm:py-2.5 sm:px-4 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/70 font-semibold text-xs hover:bg-white/[0.1] hover:text-white transition-all whitespace-nowrap"
                    >
                      <BookIcon /> Regles
                    </button>
                  </div>
                </div>

                {/* Ligne 2 : Scores */}
                <div className="flex lg:flex-col gap-1.5 flex-shrink-0">
                  {game.players.map((color) => (
                    <div
                      key={color}
                      className="bg-white/[0.06] rounded-lg p-1.5 sm:p-2 text-center border-l-4 min-w-[60px]"
                      style={{ borderLeftColor: COLORS[color] }}
                    >
                      <span className="text-white text-[10px] sm:text-xs font-medium">{COLOR_NAMES[color]}</span>
                      <span className="block text-white text-sm sm:text-lg font-bold">{wins[color]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal selection joueurs */}
      <AnimatePresence>
        {showPlayerModal && (
          <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-[500px] rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)] text-center max-h-[90vh] overflow-y-auto"
              style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }}
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />

              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <DiceIcon />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Bienvenue au Ludo !</h2>
              <p className="text-white/50 text-sm mb-6">Choisissez le nombre de joueurs pour cette partie</p>

              <div className="flex gap-3 justify-center mb-6 flex-wrap">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedCount(count)}
                    className={`flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border-2 transition-all duration-300 min-w-[100px] ${
                      selectedCount === count
                        ? 'border-purple-400 bg-purple-400/10 shadow-[0_0_20px_rgba(108,92,231,0.3)] -translate-y-1'
                        : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-3xl font-black text-white">{count}</span>
                    <span className="text-white/50 text-xs uppercase tracking-wider">Joueurs</span>
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ background: COLORS.red }} />
                      <span className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ background: COLORS.green }} />
                      {count >= 3 && <span className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ background: COLORS.yellow }} />}
                      {count >= 4 && <span className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ background: COLORS.blue }} />}
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-white/40 text-xs mb-6">Les couleurs seront assignees aleatoirement</p>

              <button
                onClick={startGame}
                className="px-10 py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm shadow-xl shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <PlayIcon /> Commencer la partie
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Regles */}
      <AnimatePresence>
        {showRulesModal && (
          <div
            className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4"
            onClick={() => setShowRulesModal(false)}
          >
            <motion.div
              className="relative w-full max-w-[550px] rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
              style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }}
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-pink-400 to-red-400" />

              <button
                onClick={() => setShowRulesModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"
              >
                <CloseIcon />
              </button>

              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <ScrollIcon />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-6">Regles du Ludo</h2>

              <div className="space-y-3 mb-6">
                {[
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" />
                      </svg>
                    ),
                    title: 'Objectif',
                    text: 'Etre le premier a amener ses 4 pions au centre du plateau (HOME).',
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    ),
                    title: 'Sortir un pion',
                    text: 'Faites un 6 pour sortir un pion de la maison.',
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    ),
                    title: 'Cases sures',
                    text: '8 cases protegees : departs + etoiles.',
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    ),
                    title: 'Barrieres',
                    text: '2 pions meme couleur = barriere.',
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    ),
                    title: 'Captures',
                    text: 'Atterrir sur un pion adverse = capture. Bonus +20 cases.',
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    ),
                    title: 'Arrivee',
                    text: 'Nombre exact requis. Bonus +10 cases.',
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10" /><path d="M1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                      </svg>
                    ),
                    title: 'Rejouer',
                    text: 'Un 6 = tour supplementaire. 3 six = tour perdu.',
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    ),
                    title: 'Ecrasement',
                    text: 'En sortant un pion, vous ecrasez le dernier pion adverse.',
                  },
                ].map((rule, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3.5 bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.04] hover:bg-white/[0.06] transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center flex-shrink-0 text-purple-400">
                      {rule.icon}
                    </div>
                    <div>
                      <h3 className="text-purple-400 font-semibold text-sm mb-0.5">{rule.title}</h3>
                      <p className="text-white/60 text-xs leading-relaxed">{rule.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowRulesModal(false)}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all mx-auto flex items-center justify-center gap-2"
              >
                <CheckIcon /> J&apos;ai compris
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed top-5 right-5 z-[2000] px-5 py-3.5 rounded-xl font-bold text-sm shadow-2xl"
            style={{
              background:
                notification.type === 'capture'
                  ? 'linear-gradient(135deg, #ff4757, #ff6b81)'
                  : notification.type === 'win'
                  ? 'linear-gradient(135deg, #feca57, #ff9ff3)'
                  : notification.type === 'warning'
                  ? 'linear-gradient(135deg, #ff6348, #ff7675)'
                  : notification.type === 'success'
                  ? 'linear-gradient(135deg, #2ed573, #7bed9f)'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: notification.type === 'win' ? '#333' : '#fff',
            }}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          >
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}