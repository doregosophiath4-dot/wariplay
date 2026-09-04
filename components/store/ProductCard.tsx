// components/store/ProductCard.tsx
'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  CartIcon, 
  StarIconSmall, 
  FireIconSmall, 
  CrownIconSmall,
  ClockIcon,
  HeartIcon,
  SyncIcon 
} from '@/components/icons'

// =====================================================
// TYPES
// =====================================================
export interface Product {
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

interface ProductCardProps {
  product: Product
  onSelect: (product: Product) => void
}

// =====================================================
// COMPOSANT PRODUCT CARD
// =====================================================
function ProductCard({ product, onSelect }: ProductCardProps) {
  // Le badge est calculé une seule fois et réutilisé pour le bouton,
  // afin que sa couleur corresponde toujours au badge affiché
  const badge = useMemo(() => {
    if (product.is_popular) {
      return { icon: <FireIconSmall />, label: 'POP', bg: 'from-red-500 to-red-600', shadow: 'shadow-red-500/20' }
    }
    if (product.is_vip) {
      return { icon: <CrownIconSmall />, label: 'VIP', bg: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/20' }
    }
    if (product.is_seasonal) {
      return { icon: <StarIconSmall />, label: 'SAISON', bg: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20' }
    }
    return null
  }, [product.is_popular, product.is_vip, product.is_seasonal])

  const buttonBg = badge?.bg ?? 'from-emerald-400 to-emerald-600'
  const buttonShadow = badge?.shadow ?? 'shadow-emerald-500/20'

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden border border-white/[0.06] cursor-pointer transition-all duration-300 relative group"
      style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.8) 0%, rgba(22,33,62,0.7) 100%)' }}
      whileHover={{ y: -6, borderColor: 'rgba(0,200,150,0.2)', boxShadow: '0 15px 40px rgba(0,0,0,0.4)' }}
      onClick={() => onSelect(product)}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image_path}
          alt={product.title}
          className="w-full h-32 sm:h-36 object-cover transition-transform duration-500 group-hover:scale-105"
        />
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
          {product.duration && (
            <span className="flex items-center gap-1"><ClockIcon /> {product.duration}</span>
          )}
          {product.lives > 0 && (
            <span className="flex items-center gap-1"><HeartIcon /> {product.lives} vies</span>
          )}
          {!product.duration && !product.lives && (
            <span className="flex items-center gap-1"><SyncIcon /> Renouvelable</span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(product) }}
          className={`w-full py-2.5 rounded-full bg-gradient-to-r ${buttonBg} text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg ${buttonShadow}`}
        >
          <CartIcon /> Acheter
        </button>
      </div>
    </motion.div>
  )
}

export default memo(ProductCard)