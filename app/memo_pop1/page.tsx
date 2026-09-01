'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

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

const LoaderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-white">
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
)

/* ═══════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════ */

// Mapping des symboles backend vers les images frontend
const SYMBOL_TO_FRUIT: { [key: string]: { name: string; src: string } } = {
  '🍎': { name: 'pomme', src: '/img/pmo.png' },
  '🍌': { name: 'banane', src: '/img/bana.png' },
  '🍒': { name: 'mandarine', src: '/img/manda.png' },
  '🍇': { name: 'raisin', src: '/img/rsi.png' },
  '🥝': { name: 'papaye', src: '/img/ppy.png' },
  '🍉': { name: 'pasteque', src: '/img/pas.png' },
  '🍓': { name: 'tomate', src: '/img/toma.png' },
  '🍍': { name: 'ananas', src: '/img/ana.png' },
  '🥭': { name: 'mangue', src: '/img/mag.png' },
  '🍊': { name: 'orange', src: '/img/org.png' },
}

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
  fruit: { name: string; src: string }
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

interface GameMessage {
  type: string
  bet?: number
  objective?: string
  index?: number
  token?: string
}

interface PopupData {
  show: boolean
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function MemoPop() {
  useAuth()
  const router = useRouter()

  /* ── State ─────────────────────────────────────────── */
  const [playerBalance, setPlayerBalance] = useState(0)
  const [playerLives, setPlayerLives] = useState(0)
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
  const [wasInGameBeforeRules, setWasInGameBeforeRules] = useState(false)
  const [gameToken, setGameToken] = useState<string | null>(null)
  const [wsToken, setWsToken] = useState<string | null>(null)
  const [wsTimestamp, setWsTimestamp] = useState<number | null>(null)
  const [gameErrors, setGameErrors] = useState(0)
  const [gameTime, setGameTime] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [challengeName, setChallengeName] = useState('')
  const [challengeMultiplier, setChallengeMultiplier] = useState(0)
  const [challengeDescription, setChallengeDescription] = useState('')
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [showFailureModal, setShowFailureModal] = useState(false)
  const [failureReason, setFailureReason] = useState('')
  const [lostAmount, setLostAmount] = useState(0)
  const [prizeAmount, setPrizeAmount] = useState(0)
  const [completedChallengeName, setCompletedChallengeName] = useState('')
  const [completedMultiplier, setCompletedMultiplier] = useState('')
  const [failedChallengeName, setFailedChallengeName] = useState('')
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null)
  const [winConditions, setWinConditions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [timerDisplay, setTimerDisplay] = useState('00:00')
  const [gameTimerDisplay, setGameTimerDisplay] = useState('∞')
  const [errorCount, setErrorCount] = useState(0)
  const [popup, setPopup] = useState<PopupData>({ show: false, title: '', message: '', type: 'info' })
  const [wsConnected, setWsConnected] = useState(false)

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
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef(false)
  const wsConnectedRef = useRef(false)
  const pendingResolveRef = useRef<((data: any) => void) | null>(null)
  const pendingRejectRef = useRef<((error: any) => void) | null>(null)
  const gameTokenRef = useRef<string | null>(null)
  const messageQueueRef = useRef<any[]>([])
  const isProcessingQueueRef = useRef(false)
  const wsConnectionPromiseRef = useRef<Promise<void> | null>(null)
  const challengeResolveRef = useRef<((challenge: any) => void) | null>(null)
  const selectedChallengeRef = useRef<any>(null)

  useEffect(() => { playerBalanceRef.current = playerBalance }, [playerBalance])
  useEffect(() => { currentBetRef.current = currentBet }, [currentBet])
  useEffect(() => { currentWinRef.current = currentWin }, [currentWin])
  useEffect(() => { matchesFoundRef.current = matchesFound }, [matchesFound])
  useEffect(() => { firstCardRef.current = firstCard }, [firstCard])
  useEffect(() => { secondCardRef.current = secondCard }, [secondCard])
  useEffect(() => { lockBoardRef.current = lockBoard }, [lockBoard])
  useEffect(() => { gameTokenRef.current = gameToken }, [gameToken])

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

  /* ── Popup System ──────────────────────────────────── */
  const showPopup = useCallback((title: string, message: string, type: PopupData['type'] = 'info') => {
    setPopup({ show: true, title, message, type })
  }, [])

  const hidePopup = useCallback(() => {
    setPopup(prev => ({ ...prev, show: false }))
    setTimeout(() => {
      setPopup({ show: false, title: '', message: '', type: 'info' })
    }, 300)
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

  /* ── WebSocket ──────────────────────────────────────── */
  const closeWebSocket = useCallback(() => {
    wsReadyRef.current = false
    wsConnectedRef.current = false
    pendingResolveRef.current = null
    pendingRejectRef.current = null
    challengeResolveRef.current = null
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    wsConnectionPromiseRef.current = null
  }, [])

  const openWebSocket = useCallback((): Promise<void> => {
    setSelectedChallenge(null)
    selectedChallengeRef.current = null

    if (wsConnectionPromiseRef.current) {
      return wsConnectionPromiseRef.current
    }

    wsConnectionPromiseRef.current = new Promise(async (resolve, reject) => {
      closeWebSocket()
      const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
      const ws = new WebSocket(proto + window.location.host + '/ws/memo')
      wsRef.current = ws

      const timeout = setTimeout(() => {
        closeWebSocket()
        wsConnectionPromiseRef.current = null
        reject(new Error('Timeout connexion WebSocket'))
      }, 15000)

      ws.onopen = async () => {
        try {
          await initAll()
          const am = await prepareWSAuthMessage()
          ws.send(JSON.stringify(am))
        } catch (error) {
          clearTimeout(timeout)
          closeWebSocket()
          wsConnectionPromiseRef.current = null
          reject(error)
        }
      }

      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data)

          if (d.type === 'auth_success') {
            clearTimeout(timeout)
            wsReadyRef.current = true
            wsConnectedRef.current = true
            wsConnectionPromiseRef.current = null
            resolve()
            return
          }

          if (d.type === 'win_condition' && d.condition) {
            setSelectedChallenge(d.condition)
            setWinConditions([d.condition])
            selectedChallengeRef.current = d.condition
          }

          if (pendingResolveRef.current) {
            const rf = pendingResolveRef.current
            pendingResolveRef.current = null
            pendingRejectRef.current = null
            rf(d)
          }
        } catch (er) {
          clearTimeout(timeout)
          wsConnectionPromiseRef.current = null
          reject(er)
        }
      }

      ws.onerror = () => {
        clearTimeout(timeout)
        closeWebSocket()
        wsConnectionPromiseRef.current = null
        reject(new Error('Erreur WebSocket'))
      }

      ws.onclose = (event) => {
        wsReadyRef.current = false
        wsConnectedRef.current = false
        wsRef.current = null
        wsConnectionPromiseRef.current = null
        if (pendingRejectRef.current) {
          pendingRejectRef.current(new Error('WebSocket fermé'))
          pendingResolveRef.current = null
          pendingRejectRef.current = null
        }
      }
    })

    return wsConnectionPromiseRef.current
  }, [closeWebSocket])

