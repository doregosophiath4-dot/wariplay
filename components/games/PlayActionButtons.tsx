// components/games/PlayActionButtons.tsx
'use client'

import { PlayIcon, CrownIcon } from '@/components/icons'
import { SpinnerIcon } from './GamesPageClient'
import type { Game } from './GameCard'

interface PlayActionButtonsProps {
  game: Game
  isCheckingPro: boolean
  onPlayFree: (game: Game) => void
  onCheckPro: (game: Game) => void
}

export default function PlayActionButtons({ 
  game, 
  isCheckingPro, 
  onPlayFree, 
  onCheckPro 
}: PlayActionButtonsProps) {
  const isLocked = game.isPremium && !game.hasAccess

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => onPlayFree(game)}
        className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
      >
        <PlayIcon /> Version Gratuite
      </button>
      <button
        onClick={() => onCheckPro(game)}
        disabled={isCheckingPro}
        className={`w-full py-3 rounded-full text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 ${
          isLocked
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/30'
            : 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-emerald-500/30'
        }`}
      >
        {isCheckingPro ? (
          <><SpinnerIcon /> Verification...</>
        ) : (
          <><CrownIcon /> Version Pro</>
        )}
      </button>
    </div>
  )
}