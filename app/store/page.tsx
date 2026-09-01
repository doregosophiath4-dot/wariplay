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

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const FireIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
)

const CrownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 14h14v2H5v-2z" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const HeartIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)

const SyncIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

// =====================================================
// TYPES
// =====================================================
interface Product {
  id: number | string
  title: string
  price: string
  image_path: string 
  category_name: string
  category_icon: string
  description: string
  advantages: string[]
  duration: string
  lives: number
  is_popular: boolean
  is_vip: boolean
  is_seasonal: boolean
  is_level: boolean
  type: string
  rating: number
  sales: number
}

interface CategoryGroup {
  categoryName: string
  products: Product[]
}

export default function StorePage() {
  useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Chargement en cours...')
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
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

  useEffect(() => {
    let cancelled = false
    async function loadProducts() {
      setShowLoading(true)
      setLoadingText('Chargement des produits...')
      try {
        await initAll()
        const res = await fetchWithAllTokens('/api/products')
        if (!res.ok) throw new Error('Erreur chargement')
        const products: Product[] = await res.json()
        if (!cancelled && products && Array.isArray(products)) {
          const productsByCategory: Record<string, Product[]> = {}
          products.forEach(product => {
            const catName = product.category_name || 'Autres'
            if (!productsByCategory[catName]) productsByCategory[catName] = []
            productsByCategory[catName].push(product)
          })
          setCategoryGroups(Object.entries(productsByCategory).map(([categoryName, products]) => ({ categoryName, products })))
          setDataLoaded(true)
        }
      } catch (error) {} finally {
        if (!cancelled) setShowLoading(false)
      }
    }
    loadProducts()
    return () => { cancelled = true }
  }, [])

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    let time = 0
    const draw = () => {
      if (!ctx || !canvas) return
      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      time += 0.008
      for (let w = 0; w < 5; w++) {
        ctx.beginPath()
        ctx.strokeStyle = `hsla(${200 + w * 15}, 80%, ${45 + w * 5}%, ${0.06 + w * 0.02})`; ctx.lineWidth = 1.2 + w * 0.2
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height * 0.4 + Math.sin(x * 0.003 + time * 0.5 + w) * 50 + Math.cos(x * 0.001 + time * 0.3) * 70 + Math.sin(x * 0.005 + w * 1.5) * 30 + w * 55
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      for (let i = 0; i < 12; i++) {
        const px = (Math.sin(time * 0.7 + i * 2.1) * 0.5 + 0.5) * canvas.width
        const py = (Math.cos(time * 0.5 + i * 1.7) * 0.5 + 0.5) * canvas.height
        ctx.beginPath(); ctx.arc(px, py, 1 + Math.sin(time * 2 + i) * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${180 + i * 20}, 80%, 60%, ${0.08 + Math.sin(time + i) * 0.04})`; ctx.fill()
      }
      requestAnimationFrame(draw)
    }
    draw()
    return () => window.removeEventListener('resize', resize)
  }, [])

  const handleBuyFromModal = (product: Product) => {
    setShowProductModal(false)
    const isLevel = product.is_level || product.category_name?.toLowerCase().includes('niveau') || product.type === 'level'
    setShowLoading(true); setLoadingText('Redirection vers le paiement...')
    setTimeout(() => {
      setShowLoading(false)
      router.push(isLevel ? `/achat?niveau=${encodeURIComponent(product.id)}` : `/achat?produit=${encodeURIComponent(product.title)}`)
    }, 500)
  }

  const getBadge = (product: Product) => {
    if (product.is_popular) return { icon: <FireIcon />, label: 'POP', bg: 'from-red-500 to-red-600' }
    if (product.is_vip) return { icon: <CrownIcon />, label: 'VIP', bg: 'from-orange-500 to-orange-600' }
    if (product.is_seasonal) return { icon: <StarIcon />, label: 'SAISON', bg: 'from-emerald-400 to-emerald-600' }
    return null
  }

  const filteredGroups = categoryGroups.map(g => ({ ...g, products: g.products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())) })).filter(g => g.products.length > 0)

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ background: '#0a0a1a' }}>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" style={{ opacity: 0.4 }} />
      
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
      <nav className="relative z-10 flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
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

      {/* Store Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
        
        {/* Store Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center gap-2.5 mb-2">
            <span className="text-emerald-400"><StoreIcon /></span> WariStore
          </h1>
          <p className="text-white/50 text-sm">Boostez votre experience de jeu</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white/[0.04] border border-emerald-400/10 rounded-2xl px-4 mb-6 transition-all focus-within:border-emerald-400/40 focus-within:shadow-[0_0_0_3px_rgba(0,200,150,0.1)]">
          <span className="text-emerald-400 flex-shrink-0"><SearchIcon /></span>
          <input type="text" placeholder="Rechercher un produit..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 py-3.5 bg-transparent border-none text-white text-sm outline-none placeholder:text-white/40" />
        </div>

        {/* Categories with products */}
        {dataLoaded && filteredGroups.map((group) => (
          <div key={group.categoryName} className="mb-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-emerald-400/10">
              <span className="text-emerald-400"><GamepadIcon /></span>
              <h2 className="text-lg font-semibold text-white">{group.categoryName}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {group.products.map((product) => {
                const badge = getBadge(product)
                return (
                  <motion.div key={product.id} layout
                    className="rounded-2xl overflow-hidden border border-white/[0.06] cursor-pointer transition-all duration-300 relative group"
                    style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.8) 0%, rgba(22,33,62,0.7) 100%)' }}
                    whileHover={{ y: -6, borderColor: 'rgba(0,200,150,0.2)', boxShadow: '0 15px 40px rgba(0,0,0,0.4)' }}
                    onClick={() => { setSelectedProduct(product); setShowProductModal(true) }}>
                    <div className="relative overflow-hidden">
                      <img src={product.image_path} alt={product.title} className="w-full h-32 sm:h-36 object-cover transition-transform duration-500 group-hover:scale-105" />
                      {badge && (
                        <span className={`absolute top-2 right-2 bg-gradient-to-r ${badge.bg} text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg`}>
                          {badge.icon} {badge.label}
                        </span>
                      )}
                    </div>
                    <div className="p-3.5">
                      <h3 className="text-white text-sm font-semibold mb-1 truncate">{product.title}</h3>
                      <p className="text-emerald-400 font-bold text-base mb-2">{product.price}</p>
                      <div className="flex justify-between text-[10px] text-white/50 mb-3">
                        {product.duration && <span className="flex items-center gap-1"><ClockIcon /> {product.duration}</span>}
                        {product.lives > 0 && <span className="flex items-center gap-1"><HeartIcon /> {product.lives} vies</span>}
                        {!product.duration && !product.lives && <span className="flex items-center gap-1"><SyncIcon /> Renouvelable</span>}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setShowProductModal(true) }}
                        className="w-full py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/20">
                        <CartIcon /> Acheter
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}

        {dataLoaded && filteredGroups.length === 0 && searchQuery && (
          <div className="text-center py-12 text-white/50">Aucun produit trouve pour &quot;{searchQuery}&quot;</div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && selectedProduct && (
          <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={() => setShowProductModal(false)}>
            <motion.div className="relative w-full max-w-[450px] rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
              style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)' }}
              initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"><CloseIcon /></button>
              
              <img src={selectedProduct.image_path} alt={selectedProduct.title} className="w-full h-44 object-cover rounded-2xl mb-4 shadow-lg" />
              <h2 className="text-xl font-bold text-white mb-1">{selectedProduct.title}</h2>
              <p className="text-emerald-400 text-2xl font-bold mb-3">{selectedProduct.price}</p>
              <p className="text-white/60 text-sm leading-relaxed mb-4">{selectedProduct.description}</p>
              
              {selectedProduct.advantages && selectedProduct.advantages.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-purple-400 font-semibold text-sm mb-2">Avantages :</h3>
                  <ul className="space-y-1.5">
                    {selectedProduct.advantages.map((adv, i) => (
                      <li key={i} className="flex items-center gap-2 text-white/55 text-sm"><span className="text-emerald-400"><CheckIcon /></span> {adv}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={() => handleBuyFromModal(selectedProduct)}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">
                <CartIcon /> Acheter maintenant
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading */}
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