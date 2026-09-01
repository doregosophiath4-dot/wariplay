'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const WalletIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)

const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const GraduationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
  </svg>
)

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
)

const TrophyIcon = ({ className = "text-emerald-400" }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const CloseCircleIcon = ({ className = "text-red-400" }: { className?: string }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const BookIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const MoneyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const GamepadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="11" x2="10" y2="11" />
    <line x1="8" y1="9" x2="8" y2="13" />
    <line x1="15" y1="12" x2="15.01" y2="12" />
    <line x1="18" y1="10" x2="18.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
)

/* ═══════════════════════════════════════════
   LOADER ICON - 8 lignes tournantes
   ═══════════════════════════════════════════ */

const LoaderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-white">
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

interface QuestionData {
  q: string
  a: string
  b: string
  c: string
  correct: string
}

interface WSQuestionMessage {
  status: 'question'
  number: number
  time: number
  q: string
  options: {
    A: string
    B: string
    C: string
  }
  q_id: number
  signature: string
}

interface WSResultMessage {
  result: 'correct' | 'wrong' | 'timeout'
  correct: number
  wrong: number
}

interface WSLostMessage {
  status: 'lost'
  reason: string
  score: number
}

interface WSWonMessage {
  status: 'won'
  gain: number
  score: number
  errors: number
}

interface WSStartMessage {
  status: 'start'
  session_token: string
}

interface WSErrorMessage {
  error: string
}

type WSMessage = WSQuestionMessage | WSResultMessage | WSLostMessage | WSWonMessage | WSStartMessage | WSErrorMessage

type PopupType = 'success' | 'failure' | 'neutral' | 'rules' | 'none'

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function NeuroQuiz() {
  useAuth()
  const [solde, setSolde] = useState(0)
  const [lives, setLives] = useState(0)
  const [mise, setMise] = useState('100')
  const [discipline, setDiscipline] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [quizVisible, setQuizVisible] = useState(false)
  const [headerHidden, setHeaderHidden] = useState(false)
  const [introOpacity, setIntroOpacity] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null)
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [questionsAsked, setQuestionsAsked] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [resultMessage, setResultMessage] = useState('')
  const [resultClass, setResultClass] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupContent, setPopupContent] = useState<React.ReactNode>(null)
  const [popupType, setPopupType] = useState<PopupType>('none')
  const [showRulesPopup, setShowRulesPopup] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null)
  const [choicesVisible, setChoicesVisible] = useState(false)
  const [choices, setChoices] = useState<{ letter: string; text: string }[]>([])
  const [scorePulse, setScorePulse] = useState(false)
  const [startButtonPulse, setStartButtonPulse] = useState(true)
  const [wsToken, setWsToken] = useState<string | null>(null)
  const [currentQId, setCurrentQId] = useState<number | null>(null)
  const [currentSignature, setCurrentSignature] = useState<string | null>(null)
  const [showLoading, setShowLoading] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const miseInputRef = useRef<HTMLInputElement>(null)
  const disciplineSelectRef = useRef<HTMLSelectElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef<boolean>(false)
  const pendingResolveRef = useRef<((value: any) => void) | null>(null)
  const pendingRejectRef = useRef<((reason?: any) => void) | null>(null)
  const wsTokenRef = useRef<string | null>(null)

  const miseNum = parseFloat(mise) || 0
  const isValidMise = miseNum >= 100 && miseNum <= 1000 && miseNum <= solde && !isProcessing

  const showNotification = useCallback((message: string, type: string) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3300)
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startCountdown = useCallback((seconds: number) => {
    clearTimer()
    setTimeLeft(seconds)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1
        if (newTime <= 0) {
          clearTimer()
          if (!selectedAnswer && currentQId && currentSignature) {
            sendAnswer('')
          }
        }
        return newTime
      })
    }, 1000)
  }, [clearTimer, selectedAnswer, currentQId, currentSignature])

  /* ═══════════════════════════════════════════
     WEBSOCKET
     ═══════════════════════════════════════════ */

  const closeWebSocket = useCallback(() => {
    wsReadyRef.current = false
    wsTokenRef.current = null
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
    const ws = new WebSocket(proto + window.location.host + '/ws/neuro_quiz')
    wsRef.current = ws
    
    const t = setTimeout(() => {
      closeWebSocket()
      reject(new Error('Timeout'))
    }, 10000)
    
    ws.onopen = async () => {
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
        if (d.status === 'start' && d.session_token) {
          setWsToken(d.session_token)
          wsTokenRef.current = d.session_token
          return
        }
        if (pendingResolveRef.current) {
          const rf = pendingResolveRef.current
          pendingResolveRef.current = null
          pendingRejectRef.current = null
          rf(d)
        }
      } catch {
        clearTimeout(t)
        reject()
      }
    }
    
    ws.onerror = () => {
      clearTimeout(t)
      closeWebSocket()
      reject()
    }
    
    ws.onclose = () => {
      wsReadyRef.current = false
      wsTokenRef.current = null
      wsRef.current = null
      if (pendingRejectRef.current) {
        pendingRejectRef.current()
        pendingResolveRef.current = null
        pendingRejectRef.current = null
      }
    }
  }), [closeWebSocket])

  const sendWebSocketMessage = useCallback(async (msg: any): Promise<any> => {
    await openWebSocket()
    return new Promise((resolve, reject) => {
      if (!wsRef.current || !wsReadyRef.current) {
        reject()
        return
      }
      const t = setTimeout(() => {
        pendingResolveRef.current = null
        pendingRejectRef.current = null
        reject()
      }, 10000)
      pendingResolveRef.current = (d) => {
        clearTimeout(t)
        resolve(d)
      }
      pendingRejectRef.current = () => {
        clearTimeout(t)
        reject()
      }
      wsRef.current.send(JSON.stringify(msg))
    })
  }, [openWebSocket])

  const sendAnswer = useCallback(async (choice: string) => {
    const token = wsTokenRef.current
    if (!token || !currentQId || !currentSignature) {
      showNotification('Erreur', 'error')
      return
    }
    try {
      const msg = {
        action: 'answer',
        choice: choice,
        q_id: currentQId,
        signature: currentSignature,
        session_token: token
      }
      if (wsRef.current && wsReadyRef.current) {
        wsRef.current.send(JSON.stringify(msg))
      } else {
        showNotification('Erreur', 'error')
      }
    } catch {
      showNotification('Erreur', 'error')
    }
  }, [currentQId, currentSignature, showNotification])

  /* ═══════════════════════════════════════════
     BACKEND HTTP REQUESTS
     ═══════════════════════════════════════════ */

  const fetchSolde = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/get_lettricide_solde')
      if (!response.ok) throw new Error()
      const data = await response.json()
      if (data.error) throw new Error()
      setSolde(parseFloat(data.solde))
      return parseFloat(data.solde)
    } catch {
      showNotification('Erreur', 'error')
      return 0
    }
  }, [showNotification])

  const fetchLives = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/get_Nquiz')
      if (!response.ok) throw new Error()
      const data = await response.json()
      if (data.error) throw new Error()
      setLives(parseInt(data.lives))
      return parseInt(data.lives)
    } catch {
      showNotification('Erreur', 'error')
      return 0
    }
  }, [showNotification])

  const decrementLives = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/decrement_Nquiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error()
      const data = await response.json()
      if (!data.success) throw new Error()
      setLives(data.remaining_lives)
      return true
    } catch {
      showNotification('Erreur', 'error')
      return false
    }
  }, [showNotification])

  const sendMiseToBackend = useCallback(async (mise: number) => {
    try {
      const response = await fetchWithAllTokens('/api/cherif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet: mise })
      })
      const data = await response.json()
      if (!response.ok) throw new Error()
      if (!data.success) throw new Error()
      setSolde(parseFloat(data.new_solde))
      return { success: true, new_solde: parseFloat(data.new_solde) }
    } catch {
      throw new Error()
    }
  }, [])

  const initUserData = useCallback(async () => {
    await fetchSolde()
    await fetchLives()
  }, [fetchSolde, fetchLives])

  /* ═══════════════════════════════════════════
     QUIZ FUNCTIONS
     ═══════════════════════════════════════════ */

  const displayQuestion = useCallback((questionData: any, number: number, time: number) => {
    setShowLoading(false)
    setIsProcessing(false)
    setHeaderHidden(true)
    setIntroOpacity(0)
    setGameStarted(true)
    setQuizVisible(true)
    
    setSelectedAnswer('')
    setQuestionsAsked(number)
    setTimeLeft(time)
    setCurrentQId(questionData.q_id)
    setCurrentSignature(questionData.signature)
    setCurrentQuestion({
      q: questionData.q,
      a: questionData.options.A,
      b: questionData.options.B,
      c: questionData.options.C,
      correct: ''
    })
    setShowResult(false)
    setResultMessage('')
    setResultClass('')
    setChoicesVisible(false)

    const newChoices = [
      { letter: 'A', text: questionData.options.A },
      { letter: 'B', text: questionData.options.B },
      { letter: 'C', text: questionData.options.C }
    ]
    setChoices(newChoices)

    setTimeout(() => setChoicesVisible(true), 50)

    startCountdown(time)
  }, [startCountdown])

  const handleAnswerResult = useCallback((result: 'correct' | 'wrong' | 'timeout', correct: number, wrong: number) => {
    setScore(correct)
    setErrors(wrong)
    
    if (result === 'correct') {
      setResultMessage('Bonne réponse !')
      setResultClass('bg-emerald-400/20 text-emerald-300 border-2 border-emerald-400/50')
      setScorePulse(true)
      setTimeout(() => setScorePulse(false), 1000)
    } else if (result === 'wrong') {
      setResultMessage('Mauvaise réponse !')
      setResultClass('bg-red-400/20 text-red-300 border-2 border-red-400/50')
    } else if (result === 'timeout') {
      setResultMessage('Temps écoulé !')
      setResultClass('bg-red-400/20 text-red-300 border-2 border-red-400/50')
    }
    setShowResult(true)
  }, [])

  const endQuizLost = useCallback((reason: string, finalScore: number) => {
    clearTimer()
    closeWebSocket()
    setPopupType('failure')
    setPopupContent(
      <div className="space-y-2">
        <p>Le quiz est terminé.</p>
        <div className="mt-4">
          <h3 className="mb-2 text-lg font-semibold">Détail de la partie :</h3>
          <div className="flex justify-between py-2 border-b border-white/10"><span>Mise :</span><span>{miseNum.toFixed(2)} XOF</span></div>
          <div className="flex justify-between py-2 border-b border-white/10"><span>Score :</span><span>{finalScore} bonnes réponses</span></div>
          <div className="flex justify-between py-2 border-b border-white/10"><span>Erreurs :</span><span>{errors}</span></div>
          <div className="flex justify-between py-2"><span>Gains :</span><span>0 XOF</span></div>
        </div>
        <p className="mt-4">Solde : <strong>{solde.toFixed(2)} XOF</strong></p>
        <p>Vies restantes : <strong>{lives}</strong></p>
      </div>
    )
    setShowPopup(true)
  }, [clearTimer, closeWebSocket, miseNum, errors, solde, lives])

  const endQuizWon = useCallback((gainAmount: number, finalScore: number, finalErrors: number) => {
    clearTimer()
    closeWebSocket()
    const gainFinal = gainAmount || 0
    const newSolde = solde + gainFinal
    setSolde(newSolde)
    setPopupType('success')
    setPopupContent(
      <div className="space-y-2">
        <p>Félicitations !</p>
        <p><strong>{finalScore} bonnes réponses</strong></p>
        <p><strong>{finalErrors} erreur(s)</strong></p>
        <div className="mt-4">
          <h3 className="mb-2 text-lg font-semibold">Détail des gains :</h3>
          <div className="flex justify-between py-2 border-b border-white/10"><span>Mise :</span><span>{miseNum.toFixed(2)} XOF</span></div>
          <div className="flex justify-between py-2 border-b border-white/10"><span>Multiplicateur :</span><span>× 2</span></div>
          <div className="flex justify-between py-2 border-b border-white/10"><span>Gains :</span><span>{gainFinal.toFixed(2)} XOF</span></div>
          <div className="flex justify-between py-2 font-bold text-yellow-400"><span>Nouveau solde :</span><span>{newSolde.toFixed(2)} XOF</span></div>
        </div>
        <p className="mt-4">Vies restantes : <strong>{lives}</strong></p>
      </div>
    )
    setShowPopup(true)
  }, [clearTimer, closeWebSocket, solde, miseNum, lives])

  const handleStartQuiz = useCallback(async () => {
    if (isProcessing) return

    const m = parseFloat(mise)
    const disc = discipline

    if (lives <= 0) {
      showNotification('Erreur', 'error')
      return
    }

    if (!m || m < 100 || m > 1000) {
      showNotification('Erreur', 'error')
      miseInputRef.current?.focus()
      return
    }
    if (!disc) {
      showNotification('Erreur', 'error')
      return
    }
    if (m > solde) {
      showNotification('Erreur', 'error')
      return
    }

    setIsProcessing(true)
    setProcessingMessage('Chargement...')
    setShowLoading(true)
    setStartButtonPulse(false)

    try {
      await openWebSocket()
      
      const livesDecremented = await decrementLives()
      if (!livesDecremented) {
        setIsProcessing(false)
        setShowLoading(false)
        return
      }

      const miseResult = await sendMiseToBackend(m)
      if (!miseResult.success) {
        showNotification('Erreur', 'error')
        setIsProcessing(false)
        setShowLoading(false)
        return
      }

      const token = wsTokenRef.current
      
      if (!token) {
        showNotification('Erreur', 'error')
        setIsProcessing(false)
        setShowLoading(false)
        return
      }
      
      if (wsRef.current && wsReadyRef.current && token) {
        const startMsg = {
          action: 'start',
          subject: disc,
          bet: m,
          session_token: token
        }
        wsRef.current.send(JSON.stringify(startMsg))
      } else {
        showNotification('Erreur', 'error')
        setIsProcessing(false)
        setShowLoading(false)
      }
    } catch {
      showNotification('Erreur', 'error')
      if (wsRef.current) {
        closeWebSocket()
      }
      setIsProcessing(false)
      setShowLoading(false)
    }
  }, [isProcessing, mise, discipline, solde, lives, openWebSocket, decrementLives, sendMiseToBackend, closeWebSocket, showNotification])

  const handleReturnToHome = useCallback(() => {
    setShowPopup(false)
    setHeaderHidden(false)
    setQuizVisible(false)
    setGameStarted(false)
    setIntroOpacity(1)
    clearTimer()
    closeWebSocket()
  }, [clearTimer, closeWebSocket])

  const handleSelectAnswer = useCallback((letter: string) => {
    if (selectedAnswer) return
    setSelectedAnswer(letter)
    clearTimer()
    sendAnswer(letter)
  }, [selectedAnswer, clearTimer, sendAnswer])

  /* ═══════════════════════════════════════════
     WEBSOCKET MESSAGE HANDLER
     ═══════════════════════════════════════════ */

  const handleWSMessage = useCallback((data: WSMessage) => {
    if ('error' in data) {
      showNotification('Erreur', 'error')
      return
    }

    if (data.status === 'question') {
      displayQuestion(data, data.number, data.time)
      return
    }

    if ('result' in data) {
      handleAnswerResult(data.result, data.correct, data.wrong)
      return
    }

    if (data.status === 'lost') {
      endQuizLost(data.reason, data.score)
      return
    }

    if (data.status === 'won') {
      endQuizWon(data.gain, data.score, data.errors)
      return
    }
  }, [displayQuestion, handleAnswerResult, endQuizLost, endQuizWon, showNotification])

  /* ═══════════════════════════════════════════
     EFFECTS
     ═══════════════════════════════════════════ */

  useEffect(() => {
    initUserData()
    
    return () => {
      clearTimer()
      closeWebSocket()
    }
  }, [initUserData, clearTimer, closeWebSocket])

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          handleWSMessage(data)
        } catch {
          showNotification('Erreur', 'error')
        }
      }
    }
  }, [handleWSMessage, showNotification])

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0c2461] via-[#1e3799] to-[#4a69bd] text-white font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif] overflow-x-hidden pb-5">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-2] bg-[radial-gradient(circle_at_20%_80%,rgba(76,0,255,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,0,128,0.1)_0%,transparent_50%),radial-gradient(circle_at_40%_40%,rgba(0,255,191,0.1)_0%,transparent_50%)]" />

      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] top-[10%] left-[5%] rounded-full border-2 border-purple-500/20 bg-white/[0.03]" />
        <div className="absolute w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] bottom-[10%] right-[5%] rounded-full border-2 border-cyan-400/20 bg-white/[0.03]" />
        <div className="absolute w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] top-[50%] right-[10%] rounded-full border-2 border-pink-400/20 bg-white/[0.03]" />
      </div>

      {/* LOADER OVERLAY */}
      {showLoading && (
        <div className="fixed inset-0 bg-[#0c2461]/95 backdrop-blur-xl flex flex-col items-center justify-center z-[5000]">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(108,92,231,0.5)] mb-6 animate-pulse">
            <LoaderIcon />
          </div>
          <p className="text-lg font-semibold text-white/90 animate-pulse">{processingMessage}</p>
          <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-4 sm:right-5 z-[1000] py-3.5 px-5 rounded-xl text-white font-bold shadow-[0_5px_15px_rgba(0,0,0,0.3)] max-w-[calc(100%-30px)] sm:max-w-[400px] transition-transform duration-300 ${
            notification.type === 'error'
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-5 py-4 relative z-10">

        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4 py-2.5">
          <div className="bg-white/[0.1] backdrop-blur-xl rounded-2xl py-3 px-4 flex items-center border border-white/[0.1] shadow-[0_5px_15px_rgba(0,0,0,0.2)] w-full sm:w-auto sm:min-w-[180px]">
            <span className="text-yellow-400 text-2xl mr-2.5 flex-shrink-0">
              <WalletIcon />
            </span>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-yellow-400 whitespace-nowrap overflow-hidden text-ellipsis">{solde.toFixed(2)} XOF</div>
              <div className="text-xs sm:text-sm text-white/80 mt-0.5">SOLDE</div>
            </div>
          </div>

          <div className="bg-white/[0.1] backdrop-blur-xl rounded-2xl py-3 px-4 flex items-center border border-white/[0.1] shadow-[0_5px_15px_rgba(0,0,0,0.2)] w-full sm:w-auto sm:min-w-[140px]">
            <span className="text-purple-400 text-2xl mr-2.5 flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-purple-400 whitespace-nowrap overflow-hidden text-ellipsis">{lives}</div>
              <div className="text-xs sm:text-sm text-white/80 mt-0.5">VIES</div>
            </div>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setShowRulesPopup(true)}
              className="flex-1 sm:flex-none bg-purple-500/20 border-2 border-purple-500/50 text-purple-300 py-3 px-4 sm:px-5 rounded-xl font-bold cursor-pointer hover:bg-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap text-sm"
            >
              <HelpIcon />
              Règles
            </button>
          </div>
        </div>

        {/* Header */}
        <header
          className={`text-center py-5 transition-all duration-500 ${
            headerHidden ? 'opacity-0 -translate-y-5 h-0 p-0 overflow-hidden m-0' : 'opacity-100 translate-y-0'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_5px_15px_rgba(0,0,0,0.2)] px-2.5">
            Neuro Quiz
          </h1>
          <p className="text-base sm:text-lg text-gray-200/90 px-2.5">
            Testez vos connaissances
          </p>
        </header>

        {/* Intro Section */}
        {!gameStarted && (
          <div
            className="bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 sm:p-10 my-4 shadow-[0_15px_35px_rgba(0,0,0,0.3)] border border-white/[0.1] hover:-translate-y-1 transition-transform duration-300"
            style={{ opacity: introOpacity }}
          >
            <h2 className="text-xl sm:text-2xl mb-6 sm:mb-8 text-center text-blue-300 px-2.5">
              Faites votre mise
            </h2>

            <div className="mb-5">
              <label className="block mb-2 text-gray-200 font-medium text-sm sm:text-base">Mise (XOF)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 text-lg">
                  <CoinsIcon />
                </span>
                <input
                  type="number"
                  ref={miseInputRef}
                  placeholder="100 - 1000"
                  min="100"
                  max="1000"
                  value={mise}
                  onChange={(e) => setMise(e.target.value)}
                  className="w-full py-4 sm:py-4.5 pl-12 pr-4 bg-white/[0.1] border-2 border-purple-500/30 rounded-xl text-white text-base sm:text-lg outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(108,92,231,0.3)] placeholder:text-white/60"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-gray-200 font-medium text-sm sm:text-base">Discipline</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 text-lg">
                  <GraduationIcon />
                </span>
                <div className="relative">
                  <select
                    ref={disciplineSelectRef}
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    className="w-full py-4 sm:py-4.5 pl-12 pr-12 bg-white/[0.1] border-2 border-purple-500/30 rounded-xl text-white text-base sm:text-lg outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(108,92,231,0.3)] cursor-pointer appearance-none"
                  >
                    <option value="" disabled className="bg-[#1e3799]">Choisir une discipline</option>
                    <option value="svt" className="bg-[#1e3799]">SVT</option>
                    <option value="pct" className="bg-[#1e3799]">Physique-Chimie</option>
                    <option value="philosophie" className="bg-[#1e3799]">Philosophie</option>
                    <option value="maths" className="bg-[#1e3799]">Mathématiques</option>
                    <option value="histoire" className="bg-[#1e3799]">Histoire-Géo</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2 4 6 8 10 4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={!isValidMise || isProcessing || lives <= 0}
              className={`relative w-full py-4 sm:py-4.5 px-5 bg-gradient-to-r from-purple-500 to-purple-300 text-white font-semibold text-lg sm:text-xl rounded-xl cursor-pointer mt-8 sm:mt-10 shadow-[0_10px_20px_rgba(108,92,231,0.4)] hover:-translate-y-0.5 hover:shadow-[0_15px_25px_rgba(108,92,231,0.5)] active:translate-y-0.5 disabled:bg-gradient-to-r disabled:from-gray-500 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden ${
                startButtonPulse && isValidMise && lives > 0 ? 'animate-pulse' : ''
              }`}
            >
              <span className={`flex items-center gap-3 transition-opacity duration-300 ${isProcessing ? 'opacity-0' : 'opacity-100'}`}>
                <PlayIcon />
                Commencer
              </span>
              {isProcessing && (
                <div className="absolute w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
              )}
            </button>

            {lives <= 0 && (
              <div className="mt-4 text-center text-red-400 font-bold text-sm">
                <span className="bg-red-500/20 px-4 py-2 rounded-lg inline-block">
                  ⚠️ Plus de vies
                </span>
              </div>
            )}
          </div>
        )}

        {/* Quiz Section */}
        {gameStarted && (
          <div
            className={`bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 sm:p-10 my-4 shadow-[0_15px_35px_rgba(0,0,0,0.3)] border border-white/[0.1] transition-all duration-500 ${
              quizVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            {/* Question */}
            <div className="text-xl sm:text-2xl mb-6 sm:mb-8 leading-relaxed text-blue-300 text-center py-4 sm:py-5 px-4 bg-white/[0.05] rounded-2xl border-l-[5px] border-purple-500 break-words">
              {currentQuestion ? `Question ${questionsAsked} : ${currentQuestion.q}` : 'Quiz terminé !'}
            </div>

            {/* Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
              {choices.map((choice, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectAnswer(choice.letter)}
                  className={`bg-white/[0.08] border-2 border-white/[0.1] rounded-xl py-5 sm:py-6 px-4 cursor-pointer text-center text-base sm:text-lg relative overflow-hidden min-h-[80px] flex items-center justify-center hover:bg-purple-500/20 hover:-translate-y-1 hover:border-purple-500 active:-translate-y-0.5 transition-all duration-300 ${
                    selectedAnswer === choice.letter ? '!bg-purple-500/40 !border-purple-500 shadow-[0_0_20px_rgba(108,92,231,0.5)]' : ''
                  }`}
                  style={{
                    opacity: choicesVisible ? 1 : 0,
                    transform: choicesVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`
                  }}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-purple-500 rounded-full font-bold mr-3 sm:mr-4 flex-shrink-0">{choice.letter}</span>
                  <span className="flex-1 text-left">{choice.text}</span>
                </div>
              ))}
            </div>

            {/* Timer */}
            <div className="text-lg sm:text-xl text-center py-3 sm:py-4 px-4 bg-white/[0.05] rounded-2xl mb-4 text-emerald-300 font-bold border-2 border-emerald-400/30">
              <div>Temps: <span>{timeLeft}</span>s</div>
              <div className="h-1 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full mt-2 origin-left" style={{ transform: `scaleX(${timeLeft / 10})`, transition: 'transform 1s linear' }} />
            </div>

            {/* Stats */}
            <div className="flex overflow-x-auto gap-3 sm:gap-4 p-4 sm:p-5 bg-white/[0.05] rounded-2xl mb-4 scrollbar-thin">
              {[
                { value: score, label: 'BONNES', color: 'text-cyan-400', pulse: scorePulse },
                { value: `${miseNum.toFixed(2)} XOF`, label: 'MISE', color: 'text-yellow-400', pulse: false },
                { value: `${questionsAsked}/20`, label: 'QUESTIONS', color: 'text-blue-300', pulse: false },
                { value: `${errors}/5`, label: 'ERREURS', color: 'text-white', pulse: false }
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`text-center py-2.5 px-4 min-w-[130px] sm:flex-1 sm:min-w-0 flex-shrink-0 bg-white/[0.05] rounded-xl border border-white/[0.1] ${stat.pulse ? 'animate-pulse' : ''}`}
                >
                  <div className={`text-2xl sm:text-3xl font-bold mb-1.5 ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-300/80 whitespace-nowrap">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Result */}
            {showResult && (
              <div className={`py-4 sm:py-5 px-4 rounded-2xl text-center text-base sm:text-lg font-bold mt-4 transition-all duration-500 ${resultClass}`}>
                {resultMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RESULT POPUP */}
      <div
        className={`fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[1000] p-4 transition-all duration-300 ${
          showPopup ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className={`bg-gradient-to-br from-[#1e3799] to-[#4a69bd] rounded-2xl p-6 sm:p-10 w-full max-w-[500px] border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto flex flex-col transition-all duration-400 ${
          showPopup ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          <div className="text-center mb-5 flex-shrink-0">
            <div className="flex justify-center mb-2.5">
              {popupType === 'success' && <TrophyIcon className="text-emerald-400" />}
              {popupType === 'failure' && <CloseCircleIcon className="text-red-400" />}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight px-2.5">
              {popupType === 'success' ? 'Victoire !' : 'Échec !'}
            </h2>
          </div>

          <div className="text-base sm:text-lg leading-relaxed mb-6 flex-1 overflow-y-auto pr-1.5 scrollbar-thin">
            {popupContent}
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={handleReturnToHome}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-500 to-purple-300 text-white font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] active:-translate-y-0 transition-all duration-300 text-base"
            >
              Retour
            </button>
          </div>
        </div>
      </div>

      {/* RULES POPUP */}
      <div
        className={`fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[1000] p-4 transition-all duration-300 ${
          showRulesPopup ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className={`bg-gradient-to-br from-[#1e3799] to-[#4a69bd] rounded-2xl p-6 sm:p-10 w-full max-w-[500px] border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto flex flex-col transition-all duration-400 ${
          showRulesPopup ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          <div className="text-center mb-5 flex-shrink-0">
            <div className="flex justify-center mb-2.5">
              <BookIcon />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight px-2.5">
              Règles
            </h2>
          </div>

          <div className="text-base sm:text-lg leading-relaxed mb-6 flex-1 overflow-y-auto pr-1.5 scrollbar-thin">
            <ul className="space-y-3">
              {[
                { icon: <CoinsIcon />, text: <><strong>Mise :</strong> 100 - 1000 XOF</> },
                { icon: <ClockIcon />, text: <><strong>Temps :</strong> 10s par question</> },
                { icon: <GraduationIcon />, text: <><strong>Questions :</strong> 20 par discipline</> },
                { icon: <CloseCircleIcon className="!w-3.5 !h-3.5" />, text: <><strong>Échec :</strong> 5 erreurs = fin</> },
                { icon: <TrophyIcon className="!w-3.5 !h-3.5" />, text: <><strong>Victoire :</strong> 20 questions</> },
                { icon: <MoneyIcon />, text: <><strong>Gain :</strong> Mise × 2</> },
                { icon: <GamepadIcon />, text: <><strong>Déroulement :</strong> 20 questions</> },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>, text: <><strong>Vies :</strong> 1 par partie</> }
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2.5 py-2.5 border-b border-white/[0.1] last:border-b-0 text-sm sm:text-base">
                  <span className="text-purple-400 mt-0.5 flex-shrink-0">{rule.icon}</span>
                  <span>{rule.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => setShowRulesPopup(false)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-500 to-purple-300 text-white font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] active:-translate-y-0 transition-all duration-300 text-base"
            >
              Compris
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}