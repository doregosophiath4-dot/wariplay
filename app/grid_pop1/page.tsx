'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const GlobeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const WalletIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
)

const StopIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const CloseCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const InfoCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const CloseModalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/* ═══════════════════════════════════════════
   LOADER ICON - 8 lignes spinner uniforme au style Grid Pop
   ═══════════════════════════════════════════ */

const LoaderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-cyan-400">
    {/* 4 lignes cardinales (N, S, E, O) */}
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    {/* 4 lignes diagonales (NO, SE, SO, NE) */}
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
)

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

  constructor(width: number, height: number) {
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.size = Math.random() * 2 + 1
    this.speedX = Math.random() * 0.5 - 0.25
    this.speedY = Math.random() * 0.5 - 0.25
    this.color = `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.4 + 0.2})`
  }

  update(width: number, height: number) {
    this.x += this.speedX
    this.y += this.speedY
    if (this.x > width) this.x = 0
    if (this.x < 0) this.x = width
    if (this.y > height) this.y = 0
    if (this.y < 0) this.y = height
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

interface CellPosition {
  row: number
  col: number
}

interface GameMessage {
  action: string
  row?: number
  col?: number
  bet?: number
  hmac_token?: string
  game_id?: string
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function GridPop() {
  const [balance, setBalance] = useState(10000)
  const [currentBet, setCurrentBet] = useState(100)
  const [gameActive, setGameActive] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(180)
  const [grid, setGrid] = useState<string[][]>([])
  const [wordPositions, setWordPositions] = useState<Map<string, CellPosition[]>>(new Map())
  const [foundWords, setFoundWords] = useState<Map<string, CellPosition[]>>(new Map())
  const [selected, setSelected] = useState<CellPosition[]>([])
  const [showRules, setShowRules] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'info' | 'win' | 'lose'>('info')
  const [toastVisible, setToastVisible] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Chargement...')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animFrameRef = useRef<number>(0)
  const betInputRef = useRef<HTMLInputElement>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)
  const gameActiveRef = useRef(false)
  const gridRef = useRef<string[][]>([])
  const foundWordsRef = useRef<Map<string, CellPosition[]>>(new Map())
  const selectedRef = useRef<CellPosition[]>([])
  const wordPositionsRef = useRef<Map<string, CellPosition[]>>(new Map())

  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef(false)
  const pendingResolveRef = useRef<((value: any) => void) | null>(null)
  const pendingRejectRef = useRef<((reason?: any) => void) | null>(null)
  const wsTokenRef = useRef<string | null>(null)
  const wsTimestampRef = useRef<number | null>(null)
  const gameIdRef = useRef<string | null>(null)
  const hmacTokenRef = useRef<string | null>(null)

  // ✅ CORRECTION : file d'attente des requêtes WebSocket. Comme un seul
  // pendingResolveRef/pendingRejectRef existe à la fois, deux appels
  // concurrents à sendWebSocketMessage pouvaient s'écraser mutuellement
  // (le 2ème écrasait le resolver du 1er avant que sa réponse n'arrive),
  // ce qui provoquait des timeouts en cascade dès qu'un double-clic /
  // double-tap se produisait. On sérialise maintenant les envois : chaque
  // appel attend que le précédent soit résolu (ou rejeté) avant d'envoyer
  // le message suivant.
  const requestQueueRef = useRef<Promise<any>>(Promise.resolve())

  // ✅ CORRECTION : verrou anti double-sélection. Empêche un deuxième clic
  // sur la même cellule (ou un clic pendant qu'une sélection est déjà en
  // cours de traitement) de déclencher un second appel réseau.
  const cellClickLockRef = useRef(false)

  useEffect(() => { gameActiveRef.current = gameActive }, [gameActive])
  useEffect(() => { gridRef.current = grid }, [grid])
  useEffect(() => { foundWordsRef.current = foundWords }, [foundWords])
  useEffect(() => { selectedRef.current = selected }, [selected])
  useEffect(() => { wordPositionsRef.current = wordPositions }, [wordPositions])

  const formatNumber = useCallback((num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }, [])

  const showToast = useCallback((msg: string, type: 'info' | 'win' | 'lose' = 'info') => {
    setToastMessage(msg)
    setToastType(type)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }, [])

  /* ── Animation canvas ──────────────────────────────── */
  const animateParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particlesRef.current.forEach(particle => {
      particle.update(canvas.width, canvas.height)
      particle.draw(ctx)
    })
    animFrameRef.current = requestAnimationFrame(animateParticles)
  }, [])

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    particlesRef.current = []
    for (let i = 0; i < 60; i++) {
      particlesRef.current.push(new Particle(canvas.width, canvas.height))
    }
  }, [])

  /* ── Timer ──────────────────────────────────────────── */
  const clearTimer = useCallback(() => {
    if (timerRef.current) { 
      clearInterval(timerRef.current); 
      timerRef.current = null 
    }
  }, [])

  // ✅ Le backend gère désormais lui-même la limite de temps de la partie
  // (3 minutes, appliquées côté serveur indépendamment du client) et envoie
  // un message "game_ended" (reason: "time_up") quand le délai est écoulé.
  // Le timer ici est donc PUREMENT VISUEL.
  const startTimer = useCallback((durationSeconds: number = 180) => {
    clearTimer()
    setTimeLeft(durationSeconds)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1
        if (newTime <= 0) {
          clearTimer()
          return 0
        }
        return newTime
      })
    }, 1000)
  }, [clearTimer])

  // ✅ Filet de sécurité : si le serveur ne confirme pas la fin de partie
  // dans les quelques secondes qui suivent l'affichage de 00:00, on force
  // quand même la fin locale.
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (timeLeft === 0 && gameActiveRef.current) {
      safetyTimeoutRef.current = setTimeout(() => {
        if (gameActiveRef.current) {
          showToast("Temps écoulé !", "lose")
          endGame()
        }
      }, 8000)
    }
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current)
        safetyTimeoutRef.current = null
      }
    }
  }, [timeLeft])

  /* ── WebSocket ───────────────────────────────────────── */
  const closeWebSocket = useCallback(() => {
    wsReadyRef.current = false
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
    setShowLoading(true)
    setLoadingMessage('Connexion au serveur...')
    await initAll()
    const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
    const ws = new WebSocket(proto + window.location.host + '/ws/Gpop')
    wsRef.current = ws
    const timeout = setTimeout(() => {
      closeWebSocket()
      setShowLoading(false)
      reject(new Error('Timeout'))
    }, 10000)
    ws.onopen = async () => {
      const authMessage = await prepareWSAuthMessage()
      ws.send(JSON.stringify(authMessage))
    }
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'auth_success') {
          clearTimeout(timeout)
          wsReadyRef.current = true
          setShowLoading(false)
          resolve()
          return
        }
        if (data.hmac_token) {
          hmacTokenRef.current = data.hmac_token
        }
        if (data.game_id) {
          gameIdRef.current = data.game_id
        }
        handleWebSocketMessage(data)
        if (pendingResolveRef.current) {
          const resolveFn = pendingResolveRef.current
          pendingResolveRef.current = null
          pendingRejectRef.current = null
          resolveFn(data)
        }
      } catch (error) {
        clearTimeout(timeout)
        setShowLoading(false)
        reject(error)
      }
    }
    ws.onerror = () => {
      clearTimeout(timeout)
      closeWebSocket()
      setShowLoading(false)
      reject(new Error('Erreur WS'))
    }
    ws.onclose = () => {
      wsReadyRef.current = false
      wsRef.current = null
      setShowLoading(false)
      if (pendingRejectRef.current) {
        pendingRejectRef.current(new Error('WS fermé'))
        pendingResolveRef.current = null
        pendingRejectRef.current = null
      }
    }
  }), [closeWebSocket])

  // ✅ CORRECTION : sendWebSocketMessage est maintenant sérialisé via
  // requestQueueRef. Chaque appel est chaîné après le précédent — le
  // message suivant n'est envoyé qu'une fois que la réponse (ou le rejet)
  // du message en cours a été traitée. Cela garantit que
  // pendingResolveRef/pendingRejectRef ne sont jamais écrasés par un appel
  // concurrent, quelle qu'en soit la cause (double-clic, double-tap,
  // clics rapides, etc.).
  const sendWebSocketMessage = useCallback((msg: GameMessage, showLoader: boolean = true): Promise<any> => {
    const runRequest = async (): Promise<any> => {
      if (showLoader) {
        setShowLoading(true)
        setLoadingMessage('Envoi de la requête...')
      }
      await openWebSocket()
      return new Promise((resolve, reject) => {
        if (!wsRef.current || !wsReadyRef.current) {
          if (showLoader) setShowLoading(false)
          reject(new Error('Non connecté'))
          return
        }
        const timeout = setTimeout(() => {
          pendingResolveRef.current = null
          pendingRejectRef.current = null
          if (showLoader) setShowLoading(false)
          reject(new Error('Timeout'))
        }, 10000)
        pendingResolveRef.current = (data) => {
          clearTimeout(timeout)
          if (showLoader) setShowLoading(false)
          resolve(data)
        }
        pendingRejectRef.current = (error) => {
          clearTimeout(timeout)
          if (showLoader) setShowLoading(false)
          reject(error)
        }
        wsRef.current.send(JSON.stringify(msg))
      })
    }

    // Chaîne cet envoi après la fin (succès ou échec) du précédent.
    const chained = requestQueueRef.current.then(runRequest, runRequest)
    // La file continue même si cet appel échoue, sans avaler l'erreur
    // pour l'appelant (elle est simplement absorbée dans la chaîne interne).
    requestQueueRef.current = chained.then(
      () => undefined,
      () => undefined
    )
    return chained
  }, [openWebSocket])

  const handleWebSocketMessage = useCallback((data: any) => {
    
    switch (data.action) {
      case 'game_created':
        gameIdRef.current = data.game_id
        hmacTokenRef.current = data.hmac_token
        
        setGrid(data.grid)
        gridRef.current = data.grid
        
        const wordPosMap = new Map<string, CellPosition[]>()
        if (data.word_positions) {
          Object.entries(data.word_positions).forEach(([word, positions]) => {
            wordPosMap.set(word, positions as CellPosition[])
          })
        }
        setWordPositions(wordPosMap)
        wordPositionsRef.current = wordPosMap
        
        setFoundWords(new Map())
        foundWordsRef.current = new Map()
        setSelected([])
        selectedRef.current = []
        setGameActive(true)
        gameActiveRef.current = true
        setGameStarted(true)
        
        showToast("Grille générée !", "info")
        break
        
      case 'selection_updated':
        if (data.selected_cells) {
          const cells = data.selected_cells.map((pos: any) => ({
            row: Array.isArray(pos) ? pos[0] : pos.row,
            col: Array.isArray(pos) ? pos[1] : pos.col
          }))
          setSelected(cells)
          selectedRef.current = cells
        }
        break
        
      case 'word_found':
        const winAmount = data.win_amount || 0
        setBalance(prev => prev + winAmount)
        
        if (data.word && data.positions) {
          const newFoundWords = new Map(foundWordsRef.current)
          const positions = data.positions.map((pos: any) => ({
            row: Array.isArray(pos) ? pos[0] : pos.row,
            col: Array.isArray(pos) ? pos[1] : pos.col
          }))
          newFoundWords.set(data.word, positions)
          setFoundWords(newFoundWords)
          foundWordsRef.current = newFoundWords
        }
        
        setSelected([])
        selectedRef.current = []
        
        if (data.gain_added) {
          showToast(`✅ ${data.word} trouvé ! +${formatNumber(winAmount)} XOF`, "win")
        } else {
          showToast(`✅ ${data.word} trouvé !`, "win")
        }
        
        if (data.game_state && data.game_state.completed) {
          setGameActive(false)
          gameActiveRef.current = false
          clearTimer()
          showToast("Bravo ! Tous les mots trouvés !", "win")
          setTimeout(() => endGame(), 3000)
        }
        break
        
      case 'invalid_word':
        setSelected([])
        selectedRef.current = []
        showToast(data.message || "Mot incorrect. Essayez encore !", "lose")
        break
        
      case 'selection_invalid':
        showToast(data.message || "Sélection invalide", "info")
        break
        
      case 'game_completed':
        setGameActive(false)
        gameActiveRef.current = false
        clearTimer()
        showToast(data.message || "Partie terminée !", "win")
        setTimeout(() => endGame(), 3000)
        break
        
      case 'game_ended':
        setGameActive(false)
        gameActiveRef.current = false
        clearTimer()
        {
          const endedFoundCount = data.found_count ?? 0
          const toastType = endedFoundCount > 0 ? 'win' : 'lose'
          showToast(data.message || "Partie terminée !", toastType)
        }
        setTimeout(() => endGame(), 3000)
        break
        
      case 'selection_cleared':
        setSelected([])
        selectedRef.current = []
        break
        
      case 'game_state':
        if (data.game_state) {
          const state = data.game_state
          if (state.grid) {
            setGrid(state.grid)
            gridRef.current = state.grid
          }
          if (state.found_words) {
            const newFoundWords = new Map<string, CellPosition[]>()
            Object.entries(state.found_words).forEach(([word, positions]) => {
              const posArray = (positions as any[]).map(pos => ({
                row: Array.isArray(pos) ? pos[0] : pos.row,
                col: Array.isArray(pos) ? pos[1] : pos.col
              }))
              newFoundWords.set(word, posArray)
            })
            setFoundWords(newFoundWords)
            foundWordsRef.current = newFoundWords
          }
          if (state.selected_cells) {
            const cells = state.selected_cells.map((pos: any) => ({
              row: Array.isArray(pos) ? pos[0] : pos.row,
              col: Array.isArray(pos) ? pos[1] : pos.col
            }))
            setSelected(cells)
            selectedRef.current = cells
          }
          if (state.active !== undefined) {
            setGameActive(state.active)
            gameActiveRef.current = state.active
          }
        }
        break
        
      case 'error':
        showToast(data.error || "Erreur", "lose")
        break
        
      default:
        break
    }
  }, [clearTimer, formatNumber, showToast])

  /* ── Logique du jeu ────────────────────────────────── */
  const endGame = useCallback(() => {
    setGameActive(false)
    gameActiveRef.current = false
    clearTimer()
    const foundCount = foundWordsRef.current.size
    const totalWin = foundCount * currentBet * 2
    if (foundCount > 0) {
      showToast(`Partie terminée ! ${foundCount}/${wordPositionsRef.current.size} mots trouvés. Gain: ${formatNumber(totalWin)} XOF`, "info")
    }
    setTimeout(() => {
      setGameStarted(false)
      setFoundWords(new Map())
      foundWordsRef.current = new Map()
      setWordPositions(new Map())
      wordPositionsRef.current = new Map()
      setSelected([])
      selectedRef.current = []
      gameIdRef.current = null
      hmacTokenRef.current = null
      closeWebSocket()
    }, 3000)
  }, [clearTimer, currentBet, formatNumber, showToast, closeWebSocket])

  const selectCell = useCallback((row: number, col: number) => {
    // ✅ CORRECTION : verrou anti-doublon. Si une sélection est déjà en
    // cours de traitement (message envoyé, réponse pas encore reçue), on
    // ignore les clics supplémentaires pour cette action.
    if (cellClickLockRef.current) {
      return
    }

    if (!gameActiveRef.current) {
      showToast("Jeu non actif", "lose")
      return
    }

    if (!wsRef.current || !wsReadyRef.current) {
      showToast("Connexion perdue", "lose")
      return
    }

    cellClickLockRef.current = true

    // `false` = pas de loader plein écran pour cette action rapide.
    sendWebSocketMessage({
      action: "select_cell",
      row: row,
      col: col,
      hmac_token: hmacTokenRef.current || '',
      game_id: gameIdRef.current || ''
    }, false)
      .catch((error) => {
        showToast("Erreur de communication", "lose")
      })
      .finally(() => {
        cellClickLockRef.current = false
      })
  }, [sendWebSocketMessage, showToast])

  /* ── Actions ────────────────────────────────────────── */
  const isValidBet = useCallback((): boolean => {
    const bet = parseInt(betInputRef.current?.value ?? '100')
    if (isNaN(bet) || bet < 100 || bet > 1000) { 
      showToast("Mise invalide. Min: 100 XOF, Max: 1,000 XOF", "lose"); return false 
    }
    if (bet > balance) { 
      showToast("Solde insuffisant !", "lose"); return false 
    }
    return true
  }, [balance, showToast])

  const fetchBalance = useCallback(async () => {
    setShowLoading(true)
    setLoadingMessage('Récupération du solde...')
    try {
      await initAll()
      const response = await fetchWithAllTokens('/api/get_lettricide_solde')
      if (response.ok) {
        const data = await response.json()
        if (data.solde !== undefined) {
          setBalance(data.solde)
        }
      }
    } catch (error) {
      showToast("Erreur de récupération du solde", "lose")
    } finally {
      setShowLoading(false)
    }
  }, [showToast])

  const placeBet = useCallback(async (betAmount: number): Promise<{ success: boolean; error?: string; new_solde?: number }> => {
    setShowLoading(true)
    setLoadingMessage('Placement de la mise...')
    try {
      await initAll()
      const response = await fetchWithAllTokens('/api/cherif', {
        method: 'POST',
        body: JSON.stringify({ bet: betAmount })
      })
      if (!response.ok) {
        const data = await response.json()
        return { success: false, error: data.error || 'Erreur' }
      }
      const data = await response.json()
      return { success: true, new_solde: data.new_solde }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' }
    } finally {
      setShowLoading(false)
    }
  }, [])

  const handleStartGame = useCallback(async () => {
    if (!isValidBet()) return
    const bet = parseInt(betInputRef.current?.value ?? '100')
    
    setGameStarted(true)
    
    const betResult = await placeBet(bet)
    if (!betResult.success) {
      showToast(betResult.error || "Erreur de mise", "lose")
      setGameStarted(false)
      return
    }
    
    if (betResult.new_solde !== undefined) {
      setBalance(betResult.new_solde)
    }
    
    setCurrentBet(bet)
    setGameActive(true)
    gameActiveRef.current = true
    setFoundWords(new Map())
    foundWordsRef.current = new Map()
    setSelected([])
    selectedRef.current = []
    
    try {
      const response = await sendWebSocketMessage({
        action: "get_game",
        bet: bet
      })
      startTimer(response?.duration_seconds ?? 180)
      showToast("Partie commencée ! Sélectionnez des lettres adjacentes", "info")
    } catch (error) {
      showToast("Erreur de démarrage", "lose")
      setGameStarted(false)
      setGameActive(false)
      gameActiveRef.current = false
    }
  }, [isValidBet, placeBet, startTimer, sendWebSocketMessage, showToast])

  const handleEndGame = useCallback(async () => {
    try {
      if (wsRef.current && wsReadyRef.current) {
        await sendWebSocketMessage({
          action: "end_game",
          hmac_token: hmacTokenRef.current || '',
          game_id: gameIdRef.current || ''
        })
      } else {
        endGame()
      }
    } catch (error) {
      endGame()
    }
  }, [sendWebSocketMessage, endGame])

  const handleBetChange = useCallback((value: string) => {
    let val = parseInt(value)
    if (isNaN(val)) val = 100
    if (val < 100) val = 100
    if (val > 1000) val = 1000
    setCurrentBet(val)
    if (betInputRef.current) betInputRef.current.value = val.toString()
  }, [])

  /* ── Effects ────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    initParticles()
    animateParticles()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }
    window.addEventListener('resize', handleResize)

    const handleKeyDown = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') {
        setShowRules(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    fetchBalance()

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(animFrameRef.current)
      clearTimer()
      closeWebSocket()
    }
  }, [initParticles, animateParticles, clearTimer, closeWebSocket, fetchBalance])

  /* ── Derived ────────────────────────────────────────── */
  const winAmount = currentBet * 2
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  const foundCount = foundWords.size

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen font-['Poppins',sans-serif] bg-[#1A1E1F] text-[#F5F6FA] flex flex-col items-center p-4 sm:p-6 overflow-x-hidden">
      
      {/* Loader */}
      {showLoading && (
        <div className="fixed inset-0 bg-[#1A1E1F]/90 backdrop-blur-xl flex flex-col items-center justify-center z-[5000]">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(108,92,231,0.4)] mb-6 animate-pulse">
            <LoaderIcon />
          </div>
          <p className="text-lg font-semibold text-white/90 animate-pulse">{loadingMessage}</p>
          <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-[-1] opacity-60" />

      {/* Toast */}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#2D3436]/95 backdrop-blur-xl rounded-2xl py-4 px-5 flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/[0.1] z-[1000] max-w-[90%] w-auto transition-all duration-400 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24 pointer-events-none'
        } ${
          toastType === 'win' ? 'border-l-4 border-l-emerald-400' :
          toastType === 'lose' ? 'border-l-4 border-l-red-500' :
          'border-l-4 border-l-purple-500'
        }`}
      >
        <div className={`text-xl ${
          toastType === 'win' ? 'text-emerald-400' :
          toastType === 'lose' ? 'text-red-400' :
          'text-purple-400'
        }`}>
          {toastType === 'win' ? <CheckCircleIcon /> :
           toastType === 'lose' ? <CloseCircleIcon /> :
           <InfoCircleIcon />}
        </div>
        <div className="text-sm font-medium text-[#F5F6FA]">{toastMessage}</div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[2000] p-5 transition-all duration-300"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRules(false) }}
        >
          <div className="bg-[#2D3436]/95 backdrop-blur-2xl rounded-2xl p-6 sm:p-7 max-w-[500px] w-full max-h-[80vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/[0.1]">
            
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/[0.1]">
              <div className="text-xl font-bold text-cyan-400 flex items-center gap-2.5">
                <BookIcon />
                Règles du Jeu
              </div>
              <button
                onClick={() => setShowRules(false)}
                className="bg-transparent border-none text-white/70 text-xl cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.1] hover:text-red-400 transition-all duration-300"
              >
                <CloseModalIcon />
              </button>
            </div>

            <div className="leading-relaxed text-sm space-y-4">
              <div>
                <h3 className="text-purple-400 text-base font-bold my-3">Comment jouer ?</h3>
                <p>Grid Pop est un jeu de mots cachés dans une grille de lettres.</p>
              </div>

              <div>
                <h3 className="text-purple-400 text-base font-bold my-3">Objectif</h3>
                <p>Trouver tous les mots de la liste cachés dans la grille.</p>
              </div>

              <div>
                <h3 className="text-purple-400 text-base font-bold my-3">Mécanique de jeu</h3>
                <ul className="pl-5 space-y-1.5">
                  <li>Les mots peuvent être cachés <span className="text-cyan-400 font-semibold">horizontalement, verticalement ou en diagonale</span>.</li>
                  <li>Cliquez sur les lettres <span className="text-cyan-400 font-semibold">adjacentes</span> pour former un mot.</li>
                  <li>Les lettres doivent être <span className="text-cyan-400 font-semibold">voisines</span> (horizontalement, verticalement ou en diagonale).</li>
                  <li>Un mot est valide automatiquement quand il correspond à un mot de la liste.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-purple-400 text-base font-bold my-3">Système de mise</h3>
                <ul className="pl-5 space-y-1.5">
                  <li>Mise minimum : <span className="text-cyan-400 font-semibold">100 XOF</span></li>
                  <li>Mise maximum : <span className="text-cyan-400 font-semibold">1000 XOF</span></li>
                  <li>Gain par mot trouvé : <span className="text-cyan-400 font-semibold">2x votre mise</span></li>
                </ul>
              </div>

              <div>
                <h3 className="text-purple-400 text-base font-bold my-3">Timer</h3>
                <p>Vous avez <span className="text-cyan-400 font-semibold">5 minutes</span> pour trouver tous les mots.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-[900px] mx-auto relative z-10">

        {/* Header */}
        <div className={`text-center mb-6 w-full ${gameStarted ? 'hidden' : 'block'}`}>
          <div className="text-3xl mb-2.5 text-cyan-400 animate-[float_6s_ease-in-out_infinite] flex justify-center">
            <GlobeIcon />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2 tracking-[1px] leading-tight">
            GRID POP
          </h1>
          <p className="text-sm sm:text-base text-white/70 font-normal mb-4">
            Trouvez les mots cachés et gagnez des récompenses
          </p>
          <div className="flex justify-center gap-2.5 mt-4">
            <button
              onClick={() => setShowRules(true)}
              className="px-4 py-2.5 bg-white/[0.05] text-[#F5F6FA] border border-white/[0.1] rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-[1px] hover:bg-white/[0.1] hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all duration-300 flex items-center gap-2"
            >
              <BookIcon />
              RÈGLES
            </button>
          </div>
        </div>

        {/* Bet Section */}
        <section className={`bg-[#2D3436]/85 backdrop-blur-xl rounded-2xl p-5 sm:p-6 mb-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/[0.08] w-full ${gameStarted ? 'hidden' : 'block'}`}>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="text-xl font-bold text-[#F5F6FA] flex items-center gap-2.5">
              <span className="text-cyan-400"><CoinsIcon /></span>
              Placez votre mise
            </div>
            <div className="flex items-center gap-2.5 bg-black/30 rounded-2xl py-3 px-4 sm:px-5 border border-white/[0.1] sm:ml-auto">
              <span className="text-2xl text-cyan-400"><WalletIcon /></span>
              <div>
                <div className="text-xs text-white/60">SOLDE</div>
                <div className="text-xl sm:text-2xl font-bold text-cyan-400">{formatNumber(balance)} XOF</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="relative my-4">
              <input
                type="number"
                ref={betInputRef}
                placeholder="Ex: 500"
                min="100"
                max="1000"
                defaultValue="100"
                onChange={(e) => handleBetChange(e.target.value)}
                className="w-full py-3.5 px-5 bg-black/30 border-2 border-purple-500/30 rounded-2xl text-[#F5F6FA] text-lg font-semibold text-center outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(108,92,231,0.2)]"
              />
              <span className="absolute -top-2.5 left-4 bg-[#1A1E1F] px-2.5 text-xs text-cyan-400 font-medium">MONTANT DE LA MISE</span>
              <div className="flex justify-between mt-2 text-xs text-white/50">
                <span>Min: 100 XOF</span>
                <span>Max: 1,000 XOF</span>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold text-base uppercase tracking-[1px] rounded-xl hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(108,92,231,0.4)] active:-translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 animate-[pulse_2s_infinite]"
            >
              <PlayIcon />
              JOUER
            </button>
          </div>
        </section>

        {/* Game Section */}
        <section className={`bg-[#2D3436]/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/[0.08] w-full ${gameStarted ? 'block' : 'hidden'}`}>
          
          <div className={`mb-5 text-center ${gameStarted ? 'block' : 'hidden'}`}>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2.5">
              Grille de Jeu
            </h2>
          </div>

          {/* Stats */}
          <div className="w-full overflow-x-auto mb-5 pb-2.5 scrollbar-thin">
            <div className="flex gap-2.5 min-w-min p-1">
              {[
                { label: 'MISE', value: `${formatNumber(currentBet)} XOF`, color: 'text-purple-400' },
                { label: 'GAIN POTENTIEL', value: `${formatNumber(winAmount)} XOF`, color: 'text-emerald-400' },
                { label: 'MOTS TROUVÉS', value: `${foundCount}/${wordPositions.size}`, color: 'text-cyan-400' },
                { label: 'SOLDE', value: `${formatNumber(balance)} XOF`, color: 'text-yellow-400' },
                { label: 'TEMPS', value: timerText, color: 'text-red-400 font-mono tracking-[1px]' }
              ].map((stat, i) => (
                <div key={i} className="bg-black/30 rounded-xl py-3 px-4 border border-white/[0.1] flex flex-col items-center justify-center text-center min-w-[110px] sm:min-w-[130px] flex-shrink-0">
                  <div className="text-[10px] sm:text-xs text-white/60 mb-1 whitespace-nowrap overflow-hidden text-ellipsis w-full">{stat.label}</div>
                  <div className={`text-sm sm:text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Word List */}
          <div className="bg-black/20 rounded-2xl p-4 mb-5 border border-white/[0.05]">
            <div className="text-xs sm:text-sm text-white/70 mb-2.5 text-center font-semibold">MOTS À TROUVER</div>
            <div className="flex flex-wrap justify-center gap-2" id="word-list">
              {Array.from(wordPositions.keys()).map((word) => {
                const isWordFound = foundWords.has(word)
                return (
                  <span
                    key={word}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all duration-300 ${
                      isWordFound
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 line-through'
                        : 'bg-white/[0.05] text-white/80 border-white/[0.1]'
                    }`}
                  >
                    {word}
                  </span>
                )
              })}
              {wordPositions.size === 0 && (
                <span className="text-xs text-white/40">Chargement des mots...</span>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="flex justify-center items-center my-5 p-4 bg-black/20 rounded-2xl border border-white/[0.05] w-full min-h-[300px] overflow-hidden">
            <div
              ref={gridContainerRef}
              className="grid gap-[3px] touch-manipulation relative mx-auto max-w-full"
              style={{ gridTemplateColumns: `repeat(${grid.length > 0 ? grid[0].length : 10}, minmax(24px, 40px))` }}
            >
              {grid.map((row, r) =>
                row.map((letter, c) => {
                  const isSelected = selected.some(sel => sel.row === r && sel.col === c)
                  let isFound = false
                  for (const positions of foundWords.values()) {
                    if (positions.some(pos => pos.row === r && pos.col === c)) {
                      isFound = true
                      break
                    }
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => selectCell(r, c)}
                      className={`
                        aspect-square flex items-center justify-center cursor-pointer select-none font-bold text-sm sm:text-base
                        transition-all duration-150 rounded-md relative overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.2)]
                        hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.3)]
                        ${isSelected ? '!bg-purple-500 !text-white scale-95 shadow-[0_0_15px_rgba(108,92,231,0.5)]' : ''}
                        ${isFound ? '!bg-emerald-500 !text-white animate-[pop_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)] after:content-["✓"] after:absolute after:-top-[3px] after:-right-[3px] after:bg-emerald-600 after:w-4 after:h-4 after:rounded-full after:text-[10px] after:flex after:items-center after:justify-center' : ''}
                        ${!isSelected && !isFound ? 'bg-[#1E2328]/90' : ''}
                      `}
                    >
                      {letter}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2.5 mt-5">
            <button
              onClick={handleEndGame}
              className="flex-1 py-3.5 bg-white/[0.05] text-[#F5F6FA] border border-white/[0.1] rounded-xl font-semibold text-sm uppercase tracking-[1px] hover:bg-white/[0.1] hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <StopIcon />
              TERMINER
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}