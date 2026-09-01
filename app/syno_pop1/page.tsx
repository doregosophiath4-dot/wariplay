'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const BrainIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
)

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const TrophyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const BigTrophyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

/* ═══════════════════════════════════════════
   LOADER ICON - 8 lignes rayonnantes
   ═══════════════════════════════════════════ */

const LoaderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
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

interface WordItem {
  word: string
  correct: string
  options: string[]
}

interface Objective {
  text: string
  questions_to_answer: number
  allowed_errors: number
  type: number
}

interface GameWord {
  id: number
  word: string
  options: string[]
}

interface WebSocketMessage {
  mise?: number
  word_id?: number
  selection?: string
  game_session_id?: string
}

interface WebSocketResponse {
  objective?: Objective
  words?: GameWord[]
  game_session_id?: string
  word_id?: number
  correct?: boolean
  score?: number
  gains_actuels?: number
  errors_remaining?: number
  game_over?: boolean
  reason?: string
  gains?: number
  error?: string
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function SynoPop() {
  useAuth()
  const router = useRouter()
  
  // États
  const [showIntro, setShowIntro] = useState(true)
  const [showGame, setShowGame] = useState(false)
  const [balance, setBalance] = useState(1000)
  const [currentBet, setCurrentBet] = useState(100)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [totalWinnings, setTotalWinnings] = useState(0)
  const [gameWords, setGameWords] = useState<GameWord[]>([])
  const [gameActive, setGameActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)
  const [timerActive, setTimerActive] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | ''>('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [timerBarWidth, setTimerBarWidth] = useState(100)
  const [timerBarClass, setTimerBarClass] = useState('')
  const [optionsDisabled, setOptionsDisabled] = useState(false)
  const [correctOption, setCorrectOption] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [fadeOutIntro, setFadeOutIntro] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([])
  const [gameSessionId, setGameSessionId] = useState<string | null>(null)
  const [questionsToAnswer, setQuestionsToAnswer] = useState(0)
  const [gainsParQuestion, setGainsParQuestion] = useState(0)
  const [errorsRemaining, setErrorsRemaining] = useState(0)
  const [objective, setObjective] = useState<Objective | null>(null)
  const [showObjectivePopup, setShowObjectivePopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Chargement...')

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const timerAnimationRef = useRef<NodeJS.Timeout | null>(null)
  const betInputRef = useRef<HTMLInputElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef<boolean>(false)
  const pendingResolveRef = useRef<((value: any) => void) | null>(null)
  const pendingRejectRef = useRef<((reason?: any) => void) | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const gameWordsRef = useRef<GameWord[]>([])
  const currentIndexRef = useRef<number>(0)
  const gameActiveRef = useRef<boolean>(false)
  const timerActiveRef = useRef<boolean>(false)
  const totalWinningsRef = useRef<number>(0)
  const scoreRef = useRef<number>(0)
  const gameSessionIdRef = useRef<string | null>(null)
  const errorsRemainingRef = useRef<number>(0)
  const questionsToAnswerRef = useRef<number>(0)
  const gainsParQuestionRef = useRef<number>(0)

  // Mise à jour des refs
  useEffect(() => { 
    gameWordsRef.current = gameWords 
  }, [gameWords])
  useEffect(() => { 
    currentIndexRef.current = currentIndex 
  }, [currentIndex])
  useEffect(() => { 
    gameActiveRef.current = gameActive 
  }, [gameActive])
  useEffect(() => { 
    timerActiveRef.current = timerActive 
  }, [timerActive])
  useEffect(() => { 
    totalWinningsRef.current = totalWinnings 
  }, [totalWinnings])
  useEffect(() => { 
    scoreRef.current = score 
  }, [score])
  useEffect(() => { 
    gameSessionIdRef.current = gameSessionId 
  }, [gameSessionId])
  useEffect(() => { 
    errorsRemainingRef.current = errorsRemaining 
  }, [errorsRemaining])
  useEffect(() => { 
    questionsToAnswerRef.current = questionsToAnswer 
  }, [questionsToAnswer])
  useEffect(() => { 
    gainsParQuestionRef.current = gainsParQuestion 
  }, [gainsParQuestion])

  const shuffleArray = useCallback(<T,>(arr: T[]): T[] => {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [])

  const updateBetDisplay = useCallback(() => {
    const val = parseInt(betInputRef.current?.value ?? '100')
    let bet = isNaN(val) ? 100 : val
    if (bet < 100) bet = 100
    if (bet > 1000) bet = 1000
    setCurrentBet(bet)
    if (betInputRef.current) betInputRef.current.value = bet.toString()
  }, [])

  const clearTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (timerTimeoutRef.current) {
      clearTimeout(timerTimeoutRef.current)
      timerTimeoutRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (timerAnimationRef.current) {
      clearInterval(timerAnimationRef.current)
      timerAnimationRef.current = null
    }
  }, [])

  const stopTimer = useCallback(() => {
    clearTimers()
    setTimerActive(false)
    timerActiveRef.current = false
  }, [clearTimers])

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
      const ws = new WebSocket(proto + window.location.host + '/ws/ws_syno')
      wsRef.current = ws
      
      const timeout = setTimeout(() => {
        closeWebSocket()
        reject(new Error('Erreur de connexion'))
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
            resolve()
            return
          }
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
      
      ws.onerror = () => {
        clearTimeout(timeout)
        closeWebSocket()
        reject(new Error('Erreur de connexion'))
      }
      
      ws.onclose = () => {
        wsReadyRef.current = false
        wsRef.current = null
        if (pendingRejectRef.current) {
          pendingRejectRef.current(new Error('Connexion fermée'))
          pendingResolveRef.current = null
          pendingRejectRef.current = null
        }
      }
    })
  }, [closeWebSocket])

