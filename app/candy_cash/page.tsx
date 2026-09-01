'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const CoinSvg = () => (
  <svg width="60" height="60" viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="28" fill="none" stroke="#FFD700" strokeWidth="3"/>
    <text x="30" y="30" textAnchor="middle" dominantBaseline="middle" fontSize="28" fill="#FFD700">$</text>
  </svg>
)

const TargetSvg = () => (
  <svg width="60" height="60" viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="28" fill="none" stroke="#FFD700" strokeWidth="3"/>
    <circle cx="30" cy="30" r="10" fill="none" stroke="#FFD700" strokeWidth="2"/>
    <circle cx="30" cy="30" r="3" fill="#FFD700"/>
  </svg>
)

const BookSvg = () => (
  <svg width="60" height="60" viewBox="0 0 60 60">
    <rect x="10" y="8" width="40" height="44" rx="4" fill="none" stroke="#FFD700" strokeWidth="3"/>
    <line x1="20" y1="18" x2="40" y2="18" stroke="#FFD700" strokeWidth="2"/>
    <line x1="20" y1="26" x2="35" y2="26" stroke="#FFD700" strokeWidth="2"/>
    <line x1="20" y1="34" x2="38" y2="34" stroke="#FFD700" strokeWidth="2"/>
    <line x1="20" y1="42" x2="30" y2="42" stroke="#FFD700" strokeWidth="2"/>
  </svg>
)

const CheckSvg = () => (
  <svg width="70" height="70" viewBox="0 0 70 70">
    <circle cx="35" cy="35" r="32" fill="none" stroke="#4CAF50" strokeWidth="3"/>
    <path d="M22 38 L30 46 L48 26" fill="none" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const FailSvg = () => (
  <svg width="70" height="70" viewBox="0 0 70 70">
    <circle cx="35" cy="35" r="32" fill="none" stroke="#f44336" strokeWidth="3"/>
    <line x1="24" y1="24" x2="46" y2="46" stroke="#f44336" strokeWidth="4" strokeLinecap="round"/>
    <line x1="46" y1="24" x2="24" y2="46" stroke="#f44336" strokeWidth="4" strokeLinecap="round"/>
  </svg>
)

const RulesSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    <line x1="8" y1="7" x2="16" y2="7"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
)

const MouseIconSvg = () => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <rect x="5" y="5" width="30" height="30" rx="6" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="20" cy="16" r="4" fill="currentColor"/>
    <line x1="20" y1="20" x2="20" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const TouchIconSvg = () => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <rect x="5" y="5" width="30" height="30" rx="6" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="20" cy="20" r="6" fill="currentColor"/>
    <circle cx="20" cy="20" r="2" fill="white"/>
  </svg>
)

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface Objective {
  type: 'score' | 'score_time' | 'score_moves' | 'score_moves_time'
  description: string
  target: number
  timeLimit: number | null
  moveLimit: number | null
}

/* ═══════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════ */

