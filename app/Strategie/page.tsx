'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// SVG Icons
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const TikTokIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
)

const InstagramIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
)

const HandshakeIcon = () => (
  <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
    <path d="M12 5.36 8.87 8.5a2.13 2.13 0 0 0 0 3h0a2.13 2.13 0 0 0 3 0l.13-.13" />
    <path d="m12 5.36 3.13 3.14a2.13 2.13 0 0 1 0 3h0a2.13 2.13 0 0 1-3 0l-.13-.13" />
  </svg>
)

const FlameIcon = () => (
  <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
)

const GlobeIcon = () => (
  <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

export default function StrategiePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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

  const socialPlatforms = [
    { name: 'TikTok', icon: <TikTokIcon />, color: '#ff0050', desc: 'Relevez des defis viraux, partagez vos plus beaux gains et faites decouvrir WariPlay a travers des videos courtes et percutantes. Le bouche-a-oreille nouvelle generation.', action: 'Creer une video' },
    { name: 'Instagram', icon: <InstagramIcon />, color: '#E4405F', desc: 'Montrez votre progression en story, vos trophees en reel, et inspirez votre communaute a vous rejoindre. L\'emulation visuelle au service du jeu.', action: 'Partager en story' },
    { name: 'Facebook', icon: <FacebookIcon />, color: '#1877F2', desc: 'Rejoignez des groupes dedies, echangez des astuces avec d\'autres joueurs et invitez vos amis a des sessions de jeu collectives. La force du reseau.', action: 'Inviter des amis' },
    { name: 'WhatsApp', icon: <WhatsAppIcon />, color: '#25D366', desc: 'Creez des groupes prives avec vos proches, lancez des defis personnalises et partagez vos codes de parrainage en un clic. Le jeu commence dans votre poche.', action: 'Creer un groupe' }
  ]

  const reasons = [
    { icon: <HandshakeIcon />, title: 'Le Parrainage Gagnant', desc: 'Chaque ami que vous invitez devient une source de recompenses. Votre code de parrainage vous fait gagner des bonus a chaque inscription, et vos filleuls profitent d\'un avantage de bienvenue. Tout le monde y gagne.' },
    { icon: <FlameIcon />, title: 'Defis entre Amis', desc: 'Rien n\'est plus stimulant qu\'une competition amicale. Lancez des defis prives, comparez vos classements et motivez-vous mutuellement a atteindre les sommets.' },
    { icon: <GlobeIcon />, title: 'Une Communaute Active', desc: 'Rejoignez des milliers de joueurs passionnes. Echangez des strategies, celebrez vos victoires ensemble et participez a des evenements exclusifs reserves a notre communaute.' }
  ]

  const navLinks = [
    { href: '/3x', label: 'Accueil' },
    { href: '/offre', label: 'Offre' },
    { href: '/Strategie', label: 'Strategie' },
    { href: '/equipe', label: 'Equipe' },
    { href: '/jeux', label: 'Jeux' }
  ]

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ background: '#0a0a1a' }}>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" />
      
      <div className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0 -top-[20%] -right-[10%] animate-[float1_12s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.08) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      <div className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0 -bottom-[10%] -left-[5%] animate-[float2_15s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.06) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      <div className="fixed w-[300px] h-[300px] rounded-full pointer-events-none z-0 top-[40%] left-[60%] animate-[float1_10s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      {/* Header */}
      <motion.header
        className="relative z-50 flex items-center justify-between px-4 md:px-8 py-4 border-b border-[rgba(0,200,150,0.08)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/">
          <motion.img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-10 md:h-11 w-auto cursor-pointer" whileHover={{ scale: 1.05 }} />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-300" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 ml-4 pl-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <Link href="/connexion" className="px-4 py-2 text-sm font-semibold rounded-full border transition-all" style={{ color: '#00c896', borderColor: 'rgba(0,200,150,0.3)' }}>Connexion</Link>
            <Link href="/connexion" className="px-5 py-2 text-sm font-semibold text-white rounded-full transition-all" style={{ background: 'linear-gradient(135deg, #00c896, #00a87d)' }}>Inscription</Link>
          </div>
        </nav>

        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.5)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} />
              <motion.div className="fixed top-0 right-0 w-[82%] max-w-[320px] h-full z-50 flex flex-col items-center justify-center gap-1 p-8 lg:hidden" style={{ background: 'linear-gradient(160deg, rgba(10,10,26,0.98), rgba(15,15,46,0.96))', backdropFilter: 'blur(25px)', borderLeft: '1px solid rgba(0,200,150,0.08)' }} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #00c896, #6c5ce7)' }} />
                {navLinks.map(l => (
                  <Link key={l.href} href={l.href} className="w-[85%] text-center py-3 px-4 rounded-xl transition-all" style={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => setMenuOpen(false)}>{l.label}</Link>
                ))}
                <div className="w-[85%] flex flex-col gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Link href="/connexion" className="w-full text-center py-3 px-4 rounded-xl font-semibold transition-all" style={{ color: '#00c896', border: '1px solid rgba(0,200,150,0.3)' }} onClick={() => setMenuOpen(false)}>Connexion</Link>
                  <Link href="/connexion" className="w-full text-center py-3 px-4 text-white rounded-xl font-semibold transition-all" style={{ background: 'linear-gradient(135deg, #00c896, #00a87d)' }} onClick={() => setMenuOpen(false)}>Inscription</Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero */}
      <motion.section
        className="relative z-10 flex flex-col items-center justify-center px-5 py-24 md:py-32 text-center"
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
      >
        <div className="max-w-2xl">
          <motion.span 
            className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full mb-5"
            style={{ color: '#6c5ce7', background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}
          >
            Notre Vision
          </motion.span>
          <motion.h1 
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}
          >
            Grandir <span style={{ background: 'linear-gradient(135deg, #00c896, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ensemble</span>
          </motion.h1>
          <motion.p 
            className="text-base md:text-lg leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}
          >
            WariPlay repose sur une conviction simple : jouer a plusieurs est toujours plus stimulant. 
            Nous misons sur la force de notre communaute et sur votre envie de partager pour faire grandir l&apos;aventure.
            Chaque joueur est un ambassadeur, chaque invitation est une victoire commune.
          </motion.p>
        </div>
      </motion.section>

      {/* Pourquoi nous rejoindre */}
      <motion.section
        className="relative z-10 max-w-6xl mx-auto px-5 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
      >
        <div className="text-center mb-14">
          <motion.span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full mb-4" style={{ color: '#00c896', background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.18)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Ensemble
          </motion.span>
          <motion.h2 className="text-2xl md:text-4xl font-bold mb-4" variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Pourquoi nous rejoindre ?
          </motion.h2>
          <motion.p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Trois piliers qui font de WariPlay bien plus qu&apos;une simple plateforme de jeux
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              className="relative rounded-3xl p-8 text-center border transition-all duration-300 overflow-hidden"
              style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.7) 0%, rgba(22,33,62,0.55) 100%)', borderColor: 'rgba(255,255,255,0.05)' }}
              variants={{ hidden: { opacity: 0, y: 40, scale: 0.92 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 16 } } }}
              whileHover={{ y: -8, borderColor: 'rgba(0,200,150,0.3)' }}
            >
              <div className="flex justify-center mb-5" style={{ color: '#00c896' }}>{reason.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{reason.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Réseaux sociaux */}
      <motion.section
        className="relative z-10 max-w-6xl mx-auto px-5 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
      >
        <div className="text-center mb-14">
          <motion.span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full mb-4" style={{ color: '#00c896', background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.18)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Partager
          </motion.span>
          <motion.h2 className="text-2xl md:text-4xl font-bold mb-4" variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Invitez vos amis partout
          </motion.h2>
          <motion.p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Nous utilisons tous les canaux a notre disposition pour elargir la communaute. 
            Mais notre meilleur atout, c&apos;est <strong className="text-white/70">vous</strong>. Partagez WariPlay sur vos reseaux preferes et 
            faites decouvrir a vos proches une nouvelle facon de jouer et de gagner.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {socialPlatforms.map((platform, i) => (
            <motion.div
              key={i}
              className="relative rounded-2xl p-7 text-center border transition-all duration-300"
              style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.65) 0%, rgba(22,33,62,0.5) 100%)', borderColor: 'rgba(255,255,255,0.04)' }}
              variants={{ hidden: { opacity: 0, y: 40, scale: 0.92 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 16 } } }}
              whileHover={{ y: -8, borderColor: platform.color }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-30 transition-opacity duration-300 group-hover:opacity-80" style={{ background: platform.color }} />
              <div className="flex justify-center mb-4" style={{ color: platform.color }}>{platform.icon}</div>
              <h3 className="text-lg font-semibold mb-3">{platform.name}</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.48)' }}>{platform.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold cursor-pointer transition-all duration-300" style={{ color: '#6c5ce7' }}>
                {platform.action} <ArrowRightIcon />
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="relative z-10 flex justify-center px-5 py-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="rounded-3xl p-10 md:p-14 text-center border shadow-2xl max-w-2xl w-full" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.85) 0%, rgba(22,33,62,0.75) 100%)', borderColor: 'rgba(0,200,150,0.12)' }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Pret a faire grandir l&apos;aventure ?</h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Rejoignez WariPlay, invitez vos amis et transformez chaque partie en une experience collective. Ensemble, on va plus loin.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link href="/connexion" className="inline-block px-10 py-4 font-bold uppercase tracking-wide rounded-full transition-all duration-300" style={{ background: 'linear-gradient(135deg, #00c896, #00a87d)', boxShadow: '0 8px 28px rgba(0,200,150,0.32)' }}>
              Rejoindre la communaute
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-5 text-center border-t border-[rgba(0,200,150,0.07)]" style={{ background: 'rgba(10,10,26,0.9)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-9 mx-auto mb-3 brightness-0 invert" />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Redefinir l&apos;experience des jeux remunerateurs</p>
          </div>
          <div className="pt-5 border-t border-white/[0.04]">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
              &copy; 2025 WariPlay. Tous droits reserves. | <Link href="/condition" className="hover:text-emerald-400 transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>Politique de confidentialite</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}