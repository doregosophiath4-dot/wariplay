'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

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

const ChevronDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const StarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const ZapIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const UsersIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 320 512" fill="currentColor">
    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.2V288z" />
  </svg>
)

const TelegramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 496 512" fill="currentColor">
    <path d="M248,8C111.033,8,0,119.033,0,256s111.033,248,248,248,248-111.033,248-248S384.967,8,248,8Zm121.944,169.51-34.6,163.612c-2.6,11.663-9.366,14.586-18.984,9.084L264.413,306.9l-31.356,30.2c-3.464,3.464-6.371,6.371-13.056,6.371l4.664-66.18L327.54,197.94c5.1-4.1-1.117-6.387-7.92-2.287l-160.5,101.02-69.3-21.654c-15.065-4.7-15.29-15.065,3.152-22.3L361.268,151.16C372.733,147.062,383.07,154.744,369.944,177.51Z" />
  </svg>
)

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
    <path d="M380.9 97.1C339 55.1 282.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
  </svg>
)

export default function AcceuilPage() {
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

  const features = [
    { icon: <StarIcon />, title: 'Gains Quotidiens', desc: 'Participez à des jeux simples chaque jour et recevez des récompenses en argent selon vos performances.' },
    { icon: <ZapIcon />, title: 'Jeux Évolutifs', desc: 'Accédez à différents niveaux de jeux en fonction de votre dépôt initial. Plus vous misez, plus vous gagnez.' },
    { icon: <UsersIcon />, title: 'Communauté Active', desc: 'Rejoignez une communauté dynamique de jeunes joueurs passionnés et compétitifs.' }
  ]

  const steps = [
    { title: 'Créez un compte gratuitement', desc: 'Inscription rapide et sécurisée en quelques clics seulement.' },
    { title: 'Faites un dépôt sécurisé', desc: 'Utilisez Mobile Money pour alimenter votre compte en toute sécurité.' },
    { title: 'Choisissez un niveau', desc: 'Sélectionnez le niveau de jeu correspondant à votre dépôt.' },
    { title: 'Gagnez chaque jour', desc: 'Jouez et gagnez de l\'argent selon vos performances quotidiennes.' }
  ]

  const socialButtons = [
    { icon: <FacebookIcon />, label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61578865176615' },
    { icon: <TelegramIcon />, label: 'Telegram', url: 'https://t.me/+0vw3wpYBFoI1OTY8' },
    { icon: <InstagramIcon />, label: 'Instagram', url: '#' },
    { icon: <WhatsAppIcon />, label: 'WhatsApp', url: 'https://chat.whatsapp.com/Kay1OPy0mNpJgiwXSLgGf3?mode=ac_t' }
  ]

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ background: '#0a0a1a' }}>
      
      {/* Canvas waves background */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 w-full h-full z-0 pointer-events-none" 
      />

      {/* Orbs lumineux */}
      <div className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0 -top-[20%] -right-[10%] animate-[float1_12s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.08) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      <div className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0 -bottom-[10%] -left-[5%] animate-[float2_15s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.06) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      <div className="fixed w-[300px] h-[300px] rounded-full pointer-events-none z-0 top-[40%] left-[60%] animate-[float1_10s_ease-in-out_infinite]" 
        style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      {/* Header */}
      <motion.header
        className="relative z-50 flex items-center justify-between px-4 md:px-8 py-4 border-b border-[rgba(0,200,150,0.08)]"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Link href="/">
          <motion.img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-10 md:h-11 w-auto cursor-pointer" whileHover={{ scale: 1.05 }} />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {['Accueil', 'Offre', 'Stratégie', 'Équipe', 'Jeux'].map(label => (
            <Link key={label} href={`/${label.toLowerCase()}`} className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-300" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {label}
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
                {['Accueil', 'Offre', 'Stratégie', 'Équipe', 'Jeux'].map(label => (
                  <Link key={label} href={`/${label.toLowerCase()}`} className="w-[85%] text-center py-3 px-4 rounded-xl transition-all" style={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => setMenuOpen(false)}>{label}</Link>
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
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 py-32 md:py-48 text-center">
        <motion.img src="/img/WariPlay_Logo_Transparent.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] md:h-[300px] w-auto opacity-10 pointer-events-none z-0" />
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Jouez. <span style={{ background: 'linear-gradient(135deg, #00c896, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Gagnez.</span> Répétez.
          </h1>
          <p className="text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>La plateforme de jeux journaliers rémunérateurs.</p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Link href="/connexion" className="inline-flex items-center gap-2 px-8 md:px-12 py-4 md:py-5 text-lg font-bold uppercase tracking-wide rounded-full transition-all duration-300" style={{ background: 'linear-gradient(135deg, #00c896, #00a87d)', boxShadow: '0 10px 35px rgba(0,200,150,0.35)' }}>
              Commencer maintenant <ArrowRightIcon />
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }}><ChevronDownIcon /></motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full mb-4" style={{ color: '#00c896', background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.18)' }}>Avantages</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Pourquoi choisir WariPlay ?</h2>
          <p className="text-lg max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>Découvrez ce qui rend notre plateforme unique</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} className="group rounded-3xl p-8 md:p-10 border transition-all duration-500" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.7), rgba(22,33,62,0.55))', borderColor: 'rgba(255,255,255,0.05)' }} whileHover={{ y: -8 }}>
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl mb-6 transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(0,200,150,0.08)', color: '#00c896' }}>{f.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 py-20">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full mb-4" style={{ color: '#00c896', background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.18)' }}>Processus</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Comment ça marche ?</h2>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>4 étapes simples pour commencer à gagner</p>
        </div>
        <div className="space-y-6">
          {steps.map((s, i) => (
            <motion.div key={i} className="flex items-start gap-6 p-6 rounded-2xl border transition-all duration-300" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }} whileHover={{ x: 6 }}>
              <div className="relative flex-shrink-0 w-14 h-14 flex items-center justify-center">
                <span className="relative z-10 text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #00c896, #00a87d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{i + 1}</span>
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 70 70"><circle cx="35" cy="35" r="31" fill="none" stroke="#00c896" strokeWidth="2" strokeDasharray="195" /></svg>
              </div>
              <div className="flex-1"><h3 className="text-lg font-semibold mb-2">{s.title}</h3><p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.desc}</p></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="relative z-10 max-w-2xl mx-auto px-5 py-20">
        <div className="rounded-3xl p-10 md:p-14 text-center border shadow-2xl" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.85), rgba(22,33,62,0.75))', borderColor: 'rgba(0,200,150,0.12)' }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>Rejoignez des milliers de joueurs et commencez à gagner dès aujourd&apos;hui.</p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link href="/connexion" className="inline-flex items-center gap-2 px-8 py-4 font-bold uppercase tracking-wide rounded-full transition-all" style={{ background: 'linear-gradient(135deg, #00c896, #00a87d)' }}>Inscrivez-vous maintenant <ArrowRightIcon /></Link>
          </motion.div>
        </div>
      </div>

      {/* Social + Blog */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {socialButtons.map(s => (
            <motion.button key={s.label} onClick={() => window.open(s.url, '_blank')} className="flex items-center justify-center gap-2 px-4 py-3 rounded-full font-semibold text-sm transition-all duration-300" style={{ color: '#00c896', background: 'rgba(0,200,150,0.03)', border: '1px solid rgba(0,200,150,0.2)' }} whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }}>{s.icon} {s.label}</motion.button>
          ))}
        </div>
        <motion.div className="relative overflow-hidden rounded-3xl border transition-all duration-300" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.8), rgba(22,33,62,0.7))', borderColor: 'rgba(108,92,231,0.12)' }} whileHover={{ y: -6 }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.08), rgba(0,200,150,0.04))' }} />
          <div className="relative z-10 p-8 md:p-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full mb-4" style={{ color: '#6c5ce7', background: 'rgba(108,92,231,0.12)' }}>Blog</span>
            <h3 className="text-2xl font-semibold mb-2">Blog du créateur de WariPlay</h3>
            <p className="mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>Entreprise, affaires et plus encore</p>
            <button className="px-6 py-2.5 border rounded-full font-semibold transition-all duration-300" style={{ color: '#6c5ce7', borderColor: 'rgba(108,92,231,0.3)' }}>Lire plus</button>
          </div>
        </motion.div>
      </div>

      {/* Partners */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 py-20 text-center">
        <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full mb-4" style={{ color: '#00c896', background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.18)' }}>Partenaires</span>
        <h2 className="text-3xl md:text-4xl font-bold mb-10">Nos Partenaires</h2>
      </section>

      {/* Extra Info */}
      <div className="relative z-10 flex justify-center items-center gap-6 py-10 px-5">
        <img src="/img/file_0000000094306246bb450f11a34b3d5b[1].png" alt="Age Restriction" className="w-10 h-10 opacity-60 hover:opacity-100 transition-opacity" />
        <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="w-10 h-10 opacity-60 hover:opacity-100 transition-opacity" />
      </div>

      {/* Language */}
      <div className="relative z-10 max-w-[230px] mx-auto py-6 px-5">
        <select defaultValue="fr" className="w-full px-5 py-3 rounded-xl text-white font-semibold outline-none cursor-pointer appearance-none" style={{ background: 'rgba(26,26,46,0.85)', border: '1px solid rgba(0,200,150,0.18)' }}>
          <option value="fr">FR Français</option>
          <option value="en">🇺🇸 English</option>
          <option value="pt">🇵🇹 Português</option>
        </select>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-14 px-5 border-t border-[rgba(0,200,150,0.05)]" style={{ background: 'rgba(10,10,26,0.95)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-10 mb-3 brightness-0 invert" />
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>La plateforme de jeux rémunérateurs.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {['Offre', 'Stratégie', 'Équipe', 'Jeux'].map(item => (
                <li key={item}><Link href={`/${item.toLowerCase()}`} className="text-sm transition-colors hover:pl-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Compte</h3>
            <ul className="space-y-2">
              <li><Link href="/connexion" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>Connexion</Link></li>
              <li><Link href="/connexion" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>Inscription</Link></li>
              <li><Link href="#" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>Mon compte</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li><Link href="/condition" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>Conditions d&apos;utilisation</Link></li>
              <li><Link href="/condition" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>Confidentialité</Link></li>
              <li><Link href="/condition" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.35)' }}>Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-[rgba(255,255,255,0.03)] text-center">
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Assistance 24/7. WariPlay. Tous droits réservés.</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>&copy; 2025 WariPlay. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}