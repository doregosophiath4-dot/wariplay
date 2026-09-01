'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const CoinsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
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

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const TrophyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const CoinStackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14a9 3 0 0 0 18 0V5" />
    <path d="M3 12a9 3 0 0 0 18 0" />
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const CircleDotIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="8" />
  </svg>
)

const BigTrophyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const SadFaceIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 15s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
)

const LoaderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-white">
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
   TYPES
   ═══════════════════════════════════════════ */

interface ServerQuestion {
  id: number
  index: number
  total: number
  question: string
  options: string[]
  token: string
  time: number
}

type PendingAdvance =
  | { type: 'question'; data: ServerQuestion }
  | { type: 'gameover'; data: any }
  | null

const FEEDBACK_DELAY_MS = 900

class BackgroundParticle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number

  constructor(width: number, height: number) {
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.size = Math.random() * 2 + 1
    this.speedX = Math.random() * 0.3 - 0.15
    this.speedY = Math.random() * 0.3 - 0.15
  }

  update(width: number, height: number) {
    this.x += this.speedX
    this.y += this.speedY
    if (this.x > width) this.x = 0
    if (this.x < 0) this.x = width
    if (this.y > height) this.y = 0
    if (this.y < 0) this.y = height
  }
}

class InteractionParticle {
  x: number
  y: number
  color: string
  size: number
  speedX: number
  speedY: number
  life: number

  constructor(x: number, y: number, color: string) {
    this.x = x
    this.y = y
    this.color = color
    this.size = Math.random() * 4 + 2
    this.speedX = Math.random() * 6 - 3
    this.speedY = Math.random() * 6 - 3
    this.life = 1
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY
    this.speedY += 0.1
    this.life -= 0.02
    this.size *= 0.97
  }
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function SpeedMind() {
  useAuth()
  const [balance, setBalance] = useState(0)
  const [currentBet, setCurrentBet] = useState(100)
  const [isProcessingBet, setIsProcessingBet] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [resultTitle, setResultTitle] = useState('')
  const [resultAmount, setResultAmount] = useState('')
  const [resultMessage, setResultMessage] = useState('')
  const [resultIsWin, setResultIsWin] = useState(false)
  const [choicesDisabled, setChoicesDisabled] = useState(false)
  const [correctChoiceKnown, setCorrectChoiceKnown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [lastGainKnown, setLastGainKnown] = useState(0)
  const [lastWasCorrect, setLastWasCorrect] = useState<boolean | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)

  const [serverQuestion, setServerQuestion] = useState<ServerQuestion | null>(null)
  const [totalGained, setTotalGained] = useState(0)
  const [goodCount, setGoodCount] = useState(0)
  const [badCount, setBadCount] = useState(0)

  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)
  const bgParticlesRef = useRef<BackgroundParticle[]>([])
  const interactionParticlesRef = useRef<InteractionParticle[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animFrameBgRef = useRef<number>(0)
  const animFrameParticleRef = useRef<number>(0)
  const betInputRef = useRef<HTMLInputElement>(null)

  // WebSocket refs
  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef<boolean>(false)
  const pendingResolveRef = useRef<((data: any) => void) | null>(null)
  const pendingRejectRef = useRef<((error: Error) => void) | null>(null)

  // Référence stable vers la question courante pour éviter les races de closure
  const serverQuestionRef = useRef<ServerQuestion | null>(null)
  const answerLockRef = useRef<boolean>(false)

  // Gestion du délai d'affichage du feedback (vert/rouge) avant la question suivante
  const showingFeedbackRef = useRef<boolean>(false)
  const pendingAdvanceRef = useRef<PendingAdvance>(null)
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null)

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

