// components/games/overlays/PlayOptionsModal.tsx
'use client'

import { motion } from 'framer-motion'
import { CloseIcon, GamepadIcon } from '@/components/icons'
import PlayActionButtons from '../PlayActionButtons'
import type { Game } from '../GameCard'

interface PlayOptionsModalProps {
  game: Game
  isCheckingPro: boolean
  onClose: () => void
  onPlayFree: (game: Game) => void
  onCheckPro: (game: Game) => void
}

export default function PlayOptionsModal({
  game,
  isCheckingPro,
  onClose,
  onPlayFree,
  onCheckPro
}: PlayOptionsModalProps) {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1100] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        className="relative w-full max-w-[450px] rounded-3xl p-6 sm:p-8 text-center border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
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
        <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <GamepadIcon /> {game.name}
        </h3>
        <p className="text-white/60 text-sm mb-6">Selectionnez comment vous souhaitez jouer</p>
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