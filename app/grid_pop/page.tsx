'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const GlobeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const WalletIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
)

const StopIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const CloseCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const InfoCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const CloseModalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/* ═══════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════ */

const WORDS = ["PARIS", "NILE", "ASIE", "AFRIQUE", "MONT", "OCEAN"]
const GRID_SIZE = 10

const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 }
]

/* ═══════════════════════════════════════════
   CLASSES
   ═══════════════════════════════════════════ */

class Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string

  constructor(width: number, height: number) {
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.size = Math.random() * 2 + 1
    this.speedX = Math.random() * 0.5 - 0.25
    this.speedY = Math.random() * 0.5 - 0.25
    this.color = `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.4 + 0.2})`
  }

  update(width: number, height: number) {
    this.x += this.speedX
    this.y += this.speedY
    if (this.x > width) this.x = 0
    if (this.x < 0) this.x = width
    if (this.y > height) this.y = 0
    if (this.y < 0) this.y = height
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

interface CellPosition {
  row: number
  col: number
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function GridPop() {
  const [balance, setBalance] = useState(10000)
  const [currentBet, setCurrentBet] = useState(100)
  const [gameActive, setGameActive] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(5 * 60)
  const [grid, setGrid] = useState<string[][]>([])
  const [wordPositions, setWordPositions] = useState<Map<string, CellPosition[]>>(new Map())
  const [foundWords, setFoundWords] = useState<Map<string, CellPosition[]>>(new Map())
  const [selected, setSelected] = useState<CellPosition[]>([])
  const [showRules, setShowRules] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'info' | 'win' | 'lose'>('info')
  const [toastVisible, setToastVisible] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animFrameRef = useRef<number>(0)
  const betInputRef = useRef<HTMLInputElement>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)
  const gameActiveRef = useRef(false)
  const gridRef = useRef<string[][]>([])
  const foundWordsRef = useRef<Map<string, CellPosition[]>>(new Map())
  const selectedRef = useRef<CellPosition[]>([])
  const wordPositionsRef = useRef<Map<string, CellPosition[]>>(new Map())

  useEffect(() => { gameActiveRef.current = gameActive }, [gameActive])
  useEffect(() => { gridRef.current = grid }, [grid])
  useEffect(() => { foundWordsRef.current = foundWords }, [foundWords])
  useEffect(() => { selectedRef.current = selected }, [selected])
  useEffect(() => { wordPositionsRef.current = wordPositions }, [wordPositions])

  const formatNumber = useCallback((num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }, [])

  const showToast = useCallback((msg: string, type: 'info' | 'win' | 'lose' = 'info') => {
    setToastMessage(msg)
    setToastType(type)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }, [])

  /* ── Animation canvas ──────────────────────────────── */
  const animateParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particlesRef.current.forEach(particle => {
      particle.update(canvas.width, canvas.height)
      particle.draw(ctx)
    })
    animFrameRef.current = requestAnimationFrame(animateParticles)
  }, [])

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    particlesRef.current = []
    for (let i = 0; i < 60; i++) {
      particlesRef.current.push(new Particle(canvas.width, canvas.height))
    }
  }, [])

  /* ── Timer ──────────────────────────────────────────── */
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    setTimeLeft(5 * 60)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1
        if (newTime <= 0) {
          clearTimer()
          showToast("Temps ecoule !", "lose")
          setTimeout(() => endGame(), 100)
          return 0
        }
        return newTime
      })
    }, 1000)
  }, [clearTimer, showToast])

  /* ── Grille ─────────────────────────────────────────── */
  const isAdjacent = useCallback((pos1: CellPosition, pos2: CellPosition): boolean => {
    return Math.abs(pos1.row - pos2.row) <= 1 && Math.abs(pos1.col - pos2.col) <= 1
  }, [])

  const fillEmptyCells = useCallback((g: string[][]) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!g[r][c]) g[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
      }
    }
    return g
  }, [])

  const placeWord = useCallback((word: string, g: string[][], wp: Map<string, CellPosition[]>) => {
    let placed = false
    let attempts = 0
    const maxAttempts = 200

    while (!placed && attempts < maxAttempts) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
      const row = Math.floor(Math.random() * (GRID_SIZE - Math.abs(dir.y) * (word.length - 1)))
      const col = Math.floor(Math.random() * (GRID_SIZE - Math.abs(dir.x) * (word.length - 1)))

      let fits = true
      for (let i = 0; i < word.length; i++) {
        const r = row + dir.y * i
        const c = col + dir.x * i
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || (g[r][c] && g[r][c] !== word[i])) {
          fits = false
          break
        }
      }

      if (fits) {
        const positions: CellPosition[] = []
        for (let i = 0; i < word.length; i++) {
          const r = row + dir.y * i
          const c = col + dir.x * i
          g[r][c] = word[i]
          positions.push({ row: r, col: c })
        }
        wp.set(word, positions)
        placed = true
      }
      attempts++
    }
  }, [])

  const initGrid = useCallback(() => {
    const newGrid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''))
    const newWordPositions = new Map<string, CellPosition[]>()
    const newFoundWords = new Map<string, CellPosition[]>()

    WORDS.forEach(word => placeWord(word, newGrid, newWordPositions))
    fillEmptyCells(newGrid)

    setGrid(newGrid)
    gridRef.current = newGrid
    setWordPositions(newWordPositions)
    wordPositionsRef.current = newWordPositions
    setFoundWords(newFoundWords)
    foundWordsRef.current = newFoundWords
    setSelected([])
    selectedRef.current = []
  }, [placeWord, fillEmptyCells])

  /* ── Logique du jeu ────────────────────────────────── */
  const checkSelection = useCallback(() => {
    const currentSelected = selectedRef.current
    const currentGrid = gridRef.current
    const currentFoundWords = foundWordsRef.current

    if (currentSelected.length === 0) return

    const word = currentSelected.map(pos => currentGrid[pos.row]?.[pos.col] || '').join("")
    const reversed = word.split('').reverse().join('')

    if (WORDS.includes(word) || WORDS.includes(reversed)) {
      const foundWord = WORDS.includes(word) ? word : reversed
      const newFoundWords = new Map(currentFoundWords)
      newFoundWords.set(foundWord, [...currentSelected])
      setFoundWords(newFoundWords)
      foundWordsRef.current = newFoundWords
      setSelected([])
      selectedRef.current = []

      const winAmount = currentBet * 2
      setBalance(prev => prev + winAmount)
      showToast(`${foundWord} trouve ! +${formatNumber(winAmount)} XOF`, "win")

      if (newFoundWords.size >= WORDS.length) {
        setGameActive(false)
        gameActiveRef.current = false
        clearTimer()
        const totalWin = currentBet * 2 * WORDS.length
        showToast(`Bravo ! Tous les mots trouves. Gain total: ${formatNumber(totalWin)} XOF`, "win")
        setTimeout(() => endGame(), 3000)
      }
    } else if (currentSelected.length > Math.max(...WORDS.map(w => w.length))) {
      setSelected([])
      selectedRef.current = []
      showToast("Mot incorrect. Essayez encore !", "lose")
    }
  }, [currentBet, formatNumber, showToast, clearTimer])

  const selectCell = useCallback((row: number, col: number) => {
    if (!gameActiveRef.current) return

    const currentSelected = selectedRef.current
    const currentFoundWords = foundWordsRef.current

    const isAlreadySelected = currentSelected.some(sel => sel.row === row && sel.col === col)
    if (isAlreadySelected) return

    let isFoundCell = false
    for (const positions of currentFoundWords.values()) {
      if (positions.some(pos => pos.row === row && pos.col === col)) {
        isFoundCell = true
        break
      }
    }

    if (isFoundCell) {
      showToast("Cette lettre fait deja partie d'un mot trouve", "info")
      return
    }

    if (currentSelected.length === 0 || isAdjacent(currentSelected[currentSelected.length - 1], { row, col })) {
      const newSelected = [...currentSelected, { row, col }]
      setSelected(newSelected)
      selectedRef.current = newSelected
      setTimeout(() => checkSelection(), 50)
    } else {
      showToast("Selectionnez des lettres adjacentes", "info")
    }
  }, [isAdjacent, checkSelection, showToast])

  const endGame = useCallback(() => {
    setGameActive(false)
    gameActiveRef.current = false
    clearTimer()
    const foundCount = foundWordsRef.current.size
    const totalWin = foundCount * currentBet * 2
    if (foundCount > 0) {
      showToast(`Partie terminee ! ${foundCount}/${WORDS.length} mots trouves. Gain: ${formatNumber(totalWin)} XOF`, "info")
    }
    setTimeout(() => {
      setGameStarted(false)
      setFoundWords(new Map())
      foundWordsRef.current = new Map()
      setWordPositions(new Map())
      wordPositionsRef.current = new Map()
    }, 3000)
  }, [clearTimer, currentBet, formatNumber, showToast])

  /* ── Actions ────────────────────────────────────────── */
  const isValidBet = useCallback((): boolean => {
    const bet = parseInt(betInputRef.current?.value ?? '100')
    if (isNaN(bet) || bet < 100 || bet > 1000) { showToast("Mise invalide. Min: 100 XOF, Max: 1,000 XOF", "lose"); return false }
    if (bet > balance) { showToast("Solde insuffisant !", "lose"); return false }
    return true
  }, [balance, showToast])

  const handleStartGame = useCallback(() => {
    if (!isValidBet()) return
    const bet = parseInt(betInputRef.current?.value ?? '100')
    setCurrentBet(bet)
    setBalance(prev => prev - bet)
    setGameStarted(true)
    setGameActive(true)
    gameActiveRef.current = true
    initGrid()
    startTimer()
    showToast("Partie commencee ! Selectionnez des lettres adjacentes", "info")
  }, [isValidBet, initGrid, startTimer, showToast])

  const handleEndGame = useCallback(() => { endGame() }, [endGame])

  const handleBetChange = useCallback((value: string) => {
    let val = parseInt(value)
    if (isNaN(val)) val = 100
    if (val < 100) val = 100
    if (val > 1000) val = 1000
    setCurrentBet(val)
    if (betInputRef.current) betInputRef.current.value = val.toString()
  }, [])

  /* ── Effects ────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    initParticles()
    animateParticles()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }
    window.addEventListener('resize', handleResize)

    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowRules(false) }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(animFrameRef.current)
      clearTimer()
    }
  }, [initParticles, animateParticles, clearTimer])

  /* ── Derived ────────────────────────────────────────── */
  const winAmount = currentBet * 2
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  const foundCount = foundWords.size

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen font-['Poppins',sans-serif] bg-[#1A1E1F] text-[#F5F6FA] flex flex-col items-center p-4 sm:p-6 overflow-x-hidden">
      
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-[-1] opacity-60" />

      {/* Toast */}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#2D3436]/95 backdrop-blur-xl rounded-2xl py-4 px-5 flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/[0.1] z-[1000] max-w-[90%] w-auto transition-all duration-400 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24 pointer-events-none'
        } ${
          toastType === 'win' ? 'border-l-4 border-l-emerald-400' :
          toastType === 'lose' ? 'border-l-4 border-l-red-500' :
          'border-l-4 border-l-purple-500'
        }`}
      >
        <div className={`text-xl ${
          toastType === 'win' ? 'text-emerald-400' :
          toastType === 'lose' ? 'text-red-400' :
          'text-purple-400'
        }`}>
          {toastType === 'win' ? <CheckCircleIcon /> :
           toastType === 'lose' ? <CloseCircleIcon /> :
           <InfoCircleIcon />}
        </div>
        <div className="text-sm font-medium text-[#F5F6FA]">{toastMessage}</div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[2000] p-5 transition-all duration-300"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRules(false) }}
        >
          <div className="bg-[#2D3436]/95 backdrop-blur-2xl rounded-2xl p-6 sm:p-7 max-w-[500px] w-full max-h-[80vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/[0.1]">
            
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/[0.1]">
              <div className="text-xl font-bold text-cyan-400 flex items-center gap-2.5">
                <BookIcon />
                Regles du Jeu
              </div>
              <button
                onClick={() => setShowRules(false)}
                className="bg-transparent border-none text-white/70 text-xl cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.1] hover:text-red-400 transition-all duration-300"
              >
                <CloseModalIcon />
              </button>
            </div>

            <div className="leading-relaxed text-sm space-y-4">
              <div>
                <h3 className="text-purple-400 text-base font-bold my-3">Comment jouer ?</h3>
                <p>Grid Pop est un jeu de mots caches dans une grille de lettres.</p>
              </div>

              <div>
                <h3 className="text-purple-400 text-base font-bold my-3">Objectif</h3>
                <p>Trouver tous les mots de la liste caches dans la grille.</p>
              </div>

              <div>
                <h3 className="text-purple-400 text-base font-bold my-3">Mecanique de jeu</h3>
                <ul className="pl-5 space-y-1.5">
                  <li>Les mots peuvent etre caches <span className="text-cyan-400 font-semibold">horizontalement, verticalement ou en diagonale</span>.</li>
                  <li>Cliquez sur les lettres <span className="text-cyan-400 font-semibold">adjacentes</span> pour former un mot.</li>
                  <li>Les lettres doivent etre <span className="text-cyan-400 font-semibold">voisines</span> (horizontalement, verticalement ou en diagonale).</li>
                  <li>Un mot est valide automatiquement quand il correspond a un mot de la liste.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-purple-400 text-base font-bold my-3">Systeme de mise</h3>
                <ul className="pl-5 space-y-1.5">
                  <li>Mise minimum : <span className="text-cyan-400 font-semibold">100 XOF</span></li>
                  <li>Mise maximum : <span className="text-cyan-400 font-semibold">1000 XOF</span></li>
                  <li>Gain par mot trouve : <span className="text-cyan-400 font-semibold">2x votre mise</span></li>
                </ul>
              </div>

              <div>
                <h3 className="text-purple-400 text-base font-bold my-3">Timer</h3>
                <p>Vous avez <span className="text-cyan-400 font-semibold">5 minutes</span> pour trouver tous les mots.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-[900px] mx-auto relative z-10">

        {/* Header */}
        <div className={`text-center mb-6 w-full ${gameStarted ? 'hidden' : 'block'}`}>
          <div className="text-3xl mb-2.5 text-cyan-400 animate-[float_6s_ease-in-out_infinite] flex justify-center">
            <GlobeIcon />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2 tracking-[1px] leading-tight">
            GRID POP
          </h1>
          <p className="text-sm sm:text-base text-white/70 font-normal mb-4">
            Trouvez les mots caches et gagnez des recompenses
          </p>
          <div className="flex justify-center gap-2.5 mt-4">
            <button
              onClick={() => setShowRules(true)}
              className="px-4 py-2.5 bg-white/[0.05] text-[#F5F6FA] border border-white/[0.1] rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-[1px] hover:bg-white/[0.1] hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all duration-300 flex items-center gap-2"
            >
              <BookIcon />
              REGLES
            </button>
          </div>
        </div>

        {/* Bet Section */}
        <section className={`bg-[#2D3436]/85 backdrop-blur-xl rounded-2xl p-5 sm:p-6 mb-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/[0.08] w-full ${gameStarted ? 'hidden' : 'block'}`}>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="text-xl font-bold text-[#F5F6FA] flex items-center gap-2.5">
              <span className="text-cyan-400"><CoinsIcon /></span>
              Placez votre mise
            </div>
            <div className="flex items-center gap-2.5 bg-black/30 rounded-2xl py-3 px-4 sm:px-5 border border-white/[0.1] sm:ml-auto">
              <span className="text-2xl text-cyan-400"><WalletIcon /></span>
              <div>
                <div className="text-xs text-white/60">SOLDE</div>
                <div className="text-xl sm:text-2xl font-bold text-cyan-400">{formatNumber(balance)} XOF</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="relative my-4">
              <input
                type="number"
                ref={betInputRef}
                placeholder="Ex: 500"
                min="100"
                max="1000"
                defaultValue="100"
                onChange={(e) => handleBetChange(e.target.value)}
                className="w-full py-3.5 px-5 bg-black/30 border-2 border-purple-500/30 rounded-2xl text-[#F5F6FA] text-lg font-semibold text-center outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(108,92,231,0.2)]"
              />
              <span className="absolute -top-2.5 left-4 bg-[#1A1E1F] px-2.5 text-xs text-cyan-400 font-medium">MONTANT DE LA MISE</span>
              <div className="flex justify-between mt-2 text-xs text-white/50">
                <span>Min: 100 XOF</span>
                <span>Max: 1,000 XOF</span>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold text-base uppercase tracking-[1px] rounded-xl hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(108,92,231,0.4)] active:-translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 animate-[pulse_2s_infinite]"
            >
              <PlayIcon />
              JOUER
            </button>
          </div>
        </section>

        {/* Game Section */}
        <section className={`bg-[#2D3436]/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/[0.08] w-full ${gameStarted ? 'block' : 'hidden'}`}>
          
          <div className={`mb-5 text-center ${gameStarted ? 'block' : 'hidden'}`}>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2.5">
              Grille de Jeu - Geographie
            </h2>
          </div>

          {/* Stats */}
          <div className="w-full overflow-x-auto mb-5 pb-2.5 scrollbar-thin">
            <div className="flex gap-2.5 min-w-min p-1">
              {[
                { label: 'MISE', value: `${formatNumber(currentBet)} XOF`, color: 'text-purple-400' },
                { label: 'GAIN POTENTIEL', value: `${formatNumber(winAmount)} XOF`, color: 'text-emerald-400' },
                { label: 'MOTS TROUVES', value: `${foundCount}/${WORDS.length}`, color: 'text-cyan-400' },
                { label: 'SOLDE', value: `${formatNumber(balance)} XOF`, color: 'text-yellow-400' },
                { label: 'TEMPS', value: timerText, color: 'text-red-400 font-mono tracking-[1px]' }
              ].map((stat, i) => (
                <div key={i} className="bg-black/30 rounded-xl py-3 px-4 border border-white/[0.1] flex flex-col items-center justify-center text-center min-w-[110px] sm:min-w-[130px] flex-shrink-0">
                  <div className="text-[10px] sm:text-xs text-white/60 mb-1 whitespace-nowrap overflow-hidden text-ellipsis w-full">{stat.label}</div>
                  <div className={`text-sm sm:text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Word List */}
          <div className="bg-black/20 rounded-2xl p-4 mb-5 border border-white/[0.05]">
            <div className="text-xs sm:text-sm text-white/70 mb-2.5 text-center font-semibold">MOTS A TROUVER</div>
            <div className="flex flex-wrap justify-center gap-2">
              {WORDS.map(word => (
                <span
                  key={word}
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition-all duration-300 flex-shrink-0 ${
                    foundWords.has(word)
                      ? 'bg-emerald-400/20 border-emerald-400/50 text-white/70 line-through scale-95'
                      : 'bg-purple-500/15 border-purple-500/30 text-[#F5F6FA]'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex justify-center items-center my-5 p-4 bg-black/20 rounded-2xl border border-white/[0.05] w-full min-h-[300px] overflow-hidden">
            <div
              ref={gridContainerRef}
              className="grid gap-[3px] touch-manipulation relative mx-auto max-w-full"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(24px, 40px))` }}
            >
              {grid.map((row, r) =>
                row.map((letter, c) => {
                  const isSelected = selected.some(sel => sel.row === r && sel.col === c)
                  let isFound = false
                  for (const positions of foundWords.values()) {
                    if (positions.some(pos => pos.row === r && pos.col === c)) {
                      isFound = true
                      break
                    }
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => selectCell(r, c)}
                      onTouchStart={(e) => { e.preventDefault(); selectCell(r, c) }}
                      className={`
                        aspect-square flex items-center justify-center cursor-pointer select-none font-bold text-sm sm:text-base
                        transition-all duration-150 rounded-md relative overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.2)]
                        hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)]
                        ${isSelected ? '!bg-purple-500 !text-white scale-95 shadow-[0_0_15px_rgba(108,92,231,0.5)]' : ''}
                        ${isFound ? '!bg-emerald-500 !text-white animate-[pop_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)] after:content-["✓"] after:absolute after:-top-[3px] after:-right-[3px] after:bg-emerald-600 after:w-4 after:h-4 after:rounded-full after:text-[10px] after:flex after:items-center after:justify-center' : ''}
                        ${!isSelected && !isFound ? 'bg-[#1E2328]/90' : ''}
                      `}
                    >
                      {letter}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2.5 mt-5">
            <button
              onClick={handleEndGame}
              className="flex-1 py-3.5 bg-white/[0.05] text-[#F5F6FA] border border-white/[0.1] rounded-xl font-semibold text-sm uppercase tracking-[1px] hover:bg-white/[0.1] hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <StopIcon />
              TERMINER
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}