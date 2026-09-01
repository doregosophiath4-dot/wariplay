'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */
const TrophyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const ExplosionIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const HourglassIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300">
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
  </svg>
)

const LightningIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-300">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const TargetIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const ClockIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const GamepadIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
    <line x1="6" y1="11" x2="10" y2="11" />
    <line x1="8" y1="9" x2="8" y2="13" />
    <line x1="15" y1="12" x2="15.01" y2="12" />
    <line x1="18" y1="10" x2="18.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
)

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const RocketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const LoaderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-white">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
)

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
type GameState = 'bet' | 'objective' | 'playing' | 'gameover' | 'won' | 'lost' | 'loading'

type ObjectiveType = 'time' | 'score' | 'clouds' | 'jumps' | 'speed'

interface Objective {
  type: ObjectiveType
  name: string
  description: string
  target: number
  multiplier: number
  icon: JSX.Element
  shortLabel: string
}

interface Ball {
  x: number
  y: number
  radius: number
  velocity: number
  emoji: string
}

interface Cloud {
  x: number
  y: number
  size: number
  emoji: string
  speed: number
  hasBeenAvoided: boolean
}

/* ═══════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════ */
const BALL_SIZE_PERCENT = 3.5
const CLOUD_EMOJIS = ['☁️', '🌧️', '⛈️', '🌨️', '🌥️', '🌦️']
const GAME_DURATION = 120
const HEARTBEAT_INTERVAL = 3000

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

function getObjectiveIcon(type: ObjectiveType) {
  switch (type) {
    case 'time': return <ClockIcon />
    case 'score': return <TargetIcon />
    case 'clouds': return <LightningIcon />
    case 'jumps': return <RocketIcon />
    case 'speed': return <LightningIcon />
    default: return <TargetIcon />
  }
}

