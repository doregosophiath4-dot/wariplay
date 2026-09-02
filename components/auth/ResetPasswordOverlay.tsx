// components/auth/ResetPasswordOverlay.tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import OverlayWrapper from './OverlayWrapper'
import LoadingButton from './LoadingButton'

// =====================================================
// ICONES
// =====================================================
const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
)

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const CircleIcon = () => (
  <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
)

interface Result {
  type: 'success' | 'error'
  show: boolean
  message?: string
}

interface ResetPasswordOverlayProps {
  newPassword: string
  confirmPassword: string
  showNewPassword: boolean
  showConfirmPassword: boolean
  passwordStrength: 'weak' | 'medium' | 'strong' | ''
  reqLength: boolean
  reqUppercase: boolean
  reqLowercase: boolean
  reqNumber: boolean
  reqSpecial: boolean
  loading: boolean
  result: Result
  onNewPasswordChange: (v: string) => void
  onConfirmPasswordChange: (v: string) => void
  onToggleNewPassword: () => void
  onToggleConfirmPassword: () => void
  onReset: () => void
  onClose: () => void
}

export default function ResetPasswordOverlay({
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  passwordStrength,
  reqLength,
  reqUppercase,
  reqLowercase,
  reqNumber,
  reqSpecial,
  loading,
  result,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleNewPassword,
  onToggleConfirmPassword,
  onReset,
  onClose
}: ResetPasswordOverlayProps) {
  const requirements = [
    { valid: reqLength, text: 'Au moins 8 caracteres' },
    { valid: reqUppercase, text: 'Une lettre majuscule' },
    { valid: reqLowercase, text: 'Une lettre minuscule' },
    { valid: reqNumber, text: 'Un chiffre' },
    { valid: reqSpecial, text: 'Un caractere special' }
  ]

  return (
    <OverlayWrapper onClose={onClose} zIndex="z-[1004]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-0.5 sm:h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-2.5">
        <span className="text-emerald-400"><KeyIcon /></span> Nouveau mot de passe
      </h2>
      <p className="text-white/60 text-sm sm:text-base mb-5 sm:mb-6">Creez un nouveau mot de passe securise</p>
      
      <div className="relative mb-4 sm:mb-5">
        <input
          type={showNewPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => onNewPasswordChange(e.target.value)}
          placeholder="Nouveau mot de passe"
          required
          className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 rounded-xl text-white outline-none text-sm sm:text-base transition-all placeholder:text-white/35"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <button
          type="button"
          onClick={onToggleNewPassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-emerald-400 transition-colors"
        >
          {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      
      <div className="relative mb-4 sm:mb-5">
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          placeholder="Confirmer le mot de passe"
          required
          className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 rounded-xl text-white outline-none text-sm sm:text-base transition-all placeholder:text-white/35"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <button
          type="button"
          onClick={onToggleConfirmPassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-emerald-400 transition-colors"
        >
          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-3 sm:mb-4">
        <motion.div
          className="h-full rounded-full"
          animate={{
            width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : passwordStrength === 'strong' ? '100%' : '0%'
          }}
          style={{
            background: passwordStrength === 'weak' ? '#ff4757' : passwordStrength === 'medium' ? '#ffa500' : passwordStrength === 'strong' ? '#2ed573' : 'transparent'
          }}
        />
      </div>
      
      <ul className="text-left text-[10px] sm:text-xs space-y-1 sm:space-y-1.5 mb-4 sm:mb-5">
        {requirements.map((req, i) => (
          <li key={i} className="flex items-center gap-2" style={{ color: req.valid ? '#2ed573' : 'rgba(255,255,255,0.35)' }}>
            <span className="flex-shrink-0"><CircleIcon /></span>
            <span>{req.text}</span>
          </li>
        ))}
      </ul>
      
      <AnimatePresence>
        {result.show && (
          <motion.div
            className={`mb-4 p-3 rounded-xl text-xs sm:text-sm font-semibold ${
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
      
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <LoadingButton loading={loading} onClick={onReset} variant="primary">
          Reinitialiser
        </LoadingButton>
        <LoadingButton loading={false} onClick={onClose} variant="secondary">
          Annuler
        </LoadingButton>
      </div>
    </OverlayWrapper>
  )
}