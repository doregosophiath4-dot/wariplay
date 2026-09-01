// components/parametre/overlays/SettingsAlertModal.tsx
'use client'

import { motion } from 'framer-motion'
import { CheckIcon, CloseIcon, WarningIcon } from '@/components/icons'

interface SettingsAlertModalProps {
  type: string
  title: string
  message: string
  onClose: () => void
}

export default function SettingsAlertModal({ type, title, message, onClose }: SettingsAlertModalProps) {
  const iconColor = type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : type === 'warning' ? 'text-orange-400' : 'text-purple-400'
  const Icon = type === 'success' ? CheckIcon : type === 'error' ? CloseIcon : type === 'warning' ? WarningIcon : null

  return (
    <div className="fixed inset-0 bg-[#0a0a1a]/70 backdrop-blur-md z-[3000] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        className="relative w-full max-w-[400px] rounded-2xl p-6 sm:p-8 text-center border shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
        style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e)' }}
        initial={{ scale: 0.85, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`text-4xl mb-4 ${iconColor}`}>
          {Icon && <Icon />}
        </div>
        <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
        <p className="text-white/60 text-sm mb-5">{message}</p>
        <button 
          onClick={onClose} 
          className="px-10 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
        >
          OK
        </button>
      </motion.div>
    </div>
  )
}