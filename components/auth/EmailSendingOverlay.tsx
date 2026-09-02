// components/auth/EmailSendingOverlay.tsx
'use client'

import { motion } from 'framer-motion'
import OverlayWrapper from './OverlayWrapper'

// =====================================================
// ICONES
// =====================================================
const PaperPlaneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
  </svg>
)

interface EmailSendingOverlayProps {
  countdown: number
  sendingMessage: string
  onClose: () => void
}

export default function EmailSendingOverlay({
  countdown,
  sendingMessage,
  onClose
}: EmailSendingOverlayProps) {
  return (
    <OverlayWrapper onClose={onClose} zIndex="z-[1003]">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 relative">
        <div className="w-12 h-10 sm:w-16 sm:h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg shadow-emerald-500/30" />
        <div className="w-8 h-5 sm:w-10 sm:h-6 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-2.5">
        <PaperPlaneIcon /> Envoi en cours...
      </h3>
      <p className="text-white/60 text-sm mb-3 sm:mb-4">Nous preparons et envoyons votre email de recuperation</p>
      <motion.div
        className="text-base sm:text-lg font-semibold text-emerald-400 my-3 sm:my-4"
        key={countdown}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {countdown}
      </motion.div>
      <p className="text-white/50 text-xs sm:text-sm">{sendingMessage}</p>
    </OverlayWrapper>
  )
}