  const openWebSocket = useCallback((): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (wsRef.current && wsReadyRef.current) {
        resolve()
        return
      }

      closeWebSocket()

      const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
      const wsUrl = proto + window.location.host + '/ws/Smind'

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      const t = setTimeout(() => {
        closeWebSocket()
        reject(new Error('Timeout WebSocket'))
      }, 10000)

      ws.onopen = async () => {
        try {
          await initAll()
          const authMessage = await prepareWSAuthMessage()
          ws.send(JSON.stringify(authMessage))
        } catch (error) {
          clearTimeout(t)
          closeWebSocket()
          reject(error)
        }
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

          if (d.type === 'question') {
            if (showingFeedbackRef.current) {
              pendingAdvanceRef.current = { type: 'question', data: d as ServerQuestion }
            } else {
              handleServerQuestion(d as ServerQuestion)
            }
          } else if (d.type === 'result') {
            handleServerResult(d)
          } else if (d.type === 'game_over') {
            if (showingFeedbackRef.current) {
              pendingAdvanceRef.current = { type: 'gameover', data: d }
            } else {
              handleServerGameOver(d)
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
          reject(er)
        }
      }

      ws.onerror = () => {
        clearTimeout(t)
        closeWebSocket()
        reject(new Error('Erreur WebSocket'))
      }

      ws.onclose = () => {
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

  const sendWebSocketMessage = useCallback(async (msg: any): Promise<any> => {
    await openWebSocket()

    return new Promise((resolve, reject) => {
      if (!wsRef.current || !wsReadyRef.current) {
        reject(new Error('Non connecté'))
        return
      }

      const t = setTimeout(() => {
        pendingResolveRef.current = null
        pendingRejectRef.current = null
        reject(new Error('Timeout message'))
      }, 15000)

      pendingResolveRef.current = (d) => {
        clearTimeout(t)
        resolve(d)
      }

      pendingRejectRef.current = (er) => {
        clearTimeout(t)
        reject(er)
      }

      wsRef.current!.send(JSON.stringify(msg))
    })
  }, [openWebSocket])

  /* ── HTTP Requests ───────────────────────────────────── */
  const fetchBalance = useCallback(async () => {
    setIsLoading(true)
    setLoadingMessage('Chargement du solde...')

    try {
      const response = await fetchWithAllTokens('/api/get_lettricide_solde')
      const data = await response.json()
      setBalance(data.solde)
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setIsLoading(false)
    }
  }, [])

  const placeBetOnServer = useCallback(async (bet: number) => {
    setIsLoading(true)
    setLoadingMessage('Placement de la mise...')

    try {
      const response = await fetchWithAllTokens('/api/cherif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet: bet })
      })
      const data = await response.json()
      setBalance(data.new_solde)
      return true
    } catch (error) {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  /* ── Canvas ──────────────────────────────────────────── */
  const resizeCanvas = useCallback(() => {
    const bgCanvas = bgCanvasRef.current
    const particleCanvas = particleCanvasRef.current
    if (bgCanvas) { bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight }
    if (particleCanvas) { particleCanvas.width = window.innerWidth; particleCanvas.height = window.innerHeight }
  }, [])

  const createParticles = useCallback((x: number, y: number, count: number, color: string) => {
    for (let i = 0; i < count; i++) {
      interactionParticlesRef.current.push(new InteractionParticle(x, y, color))
    }
  }, [])

  /* ── Timer local (affichage seulement — le serveur fait autorité) ─ */
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startLocalTimer = useCallback((seconds: number) => {
    clearTimer()
    setTimeLeft(seconds)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer])

  /* ── Gestion des messages serveur ─────────────────────── */
  const handleServerQuestion = useCallback((q: ServerQuestion) => {
    serverQuestionRef.current = q
    answerLockRef.current = false
    setServerQuestion(q)
    setChoicesDisabled(false)
    setSelectedIndex(-1)
    setCorrectChoiceKnown(false)
    setLastWasCorrect(null)
    startLocalTimer(q.time)
  }, [startLocalTimer])

  const handleServerGameOver = useCallback((d: any) => {
    clearTimer()
    setGameEnded(true)
    setChoicesDisabled(true)
    setGoodCount(d.good)
    setBadCount(d.bad)

    setTotalGained((currentTotal) => {
      const won = currentTotal > 0
      if (won) {
        setResultTitle('FELICITATIONS !')
        setResultAmount(`+${currentTotal} XOF`)
        setResultMessage(`${d.good}/${d.good + d.bad} bonnes reponses - Gain total : ${currentTotal} XOF`)
        setResultIsWin(true)
      } else {
        setResultTitle('DOMMAGE...')
        setResultAmount(`0 XOF`)
        setResultMessage(`${d.good}/${d.good + d.bad} bonnes reponses - Aucun gain`)
        setResultIsWin(false)
      }
      return currentTotal
    })

    setShowResult(true)
  }, [clearTimer])

  const handleServerResult = useCallback((d: any) => {
    clearTimer()
    setChoicesDisabled(true)
    setCorrectChoiceKnown(true)
    setLastWasCorrect(d.status === 'correct')
    setGoodCount(d.good)
    setBadCount(d.bad)
    if (d.status === 'correct' && d.gain > 0) {
      setLastGainKnown(d.gain)
      setTotalGained((prev) => prev + d.gain)
      setBalance((prev) => prev + d.gain)
    } else {
      setLastGainKnown(0)
    }

    showingFeedbackRef.current = true
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = setTimeout(() => {
      showingFeedbackRef.current = false
      feedbackTimerRef.current = null
      const pending = pendingAdvanceRef.current
      pendingAdvanceRef.current = null
      if (pending) {
        if (pending.type === 'question') {
          handleServerQuestion(pending.data)
        } else if (pending.type === 'gameover') {
          handleServerGameOver(pending.data)
        }
      }
    }, FEEDBACK_DELAY_MS)
  }, [clearTimer, handleServerQuestion, handleServerGameOver])

  /* ── Game Logic ──────────────────────────────────────── */
  const handleAnswer = useCallback(async (index: number, buttonElement?: HTMLElement) => {
    const q = serverQuestionRef.current
    if (!q || gameEnded || choicesDisabled || answerLockRef.current) return

    answerLockRef.current = true
    setChoicesDisabled(true)
    setSelectedIndex(index)

    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      createParticles(x, y, 12, '#4cc9f0')
    }

    try {
      await sendWebSocketMessage({
        action: 'answer',
        id: q.id,
        token: q.token,
        choice: index
      })
    } catch (error) {
      answerLockRef.current = false
      setChoicesDisabled(false)
    }
  }, [gameEnded, choicesDisabled, createParticles, sendWebSocketMessage])

  const handleStartGame = useCallback(async () => {
    if (isProcessingBet) return

    const bet = parseInt(betInputRef.current?.value ?? '100')

    if (isNaN(bet) || bet < 100 || bet > 1000) {
      alert("La mise doit etre entre 100 et 1000 XOF")
      return
    }
    if (bet > balance) {
      alert("Solde insuffisant")
      return
    }

    setIsProcessingBet(true)
    setIsLoading(true)
    setLoadingMessage('Connexion au serveur...')

    try {
      const betSuccessful = await placeBetOnServer(bet)
      if (!betSuccessful) {
        alert("Erreur lors du placement de la mise")
        setIsProcessingBet(false)
        setIsLoading(false)
        return
      }

      setLoadingMessage('Démarrage du jeu...')

      setCurrentBet(bet)
      setGameEnded(false)
      setChoicesDisabled(false)
      setSelectedIndex(-1)
      setCorrectChoiceKnown(false)
      setLastWasCorrect(null)
      setLastGainKnown(0)
      setTotalGained(0)
      setGoodCount(0)
      setBadCount(0)
      setServerQuestion(null)
      serverQuestionRef.current = null
      answerLockRef.current = false
      showingFeedbackRef.current = false
      pendingAdvanceRef.current = null
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
        feedbackTimerRef.current = null
      }

      await sendWebSocketMessage({
        action: 'start_game',
        bet: bet
      })

      setBalance((prev) => prev - bet)
      setGameStarted(true)
    } catch (error) {
      alert("Erreur, reessayez.")
    } finally {
      setIsProcessingBet(false)
      setIsLoading(false)
    }
  }, [isProcessingBet, balance, placeBetOnServer, sendWebSocketMessage])

  const handlePlayAgain = useCallback(() => {
    setShowResult(false)
    setGameStarted(false)
    setGameEnded(false)
    setServerQuestion(null)
    serverQuestionRef.current = null
    setChoicesDisabled(false)
    setSelectedIndex(-1)
    setCorrectChoiceKnown(false)
    setLastWasCorrect(null)
    setLastGainKnown(0)
    setTotalGained(0)
    setGoodCount(0)
    setBadCount(0)
    showingFeedbackRef.current = false
    pendingAdvanceRef.current = null
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current)
      feedbackTimerRef.current = null
    }
    clearTimer()
  }, [clearTimer])

  const updateBet = useCallback((value: number) => {
    let bet = value
    if (isNaN(bet)) bet = 100
    if (bet > 1000) bet = 1000
    if (bet < 100) bet = 100
    setCurrentBet(bet)
    if (betInputRef.current) betInputRef.current.value = bet.toString()
  }, [])

  /* ── Effects ─────────────────────────────────────────── */
  useEffect(() => {
    fetchBalance()

    resizeCanvas()
    for (let i = 0; i < 60; i++) bgParticlesRef.current.push(new BackgroundParticle(window.innerWidth, window.innerHeight))

    const animateBg = () => {
      const canvas = bgCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = 'rgba(12, 15, 30, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      bgParticlesRef.current.forEach((p) => {
        p.update(canvas.width, canvas.height)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
      })
      animFrameBgRef.current = requestAnimationFrame(animateBg)
    }

    const animateParticles = () => {
      const canvas = particleCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = interactionParticlesRef.current.length - 1; i >= 0; i--) {
        const p = interactionParticlesRef.current[i]
        p.update()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        if (p.life <= 0) interactionParticlesRef.current.splice(i, 1)
      }
      animFrameParticleRef.current = requestAnimationFrame(animateParticles)
    }