  const sendWebSocketMessage = useCallback(async (msg: GameMessage): Promise<any> => {
    if (msg.type === 'end_game' && !msg.token) {
      return Promise.resolve({ success: false, error: 'Token invalide' })
    }

    if (wsRef.current && wsReadyRef.current) {
      return new Promise((resolve, reject) => {
        let timeout: NodeJS.Timeout | null = null

        const cleanup = () => {
          if (timeout) {
            clearTimeout(timeout)
            timeout = null
          }
          if (pendingResolveRef.current === resolve) {
            pendingResolveRef.current = null
            pendingRejectRef.current = null
          }
        }

        timeout = setTimeout(() => {
          cleanup()
          reject(new Error('Timeout'))
        }, 15000)

        pendingResolveRef.current = (d) => {
          cleanup()
          resolve(d)
        }
        pendingRejectRef.current = (er) => {
          cleanup()
          reject(er)
        }

        try {
          wsRef.current.send(JSON.stringify(msg))
        } catch (error) {
          cleanup()
          reject(error)
        }
      })
    }

    return new Promise((resolve, reject) => {
      messageQueueRef.current.push({ msg, resolve, reject })
      const checkConnection = () => {
        if (wsRef.current && wsReadyRef.current) {
          while (messageQueueRef.current.length > 0) {
            const item = messageQueueRef.current.shift()
            if (item) {
              sendWebSocketMessage(item.msg).then(item.resolve).catch(item.reject)
            }
          }
        } else {
          setTimeout(checkConnection, 100)
        }
      }
      checkConnection()
    })
  }, [])

