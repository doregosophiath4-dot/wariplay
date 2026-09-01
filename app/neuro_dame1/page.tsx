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

const CoinsIcon = ({ className = "text-blue-400" }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const RobotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <circle cx="15.5" cy="8.5" r="1.5" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
)

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const TrophyIcon = ({ className = "text-yellow-400" }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const CrownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400 drop-shadow-[0_0_10px_rgba(184,134,11,0.8)]">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 14h14v2H5v-2z" />
  </svg>
)

/* ═══════════════════════════════════════════
   LOADER ICON
   ═══════════════════════════════════════════ */

const LoaderIcon = ({ className = "text-yellow-400" }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`}>
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
)

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

type PieceColor = 'white' | 'black'
type PieceType = 'pawn' | 'king'

interface Piece {
  type: PieceType
  color: PieceColor
}

interface Position {
  row: number
  col: number
}

interface GameMessage {
  type: string
  game_id?: string
  from?: Position
  to?: Position
  session_token?: string
  bet_amount?: number
}

interface WSResponse {
  type: string
  game_id?: string
  board?: (Piece | null)[][]
  current_player?: PieceColor
  turn_count?: number
  result?: any
  message?: string
  success?: boolean
  error?: string
  win_amount?: number
  loss_amount?: number
  refund_amount?: number
  valid_moves?: any[]
  piece?: Piece
  game_state?: {
    winner?: PieceColor | 'draw'
    board?: (Piece | null)[][]
    current_player?: PieceColor
    turn_count?: number
  }
  state?: {
    board?: (Piece | null)[][]
    current_player?: PieceColor
    turn_count?: number
    game_state?: {
      winner?: PieceColor | 'draw'
    }
  }
  session_token?: string
}

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const BOARD_SIZE = 10
const HUMAN_PLAYER: PieceColor = 'white'
const AI_PLAYER: PieceColor = 'black'
const AI_NAME = 'WARI'
const INITIAL_BALANCE = 1000
const GAME_ODDS = 1.95
const MIN_BET = 100
const MAX_BET = 1000

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function NeuroDame() {
  useAuth()
  const [playerBalance, setPlayerBalance] = useState(INITIAL_BALANCE)
  const [currentBet, setCurrentBet] = useState(0)
  const [board, setBoard] = useState<(Piece | null)[][]>([])
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>(HUMAN_PLAYER)
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<any[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [turnCount, setTurnCount] = useState(1)
  const [aiThinking, setAiThinking] = useState(false)
  const [aiStatus, setAiStatus] = useState('Prêt')
  const [showBetScreen, setShowBetScreen] = useState(true)
  const [showGameScreen, setShowGameScreen] = useState(false)
  const [showMenuOverlay, setShowMenuOverlay] = useState(false)
  const [showVictoryPopup, setShowVictoryPopup] = useState(false)
  const [showDefeatPopup, setShowDefeatPopup] = useState(false)
  const [victoryMessage, setVictoryMessage] = useState('')
  const [defeatMessage, setDefeatMessage] = useState('')
  const [victoryGain, setVictoryGain] = useState(0)
  const [defeatLoss, setDefeatLoss] = useState(0)
  const [showVictoryEffect, setShowVictoryEffect] = useState(false)
  const [messages, setMessages] = useState<{ id: number; text: string; type: string }[]>([])
  const [humanCount, setHumanCount] = useState(0)
  const [aiCount, setAiCount] = useState(0)
  const [humanKings, setHumanKings] = useState(0)
  const [aiKings, setAiKings] = useState(0)
  const [potentialGain, setPotentialGain] = useState(0)
  const [gameId, setGameId] = useState<string | null>(null)
  const [lives, setLives] = useState(0)
  const [showLoading, setShowLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Chargement...')
  const [wsConnected, setWsConnected] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  const betInputRef = useRef<HTMLInputElement>(null)
  const boardRef = useRef(board)
  const currentPlayerRef = useRef(currentPlayer)
  const gameOverRef = useRef(gameOver)
  const aiThinkingRef = useRef(aiThinking)
  const selectedPieceRef = useRef(selectedPiece)
  const validMovesRef = useRef(validMoves)
  const messageIdRef = useRef(0)
  const turnCountRef = useRef(turnCount)
  const currentBetRef = useRef(currentBet)
  const gameIdRef = useRef<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef(false)
  const pendingResolveRef = useRef<((value: any) => void) | null>(null)
  const pendingRejectRef = useRef<((reason: any) => void) | null>(null)
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gameInitializedRef = useRef(false)
  const sessionTokenRef = useRef<string | null>(null)

  useEffect(() => { boardRef.current = board }, [board])
  useEffect(() => { currentPlayerRef.current = currentPlayer }, [currentPlayer])
  useEffect(() => { gameOverRef.current = gameOver }, [gameOver])
  useEffect(() => { aiThinkingRef.current = aiThinking }, [aiThinking])
  useEffect(() => { selectedPieceRef.current = selectedPiece }, [selectedPiece])
  useEffect(() => { validMovesRef.current = validMoves }, [validMoves])
  useEffect(() => { turnCountRef.current = turnCount }, [turnCount])
  useEffect(() => { currentBetRef.current = currentBet }, [currentBet])
  useEffect(() => { gameIdRef.current = gameId }, [gameId])
  useEffect(() => { sessionTokenRef.current = sessionToken }, [sessionToken])

  const formatNumber = useCallback((num: number): string => {
    return num.toLocaleString('fr-FR')
  }, [])

  const showMessage = useCallback((text: string, type: string) => {
    const id = messageIdRef.current++
    setMessages(prev => [...prev, { id, text, type }])
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id))
    }, 3000)
  }, [])

  /* ── Loader Management ────────────────────────────────── */
  const showLoader = useCallback((message: string = 'Chargement...') => {
    setLoadingMessage(message)
    setShowLoading(true)
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current)
  }, [])

  const hideLoader = useCallback(() => {
    setShowLoading(false)
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }, [])

  /* ── WebSocket ───────────────────────────────────────── */
  const closeWebSocket = useCallback(() => {
    wsReadyRef.current = false
    setWsConnected(false)
    pendingResolveRef.current = null
    pendingRejectRef.current = null
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const openWebSocket = useCallback((): Promise<void> => new Promise(async (resolve, reject) => {
    if (wsRef.current && wsReadyRef.current) {
      resolve()
      return
    }
    closeWebSocket()
    const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
    const ws = new WebSocket(proto + window.location.host + '/ws/dame')
    wsRef.current = ws
    const t = setTimeout(() => {
      closeWebSocket()
      reject(new Error('Timeout'))
    }, 10000)
    
    ws.onopen = async () => {
      try {
        showLoader('Authentification...')
        await initAll()
        const am = await prepareWSAuthMessage()
        ws.send(JSON.stringify(am))
      } catch (err) {
        clearTimeout(t)
        hideLoader()
        reject(err)
      }
    }
    
    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data)
        
        if (d.type === 'auth_success' && !d.session_token) {
          clearTimeout(t)
          wsReadyRef.current = true
          setWsConnected(true)
          resolve()
          return
        }
        
        if (d.type === 'auth_success' && d.session_token) {
          if (pendingResolveRef.current) {
            const rf = pendingResolveRef.current
            pendingResolveRef.current = null
            pendingRejectRef.current = null
            rf(d)
            return
          }
        }
        
        if (d.type === 'game_created' || 
            d.type === 'valid_moves' || 
            d.type === 'move_made' || 
            d.type === 'ai_thinking' || 
            d.type === 'ai_move_made' || 
            d.type === 'game_result' || 
            d.type === 'game_state' ||
            d.type === 'error' ||
            d.type === 'session_error') {
          handleWSMessage(d)
          return
        }
        
        if (pendingResolveRef.current) {
          const rf = pendingResolveRef.current
          pendingResolveRef.current = null
          pendingRejectRef.current = null
          rf(d)
          return
        }
        
        handleWSMessage(d)
      } catch (er) {
        clearTimeout(t)
        hideLoader()
        reject(er)
      }
    }
    
    ws.onerror = () => {
      clearTimeout(t)
      hideLoader()
      closeWebSocket()
      reject(new Error('Erreur WS'))
    }
    
    ws.onclose = () => {
      hideLoader()
      wsReadyRef.current = false
      setWsConnected(false)
      wsRef.current = null
      if (pendingRejectRef.current) {
        pendingRejectRef.current(new Error('WS fermé'))
        pendingResolveRef.current = null
        pendingRejectRef.current = null
      }
    }
  }), [closeWebSocket, showLoader, hideLoader])

  const sendWebSocketMessage = useCallback(async (msg: GameMessage, awaitResponse: boolean = true): Promise<any> => {
    if (!wsRef.current || !wsReadyRef.current) {
      throw new Error('Non connecté')
    }
    const messageWithToken = {
      ...msg,
      session_token: sessionTokenRef.current
    }
    if (msg.type === 'auth') {
      delete messageWithToken.session_token
    }
    
    if (!awaitResponse) {
      wsRef.current.send(JSON.stringify(messageWithToken))
      return Promise.resolve({ success: true })
    }
    
    return new Promise((resolve, reject) => {
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
      wsRef.current.send(JSON.stringify(messageWithToken))
    })
  }, [])

  /* ── HTTP Requests ───────────────────────────────────── */
  const fetchPlayerBalance = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/get_lettricide_solde')
      if (response.ok) {
        const data = await response.json()
        if (data.solde !== undefined) {
          setPlayerBalance(data.solde)
          return true
        }
      }
    } catch (error) {
      return false
    }
    return false
  }, [])

  const fetchPlayerLives = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/get_Ndame')
      if (response.ok) {
        const data = await response.json()
        if (data.lives !== undefined) {
          setLives(data.lives)
          return true
        }
      }
    } catch (error) {
      return false
    }
    return false
  }, [])

  const placeBet = useCallback(async (amount: number) => {
    try {
      const response = await fetchWithAllTokens('/api/cherif', {
        method: 'POST',
        body: JSON.stringify({ bet: amount })
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPlayerBalance(data.new_solde)
          return { success: true }
        }
      }
      return { success: false }
    } catch (error) {
      return { success: false }
    }
  }, [])

  const decrementPlayerLives = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/decrement_Ndame', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLives(data.remaining_lives)
          return { success: true }
        }
      }
      return { success: false }
    } catch (error) {
      return { success: false }
    }
  }, [])

  /* ── Session Auth ────────────────────────────────────── */
  const authenticateGameSession = useCallback(async (): Promise<string | null> => {
    try {
      const response = await sendWebSocketMessage({
        type: 'auth'
      }, true)
      
      if (response.type === 'auth_success') {
        const token = response.session_token
        if (token) {
          setSessionToken(token)
          sessionTokenRef.current = token
          return token
        } else {
          return null
        }
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }, [sendWebSocketMessage])

  /* ── WS Message Handler ──────────────────────────────── */
  const handleWSMessage = useCallback((data: WSResponse) => {
    switch (data.type) {
      case 'game_created':
        hideLoader()
        
        if (data.game_id) {
          setGameId(data.game_id)
          gameIdRef.current = data.game_id
        }
        if (data.board) {
          setBoard(data.board)
          boardRef.current = data.board
          updateCounts(data.board)
        }
        if (data.current_player) {
          setCurrentPlayer(data.current_player)
          currentPlayerRef.current = data.current_player
        }
        if (data.turn_count !== undefined) {
          setTurnCount(data.turn_count)
          turnCountRef.current = data.turn_count
        }
        setGameOver(false)
        gameOverRef.current = false
        setSelectedPiece(null)
        setValidMoves([])
        gameInitializedRef.current = true
        showMessage("Nouvelle partie créée", "success")
        break

      case 'valid_moves':
        if (data.valid_moves) {
          setValidMoves(data.valid_moves)
        }
        break

      case 'move_made':
        if (data.result && data.result.success) {
          if (data.result.new_board) {
            setBoard(data.result.new_board)
            boardRef.current = data.result.new_board
            updateCounts(data.result.new_board)
          }
          if (data.result.current_player) {
            setCurrentPlayer(data.result.current_player)
            currentPlayerRef.current = data.result.current_player
          }
          if (data.result.turn_count !== undefined) {
            setTurnCount(data.result.turn_count)
            turnCountRef.current = data.result.turn_count
          }
          setSelectedPiece(null)
          setValidMoves([])
          
          if (data.result.game_state && data.result.game_state.winner) {
            handleGameResult(data.result.game_state)
          }
          
          if (data.result.current_player === AI_PLAYER && !gameOverRef.current) {
            sendWebSocketMessage({
              type: 'ai_move',
              game_id: gameIdRef.current!
            }, false)
          }
        }
        break

      case 'ai_thinking':
        setAiThinking(true)
        aiThinkingRef.current = true
        setAiStatus("Réflexion...")
        showMessage("WARI réfléchit...", "ai")
        break

      case 'ai_move_made':
        if (data.result && data.result.success) {
          if (data.result.new_board) {
            setBoard(data.result.new_board)
            boardRef.current = data.result.new_board
            updateCounts(data.result.new_board)
          }
          if (data.result.current_player) {
            setCurrentPlayer(data.result.current_player)
            currentPlayerRef.current = data.result.current_player
          }
          if (data.result.turn_count !== undefined) {
            setTurnCount(data.result.turn_count)
            turnCountRef.current = data.result.turn_count
          }
          setAiThinking(false)
          aiThinkingRef.current = false
          setAiStatus("Prêt")
          setSelectedPiece(null)
          setValidMoves([])
          
          if (data.result.game_state && data.result.game_state.winner) {
            handleGameResult(data.result.game_state)
          }
        }
        break

      case 'game_result':
        handleGameResultMessage(data)
        break

      case 'game_state':
        if (data.state) {
          if (data.state.board) {
            setBoard(data.state.board)
            boardRef.current = data.state.board
            updateCounts(data.state.board)
          }
          if (data.state.current_player) {
            setCurrentPlayer(data.state.current_player)
            currentPlayerRef.current = data.state.current_player
          }
          if (data.state.turn_count !== undefined) {
            setTurnCount(data.state.turn_count)
            turnCountRef.current = data.state.turn_count
          }
          if (data.state.game_state && data.state.game_state.winner) {
            handleGameResult(data.state.game_state)
          }
        }
        break

      case 'auth_failed':
        showMessage(data.message || "Authentification échouée", "info")
        setWsConnected(false)
        wsReadyRef.current = false
        break

      case 'session_error':
        showMessage(data.message || "Erreur de session", "info")
        break

      case 'error':
        showMessage(data.message || "Erreur serveur", "info")
        setAiThinking(false)
        aiThinkingRef.current = false
        setAiStatus("Erreur")
        break
    }
  }, [showMessage])

  const handleGameResultMessage = useCallback((data: WSResponse) => {
    setGameOver(true)
    gameOverRef.current = true
    setAiThinking(false)
    aiThinkingRef.current = false
    setAiStatus("Terminé")

    switch (data.result) {
      case 'victory':
        const winAmount = data.win_amount || Math.floor(currentBetRef.current * GAME_ODDS)
        setVictoryMessage('Incroyable ! Vous avez battu WARI !')
        setVictoryGain(winAmount)
        setShowVictoryPopup(true)
        setShowVictoryEffect(true)
        setPlayerBalance(prev => prev + winAmount)
        showMessage(`Gain de ${formatNumber(winAmount)} XOF !`, "money")
        setTimeout(() => setShowVictoryEffect(false), 2000)
        break

      case 'defeat':
        const lossAmount = data.loss_amount || currentBetRef.current
        setDefeatMessage(`${AI_NAME} a gagné !`)
        setDefeatLoss(lossAmount)
        setShowDefeatPopup(true)
        showMessage(`Perte de ${formatNumber(lossAmount)} XOF`, "info")
        break

      case 'draw':
        const refundAmount = data.refund_amount || currentBetRef.current
        setPlayerBalance(prev => prev + refundAmount)
        showMessage(`Match nul ! Remboursement de ${formatNumber(refundAmount)} XOF`, "money")
        setTimeout(() => {
          returnToBetScreen()
        }, 2000)
        break
    }
  }, [showMessage, formatNumber])

  const handleGameResult = useCallback((gameState: { winner?: PieceColor | 'draw' }) => {
    if (gameState.winner === HUMAN_PLAYER) {
      const winAmount = Math.floor(currentBetRef.current * GAME_ODDS)
      setVictoryMessage('Victoire ! Vous avez battu WARI !')
      setVictoryGain(winAmount)
      setShowVictoryPopup(true)
      setShowVictoryEffect(true)
      setPlayerBalance(prev => prev + winAmount)
      showMessage(`Vous avez gagné ${formatNumber(winAmount)} XOF !`, "money")
      setTimeout(() => setShowVictoryEffect(false), 2000)
    } else if (gameState.winner === AI_PLAYER) {
      setDefeatMessage('WARI a triomphé. Essayez encore !')
      setDefeatLoss(currentBetRef.current)
      setShowDefeatPopup(true)
      showMessage(`Vous avez perdu ${formatNumber(currentBetRef.current)} XOF`, "info")
    }
  }, [showMessage, formatNumber])

  const updateCounts = useCallback((b: (Piece | null)[][]) => {
    if (!b || b.length === 0) {
      setHumanCount(0)
      setAiCount(0)
      setHumanKings(0)
      setAiKings(0)
      return
    }

    let hCount = 0, aCount = 0, hKings = 0, aKings = 0
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (!b[row]) continue
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = b[row][col]
        if (piece) {
          if (piece.color === HUMAN_PLAYER) {
            hCount++
            if (piece.type === 'king') hKings++
          } else {
            aCount++
            if (piece.type === 'king') aKings++
          }
        }
      }
    }
    setHumanCount(hCount)
    setAiCount(aCount)
    setHumanKings(hKings)
    setAiKings(aKings)
  }, [])

  /* ── Cell Click ──────────────────────────────────────── */
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameOverRef.current || aiThinkingRef.current || currentPlayerRef.current !== HUMAN_PLAYER) {
      return
    }

    const b = boardRef.current
    if (!b || !b[row]) return

    const clickedPiece = b[row][col]
    const selPiece = selectedPieceRef.current

    if (clickedPiece && clickedPiece.color === HUMAN_PLAYER) {
      setSelectedPiece({ row, col })
      sendWebSocketMessage({
        type: 'get_valid_moves',
        game_id: gameIdRef.current!,
        from: { row, col }
      }, false)
    } else if (!clickedPiece && selPiece) {
      setSelectedPiece(null)
      setValidMoves([])
      sendWebSocketMessage({
        type: 'make_move',
        game_id: gameIdRef.current!,
        from: selPiece,
        to: { row, col }
      }, false)
    } else if (clickedPiece && clickedPiece.color !== HUMAN_PLAYER) {
      if (selPiece) {
        setSelectedPiece(null)
        setValidMoves([])
      }
    }
  }, [sendWebSocketMessage])

  /* ── Bet Handling ────────────────────────────────────── */
  const handleStartGame = useCallback(async () => {
    const input = betInputRef.current
    if (!input) return

    const amount = parseInt(input.value)

    if (!amount || amount < MIN_BET || amount > MAX_BET) {
      showMessage(`Mise invalide (${MIN_BET}-${MAX_BET} XOF)`, 'info')
      return
    }

    if (amount > playerBalance) {
      showMessage('Solde insuffisant', 'info')
      return
    }

    if (lives <= 0) {
      showMessage('Plus de vies disponibles', 'info')
      return
    }

    if (!wsConnected) {
      try {
        await openWebSocket()
      } catch (error) {
        showMessage('Erreur de connexion au serveur', 'info')
        return
      }
    }

    showLoader('Authentification session...')
    const token = await authenticateGameSession()
    
    if (!token) {
      hideLoader()
      showMessage('Erreur d\'authentification session', 'info')
      return
    }

    showLoader('Vérification des vies...')
    const decrementResult = await decrementPlayerLives()
    if (!decrementResult.success) {
      hideLoader()
      showMessage('Erreur lors de la décrémentation des vies', 'info')
      return
    }

    showLoader('Traitement de la mise...')
    const betResult = await placeBet(amount)
    if (!betResult.success) {
      hideLoader()
      showMessage('Erreur lors de la mise', 'info')
      return
    }

    setCurrentBet(amount)
    currentBetRef.current = amount
    setShowBetScreen(false)
    setShowGameScreen(true)

    showLoader('Création de la partie...')
    try {
      await sendWebSocketMessage({
        type: 'new_game',
        bet_amount: amount
      }, true)
      showMessage(`Mise de ${formatNumber(amount)} XOF - Défi accepté !`, 'info')
    } catch (error) {
      hideLoader()
      showMessage('Erreur lors de la création de la partie', 'info')
    }
  }, [playerBalance, lives, wsConnected, openWebSocket, authenticateGameSession, decrementPlayerLives, placeBet, sendWebSocketMessage, showMessage, formatNumber, showLoader, hideLoader])

  const returnToBetScreen = useCallback(() => {
    setShowVictoryPopup(false)
    setShowDefeatPopup(false)
    setShowGameScreen(false)
    setShowBetScreen(true)
    setShowMenuOverlay(false)
    gameInitializedRef.current = false
    setSessionToken(null)
    sessionTokenRef.current = null
    fetchPlayerBalance()
    fetchPlayerLives()
    closeWebSocket()
  }, [fetchPlayerBalance, fetchPlayerLives, closeWebSocket])

  const handleBetInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0
    setPotentialGain(Math.floor(val * GAME_ODDS))
  }, [])

  /* ── Effects ─────────────────────────────────────────── */
  useEffect(() => {
    if (showBetScreen) {
      fetchPlayerBalance()
      fetchPlayerLives()
    }
  }, [showBetScreen, fetchPlayerBalance, fetchPlayerLives])

  useEffect(() => {
    if (showGameScreen && !gameInitializedRef.current) {
    }
  }, [showGameScreen])

  /* ── Render Helpers ──────────────────────────────────── */
  const isCellDark = (row: number, col: number) => (row + col) % 2 === 1
  const isCellSelected = (row: number, col: number) =>
    selectedPiece?.row === row && selectedPiece?.col === col
  const isCellValidMove = (row: number, col: number) =>
    validMoves.some((m: any) => m.row === row && m.col === col && m.captures?.length === 0)
  const isCellCaptureMove = (row: number, col: number) =>
    validMoves.some((m: any) => m.row === row && m.col === col && m.captures?.length > 0)

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] text-white font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif] select-none touch-none">

      {/* Background Effects */}
      <div className="fixed inset-0 z-[-2] overflow-hidden">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className={`absolute w-[30px] h-[30px] rounded-full opacity-10 animate-[float_20s_infinite_linear] ${i % 2 === 0 ? 'bg-[radial-gradient(circle,#ffffff_0%,#d4d4d4_70%)] shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-[radial-gradient(circle,#333333_0%,#222222_70%)] shadow-[0_0_20px_rgba(138,43,226,0.3)]'}`}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 20}s`
            }}
          />
        ))}
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-yellow-400 rounded-full opacity-30 animate-[particleMove_10s_infinite_linear]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="fixed w-[200px] h-[200px] rounded-full blur-[40px] z-[-1] bg-[radial-gradient(circle,rgba(138,43,226,0.2)_0%,transparent_70%)] animate-[lightMove_15s_infinite_alternate_ease-in-out]" />

      {/* LOADER OVERLAY */}
      {showLoading && (
        <div className="fixed inset-0 bg-[#0a0e17]/90 backdrop-blur-xl flex flex-col items-center justify-center z-[5000]">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-yellow-400 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(138,43,226,0.5)] mb-6 animate-pulse">
            <LoaderIcon className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
          </div>
          <p className="text-lg font-semibold text-white/90 animate-pulse">{loadingMessage}</p>
          <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-yellow-400 animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* BET SCREEN */}
      {showBetScreen && (
        <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col justify-center items-center z-[2000] p-5 overflow-y-auto">
          <div className="bg-[#14141e]/95 p-7 sm:p-8 rounded-2xl border-2 border-purple-600 text-center max-w-[400px] w-full shadow-[0_10px_40px_rgba(138,43,226,0.3)] relative overflow-hidden backdrop-blur-xl before:absolute before:-top-1/2 before:-left-1/2 before:w-[200%] before:h-[200%] before:bg-gradient-to-br before:from-transparent before:via-purple-600/10 before:to-transparent before:animate-[shine_3s_infinite_linear] before:rotate-45 before:-z-[1]">

            <h1 className="text-3xl sm:text-4xl text-yellow-400 mb-2.5 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] font-bold">
              Neuro Dame
            </h1>
            <p className="text-gray-400 mb-7 text-sm">
              Défiez WARI pour des gains incroyables
            </p>

            <div className="bg-blue-500/10 border border-blue-500 rounded-xl p-4 mb-5 flex justify-between items-center">
              <div className="text-gray-400 text-sm">SOLDE DISPONIBLE</div>
              <div className="text-blue-400 text-2xl font-bold drop-shadow-[0_0_10px_rgba(33,150,243,0.5)]">
                {formatNumber(playerBalance)} XOF
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500 rounded-xl p-4 mb-5 flex justify-between items-center">
              <div className="text-gray-400 text-sm">VIES RESTANTES</div>
              <div className="text-purple-400 text-2xl font-bold drop-shadow-[0_0_10px_rgba(138,43,226,0.5)]">
                {lives}
              </div>
            </div>

            <div className="my-6">
              <input
                type="number"
                ref={betInputRef}
                className="w-full py-4 text-2xl text-center bg-black/70 border-2 border-purple-600 rounded-xl text-white outline-none transition-all duration-300 focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                placeholder="Montant de la mise (XOF)"
                min="100"
                max="1000"
                defaultValue="100"
                onChange={handleBetInputChange}
              />
              <div className="mt-2.5 text-xs text-gray-500">
                <p>Mise minimale: 100 XOF, maximale: 1000 XOF</p>
              </div>
              {potentialGain > 0 && (
                <div className="mt-2.5 text-sm text-yellow-400">
                  <p>Gain potentiel: {formatNumber(potentialGain)} XOF</p>
                </div>
              )}
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-900 border-none rounded-xl text-white font-bold text-base cursor-pointer mt-2.5 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(138,43,226,0.4)] before:absolute before:-top-1/2 before:-left-1/2 before:w-[200%] before:h-[200%] before:bg-gradient-to-br before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full before:-translate-y-full before:rotate-45 hover:before:animate-[btnShine_0.6s_forwards]"
            >
              <span className="flex items-center justify-center gap-2">
                <PlayIcon />
                COMMENCER LA PARTIE
              </span>
            </button>

            <div className="mt-5 text-xs text-gray-500">
              <p>Vous jouerez les Blancs contre WARI (Noirs)</p>
            </div>
          </div>
        </div>
      )}

      {/* GAME SCREEN */}
      {showGameScreen && (
        <div className="w-full h-screen flex flex-col overflow-hidden">

          {/* Header */}
          <header className="bg-[#14141e]/95 px-4 py-3 flex justify-between items-center border-b-2 border-purple-600 relative z-[100] backdrop-blur-xl min-h-[60px] flex-shrink-0 flex-wrap gap-2">
            <div className="text-lg sm:text-xl text-yellow-400 font-bold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
              Neuro Dame
            </div>

            <div className="bg-blue-500/10 border border-blue-500 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-sm">
              <CoinsIcon />
              <span className="text-gray-400">Solde:</span>
              <span className="font-bold text-blue-400">{formatNumber(playerBalance)} XOF</span>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold animate-pulse min-w-max ${currentPlayer === HUMAN_PLAYER
              ? 'bg-yellow-400/15 text-yellow-400 border border-yellow-400'
              : 'bg-purple-600/15 text-purple-500 border border-purple-600'
              }`}>
              {currentPlayer === HUMAN_PLAYER ? <UserIcon /> : <RobotIcon />}
              {currentPlayer === HUMAN_PLAYER ? ' À VOTRE TOUR' : ' WARI RÉFLÉCHIT'}
            </div>
          </header>

          {/* Board */}
          <main className="flex-1 flex justify-center items-center p-2.5 min-h-0 overflow-hidden">
            <div className="bg-gradient-to-br from-[#5D2906] to-[#8B4513] p-2.5 sm:p-3 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_50px_rgba(138,43,226,0.2)] relative max-w-[calc(100vh-200px)] max-h-[calc(100vh-200px)] before:absolute before:-top-0.5 before:-left-0.5 before:-right-0.5 before:-bottom-0.5 before:bg-gradient-to-r before:from-yellow-400 before:via-purple-600 before:to-yellow-400 before:rounded-[17px] before:-z-[1] before:animate-[borderGlow_4s_infinite_linear] before:blur-[2px]">
              <div className="grid grid-cols-10 grid-rows-10 w-[85vmin] h-[85vmin] max-w-[500px] max-h-[500px] min-w-[230px] min-h-[230px] border-[6px] border-[#5D2906] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.6)] rounded overflow-hidden bg-gradient-to-br from-[#8B4513]/90 to-[#5D2906]/90 touch-none">
                {Array.from({ length: BOARD_SIZE }, (_, row) =>
                  Array.from({ length: BOARD_SIZE }, (_, col) => {
                    const piece = board[row]?.[col]
                    return (
                      <div
                        key={`${row}-${col}`}
                        onClick={() => handleCellClick(row, col)}
                        className={`
                          relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105 hover:z-10 touch-manipulation
                          ${isCellDark(row, col)
                            ? 'bg-gradient-to-br from-[#8B4513] to-[#5D2906] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]'
                            : 'bg-gradient-to-br from-[#F8F4F0] to-[#E8E0D8] shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]'
                          }
                          ${isCellSelected(row, col)
                            ? '!shadow-[inset_0_0_0_3px_rgba(255,215,0,1),0_0_30px_rgba(255,215,0,0.8),0_0_60px_rgba(255,215,0,0.4)] z-[2] animate-[cellPulse_1s_infinite]'
                            : ''
                          }
                        `}
                      >
                        {isCellValidMove(row, col) && (
                          <span className="absolute w-[20%] h-[20%] bg-[radial-gradient(circle,#4CAF50_0%,#2E7D32_100%)] rounded-full shadow-[0_0_15px_#4CAF50,0_0_30px_#4CAF50] z-[1] animate-[pulseGlow_1.5s_infinite]" />
                        )}
                        {isCellCaptureMove(row, col) && (
                          <span className="absolute w-[25%] h-[25%] bg-[radial-gradient(circle,#f44336_0%,#c62828_100%)] rounded-full shadow-[0_0_15px_#f44336,0_0_30px_#f44336] z-[1] animate-[pulseDanger_1s_infinite]" />
                        )}
                        {piece && (
                          <div
                            className={`
                              w-[85%] h-[85%] rounded-full relative flex items-center justify-center z-[2] shadow-[0_8px_16px_rgba(0,0,0,0.5),inset_0_-4px_8px_rgba(0,0,0,0.3)] border transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:shadow-[0_12px_24px_rgba(0,0,0,0.6),inset_0_-4px_8px_rgba(0,0,0,0.3)] touch-manipulation
                              ${piece.color === 'white'
                                ? 'bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,#d4d4d4_70%,#a0a0a0_100%)] border-[#e0e0e0]'
                                : 'bg-[radial-gradient(circle_at_30%_30%,#333333_0%,#222222_70%,#000000_100%)] border-[#111]'
                              }
                              ${piece.color === AI_PLAYER ? '!border-purple-600 shadow-[0_0_20px_rgba(138,43,226,0.5),inset_0_0_10px_rgba(138,43,226,0.3)]' : ''}
                            `}
                          >
                            {piece.type === 'king' && (
                              <CrownIcon />
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-[#14141e]/95 px-4 py-2.5 border-t-2 border-purple-600 relative z-[100] backdrop-blur-xl min-h-[70px] sm:min-h-[80px] flex-shrink-0 overflow-x-auto overflow-y-hidden scrollbar-none">
            <div className="flex gap-2 sm:gap-3 py-1.5 min-w-min sm:justify-center">
              {[
                { value: humanCount, label: 'Vos Pions', color: 'text-yellow-400' },
                { value: humanKings, label: 'Vos Dames', color: 'text-yellow-400' },
                { value: aiCount, label: 'Pions WARI', color: 'text-purple-400' },
                { value: aiKings, label: 'Dames WARI', color: 'text-purple-400' },
                { value: turnCount, label: 'Tour', color: 'text-white' },
                { value: aiStatus, label: 'Status', color: 'text-purple-400' },
                { value: formatNumber(currentBet), label: 'Mise', color: 'text-blue-400' },
                { value: formatNumber(Math.floor(currentBet * GAME_ODDS)), label: 'Gain Potentiel', color: 'text-emerald-400' }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center py-2 px-2.5 sm:px-3 rounded-lg bg-black/30 transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5 min-w-[65px] sm:min-w-[70px] flex-shrink-0"
                >
                  <div className={`text-base sm:text-lg font-bold mb-1 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-400 uppercase leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </footer>

          {/* Menu Button */}
          <button
            onClick={() => setShowMenuOverlay(true)}
            className="fixed bottom-20 sm:bottom-24 left-4 sm:left-5 w-11 h-11 sm:w-12 sm:h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-lg cursor-pointer z-[101] shadow-[0_6px_20px_rgba(138,43,226,0.4),0_0_20px_rgba(138,43,226,0.3)] transition-all duration-300 animate-[menuFloat_3s_infinite_ease-in-out] hover:scale-110 hover:rotate-90 hover:shadow-[0_8px_30px_rgba(138,43,226,0.6),0_0_30px_rgba(138,43,226,0.5)]"
          >
            <MenuIcon />
          </button>
        </div>
      )}

      {/* MENU OVERLAY */}
      {showMenuOverlay && (
        <div
          className="fixed inset-0 bg-black/95 flex justify-center items-center z-[3000] overflow-y-auto p-5"
          onClick={(e) => { if (e.target === e.currentTarget) setShowMenuOverlay(false) }}
        >
          <div className="bg-[#14141e]/98 p-5 sm:p-6 rounded-2xl max-w-[500px] w-full max-h-[85vh] overflow-y-auto border-2 border-purple-600 backdrop-blur-xl">

            <h2 className="text-yellow-400 text-2xl sm:text-3xl font-bold mb-5 text-center drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
              MENU
            </h2>

            <div className="bg-black/30 p-4 rounded-xl mb-5 border-l-[3px] border-purple-600">
              <h3 className="text-purple-500 text-lg font-bold mb-2.5 flex items-center gap-2">
                <BookIcon />
                RÈGLES DU JEU
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                {[
                  'Vous jouez les pièces blanches contre WARI (pièces noires)',
                  'Les pièces se déplacent en diagonale sur les cases sombres',
                  'Les pions avancent d\'une case vers l\'avant',
                  'Les dames peuvent se déplacer de plusieurs cases en diagonale',
                  'Capture obligatoire si possible',
                  'Prise multiple possible dans le même tour',
                  'Un pion qui atteint la dernière rangée devient une dame',
                  'Le but est de capturer ou bloquer toutes les pièces adverses'
                ].map((rule, i) => (
                  <li key={i} className="pl-4 relative before:content-['•'] before:text-yellow-400 before:absolute before:left-0 before:text-lg leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-black/30 p-4 rounded-xl mb-5 border-l-[3px] border-purple-600">
              <h3 className="text-purple-500 text-lg font-bold mb-2.5 flex items-center gap-2">
                <CoinsIcon />
                SYSTÈME DE MISES
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                {[
                  'Solde initial: 1000 XOF',
                  'Mise minimale: 100 XOF, maximale: 1000 XOF',
                  'Défaite: perte de la mise',
                  'Égalité: récupération de la mise'
                ].map((rule, i) => (
                  <li key={i} className="pl-4 relative before:content-['•'] before:text-yellow-400 before:absolute before:left-0 before:text-lg leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2.5 mt-5">
              <button
                onClick={() => setShowMenuOverlay(false)}
                className="py-3 px-5 bg-gradient-to-r from-purple-600 to-purple-900 border-none rounded-xl text-white font-bold text-sm cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(138,43,226,0.4)] text-center flex items-center justify-center gap-2"
              >
                <PlayIcon />
                CONTINUER LA PARTIE
              </button>
              <button
                onClick={returnToBetScreen}
                className="py-3 px-5 bg-gradient-to-r from-red-500 to-red-700 border-none rounded-xl text-white font-bold text-sm cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(244,67,54,0.4)] text-center flex items-center justify-center gap-2"
              >
                <LogoutIcon />
                QUITTER VERS LE MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY POPUP */}
      {showVictoryPopup && (
        <div className="fixed inset-0 bg-black/95 flex justify-center items-center z-[3000] p-5 transition-all duration-500">
          <div className="bg-[#14141e]/98 p-6 sm:p-8 rounded-2xl text-center max-w-[500px] w-full border-2 border-emerald-400 shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">

            <div className="text-5xl sm:text-6xl mb-5 animate-[iconFloat_3s_infinite_ease-in-out]">
              <TrophyIcon className="text-emerald-400" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-emerald-400 drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]">
              VICTOIRE !
            </h2>

            <p className="text-gray-300 mb-6 text-sm sm:text-base leading-relaxed">
              {victoryMessage}
            </p>

            <div className="bg-blue-500/10 border border-blue-500 rounded-xl py-3 px-4 my-5 flex justify-between items-center text-base">
              <span className="text-gray-400">Gain:</span>
              <span className="text-blue-400 font-bold text-lg">+{formatNumber(victoryGain)} XOF</span>
            </div>

            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={returnToBetScreen}
                className="py-3 px-6 bg-gradient-to-r from-yellow-400 to-yellow-600 border-none rounded-full text-black font-bold text-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] min-w-[140px] flex items-center justify-center gap-2"
              >
                <RefreshIcon />
                NOUVELLE MISE
              </button>
              <button
                onClick={returnToBetScreen}
                className="py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-900 border-none rounded-full text-white font-bold text-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] min-w-[140px] flex items-center justify-center gap-2"
              >
                <HomeIcon />
                MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEFEAT POPUP */}
      {showDefeatPopup && (
        <div className="fixed inset-0 bg-black/95 flex justify-center items-center z-[3000] p-5 transition-all duration-500">
          <div className="bg-[#14141e]/98 p-6 sm:p-8 rounded-2xl text-center max-w-[500px] w-full border-2 border-red-500 shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">

            <div className="text-5xl sm:text-6xl mb-5 animate-[iconFloat_3s_infinite_ease-in-out] text-red-400">
              <RobotIcon />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-red-400 drop-shadow-[0_0_20px_rgba(255,51,102,0.5)]">
              DÉFAITE
            </h2>

            <p className="text-gray-300 mb-6 text-sm sm:text-base leading-relaxed">
              {defeatMessage}
            </p>

            <div className="bg-blue-500/10 border border-blue-500 rounded-xl py-3 px-4 my-5 flex justify-between items-center text-base">
              <span className="text-gray-400">Perte:</span>
              <span className="text-red-400 font-bold text-lg">-{formatNumber(defeatLoss)} XOF</span>
            </div>

            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={returnToBetScreen}
                className="py-3 px-6 bg-gradient-to-r from-yellow-400 to-yellow-600 border-none rounded-full text-black font-bold text-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] min-w-[140px] flex items-center justify-center gap-2"
              >
                <RefreshIcon />
                NOUVELLE MISE
              </button>
              <button
                onClick={returnToBetScreen}
                className="py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-900 border-none rounded-full text-white font-bold text-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] min-w-[140px] flex items-center justify-center gap-2"
              >
                <HomeIcon />
                MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VICTORY EFFECT */}
      {showVictoryEffect && (
        <div className="fixed inset-0 pointer-events-none z-[2500]">
          {Array.from({ length: 100 }, (_, i) => {
            const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
            return (
              <div
                key={i}
                className="absolute w-2.5 h-5 opacity-0 animate-[confettiFall_3s_ease-out_forwards]"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            )
          })}
        </div>
      )}

      {/* MESSAGES */}
      <div className="fixed top-[70px] left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2.5 pointer-events-none w-[90%] max-w-[500px]">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`
              w-full py-2.5 px-5 rounded-3xl font-bold flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl border border-white/10 text-sm
              animate-[messageSlide_0.4s_ease,fadeOut_0.3s_ease_2s_forwards]
              ${msg.type === 'success' ? 'bg-gradient-to-r from-green-500/90 to-green-700/90 text-white border-green-500/30' : ''}
              ${msg.type === 'ai' ? 'bg-gradient-to-r from-purple-500/90 to-purple-800/90 text-white border-purple-500/30' : ''}
              ${msg.type === 'info' ? 'bg-gradient-to-r from-blue-500/90 to-blue-800/90 text-white border-blue-500/30' : ''}
              ${msg.type === 'money' ? 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-white border-yellow-500/30' : ''}
            `}
          >
            {msg.type === 'success' && <TrophyIcon className="!w-4 !h-4" />}
            {msg.type === 'ai' && <RobotIcon />}
            {msg.type === 'money' && <CoinsIcon className="!text-white" />}
            {msg.type === 'info' && <InfoIcon />}
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  )
}