    animateBg()
    animateParticles()

    const handleResize = () => resizeCanvas()
    window.addEventListener('resize', handleResize)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowRules(false)
        setShowResult(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(animFrameBgRef.current)
      cancelAnimationFrame(animFrameParticleRef.current)
      clearTimer()
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
      closeWebSocket()
    }
  }, [resizeCanvas, clearTimer, fetchBalance, closeWebSocket])

  /* ── Derived ─────────────────────────────────────────── */
  const progressWidth = serverQuestion ? ((serverQuestion.index - 1) / serverQuestion.total) * 100 : 0

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative w-full h-screen overflow-hidden fixed inset-0 font-['Poppins',sans-serif] bg-gradient-to-br from-[#0c0f1e] to-[#1a1b2e] text-white flex flex-col items-center justify-center p-5">

      <canvas ref={bgCanvasRef} className="fixed inset-0 w-full h-full z-[1] pointer-events-none" />
      <canvas ref={particleCanvasRef} className="fixed inset-0 w-full h-full z-[2] pointer-events-none" />

      {isLoading && (
        <div className="fixed inset-0 bg-[#0c0f1e]/90 backdrop-blur-xl flex flex-col items-center justify-center z-[5000]">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.4)] animate-pulse mb-8">
            <LoaderIcon />
          </div>
          <p className="text-lg font-semibold text-white/90 mb-6 animate-pulse">
            {loadingMessage}
          </p>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 animate-[shimmer_1.5s_ease-in-out_infinite]"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-[500px] relative z-10 flex flex-col items-center">

        <div className="text-center mb-7 sm:mb-8 w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2.5 bg-gradient-to-r from-pink-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-['Montserrat',sans-serif] leading-tight">
            SPEED MIND
          </h1>
          <p className="text-sm sm:text-base text-white/70 font-light">
            Testez vos connaissances et gagnez a chaque bonne reponse !
          </p>
        </div>

        {!gameStarted && (
          <div className="w-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] rounded-2xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] mb-5 relative before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-pink-500 before:via-blue-500 before:to-cyan-400 before:rounded-t-2xl">

            <div className="flex justify-between items-center mb-6 bg-black/30 py-3.5 px-4 rounded-2xl border border-white/[0.1]">
              <div className="text-lg sm:text-xl font-bold text-cyan-400 flex items-center gap-2">
                <CoinsIcon />
                Solde : {balance} XOF
              </div>
              <button
                onClick={() => setShowRules(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-700 border-none text-white py-2.5 px-5 rounded-xl font-semibold cursor-pointer flex items-center gap-2 text-sm hover:scale-[0.98] active:scale-95 transition-transform duration-200"
              >
                <BookIcon />
                Regles
              </button>
            </div>

            <div className="w-full">
              <div className="mb-6">
                <label className="block text-base sm:text-lg mb-3 text-white/90 font-medium text-center">
                  Montant de votre mise :
                </label>
                <input
                  type="number"
                  ref={betInputRef}
                  defaultValue="100"
                  min="100"
                  max="1000"
                  step="10"
                  placeholder="Entrez votre mise"
                  onChange={(e) => updateBet(parseInt(e.target.value) || 100)}
                  className="w-full bg-black/30 border-2 border-white/[0.1] rounded-xl py-4.5 px-4 text-xl sm:text-2xl text-white font-semibold text-center outline-none transition-all duration-300 focus:border-blue-500"
                />
                <div className="mt-2.5 text-white/60 text-xs sm:text-sm text-center">
                  Mise minimale : 100 XOF | Mise maximale : 1000 XOF
                </div>
              </div>

              <button
                onClick={handleStartGame}
                disabled={isProcessingBet || currentBet > balance}
                className="relative w-full bg-gradient-to-r from-pink-500 to-pink-700 border-none text-white py-5 text-lg sm:text-xl font-bold rounded-xl cursor-pointer hover:scale-[0.98] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-transform duration-200 mt-2.5 overflow-hidden"
              >
                <span className={`transition-opacity duration-300 ${isProcessingBet ? 'opacity-0' : 'opacity-100'}`}>
                  COMMENCER LE JEU
                </span>
                {isProcessingBet && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                )}
              </button>
            </div>
          </div>
        )}

        {gameStarted && serverQuestion && (
          <div className="w-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] rounded-2xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] relative before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-pink-500 before:via-blue-500 before:to-cyan-400 before:rounded-t-2xl">

            <div className="flex mb-6 gap-4 overflow-x-auto pb-1.5 scrollbar-thin">
              <div className="flex-shrink-0 min-w-[110px] sm:min-w-[120px] bg-black/30 py-3.5 px-4 rounded-xl border border-white/[0.1] flex items-center justify-center gap-2 font-semibold" style={{ color: timeLeft <= 3 ? '#ef233c' : '#ff80ab' }}>
                <ClockIcon />
                {timeLeft}s
              </div>
              <div className="flex-shrink-0 min-w-[110px] sm:min-w-[120px] bg-black/30 py-3.5 px-4 rounded-xl border border-white/[0.1] flex items-center justify-center gap-2 font-semibold text-cyan-400">
                <TrophyIcon />
                {goodCount}/{goodCount + badCount}
              </div>
              <div className="flex-shrink-0 min-w-[110px] sm:min-w-[120px] bg-black/30 py-3.5 px-4 rounded-xl border border-white/[0.1] flex items-center justify-center gap-2 font-semibold text-yellow-400">
                <CoinStackIcon />
                {totalGained} XOF
              </div>
            </div>

            <div className="w-full h-2 bg-white/[0.1] rounded mb-7 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-blue-500 rounded transition-all duration-400"
                style={{ width: `${gameEnded ? 100 : progressWidth}%` }}
              />
            </div>

            <div className="mb-7">
              <div className="text-pink-400 font-semibold text-xs sm:text-sm uppercase tracking-[1px] mb-2.5">
                Question {serverQuestion.index}/{serverQuestion.total}
              </div>
              <div className="text-xl sm:text-2xl font-semibold leading-relaxed">
                {serverQuestion.question}
              </div>
              {correctChoiceKnown && (
                <div className={`mt-3 text-sm font-semibold ${lastWasCorrect ? 'text-cyan-400' : 'text-red-400'}`}>
                  {lastWasCorrect ? `Bonne reponse ! +${lastGainKnown} XOF` : 'Mauvaise reponse'}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3.5 mb-5">
              {serverQuestion.options.map((option, index) => (
                <button
                  key={`${serverQuestion.id}-${index}`}
                  disabled={choicesDisabled || gameEnded}
                  onClick={(e) => handleAnswer(index, e.currentTarget)}
                  className={`w-full bg-white/[0.05] border border-white/[0.1] text-white py-4.5 px-4 rounded-xl text-base sm:text-lg text-left cursor-pointer font-medium transition-all duration-200 hover:bg-white/[0.1] active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-80 flex items-center gap-2.5
                    ${correctChoiceKnown && index === selectedIndex && lastWasCorrect ? '!bg-cyan-400/20 !border-cyan-400 !text-white' : ''}
                    ${correctChoiceKnown && index === selectedIndex && !lastWasCorrect ? '!bg-red-500/20 !border-red-500 !text-white' : ''}
                  `}
                >
                  <CircleDotIcon />
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showRules && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1000] flex items-center justify-center p-5 transition-opacity duration-300"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRules(false) }}
        >
          <div className="bg-[#1a1b2e] rounded-2xl p-6 sm:p-8 max-w-[450px] w-full max-h-[85vh] overflow-y-auto border border-white/[0.15] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">

            <button
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 bg-white/[0.1] border-none w-9 h-9 rounded-full text-white/70 text-xl cursor-pointer flex items-center justify-center hover:bg-white/[0.2] hover:text-white transition-all duration-200"
            >
              <CloseIcon />
            </button>

            <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-center bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Regles du jeu
            </h2>

            <div className="text-white/80 leading-relaxed text-sm sm:text-base">
              <p className="mb-4">Bienvenue dans Speed Mind ! Voici comment jouer :</p>
              <ul className="space-y-3 mb-4">
                <li className="pl-5 relative before:content-['•'] before:text-pink-500 before:absolute before:left-0 before:text-xl">
                  <strong>Mise :</strong> Entrez un montant entre 100 et 1000 XOF
                </li>
                <li className="pl-5 relative before:content-['•'] before:text-pink-500 before:absolute before:left-0 before:text-xl">
                  <strong>Objectif :</strong> Repondez a une serie de questions, chacune avec un temps limite
                </li>
                <li className="pl-5 relative before:content-['•'] before:text-pink-500 before:absolute before:left-0 before:text-xl">
                  <strong>Gains :</strong> Chaque bonne reponse rapporte un gain immediat, credite directement sur votre solde
                </li>
                <li className="pl-5 relative before:content-['•'] before:text-pink-500 before:absolute before:left-0 before:text-xl">
                  <strong>Mauvaise reponse ou temps ecoule :</strong> Aucun gain pour cette question, la partie continue
                </li>
              </ul>
              <p>Bonne chance et que le meilleur gagne !</p>
            </div>
          </div>
        </div>
      )}

      {showResult && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1000] flex items-center justify-center p-5 transition-opacity duration-300"
          onClick={(e) => { if (e.target === e.currentTarget) setShowResult(false) }}
        >
          <div className="bg-[#1a1b2e] rounded-2xl p-6 sm:p-8 max-w-[450px] w-full max-h-[85vh] overflow-y-auto border border-white/[0.15] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">

            <button
              onClick={() => setShowResult(false)}
              className="absolute top-4 right-4 bg-white/[0.1] border-none w-9 h-9 rounded-full text-white/70 text-xl cursor-pointer flex items-center justify-center hover:bg-white/[0.2] hover:text-white transition-all duration-200"
            >
              <CloseIcon />
            </button>

            <h2 className={`text-2xl sm:text-3xl font-bold mb-5 text-center bg-gradient-to-r ${resultIsWin ? 'from-pink-400 to-cyan-400' : 'from-red-400 to-pink-400'} bg-clip-text text-transparent`}>
              {resultTitle}
            </h2>

            <div className="text-center py-5">
              <div className="text-5xl sm:text-6xl mb-5 flex justify-center">
                {resultIsWin ? <BigTrophyIcon /> : <SadFaceIcon />}
              </div>

              <div className="text-3xl sm:text-4xl font-extrabold my-5 bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                {resultAmount}
              </div>

              <div className="text-base sm:text-lg text-white/80 mb-6 leading-relaxed">
                {resultMessage}
              </div>

              <button
                onClick={handlePlayAgain}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-700 border-none text-white py-4 text-base sm:text-lg font-semibold rounded-xl cursor-pointer hover:scale-[0.98] active:scale-95 transition-transform duration-200 flex items-center justify-center gap-2"
              >
                <RefreshIcon />
                JOUER A NOUVEAU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}