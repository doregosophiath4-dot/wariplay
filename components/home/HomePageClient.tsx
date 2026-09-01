// components/home/HomePageClient.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { initAll, fetchWithAllTokens } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import type { WariLevel, WariGame, WariPath } from '@/lib/wariCatalog'
import {
  ChevronLeftIcon, ChevronRightIcon, BoltIcon, StarIcon, ChatIcon,
  FacebookIcon, TelegramIcon, InstagramIcon, WhatsAppIcon
} from '@/components/icons'
import WariCardRow from './WariCardRow'
import SiteFooter from './SiteFooter'

// =====================================================
// IMPORTS DYNAMIQUES DES OVERLAYS
// =====================================================
const LevelOverlay = dynamic(() => import('@/components/home/overlays/LevelOverlay'), {
  ssr: false,
  loading: () => null,
})
const GameOverlay = dynamic(() => import('@/components/home/overlays/GameOverlay'), {
  ssr: false,
  loading: () => null,
})
const PathOverlay = dynamic(() => import('@/components/home/overlays/PathOverlay'), {
  ssr: false,
  loading: () => null,
})
const WelcomeOverlay = dynamic(() => import('@/components/home/overlays/WelcomeOverlay'), {
  ssr: false,
  loading: () => null,
})
const AlertOverlay = dynamic(() => import('@/components/home/overlays/AlertOverlay'), {
  ssr: false,
  loading: () => null,
})

// =====================================================
// PROPS
// =====================================================
interface HomePageClientProps {
  staticFeatures: React.ReactNode
  wariLevels: WariLevel[]
  wariGames: WariGame[]
  wariPaths: WariPath[]
}

const WELCOME_SHOWN_KEY = 'wariplay_welcome_shown'

