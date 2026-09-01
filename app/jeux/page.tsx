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

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ScrollDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 320 512" fill="currentColor">
    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.2V288z" />
  </svg>
)

const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
    <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
  </svg>
)

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8z" />
  </svg>
)

const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
    <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
  </svg>
)

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const BrainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
    <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
    <path d="M6 18a4 4 0 0 1-1.967-.516" />
    <path d="M19.967 17.484A4 4 0 0 1 18 18" />
  </svg>
)

const CalculatorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="8" y2="10.01" />
    <line x1="12" y1="10" x2="12" y2="10.01" />
    <line x1="16" y1="10" x2="16" y2="10.01" />
    <line x1="8" y1="14" x2="8" y2="14.01" />
    <line x1="12" y1="14" x2="12" y2="14.01" />
    <line x1="16" y1="14" x2="16" y2="14.01" />
    <line x1="8" y1="18" x2="12" y2="18" />
  </svg>
)

const MemoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 12h4" />
    <path d="M14 12h4" />
    <path d="M10 12v-1" />
    <path d="M14 12v-1" />
    <path d="M8 16h8" />
  </svg>
)

const PuzzleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.611 1.611a2.404 2.404 0 0 1-1.704.706 2.404 2.404 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.404 2.404 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.611-1.611a2.404 2.404 0 0 1 1.704-.706c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
  </svg>
)

const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
)

const ZapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

