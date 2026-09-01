// components/parametre/overlays/LogoutModal.tsx
'use client'

import { motion } from 'framer-motion'
import { CloseIcon } from '@/components/icons'

interface LogoutModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export default function LogoutModal({ onConfirm, onCancel }: LogoutModalProps) {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={onCancel}>
      <motion.div 
        className="relative w-full max-w-[450px] rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
        style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }}
        initial={{ scale: 0.85, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.85, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
        <button 
          onClick={onCancel} 
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"
        >
          <CloseIcon />
        </button>
        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2.5">Confirmer la deconnexion</h3>
        <p className="text-white/60 text-sm mb-6">Etes-vous sur de vouloir vous deconnecter ?</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onConfirm} 
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
          >
            Deconnexion
          </button>
          <button 
            onClick={onCancel} 
            className="flex-1 py-3 rounded-full bg-white/[0.03] border border-white/10 text-white/70 font-semibold text-sm hover:bg-white/[0.08] transition-all"
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </div>
  )
}