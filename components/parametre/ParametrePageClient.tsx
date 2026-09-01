// components/parametre/ParametrePageClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { 
  SettingsIcon, 
  GamepadIcon,
  CloseIcon,
  CheckIcon,
  WarningIcon,
  ShieldIconLarge as ShieldIcon,
  LockIcon,
  MailIcon,
  GiftIcon,
  PhoneIcon,
  EditIcon,
  BellIcon,
  TrophyIcon,
  MegaphoneIcon,
  GlobeIcon,
  MoonIcon,
  VolumeIcon,
  LogoutIcon,
  CaretDownIcon
} from '@/components/icons'
import Loading from '@/components/loading'
import ToggleSwitch from '@/components/ToggleSwitch'

// =====================================================
// DYNAMIC IMPORTS DES OVERLAYS
// =====================================================
const CodeOverlay = dynamic(
  () => import('@/components/parametre/overlays/CodeOverlay'),
  { ssr: false, loading: () => null }
)

const PasswordOverlay = dynamic(
  () => import('@/components/parametre/overlays/PasswordOverlay'),
  { ssr: false, loading: () => null }
)

const PhoneOverlay = dynamic(
  () => import('@/components/parametre/overlays/PhoneOverlay'),
  { ssr: false, loading: () => null }
)

const ReferralPopup = dynamic(
  () => import('@/components/parametre/overlays/ReferralPopup'),
  { ssr: false, loading: () => null }
)

const LogoutModal = dynamic(
  () => import('@/components/parametre/overlays/LogoutModal'),
  { ssr: false, loading: () => null }
)

const SettingsAlertModal = dynamic(
  () => import('@/components/parametre/overlays/SettingsAlertModal'),
  { ssr: false, loading: () => null }
)

