'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

// =====================================================
// SVG ICONS
// =====================================================
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const StoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
    <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
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

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const FolderIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const MoneyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const FileIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const SpinnerIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

// =====================================================
// TYPES
// =====================================================
interface Deposit {
  transfer_id: string
  amount: number
  method: string
  status: string
  created_at: string
  text_extrait: string
  image: string | null
}

export default function HistoriqueDepotPage() {
  useAuth()
  const pathname = usePathname()
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
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

  // =====================================================
  // CHARGEMENT DES DONNEES
  // =====================================================
  const loadDeposits = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      await initAll()
      const res = await fetchWithAllTokens('/api/historique_depots')
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`)
      const data = await res.json()

      let depositsArray: any[] = []

      if (Array.isArray(data)) {
        depositsArray = data
      } else if (data && typeof data === 'object') {
        if (data.deposits && Array.isArray(data.deposits)) {
          depositsArray = data.deposits
        } else if (data.data && Array.isArray(data.data)) {
          depositsArray = data.data
        } else {
          for (const [, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
              depositsArray = value
              break
            }
          }
        }
      }

      const loadedDeposits: Deposit[] = depositsArray.map((d: any, index: number) => ({
        transfer_id: d.transfer_id || d.id || `DEP-${index}`,
        amount: d.amount || 0,
        method: d.method || d.payment_method || 'Depot',
        status: 'completed',
        created_at: d.created_at || d.date || d.timestamp || 'Date inconnue',
        text_extrait: d.text_extrait || d.extrait || d.message || '',
        image: d.image || d.image_url || d.screenshot || null
      }))

      setDeposits(loadedDeposits)
    } catch (error: any) {
      setErrorMessage(error.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeposits()
  }, [])

  // =====================================================
  // CANVAS BACKGROUND
  // =====================================================
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
      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      time += 0.008

      for (let waveIndex = 0; waveIndex < 5; waveIndex++) {
        ctx.beginPath()
        ctx.strokeStyle = `hsla(${200 + waveIndex * 15}, 80%, ${45 + waveIndex * 5}%, ${0.06 + waveIndex * 0.02})`
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
        ctx.fillStyle = `hsla(${180 + i * 20}, 80%, 60%, ${0.08 + Math.sin(time + i) * 0.04})`
        ctx.fill()
      }

      requestAnimationFrame(draw)
    }
    draw()

    return () => window.removeEventListener('resize', resize)
  }, [])

  // =====================================================
  // FONCTIONS UTILITAIRES
  // =====================================================
  const formatExtrait = (extrait: string | undefined): string => {
    if (!extrait) return 'Aucun extrait disponible'
    return extrait.replace(/\n/g, '<br>')
  }

  const getImageUrl = (image: string | null): string | null => {
    if (!image) return null
    if (image.startsWith('data:')) return image
    return `data:image/jpeg;base64,${image}`
  }

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setShowImageModal(true)
    document.body.style.overflow = 'hidden'
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setSelectedImage('')
    document.body.style.overflow = ''
  }

  const handleImageError = (transferId: string) => {
    setImageError(prev => ({ ...prev, [transferId]: true }))
  }

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ background: '#0a0a1a' }}>
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
        style={{ opacity: 0.4 }}
      />

      {/* Orbs lumineux */}
      <div
        className="fixed w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full pointer-events-none z-0 -top-[15%] -right-[10%] animate-[float1_12s_ease-in-out_infinite]"
        style={{
          background: 'radial-gradient(circle, rgba(0,200,150,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />
      <div
        className="fixed w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] rounded-full pointer-events-none z-0 -bottom-[10%] -left-[5%] animate-[float2_15s_ease-in-out_infinite]"
        style={{
          background: 'radial-gradient(circle, rgba(108,92,231,0.05) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />

      {/* Header */}
      <motion.header
        className="relative z-10 flex items-center justify-center pt-6 pb-3"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link
          href="/recharger"
          className="absolute left-4 sm:left-6 text-white/80 hover:text-white transition-colors"
        >
          <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.9 }}>
            <ArrowLeftIcon />
          </motion.div>
        </Link>

        <motion.img
          src="/img/WariPlay_Logo_Transparent.png"
          alt="WariPlay"
          className="h-12 sm:h-14 w-auto drop-shadow-[0_0_15px_rgba(0,200,150,0.5)]"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        />
      </motion.header>

      {/* Navigation */}
      <nav className="relative z-10 flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href
          const isTarget = item.href === '/target'
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.93 }}
              className="flex-shrink-0"
            >
              <Link
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-400/20 border-emerald-400/30 text-white'
                    : isTarget
                    ? 'bg-orange-500/15 border-orange-500/30 text-white hover:bg-orange-500/25 hover:border-orange-500/50'
                    : 'bg-white/[0.04] border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[700px] mx-auto px-4 sm:px-6 py-6 pb-32">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2.5 mb-2">
            <span className="text-emerald-400">
              <MoneyIcon />
            </span>
            Historique des Depots
          </h1>
          <p className="text-white/50 text-sm">Retrouvez tous vos depots effectues</p>
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="flex flex-col items-center justify-center py-16 text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4 text-emerald-400">
                <SpinnerIcon />
              </div>
              <p className="text-sm">Chargement en cours...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {!loading && errorMessage && (
            <motion.div
              className="flex flex-col items-center justify-center py-16 text-white/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4 opacity-50">
                <WarningIcon />
              </div>
              <p className="text-sm mb-4">{errorMessage}</p>
              <button
                onClick={loadDeposits}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all"
              >
                <RefreshIcon /> Reessayer
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        <AnimatePresence>
          {!loading && !errorMessage && deposits.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-16 text-white/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4 opacity-50">
                <FolderIcon />
              </div>
              <p className="text-sm mb-4">Aucun depot enregistre</p>
              <button
                onClick={loadDeposits}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all"
              >
                <RefreshIcon /> Actualiser
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deposits List */}
        {!loading && !errorMessage && deposits.length > 0 && (
          <div className="flex flex-col gap-3.5">
            {deposits.map((deposit) => {
              const imageUrl = getImageUrl(deposit.image)

              return (
                <motion.div
                  key={deposit.transfer_id}
                  className="rounded-2xl p-4 sm:p-5 border border-emerald-400/10 relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(160deg, rgba(26,26,46,0.85), rgba(22,33,62,0.75))',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                  }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  whileHover={{ y: -3 }}
                >
                  {/* Ligne decorative */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />

                  {/* Top Row */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-400">
                        <CheckCircleIcon />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">
                        {deposit.method}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-white/50 mt-0.5">
                        <span>Ref: {deposit.transfer_id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-400/15 text-emerald-400">
                          Complete
                        </span>
                      </div>
                      <div className="font-bold text-emerald-400 text-sm mt-1 flex items-center gap-1">
                        <MoneyIcon /> +{deposit.amount.toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="space-y-2">
                    {/* Extrait */}
                    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                      <div className="text-purple-400 text-[11px] font-medium mb-1 flex items-center gap-1">
                        <FileIcon /> Extrait
                      </div>
                      <div
                        className="text-white/55 text-xs leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatExtrait(deposit.text_extrait) }}
                      />
                    </div>

                    {/* Image */}
                    {imageUrl && !imageError[deposit.transfer_id] && (
                      <div
                        className="relative rounded-xl overflow-hidden max-h-[200px] border border-emerald-400/10 cursor-pointer group"
                        onClick={() => openImageModal(imageUrl)}
                      >
                        <img
                          src={imageUrl}
                          alt={`Capture depot ${deposit.transfer_id}`}
                          className="w-full h-auto max-h-[200px] object-contain bg-black/30"
                          onError={() => handleImageError(deposit.transfer_id)}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm">
                          <SearchIcon />
                          <span className="text-xs">Cliquez pour agrandir</span>
                        </div>
                      </div>
                    )}

                    {deposit.image && imageError[deposit.transfer_id] && (
                      <div className="p-4 rounded-xl bg-black/20 border border-dashed border-red-400/30 text-center text-white/50 text-sm flex flex-col items-center gap-1.5">
                        <span className="text-red-400">
                          <ImageIcon />
                        </span>
                        <span>Image non disponible</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-right mt-3 text-white/40 text-[11px] flex items-center justify-end gap-1">
                    <CalendarIcon /> {deposit.created_at}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            className="fixed inset-0 bg-[#0a0a1a]/95 backdrop-blur-xl z-[2000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageModal}
          >
            <button
              className="absolute top-5 right-5 text-orange-400 hover:text-red-400 transition-colors z-10"
              onClick={closeImageModal}
            >
              <CloseIcon />
            </button>
            <motion.img
              src={selectedImage}
              alt="Vue agrandie"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}