  const sendWebSocketMessage = useCallback(async (msg: WebSocketMessage): Promise<WebSocketResponse> => {
    await openWebSocket()
    return new Promise((resolve, reject) => {
      if (!wsRef.current || !wsReadyRef.current) {
        reject(new Error('Non connecté'))
        return
      }
      
      const timeout = setTimeout(() => {
        pendingResolveRef.current = null
        pendingRejectRef.current = null
        reject(new Error('Erreur de communication'))
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

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true)
      setLoadingMessage('Récupération du solde...')
      const response = await fetchWithAllTokens('/api/get_lettricide_solde')
      const data = await response.json()
      
      if (data && data.solde !== undefined) {
        setBalance(data.solde)
        return true
      } else if (data && data.error) {
        setBalance(1000)
        return false
      }
    } catch (error) {
      setBalance(1000)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const processBet = useCallback(async (bet: number): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      setLoading(true)
      setLoadingMessage('Traitement de la mise...')
      const response = await fetchWithAllTokens('/api/cherif', {
        method: 'POST',
        body: JSON.stringify({ bet })
      })
      const data = await response.json()
      
      if (data && data.success) {
        setBalance(data.new_solde)
        return {
          success: true,
          message: data.message
        }
      } else {
        return {
          success: false,
          error: data?.error || 'Erreur lors du traitement'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion'
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const nextWord = useCallback(() => {
    const nextIndex = currentIndexRef.current + 1
    if (nextIndex < questionsToAnswerRef.current) {
      setCurrentIndex(nextIndex)
      currentIndexRef.current = nextIndex
      const item = gameWordsRef.current[nextIndex]
      if (item) {
        const shuffled = shuffleArray([...item.options])
        setShuffledOptions(shuffled)
      }
      setGameActive(true)
      gameActiveRef.current = true
      setShowFeedback(false)
      setOptionsDisabled(false)
      setCorrectOption('')
      setSelectedOption('')
      stopTimer()
      setTimeLeft(10)
      setTimerBarWidth(100)
      setTimerBarClass('')
      setTimerActive(true)
      timerActiveRef.current = true

      let width = 100
      const widthStep = 100 / 10
      timerAnimationRef.current = setInterval(() => {
        width -= widthStep
        setTimerBarWidth(width)
      }, 1000)

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1
          if (newTime <= 3) setTimerBarClass('danger')
          else if (newTime <= 5) setTimerBarClass('warning')
          else setTimerBarClass('')
          if (newTime <= 0) {
            stopTimer()
            if (gameActiveRef.current) {
              setGameActive(false)
              gameActiveRef.current = false
              setOptionsDisabled(true)
              const currentItem = gameWordsRef.current[nextIndex]
              if (currentItem) {
                setCorrectOption(currentItem.options.find(o => o === currentItem.options[0]) || '')
                setFeedbackMessage(`Temps écoulé !`)
              }
              setFeedbackType('wrong')
              setShowFeedback(true)
              
              if (gameSessionIdRef.current && wsReadyRef.current) {
                sendWebSocketMessage({
                  word_id: nextIndex,
                  selection: "",
                  game_session_id: gameSessionIdRef.current
                }).catch(() => {})
              }
              
              setTimeout(() => nextWord(), 2000)
            }
          }
          return newTime
        })
      }, 1000)
    } else {
      stopTimer()
      setBalance((prev) => prev + totalWinningsRef.current)
      setGameEnded(true)
      setShowFeedback(false)
    }
  }, [shuffleArray, stopTimer, sendWebSocketMessage])

  const handleWebSocketResponse = useCallback((data: WebSocketResponse) => {
    if (data.error) {
      setFeedbackMessage(`Erreur: ${data.error}`)
      setFeedbackType('wrong')
      setShowFeedback(true)
      setLoading(false)
      return
    }
    
    if (data.objective && data.words && data.game_session_id) {
      setObjective(data.objective)
      setQuestionsToAnswer(data.objective.questions_to_answer)
      setErrorsRemaining(data.objective.allowed_errors || 0)
      setGameWords(data.words)
      gameWordsRef.current = data.words
      setGameSessionId(data.game_session_id)
      gameSessionIdRef.current = data.game_session_id
      setGainsParQuestion((currentBet * 1.5) / data.objective.questions_to_answer)
      gainsParQuestionRef.current = (currentBet * 1.5) / data.objective.questions_to_answer
      setShowObjectivePopup(true)
      setLoading(false)
      
    } else if (data.word_id !== undefined && data.correct !== undefined) {
      const allButtons = document.querySelectorAll('.option-btn')
      
      setScore(data.score || 0)
      scoreRef.current = data.score || 0
      setTotalWinnings(data.gains_actuels || 0)
      totalWinningsRef.current = data.gains_actuels || 0
      
      if (objective && objective.type === 2) {
        setErrorsRemaining(data.errors_remaining || 0)
        errorsRemainingRef.current = data.errors_remaining || 0
      }
      
      if (data.correct) {
        allButtons.forEach(btn => {
          if (btn.classList.contains('selected')) {
            btn.classList.remove('selected')
            btn.classList.add('correct')
          }
        })
        setFeedbackMessage(`✅ Correct ! +${Math.round(gainsParQuestionRef.current)} XOF gagnés`)
        setFeedbackType('correct')
      } else {
        allButtons.forEach(btn => {
          if (btn.classList.contains('selected')) {
            btn.classList.remove('selected')
            btn.classList.add('wrong')
          }
        })
        
        if (gameWordsRef.current[currentIndexRef.current] && gameWordsRef.current[currentIndexRef.current].options) {
          const correctWord = gameWordsRef.current[currentIndexRef.current].options[0]
          allButtons.forEach(btn => {
            if (btn.textContent === correctWord) {
              btn.classList.add('correct')
            }
          })
        }
        
        setFeedbackMessage(`❌ Incorrect`)
        setFeedbackType('wrong')
      }
      
      setShowFeedback(true)
      
      setTimeout(() => nextWord(), 2000)
      
    } else if (data.game_over) {
      endGameSession(data.reason || 'Partie terminée', data.gains || 0)
    }
  }, [nextWord, objective])

  const checkAnswer = useCallback((selected: string) => {
    if (!gameActiveRef.current || !timerActiveRef.current) {
      return
    }
    stopTimer()
    setGameActive(false)
    gameActiveRef.current = false
    setOptionsDisabled(true)
    setSelectedOption(selected)
    
    const allButtons = document.querySelectorAll('.option-btn')
    allButtons.forEach(btn => {
      if (btn.textContent === selected) {
        btn.classList.add('selected')
      }
    })
    
    if (gameSessionIdRef.current && wsReadyRef.current) {
      sendWebSocketMessage({
        word_id: currentIndexRef.current,
        selection: selected,
        game_session_id: gameSessionIdRef.current
      }).then((data) => {
        handleWebSocketResponse(data)
      }).catch((error) => {
        setFeedbackMessage('Erreur de connexion')
        setFeedbackType('wrong')
        setShowFeedback(true)
        setTimeout(() => nextWord(), 2000)
      })
    } else {
      setFeedbackMessage('Erreur de connexion')
      setFeedbackType('wrong')
      setShowFeedback(true)
      setTimeout(() => nextWord(), 2000)
    }
  }, [stopTimer, sendWebSocketMessage, handleWebSocketResponse, nextWord])

  const startNewWord = useCallback(() => {
    if (currentIndexRef.current >= gameWordsRef.current.length) return
    
    setGameActive(true)
    gameActiveRef.current = true
    const item = gameWordsRef.current[currentIndexRef.current]
    
    setShowFeedback(false)
    
    setShuffledOptions(shuffleArray([...item.options]))
    setCorrectOption('')
    setSelectedOption('')
    setOptionsDisabled(false)
    
    setTimerBarWidth(100)
    setTimerBarClass('')
    
    setTimeLeft(10)
    setTimerActive(true)
    timerActiveRef.current = true
    
    let width = 100
    const widthStep = 100 / 10
    timerAnimationRef.current = setInterval(() => {
      width -= widthStep
      setTimerBarWidth(width)
    }, 1000)
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        if (newTime <= 3) setTimerBarClass('danger')
        else if (newTime <= 5) setTimerBarClass('warning')
        else setTimerBarClass('')
        if (newTime <= 0) {
          stopTimer()
          if (gameActiveRef.current) {
            setGameActive(false)
            gameActiveRef.current = false
            setOptionsDisabled(true)
            
            if (gameSessionIdRef.current && wsReadyRef.current) {
              sendWebSocketMessage({
                word_id: currentIndexRef.current,
                selection: "",
                game_session_id: gameSessionIdRef.current
              }).then((data) => {
                handleWebSocketResponse(data)
              }).catch(() => {
                setFeedbackMessage('Erreur de connexion')
                setFeedbackType('wrong')
                setShowFeedback(true)
                setTimeout(() => nextWord(), 2000)
              })
            }
          }
        }
        return newTime
      })
    }, 1000)
  }, [shuffleArray, stopTimer, sendWebSocketMessage, handleWebSocketResponse, nextWord])

