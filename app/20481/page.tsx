'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
)

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const TargetIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const CloseCircleIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const CrownIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 14h14v2H5v-2z" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const GiftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
)

const CubeFrontIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
)

const DiceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 8h.01" />
    <path d="M8 8h.01" />
    <path d="M8 16h.01" />
    <path d="M16 16h.01" />
    <path d="M12 12h.01" />
  </svg>
)

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const NumberIcon = ({ num }: { num: number }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor" stroke="none">{num}</text>
  </svg>
)

/* ═══════════════════════════════════════════
   LOADER ICON - 8 lignes spinner
   ═══════════════════════════════════════════ */

const LoaderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-yellow-400">
    {/* 4 lignes cardinales (N, S, E, O) */}
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    
    {/* 4 lignes diagonales (NE, SO, NO, SE) */}
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
)

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface ParticleData {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  opacity: number
  life: number
  maxLife: number
}

interface GameState {
  grid: number[]
  score: number
}

interface ObjectifData {
  type: string
  name: string
  target: number
  time: number | null
  description: string
}

interface TileAnimation {
  index: number
  type: 'spawn' | 'merge'
  timestamp: number
}

interface WSMessage {
  type: string
  sessionId?: string
  direction?: string
  timestamp?: number
  betAmount?: number
  gains?: number
  reason?: string
  grid?: number[]
  score?: number
  objectif?: ObjectifData
  result?: string
  new_solde?: number
  amount?: number
  error?: string
  success?: boolean
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function Game2048() {
  useAuth()
  const gridSize = 4
  const MAX_HISTORY = 10

  const [grid, setGrid] = useState<number[]>(Array(gridSize * gridSize).fill(0))
  const [score, setScore] = useState(0)
  const [playerBalance, setPlayerBalance] = useState(0)
  const [currentBet, setCurrentBet] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [gameTime, setGameTime] = useState(0)
  const [objectifCompleted, setObjectifCompleted] = useState(false)
  const [objectifFailed, setObjectifFailed] = useState(false)
  const [objectifTimeLeft, setObjectifTimeLeft] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showMise, setShowMise] = useState(false)
  const [showGame, setShowGame] = useState(false)
  const [showObjectifPopup, setShowObjectifPopup] = useState(false)
  const [showObjectifFailPopup, setShowObjectifFailPopup] = useState(false)
  const [showRulesMise, setShowRulesMise] = useState(false)
  const [showRulesGame, setShowRulesGame] = useState(false)
  const [showGameOverlay, setShowGameOverlay] = useState(false)
  const [gameOverTitle, setGameOverTitle] = useState('Victoire !')
  const [finalMessage, setFinalMessage] = useState("Tu as atteint la tuile 2048 !")
  const [finalScore, setFinalScore] = useState(0)
  const [finalTime, setFinalTime] = useState('00:00')
  const [gainsAmount, setGainsAmount] = useState('0')
  const [objectifFailReason, setObjectifFailReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [objectifFailAmount, setObjectifFailAmount] = useState('0')
  const [objectifFailBalance, setObjectifFailBalance] = useState('0')
  const [objectifTypeText, setObjectifTypeText] = useState('Score en temps limite')
  const [objectifTargetText, setObjectifTargetText] = useState('1000 points')
  const [objectifTimeText, setObjectifTimeText] = useState('60 secondes')
  const [objectifCountdownText, setObjectifCountdownText] = useState('60')
  const [objectifBonusText, setObjectifBonusText] = useState('Double votre mise (x2)')
  const [tileAnimations, setTileAnimations] = useState<TileAnimation[]>([])
  const [mergedIndices, setMergedIndices] = useState<number[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [wsConnected, setWsConnected] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Connexion...')
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [alertType, setAlertType] = useState<'error' | 'success' | 'info'>('error')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<ParticleData[]>([])
  const animFrameRef = useRef<number>(0)
  const betInputRef = useRef<HTMLInputElement>(null)
  const gameStateHistoryRef = useRef<GameState[]>([])
  const gameStartTimeRef = useRef<number>(0)
  const gameTimerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const objectifTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentObjectifRef = useRef<ObjectifData | null>(null)
  const scoreRef = useRef(score)
  const gridRef = useRef(grid)
  const playerBalanceRef = useRef(playerBalance)
  const currentBetRef = useRef(currentBet)
  const isGameActiveRef = useRef(isGameActive)
  const gameTimeRef = useRef(gameTime)
  const objectifCompletedRef = useRef(objectifCompleted)
  const objectifFailedRef = useRef(objectifFailed)
  const objectifTimeLeftRef = useRef(objectifTimeLeft)
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchStartTimeRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const lastTimeRef = useRef<number>(0)
  const spawnQueueRef = useRef<number[]>([])
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef<boolean>(false)
  const pendingResolveRef = useRef<((value: any) => void) | null>(null)
  const pendingRejectRef = useRef<((reason: any) => void) | null>(null)
  const sessionIdRef = useRef<string>('')
  const wsTokenRef = useRef<string | null>(null)
  const wsTimestampRef = useRef<number | null>(null)
  const wsReconnectAttemptsRef = useRef<number>(0)
  const wsReconnectTimerRef = useRef<NodeJS.Timeout | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const objectifReceivedRef = useRef<boolean>(false)
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const gameStartedRef = useRef<boolean>(false)

  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { gridRef.current = grid }, [grid])
  useEffect(() => { playerBalanceRef.current = playerBalance }, [playerBalance])
  useEffect(() => { currentBetRef.current = currentBet }, [currentBet])
  useEffect(() => { isGameActiveRef.current = isGameActive }, [isGameActive])
  useEffect(() => { gameTimeRef.current = gameTime }, [gameTime])
  useEffect(() => { objectifCompletedRef.current = objectifCompleted }, [objectifCompleted])
  useEffect(() => { objectifFailedRef.current = objectifFailed }, [objectifFailed])
  useEffect(() => { objectifTimeLeftRef.current = objectifTimeLeft }, [objectifTimeLeft])
  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])

  const formatNumber = useCallback((num: number): string => {
    return num.toLocaleString('fr-FR')
  }, [])

  /* ── Alert ──────────────────────────────────────────────────────────────── */
  const showAlert = useCallback((message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setAlertMessage(message)
    setAlertType(type)
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current)
    alertTimeoutRef.current = setTimeout(() => {
      setAlertMessage(null)
      alertTimeoutRef.current = null
    }, 5000)
  }, [])

  const hideAlert = useCallback(() => {
    setAlertMessage(null)
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current)
      alertTimeoutRef.current = null
    }
  }, [])

  /* ── Loader ─────────────────────────────────────────────────────────────── */
  const showLoader = useCallback((message: string = 'Connexion...') => {
    setLoadingMessage(message)
    setShowLoading(true)
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }, [])

  const hideLoader = useCallback(() => {
    setShowLoading(false)
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }, [])

  const updateLoaderMessage = useCallback((message: string) => {
    setLoadingMessage(message)
  }, [])

  /* ── Fetch Solde ────────────────────────────────────────────────────────── */
  const fetchSolde = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/get_lettricide_solde')
      
      if (!response.ok) {
        setPlayerBalance(0)
        playerBalanceRef.current = 0
        return
      }

      const data = await response.json()

      if (data && data.solde !== undefined) {
        const newBalance = parseFloat(data.solde) || 0
        setPlayerBalance(newBalance)
        playerBalanceRef.current = newBalance
      } else {
        setPlayerBalance(0)
        playerBalanceRef.current = 0
      }
    } catch (error) {
      setPlayerBalance(0)
      playerBalanceRef.current = 0
    }
  }, [])

  /* ── Send Bet ───────────────────────────────────────────────────────────── */
  const sendBet = useCallback(async (betAmount: number): Promise<{ success: boolean; newBalance?: number; error?: string }> => {
    try {
      const response = await fetchWithAllTokens('/api/cherif', {
        method: 'POST',
        body: JSON.stringify({ bet: betAmount })
      })

      if (!response.ok) {
        return { success: false, error: `Erreur HTTP ${response.status}` }
      }

      const data = await response.json()

      if (data && data.success) {
        const newBalance = parseFloat(data.new_solde) || 0
        setPlayerBalance(newBalance)
        playerBalanceRef.current = newBalance
        return { success: true, newBalance }
      } else {
        return { success: false, error: data?.error || 'Échec de la mise' }
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Erreur lors de la mise' }
    }
  }, [])

  /* ── WebSocket ──────────────────────────────────────────────────────────── */
  const closeWebSocket = useCallback(() => {
    wsReadyRef.current = false
    pendingResolveRef.current = null
    pendingRejectRef.current = null
    if (wsRef.current) {
      try {
        wsRef.current.close()
      } catch (e) {}
      wsRef.current = null
    }
    if (wsReconnectTimerRef.current) {
      clearTimeout(wsReconnectTimerRef.current)
      wsReconnectTimerRef.current = null
    }
    setWsConnected(false)
    objectifReceivedRef.current = false
    gameStartedRef.current = false
  }, [])

  const waitForObjectif = useCallback((): Promise<ObjectifData> => {
    return new Promise((resolve, reject) => {
      if (objectifReceivedRef.current && currentObjectifRef.current) {
        resolve(currentObjectifRef.current)
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('Délai dépassé'))
      }, 10000)

      const checkObjectif = () => {
        if (objectifReceivedRef.current && currentObjectifRef.current) {
          clearTimeout(timeout)
          resolve(currentObjectifRef.current)
        }
      }

      const interval = setInterval(checkObjectif, 100)

      const cleanup = () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }

      const originalResolve = resolve
      const originalReject = reject
      // @ts-ignore
      resolve = (value) => {
        cleanup()
        originalResolve(value)
      }
      // @ts-ignore
      reject = (reason) => {
        cleanup()
        originalReject(reason)
      }
    })
  }, [])

  const waitForGameStarted = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (gameStartedRef.current) {
        resolve()
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('Délai de démarrage dépassé'))
      }, 10000)

      const checkGameStarted = () => {
        if (gameStartedRef.current) {
          clearTimeout(timeout)
          resolve()
        }
      }

      const interval = setInterval(checkGameStarted, 100)

      const cleanup = () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }

      const originalResolve = resolve
      const originalReject = reject
      // @ts-ignore
      resolve = (value) => {
        cleanup()
        originalResolve(value)
      }
      // @ts-ignore
      reject = (reason) => {
        cleanup()
        originalReject(reason)
      }
    })
  }, [])

  const openWebSocket = useCallback((): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      closeWebSocket()

      const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
      const url = proto + window.location.host + '/ws/2048'
      const ws = new WebSocket(url)
      wsRef.current = ws

      const timeout = setTimeout(() => {
        closeWebSocket()
        reject(new Error('Délai de connexion dépassé'))
      }, 10000)

      ws.onopen = async () => {
        try {
          await initAll()
          const authMessage = await prepareWSAuthMessage()
          ws.send(JSON.stringify(authMessage))
        } catch (error) {
          clearTimeout(timeout)
          closeWebSocket()
          reject(new Error('Erreur d\'authentification'))
        }
      }

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)

          if (data.type === 'auth_success') {
            clearTimeout(timeout)
            wsReadyRef.current = true
            setWsConnected(true)
            wsReconnectAttemptsRef.current = 0
            resolve()
            return
          }

          if (data.type === 'init_ok' && data.session_id) {
            setSessionId(data.session_id)
            sessionIdRef.current = data.session_id
            return
          }

          if (data.type === 'objectif') {
            objectifReceivedRef.current = true
            currentObjectifRef.current = data.objectif
            return
          }

          if (data.type === 'game_started') {
            gameStartedRef.current = true
            return
          }

          if (data.type === 'move_result' && data.valid) {
            setGrid(data.grid)
            setScore(data.score)
            return
          }

          if (data.type === 'objectif_result') {
            if (data.result === 'success') {
              setGameOverTitle('Victoire !')
              setFinalMessage(data.reason)
              setFinalScore(scoreRef.current)
              setGainsAmount(formatNumber(data.gains))
              setShowGameOverlay(true)
              createConfetti()
            } else if (data.result === 'fail') {
              setGameOverTitle('Game Over !')
              setFinalMessage(data.reason)
              setFinalScore(scoreRef.current)
              setGainsAmount('0')
              setShowGameOverlay(true)
            }
            return
          }

          if (data.type === 'game_over') {
            setGameOverTitle('Game Over !')
            setFinalMessage(data.reason)
            setFinalScore(scoreRef.current)
            setGainsAmount('0')
            setShowGameOverlay(true)
            return
          }

          if (pendingResolveRef.current) {
            const resolver = pendingResolveRef.current
            pendingResolveRef.current = null
            pendingRejectRef.current = null
            resolver(data)
          }
        } catch (error) {
          clearTimeout(timeout)
          reject(error)
        }
      }

      ws.onerror = () => {
        clearTimeout(timeout)
        closeWebSocket()
        reject(new Error('Erreur WebSocket'))
      }

      ws.onclose = () => {
        wsReadyRef.current = false
        wsRef.current = null
        setWsConnected(false)
        if (pendingRejectRef.current) {
          pendingRejectRef.current(new Error('WebSocket fermé'))
          pendingResolveRef.current = null
          pendingRejectRef.current = null
        }
        if (wsReconnectAttemptsRef.current < 5) {
          wsReconnectAttemptsRef.current++
          wsReconnectTimerRef.current = setTimeout(() => {
            openWebSocket().catch(() => {})
          }, 3000 * wsReconnectAttemptsRef.current)
        }
      }
    })
  }, [closeWebSocket])

  const sendWebSocketMessage = useCallback(async (msg: WSMessage): Promise<any> => {
    if (!wsRef.current || !wsReadyRef.current) {
      await openWebSocket()
    }

    const messageToSend = {
      ...msg,
      sessionId: sessionIdRef.current || undefined,
      timestamp: Date.now()
    }
    wsRef.current.send(JSON.stringify(messageToSend))

    return Promise.resolve()
  }, [openWebSocket])

  const sendWebSocketMessageNoResponse = useCallback(async (msg: WSMessage): Promise<void> => {
    if (!wsRef.current || !wsReadyRef.current) {
      await openWebSocket()
    }
    if (!wsRef.current || !wsReadyRef.current) {
      throw new Error('Non connecté')
    }

    try {
      const messageToSend = {
        ...msg,
        sessionId: sessionIdRef.current || undefined,
        timestamp: Date.now()
      }
      wsRef.current.send(JSON.stringify(messageToSend))
    } catch (error) {
      throw error
    }
  }, [openWebSocket])

  /* ── Canvas Particles ──────────────────────────────────────────────────── */
  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: ParticleData[] = []
    const particleCount = 100

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: Math.random() > 0.5 ? 'rgba(255, 215, 0, 0.6)' : 'rgba(185, 242, 255, 0.6)',
        opacity: Math.random() * 0.5 + 0.2,
        life: Math.random() * 300,
        maxLife: 300 + Math.random() * 200
      })
    }

    particlesRef.current = particles
  }, [])

  const animateParticles = useCallback((timestamp: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp
    }

    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const gradient = ctx.createRadialGradient(
      mouseRef.current.x,
      mouseRef.current.y,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.7
    )

    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.05)')
    gradient.addColorStop(0.5, 'rgba(185, 242, 255, 0.02)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i]
      particle.life -= deltaTime / 16

      if (particle.life <= 0) {
        particle.x = Math.random() * canvas.width
        particle.y = Math.random() * canvas.height
        particle.life = particle.maxLife
        particle.opacity = Math.random() * 0.5 + 0.2
      }

      const lifeRatio = Math.min(1, particle.life / particle.maxLife)
      const opacity = particle.opacity * lifeRatio

      ctx.save()
      ctx.globalAlpha = opacity

      const glowGradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 2
      )

      glowGradient.addColorStop(0, particle.color)
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()

      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const other = particlesRef.current[j]
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 150) {
          ctx.save()
          ctx.globalAlpha = 0.08 * (1 - distance / 150) * lifeRatio
          ctx.strokeStyle = particle.color
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(other.x, other.y)
          ctx.stroke()
          ctx.restore()
        }
      }

      particle.x += particle.speedX
      particle.y += particle.speedY

      if (particle.x > canvas.width + 10) particle.x = -10
      if (particle.x < -10) particle.x = canvas.width + 10
      if (particle.y > canvas.height + 10) particle.y = -10
      if (particle.y < -10) particle.y = canvas.height + 10
    }

    animFrameRef.current = requestAnimationFrame(animateParticles)
  }, [])

  /* ── Objectif ───────────────────────────────────────────────────────────── */
  const generateObjectif = useCallback((): ObjectifData => {
    const objectifs: ObjectifData[] = [
      {
        type: 'score_time',
        name: 'Score en temps limite',
        target: Math.floor(Math.random() * 3 + 1) * 500,
        time: Math.floor(Math.random() * 3 + 1) * 30,
        description: 'Atteindre X points en X secondes'
      },
      {
        type: 'tile_2048',
        name: 'Atteindre 2048',
        target: 2048,
        time: null,
        description: 'Atteindre la tuile 2048'
      }
    ]

    return objectifs[Math.floor(Math.random() * objectifs.length)]
  }, [])

  const showObjectifPopupFn = useCallback((objectifFromServer?: ObjectifData) => {
    let obj: ObjectifData
    if (objectifFromServer) {
      obj = objectifFromServer
    } else {
      obj = generateObjectif()
    }
    currentObjectifRef.current = obj
    setObjectifCompleted(false)
    setObjectifFailed(false)
    objectifCompletedRef.current = false
    objectifFailedRef.current = false

    setObjectifTypeText(obj.name)

    if (obj.type === 'tile_2048') {
      setObjectifTargetText(`Atteindre la tuile ${obj.target}`)
      setObjectifTimeText('Pas de temps limite')
      setObjectifCountdownText('Infini')
      setObjectifBonusText('Double votre mise (x2)')
    } else {
      setObjectifTargetText(`${obj.target} points`)
      setObjectifTimeText(`${obj.time} secondes`)
      setObjectifTimeLeft(obj.time ?? 0)
      objectifTimeLeftRef.current = obj.time ?? 0
      setObjectifCountdownText(String(obj.time ?? 0))
      setObjectifBonusText('Double votre mise (x2)')
    }

    setShowObjectifPopup(true)
  }, [generateObjectif])

  const startObjectifCountdown = useCallback(() => {
    const obj = currentObjectifRef.current
    if (!obj || obj.type !== 'score_time') {
      return
    }

    if (objectifTimerRef.current) {
      clearInterval(objectifTimerRef.current)
    }

    objectifTimerRef.current = setInterval(() => {
      objectifTimeLeftRef.current -= 1
      setObjectifTimeLeft(prev => {
        const newVal = prev - 1
        setObjectifCountdownText(String(Math.max(0, newVal)))
        return newVal
      })

      if (objectifTimeLeftRef.current <= 0) {
        if (objectifTimerRef.current) {
          clearInterval(objectifTimerRef.current)
        }
        if (scoreRef.current < (obj.target ?? 0)) {
          setObjectifFailed(true)
          objectifFailedRef.current = true
          showObjectifFailPopupFn('Temps écoulé ! Score non atteint.')
        }
      }
    }, 1000)
  }, [])

  const showObjectifFailPopupFn = useCallback((reason: string) => {
    setIsGameActive(false)
    isGameActiveRef.current = false
    stopTimer()

    const obj = currentObjectifRef.current

    if (obj && obj.type === 'tile_2048') {
      setObjectifFailReason(`Vous n'avez pas atteint la tuile 2048. ${reason}`)
    } else {
      setObjectifFailReason(
        `Vous n'avez pas atteint ${obj?.target ?? 0} points dans les ${obj?.time ?? 0} secondes imparties.`
      )
    }

    setObjectifFailAmount(`${formatNumber(currentBetRef.current)} XOF`)
    setObjectifFailBalance(`${formatNumber(playerBalanceRef.current)} XOF`)
    setShowObjectifFailPopup(true)
  }, [formatNumber])

  const checkObjectif = useCallback(() => {
    if (objectifCompletedRef.current || !currentObjectifRef.current || objectifFailedRef.current) return

    const obj = currentObjectifRef.current
    let objectiveMet = false

    switch (obj.type) {
      case 'score_time':
        objectiveMet = scoreRef.current >= obj.target
        if (objectiveMet && objectifTimeLeftRef.current > 0) {
          setObjectifCompleted(true)
          objectifCompletedRef.current = true
          if (objectifTimerRef.current) clearInterval(objectifTimerRef.current)
          showVictory()
        }
        break

      case 'tile_2048':
        objectiveMet = gridRef.current.some(cell => cell === 2048)
        if (objectiveMet) {
          setObjectifCompleted(true)
          objectifCompletedRef.current = true
          showVictory()
        }
        break
    }
  }, [])

  const showVictory = useCallback(() => {
    setIsGameActive(false)
    isGameActiveRef.current = false
    stopTimer()

    if (objectifTimerRef.current) {
      clearInterval(objectifTimerRef.current)
    }

    const gains = currentBetRef.current * 2

    setPlayerBalance(prev => {
      const newBal = prev + gains
      playerBalanceRef.current = newBal
      return newBal
    })

    setGameOverTitle('Victoire !')
    setFinalMessage(`Félicitations ! Vous avez atteint l'objectif !`)
    setFinalScore(scoreRef.current)

    const minutes = Math.floor(gameTimeRef.current / 60)
    const seconds = gameTimeRef.current % 60
    setFinalTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)

    setGainsAmount(formatNumber(gains))
    setShowGameOverlay(true)
    createConfetti()
  }, [formatNumber])

  /* ── Timer ──────────────────────────────────────────────────────────────── */
  const startTimer = useCallback(() => {
    gameStartTimeRef.current = Date.now()
    setGameTime(0)
    gameTimeRef.current = 0

    if (gameTimerIntervalRef.current) {
      clearInterval(gameTimerIntervalRef.current)
    }

    gameTimerIntervalRef.current = setInterval(() => {
      const newTime = Math.floor((Date.now() - gameStartTimeRef.current) / 1000)
      setGameTime(newTime)
      gameTimeRef.current = newTime
    }, 1000)

    if (currentObjectifRef.current && currentObjectifRef.current.type === 'score_time') {
      startObjectifCountdown()
    }
  }, [startObjectifCountdown])

  const stopTimer = useCallback(() => {
    if (gameTimerIntervalRef.current) {
      clearInterval(gameTimerIntervalRef.current)
      gameTimerIntervalRef.current = null
    }
  }, [])

  /* ── Game Logic ─────────────────────────────────────────────────────────── */

  const addRandomTile = useCallback((currentGrid: number[]) => {
    const emptyCells = currentGrid
      .map((value, index) => value === 0 ? index : -1)
      .filter(index => index !== -1)

    if (emptyCells.length > 0) {
      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      const newValue = Math.random() < 0.9 ? 2 : 4
      const newGrid = [...currentGrid]
      newGrid[randomIndex] = newValue
      return newGrid
    }

    return currentGrid
  }, [])

  const saveGameState = useCallback((currentGrid: number[], currentScore: number) => {
    const history = gameStateHistoryRef.current
    if (history.length >= MAX_HISTORY) {
      history.shift()
    }
    history.push({ grid: [...currentGrid], score: currentScore })
    gameStateHistoryRef.current = history
  }, [])

  /* ── Confetti System ───────────────────────────────────────────────────── */
  const createConfetti = useCallback(() => {
    const colors = ['#FFD700', '#B9F2FF', '#50C878', '#E0115F', '#0F52BA', '#FF6B6B', '#4ECDC4', '#45B7D1']
    const container = gameContainerRef.current
    if (!container) return

    const confettiCount = 150

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div')
      confetti.className = 'confetti-2048'
      confetti.style.left = `${Math.random() * 100}%`
      confetti.style.top = `${Math.random() * 100}%`
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.width = `${Math.random() * 10 + 5}px`
      confetti.style.height = `${Math.random() * 10 + 5}px`
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
      confetti.style.opacity = '1'
      confetti.style.transform = `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`

      container.appendChild(confetti)

      const animation = confetti.animate(
        [
          {
            transform: `translateY(0) rotate(0deg) scale(1)`,
            opacity: 1
          },
          {
            transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 720 - 360}deg) scale(0)`,
            opacity: 0
          }
        ],
        {
          duration: Math.random() * 3000 + 2000,
          easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
          delay: Math.random() * 500
        }
      )

      animation.onfinish = () => confetti.remove()
    }
  }, [])

  /* ── Actions ───────────────────────────────────────────────────────────── */
  const showMiseSection = useCallback(() => {
    setShowWelcome(false)
    setShowMise(true)
    setShowGame(false)
    setShowObjectifPopup(false)
    setShowObjectifFailPopup(false)
    setTimeout(() => {
      betInputRef.current?.focus()
      betInputRef.current?.select()
    }, 300)
  }, [])

  const showGameSection = useCallback(() => {
    setShowWelcome(false)
    setShowMise(false)
    setShowGame(true)
    setShowObjectifPopup(false)
    setShowObjectifFailPopup(false)
  }, [])

  const startNewGame = useCallback(async () => {
    if (currentBetRef.current === 0) {
      showMiseSection()
      return
    }
    if (currentBetRef.current > playerBalanceRef.current) {
      showAlert('Solde insuffisant !', 'error')
      showMiseSection()
      return
    }

    setIsLoading(true)
    showLoader('Connexion au serveur...')

    try {
      updateLoaderMessage('Authentification...')
      await openWebSocket()

      updateLoaderMessage('Initialisation de la session...')
      await sendWebSocketMessageNoResponse({
        type: 'init',
        betAmount: currentBetRef.current
      })

      updateLoaderMessage('Validation de la mise...')
      const result = await sendBet(currentBetRef.current)
      
      if (!result.success) {
        showAlert(result.error || 'Erreur lors de la mise', 'error')
        setIsLoading(false)
        hideLoader()
        return
      }

      updateLoaderMessage('Récupération de l\'objectif...')
      let objectif: ObjectifData | null = null
      
      try {
        objectif = await waitForObjectif()
      } catch (error) {
        showAlert('Objectif non reçu du serveur', 'error')
        setIsLoading(false)
        hideLoader()
        return
      }

      if (!objectif) {
        showAlert('Objectif non reçu du serveur', 'error')
        setIsLoading(false)
        hideLoader()
        return
      }

      const newBal = playerBalanceRef.current - currentBetRef.current
      setPlayerBalance(newBal)
      playerBalanceRef.current = newBal

      const emptyGrid = Array(gridSize * gridSize).fill(0)
      setGrid(emptyGrid)
      gridRef.current = emptyGrid
      setScore(0)
      scoreRef.current = 0
      gameStateHistoryRef.current = []
      setIsGameActive(false)
      isGameActiveRef.current = false
      setTileAnimations([])
      setMergedIndices([])

      setIsLoading(false)
      hideLoader()
      showObjectifPopupFn(objectif)
    } catch (error: any) {
      showAlert(error.message || 'Erreur lors de la mise', 'error')
      setIsLoading(false)
      hideLoader()
    }
  }, [showMiseSection, showObjectifPopupFn, sendBet, openWebSocket, waitForObjectif, showLoader, hideLoader, sendWebSocketMessageNoResponse, showAlert, updateLoaderMessage])

  const startGameAfterObjectif = useCallback(async () => {
    setIsGameActive(true)
    isGameActiveRef.current = true
    setObjectifFailed(false)
    objectifFailedRef.current = false

    showGameSection()

    try {
      await sendWebSocketMessageNoResponse({
        type: 'objectif_ack'
      })

      await waitForGameStarted()

      startTimer()

      let g = gridRef.current
      if (g.every(cell => cell === 0)) {
        g = addRandomTile(g)
        g = addRandomTile(g)
        setGrid(g)
        gridRef.current = g

        const initialAnimations = g
          .map((val, idx) => val !== 0 ? { index: idx, type: 'spawn' as const, timestamp: Date.now() } : null)
          .filter(Boolean) as TileAnimation[]

        setTileAnimations(initialAnimations)
      }

      setShowGameOverlay(false)
      saveGameState(g, 0)
    } catch (error) {
      showAlert('Erreur de démarrage du jeu', 'error')
      showMiseSection()
    }
  }, [showGameSection, startTimer, addRandomTile, saveGameState, sendWebSocketMessageNoResponse, showMiseSection, showAlert, waitForGameStarted])

  const handleConfirmBet = useCallback(() => {
    const betAmount = parseInt(betInputRef.current?.value ?? '0')

    if (isNaN(betAmount) || betAmount < 100) {
      showAlert('La mise minimum est de 100 XOF', 'error')
      return
    }

    if (betAmount > 1000) {
      showAlert('La mise maximum est de 1000 XOF', 'error')
      return
    }

    if (betAmount > playerBalanceRef.current) {
      showAlert('Solde insuffisant !', 'error')
      return
    }

    setCurrentBet(betAmount)
    currentBetRef.current = betAmount
    startNewGame()
  }, [startNewGame, showAlert])

  const handlePlayAgain = useCallback(() => {
    setShowGameOverlay(false)
    closeWebSocket()
    objectifReceivedRef.current = false
    gameStartedRef.current = false
    showMiseSection()
  }, [showMiseSection, closeWebSocket])

  const handlePlayAgainAfterFail = useCallback(() => {
    setShowObjectifFailPopup(false)
    closeWebSocket()
    objectifReceivedRef.current = false
    gameStartedRef.current = false
    showMiseSection()
  }, [showMiseSection, closeWebSocket])

  /* ── Touch Handlers ────────────────────────────────────────────────────── */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isGameActiveRef.current || !showGame) return
    e.preventDefault()
    touchStartXRef.current = e.touches[0].clientX
    touchStartYRef.current = e.touches[0].clientY
    touchStartTimeRef.current = Date.now()
  }, [showGame])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isGameActiveRef.current || !showGame) return

    if (touchStartXRef.current === null || touchStartYRef.current === null) return

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const touchDuration = Date.now() - touchStartTimeRef.current

    const dx = touchEndX - touchStartXRef.current
    const dy = touchEndY - touchStartYRef.current
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    const minSwipeDistance = 20
    const maxSwipeDuration = 500

    if (touchDuration < maxSwipeDuration && (absDx > minSwipeDistance || absDy > minSwipeDistance)) {
      if (absDx > absDy) {
        if (dx > 0) {
          sendWebSocketMessage({ type: 'move', direction: 'right' })
        } else {
          sendWebSocketMessage({ type: 'move', direction: 'left' })
        }
      } else {
        if (dy > 0) {
          sendWebSocketMessage({ type: 'move', direction: 'down' })
        } else {
          sendWebSocketMessage({ type: 'move', direction: 'up' })
        }
      }
    }

    touchStartXRef.current = null
    touchStartYRef.current = null
  }, [showGame, sendWebSocketMessage])

  /* ── Keyboard Handler ──────────────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGameActiveRef.current || showGameOverlay || !showGame) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          sendWebSocketMessage({ type: 'move', direction: 'left' })
          break
        case 'ArrowRight':
          e.preventDefault()
          sendWebSocketMessage({ type: 'move', direction: 'right' })
          break
        case 'ArrowUp':
          e.preventDefault()
          sendWebSocketMessage({ type: 'move', direction: 'up' })
          break
        case 'ArrowDown':
          e.preventDefault()
          sendWebSocketMessage({ type: 'move', direction: 'down' })
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showGame, showGameOverlay, sendWebSocketMessage])

  /* ── Mouse tracking for particles ──────────────────────────────────────── */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  /* ── Effects ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    initParticles()
    animFrameRef.current = requestAnimationFrame(animateParticles)

    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        initParticles()
      }
    }

    window.addEventListener('resize', handleResize)

    const emptyGrid = Array(gridSize * gridSize).fill(0)
    setGrid(emptyGrid)
    gridRef.current = emptyGrid

    fetchSolde()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animFrameRef.current)
      if (gameTimerIntervalRef.current) clearInterval(gameTimerIntervalRef.current)
      if (objectifTimerRef.current) clearInterval(objectifTimerRef.current)
      closeWebSocket()
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current)
        alertTimeoutRef.current = null
      }
    }
  }, [initParticles, animateParticles, fetchSolde, closeWebSocket])

  /* ── Helpers ────────────────────────────────────────────────────────────── */
  const getTileAnimation = useCallback((index: number) => {
    const spawnAnim = tileAnimations.find(a => a.index === index && a.type === 'spawn')
    const mergeAnim = tileAnimations.find(a => a.index === index && a.type === 'merge')
    return { spawnAnim, mergeAnim }
  }, [tileAnimations])

  const timerDisplay = `${Math.floor(gameTime / 60).toString().padStart(2, '0')}:${(gameTime % 60).toString().padStart(2, '0')}`
  const has2048 = grid.some(cell => cell === 2048)
  const multiplier = has2048 ? 2 : 1
  const potentialGains = has2048 ? currentBet * multiplier : 0

  const getTileStyles = (value: number): string => {
    const base = 'absolute w-[calc(100%-8px)] h-[calc(100%-8px)] flex items-center justify-center font-bold rounded-xl transition-transform duration-150 preserve-3d perspective-[500px]'

    const styles: Record<number, string> = {
      2: 'bg-gradient-to-br from-[#3A506B] to-[#1C2541] text-[#B0BEC5] text-3xl shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.1)]',
      4: 'bg-gradient-to-br from-[#4A6FA5] to-[#2E4A76] text-[#CFD8DC] text-3xl shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.1)]',
      8: 'bg-gradient-to-br from-[#00695C] to-[#004D40] text-[#80CBC4] text-3xl shadow-[0_10px_25px_rgba(0,105,92,0.4),0_0_20px_rgba(0,105,92,0.3),inset_0_2px_4px_rgba(255,255,255,0.1)]',
      16: 'bg-gradient-to-br from-[#00796B] to-[#004D40] text-[#A7FFEB] text-3xl shadow-[0_10px_25px_rgba(0,121,107,0.4),0_0_25px_rgba(0,121,107,0.3),inset_0_2px_4px_rgba(255,255,255,0.1)]',
      32: 'bg-gradient-to-br from-[#0288D1] to-[#01579B] text-[#B3E5FC] text-3xl shadow-[0_10px_25px_rgba(2,136,209,0.5),0_0_30px_rgba(2,136,209,0.3),inset_0_2px_4px_rgba(255,255,255,0.1)]',
      64: 'bg-gradient-to-br from-[#0288D1] to-[#0D47A1] text-[#81D4FA] text-3xl shadow-[0_10px_25px_rgba(2,136,209,0.6),0_0_35px_rgba(2,136,209,0.4),inset_0_2px_4px_rgba(255,255,255,0.1)]',
      128: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black text-2xl shadow-[0_12px_30px_rgba(255,215,0,0.5),0_0_40px_rgba(255,215,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.2)] animate-[goldShine_3s_infinite]',
      256: 'bg-gradient-to-br from-[#E5E4E2] to-[#C0C0C0] text-black text-2xl shadow-[0_12px_30px_rgba(229,228,226,0.5),0_0_40px_rgba(229,228,226,0.3),inset_0_2px_4px_rgba(255,255,255,0.3)] animate-[platinumShine_3s_infinite]',
      512: 'bg-gradient-to-br from-emerald-400 to-emerald-700 text-white text-2xl shadow-[0_12px_30px_rgba(80,200,120,0.6),0_0_45px_rgba(80,200,120,0.4),inset_0_2px_4px_rgba(255,255,255,0.2)] animate-[emeraldPulse_2s_infinite]',
      1024: 'bg-gradient-to-br from-blue-700 to-blue-950 text-white text-xl shadow-[0_14px_35px_rgba(15,82,186,0.6),0_0_50px_rgba(15,82,186,0.4),inset_0_2px_4px_rgba(255,255,255,0.2)] animate-[sapphireGlow_2s_infinite]',
      2048: 'bg-gradient-to-br from-red-600 to-red-950 text-white text-xl shadow-[0_16px_40px_rgba(224,17,95,0.7),0_0_60px_rgba(224,17,95,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)] animate-[rubyPulse_1.5s_infinite]'
    }

    return `${base} ${styles[value] || ''}`
  }

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen font-['Inter',system-ui,sans-serif] text-[#E5E4E2] overflow-x-hidden bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] perspective-[1000px]">

      {/* Alert */}
      {alertMessage && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-xl shadow-2xl max-w-[90%] sm:max-w-md animate-[slideDown_0.3s_ease-out] ${
            alertType === 'error' 
              ? 'bg-red-500/90 backdrop-blur-md border border-red-400 text-white' 
              : alertType === 'success'
              ? 'bg-emerald-500/90 backdrop-blur-md border border-emerald-400 text-white'
              : 'bg-blue-500/90 backdrop-blur-md border border-blue-400 text-white'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="font-medium text-sm sm:text-base">{alertMessage}</p>
            <button
              onClick={hideAlert}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-[1] pointer-events-none"
      />

      {/* Floating Orbs */}
      <div className="absolute w-[150px] h-[150px] rounded-full blur-[30px] z-[2] pointer-events-none top-[10%] left-[5%] bg-[radial-gradient(circle,rgba(255,215,0,0.15)_0%,transparent_70%)] animate-[float3D_20s_infinite_ease-in-out]" />
      <div className="absolute w-[200px] h-[200px] rounded-full blur-[30px] z-[2] pointer-events-none top-[70%] right-[10%] bg-[radial-gradient(circle,rgba(185,242,255,0.15)_0%,transparent_70%)] animate-[float3D_20s_infinite_ease-in-out_5s]" />
      <div className="absolute w-[120px] h-[120px] rounded-full blur-[30px] z-[2] pointer-events-none bottom-[20%] left-[15%] bg-[radial-gradient(circle,rgba(224,17,95,0.1)_0%,transparent_70%)] animate-[float3D_20s_infinite_ease-in-out_10s]" />

      {/* ══════════════════════════════════════ */}
      {/* LOADER OVERLAY */}
      {/* ══════════════════════════════════════ */}
      {showLoading && (
        <div className="fixed inset-0 bg-[#0a0e17]/90 backdrop-blur-xl flex flex-col items-center justify-center z-[5000]">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.4)] mb-6 animate-pulse">
            <LoaderIcon />
          </div>
          <p className="text-lg font-semibold text-white/90 animate-pulse">{loadingMessage}</p>
          <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-600 animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* WELCOME SCREEN */}
      {/* ══════════════════════════════════════ */}
      {showWelcome && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex flex-col items-center justify-center z-[2000] p-5 text-center">
          <div className="bg-black/95 rounded-3xl p-8 sm:p-10 max-w-[450px] w-[90%] border-2 border-yellow-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(255,215,0,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]">

            {/* 3D Cube */}
            <div className="perspective-[800px] mb-5 h-[100px] flex items-center justify-center">
              <div
                className="w-20 h-20 relative animate-[rotateCube_8s_infinite_linear]"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {[
                  { face: 'front', transform: 'translateZ(40px)', icon: <NumberIcon num={2048} /> },
                  { face: 'back', transform: 'rotateY(180deg) translateZ(40px)', icon: <DiceIcon /> },
                  { face: 'right', transform: 'rotateY(90deg) translateZ(40px)', icon: <CoinsIcon /> },
                  { face: 'left', transform: 'rotateY(-90deg) translateZ(40px)', icon: <CrownIcon /> },
                  { face: 'top', transform: 'rotateX(90deg) translateZ(40px)', icon: <StarIcon /> },
                  { face: 'bottom', transform: 'rotateX(-90deg) translateZ(40px)', icon: <TargetIcon /> }
                ].map(({ face, transform, icon }) => (
                  <div
                    key={face}
                    className="absolute w-20 h-20 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-200 shadow-[0_0_20px_rgba(255,215,0,0.3)] rounded-xl"
                    style={{ transform }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-5 bg-gradient-to-r from-yellow-400 via-emerald-400 to-cyan-300 bg-clip-text text-transparent font-['Playfair_Display',serif]">
              2048
            </h1>

            <p className="text-base sm:text-lg mb-6 text-[#E5E4E2]/90 leading-relaxed">
              Bienvenue dans le jeu 2048
              <br />
              Atteignez la tuile 2048 pour obtenir des récompenses !
              <br />
              Chaque partie nécessite une mise pour pouvoir jouer.
            </p>

            <button
              onClick={showMiseSection}
              className="w-full py-3.5 px-8 bg-gradient-to-r from-yellow-600 to-yellow-400 border-2 border-transparent rounded-full text-black font-semibold text-lg uppercase tracking-[1px] hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(255,215,0,0.4),0_0_60px_rgba(255,215,0,0.2)] hover:border-yellow-200 transition-all duration-400 flex items-center justify-center gap-3 relative overflow-hidden before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent hover:before:left-full before:transition-all before:duration-500"
            >
              <PlayIcon />
              Commencer l&apos;aventure
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* MISE SECTION */}
      {/* ══════════════════════════════════════ */}
      {showMise && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex flex-col items-center justify-center z-[1500] p-5">
          <div className="bg-black/95 rounded-3xl p-7 sm:p-9 max-w-[450px] w-[90%] border-2 border-yellow-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(255,215,0,0.1)] max-h-[90vh] overflow-y-auto">

            {/* Coin Icon */}
            <div className="flex justify-center mb-5 text-5xl text-yellow-400 animate-[coinSpin3D_2s_infinite_ease-in-out] drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
              <CoinsIcon />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-5 bg-gradient-to-r from-yellow-400 to-emerald-400 bg-clip-text text-transparent text-center font-['Playfair_Display',serif]">
              Placez votre mise
            </h2>

            <p className="text-center mb-4 text-[#E5E4E2] text-sm">
              La mise est obligatoire pour commencer à jouer.
            </p>

            {/* Balance */}
            <div className="bg-black/80 rounded-2xl p-4 mb-5 border border-white/10 flex justify-between items-center">
              <div>
                <div className="text-xs text-[#E5E4E2]/80 uppercase tracking-[1.5px]">
                  Votre Solde
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                  {formatNumber(playerBalance)}
                  <span className="text-emerald-400 text-lg ml-1.5">XOF</span>
                </div>
              </div>
            </div>

            {/* Bet Input */}
            <div className="mb-6 text-center">
              <input
                type="number"
                ref={betInputRef}
                placeholder="Montant en XOF"
                min="100"
                max="1000"
                step="100"
                defaultValue="100"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement
                  let value = parseInt(target.value)
                  if (value < 100) target.value = '100'
                  else if (value > 1000) target.value = '1000'
                }}
                className="w-full bg-white/[0.08] border-2 border-white/[0.15] rounded-2xl text-yellow-400 text-2xl font-bold py-4 px-4 text-center mb-2.5 transition-all duration-300 focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_30px_rgba(255,215,0,0.3),inset_0_0_20px_rgba(255,215,0,0.05)] focus:scale-[1.02] placeholder:text-white/30"
              />
              <div className="text-xs text-[#E5E4E2]/70 mt-2">
                Mise minimum: 100 XOF | Mise maximum: 1000 XOF
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmBet}
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-400 border-2 border-transparent rounded-full text-black font-semibold text-base uppercase tracking-[1.5px] hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(255,215,0,0.4),0_0_50px_rgba(255,215,0,0.2)] hover:border-yellow-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-400 flex items-center justify-center gap-3 relative overflow-hidden before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent hover:before:left-full before:transition-all before:duration-500 mb-3"
            >
              <span className={isLoading ? 'opacity-0' : 'opacity-100 flex items-center gap-3'}>
                <CheckIcon />
                Confirmer et Jouer
              </span>
              {isLoading && (
                <div className="absolute w-7 h-7 border-[3px] border-white/30 border-t-yellow-400 rounded-full animate-spin" />
              )}
            </button>

            {/* Rules Button */}
            <button
              onClick={() => { setShowMise(false); setShowRulesMise(true) }}
              className="w-full py-3.5 bg-white/[0.05] border-2 border-white/[0.1] rounded-full text-[#E5E4E2] font-semibold text-sm uppercase tracking-[1.5px] hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(0,0,0,0.3),0_0_30px_rgba(255,215,0,0.2)] hover:border-yellow-400 hover:text-yellow-400 transition-all duration-300 flex items-center justify-center gap-2.5"
            >
              <BookIcon />
              Voir les Règles d&apos;abord
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* OBJECTIF POPUP */}
      {/* ══════════════════════════════════════ */}
      {showObjectifPopup && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center z-[1800] p-4">
          <div className="bg-black/98 rounded-3xl p-6 sm:p-8 max-w-[420px] w-[90%] border-2 border-yellow-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_60px_rgba(255,215,0,0.15)] text-center max-h-[85vh] overflow-y-auto">

            <div className="flex justify-center mb-5 text-5xl text-yellow-400 animate-[targetPulse_2s_infinite_ease-in-out] drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
              <TargetIcon />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-emerald-400 bg-clip-text text-transparent font-['Playfair_Display',serif]">
              Objectif de la Partie
            </h2>

            <p className="text-sm mb-5 text-[#E5E4E2]/90">
              Un objectif aléatoire vous a été attribué. Atteignez-le pour gagner !
            </p>

            <div className="bg-yellow-400/8 rounded-2xl p-5 mb-5 border border-yellow-400/20">
              {[
                { label: "Type d'objectif :", value: objectifTypeText },
                { label: "Objectif à atteindre :", value: objectifTargetText },
                { label: "Temps limite :", value: objectifTimeText }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center py-2.5 ${i < 2 ? 'border-b border-white/[0.08]' : ''}`}
                >
                  <span className="text-sm text-[#E5E4E2]/80 text-left flex-1">
                    {item.label}
                  </span>
                  <span className="text-base font-bold text-yellow-400 text-right flex-1">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-xl font-bold text-emerald-400 mb-4 flex items-center justify-center gap-2">
              <ClockIcon />
              <span>{objectifCountdownText}</span> secondes restantes
            </div>

            <div className="text-base text-cyan-300 mb-5 p-4 bg-cyan-400/8 rounded-xl border border-cyan-400/20 flex items-center justify-center gap-2">
              <GiftIcon />
              Récompense : <span className="text-yellow-400 font-bold">{objectifBonusText}</span>
            </div>

            <button
              onClick={() => { setShowObjectifPopup(false); startGameAfterObjectif() }}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full text-black font-semibold text-base uppercase tracking-[1.5px] hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(255,215,0,0.4)] transition-all duration-400 flex items-center justify-center gap-3"
            >
              <PlayIcon />
              Commencer le jeu
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* OBJECTIF FAIL POPUP */}
      {/* ══════════════════════════════════════ */}
      {showObjectifFailPopup && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center z-[1900] p-4">
          <div className="bg-black/98 rounded-3xl p-6 sm:p-8 max-w-[420px] w-[90%] border-2 border-red-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_60px_rgba(224,17,95,0.15)] text-center max-h-[85vh] overflow-y-auto">

            <div className="flex justify-center mb-5 text-5xl text-red-500 animate-[failShake_0.5s_infinite_ease-in-out]">
              <CloseCircleIcon />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-800 bg-clip-text text-transparent font-['Playfair_Display',serif]">
              Objectif Non Atteint !
            </h2>

            <p className="text-sm mb-5 text-[#E5E4E2]/90">
              {objectifFailReason}
            </p>

            <div className="bg-red-500/10 rounded-2xl p-5 mb-5 border border-red-500/20">
              <div className="flex justify-between items-center py-2.5 border-b border-white/[0.08]">
                <span className="text-sm text-[#E5E4E2]/80">Mise perdue :</span>
                <span className="text-base font-bold text-red-500">{objectifFailAmount}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-[#E5E4E2]/80">Nouveau solde :</span>
                <span className="text-base font-bold text-[#E5E4E2]">{objectifFailBalance}</span>
              </div>
            </div>

            <button
              onClick={handlePlayAgainAfterFail}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-800 rounded-full text-white font-semibold text-base uppercase tracking-[1.5px] hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(224,17,95,0.4)] transition-all duration-400 flex items-center justify-center gap-3"
            >
              <RefreshIcon />
              Rejouer avec nouvelle mise
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* GAME SECTION */}
      {/* ══════════════════════════════════════ */}
      {showGame && (
        <div className="relative z-10 w-full max-w-[600px] mx-auto p-4 sm:p-6 flex flex-col items-center justify-center min-h-screen pt-20 sm:pt-24 pb-20">

          {/* Rules Button (floating) */}
          <button
            onClick={() => setShowRulesGame(true)}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-yellow-600 to-yellow-400 border-2 border-yellow-200 rounded-full text-black text-xl cursor-pointer hover:-translate-y-2 hover:scale-110 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4),0_0_40px_rgba(255,215,0,0.5)] transition-all duration-300 flex items-center justify-center z-[100] shadow-[0_10px_25px_rgba(0,0,0,0.3),0_0_25px_rgba(255,215,0,0.3)]"
          >
            <BookIcon />
          </button>

          {/* Balance & Bet */}
          <div className="bg-black/80 rounded-2xl p-3 sm:p-4 mb-5 border border-white/10 flex justify-between items-center w-full max-w-[600px] shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <div>
              <div className="text-xs text-[#E5E4E2]/80 uppercase tracking-[1.5px]">Votre Solde</div>
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                {formatNumber(playerBalance)}
                <span className="text-emerald-400 text-base sm:text-lg ml-1.5">XOF</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#E5E4E2]/80 uppercase tracking-[1.5px]">Mise Actuelle</div>
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                {formatNumber(currentBet)}
                <span className="text-emerald-400 text-base sm:text-lg ml-1.5">XOF</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2.5 scrollbar-thin w-full max-w-[600px]">
            {[
              { label: 'Score', value: score, color: '', sub: null },
              {
                label: 'Gains Potentiel',
                value: `${formatNumber(potentialGains)} XOF`,
                color: '',
                sub: (
                  <div className="text-xs text-cyan-300 mt-1">
                    Multiplicateur: x{multiplier}
                  </div>
                )
              },
              {
                label: 'Temps',
                value: timerDisplay,
                color: '',
                sub: (
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm mt-1">
                    <ClockIcon />
                    <span>Temps de jeu</span>
                  </div>
                )
              }
            ].map((stat, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-black/80 rounded-2xl py-3 px-4 sm:py-4 sm:px-5 border border-white/10 min-w-[130px] sm:min-w-[150px] text-center relative overflow-hidden hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(255,215,0,0.2)] hover:border-yellow-400/30 transition-all duration-300 before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-yellow-400 before:via-emerald-400 before:to-cyan-300 before:rounded-b-[3px]"
              >
                <div className="text-[10px] sm:text-xs text-[#E5E4E2]/70 uppercase tracking-[1.5px] mb-1.5 whitespace-nowrap">
                  {stat.label}
                </div>
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent whitespace-nowrap">
                  {stat.value}
                </div>
                {stat.sub && stat.sub}
              </div>
            ))}
          </div>

          {/* Game Grid */}
          <div
            ref={gameContainerRef}
            className="bg-black/80 rounded-2xl p-4 sm:p-5 border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(255,215,0,0.1)] mb-8 relative w-full max-w-[600px]"
          >
            <div
              className="grid grid-cols-4 gap-2.5 sm:gap-3 bg-white/[0.03] rounded-2xl p-3 sm:p-4 aspect-square"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {grid.map((value, index) => {
                const { spawnAnim, mergeAnim } = getTileAnimation(index)
                const isMerged = mergedIndices.includes(index)

                return (
                  <div
                    key={index}
                    className="aspect-square bg-white/[0.03] rounded-xl flex items-center justify-center relative overflow-visible"
                  >
                    {value !== 0 && (
                      <div
                        className={`
                          ${getTileStyles(value)}
                          ${spawnAnim ? 'animate-[spawn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]' : ''}
                          ${mergeAnim || isMerged ? 'animate-[merge_0.3s_ease]' : ''}
                        `}
                      >
                        <span className="relative z-[2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                          {value}
                        </span>
                        <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[radial-gradient(circle,rgba(255,215,0,0.3)_0%,transparent_70%)]" />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Game Over Overlay */}
            {showGameOverlay && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center z-20 rounded-2xl">
                <div className="text-center p-6 sm:p-8 bg-black/98 rounded-3xl border-2 border-yellow-400/30 max-w-[400px] w-[90%] shadow-[0_25px_50px_rgba(0,0,0,0.8)]">

                  <div className="flex justify-center mb-5 text-6xl text-yellow-400 animate-[crownFloat_2s_infinite_ease-in-out]">
                    <CrownIcon />
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold mb-5 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent font-['Playfair_Display',serif]">
                    {gameOverTitle}
                  </h2>

                  <p className="text-base mb-2.5">{finalMessage}</p>

                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent mb-2">
                    {finalScore}
                  </div>

                  <div className="text-cyan-300 mb-2 text-sm">
                    Temps: <span>{finalTime}</span>
                  </div>

                  <div className="text-emerald-400 text-base mb-5">
                    Gains : <span>{gainsAmount}</span> XOF
                  </div>

                  <button
                    onClick={handlePlayAgain}
                    className="w-full py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full text-black font-semibold text-base uppercase tracking-[1.5px] hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(255,215,0,0.4)] transition-all duration-400 flex items-center justify-center gap-3"
                  >
                    <RefreshIcon />
                    Rejouer avec nouvelle mise
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* RULES POPUP (MISE) */}
      {/* ══════════════════════════════════════ */}
      {showRulesMise && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[2000] p-4">
          <div className="bg-black/98 rounded-3xl p-6 sm:p-8 max-w-[420px] w-[90%] border-2 border-yellow-400/30 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,215,0,0.1)] max-h-[85vh] overflow-y-auto">

            <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-emerald-400 bg-clip-text text-transparent text-center font-['Playfair_Display',serif]">
              Règles du Jeu
            </h2>

            <div className="bg-black/80 rounded-2xl p-4 mb-4 border border-white/10 flex justify-between items-center">
              <div>
                <div className="text-xs text-[#E5E4E2]/80 uppercase tracking-[1.5px]">Mise en cours</div>
                <div className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                  {formatNumber(currentBet)}
                  <span className="text-emerald-400 text-base ml-1.5">XOF</span>
                </div>
              </div>
            </div>

            <ul className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin mb-5">
              {[
                'Utilisez les touches fléchées ou glissez votre doigt pour déplacer les tuiles.',
                'Les tuiles de même valeur fusionnent pour former une tuile de valeur double.',
                'Chaque fusion ajoute des points à votre score.',
                'Objectif principal : Atteindre la tuile 2048.',
                'Votre mise initiale détermine vos gains potentiels.',
                'Si vous atteignez l\'objectif, vous doublez votre mise (x2) !',
                'Le jeu s\'arrête quand plus aucun mouvement n\'est possible.'
              ].map((rule, i) => (
                <li
                  key={i}
                  className="py-3 border-b border-white/[0.08] flex items-start gap-3 text-sm text-[#E5E4E2] leading-relaxed hover:translate-x-1.5 hover:bg-yellow-400/5 rounded-lg pl-2 transition-all duration-300"
                >
                  <span className="text-yellow-400 text-base min-w-[25px] mt-0.5">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => { setShowRulesMise(false); setShowMise(true) }}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full text-black font-semibold text-base uppercase tracking-[1.5px] hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(255,215,0,0.4)] transition-all duration-400 flex items-center justify-center gap-3"
            >
              <PlayIcon />
              Retour à la mise
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* RULES POPUP (GAME) */}
      {/* ══════════════════════════════════════ */}
      {showRulesGame && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[2000] p-4">
          <div className="bg-black/98 rounded-3xl p-6 sm:p-8 max-w-[420px] w-[90%] border-2 border-yellow-400/30 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,215,0,0.1)] max-h-[85vh] overflow-y-auto">

            <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-emerald-400 bg-clip-text text-transparent text-center font-['Playfair_Display',serif]">
              Règles du Jeu
            </h2>

            <div className="bg-black/80 rounded-2xl p-4 mb-4 border border-white/10 flex justify-between items-center">
              <div>
                <div className="text-xs text-[#E5E4E2]/80 uppercase tracking-[1.5px]">Mise en cours</div>
                <div className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                  {formatNumber(currentBet)}
                  <span className="text-emerald-400 text-base ml-1.5">XOF</span>
                </div>
              </div>
            </div>

            <ul className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin mb-5">
              {[
                'Utilisez les touches fléchées ou glissez votre doigt pour déplacer les tuiles.',
                'Les tuiles de même valeur fusionnent pour former une tuile de valeur double.',
                'Chaque fusion ajoute des points à votre score.',
                'Objectif principal : Atteindre la tuile 2048.',
                'Votre mise initiale détermine vos gains potentiels.',
                'Si vous atteignez l\'objectif, vous doublez votre mise (x2) !',
                'Le jeu s\'arrête quand plus aucun mouvement n\'est possible.'
              ].map((rule, i) => (
                <li
                  key={i}
                  className="py-3 border-b border-white/[0.08] flex items-start gap-3 text-sm text-[#E5E4E2] leading-relaxed hover:translate-x-1.5 hover:bg-yellow-400/5 rounded-lg pl-2 transition-all duration-300"
                >
                  <span className="text-yellow-400 text-base min-w-[25px] mt-0.5">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => { setShowRulesGame(false); setShowGame(true) }}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full text-black font-semibold text-base uppercase tracking-[1.5px] hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgba(255,215,0,0.4)] transition-all duration-400 flex items-center justify-center gap-3"
            >
              <PlayIcon />
              Retour au jeu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}