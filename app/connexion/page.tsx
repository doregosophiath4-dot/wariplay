'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithCSRF } from '@/lib/api'

// SVG Icons
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

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
)

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const GamepadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="11" x2="10" y2="11" /><line x1="8" y1="9" x2="8" y2="13" /><line x1="15" y1="12" x2="15.01" y2="12" /><line x1="18" y1="10" x2="18.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
)

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const CircleIcon = () => (
  <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
)

const PaperPlaneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
  </svg>
)

const GoogleIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
    </g>
  </svg>
)

// --------------------------------------------------------------------------
// FIX: OverlayWrapper et LoadingButton étaient déclarés À L'INTÉRIEUR de
// ConnexionPage. À chaque frappe dans un champ, le composant se re-render,
// ces fonctions étaient donc recréées avec une nouvelle identité, et React
// démontait/remontait tout l'arbre du popup (d'où le "ferme/rouvre" à
// chaque lettre + perte de focus). En les sortant au niveau du module,
// leur identité reste stable entre les renders.
// --------------------------------------------------------------------------

const OverlayWrapper = ({
  children,
  onClose,
  zIndex = 'z-[1002]'
}: {
  children: React.ReactNode
  onClose: () => void
  zIndex?: string
}) => (
  <motion.div className={`fixed inset-0 bg-[#0a0a1a]/80 backdrop-blur-xl ${zIndex} flex justify-center items-center p-4 sm:p-5`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.div className="relative w-full max-w-[450px] bg-gradient-to-br from-[#1a1a2e]/95 to-[#16213e]/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.8, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: -20 }} onClick={(e) => e.stopPropagation()}>
      {children}
    </motion.div>
  </motion.div>
)

const LoadingButton = ({
  loading,
  onClick,
  disabled,
  children,
  variant = 'primary',
  fullWidth = true
}: {
  loading: boolean
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
}) => (
  <button onClick={onClick} disabled={loading || disabled} className={`${fullWidth ? 'w-full' : ''} relative overflow-hidden px-5 sm:px-7 py-3 sm:py-3.5 rounded-full font-bold uppercase tracking-wide text-xs sm:text-sm transition-all duration-300 ${variant === 'primary' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:from-emerald-500 hover:to-emerald-700 hover:-translate-y-0.5' : ''} ${variant === 'danger' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 hover:-translate-y-0.5' : ''} ${variant === 'secondary' ? 'bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20' : ''} disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0`}>
    <span className={loading ? 'opacity-0' : 'opacity-100 transition-opacity'}>{children}</span>
    {loading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
  </button>
)

export default function ConnexionPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const [activeTab, setActiveTab] = useState<'connexion' | 'inscription'>('connexion')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [recoveryOverlay, setRecoveryOverlay] = useState(false)
  const [verificationOverlay, setVerificationOverlay] = useState(false)
  const [registerVerificationOverlay, setRegisterVerificationOverlay] = useState(false)
  const [codeOverlay, setCodeOverlay] = useState(false)
  const [emailSendingOverlay, setEmailSendingOverlay] = useState(false)
  const [resetPasswordOverlay, setResetPasswordOverlay] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [registerVerifyLoading, setRegisterVerifyLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [codeVerifyLoading, setCodeVerifyLoading] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [recoveryInput, setRecoveryInput] = useState('')
  const [recoveryResult, setRecoveryResult] = useState<{ type: 'success' | 'error'; show: boolean; content?: React.ReactNode }>({ type: 'success', show: false })
  const [currentRecoveryData, setCurrentRecoveryData] = useState<{ value: string; type: string; found: boolean } | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [sendingMessage, setSendingMessage] = useState("Preparation de l'email...")
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationCodeInput, setVerificationCodeInput] = useState('')
  const [verificationResult, setVerificationResult] = useState<{ type: 'success' | 'error'; show: boolean; message?: string }>({ type: 'success', show: false })
  const [registerVerificationCode, setRegisterVerificationCode] = useState('')
  const [registerVerificationResult, setRegisterVerificationResult] = useState<{ type: 'success' | 'error'; show: boolean; message?: string }>({ type: 'success', show: false })
  const [codeResult, setCodeResult] = useState<{ type: 'success' | 'error'; show: boolean; message?: string }>({ type: 'success', show: false })
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('')
  const [resetPasswordResult, setResetPasswordResult] = useState<{ type: 'success' | 'error'; show: boolean; message?: string }>({ type: 'success', show: false })
  const [reqLength, setReqLength] = useState(false)
  const [reqUppercase, setReqUppercase] = useState(false)
  const [reqLowercase, setReqLowercase] = useState(false)
  const [reqNumber, setReqNumber] = useState(false)
  const [reqSpecial, setReqSpecial] = useState(false)

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let time = 0

    const draw = () => {
      if (!ctx || !canvas) return
      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      time += 0.008

      for (let waveIndex = 0; waveIndex < 5; waveIndex++) {
        ctx.beginPath()
        ctx.strokeStyle = `hsla(${200 + waveIndex * 15}, 80%, ${45 + waveIndex * 5}%, ${0.06 + waveIndex * 0.02})`
        ctx.lineWidth = 1.2 + waveIndex * 0.2
        
        for (let x = 0; x < canvas.width; x += 5) {
          const y = 
            canvas.height * 0.4 + 
            Math.sin(x * 0.003 + time * 0.5 + waveIndex) * 50 +
            Math.cos(x * 0.001 + time * 0.3) * 70 +
            Math.sin(x * 0.005 + waveIndex * 1.5) * 30 +
            waveIndex * 55

          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      for (let i = 0; i < 12; i++) {
        const px = (Math.sin(time * 0.7 + i * 2.1) * 0.5 + 0.5) * canvas.width
        const py = (Math.cos(time * 0.5 + i * 1.7) * 0.5 + 0.5) * canvas.height
        const radius = 1 + Math.sin(time * 2 + i) * 0.5
        
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${180 + i * 20}, 80%, 60%, ${0.08 + Math.sin(time + i) * 0.04})`
        ctx.fill()
      }

      requestAnimationFrame(draw)
    }
    draw()

    return () => window.removeEventListener('resize', resize)
  }, [])

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const getRecaptchaToken = (action: string): Promise<string | null> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !(window as any).grecaptcha) {
        resolve(null)
        return
      }
      ;(window as any).grecaptcha.ready(() => {
        ;(window as any).grecaptcha
          .execute('6LfXF0krAAAAALDoD42UTpju0PZ0q9upXAr5qerR', { action })
          .then((token: string) => resolve(token))
          .catch(() => resolve(null))
      })
    })
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) { showNotification('Veuillez remplir tous les champs.', 'error'); return }
    setLoginLoading(true)
    try {
      const recaptchaToken = await getRecaptchaToken('login')
      const response = await fetchWithCSRF('/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, recaptcha_token: recaptchaToken })
      })
      const data = await response.json()
      setLoginLoading(false)
      if (data.success) {
        localStorage.setItem('user_email', loginEmail)
        showNotification('Connexion reussie !', 'success')
        if (typeof window !== 'undefined') document.dispatchEvent(new CustomEvent('login-success'))
        setTimeout(() => router.push('/home'), 500)
      } else if (data.code_required) {
        showNotification('Un code de verification est requis.', 'error')
        setCodeOverlay(true)
      } else {
        showNotification('Identifiants incorrects.', 'error')
      }
    } catch (err) { setLoginLoading(false); showNotification('Une erreur est survenue.', 'error') }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerEmail || !registerPassword) { showNotification('Veuillez remplir tous les champs.', 'error'); return }
    setRegisterLoading(true)
    try {
      const recaptchaToken = await getRecaptchaToken('register')
      const response = await fetchWithCSRF('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerEmail, password: registerPassword, recaptcha: recaptchaToken })
      })
      const data = await response.json()
      setRegisterLoading(false)
      if (data.success) {
        showNotification('Code de verification envoye par email !', 'success')
        setRegisterVerificationOverlay(true)
        setRegisterVerificationCode('')
        setRegisterVerificationResult({ type: 'success', show: false })
      } else {
        showNotification(data.message || "Erreur d'inscription.", 'error')
      }
    } catch (err) { setRegisterLoading(false); showNotification('Une erreur est survenue.', 'error') }
  }

  const handleRegisterVerifyCode = async () => {
    if (!registerVerificationCode) { setRegisterVerificationResult({ type: 'error', show: true, message: 'Veuillez entrer le code.' }); return }
    setRegisterVerifyLoading(true)
    try {
      const response = await fetchWithCSRF('/api/verify-coded', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: registerVerificationCode })
      })
      const data = await response.json()
      setRegisterVerifyLoading(false)
      if (data.success) {
        setRegisterVerificationResult({ type: 'success', show: true, message: 'Compte verifie avec succes !' })
        localStorage.setItem('user_email', registerEmail)
        if (typeof window !== 'undefined') document.dispatchEvent(new CustomEvent('register-success'))
        setTimeout(() => { setRegisterVerificationOverlay(false); router.push('/home') }, 1500)
      } else {
        setRegisterVerificationResult({ type: 'error', show: true, message: data.message || 'Code invalide.' })
      }
    } catch (err) { setRegisterVerifyLoading(false); setRegisterVerificationResult({ type: 'error', show: true, message: 'Une erreur est survenue.' }) }
  }

  const handleVerifyCodeOverlay = async () => {
    if (!verificationCode) { setCodeResult({ type: 'error', show: true, message: 'Veuillez entrer le code.' }); return }
    setCodeVerifyLoading(true)
    try {
      const response = await fetchWithCSRF('/api/verify-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, code: verificationCode })
      })
      const data = await response.json()
      setCodeVerifyLoading(false)
      if (data.success) {
        localStorage.setItem('user_email', loginEmail)
        showNotification('Verification reussie !', 'success')
        if (typeof window !== 'undefined') document.dispatchEvent(new CustomEvent('login-success'))
        setTimeout(() => { setCodeOverlay(false); router.push('/home') }, 1000)
      } else {
        setCodeResult({ type: 'error', show: true, message: 'Code invalide.' })
      }
    } catch (err) { setCodeVerifyLoading(false); setCodeResult({ type: 'error', show: true, message: 'Une erreur est survenue.' }) }
  }

  const handleSearch = async () => {
    if (!recoveryInput) { setRecoveryResult({ type: 'error', show: true, content: 'Veuillez entrer un email, numero ou pseudo.' }); return }
    setSearchLoading(true)
    try {
      const response = await fetchWithCSRF('/api/search-account', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: recoveryInput })
      })
      const data = await response.json()
      setSearchLoading(false)
      if (data.found) {
        const types: Record<string, { label: string; icon: string }> = { email: { label: 'Adresse email', icon: 'email' }, phone: { label: 'Numero de telephone', icon: 'phone' }, name: { label: "Nom d'utilisateur", icon: 'user' } }
        const { label, icon } = types[data.type] || { label: 'Information', icon: 'info' }
        setCurrentRecoveryData(data)
        setRecoveryResult({
          type: 'success', show: true,
          content: (
            <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-emerald-400/5 hover:border-emerald-400/20 border border-white/10 bg-white/[0.02]" onClick={() => startEmailSending(data.value, data.type)}>
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                {icon === 'email' ? <MailIcon /> : icon === 'phone' ? <span className="text-lg font-bold">+</span> : <UserIcon />}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-0.5">{label} trouve :</div>
                <div className="text-white font-medium text-sm sm:text-base">{data.value}</div>
              </div>
            </div>
          )
        })
      } else {
        setRecoveryResult({ type: 'error', show: true, content: 'Aucun compte ne correspond.' })
      }
    } catch (err) { setSearchLoading(false); setRecoveryResult({ type: 'error', show: true, content: 'Une erreur est survenue.' }) }
  }

  const startEmailSending = (value: string, type: string) => {
    setRecoveryOverlay(false)
    setEmailSendingOverlay(true)
    setSendingMessage("Envoi de l'email en cours...")
    setCountdown(5)
    performEmailSending(value, type)
    let count = 5
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0 && countdownRef.current) clearInterval(countdownRef.current)
    }, 1000)
  }

  const performEmailSending = async (value: string, type: string) => {
    try {
      const response = await fetchWithCSRF('/api/send-recovery-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, type })
      })
      const data = await response.json()
      if (data.success) {
        setSendingMessage("Email envoye avec succes !")
        setCurrentRecoveryData({ value, type, found: true })
        setTimeout(() => {
          setEmailSendingOverlay(false)
          setVerificationOverlay(true)
          setVerificationCodeInput('')
          setVerificationResult({ type: 'success', show: false })
        }, (countdown + 1) * 1000)
      } else {
        setEmailSendingOverlay(false)
        showNotification("Erreur lors de l'envoi de l'email.", 'error')
      }
    } catch (err) { setEmailSendingOverlay(false); showNotification('Une erreur est survenue.', 'error') }
  }

  const handleVerifyCode = async () => {
    if (!verificationCodeInput) { setVerificationResult({ type: 'error', show: true, message: 'Veuillez entrer le code.' }); return }
    if (!currentRecoveryData) { setVerificationResult({ type: 'error', show: true, message: 'Aucune donnee de recuperation.' }); return }
    setVerifyLoading(true)
    try {
      const response = await fetchWithCSRF('/api/verify-email-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCodeInput, value: currentRecoveryData.value, type: currentRecoveryData.type })
      })
      const data = await response.json()
      setVerifyLoading(false)
      if (data.success) {
        setVerificationResult({ type: 'success', show: true, message: 'Code verifie avec succes !' })
        setTimeout(() => { setVerificationOverlay(false); setResetPasswordOverlay(true) }, 1000)
      } else {
        setVerificationResult({ type: 'error', show: true, message: 'Code invalide.' })
      }
    } catch (err) { setVerifyLoading(false); setVerificationResult({ type: 'error', show: true, message: 'Une erreur est survenue.' }) }
  }

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) { setResetPasswordResult({ type: 'error', show: true, message: 'Les mots de passe ne correspondent pas.' }); return }
    setResetLoading(true)
    try {
      const response = await fetchWithCSRF('/api/update-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentRecoveryData?.value, new_password: newPassword })
      })
      const data = await response.json()
      setResetLoading(false)
      if (data.success) {
        setResetPasswordResult({ type: 'success', show: true, message: 'Mot de passe reinitialise avec succes !' })
        setTimeout(() => { setResetPasswordOverlay(false); showNotification('Mot de passe modifie avec succes !', 'success') }, 1500)
      } else {
        setResetPasswordResult({ type: 'error', show: true, message: data.message || 'Une erreur est survenue.' })
      }
    } catch (err) { setResetLoading(false); setResetPasswordResult({ type: 'error', show: true, message: 'Une erreur est survenue.' }) }
  }

  const checkPasswordStrength = useCallback((password: string) => {
    setReqLength(password.length >= 8)
    setReqUppercase(/[A-Z]/.test(password))
    setReqLowercase(/[a-z]/.test(password))
    setReqNumber(/[0-9]/.test(password))
    setReqSpecial(/[^A-Za-z0-9]/.test(password))
    const score = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length
    if (score <= 2) setPasswordStrength('weak')
    else if (score <= 4) setPasswordStrength('medium')
    else setPasswordStrength('strong')
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (recoveryOverlay) setRecoveryOverlay(false)
        if (verificationOverlay) setVerificationOverlay(false)
        if (registerVerificationOverlay) setRegisterVerificationOverlay(false)
        if (codeOverlay) setCodeOverlay(false)
        if (emailSendingOverlay) setEmailSendingOverlay(false)
        if (resetPasswordOverlay) setResetPasswordOverlay(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [recoveryOverlay, verificationOverlay, registerVerificationOverlay, codeOverlay, emailSendingOverlay, resetPasswordOverlay])

  const openRecoveryOverlay = () => {
    setSidebarOpen(false)
    setRecoveryOverlay(true)
    setRecoveryInput('')
    setRecoveryResult({ type: 'success', show: false })
    setCurrentRecoveryData(null)
  }

  return (
    <>
      <div className="min-h-screen bg-[#0a0a1a] flex justify-center items-center relative overflow-hidden font-['Poppins',sans-serif]">
        
        {/* Canvas waves background */}
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" style={{ opacity: 0.4 }} />

        {/* Orbs lumineux */}
        <div className="fixed w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] rounded-full pointer-events-none z-0 -top-[15%] -left-[10%] animate-[float1_12s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="fixed w-[250px] sm:w-[350px] md:w-[400px] h-[250px] sm:h-[350px] md:h-[400px] rounded-full pointer-events-none z-0 -bottom-[10%] -right-[5%] animate-[float2_15s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="fixed w-[200px] sm:w-[250px] md:w-[300px] h-[200px] sm:h-[250px] md:h-[300px] rounded-full pointer-events-none z-0 top-[30%] left-[50%] animate-[float1_10s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div className="fixed inset-0 bg-[#0a0a1a]/70 backdrop-blur-md z-[9998] cursor-pointer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />
              <motion.aside className="fixed top-0 left-0 w-[85%] max-w-[320px] h-full bg-gradient-to-br from-[#0a0a1a]/98 to-[#0f0f2e]/95 backdrop-blur-2xl z-[9999] p-5 sm:p-6 pt-16 sm:pt-20 shadow-2xl border-r border-emerald-400/10 overflow-y-auto" initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
                <motion.button className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer text-[#ff6b35] hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all" onClick={() => setSidebarOpen(false)} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}><CloseIcon /></motion.button>
                <div className="text-center mb-6 sm:mb-8 pb-5 border-b border-emerald-400/10">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shadow-lg">
                    <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white">Navigation</div>
                </div>
                <ul className="space-y-1 mb-6 sm:mb-8">
                  {[
                    { href: '/3x', label: 'Accueil', icon: <HomeIcon /> },
                    { href: '/jeux', label: 'Jeux', icon: <GamepadIcon /> },
                    { href: '/equipe', label: 'Communaute', icon: <UsersIcon /> },
                    { href: '/lalma', label: 'Aide', icon: <HelpIcon /> }
                  ].map(item => (
                    <motion.li key={item.href} whileHover={{ x: 5 }}>
                      <Link href={item.href} className="flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 text-white/70 hover:text-emerald-400 hover:bg-emerald-400/5 rounded-xl transition-all duration-300 font-medium text-sm sm:text-base" onClick={() => setSidebarOpen(false)}>
                        <span className="text-emerald-400 w-5 flex justify-center">{item.icon}</span> {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <div className="pt-5 border-t border-emerald-400/10">
                  <motion.li whileHover={{ x: 5 }} className="list-none">
                    <a href="#" onClick={(e) => { e.preventDefault(); openRecoveryOverlay(); }} className="flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 bg-orange-500/10 text-[#ff6b35] hover:bg-orange-500/20 rounded-xl transition-all duration-300 font-medium text-sm sm:text-base">
                      <span className="w-5 flex justify-center"><KeyIcon /></span> Mot de passe oublie
                    </a>
                  </motion.li>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div className={`fixed top-4 right-4 z-[1001] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl backdrop-blur-xl border border-white/10 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium shadow-2xl max-w-[calc(100vw-2rem)] ${notification.type === 'success' ? 'bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 text-white' : 'bg-gradient-to-r from-red-500/90 to-red-600/90 text-white'}`} initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}>
              <span className="flex-shrink-0">{notification.type === 'success' ? <CheckIcon /> : <AlertIcon />}</span>
              <span className="truncate">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Toggle */}
        <motion.button className="fixed top-4 left-4 z-[1000] w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center cursor-pointer text-emerald-400 shadow-xl transition-all" style={{ background: 'rgba(26, 26, 46, 0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 200, 150, 0.15)' }} onClick={() => setSidebarOpen(!sidebarOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} animate={{ rotate: sidebarOpen ? 180 : 0 }}>
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </motion.button>

        {/* Recovery Overlay */}
        <AnimatePresence>
          {recoveryOverlay && (
            <OverlayWrapper onClose={() => { setRecoveryOverlay(false); setRecoveryInput(''); setRecoveryResult({ type: 'success', show: false }); }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-0.5 sm:h-1 rounded-b bg-gradient-to-r from-[#ff6b35] to-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-2.5"><span className="text-[#ff6b35]"><SearchIcon /></span> Rechercher mon compte</h2>
              <p className="text-white/60 text-sm sm:text-base mb-5 sm:mb-6">Entrez votre e-mail, numero ou pseudo :</p>
              <input type="text" value={recoveryInput} onChange={(e) => setRecoveryInput(e.target.value)} placeholder="Ex: email@exemple.com" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl text-white outline-none text-center font-semibold text-sm sm:text-base transition-all placeholder:text-white/35 placeholder:font-normal" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <AnimatePresence>
                {searchLoading && (
                  <motion.div className="py-4 sm:py-5 text-white/60 text-center text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 border-[3px] border-white/10 border-t-emerald-400 rounded-full animate-spin mx-auto mb-2" /><p>Recherche en cours...</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {recoveryResult.show && (
                  <motion.div className={`mt-4 sm:mt-5 p-3 sm:p-4 rounded-xl text-left border-l-4 text-sm ${recoveryResult.type === 'success' ? 'bg-emerald-500/5 border-l-emerald-400' : 'bg-red-500/5 border-l-red-400'}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>{recoveryResult.content}</motion.div>
                )}
              </AnimatePresence>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                <LoadingButton loading={searchLoading} onClick={handleSearch} variant="danger">Rechercher</LoadingButton>
                <LoadingButton loading={false} onClick={() => { setRecoveryOverlay(false); setRecoveryInput(''); setRecoveryResult({ type: 'success', show: false }); }} variant="secondary">Fermer</LoadingButton>
              </div>
            </OverlayWrapper>
          )}
        </AnimatePresence>

        {/* Email Sending Overlay */}
        <AnimatePresence>
          {emailSendingOverlay && (
            <OverlayWrapper onClose={() => { setEmailSendingOverlay(false); if (countdownRef.current) clearInterval(countdownRef.current); }} zIndex="z-[1003]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 relative">
                <div className="w-12 h-10 sm:w-16 sm:h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg shadow-emerald-500/30" />
                <div className="w-8 h-5 sm:w-10 sm:h-6 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-2.5"><PaperPlaneIcon /> Envoi en cours...</h3>
              <p className="text-white/60 text-sm mb-3 sm:mb-4">Nous preparons et envoyons votre email de recuperation</p>
              <motion.div className="text-base sm:text-lg font-semibold text-emerald-400 my-3 sm:my-4" key={countdown} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{countdown}</motion.div>
              <p className="text-white/50 text-xs sm:text-sm">{sendingMessage}</p>
            </OverlayWrapper>
          )}
        </AnimatePresence>

        {/* Verification Overlay (Recovery) */}
        <AnimatePresence>
          {verificationOverlay && (
            <OverlayWrapper onClose={() => { setVerificationOverlay(false); setVerificationCodeInput(''); setVerificationResult({ type: 'success', show: false }); }}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-2.5"><span className="text-[#ff6b35]"><ShieldIcon /></span> Verification requise</h2>
              <p className="text-white/60 text-sm sm:text-base mb-5 sm:mb-6">Verifiez votre boite de reception et entrez le code recu.</p>
              <input type="text" value={verificationCodeInput} onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Code a 6 chiffres" maxLength={6} inputMode="numeric" onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl text-white outline-none text-center font-semibold tracking-[4px] sm:tracking-[6px] text-base sm:text-lg transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <AnimatePresence>
                {verificationResult.show && (
                  <motion.div className={`mt-4 p-3 rounded-xl text-xs sm:text-sm font-semibold ${verificationResult.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>{verificationResult.message}</motion.div>
                )}
              </AnimatePresence>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                <LoadingButton loading={verifyLoading} onClick={handleVerifyCode} variant="danger">Verifier</LoadingButton>
                <LoadingButton loading={false} onClick={() => { setVerificationOverlay(false); setVerificationCodeInput(''); setVerificationResult({ type: 'success', show: false }); }} variant="secondary">Annuler</LoadingButton>
              </div>
            </OverlayWrapper>
          )}
        </AnimatePresence>

        {/* Register Verification Overlay */}
        <AnimatePresence>
          {registerVerificationOverlay && (
            <OverlayWrapper onClose={() => { setRegisterVerificationOverlay(false); setRegisterVerificationCode(''); setRegisterVerificationResult({ type: 'success', show: false }); }}>
              <motion.div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}><MailIcon /></motion.div>
              <h2 className="text-lg sm:text-xl font-bold text-emerald-400 mb-2 sm:mb-2.5">Verification du code</h2>
              <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-5">Entrez le code recu par email pour confirmer votre identite.</p>
              <input type="text" value={registerVerificationCode} onChange={(e) => setRegisterVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Ex: 458921" maxLength={6} inputMode="numeric" onKeyDown={(e) => e.key === 'Enter' && handleRegisterVerifyCode()} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl text-white outline-none text-center font-bold tracking-[4px] sm:tracking-[6px] text-base sm:text-lg transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,200,150,0.2)' }} />
              <AnimatePresence>
                {registerVerificationResult.show && (
                  <motion.div className={`mt-4 p-3 rounded-xl text-xs sm:text-sm font-semibold ${registerVerificationResult.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>{registerVerificationResult.message}</motion.div>
                )}
              </AnimatePresence>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5">
                <LoadingButton loading={registerVerifyLoading} onClick={handleRegisterVerifyCode} variant="primary">Verifier</LoadingButton>
                <LoadingButton loading={false} onClick={() => { setRegisterVerificationOverlay(false); setRegisterVerificationCode(''); setRegisterVerificationResult({ type: 'success', show: false }); }} variant="secondary">Annuler</LoadingButton>
              </div>
            </OverlayWrapper>
          )}
        </AnimatePresence>

        {/* Reset Password Overlay */}
        <AnimatePresence>
          {resetPasswordOverlay && (
            <OverlayWrapper onClose={() => { setResetPasswordOverlay(false); setNewPassword(''); setConfirmPassword(''); setPasswordStrength(''); setResetPasswordResult({ type: 'success', show: false }); }} zIndex="z-[1004]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-0.5 sm:h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-2.5"><span className="text-emerald-400"><KeyIcon /></span> Nouveau mot de passe</h2>
              <p className="text-white/60 text-sm sm:text-base mb-5 sm:mb-6">Creez un nouveau mot de passe securise</p>
              <div className="relative mb-4 sm:mb-5">
                <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); checkPasswordStrength(e.target.value) }} placeholder="Nouveau mot de passe" required className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 rounded-xl text-white outline-none text-sm sm:text-base transition-all placeholder:text-white/35" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-emerald-400 transition-colors">{showNewPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
              </div>
              <div className="relative mb-4 sm:mb-5">
                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmer le mot de passe" required className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 rounded-xl text-white outline-none text-sm sm:text-base transition-all placeholder:text-white/35" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-emerald-400 transition-colors">{showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-3 sm:mb-4">
                <motion.div className="h-full rounded-full" animate={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : passwordStrength === 'strong' ? '100%' : '0%' }} style={{ background: passwordStrength === 'weak' ? '#ff4757' : passwordStrength === 'medium' ? '#ffa500' : passwordStrength === 'strong' ? '#2ed573' : 'transparent' }} />
              </div>
              <ul className="text-left text-[10px] sm:text-xs space-y-1 sm:space-y-1.5 mb-4 sm:mb-5">
                {[{ valid: reqLength, text: 'Au moins 8 caracteres' },{ valid: reqUppercase, text: 'Une lettre majuscule' },{ valid: reqLowercase, text: 'Une lettre minuscule' },{ valid: reqNumber, text: 'Un chiffre' },{ valid: reqSpecial, text: 'Un caractere special' }].map((req, i) => (
                  <li key={i} className="flex items-center gap-2" style={{ color: req.valid ? '#2ed573' : 'rgba(255,255,255,0.35)' }}><span className="flex-shrink-0"><CircleIcon /></span><span>{req.text}</span></li>
                ))}
              </ul>
              <AnimatePresence>
                {resetPasswordResult.show && (
                  <motion.div className={`mb-4 p-3 rounded-xl text-xs sm:text-sm font-semibold ${resetPasswordResult.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>{resetPasswordResult.message}</motion.div>
                )}
              </AnimatePresence>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <LoadingButton loading={resetLoading} onClick={handleResetPassword} variant="primary">Reinitialiser</LoadingButton>
                <LoadingButton loading={false} onClick={() => { setResetPasswordOverlay(false); setNewPassword(''); setConfirmPassword(''); setPasswordStrength(''); setResetPasswordResult({ type: 'success', show: false }); }} variant="secondary">Annuler</LoadingButton>
              </div>
            </OverlayWrapper>
          )}
        </AnimatePresence>

        {/* Code Overlay (2FA) */}
        <AnimatePresence>
          {codeOverlay && (
            <OverlayWrapper onClose={() => { setCodeOverlay(false); setVerificationCode(''); setCodeResult({ type: 'success', show: false }); }}>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-2.5"><span className="text-[#ff6b35]"><ShieldIcon /></span> Verification en deux etapes</h2>
              <p className="text-white/60 text-sm sm:text-base mb-5 sm:mb-6">Verifiez votre boite de reception et entrez le code recu.</p>
              <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Code a 6 chiffres" maxLength={6} inputMode="numeric" onKeyDown={(e) => e.key === 'Enter' && handleVerifyCodeOverlay()} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl text-white outline-none text-center font-semibold tracking-[4px] sm:tracking-[6px] text-base sm:text-lg transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <AnimatePresence>
                {codeResult.show && (
                  <motion.div className={`mt-4 sm:mt-5 p-3 rounded-xl text-xs sm:text-sm font-semibold ${codeResult.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>{codeResult.message}</motion.div>
                )}
              </AnimatePresence>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                <LoadingButton loading={codeVerifyLoading} onClick={handleVerifyCodeOverlay} variant="danger">Verifier</LoadingButton>
                <LoadingButton loading={false} onClick={() => { setCodeOverlay(false); setVerificationCode(''); setCodeResult({ type: 'success', show: false }); }} variant="secondary">Annuler</LoadingButton>
              </div>
            </OverlayWrapper>
          )}
        </AnimatePresence>

        {/* Main Container - TRANSPARENT */}
        <motion.div 
          className="relative z-10 w-[92%] max-w-[420px] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-center border my-8 sm:my-0"
          style={{ 
            background: 'rgba(15, 15, 40, 0.4)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 200, 150, 0.1) inset, 0 0 80px rgba(0, 200, 150, 0.05)'
          }}
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }} 
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-0.5 sm:h-1 rounded-b bg-gradient-to-r from-emerald-400 via-[#ff6b35] to-purple-400" />

          <AnimatePresence mode="wait">
            {activeTab === 'connexion' ? (
              <motion.form key="login" onSubmit={handleLogin} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                <motion.div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(0, 200, 150, 0.12)', border: '1px solid rgba(0, 200, 150, 0.25)' }} whileHover={{ scale: 1.05, rotate: 5 }}>
                  <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="w-10 h-10 sm:w-14 sm:h-14" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Connexion</h2>

                <div className="relative mb-5 sm:mb-6">
                  <input type="text" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email ou Nom d'utilisateur" required className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 rounded-xl text-white outline-none text-sm sm:text-base transition-all placeholder:text-white/35" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }} />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/50 pointer-events-none"><UserIcon /></div>
                </div>

                <div className="relative mb-6 sm:mb-8">
                  <input type={showLoginPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Mot de passe" required className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 rounded-xl text-white outline-none text-sm sm:text-base transition-all placeholder:text-white/35" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }} />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-emerald-400 transition-colors">{showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                </div>

                <LoadingButton loading={loginLoading} onClick={() => {}} variant="primary">Se connecter</LoadingButton>

                <div className="flex items-center my-5 sm:my-6 text-white/40 text-xs sm:text-sm uppercase tracking-wider before:flex-1 before:border-b before:border-white/10 after:flex-1 after:border-b after:border-white/10"><span className="px-3 sm:px-4">OU</span></div>

                <a href="/api/login1" className="inline-flex items-center justify-center gap-2.5 sm:gap-3 w-full max-w-[260px] mx-auto mb-4 sm:mb-5 py-3 sm:py-3.5 px-5 sm:px-6 rounded-full bg-white text-[#3c4043] font-semibold text-sm sm:text-base shadow-lg hover:bg-gray-100 hover:-translate-y-0.5 transition-all border-2 border-transparent hover:border-emerald-400/20">
                  <span className="w-5 h-5"><GoogleIcon /></span> Continuer avec Google
                </a>

                <div className="mt-4 sm:mt-5 text-white/70 text-xs sm:text-sm">
                  Pas encore de compte ?{' '}
                  <motion.span onClick={() => setActiveTab('inscription')} className="text-emerald-400 cursor-pointer font-semibold hover:text-emerald-300 underline inline-block" whileHover={{ scale: 1.05 }}>Inscris-toi</motion.span>
                </div>

                <div className="mt-3 sm:mt-4 text-center">
                  <a href="#" onClick={(e) => { e.preventDefault(); openRecoveryOverlay(); }} className="text-[#ff6b35] text-xs sm:text-sm font-medium hover:text-[#ff8a5c] underline transition-colors">Mot de passe oublie ?</a>
                </div>
              </motion.form>
            ) : (
              <motion.form key="register" onSubmit={handleRegister} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                <motion.div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'rgba(0, 200, 150, 0.12)', border: '1px solid rgba(0, 200, 150, 0.25)' }} whileHover={{ scale: 1.05, rotate: -5 }}>
                  <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="w-10 h-10 sm:w-14 sm:h-14" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Inscription</h2>

                <div className="relative mb-5 sm:mb-6">
                  <input type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="Adresse email" required className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 rounded-xl text-white outline-none text-sm sm:text-base transition-all placeholder:text-white/35" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }} />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/50 pointer-events-none"><MailIcon /></div>
                </div>

                <div className="relative mb-6 sm:mb-8">
                  <input type={showRegisterPassword ? "text" : "password"} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder="Mot de passe" required className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 rounded-xl text-white outline-none text-sm sm:text-base transition-all placeholder:text-white/35" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }} />
                  <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-emerald-400 transition-colors">{showRegisterPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                </div>

                <LoadingButton loading={registerLoading} onClick={() => {}} variant="primary">Creer un compte</LoadingButton>

                <div className="flex items-center my-5 sm:my-6 text-white/40 text-xs sm:text-sm uppercase tracking-wider before:flex-1 before:border-b before:border-white/10 after:flex-1 after:border-b after:border-white/10"><span className="px-3 sm:px-4">OU</span></div>

                <a href="/api/login1" className="inline-flex items-center justify-center gap-2.5 sm:gap-3 w-full max-w-[260px] mx-auto mb-4 sm:mb-5 py-3 sm:py-3.5 px-5 sm:px-6 rounded-full bg-white text-[#3c4043] font-semibold text-sm sm:text-base shadow-lg hover:bg-gray-100 hover:-translate-y-0.5 transition-all border-2 border-transparent hover:border-emerald-400/20">
                  <span className="w-5 h-5"><GoogleIcon /></span> Continuer avec Google
                </a>

                <div className="mt-4 sm:mt-5 text-white/70 text-xs sm:text-sm">
                  Deja un compte ?{' '}
                  <motion.span onClick={() => setActiveTab('connexion')} className="text-emerald-400 cursor-pointer font-semibold hover:text-emerald-300 underline inline-block" whileHover={{ scale: 1.05 }}>Connecte-toi</motion.span>
                </div>

                <div className="mt-5 sm:mt-6 text-[10px] sm:text-xs text-white/50 leading-relaxed">
                  En vous inscrivant, vous acceptez nos{' '}
                  <a href="/condition" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">Conditions d&apos;utilisation</a> et notre{' '}
                  <a href="/condition" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">Politique de confidentialite</a>.
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <Script src="https://www.google.com/recaptcha/api.js?render=6LfXF0krAAAAALDoD42UTpju0PZ0q9upXAr5qerR" strategy="lazyOnload" />
    </>
  )
}