// components/ordre/GameCard.tsx
'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { HeartSmallIcon as HeartIcon, ClockSmallIcon as ClockIcon, SyncIcon, PlayIcon } from '@/components/icons'

interface GameData {
  id: number
  product_name: string
  image_url: string
  vies: number
  end_timestamp: number
  renewal_timestamp: number | null
  slug: string
}

interface GameCardProps {
  game: GameData
  remaining: number      // calculé dans le parent à partir de now
  renewalRemaining: number // calculé dans le parent à partir de now
  onPlay: (slug: string) => void
}

function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return 'Termine'

  // ✅ Arrondir pour éviter les décimales à rallonge (ex: 45.674747584785...s)
  const totalSeconds = Math.floor(seconds)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  return [days > 0 ? `${days}j` : '', `${hours}h`, `${mins}m`, `${secs}s`].filter(Boolean).join(' ')
}

const GameCard = memo(function GameCard({ game, remaining, renewalRemaining, onPlay }: GameCardProps) {
  return (
    <motion.div
      className="rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/20"
      style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.7), rgba(22,33,62,0.6))' }}
      whileHover={{ y: -3 }}
    >
      <div className="flex gap-3 items-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-emerald-400/15 overflow-hidden flex-shrink-0">
          <img
            src={game.image_url}
            alt={game.product_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/img/WariPlay_Logo_Transparent.png'
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">{game.product_name}</h2>
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] text-white/50 bg-white/[0.04] px-2 py-0.5 rounded-full">
              <span className="text-red-400"><HeartIcon /></span>
              {game.vies} vies
            </span>
            {game.vies === 0 && game.renewal_timestamp && (
              <span className="flex items-center gap-1 text-[10px] text-white/50 bg-white/[0.04] px-2 py-0.5 rounded-full">
                <span className="text-orange-400"><SyncIcon /></span>
                {formatRemainingTime(renewalRemaining)}
              </span>
            )}
            <span className={`flex items-center gap-1 text-[10px] bg-white/[0.04] px-2 py-0.5 rounded-full ${remaining <= 0 ? 'text-red-400' : 'text-white/50'}`}>
              <span className="text-purple-400"><ClockIcon /></span>
              {formatRemainingTime(remaining)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/40">{game.product_name}</span>
        <button
          onClick={() => onPlay(game.slug)}
          disabled={game.vies === 0}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold text-xs uppercase tracking-wide shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all disabled:bg-white/[0.05] disabled:text-white/30 disabled:shadow-none disabled:cursor-not-allowed"
        >
          <PlayIcon /> Jouer
        </button>
      </div>
    </motion.div>
  )
})

export default GameCard