// components/games/GameCard.tsx
'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { 
  PlayIcon, 
  FireIcon, 
  CrownIcon, 
  UsersIcon, 
  StarIcon,
  LockIcon
} from '@/components/icons'
import { formatNumber } from '@/lib/format'

// =====================================================
// TYPES
// =====================================================
export interface Game {
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
  hasAccess?: boolean
}

interface GameCardProps {
  game: Game
  onOpenDetails: (game: Game) => void
  onOpenPlayOptions: (game: Game) => void
}

// =====================================================
// COMPOSANT GAME CARD
// =====================================================
function GameCard({ game, onOpenDetails, onOpenPlayOptions }: GameCardProps) {
  const isLocked = game.isPremium && !game.hasAccess

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden border border-white/[0.06] cursor-pointer transition-all duration-300 relative group"
      style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.8) 0%, rgba(22,33,62,0.7) 100%)' }}
      whileHover={{ y: -6, borderColor: 'rgba(0,200,150,0.2)', boxShadow: '0 15px 40px rgba(0,0,0,0.4)' }}
      onClick={() => onOpenDetails(game)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={game.image_url} 
          alt={game.name} 
          className="w-full h-24 sm:h-32 lg:h-36 object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        {/* Badge catégorie */}
        {game.category && (
          <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/10">
            {game.category}
          </span>
        )}
        {game.isHot && (
          <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
            <FireIcon /> HOT
          </span>
        )}
        {game.isNew && (
          <span className="absolute top-2 right-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
            NEW
          </span>
        )}
        {game.isPremium && (
          <span className={`absolute top-2 right-2 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
            isLocked 
              ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
              : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
          }`}>
            <CrownIcon /> {isLocked ? 'PRO' : 'DEBLOQUE'}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white text-sm font-semibold mb-1 truncate">{game.name}</h3>
        <p className="text-white/50 text-[11px] mb-2">{game.category}</p>
        <div className="flex justify-between text-[10px] text-white/50 mb-2">
          <span className="flex items-center gap-1"><UsersIcon /> {formatNumber(game.players)}</span>
          <span className="flex items-center gap-1"><StarIcon /> {game.rating}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenPlayOptions(game) }}
          className={`w-full py-2 rounded-full text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 hover:-translate-y-0.5 transition-all shadow-lg ${
            isLocked
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/20'
              : 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-emerald-500/20'
          }`}
        >
          {isLocked ? <><LockIcon /> Debloquer</> : <><PlayIcon /> Jouer</>}
        </button>
      </div>
    </motion.div>
  )
}

export default memo(GameCard)