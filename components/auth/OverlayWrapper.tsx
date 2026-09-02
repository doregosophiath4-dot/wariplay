// components/auth/OverlayWrapper.tsx
'use client'

import { motion } from 'framer-motion'

interface OverlayWrapperProps {
  children: React.ReactNode
  onClose: () => void
  zIndex?: string
}

export default function OverlayWrapper({
  children,
  onClose,
  zIndex = 'z-[1002]'
}: OverlayWrapperProps) {
  return (
    <motion.div
      className={`fixed inset-0 bg-[#0a0a1a]/80 backdrop-blur-xl ${zIndex} flex justify-center items-center p-4 sm:p-5`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-[450px] bg-gradient-to-br from-[#1a1a2e]/95 to-[#16213e]/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}