export default function JeuxPage() {
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

  const games = [
    {
      title: 'Defi Quotidien',
      subtitle: 'Testez vos connaissances chaque jour',
      color: '#00c896',
      icon: <BookIcon />,
      features: ['Questions mises a jour quotidiennement', 'Themes varies : culture, sciences, histoire', 'Systeme de progression par niveaux'],
      stats: [
        { value: '15K+', label: 'Joueurs actifs' },
        { value: '500F/+', label: 'Gains max/jour' },
        { value: '4.8', label: 'Evaluation' }
      ]
    },
    {
      title: 'Math Challenge',
      subtitle: 'Defiez votre esprit logique',
      color: '#6c5ce7',
      icon: <CalculatorIcon />,
      features: ['Enigmes mathematiques stimulantes', 'Mode chronometre pour bonus', 'Adapte a tous les niveaux'],
      stats: [
        { value: '9.5K+', label: 'Joueurs actifs' },
        { value: '750F/+', label: 'Gains max/jour' },
        { value: '4.9', label: 'Evaluation' }
      ]
    },
    {
      title: 'Memoire Pro',
      subtitle: 'Entrainez et testez votre memoire',
      color: '#ff6b35',
      icon: <MemoryIcon />,
      features: ['Divers modes de jeu memoire', 'Suivi de progression detaille', 'Defis hebdomadaires speciaux'],
      stats: [
        { value: '12K+', label: 'Joueurs actifs' },
        { value: '600F/+', label: 'Gains max/jour' },
        { value: '4.7', label: 'Evaluation' }
      ]
    },
    {
      title: 'Puzzle Master',
      subtitle: 'Assemblez, reflechissez, triomphez',
      color: '#ffd166',
      icon: <PuzzleIcon />,
      features: ['Des centaines de puzzles uniques', 'Difficulte progressive adaptative', 'Mode contre-la-montre excitant'],
      stats: [
        { value: '8K+', label: 'Joueurs actifs' },
        { value: '450F/+', label: 'Gains max/jour' },
        { value: '4.6', label: 'Evaluation' }
      ]
    },
    {
      title: 'Culture Generale',
      subtitle: 'L\'encyclopedie du savoir ludique',
      color: '#2ed573',
      icon: <BrainIcon />,
      features: ['Quiz sur tous les sujets imaginables', 'Niveaux de difficulte croissants', 'Classement hebdomadaire des cracks'],
      stats: [
        { value: '18K+', label: 'Joueurs actifs' },
        { value: '550F/+', label: 'Gains max/jour' },
        { value: '4.9', label: 'Evaluation' }
      ]
    },
    {
      title: 'Speed Tap',
      subtitle: 'Rapidite, precision, adrenaline',
      color: '#ff4757',
      icon: <ZapIcon />,
      features: ['Defis de rapidite intense', 'Graphismes epures et dynamiques', 'Tournois eclairs toutes les heures'],
      stats: [
        { value: '11K+', label: 'Joueurs actifs' },
        { value: '700F/+', label: 'Gains max/jour' },
        { value: '4.8', label: 'Evaluation' }
      ]
    }
  ]

  const navLinks = [
    { href: '/3x', label: 'Accueil' },
    { href: '/offre', label: 'Offre' },
    { href: '/Strategie', label: 'Strategie' },
    { href: '/equipe', label: 'Equipe' },
    { href: '/jeux', label: 'Jeux', active: true }
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
            <Link key={l.href} href={l.href} className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${l.active ? 'font-semibold' : ''}`} 
              style={{ color: l.active ? '#00c896' : 'rgba(255,255,255,0.6)' }}>
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
        className="relative z-10 flex flex-col items-center justify-center px-5 py-28 md:py-36 text-center"
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
      >
        <div className="max-w-2xl relative z-10">
          <motion.span 
            className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full mb-5"
            style={{ color: '#6c5ce7', background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}
          >
            Notre Collection
          </motion.span>
          <motion.h1 
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}
          >
            L&apos;Experience de <span style={{ background: 'linear-gradient(135deg, #00c896, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Jeu Ultime</span>
          </motion.h1>
          <motion.p 
            className="text-base md:text-lg leading-relaxed mb-9"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}
          >
            WariPlay propose une infinite de jeux, tous aussi divertissants les uns que les autres. 
            Des classiques auxquels vous etes deja habitue aux nouveautes les plus surprenantes, 
            notre catalogue diversifie vous offre une multitude de possibilites de gains sous toutes leurs formes. 
            Quelle que soit votre preference — reflexion, rapidite, memoire ou culture — vous trouverez toujours 
            un jeu taille pour vous. Explorez, jouez, gagnez : chaque partie est une nouvelle aventure.
          </motion.p>
          <motion.div variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0 } }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <a href="#games" className="inline-flex items-center gap-2.5 px-8 py-4 font-bold uppercase tracking-wide rounded-full transition-all duration-300" style={{ background: 'linear-gradient(135deg, #00c896, #00a87d)', boxShadow: '0 10px 30px rgba(0,200,150,0.35)' }}>
              Explorer les jeux <ChevronDownIcon />
            </a>
          </motion.div>
        </div>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ScrollDownIcon />
          </motion.div>
        </div>
      </motion.section>

      {/* Games Grid */}
      <motion.section
        id="games"
        className="relative z-10 max-w-7xl mx-auto px-5 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
      >
        <div className="text-center mb-14">
          <motion.span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full mb-4" style={{ color: '#00c896', background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.18)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } } }}>
            Catalogue
          </motion.span>
          <motion.h2 className="text-2xl md:text-4xl font-bold mb-4" variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0 } }}>
            Decouvrez nos jeux
          </motion.h2>
          <motion.p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}
            variants={{ hidden: { opacity: 0, y: 35 }, visible: { opacity: 1, y: 0 } }}>
            Des jeux de toutes categories, concus pour vous divertir tout en vous offrant des gains reels
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {games.map((game, i) => (
            <motion.div
              key={i}
              className="rounded-3xl overflow-hidden border flex flex-col transition-all duration-300"
              style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.75) 0%, rgba(22,33,62,0.6) 100%)', borderColor: 'rgba(255,255,255,0.05)' }}
              variants={{ hidden: { opacity: 0, y: 50, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 16 } } }}
              whileHover={{ y: -10, borderColor: game.color }}
            >
              <div className="relative p-8 pb-6 overflow-hidden" style={{ background: `linear-gradient(135deg, ${game.color}20, ${game.color}08)` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ color: game.color }}>{game.icon}</div>
                  <h2 className="text-2xl font-bold">{game.title}</h2>
                </div>
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>{game.subtitle}</p>
              </div>
              
              <div className="p-8 pt-5 flex flex-col flex-1">
                <div className="flex-1 mb-5">
                  {game.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3 mb-3">
                      <span className="w-7 h-7 min-w-[28px] rounded-full flex items-center justify-center" style={{ background: `${game.color}15`, color: game.color }}>
                        <CheckIcon />
                      </span>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between py-4 border-y border-white/[0.06] mb-5">
                  {game.stats.map((stat, k) => (
                    <div key={k} className="text-center flex-1">
                      <div className="text-xl font-bold" style={{ color: '#ffd166' }}>{stat.value}</div>
                      <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                <motion.button
                  className="w-full py-4 border-none rounded-full text-white font-bold uppercase tracking-wide cursor-pointer transition-all duration-300 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${game.color}, ${game.color}dd)` }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Jouer maintenant
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 py-14 px-5 border-t border-[rgba(0,200,150,0.07)]" style={{ background: 'rgba(10,10,26,0.95)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-10 mb-3 brightness-0 invert" />
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              La plateforme de jeux remunerateurs leader en Afrique, combinant divertissement et opportunites financieres.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <FacebookIcon />, url: 'https://www.facebook.com/profile.php?id=61578865176615' },
                { icon: <TwitterIcon />, url: '#' },
                { icon: <InstagramIcon />, url: '#' },
                { icon: <LinkedinIcon />, url: '#' }
              ].map((social, idx) => (
                <a key={idx} href={social.url} className="w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-0.5" 
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 pb-2.5 relative after:absolute after:bottom-0 after:left-0 after:w-9 after:h-0.5 after:rounded-sm" 
              style={{ background: 'linear-gradient(90deg, #00c896, #6c5ce7)' }}>
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: '/3x', label: 'Accueil' },
                { href: '/offre', label: 'Nos offres' },
                { href: '/jeux', label: 'Jeux' },
                { href: '/equipe', label: 'A propos' }
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="flex items-center gap-2 text-sm transition-colors hover:text-emerald-400" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ color: '#00c896' }}><ChevronRightIcon /></span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 pb-2.5 relative after:absolute after:bottom-0 after:left-0 after:w-9 after:h-0.5 after:rounded-sm" 
              style={{ background: 'linear-gradient(90deg, #00c896, #6c5ce7)' }}>
              Legal
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/condition" className="flex items-center gap-2 text-sm transition-colors hover:text-emerald-400" style={{ color: 'rgba(255,255,255,0.4)' }}><span style={{ color: '#00c896' }}><ChevronRightIcon /></span> Conditions d&apos;utilisation</Link></li>
              <li><Link href="/condition" className="flex items-center gap-2 text-sm transition-colors hover:text-emerald-400" style={{ color: 'rgba(255,255,255,0.4)' }}><span style={{ color: '#00c896' }}><ChevronRightIcon /></span> Politique de confidentialite</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 pb-2.5 relative after:absolute after:bottom-0 after:left-0 after:w-9 after:h-0.5 after:rounded-sm" 
              style={{ background: 'linear-gradient(90deg, #00c896, #6c5ce7)' }}>
              Contact
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:wariplay1@gmail.com" className="flex items-center gap-2 text-sm transition-colors hover:text-emerald-400" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <span style={{ color: '#00c896' }}><MailIcon /></span> wariplay1@gmail.com
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <span style={{ color: '#00c896' }}><MapPinIcon /></span> Cotonou, Benin
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/[0.04] text-center">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>&copy; 2025 WariPlay. Tous droits reserves.</p>
        </div>
      </footer>
    </div>
  )
}