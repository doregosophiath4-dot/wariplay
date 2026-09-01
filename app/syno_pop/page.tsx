'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

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
   TYPES
   ═══════════════════════════════════════════ */

interface WordItem {
  word: string
  correct: string
  options: string[]
}

const WORDS: WordItem[] = [
  { word: "Rapide", correct: "Vif", options: ["Lent", "Vif", "Triste", "Dur"] },
  { word: "Beau", correct: "Joli", options: ["Mechant", "Vieux", "Joli", "Rouge"] },
  { word: "Triste", correct: "Malheureux", options: ["Content", "Malheureux", "Heureux", "Joyeux"] },
  { word: "Intelligent", correct: "Brillant", options: ["Fou", "Paresseux", "Brillant", "Bete"] },
  { word: "Petit", correct: "Minuscule", options: ["Immense", "Long", "Minuscule", "Fort"] },
  { word: "Grand", correct: "Immense", options: ["Petit", "Immense", "Moyen", "Etroit"] },
  { word: "Joyeux", correct: "Heureux", options: ["Triste", "Heureux", "Colerique", "Fatigue"] },
  { word: "Courageux", correct: "Brave", options: ["Peur", "Timide", "Brave", "Faible"] },
  { word: "Calme", correct: "Paisible", options: ["Agite", "Nerveux", "Paisible", "Rapide"] },
  { word: "Cher", correct: "Couteux", options: ["Bon marche", "Couteux", "Gratuit", "Abordable"] }
]

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function SynoPop() {
  const [showIntro, setShowIntro] = useState(true)
  const [showGame, setShowGame] = useState(false)
  const [balance, setBalance] = useState(1000)
  const [currentBet, setCurrentBet] = useState(100)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [totalWinnings, setTotalWinnings] = useState(0)
  const [gameWords, setGameWords] = useState<WordItem[]>([])
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

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const timerAnimationRef = useRef<NodeJS.Timeout | null>(null)
  const betInputRef = useRef<HTMLInputElement>(null)
  const gameWordsRef = useRef<WordItem[]>([])
  const currentIndexRef = useRef<number>(0)
  const gameActiveRef = useRef<boolean>(false)
  const timerActiveRef = useRef<boolean>(false)
  const totalWinningsRef = useRef<number>(0)
  const scoreRef = useRef<number>(0)

  const gainPerQuestion = Math.floor((currentBet * 2) / 5)
  const totalPotential = gainPerQuestion * 5
  const progressValue = (currentIndex / 5) * 100

  useEffect(() => { gameWordsRef.current = gameWords }, [gameWords])
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])
  useEffect(() => { gameActiveRef.current = gameActive }, [gameActive])
  useEffect(() => { timerActiveRef.current = timerActive }, [timerActive])
  useEffect(() => { totalWinningsRef.current = totalWinnings }, [totalWinnings])
  useEffect(() => { scoreRef.current = score }, [score])

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

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (timerAnimationRef.current) { clearInterval(timerAnimationRef.current); timerAnimationRef.current = null }
    setTimerActive(false)
    timerActiveRef.current = false
  }, [])

  const nextWord = useCallback(() => {
    const nextIndex = currentIndexRef.current + 1
    if (nextIndex < 5) {
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
                setCorrectOption(currentItem.correct)
                setFeedbackMessage(`Temps ecoule ! La reponse etait : ${currentItem.correct}`)
              }
              setFeedbackType('wrong')
              setShowFeedback(true)
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
  }, [shuffleArray, stopTimer])

  const checkAnswer = useCallback((selected: string, correct: string) => {
    if (!gameActiveRef.current || !timerActiveRef.current) return
    stopTimer()
    setGameActive(false)
    gameActiveRef.current = false
    setOptionsDisabled(true)
    setCorrectOption(correct)
    setSelectedOption(selected)
    const gainPerQ = Math.floor((currentBet * 2) / 5)
    if (selected === correct) {
      setScore((prev) => { const ns = prev + 1; scoreRef.current = ns; return ns })
      setTotalWinnings((prev) => { const nt = prev + gainPerQ; totalWinningsRef.current = nt; return nt })
      setFeedbackMessage(`Correct ! +${gainPerQ} XOF gagnes`)
      setFeedbackType('correct')
    } else {
      setFeedbackMessage(`Incorrect. La reponse etait : ${correct}`)
      setFeedbackType('wrong')
    }
    setShowFeedback(true)
    setTimeout(() => nextWord(), 2000)
  }, [currentBet, stopTimer, nextWord])

  const handleStartGame = useCallback(() => {
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
      setFeedbackMessage(`Solde insuffisant ! Vous avez ${balance} XOF et vous voulez miser ${bet} XOF.`)
      setFeedbackType('wrong')
      setShowFeedback(true)
      return
    }

    const shuffled = shuffleArray([...WORDS]).slice(0, 5)
    gameWordsRef.current = shuffled
    setGameWords(shuffled)
    setBalance((prev) => prev - bet)
    setCurrentBet(bet)
    setScore(0)
    scoreRef.current = 0
    setTotalWinnings(0)
    totalWinningsRef.current = 0
    setCurrentIndex(0)
    currentIndexRef.current = 0
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

    setFadeOutIntro(true)
    setTimeout(() => {
      setShowIntro(false)
      setShowGame(true)
      setFadeOutIntro(false)
      setTimeout(() => {
        if (shuffled.length > 0) {
          const firstShuffled = shuffleArray([...shuffled[0].options])
          setShuffledOptions(firstShuffled)
          setGameActive(true)
          gameActiveRef.current = true
          setCurrentIndex(0)
          currentIndexRef.current = 0
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
                  const firstItem = shuffled[0]
                  if (firstItem) {
                    setCorrectOption(firstItem.correct)
                    setFeedbackMessage(`Temps ecoule ! La reponse etait : ${firstItem.correct}`)
                  }
                  setFeedbackType('wrong')
                  setShowFeedback(true)
                  setTimeout(() => nextWord(), 2000)
                }
              }
              return newTime
            })
          }, 1000)
        }
      }, 100)
    }, 500)
  }, [updateBetDisplay, balance, shuffleArray, stopTimer, nextWord])

  const handlePlayAgain = useCallback(() => {
    stopTimer()
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
    gameWordsRef.current = []
    setGameWords([])
    if (betInputRef.current) betInputRef.current.value = '100'
    setCurrentBet(100)
  }, [stopTimer])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (timerAnimationRef.current) clearInterval(timerAnimationRef.current)
    }
  }, [])

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
              Regles du Jeu
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
              { icon: <CoinsIcon />, label: 'Gain par bonne reponse', value: `${gainPerQuestion} XOF` },
              { icon: <TrophyIcon />, label: 'Gain total potentiel', value: `${totalPotential} XOF`, color: 'text-yellow-400' }
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.03] rounded-2xl p-4 text-center">
                <div className="text-white/40 text-xs mb-1.5 flex items-center justify-center gap-1.5">{item.icon} {item.label}</div>
                <div className={`text-lg sm:text-xl font-extrabold ${item.color || 'text-cyan-300'}`}>{item.value}</div>
              </div>
            ))}
          </div>

          <ul className="space-y-3">
            {[
              'Entrez votre mise (entre 100 et 1000 XOF) dans le champ prevu',
              'Vous avez 10 secondes pour repondre a chaque mot',
              'Chaque bonne reponse rapporte (mise × 2) ÷ 5 XOF',
              '5 mots a trouver par partie',
              'Si le temps expire, la reponse est comptee comme incorrecte',
              'Votre solde est mis a jour apres chaque partie'
            ].map((rule, i) => (
              <li key={i} className="pl-6 relative text-white/70 text-sm leading-relaxed before:content-['•'] before:text-emerald-400 before:text-xl before:absolute before:left-0 before:-top-0.5">
                {rule}
              </li>
            ))}
          </ul>
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
                Regles du jeu
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
                  onClick={handleStartGame}
                  className="w-full py-5 px-10 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold text-lg rounded-2xl shadow-[0_10px_35px_rgba(0,212,255,0.35)] hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgba(0,212,255,0.5)] active:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <PlayIcon />
                  Commencer la partie
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
                      { value: `${currentIndex + 1}/5`, label: 'Question', color: 'text-white' },
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
                    <div className="text-sm text-white/40 uppercase tracking-[2px] font-medium mb-3">Mot a trouver</div>
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
                          onClick={() => checkAnswer(opt, gameWords[currentIndex]?.correct || '')}
                          disabled={optionsDisabled}
                          className={`py-4 sm:py-5 px-4 rounded-2xl text-base sm:text-lg font-semibold text-center transition-all duration-300 relative overflow-hidden
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
                      <span className="text-base font-bold text-cyan-400">{Math.round(progressValue)}%</span>
                    </div>
                    <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-800 relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent after:animate-[shimmer_2s_infinite]"
                        style={{ width: `${progressValue}%` }}
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

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Partie Terminee !</h2>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full mb-6">
                    {[
                      { value: `${score}/5`, label: 'Score Final', color: 'text-cyan-400' },
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