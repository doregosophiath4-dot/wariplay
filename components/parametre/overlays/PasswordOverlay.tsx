// components/parametre/overlays/PasswordOverlay.tsx
'use client'

import { motion } from 'framer-motion'
import { CloseIcon, CheckIcon } from '@/components/icons'

interface PasswordOverlayProps {
  newPassword: string
  confirmPassword: string
  onNewPasswordChange: (v: string) => void
  onConfirmPasswordChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
}

export default function PasswordOverlay({ 
  newPassword, 
  confirmPassword, 
  onNewPasswordChange, 
  onConfirmPasswordChange, 
  onSave, 
  onCancel 
}: PasswordOverlayProps) {
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
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">Modifier le mot de passe</h3>
        <input 
          type="password" 
          value={newPassword} 
          onChange={(e) => onNewPasswordChange(e.target.value)} 
          placeholder="Nouveau mot de passe"
          className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none mb-3 focus:border-emerald-400/40" 
        />
        <input 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => onConfirmPasswordChange(e.target.value)} 
          placeholder="Confirmer le mot de passe"
          className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none mb-5 focus:border-emerald-400/40" 
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onSave} 
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <CheckIcon /> Enregistrer
          </button>
          <button 
            onClick={onCancel} 
            className="flex-1 py-3 rounded-full bg-white/[0.03] border border-white/10 text-white/70 font-semibold text-sm hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"
          >
            <CloseIcon /> Annuler
          </button>
        </div>
      </motion.div>
    </div>
  )
}