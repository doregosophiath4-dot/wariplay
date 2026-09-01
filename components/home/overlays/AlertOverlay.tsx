'use client'

import { motion } from 'framer-motion'

interface Props {
  title: string
  message: string
  onClose: () => void
}

export default function AlertOverlay({ title, message, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a]/80 backdrop-blur-md z-[10000] flex items-center justify-center p-5" onClick={onClose}>
      <motion.div
        className="relative max-w-[420px] w-full rounded-2xl p-8 text-center border border-orange-500/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
        style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)' }}
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 24 }}
        transition={{ type: 'spring', damping: 22, stiffness: 220 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
        <p className="text-white/65 text-sm mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-10 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold uppercase tracking-wide text-sm shadow-xl shadow-orange-500/40 hover:-translate-y-1 transition-all"
        >
          OK
        </button>
      </motion.div>
    </div>
  )
}