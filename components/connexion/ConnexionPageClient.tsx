// components/connexion/ConnexionPageClient.tsx
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithCSRF } from '@/lib/api'

// =====================================================
// DYNAMIC IMPORTS DES OVERLAYS
// =====================================================
const RecoveryOverlay = dynamic(
  () => import('@/components/auth/RecoveryOverlay'),
  { ssr: false, loading: () => null }
)

const EmailSendingOverlay = dynamic(
  () => import('@/components/auth/EmailSendingOverlay'),
  { ssr: false, loading: () => null }
)

const VerificationOverlay = dynamic(
  () => import('@/components/auth/VerificationOverlay'),
  { ssr: false, loading: () => null }
)

const RegisterVerificationOverlay = dynamic(
  () => import('@/components/auth/RegisterVerificationOverlay'),
  { ssr: false, loading: () => null }
)

const ResetPasswordOverlay = dynamic(
  () => import('@/components/auth/ResetPasswordOverlay'),
  { ssr: false, loading: () => null }
)

const CodeOverlay = dynamic(
  () => import('@/components/auth/CodeOverlay'),
  { ssr: false, loading: () => null }
)

// =====================================================
// ICÔNES (restantes inline)
// =====================================================
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

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export default function ConnexionPageClient() {
  const router = useRouter()
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

  // =====================================================
  // FONCTIONS
  // =====================================================
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
        const types: Record<string, { label: string; icon: string }> = { 
          email: { label: 'Adresse email', icon: 'email' }, 
          phone: { label: 'Numero de telephone', icon: 'phone' }, 
          name: { label: "Nom d'utilisateur", icon: 'user' } 
        }
        const { label, icon } = types[data.type] || { label: 'Information', icon: 'info' }
        setCurrentRecoveryData(data)
        setRecoveryResult({
          type: 'success', show: true,
          content: (
            <div 
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-emerald-400/5 hover:border-emerald-400/20 border border-white/10 bg-white/[0.02]" 
              onClick={() => startEmailSending(data.value, data.type)}
            >
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

  // =====================================================
  // RENDU
  // =====================================================
  return (
    <>
      {/* ============================================ */}
      {/* SIDEBAR */}
      {/* ============================================ */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              className="fixed inset-0 bg-[#0a0a1a]/70 backdrop-blur-md z-[9998] cursor-pointer" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.aside 
              className="fixed top-0 left-0 w-[85%] max-w-[320px] h-full bg-gradient-to-br from-[#0a0a1a]/98 to-[#0f0f2e]/95 backdrop-blur-2xl z-[9999] p-5 sm:p-6 pt-16 sm:pt-20 shadow-2xl border-r border-emerald-400/10 overflow-y-auto" 
              initial={{ x: -320 }} 
              animate={{ x: 0 }} 
              exit={{ x: -320 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <motion.button 
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer text-[#ff6b35] hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all" 
                onClick={() => setSidebarOpen(false)} 
                whileHover={{ scale: 1.1, rotate: 90 }} 
                whileTap={{ scale: 0.9 }}
              >
                <CloseIcon />
              </motion.button>
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

      {/* ============================================ */}
      {/* NOTIFICATION */}
      {/* ============================================ */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            className={`fixed top-4 right-4 z-[1001] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl backdrop-blur-xl border border-white/10 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium shadow-2xl max-w-[calc(100vw-2rem)] ${notification.type === 'success' ? 'bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 text-white' : 'bg-gradient-to-r from-red-500/90 to-red-600/90 text-white'}`} 
            initial={{ x: 400, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: 400, opacity: 0 }}
          >
            <span className="flex-shrink-0">{notification.type === 'success' ? <CheckIcon /> : <AlertIcon />}</span>
            <span className="truncate">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* MENU TOGGLE */}
      {/* ============================================ */}
      <motion.button 
        className="fixed top-4 left-4 z-[1000] w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center cursor-pointer text-emerald-400 shadow-xl transition-all" 
        style={{ background: 'rgba(26, 26, 46, 0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 200, 150, 0.15)' }} 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }} 
        animate={{ rotate: sidebarOpen ? 180 : 0 }}
      >
        {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
      </motion.button>

      {/* ============================================ */}
      {/* OVERLAYS DYNAMIQUES */}
      {/* ============================================ */}
      
      <AnimatePresence>
        {recoveryOverlay && (
          <RecoveryOverlay
            input={recoveryInput}
            onInputChange={setRecoveryInput}
            loading={searchLoading}
            result={recoveryResult}
            onSearch={handleSearch}
            onClose={() => { setRecoveryOverlay(false); setRecoveryInput(''); setRecoveryResult({ type: 'success', show: false }) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {emailSendingOverlay && (
          <EmailSendingOverlay
            countdown={countdown}
            sendingMessage={sendingMessage}
            onClose={() => { setEmailSendingOverlay(false); if (countdownRef.current) clearInterval(countdownRef.current) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {verificationOverlay && (
          <VerificationOverlay
            code={verificationCodeInput}
            onCodeChange={setVerificationCodeInput}
            loading={verifyLoading}
            result={verificationResult}
            onVerify={handleVerifyCode}
            onClose={() => { setVerificationOverlay(false); setVerificationCodeInput(''); setVerificationResult({ type: 'success', show: false }) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {registerVerificationOverlay && (
          <RegisterVerificationOverlay
            code={registerVerificationCode}
            onCodeChange={setRegisterVerificationCode}
            loading={registerVerifyLoading}
            result={registerVerificationResult}
            onVerify={handleRegisterVerifyCode}
            onClose={() => { setRegisterVerificationOverlay(false); setRegisterVerificationCode(''); setRegisterVerificationResult({ type: 'success', show: false }) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resetPasswordOverlay && (
          <ResetPasswordOverlay
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            showNewPassword={showNewPassword}
            showConfirmPassword={showConfirmPassword}
            passwordStrength={passwordStrength}
            reqLength={reqLength}
            reqUppercase={reqUppercase}
            reqLowercase={reqLowercase}
            reqNumber={reqNumber}
            reqSpecial={reqSpecial}
            loading={resetLoading}
            result={resetPasswordResult}
            onNewPasswordChange={(v) => { setNewPassword(v); checkPasswordStrength(v) }}
            onConfirmPasswordChange={setConfirmPassword}
            onToggleNewPassword={() => setShowNewPassword(!showNewPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            onReset={handleResetPassword}
            onClose={() => { setResetPasswordOverlay(false); setNewPassword(''); setConfirmPassword(''); setPasswordStrength(''); setResetPasswordResult({ type: 'success', show: false }) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {codeOverlay && (
          <CodeOverlay
            code={verificationCode}
            onCodeChange={setVerificationCode}
            loading={codeVerifyLoading}
            result={codeResult}
            onVerify={handleVerifyCodeOverlay}
            onClose={() => { setCodeOverlay(false); setVerificationCode(''); setCodeResult({ type: 'success', show: false }) }}
          />
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* MAIN CONTAINER */}
      {/* ============================================ */}
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
            <motion.form 
              key="login" 
              onSubmit={handleLogin} 
              initial={{ opacity: 0, x: -50 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 50 }}
            >
              <motion.div 
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg" 
                style={{ background: 'rgba(0, 200, 150, 0.12)', border: '1px solid rgba(0, 200, 150, 0.25)' }} 
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="w-10 h-10 sm:w-14 sm:h-14" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Connexion</h2>

              <div className="relative mb-5 sm:mb-6">
                <input 
                  type="text" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  placeholder="Email ou Nom d'utilisateur" 
                  required 
                  className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 rounded-xl text-white outline-none text-sm sm:text-base transition-all placeholder:text-white/35" 
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }} 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/50 pointer-events-none"><UserIcon /></div>
              </div>

              <div className="relative mb-6 sm:mb-8">
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  placeholder="Mot de passe" 
                  required 
                  className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 rounded-xl text-white outline-none text-sm sm:text-base transition-all placeholder:text-white/35" 
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowLoginPassword(!showLoginPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-emerald-400 transition-colors"
                >
                  {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <button 
                onClick={(e) => {
                  e.preventDefault()
                  handleLogin(e)
                }} 
                disabled={loginLoading} 
                className="w-full relative overflow-hidden px-5 sm:px-7 py-3 sm:py-3.5 rounded-full font-bold uppercase tracking-wide text-xs sm:text-sm transition-all duration-300 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:from-emerald-500 hover:to-emerald-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0"
              >
                <span className={loginLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}>
                  Se connecter
                </span>
                {loginLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </button>

              <div className="flex items-center my-5 sm:my-6 text-white/40 text-xs sm:text-sm uppercase tracking-wider before:flex-1 before:border-b before:border-white/10 after:flex-1 after:border-b after:border-white/10">
                <span className="px-3 sm:px-4">OU</span>
              </div>

              <a 
                href="/api/login1" 
                className="inline-flex items-center justify-center gap-2.5 sm:gap-3 w-full max-w-[260px] mx-auto mb-4 sm:mb-5 py-3 sm:py-3.5 px-5 sm:px-6 rounded-full bg-white text-[#3c4043] font-semibold text-sm sm:text-base shadow-lg hover:bg-gray-100 hover:-translate-y-0.5 transition-all border-2 border-transparent hover:border-emerald-400/20"
              >
                <span className="w-5 h-5"><GoogleIcon /></span> Continuer avec Google
              </a>

              <div className="mt-4 sm:mt-5 text-white/70 text-xs sm:text-sm">
                Pas encore de compte ?{' '}
                <motion.span 
                  onClick={() => setActiveTab('inscription')} 
                  className="text-emerald-400 cursor-pointer font-semibold hover:text-emerald-300 underline inline-block" 
                  whileHover={{ scale: 1.05 }}
                >
                  Inscris-toi
                </motion.span>
              </div>

              <div className="mt-3 sm:mt-4 text-center">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); openRecoveryOverlay(); }} 
                  className="text-[#ff6b35] text-xs sm:text-sm font-medium hover:text-[#ff8a5c] underline transition-colors"
                >
                  Mot de passe oublie ?
                </a>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="register" 
              onSubmit={handleRegister} 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -50 }}
            >
              <motion.div 
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg" 
                style={{ background: 'rgba(0, 200, 150, 0.12)', border: '1px solid rgba(0, 200, 150, 0.25)' }} 
                whileHover={{ scale: 1.05, rotate: -5 }}
              >
                <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="w-10 h-10 sm:w-14 sm:h-14" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Inscription</h2>

              <div className="relative mb-5 sm:mb-6">
                <input 
                  type="email" 
                  value={registerEmail} 
                  onChange={(e) => setRegisterEmail(e.target.value)} 
                  placeholder="Adresse email" 
                  required 
                  className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 rounded-xl text-white outline-none text-sm sm:text-base transition-all placeholder:text-white/35" 
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }} 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/50 pointer-events-none"><MailIcon /></div>
              </div>

              <div className="relative mb-6 sm:mb-8">
                <input 
                  type={showRegisterPassword ? "text" : "password"} 
                  value={registerPassword} 
                  onChange={(e) => setRegisterPassword(e.target.value)} 
                  placeholder="Mot de passe" 
                  required 
                  className="w-full px-4 sm:px-5 py-3.5 sm:py-4 pr-12 rounded-xl text-white outline-none text-sm sm:text-base transition-all placeholder:text-white/35" 
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-emerald-400 transition-colors"
                >
                  {showRegisterPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <button 
                onClick={(e) => {
                  e.preventDefault()
                  handleRegister(e)
                }} 
                disabled={registerLoading} 
                className="w-full relative overflow-hidden px-5 sm:px-7 py-3 sm:py-3.5 rounded-full font-bold uppercase tracking-wide text-xs sm:text-sm transition-all duration-300 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:from-emerald-500 hover:to-emerald-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0"
              >
                <span className={registerLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}>
                  Creer un compte
                </span>
                {registerLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </button>

              <div className="flex items-center my-5 sm:my-6 text-white/40 text-xs sm:text-sm uppercase tracking-wider before:flex-1 before:border-b before:border-white/10 after:flex-1 after:border-b after:border-white/10">
                <span className="px-3 sm:px-4">OU</span>
              </div>

              <a 
                href="/api/login1" 
                className="inline-flex items-center justify-center gap-2.5 sm:gap-3 w-full max-w-[260px] mx-auto mb-4 sm:mb-5 py-3 sm:py-3.5 px-5 sm:px-6 rounded-full bg-white text-[#3c4043] font-semibold text-sm sm:text-base shadow-lg hover:bg-gray-100 hover:-translate-y-0.5 transition-all border-2 border-transparent hover:border-emerald-400/20"
              >
                <span className="w-5 h-5"><GoogleIcon /></span> Continuer avec Google
              </a>

              <div className="mt-4 sm:mt-5 text-white/70 text-xs sm:text-sm">
                Deja un compte ?{' '}
                <motion.span 
                  onClick={() => setActiveTab('connexion')} 
                  className="text-emerald-400 cursor-pointer font-semibold hover:text-emerald-300 underline inline-block" 
                  whileHover={{ scale: 1.05 }}
                >
                  Connecte-toi
                </motion.span>
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

      <Script src="https://www.google.com/recaptcha/api.js?render=6LfXF0krAAAAALDoD42UTpju0PZ0q9upXAr5qerR" strategy="lazyOnload" />
    </>
  )
}