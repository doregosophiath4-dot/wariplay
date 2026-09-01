'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const CubeIcon = ({ size = 60 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10 8 16 12 10 16 10 8"/>
  </svg>
)

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)

const LayersIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
)

const MonitorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
)

const MedalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const TrophyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
)

const CreditCardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)

const DiceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 8h.01"/>
    <path d="M8 8h.01"/>
    <path d="M8 16h.01"/>
    <path d="M16 16h.01"/>
    <path d="M12 12h.01"/>
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
)

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const BigTrophyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
)

/* ═══════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════ */

const FRUITS = [
  { name: 'mandarine', src: '/img/manda.png' },
  { name: 'pomme', src: '/img/pmo.png' },
  { name: 'ananas', src: '/img/ana.png' },
  { name: 'banane', src: '/img/bana.png' },
  { name: 'tomate', src: '/img/toma.png' },
  { name: 'pasteque', src: '/img/pas.png' },
  { name: 'raisin', src: '/img/rsi.png' },
  { name: 'mangue', src: '/img/mag.png' },
  { name: 'orange', src: '/img/org.png' },
  { name: 'papaye', src: '/img/ppy.png' },
]

const TOTAL_PAIRS = 8

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  opacity: number
}

interface CardData {
  fruit: typeof FRUITS[0]
  index: number
  flipped: boolean
  matched: boolean
}

