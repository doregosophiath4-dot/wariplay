'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
)

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const RobotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <circle cx="15.5" cy="8.5" r="1.5" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const CubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const HandshakeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const CrownIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 14h14v2H5v-2z" />
  </svg>
)

const SkullIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <circle cx="9" cy="10" r="1.5" />
    <circle cx="15" cy="10" r="1.5" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <path d="M8 14c0 1.66 1.34 3 3 3s3-1.34 3-3" />
  </svg>
)

const HandshakeIcon2 = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
  </svg>
)

const PointerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    <path d="M13 13l6 6" />
  </svg>
)

/* ═══════════════════════════════════════════
   LOADER ICON - Spinner à 8 lignes
   ═══════════════════════════════════════════ */

const LoaderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    {/* 4 lignes cardinales (N, S, E, O) */}
    <line x1="12" y1="2" x2="12" y2="6" />    {/* Nord */}
    <line x1="12" y1="18" x2="12" y2="22" />  {/* Sud */}
    <line x1="2" y1="12" x2="6" y2="12" />    {/* Ouest */}
    <line x1="18" y1="12" x2="22" y2="12" />  {/* Est */}

    {/* 4 lignes diagonales (NE, SO, NO, SE) */}
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />      {/* NO */}
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />  {/* SE */}
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />    {/* SO */}
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />    {/* NE */}
  </svg>
)

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

type Section = 'welcome-screen' | 'bet-screen' | 'game-screen'
type Difficulty = 'medium' | 'hard'
type GameResult = 'player' | 'computer' | 'draw'

interface MoveResult {
  score: number
  index?: number
}

interface GameState {
  game_result: 'ongoing' | 'player' | 'computer' | 'draw'
  winning_line: number[] | null
  board: string[]
  current_player: 'X' | 'O'
}

interface WSMessage {
  type: string
  session_id?: string
  board?: string[]
  current_player?: 'X' | 'O'
  move?: number
  difficulty?: Difficulty
  bet?: number
  game_state?: GameState
  result?: GameResult
  prize?: number
  new_solde?: number
  nonce?: string
  timestamp?: number
  message?: string
  ai_move?: number
  lives?: number
  new_lives?: number
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function XOClash() {
  useAuth()
  const [activeSection, setActiveSection] = useState<Section>('welcome-screen')
  const [playerMoneyDisplay, setPlayerMoneyDisplay] = useState(1000)
  const [computerMoneyDisplay, setComputerMoneyDisplay] = useState(1000)
  const [currentBetDisplay, setCurrentBetDisplay] = useState(0)
  const [currentTurnText, setCurrentTurnText] = useState('Joueur (X)')
  const [currentTurnColor, setCurrentTurnColor] = useState('#00d4ff')
  const [modalActive, setModalActive] = useState(false)
  const [resultTitle, setResultTitle] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [prizeAmountText, setPrizeAmountText] = useState('')
  const [trophyIcon, setTrophyIcon] = useState<'crown' | 'robot' | 'handshake'>('crown')
  const [mobileLoadingActive, setMobileLoadingActive] = useState(false)
  const [betLoaderActive, setBetLoaderActive] = useState(false)
  const [lives, setLives] = useState(0)
  const [wsLoadingActive, setWsLoadingActive] = useState(false)
  const [wsLoadingMessage, setWsLoadingMessage] = useState('Connexion au serveur...')
  const [boardState, setBoardState] = useState<string[]>(['', '', '', '', '', '', '', '', ''])

  const [alertData, setAlertData] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'info' | 'error' | 'success' | 'warning'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const betInputRef = useRef<HTMLInputElement>(null)
  const touchZoneRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef(false)
  const pendingResolveRef = useRef<((value: any) => void) | null>(null)
  const pendingRejectRef = useRef<((reason?: any) => void) | null>(null)
  const gameSessionIdRef = useRef<string | null>(null)
  const lastNonceRef = useRef<string | null>(null)

  const handleAIMessageRef = useRef<(data: any) => void>(() => {})

  const currentPlayerRef = useRef<'X' | 'O'>('X')
  const gameBoardRef = useRef<string[]>(['', '', '', '', '', '', '', '', ''])
  const gameOverRef = useRef(false)
  const playerMoneyRef = useRef(1000)
  const computerMoneyRef = useRef(1000)
  const currentBetRef = useRef(0)
  const difficultyRef = useRef<Difficulty>('medium')
  const hoveredCellRef = useRef(-1)
  const winningLineRef = useRef<number[] | null>(null)
  const canvasSizeRef = useRef(0)
  const cellPaddingRef = useRef(10)
  const cellSizeRef = useRef(0)
  const isMobileRef = useRef(false)
  const particlesRef = useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    size: number
    alpha: number
    color: string
  }>>([])
  const timeRef = useRef(0)

  const drawBoardRef = useRef<() => void>(() => {})
  const resizeCanvasRef = useRef<() => void>(() => {})
  const computerMoveRef = useRef<() => void>(() => {})

  const C = {
    bgDark: '#0a0a1a',
    bgMid: '#12122a',
    gridLine: 'rgba(0, 212, 255, 0.4)',
    gridGlow: 'rgba(0, 212, 255, 0.8)',
    xColor: '#00d4ff',
    xColorAlt: '#0099ff',
    xGlow: 'rgba(0, 212, 255, 0.9)',
    oColor: '#ff3366',
    oColorAlt: '#ff6699',
    oGlow: 'rgba(255, 51, 102, 0.9)',
    accent: '#00d4ff',
    gold: '#ffd700',
    winLine: '#ffd700'
  }

  const showAlert = useCallback((title: string, message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
    setAlertData({
      isOpen: true,
      title,
      message,
      type
    })
  }, [])

  const closeAlert = useCallback(() => {
    setAlertData(prev => ({ ...prev, isOpen: false }))
  }, [])

  /* ── WebSocket ──────────────────────────────────────── */

