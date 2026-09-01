'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

// =====================================================
// SVG ICONS
// =====================================================
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
)

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

const StoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" /><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
  </svg>
)

const GamepadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="11" x2="10" y2="11" /><line x1="8" y1="9" x2="8" y2="13" /><line x1="15" y1="12" x2="15.01" y2="12" /><line x1="18" y1="10" x2="18.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
)

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const UsersIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const FireIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CrownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 14h14v2H5v-2z" />
  </svg>
)

const SignalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
  </svg>
)

const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

// =====================================================
// TYPES
// =====================================================
interface Game {
  id: number
  name: string 
  image_url: string
  category: string
  players: number
  rating: number
  plays: string
  description: string
  isHot?: boolean
  isNew?: boolean
  isPremium?: boolean
}

export default function GamesPage() {
  useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showGameOverlay, setShowGameOverlay] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [showPlayOptions, setShowPlayOptions] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Chargement des jeux...')
  const [games, setGames] = useState<Game[]>([])
  const [featuredGames, setFeaturedGames] = useState<Game[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertData, setAlertData] = useState({ title: '', message: '', buttons: [] as { text: string; action: () => void }[] })
  const [proCheckLoading, setProCheckLoading] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const navItems = [
    { href: '/home', icon: <HomeIcon />, label: 'Home' },
    { href: '/target', icon: <TargetIcon />, label: 'Target' },
    { href: '/ordre', icon: <ListIcon />, label: 'Ordre' },
    { href: '/profile', icon: <UserIcon />, label: 'Profil' },
    { href: '/store', icon: <StoreIcon />, label: 'Wari Store' },
    { href: '/Game', icon: <GamepadIcon />, label: 'Games' },
    { href: '/stats', icon: <ChartIcon />, label: 'Stats' },
    { href: '/parametre', icon: <SettingsIcon />, label: 'Parametres' }
  ]

  const categories = ['Tous', 'Action', 'Strategie', 'Sport', 'Puzzle', 'Aventure', 'Premium']

  useEffect(() => {
    let cancelled = false
    async function loadGames() {
      setShowLoading(true)
      setLoadingText('Chargement des jeux...')
      try {
        await initAll()
        const res = await fetchWithAllTokens('/api/get-games')
        if (!res.ok) throw new Error('Erreur chargement des jeux')
        const data = await res.json()
        if (!cancelled && data && Array.isArray(data)) {
          const loadedGames: Game[] = data.map((game: any, index: number) => ({
            id: game.id || index + 1,
            name: game.name,
            image_url: game.image_url || '/img/WariPlay_Logo_Transparent.png',
            category: game.category || 'Action',
            players: game.players || 0,
            rating: game.rating || 4.5,
            plays: formatNumber(game.players || 0),
            description: game.description || '',
            isHot: game.isHot || false,
            isNew: game.isNew || false,
            isPremium: game.isPremium || false
          }))
          setGames(loadedGames)
          const featured = loadedGames.slice(0, Math.min(3, loadedGames.length))
          setFeaturedGames(featured.length > 0 ? featured : loadedGames.slice(0, 1))
          setDataLoaded(true)
        }
      } catch (error) {
        if (!cancelled) {
          setAlertData({ title: 'Erreur', message: 'Impossible de charger les jeux.', buttons: [{ text: 'OK', action: () => setShowAlertModal(false) }] })
          setShowAlertModal(true)
        }
      } finally {
        if (!cancelled) setShowLoading(false)
      }
    }
    loadGames()
    return () => { cancelled = true }
  }, [])

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    let time = 0
    const draw = () => {
      if (!ctx || !canvas) return
      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      time += 0.008
      for (let waveIndex = 0; waveIndex < 5; waveIndex++) {
        ctx.beginPath()
        ctx.strokeStyle = `hsla(${200 + waveIndex * 15}, 80%, ${45 + waveIndex * 5}%, ${0.06 + waveIndex * 0.02})`
        ctx.lineWidth = 1.2 + waveIndex * 0.2
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height * 0.4 + Math.sin(x * 0.003 + time * 0.5 + waveIndex) * 50 + Math.cos(x * 0.001 + time * 0.3) * 70 + Math.sin(x * 0.005 + waveIndex * 1.5) * 30 + waveIndex * 55
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      for (let i = 0; i < 12; i++) {
        const px = (Math.sin(time * 0.7 + i * 2.1) * 0.5 + 0.5) * canvas.width
        const py = (Math.cos(time * 0.5 + i * 1.7) * 0.5 + 0.5) * canvas.height
        const radius = 1 + Math.sin(time * 2 + i) * 0.5
        ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${180 + i * 20}, 80%, 60%, ${0.08 + Math.sin(time + i) * 0.04})`
        ctx.fill()
      }
      requestAnimationFrame(draw)
    }
    draw()
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    if (featuredGames.length === 0) return
    const interval = setInterval(() => setCurrentSlide(prev => (prev + 1) % featuredGames.length), 4000)
    return () => clearInterval(interval)
  }, [featuredGames.length])

  function formatNumber(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  function formatGameNameForUrl(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '_')
  }

  const filteredGames = activeCategory === 'Tous' ? games : games.filter(g => g.category === activeCategory)
  const nextSlide = () => { if (featuredGames.length > 0) setCurrentSlide(prev => (prev + 1) % featuredGames.length) }
  const prevSlide = () => { if (featuredGames.length > 0) setCurrentSlide(prev => (prev - 1 + featuredGames.length) % featuredGames.length) }

  const handlePlayFree = (game: Game) => {
    const formattedName = formatGameNameForUrl(game.name)
    setShowGameOverlay(false)
    setShowPlayOptions(false)
    router.push('/' + formattedName)
  }

  // Le loader plein écran s'affiche désormais pendant toute la durée de la
  // verification (avec le texte "Verification..."), pour ne jamais laisser
  // l'utilisateur sans retour visuel entre la fermeture du popup et la redirection.
  const handleCheckProAccess = async (game: Game) => {
    const formattedName = formatGameNameForUrl(game.name)
    setProCheckLoading(game.name)
    setShowGameOverlay(false)
    setShowPlayOptions(false)
    setLoadingText('Verification...')
    setShowLoading(true)
    try {
      const res = await fetchWithAllTokens('/api/check-pro-access', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_name: game.name })
      })
      const data = await res.json()
      if (data.has_access) { router.push('/' + formattedName + '1') }
      else if (data.requires_login) {
        setAlertData({ title: 'Connexion requise', message: 'Vous devez vous connecter.', buttons: [
          { text: 'Annuler', action: () => setShowAlertModal(false) },
          { text: 'Se connecter', action: () => { router.push('/connexion'); setShowAlertModal(false) } }
        ]}); setShowAlertModal(true)
      } else {
        setAlertData({ title: 'Version Pro', message: data.message || 'Acces Pro requis.', buttons: [
          { text: 'Annuler', action: () => setShowAlertModal(false) },
          { text: 'Obtenir', action: () => { router.push('/store'); setShowAlertModal(false) } }
        ]}); setShowAlertModal(true)
      }
    } catch (error) {
      setAlertData({ title: 'Erreur', message: 'Une erreur est survenue.', buttons: [{ text: 'OK', action: () => setShowAlertModal(false) }] })
      setShowAlertModal(true)
    } finally {
      setProCheckLoading(null)
      setShowLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ background: '#0a0a1a' }}>
      {/* Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" style={{ opacity: 0.4 }} />
      
      {/* Orbs */}
      <div className="fixed w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full pointer-events-none z-0 -top-[15%] -right-[10%] animate-[float1_12s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] rounded-full pointer-events-none z-0 -bottom-[10%] -left-[5%] animate-[float2_15s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      {/* Header */}
      <motion.header className="relative z-10 flex items-center justify-center pt-6 pb-3" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <motion.img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-12 sm:h-14 w-auto drop-shadow-[0_0_15px_rgba(0,200,150,0.5)]"
          animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3.5, repeat: Infinity }} />
      </motion.header>

      {/* Navigation */}
      <nav className="relative z-10 flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none sticky top-0 bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-emerald-400/10">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href
          const isTarget = item.href === '/target'
          return (
            <motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.93 }} className="flex-shrink-0">
              <Link href={item.href} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border whitespace-nowrap
                ${isActive ? 'bg-emerald-400/20 border-emerald-400/30 text-white' : isTarget ? 'bg-orange-500/15 border-orange-500/30 text-white' : 'bg-white/[0.04] border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.08]'}`}>
                <span className="flex-shrink-0">{item.icon}</span><span>{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
        
        {/* Featured Carousel */}
        {featuredGames.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 text-center flex items-center justify-center gap-2 relative after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-12 after:h-0.5 after:rounded after:bg-gradient-to-r after:from-emerald-400 after:to-purple-400">
              <span className="text-orange-500"><FireIcon /></span> Jeux a la Une
            </h2>
            <div className="relative rounded-2xl overflow-hidden border border-emerald-400/10 shadow-2xl">
              <div className="relative h-[200px] sm:h-[250px] lg:h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div key={currentSlide} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <img src={featuredGames[currentSlide]?.image_url} alt={featuredGames[currentSlide]?.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a1a]/95 to-transparent p-5 sm:p-6">
                      <h3 className="text-emerald-400 text-lg sm:text-2xl font-bold mb-1">{featuredGames[currentSlide]?.name}</h3>
                      <p className="text-white/80 text-sm">{featuredGames[currentSlide]?.category} • {formatNumber(featuredGames[currentSlide]?.players || 0)} joueurs</p>
                      <div className="flex items-center gap-1.5 text-[#ffd166] text-sm mt-1"><StarIcon /> {featuredGames[currentSlide]?.rating}</div>
                    </div>
                    {featuredGames[currentSlide]?.isHot && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-red-500/30"><FireIcon /> HOT</div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {featuredGames.map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-emerald-400' : 'w-2 bg-white/40'}`} />
                ))}
              </div>
              <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-emerald-400/30 transition-all"><ChevronLeftIcon /></button>
              <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-emerald-400/30 transition-all"><ChevronRightIcon /></button>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium flex-shrink-0 transition-all duration-300 border
                ${activeCategory === cat ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/30' : 'bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.08]'}`}>
              {cat === 'Premium' && <CrownIcon />} {cat}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        {dataLoaded && filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredGames.map((game) => (
              <motion.div key={game.id} layout
                className="rounded-2xl overflow-hidden border border-white/[0.06] cursor-pointer transition-all duration-300 relative group"
                style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.8) 0%, rgba(22,33,62,0.7) 100%)' }}
                whileHover={{ y: -6, borderColor: 'rgba(0,200,150,0.2)', boxShadow: '0 15px 40px rgba(0,0,0,0.4)' }}
                onClick={() => { setSelectedGame(game); setShowGameOverlay(true) }}>
                <div className="relative overflow-hidden">
                  <img src={game.image_url} alt={game.name} className="w-full h-24 sm:h-32 lg:h-36 object-cover transition-transform duration-500 group-hover:scale-105" />
                  {game.isHot && <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><FireIcon /> HOT</span>}
                  {game.isNew && <span className="absolute top-2 right-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">NEW</span>}
                  {game.isPremium && <span className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"><CrownIcon /> PRO</span>}
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-semibold mb-1 truncate">{game.name}</h3>
                  <p className="text-white/50 text-[11px] mb-2">{game.category}</p>
                  <div className="flex justify-between text-[10px] text-white/50 mb-2">
                    <span className="flex items-center gap-1"><UsersIcon /> {formatNumber(game.players)}</span>
                    <span className="flex items-center gap-1"><StarIcon /> {game.rating}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedGame(game); setShowPlayOptions(true) }}
                    className="w-full py-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/20">
                    <PlayIcon /> Jouer
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : dataLoaded ? (
          <div className="text-center py-12 text-white/50">Aucun jeu trouve dans cette categorie</div>
        ) : null}

      </div>

      {/* Game Overlay */}
      <AnimatePresence>
        {showGameOverlay && selectedGame && (
          <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={() => setShowGameOverlay(false)}>
            <motion.div className="relative w-full max-w-[480px] rounded-3xl p-6 sm:p-8 text-center border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
              style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)' }}
              initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              <button onClick={() => setShowGameOverlay(false)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"><CloseIcon /></button>
              <img src={selectedGame.image_url} alt={selectedGame.name} className="w-full rounded-2xl mb-4 max-h-[200px] object-cover shadow-lg" />
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{selectedGame.name}</h2>
              <div className="space-y-2 text-left text-sm text-white/65 mb-5">
                <p className="flex items-center gap-2"><SignalIcon /> Categorie : {selectedGame.category}</p>
                <p className="flex items-center gap-2"><UsersIcon /> Joueurs : {formatNumber(selectedGame.players)}</p>
                <p className="flex items-center gap-2"><StarIcon /> Note : {selectedGame.rating}/5</p>
                {selectedGame.description && <p className="mt-3 text-white/50 leading-relaxed">{selectedGame.description}</p>}
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => handlePlayFree(selectedGame)} className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">
                  <PlayIcon /> Version Gratuite
                </button>
                <button onClick={() => handleCheckProAccess(selectedGame)} disabled={proCheckLoading === selectedGame.name}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-70">
                  {proCheckLoading === selectedGame.name ? <><SpinnerIcon /> Verification...</> : <><CrownIcon /> Version Pro</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Play Options Modal */}
      <AnimatePresence>
        {showPlayOptions && selectedGame && (
          <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1100] flex items-center justify-center p-4" onClick={() => setShowPlayOptions(false)}>
            <motion.div className="relative w-full max-w-[450px] rounded-3xl p-6 sm:p-8 text-center border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
              style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)' }}
              initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              <button onClick={() => setShowPlayOptions(false)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"><CloseIcon /></button>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2"><GamepadIcon /> {selectedGame.name}</h3>
              <p className="text-white/60 text-sm mb-6">Selectionnez comment vous souhaitez jouer</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => handlePlayFree(selectedGame)} className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">
                  <PlayIcon /> Version Gratuite
                </button>
                <button onClick={() => handleCheckProAccess(selectedGame)} disabled={proCheckLoading === selectedGame.name}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-70">
                  {proCheckLoading === selectedGame.name ? <><SpinnerIcon /> Verification...</> : <><CrownIcon /> Version Pro</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alert Modal */}
      <AnimatePresence>
        {showAlertModal && (
          <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1100] flex items-center justify-center p-4" onClick={() => setShowAlertModal(false)}>
            <motion.div className="relative w-full max-w-[450px] rounded-3xl p-6 sm:p-8 text-center border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
              style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)' }}
              initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowAlertModal(false)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"><CloseIcon /></button>
              <h3 className="text-xl font-bold text-white mb-3">{alertData.title}</h3>
              <p className="text-white/60 text-sm mb-6">{alertData.message}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {alertData.buttons.map((btn, index) => (
                  <button key={index} onClick={btn.action}
                    className={`flex-1 py-3 rounded-full font-bold uppercase tracking-wide text-sm transition-all hover:-translate-y-0.5
                      ${index === 0 ? 'bg-white/[0.05] border border-white/10 text-white/70 hover:bg-white/[0.1]' : 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'}`}>
                    {btn.text}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {showLoading && (
          <div className="fixed inset-0 bg-[#0a0a1a]/90 backdrop-blur-xl z-[2000] flex flex-col items-center justify-center gap-6">
            <div className="w-13 h-13 border-[3px] border-emerald-400/15 border-t-emerald-400 border-r-purple-400 rounded-full animate-spin shadow-[0_0_30px_rgba(0,200,150,0.2)]" />
            <p className="text-white/80 text-sm font-medium animate-pulse">{loadingText}</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}