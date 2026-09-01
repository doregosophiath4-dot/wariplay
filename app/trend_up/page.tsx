'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const ChartLineIcon = () => (
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const MoneyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
)

const CollectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1v22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CloseModalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface PricePoint {
  time: number
  price: number
}

interface Candlestick {
  time: number
  open: number
  high: number
  low: number
  close: number
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function TrendUp() {
  const [balance, setBalance] = useState(10000)
  const [currentBet, setCurrentBet] = useState(0)
  const [currentProfit, setCurrentProfit] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentPrice, setCurrentPrice] = useState(100)
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([{ time: 0, price: 100 }])
  const [candlestickData, setCandlestickData] = useState<Candlestick[]>([])
  const [remainingSeconds, setRemainingSeconds] = useState(180)
  const [gameActive, setGameActive] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [gameMessage, setGameMessage] = useState('')
  const [gameMessageType, setGameMessageType] = useState<'success' | 'error'>('success')
  const [loading, setLoading] = useState(false)
  const [showLoader, setShowLoader] = useState(true)
  const [loaderProgress, setLoaderProgress] = useState(0)
  const [containerVisible, setContainerVisible] = useState(false)
  const [isProcessingBet, setIsProcessingBet] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartGridRef = useRef<HTMLDivElement>(null)
  const betInputRef = useRef<HTMLInputElement>(null)
  const chartIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasSizeRef = useRef({ width: 0, height: 0 })
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const gameActiveRef = useRef(false)
  const remainingSecondsRef = useRef(180)
  const currentBetRef = useRef(0)
  const currentPriceRef = useRef(100)
  const currentProfitRef = useRef(0)
  const priceHistoryRef = useRef<PricePoint[]>([{ time: 0, price: 100 }])
  const candlestickDataRef = useRef<Candlestick[]>([])
  const currentTimeRef = useRef(0)

  useEffect(() => { gameActiveRef.current = gameActive }, [gameActive])
  useEffect(() => { remainingSecondsRef.current = remainingSeconds }, [remainingSeconds])
  useEffect(() => { currentBetRef.current = currentBet }, [currentBet])
  useEffect(() => { currentPriceRef.current = currentPrice }, [currentPrice])
  useEffect(() => { currentProfitRef.current = currentProfit }, [currentProfit])
  useEffect(() => { priceHistoryRef.current = priceHistory }, [priceHistory])
  useEffect(() => { candlestickDataRef.current = candlestickData }, [candlestickData])
  useEffect(() => { currentTimeRef.current = currentTime }, [currentTime])

