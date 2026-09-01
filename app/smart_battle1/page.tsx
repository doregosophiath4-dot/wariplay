'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const BrainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
    <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
    <path d="M6 18a4 4 0 0 1-1.967-.516" />
    <path d="M19.967 17.484A4 4 0 0 1 18 18" />
  </svg>
)

const CoinsIcon = ({ className = "text-cyan-400" }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const WalletIcon = ({ className = "text-cyan-400" }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
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

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const FlaskIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6" />
    <path d="M10 3v6.47a8 8 0 0 1-2.36 5.66L3 20h18l-4.64-4.87A8 8 0 0 1 14 9.47V3" />
  </svg>
)

const BookOpenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const CalculatorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="8" y2="10.01" />
    <line x1="12" y1="10" x2="12" y2="10.01" />
    <line x1="16" y1="10" x2="16" y2="10.01" />
    <line x1="8" y1="14" x2="8" y2="14.01" />
    <line x1="12" y1="14" x2="12" y2="14.01" />
    <line x1="16" y1="14" x2="16" y2="14.01" />
    <line x1="8" y1="18" x2="12" y2="18" />
  </svg>
)

const LandmarkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
)

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
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

const CloseCircleIcon = ({ className = "text-red-400" }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const CircleIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="opacity-70">
    <circle cx="12" cy="12" r="10" />
  </svg>
)

const LoaderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-white">
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

interface QuestionItem {
  id: string
  question: string
  options: string[]
  correct: number
  discipline: string
  points: number
}

interface Discipline {
  name: string
  value: string
  color: string
  points: number
  icon: JSX.Element
  gradient: string
  glowColor: string
}

/**
 * L'objectif est désormais entièrement piloté par le backend.
 * Le frontend se contente d'afficher ce que le serveur envoie via
 * l'événement { type: "objective", target_score, description }.
 */
interface GameObjective {
  targetScore: number
  description: string
}

interface GameStats {
  total: number
  correct: number
  wrong: number
  score: number
  categories: Record<string, { correct: number; total: number }>
}

/* ═══════════════════════════════════════════
   DISCIPLINES (AFFICHAGE)
   ═══════════════════════════════════════════ */

const DISCIPLINES: Discipline[] = [
  { name: "Science", value: "science", color: "#00D4FF", points: 4, icon: <FlaskIcon />, gradient: "from-cyan-400 to-cyan-600", glowColor: "rgba(0, 212, 255, 0.4)" },
  { name: "Litterature", value: "litterature", color: "#7C4DFF", points: 3, icon: <BookOpenIcon />, gradient: "from-purple-500 to-purple-800", glowColor: "rgba(124, 77, 255, 0.4)" },
  { name: "Mathematiques", value: "maths", color: "#FF4081", points: 2, icon: <CalculatorIcon />, gradient: "from-pink-500 to-pink-700", glowColor: "rgba(255, 64, 129, 0.4)" },
  { name: "Histoire", value: "histoire", color: "#FF9100", points: 1, icon: <LandmarkIcon />, gradient: "from-orange-500 to-orange-700", glowColor: "rgba(255, 145, 0, 0.4)" }
]

const CATEGORY_POINTS_MAP: Record<string, number> = {
  science: 4,
  litterature: 3,
  maths: 2,
  histoire: 1
}

