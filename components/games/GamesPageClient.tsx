// components/games/GamesPageClient.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { 
  FireIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  CrownIcon
} from '@/components/icons'
import Loading from '@/components/loading'
import { formatNumber, formatGameNameForUrl } from '@/lib/format'
import GameCard, { type Game } from './GameCard'

// =====================================================
// ICÔNES SPÉCIFIQUES À CETTE PAGE
// =====================================================
export const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

export const SignalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
)

export const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

// =====================================================
// DYNAMIC IMPORTS DES OVERLAYS
// =====================================================
const GameDetailsOverlay = dynamic(
  () => import('@/components/games/overlays/GameDetailsOverlay'),
  { ssr: false, loading: () => null }
)

const PlayOptionsModal = dynamic(
  () => import('@/components/games/overlays/PlayOptionsModal'),
  { ssr: false, loading: () => null }
)

const AlertModal = dynamic(
  () => import('@/components/games/overlays/AlertModal'),
  { ssr: false, loading: () => null }
)

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export default function GamesPageClient() {
  useAuth()
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

  // =====================================================
  // CHARGEMENT DES JEUX
  // =====================================================
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
          // L'API filtre déjà sur disponible = 1 et renvoie has_access
          // calculé côté serveur (vip + achat de l'utilisateur en session)
          const loadedGames: Game[] = data.map((game: any, index: number) => ({
            id: game.id || index + 1,
            name: game.name,
            image_url: game.image_url || '/img/WariPlay_Logo_Transparent.png',
            category: game.categories || 'Autre',
            players: game.players || 0,
            rating: game.rating || 4.5,
            plays: formatNumber(game.players || 0),
            description: game.description || '',
            isHot: game.isHot || false,
            isNew: game.isNew || false,
            isPremium: game.vip || false,
            hasAccess: game.has_access !== false
          }))
          setGames(loadedGames)
          const featured = loadedGames.slice(0, Math.min(3, loadedGames.length))
          setFeaturedGames(featured.length > 0 ? featured : loadedGames.slice(0, 1))
          setDataLoaded(true)
        }
      } catch (error) {
        if (!cancelled) {
          setAlertData({ 
            title: 'Erreur', 
            message: 'Impossible de charger les jeux.', 
            buttons: [{ text: 'OK', action: () => setShowAlertModal(false) }] 
          })
          setShowAlertModal(true)
        }
      } finally {
        if (!cancelled) setShowLoading(false)
      }
    }
    loadGames()
    return () => { cancelled = true }
  }, [])

  // =====================================================
  // CARROUSEL AUTO-SLIDE
  // =====================================================
  useEffect(() => {
    if (featuredGames.length === 0) return
    const interval = setInterval(() => setCurrentSlide(prev => (prev + 1) % featuredGames.length), 4000)
    return () => clearInterval(interval)
  }, [featuredGames.length])

  // =====================================================
  // CATÉGORIES DYNAMIQUES - calculées depuis les jeux chargés
  // =====================================================
  const categories = useMemo(() => {
    const unique = Array.from(new Set(games.map(g => g.category).filter(Boolean)))
    unique.sort((a, b) => a.localeCompare(b))
    return ['Tous', ...unique]
  }, [games])

  // Si la catégorie active n'existe plus dans les jeux chargés, on revient à "Tous"
  useEffect(() => {
    if (activeCategory !== 'Tous' && !categories.includes(activeCategory)) {
      setActiveCategory('Tous')
    }
  }, [categories, activeCategory])

  // =====================================================
  // FILTRAGE DES JEUX - MEMOISÉ
  // =====================================================
  const filteredGames = useMemo(() => {
    return activeCategory === 'Tous' ? games : games.filter(g => g.category === activeCategory)
  }, [activeCategory, games])

  // =====================================================
  // CALLBACKS STABLES
  // =====================================================
  const handleOpenDetails = useCallback((game: Game) => {
    setSelectedGame(game)
    setShowGameOverlay(true)
  }, [])

  const handleOpenPlayOptions = useCallback((game: Game) => {
    setSelectedGame(game)
    setShowPlayOptions(true)
  }, [])

  // =====================================================
  // FONCTIONS DE NAVIGATION CARROUSEL
  // =====================================================
  const nextSlide = () => { 
    if (featuredGames.length > 0) setCurrentSlide(prev => (prev + 1) % featuredGames.length) 
  }
  const prevSlide = () => { 
    if (featuredGames.length > 0) setCurrentSlide(prev => (prev - 1 + featuredGames.length) % featuredGames.length) 
  }

  // =====================================================
  // FONCTIONS DE JEU
  // =====================================================
  const handlePlayFree = useCallback((game: Game) => {
    const formattedName = formatGameNameForUrl(game.name)
    setShowGameOverlay(false)
    setShowPlayOptions(false)
    router.push('/' + formattedName)
  }, [router])

  // has_access est déjà connu (calculé côté serveur dans /api/get-games) :
  // accès direct au jeu si débloqué, redirection directe vers /store sinon
  // (plus de popup "Version Pro requise" avec Annuler/Obtenir)
  const handlePlayGame = useCallback((game: Game) => {
    const formattedName = formatGameNameForUrl(game.name)
    setShowGameOverlay(false)
    setShowPlayOptions(false)

    if (!game.isPremium || game.hasAccess) {
      router.push('/' + formattedName + (game.isPremium ? '1' : ''))
      return
    }

    router.push('/store')
  }, [router])

  // =====================================================
  // RENDU
  // =====================================================
  const currentFeatured = featuredGames[currentSlide]

  return (
    <>
      {/* ============================================ */}
      {/* LOADING - Composant partagé */}
      {/* ============================================ */}
      <Loading show={showLoading} text={loadingText} />

      {/* ============================================ */}
      {/* FEATURED CAROUSEL */}
      {/* ============================================ */}
      {featuredGames.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 text-center flex items-center justify-center gap-2 relative after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-12 after:h-0.5 after:rounded after:bg-gradient-to-r after:from-emerald-400 after:to-purple-400">
            <span className="text-orange-500"><FireIcon /></span> Jeux a la Une
          </h2>
          <div className="relative rounded-2xl overflow-hidden border border-emerald-400/10 shadow-2xl">
            <div className="relative h-[200px] sm:h-[250px] lg:h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentSlide} 
                  className="absolute inset-0" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                >
                  <img 
                    src={currentFeatured?.image_url} 
                    alt={currentFeatured?.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a1a]/95 to-transparent p-5 sm:p-6">
                    <h3 className="text-emerald-400 text-lg sm:text-2xl font-bold mb-1">
                      {currentFeatured?.name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {currentFeatured?.category} • {formatNumber(currentFeatured?.players || 0)} joueurs
                    </p>
                    <div className="flex items-center gap-1.5 text-[#ffd166] text-sm mt-1">
                      <StarIcon /> {currentFeatured?.rating}
                    </div>
                  </div>
                  {currentFeatured?.isHot && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-red-500/30">
                      <FireIcon /> HOT
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {featuredGames.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide(i)} 
                  className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-emerald-400' : 'w-2 bg-white/40'}`} 
                />
              ))}
            </div>
            <button 
              onClick={prevSlide} 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-emerald-400/30 transition-all"
            >
              <ChevronLeftIcon />
            </button>
            <button 
              onClick={nextSlide} 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-emerald-400/30 transition-all"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CATEGORIES - dynamiques, issues des jeux chargés */}
      {/* ============================================ */}
      <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium flex-shrink-0 transition-all duration-300 border
              ${activeCategory === cat 
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/30' 
                : 'bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.08]'}`}
          >
            {cat === 'Premium' && <CrownIcon />} {cat}
          </button>
        ))}
      </div>

      {/* ============================================ */}
      {/* GAMES GRID - Utilise GameCard */}
      {/* ============================================ */}
      {dataLoaded && filteredGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onOpenDetails={handleOpenDetails}
              onOpenPlayOptions={handleOpenPlayOptions}
            />
          ))}
        </div>
      ) : dataLoaded ? (
        <div className="text-center py-12 text-white/50">Aucun jeu trouve dans cette categorie</div>
      ) : null}

      {/* ============================================ */}
      {/* OVERLAYS - Chargés dynamiquement */}
      {/* ============================================ */}
      
      {/* Game Details Overlay */}
      <AnimatePresence>
        {showGameOverlay && selectedGame && (
          <GameDetailsOverlay
            game={selectedGame}
            isCheckingPro={false}
            onClose={() => setShowGameOverlay(false)}
            onPlayFree={handlePlayFree}
            onCheckPro={handlePlayGame}
          />
        )}
      </AnimatePresence>

      {/* Play Options Modal */}
      <AnimatePresence>
        {showPlayOptions && selectedGame && (
          <PlayOptionsModal
            game={selectedGame}
            isCheckingPro={false}
            onClose={() => setShowPlayOptions(false)}
            onPlayFree={handlePlayFree}
            onCheckPro={handlePlayGame}
          />
        )}
      </AnimatePresence>

      {/* Alert Modal */}
      <AnimatePresence>
        {showAlertModal && (
          <AlertModal
            title={alertData.title}
            message={alertData.message}
            buttons={alertData.buttons}
            onClose={() => setShowAlertModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}