  const endGameSession = useCallback((reason: string, gains: number) => {
    stopTimer()
    clearTimers()
    closeWebSocket()
    
    setBalance((prev) => prev + gains)
    
    let resultMessage = "Partie Terminée !"
    if (reason === "Trop d'erreurs") {
      resultMessage = "Trop d'erreurs commises !"
    } else if (reason === "Objectif atteint") {
      resultMessage = "Objectif atteint !"
    } else if (reason === "Toutes les questions terminées mais objectif non rempli") {
      resultMessage = "Questions terminées - Objectif non atteint"
    }
    
    setFeedbackMessage(resultMessage)
    setFeedbackType('correct')
    setShowFeedback(true)
    setGameEnded(true)
    setGameActive(false)
    gameActiveRef.current = false
    setGameSessionId(null)
    gameSessionIdRef.current = null
  }, [stopTimer, clearTimers, closeWebSocket])

  const startGame = useCallback(async () => {
    updateBetDisplay()
    const bet = parseInt(betInputRef.current?.value ?? '100')
    if (isNaN(bet) || bet < 100 || bet > 1000) {
      setFeedbackMessage("Veuillez entrer une mise valide entre 100 et 1000 XOF.")
      setFeedbackType('wrong')
      setShowFeedback(true)
      setShowRulesModal(true)
      return
    }
    if (bet > balance) {
      setFeedbackMessage(`Solde insuffisant !`)
      setFeedbackType('wrong')
      setShowFeedback(true)
      return
    }

    setLoading(true)
    setLoadingMessage('Connexion au serveur...')
    
    try {
      // Étape 1: Auth du WebSocket
      setLoadingMessage('Authentification...')
      await openWebSocket()
      
      // Étape 2: Mise
      setLoadingMessage('Traitement de la mise...')
      const result = await processBet(bet)
      if (!result.success) {
        setFeedbackMessage(result.error || 'Erreur lors du traitement')
        setFeedbackType('wrong')
        setShowFeedback(true)
        setLoading(false)
        return
      }
      
      // Réinitialiser le jeu
      setCurrentIndex(0)
      currentIndexRef.current = 0
      setScore(0)
      scoreRef.current = 0
      setTotalWinnings(0)
      totalWinningsRef.current = 0
      setGameActive(false)
      gameActiveRef.current = false
      setTimeLeft(10)
      setOptionsDisabled(false)
      setCorrectOption('')
      setSelectedOption('')
      setShowFeedback(false)
      setGameEnded(false)
      setTimerBarWidth(100)
      setTimerBarClass('')
      setShuffledOptions([])
      setGameWords([])
      gameWordsRef.current = []
      setGameSessionId(null)
      gameSessionIdRef.current = null
      setObjective(null)
      setShowObjectivePopup(false)
      
      // Étape 3: Récupération objectif et mots
      setLoadingMessage('Récupération de l\'objectif...')
      const response = await sendWebSocketMessage({ mise: bet })
      
      if (response && response.objective && response.words && response.game_session_id) {
        handleWebSocketResponse(response)
      } else {
        setFeedbackMessage('Erreur de réponse du serveur')
        setFeedbackType('wrong')
        setShowFeedback(true)
        setLoading(false)
        return
      }
      
      setFadeOutIntro(true)
      setTimeout(() => {
        setShowIntro(false)
        setShowGame(true)
        setFadeOutIntro(false)
      }, 500)
      
    } catch (error) {
      setFeedbackMessage('Erreur lors du démarrage')
      setFeedbackType('wrong')
      setShowFeedback(true)
      setLoading(false)
    }
  }, [updateBetDisplay, balance, openWebSocket, processBet, sendWebSocketMessage, handleWebSocketResponse])