/* ═══════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════ */
export default function ClouRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [gameState, setGameState] = useState<GameState>('bet')
  const [betInput, setBetInput] = useState('100')
  const [objective, setObjective] = useState<Objective | null>(null)
  const [scoreUI, setScoreUI] = useState(0)
  const [betAmountUI, setBetAmountUI] = useState(0)
  const [timeUI, setTimeUI] = useState(GAME_DURATION)
  const [objProgress, setObjProgress] = useState(0)
  const [objDone, setObjDone] = useState(false)
  const [resultAmount, setResultAmount] = useState(0)
  const [totalBalance, setTotalBalance] = useState(0)
  const [failReason, setFailReason] = useState('')
  const [notification, setNotification] = useState('')
  const [userSolde, setUserSolde] = useState(0)
  const [loadingText, setLoadingText] = useState('')

  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef(false)
  const pendingResolveRef = useRef<((d: any) => void) | null>(null)
  const pendingRejectRef = useRef<((er: Error) => void) | null>(null)
  const winConditionRef = useRef<any>(null)
  const isCheckingWinRef = useRef(false)
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cloudsAvoidedRef = useRef(0)
  const consecutiveJumpsRef = useRef(0)
  const wasOnGroundRef = useRef(true)
  const isJumpingRef = useRef(false)

  const G = useRef({
    over: false,
    score: 0,
    betAmount: 0,
    initialBet: 0,
    timeLeft: GAME_DURATION,
    elapsed: 0,
    pressing: false,
    keys: {} as Record<string, boolean>,
    gravity: 0.1,
    cloudSpeed: 2,
    cloudFreq: 2000,
    lift: -3,
    cloudMult: 1,
    clouds: [] as Cloud[],
    ball: { x: 0, y: 0, radius: 30, velocity: 0, emoji: '⚽' } as Ball,
    raf: 0,
    tCloud: 0 as unknown as ReturnType<typeof setInterval>,
    tScore: 0 as unknown as ReturnType<typeof setInterval>,
    tTimer: 0 as unknown as ReturnType<typeof setInterval>,
    objective: null as Objective | null,
    objectiveAchieved: false
  })

  const showNotification = useCallback((message: string) => {
    setNotification(message)
    setTimeout(() => {
      setNotification('')
    }, 3000)
  }, [])

  const clearHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  const startHeartbeat = useCallback(() => {
    clearHeartbeat()
    heartbeatIntervalRef.current = setInterval(() => {
      const g = G.current
      if (!g.over && wsRef.current && wsReadyRef.current) {
        wsRef.current.send(JSON.stringify({
          action: 'heartbeat',
          payload: {
            score: g.score,
            remainingTime: g.timeLeft
          }
        }))
      }
    }, HEARTBEAT_INTERVAL)
  }, [clearHeartbeat])

  const closeWebSocket = useCallback(() => {
    clearHeartbeat()
    wsReadyRef.current = false
    pendingResolveRef.current = null
    pendingRejectRef.current = null
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [clearHeartbeat])

  const openWebSocket = useCallback((): Promise<void> => new Promise(async (resolve, reject) => {
    if (wsRef.current && wsReadyRef.current) {
      resolve()
      return
    }
    closeWebSocket()
    const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
    const ws = new WebSocket(proto + window.location.host + '/ws/game')
    wsRef.current = ws
    const t = setTimeout(() => {
      closeWebSocket()
      reject(new Error('Timeout'))
    }, 10000)
    ws.onopen = async () => {
      await initAll()  // ← Initialiser les tokens d'abord
      const am = await prepareWSAuthMessage()
      ws.send(JSON.stringify(am))
    }
    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data)
        if (d.type === 'auth_success') {
          clearTimeout(t)
          wsReadyRef.current = true
          resolve()
          return
        }
        if (d.event === 'honor') {
          if (d.condition) {
            winConditionRef.current = {
              type: d.condition.type,
              name: d.condition.name,
              description: d.condition.description,
              target: d.condition.target || 0
            }
            const obj: Objective = {
              type: d.condition.type,
              name: d.condition.name,
              description: d.condition.description,
              target: d.condition.target || 0,
              multiplier: 2.0,
              icon: getObjectiveIcon(d.condition.type),
              shortLabel: d.condition.description
            }
            setObjective(obj)
            setGameState('objective')
          }
        }
        else if (d.event === 'mindset_result') {
          isCheckingWinRef.current = false
          clearHeartbeat()
          if (d.has_won) {
            if (d.new_solde > 0) {
              setUserSolde(d.new_solde)
            }
            endGameBackend(true, d.gain_final, d.cheat_detected, d.cheat_reason)
          } else {
            if (d.cheat_detected) {
              setFailReason(d.reason || "Triche detectee - Donnees invalides.")
              setGameState('lost')
            } else {
              endGameBackend(false)
            }
          }
        }
        else if (d.event === 'heartbeat_ack') {
          // Heartbeat acknowledged
        }
        else if (d.event === 'error') {
          showNotification(d.error || 'Erreur serveur')
          isCheckingWinRef.current = false
          if (gameState === 'loading') {
            setGameState('bet')
            setLoadingText('')
          }
        }
        if (pendingResolveRef.current) {
          const rf = pendingResolveRef.current
          pendingResolveRef.current = null
          pendingRejectRef.current = null
          rf(d)
        }
      } catch (er) {
        clearTimeout(t)
        reject(er as Error)
      }
    }
    ws.onerror = () => {
      clearTimeout(t)
      closeWebSocket()
      reject(new Error('Erreur WS'))
    }
    ws.onclose = () => {
      wsReadyRef.current = false
      wsRef.current = null
      if (pendingRejectRef.current) {
        pendingRejectRef.current(new Error('WS ferme'))
        pendingResolveRef.current = null
        pendingRejectRef.current = null
      }
    }
  }), [closeWebSocket, showNotification, gameState])

  const sendWebSocketMessage = useCallback(async (msg: any): Promise<any> => {
    await openWebSocket()
    return new Promise((resolve, reject) => {
      if (!wsRef.current || !wsReadyRef.current) {
        reject(new Error('Non connecte'))
        return
      }
      const t = setTimeout(() => {
        pendingResolveRef.current = null
        pendingRejectRef.current = null
        reject(new Error('Timeout'))
      }, 10000)
      pendingResolveRef.current = (d) => {
        clearTimeout(t)
        resolve(d)
      }
      pendingRejectRef.current = (er) => {
        clearTimeout(t)
        reject(er)
      }
      wsRef.current.send(JSON.stringify(msg))
    })
  }, [openWebSocket])

  const fetchSolde = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/get_lettricide_solde')
      const data = await response.json()
      const solde = parseFloat(data.solde) || 0
      setUserSolde(solde)
    } catch (error) {
      showNotification('Erreur de chargement du solde')
    }
  }, [showNotification])

  const sendBetToBackend = useCallback(async (betAmount: number) => {
    try {
      const response = await fetchWithAllTokens('/api/cherif', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bet: betAmount })
      })
      const data = await response.json()
      if (data.success) {
        setUserSolde(parseFloat(data.new_solde))
        return { success: true, new_solde: data.new_solde }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: "Erreur de connexion" }
    }
  }, [])

  const getWinCondition = useCallback(async () => {
    try {
      await sendWebSocketMessage({ action: 'get_honor' })
      return true
    } catch {
      showNotification('Erreur de connexion au serveur')
      return false
    }
  }, [sendWebSocketMessage, showNotification])

  const checkWinCondition = useCallback(async () => {
    if (isCheckingWinRef.current || G.current.over) {
      return
    }
    isCheckingWinRef.current = true
    const g = G.current
    const payload = {
      score: g.score,
      remainingTime: g.timeLeft,
      cloudsAvoided: cloudsAvoidedRef.current,
      cloudSpeed: parseFloat(g.cloudSpeed.toFixed(2)),
      consecutiveJumps: consecutiveJumpsRef.current,
      winConditionType: winConditionRef.current ? winConditionRef.current.type : '',
      winConditionTarget: winConditionRef.current ? parseFloat(winConditionRef.current.target) : 0,
      mise: parseFloat(String(g.initialBet))
    }
    try {
      await sendWebSocketMessage({ action: 'check_mindset', payload })
    } catch {
      showNotification('Erreur de verification')
      isCheckingWinRef.current = false
    }
  }, [sendWebSocketMessage, showNotification])

  const endGameBackend = useCallback((isWin: boolean, gainFinal: number = 0, cheatDetected: boolean = false, cheatReason: string = '') => {
    const g = G.current
    if (g.over) return
    g.over = true
    killGame()
    clearHeartbeat()
    if (isWin && gainFinal > 0) {
      setResultAmount(Math.floor(gainFinal))
      setTotalBalance(userSolde)
      if (cheatDetected) {
        setFailReason(`Victoire avec penalite: ${cheatReason}`)
      }
      setGameState('won')
    } else {
      if (cheatDetected) {
        setFailReason(cheatReason || "Triche detectee.")
      } else {
        setFailReason("Objectif non atteint.")
      }
      setGameState('lost')
    }
  }, [userSolde, clearHeartbeat])

  const killGame = () => {
    const g = G.current
    cancelAnimationFrame(g.raf)
    clearInterval(g.tCloud)
    clearInterval(g.tScore)
    clearInterval(g.tTimer)
  }

  const resetGame = useCallback(() => {
    killGame()
    closeWebSocket()
    const g = G.current
    g.over = false
    g.score = 0
    g.timeLeft = GAME_DURATION
    g.elapsed = 0
    g.objectiveAchieved = false
    g.pressing = false
    g.keys = {}
    g.clouds = []
    g.ball.velocity = 0
    const cv = canvasRef.current
    if (cv) {
      g.ball.x = cv.width / 2
      g.ball.y = cv.height - 50
    }
    winConditionRef.current = null
    isCheckingWinRef.current = false
    cloudsAvoidedRef.current = 0
    consecutiveJumpsRef.current = 0
    wasOnGroundRef.current = true
    isJumpingRef.current = false

    setGameState('bet')
    setBetInput('100')
    setObjective(null)
    setScoreUI(0)
    setBetAmountUI(0)
    setTimeUI(GAME_DURATION)
    setObjProgress(0)
    setObjDone(false)
    setResultAmount(0)
    setFailReason('')
    setNotification('')
    setLoadingText('')
  }, [closeWebSocket])

  const initCanvas = useCallback(() => {
    const cv = canvasRef.current
    if (!cv) return
    cv.width = window.innerWidth
    cv.height = window.innerHeight
    const g = G.current
    const min = Math.min(cv.width, cv.height)
    g.ball.radius = min * (BALL_SIZE_PERCENT / 100)
    g.cloudMult = min * 0.002
    g.ball.x = cv.width / 2
    g.ball.y = cv.height - 50
  }, [])

  const mkCloud = useCallback((): Cloud => {
    const cv = canvasRef.current!
    const g = G.current
    return {
      x: cv.width + Math.random() * 100,
      y: Math.random() * cv.height,
      size: 30 * g.cloudMult + Math.random() * 20 * g.cloudMult,
      emoji: CLOUD_EMOJIS[Math.floor(Math.random() * CLOUD_EMOJIS.length)],
      speed: g.cloudSpeed * (0.8 + Math.random() * 0.4),
      hasBeenAvoided: false
    }
  }, [])

  const rampDiff = useCallback(() => {
    const g = G.current
    const f = 1 + g.score / 300
    g.cloudSpeed = 2 * f
    g.cloudFreq = Math.max(300, 2000 / f)
    g.gravity = 0.1 * f * 0.7
    g.lift = -3 * (1.1 - f * 0.1)
    clearInterval(g.tCloud)
    g.tCloud = setInterval(() => {
      // Plus le jeu est rapide, plus on génère de nuages
      const cloudCount = Math.min(Math.max(4, Math.floor(f * 2)), 12)
      for (let i = 0; i < cloudCount; i++) g.clouds.push(mkCloud())
    }, g.cloudFreq)
  }, [mkCloud])

  const drawSky = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const gr = ctx.createLinearGradient(0, 0, 0, h)
    gr.addColorStop(0, '#0a1628')
    gr.addColorStop(0.2, '#1a3a6e')
    gr.addColorStop(0.5, '#2563a8')
    gr.addColorStop(0.8, '#5b9bd5')
    gr.addColorStop(1, '#a8d4f0')
    ctx.fillStyle = gr
    ctx.fillRect(0, 0, w, h)
    const sg = ctx.createRadialGradient(w * 0.75, h * 0.15, 0, w * 0.75, h * 0.15, h * 0.35)
    sg.addColorStop(0, 'rgba(255,210,100,0.18)')
    sg.addColorStop(0.5, 'rgba(255,160,60,0.07)')
    sg.addColorStop(1, 'transparent')
    ctx.fillStyle = sg
    ctx.fillRect(0, 0, w, h)
  }, [])

  const handleObjectiveAchieved = useCallback(() => {
    const g = G.current
    g.objectiveAchieved = true
    checkWinCondition().then(() => {
      // Succès
    }).catch(() => {
      g.over = true
      killGame()
      setFailReason("Erreur de verification serveur.")
      setGameState('lost')
    })
  }, [checkWinCondition])

  const checkObjective = useCallback(() => {
    const g = G.current
    const obj = g.objective
    if (!obj || g.objectiveAchieved || g.over) return

    let progress = 0
    let achieved = false

    switch (obj.type) {
      case 'time': {
        const elapsed = GAME_DURATION - g.timeLeft
        progress = Math.min(1, elapsed / obj.target)
        if (elapsed >= obj.target) achieved = true
        break
      }
      case 'score': {
        progress = Math.min(1, g.score / obj.target)
        if (g.score >= obj.target) achieved = true
        break
      }
      case 'clouds': {
        progress = Math.min(1, cloudsAvoidedRef.current / obj.target)
        if (cloudsAvoidedRef.current >= obj.target) achieved = true
        break
      }
      case 'speed': {
        progress = Math.min(1, g.cloudSpeed / obj.target)
        if (g.cloudSpeed >= obj.target) achieved = true
        break
      }
      case 'jumps': {
        progress = Math.min(1, consecutiveJumpsRef.current / obj.target)
        if (consecutiveJumpsRef.current >= obj.target) achieved = true
        break
      }
    }

    setObjProgress(progress)

    if (achieved) {
      g.objectiveAchieved = true
      checkWinCondition()
    }
  }, [checkWinCondition])

  const loop = useCallback(() => {
    const cv = canvasRef.current
    if (!cv) return
    const g = G.current
    if (g.over) return

    const ctx = cv.getContext('2d')!
    const { width: W, height: H } = cv

    ctx.clearRect(0, 0, W, H)
    drawSky(ctx, W, H)

    // === GESTION SAUTS CONSÉCUTIFS ===
    const groundY = H - g.ball.radius
    const isOnGround = g.ball.y >= groundY - 2

    // Détection du décollage (transition sol -> air)
    if (!isOnGround && wasOnGroundRef.current && !isJumpingRef.current) {
      isJumpingRef.current = true
      consecutiveJumpsRef.current++
    }

    // Détection de l'atterrissage (transition air -> sol)
    if (isOnGround && !wasOnGroundRef.current) {
      isJumpingRef.current = false
      // On ne reset pas consecutiveJumps ici, il se reset quand on touche un nuage
    }

    wasOnGroundRef.current = isOnGround

    // Input
    if (g.pressing || g.keys['ArrowUp'] || g.keys[' ']) {
      g.ball.velocity = g.lift
    }

    g.ball.velocity += g.gravity
    g.ball.y += g.ball.velocity
    g.ball.y = Math.max(g.ball.radius, Math.min(H - g.ball.radius, g.ball.y))
    if (g.ball.y === g.ball.radius || g.ball.y === H - g.ball.radius) g.ball.velocity = 0

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Nuages
    for (const c of g.clouds) {
      ctx.font = `${c.size}px Arial`
      ctx.fillText(c.emoji, c.x, c.y)
      c.x -= c.speed

      if (!c.hasBeenAvoided && c.x + c.size < 0) {
        c.hasBeenAvoided = true
        cloudsAvoidedRef.current++
      }
    }

    g.clouds = g.clouds.filter(c => c.x + c.size > -50)

    // Ball
    ctx.save()
    ctx.globalAlpha = 0.2
    ctx.font = `${g.ball.radius * 2}px Arial`
    ctx.fillText(g.ball.emoji, g.ball.x + 4, g.ball.y + 4)
    ctx.restore()

    ctx.font = `${g.ball.radius * 2}px Arial`
    ctx.fillText(g.ball.emoji, g.ball.x, g.ball.y)

    // Collision
    let hit = false
    for (const c of g.clouds) {
      if (Math.hypot(g.ball.x - c.x, g.ball.y - c.y) < g.ball.radius + c.size / 2) {
        hit = true
        break
      }
    }

    if (hit) {
      g.over = true
      killGame()
      // Reset sauts quand on touche un nuage
      consecutiveJumpsRef.current = 0
      isJumpingRef.current = false
      checkWinCondition()
      setFailReason("Vous avez percute un nuage avant d'atteindre l'objectif.")
      setGameState('gameover')
    } else {
      g.raf = requestAnimationFrame(loop)
    }
  }, [drawSky, checkWinCondition])

  const endGame = useCallback(() => {
    const g = G.current
    g.over = true
    killGame()
    checkWinCondition()
    setFailReason("Le temps est ecoule sans que vous ayez atteint l'objectif.")
    setGameState('lost')
  }, [checkWinCondition])

  const startGame = useCallback(
    (bet: number, obj: Objective) => {
      const cv = canvasRef.current
      if (!cv) return
      const g = G.current

      g.over = false
      g.score = 0
      g.timeLeft = GAME_DURATION
      g.elapsed = 0
      g.objectiveAchieved = false
      g.clouds = []
      g.ball.velocity = 0
      g.ball.x = cv.width / 2
      g.ball.y = cv.height - 50
      g.gravity = 0.1
      g.cloudSpeed = 2
      g.cloudFreq = 2000
      g.lift = -3
      g.initialBet = bet
      g.betAmount = bet
      g.objective = obj

      cloudsAvoidedRef.current = 0
      consecutiveJumpsRef.current = 0
      wasOnGroundRef.current = true
      isJumpingRef.current = false

      setScoreUI(0)
      setBetAmountUI(bet)
      setTimeUI(GAME_DURATION)
      setObjProgress(0)
      setObjDone(false)
      setFailReason('')
      setGameState('playing')

      startHeartbeat()

      g.tCloud = setInterval(() => {
        g.clouds.push(mkCloud())
        if (g.score > 200) g.clouds.push(mkCloud())
      }, g.cloudFreq)

      g.tScore = setInterval(() => {
        if (g.over) return
        g.score++
        g.betAmount = g.initialBet + Math.floor(g.score / 4)
        setScoreUI(g.score)
        setBetAmountUI(g.betAmount)
        checkObjective()
        if (g.score % 20 === 0) rampDiff()
      }, 100)

      g.tTimer = setInterval(() => {
        if (g.over) return
        g.timeLeft--
        g.elapsed++
        setTimeUI(g.timeLeft)
        checkObjective()
        if (g.timeLeft <= 0) endGame()
      }, 1000)

      g.raf = requestAnimationFrame(loop)
    },
    [mkCloud, rampDiff, checkObjective, endGame, loop, startHeartbeat]
  )

  useEffect(() => {
    initAll()
    fetchSolde()
    const g = G.current
    const kd = (e: KeyboardEvent) => {
      g.keys[e.key] = true
    }
    const ku = (e: KeyboardEvent) => {
      g.keys[e.key] = false
    }
    document.addEventListener('keydown', kd)
    document.addEventListener('keyup', ku)
    window.addEventListener('resize', initCanvas)
    initCanvas()
    return () => {
      document.removeEventListener('keydown', kd)
      document.removeEventListener('keyup', ku)
      window.removeEventListener('resize', initCanvas)
      killGame()
      closeWebSocket()
    }
  }, [initCanvas, fetchSolde, closeWebSocket])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    G.current.pressing = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])
  const onPointerUp = useCallback(() => {
    G.current.pressing = false
  }, [])

  const handleBet = async () => {
    let bet = parseInt(betInput, 10) || 100
    bet = Math.min(500, Math.max(100, bet))
    if (bet > userSolde) {
      showNotification('Solde insuffisant')
      return
    }

    setBetInput(String(bet))
    setBetAmountUI(bet)
    setLoadingText('Connexion au serveur...')
    setGameState('loading')

    // 1. D'abord connecter le WebSocket
    try {
      await openWebSocket()
    } catch {
      showNotification('Impossible de se connecter au serveur de jeu')
      setGameState('bet')
      setLoadingText('')
      return
    }

    // 2. Ensuite envoyer la mise
    setLoadingText('Envoi de la mise...')
    const betResult = await sendBetToBackend(bet)
    if (!betResult.success) {
      showNotification(betResult.error || 'Erreur lors de la mise')
      closeWebSocket()
      setGameState('bet')
      setLoadingText('')
      return
    }

    // 3. Récupérer l'objectif via WS
    setLoadingText('Récupération de l\'objectif...')
    const conditionReceived = await getWinCondition()
    if (!conditionReceived) {
      closeWebSocket()
      setGameState('bet')
      setLoadingText('')
      return
    }
  }

  const handleStartGame = () => {
    if (!objective) return
    const bet = parseInt(betInput, 10) || 100
    startGame(bet, objective)
  }

  const scoreColor = scoreUI > 600 ? '#ff4d6d' : scoreUI > 300 ? '#ffd166' : '#e0f7ff'

  return (
    <div className="relative w-screen h-screen overflow-hidden font-['Nunito',sans-serif] bg-[#0a1628] touch-none select-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        onPointerDown={gameState === 'playing' ? onPointerDown : undefined}
        onPointerUp={gameState === 'playing' ? onPointerUp : undefined}
        onPointerCancel={gameState === 'playing' ? onPointerUp : undefined}
      />

      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[150] bg-black/70 backdrop-blur-md border border-white/20 rounded-full py-2 px-5 text-sm text-white font-bold animate-[fadeIn_0.3s_ease]">
          {notification}
        </div>
      )}

      {gameState === 'bet' && (
        <div className="absolute inset-0 flex items-center justify-center z-[120] animate-[fadeIn_0.3s_ease] bg-[radial-gradient(ellipse_at_60%_30%,rgba(37,99,168,0.5)_0%,rgba(10,22,40,0.88)_70%)]">
          <div className="w-[92%] max-w-[380px] p-8 sm:p-9 text-center rounded-3xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.22)] animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)]"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)' }}>
            <div className="flex justify-center mb-2">
              <GamepadIcon />
            </div>
            <div className="text-3xl sm:text-4xl font-['Fredoka_One',cursive] text-white tracking-wide mb-1">Clou Run</div>
            <div className="text-xs sm:text-sm text-white/50 font-bold uppercase tracking-[0.8px] mb-6">Evitez les nuages · Remplissez l&apos;objectif</div>
            <div className="flex items-center justify-center gap-2 mb-4 text-xs text-white/40 font-bold tracking-[0.5px]">
              Solde : <span className="font-['Fredoka_One',cursive] text-base text-green-400">{userSolde.toFixed(2)} XOF</span>
            </div>
            <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[1px] text-white/45 text-left mb-2">Votre mise (XOF)</div>
            <input
              className="w-full bg-white/[0.07] border-[1.5px] border-white/20 rounded-xl py-3.5 px-4 text-xl sm:text-2xl font-['Fredoka_One',cursive] font-bold text-white text-center outline-none mb-2 transition-all duration-200 focus:border-blue-400/70 focus:bg-white/[0.13] placeholder:text-white/30"
              type="number"
              min={100}
              max={500}
              value={betInput}
              onChange={e => setBetInput(e.target.value)}
              placeholder="100 – 500"
            />
            <div className="text-[11px] text-white/30 font-bold tracking-[0.5px] mb-6">Min 100 XOF · Max 500 XOF</div>
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 border-none rounded-2xl py-4 cursor-pointer font-['Fredoka_One',cursive] text-lg text-white tracking-wide shadow-[0_4px_24px_rgba(33,150,243,0.45)] active:scale-95 transition-transform flex items-center justify-center gap-2"
              onClick={handleBet}
            >
              Valider la mise <ArrowRightIcon />
            </button>
          </div>
        </div>
      )}

      {gameState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center z-[130] bg-[rgba(5,15,35,0.85)] backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <LoaderIcon />
            <div className="font-['Fredoka_One',cursive] text-lg text-white/80 tracking-wide">{loadingText}</div>
          </div>
        </div>
      )}

      {gameState === 'objective' && objective && (
        <div className="absolute inset-0 flex items-center justify-center z-[120] bg-[radial-gradient(ellipse_at_60%_30%,rgba(37,99,168,0.5)_0%,rgba(10,22,40,0.88)_70%)]">
          <div className="w-[92%] max-w-[400px] p-8 sm:p-9 text-center rounded-3xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.22)] animate-[fadeUp_0.45s_cubic-bezier(0.22,1,0.36,1)]"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)' }}>
            <span className="inline-flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[1px] text-yellow-400 mb-4">
              <StarIcon /> Objectif assigne
            </span>
            <div className="flex justify-center mb-3">{objective.icon}</div>
            <div className="text-xl sm:text-2xl font-['Fredoka_One',cursive] text-white mb-3">Votre defi</div>
            <div className="text-sm sm:text-base text-white/70 font-semibold leading-relaxed mb-5 p-3.5 bg-white/[0.06] rounded-xl border border-white/10">
              {objective.description}
            </div>
            <div className="flex items-center justify-center gap-2 mb-5 text-xs sm:text-sm text-white/45 font-bold tracking-[0.5px]">
              Recompense si reussi :{' '}
              <span className="font-['Fredoka_One',cursive] text-base sm:text-lg text-green-400">
                {Math.floor(parseInt(betInput, 10) * objective.multiplier)} XOF
              </span>
              {' '}(×{objective.multiplier})
            </div>
            <button
              className="w-full bg-gradient-to-r from-green-500 to-green-600 border-none rounded-2xl py-4 cursor-pointer font-['Fredoka_One',cursive] text-lg text-white tracking-wide shadow-[0_4px_24px_rgba(81,207,102,0.4)] active:scale-95 transition-transform flex items-center justify-center gap-2"
              onClick={handleStartGame}
            >
              <RocketIcon /> Je suis pret !
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <div className="absolute top-3.5 left-0 w-full px-3.5 z-[80] pointer-events-none">
            <div className="max-w-[520px] mx-auto flex gap-2">
              <div className="flex-1 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full py-2 px-3 flex flex-col items-center gap-0.5">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[1px] text-white/40">Score</span>
                <span className="font-['Fredoka_One',cursive] text-sm sm:text-base transition-colors duration-400" style={{ color: scoreColor }}>{scoreUI}</span>
              </div>
              <div className="flex-1 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full py-2 px-3 flex flex-col items-center gap-0.5">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[1px] text-white/40">Mise</span>
                <span className="font-['Fredoka_One',cursive] text-sm sm:text-base text-white">{betAmountUI} XOF</span>
              </div>
              <div className="flex-1 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full py-2 px-3 flex flex-col items-center gap-0.5">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[1px] text-white/40">Temps</span>
                <span className="font-['Fredoka_One',cursive] text-sm sm:text-base" style={{ color: timeUI < 30 ? '#ff6b6b' : '#fff' }}>{fmt(timeUI)}</span>
              </div>
            </div>
            {objective && (
              <div className="max-w-[520px] mx-auto mt-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full py-1.5 px-3.5 flex items-center gap-2.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-white/55 whitespace-nowrap tracking-[0.3px] flex-shrink-0">
                  {objDone ? <span className="text-green-400">✓</span> : null} {objective.shortLabel}
                </span>
                <div className="flex-1 h-1.5 bg-white/[0.12] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${objDone ? 'bg-gradient-to-r from-yellow-400 to-green-400' : 'bg-gradient-to-r from-blue-500 to-emerald-400'}`}
                    style={{ width: `${objProgress * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-[80] pointer-events-none animate-[pulse_1.6s_ease-in-out_infinite]">
            <div className="bg-black/45 backdrop-blur-xl border border-white/15 rounded-full py-2 px-5 font-['Fredoka_One',cursive] text-sm text-white/70 tracking-[0.5px] flex items-center gap-2 whitespace-nowrap">
              <span>👆</span> Appuyez et maintenez pour voler
            </div>
          </div>
        </>
      )}

      {/* ── VICTOIRE ── */}
      {gameState === 'won' && (
        <div className="absolute inset-0 flex items-center justify-center z-[120] bg-[rgba(5,15,35,0.72)] backdrop-blur-md">
          <div className="w-[92%] max-w-[360px] p-8 sm:p-9 text-center rounded-3xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.22)] animate-[popIn_0.4s_cubic-bezier(0.22,1,0.36,1)]"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)' }}>
            <div className="flex justify-center mb-3"><TrophyIcon /></div>
            <div className="text-2xl sm:text-3xl font-['Fredoka_One',cursive] text-green-400 mb-2">Objectif atteint !</div>
            <div className="text-sm text-white/60 font-semibold mb-5 leading-relaxed">Felicitations, vous avez reussi votre defi !</div>
            <div className="font-['Fredoka_One',cursive] text-3xl sm:text-4xl text-yellow-400 mb-1">+{resultAmount} XOF</div>
            <div className="text-xs text-white/40 font-extrabold uppercase tracking-[0.8px] mb-5">Solde total : {totalBalance} XOF</div>
            <button className="w-full bg-white/[0.1] border-[1.5px] border-white/20 rounded-2xl py-3.5 cursor-pointer font-['Fredoka_One',cursive] text-base text-white tracking-[0.5px] hover:bg-white/[0.18] active:scale-95 transition-all flex items-center justify-center gap-2" onClick={resetGame}>
              <RefreshIcon /> Rejouer
            </button>
          </div>
        </div>
      )}

      {/* ── ÉCHEC (nuage) ── */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center z-[120] bg-[rgba(5,15,35,0.72)] backdrop-blur-md">
          <div className="w-[92%] max-w-[360px] p-8 sm:p-9 text-center rounded-3xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.22)] animate-[popIn_0.4s_cubic-bezier(0.22,1,0.36,1)]"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)' }}>
            <div className="flex justify-center mb-3"><ExplosionIcon /></div>
            <div className="text-2xl sm:text-3xl font-['Fredoka_One',cursive] text-red-400 mb-2">Objectif echoue !</div>
            <div className="text-sm text-white/60 font-semibold mb-5 leading-relaxed">{failReason}</div>
            <div className="text-xs text-white/40 font-extrabold uppercase tracking-[0.8px] mb-5">Score final : {scoreUI} pts · Mise perdue</div>
            <button className="w-full bg-white/[0.1] border-[1.5px] border-white/20 rounded-2xl py-3.5 cursor-pointer font-['Fredoka_One',cursive] text-base text-white tracking-[0.5px] hover:bg-white/[0.18] active:scale-95 transition-all flex items-center justify-center gap-2" onClick={resetGame}>
              <RefreshIcon /> Rejouer
            </button>
          </div>
        </div>
      )}

      {/* ── ÉCHEC (temps / triche / perdu) ── */}
      {gameState === 'lost' && (
        <div className="absolute inset-0 flex items-center justify-center z-[120] bg-[rgba(5,15,35,0.72)] backdrop-blur-md">
          <div className="w-[92%] max-w-[360px] p-8 sm:p-9 text-center rounded-3xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.22)] animate-[popIn_0.4s_cubic-bezier(0.22,1,0.36,1)]"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)' }}>
            <div className="flex justify-center mb-3"><HourglassIcon /></div>
            <div className="text-2xl sm:text-3xl font-['Fredoka_One',cursive] text-yellow-300 mb-2">Objectif echoue !</div>
            <div className="text-sm text-white/60 font-semibold mb-5 leading-relaxed">{failReason}</div>
            <div className="text-xs text-white/40 font-extrabold uppercase tracking-[0.8px] mb-5">Score final : {scoreUI} pts · Mise perdue</div>
            <button className="w-full bg-white/[0.1] border-[1.5px] border-white/20 rounded-2xl py-3.5 cursor-pointer font-['Fredoka_One',cursive] text-base text-white tracking-[0.5px] hover:bg-white/[0.18] active:scale-95 transition-all flex items-center justify-center gap-2" onClick={resetGame}>
              <RefreshIcon /> Rejouer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}



