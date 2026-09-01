// components/ordre/OtherProductCard.tsx
'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { ClockSmallIcon as ClockIcon } from '@/components/icons'

interface OtherProductData {
  id: number
  product_name: string
  image_url: string
  expires_at: string | null
  slug: string
}

interface OtherProductCardProps {
  product: OtherProductData
  remaining: number // calculé dans le parent à partir de now (en millisecondes)
}

function formatCountdownTime(remaining: number): string {
  if (remaining <= 0) return 'Expire'
  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return `${hours}h ${minutes}m ${seconds}s`
}

const OtherProductCard = memo(function OtherProductCard({ product, remaining }: OtherProductCardProps) {
  return (
    <motion.div
      className="rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/20"
      style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.7), rgba(22,33,62,0.6))' }}
      whileHover={{ y: -3 }}
    >
      <div className="flex gap-3 items-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-emerald-400/15 overflow-hidden flex-shrink-0">
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/img/WariPlay_Logo_Transparent.png'
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">{product.product_name}</h2>
          <span className={`text-[10px] ${remaining <= 0 ? 'text-red-400' : 'text-white/50'}`}>
            <ClockIcon /> {formatCountdownTime(remaining)}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/40">{product.product_name}</span>
      </div>
    </motion.div>
  )
})

export default OtherProductCard