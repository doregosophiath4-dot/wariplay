'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const CloseModalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const TargetIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
)

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

const SkullIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <circle cx="9" cy="10" r="1.5" />
    <circle cx="15" cy="10" r="1.5" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <path d="M8 14c0 1.66 1.34 3 3 3s3-1.34 3-3" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

/* ═══════════════════════════════════════════
   LOADER ICON - 8 lignes rayonnantes
   ═══════════════════════════════════════════ */

const LoaderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300 animate-spin">
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

// Valeur de repli purement pour l'affichage initial avant la première
// synchronisation serveur. La vraie durée vient toujours de "duration"
// dans les messages WebSocket (voir syncTimer).
const DEFAULT_WORD_DURATION = 30

/* ═══════════════════════════════════════════
   CLASSES
   ═══════════════════════════════════════════ */

class FloatingLetter {
  letter: string
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
  rotation: number
  rotationSpeed: number

  constructor(width: number, height: number) {
    this.letter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.size = Math.random() * 40 + 20
    this.speedX = Math.random() * 0.5 - 0.25
    this.speedY = Math.random() * 0.5 - 0.25
    this.opacity = Math.random() * 0.2 + 0.05
    this.color = `rgba(${Math.floor(Math.random() * 100 + 150)}, ${Math.floor(Math.random() * 100 + 150)}, ${Math.floor(Math.random() * 100 + 200)}, ${this.opacity})`
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = Math.random() * 0.02 - 0.01
  }