  /* ── API Calls ──────────────────────────────────────── */
  const fetchUserBalance = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/get_lettricide_solde', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.solde !== undefined) {
          setPlayerBalance(data.solde)
          playerBalanceRef.current = data.solde
          return true
        } else if (data.error) {
          showPopup('Erreur', `Erreur lors de la récupération du solde`, 'error')
          return false
        }
      } else {
        showPopup('Erreur', 'Erreur de connexion au serveur', 'error')
        return false
      }
    } catch (error) {
      showPopup('Erreur', 'Impossible de se connecter au serveur', 'error')
      return false
    }
  }, [showPopup])

  const fetchUserLives = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/get_memo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.lives !== undefined) {
          setPlayerLives(data.lives)
          return true
        }
      }
      return false
    } catch (error) {
      return false
    }
  }, [])

  const decrementUserLives = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/decrement_memo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPlayerLives(data.remaining_lives)
          return { success: true, remaining_lives: data.remaining_lives }
        } else {
          return { success: false, error: data.error || 'Erreur de traitement' }
        }
      } else {
        return { success: false, error: 'Erreur HTTP' }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [])

  const sendBetToBackend = useCallback(async (betAmount: number) => {
    try {
      const response = await fetchWithAllTokens('/api/cherif', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bet: betAmount })
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPlayerBalance(data.new_solde)
          playerBalanceRef.current = data.new_solde
          return { success: true, data: data }
        } else {
          showPopup('Erreur', `Erreur lors de la mise`, 'error')
          return { success: false, error: data.error }
        }
      } else {
        showPopup('Erreur', 'Erreur de connexion au serveur', 'error')
        return { success: false, error: 'Erreur HTTP' }
      }
    } catch (error: any) {
      showPopup('Erreur', 'Impossible de se connecter au serveur', 'error')
      return { success: false, error: error.message }
    }
  }, [showPopup])

  /* ── Game Logic ────────────────────────────────────── */
  const createCardsFromDeck = useCallback((deck: string[]) => {
    const newCards: CardData[] = deck.map((symbol, index) => {
      const fruit = SYMBOL_TO_FRUIT[symbol] || { name: 'inconnu', src: '/img/inconnu.png' }
      return {
        fruit,
        index,
        flipped: false,
        matched: false
      }
    })
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
    setGameErrors(0)
    setErrorCount(0)
    setGameTime(0)
    setTimerDisplay('00:00')
    setGameTimerDisplay('∞')
    setTimerRunning(false)
    setIsGameOver(false)
  }, [])

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

  const clearTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (timerTimeoutRef.current) {
      clearTimeout(timerTimeoutRef.current)
      timerTimeoutRef.current = null
    }
    if (matchPopupTimeoutRef.current) {
      clearTimeout(matchPopupTimeoutRef.current)
      matchPopupTimeoutRef.current = null
    }
    setShowMatchPopup(false)
  }, [])

  const startTimer = useCallback((seconds: number) => {
    clearTimers()
    let time = seconds
    setGameTime(time)
    setTimerRunning(true)
    timerIntervalRef.current = setInterval(() => {
      time--
      setGameTime(time)
      if (selectedChallenge && selectedChallenge.timeLimit !== null && selectedChallenge.timeLimit !== undefined) {
        const timeLeft = selectedChallenge.timeLimit - time
        if (timeLeft <= 10 && timeLeft > 0) {
          setTimerDisplay(`${time}s restant`)
          setGameTimerDisplay(`${timeLeft}s`)
        } else if (timeLeft <= 0) {
          setTimerDisplay('TEMPS ÉCOULÉ!')
          setGameTimerDisplay('0s')
        } else {
          setTimerDisplay(`${time}s`)
          setGameTimerDisplay(`${timeLeft}s`)
        }
      } else {
        setTimerDisplay(`${time}s`)
        setGameTimerDisplay(`${time}s`)
      }
      if (time <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
        handleTimeout()
      }
    }, 1000)
    timerTimeoutRef.current = setTimeout(() => handleTimeout(), seconds * 1000)
  }, [clearTimers, selectedChallenge])

  const handleTimeout = useCallback(async () => {
    if (!gameStarted) return
    setTimerRunning(false)
    clearTimers()

    if (matchPopupTimeoutRef.current) {
      clearTimeout(matchPopupTimeoutRef.current)
      matchPopupTimeoutRef.current = null
    }
    setShowMatchPopup(false)

    try {
      const r = await sendWebSocketMessage({ type: 'end_game', token: gameTokenRef.current || '' })
      closeWebSocket()
      setWsConnected(false)
      setGameToken(null)
      gameTokenRef.current = null

      if (r) {
        if (r.success === false) {
          if (selectedChallenge) {
            setFailedChallengeName(selectedChallenge.name)
          }
          setFailureReason(r.reason || "Défi non accompli")
          setLostAmount(currentBetRef.current)
          setShowFailureModal(true)
        } else if (r.success === true) {
          setPlayerBalance(prev => {
            const newBal = prev + r.win
            playerBalanceRef.current = newBal
            return newBal
          })
          if (r.condition) {
            setCompletedChallengeName(r.condition.name)
            setCompletedMultiplier(`${r.condition.multiplier}x`)
          }
          setPrizeAmount(r.win)
          setShowResult(true)
          startConfetti()
        }
      }
      setGameStarted(false)
      setIsGameOver(true)
    } catch {
      setGameStarted(false)
      setIsGameOver(true)
    }
  }, [gameStarted, selectedChallenge, sendWebSocketMessage, clearTimers, startConfetti, closeWebSocket])

  const handleCardClick = useCallback(async (index: number) => {
    if (!gameStarted) {
      return
    }
    if (lockBoardRef.current) {
      return
    }
    if (!gameTokenRef.current) {
      return
    }

    const clickedCard = cards[index]

    if (!clickedCard) {
      return
    }
    if (clickedCard.flipped) {
      return
    }
    if (clickedCard.matched) {
      return
    }

    try {
      const msg: GameMessage = { type: 'click', index: index, token: gameTokenRef.current }
      const result = await sendWebSocketMessage(msg)

      if (result.error) {
        showPopup('Erreur', 'Une erreur est survenue', 'error')
        return
      }

      if (result.ignore) {
        return
      }

      if (result.flip !== undefined) {
        setCards(prev => {
          const newCards = [...prev]
          newCards[result.flip] = { ...newCards[result.flip], flipped: true }
          return newCards
        })
      }

      if (firstCardRef.current === null) {
        setFirstCard(index)
        firstCardRef.current = index
      } else if (secondCardRef.current === null && index !== firstCardRef.current) {
        setSecondCard(index)
        secondCardRef.current = index
        setLockBoard(true)
        lockBoardRef.current = true
      }

      if (result.errors !== undefined) {
        setErrorCount(result.errors)
      }

      if (result.matches !== undefined) {
        setMatchesFound(result.matches)
        matchesFoundRef.current = result.matches
        const winAmount = Math.round(currentBetRef.current * 0.15 * result.matches)
        setCurrentWin(winAmount)
        currentWinRef.current = winAmount
      }

      if (result.match === true) {
        const winAmount = Math.round(currentBetRef.current * 0.15)
        showMatchAnimation(winAmount)
        setLastMatchIndex(index)

        setCards(prev => {
          const newCards = [...prev]
          const firstIdx = firstCardRef.current
          if (firstIdx !== null) {
            newCards[firstIdx] = { ...newCards[firstIdx], matched: true }
          }
          newCards[index] = { ...newCards[index], matched: true }
          return newCards
        })

        setFirstCard(null)
        firstCardRef.current = null
        setSecondCard(null)
        secondCardRef.current = null
        setLockBoard(false)
        lockBoardRef.current = false

        if (result.matches === TOTAL_PAIRS) {
          if (!result.auto_finish) {
            const endMsg: GameMessage = { type: 'end_game', token: gameTokenRef.current }
            const endResult = await sendWebSocketMessage(endMsg)

            closeWebSocket()
            setWsConnected(false)
            setGameToken(null)
            gameTokenRef.current = null

            if (endResult.success === true) {
              setPlayerBalance(prev => {
                const newBal = prev + endResult.win
                playerBalanceRef.current = newBal
                return newBal
              })
              if (endResult.condition) {
                setCompletedChallengeName(endResult.condition.name)
                setCompletedMultiplier(`${endResult.condition.multiplier}x`)
              }
              setPrizeAmount(endResult.win)
              setShowResult(true)
              startConfetti()
              setGameStarted(false)
            } else if (endResult.success === false) {
              if (selectedChallenge) {
                setFailedChallengeName(selectedChallenge.name)
              }
              setFailureReason(endResult.reason || "Défi non accompli")
              setLostAmount(currentBetRef.current)
              setShowFailureModal(true)
              setGameStarted(false)
            }
          } else {
            closeWebSocket()
            setWsConnected(false)
            setGameToken(null)
            gameTokenRef.current = null
          }
        }
      }
      else if (result.match === false) {
        const capturedFirstIdx = firstCardRef.current
        const capturedSecondIdx = secondCardRef.current

        setTimeout(() => {
          setCards(prev => {
            const newCards = [...prev]
            if (capturedFirstIdx !== null) {
              newCards[capturedFirstIdx] = { ...newCards[capturedFirstIdx], flipped: false }
            }
            if (capturedSecondIdx !== null) {
              newCards[capturedSecondIdx] = { ...newCards[capturedSecondIdx], flipped: false }
            }
            return newCards
          })

          setFirstCard(null)
          firstCardRef.current = null
          setSecondCard(null)
          secondCardRef.current = null
          setLockBoard(false)
          lockBoardRef.current = false
        }, 1200)
      }

      if (result.auto_finish) {
        closeWebSocket()
        setWsConnected(false)
        setGameToken(null)
        gameTokenRef.current = null

        if (result.success === true) {
          setPlayerBalance(prev => {
            const newBal = prev + result.win
            playerBalanceRef.current = newBal
            return newBal
          })
          if (result.condition) {
            setCompletedChallengeName(result.condition.name)
            setCompletedMultiplier(`${result.condition.multiplier}x`)
          }
          setPrizeAmount(result.win)
          setShowResult(true)
          startConfetti()
        } else {
          if (selectedChallenge) {
            setFailedChallengeName(selectedChallenge.name)
          }
          setFailureReason(result.reason || "Défi non accompli")
          setLostAmount(currentBetRef.current)
          setShowFailureModal(true)
        }

        setGameStarted(false)
        setIsGameOver(true)
        clearTimers()
      }
    } catch (error) {
      showPopup('Erreur', 'Une erreur est survenue', 'error')
    }
  }, [gameStarted, cards, sendWebSocketMessage, selectedChallenge, clearTimers, startConfetti, resetTurn, showMatchAnimation, showPopup, closeWebSocket])

  /* ── Actions ───────────────────────────────────────── */
  const handleStartAdventure = useCallback(() => {
    setShowWelcome(false)
    setTimeout(() => { setShowBet(true) }, 500)
  }, [])

  const handleToggleRules = useCallback(() => {
    if (showGame) {
      setWasInGameBeforeRules(true)
      setShowGame(false)
    } else {
      setWasInGameBeforeRules(false)
    }
    setShowRules(true)
    setShowBet(false)
  }, [showGame])

  const handleHideRules = useCallback(() => {
    setShowRules(false)
    if (wasInGameBeforeRules) {
      setShowGame(true)
      setShowBet(false)
    } else {
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
    clearTimers()
    closeWebSocket()
    setGameToken(null)
    gameTokenRef.current = null
    setWsConnected(false)
    setSelectedChallenge(null)
    selectedChallengeRef.current = null
    if (matchPopupTimeoutRef.current) {
      clearTimeout(matchPopupTimeoutRef.current)
      matchPopupTimeoutRef.current = null
    }
    setShowMatchPopup(false)
  }, [stopConfetti, clearTimers, closeWebSocket])

  const handleConfirmBet = useCallback(async () => {
    const betValue = parseInt(betInputRef.current?.value ?? '')
    if (!betValue || isNaN(betValue)) {
      showPopup('Erreur', 'Montant de mise invalide', 'error')
      return
    }
    if (betValue < 100) {
      showPopup('Erreur', 'Mise minimum non respectée', 'error')
      return
    }
    if (betValue > 1000) {
      showPopup('Erreur', 'Mise maximum dépassée', 'error')
      return
    }
    if (betValue > playerBalanceRef.current) {
      showPopup('Erreur', `Solde insuffisant`, 'error')
      return
    }
    if (playerLives <= 0) {
      showPopup('Erreur', 'Vies insuffisantes', 'error')
      return
    }

    setIsProcessingBet(true)
    setLoadingMessage('Connexion au serveur...')
    setIsLoading(true)

    try {
      closeWebSocket()
      setSelectedChallenge(null)
      selectedChallengeRef.current = null
      setGameToken(null)
      gameTokenRef.current = null
      setWsConnected(false)

      await openWebSocket()
      setWsConnected(true)

      let attempts = 0
      while (!selectedChallengeRef.current && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      if (!selectedChallengeRef.current) {
        setIsLoading(false)
        setIsProcessingBet(false)
        showPopup('Erreur', 'Erreur de connexion au serveur', 'error')
        return
      }

      const challenge = selectedChallengeRef.current

      setLoadingMessage('Décrémentation des vies...')
      const decrementResult = await decrementUserLives()
      if (!decrementResult.success) {
        setIsLoading(false)
        setIsProcessingBet(false)
        showPopup('Erreur', `Erreur de traitement`, 'error')
        return
      }

      setLoadingMessage('Envoi de la mise...')
      const betResult = await sendBetToBackend(betValue)
      if (!betResult.success) {
        setIsLoading(false)
        setIsProcessingBet(false)
        return
      }

      setIsLoading(false)
      setIsProcessingBet(false)

      setChallengeName(challenge.name)
      let description = "Terminez le jeu"
      if (challenge.timeLimit !== null && challenge.timeLimit !== undefined) {
        description += ` en moins de ${challenge.timeLimit} secondes`
      }
      if (challenge.maxErrors === 0) {
        description += ' sans aucune erreur'
      } else if (challenge.maxErrors !== null && challenge.maxErrors !== undefined) {
        description += ` avec maximum ${challenge.maxErrors} erreur(s)`
      }
      setChallengeDescription(description)
      setChallengeMultiplier(challenge.multiplier)

      setCurrentBet(betValue)
      currentBetRef.current = betValue
      setShowChallengeModal(true)
      setShowBet(false)

      if (betInputRef.current) betInputRef.current.value = ''
    } catch (error) {
      setIsLoading(false)
      setIsProcessingBet(false)
      showPopup('Erreur', 'Une erreur est survenue', 'error')
    }
  }, [playerLives, selectedChallenge, decrementUserLives, sendBetToBackend, formatXOF, showPopup, openWebSocket, closeWebSocket])

  const handleStartChallenge = useCallback(async () => {
    if (!currentBetRef.current) {
      showPopup('Erreur', 'Erreur de configuration', 'error')
      return
    }
    if (!selectedChallenge) {
      showPopup('Erreur', 'Erreur de configuration', 'error')
      return
    }

    setShowChallengeModal(false)
    setLoadingMessage('Démarrage du jeu...')
    setIsLoading(true)

    try {
      const msg: GameMessage = {
        type: 'start_game',
        bet: currentBetRef.current,
        objective: selectedChallenge.name
      }
      const result = await sendWebSocketMessage(msg)

      if (!result || !result.deck) {
        setIsLoading(false)
        closeWebSocket()
        setWsConnected(false)
        setGameToken(null)
        gameTokenRef.current = null
        showPopup('Erreur', 'Erreur de démarrage', 'error')
        return
      }

      setIsLoading(false)

      createCardsFromDeck(result.deck)
      setGameToken(result.token)
      gameTokenRef.current = result.token
      setGameStarted(true)
      setShowGame(true)
      setTimerRunning(true)

      if (selectedChallenge.timeLimit !== null && selectedChallenge.timeLimit !== undefined) {
        startTimer(selectedChallenge.timeLimit)
      }

      setMatchesFound(0)
      matchesFoundRef.current = 0
      setCurrentWin(0)
      currentWinRef.current = 0
      setFirstCard(null)
      firstCardRef.current = null
      setSecondCard(null)
      secondCardRef.current = null
      setLockBoard(false)
      lockBoardRef.current = false
      setErrorCount(0)
      setGameErrors(0)
      setLastMatchIndex(null)
      setIsGameOver(false)

    } catch (error) {
      setIsLoading(false)
      closeWebSocket()
      setWsConnected(false)
      setGameToken(null)
      gameTokenRef.current = null
      showPopup('Erreur', 'Une erreur est survenue', 'error')
    }
  }, [selectedChallenge, sendWebSocketMessage, createCardsFromDeck, startTimer, showPopup, closeWebSocket])

  const handlePlayAgain = useCallback(() => {
    setShowResult(false)
    setShowGame(false)
    setShowBet(true)
    setGameStarted(false)
    setWasInGameBeforeRules(false)
    stopConfetti()
    clearTimers()
    setGameToken(null)
    gameTokenRef.current = null
    setSelectedChallenge(null)
    selectedChallengeRef.current = null
    setShowChallengeModal(false)
    setShowFailureModal(false)
    setIsGameOver(false)
    if (matchPopupTimeoutRef.current) {
      clearTimeout(matchPopupTimeoutRef.current)
      matchPopupTimeoutRef.current = null
    }
    setShowMatchPopup(false)
  }, [stopConfetti, clearTimers])

  const handleTryAgain = useCallback(() => {
    setShowFailureModal(false)
    setShowGame(false)
    setShowBet(true)
    setGameStarted(false)
    setWasInGameBeforeRules(false)
    stopConfetti()
    clearTimers()
    setGameToken(null)
    gameTokenRef.current = null
    setSelectedChallenge(null)
    selectedChallengeRef.current = null
    setIsGameOver(false)
    if (matchPopupTimeoutRef.current) {
      clearTimeout(matchPopupTimeoutRef.current)
      matchPopupTimeoutRef.current = null
    }
    setShowMatchPopup(false)
  }, [stopConfetti, clearTimers])

  const endGameSession = useCallback(() => {
    clearTimers()
    setGameStarted(false)
    setShowGame(false)
    setShowBet(true)
    setGameToken(null)
    gameTokenRef.current = null
    setSelectedChallenge(null)
    setShowChallengeModal(false)
    setShowFailureModal(false)
    setIsGameOver(false)
    stopConfetti()
  }, [clearTimers, stopConfetti])

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
      if (e.key === 'Escape' && showGame && gameStarted) {
        if (confirm("Voulez-vous abandonner la partie ? VOUS PERDREZ IMMÉDIATEMENT VOTRE MISE !")) {
          if (gameTokenRef.current) {
            sendWebSocketMessage({ type: 'end_game', token: gameTokenRef.current })
            endGameSession()
          } else {
            endGameSession()
          }
        }
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
      clearTimers()
      if (document.visibilityState === 'hidden') {
        closeWebSocket()
      }
    }
  }, [drawParticles, createParticles, resizeCanvas, showGame, showBet, showRules, handleConfirmBet, stopConfetti, handleToggleRules, handleHideRules, clearTimers, endGameSession, sendWebSocketMessage, gameStarted])
  // Charger le solde et les vies au démarrage
  useEffect(() => {
    const loadUserData = async () => {
      await Promise.all([fetchUserBalance(), fetchUserLives()])
    }
    loadUserData()
  }, [fetchUserBalance, fetchUserLives])

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen font-['Poppins',sans-serif] text-white overflow-x-hidden bg-[#0a0e17]">
      
      {/* Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-[-1]" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0a0e17]/90 backdrop-blur-xl flex flex-col items-center justify-center z-[5000]">
          {/* Container du spinner */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(108,92,231,0.4)] mb-6 animate-pulse">
            <LoaderIcon />
          </div>
          
          {/* Texte pulsant */}
          <p className="text-lg font-semibold text-white/90 animate-pulse">{loadingMessage}</p>
          
          {/* Barre de progression factice */}
          <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: '100%' }} />
          </div>
        </div>
      )}

      {/* Popup Stylisé (remplace alert()) */}
      {popup.show && (
        <div className="fixed inset-0 bg-[#0a0e17]/80 backdrop-blur-xl flex items-center justify-center z-[6000] animate-[fadeIn_0.2s_ease]">
          <div className={`w-[90%] max-w-[420px] bg-white/[0.08] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border shadow-[0_25px_50px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-300 animate-[slideUp_0.3s_ease]
            ${popup.type === 'error' ? 'border-red-500/40' : 
              popup.type === 'warning' ? 'border-yellow-500/40' : 
              popup.type === 'success' ? 'border-emerald-500/40' : 'border-cyan-500/40'}`}>
            
            {/* Ligne colorée en haut */}
            <div className={`absolute top-0 left-0 w-full h-1 
              ${popup.type === 'error' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 
                popup.type === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 
                popup.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 
                'bg-gradient-to-r from-cyan-500 to-purple-500'}`} 
            />

            {/* Icône */}
            <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center
              ${popup.type === 'error' ? 'bg-red-500/20 text-red-400' : 
                popup.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 
                popup.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                'bg-cyan-500/20 text-cyan-400'}`}>
              {popup.type === 'error' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              ) : popup.type === 'warning' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              ) : popup.type === 'success' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              )}
            </div>

            <h3 className="text-xl font-bold text-white text-center mb-2">{popup.title}</h3>
            <p className="text-white/70 text-sm text-center leading-relaxed mb-6">{popup.message}</p>

            <button 
              onClick={hidePopup}
              className={`w-full py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0
                ${popup.type === 'error' ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_10px_25px_rgba(239,68,68,0.3)]' : 
                  popup.type === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-orange-400 shadow-[0_10px_25px_rgba(234,179,8,0.3)]' : 
                  popup.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_10px_25px_rgba(16,185,129,0.3)]' : 
                  'bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_10px_25px_rgba(108,92,231,0.3)]'}`}>
              OK
            </button>
          </div>
        </div>
      )}

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
            
            <div className="flex flex-col gap-1">
              <div className="text-[11px] text-white/50 uppercase tracking-[2px] font-semibold mb-1">Votre Solde</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 flex items-center gap-2">
                {formatXOF(playerBalance)}
                <span className="text-sm font-bold text-yellow-400 tracking-[1px]">XOF</span>
              </div>
              <div className="text-sm text-white/60 flex items-center gap-1">
                <span className="text-[10px] text-white/40">Vies:</span>
                <span className={`font-bold ${
                  playerLives <= 1 ? 'text-red-400' :
                  playerLives <= 3 ? 'text-yellow-400' :
                  'text-emerald-400'
                }`}>
                  {playerLives}
                </span>
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
                disabled={isProcessingBet || playerLives <= 0}
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
                { label: 'Paires Trouvees', value: `${matchesFound}/${TOTAL_PAIRS}`, color: 'text-white', badge: null },
                { label: 'Erreurs', value: `${errorCount}`, color: errorCount > 0 ? 'text-red-400' : 'text-green-400', badge: null },
                { label: 'Temps', value: timerDisplay, color: timerDisplay === 'TEMPS ÉCOULÉ!' ? 'text-red-500' : 'text-white', badge: null }
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
                    <div className="w-[40%] h-[40%] opacity-80 flex items-center justify-center">
                      <span
                        className="font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                        style={{ fontSize: '2.75rem', lineHeight: 1 }}
                      >
                        ?
                      </span>
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

      {/* Challenge Modal */}
      <div className={`fixed inset-0 bg-[#0a0e17]/95 backdrop-blur-xl flex items-center justify-center z-[2000] transition-opacity duration-500 ${showChallengeModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-[90%] max-w-[480px] bg-white/[0.06] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 text-center border border-white/[0.1] shadow-[0_25px_50px_rgba(0,0,0,0.4),0_0_60px_rgba(108,92,231,0.2)] relative overflow-hidden transition-all duration-600 ${showChallengeModal ? 'translate-y-0 scale-100' : 'translate-y-16 scale-90'}`}>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-400" />

          <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(108,92,231,0.4)]">
            <TrophyIcon />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Défi Relevé !</h2>
          <p className="text-white/75 text-sm sm:text-base mb-2 leading-relaxed font-light">
            Vous devez relever le défi suivant pour multiplier vos gains :
          </p>

          <div className="bg-white/[0.04] rounded-2xl p-5 mb-5 border border-white/[0.05]">
            <div className="text-xl font-bold text-white mb-2">{challengeName}</div>
            <div className="text-sm text-white/70 mb-3">{challengeDescription}</div>
            <div className="text-4xl font-extrabold text-cyan-400">{challengeMultiplier}x</div>
          </div>

          <p className="text-white/60 text-sm mb-5 font-light">
            Concentrez-vous et donnez le meilleur de vous-même !
          </p>

          <button onClick={handleStartChallenge} className="w-full px-8 py-3.5 bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-bold rounded-2xl shadow-[0_10px_25px_rgba(108,92,231,0.4)] hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(108,92,231,0.5)] active:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
            <PlayIcon />
            Commencer le Défi
          </button>
        </div>
      </div>

      {/* Result Modal */}
      <div className={`fixed inset-0 bg-[#0a0e17]/95 backdrop-blur-xl flex items-center justify-center z-[2000] transition-opacity duration-500 ${showResult ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-[90%] max-w-[480px] bg-white/[0.06] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 text-center border border-white/[0.1] shadow-[0_25px_50px_rgba(0,0,0,0.4),0_0_60px_rgba(108,92,231,0.2)] relative overflow-hidden transition-all duration-600 ${showResult ? 'translate-y-0 scale-100' : 'translate-y-16 scale-90'}`}>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-400" />

          <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(253,203,110,0.4),0_0_0_4px_rgba(253,203,110,0.1)] animate-[trophyBounce_1s_cubic-bezier(0.34,1.56,0.64,1)]">
            <BigTrophyIcon />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Félicitations !</h2>
          <p className="text-white/75 text-sm sm:text-base mb-2 leading-relaxed font-light">
            Vous avez trouvé toutes les paires et démontré une mémoire exceptionnelle !
          </p>

          {completedChallengeName && (
            <div className="bg-white/[0.04] rounded-2xl p-3 mb-4 border border-white/[0.05]">
              <div className="text-sm text-white/70">Défi accompli :</div>
              <div className="text-lg font-bold text-white">{completedChallengeName}</div>
              <div className="text-sm text-cyan-400">Multiplicateur {completedMultiplier}</div>
            </div>
          )}

          <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 my-5 drop-shadow-[0_0_30px_rgba(0,184,148,0.4)] animate-[prizeGlow_2s_ease-in-out_infinite]">
            {formatXOF(prizeAmount)} <span className="text-xl font-semibold ml-2">XOF</span>
          </div>
          <p className="text-white/75 text-sm mb-6 font-light">Vos gains ont été ajoutés à votre solde.</p>

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

      {/* Failure Modal */}
      <div className={`fixed inset-0 bg-[#0a0e17]/95 backdrop-blur-xl flex items-center justify-center z-[2000] transition-opacity duration-500 ${showFailureModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-[90%] max-w-[480px] bg-white/[0.06] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 text-center border border-white/[0.1] shadow-[0_25px_50px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all duration-600 ${showFailureModal ? 'translate-y-0 scale-100' : 'translate-y-16 scale-90'}`}>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />

          <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(255,107,107,0.4)]">
            <span className="text-4xl">😢</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Défi Échoué</h2>
          <p className="text-white/75 text-sm sm:text-base mb-4 leading-relaxed font-light">
            Vous n'avez pas réussi à remplir les conditions du défi.
          </p>

          {failedChallengeName && (
            <div className="bg-white/[0.04] rounded-2xl p-3 mb-4 border border-white/[0.05]">
              <div className="text-sm text-white/70">Défi :</div>
              <div className="text-lg font-bold text-white">{failedChallengeName}</div>
              <div className="text-sm text-red-400">{failureReason}</div>
            </div>
          )}

          <div className="text-xl sm:text-2xl font-extrabold text-red-400 my-4">
            Perte: {formatXOF(lostAmount)} <span className="text-sm font-semibold ml-2">XOF</span>
          </div>
          <p className="text-white/60 text-sm mb-6 font-light">Ne vous découragez pas, réessayez !</p>

          <button onClick={handleTryAgain} className="w-full px-8 py-3.5 bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-bold rounded-2xl shadow-[0_10px_25px_rgba(108,92,231,0.4)] hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(108,92,231,0.5)] active:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 mb-4">
            <PlayIcon />
            Réessayer
          </button>

          <button onClick={handleTryAgain} className="w-full px-8 py-3.5 bg-white/[0.06] border-2 border-white/[0.12] text-white font-bold rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:bg-white/[0.12] hover:border-cyan-400 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
            <HomeIcon />
            Retour au Menu
          </button>
        </div>
      </div>
    </div>
  )
}