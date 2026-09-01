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

const ShieldIcon = () => (
  <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const ZapIcon = () => (
  <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const TargetIcon = () => (
  <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const ChartIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const CodeIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const DesignIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
)

const LockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const PackageIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const UsersIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const LightbulbIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
)

export default function EquipePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  const directeurAnimRef = useRef<HTMLDivElement | null>(null)
  const developpeurAnimRef = useRef<HTMLDivElement | null>(null)
  const uxAnimRef = useRef<HTMLDivElement | null>(null)
  const securiteAnimRef = useRef<HTMLDivElement | null>(null)
  const chefProduitAnimRef = useRef<HTMLDivElement | null>(null)
  const communityAnimRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    const loadLottieAnimation = async (container: HTMLDivElement | null, animationPath: string) => {
      if (!container || typeof window === 'undefined') return
      
      try {
        const lottie = (await import('lottie-web')).default
        lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: animationPath
        })
      } catch (error) {
        // Silencieux
      }
    }

    loadLottieAnimation(directeurAnimRef.current, '/img/Stickman and arrow graph.json')
    loadLottieAnimation(developpeurAnimRef.current, '/img/developer skills.json')
    loadLottieAnimation(uxAnimRef.current, '/img/UI.json')
    loadLottieAnimation(securiteAnimRef.current, '/img/Data protection isometric.json')
    loadLottieAnimation(chefProduitAnimRef.current, 'https://assets5.lottiefiles.com/packages/lf20_5tkzkblw.json')
    loadLottieAnimation(communityAnimRef.current, 'https://assets10.lottiefiles.com/packages/lf20_49rdyysj.json')
  }, [])

  const teamMembers = [
    { animRef: directeurAnimRef, icon: <ChartIcon />, name: 'Directeur Strategique', desc: 'Architecte de la vision WariPlay, il definit les orientations strategiques et veille a la croissance perenne de la plateforme.', role: 'Strategie & Developpement', color: '#00c896' },
    { animRef: developpeurAnimRef, icon: <CodeIcon />, name: 'Lead Developpeur', desc: 'Expert en technologies FinTech, il concoit et supervise l\'architecture logicielle pour garantir des performances optimales et une experience sans faille.', role: 'Ingenierie Logicielle', color: '#6c5ce7' },
    { animRef: uxAnimRef, icon: <DesignIcon />, name: 'Responsable UX', desc: 'Specialiste du design d\'interaction, il façonne chaque ecran pour que votre experience soit intuitive, fluide et agreable.', role: 'Design & Experience', color: '#ff6b35' },
    { animRef: chefProduitAnimRef, icon: <PackageIcon />, name: 'Chef de Produit', desc: 'Coordinateur des equipes techniques, il priorise les fonctionnalites et s\'assure que chaque mise a jour reponde a vos attentes.', role: 'Gestion Produit', color: '#ffd166' },
    { animRef: securiteAnimRef, icon: <LockIcon />, name: 'Responsable Securite', desc: 'Gardien de vos donnees et de vos transactions, il met en place les protocoles de securite les plus exigeants pour votre tranquillite.', role: 'Securite & Conformite', color: '#ff4757' },
    { animRef: communityAnimRef, icon: <UsersIcon />, name: 'Community Manager', desc: 'Voix de WariPlay aupres de la communaute, il anime les echanges, organise les evenements et relaie vos suggestions a l\'equipe.', role: 'Marketing Digital', color: '#2ed573' }
  ]

  const values = [
    { icon: <ShieldIcon />, title: 'Securite Maximale', desc: 'Chaque ligne de code est pensee pour proteger vos donnees personnelles et vos fonds. Nos protocoles de chiffrement et nos audits reguliers garantissent une plateforme a toute epreuve.' },
    { icon: <ZapIcon />, title: 'Performance & Fluidite', desc: 'Notre infrastructure est optimisee pour offrir des temps de reponse instantanes, meme en periode de forte affluence. Vous jouez, la technologie s\'occupe du reste.' },
    { icon: <TargetIcon />, title: 'Engagement & Passion', desc: 'Derriere chaque fonctionnalite se cache une equipe passionnee qui se leve chaque matin avec un seul objectif : vous offrir la meilleure experience de jeu possible.' }
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
            Notre Force
          </motion.span>
          <motion.h1 
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}
          >
            L&apos;equipe derriere <span style={{ background: 'linear-gradient(135deg, #00c896, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>WariPlay</span>
          </motion.h1>
          <motion.p 
            className="text-base md:text-lg leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}
          >
            WariPlay est le fruit d&apos;une equipe organisee, motivee et passionnee. Des experts en informatique, en design, en securite et en marketing unissent leurs talents chaque jour pour vous offrir un environnement stable, distractif et benefique. Notre mission : vous permettre de jouer en toute tranquillite, sans interruption ni erreur.
          </motion.p>
        </div>
      </motion.section>

      {/* Valeurs */}
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
            Nos Piliers
          </motion.span>
          <motion.h2 className="text-2xl md:text-4xl font-bold mb-4" variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Ce qui nous anime
          </motion.h2>
          <motion.p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Trois engagements qui guident chacune de nos actions au quotidien
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={i}
              className="relative rounded-3xl p-8 text-center border transition-all duration-300 overflow-hidden"
              style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.7) 0%, rgba(22,33,62,0.55) 100%)', borderColor: 'rgba(255,255,255,0.05)' }}
              variants={{ hidden: { opacity: 0, y: 40, scale: 0.92 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 16 } } }}
              whileHover={{ y: -8, borderColor: 'rgba(0,200,150,0.3)' }}
            >
              <div className="flex justify-center mb-5" style={{ color: '#00c896' }}>{v.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{v.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Membres de l'equipe avec Lottie */}
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
            Notre Equipe
          </motion.span>
          <motion.h2 className="text-2xl md:text-4xl font-bold mb-4" variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Les talents qui font WariPlay
          </motion.h2>
          <motion.p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Chaque membre apporte son expertise unique pour construire une plateforme fiable, innovante et securisee.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {teamMembers.map((member, i) => (
            <motion.div
              key={i}
              className="rounded-3xl p-8 text-center border transition-all duration-300 flex flex-col items-center"
              style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.7) 0%, rgba(22,33,62,0.55) 100%)', borderColor: 'rgba(255,255,255,0.05)' }}
              variants={{ hidden: { opacity: 0, y: 40, scale: 0.92 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 16 } } }}
              whileHover={{ y: -10, borderColor: member.color }}
            >
              <div ref={member.animRef} className="w-40 h-40 mx-auto mb-5 flex items-center justify-center">
                <div style={{ color: member.color }}>{member.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{member.name}</h3>
              <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{member.desc}</p>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold border" style={{ background: `${member.color}20`, color: member.color, borderColor: `${member.color}40` }}>
                {member.role}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-5 text-center border-t border-[rgba(0,200,150,0.07)]" style={{ background: 'rgba(10,10,26,0.9)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-9 mx-auto mb-3 brightness-0 invert" />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>WariPlay — Une innovation Lalma Tech</p>
          </div>
          <div className="pt-5 border-t border-white/[0.04]">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>&copy; 2025 WariPlay. Tous droits reserves.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}