const CATEGORIES_ORDER = ["science", "litterature", "maths", "histoire"]

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function SmartBattle() {
  useAuth()
  const [currentCategory, setCurrentCategory] = useState<string>('')
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(30)
  const [categoryTimer, setCategoryTimer] = useState(30)
  const [gameFinished, setGameFinished] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<QuestionItem | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [timerWarning, setTimerWarning] = useState(false)
  const [timerDanger, setTimerDanger] = useState(false)

  const [showBetModal, setShowBetModal] = useState(true)
  const [showResultModal, setShowResultModal] = useState(false)
  const [betAmount, setBetAmount] = useState(100)
  const [betError, setBetError] = useState('')

  const [objectiveAchieved, setObjectiveAchieved] = useState(false)
  const [finalWinnings, setFinalWinnings] = useState(0)
  const [playerBalance, setPlayerBalance] = useState(0)
  const [gameStats, setGameStats] = useState<GameStats>({
    total: 0, correct: 0, wrong: 0, score: 0, categories: {}
  })

  // Objectif reçu depuis le backend (source de vérité). Null tant qu'il n'a pas été reçu.
  const [objective, setObjective] = useState<GameObjective | null>(null)
  // Indique si l'objectif est en train d'être atteint, mis à jour en direct via les events "result"
  const [objectiveReached, setObjectiveReached] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const betInputRef = useRef<HTMLInputElement>(null)
  const gameStatsRef = useRef<GameStats>({ total: 0, correct: 0, wrong: 0, score: 0, categories: {} })
  const gameFinishedRef = useRef(false)
  const gameActiveRef = useRef(false)
  const currentCategoryRef = useRef('')
  const currentQuestionRef = useRef<QuestionItem | null>(null)
  const currentTokenRef = useRef<string | null>(null)
  const betAmountRef = useRef(100)
  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef(false)

  useEffect(() => { gameStatsRef.current = gameStats }, [gameStats])
  useEffect(() => { gameFinishedRef.current = gameFinished }, [gameFinished])
  useEffect(() => { currentCategoryRef.current = currentCategory }, [currentCategory])
  useEffect(() => { currentQuestionRef.current = currentQuestion }, [currentQuestion])
  useEffect(() => { betAmountRef.current = betAmount }, [betAmount])

  const currentDiscipline = DISCIPLINES.find(d => d.value === currentCategory) || DISCIPLINES[0]
  const currentCategoryIndex = Math.max(0, CATEGORIES_ORDER.indexOf(currentCategory))
  const totalCategories = CATEGORIES_ORDER.length
  const questionsCompleted = currentCategoryIndex + (categoryTimer > 0 ? (categoryTimer - timer) / categoryTimer : 0)
  const formatNumber = (num: number): string => num.toLocaleString('fr-FR')

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startTimer = useCallback((seconds: number) => {
    clearTimer()
    setTimer(seconds)
    setTimerWarning(seconds <= 10 && seconds > 5)
    setTimerDanger(seconds <= 5 && seconds > 0)
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        const newTime = prev - 1
        if (newTime <= 10 && newTime > 5) setTimerWarning(true)
        else if (newTime <= 5 && newTime > 0) { setTimerWarning(false); setTimerDanger(true) }
        if (newTime <= 0) {
          clearTimer()
          handleTimeout()
          return 0
        }
        return newTime
      })
    }, 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimer])

  const handleTimeout = useCallback(() => {
    if (gameFinishedRef.current || !gameActiveRef.current) return
    if (selectedAnswer !== null) return
    const q = currentQuestionRef.current
    if (q && currentTokenRef.current && wsRef.current && wsReadyRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'answer', question_id: q.id, selected: -1, token: currentTokenRef.current }))
    }
    setSelectedAnswer(-1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnswer])

  const closeWebSocket = useCallback(() => {
    wsReadyRef.current = false
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
  }, [])

  const sendWSMessage = useCallback((msg: any): boolean => {
    if (!wsRef.current || !wsReadyRef.current) return false
    wsRef.current.send(JSON.stringify(msg))
    return true
  }, [])

  const handleServerEvent = useCallback((data: any) => {
    switch (data.type) {
      // Le backend annonce l'objectif de la partie (source de vérité)
      case 'objective':
        setObjective({
          targetScore: data.target_score,
          description: data.description || `Obtenez plus de ${data.target_score} points au score total pour gagner`
        })
        setObjectiveReached(false)
        break

      case 'category_start':
        setCurrentCategory(data.category)
        setCategoryTimer(data.duration)
        setTimer(data.duration)
        setTimerWarning(false)
        setTimerDanger(false)
        break

      case 'question': {
        const timeLeft = typeof data.remaining === 'number' ? Math.max(0, Math.ceil(data.remaining)) : categoryTimer
        const q: QuestionItem = {
          id: data.data.id,
          question: data.data.question,
          options: data.data.options,
          correct: -1,
          discipline: data.category,
          points: CATEGORY_POINTS_MAP[data.category] ?? 1
        }
        currentQuestionRef.current = q
        currentTokenRef.current = data.token
        setCurrentQuestion(q)
        setSelectedAnswer(null)
        setIsCorrect(null)
        setIsTransitioning(false)
        startTimer(timeLeft)
        break
      }

      case 'result': {
        clearTimer()
        const cat = currentCategoryRef.current
        const prevStats = gameStatsRef.current
        const newCategories = { ...prevStats.categories }
        if (!newCategories[cat]) newCategories[cat] = { correct: 0, total: 0 }
        newCategories[cat] = {
          correct: newCategories[cat].correct + (data.correct ? 1 : 0),
          total: newCategories[cat].total + 1
        }
        const newStats: GameStats = {
          total: data.stats?.total ?? prevStats.total + 1,
          correct: data.stats?.correct ?? prevStats.correct + (data.correct ? 1 : 0),
          wrong: data.stats?.wrong ?? prevStats.wrong + (data.correct ? 0 : 1),
          score: data.score ?? prevStats.score,
          categories: newCategories
        }
        gameStatsRef.current = newStats
        setGameStats(newStats)
        setScore(newStats.score)
        setIsCorrect(!!data.correct)
        setIsTransitioning(true)
        // Le backend indique en direct si l'objectif vient d'être atteint
        if (typeof data.objective_reached === 'boolean') {
          setObjectiveReached(data.objective_reached)
        }
        break
      }

      case 'category_end':
        clearTimer()
        setIsTransitioning(true)
        break

      case 'game_over': {
        clearTimer()
        gameFinishedRef.current = true
        gameActiveRef.current = false
        setGameFinished(true)
        setIsTransitioning(false)
        const mergedStats: GameStats = {
          total: data.stats?.total ?? gameStatsRef.current.total,
          correct: data.stats?.correct ?? gameStatsRef.current.correct,
          wrong: data.stats?.wrong ?? gameStatsRef.current.wrong,
          score: data.score ?? data.stats?.score ?? gameStatsRef.current.score,
          categories: gameStatsRef.current.categories
        }
        gameStatsRef.current = mergedStats
        setGameStats(mergedStats)
        setScore(mergedStats.score)
        const won = !!data.winner
        const gain = data.gain || 0
        setObjectiveAchieved(won)
        setObjectiveReached(won)
        setFinalWinnings(gain)
        setPlayerBalance((prev) => won ? prev + gain : prev - betAmountRef.current)
        setShowResultModal(true)
        closeWebSocket()
        break
      }

      case 'error':
        setBetError(data.message || 'Erreur serveur')
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryTimer, clearTimer, closeWebSocket, startTimer])

  const openWebSocket = useCallback((): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (wsRef.current && wsReadyRef.current) { resolve(); return }
      closeWebSocket()

      const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
      const ws = new WebSocket(proto + window.location.host + '/ws/sbattle')
      wsRef.current = ws

      const timeout = setTimeout(() => { closeWebSocket(); reject(new Error('Timeout connexion')) }, 10000)

      ws.onopen = async () => {
        try {
          await initAll()
          const authMessage = await prepareWSAuthMessage()
          ws.send(JSON.stringify(authMessage))
        } catch (err) {
          clearTimeout(timeout)
          reject(err)
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'auth_success') { clearTimeout(timeout); wsReadyRef.current = true; resolve(); return }
          handleServerEvent(data)
        } catch (err) { /* ignore parse errors */ }
      }

      ws.onerror = () => { clearTimeout(timeout); closeWebSocket(); reject(new Error('Erreur connexion')) }
      ws.onclose = () => { wsReadyRef.current = false; wsRef.current = null }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeWebSocket, handleServerEvent])

  const fetchGameData = useCallback(async () => {
    const response = await fetchWithAllTokens('/api/get_lettricide_solde')
    if (!response || !response.ok) throw new Error('Erreur chargement solde')
    const data = await response.json()
    setPlayerBalance(data.solde)
  }, [])

  const placeBetOnServer = useCallback(async (betAmount: number) => {
    const response = await fetchWithAllTokens('/api/cherif', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet: betAmount })
    })
    if (!response || !response.ok) throw new Error('Erreur serveur')
    const data = await response.json()
    if (!data.success) throw new Error(data.error || 'Erreur mise')
    return data
  }, [])

  const handleAnswer = useCallback((_correct: boolean, index: number) => {
    if (selectedAnswer !== null) return
    if (gameFinishedRef.current || !gameActiveRef.current) return
    const q = currentQuestionRef.current
    if (!q || !currentTokenRef.current) return
    clearTimer()
    setSelectedAnswer(index)
    sendWSMessage({ type: 'answer', question_id: q.id, selected: index, token: currentTokenRef.current })
  }, [selectedAnswer, clearTimer, sendWSMessage])

  const handleStartGame = useCallback(async () => {
    const bet = parseInt(betInputRef.current?.value || '100')
    if (isNaN(bet) || bet < 100) { setBetError('Mise minimum : 100 XOF'); return }
    if (bet > playerBalance) { setBetError('Solde insuffisant'); return }

    setIsLoading(true)
    setLoadingMessage('Placement de la mise...')
    setBetError('')

    try {
      const betResult = await placeBetOnServer(bet)
      setBetAmount(bet)
      betAmountRef.current = bet
      setPlayerBalance(betResult.new_solde)
      setShowBetModal(false)

      setLoadingMessage('Connexion au serveur...')
      await openWebSocket()

      gameStatsRef.current = { total: 0, correct: 0, wrong: 0, score: 0, categories: {} }
      gameFinishedRef.current = false
      setGameStats(gameStatsRef.current)
      setGameFinished(false)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setScore(0)
      setTimerWarning(false)
      setTimerDanger(false)
      setIsTransitioning(false)
      setShowResultModal(false)
      setCurrentCategory('')
      setCurrentQuestion(null)
      setObjective(null)
      setObjectiveReached(false)

      gameActiveRef.current = true
      setLoadingMessage('Démarrage de la partie...')
      if (!sendWSMessage({ type: 'start', bet })) throw new Error('Connexion perdue')
      setIsLoading(false)
      setLoadingMessage('')
    } catch (error: any) {
      setBetError(error.message || 'Erreur')
      setIsLoading(false)
      setLoadingMessage('')
      gameActiveRef.current = false
    }
  }, [playerBalance, placeBetOnServer, openWebSocket, sendWSMessage])

  const handleReplay = useCallback(() => {
    clearTimer()
    closeWebSocket()
    gameActiveRef.current = false
    gameFinishedRef.current = false
    currentQuestionRef.current = null
    currentTokenRef.current = null
    currentCategoryRef.current = ''
    setShowResultModal(false)
    setGameFinished(false)
    setCurrentCategory('')
    setCurrentQuestion(null)
    setScore(0)
    setGameStats({ total: 0, correct: 0, wrong: 0, score: 0, categories: {} })
    setSelectedAnswer(null)
    setIsCorrect(null)
    setShowBetModal(true)
    setObjectiveAchieved(false)
    setFinalWinnings(0)
    setObjective(null)
    setObjectiveReached(false)
    setTimer(30)
    setCategoryTimer(30)
    setTimerWarning(false)
    setTimerDanger(false)
    setIsTransitioning(false)
    if (betInputRef.current) betInputRef.current.value = '100'
    fetchGameData().catch(() => {})
  }, [clearTimer, closeWebSocket, fetchGameData])

  useEffect(() => { fetchGameData().catch(() => {}) }, [fetchGameData])
  useEffect(() => { return () => { clearTimer(); closeWebSocket() } }, [clearTimer, closeWebSocket])

  const progressWidth = timer > 0 && categoryTimer > 0 ? ((categoryTimer - timer) / categoryTimer) * 100 : 100

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen font-['Poppins',sans-serif] bg-[#0a0a1a] flex flex-col items-center justify-center p-5 overflow-x-hidden text-white">
      
      {/* Background */}
      <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-15 -top-[10%] -left-[10%] bg-[radial-gradient(circle,#00D4FF,transparent_70%)] animate-[orbFloat_20s_infinite_alternate_ease-in-out]" />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 -bottom-[10%] -right-[10%] bg-[radial-gradient(circle,#7C4DFF,transparent_70%)] animate-[orbFloat_20s_infinite_alternate_ease-in-out_7s]" />
        <div className="absolute w-[350px] h-[350px] rounded-full blur-[100px] opacity-15 top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,#FF4081,transparent_70%)] animate-[orbFloat_20s_infinite_alternate_ease-in-out_14s]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:50px_50px] opacity-50 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0a0a1a]/95 backdrop-blur-xl flex flex-col items-center justify-center z-[5000]">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(0,212,255,0.4),0_0_50px_rgba(124,77,255,0.3)] animate-pulse mb-6">
            <LoaderIcon />
          </div>
          <p className="text-xl font-semibold text-white/90 animate-pulse mb-6 text-center px-4">
            {loadingMessage || 'Chargement...'}
          </p>
          <div className="w-64 h-2 bg-white/[0.05] rounded-full overflow-hidden backdrop-blur-sm">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      )}

      {/* Bet Modal */}
      <div className={`fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-[1000] p-5 transition-all duration-300 ${showBetModal ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className={`bg-[#141432]/98 backdrop-blur-3xl border border-white/[0.1] rounded-3xl p-6 sm:p-10 w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-400 ${showBetModal ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}>
          <div className="text-center mb-8">
            <div className="w-[70px] h-[70px] rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-[0_15px_40px_rgba(0,212,255,0.3)]">
              <CoinsIcon className="!text-white !w-8 !h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">Placez votre mise</h2>
            <p className="text-gray-400 text-sm">Misez pour multiplier vos gains !</p>
          </div>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-3">
              <WalletIcon className="!text-cyan-400 !w-6 !h-6" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Solde</div>
                <div className="text-lg font-bold text-white">{formatNumber(playerBalance)} XOF</div>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm text-center font-medium mb-3">Montant de la mise (XOF)</label>
            <div className="relative max-w-[350px] mx-auto">
              <input
                type="number"
                ref={betInputRef}
                defaultValue="100"
                min="100"
                placeholder="Entrez votre mise"
                onChange={() => setBetError('')}
                onKeyDown={(e) => { if (e.key === 'Enter') handleStartGame() }}
                className="w-full py-4.5 px-6 bg-white/[0.05] border-2 border-white/[0.1] rounded-2xl text-yellow-400 text-3xl font-extrabold text-center outline-none transition-all duration-200 focus:border-cyan-400 focus:shadow-[0_0_0_4px_rgba(0,212,255,0.15),0_0_30px_rgba(0,212,255,0.2)]"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold pointer-events-none">XOF</span>
            </div>
            {betError && <div className="text-red-400 text-sm text-center mt-3 font-medium">{betError}</div>}
            <div className="text-gray-500 text-xs text-center mt-3">Mise minimum : 100 XOF</div>
          </div>
          <button
            onClick={handleStartGame}
            disabled={isLoading}
            className="w-full py-4.5 bg-gradient-to-r from-cyan-400 to-purple-500 border-none rounded-2xl text-white font-bold text-lg cursor-pointer shadow-[0_10px_30px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(0,212,255,0.5)] active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon />
            Commencer la partie
          </button>
        </div>
      </div>

      {/* Result Modal */}
      <div className={`fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-[1000] p-5 transition-all duration-300 ${showResultModal ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className={`bg-[#141432]/98 backdrop-blur-3xl border border-white/[0.1] rounded-3xl p-6 sm:p-10 w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-400 ${showResultModal ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}>
          <div className="text-center mb-6">
            <div className={`w-[70px] h-[70px] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_15px_40px_rgba(0,0,0,0.3)] ${objectiveAchieved ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
              {objectiveAchieved ? <TrophyIcon className="!text-white !w-8 !h-8" /> : <CloseCircleIcon className="!text-white !w-8 !h-8" />}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">
              {objectiveAchieved ? 'Objectif Atteint !' : 'Objectif Non Atteint'}
            </h2>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center mb-6">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Objectif</div>
            <div className="text-lg font-semibold text-white mb-3">{objective?.description || ''}</div>
            <div className={`text-sm font-semibold px-4 py-1 rounded-full inline-block ${objectiveAchieved ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30' : 'bg-red-400/15 text-red-400 border border-red-400/30'}`}>
              {objectiveAchieved ? 'Atteint' : 'Non atteint'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: gameStats.score, label: 'Score Final', color: 'text-cyan-400' },
              { value: gameStats.correct, label: 'Bonnes reponses', color: 'text-emerald-400' },
              { value: gameStats.total, label: 'Total questions', color: 'text-white' },
              { value: `${gameStats.total > 0 ? Math.round((gameStats.correct / gameStats.total) * 100) : 0}%`, label: 'Reussite', color: 'text-yellow-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
                <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 mb-6">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-4 font-semibold">Par categorie</div>
            {Object.entries(gameStats.categories || {}).map(([catValue, catStats], i) => {
              const discipline = DISCIPLINES.find(d => d.value === catValue)
              if (!discipline) return null
              return (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-b-0">
                  <span className="font-medium flex items-center gap-2 text-sm" style={{ color: discipline.color }}>
                    {discipline.icon} {discipline.name}
                  </span>
                  <span className="font-semibold text-white text-sm">{catStats.correct} / {catStats.total}</span>
                </div>
              )
            })}
          </div>
          <div className={`rounded-2xl p-5 text-center mb-2 border ${objectiveAchieved ? 'bg-emerald-400/10 border-emerald-400/30' : 'bg-red-400/10 border-red-400/30'}`}>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">{objectiveAchieved ? 'Gains' : 'Perte'}</div>
            <div className={`text-3xl font-extrabold ${objectiveAchieved ? 'text-emerald-400' : 'text-red-400'}`}>
              {objectiveAchieved ? `+${formatNumber(finalWinnings)} XOF` : `-${formatNumber(betAmount)} XOF`}
            </div>
            <div className="text-gray-500 text-xs mt-2">
              Mise : {formatNumber(betAmount)} XOF {objectiveAchieved ? 'x 2' : ''} = {formatNumber(finalWinnings)} XOF
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 py-3 px-4 bg-cyan-400/10 rounded-xl text-cyan-400 font-semibold text-sm">
            <WalletIcon className="!text-cyan-400 !w-4 !h-4" />
            <span>Nouveau solde : {formatNumber(playerBalance)} XOF</span>
          </div>
          <button
            onClick={handleReplay}
            className="w-full py-4.5 bg-gradient-to-r from-cyan-400 to-purple-500 border-none rounded-2xl text-white font-bold text-lg cursor-pointer shadow-[0_10px_30px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(0,212,255,0.5)] transition-all duration-200 flex items-center justify-center gap-3 mt-6"
          >
            <RefreshIcon />
            Rejouer
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[750px] relative z-10 flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <div className="w-[45px] h-[45px] rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_10px_25px_rgba(0,212,255,0.3),0_10px_25px_rgba(124,77,255,0.3)] animate-[logoPulse_3s_ease-in-out_infinite]">
            <BrainIcon />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 text-center tracking-tight bg-gradient-to-r from-cyan-400 via-purple-500 via-pink-500 to-orange-500 bg-[length:300%_300%] bg-clip-text text-transparent animate-[gradientShift_8s_ease_infinite]">
          Smart Battle
        </h1>
        <p className="text-gray-400 text-sm mb-6 text-center">Quiz Chrono Multidisciplinaire</p>

        {/* Bandeau objectif : affiché dès que le backend l'a communiqué, tant que la partie n'est pas en mise */}
        {!showBetModal && objective && (
          <div className={`rounded-2xl py-3 px-5 flex items-center justify-center gap-3 mb-6 w-full font-medium text-sm flex-wrap text-center border transition-colors duration-300 ${
            objectiveReached
              ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
              : 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
          }`}>
            {objectiveReached ? <CheckCircleIcon /> : <TargetIcon />}
            <span>{objective.description}</span>
            <span className="ml-auto sm:ml-0 bg-white/[0.1] py-1 px-3 rounded-full text-xs font-semibold">
              {objectiveReached ? 'Objectif atteint' : 'x2 mise'}
            </span>
          </div>
        )}

        <div className={`bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-3xl p-6 sm:p-10 w-full shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-400 relative overflow-hidden after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)] after:pointer-events-none ${isTransitioning ? 'scale-[0.98] opacity-70' : 'scale-100 opacity-100'}`}>
          <div className={`absolute top-0 left-0 w-full h-1 rounded-t-3xl transition-all duration-400 bg-gradient-to-r ${currentDiscipline.gradient}`} />

          {/* Stats */}
          <div className="flex justify-between mb-8 flex-wrap gap-3">
            {[
              { value: `${timer}s`, label: '', color: timerDanger ? 'text-red-400 bg-red-400/10 border-red-400/20 animate-[dangerPulse_0.5s_infinite]' : timerWarning ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30 animate-[warningPulse_1s_infinite]' : 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20', icon: <ClockIcon /> },
              { value: `Score : ${gameStats.score}`, label: '', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: <StarIcon /> },
              { value: gameFinished ? 'Termine' : currentDiscipline.name, label: '', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: gameFinished ? <TrophyIcon className="!w-4 !h-4" /> : currentDiscipline.icon },
              { value: `+${gameFinished ? '0' : currentQuestion?.points || 0} pts`, label: '', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: <CoinsIcon className="!w-4 !h-4" /> }
            ].map((stat, i) => (
              <div key={i} className={`flex-1 min-w-[110px] sm:min-w-[130px] py-3 sm:py-4 px-3 sm:px-4.5 rounded-2xl font-semibold text-center flex items-center justify-center gap-2.5 text-sm border hover:-translate-y-0.5 hover:border-white/[0.15] transition-all duration-200 ${stat.color}`}>
                {stat.icon}
                <span>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-3 text-xs text-gray-400 font-medium">
              <span>Progression</span>
              <span>{Math.round(gameFinished ? 100 : (totalCategories > 0 ? (questionsCompleted / totalCategories) * 100 : 0))}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 relative after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:animate-[shimmer_2s_infinite]"
                style={{
                  width: `${gameFinished ? 100 : progressWidth}%`,
                  background: gameFinished ? 'linear-gradient(90deg, #00E676, #00C853)' : `linear-gradient(90deg, ${currentDiscipline.color}, ${currentDiscipline.color}88)`,
                  boxShadow: `0 0 20px ${currentDiscipline.glowColor}`
                }}
              />
            </div>
          </div>

          {/* Discipline Header */}
          <div
            className={`text-2xl sm:text-3xl my-4 text-center font-bold py-4 px-4 rounded-2xl text-white flex items-center justify-center gap-3 transition-all duration-400 bg-gradient-to-r ${currentDiscipline.gradient} shadow-[0_10px_30px_rgba(0,0,0,0.3)] ${isTransitioning ? 'animate-[fadeOutDown_0.3s_ease]' : 'animate-[fadeInUp_0.5s_ease]'}`}
            style={{ boxShadow: gameFinished ? '0 10px 30px rgba(0,0,0,0.3)' : `0 10px 30px ${currentDiscipline.glowColor}` }}
          >
            {gameFinished ? <TrophyIcon className="!w-6 !h-6" /> : currentDiscipline.icon}
            <span>{gameFinished ? 'Resultats Finaux' : currentDiscipline.name}</span>
          </div>

          {/* Question */}
          <div className={`text-xl sm:text-2xl my-6 leading-relaxed font-semibold text-center min-h-[80px] flex items-center justify-center transition-all duration-400 ${isTransitioning ? 'animate-[fadeOutDown_0.3s_ease]' : 'animate-[fadeInUp_0.5s_ease]'}`}>
            {gameFinished ? (
              <div className="flex items-center gap-3 text-emerald-400 text-2xl sm:text-3xl">
                <CheckCircleIcon />
                Quiz termine !
              </div>
            ) : (
              currentQuestion?.question || ''
            )}
          </div>

          {/* Choices */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            {!gameFinished && currentQuestion && currentQuestion.options.map((opt, i) => {
              let btnBg = `bg-gradient-to-r ${currentDiscipline.gradient}`
              let btnShadow = `0 8px 25px ${currentDiscipline.glowColor}`
              let iconEl = <CircleIcon />

              if (selectedAnswer === i) {
                if (isCorrect) {
                  btnBg = 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                  btnShadow = '0 8px 30px rgba(0, 230, 118, 0.5)'
                  iconEl = <CheckCircleIcon />
                } else {
                  btnBg = 'bg-gradient-to-r from-red-500 to-red-700'
                  btnShadow = '0 8px 30px rgba(255, 23, 68, 0.5)'
                  iconEl = <CloseCircleIcon className="!text-white" />
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i === currentQuestion.correct, i)}
                  disabled={selectedAnswer !== null}
                  className={`${btnBg} border-none text-white py-4.5 sm:py-5 px-5 sm:px-6 text-base sm:text-lg rounded-2xl cursor-pointer font-semibold flex items-center gap-3 text-left relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] active:translate-y-0 disabled:cursor-not-allowed transition-all duration-200`}
                  style={{ boxShadow: btnShadow }}
                >
                  <span className="text-sm opacity-70">{iconEl}</span>
                  <span>{opt}</span>
                  {selectedAnswer === i && isCorrect && (
                    <span className="ml-auto bg-white/20 py-1.5 px-3 rounded-full text-sm font-bold animate-[badgePop_0.5s_cubic-bezier(0.68,-0.55,0.265,1.55)]">
                      +{currentQuestion.points}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}