'use client'

import { motion } from 'framer-motion'

interface Props {
  onClose: () => void
}

export default function WelcomeOverlay({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a]/90 backdrop-blur-xl z-[10002] flex items-center justify-center p-5" onClick={onClose}>
      <motion.div
        className="relative max-w-[520px] w-full rounded-3xl p-8 sm:p-10 text-center border border-emerald-400/25 shadow-[0_35px_100px_rgba(0,0,0,0.6),0_0_0_1px_rgba(0,200,150,0.2)_inset]"
        style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)' }}
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 24 }}
        transition={{ type: 'spring', damping: 22, stiffness: 220 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 rounded-b bg-gradient-to-r from-emerald-400 via-orange-500 to-purple-400" />
        <h2
          className="text-xl sm:text-2xl font-extrabold mb-5 mt-3"
          style={{ background: 'linear-gradient(135deg, #00c896, #ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Bienvenue sur Wariplay !
        </h2>
        <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-7">
          Nous sommes ravis de vous compter parmi notre communauté. Votre inscription et l&apos;utilisation de notre plateforme impliquent que vous reconnaissez avoir lu et accepté les conditions générales d&apos;utilisation (CGU). Nous vous souhaitons d&apos;excellents moments de jeu !
        </p>
        <button
          onClick={onClose}
          className="px-12 py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm shadow-xl shadow-emerald-500/40 hover:-translate-y-1 transition-all"
        >
          Continuer
        </button>
      </motion.div>
    </div>
  )
}