export default function HomePageClient({ 
  staticFeatures, 
  wariLevels, 
  wariGames, 
  wariPaths 
}: HomePageClientProps) {
  useAuth()
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [language, setLanguage] = useState('fr')

  const [showLevelOverlay, setShowLevelOverlay] = useState(false)
  const [showGameOverlay, setShowGameOverlay] = useState(false)
  const [showPathOverlay, setShowPathOverlay] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<WariLevel | null>(null)
  const [selectedGame, setSelectedGame] = useState<WariGame | null>(null)
  const [selectedPath, setSelectedPath] = useState<WariPath | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertData, setAlertData] = useState({ title: '', message: '' })

  const promoSlides = [
    '/img/file_000000005330624690a166cbc82ef0d1.png',
    '/img/file_0000000056886246b57ef9fb844a7f52.png',
    '/img/file_00000000bdc46246a4accf216c73d265.png',
    '/img/file_000000009de861f497cda90ef9d531f3.png',
    '/img/wallet.png'
  ]

  const socialButtons = [
    { id: 'facebook', icon: <FacebookIcon />, label: 'Facebook', color: '#1877F2' },
    { id: 'telegram', icon: <TelegramIcon />, label: 'Telegram', color: '#26A5E4' },
    { id: 'instagram', icon: <InstagramIcon />, label: 'Instagram', color: '#E4405F' },
    { id: 'whatsapp', icon: <WhatsAppIcon />, label: 'WhatsApp', color: '#25D366' }
  ]

  const showCustomAlert = useCallback((message: string, title: string = 'Erreur') => {
    setAlertData({ title, message })
    setShowAlert(true)
  }, [])

  // Préchargement des images du carousel au montage
  useEffect(() => {
    promoSlides.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [promoSlides])

  useEffect(() => {
    initAll().catch(() => {})
  }, [])

  useEffect(() => {
    const alreadyShown = localStorage.getItem(WELCOME_SHOWN_KEY)
    if (!alreadyShown) setShowWelcome(true)
  }, [])

  const handleWelcomeClose = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true')
    setShowWelcome(false)
  }

  const handleGamePlay = async (game: WariGame) => {
    try {
      const res = await fetchWithAllTokens('/api/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_name: game.name }),
      })
      const data = await res.json()
      if (data.has_access) {
        router.push('/' + game.name.toLowerCase().replace(/\s+/g, '_') + '1')
      } else {
        showCustomAlert(data.message || 'Accès refusé.', 'Accès')
      }
    } catch (err: any) {
      showCustomAlert(err.message || 'Erreur', 'Erreur')
    }
  }

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide(prev => (prev + 1) % promoSlides.length), 4000)
    return () => clearInterval(interval)
  }, [promoSlides.length])

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % promoSlides.length)
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + promoSlides.length) % promoSlides.length)

  const handleSocialClick = (platform: string) => {
    const urls: Record<string, string> = { 
      facebook: 'https://facebook.com', 
      telegram: 'https://t.me', 
      instagram: 'https://instagram.com', 
      whatsapp: 'https://wa.me' 
    }
    window.open(urls[platform], '_blank')
  }

  return (
    <>
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin: 0 20px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, rgba(0, 200, 150, 0.6), rgba(108, 92, 231, 0.6));
          border-radius: 10px;
          border: 2px solid rgba(10, 10, 26, 0.8);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, rgba(0, 200, 150, 0.9), rgba(108, 92, 231, 0.9));
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 200, 150, 0.6) rgba(255, 255, 255, 0.05);
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ============================================ */}
      {/* GRILLE UNIQUE - mobile 1 colonne, desktop 3 colonnes */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">

        {/* Carousel avec préchargement des images */}
        <motion.div
          className="lg:col-span-2 lg:row-start-1 relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl"
          style={{ order: 1 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <div className="relative aspect-video overflow-hidden bg-black/30">
            {/* Image active avec animation */}
            <div className="absolute inset-0">
              <Image
                src={promoSlides[currentSlide]}
                alt={`Promo ${currentSlide + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover transition-opacity duration-500"
                priority
              />
            </div>
            
            {/* Précharger les autres images en cache (invisibles) */}
            {promoSlides.map((src, index) => (
              index !== currentSlide && (
                <div key={index} className="absolute inset-0 opacity-0 pointer-events-none">
                  <Image
                    src={src}
                    alt={`Promo ${index + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                    priority={false}
                  />
                </div>
              )
            ))}
          </div>
          
          {/* Indicateurs de slides */}
          <div className="flex justify-center gap-2 p-3 bg-black/40 backdrop-blur-xl">
            {promoSlides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentSlide(i)} 
                className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-emerald-400 shadow-[0_0_10px_rgba(0,200,150,0.5)]' : 'w-2 bg-white/30'}`} 
              />
            ))}
          </div>
          
          {/* Boutons de navigation */}
          <button 
            onClick={prevSlide} 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-emerald-400/30 hover:border-emerald-400/40 transition-all"
          >
            <ChevronLeftIcon />
          </button>
          <button 
            onClick={nextSlide} 
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-emerald-400/30 hover:border-emerald-400/40 transition-all"
          >
            <ChevronRightIcon />
          </button>
        </motion.div>

        {/* Features statiques */}
        <div className="lg:col-span-2 lg:row-start-2" style={{ order: 2 }}>
          {staticFeatures}
        </div>

        {/* Sidebar */}
        <div className="lg:col-start-3 lg:row-start-1 lg:row-span-2 space-y-5" style={{ order: 6 }}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <BoltIcon />, label: 'Google Play', color: '#ff6b35' },
              { icon: <StarIcon />, label: 'AppStore', color: '#ff6b35' },
            ].map((app, i) => (
              <motion.div key={i} className="flex items-center gap-2.5 p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] cursor-pointer transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))' }}
                whileHover={{ y: -3, borderColor: 'rgba(0,200,150,0.3)', boxShadow: '0 8px 25px rgba(0,200,150,0.1)' }}>
                <span style={{ color: app.color }}>{app.icon}</span>
                <span className="text-[10px] sm:text-xs text-white/50">{app.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div className="rounded-2xl p-4 sm:p-5 border border-white/[0.06] flex items-center justify-between gap-3"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
            whileHover={{ y: -3 }}>
            <div>
              <strong className="block text-sm text-white mb-1">Besoin d&apos;aide ?</strong>
              <p className="text-[10px] sm:text-xs text-white/50">Notre équipe est disponible 24h/24 et 7j/7.</p>
            </div>
            <button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-semibold text-xs sm:text-sm whitespace-nowrap shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">
              <ChatIcon /> Discuter
            </button>
          </motion.div>

          <div className="flex flex-wrap gap-2">
            {socialButtons.map((social) => (
              <motion.button key={social.id} onClick={() => handleSocialClick(social.id)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-full border font-medium text-xs transition-all duration-300"
                style={{ borderColor: social.color, color: social.color, background: 'rgba(255,255,255,0.03)' }}
                whileHover={{ scale: 1.05, y: -3, backgroundColor: `${social.color}20` }}
                whileTap={{ scale: 0.95 }}>
                {social.icon} {social.label}
              </motion.button>
            ))}
          </div>

          <motion.div className="rounded-2xl p-5 border border-purple-400/20 cursor-pointer transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(108,92,231,0.03))' }}
            whileHover={{ y: -5, borderColor: 'rgba(108,92,231,0.4)', boxShadow: '0 10px 30px rgba(108,92,231,0.15)' }}>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1">Blog du créateur de WariPlay</h3>
            <p className="text-xs text-white/50 mb-3">Entreprise, affaires et plus encore</p>
            <button className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold text-xs shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 transition-all">Chat</button>
          </motion.div>

          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-white text-sm cursor-pointer outline-none transition-all appearance-none border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)', backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}>
            <option value="fr">FR Français</option>
            <option value="en">EN English</option>
            <option value="pt">PT Português</option>
          </select>
        </div>

        {/* Wari Levels */}
        <WariCardRow
          title="Wari Level"
          orderMobile={3}
          rowStartDesktop={3}
          items={wariLevels.map((level) => ({
            key: level.id,
            img: level.img,
            alt: `Niveau ${level.id}`,
            label: `Niveau ${level.id}`,
            onClick: () => { setSelectedLevel(level); setShowLevelOverlay(true) },
          }))}
        />

        {/* Wari Games */}
        <WariCardRow
          title="Wari Games"
          orderMobile={4}
          rowStartDesktop={4}
          items={wariGames.map((game) => ({
            key: game.id,
            img: game.img,
            alt: game.name,
            label: game.name,
            onClick: () => { setSelectedGame(game); setShowGameOverlay(true) },
          }))}
        />

        {/* Wari Path */}
        <WariCardRow
          title="Wari Path"
          orderMobile={5}
          rowStartDesktop={5}
          items={wariPaths.map((path) => ({
            key: path.id,
            img: path.img,
            alt: path.name,
            label: path.name,
            onClick: () => { setSelectedPath(path); setShowPathOverlay(true) },
          }))}
        />

      </div>

      {/* ============================================ */}
      {/* OVERLAYS AVEC AnimatePresence */}
      {/* ============================================ */}
      
      <AnimatePresence>
        {showWelcome && (
          <WelcomeOverlay onClose={handleWelcomeClose} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLevelOverlay && selectedLevel && (
          <LevelOverlay
            level={selectedLevel}
            onClose={() => setShowLevelOverlay(false)}
            onBuy={(level) => router.push(`/achat?niveau=${level.id}`)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGameOverlay && selectedGame && (
          <GameOverlay
            game={selectedGame}
            onClose={() => setShowGameOverlay(false)}
            onDemo={(game) => router.push('/' + game.name.toLowerCase().replace(/\s+/g, '_'))}
            onPlay={handleGamePlay}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPathOverlay && selectedPath && (
          <PathOverlay
            path={selectedPath}
            onClose={() => setShowPathOverlay(false)}
            onBuy={(path) => router.push(`/achat?produit=${encodeURIComponent(path.name)}`)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAlert && (
          <AlertOverlay
            title={alertData.title}
            message={alertData.message}
            onClose={() => setShowAlert(false)}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <SiteFooter />
    </>
  )
}