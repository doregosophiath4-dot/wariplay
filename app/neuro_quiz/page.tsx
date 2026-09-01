'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

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
   TYPES
   ═══════════════════════════════════════════ */

interface QuestionData {
  q: string
  a: string
  b: string
  c: string
  correct: string
}

interface QuestionsMap {
  [key: string]: QuestionData[]
}

type PopupType = 'success' | 'failure' | 'neutral' | 'rules' | 'none'

/* ═══════════════════════════════════════════
   QUESTIONS
   ═══════════════════════════════════════════ */

const questions: QuestionsMap = {
  "svt": [
    { q: "Quelle est la molecule responsable du transport de l'oxygene dans le sang ?", a: "Le glucose", b: "L'hemoglobine", c: "L'insuline", correct: "B" },
    { q: "Quel est l'organe principal de la photosynthese chez les plantes ?", a: "La racine", b: "La feuille", c: "La tige", correct: "B" },
    { q: "Quel est le nombre de chromosomes dans une cellule humaine normale ?", a: "23", b: "46", c: "64", correct: "B" },
    { q: "Quelle partie du cerveau est responsable de l'equilibre et de la coordination ?", a: "Le cervelet", b: "Le cortex cerebral", c: "L'hypothalamus", correct: "A" },
    { q: "Quel est le processus par lequel les plantes perdent de l'eau par leurs feuilles ?", a: "La transpiration", b: "La respiration", c: "La photosynthese", correct: "A" },
    { q: "Quel est l'organe le plus grand du corps humain ?", a: "Le foie", b: "La peau", c: "Le cerveau", correct: "B" },
    { q: "Quel type de cellules sanguines combat les infections ?", a: "Les globules rouges", b: "Les plaquettes", c: "Les globules blancs", correct: "C" },
    { q: "Quel est le nom du processus de division cellulaire qui produit des cellules sexuelles ?", a: "Mitose", b: "Meiose", c: "Cytokinese", correct: "B" },
    { q: "Quel gaz est absorbe par les plantes pendant la photosynthese ?", a: "Oxygene", b: "Dioxyde de carbone", c: "Azote", correct: "B" },
    { q: "Quel organe produit l'insuline dans le corps humain ?", a: "Le foie", b: "Le pancreas", c: "Les reins", correct: "B" }
  ],
  "pct": [
    { q: "Quelle est l'unite de mesure de la resistance electrique ?", a: "Le volt", b: "L'ohm", c: "L'ampere", correct: "B" },
    { q: "Quel gaz est produit lors de la photosynthese ?", a: "Le dioxyde de carbone", b: "L'oxygene", c: "L'azote", correct: "B" },
    { q: "Quel element chimique a pour symbole 'Au' ?", a: "L'argent", b: "Le fer", c: "L'or", correct: "C" },
    { q: "Quelle est la formule chimique de l'eau ?", a: "CO2", b: "H2O", c: "NaCl", correct: "B" },
    { q: "Quel type d'energie est stockee dans une batterie ?", a: "Energie cinetique", b: "Energie chimique", c: "Energie thermique", correct: "B" },
    { q: "Quelle est la vitesse de la lumiere dans le vide ?", a: "300 000 km/s", b: "150 000 km/s", c: "450 000 km/s", correct: "A" },
    { q: "Quel metal est liquide a temperature ambiante ?", a: "Le mercure", b: "Le plomb", c: "L'aluminium", correct: "A" },
    { q: "Quelle planete est la plus proche du Soleil ?", a: "Venus", b: "Mercure", c: "Mars", correct: "B" },
    { q: "Quelle est la formule de l'acide chlorhydrique ?", a: "HCl", b: "H2SO4", c: "HNO3", correct: "A" },
    { q: "Quelle force maintient les planetes en orbite autour du Soleil ?", a: "La force magnetique", b: "La gravite", c: "La force electrique", correct: "B" }
  ],
  "philosophie": [
    { q: "Qui est considere comme le pere de la philosophie occidentale ?", a: "Aristote", b: "Platon", c: "Socrate", correct: "C" },
    { q: "Quelle philosophie prone le bonheur par la moderation et l'absence de douleur ?", a: "L'epicurisme", b: "Le stoicisme", c: "L'hedonisme", correct: "A" },
    { q: "Quel philosophe a ecrit 'Le Discours de la methode' ?", a: "Rene Descartes", b: "Jean-Jacques Rousseau", c: "Emmanuel Kant", correct: "A" },
    { q: "Quel concept philosophique signifie 'amour de la sagesse' ?", a: "Philosophie", b: "Sophisme", c: "Epistemologie", correct: "A" },
    { q: "Quel philosophe est celebre pour sa theorie de l'imperatif categorique ?", a: "Friedrich Nietzsche", b: "Emmanuel Kant", c: "Georg Hegel", correct: "B" },
    { q: "Qui a dit 'Je pense, donc je suis' ?", a: "Aristote", b: "Platon", c: "Descartes", correct: "C" },
    { q: "Quelle ecole philosophique grecque etait dirigee par Zenon de Cition ?", a: "Le stoicisme", b: "L'epicurisme", c: "Le scepticisme", correct: "A" },
    { q: "Quel philosophe a ecrit 'L'Ethique' ?", a: "Baruch Spinoza", b: "John Locke", c: "David Hume", correct: "A" },
    { q: "Qui est l'auteur de 'La Republique' ?", a: "Aristote", b: "Platon", c: "Socrate", correct: "B" },
    { q: "Quel philosophe est connu pour sa dialectique maitre-esclave ?", a: "Georg Hegel", b: "Karl Marx", c: "Friedrich Nietzsche", correct: "A" }
  ],
  "maths": [
    { q: "Quelle est la valeur de pi arrondie a deux decimales ?", a: "3.14", b: "3.16", c: "3.12", correct: "A" },
    { q: "Quelle est la formule pour calculer l'aire d'un cercle ?", a: "pi r²", b: "2 pi r", c: "pi d", correct: "A" },
    { q: "Combien font 7 x 8 ?", a: "54", b: "56", c: "58", correct: "B" },
    { q: "Quel est le theoreme qui relie les cotes d'un triangle rectangle ?", a: "Theoreme de Thales", b: "Theoreme de Pythagore", c: "Theoreme d'Euclide", correct: "B" },
    { q: "Quelle est la derivee de x² ?", a: "x", b: "2x", c: "2", correct: "B" },
    { q: "Combien font 15² ?", a: "225", b: "250", c: "275", correct: "A" },
    { q: "Quelle est la racine carree de 64 ?", a: "6", b: "7", c: "8", correct: "C" },
    { q: "Combien de degres dans un angle droit ?", a: "90°", b: "180°", c: "360°", correct: "A" },
    { q: "Quel est le perimetre d'un carre de cote 5 cm ?", a: "20 cm", b: "25 cm", c: "30 cm", correct: "A" },
    { q: "Combien font 3/4 + 1/2 ?", a: "1", b: "1.25", c: "1.5", correct: "B" }
  ],
  "histoire": [
    { q: "Qui a ete le premier president de la Cote d'Ivoire ?", a: "Felix Houphouet-Boigny", b: "Laurent Gbagbo", c: "Alassane Ouattara", correct: "A" },
    { q: "En quelle annee la Cote d'Ivoire a-t-elle obtenu son independance ?", a: "1958", b: "1960", c: "1962", correct: "B" },
    { q: "Quelle etait la capitale de la Cote d'Ivoire avant Yamoussoukro ?", a: "Abidjan", b: "Bouake", c: "Daloa", correct: "A" },
    { q: "Quel empire ou royaume etait present en Afrique de l'Ouest avant la colonisation ?", a: "Empire Songhai", b: "Empire Romain", c: "Empire Ottoman", correct: "A" },
    { q: "Qui etait Samori Toure ?", a: "Un resistant a la colonisation francaise", b: "Le premier president du Mali", c: "Un roi traditionnel ivoirien", correct: "A" },
    { q: "En quelle annee a eu lieu la conference de Berlin sur le partage de l'Afrique ?", a: "1884-1885", b: "1890-1891", c: "1900-1901", correct: "A" },
    { q: "Quel pays a colonise la Cote d'Ivoire ?", a: "La France", b: "L'Angleterre", c: "Le Portugal", correct: "A" },
    { q: "Qui etait la reine de l'empire ashanti au 19eme siecle ?", a: "Yaa Asantewaa", b: "Nzinga", c: "Amina", correct: "A" },
    { q: "Quelle etait la capitale de l'empire du Ghana ?", a: "Koumbi Saleh", b: "Tombouctou", c: "Gao", correct: "A" },
    { q: "En quelle annee la Cote d'Ivoire est devenue une republique ?", a: "1958", b: "1960", c: "1961", correct: "A" }
  ]
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function NeuroQuiz() {
  const [solde, setSolde] = useState(1000)
  const [mise, setMise] = useState('100')
  const [discipline, setDiscipline] = useState('')
  const [isProcessingMise, setIsProcessingMise] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [quizVisible, setQuizVisible] = useState(false)
  const [headerHidden, setHeaderHidden] = useState(false)
  const [introOpacity, setIntroOpacity] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null)
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [usedIndices, setUsedIndices] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(5)
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

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const miseInputRef = useRef<HTMLInputElement>(null)
  const disciplineSelectRef = useRef<HTMLSelectElement>(null)

  const miseNum = parseFloat(mise) || 0
  const isValidMise = miseNum >= 100 && miseNum <= 1000 && miseNum <= solde && !isProcessingMise

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

  const startCountdown = useCallback(() => {
    clearTimer()
    setTimeLeft(5)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1
        if (newTime <= 0) {
          clearTimer()
          setTimeout(() => {
            if (!selectedAnswer) {
              setSelectedAnswer('')
              const lastIndex = usedIndices[usedIndices.length - 1]
              if (lastIndex !== undefined) {
                const qData = questions[discipline][lastIndex]
                checkAnswer(qData)
              }
            }
          }, 100)
        }
        return newTime
      })
    }, 1000)
  }, [clearTimer, selectedAnswer, usedIndices, discipline])

  const getRandomIndex = useCallback(() => {
    const total = questions[discipline].length
    if (usedIndices.length === total) return -1
    let index: number
    do {
      index = Math.floor(Math.random() * total)
    } while (usedIndices.includes(index))
    return index
  }, [discipline, usedIndices])

  const endQuiz = useCallback(() => {
    clearTimer()
    setCurrentQuestion(null)
    setChoices([])

    if (errors >= 3) {
      setPopupType('failure')
      setPopupContent(
        <div className="space-y-2">
          <p>Vous avez fait 3 erreurs ou plus.</p>
          <p>Score final : <strong>{score}/5</strong></p>
          <p>Erreurs : <strong>{errors}</strong></p>
          <p className="mt-4">Votre mise de <strong>{miseNum.toFixed(2)} XOF</strong> n'a pas ete recuperee.</p>
          <p>Votre solde total est maintenant de <strong>{solde.toFixed(2)} XOF</strong></p>
        </div>
      )
    } else if (errors === 0) {
      const gain = miseNum * 2
      const newSolde = solde + gain
      setSolde(newSolde)
      localStorage.setItem("soldeTotal", newSolde.toFixed(2))
      setPopupType('success')
      setPopupContent(
        <div className="space-y-2">
          <p>Felicitations ! Vous n'avez fait aucune erreur.</p>
          <p>Score final : <strong>{score}/5</strong></p>
          <p>Erreurs : <strong>{errors}</strong></p>
          <div className="mt-4">
            <h3 className="mb-2 text-lg font-semibold">Detail de vos gains :</h3>
            <div className="flex justify-between py-2 border-b border-white/10"><span>Votre mise :</span><span>{miseNum.toFixed(2)} XOF</span></div>
            <div className="flex justify-between py-2 border-b border-white/10"><span>Bonus victoire parfaite :</span><span>{miseNum.toFixed(2)} XOF</span></div>
            <div className="flex justify-between py-2 font-bold text-yellow-400"><span>Gain total :</span><span>{gain.toFixed(2)} XOF</span></div>
          </div>
          <p className="mt-4">Votre solde total est maintenant de <strong>{newSolde.toFixed(2)} XOF</strong></p>
        </div>
      )
    } else {
      const gain = miseNum * 2
      const newSolde = solde + gain
      setSolde(newSolde)
      localStorage.setItem("soldeTotal", newSolde.toFixed(2))
      setPopupType('success')
      setPopupContent(
        <div className="space-y-2">
          <p>Bravo ! Vous avez termine le quiz.</p>
          <p>Score final : <strong>{score}/5</strong></p>
          <p>Erreurs : <strong>{errors}</strong></p>
          <div className="mt-4">
            <h3 className="mb-2 text-lg font-semibold">Detail de vos gains :</h3>
            <div className="flex justify-between py-2 border-b border-white/10"><span>Votre mise :</span><span>{miseNum.toFixed(2)} XOF</span></div>
            <div className="flex justify-between py-2 border-b border-white/10"><span>Bonus de victoire :</span><span>{miseNum.toFixed(2)} XOF</span></div>
            <div className="flex justify-between py-2 font-bold text-yellow-400"><span>Gain total :</span><span>{gain.toFixed(2)} XOF</span></div>
          </div>
          <p className="mt-4">Votre solde total est maintenant de <strong>{newSolde.toFixed(2)} XOF</strong></p>
        </div>
      )
    }
    setShowPopup(true)
  }, [clearTimer, errors, score, miseNum, solde])

  const checkAnswer = useCallback((questionData: QuestionData) => {
    if (selectedAnswer === questionData.correct) {
      setScore(prev => prev + 1)
      setResultMessage('Bonne reponse !')
      setResultClass('bg-emerald-400/20 text-emerald-300 border-2 border-emerald-400/50')
      setScorePulse(true)
      setTimeout(() => setScorePulse(false), 1000)
    } else {
      setErrors(prev => {
        const newErrors = prev + 1
        if (newErrors >= 3) {
          setTimeout(() => endQuiz(), 1500)
        }
        return newErrors
      })
      setResultMessage(`Mauvaise reponse. La bonne reponse etait : ${questionData.correct}`)
      setResultClass('bg-red-400/20 text-red-300 border-2 border-red-400/50')
    }
    setShowResult(true)

    setTimeout(() => {
      if (usedIndices.length < 5 && errors < 3) {
        displayQuestion()
      } else if (usedIndices.length >= 5 || errors >= 3) {
        endQuiz()
      }
    }, 2000)
  }, [selectedAnswer, usedIndices.length, errors, endQuiz])

  const displayQuestion = useCallback(() => {
    const index = getRandomIndex()
    if (index === -1 || usedIndices.length >= 5) {
      endQuiz()
      return
    }

    const newUsedIndices = [...usedIndices, index]
    setUsedIndices(newUsedIndices)
    const qData = questions[discipline][index]
    setCurrentQuestion(qData)
    setSelectedAnswer('')
    setTimeLeft(5)
    setShowResult(false)
    setResultMessage('')
    setResultClass('')
    setChoicesVisible(false)

    const newChoices = [
      { letter: 'A', text: qData.a },
      { letter: 'B', text: qData.b },
      { letter: 'C', text: qData.c }
    ]
    setChoices(newChoices)

    setTimeout(() => setChoicesVisible(true), 50)

    clearTimer()
    startCountdown()
  }, [getRandomIndex, usedIndices, discipline, clearTimer, startCountdown, endQuiz])

  const handleStartQuiz = useCallback(async () => {
    if (isProcessingMise) return

    const m = parseFloat(mise)
    const disc = discipline

    if (!m || m < 100 || m > 1000) {
      showNotification("La mise doit etre entre 100 et 1000 XOF.", "error")
      miseInputRef.current?.focus()
      return
    }
    if (!disc) {
      showNotification("Veuillez choisir une discipline.", "error")
      return
    }
    if (m > solde) {
      showNotification("Solde insuffisant !", "error")
      return
    }

    setIsProcessingMise(true)
    setStartButtonPulse(false)

    try {
      await new Promise(resolve => setTimeout(resolve, 5000))
      setHeaderHidden(true)
      setIntroOpacity(0)

      setTimeout(() => {
        const newSolde = solde - m
        setSolde(newSolde)
        localStorage.setItem("soldeTotal", newSolde.toFixed(2))
        setScore(0)
        setErrors(0)
        setUsedIndices([])
        setTimeLeft(5)
        setGameStarted(true)
        setQuizVisible(true)

        setTimeout(() => {
          setQuizVisible(true)
          displayQuestion()
        }, 100)
      }, 500)
    } finally {
      setIsProcessingMise(false)
    }
  }, [isProcessingMise, mise, discipline, solde, showNotification, displayQuestion])

  const handleReturnToHome = useCallback(() => {
    setShowPopup(false)
    setHeaderHidden(false)
    setQuizVisible(false)
    setGameStarted(false)
    setIntroOpacity(1)
    clearTimer()
  }, [clearTimer])

  const handleSelectAnswer = useCallback((letter: string) => {
    if (selectedAnswer) return
    setSelectedAnswer(letter)
    clearTimer()
    if (currentQuestion) {
      checkAnswer(currentQuestion)
    }
  }, [selectedAnswer, clearTimer, currentQuestion, checkAnswer])

  useEffect(() => {
    const savedSolde = localStorage.getItem("soldeTotal")
    if (savedSolde) {
      setSolde(parseFloat(savedSolde))
    } else {
      localStorage.setItem("soldeTotal", "1000")
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

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
              <div className="text-xs sm:text-sm text-white/80 mt-0.5">VOTRE SOLDE</div>
            </div>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setShowRulesPopup(true)}
              className="flex-1 sm:flex-none bg-purple-500/20 border-2 border-purple-500/50 text-purple-300 py-3 px-4 sm:px-5 rounded-xl font-bold cursor-pointer hover:bg-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap text-sm"
            >
              <HelpIcon />
              Regles
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
            Testez vos connaissances et gagnez des XOF
          </p>
        </header>

        {/* Intro Section */}
        {!gameStarted && (
          <div
            className="bg-white/[0.08] backdrop-blur-xl rounded-2xl p-6 sm:p-10 my-4 shadow-[0_15px_35px_rgba(0,0,0,0.3)] border border-white/[0.1] hover:-translate-y-1 transition-transform duration-300"
            style={{ opacity: introOpacity }}
          >
            <h2 className="text-xl sm:text-2xl mb-6 sm:mb-8 text-center text-blue-300 px-2.5">
              Faites votre mise et choisissez une discipline
            </h2>

            <div className="mb-5">
              <label className="block mb-2 text-gray-200 font-medium text-sm sm:text-base">Votre mise (XOF)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 text-lg">
                  <CoinsIcon />
                </span>
                <input
                  type="number"
                  ref={miseInputRef}
                  placeholder="Entrez votre mise (100-1000 XOF)"
                  min="100"
                  max="1000"
                  value={mise}
                  onChange={(e) => setMise(e.target.value)}
                  className="w-full py-4 sm:py-4.5 pl-12 pr-4 bg-white/[0.1] border-2 border-purple-500/30 rounded-xl text-white text-base sm:text-lg outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(108,92,231,0.3)] placeholder:text-white/60"
                />
              </div>
              <div className="flex justify-between mt-2 text-xs sm:text-sm">
                <span className="text-emerald-300">Minimum: 100 XOF</span>
                <span className="text-pink-300">Maximum: 1000 XOF</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-gray-200 font-medium text-sm sm:text-base">Discipline scientifique</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 text-lg">
                  <GraduationIcon />
                </span>
                <select
                  ref={disciplineSelectRef}
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full py-4 sm:py-4.5 pl-12 pr-4 bg-white/[0.1] border-2 border-purple-500/30 rounded-xl text-white text-base sm:text-lg outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(108,92,231,0.3)] cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='white'%3E%3Cpath d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 15px center',
                    backgroundSize: '12px'
                  }}
                >
                  <option value="" disabled>Choisissez une discipline</option>
                  <option value="svt">Sciences de la Vie et de la Terre</option>
                  <option value="pct">Physique-Chimie-Technologie</option>
                  <option value="philosophie">Philosophie</option>
                  <option value="maths">Mathematiques</option>
                  <option value="histoire">Histoire-Geographie</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={!isValidMise || isProcessingMise}
              className={`relative w-full py-4 sm:py-4.5 px-5 bg-gradient-to-r from-purple-500 to-purple-300 text-white font-semibold text-lg sm:text-xl rounded-xl cursor-pointer mt-8 sm:mt-10 shadow-[0_10px_20px_rgba(108,92,231,0.4)] hover:-translate-y-0.5 hover:shadow-[0_15px_25px_rgba(108,92,231,0.5)] active:translate-y-0.5 disabled:bg-gradient-to-r disabled:from-gray-500 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden ${
                startButtonPulse && isValidMise ? 'animate-pulse' : ''
              }`}
            >
              <span className={`flex items-center gap-3 transition-opacity duration-300 ${isProcessingMise ? 'opacity-0' : 'opacity-100'}`}>
                <PlayIcon />
                Commencer le Quiz
              </span>
              {isProcessingMise && (
                <div className="absolute w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
              )}
            </button>
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
              {currentQuestion ? currentQuestion.q : 'Quiz termine !'}
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
              <div>Temps restant: <span>{timeLeft}</span>s</div>
              <div className="h-1 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full mt-2 origin-left" style={{ transform: `scaleX(${timeLeft / 5})`, transition: 'transform 1s linear' }} />
            </div>

            {/* Stats */}
            <div className="flex overflow-x-auto gap-3 sm:gap-4 p-4 sm:p-5 bg-white/[0.05] rounded-2xl mb-4 scrollbar-thin">
              {[
                { value: score, label: 'BONNES REPONSES', color: 'text-cyan-400', pulse: scorePulse },
                { value: `${miseNum.toFixed(2)} XOF`, label: 'MISE ACTUELLE', color: 'text-yellow-400', pulse: false },
                { value: `${usedIndices.length}/5`, label: 'QUESTIONS', color: 'text-blue-300', pulse: false },
                { value: `${errors}/3`, label: 'MAUVAISES REPONSES', color: 'text-white', pulse: false }
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

      {/* ══════════════════════════════════════ */}
      {/* RESULT POPUP */}
      {/* ══════════════════════════════════════ */}
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
              {popupType === 'rules' && <BookIcon />}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight px-2.5">
              {popupType === 'success' ? (errors === 0 ? 'Victoire Parfaite !' : 'Victoire !') : popupType === 'failure' ? 'Echec !' : 'Regles du Jeu'}
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
              Retour a l'accueil
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════ */}
      {/* RULES POPUP */}
      {/* ══════════════════════════════════════ */}
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
              Regles du Jeu
            </h2>
          </div>

          <div className="text-base sm:text-lg leading-relaxed mb-6 flex-1 overflow-y-auto pr-1.5 scrollbar-thin">
            <ul className="space-y-3">
              {[
                { icon: <CoinsIcon />, text: <><strong>Mise :</strong> Entre 100 et 1000 XOF</> },
                { icon: <ClockIcon />, text: <><strong>Temps :</strong> 5 secondes par question</> },
                { icon: <GraduationIcon />, text: <><strong>Questions :</strong> 5 questions par discipline</> },
                { icon: <CloseCircleIcon className="!w-3.5 !h-3.5" />, text: <><strong>Echec automatique :</strong> 3 mauvaises reponses = fin de partie</> },
                { icon: <TrophyIcon className="!w-3.5 !h-3.5" />, text: <><strong>Victoire parfaite :</strong> Aucune mauvaise reponse = mise doublee</> },
                { icon: <MoneyIcon />, text: <><strong>Gains en cas de victoire :</strong> Mise multipliee par 2</> },
                { icon: <GamepadIcon />, text: <><strong>Deroulement :</strong> 5 questions selon la discipline choisie</> }
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
              J'ai compris !
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}