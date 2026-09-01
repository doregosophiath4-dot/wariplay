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

const QuizIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const TargetIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const PuzzleIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.611 1.611a2.404 2.404 0 0 1-1.704.706 2.404 2.404 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.404 2.404 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.611-1.611a2.404 2.404 0 0 1 1.704-.706c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
  </svg>
)

const TrophyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

const GamepadIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="11" x2="10" y2="11" />
    <line x1="8" y1="9" x2="8" y2="13" />
    <line x1="15" y1="12" x2="15.01" y2="12" />
    <line x1="18" y1="10" x2="18.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
)

const DiamondIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 10.5 12 2l9.5 8.5L12 22 2.5 10.5Z" />
  </svg>
)

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

export default function OffrePage() {
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

  const levels = [
    { name: 'Niveau 1', price: '1 000', gain: '150', duration: '10 jours', total: '1 500', popular: false },
    { name: 'Niveau 2', price: '2 000', gain: '200', duration: '15 jours', total: '3 000', popular: true },
    { name: 'Niveau 3', price: '3 500', gain: '250', duration: '20 jours', total: '5 000', popular: false },
    { name: 'Niveau 4', price: '4 500', gain: '300', duration: '25 jours', total: '7 500', popular: false },
    { name: 'Niveau 5', price: '6 000', gain: '400', duration: '31 jours', total: '12 400', popular: false }
  ]

  const gameCategories = [
    { icon: <QuizIcon />, name: 'Quiz & Culture', desc: 'Testez vos connaissances avec des quiz quotidiens stimulants et progressifs.' },
    { icon: <TargetIcon />, name: 'Jeux de Reflexes', desc: 'Ameliorez votre rapidite et votre precision dans des defis chronometres.' },
    { icon: <PuzzleIcon />, name: 'Jeux de Strategie', desc: 'Mettez votre logique a l\'epreuve avec des puzzles et des enigmes captivants.' },
    { icon: <TrophyIcon />, name: 'Defis & Tournois', desc: 'Affrontez la communaute dans des competitions classees et gagnez des recompenses.' },
    { icon: <GamepadIcon />, name: 'Mini-Jeux Arcade', desc: 'Detendez-vous avec des jeux simples, amusants et accessibles a tous.' },
    { icon: <DiamondIcon />, name: 'Jeux Premium', desc: 'Accedez a des experiences exclusives avec des gains potentiels plus eleves.' }
  ]

  const tableData = [
    { level: 1, invest: '1 000 FCFA', daily: '150 FCFA', duration: '10 jours', total: '1 500 FCFA', roi: '+50%' },
    { level: 2, invest: '2 000 FCFA', daily: '200 FCFA', duration: '15 jours', total: '3 000 FCFA', roi: '+50%', highlight: true },
    { level: 3, invest: '3 500 FCFA', daily: '250 FCFA', duration: '20 jours', total: '5 000 FCFA', roi: '+43%' },
    { level: 4, invest: '4 500 FCFA', daily: '300 FCFA', duration: '25 jours', total: '7 500 FCFA', roi: '+67%' },
    { level: 5, invest: '6 000 FCFA', daily: '400 FCFA', duration: '31 jours', total: '12 400 FCFA', roi: '+107%' }
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
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Link href="/">
          <motion.img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-10 md:h-11 w-auto cursor-pointer" whileHover={{ scale: 1.05 }} />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {['Accueil', 'Offre', 'Strategie', 'Equipe', 'Jeux'].map(label => (
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
                {['Accueil', 'Offre', 'Strategie', 'Equipe', 'Jeux'].map(label => (
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
      <motion.section
        className="relative z-10 flex flex-col items-center justify-center px-5 py-24 md:py-32 text-center"
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
      >
        <div className="max-w-3xl">
          <motion.span 
            className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full mb-5"
            style={{ color: '#6c5ce7', background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}
          >
            Nos Offres
          </motion.span>
          <motion.h1 
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}
          >
            Des jeux simples, <span style={{ background: 'linear-gradient(135deg, #00c896, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>des gains reels</span>
          </motion.h1>
          <motion.p 
            className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}
          >
            WariPlay reinvente le divertissement en ligne. Bien plus que des jeux d&apos;argent traditionnels, nous vous offrons un environnement unique ou chaque partie est une experience sous votre controle. Ici, pas de hasard aveugle : votre progression depend de votre assiduite et de votre talent.
          </motion.p>
        </div>
      </motion.section>

      {/* Niveaux de Quiz */}
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
            Quiz Progressifs
          </motion.span>
          <motion.h2 className="text-2xl md:text-4xl font-bold mb-4" variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Nos Niveaux de Jeu
          </motion.h2>
          <motion.p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Des quiz journaliers concus pour vous familiariser avec la plateforme. Chaque niveau superieur augmente vos gains quotidiens. Ideal pour debuter et progresser a votre rythme.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {levels.map((level, i) => (
            <motion.div
              key={i}
              className="relative rounded-3xl p-7 text-center border transition-all duration-300 overflow-hidden"
              style={{ 
                background: level.popular ? 'linear-gradient(160deg, rgba(0,200,150,0.06) 0%, rgba(26,26,46,0.8) 100%)' : 'linear-gradient(160deg, rgba(26,26,46,0.75) 0%, rgba(22,33,62,0.6) 100%)',
                borderColor: level.popular ? 'rgba(0,200,150,0.25)' : 'rgba(255,255,255,0.05)'
              }}
              variants={{ hidden: { opacity: 0, scale: 0.9, y: 30 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 16 } } }}
              whileHover={{ y: -10, borderColor: level.popular ? 'rgba(0,200,150,0.5)' : 'rgba(0,200,150,0.3)' }}
            >
              {level.popular && (
                <span className="absolute top-3 right-3 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full text-white" style={{ background: 'linear-gradient(135deg, #00c896, #00a87d)' }}>
                  <span className="flex items-center gap-1"><StarIcon /> Populaire</span>
                </span>
              )}
              <h3 className="text-xl font-bold mb-2">{level.name}</h3>
              <div className="text-4xl font-bold my-4" style={{ color: '#00c896' }}>
                {level.price}<span className="text-sm font-normal opacity-60"> FCFA</span>
              </div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <span className="mt-0.5 flex-shrink-0" style={{ color: '#00c896' }}><CheckIcon /></span>
                  Quiz journaliers
                </li>
                <li className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <span className="mt-0.5 flex-shrink-0" style={{ color: '#00c896' }}><CheckIcon /></span>
                  Gain quotidien : <strong className="text-white/80 ml-1">{level.gain} FCFA</strong>
                </li>
                <li className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <span className="mt-0.5 flex-shrink-0" style={{ color: '#00c896' }}><CheckIcon /></span>
                  Duree : {level.duration}
                </li>
                <li className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <span className="mt-0.5 flex-shrink-0" style={{ color: '#00c896' }}><CheckIcon /></span>
                  Gain total : <strong className="text-white/80 ml-1">{level.total} FCFA</strong>
                </li>
              </ul>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link 
                  href="/connexion" 
                  className="block w-full py-3 rounded-full font-semibold text-sm uppercase tracking-wide transition-all duration-300"
                  style={level.popular ? 
                    { background: 'linear-gradient(135deg, #00c896, #00a87d)', color: '#fff', boxShadow: '0 6px 20px rgba(0,200,150,0.3)' } : 
                    { color: '#00c896', border: '1px solid rgba(0,200,150,0.25)', background: 'transparent' }
                  }
                >
                  Commencer
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Autres categories de jeux */}
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
            Decouvrir
          </motion.span>
          <motion.h2 className="text-2xl md:text-4xl font-bold mb-4" variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Et bien plus encore...
          </motion.h2>
          <motion.p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Les niveaux de quiz ne sont qu&apos;un apercu. WariPlay propose une multitude d&apos;autres jeux, tous <strong className="text-white/70">gratuits</strong>, simples et amusants, concus pour vous offrir une experience unique, loin des casinos traditionnels. Ici, vous gardez le controle tout en vous amusant et en gagnant.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {gameCategories.map((cat, i) => (
            <motion.div
              key={i}
              className="rounded-2xl p-7 text-center border transition-all duration-300"
              style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.55) 0%, rgba(22,33,62,0.45) 100%)', borderColor: 'rgba(255,255,255,0.04)' }}
              variants={{ hidden: { opacity: 0, scale: 0.9, y: 30 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 16 } } }}
              whileHover={{ y: -6, borderColor: 'rgba(108,92,231,0.3)' }}
            >
              <div className="flex justify-center mb-4" style={{ color: '#00c896' }}>{cat.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{cat.name}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{cat.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <motion.p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Curieux d&apos;en decouvrir plus ? Explorez toutes nos categories de jeux et trouvez celui qui vous correspond.
          </motion.p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            <Link href="/jeux" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wide transition-all duration-300" style={{ background: 'linear-gradient(135deg, #6c5ce7, #5a4bd1)', boxShadow: '0 6px 22px rgba(108,92,231,0.3)' }}>
              Voir tous les jeux <ArrowRightIcon />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Tableau comparatif */}
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
            Comparatif
          </motion.span>
          <motion.h2 className="text-2xl md:text-4xl font-bold mb-4" variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Comparaison detaillee des niveaux
          </motion.h2>
        </div>

        <motion.div 
          className="overflow-x-auto rounded-2xl border p-0.5"
          style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.6) 0%, rgba(22,33,62,0.5) 100%)', borderColor: 'rgba(255,255,255,0.05)' }}
          variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}
        >
          <table className="w-full border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-white/5" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: '#00c896' }}>Niveau</th>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: '#00c896' }}>Investissement</th>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: '#00c896' }}>Gain / Jour</th>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: '#00c896' }}>Duree</th>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: '#00c896' }}>Gain Total</th>
                <th className="py-4 px-3 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: '#00c896' }}>Rentabilite</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.04]" style={{ background: row.highlight ? 'rgba(0,200,150,0.04)' : 'transparent' }}>
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold" style={{ background: 'rgba(0,200,150,0.12)', color: '#00c896' }}>{row.level}</span>
                  </td>
                  <td className="py-3.5 px-3 text-center text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{row.invest}</td>
                  <td className="py-3.5 px-3 text-center text-sm font-semibold" style={{ color: '#00c896' }}>{row.daily}</td>
                  <td className="py-3.5 px-3 text-center text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{row.duration}</td>
                  <td className="py-3.5 px-3 text-center text-sm font-bold" style={{ color: '#ffd166' }}>{row.total}</td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(0,200,150,0.1)', color: '#00c896' }}>{row.roi}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-5 text-center border-t border-[rgba(0,200,150,0.07)]" style={{ background: 'rgba(10,10,26,0.9)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-9 mx-auto mb-3 brightness-0 invert" />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>La plateforme de jeux remunerateurs</p>
          </div>
          <div className="pt-5 border-t border-white/[0.04]">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>&copy; 2025 WariPlay. Tous droits reserves.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}