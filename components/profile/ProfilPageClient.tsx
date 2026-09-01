// components/profile/ProfilPageClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import {
  CoinsIcon,
  GamepadIcon,
  ChartIcon,
  UserIcon,
  SettingsIcon,
  TrophyIcon,
  StarIcon,
  MedalIcon,
  CrownIcon,
  GemIcon,
  LockIcon,
  CopyIcon,
  ShareIcon,
  CheckIcon,
  FireIcon,
  BoltIcon,
  ShieldIcon
} from '@/components/icons'

// =====================================================
// CONSTANTES STATIQUES (hors du composant)
// =====================================================
const BADGES = [
  { icon: <TrophyIcon />, unlocked: true, label: 'Champion', color: '#FFD700' },
  { icon: <StarIcon />, unlocked: true, label: 'Etoile', color: '#00c896' },
  { icon: <MedalIcon />, unlocked: true, label: 'Medaille', color: '#6c5ce7' },
  { icon: <CrownIcon />, unlocked: false, label: 'Couronne', color: '#ff6b35' },
  { icon: <GemIcon />, unlocked: false, label: 'Gemme', color: '#c084fc' },
  { icon: <FireIcon />, unlocked: true, label: 'Flamme', color: '#ff4d4d' },
  { icon: <BoltIcon />, unlocked: false, label: 'Eclair', color: '#facc15' },
  { icon: <ShieldIcon />, unlocked: false, label: 'Bouclier', color: '#60a5fa' }
]