const CANDIES = ['Blue', 'Orange', 'Green', 'Yellow', 'Red', 'Purple']
const ROWS = 9
const COLUMNS = 9
const INITIAL_BALANCE = 5000
const MIN_BET = 100

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function CandyCash() {
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(30)
  const [gameTime, setGameTime] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showBetScreen, setShowBetScreen] = useState(true)
  const [showObjectiveScreen, setShowObjectiveScreen] = useState(false)
  const [showGameOverScreen, setShowGameOverScreen] = useState(false)
  const [showRulesScreen, setShowRulesScreen] = useState(false)
  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [currentBet, setCurrentBet] = useState(100)
  const [currentObjective, setCurrentObjective] = useState<Objective | null>(null)
  const [objectiveProgress, setObjectiveProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null)
  const [winAmount, setWinAmount] = useState(0)
  const [animatingTiles, setAnimatingTiles] = useState<string[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  const boardRef = useRef<HTMLDivElement>(null)
  const currTileRef = useRef<HTMLImageElement | null>(null)
  const otherTileRef = useRef<HTMLImageElement | null>(null)
  const scoreRef = useRef(0)
  const movesRef = useRef(30)
  const gameTimeRef = useRef(0)
  const isGameActiveRef = useRef(false)
  const gameStartedRef = useRef(false)
  const currentObjectiveRef = useRef<Objective | null>(null)
  const objectiveProgressRef = useRef(0)
  const balanceRef = useRef(INITIAL_BALANCE)
  const currentBetRef = useRef(100)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchTileRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { movesRef.current = moves }, [moves])
  useEffect(() => { gameTimeRef.current = gameTime }, [gameTime])
  useEffect(() => { isGameActiveRef.current = isGameActive }, [isGameActive])
  useEffect(() => { gameStartedRef.current = gameStarted }, [gameStarted])
  useEffect(() => { currentObjectiveRef.current = currentObjective }, [currentObjective])
  useEffect(() => { objectiveProgressRef.current = objectiveProgress }, [objectiveProgress])
  useEffect(() => { balanceRef.current = balance }, [balance])
  useEffect(() => { currentBetRef.current = currentBet }, [currentBet])

  const randomCandy = useCallback((): string => CANDIES[Math.floor(Math.random() * CANDIES.length)], [])
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const getTileElement = useCallback((r: number, c: number): HTMLImageElement | null => {
    return document.getElementById(`tile-${r}-${c}`) as HTMLImageElement | null
  }, [])

  /* ── Confetti ───────────────────────────────────────── */
  const createConfetti = useCallback(() => {
    setShowConfetti(true)
    const container = document.getElementById('confetti-container')
    if (!container) return
    const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF69B4', '#FFA500', '#9B59B6', '#1ABC9C']
    for (let i = 0; i < 150; i++) {
      const confetti = document.createElement('div')
      confetti.className = 'confetti-piece'
      confetti.style.left = `${Math.random() * 100}%`
      confetti.style.top = `${Math.random() * 100}%`
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.width = `${Math.random() * 12 + 6}px`
      confetti.style.height = `${Math.random() * 12 + 6}px`
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px'
      confetti.style.animationDuration = `${Math.random() * 2 + 1.5}s`
      confetti.style.animationDelay = `${Math.random() * 1.5}s`
      container.appendChild(confetti)
      setTimeout(() => confetti.remove(), 3500)
    }
    setTimeout(() => setShowConfetti(false), 3500)
  }, [])

  /* ── Crush Animation ────────────────────────────────── */
  const addCrushAnimation = useCallback((tileIds: string[]) => {
    tileIds.forEach(id => {
      const tile = document.getElementById(id)
      if (tile) {
        tile.classList.add('tile-crush')
        const rect = tile.getBoundingClientRect()
        const container = document.getElementById('particles-container')
        if (container) {
          for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div')
            particle.className = 'crush-particle'
            particle.style.left = `${rect.left + rect.width / 2}px`
            particle.style.top = `${rect.top + rect.height / 2}px`
            particle.style.setProperty('--angle', `${(i / 8) * 360}deg`)
            particle.style.setProperty('--distance', `${Math.random() * 60 + 30}px`)
            particle.style.backgroundColor = tile.src.includes('Blue') ? '#4D96FF' :
              tile.src.includes('Orange') ? '#FFA500' : tile.src.includes('Green') ? '#6BCB77' :
              tile.src.includes('Yellow') ? '#FFD93D' : tile.src.includes('Red') ? '#FF6B6B' :
              tile.src.includes('Purple') ? '#9B59B6' : '#FFD700'
            container.appendChild(particle)
            setTimeout(() => particle.remove(), 600)
          }
        }
        setTimeout(() => tile.classList.remove('tile-crush'), 500)
      }
    })
    setAnimatingTiles(prev => [...prev, ...tileIds])
    setTimeout(() => setAnimatingTiles(prev => prev.filter(id => !tileIds.includes(id))), 500)
  }, [])

  /* ── Objective ───────────────────────────────────────── */
  const generateRandomObjective = useCallback((): Objective => {
    const types = ['score', 'score_time', 'score_moves', 'score_moves_time'] as const
    const type = types[Math.floor(Math.random() * types.length)]
    const difficulties = [
      { target: 150, time: 60, moves: 20 },
      { target: 300, time: 90, moves: 30 },
      { target: 500, time: 120, moves: 40 },
      { target: 800, time: 150, moves: 50 },
      { target: 1000, time: 180, moves: 60 }
    ]
    const diff = difficulties[Math.floor(Math.random() * difficulties.length)]
    switch (type) {
      case 'score': return { type: 'score', description: `Atteindre ${diff.target} points`, target: diff.target, timeLimit: null, moveLimit: null }
      case 'score_time': return { type: 'score_time', description: `Atteindre ${diff.target} points en ${diff.time} secondes`, target: diff.target, timeLimit: diff.time, moveLimit: null }
      case 'score_moves': return { type: 'score_moves', description: `Atteindre ${diff.target} points en ${diff.moves} mouvements`, target: diff.target, timeLimit: null, moveLimit: diff.moves }
      case 'score_moves_time': return { type: 'score_moves_time', description: `Atteindre ${diff.target} points avec ${diff.moves} mouvements en ${diff.time} secondes`, target: diff.target, timeLimit: diff.time, moveLimit: diff.moves }
    }
  }, [])

  const checkObjective = useCallback(() => {
    const obj = currentObjectiveRef.current
    if (!obj || !isGameActiveRef.current) return
    let progress = Math.min(1, scoreRef.current / obj.target)
    setObjectiveProgress(progress)
    if (scoreRef.current >= obj.target) handleWin()
    else if ((obj.moveLimit !== null && movesRef.current <= 0) || (obj.timeLimit !== null && gameTimeRef.current >= obj.timeLimit)) handleLose()
  }, [])

  const handleWin = useCallback(() => {
    setIsGameActive(false); isGameActiveRef.current = false
    setGameStarted(false); gameStartedRef.current = false
    const win = currentBetRef.current * 2
    setBalance(prev => prev + win); balanceRef.current += win
    setWinAmount(win); setGameResult('win')
    setShowGameOverScreen(true); stopTimers(); createConfetti()
  }, [createConfetti])

  const handleLose = useCallback(() => {
    setIsGameActive(false); isGameActiveRef.current = false
    setGameStarted(false); gameStartedRef.current = false
    setGameResult('lose'); setShowGameOverScreen(true); stopTimers()
  }, [])

  const stopTimers = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  /* ── Board ───────────────────────────────────────────── */
  const renderBoard = useCallback((avoidInitialMatches: boolean = false) => {
    const boardElement = boardRef.current
    if (!boardElement) return
    boardElement.innerHTML = ''
    const tempBoard: (string | null)[][] = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null))
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLUMNS; c++) {
        let candy = avoidInitialMatches ? (() => { let attempts = 0; let cand = randomCandy(); while (attempts < 50) { const l1 = c >= 1 ? tempBoard[r]?.[c - 1] : null; const l2 = c >= 2 ? tempBoard[r]?.[c - 2] : null; const u1 = r >= 1 ? tempBoard[r - 1]?.[c] : null; const u2 = r >= 2 ? tempBoard[r - 2]?.[c] : null; if ((l1 && l2 && l1 === l2 && l1 === cand) || (u1 && u2 && u1 === u2 && u1 === cand)) { cand = randomCandy(); attempts++; continue } break } return cand })() : randomCandy()
        tempBoard[r][c] = candy
        const tile = document.createElement('img')
        tile.id = `tile-${r}-${c}`
        tile.src = `/images/${candy}.png`
        tile.className = 'tile-img'
        // CORRECTION: Styles pour grid 9x9
        tile.style.width = '100%'
        tile.style.height = '100%'
        tile.style.objectFit = 'contain'
        tile.style.display = 'block'
        tile.draggable = true
        tile.dataset.row = r.toString()
        tile.dataset.col = c.toString()
        tile.addEventListener('dragstart', (e) => { if (!isGameActiveRef.current) return; currTileRef.current = e.target as HTMLImageElement })
        tile.addEventListener('dragover', (e) => e.preventDefault())
        tile.addEventListener('dragenter', (e) => e.preventDefault())
        tile.addEventListener('drop', (e) => { e.preventDefault(); if (!isGameActiveRef.current) return; otherTileRef.current = e.target as HTMLImageElement })
        tile.addEventListener('dragend', () => { if (!isGameActiveRef.current) return; handleSwap() })
        tile.addEventListener('touchstart', (e) => { if (!isGameActiveRef.current) return; const t = e.touches[0]; touchStartXRef.current = t.clientX; touchStartYRef.current = t.clientY; touchTileRef.current = e.target as HTMLImageElement })
        tile.addEventListener('touchmove', (e) => e.preventDefault())
        tile.addEventListener('touchend', (e) => {
          if (!isGameActiveRef.current) return
          if (touchStartXRef.current === null || touchStartYRef.current === null || !touchTileRef.current) return
          const t = e.changedTouches[0]; const dx = t.clientX - touchStartXRef.current; const dy = t.clientY - touchStartYRef.current
          if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) {
            currTileRef.current = touchTileRef.current
            const coords = touchTileRef.current.id.split('-'); const r1 = parseInt(coords[1]); const c1 = parseInt(coords[2])
            let r2 = r1; let c2 = c1
            if (Math.abs(dx) > Math.abs(dy)) { c2 = dx > 0 ? c1 + 1 : c1 - 1 } else { r2 = dy > 0 ? r1 + 1 : r1 - 1 }
            const ot = getTileElement(r2, c2); if (ot && !ot.src.includes('blank')) { otherTileRef.current = ot; handleSwap() }
          }
          touchStartXRef.current = null; touchStartYRef.current = null; touchTileRef.current = null
        })
        boardElement.appendChild(tile)
      }
    }
  }, [randomCandy, getTileElement])

  /* ── Game Logic ──────────────────────────────────────── */
  const checkValid = useCallback((): boolean => {
    for (let r = 0; r < ROWS; r++) { for (let c = 0; c < COLUMNS - 2; c++) { const a = getTileElement(r, c); const b = getTileElement(r, c + 1); const d = getTileElement(r, c + 2); if (a && b && d && a.src === b.src && b.src === d.src && !a.src.includes('blank')) return true } }
    for (let c = 0; c < COLUMNS; c++) { for (let r = 0; r < ROWS - 2; r++) { const a = getTileElement(r, c); const b = getTileElement(r + 1, c); const d = getTileElement(r + 2, c); if (a && b && d && a.src === b.src && b.src === d.src && !a.src.includes('blank')) return true } }
    return false
  }, [getTileElement])

  const handleSwap = useCallback(() => {
    const ct = currTileRef.current; const ot = otherTileRef.current
    if (!ct || !ot) return
    if (ct.src.includes('blank') || ot.src.includes('blank')) { currTileRef.current = null; otherTileRef.current = null; return }
    const cc = ct.id.split('-'); const r1 = parseInt(cc[1]); const c1 = parseInt(cc[2])
    const oc = ot.id.split('-'); const r2 = parseInt(oc[1]); const c2 = parseInt(oc[2])
    if (!((c2 === c1 - 1 && r1 === r2) || (c2 === c1 + 1 && r1 === r2) || (r2 === r1 - 1 && c1 === c2) || (r2 === r1 + 1 && c1 === c2))) { currTileRef.current = null; otherTileRef.current = null; return }
    const ci = ct.src; const oi = ot.src
    ct.classList.add('tile-swap'); ot.classList.add('tile-swap')
    ct.src = oi; ot.src = ci
    setTimeout(() => { ct.classList.remove('tile-swap'); ot.classList.remove('tile-swap') }, 300)
    if (!checkValid()) {
      setTimeout(() => { ct.classList.add('tile-swap-reverse'); ot.classList.add('tile-swap-reverse'); ct.src = ci; ot.src = oi; setTimeout(() => { ct.classList.remove('tile-swap-reverse'); ot.classList.remove('tile-swap-reverse') }, 300) }, 150)
    } else {
      if (!gameStartedRef.current) { setGameStarted(true); gameStartedRef.current = true }
      setMoves(prev => { const nm = prev - 1; movesRef.current = nm; return nm })
    }
    currTileRef.current = null; otherTileRef.current = null
  }, [checkValid])

  const crushThree = useCallback(() => {
    let cs = scoreRef.current; const crushed: string[] = []
    for (let r = 0; r < ROWS; r++) { for (let c = 0; c < COLUMNS - 2; c++) { const a = getTileElement(r, c); const b = getTileElement(r, c + 1); const d = getTileElement(r, c + 2); if (a && b && d && a.src === b.src && b.src === d.src && !a.src.includes('blank')) crushed.push(a.id, b.id, d.id) } }
    for (let c = 0; c < COLUMNS; c++) { for (let r = 0; r < ROWS - 2; r++) { const a = getTileElement(r, c); const b = getTileElement(r + 1, c); const d = getTileElement(r + 2, c); if (a && b && d && a.src === b.src && b.src === d.src && !a.src.includes('blank')) crushed.push(a.id, b.id, d.id) } }
    if (crushed.length > 0) {
      addCrushAnimation(crushed)
      setTimeout(() => { const uniq = [...new Set(crushed)]; uniq.forEach(id => { const t = document.getElementById(id); if (t) (t as HTMLImageElement).src = '/images/blank.png' }); cs += (uniq.length / 3) * 30; scoreRef.current = cs; setScore(cs) }, 400)
    }
  }, [getTileElement, addCrushAnimation])

  const slideCandy = useCallback(() => {
    for (let c = 0; c < COLUMNS; c++) { let ind = ROWS - 1; for (let r = ROWS - 1; r >= 0; r--) { const t = getTileElement(r, c); if (t && !t.src.includes('blank')) { const tt = getTileElement(ind, c); if (tt && ind !== r) { tt.src = t.src; if (r !== ind) t.src = '/images/blank.png' } ind -= 1 } } for (let r = ind; r >= 0; r--) { const t = getTileElement(r, c); if (t) t.src = '/images/blank.png' } }
  }, [getTileElement])

  const generateCandy = useCallback(() => {
    for (let c = 0; c < COLUMNS; c++) { const t = getTileElement(0, c); if (t && t.src.includes('blank')) { t.src = `/images/${randomCandy()}.png`; t.classList.add('tile-spawn'); setTimeout(() => t.classList.remove('tile-spawn'), 500) } }
  }, [getTileElement, randomCandy])

  const shuffleBoard = useCallback(() => {
    if (!isGameActiveRef.current) return
    const all: { r: number; c: number; src: string }[] = []
    for (let r = 0; r < ROWS; r++) { for (let c = 0; c < COLUMNS; c++) { const t = getTileElement(r, c); if (t && !t.src.includes('blank')) all.push({ r, c, src: t.src }) } }
    if (all.length === 0) return
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]] }
    all.forEach(({ r, c, src }) => { const t = getTileElement(r, c); if (t) { t.src = src; t.classList.add('tile-shuffle'); setTimeout(() => t.classList.remove('tile-shuffle'), 400) } })
    setMoves(prev => { const nm = Math.max(0, prev - 5); movesRef.current = nm; return nm })
  }, [getTileElement])

  const gameLoop = useCallback(() => {
    if (!isGameActiveRef.current) return
    if (gameStartedRef.current) { crushThree(); slideCandy(); generateCandy() }
    checkObjective()
  }, [crushThree, slideCandy, generateCandy, checkObjective])

  /* ── Actions ─────────────────────────────────────────── */
  const handleConfirmBet = useCallback(() => {
    if (currentBetRef.current > balanceRef.current || currentBetRef.current < MIN_BET) return
    setIsLoading(true)
    setTimeout(() => {
      setBalance(prev => prev - currentBetRef.current); balanceRef.current -= currentBetRef.current
      const obj = generateRandomObjective(); setCurrentObjective(obj); currentObjectiveRef.current = obj
      setObjectiveProgress(0); objectiveProgressRef.current = 0
      setMoves(obj.moveLimit || 30); movesRef.current = obj.moveLimit || 30
      setShowBetScreen(false); setShowObjectiveScreen(true); setIsLoading(false)
    }, 1500)
  }, [generateRandomObjective])

  const handleStartGame = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setShowObjectiveScreen(false); setScore(0); scoreRef.current = 0
      setGameTime(0); gameTimeRef.current = 0; setGameResult(null)
      setShowGameOverScreen(false); setGameStarted(false); gameStartedRef.current = false
      renderBoard(true); setIsGameActive(true); isGameActiveRef.current = true
      intervalRef.current = setInterval(() => gameLoop(), 100)
      timerRef.current = setInterval(() => { setGameTime(prev => { const nt = prev + 1; gameTimeRef.current = nt; return nt }) }, 1000)
      setIsLoading(false)
    }, 1500)
  }, [renderBoard, gameLoop])

  useEffect(() => {
    if (showBetScreen) { renderBoard(false); intervalRef.current = setInterval(() => { crushThree(); slideCandy(); generateCandy() }, 100) }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); if (timerRef.current) clearInterval(timerRef.current) }
  }, [showBetScreen, renderBoard, crushThree, slideCandy, generateCandy])

  const isMobile = typeof window !== 'undefined' && (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window && window.innerWidth < 1024))

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-[url('/img/background.jpg')] bg-cover bg-center bg-fixed font-['Segoe_UI',system-ui,sans-serif] text-white text-center flex flex-col items-center justify-start relative overflow-hidden w-full m-0 p-0">
      
      <div className="fixed inset-0 bg-gradient-to-br from-[rgba(20,10,40,0.7)] via-[rgba(40,20,60,0.5)] to-[rgba(20,10,40,0.7)] pointer-events-none z-[1]" />
      <div id="particles-container" className="fixed inset-0 pointer-events-none z-[50]" />
      <div id="confetti-container" className="fixed inset-0 pointer-events-none z-[200] overflow-hidden" />

      {/* Bet Screen */}
      {showBetScreen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-2xl flex justify-center items-center z-[100] p-0 overflow-y-auto">
          <div className="bg-gradient-to-br from-[#1a0d35] via-[#2d1055] to-[#1a0d35] border-2 border-yellow-400/30 rounded-3xl p-6 sm:p-8 max-w-[440px] w-[calc(100%-40px)] text-center shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(100,50,200,0.3)] max-h-[90vh] overflow-y-auto mx-auto flex-shrink-0">
            
            <div className="mb-6">
              <div className="mb-4 flex justify-center"><CoinSvg /></div>
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Placez votre mise</h2>
            </div>

            <div className="flex gap-3 mb-5">
              <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-3.5 px-3 flex flex-col gap-1">
                <span className="text-[11px] text-gray-400 uppercase tracking-[1px]">Solde disponible</span>
                <span className="text-lg sm:text-xl font-bold text-yellow-400">{balance.toLocaleString()} XOF</span>
              </div>
              <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-3.5 px-3 flex flex-col gap-1">
                <span className="text-[11px] text-gray-400 uppercase tracking-[1px]">Vies restantes</span>
                <span className="text-lg sm:text-xl font-bold text-yellow-400">0</span>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-4">Mise minimum : {MIN_BET} XOF</p>

            <div className="flex items-center justify-center gap-4 my-5">
              <button onClick={() => { const nb = Math.max(MIN_BET, currentBetRef.current - 100); setCurrentBet(nb); currentBetRef.current = nb }} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2d1055] to-[#4a1a7a] border-2 border-yellow-400/30 text-yellow-400 cursor-pointer hover:from-[#4a1a7a] hover:to-[#6a2aaa] hover:border-yellow-400 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-2xl font-light flex-shrink-0">−</button>
              <div className="flex items-center gap-2 bg-black/50 py-3 px-5 rounded-2xl border-2 border-yellow-400/25">
                <input type="number" value={currentBet} min={MIN_BET} onChange={(e) => { const v = Math.max(MIN_BET, parseInt(e.target.value) || MIN_BET); setCurrentBet(v); currentBetRef.current = v }} className="w-[90px] bg-transparent border-none text-yellow-400 text-2xl sm:text-3xl font-bold text-center outline-none font-inherit [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                <span className="text-yellow-400 text-sm font-semibold opacity-80">XOF</span>
              </div>
              <button onClick={() => { const nb = currentBetRef.current + 100; setCurrentBet(nb); currentBetRef.current = nb }} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2d1055] to-[#4a1a7a] border-2 border-yellow-400/30 text-yellow-400 cursor-pointer hover:from-[#4a1a7a] hover:to-[#6a2aaa] hover:border-yellow-400 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-2xl font-light flex-shrink-0">+</button>
            </div>

            <div className="flex gap-2 justify-center flex-wrap mb-5">
              {[100, 200, 500, 1000].map(amount => (
                <button key={amount} onClick={() => { setCurrentBet(amount); currentBetRef.current = amount }} className={`py-2.5 px-4 rounded-full font-semibold cursor-pointer text-sm transition-all duration-200 hover:-translate-y-0.5 ${currentBet === amount ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-[#1a0a2e] border-transparent shadow-[0_4px_20px_rgba(255,215,0,0.4)] font-bold' : 'bg-yellow-400/8 border-2 border-yellow-400/20 text-gray-300 hover:bg-yellow-400/15 hover:border-yellow-400/40 hover:text-yellow-400'}`}>{amount} XOF</button>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 mt-5">
              <button onClick={handleConfirmBet} disabled={isLoading || currentBet > balance} className="w-full py-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-[#1a0a2e] font-bold text-base cursor-pointer shadow-[0_6px_25px_rgba(255,215,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_10px_35px_rgba(255,215,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale-[30%] disabled:transform-none transition-all duration-300 relative overflow-hidden">
                {isLoading ? <span className="inline-block w-6 h-6 border-[3px] border-[#1a0a2e]/20 border-t-[#1a0a2e] rounded-full animate-spin" /> : 'Confirmer la mise'}
              </button>
              <button onClick={() => setShowRulesScreen(true)} className="w-full py-4 rounded-full bg-transparent border-2 border-white/20 text-gray-300 font-bold text-sm cursor-pointer hover:bg-white/8 hover:border-white/40 hover:text-white transition-all duration-300">Voir les regles</button>
            </div>
          </div>
        </div>
      )}

      {/* Objective Screen */}
      {showObjectiveScreen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-2xl flex justify-center items-center z-[100] p-0 overflow-y-auto">
          <div className="bg-gradient-to-br from-[#1a0d35] via-[#2d1055] to-[#1a0d35] border-2 border-yellow-400/30 rounded-3xl p-6 sm:p-8 max-w-[440px] w-[calc(100%-40px)] text-center shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(100,50,200,0.3)] max-h-[90vh] overflow-y-auto mx-auto flex-shrink-0">
            
            <div className="mb-6">
              <div className="mb-4 flex justify-center"><TargetSvg /></div>
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Objectif de la Partie</h2>
            </div>

            <div className="bg-yellow-400/8 border border-yellow-400/20 rounded-2xl p-4 mb-4">
              <p className="text-lg text-yellow-400 font-bold">{currentObjective?.description}</p>
            </div>

            <div className="flex flex-col gap-2.5 mb-4 bg-black/35 rounded-2xl p-4">
              <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Votre mise</span><span className="text-yellow-400 font-bold text-sm">{currentBet} XOF</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Gain en cas de reussite</span><span className="text-green-400 font-bold text-sm">+{currentBet * 2} XOF</span></div>
              {currentObjective?.timeLimit && <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Temps imparti</span><span className="text-yellow-400 font-bold text-sm">{currentObjective.timeLimit} secondes</span></div>}
              {currentObjective?.moveLimit && <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Mouvements disponibles</span><span className="text-yellow-400 font-bold text-sm">{currentObjective.moveLimit}</span></div>}
              <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">En cas d&apos;echec</span><span className="text-red-400 font-bold text-sm">-{currentBet} XOF</span></div>
            </div>

            <div className="bg-black/30 rounded-xl p-3.5 mb-2.5 text-left border-l-[3px] border-yellow-400">
              <h4 className="text-yellow-400 text-sm font-bold mb-2">Comment jouer :</h4>
              <p className="text-gray-300 text-xs leading-relaxed">{isMobile ? "Touchez un bonbon et glissez votre doigt dans la direction souhaitee pour l'echanger avec un bonbon adjacent. Alignez 3 bonbons identiques ou plus pour les faire disparaitre et marquer des points." : "Cliquez et faites glisser un bonbon vers un bonbon adjacent pour les echanger. Alignez 3 bonbons identiques ou plus pour les faire disparaitre et marquer des points."}</p>
            </div>

            <div className="mt-5">
              <button onClick={handleStartGame} disabled={isLoading} className="w-full py-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-[#1a0a2e] font-bold text-base cursor-pointer shadow-[0_6px_25px_rgba(255,215,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_10px_35px_rgba(255,215,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300">
                {isLoading ? <span className="inline-block w-6 h-6 border-[3px] border-[#1a0a2e]/20 border-t-[#1a0a2e] rounded-full animate-spin" /> : 'Commencer le defi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Screen */}
      {showRulesScreen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-2xl flex justify-center items-center z-[100] p-0 overflow-y-auto">
          <div className="bg-gradient-to-br from-[#1a0d35] via-[#2d1055] to-[#1a0d35] border-2 border-yellow-400/30 rounded-3xl p-6 sm:p-8 max-w-[440px] w-[calc(100%-40px)] text-center shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(100,50,200,0.3)] max-h-[90vh] overflow-y-auto mx-auto flex-shrink-0">
            
            <div className="mb-6">
              <div className="mb-4 flex justify-center"><BookSvg /></div>
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Regles du Jeu</h2>
            </div>

            <div className="text-left space-y-3 mb-2.5">
              <div className="bg-black/30 rounded-2xl p-4 border-l-[3px] border-yellow-400">
                <h3 className="text-yellow-400 text-base font-bold mb-2.5">Principe du jeu</h3>
                <p className="text-gray-300 text-sm leading-relaxed">Echangez des bonbons adjacents pour aligner 3 bonbons identiques ou plus horizontalement ou verticalement. Les bonbons alignes disparaissent, vous marquez des points, et de nouveaux bonbons tombent du haut du plateau.</p>
              </div>

              <div className="bg-black/30 rounded-2xl p-4 border-l-[3px] border-yellow-400">
                <h3 className="text-yellow-400 text-base font-bold mb-2.5">Controles</h3>
                <div className="flex flex-col gap-2.5">
                  <div className="flex gap-3 items-start bg-white/[0.03] rounded-xl p-3 border border-white/[0.08]">
                    <div className="flex-shrink-0 text-yellow-400"><MouseIconSvg /></div>
                    <div className="text-gray-300 text-sm leading-relaxed"><strong className="text-yellow-400">Ordinateur :</strong> Cliquez sur un bonbon et faites-le glisser vers un bonbon adjacent pour les echanger.</div>
                  </div>
                  <div className="flex gap-3 items-start bg-white/[0.03] rounded-xl p-3 border border-white/[0.08]">
                    <div className="flex-shrink-0 text-yellow-400"><TouchIconSvg /></div>
                    <div className="text-gray-300 text-sm leading-relaxed"><strong className="text-yellow-400">Mobile :</strong> Touchez un bonbon et glissez votre doigt vers le haut, le bas, la gauche ou la droite pour l&apos;echanger.</div>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl p-4 border-l-[3px] border-yellow-400">
                <h3 className="text-yellow-400 text-base font-bold mb-2.5">Systeme de gains et pertes</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-green-400/10 border border-green-400/25 text-sm text-gray-300">
                    <span className="w-7 h-7 rounded-full bg-green-400/20 flex items-center justify-center font-bold text-green-400 flex-shrink-0">✓</span>
                    <span>Objectif atteint : <strong className="text-green-400">+ double de la mise</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-400/10 border border-red-400/25 text-sm text-gray-300">
                    <span className="w-7 h-7 rounded-full bg-red-400/20 flex items-center justify-center font-bold text-red-400 flex-shrink-0">✗</span>
                    <span>Objectif echoue : <strong className="text-red-400">- perte de la mise</strong></span>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl p-4 border-l-[3px] border-yellow-400">
                <h3 className="text-yellow-400 text-base font-bold mb-2.5">Types d&apos;objectifs</h3>
                <ul className="ml-5 text-gray-300 text-sm leading-relaxed space-y-1">
                  <li>Atteindre un score cible sans limite de temps ni de mouvements</li>
                  <li>Atteindre un score cible dans un temps limite</li>
                  <li>Atteindre un score cible en un nombre limite de mouvements</li>
                  <li>Atteindre un score cible avec un temps et des mouvements limites</li>
                </ul>
              </div>
            </div>

            <div className="mt-5">
              <button onClick={() => setShowRulesScreen(false)} className="w-full py-4 rounded-full bg-transparent border-2 border-white/20 text-gray-300 font-bold text-sm cursor-pointer hover:bg-white/8 hover:border-white/40 hover:text-white transition-all duration-300">Retour</button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {showGameOverScreen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-2xl flex justify-center items-center z-[100] p-0 overflow-y-auto">
          <div className="bg-gradient-to-br from-[#1a0d35] via-[#2d1055] to-[#1a0d35] border-2 border-yellow-400/30 rounded-3xl p-6 sm:p-8 max-w-[440px] w-[calc(100%-40px)] text-center shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(100,50,200,0.3)] max-h-[90vh] overflow-y-auto mx-auto flex-shrink-0">
            
            <div className="mb-6">
              <div className={`mb-4 flex justify-center ${gameResult === 'win' ? 'animate-[winPulse_1.5s_ease-in-out_infinite]' : 'animate-[loseShake_0.6s_ease-in-out]'}`}>
                {gameResult === 'win' ? <CheckSvg /> : <FailSvg />}
              </div>
              <h2 className={`text-2xl sm:text-3xl font-extrabold ${gameResult === 'win' ? 'text-green-400' : 'text-red-400'}`}>{gameResult === 'win' ? 'Victoire !' : 'Defaite'}</h2>
            </div>

            <div className="flex flex-col gap-2 mb-5 bg-black/35 rounded-2xl p-4">
              <div className="flex justify-between items-center text-gray-300 text-sm py-1.5"><span>Score final</span><span className="font-bold text-yellow-400">{score} points</span></div>
              <div className="flex justify-between items-center text-gray-300 text-sm py-1.5"><span>Temps ecoule</span><span className="font-bold text-yellow-400">{formatTime(gameTime)}</span></div>
              <div className="flex justify-between items-center text-gray-300 text-sm py-1.5"><span>Mouvements restants</span><span className="font-bold text-yellow-400">{moves}</span></div>
              {gameResult === 'win' && <div className="flex justify-between items-center text-sm py-1.5 p-3 rounded-xl bg-green-400/10 border border-green-400/25 mt-1 font-semibold"><span>Gain</span><span className="font-bold text-green-400">+{winAmount} XOF</span></div>}
              {gameResult === 'lose' && <div className="flex justify-between items-center text-sm py-1.5 p-3 rounded-xl bg-red-400/10 border border-red-400/25 mt-1 font-semibold"><span>Perte</span><span className="font-bold text-red-400">-{currentBet} XOF</span></div>}
            </div>

            <div className="mt-5">
              <button onClick={() => { setShowGameOverScreen(false); setShowBetScreen(true); stopTimers() }} className="w-full py-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-[#1a0a2e] font-bold text-base cursor-pointer shadow-[0_6px_25px_rgba(255,215,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_10px_35px_rgba(255,215,0,0.5)] transition-all duration-300">Rejouer</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="relative z-[5] flex flex-col items-center justify-center w-full max-w-[500px] pt-20 sm:pt-20 pb-5 px-0 flex-1 mx-auto">
        
        {/* Stats Bar */}
        <div className="flex gap-2.5 mb-3 w-full justify-center px-0">
          {[
            { label: 'Temps', value: formatTime(gameTime) },
            { label: 'Score', value: score },
            { label: 'Moves', value: isGameActive ? moves : '?' }
          ].map((stat, i) => (
            <div key={i} className="bg-black/60 border border-white/15 rounded-xl py-2.5 px-4 flex flex-col items-center gap-0.5 backdrop-blur-2xl min-w-[70px] flex-1 max-w-[140px] hover:border-yellow-400/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300">
              <span className="text-[11px] text-gray-400 uppercase tracking-[1.5px] font-semibold">{stat.label}</span>
              <span className="text-xl font-bold text-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {isGameActive && currentObjective && (
          <div className="w-full mb-3 bg-black/60 rounded-xl py-3 px-4 border border-white/15 backdrop-blur-2xl">
            <div className="text-xs text-yellow-400 mb-2 font-semibold">{currentObjective.description} - {Math.round(objectiveProgress * 100)}%</div>
            <div className="w-full h-2 bg-white/[0.1] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-400 bg-[length:300%_100%] animate-[progressShine_2s_linear_infinite] rounded-full transition-all duration-500" style={{ width: `${objectiveProgress * 100}%` }} />
            </div>
          </div>
        )}

        {/* Board - CORRECTION: grid grid-cols-9 grid-rows-9 au lieu de flex flex-wrap */}
        <div className="flex items-center justify-center bg-gradient-to-br from-[rgba(30,15,60,0.8)] to-[rgba(50,25,80,0.6)] rounded-2xl p-3.5 sm:p-4 shadow-[0_15px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(100,50,200,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] border-2 border-white/10 w-fit mx-auto">
          <div 
            ref={boardRef} 
            id="board" 
            className="w-[360px] h-[360px] sm:w-[450px] sm:h-[450px] bg-gradient-to-br from-[#0d0520] via-[#1a0d35] to-[#0d0520] border-[3px] border-white/15 rounded-xl m-0 grid grid-cols-9 grid-rows-9 shadow-[inset_0_0_40px_rgba(0,0,0,0.7),0_5px_25px_rgba(0,0,0,0.5)] relative overflow-hidden"
          />
        </div>

        {/* Shuffle Button */}
        {isGameActive && (
          <button onClick={shuffleBoard} className="mt-3.5 py-3 px-6 rounded-full bg-white/[0.06] border-2 border-white/15 text-gray-300 font-semibold cursor-pointer backdrop-blur-xl hover:bg-yellow-400/10 hover:border-yellow-400/35 hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(100,50,200,0.3)] hover:text-yellow-400 active:scale-95 transition-all duration-300 flex items-center gap-2 text-sm">
            <span className="text-lg">⟳</span>
            Remelanger (-5 coups)
          </button>
        )}

        {/* Floating Rules Button */}
        {isGameActive && (
          <button onClick={() => setShowRulesScreen(true)} className="fixed bottom-5 right-5 w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-full bg-gradient-to-br from-[#2d1055] to-[#4a1a7a] border-2 border-yellow-400/30 text-yellow-400 cursor-pointer z-[50] shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:scale-110 hover:border-yellow-400 hover:shadow-[0_10px_35px_rgba(100,50,200,0.5)] transition-all duration-300 flex items-center justify-center p-0">
            <RulesSvg />
          </button>
        )}
      </div>
    </div>
  )
}