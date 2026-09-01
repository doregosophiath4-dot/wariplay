'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/useAuth'

// =====================================================
// SVG ICONS
// =====================================================
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
)
const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
)
const ExchangeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
)
const HistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
)
const WalletIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
)
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
)
const CoinsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /></svg>
)
const PiggyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 5c-1.5 0-2.8.8-3.5 2H7.5C6.8 5.8 5.5 5 4 5c-1.7 0-3 1.3-3 3 0 1.6 1.2 2.9 2.8 3C3.3 11.5 3 12.2 3 13c0 1.7 1.3 3 3 3 .3 0 .7-.1 1-.2V18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-2.2c.3.1.7.2 1 .2 1.7 0 3-1.3 3-3 0-.8-.3-1.5-.8-2 1.6-.1 2.8-1.4 2.8-3 0-1.7-1.3-3-3-3z" /><path d="M12 10v4" /><path d="M9 12h6" /></svg>
)
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
)
const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
)
const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
)
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
)
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
)
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
)
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
)

interface Bet { id: string; username: string; amount: number; direction: 'up' | 'down'; status: 'active' | 'won' | 'lost'; time: string; profit?: number; timer?: number; isYours?: boolean }
interface Transaction { id: string; type: string; date: string; amount: number; status: 'positive' | 'negative' }
interface Message { id: string; senderName: string; text: string; time: string; amount?: number; isUnread: boolean }