  /* ── Chart Drawing ──────────────────────────────────── */
  const initChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const container = canvas.parentElement
    if (!container) return
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
    canvasSizeRef.current = { width: canvas.width, height: canvas.height }
    createGridLines()
    drawAdvancedChart()
  }, [])

  const createGridLines = useCallback(() => {
    const gridEl = chartGridRef.current
    if (!gridEl) return
    gridEl.innerHTML = ''
    const chartWidth = canvasSizeRef.current.width - padding.left - padding.right
    const chartHeight = canvasSizeRef.current.height - padding.top - padding.bottom

    for (let i = 0; i <= 5; i++) {
      const line = document.createElement('div')
      line.className = 'absolute left-0 right-0 h-px bg-white/[0.05]'
      line.style.top = `${padding.top + (i * chartHeight) / 5}px`
      gridEl.appendChild(line)

      const label = document.createElement('div')
      label.className = 'absolute text-white/50 text-[10px] left-1'
      label.style.top = `${padding.top + (i * chartHeight) / 5 - 10}px`
      label.textContent = (100 + (4 - i) * 25).toFixed(0)
      gridEl.appendChild(label)
    }

    for (let i = 0; i <= 10; i++) {
      const line = document.createElement('div')
      line.className = 'absolute top-0 bottom-0 w-px bg-white/[0.05]'
      line.style.left = `${padding.left + (i * chartWidth) / 10}px`
      gridEl.appendChild(line)

      if (i > 0) {
        const label = document.createElement('div')
        label.className = 'absolute text-white/50 text-[10px] bottom-1.5'
        label.style.left = `${padding.left + (i * chartWidth) / 10 - 10}px`
        label.textContent = (i * 5).toString()
        gridEl.appendChild(label)
      }
    }
  }, [padding])

  const drawAdvancedChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const chartWidth = canvasSizeRef.current.width - padding.left - padding.right
    const chartHeight = canvasSizeRef.current.height - padding.top - padding.bottom

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.5)'
    ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight)

    if (candlestickDataRef.current.length > 0) {
      drawCandlestickChart(ctx, candlestickDataRef.current, chartWidth, chartHeight)
    }

    drawPriceLine(ctx, chartWidth, chartHeight)
    drawIndicators(ctx, chartWidth, chartHeight)
    drawPriceMarker(ctx, chartWidth, chartHeight)
  }, [padding])

  const drawPriceLine = useCallback((ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number) => {
    const ph = priceHistoryRef.current
    if (ph.length < 2) return
    const prices = ph.map(item => item.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 50
    const paddedMin = minPrice - priceRange * 0.1
    const paddedMax = maxPrice + priceRange * 0.1
    const adjustedRange = paddedMax - paddedMin
    const ct = currentTimeRef.current

    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.strokeStyle = '#00c896'
    ctx.lineJoin = 'round'
    ph.forEach((point, index) => {
      const x = padding.left + (point.time / (ct || 1)) * chartWidth
      const y = padding.top + chartHeight - ((point.price - paddedMin) / adjustedRange) * chartHeight
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight)
    gradient.addColorStop(0, 'rgba(0, 200, 150, 0.2)')
    gradient.addColorStop(1, 'rgba(0, 200, 150, 0)')
    ctx.beginPath()
    ph.forEach((point, index) => {
      const x = padding.left + (point.time / (ct || 1)) * chartWidth
      const y = padding.top + chartHeight - ((point.price - paddedMin) / adjustedRange) * chartHeight
      if (index === 0) {
        ctx.moveTo(x, padding.top + chartHeight)
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
  }, [padding])

  const drawCandlestickChart = useCallback((ctx: CanvasRenderingContext2D, data: Candlestick[], chartWidth: number, chartHeight: number) => {
    if (data.length < 2) return
    const timeRange = data[data.length - 1].time - data[0].time
    const prices = data.map(c => [c.low, c.high]).flat()
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 50
    const paddedMin = minPrice - priceRange * 0.1
    const paddedMax = maxPrice + priceRange * 0.1
    const adjustedRange = paddedMax - paddedMin
    const candleWidth = (chartWidth / data.length) * 0.8

    data.forEach((candle) => {
      const x = padding.left + ((candle.time - data[0].time) / (timeRange || 1)) * chartWidth
      const yOpen = padding.top + chartHeight - ((candle.open - paddedMin) / adjustedRange) * chartHeight
      const yClose = padding.top + chartHeight - ((candle.close - paddedMin) / adjustedRange) * chartHeight
      const yHigh = padding.top + chartHeight - ((candle.high - paddedMin) / adjustedRange) * chartHeight
      const yLow = padding.top + chartHeight - ((candle.low - paddedMin) / adjustedRange) * chartHeight

      ctx.beginPath()
      ctx.lineWidth = 1
      ctx.strokeStyle = candle.close >= candle.open ? '#48bb78' : '#e53e3e'
      ctx.moveTo(x, yHigh)
      ctx.lineTo(x, yLow)
      ctx.stroke()

      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen))
      const yBody = Math.min(yOpen, yClose)
      ctx.fillStyle = candle.close >= candle.open ? '#48bb78' : '#e53e3e'
      ctx.fillRect(x - candleWidth / 2, yBody, candleWidth, bodyHeight)
      ctx.strokeStyle = candle.close >= candle.open ? '#2f855a' : '#c53030'
      ctx.lineWidth = 1
      ctx.strokeRect(x - candleWidth / 2, yBody, candleWidth, bodyHeight)
    })
  }, [padding])

  const drawIndicators = useCallback((ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number) => {
    const ph = priceHistoryRef.current
    if (ph.length < 20) return
    const prices = ph.map(item => item.price)
    const smaPeriod = 20
    if (prices.length >= smaPeriod) {
      let sum = 0
      for (let i = prices.length - smaPeriod; i < prices.length; i++) sum += prices[i]
      const sma = sum / smaPeriod
      const x = padding.left + chartWidth
      const y = padding.top + chartHeight - ((sma - 75) / 50) * chartHeight
      ctx.beginPath()
      ctx.setLineDash([5, 5])
      ctx.lineWidth = 1
      ctx.strokeStyle = '#f6ad55'
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#f6ad55'
      ctx.font = '10px Poppins'
      ctx.textAlign = 'right'
      ctx.fillText(`SMA20: ${sma.toFixed(2)}`, x - 5, y - 5)
    }
  }, [padding])

  const drawPriceMarker = useCallback((ctx: CanvasRenderingContext2D, chartWidth: number, chartHeight: number) => {
    const ph = priceHistoryRef.current
    if (ph.length === 0) return
    const lastPoint = ph[ph.length - 1]
    const prices = ph.map(item => item.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 50
    const paddedMin = minPrice - priceRange * 0.1
    const paddedMax = maxPrice + priceRange * 0.1
    const adjustedRange = paddedMax - paddedMin
    const x = padding.left + chartWidth
    const y = padding.top + chartHeight - ((lastPoint.price - paddedMin) / adjustedRange) * chartHeight

    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#00c896'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.lineWidth = 2
    ctx.strokeStyle = 'white'
    ctx.stroke()
    ctx.fillStyle = 'white'
    ctx.font = '12px Poppins'
    ctx.textAlign = 'right'
    ctx.fillText(`${lastPoint.price.toFixed(2)}`, x - 10, y - 10)
  }, [padding])

  const generateCandlestickData = useCallback(() => {
    const cp = currentPriceRef.current
    const ct = currentTimeRef.current
    const ph = priceHistoryRef.current
    if (ct % 5 === 0) {
      const periodPrices = ph.slice(-5).map(p => p.price)
      const open = periodPrices[0] || cp
      const close = cp
      const high = Math.max(...periodPrices)
      const low = Math.min(...periodPrices)
      setCandlestickData(prev => {
        const nd = [...prev, { time: ct, open, high, low, close }]
        if (nd.length > 20) nd.shift()
        candlestickDataRef.current = nd
        return nd
      })
    }
  }, [])

  /* ── Game Logic ─────────────────────────────────────── */
  const clearIntervals = useCallback(() => {
    if (chartIntervalRef.current) clearInterval(chartIntervalRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
  }, [])

  const endGame = useCallback((success: boolean, message: string) => {
    clearIntervals()
    setGameActive(false)
    gameActiveRef.current = false
    setGameMessage(message)
    setGameMessageType(success ? 'success' : 'error')
  }, [clearIntervals])

  const updateGame = useCallback(() => {
    if (!gameActiveRef.current) return
    const volatility = 0.8
    const drift = 0.1
    const change = (Math.random() * 2 - 1) * volatility + drift
    let newPrice = currentPriceRef.current + change
    newPrice = Math.max(10, Math.min(200, newPrice))

    if (newPrice <= 20) {
      endGame(false, "Crash du marche ! Vous avez perdu votre mise.")
      return
    }

    currentPriceRef.current = newPrice
    const newProfit = currentBetRef.current * (newPrice / 100)
    currentProfitRef.current = newProfit
    const newTime = currentTimeRef.current + 1
    currentTimeRef.current = newTime

    setCurrentPrice(newPrice)
    setCurrentProfit(newProfit)
    setCurrentTime(newTime)

    setPriceHistory(prev => {
      const nh = [...prev, { time: newTime, price: newPrice }]
      if (nh.length > 100) nh.shift()
      priceHistoryRef.current = nh
      return nh
    })

    generateCandlestickData()
    setTimeout(() => drawAdvancedChart(), 0)
  }, [endGame, generateCandlestickData, drawAdvancedChart])

  const updateCountdownDisplay = useCallback(() => {
    const seconds = remainingSecondsRef.current
    setRemainingSeconds(seconds)
  }, [])

  const startCountdown = useCallback(() => {
    remainingSecondsRef.current = 180
    updateCountdownDisplay()
    countdownIntervalRef.current = setInterval(() => {
      remainingSecondsRef.current -= 1
      updateCountdownDisplay()
      if (remainingSecondsRef.current <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
        setGameMessage("Temps ecoule ! Vous pouvez maintenant collecter vos gains.")
        setGameMessageType('success')
      }
    }, 1000)
  }, [updateCountdownDisplay])

  const startGame = useCallback(async () => {
    const bet = parseInt(betInputRef.current?.value ?? '')
    if (isNaN(bet)) { setErrorMessage("Veuillez entrer un montant valide"); return }
    if (bet < 100) { setErrorMessage("La mise minimale est de 100 XOF"); return }
    if (bet > balance) { setErrorMessage("Solde insuffisant pour cette mise"); return }

    setIsProcessingBet(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsProcessingBet(false)

    const newBalance = balance - bet
    setBalance(newBalance)
    localStorage.setItem('soldeTotal', newBalance.toString())

    currentBetRef.current = bet
    setCurrentBet(bet)
    currentProfitRef.current = bet
    setCurrentProfit(bet)
    currentTimeRef.current = 0
    setCurrentTime(0)
    currentPriceRef.current = 100
    setCurrentPrice(100)

    const initialHistory = [{ time: 0, price: 100 }]
    priceHistoryRef.current = initialHistory
    setPriceHistory(initialHistory)
    candlestickDataRef.current = []
    setCandlestickData([])

    setGameActive(true)
    gameActiveRef.current = true
    setGameMessage('')
    setErrorMessage('')

    setTimeout(() => initChart(), 50)
    startCountdown()
    chartIntervalRef.current = setInterval(updateGame, 1000)
  }, [balance, initChart, startCountdown, updateGame])

  const collectWinnings = useCallback(() => {
    if (remainingSecondsRef.current > 0) {
      setGameMessage("Vous devez attendre la fin des 3 minutes pour collecter vos gains !")
      setGameMessageType('error')
      return
    }
    const profit = currentProfitRef.current
    setBalance(prev => {
      const nb = prev + profit
      localStorage.setItem('soldeTotal', nb.toString())
      return nb
    })
    setGameMessage(`Vous avez recupere ${profit.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} XOF !`)
    setGameMessageType('success')
    setTimeout(() => resetGame(), 2000)
  }, [])

  const cancelGame = useCallback(() => {
    if (!gameActiveRef.current) return
    if (remainingSecondsRef.current > 0) {
      if (window.confirm("Annuler maintenant ? Vous recupererez votre mise initiale mais perdrez les gains potentiels.")) {
        const bet = currentBetRef.current
        setBalance(prev => {
          const nb = prev + bet
          localStorage.setItem('soldeTotal', nb.toString())
          return nb
        })
        endGame(false, "Transaction annulee. Votre mise vous a ete rendue.")
        setTimeout(() => resetGame(), 2000)
      }
    }
  }, [endGame])

  const resetGame = useCallback(() => {
    clearIntervals()
    setGameActive(false)
    gameActiveRef.current = false
    setGameMessage('')
    setErrorMessage('')
    const ih = [{ time: 0, price: 100 }]
    priceHistoryRef.current = ih
    setPriceHistory(ih)
    candlestickDataRef.current = []
    setCandlestickData([])
  }, [clearIntervals])

  /* ── Effects ─────────────────────────────────────────── */
  useEffect(() => {
    const savedSolde = localStorage.getItem('soldeTotal')
    if (savedSolde) setBalance(parseInt(savedSolde))
    let progress = 0
    const loadingInterval = setInterval(() => {
      progress += Math.random() * 10
      if (progress >= 100) {
        progress = 100
        clearInterval(loadingInterval)
        setTimeout(() => { setShowLoader(false); setContainerVisible(true) }, 300)
      }
      setLoaderProgress(progress)
    }, 200)
    return () => clearInterval(loadingInterval)
  }, [])

  useEffect(() => { if (containerVisible) setTimeout(() => initChart(), 100) }, [containerVisible, initChart])
  useEffect(() => { const hr = () => initChart(); window.addEventListener('resize', hr); return () => window.removeEventListener('resize', hr) }, [initChart])
  useEffect(() => { return () => clearIntervals() }, [clearIntervals])

  /* ── Derived ─────────────────────────────────────────── */
  const profitValue = currentProfit - currentBet
  const percentage = ((currentPrice - 100) / 100 * 100).toFixed(2)
  const countdownMinutes = Math.floor(remainingSeconds / 60)
  const countdownSecs = remainingSeconds % 60
  const countdownDisplay = `${countdownMinutes.toString().padStart(2, '0')}:${countdownSecs.toString().padStart(2, '0')}`
  const countdownColor = remainingSeconds <= 10 ? '#e53e3e' : remainingSeconds <= 30 ? '#f6ad55' : '#f6ad55'
  const canCollect = remainingSeconds <= 0

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="relative min-h-screen font-['Poppins',sans-serif] text-[#f7fafc] flex flex-col items-center justify-center p-5 overflow-x-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      
      {/* Loader Screen */}
      {showLoader && (
        <div className="fixed inset-0 bg-[#1a202c] flex flex-col items-center justify-center z-[1000]">
          <div className="w-[120px] h-[120px] mb-8 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,200,150,0.3)] animate-pulse">
            <ChartLineIcon />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Trend Up</h2>
          <p className="text-gray-300 text-sm mb-5">Chargement de la plateforme ...</p>
          <div className="w-[80%] max-w-[300px] h-1.5 bg-white/[0.1] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${loaderProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Rules Button */}
      <button
        onClick={() => setShowRules(true)}
        className="fixed top-5 right-5 w-10 h-10 bg-[#0f172a]/85 border border-white/[0.05] rounded-full flex items-center justify-center text-emerald-400 cursor-pointer z-[100] hover:scale-110 hover:bg-emerald-400/10 transition-all duration-300"
      >
        <HelpIcon />
      </button>

      {/* Rules Popup */}
      {showRules && (
        <div
          className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-5"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRules(false) }}
        >
          <div className="bg-[#0f172a]/85 rounded-2xl p-8 max-w-[500px] w-full max-h-[80vh] overflow-y-auto border border-white/[0.05] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-emerald-400 text-xl font-semibold">Regles du Jeu</h2>
              <button onClick={() => setShowRules(false)} className="bg-transparent border-none text-gray-400 text-xl cursor-pointer hover:text-red-500 transition-colors">
                <CloseModalIcon />
              </button>
            </div>
            <ul className="space-y-3.5">
              {[
                'Le jeu dure exactement 3 minutes (180 secondes)',
                'La mise minimale est de 100 XOF',
                'Vous ne pouvez pas retirer vos gains avant la fin du timer',
                'Vos gains sont calcules en temps reel selon la valeur du marche',
                'Si le marche tombe a 0, vous perdez votre mise',
                'Vous pouvez annuler a tout moment pour recuperer votre mise initiale',
                'A la fin des 3 minutes, vous pouvez collecter vos gains'
              ].map((rule, i) => (
                <li key={i} className="pl-6 relative before:content-['•'] before:text-emerald-400 before:absolute before:left-0 before:text-lg text-sm text-gray-300 leading-relaxed">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className={`w-full max-w-[1200px] flex flex-col items-center gap-8 transition-all duration-500 ${containerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>

        {/* Header */}
        <div className="text-center mb-2.5">
          <h1 className="text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-emerald-400 to-indigo-500 bg-clip-text text-transparent mb-2.5">
            Trend Up
          </h1>
          <p className="text-gray-300 text-sm">Gains en temps reel</p>
        </div>

        {/* Bet Section */}
        {!gameActive && (
          <div className="w-full max-w-[500px] bg-[#0f172a]/85 rounded-2xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl border border-white/[0.05] hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)] transition-all duration-300">
            
            <div className="flex items-center gap-2.5 mb-5 text-emerald-400">
              <CoinsIcon />
              <h2 className="text-xl font-medium">Placez votre mise</h2>
            </div>

            <div className="flex justify-between items-center mb-5 p-4 bg-emerald-400/10 rounded-xl border-l-4 border-emerald-400">
              <span className="text-sm text-gray-300">Votre solde:</span>
              <span className="text-lg font-semibold text-white">{balance.toLocaleString('fr-FR')} XOF</span>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm text-gray-300">Montant de la mise (XOF)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <MoneyIcon />
                </span>
                <input
                  type="number"
                  ref={betInputRef}
                  placeholder="100 XOF minimum"
                  min="100"
                  onKeyPress={(e) => { if (e.key === 'Enter') startGame() }}
                  className="w-full py-3 pl-11 pr-4 bg-white/[0.1] border border-white/[0.1] rounded-xl text-white text-base outline-none transition-all duration-300 focus:border-emerald-400 focus:shadow-[0_0_0_2px_rgba(0,200,150,0.2)] placeholder:text-white/30"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl mb-4 bg-red-500/20 border-l-4 border-red-500 text-red-300 text-sm">
                {errorMessage}
              </div>
            )}

            <button
              onClick={startGame}
              disabled={isProcessingBet}
              className="relative w-full py-3.5 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-medium rounded-xl hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,200,150,0.4)] disabled:bg-gray-600 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
            >
              <PlayIcon />
              Demarrer le trading
              {isProcessingBet && (
                <div className="absolute inset-0 bg-inherit rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
          </div>
        )}

        {/* Game Section */}
        {gameActive && (
          <div className="w-full flex flex-col items-center gap-5">
            
            {/* Chart */}
            <div className="w-full h-[300px] bg-[#0f172a]/85 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl border border-white/[0.05] relative">
              <canvas ref={canvasRef} className="w-full h-full" />
              <div ref={chartGridRef} className="absolute top-6 left-6 right-6 bottom-6 pointer-events-none" />
            </div>

            {/* Info Cards */}
            <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
              {[
                { label: 'Mise initiale', value: `${currentBet.toLocaleString('fr-FR')} XOF`, color: 'text-white' },
                { label: 'Gain actuel', value: `${currentProfit.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} XOF`, color: profitValue > 0 ? 'text-emerald-400' : profitValue < 0 ? 'text-red-400' : 'text-white' },
                { label: 'Variation', value: `${percentage}%`, color: profitValue > 0 ? 'text-emerald-400' : profitValue < 0 ? 'text-red-400' : 'text-white' }
              ].map((card, i) => (
                <div key={i} className="flex-1 bg-[#0f172a]/85 rounded-xl py-4 px-4 flex flex-col items-center shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                  <span className="text-xs text-gray-300 mb-1.5">{card.label}</span>
                  <span className={`text-lg font-semibold ${card.color}`}>{card.value}</span>
                </div>
              ))}
            </div>

            {/* Countdown */}
            <div className="text-xl sm:text-2xl font-semibold text-center my-2.5" style={{ color: countdownColor }}>
              {countdownDisplay}
            </div>

            {/* Game Message */}
            {gameMessage && (
              <div className={`w-full p-4 rounded-xl text-sm ${
                gameMessageType === 'success'
                  ? 'bg-emerald-400/20 border-l-4 border-emerald-400 text-emerald-300'
                  : 'bg-red-500/20 border-l-4 border-red-500 text-red-300'
              }`}>
                {gameMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={collectWinnings}
                disabled={!canCollect}
                className="flex-1 py-3.5 bg-white/[0.1] text-white font-medium rounded-xl hover:bg-white/[0.2] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CollectIcon />
                Ramasser les gains
              </button>
              <button
                onClick={cancelGame}
                className="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-500 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CloseIcon />
                Annuler la transaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}