'use client'

import { motion } from 'framer-motion'
import { CloseIcon } from '@/components/icons'
import type { WariGame } from '@/lib/wariCatalog'

interface Props {
  game: WariGame
  onClose: () => void
  onDemo: (game: WariGame) => void
  onPlay: (game: WariGame) => void
}

export default function GameOverlay({ game, onClose, onDemo, onPlay }: Props) {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-lg z-[9999] flex items-center justify-center p-5" onClick={onClose}>
      <motion.div
        className="relative max-w-[450px] w-full rounded-3xl p-8 sm:p-10 text-center border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
        style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)' }}
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 24 }}
        transition={{ type: 'spring', damping: 22, stiffness: 220 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 via-orange-500 to-purple-400" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
        >
          <CloseIcon />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">{game.titlePrefix || 'Jeu'} - {game.name}</h2>
        {game.description && <p className="text-white/65 text-sm mb-5">{game.description}</p>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onDemo(game)}
            className="px-8 py-3 rounded-full border-2 border-emerald-400 text-emerald-400 font-bold uppercase tracking-wide text-sm hover:bg-emerald-400/10 hover:-translate-y-0.5 transition-all"
          >
            {game.demoBtn || 'Demo'}
          </button>
          <button
            onClick={() => onPlay(game)}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold uppercase tracking-wide text-sm shadow-xl shadow-purple-500/40 hover:-translate-y-1 transition-all"
          >
            {game.playBtn || 'Jouer'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}