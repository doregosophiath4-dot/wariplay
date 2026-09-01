'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
    <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
    <path d="M6 18a4 4 0 0 1-1.967-.516" />
    <path d="M19.967 17.484A4 4 0 0 1 18 18" />
  </svg>
)

const CoinsIcon = ({ className = "text-orange-400" }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const QuestionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const TrophyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const KeyboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M6 8h.01" />
    <path d="M10 8h.01" />
    <path d="M14 8h.01" />
    <path d="M18 8h.01" />
    <path d="M8 12h.01" />
    <path d="M12 12h.01" />
    <path d="M16 12h.01" />
    <path d="M6 16h.01" />
    <path d="M10 16h.01" />
    <path d="M14 16h.01" />
    <path d="M18 16h.01" />
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ForwardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="13 17 18 12 13 7" />
    <polyline points="6 17 11 12 6 7" />
  </svg>
)

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const CrownIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 14h14v2H5v-2z" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const BookOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const WarningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const RandomIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
)

/* ═══════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════ */

const WORD_LIST = [
  'ordinateur', 'programmation', 'developpeur', 'algorithm', 'internet',
  'javascript', 'application', 'interface', 'systeme', 'technologie',
  'intelligence', 'artificielle', 'blockchain', 'cryptographie', 'authentification',
  'virtualisation', 'containerisation', 'microservices', 'architecture', 'framework'
]

const FALLBACK_WORDS = ['ordinateur', 'programmation', 'developpeur']

const CONFETTI_COLORS = ['#FF3366', '#FF9933', '#FFCC00', '#33CC66', '#3399FF', '#9933FF']

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
  alpha: number
  pulseSpeed: number
  pulseOffset: number
  rotation: number
  rotationSpeed: number

  constructor(width: number, height: number) {
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.size = Math.random() * 4 + 1.5
    this.speedX = (Math.random() - 0.5) * 0.6
    this.speedY = (Math.random() - 0.5) * 0.6
    this.color = this.getRandomColor()
    this.alpha = Math.random() * 0.5 + 0.3
    this.pulseSpeed = Math.random() * 0.03 + 0.01
    this.pulseOffset = Math.random() * Math.PI * 2
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 0.02
  }

  private getRandomColor(): string {
    const colors = ['#FF3366', '#FF9933', '#3399FF', '#33CC66', '#9933FF', '#FFCC00']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  update(width: number, height: number) {
    this.x += this.speedX
    this.y += this.speedY
    this.rotation += this.rotationSpeed
    if (this.x > width + 20) this.x = -20
    else if (this.x < -20) this.x = width + 20
    if (this.y > height + 20) this.y = -20
    else if (this.y < -20) this.y = height + 20
    this.alpha = 0.3 + Math.sin(Date.now() * this.pulseSpeed + this.pulseOffset) * 0.3
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    ctx.beginPath()
    const shape = Math.floor(Math.abs(this.x + this.y) % 3)
    if (shape === 0) ctx.arc(0, 0, this.size, 0, Math.PI * 2)
    else if (shape === 1) ctx.rect(-this.size, -this.size, this.size * 2, this.size * 2)
    else { ctx.moveTo(0, -this.size); ctx.lineTo(this.size, this.size); ctx.lineTo(-this.size, this.size); ctx.closePath() }
    ctx.fillStyle = this.color
    ctx.globalAlpha = this.alpha
    ctx.fill()
    ctx.shadowColor = this.color
    ctx.shadowBlur = 15
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.restore()
  }
}