export default function StatsPage() {
  useAuth()
  const [activeSection, setActiveSection] = useState('trading')
  const [loading, setLoading] = useState(true)
  const [loadingText] = useState('Chargement de la plateforme...')
  const [userName] = useState('Wari User')
  const [userBalance] = useState('100 000 XOF')
  const [pairChange, setPairChange] = useState('+0.32%')
  const [currentValue, setCurrentValue] = useState('1 000 XOF')
  const [changeAmount, setChangeAmount] = useState('+32 XOF')
  const [trendIndicator, setTrendIndicator] = useState('Hausse')
  const [volatilityIndicator] = useState('Moyenne')
  const [amount, setAmount] = useState(0)
  const [bets, setBets] = useState<Bet[]>([])
  const [history, setHistory] = useState<Transaction[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [mainBalance] = useState('0 XOF')
  const [savingsBalance] = useState('0 XOF')
  const [walletId] = useState('WARI-7843-2025')
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState({ title: '', message: '', type: 'info' as 'success' | 'error' | 'info' })
  const [showBetLoading, setShowBetLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const navSections = [
    { key: 'trading', icon: <ChartIcon />, label: 'Graphique' },
    { key: 'bets', icon: <ExchangeIcon />, label: 'Mes Mises' },
    { key: 'history', icon: <HistoryIcon />, label: 'Historique' },
    { key: 'wallet', icon: <WalletIcon />, label: 'Portefeuille' },
    { key: 'message', icon: <MailIcon />, label: 'Messagerie' },
  ]

  // Canvas background
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

  // Chart
  useEffect(() => {
    const canvas = chartCanvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let candles: { time: number; open: number; high: number; low: number; close: number }[] = []
    let price = 1000; const now = Date.now()
    for (let i = 80; i >= 0; i--) { const open = price; const close = open + (Math.random() - 0.48) * 60; candles.push({ time: now - i * 60000, open, high: Math.max(open, close) + Math.random() * 30, low: Math.min(open, close) - Math.random() * 30, close }); price = close }
    let animId: number
    const drawChart = () => {
      if (!ctx || !canvas) return; const w = canvas.width; const h = canvas.height; ctx.clearRect(0, 0, w, h)
      const pad = { top: 15, right: 8, bottom: 28, left: 48 }; const cw = w - pad.left - pad.right; const ch = h - pad.top - pad.bottom
      const visible = candles.slice(-Math.floor(cw / 8)); const all = visible.flatMap(c => [c.high, c.low])
      const minP = Math.min(...all); const maxP = Math.max(...all); const range = maxP - minP || 1
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) { const y = pad.top + (ch / 4) * i; ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '9px Poppins'; ctx.textAlign = 'right'; ctx.fillText((maxP - (range / 4) * i).toFixed(0), pad.left - 6, y + 4) }
      const sp = cw / Math.max(1, visible.length - 1); const bw = Math.max(3, Math.min(sp * 0.7, 12))
      visible.forEach((c, i) => {
        const x = pad.left + sp * i; const yo = pad.top + ((maxP - c.open) / range) * ch; const yc = pad.top + ((maxP - c.close) / range) * ch
        const yh = pad.top + ((maxP - c.high) / range) * ch; const yl = pad.top + ((maxP - c.low) / range) * ch
        const bull = c.close >= c.open; const col = bull ? '#00c896' : '#ff4757'
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(x, yh); ctx.lineTo(x, Math.min(yo, yc)); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(x, yl); ctx.lineTo(x, Math.max(yo, yc)); ctx.stroke()
        const bh = Math.max(1, Math.abs(yc - yo)); ctx.fillRect(x - bw / 2, Math.min(yo, yc), bw, bh)
        if (!bull) { ctx.strokeStyle = col; ctx.strokeRect(x - bw / 2, Math.min(yo, yc), bw, bh) }
      })
    }
    const resize = () => { const p = canvas.parentElement; if (p) { const r = p.getBoundingClientRect(); canvas.width = r.width; canvas.height = Math.max(300, Math.min(500, r.width * 0.6)); drawChart() } }
    resize(); window.addEventListener('resize', resize)
    const animate = () => {
      const last = candles[candles.length - 1]; const ch = (Math.random() - 0.5) * 40; const nc = last.close + ch
      candles.push({ time: last.time + 60000, open: last.close, high: Math.max(last.close, nc) + Math.random() * 15, low: Math.min(last.close, nc) - Math.random() * 15, close: nc })
      if (candles.length > 150) candles.shift(); drawChart()
      const diff = nc - candles[0].close; setCurrentValue(`${nc.toFixed(0)} XOF`); setChangeAmount(`${diff >= 0 ? '+' : ''}${diff.toFixed(0)} XOF`)
      setPairChange(`${((diff / candles[0].close) * 100).toFixed(2)}%`); setTrendIndicator(diff >= 0 ? 'Hausse' : 'Baisse')
      animId = requestAnimationFrame(() => setTimeout(animate, 1500))
    }
    const start = setTimeout(animate, 2000)
    return () => { window.removeEventListener('resize', resize); clearTimeout(start); if (animId) cancelAnimationFrame(animId) }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false)
      setBets([
        { id: 'BET-001', username: 'Trader_X', amount: 5000, direction: 'up', status: 'active', time: '2 min', timer: 45 },
        { id: 'BET-002', username: 'Wari User', amount: 10000, direction: 'down', status: 'active', time: '5 min', timer: 120, isYours: true },
        { id: 'BET-003', username: 'ProGamer', amount: 2500, direction: 'up', status: 'won', time: '10 min', profit: 750 }
      ])
      setHistory([
        { id: 'TX-001', type: 'Mise', date: '20 Mai 2025', amount: 5000, status: 'negative' },
        { id: 'TX-002', type: 'Gain', date: '19 Mai 2025', amount: 12500, status: 'positive' },
        { id: 'TX-003', type: 'Mise', date: '18 Mai 2025', amount: 3000, status: 'negative' },
        { id: 'TX-004', type: 'Gain', date: '17 Mai 2025', amount: 8000, status: 'positive' }
      ])
      setMessages([
        { id: 'MSG-001', senderName: 'Systeme', text: 'Votre mise de 10 000 XOF a ete placee avec succes', time: '2 min', amount: 10000, isUnread: true },
        { id: 'MSG-002', senderName: 'Systeme', text: 'Felicitations ! Vous avez gagne 2 500 XOF', time: '1h', amount: 2500, isUnread: false }
      ])
    }, 1500)
    return () => clearTimeout(t)
  }, [])

  const showCustomPopup = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => { setPopupData({ title, message, type }); setShowPopup(true) }
  const handleBet = () => { if (amount <= 0) { showCustomPopup('Erreur', 'Veuillez entrer un montant valide', 'error'); return }; setShowBetLoading(true); setTimeout(() => { setShowBetLoading(false); showCustomPopup('Succes', `Votre mise de ${amount.toLocaleString()} XOF a ete placee !`, 'success'); setAmount(0) }, 3000) }

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden pb-10" style={{ background: '#0a0a1a' }}>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" style={{ opacity: 0.4 }} />
      <div className="fixed w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full pointer-events-none z-0 -top-[15%] -right-[10%] animate-[float1_12s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] rounded-full pointer-events-none z-0 -bottom-[10%] -left-[5%] animate-[float2_15s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      {/* Loading */}
      <AnimatePresence>{loading && <div className="fixed inset-0 bg-[#0a0a1a]/95 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center gap-6"><div className="w-13 h-13 border-[3px] border-emerald-400/15 border-t-emerald-400 border-r-purple-400 rounded-full animate-spin" /><p className="text-white/80 text-sm font-medium animate-pulse">{loadingText}</p></div>}</AnimatePresence>

      {/* Header */}
      <motion.header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-emerald-400/10 bg-[#0a0a1a]/90 backdrop-blur-xl" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <motion.img src="/img/WariPlay_Logo_Transparent.png" alt="WariPlay" className="h-8 sm:h-9 w-auto" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} />
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent hidden sm:block">XOF Trader</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 flex items-center justify-center text-xs"><UserIcon /></div>
          <span className="font-medium text-sm hidden sm:block">{userName}</span>
          <span className="bg-emerald-400/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-400/20">{userBalance}</span>
        </div>
      </motion.header>

      {/* Navigation */}
      <nav className="relative z-10 flex gap-1.5 px-3 sm:px-4 py-2.5 overflow-x-auto scrollbar-none sticky top-0 bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-emerald-400/10">
        {navSections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border whitespace-nowrap ${activeSection === s.key ? 'bg-emerald-400/20 border-emerald-400/30 text-white' : 'bg-white/[0.04] border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.08]'}`}>
            <span className="flex-shrink-0">{s.icon}</span><span>{s.label}</span>
          </button>
        ))}
        <Link href="/home" className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium bg-white/[0.04] border border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-300 whitespace-nowrap"><HomeIcon /> Home</Link>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {activeSection === 'trading' && (
            <motion.div key="trading" className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Chart Section */}
              <div className="rounded-2xl p-4 sm:p-6 border border-emerald-400/10 relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-0.5 before:rounded-b before:bg-gradient-to-r before:from-emerald-400 before:to-purple-400 min-w-0" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.85), rgba(22,33,62,0.75))', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg sm:text-xl font-bold flex items-center gap-2"><ChartIcon /> XOF/TRADE</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${parseFloat(pairChange) >= 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>{pairChange}</span>
                  </div>
                  <div className="flex bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
                    <button className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-400 text-[#0a0a1a]">15m</button>
                  </div>
                </div>
                <div className="w-full bg-black/20 rounded-xl overflow-hidden mb-4 min-h-[280px] sm:min-h-[350px] lg:min-h-[400px]"><canvas ref={chartCanvasRef} className="w-full h-full block" /></div>
                <div className="flex gap-2.5 flex-wrap mb-4">
                  <span className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs flex items-center gap-2"><span className="text-white/50">Tendance</span><span className={`font-semibold ${trendIndicator === 'Hausse' ? 'text-emerald-400' : 'text-red-400'}`}>{trendIndicator}</span></span>
                  <span className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs flex items-center gap-2"><span className="text-white/50">Volatilite</span><span className="text-white/80 font-semibold">{volatilityIndicator}</span></span>
                </div>
                <div className="max-h-[250px] overflow-y-auto space-y-2">
                  {bets.length > 0 ? bets.map(bet => (
                    <div key={bet.id} className={`p-3 rounded-xl bg-white/[0.03] border-l-3 ${bet.direction === 'up' ? 'border-l-emerald-400' : 'border-l-red-400'} ${bet.isYours ? 'bg-purple-400/5' : ''}`}>
                      <div className="flex items-center gap-2 mb-1.5"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 flex items-center justify-center text-[10px]"><UserIcon /></div><span className="text-sm font-medium">{bet.username}</span>{bet.isYours && <span className="bg-purple-400 text-white text-[10px] px-1.5 py-0.5 rounded-full">Vous</span>}</div>
                      <div className="text-sm font-bold">{bet.amount.toLocaleString()} XOF</div>
                      <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                        <span className={bet.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}>{bet.direction === 'up' ? 'Hausse' : 'Baisse'}</span>
                        <span className="text-white/40">{bet.status === 'active' ? 'En cours' : bet.status === 'won' ? 'Gagne' : 'Perdu'}</span>
                        {bet.timer && <span className="text-purple-400">{bet.timer}s</span>}
                        {bet.profit && <span className="text-emerald-400 font-semibold">+{bet.profit} XOF</span>}
                      </div>
                    </div>
                  )) : <div className="text-center py-8 text-white/40 text-sm">Aucune mise en cours</div>}
                </div>
              </div>

              {/* Order Section */}
              <div className="rounded-2xl p-4 sm:p-6 border border-emerald-400/10 h-fit relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-0.5 before:rounded-b before:bg-gradient-to-r before:from-emerald-400 before:to-purple-400" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.85), rgba(22,33,62,0.75))', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <h3 className="text-lg font-bold mb-4">Passer une mise</h3>
                <div className="space-y-4">
                  <div><label className="text-xs text-white/50 mb-1.5 block">Montant (XOF)</label><div className="relative"><input type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} placeholder="0" className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none text-sm focus:border-emerald-400/40" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">XOF</span></div></div>
                  <div><div className="flex justify-between text-[10px] text-white/40 mb-1"><span>0</span><span>5K</span><span>10K</span><span>15K</span><span>20K</span></div><input type="range" min={0} max={20000} step={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none bg-white/[0.08] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,200,150,0.3)]" /></div>
                  <button onClick={handleBet} className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">Miser</button>
                  <button disabled className="w-full py-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold uppercase tracking-wide text-sm opacity-40 cursor-not-allowed">Ramasser</button>
                </div>
                <div className="mt-5 pt-5 border-t border-white/[0.06] space-y-2.5">
                  {[{ l: 'Valeur actuelle', v: currentValue },{ l: 'Derniere variation', v: <span className="text-emerald-400">{changeAmount}</span> },{ l: 'Variation max', v: '±500 XOF' }].map((r, i) => (
                    <div key={i} className="flex justify-between text-sm"><span className="text-white/50">{r.l}</span><span className="font-medium">{r.v}</span></div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'bets' && (
            <motion.div key="bets" className="rounded-2xl p-4 sm:p-6 border border-emerald-400/10 relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-0.5 before:rounded-b before:bg-gradient-to-r before:from-emerald-400 before:to-purple-400" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.85), rgba(22,33,62,0.75))', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ExchangeIcon /> Mes Mises en cours</h3>
              <div className="space-y-3">
                {bets.filter(b => b.isYours).length > 0 ? bets.filter(b => b.isYours).map(bet => (
                  <div key={bet.id} className={`p-4 rounded-xl bg-white/[0.03] border-l-3 ${bet.direction === 'up' ? 'border-l-emerald-400' : 'border-l-red-400'}`}>
                    <div className="flex justify-between mb-2 text-xs text-white/40"><span>{bet.id}</span><span>{bet.time}</span></div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {[{ l: 'Montant', v: `${bet.amount.toLocaleString()} XOF` },{ l: 'Direction', v: <span className={bet.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}>{bet.direction === 'up' ? 'Hausse' : 'Baisse'}</span> },{ l: 'Statut', v: bet.status },{ l: 'Profit', v: bet.profit ? <span className="text-emerald-400">+{bet.profit} XOF</span> : '-' }].map((d, i) => (
                        <div key={i}><span className="text-white/50 block text-xs mb-0.5">{d.l}</span><span className="font-medium">{d.v}</span></div>
                      ))}
                    </div>
                  </div>
                )) : <div className="text-center py-8 text-white/40">Aucune mise en cours</div>}
              </div>
            </motion.div>
          )}

          {activeSection === 'history' && (
            <motion.div key="history" className="rounded-2xl p-4 sm:p-6 border border-emerald-400/10 relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-0.5 before:rounded-b before:bg-gradient-to-r before:from-emerald-400 before:to-purple-400" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.85), rgba(22,33,62,0.75))', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><HistoryIcon /> Historique</h3>
              <div className="space-y-3">
                {history.length > 0 ? history.map(tx => (
                  <div key={tx.id} className={`p-4 rounded-xl bg-white/[0.03] border-l-3 ${tx.status === 'positive' ? 'border-l-emerald-400' : 'border-l-red-400'}`}>
                    <div className="flex justify-between mb-2 text-xs text-white/40"><span>{tx.id}</span><span>{tx.date}</span></div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-white/50 block text-xs mb-0.5">Type</span><span className="font-medium">{tx.type}</span></div>
                      <div><span className="text-white/50 block text-xs mb-0.5">Montant</span><span className={`font-medium ${tx.status === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>{tx.status === 'positive' ? '+' : '-'}{tx.amount.toLocaleString()} XOF</span></div>
                    </div>
                  </div>
                )) : <div className="text-center py-8 text-white/40">Aucune transaction</div>}
              </div>
            </motion.div>
          )}

          {activeSection === 'wallet' && (
            <motion.div key="wallet" className="rounded-2xl p-4 sm:p-6 border border-emerald-400/10 relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-0.5 before:rounded-b before:bg-gradient-to-r before:from-emerald-400 before:to-purple-400" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.85), rgba(22,33,62,0.75))', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><WalletIcon /> Mon Portefeuille</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {[{ icon: <CoinsIcon />, title: 'Solde Principal', balance: mainBalance, details: 'Disponible pour trading' },{ icon: <PiggyIcon />, title: 'Epargne', balance: savingsBalance, details: 'Taux: 2.5%' }].map((c, i) => (
                  <div key={i} className="rounded-2xl p-4 border border-emerald-400/10" style={{ background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.8))' }}>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-3">{c.icon} {c.title}</div>
                    <div className="text-2xl sm:text-3xl font-bold mb-2">{c.balance}</div>
                    <div className="text-xs text-white/50">{c.details}</div>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm mb-5">
                <WalletIcon /> Wallet ID : <span className="font-mono font-semibold">{walletId}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                {[{ label: 'Depot', icon: <PlusIcon />, bg: 'from-purple-500 to-purple-700 shadow-purple-500/30' },{ label: 'Retrait', icon: <MinusIcon />, bg: 'from-orange-500 to-orange-700 shadow-orange-500/30' },{ label: 'Transfert', icon: <ExchangeIcon />, bg: 'from-emerald-400 to-emerald-600 shadow-emerald-500/30' }].map((a, i) => (
                  <button key={i} className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${a.bg} text-white font-bold text-sm uppercase tracking-wide shadow-xl hover:-translate-y-0.5 transition-all`}>{a.icon} {a.label}</button>
                ))}
              </div>
              <h4 className="text-sm font-semibold text-white/80 mb-3">Dernieres Transactions</h4>
              <div className="text-center py-6 text-white/40 text-sm">Aucune transaction recente</div>
            </motion.div>
          )}

          {activeSection === 'message' && (
            <motion.div key="message" className="rounded-2xl p-4 sm:p-6 border border-emerald-400/10 relative before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-0.5 before:rounded-b before:bg-gradient-to-r before:from-emerald-400 before:to-purple-400" style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.85), rgba(22,33,62,0.75))', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <h3 className="text-lg font-bold flex items-center gap-2"><MailIcon /> Messages</h3>
                <button className="px-4 py-1.5 rounded-full bg-emerald-400/8 border border-emerald-400/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-400/15 transition-all">Tout marquer lu</button>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {messages.length > 0 ? messages.map(msg => (
                  <div key={msg.id} className={`p-4 rounded-xl border-l-3 ${msg.isUnread ? 'border-l-emerald-400 bg-emerald-400/[0.02]' : 'border-l-purple-400 bg-white/[0.02]'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 flex items-center justify-center text-[10px]"><UserIcon /></div><span className="text-sm font-medium">{msg.senderName}</span></div>
                      <span className="text-xs text-white/40">{msg.time}</span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed mb-1.5">{msg.text}</p>
                    {msg.amount && <span className="text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-400/10">+{msg.amount.toLocaleString()} XOF</span>}
                  </div>
                )) : <div className="text-center py-8 text-white/40">Aucun message</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bet Loading */}
      <AnimatePresence>{showBetLoading && <div className="fixed inset-0 bg-[#0a0a1a]/90 backdrop-blur-xl z-[2000] flex flex-col items-center justify-center gap-6"><div className="w-13 h-13 border-[3px] border-emerald-400/15 border-t-emerald-400 border-r-purple-400 rounded-full animate-spin" /><p className="text-white/80 text-sm font-medium">Traitement de votre mise...</p></div>}</AnimatePresence>

      {/* Popup */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[3000] flex items-center justify-center p-4" onClick={() => setShowPopup(false)}>
            <motion.div className="relative w-full max-w-[420px] rounded-3xl p-6 sm:p-8 text-center border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)]" style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"><CloseIcon /></button>
              <div className={`text-4xl mb-4 ${popupData.type === 'success' ? 'text-emerald-400' : popupData.type === 'error' ? 'text-red-400' : 'text-purple-400'}`}>{popupData.type === 'success' ? <CheckIcon /> : popupData.type === 'error' ? <AlertIcon /> : <InfoIcon />}</div>
              <h3 className="text-lg font-bold text-white mb-2">{popupData.title}</h3>
              <p className="text-white/60 text-sm mb-5">{popupData.message}</p>
              <button onClick={() => setShowPopup(false)} className="px-10 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">OK</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}