  update(width: number, height: number) {
    this.x += this.speedX
    this.y += this.speedY
    this.rotation += this.rotationSpeed
    if (this.x > width + this.size) this.x = -this.size
    if (this.x < -this.size) this.x = width + this.size
    if (this.y > height + this.size) this.y = -this.size
    if (this.y < -this.size) this.y = height + this.size
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    ctx.fillStyle = this.color
    ctx.font = `bold ${this.size}px 'Poppins', sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.letter, 0, 0)
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`
    ctx.font = `bold ${this.size * 0.8}px 'Poppins', sans-serif`
    ctx.fillText(this.letter, this.size * 0.05, -this.size * 0.05)
    ctx.restore()
  }
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function Lettricide() {
  useAuth()
  const router = useRouter()

  const [balance, setBalance] = useState(5000)
  const [lives, setLives] = useState(0)
  const [currentBet, setCurrentBet] = useState(100)
  const [gameActive, setGameActive] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [chosenWord, setChosenWord] = useState('')
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [triesLeft, setTriesLeft] = useState(10)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORD_DURATION)
  const [maxTime, setMaxTime] = useState(DEFAULT_WORD_DURATION)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [wordsPlayed, setWordsPlayed] = useState(0)
  const [wordsWon, setWordsWon] = useState(0)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [showRules, setShowRules] = useState(false)
  const [isProcessingBet, setIsProcessingBet] = useState(false)
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())
  const [disabledButtons, setDisabledButtons] = useState<Set<string>>(new Set())
  const [correctButtons, setCorrectButtons] = useState<Set<string>>(new Set())
  const [wrongButtons, setWrongButtons] = useState<Set<string>>(new Set())
  const [wordDisplay, setWordDisplay] = useState('')
  const [timerWarning, setTimerWarning] = useState(false)
  const [showWordGlow, setShowWordGlow] = useState(false)
  const [targetWords, setTargetWords] = useState(0)
  const [showObjectivePopup, setShowObjectivePopup] = useState(false)
  const [showGameOverPopup, setShowGameOverPopup] = useState(false)
  const [gameOverWin, setGameOverWin] = useState(false)
  const [finalWinnings, setFinalWinnings] = useState(0)
  const [gameId, setGameId] = useState('')
  const [gameToken, setGameToken] = useState('')
  const [wsToken, setWsToken] = useState<string | null>(null)
  const [wsTimestamp, setWsTimestamp] = useState<number | null>(null)
  const [totalGain, setTotalGain] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Chargement...')
  const [wsConnected, setWsConnected] = useState(false)
  const [gameInitialized, setGameInitialized] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<FloatingLetter[]>([])
  const animFrameRef = useRef<number>(0)
  const betInputRef = useRef<HTMLInputElement>(null)
  const gameActiveRef = useRef(false)
  const chosenWordRef = useRef('')
  const wordsWonRef = useRef(0)
  const targetWordsRef = useRef(0)
  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef(false)
  const pendingResolveRef = useRef<((value: any) => void) | null>(null)
  const pendingRejectRef = useRef<((reason?: any) => void) | null>(null)
  const startSentRef = useRef(false)
  const gameTokenRef = useRef<string>('')

  // ── Timer basé sur une deadline absolue (horloge serveur) ──
  const deadlineRef = useRef<number>(0)
  const durationRef = useRef<number>(DEFAULT_WORD_DURATION)
  const clockOffsetRef = useRef<number>(0)

  // Ref qui contient toujours la dernière version du handler de messages de
  // jeu. Lue par le onmessage unique créé dans openWebSocket.
  const gameMessageHandlerRef = useRef<((data: any) => void) | null>(null)

  // Suivi de la dernière lettre cliquée + essais restants, pour déterminer
  // si la réponse du serveur correspond à une bonne ou mauvaise lettre.
  const lastGuessedLetterRef = useRef<string>('')
  const triesLeftRef = useRef(10)

  // ── Synchronisation objectif serveur ──
  // Le serveur envoie "objective" (avec le vrai target) juste avant
  // d'envoyer "new_word" pour le premier mot. On bufferise ce premier mot
  // tant que l'utilisateur n'a pas cliqué "Commencer la partie" dans le
  // popup d'objectif, pour ne pas lui montrer le mot avant qu'il ait vu
  // et validé l'objectif.
  const awaitingObjectiveStartRef = useRef(false)
  const pendingFirstWordRef = useRef<any>(null)

  useEffect(() => { gameActiveRef.current = gameActive }, [gameActive])
  useEffect(() => { chosenWordRef.current = chosenWord }, [chosenWord])
  useEffect(() => { wordsWonRef.current = wordsWon }, [wordsWon])
  useEffect(() => { targetWordsRef.current = targetWords }, [targetWords])
  useEffect(() => { triesLeftRef.current = triesLeft }, [triesLeft])

  const formatNumber = useCallback((num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }, [])

  /* ── Loader ─────────────────────────────────────────── */

  const showLoader = useCallback((message: string = 'Chargement...') => {
    setLoading(true)
    setLoadingMessage(message)
  }, [])

  const hideLoader = useCallback(() => {
    setLoading(false)
    setLoadingMessage('Chargement...')
  }, [])

  /* ── WebSocket ──────────────────────────────────────── */

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
    await initAll()

    const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
    const wsUrl = proto + window.location.host + '/ws/lettricide'

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws
    const timeout = setTimeout(() => {
      closeWebSocket()
      reject(new Error('Timeout WebSocket'))
    }, 10000)

    ws.onopen = async () => {
      try {
        const authMessage = await prepareWSAuthMessage()
        ws.send(JSON.stringify(authMessage))
      } catch (error) {
        clearTimeout(timeout)
        closeWebSocket()
        reject(error)
      }
    }

    // Handler unique : route TOUT.
    // auth_success -> résout la connexion.
    // Sinon, si une promesse attend une réponse (init_session, etc.) -> la résout.
    // Sinon -> transmet au handler de logique de jeu (objective, new_word, etc.)
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)

        if (data.type === 'auth_success') {
          clearTimeout(timeout)
          wsReadyRef.current = true
          setWsConnected(true)
          resolve()
          return
        }

        if (pendingResolveRef.current) {
          const resolveFn = pendingResolveRef.current
          pendingResolveRef.current = null
          pendingRejectRef.current = null
          resolveFn(data)
          return
        }

        gameMessageHandlerRef.current?.(data)
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
      setWsConnected(false)
      wsRef.current = null
      if (pendingRejectRef.current) {
        pendingRejectRef.current(new Error('WebSocket fermé'))
        pendingResolveRef.current = null
        pendingRejectRef.current = null
      }
    }
  }), [closeWebSocket])

  const sendWebSocketMessage = useCallback(async (msg: any): Promise<any> => {
    await openWebSocket()
    return new Promise((resolve, reject) => {
      if (!wsRef.current || !wsReadyRef.current) {
        reject(new Error('Non connecté au WebSocket'))
        return
      }
      const timeout = setTimeout(() => {
        pendingResolveRef.current = null
        pendingRejectRef.current = null
        reject(new Error('Timeout WebSocket'))
      }, 10000)
      pendingResolveRef.current = (data: any) => {
        clearTimeout(timeout)
        resolve(data)
      }
      pendingRejectRef.current = (error: any) => {
        clearTimeout(timeout)
        reject(error)
      }
      wsRef.current.send(JSON.stringify(msg))
    })
  }, [openWebSocket])

  /* ── API ────────────────────────────────────────────── */

  const fetchBalance = useCallback(async (): Promise<number> => {
    try {
      const response = await fetchWithAllTokens('/api/get_lettricide_solde')
      if (!response.ok) return 0
      const data = await response.json()
      return data.solde || 0
    } catch (error) {
      return 0
    }
  }, [])

  const fetchLives = useCallback(async (): Promise<number> => {
    try {
      await initAll()
      const response = await fetchWithAllTokens('/api/get_lettricide_lives')
      if (!response.ok) return 0
      const data = await response.json()
      return data.lives || 0
    } catch (error) {
      return 0
    }
  }, [])

  const placeBet = useCallback(async (betAmount: number): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await fetchWithAllTokens('/api/cherif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet: betAmount })
      })
      if (!response.ok) return { success: false }
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return { success: false }
    }
  }, [])

  const decrementLives = useCallback(async (): Promise<{ success: boolean; remaining_lives?: number }> => {
    try {
      const response = await fetchWithAllTokens('/api/decrement_lettricide_lives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) return { success: false }
      const data = await response.json()
      return { success: true, remaining_lives: data.remaining_lives || 0 }
    } catch (error) {
      return { success: false }
    }
  }, [])

  const loadUserData = useCallback(async () => {
    showLoader('Chargement des données...')
    try {
      const [newBalance, newLives] = await Promise.all([fetchBalance(), fetchLives()])
      setBalance(newBalance)
      setLives(newLives)
    } catch (error) {
      // silencieux
    } finally {
      hideLoader()
    }
  }, [fetchBalance, fetchLives, showLoader, hideLoader])

  /* ── Animation canvas ──────────────────────────────── */

  const animateParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height

    const gradient = ctx.createLinearGradient(0, 0, w, h)
    gradient.addColorStop(0, 'rgba(10, 10, 30, 0.8)')
    gradient.addColorStop(0.5, 'rgba(20, 20, 40, 0.9)')
    gradient.addColorStop(1, 'rgba(10, 10, 30, 0.8)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    const particles = particlesRef.current
    particles.forEach(particle => {
      particle.update(w, h)
      particle.draw(ctx)

      particles.forEach(otherParticle => {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 150 && particle !== otherParticle) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(162, 155, 254, ${0.1 * (1 - distance / 150)})`
          ctx.lineWidth = 0.5
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(otherParticle.x, otherParticle.y)
          ctx.stroke()
        }
      })
    })

    animFrameRef.current = requestAnimationFrame(animateParticles)
  }, [])

  /* ── Utilitaires ───────────────────────────────────── */

  const normalizeWord = useCallback((word: string): string => {
    return word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }, [])

  const updateWordDisplay = useCallback((word: string, guessed: Set<string>) => {
    let display = ""
    for (const char of word) {
      display += guessed.has(char) ? char.toUpperCase() + " " : "_ "
    }
    setWordDisplay(display.trim())
    setShowWordGlow(true)
    setTimeout(() => setShowWordGlow(false), 500)
  }, [])

  const checkWin = useCallback((word: string, guessed: Set<string>): boolean => {
    for (const char of word) { if (!guessed.has(char)) return false }
    return true
  }, [])

  const revealWord = useCallback((word: string) => {
    let display = ""
    for (const char of word) { display += char.toUpperCase() + " " }
    setWordDisplay(display.trim())
  }, [])

  const disableAllButtons = useCallback(() => {
    const allLetters = new Set<string>()
    for (let i = 65; i <= 90; i++) allLetters.add(String.fromCharCode(i).toLowerCase())
    setDisabledButtons(allLetters)
  }, [])

  const showMessage = useCallback((text: string, type: string) => {
    setMessage(text)
    setMessageType(type)
  }, [])

  /* ── Timer synchronisé serveur ─────────────────────────
     syncTimer recale la deadline locale à partir des infos envoyées par
     le serveur (time_left, duration, server_time). Un seul interval
     global lit en continu (deadlineRef - Date.now()) — jamais de
     décrémentation locale indépendante. */

  const syncTimer = useCallback((serverTimeLeft: number, duration: number, serverTime?: number) => {
    if (typeof serverTime === 'number') {
      clockOffsetRef.current = (serverTime * 1000) - Date.now()
    }
    durationRef.current = duration
    setMaxTime(duration)
    deadlineRef.current = Date.now() + Math.max(0, serverTimeLeft) * 1000
    const rounded = Math.max(0, Math.ceil(serverTimeLeft))
    setTimeLeft(rounded)
    setTimerWarning(rounded <= 5)
  }, [])

  /* ── Application des données d'un mot (new_word / resume) ──────────
     Factorisé car le premier mot d'une partie est bufferisé (voir
     pendingFirstWordRef) et rejoué plus tard depuis handleStartFromObjective,
     tandis que "resume" applique les mêmes données mais immédiatement. */

  const applyWordData = useCallback((data: any) => {
    const masked = data.masked || ""
    setWordDisplay(masked.split('').join(' '))
    setTriesLeft(data.tries_left ?? 10)
    setCurrentWordIndex((data.word_index ?? 1) - 1)

    if (typeof data.words_won === 'number') {
      setWordsWon(data.words_won)
      wordsWonRef.current = data.words_won
    }
    if (typeof data.target === 'number') {
      setTargetWords(data.target)
      targetWordsRef.current = data.target
    }

    setMessage('')
    setMessageType('')
    setGameActive(true)
    syncTimer(data.time_left ?? DEFAULT_WORD_DURATION, data.duration ?? DEFAULT_WORD_DURATION, data.server_time)
    setDisabledButtons(new Set())
    setCorrectButtons(new Set())
    setWrongButtons(new Set())
  }, [syncTimer])

  /* ── Logique du jeu ────────────────────────────────── */

  const goToNextWord = useCallback(() => {
    // Le serveur est seul décisionnaire : soit il pousse "new_word" pour
    // continuer, soit il pousse "finished" si la partie doit se terminer
    // (objectif atteint, ou devenu impossible). Le client n'a plus à
    // décider localement de la fin de partie.
  }, [])

  const finishGame = useCallback(async (hasWon: boolean, payout: number, finalWordsWon: number, finalTarget: number) => {
    setGameActive(false)
    closeWebSocket()

    setWordsWon(finalWordsWon)
    wordsWonRef.current = finalWordsWon
    setTargetWords(finalTarget)
    targetWordsRef.current = finalTarget

    setGameOverWin(hasWon)
    setFinalWinnings(payout)

    // Le solde réel est celui de la base de données (mise à jour par le
    // serveur) : on le resynchronise plutôt que de le recalculer localement.
    const newBalance = await fetchBalance()
    setBalance(newBalance)

    setShowGameOverPopup(true)
    hideLoader()
  }, [closeWebSocket, hideLoader, fetchBalance])

  const handleLetterClick = useCallback((letter: string) => {
    if (!gameActiveRef.current) return
    const lowerLetter = letter.toLowerCase()
    lastGuessedLetterRef.current = lowerLetter
    setDisabledButtons(prev => new Set(prev).add(lowerLetter))

    if (wsRef.current && wsReadyRef.current && gameTokenRef.current) {
      const msg = {
        action: 'guess',
        letter: lowerLetter,
        token: gameTokenRef.current
      }
      wsRef.current.send(JSON.stringify(msg))
    }
  }, [])

  /* ── Réinitialisation locale avant de lancer une nouvelle partie ────── */

  const resetGameState = useCallback(() => {
    setGuessedLetters(new Set())
    setTriesLeft(10)
    setCurrentWordIndex(0)
    setWordsPlayed(0)
    setWordsWon(0)
    wordsWonRef.current = 0
    setTargetWords(0)
    targetWordsRef.current = 0
    setMessage('')
    setMessageType('')
    setTimerWarning(false)
    setWordDisplay('Chargement...')
    setUsedWords(new Set())
    setDisabledButtons(new Set())
    setCorrectButtons(new Set())
    setWrongButtons(new Set())
    setGameActive(false)
    startSentRef.current = false
    pendingFirstWordRef.current = null
    awaitingObjectiveStartRef.current = false
    setGameInitialized(true)
  }, [])

  /* ── Actions ────────────────────────────────────────── */

  const handleStartGame = useCallback(async () => {
    const bet = parseInt(betInputRef.current?.value ?? '100')

    if (isNaN(bet) || bet < 100) {
      showMessage("La mise minimum est de 100 XOF", "error")
      betInputRef.current?.focus()
      return
    }
    if (bet > 1000) {
      showMessage("La mise maximum est de 1000 XOF", "error")
      betInputRef.current?.focus()
      return
    }
    if (bet > balance) {
      showMessage("Solde insuffisant !", "error")
      betInputRef.current?.focus()
      return
    }
    if (lives <= 0) {
      showMessage("Plus de vies disponibles !", "error")
      return
    }

    setIsProcessingBet(true)
    showLoader('Connexion au serveur...')

    try {
      await openWebSocket()

      showLoader('Décrémentation des vies...')
      const decrementResult = await decrementLives()
      if (!decrementResult.success) {
        showMessage("Erreur lors de la décrémentation des vies", "error")
        setIsProcessingBet(false)
        hideLoader()
        closeWebSocket()
        return
      }
      setLives(decrementResult.remaining_lives || 0)

      showLoader('Placement du pari...')
      const betResult = await placeBet(bet)
      if (!betResult.success) {
        showMessage("Erreur lors du pari", "error")
        setIsProcessingBet(false)
        hideLoader()
        closeWebSocket()
        return
      }

      if (betResult.data && betResult.data.new_solde !== undefined) {
        setBalance(betResult.data.new_solde)
      } else {
        const newBalance = await fetchBalance()
        setBalance(newBalance)
      }

      setCurrentBet(bet)
      setGameStarted(true)
      setIsProcessingBet(false)

      showLoader('Initialisation de la session...')
      let sessionData
      try {
        sessionData = await sendWebSocketMessage({ action: 'init_session' })
      } catch (error) {
        showMessage("Erreur d'initialisation de la session", "error")
        setGameStarted(false)
        hideLoader()
        closeWebSocket()
        return
      }

      if (!sessionData || !sessionData.game_id || !sessionData.token) {
        showMessage("Erreur d'initialisation de la session", "error")
        setGameStarted(false)
        hideLoader()
        closeWebSocket()
        return
      }

      gameTokenRef.current = sessionData.token
      setGameId(sessionData.game_id)
      setGameToken(sessionData.token)
      setWsToken(sessionData.token)
      setWsTimestamp(sessionData.timestamp || Math.floor(Date.now() / 1000))

      // Prépare l'état local puis demande au serveur de générer
      // l'objectif et de démarrer la partie. Le serveur répondra par
      // "objective" (affichage du popup) puis "new_word" (bufferisé
      // jusqu'à ce que l'utilisateur clique "Commencer").
      resetGameState()
      awaitingObjectiveStartRef.current = true
      showLoader('Génération de l\'objectif...')

      if (wsRef.current && wsReadyRef.current) {
        wsRef.current.send(JSON.stringify({
          action: 'start',
          bet,
          token: sessionData.token
        }))
        startSentRef.current = true
      } else {
        showMessage("Connexion perdue, veuillez réessayer", "error")
        setGameStarted(false)
        hideLoader()
        closeWebSocket()
      }
    } catch (error) {
      showMessage("Une erreur est survenue", "error")
      setIsProcessingBet(false)
      hideLoader()
      closeWebSocket()
    }
  }, [balance, lives, decrementLives, placeBet, fetchBalance, openWebSocket, sendWebSocketMessage, showMessage, showLoader, hideLoader, closeWebSocket, resetGameState])

  const handleStartFromObjective = useCallback(() => {
    awaitingObjectiveStartRef.current = false
    setShowObjectivePopup(false)

    const pending = pendingFirstWordRef.current
    pendingFirstWordRef.current = null

    if (pending) {
      applyWordData(pending)
      hideLoader()
    } else {
      // Le premier mot n'est pas encore arrivé : il sera appliqué dès sa
      // réception dans handleMessage (awaitingObjectiveStartRef est déjà
      // à false donc il sera traité normalement, sans être bufferisé).
      showLoader('Chargement du premier mot...')
    }
  }, [applyWordData, hideLoader, showLoader])

  const handleBack = useCallback(() => {
    if (gameActiveRef.current) {
      if (window.confirm("Voulez-vous vraiment quitter la partie en cours ? Vous perdrez votre mise.")) {
        setGameStarted(false)
        setGameActive(false)
        closeWebSocket()
        hideLoader()
        setGameInitialized(false)
        gameTokenRef.current = ''
        startSentRef.current = false
        pendingFirstWordRef.current = null
        awaitingObjectiveStartRef.current = false
      }
    } else {
      setGameStarted(false)
      closeWebSocket()
      hideLoader()
      setGameInitialized(false)
      gameTokenRef.current = ''
      startSentRef.current = false
      pendingFirstWordRef.current = null
      awaitingObjectiveStartRef.current = false
    }
  }, [closeWebSocket, hideLoader])

  const handleBetChange = useCallback((value: string) => {
    let val = parseInt(value)
    if (isNaN(val)) val = 100
    if (val < 100) val = 100
    if (val > 1000) val = 1000
    if (val > balance) val = balance
    setCurrentBet(val)
    if (betInputRef.current) betInputRef.current.value = val.toString()
  }, [balance])

  const handleCloseGameOver = useCallback(() => {
    setShowGameOverPopup(false)
    setGameStarted(false)
    closeWebSocket()
    hideLoader()
    setGameInitialized(false)
    startSentRef.current = false
    gameTokenRef.current = ''
    pendingFirstWordRef.current = null
    awaitingObjectiveStartRef.current = false
  }, [closeWebSocket, hideLoader])

  /* ── Effects ────────────────────────────────────────── */

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    for (let i = 0; i < 60; i++) particlesRef.current.push(new FloatingLetter(canvas.width, canvas.height))
    animateParticles()
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animFrameRef.current)
      closeWebSocket()
      hideLoader()
    }
  }, [animateParticles, closeWebSocket, hideLoader])

  // Interval global unique pour l'affichage du timer. Ne fait que LIRE
  // deadlineRef, jamais décrémenter un compteur local.
  useEffect(() => {
    const id = setInterval(() => {
      if (!gameActiveRef.current) return
      const remainingMs = deadlineRef.current - Date.now()
      const remaining = Math.max(0, Math.ceil(remainingMs / 1000))
      setTimeLeft(remaining)
      setTimerWarning(remaining <= 5)
    }, 200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  // Auto-effacement du message après 3 secondes.
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
    return () => clearTimeout(t)
  }, [message])

  // Cet effet met à jour gameMessageHandlerRef à chaque changement des
  // fonctions dont handleMessage dépend. C'est le onmessage unique dans
  // openWebSocket qui appelle cette ref.
  useEffect(() => {
    const handleMessage = (data: any) => {
      if (data.error) {
        showMessage(data.error, "error")
        return
      }

      if (data.status === "session_created") {
        gameTokenRef.current = data.token
        setGameId(data.game_id)
        setGameToken(data.token)
        setWsToken(data.token)
        setWsTimestamp(data.timestamp || Math.floor(Date.now() / 1000))
        return
      }

      // Objectif généré par le serveur — seule source de vérité.
      // Affiche le popup ; le premier mot (new_word) qui arrive juste
      // après sera bufferisé jusqu'au clic sur "Commencer".
      if (data.status === "objective") {
        setTargetWords(data.target)
        targetWordsRef.current = data.target
        awaitingObjectiveStartRef.current = true
        setShowObjectivePopup(true)
        hideLoader()
        return
      }

      if (data.status === "new_word") {
        if (awaitingObjectiveStartRef.current) {
          // Premier mot de la partie : on le garde en réserve tant que
          // le popup d'objectif n'a pas été validé par l'utilisateur.
          pendingFirstWordRef.current = data
          return
        }
        applyWordData(data)
        return
      }

      // Reconnexion en cours de partie : resynchronise tout (mot, essais,
      // temps, objectif, progression) depuis l'état serveur.
      if (data.status === "resume") {
        awaitingObjectiveStartRef.current = false
        setShowObjectivePopup(false)
        applyWordData(data)
        return
      }

      if (data.masked !== undefined) {
        const letter = lastGuessedLetterRef.current
        const wasWrong = data.tries_left < triesLeftRef.current

        setWordDisplay(data.masked.split('').join(' '))
        setTriesLeft(data.tries_left)

        if (typeof data.words_won === 'number') {
          setWordsWon(data.words_won)
          wordsWonRef.current = data.words_won
        }
        if (typeof data.target === 'number') {
          setTargetWords(data.target)
          targetWordsRef.current = data.target
        }

        if (data.time_left !== undefined) {
          syncTimer(data.time_left, data.duration ?? durationRef.current, data.server_time)
        }

        if (letter) {
          if (wasWrong) {
            setWrongButtons(prev => new Set(prev).add(letter))
          } else {
            setCorrectButtons(prev => new Set(prev).add(letter))
          }
          lastGuessedLetterRef.current = ''
        }

        if (data.status === "win") {
          setGameActive(false)
          showMessage("Mot trouvé !", "win")
          disableAllButtons()
          setTimeout(() => goToNextWord(), 1500)
        } else if (data.status === "lose") {
          setGameActive(false)
          showMessage("Mot raté !", "lose")
          disableAllButtons()
          setTimeout(() => goToNextWord(), 2000)
        }
        return
      }

      if (data.status === "timeout") {
        setGameActive(false)
        const word = data.word || ''
        showMessage(`Temps écoulé ! Le mot était : ${word.toUpperCase()}`, "lose")
        disableAllButtons()
        setTimeout(() => goToNextWord(), 2000)
        return
      }

      // Fin de partie décidée exclusivement par le serveur (objectif
      // atteint OU devenu impossible à atteindre — potentiellement avant
      // les 10 mots).
      if (data.status === "finished") {
        setTotalGain(data.payout ?? 0)
        finishGame(
          !!data.has_won,
          data.payout ?? 0,
          data.words_won ?? wordsWonRef.current,
          data.target ?? targetWordsRef.current
        )
      }
    }

    gameMessageHandlerRef.current = handleMessage

    return () => {
      gameMessageHandlerRef.current = null
    }
  }, [syncTimer, applyWordData, goToNextWord, disableAllButtons, showMessage, finishGame, hideLoader])

  // Forcer la mise à jour du display quand le currentWordIndex change
  useEffect(() => {
    if (currentWordIndex > 0 && wordDisplay === 'Chargement...') {
      setWordDisplay(prev => prev === 'Chargement...' ? 'En attente...' : prev)
    }
  }, [currentWordIndex, wordDisplay])

  /* ── Derived ────────────────────────────────────────── */

  const alphabet: string[] = []
  for (let i = 65; i <= 90; i++) alphabet.push(String.fromCharCode(i))
  const progressPercent = timeLeft > 0 ? (timeLeft / maxTime) * 100 : 0

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen font-['Poppins',sans-serif] flex justify-center items-center p-5 overflow-x-hidden bg-[#0a0a1a]">

      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[#0a0a1a]/95 backdrop-blur-xl flex flex-col items-center justify-center z-[9999]">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/30 via-purple-400/20 to-purple-300/10 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(108,92,231,0.3)] animate-[pulse_1.5s_ease-in-out_infinite] border border-purple-500/30 relative before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-r before:from-transparent before:via-purple-500/10 before:to-transparent before:animate-[shimmer_2s_ease-in-out_infinite]">
              <div className="relative z-10">
                <LoaderIcon />
              </div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 to-cyan-400/20 blur-xl -z-10 animate-[pulse_2s_ease-in-out_infinite]" />
            </div>
          </div>

          <p className="mt-8 text-lg font-semibold text-purple-300/90 animate-[pulse_1.5s_ease-in-out_infinite] drop-shadow-[0_0_20px_rgba(108,92,231,0.3)]">
            {loadingMessage}
          </p>

          <div className="mt-6 w-48 h-1.5 bg-purple-500/10 rounded-full overflow-hidden border border-purple-500/20">
            <div className="h-full bg-gradient-to-r from-purple-500 via-purple-300 to-purple-500 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full"
                 style={{ width: '60%' }} />
          </div>

          <div className="mt-4 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-purple-400/50"
                style={{
                  animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`
                }}
              />
            ))}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-[-1]" />

      {/* Back Button */}
      {gameStarted && !showObjectivePopup && !showGameOverPopup && (
        <button
          onClick={handleBack}
          className="fixed top-4 left-4 bg-[#141428]/70 border border-purple-500/30 text-purple-300 py-2 px-4 sm:py-2.5 sm:px-5 rounded-xl cursor-pointer font-semibold backdrop-blur-xl hover:bg-purple-500/30 hover:translate-x-1 transition-all duration-300 z-[100] text-sm whitespace-nowrap flex items-center gap-1.5"
        >
          <ArrowLeftIcon />
          Retour
        </button>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex justify-center items-center z-[1000] p-5"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRules(false) }}
        >
          <div className="bg-[#141428]/95 rounded-3xl p-6 sm:p-8 max-w-[600px] w-full max-h-[80vh] overflow-y-auto border border-purple-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-purple-500 before:to-purple-300 before:shadow-[0_0_10px_rgba(108,92,231,0.8)]">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-2xl sm:text-3xl font-bold drop-shadow-[0_2px_10px_rgba(108,92,231,0.5)] flex items-center gap-2.5">
                <BookIcon />
                Règles du Jeu
              </h2>
              <button
                onClick={() => setShowRules(false)}
                className="bg-transparent border-none text-purple-300 text-2xl cursor-pointer w-10 h-10 flex items-center justify-center rounded-full hover:bg-purple-500/20 hover:rotate-90 transition-all duration-300 flex-shrink-0"
              >
                <CloseModalIcon />
              </button>
            </div>

            <ul className="space-y-4">
              {[
                { text: 'Placez votre mise (entre 100 et 1000 XOF)', icon: <CheckIcon /> },
                { text: 'Un objectif aléatoire vous sera assigné (entre 3 et 10 mots à trouver sur 10)', icon: <CheckIcon /> },
                { text: 'Vous avez 10 mots à jouer par partie', icon: <CheckIcon /> },
                { text: 'Vous avez 10 essais par mot', icon: <CheckIcon /> },
                { text: 'Le temps est limité à 20 secondes par mot', icon: <CheckIcon /> },
                { text: 'Chaque lettre correcte révèle ses occurrences dans le mot', icon: <CheckIcon /> },
                { text: 'Chaque lettre incorrecte réduit le nombre d\'essais restants', icon: <CheckIcon /> },
                { text: 'Le jeu passe automatiquement au mot suivant (trouvé ou non)', icon: <CheckIcon /> },
                { text: 'Vous devez atteindre l\'objectif pour gagner !', icon: <CheckIcon />, color: 'text-emerald-400' },
                { text: 'Si vous atteignez l\'objectif : vous doublez votre mise !', icon: <CheckIcon />, color: 'text-emerald-400' },
                { text: 'Si vous n\'atteignez pas l\'objectif : vous perdez votre mise', icon: <CloseIcon />, color: 'text-red-400' }
              ].map((rule, i) => (
                <li key={i} className="text-white text-sm sm:text-base pl-8 relative leading-relaxed">
                  <span className={`absolute left-0 top-0.5 text-lg ${rule.color || ''}`}>
                    {rule.icon}
                  </span>
                  {rule.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Objective Popup */}
      {showObjectivePopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex justify-center items-center z-[2000] p-5">
          <div className="bg-[#141428]/98 rounded-3xl p-6 sm:p-8 md:p-10 max-w-[480px] w-full text-center border-2 border-yellow-400/30 shadow-[0_30px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(255,215,0,0.1)] relative before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-yellow-400 before:via-purple-500 before:to-yellow-400 before:shadow-[0_0_10px_rgba(255,215,0,0.5)]">

            <div className="flex justify-center mb-5">
              <TargetIcon />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Objectif de la Partie
            </h2>

            <p className="text-white/60 text-sm sm:text-base mb-6 leading-relaxed">
              Un objectif aléatoire vous a été attribué. Atteignez-le pour gagner !
            </p>

            <div className="bg-yellow-400/8 rounded-2xl p-5 mb-6 border border-yellow-400/20">
              <div className="text-4xl sm:text-5xl font-extrabold text-yellow-400 mb-2">
                {targetWords} / 10
              </div>
              <div className="text-white/50 text-sm">
                Vous devez trouver <span className="text-yellow-400 font-bold">{targetWords} mots</span> sur les 10 pour remporter la partie
              </div>
            </div>

            <div className="bg-purple-500/10 rounded-2xl p-4 mb-6 border border-purple-500/20">
              <div className="text-white/70 text-sm">
                Mise : <span className="text-white font-bold">{formatNumber(currentBet)} XOF</span>
              </div>
              <div className="text-emerald-400 text-sm mt-1 font-semibold">
                Gain potentiel : {formatNumber(currentBet * 2)} XOF (x2)
              </div>
              <div className="text-white/50 text-sm mt-1">
                Vies restantes : <span className="text-white font-bold">{lives}</span>
              </div>
            </div>

            <button
              onClick={handleStartFromObjective}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold text-lg rounded-2xl shadow-[0_10px_30px_rgba(108,92,231,0.4)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(108,92,231,0.6)] active:translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <PlayIcon />
                  Commencer la partie
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Game Over Popup */}
      {showGameOverPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex justify-center items-center z-[2000] p-5">
          <div className={`bg-[#141428]/98 rounded-3xl p-6 sm:p-8 md:p-10 max-w-[480px] w-full text-center border-2 shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:shadow-[0_0_10px_rgba(255,215,0,0.5)] ${gameOverWin ? 'border-emerald-400/30 before:bg-gradient-to-r before:from-emerald-400 before:via-yellow-400 before:to-emerald-400' : 'border-red-400/30 before:bg-gradient-to-r before:from-red-400 before:via-yellow-400 before:to-red-400'}`}>

            <div className="flex justify-center mb-5">
              {gameOverWin ? <TrophyIcon /> : <SkullIcon />}
            </div>

            <h2 className={`text-2xl sm:text-3xl font-bold mb-3 ${gameOverWin ? 'text-emerald-400' : 'text-red-400'}`}>
              {gameOverWin ? 'Objectif Atteint !' : 'Objectif Non Atteint'}
            </h2>

            <p className="text-white/60 text-sm sm:text-base mb-6 leading-relaxed">
              {gameOverWin
                ? `Félicitations ! Vous avez trouvé ${wordsWon} mots sur 10, atteignant l'objectif de ${targetWords} mots !`
                : `Vous avez trouvé ${wordsWon} mots sur 10. L'objectif était de ${targetWords} mots.`
              }
            </p>

            <div className="bg-white/[0.04] rounded-2xl p-5 mb-6 border border-white/[0.08]">
              <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                <span className="text-white/50 text-sm">Mots trouvés</span>
                <span className="text-white font-bold">{wordsWon} / 10</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                <span className="text-white/50 text-sm">Objectif</span>
                <span className="text-yellow-400 font-bold">{targetWords} / 10</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/50 text-sm">Résultat</span>
                <span className={`font-bold ${gameOverWin ? 'text-emerald-400' : 'text-red-400'}`}>
                  {gameOverWin ? 'GAGNÉ' : 'PERDU'}
                </span>
              </div>
              {gameOverWin && (
                <div className="flex justify-between items-center py-2 mt-2 border-t-2 border-emerald-400/30 pt-3">
                  <span className="text-white/50 text-sm">Gain</span>
                  <span className="text-emerald-400 font-bold text-lg">+{formatNumber(finalWinnings)} XOF</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 mt-2 border-t-2 border-purple-400/30 pt-3">
                <span className="text-white/50 text-sm">Vies restantes</span>
                <span className="text-white font-bold">{lives}</span>
              </div>
            </div>

            <button
              onClick={handleCloseGameOver}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold text-lg rounded-2xl shadow-[0_10px_30px_rgba(108,92,231,0.4)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(108,92,231,0.6)] active:translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2.5"
            >
              <RefreshIcon />
              Nouvelle partie
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-[1200px] mx-auto z-10 relative flex flex-col items-center justify-center min-h-screen py-2.5">

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 sm:mb-10 bg-gradient-to-r from-purple-500 via-purple-300 to-white bg-clip-text text-transparent drop-shadow-[0_5px_15px_rgba(108,92,231,0.5)] tracking-[1px] sm:tracking-[3px] text-center w-full px-2.5 animate-[titleGlow_3s_ease-in-out_infinite_alternate] relative after:absolute after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:w-[min(250px,80%)] after:h-[3px] after:bg-gradient-to-r after:from-transparent after:via-purple-500 after:to-transparent after:rounded-sm">
          Lettricide
        </h1>

        {/* Bet Section */}
        <section
          className={`bg-[#141428]/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 md:p-10 my-5 w-full max-w-[500px] shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] border border-purple-500/30 relative overflow-hidden flex flex-col items-center hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(0,0,0,0.6)] hover:border-purple-500/50 transition-all duration-400 before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-purple-500 before:to-purple-300 before:shadow-[0_0_10px_rgba(108,92,231,0.8)] ${gameStarted ? 'hidden' : 'flex'}`}
        >
          <h2 className="text-white text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center drop-shadow-[0_2px_10px_rgba(108,92,231,0.5)]">
            Placez votre mise
          </h2>

          <div className="flex flex-col gap-4 sm:gap-6 w-full items-center">
            <div className="w-full flex flex-col gap-3">
              <label className="font-semibold text-purple-300 text-base sm:text-lg drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)] text-center">
                Montant de la mise :
              </label>
              <input
                type="number"
                ref={betInputRef}
                min="100"
                max="1000"
                step="10"
                defaultValue="100"
                onChange={(e) => handleBetChange(e.target.value)}
                className="w-full py-3.5 sm:py-4.5 px-5 sm:px-6 border-2 border-transparent rounded-2xl bg-[#0a0a1e]/80 text-white text-lg sm:text-xl font-semibold text-center shadow-[inset_0_4px_15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(108,92,231,0.3)] outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[inset_0_4px_15px_rgba(0,0,0,0.5),0_0_20px_rgba(108,92,231,0.5)] focus:scale-[1.02]"
              />
              <div className="flex justify-between items-center mt-3 p-4 sm:p-5 bg-[#0a0a1e]/60 rounded-2xl border border-purple-500/30 backdrop-blur-md w-full">
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-yellow-400 text-base sm:text-xl font-semibold drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
                    Solde disponible : <span className="font-bold">{formatNumber(balance)} XOF</span>
                  </span>
                  <span className="text-white/60 text-sm">
                    Vies restantes : <span className="text-white font-bold">{lives}</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              disabled={isProcessingBet || loading}
              className="relative w-full max-w-[300px] py-3.5 sm:py-4.5 px-8 sm:px-10 border-none rounded-2xl text-white font-semibold text-base sm:text-lg uppercase tracking-[1.5px] cursor-pointer bg-gradient-to-r from-purple-500 to-purple-300 shadow-[0_10px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_15px_30px_rgba(108,92,231,0.5)] active:translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2.5 mt-4 sm:mt-5 animate-[glow_2s_infinite] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent hover:before:left-full before:transition-all before:duration-700 overflow-hidden"
            >
              {isProcessingBet || loading ? (
                <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Jouer'
              )}
            </button>

            <button
              onClick={() => setShowRules(true)}
              className="w-full max-w-[250px] py-3 sm:py-3.5 px-6 sm:px-8 border-none rounded-2xl text-white font-semibold text-sm sm:text-base uppercase tracking-[1.5px] cursor-pointer bg-gradient-to-r from-purple-300 to-purple-500 shadow-[0_10px_20px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_15px_30px_rgba(108,92,231,0.5)] transition-all duration-300 flex items-center justify-center gap-2 mt-3"
            >
              <BookIcon />
              Règles
            </button>
          </div>
        </section>

        {/* Game Section */}
        {gameStarted && !showObjectivePopup && !showGameOverPopup && (
          <section className="w-full animate-[fadeIn_0.5s_ease]">
            <div className="bg-[#141428]/80 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] w-full max-w-[800px] mx-auto relative overflow-hidden border border-purple-500/30 before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-purple-500 before:to-purple-300 before:shadow-[0_0_10px_rgba(108,92,231,0.8)]">

              {/* Game Info */}
              <div className="flex overflow-x-auto gap-3 sm:gap-4 mb-6 pb-2.5 scrollbar-thin">
                {[
                  { label: `Mise : ${formatNumber(currentBet)} XOF`, color: 'text-purple-300' },
                  { label: `Objectif : ${wordsWon}/${targetWords} mots`, color: 'text-yellow-400 font-bold' },
                  { label: `Solde : ${formatNumber(balance)} XOF`, color: 'text-yellow-400' },
                  { label: `Vies : ${lives}`, color: 'text-emerald-400' }
                ].map((info, i) => (
                  <div
                    key={i}
                    className={`bg-[#0a0a1e]/60 py-3 px-5 sm:px-7 rounded-2xl font-semibold shadow-[inset_0_4px_15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(108,92,231,0.3)] border border-purple-500/30 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:border-purple-500/50 transition-all duration-300 text-white text-sm sm:text-base text-center whitespace-nowrap min-w-fit flex-shrink-0 ${info.color}`}
                  >
                    {info.label}
                  </div>
                ))}
              </div>

              {/* Word Progress */}
              <div className="text-purple-300 text-base sm:text-lg font-semibold text-center mb-4 py-2.5 px-5 bg-[#0a0a1e]/60 rounded-2xl border border-purple-500/30 shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)]">
                Mot {currentWordIndex}/{10}
              </div>

              {/* Timer */}
              <div className={`text-xl sm:text-2xl font-bold text-center my-5 py-3 px-5 bg-[#0a0a1e]/60 rounded-2xl border border-purple-500/30 shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)] hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(108,92,231,0.2)] transition-all duration-300 ${timerWarning ? 'text-red-500 animate-pulse' : 'text-purple-300'}`}>
                Temps restant : <span>{timeLeft}</span>s
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-[#0a0a1e]/60 rounded-full my-5 overflow-hidden shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)] border border-purple-500/30">
                <div
                  className="h-full rounded-full transition-all duration-500 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:animate-[shimmer_2s_infinite]"
                  style={{
                    width: `${progressPercent}%`,
                    background: messageType === 'win'
                      ? '#00b894'
                      : messageType === 'lose'
                        ? '#d63031'
                        : timerWarning
                          ? '#d63031'
                          : 'linear-gradient(90deg, #6c5ce7, #a29bfe)'
                  }}
                />
              </div>

              {/* Word */}
              <div className={`text-2xl sm:text-3xl md:text-4xl tracking-[5px] sm:tracking-[10px] md:tracking-[20px] my-6 sm:my-8 md:my-10 font-bold text-center min-h-[60px] sm:min-h-[80px] flex justify-center items-center py-4 sm:py-6 px-4 bg-[#0a0a1e]/60 rounded-2xl border-2 border-purple-500/30 text-white shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)] drop-shadow-[0_2px_10px_rgba(108,92,231,0.5)] break-words leading-relaxed ${showWordGlow ? 'animate-[glow_0.5s_ease]' : ''}`}>
                {wordDisplay || 'Chargement...'}
              </div>

              {/* Tries Left */}
              <div className="text-purple-300 text-base sm:text-lg font-semibold text-center mb-5 py-3 px-5 bg-[#0a0a1e]/60 rounded-2xl border border-purple-500/30 shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)]">
                Essais restants : {triesLeft}
              </div>

              {/* Letters */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 my-6 p-4 sm:p-5 bg-[#0a0a1e]/40 rounded-2xl border border-purple-500/20">
                {alphabet.map(letter => {
                  const lower = letter.toLowerCase()
                  const isDisabled = disabledButtons.has(lower)
                  const isCorrect = correctButtons.has(lower)
                  const isWrong = wrongButtons.has(lower)

                  return (
                    <button
                      key={letter}
                      disabled={isDisabled}
                      onClick={() => handleLetterClick(letter)}
                      className={`
                        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                        border-none rounded-2xl text-white font-bold text-lg sm:text-xl md:text-2xl
                        cursor-pointer flex items-center justify-center
                        relative overflow-hidden flex-shrink-0
                        shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
                        transition-all duration-300
                        before:absolute before:top-1/2 before:left-1/2 before:w-0 before:h-0 before:rounded-full before:bg-purple-500/20 before:-translate-x-1/2 before:-translate-y-1/2 before:transition-all before:duration-300
                        hover:before:w-full hover:before:h-full
                        hover:-translate-y-1 hover:scale-105 hover:shadow-[0_8px_20px_rgba(108,92,231,0.4)]
                        active:translate-y-0.5
                        ${isCorrect ? '!bg-emerald-500 !text-white !shadow-[0_0_20px_rgba(0,184,148,0.5)] !border-emerald-500/50 animate-[pop_0.3s_ease]' : ''}
                        ${isWrong ? '!bg-red-500 !text-white !shadow-[0_0_20px_rgba(214,48,49,0.5)] !border-red-500/50 animate-[shake_0.3s_ease]' : ''}
                        ${isDisabled && !isCorrect && !isWrong ? '!bg-[#28283c]/80 !text-gray-500 !cursor-not-allowed !transform-none !shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)]' : ''}
                        ${!isDisabled ? 'bg-[#141428]/80 border border-purple-500/20' : ''}
                      `}
                    >
                      {letter}
                    </button>
                  )
                })}
              </div>

              {/* Message */}
              <div className={`
                my-5 font-bold text-base sm:text-xl min-h-[2.5em] text-center py-4 sm:py-5 px-4 rounded-2xl transition-all duration-400 flex items-center justify-center bg-[#0a0a1e]/60 border border-purple-500/30 text-white break-words
                ${messageType === 'win' ? '!bg-emerald-500/20 !text-emerald-400 !border-2 !border-emerald-500 shadow-[0_0_30px_rgba(0,184,148,0.3)] animate-[celebrate_0.5s_ease]' : ''}
                ${messageType === 'lose' ? '!bg-red-500/20 !text-red-400 !border-2 !border-red-500 shadow-[0_0_30px_rgba(214,48,49,0.3)]' : ''}
              `}>
                {message}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}