// components/auth/RecoveryOverlay.tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import OverlayWrapper from './OverlayWrapper'
import LoadingButton from './LoadingButton'

// =====================================================
// ICONES
// =====================================================
const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

interface Result {
  type: 'success' | 'error'
  show: boolean
  content?: React.ReactNode
}

interface RecoveryOverlayProps {
  input: string
  onInputChange: (v: string) => void
  loading: boolean
  result: Result
  onSearch: () => void
  onClose: () => void
}

export default function RecoveryOverlay({
  input,
  onInputChange,
  loading,
  result,
  onSearch,
  onClose
}: RecoveryOverlayProps) {
  return (
    <OverlayWrapper onClose={onClose}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-0.5 sm:h-1 rounded-b bg-gradient-to-r from-[#ff6b35] to-emerald-400" />
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-2.5">
        <span className="text-[#ff6b35]"><SearchIcon /></span> Rechercher mon compte
      </h2>
      <p className="text-white/60 text-sm sm:text-base mb-5 sm:mb-6">Entrez votre e-mail, numero ou pseudo :</p>
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Ex: email@exemple.com"
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl text-white outline-none text-center font-semibold text-sm sm:text-base transition-all placeholder:text-white/35 placeholder:font-normal"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      />
      <AnimatePresence>
        {loading && (
          <motion.div
            className="py-4 sm:py-5 text-white/60 text-center text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 border-[3px] border-white/10 border-t-emerald-400 rounded-full animate-spin mx-auto mb-2" />
            <p>Recherche en cours...</p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {result.show && (
          <motion.div
            className={`mt-4 sm:mt-5 p-3 sm:p-4 rounded-xl text-left border-l-4 text-sm ${
              result.type === 'success'
                ? 'bg-emerald-500/5 border-l-emerald-400'
                : 'bg-red-500/5 border-l-red-400'
            }`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {result.content}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5 sm:mt-6">
        <LoadingButton loading={loading} onClick={onSearch} variant="danger">
          Rechercher
        </LoadingButton>
        <LoadingButton loading={false} onClick={onClose} variant="secondary">
          Fermer
        </LoadingButton>
      </div>
    </OverlayWrapper>
  )
}