  const startGameFromPopup = useCallback(() => {
    setShowObjectivePopup(false)
    setTimeout(() => {
      startNewWord()
    }, 100)
  }, [startNewWord])

  const handlePlayAgain = useCallback(() => {
    stopTimer()
    clearTimers()
    closeWebSocket()
    setShowGame(false)
    setShowIntro(true)
    setGameEnded(false)
    setCurrentIndex(0)
    currentIndexRef.current = 0
    setScore(0)
    scoreRef.current = 0
    setTotalWinnings(0)
    totalWinningsRef.current = 0
    setGameActive(false)
    gameActiveRef.current = false
    setTimeLeft(10)
    setOptionsDisabled(false)
    setCorrectOption('')
    setSelectedOption('')
    setShowFeedback(false)
    setTimerBarWidth(100)
    setTimerBarClass('')
    setShuffledOptions([])
    setGameWords([])
    gameWordsRef.current = []
    setGameSessionId(null)
    gameSessionIdRef.current = null
    setObjective(null)
    setShowObjectivePopup(false)
    if (betInputRef.current) betInputRef.current.value = '100'
    setCurrentBet(100)
  }, [stopTimer, clearTimers, closeWebSocket])

  // Initialisation
  useEffect(() => {
    fetchBalance()
    
    return () => {
      stopTimer()
      clearTimers()
      closeWebSocket()
    }
  }, [fetchBalance, stopTimer, clearTimers, closeWebSocket])

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-['Poppins',sans-serif] text-white overflow-x-hidden bg-[#0A0A0F]">
      
      {/* Background */}
      <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,212,255,0.4)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0,230,118,0.4)_0%,transparent_50%),radial-gradient(circle_at_40%_80%,rgba(124,77,255,0.4)_0%,transparent_50%),radial-gradient(circle_at_60%_20%,rgba(255,215,64,0.4)_0%,transparent_50%)] blur-[80px] opacity-50 animate-[gradientShift_15s_ease_infinite]" />
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:60px_60px] z-[-1] opacity-40 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
      </div>

      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[#0A0A0F]/95 backdrop-blur-2xl flex flex-col items-center justify-center z-[5000]">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(0,212,255,0.5)] mb-6 animate-pulse">
            <LoaderIcon />
          </div>
          <p className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
            {loadingMessage}
          </p>
          <div className="mt-6 w-56 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* Rules Modal */}
      <div
        className={`fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[1000] transition-all duration-350 ${showRulesModal ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={(e) => { if (e.target === e.currentTarget) setShowRulesModal(false) }}
      >
        <div className={`bg-[#141428]/98 backdrop-blur-3xl border border-white/[0.08] rounded-[28px] p-6 sm:p-8 max-w-[500px] w-[90%] max-h-[80vh] overflow-y-auto shadow-[0_24px_70px_rgba(0,0,0,0.5)] transition-all duration-400 ${showRulesModal ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}>
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-12 h-12 bg-cyan-400/15 rounded-2xl flex items-center justify-center">
                <InfoIcon />
              </span>
              Règles du Jeu
            </h2>
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-10 h-10 bg-white/[0.05] border border-white/[0.1] rounded-2xl flex items-center justify-center text-white/70 hover:bg-white/[0.1] hover:text-white hover:rotate-90 transition-all duration-300"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: <ClockIcon />, label: 'Temps par mot', value: '10s' },
              { icon: <ListIcon />, label: 'Mots par partie', value: '5' },
              { icon: <CoinsIcon />, label: 'Gain par bonne réponse', value: `${Math.floor((currentBet * 1.5) / 5)} XOF` },
              { icon: <TrophyIcon />, label: 'Gain total potentiel', value: `${Math.floor((currentBet * 1.5))} XOF`, color: 'text-yellow-400' }
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.03] rounded-2xl p-4 text-center">
                <div className="text-white/40 text-xs mb-1.5 flex items-center justify-center gap-1.5">{item.icon} {item.label}</div>
                <div className={`text-lg sm:text-xl font-extrabold ${item.color || 'text-cyan-300'}`}>{item.value}</div>
              </div>
            ))}
          </div>

          <ul className="space-y-3">
            {[
              'Entrez votre mise (entre 100 et 1000 XOF) dans le champ prévu',
              'Vous avez 10 secondes pour répondre à chaque mot',
              'Chaque bonne réponse rapporte (mise × 1.5) ÷ 5 XOF',
              '5 mots à trouver par partie',
              'Si le temps expire, la réponse est comptée comme incorrecte',
              'Votre solde est mis à jour après chaque partie'
            ].map((rule, i) => (
              <li key={i} className="pl-6 relative text-white/70 text-sm leading-relaxed before:content-['•'] before:text-emerald-400 before:text-xl before:absolute before:left-0 before:-top-0.5">
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Objective Popup */}
      <div
        className={`fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[1000] transition-all duration-350 ${showObjectivePopup ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={(e) => { if (e.target === e.currentTarget) setShowObjectivePopup(false) }}
      >
        <div className={`bg-[#141428]/98 backdrop-blur-3xl border border-white/[0.08] rounded-[28px] p-6 sm:p-8 max-w-[500px] w-[90%] max-h-[80vh] overflow-y-auto shadow-[0_24px_70px_rgba(0,0,0,0.5)] transition-all duration-400 ${showObjectivePopup ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}>
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_15px_40px_rgba(0,212,255,0.4)]">
                <TrophyIcon />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Objectif</h2>
            <p className="text-white/60 text-base">{objective?.text || 'Complétez l\'objectif pour gagner !'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white/[0.03] rounded-2xl p-4 text-center">
              <div className="text-white/40 text-xs mb-1.5">Questions à répondre</div>
              <div className="text-2xl font-extrabold text-cyan-300">{questionsToAnswer}</div>
            </div>
            {objective?.type === 2 && (
              <div className="bg-white/[0.03] rounded-2xl p-4 text-center">
                <div className="text-white/40 text-xs mb-1.5">Erreurs autorisées</div>
                <div className={`text-2xl font-extrabold ${errorsRemaining <= 2 ? 'text-red-400' : 'text-yellow-400'}`}>{errorsRemaining}</div>
              </div>
            )}
            <div className="bg-white/[0.03] rounded-2xl p-4 text-center col-span-2">
              <div className="text-white/40 text-xs mb-1.5">Gain potentiel</div>
              <div className="text-2xl font-extrabold text-yellow-400">{Math.round(gainsParQuestion * questionsToAnswer)} XOF</div>
            </div>
          </div>

          <button
            onClick={startGameFromPopup}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold text-lg rounded-2xl shadow-[0_10px_35px_rgba(0,212,255,0.35)] hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(0,212,255,0.5)] active:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <PlayIcon />
            Commencer
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[700px] mx-auto p-5 relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-[600px] mx-auto flex flex-col items-center justify-center">

          {/* Intro Screen */}
          <section className={`w-full flex items-center justify-center transition-all duration-500 ${!showIntro ? 'hidden' : ''} ${fadeOutIntro ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="w-full bg-white/[0.04] backdrop-blur-3xl border border-white/[0.08] rounded-[28px] p-6 sm:p-10 shadow-[0_24px_70px_rgba(0,0,0,0.5)] relative overflow-hidden animate-[cardAppear_0.8s_cubic-bezier(0.34,1.56,0.64,1)]">
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500" />
              <div className="absolute -top-1/2 -right-1/2 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(0,212,255,0.4)_0%,transparent_70%)] opacity-20 z-[-1] animate-[orbFloat_8s_ease-in-out_infinite]" />

              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_15px_40px_rgba(0,212,255,0.4)] animate-[logoPulse_3s_ease-in-out_infinite]">
                    <BrainIcon />
                  </div>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
                  SynoPop
                </h2>
                <p className="text-white/45 text-base sm:text-lg leading-relaxed max-w-full text-center">
                  Testez votre vocabulaire et gagnez des gains en trouvant les bons synonymes.
                </p>
              </div>

              <button
                onClick={() => setShowRulesModal(true)}
                className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl py-3.5 px-6 text-white/70 font-semibold text-base hover:bg-white/[0.08] hover:text-white hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] transition-all duration-300 flex items-center justify-center gap-3 mb-6"
              >
                <BookIcon />
                Règles du jeu
              </button>

              <div className="bg-black/30 rounded-2xl p-6 sm:p-8 mb-6 border border-white/[0.05] text-center">
                <div className="mb-6">
                  <label className="block mb-4 text-white/80 font-semibold text-base sm:text-lg text-center">
                    Entrez votre mise (XOF)
                  </label>
                  <div className="relative max-w-[300px] mx-auto">
                    <input
                      type="number"
                      ref={betInputRef}
                      min="100"
                      max="1000"
                      defaultValue="100"
                      onChange={updateBetDisplay}
                      className="w-full py-5 px-6 bg-white/[0.06] border-2 border-white/[0.08] rounded-2xl text-yellow-400 text-3xl sm:text-4xl font-extrabold text-center outline-none transition-all duration-300 focus:border-cyan-400 focus:shadow-[0_0_0_4px_rgba(0,212,255,0.2),0_0_30px_rgba(0,212,255,0.15)] focus:bg-white/[0.1]"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 text-lg font-semibold pointer-events-none">XOF</span>
                  </div>
                  <div className="text-white/40 text-sm mt-3">Solde: {balance.toLocaleString('fr-FR')} XOF</div>
                </div>

                <button
                  onClick={startGame}
                  disabled={loading}
                  className={`w-full py-5 px-10 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold text-lg rounded-2xl shadow-[0_10px_35px_rgba(0,212,255,0.35)] hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(0,212,255,0.5)] active:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <LoaderIcon />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <PlayIcon />
                      Commencer la partie
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Game Screen */}
          <section className={`w-full flex items-center justify-center ${!showGame ? 'hidden' : ''}`}>
            <div className="w-full bg-white/[0.04] backdrop-blur-3xl border border-white/[0.08] rounded-[28px] p-5 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.5)] relative overflow-hidden animate-[cardAppear_0.8s_cubic-bezier(0.34,1.56,0.64,1)] flex flex-col">
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500" />

              {!gameEnded ? (
                <>
                  {/* Stats */}
                  <div className="flex overflow-x-auto gap-3 sm:gap-4 mb-6 pb-1 scrollbar-thin">
                    {[
                      { value: score, label: 'Score', color: 'text-cyan-400' },
                      { value: `${currentIndex + 1}/${questionsToAnswer}`, label: 'Question', color: 'text-white' },
                      { value: balance.toLocaleString('fr-FR'), label: 'Solde', color: 'text-yellow-400' },
                      { value: currentBet, label: 'Mise', color: 'text-white' },
                      { value: totalWinnings, label: 'Gains', color: 'text-emerald-400' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.04] rounded-2xl py-3 px-4 sm:py-4 sm:px-5 min-w-[110px] sm:min-w-[130px] text-center flex-shrink-0 hover:-translate-y-1 hover:border-white/[0.1] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300">
                        <div className={`text-2xl sm:text-3xl font-extrabold ${stat.color} leading-none mb-1.5`}>{stat.value}</div>
                        <div className="text-[10px] sm:text-xs text-white/40 uppercase tracking-[1px] font-medium">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Timer */}
                  <div className="mb-4">
                    <div className="h-3.5 bg-white/[0.04] rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent after:animate-[shimmer_2s_infinite]
                          ${timerBarClass === 'danger' ? 'bg-gradient-to-r from-red-500 to-red-600' : timerBarClass === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-cyan-400 to-purple-500'}`}
                        style={{ width: `${timerBarWidth}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/40 font-medium">Temps restant</span>
                      <span className={`text-xl sm:text-2xl font-extrabold font-mono ${timeLeft <= 3 ? 'text-red-400 animate-pulse' : timeLeft <= 5 ? 'text-yellow-400' : 'text-white'}`}>
                        {timeLeft}s
                      </span>
                    </div>
                  </div>

                  {/* Current Word */}
                  <div className="text-center my-4 sm:my-6">
                    <div className="text-sm text-white/40 uppercase tracking-[2px] font-medium mb-3">Mot à trouver</div>
                    <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight inline-block px-8 relative drop-shadow-[0_0_40px_rgba(0,212,255,0.3)]">
                      <span className="absolute left-0 -top-2 text-4xl sm:text-5xl text-cyan-400/40">&ldquo;</span>
                      {gameWords[currentIndex]?.word || 'Chargement...'}
                      <span className="absolute right-0 -top-2 text-4xl sm:text-5xl text-cyan-400/40">&rdquo;</span>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    {shuffledOptions.length > 0 ? (
                      shuffledOptions.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => checkAnswer(opt)}
                          disabled={optionsDisabled}
                          className={`option-btn py-4 sm:py-5 px-4 rounded-2xl text-base sm:text-lg font-semibold text-center transition-all duration-300 relative overflow-hidden
                            ${optionsDisabled && opt === correctOption ? 'bg-emerald-400/15 border-emerald-400 text-emerald-300 shadow-[0_10px_35px_rgba(0,230,118,0.3)]' : ''}
                            ${optionsDisabled && opt === selectedOption && opt !== correctOption ? 'bg-red-400/15 border-red-400 text-red-300 shadow-[0_10px_35px_rgba(255,82,82,0.25)]' : ''}
                            ${optionsDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'bg-white/[0.03] border-2 border-white/[0.06] text-white hover:bg-white/[0.06] hover:border-white/[0.12] hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)]'}
                          `}
                        >
                          {opt}
                        </button>
                      ))
                    ) : (
                      <div className="py-5 px-4 rounded-2xl bg-white/[0.03] border-2 border-white/[0.06] text-white text-center text-lg font-semibold">
                        Chargement...
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  <div className="min-h-[60px] sm:min-h-[80px] mb-4 flex items-center justify-center">
                    {showFeedback && (
                      <div className={`w-full py-3.5 sm:py-4 px-4 rounded-2xl font-semibold text-sm sm:text-base text-center flex items-center justify-center gap-3 animate-[slideIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)]
                        ${feedbackType === 'correct' ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20' : 'bg-red-400/10 text-red-300 border border-red-400/20'}`}
                      >
                        {feedbackMessage}
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mt-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white/40 font-medium">Progression de la partie</span>
                      <span className="text-base font-bold text-cyan-400">{Math.round((currentIndex / questionsToAnswer) * 100)}%</span>
                    </div>
                    <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-800 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent after:animate-[shimmer_2s_infinite]"
                        style={{ width: `${(currentIndex / questionsToAnswer) * 100}%` }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* End Game Screen */
                <div className="text-center py-4 sm:py-6 flex flex-col items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mx-auto mb-5 shadow-[0_15px_45px_rgba(0,212,255,0.4)] animate-[bounceIn_1s_cubic-bezier(0.34,1.56,0.64,1)]">
                    <BigTrophyIcon />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">{feedbackMessage}</h2>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full mb-6">
                    {[
                      { value: `${score}/${questionsToAnswer}`, label: 'Score Final', color: 'text-cyan-400' },
                      { value: `${totalWinnings} XOF`, label: 'Gains Totaux', color: 'text-emerald-400' },
                      { value: `${balance.toLocaleString('fr-FR')} XOF`, label: 'Nouveau Solde', color: 'text-yellow-400' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/[0.03] rounded-2xl py-3 sm:py-4 px-2 text-center">
                        <div className={`text-xl sm:text-2xl font-extrabold ${stat.color} leading-none mb-1.5`}>{stat.value}</div>
                        <div className="text-[10px] sm:text-xs text-white/40 uppercase tracking-[1px]">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handlePlayAgain}
                    className="px-10 py-4 sm:py-5 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold text-lg rounded-2xl shadow-[0_10px_35px_rgba(0,212,255,0.35)] hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(0,212,255,0.5)] transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <RefreshIcon />
                    Rejouer
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}