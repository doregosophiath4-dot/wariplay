'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { useRouter } from 'next/navigation'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const CoinsIcon = ({ className = "text-yellow-400" }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
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

const MoneyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const TrophyIcon = ({ className = "text-emerald-400" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const CloseIcon = ({ className = "text-red-400" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const LightbulbIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
)

const BookOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const CloseModalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/* ═══════════════════════════════════════════
   LOADER ICON - Style uniforme WorldCap
   ═══════════════════════════════════════════ */

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

interface Particle {
  x: number; y: number; size: number; speedX: number; speedY: number; color: string
}
interface Star {
  x: number; y: number; size: number; twinkleSpeed: number; twinkleOffset: number; brightness: number
}
interface GameResponse {
  result?: 'correct' | 'wrong' | 'timeout'
  current_bet?: number
  finished?: boolean
  message?: string
  country?: string
  options?: string[]
  session_token?: string
  error?: string
  action?: string
  success?: boolean
  new_solde?: number
  min?: number
}

export default function WorldCap() {
  useAuth()
  const router = useRouter()

  const [playerBalance, setPlayerBalance] = useState(0)
  const [currentBet, setCurrentBet] = useState(0)
  const [originalBet, setOriginalBet] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [timeLeft, setTimeLeft] = useState(8)
  const [gameActive, setGameActive] = useState(false)
  const [currentCountry, setCurrentCountry] = useState('')
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [choicesDisabled, setChoicesDisabled] = useState(false)
  const [correctChoice, setCorrectChoice] = useState('')
  const [selectedChoice, setSelectedChoice] = useState('')
  const [showRules, setShowRules] = useState(false)
  const [showGameOver, setShowGameOver] = useState(false)
  const [gameOverWin, setGameOverWin] = useState(false)
  const [gameOverMessage, setGameOverMessage] = useState('')
  const [notification, setNotification] = useState<{
    title: string; message: string; type: 'success' | 'error' | 'warning' | 'info'
  } | null>(null)
  const [showLoading, setShowLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const starsRef = useRef<Star[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const autoNextRef = useRef<NodeJS.Timeout | null>(null)
  const animFrameRef = useRef<number>(0)
  const betInputRef = useRef<HTMLInputElement>(null)
  const gameActiveRef = useRef(false)
  const currentBetRef = useRef(0)
  const originalBetRef = useRef(0)
  const wrongCountRef = useRef(0)
  const currentQuestionRef = useRef(1)
  const playerBalanceRef = useRef(0)
  const currentAnswerRef = useRef('')
  const scoreRef = useRef(0)
  const streakRef = useRef(0)
  const maxStreakRef = useRef(0)
  const correctCountRef = useRef(0)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLoadingRef = useRef(false)
  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef(false)
  const sessionTokenRef = useRef<string | null>(null)
  const initialBetRef = useRef(0)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ── Refs de routage par contenu ──
  const authResolveRef = useRef<(() => void) | null>(null)
  const authRejectRef = useRef<((e: any) => void) | null>(null)
  const pendingQuestionResolveRef = useRef<((d: GameResponse) => void) | null>(null)
  const pendingAnswerResolveRef = useRef<((d: GameResponse) => void) | null>(null)
  const pendingQuestionDataRef = useRef<GameResponse | null>(null)

  useEffect(() => { gameActiveRef.current = gameActive }, [gameActive])
  useEffect(() => { currentBetRef.current = currentBet }, [currentBet])
  useEffect(() => { originalBetRef.current = originalBet }, [originalBet])
  useEffect(() => { wrongCountRef.current = wrongCount }, [wrongCount])
  useEffect(() => { currentQuestionRef.current = currentQuestion }, [currentQuestion])
  useEffect(() => { playerBalanceRef.current = playerBalance }, [playerBalance])
  useEffect(() => { currentAnswerRef.current = currentAnswer }, [currentAnswer])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { streakRef.current = streak }, [streak])
  useEffect(() => { maxStreakRef.current = maxStreak }, [maxStreak])
  useEffect(() => { correctCountRef.current = correctCount }, [correctCount])

  const formatNumber = useCallback((num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }, [])

  const showNotificationFn = useCallback((
    title: string, message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    setNotification({ title, message, type })
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current)
    notificationTimeoutRef.current = setTimeout(() => setNotification(null), 3000)
  }, [])

  /* ── Canvas Animation ──────────────────────────────── */
  const initParticles = useCallback((width: number, height: number) => {
    const particleCount = Math.floor((width * height) / 15000)
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width, y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: `rgba(${Math.floor(Math.random() * 100 + 156)}, ${Math.floor(Math.random() * 100 + 99)}, ${Math.floor(Math.random() * 100 + 255)}, ${Math.random() * 0.3 + 0.1})`
      })
    }
    particlesRef.current = particles
  }, [])

  const initStars = useCallback((width: number, height: number) => {
    const starCount = Math.floor((width * height) / 8000)
    const stars: Star[] = []
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width, y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        twinkleOffset: Math.random() * Math.PI * 2,
        brightness: Math.random() * 0.5 + 0.5
      })
    }
    starsRef.current = stars
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, "#0F0F1E")
    gradient.addColorStop(1, "#1A1A2E")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
    const time = Date.now() * 0.001
    starsRef.current.forEach(star => {
      const twinkle = (Math.sin(time * star.twinkleSpeed + star.twinkleOffset) + 1) * 0.5
      const brightness = star.brightness * (0.7 + twinkle * 0.3)
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`
      ctx.fill()
    })
    particlesRef.current.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
      p.x += p.speedX; p.y += p.speedY
      if (p.x < 0 || p.x > w) p.speedX *= -1
      if (p.y < 0 || p.y > h) p.speedY *= -1
      p.x = Math.max(0, Math.min(w, p.x))
      p.y = Math.max(0, Math.min(h, p.y))
    })
    animFrameRef.current = requestAnimationFrame(animate)
  }, [])

  /* ── Timer ──────────────────────────────────────────── */
  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null }
    if (timerTimeoutRef.current) { clearTimeout(timerTimeoutRef.current); timerTimeoutRef.current = null }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    setTimeLeft(8)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1
        if (newTime <= 0) {
          clearTimer()
          setTimeout(() => handleTimeoutWS(), 0)
        }
        return newTime
      })
    }, 1000)
  }, [clearTimer])

  /* ── WebSocket ──────────────────────────────────────── */
  const closeWebSocket = useCallback(() => {
    wsReadyRef.current = false
    authResolveRef.current = null
    authRejectRef.current = null
    pendingQuestionResolveRef.current = null
    pendingAnswerResolveRef.current = null
    pendingQuestionDataRef.current = null
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  // Route chaque message entrant selon son CONTENU, jamais selon
  // "le dernier truc envoyé". Le frontend ne décide jamais lui-même
  // de la fin de partie : il ne fait que relayer data.finished.
  const routeIncomingMessage = useCallback((d: GameResponse) => {

    if (d.session_token) {
      sessionTokenRef.current = d.session_token
    }

    // 1. Confirmation d'authentification
    if ((d as any).type === 'auth_success') {
      wsReadyRef.current = true
      if (authResolveRef.current) {
        const rf = authResolveRef.current
        authResolveRef.current = null
        authRejectRef.current = null
        rf()
      }
      return
    }

    // 2. Une question OU un message de fin de partie poussé par le serveur
    if ((d.country && d.options) || d.finished) {
      if (pendingQuestionResolveRef.current) {
        const rf = pendingQuestionResolveRef.current
        pendingQuestionResolveRef.current = null
        rf(d)
      } else if (d.finished) {
        handleGameFinished(d)
      } else {
        // Arrivée en avance (avant le délai UI de 2s) : on la garde en attente
        pendingQuestionDataRef.current = d
      }
      return
    }

    // 3. Un résultat de réponse (correct / wrong / timeout)
    if (d.result !== undefined) {
      if (pendingAnswerResolveRef.current) {
        const rf = pendingAnswerResolveRef.current
        pendingAnswerResolveRef.current = null
        rf(d)
      } else {
        handleServerResponse(d)
      }
      return
    }

    // 4. Tout le reste (ex: ack de send_bet avec 'min') : ignoré volontairement.
  }, [])

  const openWebSocket = useCallback((): Promise<void> => new Promise(async (resolve, reject) => {
    if (wsRef.current && wsReadyRef.current) {
      resolve()
      return
    }
    closeWebSocket()
    const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
    const ws = new WebSocket(proto + window.location.host + '/ws/cap')
    wsRef.current = ws

    const t = setTimeout(() => {
      closeWebSocket()
      reject(new Error('Timeout de connexion'))
    }, 10000)

    authResolveRef.current = () => { clearTimeout(t); resolve() }
    authRejectRef.current = (e) => { clearTimeout(t); reject(e) }

    ws.onopen = async () => {
      await initAll()
      const am = await prepareWSAuthMessage()
      ws.send(JSON.stringify(am))
    }

    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data)
        routeIncomingMessage(d)
      } catch (er) {
      }
    }

    ws.onerror = (error) => {
      clearTimeout(t)
      if (authRejectRef.current) authRejectRef.current(new Error('Erreur WS'))
      closeWebSocket()
    }

    ws.onclose = () => {
      wsReadyRef.current = false
      wsRef.current = null
      if (authRejectRef.current) {
        authRejectRef.current(new Error('WS fermé'))
        authResolveRef.current = null
        authRejectRef.current = null
      }
      pendingQuestionResolveRef.current = null
      pendingAnswerResolveRef.current = null
    }
  }), [closeWebSocket, routeIncomingMessage])

  // Envoie un message brut sans rien attendre (fire-and-forget)
  const sendRaw = useCallback((msg: object) => {
    if (!wsRef.current || !wsReadyRef.current) {
      throw new Error('Non connecté')
    }
    wsRef.current.send(JSON.stringify(msg))
  }, [])

  // Attend la PROCHAINE question ou le message finished poussés par le serveur
  const waitForNextQuestion = useCallback((timeoutMs = 10000): Promise<GameResponse> => {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        pendingQuestionResolveRef.current = null
        reject(new Error('Timeout en attente de la question'))
      }, timeoutMs)
      pendingQuestionResolveRef.current = (d) => { clearTimeout(t); resolve(d) }
    })
  }, [])

  // Envoie une réponse et attend le résultat correspondant
  const sendAnswerAndWait = useCallback((answer: string, timeoutMs = 10000): Promise<GameResponse> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || !wsReadyRef.current) {
        reject(new Error('Non connecté'))
        return
      }
      const t = setTimeout(() => {
        pendingAnswerResolveRef.current = null
        reject(new Error('Timeout'))
      }, timeoutMs)
      pendingAnswerResolveRef.current = (d) => { clearTimeout(t); resolve(d) }
      wsRef.current.send(JSON.stringify({
        action: 'answer',
        answer,
        session_token: sessionTokenRef.current || ''
      }))
    })
  }, [])

  /* ── Backend HTTP ────────────────────────────────────── */
  const fetchPlayerBalance = useCallback(async (): Promise<number> => {
    setShowLoading(true)
    setLoadingMessage('Récupération du solde...')
    try {
      const response = await fetchWithAllTokens('/api/get_lettricide_solde')
      let data
      if (response instanceof Response) {
        data = await response.json()
      } else {
        data = response
      }
      if (!data || data.error) {
        throw new Error(data?.error || 'Impossible de récupérer votre solde')
      }
      return data.solde || 0
    } catch (error) {
      throw error
    } finally {
      setShowLoading(false)
    }
  }, [])

  const sendBetToBackend = useCallback(async (betValue: number): Promise<any> => {
    setShowLoading(true)
    setLoadingMessage('Envoi de la mise...')
    try {
      const response = await fetchWithAllTokens('/api/cherif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet: betValue })
      })
      let data
      if (response instanceof Response) {
        data = await response.json()
      } else {
        data = response
      }
      if (!data || !data.success) {
        throw new Error(data?.error || "Erreur lors de la mise")
      }
      return data
    } catch (error) {
      throw error
    } finally {
      setShowLoading(false)
    }
  }, [])

  /* ── Game Logic ─────────────────────────────────────── */
  // NOTE: checkCriticalLoss, checkMaxWrongAnswers, checkLastQuestion ont été
  // SUPPRIMÉS. Le frontend ne doit jamais dupliquer les règles de fin de
  // partie : la seule autorité est le flag `finished` envoyé par le backend.

  const showGameOverPopup = useCallback((isWin: boolean, message: string) => {
    clearTimer()
    closeWebSocket()
    if (autoNextRef.current) { clearTimeout(autoNextRef.current); autoNextRef.current = null }
    setGameActive(false); gameActiveRef.current = false
    if (isWin) {
      const newBalance = playerBalanceRef.current + currentBetRef.current
      setPlayerBalance(newBalance)
      playerBalanceRef.current = newBalance
    }
    setGameOverWin(isWin)
    setGameOverMessage(message)
    setShowGameOver(true)
  }, [clearTimer, closeWebSocket])

  const displayQuestion = useCallback((country: string, options: string[]) => {
    if (autoNextRef.current) { clearTimeout(autoNextRef.current); autoNextRef.current = null }
    isLoadingRef.current = false
    setChoicesDisabled(false)
    setCorrectChoice('')
    setSelectedChoice('')
    setCurrentCountry(country)
    setCurrentAnswer('')
    setOptions(options)
    startTimer()
  }, [startTimer])

  // Traite soit une nouvelle question, soit un message de fin de partie
  // poussé par le serveur juste après une réponse.
  const showNextPushedQuestion = useCallback(() => {
    const handle = (d: GameResponse) => {
      if (d.finished) {
        handleGameFinished(d)
        return
      }
      if (d.country && d.options) {
        displayQuestion(d.country, d.options)
      }
    }

    if (pendingQuestionDataRef.current) {
      const d = pendingQuestionDataRef.current
      pendingQuestionDataRef.current = null
      handle(d)
      return
    }
    waitForNextQuestion()
      .then(handle)
      .catch(error => {
        showNotificationFn("Erreur", "Connexion au serveur perdue", "error")
        endGame()
      })
  }, [displayQuestion, waitForNextQuestion, showNotificationFn])

  const nextQuestion = useCallback(() => {
    if (autoNextRef.current) clearTimeout(autoNextRef.current)
    autoNextRef.current = setTimeout(() => {
      setCurrentQuestion(prev => {
        const newQ = prev + 1
        currentQuestionRef.current = newQ
        // Aucune vérification locale de fin de partie ici : on avance
        // simplement, le serveur décide seul si la partie continue.
        showNextPushedQuestion()
        return newQ
      })
    }, 2000)
  }, [showNextPushedQuestion])

  const handleServerResponse = useCallback((data: GameResponse) => {
    clearTimer()
    setChoicesDisabled(true)

    if (data.result === 'correct') {
      setScore(prev => { const ns = prev + 1; scoreRef.current = ns; return ns })
      setStreak(prev => { const nst = prev + 1; streakRef.current = nst; return nst })
      setCorrectCount(prev => { const nc = prev + 1; correctCountRef.current = nc; return nc })
      if (streakRef.current > maxStreakRef.current) {
        setMaxStreak(streakRef.current); maxStreakRef.current = streakRef.current
      }
      if (data.current_bet !== undefined) {
        setCurrentBet(data.current_bet); currentBetRef.current = data.current_bet
      }
      showNotificationFn("Bonne réponse !", `Mise actuelle: ${formatNumber(currentBetRef.current)} XOF`, "success")
    } else if (data.result === 'wrong') {
      setStreak(0); streakRef.current = 0
      setWrongCount(prev => { const nw = prev + 1; wrongCountRef.current = nw; return nw })
      if (data.current_bet !== undefined) {
        setCurrentBet(data.current_bet); currentBetRef.current = data.current_bet
      }
      showNotificationFn("Mauvaise réponse", `Mise actuelle: ${formatNumber(currentBetRef.current)} XOF`, "error")
    } else if (data.result === 'timeout') {
      setWrongCount(prev => { const nw = prev + 1; wrongCountRef.current = nw; return nw })
      setStreak(0); streakRef.current = 0
      if (data.current_bet !== undefined) {
        setCurrentBet(data.current_bet); currentBetRef.current = data.current_bet
      }
      showNotificationFn("Temps écoulé !", `Mise actuelle: ${formatNumber(currentBetRef.current)} XOF`, "error")
    }

    // Seule autorité pour terminer la partie : le flag envoyé par le backend.
    if (data.finished) {
      handleGameFinished(data)
      return
    }

    nextQuestion()
  }, [clearTimer, showNotificationFn, formatNumber, nextQuestion])

  const handleGameFinished = useCallback((data: GameResponse) => {
    clearTimer()
    closeWebSocket()
    setGameActive(false); gameActiveRef.current = false
    if (autoNextRef.current) { clearTimeout(autoNextRef.current); autoNextRef.current = null }

    const finalGain = (data.current_bet || 0) - initialBetRef.current
    const isWin = finalGain > 0 || (data.message ? data.message.includes("Gains") : false)

    if (isWin && data.current_bet !== undefined) {
      const newBalance = playerBalanceRef.current + data.current_bet
      setPlayerBalance(newBalance)
      playerBalanceRef.current = newBalance
    }

    showGameOverPopup(isWin, data.message || "Partie terminée")
  }, [clearTimer, closeWebSocket, showGameOverPopup])

  const handleAnswer = useCallback(async (selected: string) => {
    if (!gameActiveRef.current || isLoadingRef.current) return
    isLoadingRef.current = true
    clearTimer()
    setChoicesDisabled(true)
    setSelectedChoice(selected)

    try {
      const response = await sendAnswerAndWait(selected)
      if (response.error) {
        showNotificationFn("Erreur", response.error, "error")
        isLoadingRef.current = false
        return
      }
      isLoadingRef.current = false
      handleServerResponse(response)
    } catch (error) {
      showNotificationFn("Erreur", "Connexion au serveur perdue", "error")
      isLoadingRef.current = false
      endGame()
    }
  }, [sendAnswerAndWait, handleServerResponse, showNotificationFn, clearTimer])

  const handleTimeoutWS = useCallback(async () => {
    if (!gameActiveRef.current || isLoadingRef.current) return
    isLoadingRef.current = true
    clearTimer()
    setChoicesDisabled(true)

    try {
      const response = await sendAnswerAndWait('timeout')
      if (response.error) {
        showNotificationFn("Erreur", response.error, "error")
        isLoadingRef.current = false
        return
      }
      isLoadingRef.current = false
      handleServerResponse(response)
    } catch (error) {
      showNotificationFn("Erreur", "Connexion au serveur perdue", "error")
      isLoadingRef.current = false
      endGame()
    }
  }, [sendAnswerAndWait, handleServerResponse, showNotificationFn, clearTimer])

  const startBackendGame = useCallback(async (betValue: number) => {
    setShowLoading(true)
    setLoadingMessage('Connexion au serveur...')

    try {
      await openWebSocket()

      setLoadingMessage('Envoi de la mise...')
      sendRaw({ action: 'send_bet', bet: betValue, session_token: sessionTokenRef.current || '' })

      setLoadingMessage('Validation de la mise...')
      const betResponse = await sendBetToBackend(betValue)

      playerBalanceRef.current = betResponse.new_solde
      setPlayerBalance(betResponse.new_solde)
      initialBetRef.current = betValue
      setOriginalBet(betValue); originalBetRef.current = betValue
      setCurrentBet(betValue); currentBetRef.current = betValue

      // ── Handshake explicite : le backend n'envoie la première question
      //    qu'après avoir reçu ce signal, une fois la mise HTTP confirmée
      //    et l'UI prête. Évite que des questions/timeouts se déroulent
      //    pendant que le joueur regarde encore l'écran de chargement.
      setLoadingMessage('Démarrage de la partie...')
      const questionPromise = waitForNextQuestion()
      sendRaw({ action: 'start_game', session_token: sessionTokenRef.current || '' })

      const questionResponse = await questionPromise

      setGameActive(true); gameActiveRef.current = true
      setScore(0); scoreRef.current = 0
      setStreak(0); streakRef.current = 0
      setMaxStreak(0); maxStreakRef.current = 0
      setCorrectCount(0); correctCountRef.current = 0
      setWrongCount(0); wrongCountRef.current = 0
      setCurrentQuestion(1); currentQuestionRef.current = 1

      showNotificationFn("Mise acceptée !", `Vous avez misé ${formatNumber(betValue)} XOF`, "success")

      if (questionResponse.finished) {
        handleGameFinished(questionResponse)
        return
      }
      if (!questionResponse.country || !questionResponse.options) {
        throw new Error('Réponse de question invalide')
      }
      displayQuestion(questionResponse.country, questionResponse.options)

    } catch (error) {
      showNotificationFn("Erreur", error instanceof Error ? error.message : "Impossible de démarrer la partie", "error")
      endGame()
      throw error
    } finally {
      setShowLoading(false)
    }
  }, [openWebSocket, sendRaw, waitForNextQuestion, sendBetToBackend, showNotificationFn, formatNumber, displayQuestion, handleGameFinished])

  const endGame = useCallback(() => {
    clearTimer()
    closeWebSocket()
    setGameActive(false); gameActiveRef.current = false
    if (autoNextRef.current) { clearTimeout(autoNextRef.current); autoNextRef.current = null }
    sessionTokenRef.current = null
    initialBetRef.current = 0
    isLoadingRef.current = false

    setScore(0); scoreRef.current = 0
    setStreak(0); streakRef.current = 0
    setMaxStreak(0); maxStreakRef.current = 0
    setCorrectCount(0); correctCountRef.current = 0
    setWrongCount(0); wrongCountRef.current = 0
    setCurrentBet(0); currentBetRef.current = 0
    setOriginalBet(0); originalBetRef.current = 0
    setCurrentQuestion(1); currentQuestionRef.current = 1
    setCurrentCountry('')
    setCurrentAnswer(''); currentAnswerRef.current = ''
    setOptions([])
    setChoicesDisabled(false)
    setCorrectChoice('')
    setSelectedChoice('')
    setShowGameOver(false)
    setGameActive(false)
  }, [clearTimer, closeWebSocket])

  /* ── Event Handlers ──────────────────────────────────── */
  const handleStartGame = useCallback(async () => {
    const betValue = parseInt(betInputRef.current?.value ?? '')

    if (isNaN(betValue) || betValue < 100 || betValue > 10000) {
      showNotificationFn("Mise invalide", "Veuillez entrer un montant entre 100 et 10 000 XOF", "error")
      betInputRef.current?.focus()
      return
    }
    if (betValue > playerBalanceRef.current) {
      showNotificationFn("Solde insuffisant", `Votre solde est de ${formatNumber(playerBalanceRef.current)} XOF`, "error")
      return
    }

    try {
      await startBackendGame(betValue)
    } catch (error) {
    }
  }, [showNotificationFn, formatNumber, startBackendGame])

  const handleEndGame = useCallback(() => {
    setShowGameOver(false)
    endGame()
  }, [endGame])

  /* ── Effects ─────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles(canvas.width, canvas.height)
      initStars(canvas.width, canvas.height)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    animate()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowRules(false)
        setShowGameOver(false)
        handleEndGame()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    fetchPlayerBalance()
      .then(balance => {
        setPlayerBalance(balance)
        playerBalanceRef.current = balance
      })
      .catch(error => {
      })

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      document.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(animFrameRef.current)
      clearTimer()
      closeWebSocket()
      if (autoNextRef.current) clearTimeout(autoNextRef.current)
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current)
    }
  }, [animate, initParticles, initStars, clearTimer, closeWebSocket, handleEndGame, fetchPlayerBalance])

  const progressPercent = (currentQuestion / 20) * 100
  const potentialWin = Math.floor(currentBet * 0.2)

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen font-['Poppins',sans-serif] text-[#2D3047] overflow-x-hidden bg-[#0F0F1E]">
      
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-[-1]" />

      {/* Loader Overlay */}
      {showLoading && (
        <div className="fixed inset-0 bg-[#0F0F1E]/90 backdrop-blur-xl flex flex-col items-center justify-center z-[5000]">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(108,92,231,0.4)] mb-6 animate-pulse">
            <LoaderIcon />
          </div>
          <p className="text-lg font-semibold text-white/90 animate-pulse">{loadingMessage}</p>
          <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* Top Bar (mobile) */}
      <div className={`fixed top-0 left-0 right-0 bg-[#2D3047]/95 backdrop-blur-xl z-[100] py-2.5 px-4 items-center justify-between border-b border-purple-500/30 shadow-[0_5px_20px_rgba(0,0,0,0.2)] ${gameActive ? 'flex' : 'hidden'}`}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-white">
            <CoinsIcon className="text-yellow-400 !w-5 !h-5" />
            <span className="text-sm font-semibold">Solde:</span>
            <span className="font-bold text-purple-400 text-base">{formatNumber(playerBalance)} XOF</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => setShowRules(true)} className="bg-purple-500/90 border-none text-white py-1.5 px-3 rounded-xl font-semibold cursor-pointer flex items-center gap-1.5 text-xs hover:bg-purple-500 hover:-translate-y-0.5 transition-all duration-300">
            <BookIcon />
            Règles
          </button>
        </div>
      </div>

      <div className="w-full max-w-[900px] mx-auto px-4 sm:px-5 py-4 relative z-10">

        {/* Header */}
        <header className={`text-center mb-5 pt-2.5 transition-all duration-400 ${gameActive ? 'opacity-0 invisible h-0 mb-0 p-0' : 'opacity-100 visible'}`}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent font-['Montserrat',sans-serif] drop-shadow-[0_5px_15px_rgba(108,99,255,0.2)] flex items-center justify-center gap-2">
            <GlobeIcon />
            WorldCap
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-[600px] mx-auto">
            Testez vos connaissances géographiques, misez et gagnez du XOF!
          </p>
        </header>

        {/* Balance Container */}
        <div className={`bg-white/95 backdrop-blur-xl rounded-2xl p-4 mb-5 shadow-[0_15px_35px_rgba(108,99,255,0.1)] flex justify-between items-center border border-purple-500/20 transition-all duration-400 ${gameActive ? 'hidden' : 'flex'}`}>
          <div>
            <h2 className="text-sm text-[#2D3047] mb-1 font-semibold">Votre solde</h2>
            <div className="text-2xl sm:text-3xl font-bold text-purple-500 flex items-center gap-1">
              <span>{formatNumber(playerBalance)}</span>
              <span className="text-lg sm:text-xl text-purple-700">XOF</span>
            </div>
          </div>
          <div className="text-2xl text-yellow-400">
            <CoinsIcon className="!w-8 !h-8" />
          </div>
        </div>

        {/* Bet Section */}
        <section className={`bg-white/95 backdrop-blur-xl rounded-2xl p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] mb-5 border border-purple-500/20 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(108,99,255,0.15)] transition-all duration-400 ${gameActive ? 'hidden' : 'block'}`}>
          <h2 className="text-xl sm:text-2xl text-purple-500 mb-4 font-bold flex items-center gap-2">
            <MoneyIcon />
            Placez votre mise
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[#2D3047] text-sm sm:text-base">Entrez le montant que vous souhaitez miser :</label>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden transition-all duration-400 focus-within:border-purple-500 focus-within:shadow-[0_0_0_3px_rgba(108,99,255,0.2)]">
                <div className="bg-[#f0f2ff] px-3 h-12 sm:h-14 flex items-center font-bold text-purple-700 text-sm sm:text-base flex-shrink-0">
                  XOF
                </div>
                <input
                  type="number"
                  ref={betInputRef}
                  placeholder="100"
                  min="100"
                  max="10000"
                  step="100"
                  defaultValue="100"
                  className="flex-1 px-3 h-12 sm:h-14 border-none text-lg sm:text-xl font-bold text-[#2D3047] bg-white w-full outline-none"
                />
              </div>
              <p className="text-gray-500 text-xs sm:text-sm">Mise minimale : 100 XOF | Mise maximale : 10 000 XOF</p>
            </div>
            <button onClick={handleStartGame} className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold text-base rounded-xl hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-400 flex items-center justify-center gap-2">
              <PlayIcon />
              Commencer à jouer
            </button>
          </div>
        </section>

        {/* Game Section */}
        <section className={`bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-purple-500/20 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(108,99,255,0.15)] transition-all duration-400 mt-[70px] ${!gameActive ? 'hidden' : 'block'}`}>
          
          {/* Game Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3">
            <div className="flex items-center gap-2 order-first sm:order-none w-full sm:w-auto justify-center">
              <ClockIcon />
              <div className={`text-lg font-bold text-white py-1.5 px-3 rounded-xl min-w-[60px] text-center ${
                timeLeft <= 3 ? 'bg-red-500 animate-pulse' : timeLeft <= 5 ? 'bg-orange-400' : 'bg-pink-400'
              }`}>
                {timeLeft}s
              </div>
            </div>
            <div className="text-lg sm:text-xl text-purple-500 font-bold text-center w-full sm:w-auto">Devine la capitale</div>
            <div className="text-sm sm:text-base font-bold text-pink-400 bg-pink-400/10 py-2 px-3 rounded-xl whitespace-nowrap text-center w-full sm:w-auto">
              Mise : {formatNumber(currentBet)} XOF
            </div>
          </div>

          {/* Progress */}
          <div className="my-4 bg-white/[0.1] rounded-xl p-2">
            <div className="flex justify-between mb-1.5 text-white text-sm">
              <span>Question {currentQuestion}/20</span>
              <span>Mise actuelle: {formatNumber(currentBet)} XOF</span>
            </div>
            <div className="h-2.5 bg-white/[0.1] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-xl p-4 sm:p-6 mb-5 text-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] border-2 border-[#f0f2ff]">
            <div className="text-xl sm:text-2xl font-bold text-[#2D3047] leading-tight">
              {currentCountry ? `Quelle est la capitale de ${currentCountry} ?` : 'Chargement de la question...'}
            </div>
          </div>

          {/* Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {options.map((capital, index) => (
              <button
                key={index}
                disabled={choicesDisabled}
                onClick={() => handleAnswer(capital)}
                className={`py-4 sm:py-5 px-3 text-sm sm:text-base font-semibold border-2 border-gray-200 rounded-xl cursor-pointer bg-white text-[#2D3047] text-center min-h-[65px] sm:min-h-[70px] flex items-center justify-center transition-all duration-400 hover:border-purple-500 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(108,99,255,0.15)] disabled:cursor-not-allowed disabled:opacity-70
                  ${choicesDisabled && capital === correctChoice ? '!bg-emerald-400 !text-white !border-emerald-400' : ''}
                  ${choicesDisabled && capital === selectedChoice && capital !== correctChoice ? '!bg-red-400 !text-white !border-red-400' : ''}
                `}
              >
                {capital}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="mb-5">
            <div className="flex overflow-x-auto gap-3 pb-2.5 scrollbar-thin">
              {[
                { value: score, label: 'Score', color: 'text-purple-500' },
                { value: streak, label: 'Série en cours', color: 'text-pink-400' },
                { value: correctCount, label: 'Bonnes réponses', color: 'text-emerald-400' },
                { value: wrongCount, label: 'Mauvaises réponses', color: 'text-red-400' },
                { value: `${formatNumber(potentialWin)} XOF`, label: 'Gain potentiel', color: 'text-emerald-400' }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl py-3.5 px-5 text-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] border-2 border-[#f0f2ff] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] transition-all duration-400 flex-shrink-0 w-[140px] sm:w-[160px] min-h-[100px] flex flex-col justify-center">
                  <div className={`text-2xl sm:text-3xl font-bold mb-1.5 ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-500 font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 left-5 bg-white py-3 px-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-2.5 z-[1000] max-w-[400px] mx-auto transition-transform duration-500 translate-y-0`}
          style={{
            borderLeft: `4px solid ${
              notification.type === 'success' ? '#4CD97B' :
              notification.type === 'error' ? '#FF6584' :
              notification.type === 'warning' ? '#FFB347' : '#36D1DC'
            }`
          }}>
          <div className={`text-xl flex-shrink-0 ${
            notification.type === 'success' ? 'text-emerald-400' :
            notification.type === 'error' ? 'text-red-400' :
            notification.type === 'warning' ? 'text-orange-400' : 'text-cyan-400'
          }`}>
            {notification.type === 'success' ? <TrophyIcon className="!w-5 !h-5" /> :
             notification.type === 'error' ? <CloseIcon className="!w-5 !h-5" /> :
             notification.type === 'warning' ? <WarningIcon /> : <InfoIcon />}
          </div>
          <div>
            <h4 className="text-[#2D3047] mb-0.5 text-sm font-semibold">{notification.title}</h4>
            <p className="text-gray-500 text-xs">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      <div className={`fixed inset-0 bg-black/90 backdrop-blur-xl z-[2000] flex items-center justify-center p-4 transition-all duration-300 ${showGameOver ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className={`bg-white rounded-2xl p-6 sm:p-8 max-w-[500px] w-full max-h-[80vh] overflow-y-auto shadow-[0_25px_50px_rgba(0,0,0,0.4)] text-center transition-all duration-400 ${showGameOver ? 'translate-y-0' : 'translate-y-8'}`}>
          
          <div className={`text-5xl sm:text-6xl mb-5 ${gameOverWin ? 'text-emerald-400' : 'text-red-400'}`}>
            {gameOverWin ? <TrophyIcon className="!w-16 !h-16" /> : <CloseIcon className="!w-16 !h-16" />}
          </div>

          <h2 className="text-purple-500 text-2xl sm:text-3xl font-bold mb-4">
            {gameOverWin ? 'Félicitations !' : 'Partie terminée !'}
          </h2>

          <p className="text-gray-600 text-sm mb-5">{gameOverMessage}</p>

          <div className="text-3xl sm:text-4xl font-bold text-purple-500 my-5">
            {formatNumber(playerBalance)} XOF
          </div>

          <div className="grid grid-cols-2 gap-4 my-6">
            {[
              { value: score, label: 'Score final' },
              { value: correctCount, label: 'Bonnes réponses' },
              { value: wrongCount, label: 'Mauvaises réponses' },
              { value: maxStreak, label: 'Meilleure série' }
            ].map((stat, i) => (
              <div key={i} className="bg-gray-100 rounded-xl py-3.5 px-3">
                <div className="text-2xl sm:text-3xl font-bold text-purple-500 mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <button onClick={handleEndGame} className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold text-base rounded-xl hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-400 flex items-center justify-center gap-2 mb-3">
            <RefreshIcon />
            Rejouer
          </button>

          <button onClick={handleEndGame} className="bg-transparent border-none text-lg text-[#2D3047] cursor-pointer p-1.5 transition-all duration-400 hover:text-red-500 hover:rotate-90">
            <CloseModalIcon />
          </button>
        </div>
      </div>

      {/* Rules Overlay */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4 transition-all duration-300 ${showRules ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={(e) => { if (e.target === e.currentTarget) setShowRules(false) }}
      >
        <div className={`bg-white rounded-2xl p-5 sm:p-6 max-w-[500px] w-full max-h-[80vh] overflow-y-auto shadow-[0_25px_50px_rgba(0,0,0,0.3)] transition-all duration-400 ${showRules ? 'translate-y-0' : 'translate-y-8'}`}>
          
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-purple-500 text-xl sm:text-2xl font-bold flex items-center gap-2">
              <BookOpenIcon />
              Règles du Jeu
            </h2>
            <button onClick={() => setShowRules(false)} className="bg-transparent border-none text-xl text-[#2D3047] cursor-pointer p-1.5 transition-all duration-400 hover:text-red-500 hover:rotate-90">
              <CloseModalIcon />
            </button>
          </div>

          <div className="text-[#2D3047] text-sm">
            <h3 className="text-purple-500 text-base font-bold my-3">Comment jouer ?</h3>
            <ul className="pl-4 mb-4 space-y-2">
              <li>1. <span className="text-purple-500 font-semibold">Placez votre mise</span> en XOF (100 XOF minimum, 10 000 XOF maximum)</li>
              <li>2. <span className="text-purple-500 font-semibold">Devinez la capitale</span> du pays qui vous est proposé</li>
              <li>3. <span className="text-purple-500 font-semibold">Vous avez 8 secondes</span> pour répondre à chaque question</li>
              <li>4. <span className="text-purple-500 font-semibold">Choisissez parmi 4 options</span> de réponses possibles</li>
              <li>5. <span className="text-purple-500 font-semibold">20 questions maximum</span> par partie</li>
            </ul>

            <h3 className="text-purple-500 text-base font-bold my-3">Système de gains et pertes</h3>
            <ul className="pl-4 mb-4 space-y-2">
              <li className="flex items-center gap-1.5"><TrophyIcon className="!w-4 !h-4 text-emerald-400" /> <span className="text-purple-500 font-semibold">Bonne réponse</span> : +20% de votre mise actuelle</li>
              <li className="flex items-center gap-1.5"><CloseModalIcon /> <span className="text-purple-500 font-semibold">Mauvaise réponse</span> : -20% de votre mise actuelle</li>
              <li className="flex items-center gap-1.5"><ClockIcon /> <span className="text-purple-500 font-semibold">Temps écoulé</span> : -20% de votre mise actuelle</li>
              <li className="flex items-center gap-1.5"><WarningIcon /> <span className="text-purple-500 font-semibold">Perte critique</span> : Si votre mise descend à -40% de la mise initiale, vous perdez tout</li>
              <li className="flex items-center gap-1.5"><CloseIcon className="!w-4 !h-4" /> <span className="text-purple-500 font-semibold">Condition de défaite</span> : Si vous avez 10 mauvaises réponses sur 20 questions, vous perdez tout</li>
            </ul>

            <h3 className="text-purple-500 text-base font-bold my-3">Exemple</h3>
            <ul className="pl-4 mb-4 space-y-1.5">
              <li>• Mise initiale : 1 000 XOF</li>
              <li>• Après 1 bonne réponse : 1 200 XOF (+20%)</li>
              <li>• Après 1 mauvaise réponse : 960 XOF (-20% de 1 200)</li>
              <li>• Si la mise descend à O XOF : Perte immédiate</li>
              <li>• Si 10 mauvaises réponses sur 20 questions : Perte immédiate</li>
            </ul>

            <h3 className="text-purple-500 text-base font-bold my-3">Conseils</h3>
            <ul className="pl-4 mb-4 space-y-1.5">
              <li>• Commencez avec des petites mises pour vous familiariser</li>
              <li>• Surveillez le timer en haut à gauche</li>
              <li>• Essayez de maintenir un bon ratio de bonnes réponses</li>
              <li>• Ne laissez pas votre mise descendre trop bas</li>
              <li>• Le jeu se termine automatiquement après 20 questions</li>
            </ul>

            <p className="text-center mt-5 font-semibold text-purple-500 flex items-center justify-center gap-2">
              <LightbulbIcon />
              Bonne chance et amusez-vous bien !
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}