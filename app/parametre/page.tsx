'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

// =====================================================
// SVG ICONS
// =====================================================
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
)
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
)
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
)
const StoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" /><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" /></svg>
)
const GamepadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="11" x2="10" y2="11" /><line x1="8" y1="9" x2="8" y2="13" /><line x1="15" y1="12" x2="15.01" y2="12" /><line x1="18" y1="10" x2="18.01" y2="10" /><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" /></svg>
)
const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
)
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
)
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
)
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
)
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
)
const GiftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
)
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
)
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
)
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
)
const TrophyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
)
const MegaphoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
)
const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
)
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
)
const VolumeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
)
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
)
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
)
const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
)
const CaretDownIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
)

export default function ParametrePage() {
  useAuth()
  const pathname = usePathname() 
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [twoFA, setTwoFA] = useState(false)
  const [twoFALoading, setTwoFALoading] = useState(true)
  const [emailNotif, setEmailNotif] = useState(false)
  const [emailNotifLoading, setEmailNotifLoading] = useState(true)
  const [activateReferral, setActivateReferral] = useState(false)
  const [activateReferralLoading, setActivateReferralLoading] = useState(true)
  const [useReferral, setUseReferral] = useState(false)
  const [referralActivated, setReferralActivated] = useState(false)
  const [gainsNotif, setGainsNotif] = useState(true)
  const [promoNotif, setPromoNotif] = useState(true)
  const [newGamesNotif, setNewGamesNotif] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [soundEffects, setSoundEffects] = useState(true)
  const [language, setLanguage] = useState('Francais')
  const [showCodeOverlay, setShowCodeOverlay] = useState(false)
  const [showPasswordOverlay, setShowPasswordOverlay] = useState(false)
  const [showPhoneOverlay, setShowPhoneOverlay] = useState(false)
  const [showReferralPopup, setShowReferralPopup] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Chargement...')
  const [showAlert, setShowAlert] = useState<{ type: string; title: string; message: string } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [referralInput, setReferralInput] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('+221 77 123 45 67')

  const navItems = [
    { href: '/home', icon: <HomeIcon />, label: 'Home' },
    { href: '/target', icon: <TargetIcon />, label: 'Target' },
    { href: '/ordre', icon: <ListIcon />, label: 'Ordre' },
    { href: '/profile', icon: <UserIcon />, label: 'Profil' },
    { href: '/store', icon: <StoreIcon />, label: 'Wari Store' },
    { href: '/Game', icon: <GamepadIcon />, label: 'Games' },
    { href: '/stats', icon: <ChartIcon />, label: 'Stats' },
    { href: '/parametre', icon: <SettingsIcon />, label: 'Parametres' }
  ]

  useEffect(() => {
    let cancelled = false
    async function loadSettings() {
      await initAll()
      try { const res = await fetchWithAllTokens('/api/verif-activee'); if (res.ok && !cancelled) { const data = await res.json(); setTwoFA(!!data.active) } } catch {} finally { if (!cancelled) setTwoFALoading(false) }
      try { const res = await fetchWithAllTokens('/api/check_notifications'); if (res.ok && !cancelled) { const data = await res.json(); setEmailNotif(data.email_notifications === true) } } catch {} finally { if (!cancelled) setEmailNotifLoading(false) }
      try { const res = await fetchWithAllTokens('/api/check-verification-status'); if (res.ok && !cancelled) { const data = await res.json(); setActivateReferral(!!data.verify) } } catch {} finally { if (!cancelled) setActivateReferralLoading(false) }
      try { const res = await fetchWithAllTokens('/api/check-referral-status'); if (res.ok && !cancelled) { const data = await res.json(); setReferralActivated(data.activated === true); setUseReferral(data.activated === true) } } catch {}
    }
    loadSettings()
    return () => { cancelled = true }
  }, [])

  // Canvas
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    let time = 0
    const draw = () => {
      if (!ctx || !canvas) return
      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)'; ctx.fillRect(0, 0, canvas.width, canvas.height); time += 0.008
      for (let w = 0; w < 5; w++) {
        ctx.beginPath(); ctx.strokeStyle = `hsla(${200 + w * 15}, 80%, ${45 + w * 5}%, ${0.06 + w * 0.02})`; ctx.lineWidth = 1.2 + w * 0.2
        for (let x = 0; x < canvas.width; x += 5) { const y = canvas.height * 0.4 + Math.sin(x * 0.003 + time * 0.5 + w) * 50 + Math.cos(x * 0.001 + time * 0.3) * 70 + Math.sin(x * 0.005 + w * 1.5) * 30 + w * 55; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y) }
        ctx.stroke()
      }
      for (let i = 0; i < 12; i++) { const px = (Math.sin(time * 0.7 + i * 2.1) * 0.5 + 0.5) * canvas.width; const py = (Math.cos(time * 0.5 + i * 1.7) * 0.5 + 0.5) * canvas.height; ctx.beginPath(); ctx.arc(px, py, 1 + Math.sin(time * 2 + i) * 0.5, 0, Math.PI * 2); ctx.fillStyle = `hsla(${180 + i * 20}, 80%, 60%, ${0.08 + Math.sin(time + i) * 0.04})`; ctx.fill() }
      requestAnimationFrame(draw)
    }
    draw(); return () => window.removeEventListener('resize', resize)
  }, [])

  const showNotification = (type: string, title: string, message: string) => { setShowAlert({ type, title, message }); setTimeout(() => setShowAlert(null), 4000) }
  const showLoader = (text: string) => { setLoadingText(text); setShowLoading(true) }
  const hideLoader = () => setShowLoading(false)

  // Handlers simplifiés
  const handleToggle2FA = async () => {
    if (!twoFA) { setShowCodeOverlay(true) } else {
      showLoader('Desactivation...')
      try { const res = await fetchWithAllTokens('/api/supprimer-code', { method: 'POST' }); const data = await res.json(); if (data.status === 'success') { setTwoFA(false); showNotification('success', 'Desactive', '2FA desactivee.') } else showNotification('error', 'Erreur', 'Echec.') } catch { showNotification('error', 'Erreur', 'Erreur.') } finally { hideLoader() }
    }
  }
  const confirmCode = async () => {
    if (verificationCode.length < 4) return; showLoader('Verification...')
    try { const res = await fetchWithAllTokens('/api/enregistrer-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: verificationCode }) }); const data = await res.json(); if (data.status === 'success') { setShowCodeOverlay(false); setTwoFA(true); setVerificationCode(''); showNotification('success', 'Active !', '2FA activee.') } else showNotification('error', 'Erreur', 'Code invalide.') } catch { showNotification('error', 'Erreur', 'Erreur.') } finally { hideLoader() }
  }
  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) { showNotification('warning', 'Erreur', 'Mots de passe differents.'); return }; showLoader('Modification...')
    try { const res = await fetchWithAllTokens('/api/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: newPassword }) }); const data = await res.json(); if (data.status === 'success') { setShowPasswordOverlay(false); setNewPassword(''); setConfirmPassword(''); showNotification('success', 'Succes', 'Mot de passe modifie !') } else showNotification('error', 'Erreur', 'Echec.') } catch { showNotification('error', 'Erreur', 'Erreur.') } finally { hideLoader() }
  }
  const handleSavePhone = async () => { showLoader('Mise a jour...'); try { const res = await fetchWithAllTokens('/api/update-phone', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: newPhone }) }); const data = await res.json(); if (data.status === 'success') { setPhoneNumber(newPhone); setShowPhoneOverlay(false); setNewPhone(''); showNotification('success', 'Succes', 'Telephone mis a jour !') } else showNotification('error', 'Erreur', 'Echec.') } catch { showNotification('error', 'Erreur', 'Erreur.') } finally { hideLoader() } }
  const handleEmailNotifToggle = async (checked: boolean) => { setEmailNotif(checked); try { await fetchWithAllTokens('/api/update_notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email_notifications: checked }) }) } catch { setEmailNotif(!checked) } }
  const handleSubmitReferral = async () => { showLoader('Activation...'); try { const res = await fetchWithAllTokens('/api/activate-referral', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: referralInput.trim() }) }); const data = await res.json(); if (data.success) { setShowReferralPopup(false); setUseReferral(true); setReferralActivated(true); setReferralInput(''); showNotification('success', 'Felicitations !', 'Code applique !') } else showNotification('error', 'Erreur', 'Code invalide.') } catch { showNotification('error', 'Erreur', 'Erreur.') } finally { hideLoader() } }
  const handleLogout = async () => { setShowLogoutModal(false); showLoader('Deconnexion...'); try { await fetchWithAllTokens('/api/logout', { method: 'POST' }) } catch {} router.push('/connexion') }

  const ToggleSwitch = ({ checked, onChange, loading }: { checked: boolean; onChange: (v: boolean) => void; loading?: boolean }) => (
    <label className="relative inline-block w-[50px] h-[26px] flex-shrink-0 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="opacity-0 w-0 h-0" disabled={loading} />
      <span className={`absolute inset-0 rounded-full transition-all duration-300 ${loading ? 'bg-white/5' : checked ? 'bg-emerald-400' : 'bg-white/[0.08]'}`}>
        <span className={`absolute left-1 top-1 w-[18px] h-[18px] rounded-full transition-all duration-300 ${checked ? 'translate-x-6 bg-white' : 'bg-white/50'}`} />
      </span>
    </label>
  )

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ background: '#0a0a1a' }}>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" style={{ opacity: 0.4 }} />
      <div className="fixed w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full pointer-events-none z-0 -top-[15%] -right-[10%] animate-[float1_12s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] rounded-full pointer-events-none z-0 -bottom-[10%] -left-[5%] animate-[float2_15s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      {/* Header */}
      <motion.header className="relative z-10 flex items-center justify-center pt-6 pb-3" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
        <motion.img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-12 sm:h-14 w-auto drop-shadow-[0_0_15px_rgba(0,200,150,0.5)]" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3.5, repeat: Infinity }} />
      </motion.header>

      {/* Navigation */}
      <nav className="relative z-10 flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href; const isTarget = item.href === '/target'
          return (
            <motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.93 }} className="flex-shrink-0">
              <Link href={item.href} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium border whitespace-nowrap ${isActive ? 'bg-emerald-400/20 border-emerald-400/30 text-white' : isTarget ? 'bg-orange-500/15 border-orange-500/30 text-white' : 'bg-white/[0.04] border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.08]'}`}>
                <span className="flex-shrink-0">{item.icon}</span><span>{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-[600px] mx-auto px-4 sm:px-6 py-6 pb-32">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2.5 mb-2"><span className="text-emerald-400"><SettingsIcon /></span> Parametres</h1>
          <p className="text-white/50 text-sm">Personnalisez votre experience WariPlay</p>
        </div>

        {/* Compte & Securite */}
        <div className="rounded-2xl p-5 mb-5 border border-emerald-400/10 relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-0.5 before:rounded-b before:bg-gradient-to-r before:from-emerald-400 before:to-purple-400" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.8), rgba(22,33,62,0.7))', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2.5"><ShieldIcon /> Compte & Securite</h2>
          {[
            { icon: <LockIcon />, title: 'Verification en 2 etapes', desc: 'Protegez votre compte avec une authentification supplementaire', right: <ToggleSwitch checked={twoFA} onChange={handleToggle2FA} loading={twoFALoading} /> },
            { icon: <MailIcon />, title: 'Notifications par email', desc: 'Recevez des emails pour les transactions importantes', right: <ToggleSwitch checked={emailNotif} onChange={handleEmailNotifToggle} loading={emailNotifLoading} /> },
            { icon: <GiftIcon />, title: 'Activer le code de parrainage', desc: 'Cree un code pour obtenir 10% sur votre solde', right: <ToggleSwitch checked={activateReferral} onChange={(v) => { if (!v) { showLoader('Desactivation...'); fetchWithAllTokens('/api/deactivate-referral', { method: 'POST' }).then(r => r.json()).then(d => { if (d.success) setActivateReferral(false); else setActivateReferral(true) }).catch(() => setActivateReferral(true)).finally(() => hideLoader()) } }} loading={activateReferralLoading} /> },
            { icon: <GiftIcon />, title: 'Utiliser un code de parrainage', desc: 'Obtenez 20% sur votre solde avec un code valide', right: <ToggleSwitch checked={useReferral} onChange={(v) => { setUseReferral(v); if (v) setShowReferralPopup(true) }} /> },
            { icon: <PhoneIcon />, title: 'Numero de telephone', desc: phoneNumber, right: <button onClick={() => { setNewPhone(phoneNumber); setShowPhoneOverlay(true) }} className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/30 transition-all"><EditIcon /></button> },
            { icon: <LockIcon />, title: 'Mot de passe', desc: '••••••', right: <button onClick={() => setShowPasswordOverlay(true)} className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/30 transition-all"><EditIcon /></button> }
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between gap-3 py-3.5 ${i < 5 ? 'border-b border-white/[0.04]' : ''}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-emerald-400 flex-shrink-0">{item.icon}</span>
                <div className="min-w-0"><h3 className="text-sm font-medium text-white">{item.title}</h3><p className="text-xs text-white/50 truncate">{item.desc}</p></div>
              </div>
              {item.right}
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="rounded-2xl p-5 mb-5 border border-emerald-400/10 relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-0.5 before:rounded-b before:bg-gradient-to-r before:from-emerald-400 before:to-purple-400" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.8), rgba(22,33,62,0.7))', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2.5"><BellIcon /> Notifications</h2>
          {[
            { icon: <TrophyIcon />, title: 'Nouveaux gains', desc: 'Alertes lorsque vous gagnez', checked: gainsNotif, setter: setGainsNotif },
            { icon: <MegaphoneIcon />, title: 'Promotions', desc: 'Offres speciales et bonus', checked: promoNotif, setter: setPromoNotif },
            { icon: <GamepadIcon />, title: 'Nouveaux jeux', desc: 'Alertes pour les nouveaux jeux disponibles', checked: newGamesNotif, setter: setNewGamesNotif }
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between gap-3 py-3.5 ${i < 2 ? 'border-b border-white/[0.04]' : ''}`}>
              <div className="flex items-center gap-3"><span className="text-emerald-400 flex-shrink-0">{item.icon}</span><div><h3 className="text-sm font-medium text-white">{item.title}</h3><p className="text-xs text-white/50">{item.desc}</p></div></div>
              <ToggleSwitch checked={item.checked} onChange={item.setter} />
            </div>
          ))}
        </div>

        {/* Preferences */}
        <div className="rounded-2xl p-5 mb-5 border border-emerald-400/10 relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-0.5 before:rounded-b before:bg-gradient-to-r before:from-emerald-400 before:to-purple-400" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.8), rgba(22,33,62,0.7))', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2.5"><GlobeIcon /> Preferences</h2>
          <div className="flex items-center justify-between gap-3 py-3.5 border-b border-white/[0.04]">
            <div className="flex items-center gap-3"><span className="text-emerald-400"><GlobeIcon /></span><div><h3 className="text-sm font-medium text-white">Langue</h3><p className="text-xs text-white/50">Choisissez votre langue preferee</p></div></div>
            <div className="relative w-[140px] flex-shrink-0">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-3 py-2 pr-8 rounded-xl bg-white/[0.04] border border-emerald-400/20 text-white text-sm outline-none cursor-pointer appearance-none transition-all focus:border-emerald-400/40">
                <option>Francais</option><option>English</option><option>Espanol</option><option>العربية</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"><CaretDownIcon /></span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 py-3.5 border-b border-white/[0.04]">
            <div className="flex items-center gap-3"><span className="text-emerald-400"><MoonIcon /></span><div><h3 className="text-sm font-medium text-white">Mode sombre</h3><p className="text-xs text-white/50">Activer/desactiver le mode sombre</p></div></div>
            <ToggleSwitch checked={darkMode} onChange={setDarkMode} />
          </div>
          <div className="flex items-center justify-between gap-3 py-3.5">
            <div className="flex items-center gap-3"><span className="text-emerald-400"><VolumeIcon /></span><div><h3 className="text-sm font-medium text-white">Effets sonores</h3><p className="text-xs text-white/50">Activer/desactiver les sons du jeu</p></div></div>
            <ToggleSwitch checked={soundEffects} onChange={setSoundEffects} />
          </div>
        </div>

        {/* Logout */}
        <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold uppercase tracking-wide text-sm shadow-xl shadow-orange-500/30 hover:-translate-y-0.5 transition-all">
          <LogoutIcon /> Deconnexion
        </button>
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>
        {showCodeOverlay && (
          <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={() => { setShowCodeOverlay(false); setTwoFA(false) }}>
            <motion.div className="relative w-full max-w-[450px] rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              <button onClick={() => { setShowCodeOverlay(false); setTwoFA(false) }} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"><CloseIcon /></button>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5"><ShieldIcon /> Code de verification</h3>
              <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="Entrez le code recu" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none text-center text-lg tracking-widest mb-5" />
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={confirmCode} className="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"><CheckIcon /> Confirmer</button>
                <button onClick={() => { setShowCodeOverlay(false); setTwoFA(false); setVerificationCode('') }} className="flex-1 py-3 rounded-full bg-white/[0.03] border border-white/10 text-white/70 font-semibold text-sm hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"><CloseIcon /> Annuler</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPasswordOverlay && (
          <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={() => { setShowPasswordOverlay(false); setNewPassword(''); setConfirmPassword('') }}>
            <motion.div className="relative w-full max-w-[450px] rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              <button onClick={() => { setShowPasswordOverlay(false); setNewPassword(''); setConfirmPassword('') }} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"><CloseIcon /></button>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5"><LockIcon /> Modifier le mot de passe</h3>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none mb-3 focus:border-emerald-400/40" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmer le mot de passe" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none mb-5 focus:border-emerald-400/40" />
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleSavePassword} className="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"><CheckIcon /> Enregistrer</button>
                <button onClick={() => { setShowPasswordOverlay(false); setNewPassword(''); setConfirmPassword('') }} className="flex-1 py-3 rounded-full bg-white/[0.03] border border-white/10 text-white/70 font-semibold text-sm hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"><CloseIcon /> Annuler</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Phone, Referral, Logout, Alert overlays - même structure */}
      <AnimatePresence>
        {showPhoneOverlay && (
          <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={() => { setShowPhoneOverlay(false); setNewPhone('') }}>
            <motion.div className="relative w-full max-w-[450px] rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              <button onClick={() => { setShowPhoneOverlay(false); setNewPhone('') }} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"><CloseIcon /></button>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5"><PhoneIcon /> Modifier le numero</h3>
              <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Entrez votre nouveau numero" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none mb-5 focus:border-emerald-400/40" />
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleSavePhone} className="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"><CheckIcon /> Enregistrer</button>
                <button onClick={() => { setShowPhoneOverlay(false); setNewPhone('') }} className="flex-1 py-3 rounded-full bg-white/[0.03] border border-white/10 text-white/70 font-semibold text-sm hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"><CloseIcon /> Annuler</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReferralPopup && (
          <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={() => { setShowReferralPopup(false); setUseReferral(referralActivated); setReferralInput('') }}>
            <motion.div className="relative w-full max-w-[450px] rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              <button onClick={() => { setShowReferralPopup(false); setUseReferral(referralActivated); setReferralInput('') }} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"><CloseIcon /></button>
              <h3 className="text-xl font-bold text-white mb-4">Entrez votre code de parrainage</h3>
              <input type="text" value={referralInput} onChange={(e) => setReferralInput(e.target.value)} placeholder="Ex: PARRAIN123" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white outline-none mb-5 focus:border-emerald-400/40" />
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleSubmitReferral} className="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">Valider</button>
                <button onClick={() => { setShowReferralPopup(false); setUseReferral(referralActivated); setReferralInput('') }} className="flex-1 py-3 rounded-full bg-white/[0.03] border border-white/10 text-white/70 font-semibold text-sm hover:bg-white/[0.08] transition-all">Annuler</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={() => setShowLogoutModal(false)}>
            <motion.div className="relative w-full max-w-[450px] rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              <button onClick={() => setShowLogoutModal(false)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"><CloseIcon /></button>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2.5"><LogoutIcon /> Confirmer la deconnexion</h3>
              <p className="text-white/60 text-sm mb-6">Etes-vous sur de vouloir vous deconnecter ?</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleLogout} className="flex-1 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all">Deconnexion</button>
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 rounded-full bg-white/[0.03] border border-white/10 text-white/70 font-semibold text-sm hover:bg-white/[0.08] transition-all">Annuler</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAlert && (
          <div className="fixed inset-0 bg-[#0a0a1a]/70 backdrop-blur-md z-[3000] flex items-center justify-center p-4" onClick={() => setShowAlert(null)}>
            <motion.div className="relative w-full max-w-[400px] rounded-2xl p-6 sm:p-8 text-center border shadow-[0_30px_80px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e)' }} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className={`text-4xl mb-4 ${showAlert.type === 'success' ? 'text-green-400' : showAlert.type === 'error' ? 'text-red-400' : showAlert.type === 'warning' ? 'text-orange-400' : 'text-purple-400'}`}>
                {showAlert.type === 'success' ? <CheckIcon /> : showAlert.type === 'error' ? <CloseIcon /> : showAlert.type === 'warning' ? <WarningIcon /> : <ShieldIcon />}
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{showAlert.title}</h4>
              <p className="text-white/60 text-sm mb-5">{showAlert.message}</p>
              <button onClick={() => setShowAlert(null)} className="px-10 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">OK</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoading && (
          <div className="fixed inset-0 bg-[#0a0a1a]/90 backdrop-blur-xl z-[2000] flex flex-col items-center justify-center gap-6">
            <div className="w-13 h-13 border-[3px] border-emerald-400/15 border-t-emerald-400 border-r-purple-400 rounded-full animate-spin" />
            <p className="text-white/80 text-sm font-medium animate-pulse">{loadingText}</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}