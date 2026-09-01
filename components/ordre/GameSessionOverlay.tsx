// components/ordre/GameSessionOverlay.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  CloseIcon,
  CheckIcon,
  XMarkIcon,
  ArrowRightIcon,
  StarSmallIcon as StarIcon,
  FireIcon,
  CoinsIcon,
  ClockSmallIcon as ClockIcon
} from '@/components/icons'

interface Category {
  name: string
  label: string
}

interface GameSessionOverlayProps {
  show: boolean
  gameStarted: boolean
  selectedCategory: string
  currentQuestion: string
  points: number
  lives: number
  gain: number
  timer: number
  questionActive: boolean
  showContinue: boolean
  gameOver: boolean
  categories: Category[]
  onStartGame: (category: string) => void
  onAnswer: (answer: boolean) => void
  onContinue: () => void
  onClose: () => void
  onRestart: () => void
}

export default function GameSessionOverlay({
  gameStarted,
  selectedCategory,
  currentQuestion,
  points,
  lives,
  gain,
  timer,
  questionActive,
  showContinue,
  gameOver,
  categories,
  onStartGame,
  onAnswer,
  onContinue,
  onClose,
  onRestart
}: GameSessionOverlayProps) {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a]/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        className="relative w-full max-w-[650px] rounded-3xl p-6 sm:p-8 border border-emerald-400/15 shadow-[0_30px_80px_rgba(0,0,0,0.5)] my-8"
        style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full font-bold text-xs uppercase flex items-center gap-1.5 shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all z-10"
        >
          <CloseIcon /> Fermer
        </button>

        {!gameStarted ? (
          <div className="text-center py-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-6">Selectionnez une categorie</h1>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => onStartGame(cat.name)}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-400/5 border border-emerald-400/20 text-emerald-400 font-semibold text-sm hover:bg-emerald-400/10 hover:border-emerald-400/40 hover:scale-105 transition-all"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-lg font-bold text-white mb-1">
              Categorie : <span className="text-emerald-400 capitalize">{selectedCategory}</span>
            </h1>
            <div className="flex justify-center items-center gap-4 my-3 flex-wrap text-sm">
              <span className="text-purple-400 font-bold flex items-center gap-1">
                <StarIcon /> Points : {points}
              </span>
              <span className="flex gap-1">
                {Array.from({ length: lives }).map((_, i) => (
                  <FireIcon key={i} />
                ))}
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CoinsIcon /> Gain : {gain.toFixed(2)} FCFA
              </span>
              <span className={`font-bold flex items-center gap-1 ${timer <= 5 ? 'text-red-400' : 'text-orange-400'}`}>
                <ClockIcon /> {timer}s
              </span>
            </div>
            <div className="bg-white/[0.03] rounded-2xl p-5 my-4 border border-emerald-400/10">
              <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                {currentQuestion || 'Chargement...'}
              </p>
            </div>
            {!gameOver && questionActive && (
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => onAnswer(true)}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:scale-105 hover:-translate-y-0.5 transition-all"
                >
                  <CheckIcon /> VRAI
                </button>
                <button
                  onClick={() => onAnswer(false)}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold uppercase tracking-wide text-sm flex items-center gap-2 shadow-lg shadow-red-500/30 hover:scale-105 hover:-translate-y-0.5 transition-all"
                >
                  <XMarkIcon /> FAUX
                </button>
              </div>
            )}
            {showContinue && !gameOver && (
              <button
                onClick={onContinue}
                className="mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold uppercase tracking-wide text-sm flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/30 hover:scale-105 transition-all"
              >
                <ArrowRightIcon /> Continuer
              </button>
            )}
            {gameOver && (
              <button
                onClick={onRestart}
                className="mt-4 px-8 py-3 rounded-full border-2 border-emerald-400 text-emerald-400 font-bold uppercase tracking-wide text-sm hover:bg-emerald-400/10 hover:scale-105 transition-all"
              >
                Retour aux categories
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}