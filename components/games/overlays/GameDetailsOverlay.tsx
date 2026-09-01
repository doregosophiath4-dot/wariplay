// components/games/overlays/GameDetailsOverlay.tsx
'use client'

import { motion } from 'framer-motion'
import { CloseIcon, UsersIcon, StarIcon } from '@/components/icons'
import { SignalIcon } from '../GamesPageClient'
import PlayActionButtons from '../PlayActionButtons'
import { formatNumber } from '@/lib/format'
import type { Game } from '../GameCard'

interface GameDetailsOverlayProps {
  game: Game
  isCheckingPro: boolean
  onClose: () => void
  onPlayFree: (game: Game) => void
  onCheckPro: (game: Game) => void
}

export default function GameDetailsOverlay({
  game,
  isCheckingPro,
  onClose,
  onPlayFree,
  onCheckPro
}: GameDetailsOverlayProps) {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        className="relative w-full max-w-[480px] rounded-3xl p-6 sm:p-8 text-center border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
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
          src={game.image_url}
          alt={game.name}
          className="w-full rounded-2xl mb-4 max-h-[200px] object-cover shadow-lg"
        />
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{game.name}</h2>
        <div className="space-y-2 text-left text-sm text-white/65 mb-5">
          <p className="flex items-center gap-2"><SignalIcon /> Categorie : {game.category}</p>
          <p className="flex items-center gap-2"><UsersIcon /> Joueurs : {formatNumber(game.players)}</p>
          <p className="flex items-center gap-2"><StarIcon /> Note : {game.rating}/5</p>
          {game.description && (
            <p className="mt-3 text-white/50 leading-relaxed">{game.description}</p>
          )}
        </div>
        <PlayActionButtons
          game={game}
          isCheckingPro={isCheckingPro}
          onPlayFree={onPlayFree}
          onCheckPro={onCheckPro}
        />
      </motion.div>
    </div>
  )
}