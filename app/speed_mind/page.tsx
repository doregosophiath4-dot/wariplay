'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const CoinsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const TrophyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const ForwardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="13 17 18 12 13 7" />
    <path d="M6 6v12" />
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const CircleDotIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="8" />
  </svg>
)

const BigTrophyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const SadFaceIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 15s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
)

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface Question {
  question: string
  options: string[]
  correct: number
}

const QUESTIONS: Question[] = [
  { question: "Quel est l'element chimique O ?", options: ["Oxygene", "Or", "Osmium"], correct: 0 },
  { question: "Quelle est la capitale de l'Australie ?", options: ["Sydney", "Canberra", "Melbourne"], correct: 1 },
  { question: "Combien de cotes a un hexagone ?", options: ["6", "8", "5"], correct: 0 },
  { question: "Qui a peint La Joconde ?", options: ["Michel-Ange", "Picasso", "Leonard de Vinci"], correct: 2 },
  { question: "Quelle planete est surnommee 'la planete rouge' ?", options: ["Venus", "Mars", "Jupiter"], correct: 1 },
  { question: "Quel est le plus grand ocean du monde ?", options: ["Ocean Atlantique", "Ocean Indien", "Ocean Pacifique"], correct: 2 }
]

class BackgroundParticle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number

  constructor(width: number, height: number) {
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.size = Math.random() * 2 + 1
    this.speedX = Math.random() * 0.3 - 0.15
    this.speedY = Math.random() * 0.3 - 0.15
  }

  update(width: number, height: number) {
    this.x += this.speedX
    this.y += this.speedY
    if (this.x > width) this.x = 0
    if (this.x < 0) this.x = width
    if (this.y > height) this.y = 0
    if (this.y < 0) this.y = height
  }
}

class InteractionParticle {
  x: number
  y: number
  color: string
  size: number
  speedX: number
  speedY: number
  life: number

