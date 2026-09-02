// components/auth/VerificationOverlay.tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import OverlayWrapper from './OverlayWrapper'
import LoadingButton from './LoadingButton'

// =====================================================
// ICONES
// =====================================================
const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

interface Result {
  type: 'success' | 'error'
  show: boolean
  message?: string
}

interface VerificationOverlayProps {
  code: string
  onCodeChange: (v: string) => void
  loading: boolean
  result: Result
  onVerify: () => void
  onClose: () => void
}

export default function VerificationOverlay({
  code,
  onCodeChange,
  loading,
  result,
  onVerify,
  onClose
}: VerificationOverlayProps) {
  return (
    <OverlayWrapper onClose={onClose}>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-2.5">
        <span className="text-[#ff6b35]"><ShieldIcon /></span> Verification requise
      </h2>
      <p className="text-white/60 text-sm sm:text-base mb-5 sm:mb-6">Verifiez votre boite de reception et entrez le code recu.</p>
      <input
        type="text"
        value={code}
        onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="Code a 6 chiffres"
        maxLength={6}
        inputMode="numeric"
        onKeyDown={(e) => e.key === 'Enter' && onVerify()}
        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl text-white outline-none text-center font-semibold tracking-[4px] sm:tracking-[6px] text-base sm:text-lg transition-all"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
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
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5 sm:mt-6">
        <LoadingButton loading={loading} onClick={onVerify} variant="danger">
          Verifier
        </LoadingButton>
        <LoadingButton loading={false} onClick={onClose} variant="secondary">
          Annuler
        </LoadingButton>
      </div>
    </OverlayWrapper>
  )
}