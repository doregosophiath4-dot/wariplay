// components/store/ProductModal.tsx
'use client'

import { motion } from 'framer-motion'
import { CloseIcon, CheckIcon, CartIcon } from '@/components/icons'
import type { Product } from './ProductCard'

interface ProductModalProps {
  product: Product
  onClose: () => void
  onBuy: (product: Product) => void
}

// =====================================================
// COMPOSANT MODAL
// =====================================================
export default function ProductModal({ product, onClose, onBuy }: ProductModalProps) {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        className="relative w-full max-w-[450px] rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
        style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)' }}
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"
        >
          <CloseIcon />
        </button>

        <img
          src={product.image_path}
          alt={product.title}
          className="w-full h-44 object-cover rounded-2xl mb-4 shadow-lg"
        />
        <h2 className="text-xl font-bold text-white mb-1">{product.title}</h2>
        <p className="text-emerald-400 text-2xl font-bold mb-3">{product.price}</p>
        <p className="text-white/60 text-sm leading-relaxed mb-4">{product.description}</p>

        {product.advantages && product.advantages.length > 0 && (
          <div className="mb-5">
            <h3 className="text-purple-400 font-semibold text-sm mb-2">Avantages :</h3>
            <ul className="space-y-1.5">
              {product.advantages.map((adv, i) => (
                <li key={i} className="flex items-center gap-2 text-white/55 text-sm">
                  <span className="text-emerald-400"><CheckIcon /></span> {adv}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => onBuy(product)}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
        >
          <CartIcon /> Acheter maintenant
        </button>
      </motion.div>
    </div>
  )
}