  constructor(x: number, y: number, color: string) {
    this.x = x
    this.y = y
    this.color = color
    this.size = Math.random() * 4 + 2
    this.speedX = Math.random() * 6 - 3
    this.speedY = Math.random() * 6 - 3
    this.life = 1
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY
    this.speedY += 0.1
    this.life -= 0.02
    this.size *= 0.97
  }
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function SpeedMind() {
  const [balance, setBalance] = useState(5000)
  const [currentBet, setCurrentBet] = useState(100)
  const [isProcessingBet, setIsProcessingBet] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(50)
  const [gameEnded, setGameEnded] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [resultTitle, setResultTitle] = useState('')
  const [resultAmount, setResultAmount] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [resultIsWin, setResultIsWin] = useState(false)
  const [choicesDisabled, setChoicesDisabled] = useState(false)
  const [correctIndex, setCorrectIndex] = useState(-1)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [timeUp, setTimeUp] = useState(false)

  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)
  const bgParticlesRef = useRef<BackgroundParticle[]>([])
  const interactionParticlesRef = useRef<InteractionParticle[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animFrameBgRef = useRef<number>(0)
  const animFrameParticleRef = useRef<number>(0)
  const betInputRef = useRef<HTMLInputElement>(null)

  function calculateWinnings(bet: number, s: number) {
    if (s === 4) return bet * 2
    if (s === 5) return bet * 3
    if (s === 6) return bet * 5
    return 0
  }

  const winnings = calculateWinnings(currentBet, score)
  const won = score >= 4

  /* ── Canvas ──────────────────────────────────────────── */
  const resizeCanvas = useCallback(() => {
    const bgCanvas = bgCanvasRef.current
    const particleCanvas = particleCanvasRef.current
    if (bgCanvas) { bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight }
    if (particleCanvas) { particleCanvas.width = window.innerWidth; particleCanvas.height = window.innerHeight }
  }, [])

  const createParticles = useCallback((x: number, y: number, count: number, color: string) => {
    for (let i = 0; i < count; i++) {
      interactionParticlesRef.current.push(new InteractionParticle(x, y, color))
    }
  }, [])

  /* ── Timer ───────────────────────────────────────────── */
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) { clearTimer(); setTimeUp(true); setTimeout(() => endGame(false), 100) }
        return newTime
      })
    }, 1000)
  }, [clearTimer])

  /* ── Game Logic ──────────────────────────────────────── */
  const endGame = useCallback((isWin: boolean = false) => {
    setGameEnded(true)
    clearTimer()
    setChoicesDisabled(true)

    const w = calculateWinnings(currentBet, score)
    const hasWon = score >= 4

    if (hasWon) {
      setBalance((prev) => prev + w)
      setResultTitle('FELICITATIONS !')
      setResultAmount(`+${w} XOF`)
      setResultMessage(`${score}/6 bonnes reponses - Gain : ${w} XOF`)
      setResultIsWin(true)
    } else {
      setResultTitle('DOMMAGE...')
      setResultAmount(`-${currentBet} XOF`)
      setResultMessage(`${score}/6 bonnes reponses - Mise perdue`)
      setResultIsWin(false)
    }
    setShowResult(true)
  }, [clearTimer, currentBet, score])

  const handleAnswer = useCallback((isCorrect: boolean, index: number, buttonElement?: HTMLElement) => {
    if (gameEnded || choicesDisabled) return
    setChoicesDisabled(true)
    setSelectedIndex(index)
    setCorrectIndex(QUESTIONS[currentQuestion].correct)

    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      if (isCorrect) createParticles(x, y, 15, '#4cc9f0')
      else createParticles(x, y, 12, '#ef233c')
    }

    if (isCorrect) {
      setScore((prev) => {
        const newScore = prev + 1
        if (newScore >= 4) setTimeout(() => endGame(true), 800)
        return newScore
      })
    }

    setTimeout(() => {
      setCurrentQuestion((prev) => prev + 1)
      setChoicesDisabled(false)
      setSelectedIndex(-1)
      setCorrectIndex(-1)
    }, 800)
  }, [gameEnded, choicesDisabled, currentQuestion, createParticles, endGame])

  const handlePass = useCallback(() => {
    if (gameEnded || choicesDisabled) return
    setScore((prev) => Math.max(0, prev - 2))
    const passBtn = document.getElementById('pass-btn')
    if (passBtn) {
      const rect = passBtn.getBoundingClientRect()
      createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 8, '#f8961e')
    }
    setCurrentQuestion((prev) => prev + 1)
  }, [gameEnded, choicesDisabled, createParticles])

  const simulateBackendRequest = useCallback(() => {
    return new Promise<void>((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))
  }, [])

  const handleStartGame = useCallback(async () => {
    if (isProcessingBet) return
    const bet = parseInt(betInputRef.current?.value ?? '100')
    if (isNaN(bet) || bet < 100 || bet > 1000) { alert("La mise doit etre entre 100 et 1000 XOF"); return }
    if (bet > balance) { alert("Solde insuffisant"); return }

    setIsProcessingBet(true)
    try {
      await simulateBackendRequest()
      setBalance((prev) => prev - bet)
      setCurrentBet(bet)
      setGameStarted(true)
      setCurrentQuestion(0)
      setScore(0)
      setTimeLeft(50)
      setGameEnded(false)
      setChoicesDisabled(false)
      setSelectedIndex(-1)
      setCorrectIndex(-1)
      setTimeUp(false)
      startTimer()
    } catch { alert("Erreur, reessayez.") }
    finally { setIsProcessingBet(false) }
  }, [isProcessingBet, balance, simulateBackendRequest, startTimer])

  const handlePlayAgain = useCallback(() => {
    setShowResult(false)
    setGameStarted(false)
    setGameEnded(false)
    setCurrentQuestion(0)
    setScore(0)
    setTimeLeft(50)
    setChoicesDisabled(false)
    setSelectedIndex(-1)
    setCorrectIndex(-1)
    setTimeUp(false)
    clearTimer()
  }, [clearTimer])

  const updateBet = useCallback((value: number) => {
    let bet = value
    if (isNaN(bet)) bet = 100
    if (bet > 1000) bet = 1000
    if (bet < 100) bet = 100
    setCurrentBet(bet)
    if (betInputRef.current) betInputRef.current.value = bet.toString()
  }, [])

  /* ── Effects ─────────────────────────────────────────── */
  useEffect(() => {
    resizeCanvas()
    for (let i = 0; i < 60; i++) bgParticlesRef.current.push(new BackgroundParticle(window.innerWidth, window.innerHeight))

    const animateBg = () => {
      const canvas = bgCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = 'rgba(12, 15, 30, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      bgParticlesRef.current.forEach((p) => {
        p.update(canvas.width, canvas.height)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
      })
      animFrameBgRef.current = requestAnimationFrame(animateBg)
    }

    const animateParticles = () => {
      const canvas = particleCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = interactionParticlesRef.current.length - 1; i >= 0; i--) {
        const p = interactionParticlesRef.current[i]
        p.update()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        if (p.life <= 0) interactionParticlesRef.current.splice(i, 1)
      }
      animFrameParticleRef.current = requestAnimationFrame(animateParticles)
    }

    animateBg()
    animateParticles()

    const handleResize = () => resizeCanvas()
    window.addEventListener('resize', handleResize)

    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { setShowRules(false); setShowResult(false) } }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(animFrameBgRef.current)
      cancelAnimationFrame(animFrameParticleRef.current)
      clearTimer()
    }
  }, [resizeCanvas, clearTimer])

  /* ── Derived ─────────────────────────────────────────── */
  const currentQ = QUESTIONS[currentQuestion] || QUESTIONS[0]
  const progressWidth = gameStarted ? (currentQuestion / QUESTIONS.length) * 100 : 0

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative w-full h-screen overflow-hidden fixed inset-0 font-['Poppins',sans-serif] bg-gradient-to-br from-[#0c0f1e] to-[#1a1b2e] text-white flex flex-col items-center justify-center p-5">
      
      {/* Background Canvas */}
      <canvas ref={bgCanvasRef} className="fixed inset-0 w-full h-full z-[1] pointer-events-none" />
      
      {/* Particle Canvas */}
      <canvas ref={particleCanvasRef} className="fixed inset-0 w-full h-full z-[2] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[500px] relative z-10 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-7 sm:mb-8 w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2.5 bg-gradient-to-r from-pink-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-['Montserrat',sans-serif] leading-tight">
            SPEED MIND
          </h1>
          <p className="text-sm sm:text-base text-white/70 font-light">
            Testez vos connaissances et misez pour gagner plus !
          </p>
        </div>

        {/* Bet Section */}
        {!gameStarted && (
          <div className="w-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] rounded-2xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] mb-5 relative before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-pink-500 before:via-blue-500 before:to-cyan-400 before:rounded-t-2xl">
            
            <div className="flex justify-between items-center mb-6 bg-black/30 py-3.5 px-4 rounded-2xl border border-white/[0.1]">
              <div className="text-lg sm:text-xl font-bold text-cyan-400 flex items-center gap-2">
                <CoinsIcon />
                Solde : {balance} XOF
              </div>
              <button
                onClick={() => setShowRules(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-700 border-none text-white py-2.5 px-5 rounded-xl font-semibold cursor-pointer flex items-center gap-2 text-sm hover:scale-[0.98] active:scale-95 transition-transform duration-200"
              >
                <BookIcon />
                Regles
              </button>
            </div>

            <div className="w-full">
              <div className="mb-6">
                <label className="block text-base sm:text-lg mb-3 text-white/90 font-medium text-center">
                  Montant de votre mise :
                </label>
                <input
                  type="number"
                  ref={betInputRef}
                  defaultValue="100"
                  min="100"
                  max="1000"
                  step="10"
                  placeholder="Entrez votre mise"
                  onChange={(e) => updateBet(parseInt(e.target.value) || 100)}
                  className="w-full bg-black/30 border-2 border-white/[0.1] rounded-xl py-4.5 px-4 text-xl sm:text-2xl text-white font-semibold text-center outline-none transition-all duration-300 focus:border-blue-500"
                />
                <div className="mt-2.5 text-white/60 text-xs sm:text-sm text-center">
                  Mise minimale : 100 XOF | Mise maximale : 1000 XOF
                </div>
              </div>

              <button
                onClick={handleStartGame}
                disabled={isProcessingBet || currentBet > balance}
                className="relative w-full bg-gradient-to-r from-pink-500 to-pink-700 border-none text-white py-5 text-lg sm:text-xl font-bold rounded-xl cursor-pointer hover:scale-[0.98] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-transform duration-200 mt-2.5 overflow-hidden"
              >
                <span className={`transition-opacity duration-300 ${isProcessingBet ? 'opacity-0' : 'opacity-100'}`}>
                  COMMENCER LE JEU
                </span>
                {isProcessingBet && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Quiz Card */}
        {gameStarted && (
          <div className="w-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] rounded-2xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] relative before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-pink-500 before:via-blue-500 before:to-cyan-400 before:rounded-t-2xl">
            
            {/* Stats */}
            <div className="flex mb-6 gap-4 overflow-x-auto pb-1.5 scrollbar-thin">
              <div className="flex-shrink-0 min-w-[130px] sm:min-w-[140px] bg-black/30 py-3.5 px-4 rounded-xl border border-white/[0.1] flex items-center justify-center gap-2 font-semibold" style={{ color: timeLeft <= 10 ? '#ef233c' : '#ff80ab' }}>
                <ClockIcon />
                Temps : {timeLeft}s
              </div>
              <div className="flex-shrink-0 min-w-[130px] sm:min-w-[140px] bg-black/30 py-3.5 px-4 rounded-xl border border-white/[0.1] flex items-center justify-center gap-2 font-semibold text-cyan-400">
                <TrophyIcon />
                Score : {score}
              </div>
            </div>

            {/* Progress */}
            <div className="w-full h-2 bg-white/[0.1] rounded mb-7 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-blue-500 rounded transition-all duration-400"
                style={{ width: `${gameEnded ? 100 : progressWidth}%` }}
              />
            </div>

            {/* Question */}
            <div className="mb-7">
              <div className="text-pink-400 font-semibold text-xs sm:text-sm uppercase tracking-[1px] mb-2.5">
                Question {Math.min(currentQuestion + 1, QUESTIONS.length)}/{QUESTIONS.length}
              </div>
              <div className="text-xl sm:text-2xl font-semibold leading-relaxed">
                {currentQ.question}
              </div>
            </div>

            {/* Choices */}
            <div className="flex flex-col gap-3.5 mb-5">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  disabled={choicesDisabled || gameEnded}
                  onClick={(e) => handleAnswer(index === currentQ.correct, index, e.currentTarget)}
                  className={`w-full bg-white/[0.05] border border-white/[0.1] text-white py-4.5 px-4 rounded-xl text-base sm:text-lg text-left cursor-pointer font-medium transition-all duration-200 hover:bg-white/[0.1] active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-80 flex items-center gap-2.5
                    ${choicesDisabled && index === correctIndex ? '!bg-cyan-400/20 !border-cyan-400 !text-white' : ''}
                    ${choicesDisabled && index === selectedIndex && index !== correctIndex ? '!bg-red-500/20 !border-red-500 !text-white' : ''}
                  `}
                >
                  <CircleDotIcon />
                  {option}
                </button>
              ))}
            </div>

            {/* Pass Button */}
            {!gameEnded && (
              <button
                id="pass-btn"
                onClick={handlePass}
                disabled={choicesDisabled || gameEnded}
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 border-none text-white py-4.5 text-base sm:text-lg font-semibold rounded-xl cursor-pointer hover:scale-[0.98] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-transform duration-200 flex items-center justify-center gap-2"
              >
                <ForwardIcon />
                Passer la question (-2 pts)
              </button>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════ */}
      {/* RULES OVERLAY */}
      {/* ══════════════════════════════════════ */}
      {showRules && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1000] flex items-center justify-center p-5 transition-opacity duration-300"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRules(false) }}
        >
          <div className="bg-[#1a1b2e] rounded-2xl p-6 sm:p-8 max-w-[450px] w-full max-h-[85vh] overflow-y-auto border border-white/[0.15] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
            
            <button
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 bg-white/[0.1] border-none w-9 h-9 rounded-full text-white/70 text-xl cursor-pointer flex items-center justify-center hover:bg-white/[0.2] hover:text-white transition-all duration-200"
            >
              <CloseIcon />
            </button>

            <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-center bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Regles du jeu
            </h2>

            <div className="text-white/80 leading-relaxed text-sm sm:text-base">
              <p className="mb-4">Bienvenue dans Speed Mind ! Voici comment jouer :</p>
              <ul className="space-y-3 mb-4">
                {[
                  { text: <><strong>Mise :</strong> Entrez un montant entre 100 et 1000 XOF</> },
                  { text: <><strong>Objectif :</strong> Repondez correctement a au moins 4 questions sur 6</> },
                  { text: <><strong>Temps :</strong> Vous avez 50 secondes pour repondre a toutes les questions</> },
                  { text: <strong>Gains :</strong> }
                ].map((item, i) => (
                  <li key={i} className="pl-5 relative before:content-['•'] before:text-pink-500 before:absolute before:left-0 before:text-xl">
                    {item.text}
                  </li>
                ))}
                <li className="pl-5 relative">
                  <ul className="ml-5 mt-2.5 space-y-1.5">
                    <li className="before:content-['-'] before:text-cyan-400 before:mr-1.5">4 bonnes reponses : gain x2</li>
                    <li className="before:content-['-'] before:text-cyan-400 before:mr-1.5">5 bonnes reponses : gain x3</li>
                    <li className="before:content-['-'] before:text-cyan-400 before:mr-1.5">6 bonnes reponses : gain x5</li>
                  </ul>
                </li>
                <li className="pl-5 relative before:content-['•'] before:text-pink-500 before:absolute before:left-0 before:text-xl">
                  <strong>Passer :</strong> Vous pouvez passer une question, mais cela coute 2 points
                </li>
                <li className="pl-5 relative before:content-['•'] before:text-pink-500 before:absolute before:left-0 before:text-xl">
                  <strong>Attention :</strong> Si le temps expire ou si vous avez moins de 4 bonnes reponses, vous perdez votre mise
                </li>
              </ul>
              <p>Bonne chance et que le meilleur gagne !</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* RESULT OVERLAY */}
      {/* ══════════════════════════════════════ */}
      {showResult && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1000] flex items-center justify-center p-5 transition-opacity duration-300"
          onClick={(e) => { if (e.target === e.currentTarget) setShowResult(false) }}
        >
          <div className="bg-[#1a1b2e] rounded-2xl p-6 sm:p-8 max-w-[450px] w-full max-h-[85vh] overflow-y-auto border border-white/[0.15] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
            
            <button
              onClick={() => setShowResult(false)}
              className="absolute top-4 right-4 bg-white/[0.1] border-none w-9 h-9 rounded-full text-white/70 text-xl cursor-pointer flex items-center justify-center hover:bg-white/[0.2] hover:text-white transition-all duration-200"
            >
              <CloseIcon />
            </button>

            <h2 className={`text-2xl sm:text-3xl font-bold mb-5 text-center bg-gradient-to-r ${resultIsWin ? 'from-pink-400 to-cyan-400' : 'from-red-400 to-pink-400'} bg-clip-text text-transparent`}>
              {resultTitle}
            </h2>

            <div className="text-center py-5">
              <div className="text-5xl sm:text-6xl mb-5 flex justify-center">
                {resultIsWin ? <BigTrophyIcon /> : <SadFaceIcon />}
              </div>

              <div className="text-3xl sm:text-4xl font-extrabold my-5 bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                {resultAmount}
              </div>

              <div className="text-base sm:text-lg text-white/80 mb-6 leading-relaxed">
                {resultMessage}
              </div>

              <button
                onClick={handlePlayAgain}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-700 border-none text-white py-4 text-base sm:text-lg font-semibold rounded-xl cursor-pointer hover:scale-[0.98] active:scale-95 transition-transform duration-200 flex items-center justify-center gap-2"
              >
                <RefreshIcon />
                JOUER A NOUVEAU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}