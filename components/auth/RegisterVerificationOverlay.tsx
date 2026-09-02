// components/auth/RegisterVerificationOverlay.tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import OverlayWrapper from './OverlayWrapper'
import LoadingButton from './LoadingButton'

// =====================================================
// ICONES
// =====================================================
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

interface Result {
  type: 'success' | 'error'
  show: boolean
  message?: string
}

interface RegisterVerificationOverlayProps {
  code: string
  onCodeChange: (v: string) => void
  loading: boolean
  result: Result
  onVerify: () => void
  onClose: () => void
}

export default function RegisterVerificationOverlay({
  code,
  onCodeChange,
  loading,
  result,
  onVerify,
  onClose
}: RegisterVerificationOverlayProps) {
  return (
    <OverlayWrapper onClose={onClose}>
      <motion.div
        className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MailIcon />
      </motion.div>
      <h2 className="text-lg sm:text-xl font-bold text-emerald-400 mb-2 sm:mb-2.5">Verification du code</h2>
      <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-5">Entrez le code recu par email pour confirmer votre identite.</p>
      <input
        type="text"
        value={code}
        onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="Ex: 458921"
        maxLength={6}
        inputMode="numeric"
        onKeyDown={(e) => e.key === 'Enter' && onVerify()}
        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl text-white outline-none text-center font-bold tracking-[4px] sm:tracking-[6px] text-base sm:text-lg transition-all"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,200,150,0.2)' }}
      />
      <AnimatePresence>
        {result.show && (
          <motion.div
            className={`mt-4 p-3 rounded-xl text-xs sm:text-sm font-semibold ${
              result.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-red-500/15 text-red-400'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {result.message}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5">
        <LoadingButton loading={loading} onClick={onVerify} variant="primary">
          Verifier
        </LoadingButton>
        <LoadingButton loading={false} onClick={onClose} variant="secondary">
          Annuler
        </LoadingButton>
      </div>
    </OverlayWrapper>
  )
}