// ⚠️ STATS_PLACEHOLDER : valeurs statiques en attendant un vrai endpoint
// Si ces valeurs doivent varier par utilisateur, remplacer par un fetch
// dans le useEffect (ex: /api/user-stats)
const STATS_PLACEHOLDER = [
  { label: 'Parties Jouees', value: '342', icon: <GamepadIcon /> },
  { label: 'Victoires', value: '187', icon: <TrophyIcon /> },
  { label: 'Gains Totaux', value: '125K', icon: <CoinsIcon /> },
  { label: 'Rang Global', value: '#42', icon: <ChartIcon /> }
]

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export default function ProfilPageClient() {
  useAuth()
  
  const [wariId, setWariId] = useState('...')
  const [solde, setSolde] = useState('...')
  const [referralCode, setReferralCode] = useState('Wariplay')
  const [copied, setCopied] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [xp, setXp] = useState(0)
  const [userName, setUserName] = useState('Wari Play')
  const [memberSince, setMemberSince] = useState('Membre depuis Jan 2025')
  const [avatarUrl, setAvatarUrl] = useState('/img/WariPlay_Logo_Transparent.png')
  const [dataLoaded, setDataLoaded] = useState(false)

  // =====================================================
  // CHARGEMENT DES DONNÉES UTILISATEUR - PARALLÉLISÉ
  // =====================================================
  useEffect(() => {
    let cancelled = false
    
    async function loadUserData() {
      try {
        await initAll()

        const loadUserInfo = async () => {
          try {
            const res = await fetchWithAllTokens('/api/user-info')
            if (res.ok && !cancelled) {
              const data = await res.json()
              if (data.picture) {
                const isExternal = data.picture.startsWith('http')
                setAvatarUrl(isExternal ? data.picture : `/img/${data.picture.split('/').pop()}`)
              }
              if (data.name) setUserName(data.name)
              if (data.created_at) {
                const date = new Date(data.created_at)
                setMemberSince(`Membre depuis ${date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}`)
              }
            }
          } catch (error) {
            console.error('Erreur user-info:', error)
          }
        }

        const loadSolde = async () => {
          try {
            const res = await fetchWithAllTokens('/api/get_lettricide_solde')
            if (res.ok && !cancelled) {
              const data = await res.json()
              setSolde(`${data.solde} XOF`)
              setWariId(data.wari_id)
            }
          } catch (error) {
            console.error('Erreur solde:', error)
          }
        }

        const loadCurrentUser = async () => {
          try {
            const res = await fetchWithAllTokens('/api/current-user')
            if (res.ok && !cancelled) {
              const data = await res.json()
              setIsAdmin(data.is_admin === 'yes')
            }
          } catch (error) {
            setIsAdmin(false)
          }
        }

        const loadReferral = async () => {
          try {
            const res = await fetchWithAllTokens('/api/get-user-referral')
            if (res.ok && !cancelled) {
              const data = await res.json()
              if (data.success && data.code) setReferralCode(data.code)
            }
          } catch (error) {
            console.error('Erreur referral:', error)
          }
        }

        // ✅ Les 4 requêtes partent en parallèle
        await Promise.all([
          loadUserInfo(),
          loadSolde(),
          loadCurrentUser(),
          loadReferral()
        ])

        if (!cancelled) setDataLoaded(true)
      } catch (error) {
        console.error('Erreur globale:', error)
      }
    }
    
    loadUserData()
    return () => { cancelled = true }
  }, [])

  // =====================================================
  // ANIMATION XP
  // =====================================================
  useEffect(() => {
    if (dataLoaded) {
      const t = setTimeout(() => setXp(73), 500)
      return () => clearTimeout(t)
    }
  }, [dataLoaded])

  // =====================================================
  // FONCTIONS DE PARRAINAGE
  // =====================================================
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShareReferral = () => {
    const shareText = `Rejoins-moi sur WariPlay avec mon code de parrainage : ${referralCode}`
    if (navigator.share) {
      navigator.share({ title: 'WariPlay', text: shareText, url: window.location.origin }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
  }

  // =====================================================
  // RENDU
  // =====================================================
  return (
    <>
      {/* ============================================ */}
      {/* HERO CARD */}
      {/* ============================================ */}
      <motion.div
        className="relative rounded-3xl p-5 sm:p-7 mb-6 border border-emerald-400/10 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.9) 0%, rgba(22,33,62,0.8) 50%, rgba(26,26,46,0.9) 100%)', boxShadow: '0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,200,150,0.06) inset' }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-500" />
        
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] rounded-full border-2 border-transparent border-t-emerald-400 border-r-emerald-400 animate-[spin_4s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full border-2 border-transparent border-b-purple-400 border-l-purple-400 animate-[spin_6s_linear_infinite_reverse]" />
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity }} className="relative">
              <img
                src={avatarUrl}
                alt={userName}
                className="w-[95px] h-[95px] rounded-full object-cover border-[3px] border-emerald-400 shadow-[0_4px_20px_rgba(0,200,150,0.25)] relative z-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/img/WariPlay_Logo_Transparent.png'
                }}
              />
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-[3px] border-[#0a0a1a] z-20 shadow-[0_0_10px_rgba(46,213,115,0.6)]" />
            </motion.div>
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{userName}</h2>
            <div className="inline-flex items-center gap-1.5 bg-emerald-400/10 border border-emerald-400/25 rounded-full px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
              <BoltIcon /> Expert
            </div>
            <p className="text-white/50 text-sm mb-2">{memberSince}</p>
            <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5">
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider">ID</span>
              <span className="text-emerald-400 font-semibold text-sm font-mono">{wariId}</span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-5 relative z-10">
          <div className="flex justify-between mb-1">
            <span className="text-white/60 text-xs font-semibold">Niveau 12</span>
            <span className="text-emerald-400 text-xs font-bold">{xp}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-purple-400 shadow-[0_0_10px_rgba(0,200,150,0.3)]"
              initial={{ width: 0 }}
              animate={{ width: `${xp}%` }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          </div>
          <span className="text-white/35 text-[10px] mt-1 block">2 750 XP pour le niveau 13</span>
        </div>
      </motion.div>

      {/* ============================================ */}
      {/* STATS GRID - Utilise STATS_PLACEHOLDER */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {STATS_PLACEHOLDER.map((s, i) => (
          <motion.div
            key={s.label}
            className="rounded-2xl p-4 text-center border border-white/[0.06] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/20"
            style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.7) 0%, rgba(22,33,62,0.6) 100%)' }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,200,150,0.04)_0%,transparent_60%)] pointer-events-none" />
            <div className="text-emerald-400 mb-2 flex justify-center">{s.icon}</div>
            <p className="text-xl sm:text-2xl font-bold text-white mb-1">{s.value}</p>
            <p className="text-white/50 text-[11px] sm:text-xs">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ============================================ */}
      {/* REFERRAL */}
      {/* ============================================ */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-bold text-white mb-3 relative inline-block after:absolute after:-bottom-1 after:left-0 after:w-10 after:h-0.5 after:rounded after:bg-gradient-to-r after:from-emerald-400 after:to-purple-400">
          Code de Parrainage
        </h3>
        <div
          className="rounded-2xl p-5 border border-purple-400/10 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.7) 0%, rgba(22,33,62,0.6) 100%)' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-b bg-gradient-to-r from-purple-400 to-emerald-400" />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 relative z-10">
            <div className="flex items-center gap-2.5 bg-white/[0.04] border border-purple-400/15 rounded-xl px-4 py-3 flex-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(0,200,150,0.5)]" />
              <span className="text-emerald-400 font-bold text-sm sm:text-base font-mono tracking-wider">{referralCode}</span>
            </div>
            <button
              onClick={handleCopyReferral}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold text-xs uppercase tracking-wide shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span key="copied" className="flex items-center gap-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <CheckIcon /> Copie !
                  </motion.span>
                ) : (
                  <motion.span key="copy" className="flex items-center gap-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <CopyIcon /> Copier
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
          <button
            onClick={handleShareReferral}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white/[0.04] border border-emerald-400/15 text-white/70 font-semibold text-sm hover:bg-emerald-400/5 hover:border-emerald-400/30 hover:text-white transition-all"
          >
            <ShareIcon /> Partager avec des amis
          </button>
        </div>
      </motion.div>

      {/* ============================================ */}
      {/* BADGES - Utilise BADGES */}
      {/* ============================================ */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-bold text-white mb-3 relative inline-block after:absolute after:-bottom-1 after:left-0 after:w-10 after:h-0.5 after:rounded after:bg-gradient-to-r after:from-emerald-400 after:to-purple-400">
          Badges & Trophees
        </h3>
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {BADGES.map((badge, index) => (
            <motion.div
              key={index}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 relative border transition-all duration-300 cursor-default
                ${badge.unlocked ? 'border-emerald-400/30 bg-emerald-400/5 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,200,150,0.15)]' : 'border-white/[0.06] bg-white/[0.02]'}`}
              style={{ background: badge.unlocked ? `linear-gradient(160deg, ${badge.color}10 0%, ${badge.color}05 100%)` : 'linear-gradient(160deg, rgba(26,26,46,0.6) 0%, rgba(22,33,62,0.5) 100%)' }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.07 }}
              whileHover={badge.unlocked ? { scale: 1.1, y: -4 } : {}}
            >
              {badge.unlocked && (
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full blur-lg pointer-events-none animate-pulse"
                  style={{ background: `radial-gradient(circle, ${badge.color} 0%, transparent 70%)`, opacity: 0.5 }}
                />
              )}
              <div style={{ color: badge.unlocked ? badge.color : 'rgba(255,255,255,0.2)' }} className="relative z-10">
                {badge.icon}
              </div>
              {!badge.unlocked && (
                <div className="absolute inset-0 bg-[#0a0a1a]/60 rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
                  <LockIcon />
                </div>
              )}
              <span className="text-[10px] sm:text-xs text-white/50 font-medium relative z-10">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ============================================ */}
      {/* ACTION BUTTONS */}
      {/* ============================================ */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {[
          { href: '/recharger', label: 'Recharger', icon: <CoinsIcon />, variant: 'primary' },
          { href: '/retirer', label: 'Retirer', icon: <CoinsIcon />, variant: 'secondary' },
          ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: <UserIcon />, variant: 'admin' as const }] : []),
          { href: '/parametre', label: 'Parametres', icon: <SettingsIcon />, variant: 'ghost' }
        ].map((btn, i) => (
          <motion.div
            key={btn.label}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className={btn.variant === 'admin' ? 'col-span-2' : ''}
          >
            <Link
              href={btn.href}
              className={`flex items-center justify-center gap-2.5 py-3.5 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 relative overflow-hidden
                ${btn.variant === 'primary' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/45' : ''}
                ${btn.variant === 'secondary' ? 'bg-transparent border-2 border-purple-400 text-purple-400 hover:bg-purple-400/10 hover:border-purple-300' : ''}
                ${btn.variant === 'admin' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30 hover:shadow-orange-500/45' : ''}
                ${btn.variant === 'ghost' ? 'bg-white/[0.04] border-2 border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20' : ''}`}
            >
              {btn.icon} {btn.label}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </>
  )
}