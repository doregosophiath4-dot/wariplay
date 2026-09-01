// components/games/overlays/AlertModal.tsx
'use client'

import { motion } from 'framer-motion'
import { CloseIcon } from '@/components/icons'

interface AlertButton {
  text: string
  action: () => void
}

interface AlertModalProps {
  title: string
  message: string
  buttons: AlertButton[]
  onClose: () => void
}

export default function AlertModal({
  title,
  message,
  buttons,
  onClose
}: AlertModalProps) {
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"
        >
          <CloseIcon />
        </button>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {buttons.map((btn, index) => (
            <button
              key={index}
              onClick={btn.action}
              className={`flex-1 py-3 rounded-full font-bold uppercase tracking-wide text-sm transition-all hover:-translate-y-0.5 ${
                index === 0
                  ? 'bg-white/[0.05] border border-white/10 text-white/70 hover:bg-white/[0.1]'
                  : 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
              }`}
            >
              {btn.text}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}