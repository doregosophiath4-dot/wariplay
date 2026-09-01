//'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// =====================================================
// SVG ICONS
// =====================================================
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const StoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
    <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const ReturnIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="M16 16h.01" />
  </svg>
)

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const GamepadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="11" x2="10" y2="11" />
    <line x1="8" y1="9" x2="8" y2="13" />
    <line x1="15" y1="12" x2="15.01" y2="12" />
    <line x1="18" y1="10" x2="18.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
)

const HistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const SpinnerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const LoadingSpinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

// =====================================================
// TYPES
// =====================================================
interface GameFromJson {
  name: string
  image_url: string
  description: string
  gains: number
}

interface GameDisplay {
  name: string
  image: string
  fallbackIcon: string
  color: string
  description: string
  difficulty: string
  reward: string
  gains: number
}

// =====================================================
// FONCTION POUR OBTENIR L'URL DYNAMIQUE
// =====================================================
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location
    const portPart = port ? `:${port}` : ''
    return `${protocol}//${hostname}${portPart}`
  }
  return 'http://localhost:3000'
}

// =====================================================
// COMPONENT
// =====================================================
export default function WariPlayPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [loading, setLoading] = useState(true)
  const [coins, setCoins] = useState(5)
  const [totalStars, setTotalStars] = useState(0)
  const [vies, setVies] = useState(0)
  const [showGameSelectionModal, setShowGameSelectionModal] = useState(false)
  const [showBetModal, setShowBetModal] = useState(false)
  const [showObjectiveModal, setShowObjectiveModal] = useState(false)
  const [showGameFrame, setShowGameFrame] = useState(false)
  const [selectedBet, setSelectedBet] = useState<number | null>(null)
  const [customBet, setCustomBet] = useState(100)
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)
  const [countdown, setCountdown] = useState(5)
  const [selectedGame, setSelectedGame] = useState<GameDisplay | null>(null)
  const [betLoading, setBetLoading] = useState(false)
  const [gameLoading, setGameLoading] = useState(false)
  const [games, setGames] = useState<GameDisplay[]>([])
  const [gamesLoaded, setGamesLoaded] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  // Données des niveaux pour chaque jeu
  const playerLevels = [
    {
      gameName: 'Rot Blade',
      gameIcon: '🧟',
      level: 4,
      difficulty: 'Facile',
      difficultyColor: 'bg-emerald-500',
      currentObjective: 'Tuer 50 zombies',
      reward: '100 pièces',
      nextLevel: {
        level: 5,
        objective: 'Tuer 100 zombies',
        reward: '250 pièces'
      },
      gradient: 'from-violet-500 to-fuchsia-500'
    },
    {
      gameName: 'Dragon Quest',
      gameIcon: '🐉',
      level: 2,
      difficulty: 'Moyen',
      difficultyColor: 'bg-amber-500',
      currentObjective: 'Vaincre le dragon de feu',
      reward: '250 pièces',
      nextLevel: {
        level: 3,
        objective: 'Vaincre le dragon de glace',
        reward: '500 pièces'
      },
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      gameName: 'Space Warriors',
      gameIcon: '🚀',
      level: 7,
      difficulty: 'Difficile',
      difficultyColor: 'bg-orange-500',
      currentObjective: 'Détruire 30 vaisseaux ennemis',
      reward: '500 pièces',
      nextLevel: {
        level: 8,
        objective: 'Détruire le vaisseau mère',
        reward: '1000 pièces'
      },
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      gameName: 'Ninja Arena',
      gameIcon: '🥷',
      level: 12,
      difficulty: 'Expert',
      difficultyColor: 'bg-rose-500',
      currentObjective: 'Maîtriser 5 techniques secrètes',
      reward: '750 pièces',
      nextLevel: {
        level: 13,
        objective: 'Vaincre le maître ninja',
        reward: '1500 pièces'
      },
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      gameName: 'Pirate Battle',
      gameIcon: '🏴‍☠️',
      level: 3,
      difficulty: 'Moyen',
      difficultyColor: 'bg-amber-500',
      currentObjective: 'Piller 10 navires marchands',
      reward: '300 pièces',
      nextLevel: {
        level: 4,
        objective: 'Trouver le trésor légendaire',
        reward: '600 pièces'
      },
      gradient: 'from-teal-500 to-emerald-500'
    }
  ]

  const navItems = [
    { key: 'home', icon: <HomeIcon />, label: 'Accueil' },
    { key: 'shop', icon: <StoreIcon />, label: 'Magasin' },
    { key: 'events', icon: <CalendarIcon />, label: 'Evenements' },
    { key: 'settings', icon: <SettingsIcon />, label: 'Parametres' }
  ]

  const shopItems = [
    { id: 1, name: 'Epee de Feu', price: 500, icon: '🗡️', color: 'from-violet-500 to-fuchsia-500' },
    { id: 2, name: 'Bouclier d\'Or', price: 750, icon: '🛡️', color: 'from-amber-500 to-yellow-500' },
    { id: 3, name: 'Potion de Vie', price: 300, icon: '🧪', color: 'from-emerald-500 to-teal-500' },
    { id: 4, name: 'Casque Magique', price: 600, icon: '⚔️', color: 'from-cyan-500 to-blue-500' }
  ]

  const events = [
    { id: 1, title: 'Tournoi Hebdomadaire', description: 'Participez au tournoi et gagnez des recompenses', time: '3 jours', icon: '🏆' },
    { id: 2, title: 'Double XP Weekend', description: 'Gagnez le double d\'experience ce weekend', time: '2 jours', icon: '⚡' },
    { id: 3, title: 'Nouveau Boss', description: 'Un nouveau boss est disponible dans le jeu', time: '5 jours', icon: '👹' }
  ]

  const notifications = [
    { id: 1, text: 'Nouvel evenement disponible !', time: 'Il y a 2h' },
    { id: 2, text: 'Vous avez recu 50 pieces bonus', time: 'Il y a 5h' },
    { id: 3, text: 'Mise a jour du magasin', time: 'Il y a 1 jour' }
  ]

  // Fonction pour générer l'URL du jeu
  const getGameUrl = (gameName: string) => {
    const baseUrl = getBaseUrl()
    const gameSlug = gameName.toLowerCase().replace(/\s+/g, '-')
    return `${baseUrl}/games/${gameSlug}/`
  }

  // Fonction pour démarrer le jeu
  const startGame = () => {
    setShowObjectiveModal(false)
    setShowGameFrame(true)
    setIframeLoading(true)
  }

  // Gestionnaire de chargement iframe
  const handleIframeLoad = () => {
    setIframeLoading(false)
  }

  // Réinitialiser l'état de l'iframe
  useEffect(() => {
    if (showGameFrame) {
      setIframeLoading(true)
    }
  }, [showGameFrame, selectedGame])

  // Chargement des jeux depuis le fichier JSON
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/games.json')
        const data = await response.json()
        
        const colors = [
          'from-violet-600 to-fuchsia-600',
          'from-cyan-600 to-blue-600',
          'from-indigo-600 to-purple-600',
          'from-pink-600 to-rose-600',
          'from-teal-600 to-emerald-600',
          'from-amber-600 to-orange-600',
          'from-blue-600 to-indigo-600',
          'from-emerald-600 to-teal-600'
        ]
        
        const fallbackIcons = ['🧟', '🐉', '🚀', '🥷', '🏴‍☠️', '⚔️', '🛡️', '🎯']
        
        const formattedGames: GameDisplay[] = data.games.map((game: GameFromJson, index: number) => ({
          name: game.name,
          image: game.image_url,
          fallbackIcon: fallbackIcons[index % fallbackIcons.length],
          color: colors[index % colors.length],
          description: game.description,
          difficulty: index === 0 ? 'Facile' : index === 1 ? 'Moyen' : index === 2 ? 'Difficile' : index === 3 ? 'Expert' : 'Moyen',
          reward: `${game.gains} pièces`,
          gains: game.gains
        }))
        
        setGames(formattedGames)
        setGamesLoaded(true)
      } catch (error) {
        console.error('Erreur lors du chargement des jeux:', error)
        setGamesLoaded(true)
      }
    }
    
    fetchGames()
  }, [])

  // Changement automatique du niveau toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLevelIndex((prevIndex) => 
        prevIndex === playerLevels.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const currentPlayerLevel = playerLevels[currentLevelIndex]

  // Canvas background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let time = 0

    const draw = () => {
      if (!ctx || !canvas) return
      ctx.fillStyle = 'rgba(10, 14, 26, 0.3)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      time += 0.008

      for (let waveIndex = 0; waveIndex < 5; waveIndex++) {
        ctx.beginPath()
        ctx.strokeStyle = `hsla(${250 + waveIndex * 15}, 70%, ${45 + waveIndex * 5}%, ${0.06 + waveIndex * 0.02})`
        ctx.lineWidth = 1.2 + waveIndex * 0.2

        for (let x = 0; x < canvas.width; x += 5) {
          const y =
            canvas.height * 0.4 +
            Math.sin(x * 0.003 + time * 0.5 + waveIndex) * 50 +
            Math.cos(x * 0.001 + time * 0.3) * 70 +
            Math.sin(x * 0.005 + waveIndex * 1.5) * 30 +
            waveIndex * 55

          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      for (let i = 0; i < 12; i++) {
        const px = (Math.sin(time * 0.7 + i * 2.1) * 0.5 + 0.5) * canvas.width
        const py = (Math.cos(time * 0.5 + i * 1.7) * 0.5 + 0.5) * canvas.height
        const radius = 1 + Math.sin(time * 2 + i) * 0.5

        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${260 + i * 20}, 70%, 60%, ${0.08 + Math.sin(time + i) * 0.04})`
        ctx.fill()
      }

      requestAnimationFrame(draw)
    }
    draw()

    return () => window.removeEventListener('resize', resize)
  }, [])

  // Loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Countdown for objective modal
  useEffect(() => {
    if (!showObjectiveModal || countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [showObjectiveModal, countdown])

  const handlePlay = () => {
    setShowGameSelectionModal(true)
  }

  const handleGameSelect = (game: GameDisplay) => {
    setGameLoading(true)
    setSelectedGame(game)
    
    setTimeout(() => {
      setGameLoading(false)
      setShowGameSelectionModal(false)
      setShowBetModal(true)
    }, 1500)
  }

  const handleBetSelect = (amount: number) => {
    setSelectedBet(amount)
    setCustomBet(amount)
  }

  const handleBetConfirm = () => {
    setBetLoading(true)
    
    setTimeout(() => {
      setBetLoading(false)
      setShowBetModal(false)
      setShowObjectiveModal(true)
      setCountdown(5)
    }, 2000)
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    setSidebarOpen(false)
  }

  return (
    <div className="relative min-h-screen text-[#F8FAFC] overflow-x-hidden bg-[#0A0F1A]">
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
        style={{ opacity: 0.5 }}
      />

      {/* Orbs - Tons violets/roses */}
      <div className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0 -top-[15%] -right-[10%] animate-[float1_12s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed w-[350px] h-[350px] rounded-full pointer-events-none z-0 -bottom-[10%] -left-[5%] animate-[float2_15s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      {/* Loading Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-[#0A0F1A] z-[2000] flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-violet-400">
              <SpinnerIcon />
            </div>
            <p className="text-amber-400 text-lg font-['Orbitron',sans-serif] animate-pulse">Chargement...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="relative z-10 flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-[280px] lg:h-screen lg:sticky lg:top-0 bg-[#0F172A] border-r border-white/10 flex-shrink-0">
          <div className="px-6 py-6 border-b border-white/10">
            <h1 className="text-3xl font-['Orbitron',sans-serif] font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              WariPlay
            </h1>
            <p className="text-xs text-slate-400 mt-1">Target</p>
          </div>

          <nav className="flex-1 py-6 space-y-2 overflow-y-auto">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => handleSectionChange(item.key)}
                className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all duration-300 border-l-4 ${
                  activeSection === item.key
                    ? 'bg-white/5 text-white border-l-violet-500'
                    : 'text-slate-400 border-l-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
            <Link
              href="/home"
              className="w-full flex items-center gap-4 px-6 py-4 text-left text-slate-400 border-l-4 border-l-transparent hover:bg-white/5 hover:text-white transition-all duration-300"
            >
              <span className="flex-shrink-0"><ReturnIcon /></span>
              <span className="text-sm font-medium">Retour</span>
            </Link>
          </nav>

          <div className="px-6 py-5 border-t border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
              J
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">Joueur</div>
              <div className="text-xs text-amber-400 flex items-center gap-1">
                <CoinsIcon /> {coins}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              
              <motion.aside
                className="fixed top-0 left-0 h-full w-[300px] bg-[#0F172A] z-[100] lg:hidden flex flex-col shadow-2xl"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                <div className="px-6 py-6 border-b border-white/10">
                  <h1 className="text-3xl font-['Orbitron',sans-serif] font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    WariPlay
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">Target</p>
                </div>

                <nav className="flex-1 py-6 space-y-2 overflow-y-auto">
                  {navItems.map(item => (
                    <button
                      key={item.key}
                      onClick={() => handleSectionChange(item.key)}
                      className={`w-full flex items-center gap-4 px-6 py-5 text-left transition-all duration-300 border-l-4 ${
                        activeSection === item.key
                          ? 'bg-white/5 text-white border-l-violet-500'
                          : 'text-slate-400 border-l-transparent hover:bg-white/5 hover:text-white active:bg-white/10'
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="text-base font-medium">{item.label}</span>
                    </button>
                  ))}
                  <Link
                    href="/home"
                    className="w-full flex items-center gap-4 px-6 py-5 text-left text-slate-400 border-l-4 border-l-transparent hover:bg-white/5 hover:text-white active:bg-white/10 transition-all duration-300"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="flex-shrink-0"><ReturnIcon /></span>
                    <span className="text-base font-medium">Retour</span>
                  </Link>
                </nav>

                <div className="px-6 py-5 border-t border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                    J
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-bold text-white truncate">Joueur</div>
                    <div className="text-sm text-amber-400 flex items-center gap-1">
                      <CoinsIcon /> {coins}
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <header className="sticky top-0 z-[80] h-[70px] bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white hover:text-amber-400 transition-colors p-2 -ml-2"
              aria-label="Menu"
            >
              <MenuIcon />
            </button>

            <h2 className="text-lg sm:text-xl font-['Orbitron',sans-serif] font-bold text-white truncate px-2">
              {navItems.find(n => n.key === activeSection)?.label || 'Accueil'}
            </h2>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-1.5 bg-[#1E293B]/80 px-3 py-2 rounded-full text-sm">
                <CoinsIcon /> {coins}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-[#1E293B]/80 px-3 py-2 rounded-full text-sm">
                <StarIcon /> {totalStars}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-[#1E293B]/80 px-3 py-2 rounded-full text-sm">
                <HeartIcon /> {vies}
              </div>
              <div className="sm:hidden flex items-center gap-1.5 bg-[#1E293B]/80 px-3 py-2 rounded-full text-xs">
                <CoinsIcon /> {coins}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Home Section */}
            {activeSection === 'home' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="relative rounded-2xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-violet-600 to-fuchsia-600">
                  <h2 className="text-2xl sm:text-3xl font-['Orbitron',sans-serif] font-bold text-white mb-3">
                    Bienvenue, Ninja!
                  </h2>
                  <p className="text-white/80 text-sm sm:text-base max-w-xl mb-5">
                    Découvrez des jeux de même catégorie qui convergent vers le même objectif. 
                    Améliorez-vous, remplissez des objectifs pour gagner gros et profitez des 
                    événements pour vous faire de l&apos;argent en parallèle !
                  </p>
                  <button
                    onClick={handlePlay}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black/30 border-2 border-white text-white rounded-full font-['Orbitron',sans-serif] font-bold text-sm hover:bg-white hover:text-violet-600 transition-all duration-300"
                  >
                    <PlayIcon /> Jouer maintenant
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-2xl p-5 border border-white/10 bg-[#1E293B]/80 backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-['Orbitron',sans-serif] text-amber-400 text-lg flex items-center gap-2">
                        <ChartIcon /> Statistiques
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-slate-400">Parties jouees</span><span className="text-white font-medium">42</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Victoires</span><span className="text-white font-medium">28</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Zombies tues</span><span className="text-white font-medium">1,247</span></div>
                    </div>
                  </div>

                  <div className="rounded-2xl p-5 border border-white/10 bg-[#1E293B]/80 backdrop-blur-xl overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-['Orbitron',sans-serif] text-amber-400 text-lg flex items-center gap-2">
                        <GamepadIcon /> Votre Niveau
                      </h3>
                      <div className="flex items-center gap-1.5">
                        {playerLevels.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentLevelIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentLevelIndex 
                                ? 'bg-violet-500 w-4' 
                                : 'bg-white/20 hover:bg-white/40'
                            }`}
                            aria-label={`Niveau ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentLevelIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`bg-gradient-to-br ${currentPlayerLevel.gradient} rounded-xl p-4 text-white`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{currentPlayerLevel.gameIcon}</span>
                          <div>
                            <h4 className="font-bold text-sm">{currentPlayerLevel.gameName}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-2xl font-bold">Niveau {currentPlayerLevel.level}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${currentPlayerLevel.difficultyColor} uppercase`}>
                                {currentPlayerLevel.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="bg-white/10 rounded-lg p-3">
                            <p className="text-xs opacity-80 mb-1">Objectif actuel :</p>
                            <p className="text-sm font-bold">{currentPlayerLevel.currentObjective}</p>
                            <p className="text-xs opacity-80 mt-1">
                              Récompense : <span className="text-amber-300 font-bold">{currentPlayerLevel.reward}</span>
                            </p>
                          </div>

                          <div className="bg-white/10 rounded-lg p-3 border-l-4 border-amber-400">
                            <p className="text-xs opacity-80 mb-1">Niveau {currentPlayerLevel.nextLevel.level} :</p>
                            <p className="text-sm font-bold">{currentPlayerLevel.nextLevel.objective}</p>
                            <p className="text-xs opacity-80 mt-1">
                              Récompense : <span className="text-amber-300 font-bold">{currentPlayerLevel.nextLevel.reward}</span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <motion.div 
                            className="h-full bg-white rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentPlayerLevel.level / (currentPlayerLevel.nextLevel.level + 2)) * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="rounded-2xl p-5 border border-white/10 bg-[#1E293B]/80 backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-['Orbitron',sans-serif] text-amber-400 text-lg flex items-center gap-2">
                        <HistoryIcon /> Derniere partie
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-slate-400">Score</span><span className="text-white font-medium">12,450</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Duree</span><span className="text-white font-medium">8:32</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Zombies tues</span><span className="text-white font-medium">87</span></div>
                    </div>
                  </div>

                  <div className="rounded-2xl p-5 border border-white/10 bg-[#1E293B]/80 backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-['Orbitron',sans-serif] text-amber-400 text-lg flex items-center gap-2">
                        <BellIcon /> Notifications
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {notifications.map(n => (
                        <div key={n.id} className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-400">
                            <BellIcon />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-white">{n.text}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shop Section */}
            {activeSection === 'shop' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-white mb-5">Magasin</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {shopItems.map(item => (
                    <motion.div
                      key={item.id}
                      className="rounded-xl overflow-hidden bg-[#1E293B]/80 border border-white/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`h-28 bg-gradient-to-br ${item.color} flex items-center justify-center text-4xl`}>
                        {item.icon}
                      </div>
                      <div className="p-3">
                        <div className="font-bold text-sm text-white mb-1">{item.name}</div>
                        <div className="text-amber-400 text-xs flex items-center gap-1 mb-3">
                          <CoinsIcon /> {item.price}
                        </div>
                        <button className="w-full py-2 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-colors active:scale-95">
                          Acheter
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Events Section */}
            {activeSection === 'events' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-white mb-5">Evenements</h2>
                <div className="space-y-4">
                  {events.map(event => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-[#1E293B]/80 border border-white/10 hover:border-violet-500/30 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl flex-shrink-0">
                        {event.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm">{event.title}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{event.description}</div>
                      </div>
                      <div className="bg-black/30 px-3 py-1.5 rounded-full text-xs text-amber-400 whitespace-nowrap flex-shrink-0">
                        {event.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-bold text-white mb-5">Parametres</h2>

                <div className="rounded-2xl p-5 border border-white/10 bg-[#1E293B]/80 mb-5">
                  <h3 className="font-['Orbitron',sans-serif] text-amber-400 mb-4">Audio</h3>
                  {[
                    { label: 'Volume general', desc: 'Ajuste le volume global du jeu', value: 80 },
                    { label: 'Musique', desc: 'Volume de la musique de fond', value: 70 },
                    { label: 'Effets sonores', desc: 'Volume des effets sonores', value: 90 }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-white/5 last:border-0 gap-2">
                      <div>
                        <div className="text-sm text-white">{item.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        defaultValue={item.value} 
                        className="w-full sm:w-24 accent-violet-500 h-2 rounded-full appearance-none bg-white/10 cursor-pointer" 
                      />
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl p-5 border border-white/10 bg-[#1E293B]/80 mb-5">
                  <h3 className="font-['Orbitron',sans-serif] text-amber-400 mb-4">Gameplay</h3>
                  {[
                    { label: 'Sensibilite', desc: 'Ajuste la sensibilite des commandes' },
                    { label: 'Inverser l\'axe Y', desc: 'Inverse l\'axe vertical', toggle: true },
                    { label: 'Mode daltonien', desc: 'Active les couleurs adaptees', toggle: true }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-white/5 last:border-0 gap-3">
                      <div>
                        <div className="text-sm text-white">{item.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                      {item.toggle ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                        </label>
                      ) : (
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          defaultValue={50} 
                          className="w-full sm:w-24 accent-violet-500 h-2 rounded-full appearance-none bg-white/10 cursor-pointer" 
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl p-5 border border-white/10 bg-[#1E293B]/80">
                  <h3 className="font-['Orbitron',sans-serif] text-amber-400 mb-4">Interface</h3>
                  {[
                    { label: 'Theme sombre', desc: 'Utilise le theme sombre par defaut', checked: true },
                    { label: 'Animations', desc: 'Active les animations', checked: true },
                    { label: 'Notifications', desc: 'Active les notifications push', checked: true }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-white/5 last:border-0 gap-3">
                      <div>
                        <div className="text-sm text-white">{item.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Selection Modal */}
      <AnimatePresence>
        {showGameSelectionModal && (
          <motion.div
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGameSelectionModal(false)}
          >
            <motion.div
              className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl bg-[#0F172A] border border-white/20 shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-shrink-0 bg-[#0F172A] border-b border-white/10 p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-['Orbitron',sans-serif] font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      Choisissez votre jeu
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Sélectionnez un jeu pour commencer l&apos;aventure</p>
                  </div>
                  <button
                    onClick={() => setShowGameSelectionModal(false)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {!gamesLoaded ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-violet-400 mb-4">
                      <LoadingSpinner />
                    </div>
                    <p className="text-white text-lg font-['Orbitron',sans-serif]">
                      Chargement des jeux...
                    </p>
                  </div>
                ) : gameLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-violet-400 mb-4">
                      <LoadingSpinner />
                    </div>
                    <p className="text-white text-lg font-['Orbitron',sans-serif]">
                      Lancement de {selectedGame?.name}...
                    </p>
                  </div>
                ) : games.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-slate-400 text-lg">Aucun jeu disponible pour le moment</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {games.map((game, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleGameSelect(game)}
                        className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all duration-300 text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative w-full h-40 overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-60`} />
                          <img 
                            src={game.image} 
                            alt={game.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                const fallback = parent.querySelector('.fallback-icon') as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }
                            }}
                          />
                          <div className="fallback-icon absolute inset-0 items-center justify-center text-6xl hidden">
                            {game.fallbackIcon}
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-white font-['Orbitron',sans-serif] font-bold text-lg">
                              Jouer
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-white mb-2">{game.name}</h3>
                          <p className="text-slate-400 text-sm mb-4 line-clamp-2">{game.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              game.difficulty === 'Facile' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                              game.difficulty === 'Moyen' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              game.difficulty === 'Difficile' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                              'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}>
                              {game.difficulty}
                            </span>
                            <span className="text-amber-400 text-sm font-bold flex items-center gap-1">
                              <CoinsIcon /> {game.reward}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bet Modal */}
      <AnimatePresence>
        {showBetModal && (
          <motion.div
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBetModal(false)}
          >
            <motion.div
              className="relative w-full max-w-lg rounded-3xl bg-[#0F172A] border border-white/20 shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl flex-shrink-0">
                      {selectedGame?.fallbackIcon}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-['Orbitron',sans-serif] font-bold text-white truncate">
                        {selectedGame?.name}
                      </h2>
                      <p className="text-slate-400 text-sm">Placez votre mise</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBetModal(false)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0 ml-2"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {betLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-violet-400 mb-4">
                      <LoadingSpinner />
                    </div>
                    <p className="text-white text-lg font-['Orbitron',sans-serif]">
                      Validation de la mise...
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-300 text-center mb-6">
                      Choisissez le montant que vous souhaitez miser pour cette partie
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[100, 200, 300].map(amount => (
                        <button
                          key={amount}
                          onClick={() => handleBetSelect(amount)}
                          className={`relative overflow-hidden rounded-xl py-4 text-lg font-bold transition-all duration-300 active:scale-95 ${
                            selectedBet === amount
                              ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 scale-105'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-1">
                            <CoinsIcon /> {amount}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mb-6">
                      <label className="block text-slate-400 text-sm mb-2">
                        Ou personnalisez votre mise :
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={customBet}
                          onChange={(e) => {
                            setCustomBet(Number(e.target.value))
                            setSelectedBet(null)
                          }}
                          min={100}
                          max={1000}
                          step={100}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white text-center text-lg focus:border-violet-500 focus:outline-none transition-all duration-300"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400">
                          <CoinsIcon />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleBetConfirm}
                      disabled={!selectedBet && customBet < 100}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-['Orbitron',sans-serif] font-bold text-lg hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      Confirmer la mise
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Objective Modal */}
      <AnimatePresence>
        {showObjectiveModal && (
          <motion.div
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowObjectiveModal(false)}
          >
            <motion.div
              className="relative w-full max-w-lg rounded-3xl bg-[#0F172A] border border-white/20 shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl flex-shrink-0">
                      {selectedGame?.fallbackIcon}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-['Orbitron',sans-serif] font-bold text-white truncate">
                        Objectif du niveau
                      </h2>
                      <p className="text-slate-400 text-sm truncate">{selectedGame?.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowObjectiveModal(false)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 flex-shrink-0 ml-2"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="text-2xl font-['Orbitron',sans-serif] text-white">
                    Niveau {currentPlayerLevel.level}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${currentPlayerLevel.difficultyColor} text-white`}>
                    {currentPlayerLevel.difficulty}
                  </span>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 mb-4 border border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">🎯</div>
                    <div className="min-w-0">
                      <p className="text-white text-base sm:text-lg mb-2">
                        Condition : <span className="text-amber-400 font-bold">{currentPlayerLevel.currentObjective}</span>
                      </p>
                      <p className="text-slate-400 text-sm">
                        Récompense : <span className="text-amber-400 font-bold">{currentPlayerLevel.reward}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 mb-6 border border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">💰</div>
                    <div className="min-w-0">
                      <p className="text-white text-base sm:text-lg mb-2">
                        Mise : <span className="text-amber-400 font-bold">{selectedBet || customBet} pièces</span>
                      </p>
                      <p className="text-slate-400 text-sm">
                        Gain potentiel : <span className="text-emerald-400 font-bold">{(selectedBet || customBet) * 2} pièces</span>
                      </p>
                    </div>
                  </div>
                </div>

                {countdown > 0 ? (
                  <>
                    <div className="text-5xl sm:text-6xl text-violet-400 font-['Orbitron',sans-serif] text-center mb-6">
                      {countdown}
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                        style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <button
                    onClick={startGame}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-['Orbitron',sans-serif] font-bold text-lg hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98] transition-all duration-300"
                  >
                    Commencer maintenant
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Iframe Modal - Minimal avec juste un bouton de fermeture transparent */}
      <AnimatePresence>
        {showGameFrame && selectedGame && (
          <motion.div
            className="fixed inset-0 z-[3000] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Bouton de fermeture transparent */}
            <button
              onClick={() => setShowGameFrame(false)}
              className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
              aria-label="Fermer le jeu"
            >
              <CloseIcon />
            </button>

            {/* Loader */}
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                <div className="text-violet-400 mb-4">
                  <LoadingSpinner />
                </div>
                <p className="text-white/80 text-lg font-['Orbitron',sans-serif]">
                  Chargement du jeu...
                </p>
              </div>
            )}

            {/* Iframe - Sandbox sans allow-same-origin */}
            <iframe
              ref={iframeRef}
              src={getGameUrl(selectedGame.name)}
              className="w-full h-full border-0"
              title={`Jeu ${selectedGame.name}`}
              sandbox="allow-scripts allow-forms allow-popups allow-presentation allow-orientation-lock allow-pointer-lock"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onLoad={handleIframeLoad}
              style={{
                display: iframeLoading ? 'none' : 'block'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}