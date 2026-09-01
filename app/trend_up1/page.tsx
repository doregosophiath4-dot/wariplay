'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

/* ═══════════════════════════════════════════
   LOADER ICON
   ═══════════════════════════════════════════ */

const LoaderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-emerald-400">
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
)

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

const CloseModalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l3 3 5-6" />
  </svg>
)

const AlertTriangleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v4" />
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
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
  color?: string
}

interface GameMessage {
  action: string
  bet?: number
  token?: string
  timestamp?: number
}

interface WSResponse {
  type: string
  current_price?: number
  current_value?: number
  remaining_seconds?: number
  price_history?: PricePoint[]
  candlestick_data?: Candlestick[]
  status?: string
  final_value?: number
  initial_bet?: number
  gain_net?: number
  bonus?: number
  credited?: number
  message?: string
  error?: string
  current_time?: number
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function TrendUp() {
  useAuth()
  const [balance, setBalance] = useState(0)
  const [lives, setLives] = useState(0)
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
  const [showLoader, setShowLoader] = useState(true)
  const [loaderProgress, setLoaderProgress] = useState(0)
  const [containerVisible, setContainerVisible] = useState(false)
  const [isProcessingBet, setIsProcessingBet] = useState(false)
  const [wsReady, setWsReady] = useState(false)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

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
  const wsRef = useRef<WebSocket | null>(null)
  const wsReadyRef = useRef(false)
  const pendingResolveRef = useRef<((value: any) => void) | null>(null)
  const pendingRejectRef = useRef<((reason?: any) => void) | null>(null)
  const gameTokenRef = useRef<string | null>(null)
  const gameTimestampRef = useRef<number | null>(null)

  const updateGameRef = useRef<(data: WSResponse) => void>(() => {})
  const handleGameOverRef = useRef<(data: WSResponse) => void>(() => {})

  useEffect(() => { gameActiveRef.current = gameActive }, [gameActive])
  useEffect(() => { remainingSecondsRef.current = remainingSeconds }, [remainingSeconds])
  useEffect(() => { currentBetRef.current = currentBet }, [currentBet])
  useEffect(() => { currentPriceRef.current = currentPrice }, [currentPrice])
  useEffect(() => { currentProfitRef.current = currentProfit }, [currentProfit])
  useEffect(() => { priceHistoryRef.current = priceHistory }, [priceHistory])
  useEffect(() => { candlestickDataRef.current = candlestickData }, [candlestickData])
  useEffect(() => { currentTimeRef.current = currentTime }, [currentTime])
  useEffect(() => { wsReadyRef.current = wsReady }, [wsReady])

  /* ── API Calls ────────────────────────────────────────── */
  const fetchBalance = useCallback(async (): Promise<number> => {
    try {
      const response = await fetchWithAllTokens('/api/get_lettricide_solde')
      if (!response.ok) return 0
      const data = await response.json()
      return data.solde || 0
    } catch {
      return 0
    }
  }, [])

  const fetchLives = useCallback(async (): Promise<number> => {
    try {
      const response = await fetchWithAllTokens('/api/get_trend_lives')
      if (!response.ok) return 0
      const data = await response.json()
      return data.lives || 0
    } catch {
      return 0
    }
  }, [])

  const decrementLife = useCallback(async (): Promise<{ success: boolean; remaining_lives: number } | null> => {
    try {
      const response = await fetchWithAllTokens('/api/decrement_trend_lives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) return null
      const data = await response.json()
      return data
    } catch {
      return null
    }
  }, [])

  const placeBet = useCallback(async (betAmount: number): Promise<{ success: boolean; new_solde: number; error?: string }> => {
    const response = await fetchWithAllTokens('/api/cherif', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet: betAmount })
    })
    if (!response.ok) {
      throw new Error("Erreur serveur")
    }
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || "Erreur")
    }
    return data
  }, [])

  /* ── Data Initialization ────────────────────────────── */
  const initializeGameData = useCallback(async () => {
    try {
      const [solde, vies] = await Promise.all([fetchBalance(), fetchLives()])
      setBalance(solde || 0)
      setLives(vies || 0)
    } catch {
      setBalance(0)
      setLives(0)
    }
  }, [fetchBalance, fetchLives])

  /* ── WebSocket ────────────────────────────────────────── */
  const closeWebSocket = useCallback(() => {
    wsReadyRef.current = false
    pendingResolveRef.current = null
    pendingRejectRef.current = null
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setWsReady(false)
  }, [])

  const openWebSocket = useCallback((): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (wsRef.current && wsReadyRef.current) {
        resolve()
        return
      }

      closeWebSocket()
      await initAll()

      const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
      const wsUrl = proto + window.location.host + '/ws/trend'

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      const timeout = setTimeout(() => {
        closeWebSocket()
        reject(new Error('Timeout WebSocket'))
      }, 10000)

      ws.onopen = async () => {
        try {
          const authMessage = await prepareWSAuthMessage()
          ws.send(JSON.stringify(authMessage))
        } catch (error) {
          clearTimeout(timeout)
          closeWebSocket()
          reject(error)
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'auth_success') {
            clearTimeout(timeout)
            wsReadyRef.current = true
            setWsReady(true)
            resolve()
            return
          }

          if (data.type === 'chart_update') {
            updateGameRef.current(data)
            return
          }

          if (
            data.status === 'won' ||
            data.status === 'lost' ||
            data.status === 'crashed'
          ) {
            handleGameOverRef.current(data)
            return
          }

          if (pendingResolveRef.current) {
            const resolver = pendingResolveRef.current
            pendingResolveRef.current = null
            pendingRejectRef.current = null
            resolver(data)
          }
        } catch (error) {
          clearTimeout(timeout)
          reject(error)
        }
      }

      ws.onerror = () => {
        clearTimeout(timeout)
        closeWebSocket()
        reject(new Error('Erreur WebSocket'))
      }

      ws.onclose = () => {
        wsReadyRef.current = false
        setWsReady(false)
        wsRef.current = null
        if (pendingRejectRef.current) {
          pendingRejectRef.current(new Error('WebSocket fermé'))
          pendingResolveRef.current = null
          pendingRejectRef.current = null
        }
      }
    })
  }, [closeWebSocket])

  const sendWebSocketMessage = useCallback(async (message: GameMessage): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || !wsReadyRef.current) {
        reject(new Error('Non connecté'))
        return
      }

      const timeout = setTimeout(() => {
        pendingResolveRef.current = null
        pendingRejectRef.current = null
        reject(new Error('Timeout WebSocket'))
      }, 10000)

      pendingResolveRef.current = (data) => {
        clearTimeout(timeout)
        resolve(data)
      }

      pendingRejectRef.current = (error) => {
        clearTimeout(timeout)
        reject(error)
      }

      wsRef.current.send(JSON.stringify(message))
    })
  }, [])

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

    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.strokeStyle = '#00c896'
    ctx.lineJoin = 'round'
    ph.forEach((point, index) => {
      const x = padding.left + (index / (ph.length - 1)) * chartWidth
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
      const x = padding.left + (index / (ph.length - 1)) * chartWidth
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
    const prices = data.map(c => [c.low, c.high]).flat()
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 50
    const paddedMin = minPrice - priceRange * 0.1
    const paddedMax = maxPrice + priceRange * 0.1
    const adjustedRange = paddedMax - paddedMin
    const candleWidth = chartWidth / data.length * 0.8

    data.forEach((candle, index) => {
      const x = padding.left + (index / (data.length - 1)) * chartWidth
      const yOpen = padding.top + chartHeight - ((candle.open - paddedMin) / adjustedRange) * chartHeight
      const yClose = padding.top + chartHeight - ((candle.close - paddedMin) / adjustedRange) * chartHeight
      const yHigh = padding.top + chartHeight - ((candle.high - paddedMin) / adjustedRange) * chartHeight
      const yLow = padding.top + chartHeight - ((candle.low - paddedMin) / adjustedRange) * chartHeight

      const color = candle.color || (candle.close >= candle.open ? '#48bb78' : '#e53e3e')
      const borderColor = candle.close >= candle.open ? '#2f855a' : '#c53030'

      ctx.beginPath()
      ctx.lineWidth = 1
      ctx.strokeStyle = color
      ctx.moveTo(x, yHigh)
      ctx.lineTo(x, yLow)
      ctx.stroke()

      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen))
      const yBody = Math.min(yOpen, yClose)
      ctx.fillStyle = color
      ctx.fillRect(x - candleWidth / 2, yBody, candleWidth, bodyHeight)
      ctx.strokeStyle = borderColor
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

  /* ── Game Logic ─────────────────────────────────────── */
  const clearIntervals = useCallback(() => {
    if (chartIntervalRef.current) {
      clearInterval(chartIntervalRef.current)
      chartIntervalRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

  const resetGame = useCallback(() => {
    clearIntervals()
    closeWebSocket()
    setGameActive(false)
    gameActiveRef.current = false
    setGameMessage('')
    setErrorMessage('')
    const ih = [{ time: 0, price: 100 }]
    priceHistoryRef.current = ih
    setPriceHistory(ih)
    candlestickDataRef.current = []
    setCandlestickData([])
    setCurrentBet(0)
    setCurrentProfit(0)
    setCurrentTime(0)
    setCurrentPrice(100)
    setRemainingSeconds(180)
    setGameMessage('')
    setGameMessageType('success')
    gameTokenRef.current = null
    gameTimestampRef.current = null
  }, [clearIntervals, closeWebSocket])

  const handleGameOver = useCallback((data: WSResponse) => {
    setGameActive(false)
    gameActiveRef.current = false

    if (data.status === 'won') {
      const gainNet = data.gain_net || 0
      const bonus = data.bonus || 0
      const credited = data.credited || data.final_value || 0
      let message = `Victoire ! Gain net: ${gainNet.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} XOF`
      if (bonus > 0) {
        message += ` (+${bonus.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} XOF bonus)`
      }
      message += ` — Total crédité: ${credited.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} XOF`
      setGameMessage(message)
      setGameMessageType('success')
      setTimeout(() => {
        initializeGameData()
      }, 1000)
    } else if (data.status === 'lost') {
      const initialBet = data.initial_bet || 0
      const finalValue = data.final_value || 0
      const perte = initialBet - finalValue
      setGameMessage(`Défaite. Perte: ${perte.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} XOF`)
      setGameMessageType('error')
    } else if (data.status === 'crashed') {
      setGameMessage('Crash du marché, mise perdue.')
      setGameMessageType('error')
    }

    setTimeout(() => {
      resetGame()
    }, 3000)
  }, [resetGame, initializeGameData])

  const updateGame = useCallback((data: WSResponse) => {
    if (!gameActiveRef.current) return

    const newPrice = data.current_price || 100
    const newValue = data.current_value || 0
    const newTime = data.current_time || 0
    const newRemaining = data.remaining_seconds || 0
    const newPriceHistory = data.price_history || []
    const newCandlestickData = data.candlestick_data || []

    currentPriceRef.current = newPrice
    currentProfitRef.current = newValue
    currentTimeRef.current = newTime

    setCurrentPrice(newPrice)
    setCurrentProfit(newValue)
    setCurrentTime(newTime)
    setRemainingSeconds(newRemaining)

    if (newPriceHistory.length > 0) {
      priceHistoryRef.current = newPriceHistory
      setPriceHistory(newPriceHistory)
    }

    if (newCandlestickData.length > 0) {
      candlestickDataRef.current = newCandlestickData
      setCandlestickData(newCandlestickData)
    }

    setTimeout(() => drawAdvancedChart(), 0)
  }, [drawAdvancedChart])

  useEffect(() => { updateGameRef.current = updateGame }, [updateGame])
  useEffect(() => { handleGameOverRef.current = handleGameOver }, [handleGameOver])

  const startGame = useCallback(async () => {
    const bet = parseInt(betInputRef.current?.value || '')

    if (isNaN(bet)) {
      setErrorMessage("Veuillez entrer un montant valide")
      return
    }
    if (bet < 100) {
      setErrorMessage("La mise minimale est de 100 XOF")
      return
    }
    if (bet > balance) {
      setErrorMessage("Solde insuffisant pour cette mise")
      return
    }
    if (lives <= 0) {
      setErrorMessage("Plus de vies disponibles")
      return
    }

    setIsProcessingBet(true)
    setShowLoadingOverlay(true)
    setLoadingMessage('Connexion au serveur...')

    try {
      await openWebSocket()

      setLoadingMessage('Décrémentation des vies...')
      const lifeResult = await decrementLife()

      if (!lifeResult || !lifeResult.success) {
        setErrorMessage("Erreur de vie")
        setIsProcessingBet(false)
        setShowLoadingOverlay(false)
        initializeGameData()
        return
      }
      setLives(lifeResult.remaining_lives)

      setLoadingMessage('Placement du pari...')
      const betResult = await placeBet(bet)

      setBalance(betResult.new_solde)

      currentBetRef.current = bet
      setCurrentBet(bet)

      setGameActive(true)
      gameActiveRef.current = true
      setGameMessage('')
      setErrorMessage('')

      setTimeout(() => initChart(), 50)

      setLoadingMessage('Démarrage du jeu...')

      const message = {
        action: 'start_game',
        bet: bet,
        token: gameTokenRef.current || '',
        timestamp: gameTimestampRef.current || 0
      }

      try {
        await sendWebSocketMessage(message)
      } catch {
        // Un accusé ponctuel manquant n'empêche pas le flux du jeu de continuer
      }

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erreur de jeu")
      resetGame()
    } finally {
      setIsProcessingBet(false)
      setShowLoadingOverlay(false)
    }
  }, [balance, lives, openWebSocket, decrementLife, placeBet, initChart, sendWebSocketMessage, resetGame, initializeGameData])

  const collectWinnings = useCallback(async () => {
    if (gameActiveRef.current) {
      setGameMessage("Vous devez attendre la fin des 3 minutes pour collecter vos gains !")
      setGameMessageType('error')
      return
    }

    try {
      setShowLoadingOverlay(true)
      setLoadingMessage('Collecte des gains en cours...')

      await initAll()

      const profit = currentProfitRef.current

      const response = await fetchWithAllTokens('/api/collect_trend_gains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: profit })
      })

      if (!response.ok) {
        setGameMessage("Erreur lors de la collecte")
        setGameMessageType('error')
        setShowLoadingOverlay(false)
        return
      }

      const data = await response.json()

      setBalance(data.new_solde)
      setGameMessage(`Vous avez récupéré ${profit.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} XOF !`)
      setGameMessageType('success')

      setTimeout(() => {
        resetGame()
      }, 2000)
    } catch {
      setGameMessage("Erreur lors de la collecte")
      setGameMessageType('error')
    } finally {
      setShowLoadingOverlay(false)
    }
  }, [resetGame])

  /* ── Effects ─────────────────────────────────────────── */
  useEffect(() => {
    let progress = 0
    const loadingInterval = setInterval(() => {
      progress += Math.random() * 10
      if (progress >= 100) {
        progress = 100
        clearInterval(loadingInterval)
        initializeGameData().then(() => {
          setTimeout(() => {
            setShowLoader(false)
            setContainerVisible(true)
          }, 300)
        })
      }
      setLoaderProgress(progress)
    }, 200)
    return () => {
      clearInterval(loadingInterval)
    }
  }, [initializeGameData])

  useEffect(() => {
    if (containerVisible) {
      setTimeout(() => initChart(), 100)
    }
  }, [containerVisible, initChart])

  useEffect(() => {
    const handleResize = () => {
      initChart()
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [initChart])

  useEffect(() => {
    return () => {
      clearIntervals()
      closeWebSocket()
    }
  }, [clearIntervals, closeWebSocket])

  /* ── Derived ─────────────────────────────────────────── */
  const profitValue = currentProfit - currentBet
  const percentage = currentBet > 0 ? ((currentProfit - currentBet) / currentBet * 100).toFixed(2) : '0.00'
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

      {/* Loading Overlay */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 bg-[#0a0e17]/90 backdrop-blur-xl flex flex-col items-center justify-center z-[5000]">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] mb-6 animate-pulse">
            <LoaderIcon />
          </div>
          <p className="text-lg font-semibold text-white/90 animate-pulse">{loadingMessage}</p>
          <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500 animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* Loader Screen */}
      {showLoader && (
        <div className="fixed inset-0 bg-[#1a202c] flex flex-col items-center justify-center z-[1000]">
          <div className="w-[120px] h-[120px] mb-8 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.3)] animate-pulse">
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
        className="fixed top-5 right-5 w-10 h-10 bg-[#0f172a]/85 border border-white/[0.08] rounded-full flex items-center justify-center text-emerald-400 cursor-pointer z-[100] hover:scale-110 hover:bg-emerald-400/10 hover:border-emerald-400/30 transition-all duration-300"
      >
        <HelpIcon />
      </button>

      {/* Rules Popup */}
      {showRules && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-5"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRules(false) }}
        >
          <div className="bg-[#0f172a] rounded-2xl p-8 max-w-[500px] w-full max-h-[80vh] overflow-y-auto border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/[0.06]">
              <h2 className="text-emerald-400 text-xl font-semibold">Règles du Jeu</h2>
              <button onClick={() => setShowRules(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.05] hover:bg-red-500/20 hover:text-red-400 transition-colors">
                <CloseModalIcon />
              </button>
            </div>
            <ul className="space-y-3.5">
              {[
                'Le jeu dure exactement 3 minutes (180 secondes)',
                'La mise minimale est de 100 XOF',
                'Vous ne pouvez pas retirer vos gains avant la fin du timer',
                'Vos gains sont calculés en temps réel selon la valeur du marché',
                'Si le marché tombe à 0, vous perdez votre mise',
                'À la fin des 3 minutes, vous pouvez collecter vos gains'
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
          <p className="text-gray-400 text-sm tracking-wide">Gains en temps réel</p>
        </div>

        {/* Bet Section */}
        {!gameActive && (
          <div className="w-full max-w-[500px] bg-[#0f172a] rounded-2xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-white/[0.06] hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.45)] transition-all duration-300">

            <div className="flex items-center gap-2.5 mb-6 text-emerald-400">
              <CoinsIcon />
              <h2 className="text-xl font-medium text-white">Placez votre mise</h2>
            </div>

            <div className="flex justify-between items-center mb-4 p-4 bg-emerald-400/[0.08] rounded-xl border border-emerald-400/20">
              <span className="text-sm text-gray-300">Votre solde</span>
              <span className="text-lg font-semibold text-white">{balance.toLocaleString('fr-FR')} XOF</span>
            </div>

            <div className="flex justify-between items-center mb-6 p-4 bg-red-400/[0.08] rounded-xl border border-red-400/20">
              <span className="text-sm text-gray-300">Vies restantes</span>
              <span className="text-lg font-semibold text-white">{lives}</span>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm text-gray-300 font-medium">Montant de la mise (XOF)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <MoneyIcon />
                </span>
                <input
                  type="text"
                  ref={betInputRef}
                  placeholder="100 XOF minimum"
                  onKeyPress={(e) => { if (e.key === 'Enter') startGame() }}
                  className="w-full py-3 pl-11 pr-4 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white text-base outline-none transition-all duration-300 focus:border-emerald-400 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] placeholder:text-white/30"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {errorMessage}
              </div>
            )}

            {gameMessage && (
              <div className={`w-full p-4 rounded-xl text-sm mb-4 border ${
                gameMessageType === 'success'
                  ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {gameMessage}
              </div>
            )}

            <button
              onClick={startGame}
              disabled={isProcessingBet}
              className="relative w-full py-3.5 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-medium rounded-xl hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,185,129,0.35)] disabled:bg-gray-600 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
            >
              <PlayIcon />
              Démarrer le trading
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
            <div className="w-full h-[300px] bg-[#0f172a] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-white/[0.06] relative">
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
                <div key={i} className="flex-1 bg-[#0f172a] rounded-xl py-4 px-4 flex flex-col items-center border border-white/[0.06] shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
                  <span className="text-xs text-gray-400 mb-1.5 tracking-wide">{card.label}</span>
                  <span className={`text-lg font-semibold ${card.color}`}>{card.value}</span>
                </div>
              ))}
            </div>

            {/* Countdown */}
            <div className="text-xl sm:text-2xl font-semibold text-center my-2.5 tracking-wider" style={{ color: countdownColor }}>
              {countdownDisplay}
            </div>

            {/* Game Message */}
            {gameMessage && (
              <div className={`w-full p-4 rounded-xl text-sm border ${
                gameMessageType === 'success'
                  ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {gameMessage}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={collectWinnings}
              disabled={!canCollect}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-medium rounded-xl hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,185,129,0.35)] disabled:bg-white/[0.06] disabled:text-gray-500 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 border border-transparent disabled:border-white/[0.06]"
            >
              <CollectIcon />
              Ramasser les gains
            </button>
          </div>
        )}
      </div>
    </div>
  )
}