interface ConfettiPiece {
  x: number
  y: number
  w: number
  h: number
  color: string
  rotation: number
  speedX: number
  speedY: number
  rotationSpeed: number
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function MemoPop() {
  /* ── State ─────────────────────────────────────────── */
  const [playerBalance, setPlayerBalance] = useState(5000)
  const [currentBet, setCurrentBet] = useState(0)
  const [currentWin, setCurrentWin] = useState(0)
  const [matchesFound, setMatchesFound] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showBet, setShowBet] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showGame, setShowGame] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [cards, setCards] = useState<CardData[]>([])
  const [firstCard, setFirstCard] = useState<number | null>(null)
  const [secondCard, setSecondCard] = useState<number | null>(null)
  const [lockBoard, setLockBoard] = useState(false)
  const [isProcessingBet, setIsProcessingBet] = useState(false)
  const [lastMatchIndex, setLastMatchIndex] = useState<number | null>(null)
  const [showMatchPopup, setShowMatchPopup] = useState(false)
  const [matchPopupAmount, setMatchPopupAmount] = useState(0)

  // Nouvel état pour mémoriser qu'on était en jeu avant d'afficher les règles
  const [wasInGameBeforeRules, setWasInGameBeforeRules] = useState(false)

  /* ── Refs ──────────────────────────────────────────── */
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const betInputRef = useRef<HTMLInputElement>(null)
  const playerBalanceRef = useRef(playerBalance)
  const currentBetRef = useRef(currentBet)
  const currentWinRef = useRef(currentWin)
  const matchesFoundRef = useRef(matchesFound)
  const firstCardRef = useRef<number | null>(null)
  const secondCardRef = useRef<number | null>(null)
  const lockBoardRef = useRef(false)
  const confettiRef = useRef<ConfettiPiece[]>([])
  const confettiAnimRef = useRef<number>(0)
  const matchPopupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { playerBalanceRef.current = playerBalance }, [playerBalance])
  useEffect(() => { currentBetRef.current = currentBet }, [currentBet])
  useEffect(() => { currentWinRef.current = currentWin }, [currentWin])
  useEffect(() => { matchesFoundRef.current = matchesFound }, [matchesFound])
  useEffect(() => { firstCardRef.current = firstCard }, [firstCard])
  useEffect(() => { secondCardRef.current = secondCard }, [secondCard])
  useEffect(() => { lockBoardRef.current = lockBoard }, [lockBoard])

  /* ── Helpers ───────────────────────────────────────── */
  const formatXOF = useCallback((number: number): string => {
    return new Intl.NumberFormat('fr-FR').format(number)
  }, [])

  const shuffle = useCallback(<T,>(array: T[]): T[] => {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [])

  /* ── Canvas Animation ──────────────────────────────── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }, [])

  const createParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const particleCount = Math.floor((canvas.width * canvas.height) / 12000)
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.4 + 0.1})`,
        opacity: Math.random() * 0.5 + 0.2
      })
    }
    particlesRef.current = particles
  }, [])

  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h))
    gradient.addColorStop(0, '#1a1f2e')
    gradient.addColorStop(0.5, '#121826')
    gradient.addColorStop(1, '#0a0e17')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    ctx.strokeStyle = 'rgba(108, 92, 231, 0.03)'
    ctx.lineWidth = 1
    const gridSize = 60
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }

    particlesRef.current.forEach(particle => {
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.fill()

      if (particle.size > 2) {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
        ctx.fillStyle = particle.color.replace(/[\d.]+\)$/, '0.05)')
        ctx.fill()
      }

      particle.x += particle.speedX
      particle.y += particle.speedY

      if (particle.x < 0 || particle.x > w) particle.speedX *= -1
      if (particle.y < 0 || particle.y > h) particle.speedY *= -1
    })

    animFrameRef.current = requestAnimationFrame(drawParticles)
  }, [])

  /* ── Confetti System ───────────────────────────────── */
  const createConfetti = useCallback(() => {
    const colors = ['#6c5ce7', '#00cec9', '#fdcb6e', '#00b894', '#ff7675', '#a29bfe', '#55efc4', '#ffeaa7']
    const pieces: ConfettiPiece[] = []
    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * window.innerWidth,
        y: -Math.random() * 200,
        w: Math.random() * 8 + 4,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        speedX: (Math.random() - 0.5) * 4,
        speedY: Math.random() * 3 + 2,
        rotationSpeed: (Math.random() - 0.5) * 10
      })
    }
    confettiRef.current = pieces
  }, [])

  const drawConfetti = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pieces = confettiRef.current
    if (pieces.length === 0) return

    pieces.forEach(p => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()

      p.x += p.speedX
      p.y += p.speedY
      p.rotation += p.rotationSpeed
      p.speedY += 0.05

      if (p.y > canvas.height + 50) {
        p.y = -20
        p.x = Math.random() * canvas.width
        p.speedY = Math.random() * 3 + 2
      }
    })

    confettiAnimRef.current = requestAnimationFrame(drawConfetti)
  }, [])

  const startConfetti = useCallback(() => {
    createConfetti()
    drawConfetti()
  }, [createConfetti, drawConfetti])

  const stopConfetti = useCallback(() => {
    cancelAnimationFrame(confettiAnimRef.current)
    confettiRef.current = []
  }, [])

  /* ── Game Logic ────────────────────────────────────── */
  const createCards = useCallback(() => {
    const selectedFruits = FRUITS.slice(0, TOTAL_PAIRS)
    const shuffled = shuffle([...selectedFruits, ...selectedFruits])
    const newCards: CardData[] = shuffled.map((fruit, index) => ({
      fruit,
      index,
      flipped: false,
      matched: false
    }))
    setCards(newCards)
    setMatchesFound(0)
    matchesFoundRef.current = 0
    setFirstCard(null)
    firstCardRef.current = null
    setSecondCard(null)
    secondCardRef.current = null
    setLockBoard(false)
    lockBoardRef.current = false
    setCurrentWin(0)
    currentWinRef.current = 0
    setLastMatchIndex(null)
  }, [shuffle])

  const resetTurn = useCallback(() => {
    setFirstCard(null)
    firstCardRef.current = null
    setSecondCard(null)
    secondCardRef.current = null
    setLockBoard(false)
    lockBoardRef.current = false
  }, [])

  const showMatchAnimation = useCallback((amount: number) => {
    setMatchPopupAmount(amount)
    setShowMatchPopup(true)
    if (matchPopupTimeoutRef.current) clearTimeout(matchPopupTimeoutRef.current)
    matchPopupTimeoutRef.current = setTimeout(() => {
      setShowMatchPopup(false)
    }, 1500)
  }, [])

  const handleCardClick = useCallback((index: number) => {
    if (!gameStarted) return
    if (lockBoardRef.current) return

    const clickedCard = cards[index]
    if (!clickedCard) return
    if (clickedCard.flipped || clickedCard.matched) return

    setCards(prev => {
      const newCards = [...prev]
      newCards[index] = { ...newCards[index], flipped: true }
      return newCards
    })

    if (firstCardRef.current === null) {
      setFirstCard(index)
      firstCardRef.current = index
      return
    }

    setSecondCard(index)
    secondCardRef.current = index
    setLockBoard(true)
    lockBoardRef.current = true

    const firstIdx = firstCardRef.current
    const firstFruit = cards[firstIdx]?.fruit.name
    const secondFruit = clickedCard.fruit.name

    if (firstFruit === secondFruit) {
      setCards(prev => {
        const newCards = [...prev]
        if (firstIdx !== null) newCards[firstIdx] = { ...newCards[firstIdx], matched: true }
        newCards[index] = { ...newCards[index], matched: true }
        return newCards
      })

      setLastMatchIndex(index)

      setMatchesFound(prev => {
        const newCount = prev + 1
        matchesFoundRef.current = newCount

        setCurrentWin(prevWin => {
          const winAmount = Math.round(currentBetRef.current * 0.15)
          const newWin = prevWin + winAmount
          currentWinRef.current = newWin
          showMatchAnimation(winAmount)

          if (newCount === TOTAL_PAIRS) {
            setPlayerBalance(prevBal => {
              const newBal = prevBal + newWin
              playerBalanceRef.current = newBal
              return newBal
            })
            setTimeout(() => {
              setShowResult(true)
              startConfetti()
            }, 1200)
          }

          return newWin
        })

        return newCount
      })

      resetTurn()
    } else {
      setTimeout(() => {
        setCards(prev => {
          const newCards = [...prev]
          if (firstIdx !== null) newCards[firstIdx] = { ...newCards[firstIdx], flipped: false }
          newCards[index] = { ...newCards[index], flipped: false }
          return newCards
        })
        resetTurn()
      }, 1200)
    }
  }, [gameStarted, cards, resetTurn, showMatchAnimation, startConfetti])

  /* ── Actions ───────────────────────────────────────── */
  const handleStartAdventure = useCallback(() => {
    setShowWelcome(false)
    setTimeout(() => { setShowBet(true) }, 500)
  }, [])

  // CORRECTION : Quand on ouvre les règles, on se souvient si on était en jeu
  const handleToggleRules = useCallback(() => {
    if (showGame) {
      // On est en train de jouer, on mémorise et on cache le jeu
      setWasInGameBeforeRules(true)
      setShowGame(false)
    } else {
      setWasInGameBeforeRules(false)
    }
    setShowRules(true)
    setShowBet(false)
  }, [showGame])

  // CORRECTION : Quand on ferme les règles, on restaure le bon état
  const handleHideRules = useCallback(() => {
    setShowRules(false)
    if (wasInGameBeforeRules) {
      // On était en jeu avant d'ouvrir les règles, on retourne au jeu
      setShowGame(true)
      setShowBet(false)
    } else {
      // On était sur la section mise, on y retourne
      setShowBet(true)
      setShowGame(false)
    }
    setWasInGameBeforeRules(false)
  }, [wasInGameBeforeRules])

  const handleBackToMenu = useCallback(() => {
    setShowGame(false)
    setShowBet(true)
    setGameStarted(false)
    setWasInGameBeforeRules(false)
    stopConfetti()
  }, [stopConfetti])

  const handleConfirmBet = useCallback(() => {
    const betValue = parseInt(betInputRef.current?.value ?? '')
    if (!betValue || isNaN(betValue)) {
      alert('Veuillez entrer un montant de mise valide')
      return
    }
    if (betValue < 100) {
      alert('La mise minimum est de 100 XOF')
      return
    }
    if (betValue > 1000) {
      alert('La mise maximum est de 1,000 XOF')
      return
    }
    if (betValue > playerBalanceRef.current) {
      alert(`Solde insuffisant ! Votre solde est de ${formatXOF(playerBalanceRef.current)} XOF`)
      return
    }

    setIsProcessingBet(true)

    setTimeout(() => {
      setCurrentBet(betValue)
      currentBetRef.current = betValue
      setPlayerBalance(prev => {
        const newBal = prev - betValue
        playerBalanceRef.current = newBal
        return newBal
      })
      setShowBet(false)
      setShowGame(true)
      setGameStarted(true)
      setWasInGameBeforeRules(false)
      createCards()
      if (betInputRef.current) betInputRef.current.value = ''
      setIsProcessingBet(false)
    }, 800)
  }, [formatXOF, createCards])

  const handlePlayAgain = useCallback(() => {
    setShowResult(false)
    setShowGame(false)
    setShowBet(true)
    setGameStarted(false)
    setWasInGameBeforeRules(false)
    stopConfetti()
  }, [stopConfetti])

  /* ── Effects ───────────────────────────────────────── */
  useEffect(() => {
    resizeCanvas()
    createParticles()
    drawParticles()

    const handleResize = () => {
      resizeCanvas()
      createParticles()
    }
    window.addEventListener('resize', handleResize)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showGame) {
        setShowGame(false)
        setShowBet(true)
        setGameStarted(false)
        setWasInGameBeforeRules(false)
        stopConfetti()
      }
      if (e.key === 'Enter' && showBet && betInputRef.current?.value) {
        handleConfirmBet()
      }
      if (e.key === 'r' || e.key === 'R') {
        if (showRules) {
          handleHideRules()
        } else if (showBet || showGame) {
          handleToggleRules()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(animFrameRef.current)
      cancelAnimationFrame(confettiAnimRef.current)
      if (matchPopupTimeoutRef.current) clearTimeout(matchPopupTimeoutRef.current)
    }
  }, [drawParticles, createParticles, resizeCanvas, showGame, showBet, showRules, handleConfirmBet, stopConfetti, handleToggleRules, handleHideRules])

  useEffect(() => { createCards() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen font-['Poppins',sans-serif] text-white overflow-x-hidden bg-[#0a0e17]">
      
      {/* Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-[-1]" />

      {/* Match Popup */}
      {showMatchPopup && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3000] pointer-events-none">
          <div className="bg-gradient-to-br from-emerald-500/95 to-emerald-600/95 backdrop-blur-xl px-8 py-5 rounded-2xl shadow-[0_0_40px_rgba(0,184,148,0.6),0_20px_40px_rgba(0,0,0,0.3)] border border-white/20 flex items-center gap-3 animate-[bounce_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
            <span className="text-3xl animate-[pulse_0.5s_ease-in-out_infinite_alternate]">✨</span>
            <span className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-lg">+{formatXOF(matchPopupAmount)} XOF</span>
          </div>
        </div>
      )}

      {/* Welcome Screen */}
      <div className={`fixed inset-0 bg-[#0a0e17]/97 backdrop-blur-xl flex flex-col items-center justify-center z-[1000] p-8 text-center transition-all duration-800 ${!showWelcome ? 'opacity-0 pointer-events-none -translate-y-8' : 'opacity-100 translate-y-0'}`}>
        
        {/* Logo */}
        <div className="relative mb-10">
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(108,92,231,0.3),0_20px_40px_rgba(108,92,231,0.3)] animate-[float_4s_ease-in-out_infinite] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rotate-45 -top-1/2 -left-1/2 w-[200%] h-[200%] animate-[shimmer_3s_ease-in-out_infinite]" />
            <CubeIcon size={50} />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[radial-gradient(circle,rgba(108,92,231,0.3)_0%,transparent_70%)] rounded-full z-[-1] animate-[pulse_3s_ease-in-out_infinite]" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 tracking-[4px] bg-gradient-to-r from-white via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(108,92,231,0.3)]">
          MEMO POP
        </h1>
        
        <p className="text-base sm:text-lg text-white/75 mb-10 max-w-[550px] leading-relaxed font-light px-5">
          Testez votre memoire, defiez vos limites et multipliez vos gains avec cette experience de jeu immersive et elegante.
        </p>

        <button
          onClick={handleStartAdventure}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-bold rounded-2xl shadow-[0_10px_25px_rgba(108,92,231,0.4)] hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(108,92,231,0.5)] active:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 text-lg tracking-wide"
        >
          <PlayIcon />
          Commencer l&apos;Aventure
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[1200px] mx-auto px-5 py-6 relative z-10 flex flex-col items-center justify-center min-h-screen">
        
        {/* Balance Section - Visible quand bet, rules ou game est actif */}
        {(showBet || showRules || showGame) && (
          <div className="w-full max-w-[650px] bg-white/[0.06] backdrop-blur-2xl rounded-3xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-white/[0.08] shadow-[0_25px_50px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-purple-500 before:to-cyan-400">
            
            <div>
              <div className="text-[11px] text-white/50 uppercase tracking-[2px] font-semibold mb-1">Votre Solde</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 flex items-center gap-2">
                {formatXOF(playerBalance)}
                <span className="text-sm font-bold text-yellow-400 tracking-[1px]">XOF</span>
              </div>
            </div>

            <button
              onClick={handleToggleRules}
              className="px-5 py-2.5 bg-white/[0.06] border-2 border-white/[0.12] text-white rounded-2xl font-semibold text-sm hover:bg-white/[0.12] hover:border-cyan-400 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
            >
              <BookIcon />
              Voir les Regles
            </button>
          </div>
        )}

        {/* Rules Section */}
        {showRules && (
          <div className="w-full max-w-[650px] bg-white/[0.06] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 mb-6 border border-white/[0.08] shadow-[0_25px_50px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-purple-500 before:to-cyan-400 animate-[slideUp_0.5s_ease]">
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-6 flex items-center justify-center gap-2.5">
              <LayersIcon />
              Regles du Jeu
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[
                { icon: <MonitorIcon />, title: 'Memoire', desc: 'Retournez les cartes deux par deux pour trouver les paires identiques. Votre memoire est votre atout principal.' },
                { icon: <MedalIcon />, title: 'Gains', desc: 'Chaque paire trouvee augmente vos gains de 15% de votre mise initiale. Toutes les paires = victoire complete !' },
                { icon: <ClockIcon />, title: 'Temps', desc: 'Prenez votre temps, il n\'y a pas de limite. Concentrez-vous pour maximiser vos chances de gagner.' },
                { icon: <TrophyIcon />, title: 'Objectif', desc: 'Trouvez les 8 paires de cartes pour remporter le maximum de gains. La victoire est a portee de memoire !' }
              ].map((rule, i) => (
                <div key={i} className="bg-white/[0.04] rounded-2xl p-5 flex items-start gap-4 border border-white/[0.05] hover:bg-white/[0.08] hover:border-purple-500/30 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_15px_rgba(108,92,231,0.4)]">
                    {rule.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1.5">{rule.title}</h3>
                    <p className="text-sm text-white/65 leading-relaxed font-light">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleHideRules} className="mx-auto flex items-center gap-2 bg-transparent border-none text-purple-300 font-semibold text-sm cursor-pointer hover:text-cyan-400 hover:bg-cyan-400/10 px-5 py-2.5 rounded-xl transition-all duration-300">
              <ChevronUpIcon />
              Masquer les regles
            </button>
          </div>
        )}

        {/* Bet Section - Ne s'affiche PAS si le jeu est en cours */}
        {showBet && !showGame && (
          <div className="w-full max-w-[650px] bg-white/[0.06] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 mb-6 border border-white/[0.08] shadow-[0_25px_50px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-purple-500 before:to-cyan-400">
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-6 flex items-center justify-center gap-2.5">
              <MedalIcon />
              Entrez Votre Mise
            </h2>

            <div className="mb-6">
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 z-10">
                  <CreditCardIcon />
                </span>
                <input
                  type="number"
                  ref={betInputRef}
                  placeholder="Entrez votre mise (100-1000 XOF)"
                  min="100"
                  max="1000"
                  step="50"
                  className="w-full pl-14 pr-5 py-4 rounded-2xl border-2 border-white/[0.1] bg-white/[0.05] text-white text-center font-semibold text-base outline-none transition-all duration-300 focus:border-cyan-400 focus:shadow-[0_0_0_4px_rgba(0,206,201,0.15)] focus:bg-white/[0.08] placeholder:text-white/40"
                />
              </div>
              <div className="flex justify-between text-xs text-white/50 font-semibold px-1">
                <span>Minimum: 100 XOF</span>
                <span>Maximum: 1,000 XOF</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleConfirmBet}
                disabled={isProcessingBet}
                className="flex-1 px-8 py-3.5 bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-bold rounded-2xl shadow-[0_10px_25px_rgba(108,92,231,0.4)] hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(108,92,231,0.5)] active:-translate-y-0.5 disabled:opacity-85 disabled:pointer-events-none transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isProcessingBet ? (
                  <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <DiceIcon />
                    Confirmer & Jouer
                  </>
                )}
              </button>
              <button
                onClick={handleBackToMenu}
                className="flex-1 px-8 py-3.5 bg-white/[0.06] border-2 border-white/[0.12] text-white font-bold rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:bg-white/[0.12] hover:border-cyan-400 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon />
                Retour
              </button>
            </div>
          </div>
        )}

        {/* Game Section - Ne s'affiche PAS si les règles ou la mise sont visibles */}
        {showGame && !showRules && !showBet && (
          <div className="w-full flex flex-col items-center animate-[fadeInUp_0.8s_cubic-bezier(0.34,1.56,0.64,1)]">
            
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 bg-gradient-to-r from-white via-purple-300 to-cyan-300 bg-clip-text text-transparent tracking-[3px] text-center">
              MEMO POP
            </h1>

            {/* Game Header */}
            <div className="w-full max-w-[650px] flex gap-4 sm:gap-5 mb-7 bg-white/[0.06] backdrop-blur-2xl p-4 sm:p-5 rounded-3xl border border-white/[0.08] shadow-[0_25px_50px_rgba(0,0,0,0.4)] overflow-x-auto scrollbar-thin">
              {[
                { label: 'Mise Actuelle', value: formatXOF(currentBet), color: 'text-cyan-400', badge: 'XOF' },
                { label: 'Gains Actuels', value: formatXOF(currentWin), color: 'text-emerald-400', badge: 'XOF' },
                { label: 'Paires Trouvees', value: `${matchesFound}/${TOTAL_PAIRS}`, color: 'text-white', badge: null }
              ].map((info, i) => (
                <div key={i} className="flex flex-col items-center flex-shrink-0 min-w-[130px] sm:min-w-[150px] p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-purple-500/20 transition-all duration-300">
                  <div className="text-[10px] sm:text-[11px] text-white/55 uppercase tracking-[2px] font-semibold mb-1.5 text-center whitespace-nowrap">{info.label}</div>
                  <div className={`text-xl sm:text-2xl font-extrabold ${info.color} text-center whitespace-nowrap flex items-center gap-1.5`}>
                    {info.value}
                    {info.badge && (
                      <span className="text-[10px] sm:text-[11px] bg-yellow-400/15 text-yellow-400 px-2 py-0.5 rounded-lg font-bold tracking-[0.5px]">{info.badge}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Cards Grid */}
            <div className="w-full max-w-[650px] grid grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 perspective-[1200px] mb-10 p-2.5">
              {cards.map((card, index) => (
                <div
                  key={index}
                  onClick={() => handleCardClick(index)}
                  className={`
                    aspect-square cursor-pointer relative rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-all duration-700
                    hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:scale-[1.03]
                    ${card.flipped ? 'rotate-y-180 cursor-default hover:rotate-y-180 hover:-translate-y-0.5' : ''}
                    ${card.matched ? 'pointer-events-none animate-[matchedPulse_2s_ease-in-out_infinite]' : ''}
                    ${lastMatchIndex === index && card.matched ? 'animate-[matchedPulse_2s_ease-in-out_infinite,matchBounce_0.6s_cubic-bezier(0.34,1.56,0.64,1)]' : ''}
                  `}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: card.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Card Back */}
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      background: 'linear-gradient(145deg, #6c5ce7, #5b4fcf)',
                      border: '2px solid rgba(255,255,255,0.1)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 20px rgba(0,0,0,0.3)'
                    }}
                  >
                    <div className="absolute inset-2 border-2 border-dashed border-white/15 rounded-lg" />
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]" />
                    <div className="w-[40%] h-[40%] opacity-70">
                      <CubeIcon size={40} />
                    </div>
                    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/[0.08] to-transparent rotate-45 animate-[cardShine_4s_ease-in-out_infinite]" />
                  </div>

                  {/* Card Front */}
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: card.matched
                        ? 'linear-gradient(145deg, #00b894, #00a085)'
                        : 'linear-gradient(145deg, #2d3436, #1e2229)',
                      border: card.matched ? '2px solid rgba(0,184,148,0.3)' : '2px solid rgba(255,255,255,0.08)',
                      boxShadow: card.matched
                        ? 'inset 0 0 20px rgba(0,0,0,0.3), 0 0 20px rgba(0,184,148,0.3)'
                        : 'inset 0 0 20px rgba(0,0,0,0.5)'
                    }}
                  >
                    <img
                      src={card.fruit.src}
                      alt={card.fruit.name}
                      className="w-[65%] sm:w-[70%] md:w-[75%] h-[65%] sm:h-[70%] md:h-[75%] object-contain pointer-events-none transition-transform duration-300 hover:scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                      draggable={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result Modal */}
      <div className={`fixed inset-0 bg-[#0a0e17]/95 backdrop-blur-xl flex items-center justify-center z-[2000] transition-opacity duration-500 ${showResult ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-[90%] max-w-[480px] bg-white/[0.06] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 text-center border border-white/[0.1] shadow-[0_25px_50px_rgba(0,0,0,0.4),0_0_60px_rgba(108,92,231,0.2)] relative overflow-hidden transition-all duration-600 ${showResult ? 'translate-y-0 scale-100' : 'translate-y-16 scale-90'}`}>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-400" />

          <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(253,203,110,0.4),0_0_0_4px_rgba(253,203,110,0.1)] animate-[trophyBounce_1s_cubic-bezier(0.34,1.56,0.64,1)]">
            <BigTrophyIcon />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Felicitations !</h2>
          <p className="text-white/75 text-sm sm:text-base mb-5 leading-relaxed font-light">
            Vous avez trouve toutes les paires et demontre une memoire exceptionnelle !
          </p>

          <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 my-5 drop-shadow-[0_0_30px_rgba(0,184,148,0.4)] animate-[prizeGlow_2s_ease-in-out_infinite]">
            {formatXOF(currentWin)} <span className="text-xl font-semibold ml-2">XOF</span>
          </div>
          <p className="text-white/75 text-sm mb-6 font-light">Vos gains ont ete ajoutes a votre solde.</p>

          <button onClick={handlePlayAgain} className="w-full px-8 py-3.5 bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-bold rounded-2xl shadow-[0_10px_25px_rgba(108,92,231,0.4)] hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(108,92,231,0.5)] active:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 mb-4">
            <PlayIcon />
            Rejouer
          </button>

          <button onClick={handlePlayAgain} className="w-full px-8 py-3.5 bg-white/[0.06] border-2 border-white/[0.12] text-white font-bold rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:bg-white/[0.12] hover:border-cyan-400 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
            <HomeIcon />
            Retour au Menu
          </button>
        </div>
      </div>
    </div>
  )
}