export default function ParametrePageClient() {
  useAuth()
  const router = useRouter()
  
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

  // =====================================================
  // CHARGEMENT DES RÉGLAGES - PARALLÉLISÉ
  // =====================================================
  useEffect(() => {
    let cancelled = false
    
    async function loadSettings() {
      await initAll()

      const load2FA = async () => {
        try {
          const res = await fetchWithAllTokens('/api/verif-activee')
          if (res.ok && !cancelled) {
            const data = await res.json()
            setTwoFA(!!data.active)
          }
        } catch {} finally {
          if (!cancelled) setTwoFALoading(false)
        }
      }

      const loadEmailNotif = async () => {
        try {
          const res = await fetchWithAllTokens('/api/check_notifications')
          if (res.ok && !cancelled) {
            const data = await res.json()
            setEmailNotif(data.email_notifications === true)
          }
        } catch {} finally {
          if (!cancelled) setEmailNotifLoading(false)
        }
      }

      const loadReferralVerification = async () => {
        try {
          const res = await fetchWithAllTokens('/api/check-verification-status')
          if (res.ok && !cancelled) {
            const data = await res.json()
            setActivateReferral(!!data.verify)
          }
        } catch {} finally {
          if (!cancelled) setActivateReferralLoading(false)
        }
      }

      const loadReferralStatus = async () => {
        try {
          const res = await fetchWithAllTokens('/api/check-referral-status')
          if (res.ok && !cancelled) {
            const data = await res.json()
            setReferralActivated(data.activated === true)
            setUseReferral(data.activated === true)
          }
        } catch {}
      }

      // ✅ Les 4 requêtes partent en parallèle
      await Promise.all([
        load2FA(), 
        loadEmailNotif(), 
        loadReferralVerification(), 
        loadReferralStatus()
      ])
    }
    
    loadSettings()
    return () => { cancelled = true }
  }, [])

  // =====================================================
  // FONCTIONS D'AFFICHAGE
  // =====================================================
  const showNotification = (type: string, title: string, message: string) => { 
    setShowAlert({ type, title, message })
    setTimeout(() => setShowAlert(null), 4000) 
  }
  const showLoader = (text: string) => { 
    setLoadingText(text)
    setShowLoading(true) 
  }
  const hideLoader = () => setShowLoading(false)

  // =====================================================
  // HANDLERS
  // =====================================================
  const handleToggle2FA = async () => {
    if (!twoFA) { 
      setShowCodeOverlay(true) 
    } else {
      showLoader('Desactivation...')
      try { 
        const res = await fetchWithAllTokens('/api/supprimer-code', { method: 'POST' })
        const data = await res.json()
        if (data.status === 'success') { 
          setTwoFA(false)
          showNotification('success', 'Desactive', '2FA desactivee.') 
        } else {
          showNotification('error', 'Erreur', 'Echec.')
        }
      } catch { 
        showNotification('error', 'Erreur', 'Erreur.') 
      } finally { 
        hideLoader() 
      }
    }
  }

  const confirmCode = async () => {
    if (verificationCode.length < 4) return
    showLoader('Verification...')
    try { 
      const res = await fetchWithAllTokens('/api/enregistrer-code', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ code: verificationCode }) 
      })
      const data = await res.json()
      if (data.status === 'success') { 
        setShowCodeOverlay(false)
        setTwoFA(true)
        setVerificationCode('')
        showNotification('success', 'Active !', '2FA activee.') 
      } else {
        showNotification('error', 'Erreur', 'Code invalide.')
      }
    } catch { 
      showNotification('error', 'Erreur', 'Erreur.') 
    } finally { 
      hideLoader() 
    }
  }

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) { 
      showNotification('warning', 'Erreur', 'Mots de passe differents.')
      return 
    }
    showLoader('Modification...')
    try { 
      const res = await fetchWithAllTokens('/api/password', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ password: newPassword }) 
      })
      const data = await res.json()
      if (data.status === 'success') { 
        setShowPasswordOverlay(false)
        setNewPassword('')
        setConfirmPassword('')
        showNotification('success', 'Succes', 'Mot de passe modifie !') 
      } else {
        showNotification('error', 'Erreur', 'Echec.')
      }
    } catch { 
      showNotification('error', 'Erreur', 'Erreur.') 
    } finally { 
      hideLoader() 
    }
  }

  const handleSavePhone = async () => {
    showLoader('Mise a jour...')
    try { 
      const res = await fetchWithAllTokens('/api/update-phone', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ phone: newPhone }) 
      })
      const data = await res.json()
      if (data.status === 'success') { 
        setPhoneNumber(newPhone)
        setShowPhoneOverlay(false)
        setNewPhone('')
        showNotification('success', 'Succes', 'Telephone mis a jour !') 
      } else {
        showNotification('error', 'Erreur', 'Echec.')
      }
    } catch { 
      showNotification('error', 'Erreur', 'Erreur.') 
    } finally { 
      hideLoader() 
    }
  }

  const handleEmailNotifToggle = async (checked: boolean) => {
    setEmailNotif(checked)
    try { 
      await fetchWithAllTokens('/api/update_notifications', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email_notifications: checked }) 
      }) 
    } catch { 
      setEmailNotif(!checked) 
    }
  }

  const handleSubmitReferral = async () => {
    showLoader('Activation...')
    try { 
      const res = await fetchWithAllTokens('/api/activate-referral', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ code: referralInput.trim() }) 
      })
      const data = await res.json()
      if (data.success) { 
        setShowReferralPopup(false)
        setUseReferral(true)
        setReferralActivated(true)
        setReferralInput('')
        showNotification('success', 'Felicitations !', 'Code applique !') 
      } else {
        showNotification('error', 'Erreur', 'Code invalide.')
      }
    } catch { 
      showNotification('error', 'Erreur', 'Erreur.') 
    } finally { 
      hideLoader() 
    }
  }

  const handleLogout = async () => {
    setShowLogoutModal(false)
    showLoader('Deconnexion...')
    try { 
      await fetchWithAllTokens('/api/logout', { method: 'POST' }) 
    } catch {}
    router.push('/connexion')
  }

  // =====================================================
  // RENDU
  // =====================================================
  return (
    <>
      {/* ============================================ */}
      {/* LOADING - Composant partagé */}
      {/* ============================================ */}
      <Loading show={showLoading} text={loadingText} />

      {/* ============================================ */}
      {/* PAGE HEADER */}
      {/* ============================================ */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2.5 mb-2">
          <span className="text-emerald-400"><SettingsIcon /></span> Parametres
        </h1>
        <p className="text-white/50 text-sm">Personnalisez votre experience WariPlay</p>
      </div>

      {/* ============================================ */}
      {/* COMPTE & SECURITE */}
      {/* ============================================ */}
      <div className="rounded-2xl p-5 mb-5 border border-emerald-400/10 relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-0.5 before:rounded-b before:bg-gradient-to-r before:from-emerald-400 before:to-purple-400" 
        style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.8), rgba(22,33,62,0.7))', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2.5"><ShieldIcon /> Compte & Securite</h2>
        {[
          { icon: <LockIcon />, title: 'Verification en 2 etapes', desc: 'Protegez votre compte avec une authentification supplementaire', right: <ToggleSwitch checked={twoFA} onChange={handleToggle2FA} loading={twoFALoading} /> },
          { icon: <MailIcon />, title: 'Notifications par email', desc: 'Recevez des emails pour les transactions importantes', right: <ToggleSwitch checked={emailNotif} onChange={handleEmailNotifToggle} loading={emailNotifLoading} /> },
          { icon: <GiftIcon />, title: 'Activer le code de parrainage', desc: 'Cree un code pour obtenir 10% sur votre solde', right: <ToggleSwitch checked={activateReferral} onChange={(v) => { 
            if (!v) { 
              showLoader('Desactivation...')
              fetchWithAllTokens('/api/deactivate-referral', { method: 'POST' })
                .then(r => r.json())
                .then(d => { 
                  if (d.success) setActivateReferral(false)
                  else setActivateReferral(true) 
                })
                .catch(() => setActivateReferral(true))
                .finally(() => hideLoader()) 
            } 
          }} loading={activateReferralLoading} /> },
          { icon: <GiftIcon />, title: 'Utiliser un code de parrainage', desc: 'Obtenez 20% sur votre solde avec un code valide', right: <ToggleSwitch checked={useReferral} onChange={(v) => { 
            setUseReferral(v)
            if (v) setShowReferralPopup(true) 
          }} /> },
          { icon: <PhoneIcon />, title: 'Numero de telephone', desc: phoneNumber, right: <button onClick={() => { 
            setNewPhone(phoneNumber)
            setShowPhoneOverlay(true) 
          }} className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/30 transition-all"><EditIcon /></button> },
          { icon: <LockIcon />, title: 'Mot de passe', desc: '••••••', right: <button onClick={() => setShowPasswordOverlay(true)} className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/30 transition-all"><EditIcon /></button> }
        ].map((item, i) => (
          <div key={i} className={`flex items-center justify-between gap-3 py-3.5 ${i < 5 ? 'border-b border-white/[0.04]' : ''}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-emerald-400 flex-shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-white">{item.title}</h3>
                <p className="text-xs text-white/50 truncate">{item.desc}</p>
              </div>
            </div>
            {item.right}
          </div>
        ))}
      </div>

      {/* ============================================ */}
      {/* NOTIFICATIONS */}
      {/* ============================================ */}
      <div className="rounded-2xl p-5 mb-5 border border-emerald-400/10 relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-0.5 before:rounded-b before:bg-gradient-to-r before:from-emerald-400 before:to-purple-400" 
        style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.8), rgba(22,33,62,0.7))', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2.5"><BellIcon /> Notifications</h2>
        {[
          { icon: <TrophyIcon />, title: 'Nouveaux gains', desc: 'Alertes lorsque vous gagnez', checked: gainsNotif, setter: setGainsNotif },
          { icon: <MegaphoneIcon />, title: 'Promotions', desc: 'Offres speciales et bonus', checked: promoNotif, setter: setPromoNotif },
          { icon: <GamepadIcon />, title: 'Nouveaux jeux', desc: 'Alertes pour les nouveaux jeux disponibles', checked: newGamesNotif, setter: setNewGamesNotif }
        ].map((item, i) => (
          <div key={i} className={`flex items-center justify-between gap-3 py-3.5 ${i < 2 ? 'border-b border-white/[0.04]' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 flex-shrink-0">{item.icon}</span>
              <div>
                <h3 className="text-sm font-medium text-white">{item.title}</h3>
                <p className="text-xs text-white/50">{item.desc}</p>
              </div>
            </div>
            <ToggleSwitch checked={item.checked} onChange={item.setter} />
          </div>
        ))}
      </div>

      {/* ============================================ */}
      {/* PREFERENCES */}
      {/* ============================================ */}
      <div className="rounded-2xl p-5 mb-5 border border-emerald-400/10 relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-0.5 before:rounded-b before:bg-gradient-to-r before:from-emerald-400 before:to-purple-400" 
        style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.8), rgba(22,33,62,0.7))', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2.5"><GlobeIcon /> Preferences</h2>
        <div className="flex items-center justify-between gap-3 py-3.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400"><GlobeIcon /></span>
            <div>
              <h3 className="text-sm font-medium text-white">Langue</h3>
              <p className="text-xs text-white/50">Choisissez votre langue preferee</p>
            </div>
          </div>
          <div className="relative w-[140px] flex-shrink-0">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)} 
              className="w-full px-3 py-2 pr-8 rounded-xl bg-white/[0.04] border border-emerald-400/20 text-white text-sm outline-none cursor-pointer appearance-none transition-all focus:border-emerald-400/40"
            >
              <option>Francais</option>
              <option>English</option>
              <option>Espanol</option>
              <option>العربية</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none"><CaretDownIcon /></span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 py-3.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400"><MoonIcon /></span>
            <div>
              <h3 className="text-sm font-medium text-white">Mode sombre</h3>
              <p className="text-xs text-white/50">Activer/desactiver le mode sombre</p>
            </div>
          </div>
          <ToggleSwitch checked={darkMode} onChange={setDarkMode} />
        </div>
        <div className="flex items-center justify-between gap-3 py-3.5">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400"><VolumeIcon /></span>
            <div>
              <h3 className="text-sm font-medium text-white">Effets sonores</h3>
              <p className="text-xs text-white/50">Activer/desactiver les sons du jeu</p>
            </div>
          </div>
          <ToggleSwitch checked={soundEffects} onChange={setSoundEffects} />
        </div>
      </div>

      {/* ============================================ */}
      {/* LOGOUT */}
      {/* ============================================ */}
      <button 
        onClick={() => setShowLogoutModal(true)} 
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold uppercase tracking-wide text-sm shadow-xl shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
      >
        <LogoutIcon /> Deconnexion
      </button>

      {/* ============================================ */}
      {/* CODE OVERLAY - Chargé dynamiquement */}
      {/* ============================================ */}
      <AnimatePresence>
        {showCodeOverlay && (
          <CodeOverlay
            code={verificationCode}
            onCodeChange={setVerificationCode}
            onConfirm={confirmCode}
            onCancel={() => { setShowCodeOverlay(false); setTwoFA(false); setVerificationCode('') }}
          />
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* PASSWORD OVERLAY - Chargé dynamiquement */}
      {/* ============================================ */}
      <AnimatePresence>
        {showPasswordOverlay && (
          <PasswordOverlay
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSave={handleSavePassword}
            onCancel={() => { setShowPasswordOverlay(false); setNewPassword(''); setConfirmPassword('') }}
          />
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* PHONE OVERLAY - Chargé dynamiquement */}
      {/* ============================================ */}
      <AnimatePresence>
        {showPhoneOverlay && (
          <PhoneOverlay
            phone={newPhone}
            onPhoneChange={setNewPhone}
            onSave={handleSavePhone}
            onCancel={() => { setShowPhoneOverlay(false); setNewPhone('') }}
          />
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* REFERRAL POPUP - Chargé dynamiquement */}
      {/* ============================================ */}
      <AnimatePresence>
        {showReferralPopup && (
          <ReferralPopup
            code={referralInput}
            onCodeChange={setReferralInput}
            onSubmit={handleSubmitReferral}
            onCancel={() => { setShowReferralPopup(false); setUseReferral(referralActivated); setReferralInput('') }}
          />
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* LOGOUT MODAL - Chargé dynamiquement */}
      {/* ============================================ */}
      <AnimatePresence>
        {showLogoutModal && (
          <LogoutModal 
            onConfirm={handleLogout} 
            onCancel={() => setShowLogoutModal(false)} 
          />
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* ALERT MODAL - Chargé dynamiquement */}
      {/* ============================================ */}
      <AnimatePresence>
        {showAlert && (
          <SettingsAlertModal 
            type={showAlert.type} 
            title={showAlert.title} 
            message={showAlert.message} 
            onClose={() => setShowAlert(null)} 
          />
        )}
      </AnimatePresence>
    </>
  )
}