  const closeWebSocket = useCallback(() => {
    wsReadyRef.current = false
    pendingResolveRef.current = null
    pendingRejectRef.current = null
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const openWebSocket = useCallback((): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (wsRef.current && wsReadyRef.current) {
        resolve()
        return
      }

      closeWebSocket()

      const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
      const wsUrl = proto + window.location.host + '/ws/xo_ai'
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      const timeout = setTimeout(() => {
        closeWebSocket()
        reject(new Error('Timeout WebSocket'))
      }, 30000)

      ws.onopen = async () => {
        try {
          await initAll()
          const authMessage = await prepareWSAuthMessage()
          ws.send(JSON.stringify(authMessage))
        } catch (error) {
          clearTimeout(timeout)
          reject(error)
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'auth_success') {
            clearTimeout(timeout)
            wsReadyRef.current = true
            resolve()
            return
          }

          handleAIMessageRef.current(data)

          if (pendingResolveRef.current) {
            const resolveFn = pendingResolveRef.current
            pendingResolveRef.current = null
            pendingRejectRef.current = null
            resolveFn(data)
          }
        } catch (error) {
          clearTimeout(timeout)
          reject(error)
        }
      }

      ws.onerror = (error) => {
        clearTimeout(timeout)
        closeWebSocket()
        reject(new Error('Erreur WebSocket'))
      }

      ws.onclose = (event) => {
        wsReadyRef.current = false
        wsRef.current = null
        if (pendingRejectRef.current) {
          pendingRejectRef.current(new Error('WebSocket fermé'))
          pendingResolveRef.current = null
          pendingRejectRef.current = null
        }
      }
    })
  }, [closeWebSocket])

  const sendWebSocketMessage = useCallback(async (message: any): Promise<any> => {
    if (!wsRef.current || !wsReadyRef.current) {
      throw new Error('Non connecté')
    }

    return new Promise((resolve, reject) => {
      if (!wsRef.current || !wsReadyRef.current) {
        reject(new Error('Non connecté'))
        return
      }

      const timeout = setTimeout(() => {
        pendingResolveRef.current = null
        pendingRejectRef.current = null
        reject(new Error('Timeout message'))
      }, 10000)

      pendingResolveRef.current = (data) => {
        clearTimeout(timeout)
        resolve(data)
      }
      pendingRejectRef.current = (error) => {
        clearTimeout(timeout)
        reject(error)
      }

      wsRef.current.send(JSON.stringify(message))
    })
  }, [])

  const generateNonce = useCallback(() => {
    const nonce = 'nonce_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    return nonce
  }, [])

  const sendSecureMessage = useCallback(async (type: string, data: any = {}) => {
    try {
      await initAll()

      const secureData = { ...data, type }

      if (type === 'player_move' || type === 'get_ai_move' || type === 'game_result' || type === 'create_session') {
        const nonce = generateNonce()
        lastNonceRef.current = nonce
        secureData.nonce = nonce
        secureData.timestamp = Math.floor(Date.now() / 1000)
      }

      if (gameSessionIdRef.current && !secureData.session_id) {
        secureData.session_id = gameSessionIdRef.current
      }

      const response = await sendWebSocketMessage(secureData)
      return response
    } catch (error) {
      throw error
    }
  }, [generateNonce, sendWebSocketMessage])

  /* ── HTTP Requests ──────────────────────────────────── */

  const fetchPlayerMoney = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/get_lettricide_solde')
      if (!response.ok) return 0
      const data = await response.json()
      return data.error ? 0 : (data.solde || 0)
    } catch (error) {
      return 0
    }
  }, [])

  const processBet = useCallback(async (betAmount: number) => {
    try {
      const response = await fetchWithAllTokens('/api/cherif', {
        method: 'POST',
        body: JSON.stringify({ bet: betAmount })
      })

      if (!response.ok) {
        return { success: false, error: 'Erreur HTTP' }
      }

      const data = await response.json()

      return data.success ?
        { success: true, newSolde: data.new_solde, message: data.message } :
        { success: false, error: data.error || 'Erreur traitement mise' }
    } catch (error) {
      return { success: false, error: 'Erreur connexion' }
    }
  }, [])

  const fetchPlayerLives = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/get_XO_lives')
      if (!response.ok) return 0
      const data = await response.json()
      return data.error ? 0 : (data.lives || 0)
    } catch (error) {
      return 0
    }
  }, [])

  const decrementPlayerLives = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/decrement_XO_lives', {
        method: 'POST'
      })

      if (!response.ok) {
        return { success: false, error: 'Erreur HTTP' }
      }

      const data = await response.json()

      if (data.error) {
        return { success: false, error: data.error }
      }

      return { success: true, new_lives: data.new_lives }
    } catch (error) {
      return { success: false, error: 'Erreur connexion' }
    }
  }, [])

  const createGameSession = useCallback(async (betAmount: number, difficulty: Difficulty) => {
    try {
      const response = await sendSecureMessage('create_session', {
        bet: betAmount,
        difficulty: difficulty
      })

      if (response.type === 'session_created') {
        gameSessionIdRef.current = response.session_id
        difficultyRef.current = response.difficulty
        if (response.nonce) {
          lastNonceRef.current = response.nonce
        }
        return true
      } else if (response.type === 'error') {
        showAlert('Erreur', 'Erreur création session: ' + response.message, 'error')
        return false
      }

      return false
    } catch (error) {
      return false
    }
  }, [sendSecureMessage, showAlert])

  /* ── Game Logic ─────────────────────────────────────── */

  const handleAIMessage = useCallback((data: any) => {
    // ✅ CORRECTION : le loader mobile "Wari réfléchit..." doit se fermer
    // dès qu'un message serveur arrive, quel que soit son type. Avant, il
    // n'était masqué que dans le cas 'move_processed' ET seulement si
    // `data.ai_move !== undefined`. Or quand la partie se termine SUR LE
    // COUP DU JOUEUR (victoire, nul, plateau complet), Wari n'a plus besoin
    // de jouer : le serveur n'envoie donc pas de `ai_move`, et le loader
    // (z-index 5000, au-dessus de la modale de résultat qui est en 1000)
    // restait affiché indéfiniment -- masquant même la modale de fin de
    // partie qui s'ouvrait bien en dessous. En fermant le loader ici, en
    // amont du switch, on garantit qu'il disparaît dès la réponse du
    // serveur, quel que soit le scénario (coup de l'IA, fin de partie,
    // erreur, session annulée, etc.).
    if (isMobileRef.current) {
      setMobileLoadingActive(false)
    }

    switch(data.type) {
      case 'move_processed':
        if (data.session_id === gameSessionIdRef.current) {
          gameBoardRef.current = data.board
          setBoardState(data.board)
          updateTurnDisplay()

          if (data.game_state && data.game_state.winning_line) {
            winningLineRef.current = data.game_state.winning_line
          }

          if (data.game_state) {
            handleGameState(data.game_state)
          }

          if (data.ai_move !== undefined) {
            currentPlayerRef.current = 'X'
            updateTurnDisplay()
          }

          if (data.nonce) {
            lastNonceRef.current = data.nonce
          }
        }
        break

      case 'ai_move':
        if (data.session_id === gameSessionIdRef.current) {
          gameBoardRef.current = data.board
          setBoardState(data.board)
          currentPlayerRef.current = 'X'
          updateTurnDisplay()

          if (data.game_state && data.game_state.winning_line) {
            winningLineRef.current = data.game_state.winning_line
          }

          if (data.game_state) {
            handleGameState(data.game_state)
          }

          if (data.nonce) {
            lastNonceRef.current = data.nonce
          }
        }
        break

      case 'game_state':
        if (data.session_id === gameSessionIdRef.current) {
          gameBoardRef.current = data.board
          setBoardState(data.board)
          currentPlayerRef.current = data.current_player
          updateTurnDisplay()

          if (data.game_state) {
            handleGameState(data.game_state)
          }
        }
        break

      case 'prize_calculated':
        break

      case 'difficulty_set':
        difficultyRef.current = data.difficulty
        break

      case 'game_result_processed':
        if (data.session_id === gameSessionIdRef.current) {
          if (data.new_solde !== undefined) {
            playerMoneyRef.current = data.new_solde
            updateMoneyDisplay()
          }

          showFinalModal(data.result, data.prize)

          setTimeout(() => {
            gameSessionIdRef.current = null
            lastNonceRef.current = null
          }, 3000)
        }
        break

      case 'session_created':
        gameSessionIdRef.current = data.session_id
        difficultyRef.current = data.difficulty

        if (data.nonce) {
          lastNonceRef.current = data.nonce
        }
        break

      case 'session_cancelled':
        if (data.session_id === gameSessionIdRef.current) {
          gameSessionIdRef.current = null
          lastNonceRef.current = null
          showAlert('Session annulée', 'Session annulée et mise remboursée', 'info')
          showSection('bet-screen')
        }
        break

      case 'error':
        if (data.message.includes('Nonce') || data.message.includes('timestamp')) {
          showAlert('Erreur de sécurité', data.message + '\nRechargement...', 'error')
          setTimeout(() => window.location.reload(), 1500)
        } else if (data.message.includes('Session') || data.message.includes('session')) {
          gameSessionIdRef.current = null
          lastNonceRef.current = null
          setTimeout(() => {
            showSection('bet-screen')
          }, 1000)
        }
        break
    }
  }, [])

  useEffect(() => {
    handleAIMessageRef.current = handleAIMessage
  }, [handleAIMessage])

  const handleGameState = useCallback((gameState: GameState) => {
    if (gameState.game_result !== 'ongoing') {
      gameOverRef.current = true
      winningLineRef.current = gameState.winning_line

      let title = ''
      let message = ''

      if (gameState.game_result === 'player') {
        title = 'Victoire !'
        message = 'Félicitations ! Vous avez brillamment battu Wari !'
        setTrophyIcon('crown')
      } else if (gameState.game_result === 'computer') {
        title = 'Défaite'
        message = 'Wari a remporté cette manche. La revanche sera votre !'
        setTrophyIcon('robot')
      } else if (gameState.game_result === 'draw') {
        title = 'Match nul'
        message = 'Égalité ! Vous êtes à la hauteur de Wari.'
        setTrophyIcon('handshake')
      }

      setResultTitle(title)
      setResultMessage(message)

      if (gameSessionIdRef.current) {
        sendSecureMessage('game_result', {
          result: gameState.game_result
        })

        showWaitingModal()
      }
    }
  }, [sendSecureMessage])

  const handleCellClick = useCallback((index: number) => {
    if (
      gameBoardRef.current[index] !== '' ||
      gameOverRef.current ||
      currentPlayerRef.current !== 'X' ||
      currentBetRef.current <= 0 ||
      !gameSessionIdRef.current
    ) {
      return
    }

    if (!wsReadyRef.current) {
      showAlert('Connexion perdue', 'La connexion au serveur a été perdue.', 'error')
      return
    }

    sendSecureMessage('player_move', {
      move: index,
      session_id: gameSessionIdRef.current
    })

    if (isMobileRef.current) {
      setMobileLoadingActive(true)
    }
  }, [sendSecureMessage, showAlert])

  /* ── Particles ──────────────────────────────────────── */
  function initParticles(size: number) {
    particlesRef.current = []
    const count = 40
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: Math.random() * size,
        y: Math.random() * size,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        color: Math.random() < 0.5 ? C.accent : C.oColor
      })
    }
  }

  /* ── Cell Geometry ──────────────────────────────────── */
  function getCellPosition(index: number) {
    const row = Math.floor(index / 3)
    const col = index % 3
    return {
      x: cellPaddingRef.current + col * (cellSizeRef.current + cellPaddingRef.current),
      y: cellPaddingRef.current + row * (cellSizeRef.current + cellPaddingRef.current)
    }
  }

  function getCellCenter(index: number) {
    const { x, y } = getCellPosition(index)
    return {
      x: x + cellSizeRef.current / 2,
      y: y + cellSizeRef.current / 2
    }
  }

  /* ── Drawing Functions ──────────────────────────────── */
  function drawBackground(ctx: CanvasRenderingContext2D, size: number) {
    const g = ctx.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.8)
    g.addColorStop(0, '#1a1a3e')
    g.addColorStop(0.5, '#0f0f25')
    g.addColorStop(1, '#0a0a15')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)

    ctx.globalAlpha = 0.03
    ctx.strokeStyle = C.accent
    ctx.lineWidth = 1
    const hexSize = size * 0.04
    for (let x = 0; x < size; x += hexSize * 3) {
      for (let y = 0; y < size; y += hexSize * Math.sqrt(3)) {
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i
          const hx = x + hexSize * Math.cos(angle)
          const hy = y + hexSize * Math.sin(angle)
          i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy)
        }
        ctx.closePath()
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1

    for (const p of particlesRef.current) {
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0

    const accentSize = size * 0.08
    const corners = [
      { x: 0, y: 0 },
      { x: size - accentSize, y: 0 },
      { x: 0, y: size - accentSize },
      { x: size - accentSize, y: size - accentSize }
    ]
    ctx.strokeStyle = C.accent
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.4
    for (const c of corners) {
      ctx.beginPath()
      ctx.moveTo(c.x, c.y + accentSize)
      ctx.lineTo(c.x, c.y)
      ctx.lineTo(c.x + accentSize, c.y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  function drawGrid3D(ctx: CanvasRenderingContext2D, size: number) {
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    const cp = cellPaddingRef.current
    const cs = cellSizeRef.current
    const glowIntensity = 0.5 + Math.sin(timeRef.current * 0.002) * 0.3

    for (let i = 1; i < 3; i++) {
      const x = cp * i + cs * i
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'
      ctx.lineWidth = Math.max(4, size * 0.01)
      ctx.beginPath()
      ctx.moveTo(x + 3, cp + 3)
      ctx.lineTo(x + 3, size - cp + 3)
      ctx.stroke()

      const lineGrad = ctx.createLinearGradient(x, cp, x, size - cp)
      lineGrad.addColorStop(0, C.accent)
      lineGrad.addColorStop(0.5, '#ffffff')
      lineGrad.addColorStop(1, C.accent)
      ctx.strokeStyle = lineGrad
      ctx.lineWidth = Math.max(2, size * 0.004)
      ctx.shadowColor = C.gridGlow
      ctx.shadowBlur = 8 * glowIntensity
      ctx.beginPath()
      ctx.moveTo(x, cp)
      ctx.lineTo(x, size - cp)
      ctx.stroke()
    }

    for (let i = 1; i < 3; i++) {
      const y = cp * i + cs * i
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'
      ctx.lineWidth = Math.max(4, size * 0.01)
      ctx.beginPath()
      ctx.moveTo(cp + 3, y + 3)
      ctx.lineTo(size - cp + 3, y + 3)
      ctx.stroke()

      const lineGrad = ctx.createLinearGradient(cp, y, size - cp, y)
      lineGrad.addColorStop(0, C.accent)
      lineGrad.addColorStop(0.5, '#ffffff')
      lineGrad.addColorStop(1, C.accent)
      ctx.strokeStyle = lineGrad
      ctx.lineWidth = Math.max(2, size * 0.004)
      ctx.shadowColor = C.gridGlow
      ctx.shadowBlur = 8 * glowIntensity
      ctx.beginPath()
      ctx.moveTo(cp, y)
      ctx.lineTo(size - cp, y)
      ctx.stroke()
    }

    ctx.shadowBlur = 0
    ctx.strokeStyle = C.accent
    ctx.lineWidth = Math.max(3, size * 0.006)
    ctx.globalAlpha = 0.8
    ctx.strokeRect(cp, cp, size - cp * 2, size - cp * 2)
    ctx.globalAlpha = 1

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1
    ctx.strokeRect(cp + 4, cp + 4, size - cp * 2 - 8, size - cp * 2 - 8)
  }

  function drawX(ctx: CanvasRenderingContext2D, size: number) {
    const s = cellSizeRef.current * 0.32
    ctx.save()
    ctx.shadowColor = C.xGlow
    ctx.shadowBlur = 25

    const g1 = ctx.createLinearGradient(-s, -s, s, s)
    g1.addColorStop(0, C.xColor)
    g1.addColorStop(0.5, '#ffffff')
    g1.addColorStop(1, C.xColorAlt)
    ctx.strokeStyle = g1
    ctx.lineWidth = Math.max(8, size * 0.022)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(-s, -s)
    ctx.lineTo(s, s)
    ctx.stroke()

    const g2 = ctx.createLinearGradient(s, -s, -s, s)
    g2.addColorStop(0, C.xColorAlt)
    g2.addColorStop(0.5, '#ffffff')
    g2.addColorStop(1, C.xColor)
    ctx.strokeStyle = g2
    ctx.beginPath()
    ctx.moveTo(s, -s)
    ctx.lineTo(-s, s)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = Math.max(3, size * 0.008)
    ctx.beginPath()
    ctx.moveTo(-s * 0.8, -s * 0.8)
    ctx.lineTo(s * 0.8, s * 0.8)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(s * 0.8, -s * 0.8)
    ctx.lineTo(-s * 0.8, s * 0.8)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.shadowColor = 'white'
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.moveTo(0, -s * 0.15)
    ctx.lineTo(s * 0.15, 0)
    ctx.lineTo(0, s * 0.15)
    ctx.lineTo(-s * 0.15, 0)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  function drawO(ctx: CanvasRenderingContext2D, size: number) {
    const s = cellSizeRef.current * 0.32
    ctx.save()
    ctx.shadowColor = C.oGlow
    ctx.shadowBlur = 25

    const g = ctx.createRadialGradient(0, 0, s * 0.6, 0, 0, s)
    g.addColorStop(0, C.oColor)
    g.addColorStop(0.5, '#ff5577')
    g.addColorStop(1, C.oColorAlt)
    ctx.strokeStyle = g
    ctx.lineWidth = Math.max(8, size * 0.022)
    ctx.beginPath()
    ctx.arc(0, 0, s, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = Math.max(3, size * 0.008)
    ctx.beginPath()
    ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.shadowColor = 'white'
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = Math.max(6, size * 0.015)
    ctx.shadowBlur = 0
    ctx.beginPath()
    ctx.arc(0, 0, s * 1.15, 0, Math.PI * 2)
    ctx.stroke()

    ctx.restore()
  }

  function drawXPreview(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
    const s = cellSizeRef.current * 0.22
    ctx.save()
    ctx.translate(cx, cy)
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = C.xColor
    ctx.lineWidth = Math.max(3, size * 0.006)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-s, -s)
    ctx.lineTo(s, s)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(s, -s)
    ctx.lineTo(-s, s)
    ctx.stroke()
    ctx.restore()
  }

  function drawHoverEffect(ctx: CanvasRenderingContext2D, index: number, size: number) {
    const { x, y } = getCellPosition(index)
    ctx.save()
    const pulse = 0.6 + Math.sin(Date.now() * 0.004) * 0.4
    const cs = cellSizeRef.current

    ctx.shadowColor = C.accent
    ctx.shadowBlur = 20 * pulse
    ctx.strokeStyle = `rgba(0, 212, 255, ${0.6 * pulse})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(x + 2, y + 2, cs - 4, cs - 4, 8)
    ctx.stroke()
    ctx.shadowBlur = 0

    const g = ctx.createLinearGradient(x, y, x + cs, y + cs)
    g.addColorStop(0, 'rgba(0, 212, 255, 0.08)')
    g.addColorStop(1, 'rgba(0, 150, 255, 0.05)')
    ctx.fillStyle = g
    ctx.fillRect(x, y, cs, cs)

    const dotSize = size * 0.01
    ctx.fillStyle = `rgba(0, 212, 255, ${0.7 * pulse})`
    const dots = [
      [x + 8, y + 8],
      [x + cs - 8 - dotSize * 2, y + 8],
      [x + 8, y + cs - 8 - dotSize * 2],
      [x + cs - 8 - dotSize * 2, y + cs - 8 - dotSize * 2]
    ]
    for (const [dx, dy] of dots) {
      ctx.beginPath()
      ctx.arc(dx, dy, dotSize, 0, Math.PI * 2)
      ctx.fill()
    }

    if (currentPlayerRef.current === 'X') {
      ctx.globalAlpha = 0.35 * pulse
      drawXPreview(ctx, x + cs / 2, y + cs / 2, size)
      ctx.globalAlpha = 1
    }
    ctx.restore()
  }

  function drawWinningLine(ctx: CanvasRenderingContext2D, size: number) {
    if (!winningLineRef.current) return
    const [a, , c] = winningLineRef.current
    const p1 = getCellCenter(a)
    const p2 = getCellCenter(c)

    ctx.save()
    ctx.shadowColor = C.winLine
    ctx.shadowBlur = 30

    const g = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
    g.addColorStop(0, C.winLine)
    g.addColorStop(0.5, '#ffffff')
    g.addColorStop(1, C.winLine)
    ctx.strokeStyle = g
    ctx.lineWidth = Math.max(8, size * 0.02)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.lineWidth = Math.max(3, size * 0.008)
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()

    const sparkCount = 8
    ctx.fillStyle = 'white'
    ctx.shadowColor = 'white'
    ctx.shadowBlur = 10
    for (let i = 0; i < sparkCount; i++) {
      const t = i / (sparkCount - 1)
      const sx = p1.x + (p2.x - p1.x) * t
      const sy = p1.y + (p2.y - p1.y) * t
      const sparkSize = size * 0.008 * (1 + Math.sin(Date.now() * 0.01 + i) * 0.5)
      ctx.beginPath()
      ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  function drawSymbol(ctx: CanvasRenderingContext2D, index: number, symbol: string, size: number) {
    if (!symbol) return
    const { x, y } = getCellPosition(index)
    ctx.save()
    ctx.translate(x + cellSizeRef.current / 2, y + cellSizeRef.current / 2)
    if (symbol === 'X') drawX(ctx, size)
    else if (symbol === 'O') drawO(ctx, size)
    ctx.restore()
  }

  function updateParticles(size: number) {
    for (const p of particlesRef.current) {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0) p.x = size
      if (p.x > size) p.x = 0
      if (p.y < 0) p.y = size
      if (p.y > size) p.y = 0
    }
  }

  function drawBoard() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = canvasSizeRef.current
    if (size === 0) return

    timeRef.current = Date.now()
    cellPaddingRef.current = size * 0.025
    cellSizeRef.current = (size - cellPaddingRef.current * 4) / 3

    ctx.clearRect(0, 0, size, size)
    updateParticles(size)
    drawBackground(ctx, size)
    drawGrid3D(ctx, size)

    const boardToDraw = boardState.length === 9 ? boardState : gameBoardRef.current

    for (let i = 0; i < 9; i++) {
      drawSymbol(ctx, i, boardToDraw[i], size)
    }

    if (winningLineRef.current) drawWinningLine(ctx, size)

    if (
      hoveredCellRef.current >= 0 &&
      boardToDraw[hoveredCellRef.current] === '' &&
      !gameOverRef.current
    ) {
      drawHoverEffect(ctx, hoveredCellRef.current, size)
    }
  }

  drawBoardRef.current = drawBoard

  function resizeCanvas() {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    canvasSizeRef.current = Math.min(container.clientWidth, container.clientHeight)
    canvas.width = canvasSizeRef.current
    canvas.height = canvasSizeRef.current
    if (particlesRef.current.length === 0) initParticles(canvasSizeRef.current)
    drawBoardRef.current()
  }

  resizeCanvasRef.current = resizeCanvas

  /* ── Reset / Navigation ─────────────────────────────── */

  function resetGame() {
    const emptyBoard = ['', '', '', '', '', '', '', '', '']
    gameBoardRef.current = emptyBoard
    setBoardState(emptyBoard)
    currentPlayerRef.current = 'X'
    gameOverRef.current = false
    winningLineRef.current = null
    updateTurnDisplay()
    setMobileLoadingActive(false)
  }

  function selectRandomDifficulty() {
    const random = Math.random()
    difficultyRef.current = random < 0.5 ? 'medium' : 'hard'
  }

  function placeBet(betAmount: number) {
    currentBetRef.current = betAmount
    setCurrentBetDisplay(betAmount)
    selectRandomDifficulty()
    resetGame()
    setActiveSection('game-screen')
    setTimeout(() => resizeCanvasRef.current(), 50)
  }

  const startBetProcess = useCallback(async () => {
    const betAmount = parseInt(betInputRef.current?.value ?? '0')

    if (isNaN(betAmount)) {
      showAlert('Erreur', 'Veuillez entrer un montant valide', 'error')
      return
    }

    if (betAmount < 100) {
      showAlert('Erreur', "La mise doit être d'au moins 100 CFA", 'error')
      return
    }

    // Étape 1 : Authentification WebSocket (garder ouvert)
    setWsLoadingActive(true)
    setWsLoadingMessage('Connexion au serveur...')

    try {
      if (wsRef.current && wsReadyRef.current) {
      } else {
        await openWebSocket()
      }
    } catch (error) {
      setWsLoadingActive(false)
      showAlert('Erreur de connexion', 'Impossible de se connecter au serveur.', 'error')
      return
    }

    // Étape 2 : Décrémentation des vies
    const currentLives = await fetchPlayerLives()
    setLives(currentLives)

    if (currentLives <= 0) {
      setWsLoadingActive(false)
      showAlert('Vies épuisées', 'Vous n\'avez plus de vies pour jouer.', 'warning')
      return
    }

    const livesResult = await decrementPlayerLives()
    if (!livesResult.success) {
      setWsLoadingActive(false)
      showAlert('Erreur', 'Erreur lors de la décrémentation des vies: ' + livesResult.error, 'error')
      return
    }

    setLives(livesResult.new_lives)

    // Récupérer le solde (préparatif pour l'étape 3)
    const currentMoney = await fetchPlayerMoney()
    playerMoneyRef.current = currentMoney
    updateMoneyDisplay()

    if (betAmount > playerMoneyRef.current) {
      setWsLoadingActive(false)
      showAlert('Erreur', "Vous n'avez pas assez d'argent pour cette mise", 'error')
      return
    }

    setBetLoaderActive(true)

    try {
      // Étape 3 : Mise avec appel /api/cherif
      const betResult = await processBet(betAmount)

      if (!betResult.success) {
        setBetLoaderActive(false)
        setWsLoadingActive(false)
        showAlert('Erreur de mise', betResult.error || 'Erreur lors du traitement de la mise.', 'error')
        return
      }

      playerMoneyRef.current = betResult.newSolde
      updateMoneyDisplay()

      // Étape 4 : Création de session de jeu
      const sessionCreated = await createGameSession(betAmount, difficultyRef.current)

      if (!sessionCreated) {
        setBetLoaderActive(false)
        setWsLoadingActive(false)
        showAlert('Erreur', 'Échec de la création de la session de jeu.', 'error')
        return
      }

      // Tout est prêt : masquer le loader et afficher le jeu
      setBetLoaderActive(false)
      setWsLoadingActive(false)
      placeBet(betAmount)

    } catch (error) {
      setBetLoaderActive(false)
      setWsLoadingActive(false)
      showAlert('Erreur', (error instanceof Error ? error.message : 'Erreur inconnue'), 'error')
    }
  }, [openWebSocket, fetchPlayerLives, decrementPlayerLives, fetchPlayerMoney, processBet, createGameSession, showAlert])

  function closeModal() {
    setModalActive(false)
    resetGame()
    setActiveSection('bet-screen')
    setTimeout(() => resizeCanvasRef.current(), 50)
  }

  function showWaitingModal() {
    setModalActive(true)
    setResultTitle('Traitement en cours...')
    setResultMessage('Calcul des gains...')
    setPrizeAmountText('')
  }

  function showFinalModal(result: GameResult, prize: number) {
    let title = ''
    let message = ''

    if (result === 'player') {
      title = 'Victoire !'
      message = 'Félicitations ! Vous avez brillamment battu Wari !'
      setTrophyIcon('crown')
    } else if (result === 'computer') {
      title = 'Défaite'
      message = 'Wari a remporté cette manche. La revanche sera votre !'
      setTrophyIcon('robot')
    } else if (result === 'draw') {
      title = 'Match nul'
      message = 'Égalité ! Vous êtes à la hauteur de Wari.'
      setTrophyIcon('handshake')
    }

    setResultTitle(title)
    setResultMessage(message)

    if (result !== 'draw') {
      setPrizeAmountText(`${prize} CFA`)
    } else {
      setPrizeAmountText(`${prize} CFA (remboursé)`)
    }

    setModalActive(true)
  }

  function showSection(section: Section) {
    setActiveSection(section)
    setTimeout(() => resizeCanvasRef.current(), 50)
  }

  function updateMoneyDisplay() {
    setPlayerMoneyDisplay(playerMoneyRef.current)
    setComputerMoneyDisplay(computerMoneyRef.current)
  }

  function updateTurnDisplay() {
    if (currentPlayerRef.current === 'X') {
      setCurrentTurnText('Joueur (X)')
      setCurrentTurnColor(C.xColor)
    } else {
      setCurrentTurnText('Wari (O)')
      setCurrentTurnColor(C.oColor)
    }
  }

  function resolveCell(clientX: number, clientY: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    hoveredCellRef.current = -1

    for (let i = 0; i < 9; i++) {
      const { x: cx, y: cy } = getCellPosition(i)
      if (
        x >= cx &&
        x <= cx + cellSizeRef.current &&
        y >= cy &&
        y <= cy + cellSizeRef.current
      ) {
        hoveredCellRef.current = i
        break
      }
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    resolveCell(e.clientX, e.clientY)
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (
      hoveredCellRef.current >= 0 &&
      !gameOverRef.current &&
      currentPlayerRef.current === 'X' &&
      currentBetRef.current > 0
    ) {
      handleCellClick(hoveredCellRef.current)
    }
  }

  /* ── Effects ─────────────────────────────────────────── */

  useEffect(() => {
    isMobileRef.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

    const initGame = async () => {
      selectRandomDifficulty()
      resizeCanvasRef.current()

      const money = await fetchPlayerMoney()
      playerMoneyRef.current = money
      updateMoneyDisplay()

      const livesCount = await fetchPlayerLives()
      setLives(livesCount)
    }

    initGame()

    const onResize = () => resizeCanvasRef.current()
    const onOrientation = () => setTimeout(() => resizeCanvasRef.current(), 100)

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onOrientation)

    const loop = () => {
      drawBoardRef.current()
      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onOrientation)
      cancelAnimationFrame(animFrameRef.current)
      closeWebSocket()
    }
  }, [fetchPlayerMoney, fetchPlayerLives, closeWebSocket])

  useEffect(() => {
    const zone = touchZoneRef.current
    if (!zone) return

    const onStart = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length === 1) {
        resolveCell(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const onMove = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length === 1) {
        resolveCell(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const onEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (
        !gameOverRef.current &&
        currentPlayerRef.current === 'X' &&
        currentBetRef.current > 0 &&
        hoveredCellRef.current >= 0
      ) {
        handleCellClick(hoveredCellRef.current)
      }
    }

    zone.addEventListener('touchstart', onStart, { passive: false })
    zone.addEventListener('touchmove', onMove, { passive: false })
    zone.addEventListener('touchend', onEnd, { passive: false })

    return () => {
      zone.removeEventListener('touchstart', onStart)
      zone.removeEventListener('touchmove', onMove)
      zone.removeEventListener('touchend', onEnd)
    }
  }, [handleCellClick])

  useEffect(() => {
    setTimeout(() => resizeCanvasRef.current(), 50)
  }, [activeSection])

  /* ═══════════════════════════════════════════     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-['Inter',sans-serif] text-white bg-[#0a0a1a] p-5 overflow-x-hidden">

      {/* Background Effects */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.06)_1px,transparent_1px)] bg-[length:60px_60px] opacity-50 animate-[gridMove_30s_linear_infinite]" />

        <div className="absolute w-[350px] h-[350px] rounded-full blur-[80px] opacity-50 -top-[10%] -left-[5%] bg-[radial-gradient(circle,rgba(0,212,255,0.3),transparent_70%)] animate-[orbFloat_20s_infinite_alternate_ease-in-out]" />
        <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-50 -bottom-[10%] -right-[5%] bg-[radial-gradient(circle,rgba(255,51,102,0.25),transparent_70%)] animate-[orbFloat_20s_infinite_alternate_ease-in-out_7s]" />
        <div className="absolute w-[250px] h-[250px] rounded-full blur-[80px] opacity-50 top-[40%] left-[70%] bg-[radial-gradient(circle,rgba(255,215,0,0.2),transparent_70%)] animate-[orbFloat_20s_infinite_alternate_ease-in-out_14s]" />
        <div className="absolute w-[200px] h-[200px] rounded-full blur-[80px] opacity-50 top-[60%] left-[10%] bg-[radial-gradient(circle,rgba(0,212,255,0.2),transparent_70%)] animate-[orbFloat_20s_infinite_alternate_ease-in-out_3s]" />

        <div className="absolute inset-0" id="particles">
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-[floatUp_linear_infinite] blur-[1px] ${
                i % 2 === 0 ? 'bg-[rgba(0,212,255,0.5)]' : ''
              } ${i % 3 === 0 ? 'bg-[rgba(255,51,102,0.4)]' : ''} ${
                i % 5 === 0 ? 'bg-[rgba(255,215,0,0.3)]' : ''
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${Math.random() * 15 + 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[900px] bg-[#12122a]/85 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden p-6 sm:p-8 relative border border-white/[0.08] backdrop-blur-xl z-10
        before:absolute before:-top-0.5 before:-left-0.5 before:-right-0.5 before:-bottom-0.5 before:rounded-[17px] before:bg-gradient-to-br before:from-[rgba(0,212,255,0.3)] before:via-[rgba(255,51,102,0.3)] before:to-[rgba(255,215,0,0.3)] before:bg-[length:400%_400%] before:-z-[1] before:animate-[gradientBorder_8s_ease_infinite] before:opacity-60
        after:absolute after:inset-0 after:bg-[#12122a]/95 after:rounded-2xl after:-z-[1]">

        {/* ══════════════════════════════════════ */}
        {/* WELCOME SCREEN */}
        {/* ══════════════════════════════════════ */}
        {activeSection === 'welcome-screen' && (
          <div className="animate-[fadeInUp_0.5s_ease-out]">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.2),transparent_70%)] animate-[logoPulse_3s_ease-in-out_infinite]" />
                <div className="relative text-6xl sm:text-7xl flex items-center justify-center gap-1.5">
                  <span className="text-[#00d4ff] font-black drop-shadow-[0_0_20px_rgba(0,212,255,0.4)] animate-[floatIcon_3s_ease-in-out_infinite]">X</span>
                  <span className="text-[#ff3366] font-black drop-shadow-[0_0_20px_rgba(255,51,102,0.4)] animate-[floatIcon_3s_ease-in-out_infinite_0.5s]">O</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl text-white font-extrabold mb-2.5 tracking-tight">
                <span className="bg-gradient-to-r from-[#00d4ff] via-[#ff3366] to-[#ffd700] bg-[length:200%_200%] bg-clip-text text-transparent animate-[gradientShift_4s_ease_infinite]">
                  XO-Clash
                </span>
              </h1>

              <p className="text-gray-400 text-base sm:text-lg font-normal mt-1.5">
                Affronte Wari dans un duel stratégique
              </p>

              <div className="flex justify-center gap-5 mt-6 flex-wrap">
                <div className="flex items-center gap-2 bg-white/[0.05] py-2.5 px-4 rounded-full border border-white/[0.1] text-sm text-gray-400 hover:bg-white/[0.1] hover:-translate-y-0.5 transition-all duration-300">
                  <span className="text-[#00d4ff]"><CoinsIcon /></span>
                  <span>Paris & Gains</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.05] py-2.5 px-4 rounded-full border border-white/[0.1] text-sm text-gray-400 hover:bg-white/[0.1] hover:-translate-y-0.5 transition-all duration-300">
                  <span className="text-[#00d4ff]"><CubeIcon /></span>
                  <span>Rendu 3D</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 mt-6">
              <button
                onClick={() => showSection('bet-screen')}
                className="w-full max-w-[320px] py-4 px-8 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-white font-semibold text-lg rounded-2xl shadow-[0_4px_15px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,212,255,0.5)] active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <PlayIcon />
                Commencer la partie
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* BET SCREEN */}
        {/* ══════════════════════════════════════ */}
        {activeSection === 'bet-screen' && (
          <div className="animate-[fadeInUp_0.5s_ease-out]">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-4xl font-extrabold mb-2.5">
                <span className="bg-gradient-to-r from-[#00d4ff] via-[#ff3366] to-[#ffd700] bg-[length:200%_200%] bg-clip-text text-transparent animate-[gradientShift_4s_ease_infinite]">
                  Placez votre mise
                </span>
              </h1>
              <p className="text-gray-400 text-sm">Choisissez le montant que vous voulez parier</p>
            </div>

            <div className="flex items-center justify-center gap-4 w-full max-w-[550px] mx-auto mb-6 bg-[#1a1a3e]/80 p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-white/[0.06] flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                <div className="w-11 h-11 rounded-xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-lg text-[#00d4ff]">
                  <UserIcon />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Joueur</div>
                  <div className="font-bold text-white text-base sm:text-lg">{playerMoneyDisplay} CFA</div>
                </div>
              </div>

              <div className="flex items-center justify-center px-2.5">
                <span className="bg-gradient-to-r from-[#00d4ff] to-[#ff3366] bg-clip-text text-transparent font-extrabold text-lg tracking-wider">VS</span>
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                <div className="w-11 h-11 rounded-xl bg-[#ff3366]/15 border border-[#ff3366]/30 flex items-center justify-center text-lg text-[#ff3366]">
                  <RobotIcon />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Wari</div>
                  <div className="font-bold text-white text-base sm:text-lg">{computerMoneyDisplay} CFA</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Vies restantes:</span>
              <span className="text-[#ffd700] font-bold text-base">{lives}</span>
            </div>

            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="flex flex-wrap gap-3 justify-center items-center w-full max-w-[450px] mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00d4ff] z-10">
                    <CoinsIcon />
                  </span>
                  <input
                    type="number"
                    ref={betInputRef}
                    placeholder="Montant de la mise (CFA)"
                    min="100"
                    defaultValue="100"
                    inputMode="numeric"
                    className="w-full py-3.5 pl-11 pr-4 bg-[#0a0a1a]/80 border-2 border-white/[0.1] rounded-xl text-white text-base outline-none transition-all duration-300 focus:border-[#00d4ff] focus:shadow-[0_0_0_4px_rgba(0,212,255,0.15),0_0_20px_rgba(0,212,255,0.4)] placeholder:text-white/30 min-h-[52px]"
                  />
                </div>

                <button
                  onClick={startBetProcess}
                  disabled={betLoaderActive || wsLoadingActive}
                  className="w-full sm:w-auto min-w-[180px] py-4 px-8 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-white font-semibold text-base rounded-2xl shadow-[0_4px_15px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,212,255,0.5)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center justify-center gap-2 min-h-[52px]"
                >
                  {betLoaderActive || wsLoadingActive ? (
                    <>
                      <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Validation...</span>
                    </>
                  ) : (
                    <>
                      <HandshakeIcon />
                      <span>Placer la mise</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => showSection('welcome-screen')}
                className="w-full max-w-[320px] py-3.5 px-6 bg-white/[0.06] text-white border border-white/[0.15] rounded-xl font-semibold text-sm hover:bg-white/[0.12] hover:-translate-y-0.5 hover:border-white/[0.25] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon />
                Retour
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* GAME SCREEN */}
        {/* ══════════════════════════════════════ */}
        {activeSection === 'game-screen' && (
          <div className="animate-[fadeInUp_0.5s_ease-out]">
            <div className="text-center mb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-1.5">
                <span className="bg-gradient-to-r from-[#00d4ff] via-[#ff3366] to-[#ffd700] bg-[length:200%_200%] bg-clip-text text-transparent animate-[gradientShift_4s_ease_infinite]">
                  XO-Clash
                </span>
              </h1>
              <p className="text-gray-400 text-sm">Affrontez Wari</p>
            </div>

            <div className="flex items-center justify-center gap-4 w-full max-w-[550px] mx-auto mb-5 bg-[#1a1a3e]/80 p-4 sm:p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-white/[0.06] flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-lg text-[#00d4ff]">
                  <UserIcon />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Joueur</div>
                  <div className="font-bold text-white text-sm sm:text-base">{playerMoneyDisplay} CFA</div>
                </div>
              </div>

              <div className="flex items-center justify-center px-2.5">
                <span className="bg-gradient-to-r from-[#00d4ff] to-[#ff3366] bg-clip-text text-transparent font-extrabold text-base tracking-wider">VS</span>
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-[140px]">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#ff3366]/15 border border-[#ff3366]/30 flex items-center justify-center text-lg text-[#ff3366]">
                  <RobotIcon />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Wari</div>
                  <div className="font-bold text-white text-sm sm:text-base">{computerMoneyDisplay} CFA</div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a3e]/80 py-3.5 px-5 rounded-2xl mb-5 flex items-center justify-center gap-5 border border-white/[0.06] shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex-wrap">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Tour actuel</span>
                <span className="font-bold text-base" style={{ color: currentTurnColor }}>{currentTurnText}</span>
              </div>
              <div className="w-px h-9 bg-white/[0.1]" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Mise</span>
                <span className="text-[#ffd700] font-bold text-base">{currentBetDisplay} CFA</span>
              </div>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div
                ref={containerRef}
                className="relative w-full max-w-[420px] aspect-square mx-auto mb-4 rounded-2xl overflow-hidden shadow-[0_0_0_2px_rgba(0,212,255,0.2),0_0_40px_rgba(0,212,255,0.1),inset_0_0_40px_rgba(0,0,0,0.3)] bg-[#0a0a1a] touch-none
                  before:absolute before:inset-0 before:rounded-2xl before:p-[2px] before:bg-gradient-to-br before:from-[rgba(0,212,255,0.4)] before:to-[rgba(255,51,102,0.4)] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude] before:pointer-events-none before:z-[2]"
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-full block cursor-pointer relative z-[1]"
                  onMouseMove={handleMouseMove}
                  onClick={handleCanvasClick}
                />
                <div className="absolute inset-0 pointer-events-none z-[3] bg-[radial-gradient(circle_at_30%_30%,rgba(0,212,255,0.03),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(255,51,102,0.03),transparent_50%)]" />
                <div
                  ref={touchZoneRef}
                  className="absolute inset-0 z-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-[#00d4ff] animate-pulse"><PointerIcon /></span>
                Appuyez sur une case pour placer votre symbole X
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => showSection('bet-screen')}
                className="w-full sm:w-auto min-w-[180px] py-3.5 px-6 bg-white/[0.06] text-white border border-white/[0.15] rounded-xl font-semibold text-sm hover:bg-white/[0.12] hover:-translate-y-0.5 hover:border-white/[0.25] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon />
                Changer la mise
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════ */}
      {/* LOADER OVERLAY - Style étoile à 8 branches */}
      {/* ══════════════════════════════════════ */}
      {(betLoaderActive || wsLoadingActive || mobileLoadingActive) && (
        <div className="fixed inset-0 bg-[#0a0a1a]/90 backdrop-blur-xl flex flex-col items-center justify-center z-[5000] animate-[fadeIn_0.3s_ease-out]">
          <div className="w-24 h-24 bg-gradient-to-br from-[#00d4ff] to-[#ff3366] rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(0,212,255,0.4)] mb-6 animate-pulse">
            <LoaderIcon />
          </div>

          <p className="text-lg font-semibold text-white/90 animate-pulse">
            {betLoaderActive ? 'Traitement de la mise...' :
             wsLoadingActive ? wsLoadingMessage :
             'Wari réfléchit...'}
          </p>

          <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00d4ff] to-[#ff3366] animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* ALERT MODAL - Style uniforme au jeu */}
      {alertData.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex justify-center items-center z-[1000] p-5 transition-all duration-300 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-gradient-to-br from-[#1a1a3e]/98 to-[#12122a]/98 p-6 sm:p-8 rounded-2xl text-center max-w-[400px] w-full relative shadow-[0_0_60px_rgba(0,212,255,0.15),0_0_120px_rgba(255,51,102,0.1)] border border-white/[0.1] transform transition-all duration-300 scale-100">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-0.5 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent rounded-full" />

            <div className="text-4xl sm:text-5xl mb-4">
              {alertData.type === 'error' && <span className="text-red-400">⚠️</span>}
              {alertData.type === 'success' && <span className="text-green-400">✅</span>}
              {alertData.type === 'warning' && <span className="text-yellow-400">⚠️</span>}
              {alertData.type === 'info' && <span className="text-blue-400">ℹ️</span>}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">
              {alertData.title}
            </h2>

            <p className="text-gray-400 text-base mb-6 leading-relaxed">
              {alertData.message}
            </p>

            <button
              onClick={closeAlert}
              className="w-full max-w-[240px] py-3 px-6 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-white font-semibold text-base rounded-2xl shadow-[0_4px_15px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,212,255,0.5)] transition-all duration-300 mx-auto"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* RESULT MODAL */}
      {/* ══════════════════════════════════════ */}
      <div className={`fixed inset-0 bg-black/85 backdrop-blur-xl flex justify-center items-center z-[1000] p-5 transition-all duration-300 ${modalActive ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className={`bg-gradient-to-br from-[#1a1a3e]/98 to-[#12122a]/98 p-8 sm:p-10 rounded-2xl text-center max-w-[450px] w-full relative shadow-[0_0_60px_rgba(0,212,255,0.15),0_0_120px_rgba(255,51,102,0.1)] border border-white/[0.1] transition-all duration-300 ${modalActive ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-0.5 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent rounded-full" />

          <div className="text-5xl sm:text-6xl text-[#ffd700] mb-5 animate-[bounce_2s_ease-in-out_infinite] drop-shadow-[0_0_20px_rgba(255,215,0,0.4)] filter">
            {trophyIcon === 'crown' && <CrownIcon />}
            {trophyIcon === 'robot' && <SkullIcon />}
            {trophyIcon === 'handshake' && <HandshakeIcon2 />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
            {resultTitle}
          </h2>

          <p className="text-gray-400 text-base sm:text-lg mb-5 leading-relaxed">
            {resultMessage}
          </p>

          {prizeAmountText && (
            <div className="text-2xl sm:text-3xl font-extrabold text-[#ffd700] my-5 drop-shadow-[0_0_20px_rgba(255,215,0,0.4)] tracking-tight">
              {prizeAmountText}
            </div>
          )}

          <button
            onClick={closeModal}
            className="w-full max-w-[320px] py-4 px-8 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-white font-semibold text-base rounded-2xl shadow-[0_4px_15px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,212,255,0.5)] transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshIcon />
            Rejouer
          </button>
        </div>
      </div>
    </div>
  )
}