type Screen = 'bet' | 'game' | 'result'

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function AnaMind() {
  const [balance, setBalance] = useState(1000)
  const [currentBet, setCurrentBet] = useState(0)
  const [betMultiplier, setBetMultiplier] = useState(1)
  const [currentWord, setCurrentWord] = useState('')
  const [shuffledWord, setShuffledWord] = useState('')
  const [timeLeft, setTimeLeft] = useState(30)
  const [userInput, setUserInput] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [currentScreen, setCurrentScreen] = useState<Screen>('bet')
  const [isWin, setIsWin] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [anagramLoading, setAnagramLoading] = useState(false)
  const [shakeAnagram, setShakeAnagram] = useState(false)
  const [scorePop, setScorePop] = useState(false)

  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animFrameRef = useRef<number>(0)
  const balanceRef = useRef(balance)
  const currentWordRef = useRef(currentWord)
  const userInputRef = useRef<HTMLInputElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })

  useEffect(() => { balanceRef.current = balance }, [balance])
  useEffect(() => { currentWordRef.current = currentWord }, [currentWord])

  const formatNumber = useCallback((num: number): string => {
    return num.toLocaleString('fr-FR')
  }, [])

  /* ── Canvas ────────────────────────────────────────── */
  const animateCosmicBackground = useCallback(() => {
    const canvas = bgCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    const time = Date.now() * 0.001

    const gradient = ctx.createLinearGradient(
      w * 0.5 + Math.sin(time * 0.3) * 200, h * 0.5 + Math.cos(time * 0.3) * 200,
      w * 0.5 + Math.cos(time * 0.4) * 200, h * 0.5 + Math.sin(time * 0.4) * 200
    )
    gradient.addColorStop(0, '#1a0a2e')
    gradient.addColorStop(0.3, '#16213e')
    gradient.addColorStop(0.6, '#0f3460')
    gradient.addColorStop(1, '#1a0a2e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.lineWidth = 1
    const gridSize = 50
    for (let x = 0; x < w; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
    for (let y = 0; y < h; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }

    for (let i = 0; i < 3; i++) {
      const orbitX = w * 0.5 + Math.cos(time * 0.5 + i * 2.1) * w * 0.3
      const orbitY = h * 0.5 + Math.sin(time * 0.7 + i * 1.7) * h * 0.3
      const orbitGrad = ctx.createRadialGradient(orbitX, orbitY, 0, orbitX, orbitY, 250)
      const colors = ['rgba(255, 51, 102, 0.08)', 'rgba(51, 153, 255, 0.08)', 'rgba(51, 204, 102, 0.08)']
      orbitGrad.addColorStop(0, colors[i])
      orbitGrad.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(orbitX, orbitY, 250, 0, Math.PI * 2)
      ctx.fillStyle = orbitGrad
      ctx.fill()
    }

    particlesRef.current.forEach(particle => { particle.update(w, h); particle.draw(ctx) })

    const particles = particlesRef.current
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 120) {
          ctx.beginPath()
          const alpha = 0.15 * (1 - distance / 120)
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.lineWidth = 0.5
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }

    const mx = mousePos.current.x
    const my = mousePos.current.y
    if (mx > 0 && my > 0) {
      const mouseGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 150)
      mouseGrad.addColorStop(0, 'rgba(255, 153, 51, 0.05)')
      mouseGrad.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(mx, my, 150, 0, Math.PI * 2)
      ctx.fillStyle = mouseGrad
      ctx.fill()
    }

    animFrameRef.current = requestAnimationFrame(animateCosmicBackground)
  }, [])

  /* ── Utilitaires ───────────────────────────────────── */
  const shuffleWord = useCallback((word: string): string => {
    const arr = word.split('')
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]] }
    return arr.join('')
  }, [])

  const fetchWord = useCallback(async (): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].toLowerCase()
  }, [])

  /* ── Timer ──────────────────────────────────────────── */
  const clearTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    setTimeLeft(30)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => { const newTime = prev - 1; if (newTime <= 0) { clearTimer(); setTimeout(() => endGame(false), 0) }; return newTime })
    }, 1000)
  }, [clearTimer])

  /* ── Logique du jeu ────────────────────────────────── */
  const nextWord = useCallback(async () => {
    setAnagramLoading(true)
    try {
      const word = await fetchWord()
      let shuffled: string
      do { shuffled = shuffleWord(word) } while (shuffled === word)
      setCurrentWord(word)
      setShuffledWord(shuffled)
      setUserInput('')
      setMessage({ text: '', type: '' })
    } catch {
      const fallback = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
      let shuffled: string
      do { shuffled = shuffleWord(fallback) } while (shuffled === fallback)
      setCurrentWord(fallback)
      setShuffledWord(shuffled)
      setUserInput('')
      setMessage({ text: '', type: '' })
    } finally { setAnagramLoading(false) }
  }, [fetchWord, shuffleWord])

  const checkAnswer = useCallback(() => {
    const input = userInput.trim().toLowerCase()
    if (!input) { setMessage({ text: 'Veuillez entrer une reponse !', type: 'error' }); return }
    if (input === currentWordRef.current) {
      setMessage({ text: `Excellent ! Le mot etait "${currentWordRef.current.toUpperCase()}"`, type: 'success' })
      endGame(true)
    } else {
      setMessage({ text: 'Incorrect ! Essayez encore...', type: 'error' })
      setShakeAnagram(true)
      setTimeout(() => setShakeAnagram(false), 600)
    }
  }, [userInput])

  const endGame = useCallback((won: boolean) => {
    clearTimer()
    setIsWin(won)
    let winnings = 0
    if (won) {
      winnings = Math.floor(currentBet * betMultiplier)
      setBalance(prev => { const nb = prev + winnings; balanceRef.current = nb; return nb })
      setScorePop(true)
      setTimeout(() => setScorePop(false), 1000)
    }
    setCurrentScreen('result')
  }, [clearTimer, currentBet, betMultiplier])

  const startGame = useCallback(() => {
    const bet = parseInt(String(currentBet)) || 0
    if (bet < 10) { setMessage({ text: 'La mise minimum est de 10 jetons !', type: 'error' }); return }
    if (bet > balance) { setMessage({ text: 'Solde insuffisant !', type: 'error' }); return }
    setBalance(prev => { const nb = prev - bet; balanceRef.current = nb; return nb })
    setCurrentScreen('game')
    startTimer()
    nextWord()
  }, [currentBet, balance, startTimer, nextWord])

  const handleBetChange = useCallback((value: string) => {
    const bet = parseInt(value) || 0
    let newBet = bet
    if (bet > balanceRef.current) newBet = balanceRef.current
    if (bet < 10 && value !== '') newBet = 10
    setCurrentBet(newBet)
    if (newBet >= 10 && newBet <= 49) setBetMultiplier(1.5)
    else if (newBet >= 50 && newBet <= 99) setBetMultiplier(2.2)
    else if (newBet >= 100 && newBet <= 199) setBetMultiplier(3)
    else if (newBet >= 200) setBetMultiplier(4)
    else setBetMultiplier(0)
  }, [])

  const setMaxBet = useCallback(() => { handleBetChange(String(balanceRef.current)) }, [handleBetChange])

  const showBetScreen = useCallback(() => {
    setCurrentScreen('bet')
    const bet = Math.min(50, balance)
    setCurrentBet(bet)
    if (bet >= 10 && bet <= 49) setBetMultiplier(1.5)
    else if (bet >= 50 && bet <= 99) setBetMultiplier(2.2)
    else if (bet >= 100 && bet <= 199) setBetMultiplier(3)
    else if (bet >= 200) setBetMultiplier(4)
  }, [balance])

  /* ── Confettis ──────────────────────────────────────── */
  const createConfetti = useCallback(() => {
    const count = 100
    const shapes = ['circle', 'square', 'triangle']
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div')
      const size = Math.random() * 10 + 5
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      const startX = Math.random() * 100
      let borderRadius = '50%'
      if (shape === 'square') borderRadius = '2px'
      else if (shape === 'triangle') { confetti.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)'; borderRadius = '0' }
      confetti.style.cssText = `position:fixed;width:${size}px;height:${size}px;background-color:${color};border-radius:${borderRadius};top:-30px;left:${startX}vw;opacity:1;z-index:9999;pointer-events:none;box-shadow:0 0 10px ${color},0 0 20px ${color};`
      document.body.appendChild(confetti)
      const duration = Math.random() * 2000 + 2000
      const horizontalMovement = (Math.random() - 0.5) * 200
      const animation = confetti.animate([
        { transform: `translateY(0) translateX(0) rotate(0deg) scale(1)`, opacity: 1 },
        { transform: `translateY(${window.innerHeight + 50}px) translateX(${horizontalMovement}px) rotate(${Math.random() * 1080}deg) scale(0.3)`, opacity: 0 }
      ], { duration, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', delay: Math.random() * 500 })
      animation.onfinish = () => { if (document.body.contains(confetti)) document.body.removeChild(confetti) }
    }
  }, [])

  /* ── Effects ────────────────────────────────────────── */
  useEffect(() => { if (currentScreen === 'result' && isWin) createConfetti() }, [currentScreen, isWin, createConfetti])

  useEffect(() => {
    const canvas = bgCanvasRef.current
    if (!canvas) return
    const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    const handleMouseMove = (e: MouseEvent) => { mousePos.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', handleMouseMove)
    for (let i = 0; i < 100; i++) particlesRef.current.push(new Particle(canvas.width, canvas.height))
    animateCosmicBackground()
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animFrameRef.current)
      clearTimer()
    }
  }, [animateCosmicBackground, clearTimer])

  useEffect(() => { if (currentScreen === 'game' && userInputRef.current) userInputRef.current.focus() }, [currentScreen])

  /* ── Derived ────────────────────────────────────────── */
  const winnings = Math.floor(currentBet * betMultiplier)
  const timerProgress = (timeLeft / 30) * 100
  const timerColor = timeLeft <= 8 ? '#FF4444' : timeLeft <= 15 ? '#FF9933' : '#3399FF'

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen font-['Poppins',sans-serif] bg-[#0a0a14] text-white overflow-x-hidden">
      
      <canvas ref={bgCanvasRef} className="fixed inset-0 w-full h-full z-[1] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] py-3 px-5 bg-[#0a0a14]/85 backdrop-blur-2xl border-b border-white/[0.08]">
        <div className="max-w-[600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#FF3366] to-[#3399FF] flex items-center justify-center text-lg text-white shadow-[0_4px_15px_rgba(255,51,102,0.3)]">
              <BrainIcon />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#FF3366] to-[#FF9933] bg-clip-text text-transparent">
              Ana Mind
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-white/[0.06] py-2 px-4 rounded-full border border-white/[0.08] text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(51,204,102,1)] animate-pulse" />
              <CoinsIcon className="!w-3.5 !h-3.5" />
              <span>{formatNumber(balance)}</span>
              <span className="text-white/40 text-xs font-normal">jetons</span>
            </div>
            <button
              onClick={() => setShowRules(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/70 flex items-center justify-center cursor-pointer hover:bg-white/[0.12] hover:text-white hover:scale-105 transition-all duration-300"
            >
              <QuestionIcon />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full max-w-[520px] mx-auto pt-24 sm:pt-28 pb-10 px-4 sm:px-5 relative z-10">

        {/* Bet Screen */}
        {currentScreen === 'bet' && (
          <div className="animate-[screenEnter_0.5s_cubic-bezier(0.22,1,0.36,1)]">
            <div className="bg-white/[0.04] rounded-3xl p-7 sm:p-9 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden backdrop-blur-xl before:absolute before:-top-1/2 before:-left-1/2 before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle_at_30%_20%,rgba(255,51,102,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(51,153,255,0.08),transparent_50%)] before:pointer-events-none before:animate-[cardGlowFloat_8s_ease-in-out_infinite]">
              
              <div className="text-center mb-7 relative z-10">
                <div className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-full bg-gradient-to-br from-[#FF9933] to-[#FF3366] flex items-center justify-center mx-auto mb-5 text-2xl sm:text-3xl text-white shadow-[0_10px_30px_rgba(255,153,51,0.3)]">
                  <CoinsIcon className="!w-8 !h-8 sm:!w-9 sm:!h-9 !text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Placez votre mise</h2>
                <p className="text-white/40 text-sm sm:text-base">Choisissez le montant a miser pour cette partie</p>
              </div>

              <div className="mb-6 relative z-10">
                <label className="block text-sm font-semibold text-white/70 mb-2.5 uppercase tracking-[1px]">Montant (XOF)</label>
                <div className="flex gap-2.5">
                  <input
                    type="number"
                    placeholder="100"
                    min="10"
                    max="1000"
                    step="50"
                    value={currentBet || ''}
                    onChange={(e) => handleBetChange(e.target.value)}
                    className="flex-1 py-4 px-5 bg-black/40 border-2 border-white/[0.08] rounded-2xl text-xl sm:text-2xl font-bold text-white outline-none transition-all duration-300 focus:border-[#3399FF] focus:shadow-[0_0_0_4px_rgba(51,153,255,0.15)]"
                  />
                  <button
                    onClick={setMaxBet}
                    className="py-4 px-5 sm:px-5.5 bg-gradient-to-r from-[#FF3366] to-[#E0245E] text-white border-none rounded-2xl font-bold text-sm cursor-pointer hover:scale-105 hover:shadow-[0_5px_20px_rgba(255,51,102,0.4)] transition-all duration-300"
                  >
                    MAX
                  </button>
                </div>
                <div className="flex justify-between items-center mt-3 text-xs text-white/40">
                  <span>Min: 10 jetons</span>
                  <span className="bg-[#FF9933]/15 py-1 px-3 rounded-full text-[#FF9933]">
                    Multiplicateur: <strong className="text-white">x{betMultiplier}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={startGame}
                className="relative z-10 w-full py-4.5 bg-gradient-to-r from-[#FF3366] to-[#3399FF] text-white border-none rounded-2xl text-lg font-bold cursor-pointer flex items-center justify-center gap-3 hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(255,51,102,0.35)] active:translate-y-0 transition-all duration-300 overflow-hidden after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent hover:after:left-full after:transition-all after:duration-600"
              >
                <span>Demarrer le jeu</span>
                <ArrowRightIcon />
              </button>

              {message.text && (
                <div className={`relative z-10 mt-5 py-3.5 px-4 rounded-2xl flex items-center gap-2.5 font-semibold text-sm animate-[alertSlide_0.4s_ease] ${
                  message.type === 'success' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/25' : 'bg-red-400/10 text-red-400 border border-red-400/25'
                }`}>
                  {message.type === 'success' ? <CheckIcon /> : <WarningIcon />}
                  <span>{message.text}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Screen */}
        {currentScreen === 'game' && (
          <div className="animate-[screenEnter_0.5s_cubic-bezier(0.22,1,0.36,1)]">
            <div className="bg-white/[0.04] rounded-3xl p-6 sm:p-7 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">

              {/* Game Top Bar */}
              <div className="flex justify-between items-center mb-7">
                <div className="flex gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-[#3399FF]/15 py-2 px-4 rounded-full text-sm font-semibold text-[#3399FF]">
                    <TrophyIcon />
                    <span>Mot mystere</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-transparent py-2 px-4 rounded-full border border-white/[0.08] text-sm text-white/70">
                    <span>Mise: <strong className="text-white">{currentBet}</strong> jetons</span>
                  </div>
                </div>

                {/* Timer Ring */}
                <div className="relative w-[60px] h-[60px]">
                  <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
                    <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <circle
                      cx="30" cy="30" r="26" fill="none" strokeWidth="3" strokeLinecap="round"
                      stroke={timerColor}
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - timerProgress / 100)}`}
                      className={`transition-all duration-500 ${timeLeft <= 8 ? 'animate-pulse' : ''}`}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-white">
                    {timeLeft}
                  </div>
                </div>
              </div>

              {/* Anagram Stage */}
              <div className={`relative my-6 py-10 px-5 bg-black/30 rounded-2xl border border-white/[0.08] text-center overflow-hidden ${shakeAnagram ? 'animate-[shake_0.5s_ease]' : ''}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(51,153,255,0.06),transparent_70%)] pointer-events-none" />
                <div className="text-xs uppercase tracking-[3px] text-white/40 mb-4">Dechiffrez ce mot</div>
                <div className={`text-3xl sm:text-4xl font-extrabold tracking-[6px] sm:tracking-[8px] text-[#3399FF] drop-shadow-[0_0_30px_rgba(51,153,255,0.4)] relative z-10 ${anagramLoading ? 'animate-pulse' : ''}`}>
                  {anagramLoading ? (
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-2 h-2 rounded-full bg-[#3399FF] animate-[dotBounce_1.2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  ) : (
                    shuffledWord ? shuffledWord.toUpperCase() : 'PRET ?'
                  )}
                </div>
                <div className="flex items-center justify-center gap-2.5 mt-5">
                  <div className="w-10 h-px bg-white/[0.08]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3399FF] shadow-[0_0_10px_rgba(51,153,255,0.8)]" />
                  <div className="w-10 h-px bg-white/[0.08]" />
                </div>
              </div>

              {/* Input Stage */}
              <div className="mb-5">
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-white/40 z-10"><KeyboardIcon /></span>
                  <input
                    ref={userInputRef}
                    type="text"
                    placeholder="Votre reponse..."
                    autoComplete="off"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') checkAnswer() }}
                    className="w-full py-4 pl-11 pr-4 bg-black/40 border-2 border-white/[0.08] rounded-2xl text-lg font-semibold text-white outline-none transition-all duration-300 focus:border-[#3399FF] focus:shadow-[0_0_0_4px_rgba(51,153,255,0.12)] placeholder:text-white/40"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button onClick={checkAnswer} className="flex-1 py-4 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-none rounded-2xl font-bold text-base cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(51,204,102,0.35)] transition-all duration-300">
                  <CheckIcon />
                  Valider
                </button>
                <button onClick={nextWord} className="flex-1 py-4 bg-white/[0.05] text-white/70 border border-white/[0.08] rounded-2xl font-semibold text-base cursor-pointer flex items-center justify-center gap-2 hover:bg-white/[0.1] hover:text-white hover:-translate-y-0.5 transition-all duration-300">
                  <ForwardIcon />
                  Passer
                </button>
              </div>

              {message.text && (
                <div className={`mt-5 py-3.5 px-4 rounded-2xl flex items-center gap-2.5 font-semibold text-sm animate-[alertSlide_0.4s_ease] ${
                  message.type === 'success' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/25' : 'bg-red-400/10 text-red-400 border border-red-400/25'
                }`}>
                  {message.type === 'success' ? <CheckIcon /> : <WarningIcon />}
                  <span>{message.text}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result Screen */}
        {currentScreen === 'result' && (
          <div className="animate-[screenEnter_0.5s_cubic-bezier(0.22,1,0.36,1)]">
            <div className="bg-white/[0.04] rounded-3xl p-8 sm:p-10 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-center relative overflow-hidden backdrop-blur-xl before:absolute before:-top-[30%] before:-left-[30%] before:w-[160%] before:h-[160%] before:bg-[radial-gradient(circle_at_50%_50%,rgba(255,153,51,0.06),transparent_60%)] before:pointer-events-none">

              {/* Result Icon */}
              <div className="relative w-[100px] h-[100px] mx-auto mb-6">
                <div className={`w-full h-full rounded-full flex items-center justify-center text-4xl sm:text-5xl relative z-10 ${isWin ? 'bg-gradient-to-br from-emerald-400 to-[#FF9933] text-white shadow-[0_10px_35px_rgba(51,204,102,0.4)]' : 'bg-gradient-to-br from-red-400 to-[#FF3366] text-white shadow-[0_10px_35px_rgba(255,68,68,0.4)]'}`}>
                  {isWin ? <CrownIcon /> : <ClockIcon />}
                </div>
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`absolute -inset-2.5 rounded-full border-2 opacity-0 animate-[ringExpand_2s_ease-out_infinite] ${isWin ? 'border-emerald-400' : 'border-red-400'}`}
                    style={{ animationDelay: `${i * 0.6}s` }}
                  />
                ))}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2.5">
                {isWin ? 'Victoire !' : 'Temps ecoule'}
              </h2>

              <p className="text-white/40 text-sm sm:text-base mb-6">
                {isWin
                  ? `Vous avez decouvert le mot "${currentWord.toUpperCase()}"`
                  : `Le mot etait "${currentWord.toUpperCase()}"`
                }
              </p>

              <div className={`py-5 px-4 rounded-2xl mb-6 flex flex-col items-center gap-1.5 ${isWin ? 'bg-emerald-400/10 border border-emerald-400/20' : 'bg-red-400/10 border border-red-400/20'}`}>
                <span className={`text-3xl sm:text-4xl font-extrabold ${isWin ? 'text-emerald-400 drop-shadow-[0_0_25px_rgba(51,204,102,0.4)]' : 'text-red-400 drop-shadow-[0_0_25px_rgba(255,68,68,0.4)]'}`}>
                  {isWin ? `+${formatNumber(winnings)}` : `-${formatNumber(currentBet)}`}
                </span>
                <span className="text-xs text-white/40 uppercase tracking-[2px]">jetons</span>
              </div>

              <div className="flex items-center justify-center gap-5 mb-6 py-4 px-4 bg-black/20 rounded-2xl">
                <div className="text-center">
                  <span className="block text-xs text-white/40 uppercase tracking-[1px] mb-1">Mise</span>
                  <span className="text-lg font-bold text-white">{formatNumber(currentBet)} jetons</span>
                </div>
                <div className="w-px h-8 bg-white/[0.08]" />
                <div className="text-center">
                  <span className="block text-xs text-white/40 uppercase tracking-[1px] mb-1">Multiplicateur</span>
                  <span className="text-lg font-bold text-white">x{betMultiplier}</span>
                </div>
              </div>

              <button
                onClick={showBetScreen}
                className="w-full py-4 bg-gradient-to-r from-[#3399FF] to-[#1A7AE0] text-white border-none rounded-2xl text-lg font-bold cursor-pointer flex items-center justify-center gap-2.5 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(51,153,255,0.35)] transition-all duration-300"
              >
                <RefreshIcon />
                Rejouer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-lg z-[1000] flex items-center justify-center p-5 transition-all duration-300"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRules(false) }}
        >
          <div className="bg-[#0f0f1e]/98 rounded-3xl p-7 sm:p-9 max-w-[500px] w-full max-h-[85vh] overflow-y-auto border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.6)] animate-[modalFadeIn_0.3s_ease]">

            <div className="flex items-center gap-4 mb-7">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF3366] to-[#3399FF] flex items-center justify-center text-xl text-white">
                <BookOpenIcon />
              </div>
              <h2 className="flex-1 text-2xl font-bold text-white">Regles du Jeu</h2>
              <button
                onClick={() => setShowRules(false)}
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/70 flex items-center justify-center cursor-pointer hover:bg-white/[0.12] hover:text-white hover:rotate-90 transition-all duration-300"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                { icon: <CoinsIcon className="!w-5 !h-5" />, title: 'Mise personnalisee', desc: 'Choisissez votre mise entre 10 et 1000 jetons. Plus la mise est elevee, plus le gain potentiel est important.' },
                { icon: <RandomIcon />, title: 'Anagrammes', desc: 'Un mot melange apparait. Trouvez le mot original en 30 secondes pour gagner.' },
                { icon: <ClockIcon />, title: 'Temps limite', desc: '30 secondes par mot. Si le temps s\'epuise, vous perdez votre mise.' },
                { icon: <ForwardIcon />, title: 'Option Passer', desc: 'Bloque ? Passez au mot suivant sans penalite.' }
              ].map((rule, i) => (
                <div key={i} className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] hover:bg-white/[0.06] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-9 h-9 rounded-full bg-[#FF9933]/20 flex items-center justify-center text-[#FF9933] mb-3">
                    {rule.icon}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{rule.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="w-full py-4 bg-gradient-to-r from-[#FF3366] to-[#3399FF] text-white border-none rounded-2xl text-base font-bold cursor-pointer flex items-center justify-center gap-2.5 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(255,51,102,0.3)] transition-all duration-300"
            >
              <CheckIcon />
              J&apos;ai compris
            </button>
          </div>
        </div>
      )}
    </div>
  )
}