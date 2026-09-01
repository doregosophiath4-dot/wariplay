'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const CoinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-yellow-400 drop-shadow-[0_0_6px_rgba(255,215,0,0.6)]">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="rgba(255,215,0,0.15)" />
    <text x="12" y="16" textAnchor="middle" fontSize="13" fontWeight="900" fill="currentColor" stroke="none">$</text>
  </svg>
)

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)

const BetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 drop-shadow-[0_0_6px_rgba(255,51,102,0.5)]">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const SpeedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 drop-shadow-[0_0_6px_rgba(0,255,204,0.5)]">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400 drop-shadow-[0_0_6px_rgba(0,255,204,0.5)]">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const TrophyIcon = ({ className = "text-emerald-400" }: { className?: string }) => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className={`${className} drop-shadow-[0_0_15px_rgba(0,255,136,0.6)]`}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 22h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="rgba(0,255,136,0.1)" stroke="none" />
  </svg>
)

const FailIcon = ({ className = "text-red-400" }: { className?: string }) => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className={`${className} drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]`}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" fill="rgba(255,0,0,0.1)" />
    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

const TargetIcon = ({ className = "text-emerald-400" }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className={`${className} drop-shadow-[0_0_12px_rgba(0,255,204,0.5)]`}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" fill="currentColor" />
  </svg>
)

const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const InvincibleShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-400 drop-shadow-[0_0_8px_rgba(255,51,102,0.6)]">
    <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
)

const JumpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400 drop-shadow-[0_0_8px_rgba(0,255,204,0.6)]">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
)

const MinusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const RocketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
)

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

/* ═══════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════ */

const PLAYER_WIDTH = 100
const PLAYER_HEIGHT = 90
const INITIAL_GRAVITY = 0.6
const JUMP_FORCE = -13
const INITIAL_MOVE_SPEED = 6
const SPEED_INCREASE_INTERVAL = 3000
const CAMERA_SMOOTHNESS = 0.1
const SESSION_UPDATE_INTERVAL_MS = 1000
const WS_TIMEOUT_MS = 10000

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface Platform {
  x: number
  y: number
  width: number
  height: number
}

interface CoinItem {
  x: number
  y: number
  collected: boolean
}

interface PowerupItem {
  x: number
  y: number
  type: 'invincible' | 'doubleJump'
  collected: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  decay: number
}

interface Objective {
  type: 'collect_coins' | 'survive_time' | 'score_in_time' | 'reach_score'
  name: string
  difficulty: string
  description: string
  target: number
  timeLimit: number
  progress: number
  completed: boolean
}

type GameMessage = Record<string, any>

type WSStatus = 'idle' | 'connecting' | 'authenticated' | 'closed' | 'error'

function parseSoldeValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function NeonRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)

  // ── WebSocket refs (pattern openWebSocket/sendWebSocketMessage) ──
  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef(false)
  const pendingResolveRef = useRef<((d: any) => void) | null>(null)
  const pendingRejectRef = useRef<((e: any) => void) | null>(null)
  const wsChainRef = useRef<Promise<any>>(Promise.resolve())
  const connectingPromiseRef = useRef<Promise<void> | null>(null)
  const sessionActiveRef = useRef(false)
  const objectiveResolvedRef = useRef(true)
  const lastUpdateSentRef = useRef(0)

  const [screen, setScreen] = useState<'loading' | 'start' | 'bet' | 'objective' | 'playing' | 'rules' | 'gameover'>('loading')
  const [score, setScore] = useState(0)
  const [speedDisplay, setSpeedDisplay] = useState(6)
  const [userBalance, setUserBalance] = useState(0)
  const [currentBet, setCurrentBet] = useState(100)
  const [objectiveText, setObjectiveText] = useState('')
  const [objectiveProgress, setObjectiveProgress] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [balanceLoaded, setBalanceLoaded] = useState(false)
  const [invincibleActive, setInvincibleActive] = useState(false)
  const [doubleJumpActive, setDoubleJumpActive] = useState(false)
  const [gameOverMessage, setGameOverMessage] = useState('')
  const [objectiveResultText, setObjectiveResultText] = useState('')
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [showSuccessNotif, setShowSuccessNotif] = useState(false)
  const [showFailNotif, setShowFailNotif] = useState(false)
  const [notifAmount, setNotifAmount] = useState(0)
  const [wsStatus, setWsStatus] = useState<WSStatus>('idle')
  const [betErrorMessage, setBetErrorMessage] = useState('')

  const gameStateRef = useRef({
    gravity: INITIAL_GRAVITY,
    moveSpeed: INITIAL_MOVE_SPEED,
    velocityY: 0,
    isJumping: false,
    playerX: 100,
    playerY: 100,
    started: false,
    gameOver: false,
    isLeft: false,
    isRight: false,
    invincible: false,
    doubleJumpAvailable: false,
    objectiveCompleted: false,
    objectiveFailed: false,
    objectiveStartTime: 0,
    coinsCollectedThisGame: 0,
    lastSpeedIncrease: 0,
    cameraX: 0,
    cameraY: 0,
    cameraTargetX: 0,
    cameraTargetY: 0,
    cameraShake: 0,
    time: 0,
    score: 0,
    platforms: [] as Platform[],
    coins: [] as CoinItem[],
    powerups: [] as PowerupItem[],
    particles: [] as Particle[],
    currentObjective: null as Objective | null
  })

  const gs = gameStateRef.current

  /* ── WebSocket : fermeture ───────────────────────────── */
  const closeWebSocket = useCallback(() => {
    wsReadyRef.current = false
    pendingResolveRef.current = null
    pendingRejectRef.current = null
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setWsStatus('closed')
  }, [])

  /* ── WebSocket : ouverture + authentification ────────── */
  const openWebSocket = useCallback((): Promise<void> => {
    if (wsRef.current && wsReadyRef.current) {
      return Promise.resolve()
    }

    if (connectingPromiseRef.current) {
      return connectingPromiseRef.current
    }

    const p = new Promise<void>(async (resolve, reject) => {
      closeWebSocket()
      setWsStatus('connecting')

      const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
      const wsEndpoint = proto + window.location.host + '/ws/dash_game'
      const ws = new WebSocket(wsEndpoint)
      wsRef.current = ws

      const t = setTimeout(() => {
        closeWebSocket()
        reject(new Error('Timeout'))
      }, WS_TIMEOUT_MS)

      ws.onopen = async () => {
        await initAll()
        const am = await prepareWSAuthMessage()
        ws.send(JSON.stringify(am))
      }

      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data)

          if (d.type === 'auth_success') {
            clearTimeout(t)
            wsReadyRef.current = true
            setWsStatus('authenticated')
            resolve()
            return
          }

          if (d.type === 'error' && !wsReadyRef.current) {
            clearTimeout(t)
            closeWebSocket()
            reject(new Error(d.message || 'Authentification échouée'))
            return
          }

          if (pendingResolveRef.current) {
            const rf = pendingResolveRef.current
            pendingResolveRef.current = null
            pendingRejectRef.current = null
            rf(d)
          }
        } catch (er) {
          clearTimeout(t)
          reject(er)
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
        setWsStatus('closed')
        if (pendingRejectRef.current) {
          pendingRejectRef.current(new Error('WS ferme'))
          pendingResolveRef.current = null
          pendingRejectRef.current = null
        }
      }
    }).finally(() => {
      connectingPromiseRef.current = null
    })

    connectingPromiseRef.current = p
    return p
  }, [closeWebSocket])

  /* ── WebSocket : envoi d'un message applicatif ───────── */
  const sendWebSocketMessage = useCallback((msg: GameMessage): Promise<any> => {
    const runner = async (): Promise<any> => {
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
        }, WS_TIMEOUT_MS)
        pendingResolveRef.current = (d: any) => { clearTimeout(t); resolve(d) }
        pendingRejectRef.current = (er: any) => { clearTimeout(t); reject(er) }
        wsRef.current!.send(JSON.stringify(msg))
      })
    }

    const chained = wsChainRef.current.then(runner, runner)
    wsChainRef.current = chained.then(() => undefined, () => undefined)
    return chained
  }, [openWebSocket])

  /* ── Functions ───────────────────────────────────────── */

  const createParticle = useCallback((x: number, y: number, color: string): Particle => {
    return {
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      size: Math.random() * 2 + 1,
      color,
      life: 1,
      decay: 0.02
    }
  }, [])

  const generatePlatform = useCallback((x: number) => {
    const width = 100 + Math.random() * 150
    const height = 20
    const y = 80 + Math.random() * 120
    gs.platforms.push({ x, y, width, height })

    if (Math.random() < 0.15) {
      gs.powerups.push({
        x: x + width / 2 - 15,
        y: y + height + 10,
        type: Math.random() < 0.5 ? 'invincible' : 'doubleJump',
        collected: false
      })
    }
  }, [])

  const generateCoin = useCallback((x: number) => {
    gs.coins.push({ x, y: 80 + Math.random() * 200, collected: false })
  }, [])

  const performJump = useCallback(() => {
    if (!gs.isJumping || gs.doubleJumpAvailable) {
      gs.velocityY = JUMP_FORCE
      gs.isJumping = true

      const particleColor = gs.doubleJumpAvailable ? '#00ffcc' : '#ffffff'
      for (let i = 0; i < 6; i++) {
        gs.particles.push(createParticle(
          gs.playerX + PLAYER_WIDTH / 2,
          gs.playerY + PLAYER_HEIGHT,
          particleColor
        ))
      }

      gs.cameraShake = gs.doubleJumpAvailable ? 4 : 2
      gs.doubleJumpAvailable = false
      setDoubleJumpActive(false)
    }
  }, [createParticle])

  const finishGame = useCallback(async () => {
    if (objectiveResolvedRef.current) {
      return
    }
    objectiveResolvedRef.current = true
    gs.gameOver = true

    if (!gs.currentObjective) {
      setGameOverMessage('GAME OVER')
      setScreen('gameover')
      sessionActiveRef.current = false
      closeWebSocket()
      return
    }

    const finalScore = gs.score
    const finalCoins = gs.coinsCollectedThisGame
    const finalDuration = (performance.now() - gs.objectiveStartTime) / 1000

    try {
      const syncData = await sendWebSocketMessage({
        action: 'update_dash_session',
        game_started: true,
        score: finalScore,
        coins_collected: finalCoins,
        game_duration: finalDuration
      })

      if (!syncData?.success) {
        throw new Error(syncData?.error || 'Synchronisation finale refusée par le serveur')
      }

      const data = await sendWebSocketMessage({
        action: 'validate_dash_objective',
        score: finalScore,
        coins_collected: finalCoins,
        game_duration: finalDuration
      })

      if (!data?.success) {
        throw new Error(data?.error || 'Validation refusée par le serveur')
      }

      const won = !!data.objective_completed
      const winAmount = data.win_amount || 0
      const soldeApresValidation = parseSoldeValue(data.new_solde)

      if (won) {
        if (soldeApresValidation === null) {
          throw new Error('Le serveur n\'a pas renvoyé de solde valide apres un objectif reussi')
        }
        setUserBalance(soldeApresValidation)
      } else {
        if (soldeApresValidation !== null) {
          setUserBalance(soldeApresValidation)
        }
      }

      if (won) {
        setObjectiveProgress(1)
        setObjectiveText(`Objectif atteint! +${winAmount} XOF`)
        setNotifAmount(winAmount)
        setShowSuccessNotif(true)
        setObjectiveResultText(`Objectif atteint! +${winAmount} XOF`)
        setGameOverMessage('SUCCES!')
        setTimeout(() => setShowSuccessNotif(false), 2500)
      } else {
        setObjectiveText(`Objectif echoue: -${currentBet} XOF`)
        setNotifAmount(currentBet)
        setShowFailNotif(true)
        setObjectiveResultText(`Objectif echoue: -${currentBet} XOF`)
        setGameOverMessage('GAME OVER')
        setTimeout(() => setShowFailNotif(false), 2500)
      }

      setTimeout(() => setScreen('gameover'), 2500)
    } catch {
      setObjectiveResultText('Erreur de connexion : le résultat sera vérifié par le serveur. Contactez le support si votre solde ne se met pas à jour.')
      setGameOverMessage('CONNEXION PERDUE')
      setScreen('gameover')
    } finally {
      sessionActiveRef.current = false
      sendWebSocketMessage({ action: 'clear_dash_session' })
        .catch(() => {})
        .finally(() => closeWebSocket())
    }
  }, [currentBet, sendWebSocketMessage, closeWebSocket])

  const updateObjective = useCallback((timestamp: number) => {
    const obj = gs.currentObjective
    if (!obj || objectiveResolvedRef.current) return

    let progress = 0
    let displayText = ''
    let shouldFinish = false

    switch (obj.type) {
      case 'collect_coins':
        progress = gs.coinsCollectedThisGame / obj.target
        displayText = `Collecter ${obj.target} pieces: ${gs.coinsCollectedThisGame}/${obj.target}`
        break
      case 'survive_time': {
        const elapsedTime = (timestamp - gs.objectiveStartTime) / 1000
        progress = elapsedTime / obj.target
        displayText = `Survivre ${obj.target}s: ${Math.floor(elapsedTime)}/${obj.target}s`
        break
      }
      case 'score_in_time': {
        const timeElapsed = (timestamp - gs.objectiveStartTime) / 1000
        progress = gs.score / obj.target
        displayText = `Atteindre ${obj.target} points en ${obj.timeLimit}s: ${gs.score}/${obj.target}`
        if (timeElapsed > obj.timeLimit) {
          shouldFinish = true
        }
        break
      }
      case 'reach_score':
        progress = gs.score / obj.target
        displayText = `Atteindre ${obj.target} points: ${gs.score}/${obj.target}`
        break
    }

    progress = Math.max(0, Math.min(1, progress))
    setObjectiveProgress(progress)
    setObjectiveText(displayText)

    if (progress >= 1) {
      shouldFinish = true
    }

    if (shouldFinish) {
      finishGame()
    }
  }, [finishGame])

  const endGame = useCallback(() => {
    gs.gameOver = true
    finishGame()
  }, [finishGame])

  /* ── Game Loop ───────────────────────────────────────── */
  const gameLoop = useCallback((timestamp: number) => {
    if (!gs.started || gs.gameOver) return

    gs.time = timestamp * 0.001
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update camera
    gs.cameraTargetX = gs.playerX + PLAYER_WIDTH / 2 - canvas.width / 2
    gs.cameraTargetY = (canvas.height - gs.playerY - PLAYER_HEIGHT / 2) - canvas.height / 2
    gs.cameraTargetY = Math.min(gs.cameraTargetY, 0)

    gs.cameraX += (gs.cameraTargetX - gs.cameraX) * CAMERA_SMOOTHNESS
    gs.cameraY += (gs.cameraTargetY - gs.cameraY) * CAMERA_SMOOTHNESS

    gs.cameraShake *= 0.9
    if (gs.cameraShake < 0.1) gs.cameraShake = 0

    const shakeX = Math.sin(gs.time * 40) * gs.cameraShake
    const shakeY = Math.cos(gs.time * 30) * gs.cameraShake
    gs.cameraX += shakeX
    gs.cameraY += shakeY

    ctx.save()
    ctx.translate(-gs.cameraX, -gs.cameraY)

    // Background
    const bgGradient = ctx.createRadialGradient(
      gs.cameraX + canvas.width / 2, canvas.height / 2, 0,
      gs.cameraX + canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
    )
    bgGradient.addColorStop(0, '#0a0a1a')
    bgGradient.addColorStop(0.4, '#0d0d20')
    bgGradient.addColorStop(1, '#050510')
    ctx.fillStyle = bgGradient
    ctx.fillRect(gs.cameraX - 100, -100, canvas.width + 200, canvas.height + 200)

    const vignetteGradient = ctx.createRadialGradient(
      gs.cameraX + canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
      gs.cameraX + canvas.width / 2, canvas.height / 2, canvas.width * 0.8
    )
    vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)')
    vignetteGradient.addColorStop(1, 'rgba(0,0,0,0.4)')
    ctx.fillStyle = vignetteGradient
    ctx.fillRect(gs.cameraX - 100, -100, canvas.width + 200, canvas.height + 200)

    // Player physics — NO lateral movement
    gs.velocityY += gs.gravity
    gs.playerY -= gs.velocityY

    if (gs.playerY <= 0 && !gs.objectiveCompleted) {
      endGame()
      ctx.restore()
      return
    }

    // Move elements
    gs.platforms.forEach(p => p.x -= gs.moveSpeed)
    gs.coins.forEach(c => c.x -= gs.moveSpeed)
    gs.powerups.forEach(pu => pu.x -= gs.moveSpeed)

    // Remove off-screen
    for (let i = gs.platforms.length - 1; i >= 0; i--) {
      if (gs.platforms[i].x + gs.platforms[i].width < gs.cameraX - 100) gs.platforms.splice(i, 1)
    }
    for (let i = gs.coins.length - 1; i >= 0; i--) {
      if (gs.coins[i].x + 20 < gs.cameraX - 100) gs.coins.splice(i, 1)
    }
    for (let i = gs.powerups.length - 1; i >= 0; i--) {
      if (gs.powerups[i].x + 25 < gs.cameraX - 100) gs.powerups.splice(i, 1)
    }

    // Collisions - Platforms
    let onPlatform = false
    for (const p of gs.platforms) {
      if (
        gs.playerX + PLAYER_WIDTH > p.x &&
        gs.playerX < p.x + p.width &&
        gs.playerY <= p.y + 5 &&
        gs.playerY >= p.y - 10
      ) {
        gs.velocityY = 0
        gs.playerY = p.y
        gs.isJumping = false
        onPlatform = true
        gs.doubleJumpAvailable = true
        setDoubleJumpActive(true)
        break
      }
    }
    if (!onPlatform) {
      gs.isJumping = true
    }

    // Collisions - Coins
    for (let i = gs.coins.length - 1; i >= 0; i--) {
      const c = gs.coins[i]
      if (!c.collected &&
        gs.playerX + PLAYER_WIDTH > c.x &&
        gs.playerX < c.x + 20 &&
        gs.playerY + PLAYER_HEIGHT > c.y &&
        gs.playerY < c.y + 20
      ) {
        c.collected = true
        gs.coins.splice(i, 1)
        gs.score += 10
        setScore(gs.score)
        gs.coinsCollectedThisGame++
        for (let j = 0; j < 8; j++) {
          gs.particles.push(createParticle(c.x, c.y + 12, '#ffd700'))
        }
      }
    }

    // Collisions - Powerups
    for (let i = gs.powerups.length - 1; i >= 0; i--) {
      const pu = gs.powerups[i]
      if (!pu.collected &&
        gs.playerX + PLAYER_WIDTH > pu.x &&
        gs.playerX < pu.x + 25 &&
        gs.playerY + PLAYER_HEIGHT > pu.y &&
        gs.playerY < pu.y + 25
      ) {
        pu.collected = true
        gs.powerups.splice(i, 1)
        const color = pu.type === 'invincible' ? '#ff3366' : '#00ffcc'
        for (let j = 0; j < 12; j++) {
          gs.particles.push(createParticle(pu.x, pu.y + 15, color))
        }

        if (pu.type === 'invincible') {
          gs.invincible = true
          setInvincibleActive(true)
          setTimeout(() => { gs.invincible = false; setInvincibleActive(false) }, 5000)
        } else {
          gs.doubleJumpAvailable = true
          setDoubleJumpActive(true)
          setTimeout(() => { gs.doubleJumpAvailable = false; setDoubleJumpActive(false) }, 5000)
        }
      }
    }

    // Draw platforms
    gs.platforms.forEach(p => {
      const y = canvas.height - p.y - p.height
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(p.x + 4, y + 4, p.width, p.height)
      const gradient = ctx.createLinearGradient(p.x, y, p.x, y + p.height)
      gradient.addColorStop(0, 'rgba(0, 255, 204, 0.1)')
      gradient.addColorStop(0.5, 'rgba(0, 255, 204, 0.05)')
      gradient.addColorStop(1, 'rgba(0, 255, 204, 0.02)')
      ctx.fillStyle = gradient
      ctx.fillRect(p.x, y, p.width, p.height)
      ctx.strokeStyle = '#00ffcc'
      ctx.lineWidth = 1
      ctx.strokeRect(p.x, y, p.width, p.height)
    })

    // Draw coins
    gs.coins.forEach(c => {
      if (c.collected) return
      const y = canvas.height - c.y - 15
      const rotation = gs.time * 0.03
      ctx.save()
      ctx.translate(c.x + 15, y)
      ctx.rotate(rotation)
      ctx.strokeStyle = '#ffd700'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.stroke()
      ctx.strokeStyle = '#ffed4e'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke()
      ctx.restore()
    })

    // Draw powerups
    gs.powerups.forEach(pu => {
      if (pu.collected) return
      const y = canvas.height - pu.y - 17.5
      const float = Math.sin(gs.time * 0.004) * 10
      ctx.save()
      ctx.translate(pu.x + 17.5, y - float)
      ctx.strokeStyle = pu.type === 'invincible' ? '#ff3366' : '#00ffcc'
      ctx.fillStyle = pu.type === 'invincible' ? 'rgba(255, 51, 102, 0.1)' : 'rgba(0, 255, 204, 0.1)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
      ctx.fillStyle = pu.type === 'invincible' ? '#ff3366' : '#00ffcc'
      ctx.font = 'bold 14px Orbitron'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(pu.type === 'invincible' ? 'I' : '2X', 0, 0)
      ctx.restore()
    })

    // Draw particles
    for (let i = gs.particles.length - 1; i >= 0; i--) {
      const p = gs.particles[i]
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= p.decay
      if (p.life > 0) {
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      } else {
        gs.particles.splice(i, 1)
      }
    }

    // Draw player
    const screenY = canvas.height - gs.playerY - PLAYER_HEIGHT
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(gs.playerX + 25, screenY + PLAYER_HEIGHT + 3, 15, 5, 0, 0, Math.PI * 2)
    ctx.fill()

    if (gs.invincible) {
      const pulse = 0.6 + Math.sin(gs.time * 0.1) * 0.2
      ctx.globalAlpha = pulse
    }

    const bodyGradient = ctx.createLinearGradient(gs.playerX + 12, screenY + 15, gs.playerX + 12, screenY + 60)
    if (gs.invincible) { bodyGradient.addColorStop(0, '#ff3366'); bodyGradient.addColorStop(1, '#cc0044') }
    else { bodyGradient.addColorStop(0, '#0099ff'); bodyGradient.addColorStop(1, '#0066cc') }
    ctx.fillStyle = bodyGradient
    ctx.fillRect(gs.playerX + 12, screenY + 15, 26, 45)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(gs.playerX + 14, screenY + 17, 22, 10)

    const headGradient = ctx.createRadialGradient(gs.playerX + 25, screenY + 20, 0, gs.playerX + 25, screenY + 20, 12)
    headGradient.addColorStop(0, '#ffffff'); headGradient.addColorStop(1, '#cccccc')
    ctx.fillStyle = headGradient
    ctx.beginPath(); ctx.arc(gs.playerX + 25, screenY + 20, 12, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = '#333333'
    ctx.fillRect(gs.playerX + 18, screenY + 28, 14, 4)

    ctx.fillStyle = '#00ffcc'
    ctx.beginPath(); ctx.arc(gs.playerX + 20, screenY + 24, 2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(gs.playerX + 30, screenY + 24, 2, 0, Math.PI * 2); ctx.fill()

    const legOffset = gs.isJumping ? 0 : Math.sin(gs.time * 0.15) * 2
    ctx.fillStyle = '#333333'
    ctx.fillRect(gs.playerX + 15, screenY + 50 + legOffset, 6, 15)
    ctx.fillRect(gs.playerX + 29, screenY + 50 - legOffset, 6, 15)
    ctx.globalAlpha = 1

    ctx.restore()

    // Update objective
    if (gs.currentObjective) updateObjective(timestamp)

    // Envoi périodique de l'état
    if (gs.currentObjective && sessionActiveRef.current && timestamp - lastUpdateSentRef.current > SESSION_UPDATE_INTERVAL_MS) {
      lastUpdateSentRef.current = timestamp
      const durationSec = (timestamp - gs.objectiveStartTime) / 1000
      sendWebSocketMessage({
        action: 'update_dash_session',
        game_started: true,
        score: gs.score,
        coins_collected: gs.coinsCollectedThisGame,
        game_duration: durationSec
      }).catch(() => {})
    }

    // Speed increase
    if (timestamp - gs.lastSpeedIncrease > SPEED_INCREASE_INTERVAL) {
      gs.moveSpeed += 0.8
      gs.gravity += 0.03
      setSpeedDisplay(parseFloat(gs.moveSpeed.toFixed(1)))
      gs.lastSpeedIncrease = timestamp
    }

    // Generate new elements
    const rightEdge = gs.cameraX + canvas.width
    if (gs.platforms.length < 5 || gs.platforms[gs.platforms.length - 1].x < rightEdge - 200) {
      generatePlatform(rightEdge + Math.random() * 100)
      if (Math.random() < 0.7) generateCoin(rightEdge + Math.random() * 100)
    }

    animFrameRef.current = requestAnimationFrame(gameLoop)
  }, [endGame, generatePlatform, generateCoin, createParticle, updateObjective, sendWebSocketMessage])

  /* ── Actions ─────────────────────────────────────────── */
  const startGame = useCallback(() => {
    setCurrentBet(100)
    setBetErrorMessage('')
    setScreen('bet')
  }, [])

  const confirmBet = useCallback(async () => {
    if (userBalance < currentBet) {
      setBetErrorMessage('Solde insuffisant pour cette mise.')
      return
    }

    setIsButtonLoading(true)
    setBetErrorMessage('')

    let betAlreadyCharged = false

    try {
      const [betResponse, objData] = await Promise.all([
        fetchWithAllTokens('/api/cherif', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bet: currentBet })
        }),
        sendWebSocketMessage({ action: 'get_dash_objectives', count: 1 })
      ])

      const betData = await betResponse.json()

      if (!betResponse.ok || !betData?.success) {
        throw new Error(betData?.message || 'La mise a été refusée par le serveur')
      }

      betAlreadyCharged = true
      const soldeApresMise = parseSoldeValue(betData.new_solde)
      if (soldeApresMise !== null) {
        setUserBalance(soldeApresMise)
      }

      if (!objData?.success || !objData.objective) {
        throw new Error(objData?.error || 'Objectif indisponible côté serveur')
      }

      const serverObjective = objData.objective

      const sessionData = await sendWebSocketMessage({
        action: 'start_dash_session',
        bet: currentBet,
        objective: serverObjective
      })

      if (!sessionData?.success) {
        throw new Error(sessionData?.error || 'Session indisponible côté serveur')
      }

      sessionActiveRef.current = true

      gs.currentObjective = {
        type: serverObjective.type,
        name: serverObjective.name,
        difficulty: serverObjective.difficulty,
        description: serverObjective.description,
        target: serverObjective.target,
        timeLimit: serverObjective.time_limit || 0,
        progress: 0,
        completed: false
      }

      objectiveResolvedRef.current = false
      setObjectiveText(gs.currentObjective.description)
      setObjectiveProgress(0)
      setScreen('objective')

    } catch {
      if (betAlreadyCharged) {
        setBetErrorMessage('Votre mise a été débitée mais la partie n\'a pas pu démarrer. Contactez le support si besoin.')
      } else {
        setBetErrorMessage('Connexion au serveur impossible. Réessayez dans un instant.')
      }
      setScreen('bet')
    } finally {
      setIsButtonLoading(false)
    }
  }, [userBalance, currentBet, sendWebSocketMessage])

  const startGameWithObjective = useCallback(async () => {
    if (!gs.currentObjective) {
      setBetErrorMessage('Aucun objectif actif. Merci de recommencer la mise.')
      setScreen('bet')
      return
    }

    setIsButtonLoading(true)

    try {
      const ack = await sendWebSocketMessage({
        action: 'update_dash_session',
        game_started: true
      })

      if (!ack?.success) {
        throw new Error(ack?.error || 'Le serveur a refusé le démarrage de la partie')
      }
    } catch {
      setBetErrorMessage('Connexion au serveur perdue. La partie n\'a pas pu démarrer.')
      setIsButtonLoading(false)
      setScreen('bet')
      return
    }

    gs.cameraX = 0
    gs.cameraY = 0
    gs.cameraTargetX = 0
    gs.cameraTargetY = 0
    gs.playerX = 100
    gs.playerY = 100
    gs.velocityY = 0
    gs.platforms = []
    gs.coins = []
    gs.powerups = []
    gs.particles = []
    gs.objectiveCompleted = false
    gs.objectiveFailed = false
    gs.coinsCollectedThisGame = 0
    gs.moveSpeed = INITIAL_MOVE_SPEED
    gs.gravity = INITIAL_GRAVITY
    gs.invincible = false
    gs.doubleJumpAvailable = false
    lastUpdateSentRef.current = 0

    gs.platforms.push({ x: 100, y: 100, width: 200, height: 20 })
    for (let i = 0; i < 4; i++) generatePlatform(300 + i * 200)

    gs.score = 0
    setScore(0)
    setSpeedDisplay(INITIAL_MOVE_SPEED)
    setInvincibleActive(false)
    setDoubleJumpActive(false)
    setObjectiveProgress(0)

    gs.started = true
    gs.gameOver = false
    gs.objectiveStartTime = performance.now()
    gs.lastSpeedIncrease = performance.now()

    setScreen('playing')
    setIsButtonLoading(false)

    animFrameRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop, generatePlatform, sendWebSocketMessage])

  const adjustBet = useCallback((amount: number) => {
    setCurrentBet(prev => {
      let newBet = prev + amount
      if (newBet < 100) newBet = 100
      if (newBet > 1000) newBet = 1000
      if (newBet > userBalance) newBet = Math.max(100, Math.min(userBalance, 1000))
      return newBet
    })
  }, [userBalance])

  const resetGame = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)

    gs.gravity = INITIAL_GRAVITY
    gs.moveSpeed = INITIAL_MOVE_SPEED
    gs.velocityY = 0
    gs.isJumping = false
    gs.playerX = 100
    gs.playerY = 100
    gs.started = false
    gs.gameOver = false
    gs.isLeft = false
    gs.isRight = false
    gs.invincible = false
    gs.doubleJumpAvailable = false
    gs.objectiveCompleted = false
    gs.objectiveFailed = false
    gs.objectiveStartTime = 0
    gs.coinsCollectedThisGame = 0
    gs.lastSpeedIncrease = 0
    gs.cameraX = 0
    gs.cameraY = 0
    gs.cameraTargetX = 0
    gs.cameraTargetY = 0
    gs.cameraShake = 0
    gs.score = 0
    gs.platforms = []
    gs.coins = []
    gs.powerups = []
    gs.particles = []
    gs.currentObjective = null

    sessionActiveRef.current = false
    objectiveResolvedRef.current = true
    lastUpdateSentRef.current = 0

    setScore(0)
    setSpeedDisplay(INITIAL_MOVE_SPEED)
    setCurrentBet(100)
    setObjectiveText('')
    setObjectiveProgress(0)
    setInvincibleActive(false)
    setDoubleJumpActive(false)
    setGameOverMessage('')
    setObjectiveResultText('')
    setIsButtonLoading(false)
    setShowSuccessNotif(false)
    setShowFailNotif(false)
    setNotifAmount(0)
    setBetErrorMessage('')

    setScreen('start')
  }, [])

  /* ── Solde : récupération initiale via REST ────────────── */
  useEffect(() => {
    let cancelled = false

    const loadBalance = async () => {
      try {
        const response = await fetchWithAllTokens('/api/get_lettricide_solde')
        const data = await response.json()
        const solde = parseSoldeValue(data?.solde)
        if (!cancelled && response.ok && solde !== null) {
          setUserBalance(solde)
        }
      } catch {
        // Échec silencieux
      } finally {
        if (!cancelled) setBalanceLoaded(true)
      }
    }

    loadBalance()

    return () => {
      cancelled = true
    }
  }, [])

  /* ── WebSocket lifecycle : fermeture au démontage ────── */
  useEffect(() => {
    return () => {
      closeWebSocket()
    }
  }, [closeWebSocket])

  /* ── Keyboard : SAUT uniquement (pas de gauche/droite) ─ */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'playing' || gs.gameOver) return
      if (e.key === 'ArrowUp' || e.key === 'Up' || e.key === ' ') {
        e.preventDefault()
        performJump()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [screen, performJump])

  /* ── Instant Touch / Click : SAUT uniquement ─────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const jumpOnTouch = (e: TouchEvent | MouseEvent) => {
      if (screen !== 'playing' || gs.gameOver) return
      if ('touches' in e) e.preventDefault()
      performJump()
    }

    canvas.addEventListener('touchstart', jumpOnTouch as EventListener, { passive: false })
    canvas.addEventListener('mousedown', jumpOnTouch as EventListener)

    return () => {
      canvas.removeEventListener('touchstart', jumpOnTouch as EventListener)
      canvas.removeEventListener('mousedown', jumpOnTouch as EventListener)
    }
  }, [screen, performJump])

  /* ── Resize ───────────────────────────────────────────── */
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /* ── Loading Screen ──────────────────────────────────── */
  useEffect(() => {
    if (screen !== 'loading') return
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const cap = balanceLoaded ? 100 : 90
        if (prev >= cap) return prev
        return Math.min(prev + Math.random() * 15, cap)
      })
    }, 200)
    const failSafeTimeout = setTimeout(() => setBalanceLoaded(true), 10000)
    return () => {
      clearInterval(interval)
      clearTimeout(failSafeTimeout)
    }
  }, [screen, balanceLoaded])

  useEffect(() => {
    if (screen !== 'loading' || loadingProgress < 100) return
    const t = setTimeout(() => setScreen('start'), 400)
    return () => clearTimeout(t)
  }, [screen, loadingProgress])

  /* ── Cleanup animation ───────────────────────────────── */
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-[#050510] font-['Orbitron',monospace] text-white touch-none select-none">

      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block touch-none" style={{ touchAction: 'none' }} />

      {/* Badge de statut WebSocket */}
      {screen !== 'loading' && (
        <div className="absolute bottom-3 right-3 z-[3000] flex items-center gap-2 py-1.5 px-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide pointer-events-none">
          <span className={`w-2 h-2 rounded-full ${wsStatus === 'authenticated' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(0,255,204,0.8)]' : wsStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : wsStatus === 'idle' ? 'bg-white/30' : 'bg-red-500'}`} />
          <span className="text-white/70">
            {wsStatus === 'authenticated' ? 'SERVEUR CONNECTE' : wsStatus === 'connecting' ? 'CONNEXION...' : wsStatus === 'idle' ? 'EN ATTENTE' : 'SERVEUR DECONNECTE'}
          </span>
        </div>
      )}

      {/* Loading Screen */}
      {screen === 'loading' && (
        <div className="absolute inset-0 bg-[#050510] flex flex-col justify-center items-center z-[2000]">
          <div className="text-xl sm:text-2xl text-emerald-400 mb-4 tracking-[2px] font-bold flex items-center gap-3">
            <RocketIcon />
            CHARGEMENT DU ROBOT...
          </div>
          <div className="w-[250px] h-1.5 bg-white/[0.08] rounded-full overflow-hidden mt-5">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full shadow-[0_0_15px_rgba(0,255,204,0.4)] transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
          </div>
          <div className="text-sm text-white/50 mt-3">Preparation des assets...</div>
        </div>
      )}

      {/* UI Overlay - Playing */}
      {screen === 'playing' && (
        <div className="absolute inset-0 pointer-events-none z-[100]">
          {/* Score */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-base sm:text-lg font-bold text-emerald-400 py-2.5 px-4 bg-black/50 backdrop-blur-lg border border-emerald-400/15 rounded-xl flex items-center gap-2 drop-shadow-[0_0_10px_rgba(0,255,204,0.4)]">
            <StarIcon />
            SCORE: {score}
          </div>

          {/* Speed */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 text-base sm:text-lg font-bold text-emerald-400 py-2.5 px-4 bg-black/50 backdrop-blur-lg border border-emerald-400/15 rounded-xl flex items-center gap-2 drop-shadow-[0_0_10px_rgba(0,255,204,0.4)]">
            <SpeedIcon />
            SPEED: {speedDisplay}
          </div>

          {/* Balance */}
          <div className="absolute top-[60px] sm:top-[65px] left-3 sm:left-4 text-xs sm:text-sm font-bold text-yellow-400 py-2 px-3 bg-black/50 backdrop-blur-lg border border-yellow-400/20 rounded-xl flex items-center gap-1.5 drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]">
            <WalletIcon />
            SOLDE: {userBalance} XOF
          </div>

          {/* Bet */}
          <div className="absolute top-[60px] sm:top-[65px] right-3 sm:right-4 text-xs sm:text-sm font-bold text-red-400 py-2 px-3 bg-black/50 backdrop-blur-lg border border-red-400/20 rounded-xl flex items-center gap-1.5 drop-shadow-[0_0_6px_rgba(255,51,102,0.4)]">
            <BetIcon />
            MISE: {currentBet} XOF
          </div>

          {/* Objective */}
          <div className="absolute top-[110px] sm:top-[115px] right-3 sm:right-4 max-w-[260px] sm:max-w-[280px] text-[11px] sm:text-xs font-semibold text-emerald-400 py-2 px-3 bg-black/50 backdrop-blur-lg border border-emerald-400/20 rounded-xl text-center drop-shadow-[0_0_6px_rgba(0,255,204,0.4)]">
            <div className="mb-1.5 truncate">{objectiveText}</div>
            <div className="h-1 bg-white/[0.1] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full transition-all duration-300" style={{ width: `${objectiveProgress * 100}%` }} />
            </div>
          </div>

          {/* Invincible Indicator */}
          {invincibleActive && (
            <div className="absolute top-[110px] sm:top-[115px] left-3 sm:left-4 text-[10px] sm:text-xs font-semibold py-1.5 px-2.5 bg-black/50 backdrop-blur-lg border border-red-400/20 rounded-lg text-red-400 uppercase tracking-[1px] flex items-center gap-1.5">
              <InvincibleShieldIcon />
              INVINCIBLE
            </div>
          )}

          {/* Double Jump Indicator */}
          {doubleJumpActive && !invincibleActive && (
            <div className="absolute top-[110px] sm:top-[115px] left-3 sm:left-4 text-[10px] sm:text-xs font-semibold py-1.5 px-2.5 bg-black/50 backdrop-blur-lg border border-emerald-400/20 rounded-lg text-emerald-400 uppercase tracking-[1px] flex items-center gap-1.5">
              <JumpIcon />
              DOUBLE JUMP
            </div>
          )}

          {/* Mobile hint */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-white/20 text-[10px] sm:text-xs tracking-wider pointer-events-none">
            TAP ECRAN = SAUTER
          </div>
        </div>
      )}

      {/* Start Screen */}
      {screen === 'start' && (
        <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-xl flex flex-col justify-center items-center z-[1000]">
          <div className="flex items-center gap-3 mb-6">
            <RocketIcon />
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 uppercase tracking-[4px] bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,255,204,0.3)] text-center px-4">
            NEON RUNNER
          </h1>
          <p className="text-white/40 text-sm sm:text-base mb-10 font-['Inter',sans-serif] tracking-wide text-center px-4">
            Courez, sautez, collectez et gagnez !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={startGame}
              className="group relative py-4 px-10 bg-gradient-to-r from-emerald-400 to-emerald-600 border-none rounded-xl text-[#0a0a0a] font-bold text-lg uppercase tracking-[2px] cursor-pointer shadow-[0_0_30px_rgba(0,255,204,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(0,255,204,0.5)] active:translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 min-w-[200px] overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <PlayIcon />
                <span className="relative z-10">START RUN</span>
              </button>
            <button
              onClick={() => setScreen('rules')}
              className="py-4 px-10 bg-white/[0.05] border-2 border-white/[0.1] rounded-xl text-white font-bold text-lg uppercase tracking-[2px] cursor-pointer hover:bg-white/[0.1] hover:border-white/[0.2] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 min-w-[200px]"
            >
              <BookIcon />
              REGLES
            </button>
          </div>
          <div className="absolute bottom-8 left-0 right-0 text-center text-white/40 text-xs sm:text-sm font-['Inter',sans-serif] p-2.5 tracking-wider">
            ESPACE OU CLIC POUR SAUTER
          </div>
        </div>
      )}

      {/* Bet Screen */}
      {screen === 'bet' && (
        <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-xl flex justify-center items-center z-[2000] p-4">
          <div className="bg-[#0a0a1a]/95 border-2 border-yellow-400/30 rounded-2xl p-6 sm:p-10 max-w-[500px] w-[95%] sm:w-[90%] text-center shadow-[0_0_60px_rgba(255,215,0,0.2)] backdrop-blur-xl">
            <h1 className="text-yellow-400 text-2xl sm:text-4xl font-black mb-5 uppercase tracking-[3px] drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
              MISE DU JOUR
            </h1>

            <div className="text-white text-lg sm:text-2xl mb-8 bg-yellow-400/10 py-4 px-5 rounded-2xl flex items-center justify-center gap-3 border border-yellow-400/15">
              <WalletIcon />
              SOLDE: {userBalance} XOF
            </div>

            <div className="my-8">
              <div className="text-gray-400 text-sm sm:text-base mb-3 uppercase tracking-[1px]">CHOISISSEZ VOTRE MISE</div>
              <div className="flex items-center justify-center gap-5 my-6">
                <button onClick={() => adjustBet(-100)} className="w-14 h-14 bg-yellow-400/10 border-2 border-yellow-400/40 text-yellow-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-400/20 hover:border-yellow-400 hover:scale-110 active:scale-95 transition-all duration-200">
                  <MinusIcon />
                </button>
                <div className="text-3xl sm:text-4xl text-yellow-400 font-black min-w-[140px] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] tracking-wider">
                  {currentBet} <span className="text-lg text-yellow-400/60">XOF</span>
                </div>
                <button onClick={() => adjustBet(100)} className="w-14 h-14 bg-yellow-400/10 border-2 border-yellow-400/40 text-yellow-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-400/20 hover:border-yellow-400 hover:scale-110 active:scale-95 transition-all duration-200">
                  <PlusIcon />
                </button>
              </div>

              <input
                type="range"
                min="100"
                max="1000"
                step="100"
                value={currentBet}
                onChange={(e) => setCurrentBet(parseInt(e.target.value))}
                className="w-full my-5 h-2 bg-yellow-400/10 rounded-full outline-none appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-yellow-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(255,215,0,0.7)] [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
              />

              <div className="flex justify-between text-gray-500 text-xs sm:text-sm mt-2 tracking-wider">
                <span>100 XOF</span>
                <span>1000 XOF</span>
              </div>
            </div>

            {betErrorMessage && (
              <div className="flex items-center justify-center gap-2 mb-6 py-3 px-4 bg-red-500/10 border border-red-400/30 rounded-xl text-red-400 text-sm font-semibold">
                <AlertIcon />
                {betErrorMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={confirmBet}
                disabled={isButtonLoading}
                className={`group relative py-4 px-8 bg-gradient-to-r from-emerald-400 to-emerald-600 border-none rounded-xl text-[#0a0a0a] font-bold text-base sm:text-lg uppercase tracking-[2px] cursor-pointer shadow-[0_0_30px_rgba(0,255,204,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(0,255,204,0.5)] active:translate-y-0.5 transition-all duration-300 min-w-[180px] ${isButtonLoading ? 'pointer-events-none opacity-70' : ''}`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className={`relative z-10 flex items-center justify-center gap-2 ${isButtonLoading ? 'opacity-0' : 'opacity-100'}`}>
                  <PlayIcon />
                  CONFIRMER LA MISE
                </span>
                {isButtonLoading && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-[3px] border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                )}
              </button>
              <button
                onClick={() => setScreen('start')}
                className="py-4 px-8 bg-white/[0.04] border-2 border-white/[0.08] rounded-xl text-white font-bold text-base sm:text-lg uppercase tracking-[2px] cursor-pointer hover:bg-white/[0.08] hover:border-white/[0.15] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-300 min-w-[180px]"
              >
                ANNULER
              </button>
            </div>
          </div>
        </div>
      )}
      
            {/* Objective Screen */}
      {screen === 'objective' && (
        <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-xl flex justify-center items-center z-[2001] p-4">
          <div className="bg-[#0a0a1a]/95 border-2 border-emerald-400/30 rounded-2xl p-6 sm:p-10 max-w-[600px] w-[95%] sm:w-[90%] text-center shadow-[0_0_60px_rgba(0,255,204,0.2)] backdrop-blur-xl">
            <div className="flex justify-center mb-6">
              <TargetIcon className="text-emerald-400" />
            </div>
            <h1 className="text-emerald-400 text-2xl sm:text-4xl font-black mb-5 uppercase tracking-[3px] drop-shadow-[0_0_20px_rgba(0,255,204,0.5)]">
              OBJECTIF DU JOUR
            </h1>
            <div className="text-white text-lg sm:text-2xl mb-8 leading-relaxed font-semibold">
              {gs.currentObjective?.description}
            </div>

            <div className="flex justify-around my-6 py-5 px-4 bg-emerald-400/10 rounded-2xl border border-emerald-400/15">
              <div className="text-center">
                <div className="text-gray-400 text-xs sm:text-sm mb-1.5 uppercase tracking-[1px]">VOTRE MISE</div>
                <div className="text-emerald-400 text-xl sm:text-2xl font-bold">{currentBet} XOF</div>
              </div>
              <div className="w-px bg-emerald-400/20" />
              <div className="text-center">
                <div className="text-gray-400 text-xs sm:text-sm mb-1.5 uppercase tracking-[1px]">GAIN POTENTIEL</div>
                <div className="text-emerald-400 text-xl sm:text-2xl font-bold">{currentBet * 2} XOF</div>
              </div>
            </div>

            <div className="inline-block py-2 px-6 bg-emerald-400/15 rounded-full text-sm sm:text-base text-emerald-400 my-4 border border-emerald-400/20 font-semibold tracking-[1px]">
              DIFFICULTE: {gs.currentObjective?.difficulty}
            </div>

            {betErrorMessage && (
              <div className="flex items-center justify-center gap-2 my-4 py-3 px-4 bg-red-500/10 border border-red-400/30 rounded-xl text-red-400 text-sm font-semibold">
                <AlertIcon />
                {betErrorMessage}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={startGameWithObjective}
                disabled={isButtonLoading}
                className={`group relative py-4 px-10 bg-gradient-to-r from-emerald-400 to-emerald-600 border-none rounded-xl text-[#0a0a0a] font-bold text-lg uppercase tracking-[2px] cursor-pointer shadow-[0_0_30px_rgba(0,255,204,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(0,255,204,0.5)] active:translate-y-0.5 transition-all duration-300 min-w-[200px] ${isButtonLoading ? 'pointer-events-none opacity-70' : ''}`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className={`relative z-10 flex items-center justify-center gap-2 ${isButtonLoading ? 'opacity-0' : 'opacity-100'}`}>
                  <RocketIcon />
                  COMMENCER LE DEFI
                </span>
                {isButtonLoading && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-[3px] border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Screen */}
      {screen === 'rules' && (
        <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-xl flex justify-center items-center z-[1000] p-4">
          <div className="bg-[#0a0a1a]/95 border border-emerald-400/15 rounded-2xl p-5 sm:p-8 max-w-[600px] w-[95%] sm:w-[90%] max-h-[85vh] overflow-y-auto backdrop-blur-xl shadow-[0_0_60px_rgba(0,255,204,0.1)] scrollbar-thin">
            <h1 className="text-3xl sm:text-5xl font-black mb-8 uppercase tracking-[3px] bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent text-center">
              REGLES DU JEU
            </h1>

            <div className="text-gray-300 font-['Inter',sans-serif] leading-relaxed text-sm sm:text-base space-y-5">
              <div className="bg-emerald-400/5 border-l-[3px] border-emerald-400 py-3 px-4 rounded-r-lg">
                <h3 className="text-emerald-400 text-lg font-bold mb-2 flex items-center gap-2">
                  <WalletIcon />
                  Systeme de Mise
                </h3>
                <p>Chaque partie commence par une mise. Vous devez miser entre 100 et 1000 XOF. Si vous reussissez l&apos;objectif, vous doublez votre mise !</p>
              </div>

              <div className="bg-emerald-400/5 border-l-[3px] border-emerald-400 py-3 px-4 rounded-r-lg">
                <h3 className="text-emerald-400 text-lg font-bold mb-2 flex items-center gap-2">
                  <TargetIcon className="!w-5 !h-5" />
                  Objectifs avec Mise
                </h3>
                <p>Apres avoir mise, un objectif aleatoire vous sera assigne. Reussissez-le pour doubler votre mise et l&apos;ajouter a votre solde !</p>
              </div>

              <h3 className="text-emerald-400 text-lg font-bold">Types d&apos;Objectifs</h3>
              <ul className="ml-5 space-y-2">
                <li className="relative before:content-['\25B8'] before:text-emerald-400 before:absolute before:-left-4"><strong className="text-yellow-400">Collecte de pieces</strong> : Collecter un certain nombre de pieces</li>
                <li className="relative before:content-['\25B8'] before:text-emerald-400 before:absolute before:-left-4"><strong className="text-emerald-400">Survie</strong> : Survivre pendant un certain temps</li>
                <li className="relative before:content-['\25B8'] before:text-emerald-400 before:absolute before:-left-4"><strong className="text-red-400">Score rapide</strong> : Atteindre un score dans un temps limite</li>
                <li className="relative before:content-['\25B8'] before:text-emerald-400 before:absolute before:-left-4"><strong className="text-purple-400">Score total</strong> : Atteindre un score specifique</li>
              </ul>

              <h3 className="text-emerald-400 text-lg font-bold">Controles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'ESPACE', desc: 'Sauter (Clavier)' },
                  { key: 'CLIC', desc: 'Sauter (Souris)' },
                  { key: 'TAP', desc: 'Sauter (Mobile)' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.03] py-3 px-4 rounded-xl text-center border border-white/[0.05]">
                    <div className="inline-block bg-emerald-400/10 border border-emerald-400/20 py-1.5 px-4 rounded-lg mb-2 font-bold text-emerald-400 text-sm tracking-wider">
                      {item.key}
                    </div>
                    <div className="text-gray-400 text-sm">{item.desc}</div>
                  </div>
                ))}
              </div>

              <h3 className="text-emerald-400 text-lg font-bold">Elements de Jeu</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/[0.03] py-3 px-4 rounded-xl border border-white/[0.05]">
                  <div className="w-10 h-10 bg-yellow-400/15 border-2 border-yellow-400/40 rounded-full flex items-center justify-center font-bold text-base text-yellow-400 flex-shrink-0">
                    <CoinIcon />
                  </div>
                  <div>
                    <strong className="text-yellow-400">Pieces d&apos;Or</strong>
                    <p className="text-gray-500 text-sm">Collectez-les pour augmenter votre score (+10 points)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/[0.03] py-3 px-4 rounded-xl border border-white/[0.05]">
                  <div className="w-10 h-10 bg-red-400/15 border-2 border-red-400/40 rounded-full flex items-center justify-center font-bold text-base text-red-400 flex-shrink-0">
                    <InvincibleShieldIcon />
                  </div>
                  <div>
                    <strong className="text-red-400">Power-up Invincible</strong>
                    <p className="text-gray-500 text-sm">Rend invincible pendant 5 secondes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/[0.03] py-3 px-4 rounded-xl border border-white/[0.05]">
                  <div className="w-10 h-10 bg-emerald-400/15 border-2 border-emerald-400/40 rounded-full flex items-center justify-center font-bold text-base text-emerald-400 flex-shrink-0">
                    <JumpIcon />
                  </div>
                  <div>
                    <strong className="text-emerald-400">Power-up Double Saut</strong>
                    <p className="text-gray-500 text-sm">Permet de sauter une seconde fois en l&apos;air</p>
                  </div>
                </div>
              </div>

              <h3 className="text-emerald-400 text-lg font-bold">Mecaniques</h3>
              <ul className="ml-5 space-y-2">
                <li className="relative before:content-['\25B8'] before:text-emerald-400 before:absolute before:-left-4">La vitesse augmente automatiquement toutes les 3 secondes</li>
                <li className="relative before:content-['\25B8'] before:text-emerald-400 before:absolute before:-left-4">La gravite augmente egalement avec la vitesse</li>
                <li className="relative before:content-['\25B8'] before:text-emerald-400 before:absolute before:-left-4">Atterrissez sur les plateformes pour eviter la chute</li>
              </ul>

              <div className="bg-emerald-400/5 border-l-[3px] border-emerald-400 py-3 px-4 rounded-r-lg">
                <h3 className="text-emerald-400 text-lg font-bold flex items-center gap-2">
                  <StarIcon />
                  Scoring et Gains
                </h3>
                <p className="text-emerald-400">Chaque piece collectee : +10 points</p>
                <p className="text-emerald-400">Objectif reussi : + double de la mise</p>
                <p className="text-red-400">Objectif echoue : - perte de la mise</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setScreen('start')}
                className="group relative py-4 px-10 bg-gradient-to-r from-red-500 to-red-700 border-none rounded-xl text-white font-bold text-lg uppercase tracking-[2px] cursor-pointer shadow-[0_0_30px_rgba(255,51,102,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(255,51,102,0.5)] active:translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <BackIcon />
                <span className="relative z-10">RETOUR AU MENU</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {screen === 'gameover' && (
        <div className="absolute inset-0 bg-[#050510]/95 backdrop-blur-xl flex flex-col justify-center items-center z-[1000] p-4">
          <div className={`text-5xl sm:text-7xl font-black mb-4 uppercase drop-shadow-[0_0_30px_rgba(255,51,102,0.5)] text-center ${gameOverMessage === 'SUCCES!' ? 'text-emerald-400' : 'text-red-400'}`}>
            {gameOverMessage}
          </div>
          <div className="text-gray-300 text-xl sm:text-3xl mb-5 font-light">SCORE: {score}</div>
          <div className="text-yellow-400 text-lg sm:text-xl mb-2.5 font-bold flex items-center gap-2">
            <WalletIcon />
            SOLDE: {userBalance} XOF
          </div>
          <div className={`text-base sm:text-xl mb-5 font-bold text-center max-w-[500px] px-4 ${objectiveResultText.includes('atteint') ? 'text-emerald-400' : 'text-red-400'}`}>
            {objectiveResultText}
          </div>
          <button
            onClick={resetGame}
            className="group relative mt-8 py-5 px-12 bg-gradient-to-r from-emerald-400 to-emerald-600 border-none rounded-xl text-[#0a0a0a] font-bold text-lg uppercase tracking-[2px] cursor-pointer shadow-[0_0_40px_rgba(0,255,204,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(0,255,204,0.5)] active:translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <RefreshIcon />
            <span className="relative z-10">PLAY AGAIN</span>
          </button>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessNotif && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/15 border-2 border-emerald-400/40 rounded-2xl py-8 sm:py-10 px-10 sm:px-16 text-center text-emerald-400 text-xl sm:text-3xl font-black z-[2002] pointer-events-none backdrop-blur-xl shadow-[0_0_80px_rgba(0,255,136,0.3)] uppercase tracking-[3px] animate-[celebrate_0.8s_ease-out]">
          <div className="flex justify-center mb-4">
            <TrophyIcon className="text-emerald-400" />
          </div>
          OBJECTIF ATTEINT!
          <div className="text-3xl sm:text-5xl text-yellow-400 my-5 drop-shadow-[0_0_25px_rgba(255,215,0,0.7)]">
            +{notifAmount} XOF
          </div>
          FELICITATIONS!
        </div>
      )}

      {/* Fail Notification */}
      {showFailNotif && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/15 border-2 border-red-400/40 rounded-2xl py-8 sm:py-10 px-10 sm:px-16 text-center text-red-400 text-xl sm:text-3xl font-black z-[2002] pointer-events-none backdrop-blur-xl shadow-[0_0_80px_rgba(255,0,0,0.3)] uppercase tracking-[3px] animate-[celebrate_0.8s_ease-out]">
          <div className="flex justify-center mb-4">
            <FailIcon className="text-red-400" />
          </div>
          OBJECTIF ECHOUE
          <div className="text-3xl sm:text-5xl text-red-400 my-5 drop-shadow-[0_0_25px_rgba(255,51,102,0.7)]">
            -{notifAmount} XOF
          </div>
          BONNE CHANCE LA PROCHAINE FOIS!
        </div>
      )}
    </div>
  )
}