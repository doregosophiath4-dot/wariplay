// components/games/PlayActionButtons.tsx
'use client'

import { PlayIcon, CrownIcon } from '@/components/icons'
import { SpinnerIcon } from './GamesPageClient'

interface Game {
  id: number
  name: string
  // ... autres champs non nécessaires ici
}

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
        className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-70"
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