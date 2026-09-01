'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

const VolumeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
    <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
  </svg>
)

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
    <path d="M5,3C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V16.72C21.59,16.37 22,15.74 22,15V9C22,8.26 21.59,7.63 21,7.28V5A2,2 0 0,0 19,3H5M5,5H19V7H13A2,2 0 0,0 11,9V15A2,2 0 0,0 13,17H19V19H5V5M13,9H20V15H13V9M16,10.5A1.5,1.5 0 0,0 14.5,12A1.5,1.5 0 0,0 16,13.5A1.5,1.5 0 0,0 17.5,12A1.5,1.5 0 0,0 16,10.5Z"/>
  </svg>
)

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
    <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
  </svg>
)

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
)

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
}

const CONFIG = {
  GRID_ROWS: 5,
  GRID_COLS: 5,
  TOTAL_CELLS: 25
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function WRiskPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef(0)

  const [gameActive, setGameActive] = useState(false)

  // Grille : les valeurs ne sont plus générées côté client.
  // Elles ne sont connues qu'une fois la révélation confirmée par le backend.
  const [gridValues, setGridValues] = useState<(number | null)[]>(new Array(CONFIG.TOTAL_CELLS).fill(null))
  const [revealedCells, setRevealedCells] = useState<boolean[]>(new Array(CONFIG.TOTAL_CELLS).fill(false))
  const [cellLoading, setCellLoading] = useState<boolean[]>(new Array(CONFIG.TOTAL_CELLS).fill(false))
  const [revealedCount, setRevealedCount] = useState(0)
  const [revealedValues, setRevealedValues] = useState<number[]>([])

  const [currentBet, setCurrentBet] = useState(100)
  const [initialBet, setInitialBet] = useState(100)
  const [casesToReveal, setCasesToReveal] = useState(3)

  const [walletBalance, setWalletBalance] = useState(0)
  const [walletLoading, setWalletLoading] = useState(true)
  const [totalGains, setTotalGains] = useState(0)
  const [score, setScore] = useState(0)

  const [currentGameId, setCurrentGameId] = useState<string | null>(null)
  const [actionPending, setActionPending] = useState(false)

  const [notification, setNotification] = useState({ message: '', type: 'info', visible: false })
  const [modal, setModal] = useState({ visible: false, title: '', message: '', isRules: false })
  const [showFuturistic, setShowFuturistic] = useState(false)

  /* ── Canvas Background ──────────────────────────────── */
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

    const particles: Particle[] = []
    const count = window.innerWidth > 768 ? 100 : 60
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3.5 + 1,
        speedX: (Math.random() - 0.5) * 0.6,
        speedY: (Math.random() - 0.5) * 0.6,
        color: Math.random() > 0.75 ? 'rgba(255,179,71,0.35)' : Math.random() > 0.45 ? 'rgba(255,138,0,0.3)' : 'rgba(255,77,77,0.28)'
      })
    }

    const stars: { x: number; y: number; radius: number; alpha: number; speed: number }[] = []
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005
      })
    }

    const animate = () => {
      if (!ctx || !canvas) return
      ctx.fillStyle = 'rgba(8,11,16,0.06)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1
      })

      stars.forEach(star => {
        star.alpha += star.speed
        if (star.alpha > 1 || star.alpha < 0.1) star.speed *= -1
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${star.alpha * 0.5})`
        ctx.fill()
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  /* ── Helpers UI ─────────────────────────────────────── */
  const calculateMaxGains = () => currentBet * 25
  const calculateNextStep = () => totalGains + initialBet

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type, visible: true })
    setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 3000)
  }

  /* ── Solde (backend authoritative) ─────────────────── */
  const fetchSolde = useCallback(async () => {
    try {
      const response = await fetchWithAllTokens('/api/get_lettricide_solde', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Impossible de récupérer le solde')
      }

      const data = await response.json()
      setWalletBalance(data.solde)
    } catch (error) {
      showNotification('Impossible de récupérer votre solde', 'negative')
    } finally {
      setWalletLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSolde()
    const interval = setInterval(fetchSolde, 30000)
    return () => clearInterval(interval)
  }, [fetchSolde])

  /* ── Démarrage de partie (mise) ─────────────────────── */
  const startGame = async () => {
    if (gameActive) {
      showNotification("Partie en cours, terminez-la d'abord", 'warning')
      return
    }
    if (walletBalance < currentBet) {
      showNotification('Fonds insuffisants pour cette mise', 'negative')
      return
    }
    if (actionPending) return

    setActionPending(true)
    try {
      const response = await fetchWithAllTokens('/api/game/start', {
        method: 'POST',
        body: JSON.stringify({
          bet_amount: currentBet,
          cases_to_reveal: casesToReveal
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Erreur lors du démarrage de la partie')
      }

      const data = await response.json()

      setCurrentGameId(data.game_id)
      setWalletBalance(data.new_balance)
      setInitialBet(currentBet)
      setTotalGains(data.initial_gains ?? 0)
      setScore(data.initial_gains ?? 0)
      setRevealedCount(0)
      setRevealedValues([])
      setRevealedCells(new Array(CONFIG.TOTAL_CELLS).fill(false))
      setCellLoading(new Array(CONFIG.TOTAL_CELLS).fill(false))
      setGridValues(new Array(CONFIG.TOTAL_CELLS).fill(null))
      setGameActive(true)
      setShowFuturistic(true)

      showNotification(`Partie démarrée! Vous pouvez révéler ${casesToReveal} cases maximum avec une mise de ${currentBet} XOF`, 'positive')
    } catch (error: any) {
      showNotification(error.message || 'Erreur lors du démarrage', 'negative')
    } finally {
      setActionPending(false)
    }
  }

  /* ── Révélation d'une case (backend authoritative) ──── */
  const handleCellClick = async (index: number) => {
    if (!gameActive || !currentGameId) {
      showNotification("Veuillez d'abord placer une mise pour jouer", 'warning')
      return
    }
    if (revealedCells[index] || cellLoading[index]) return
    if (revealedCount >= casesToReveal) {
      showNotification(`Vous avez déjà révélé ${casesToReveal} cases maximum!`, 'warning')
      return
    }

    setCellLoading(prev => {
      const next = [...prev]
      next[index] = true
      return next
    })

    try {
      const response = await fetchWithAllTokens('/api/game/reveal', {
        method: 'POST',
        body: JSON.stringify({
          game_id: currentGameId,
          cell_index: index
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Erreur serveur')
      }

      const result = await response.json()
      const value = result.cell_value

      setGridValues(prev => {
        const next = [...prev]
        next[index] = value
        return next
      })
      setRevealedCells(prev => {
        const next = [...prev]
        next[index] = true
        return next
      })
      const newRevealedCount = revealedCount + 1
      setRevealedCount(newRevealedCount)

      setRevealedValues(prev => {
        const next = [...prev, value]
        if (next.length > 4) next.shift()
        return next
      })

      setTotalGains(result.new_gains)
      setScore(prev => prev + value)

      if (value >= initialBet * 3) {
        showNotification(`Bonus! +${value} XOF`, 'bonus')
      } else if (value > 0) {
        showNotification(`+${value} XOF`, 'positive')
      } else {
        showNotification(`${value} XOF`, 'negative')
      }

      if (result.game_ended) {
        await endGame(result.end_reason, result.new_gains)
      }
    } catch (error: any) {
      showNotification(error.message || 'Erreur lors de la révélation', 'negative')
    } finally {
      setCellLoading(prev => {
        const next = [...prev]
        next[index] = false
        return next
      })
    }
  }

  /* ── Encaissement ───────────────────────────────────── */
  const collectGains = async () => {
    if (!gameActive || !currentGameId) {
      showNotification('Aucune partie active', 'warning')
      return
    }
    if (revealedCount < 2 || totalGains <= 0) {
      showNotification('Vous devez révéler au moins 2 cases pour encaisser', 'warning')
      return
    }
    if (actionPending) return

    setActionPending(true)
    try {
      const response = await fetchWithAllTokens('/api/game/collect', {
        method: 'POST',
        body: JSON.stringify({
          game_id: currentGameId
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || "Erreur lors de l'encaissement")
      }

      const result = await response.json()

      setWalletBalance(result.new_balance)
      showNotification(`Vous avez encaissé ${result.collected_amount} XOF!`, 'positive')
      setGameActive(false)
      setShowFuturistic(false)
      setTotalGains(0)
      setCurrentGameId(null)
    } catch (error: any) {
      showNotification(error.message || "Erreur lors de l'encaissement", 'negative')
    } finally {
      setActionPending(false)
    }
  }

  /* ── Fin de partie (notifie le backend + affiche le modal) ─ */
  const endGame = async (reason: string, finalGains?: number) => {
    const gains = finalGains ?? totalGains

    try {
      if (currentGameId) {
        const response = await fetchWithAllTokens('/api/game/end', {
          method: 'POST',
          body: JSON.stringify({
            game_id: currentGameId,
            reason,
          })
        })
        if (response.ok) {
          const result = await response.json()
          if (result.final_balance !== undefined) {
            setWalletBalance(result.final_balance)
          }
        }
      }
    } catch (error) {
    }

    setGameActive(false)
    setShowFuturistic(false)
    setCurrentGameId(null)

    setModal({
      visible: true,
      title: gains > 0 ? 'Félicitations !' : 'Dommage !',
      message: gains > 0
        ? `Vous avez gagné ${gains.toLocaleString()} XOF en révélant ${revealedCount} cases`
        : `Votre score est de ${gains.toLocaleString()} XOF après ${revealedCount} cases révélées`,
      isRules: false
    })
  }

  const showRules = () => {
    setModal({
      visible: true,
      title: 'Regles du Jeu',
      message: '',
      isRules: true
    })
  }

  const resetGame = () => {
    setModal(prev => ({ ...prev, visible: false }))
    setGameActive(false)
    setShowFuturistic(false)
    setScore(0)
    setTotalGains(0)
    setRevealedCount(0)
    setRevealedValues([])
    setRevealedCells(new Array(CONFIG.TOTAL_CELLS).fill(false))
    setCellLoading(new Array(CONFIG.TOTAL_CELLS).fill(false))
    setGridValues(new Array(CONFIG.TOTAL_CELLS).fill(null))
    setCurrentGameId(null)
    fetchSolde()
  }

  /* ── Bet Controls (uniquement modifiables hors partie) ─ */
  const increaseBet = () => { if (!gameActive && currentBet < 1000) setCurrentBet(prev => prev + (prev < 500 ? 100 : 500)) }
  const decreaseBet = () => { if (!gameActive && currentBet > 100) setCurrentBet(prev => prev - (prev <= 500 ? 100 : 500)) }
  const increaseCases = () => { if (!gameActive && casesToReveal < 25) setCasesToReveal(prev => prev + 1) }
  const decreaseCases = () => { if (!gameActive && casesToReveal > 3) setCasesToReveal(prev => prev - 1) }

  const getCellDisplay = (index: number) => {
    if (!revealedCells[index] || gridValues[index] === null) return ''
    const value = gridValues[index] as number
    return value > 0 ? `+${value}` : `${value}`
  }

  const isPositive = (index: number) => revealedCells[index] && gridValues[index] !== null && (gridValues[index] as number) > 0 && (gridValues[index] as number) < initialBet * 3
  const isNegative = (index: number) => revealedCells[index] && gridValues[index] !== null && (gridValues[index] as number) < 0
  const isBonus = (index: number) => revealedCells[index] && gridValues[index] !== null && (gridValues[index] as number) >= initialBet * 3

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-5 sm:p-5 overflow-x-hidden relative font-['Poppins',sans-serif] text-white bg-[radial-gradient(ellipse_at_50%_0%,#111827_0%,#080b10_70%)]">

      {/* Canvas Background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-85" />

      {/* Notification */}
      <AnimatePresence>
        {notification.visible && (
          <motion.div
            className={`fixed top-5 right-5 z-[100] py-4 px-6 rounded-xl backdrop-blur-2xl font-semibold text-sm max-w-[320px] shadow-[0_8px_25px_rgba(0,0,0,0.6)] border-l-[5px] ${
              notification.type === 'positive' ? 'bg-gradient-to-b from-[#0f1a2a]/97 to-[#0a121e]/95 border-l-orange-400 shadow-[0_0_25px_rgba(255,140,0,0.3)]' :
              notification.type === 'negative' ? 'bg-gradient-to-b from-[#0f1a2a]/97 to-[#0a121e]/95 border-l-red-400' :
              notification.type === 'bonus' ? 'bg-gradient-to-b from-[#0f1a2a]/97 to-[#0a121e]/95 border-l-yellow-400 shadow-[0_0_25px_rgba(255,215,0,0.3)]' :
              'bg-gradient-to-b from-[#0f1a2a]/97 to-[#0a121e]/95 border-l-orange-500'
            }`}
            initial={{ x: '120%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '120%', opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {modal.visible && (
          <motion.div
            className="fixed inset-0 bg-black/92 backdrop-blur-md flex items-center justify-center z-[200] p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(prev => ({ ...prev, visible: false }))}
          >
            <motion.div
              className="bg-gradient-to-b from-[#0f1a2a]/98 to-[#0a121e]/96 rounded-3xl p-8 sm:p-10 max-w-[500px] w-full text-center border border-orange-400/20 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_25px_rgba(255,140,0,0.3)] max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 250 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-orange-400 text-2xl font-bold mb-4 drop-shadow-[0_0_12px_rgba(255,179,71,0.3)]">{modal.title}</h2>

              {modal.isRules ? (
                <div className="text-left leading-relaxed text-sm text-white/80 space-y-2">
                  <p><strong className="text-orange-400">Wari Mine Premium</strong> est un jeu de hasard ou vous devez decouvrir des cellules pour gagner de l&apos;argent.</p>
                  <br />
                  <p><span className="text-emerald-400">● Cellules vertes</span> : +MISE XOF</p>
                  <p><span className="text-red-400">● Cellules rouges</span> : -MISE XOF</p>
                  <p><span className="text-yellow-400">● Cellules dorees</span> : Bonus +MISE XOF</p>
                  <br />
                  <p><strong className="text-orange-400">Regles :</strong></p>
                  <p>• Le jeu s&apos;arrete automatiquement si vos gains tombent a 0 ou moins</p>
                  <p>• Encaisser disponible seulement apres 2 cases revelees</p>
                  <p>• Fin de partie apres avoir revele toutes les cases selectionnees</p>
                  <p><strong className="text-orange-400">Mise minimum : 100 XOF</strong></p>
                  <p><strong className="text-orange-400">Cases a reveler : 3 a 25</strong></p>
                  <p><strong className="text-orange-400">Gain maximum possible : MISE x 25</strong></p>
                </div>
              ) : (
                <p className="text-white/80 text-base leading-relaxed">{modal.message}</p>
              )}

              <div className="flex gap-3.5 justify-center mt-6 flex-wrap">
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-b from-orange-400 to-orange-600 text-white border-none cursor-pointer shadow-[0_8px_20px_rgba(255,140,0,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,140,0,0.55)] active:translate-y-0 transition-all duration-300"
                >
                  <RefreshIcon />
                  {modal.isRules ? 'Commencer a jouer' : 'Rejouer'}
                </button>
                <button
                  onClick={() => setModal(prev => ({ ...prev, visible: false }))}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-sm bg-transparent text-white/65 border border-white/10 cursor-pointer hover:bg-white/5 hover:border-white/25 hover:text-white transition-all duration-300"
                >
                  <CloseIcon />
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[720px] flex flex-col items-center gap-5 px-2">

        {/* Header Controls */}
        <div className="w-full flex justify-center">
          <div className="flex gap-2.5 bg-gradient-to-b from-[#111b2b] to-[#0c131f] border border-orange-400/20 rounded-2xl py-3 px-4 sm:px-5 flex-wrap justify-center w-full shadow-[0_12px_35px_rgba(0,0,0,0.65),0_0_25px_rgba(255,140,0,0.3)] relative overflow-hidden
            before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-orange-400/25 before:via-transparent before:to-orange-400/15 before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude] before:pointer-events-none">

            <button className="flex items-center gap-1.5 bg-gradient-to-b from-[#161b22]/95 to-[#10141c]/90 text-white/90 border border-white/[0.06] rounded-xl py-2 px-4 text-xs cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_3px_8px_rgba(0,0,0,0.5)] hover:bg-orange-400/10 hover:shadow-[0_0_25px_rgba(255,140,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
              <VolumeIcon />
            </button>

            <button
              onClick={fetchSolde}
              title="Rafraîchir le solde"
              className="flex items-center gap-1.5 bg-gradient-to-b from-[#161b22]/95 to-[#10141c]/90 text-white/90 border border-white/[0.06] rounded-xl py-2 px-4 text-xs cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_3px_8px_rgba(0,0,0,0.5)] hover:bg-orange-400/10 hover:shadow-[0_0_25px_rgba(255,140,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              <WalletIcon />
              <span>{walletLoading ? '...' : `${walletBalance.toLocaleString()} XOF`}</span>
            </button>

            <button
              onClick={showRules}
              className="flex items-center gap-1.5 bg-gradient-to-b from-orange-400/20 to-orange-400/10 text-white/90 border border-orange-400/35 rounded-xl py-2 px-4 text-xs cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_3px_8px_rgba(0,0,0,0.5)] hover:bg-orange-400/35 hover:shadow-[0_0_25px_rgba(255,140,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              <InfoIcon />
              <span>Regles</span>
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-5 gap-2 sm:gap-2.5 bg-[radial-gradient(ellipse_at_center,#111b2b_0%,#080c14_100%)] p-4 sm:p-5 rounded-3xl w-full max-w-[480px] border border-white/[0.04] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.03),0_10px_30px_rgba(0,0,0,0.6),0_0_50px_rgba(255,140,0,0.06)] relative
            before:absolute before:inset-[-1px] before:rounded-[25px] before:p-[1px] before:bg-gradient-to-b before:from-orange-400/15 before:via-transparent before:to-orange-400/8 before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude] before:pointer-events-none">

            {Array.from({ length: CONFIG.TOTAL_CELLS }).map((_, i) => (
              <motion.div
                key={i}
                onClick={() => handleCellClick(i)}
                whileHover={!revealedCells[i] && !cellLoading[i] ? { scale: 1.04 } : {}}
                whileTap={!revealedCells[i] && !cellLoading[i] ? { scale: 0.96 } : {}}
                className={`
                  aspect-square rounded-2xl cursor-pointer flex items-center justify-center relative transition-all duration-300
                  shadow-[inset_3px_3px_8px_rgba(255,255,255,0.06),inset_-3px_-3px_8px_rgba(0,0,0,0.5),0_6px_16px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.04)]
                  before:absolute before:inset-[10%] before:rounded-xl before:bg-[radial-gradient(ellipse_at_35%_25%,rgba(255,255,255,0.18)_0%,transparent_55%)] before:mix-blend-overlay before:pointer-events-none
                  after:absolute after:inset-0 after:rounded-2xl after:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] after:pointer-events-none
                  ${revealedCells[i] || cellLoading[i] ? 'pointer-events-none' : ''}
                  ${cellLoading[i] ? 'opacity-60 animate-pulse' : ''}
                  ${revealedCells[i] ? '' : 'bg-gradient-to-br from-[#0e4455] via-[#063644] to-[#042430] hover:from-[#115a6e] hover:via-[#084a5c] hover:to-[#053340] hover:shadow-[inset_3px_3px_8px_rgba(255,255,255,0.08),inset_-3px_-3px_8px_rgba(0,0,0,0.5),0_10px_25px_rgba(0,180,220,0.35),0_1px_0_rgba(255,255,255,0.06)]'}
                  ${isPositive(i) ? '!bg-gradient-to-br !from-[#14b850] !via-[#0d8c3a] !to-[#0a6b2a] !shadow-[inset_3px_3px_8px_rgba(255,255,255,0.08),inset_-3px_-3px_8px_rgba(0,0,0,0.4),0_8px_22px_rgba(0,200,100,0.4),0_1px_0_rgba(255,255,255,0.06)] before:!bg-[radial-gradient(ellipse_at_35%_25%,rgba(255,255,255,0.22)_0%,transparent_55%)]' : ''}
                  ${isNegative(i) ? '!bg-gradient-to-br !from-[#d41515] !via-[#a01010] !to-[#7a0a0a] !shadow-[inset_3px_3px_8px_rgba(255,255,255,0.06),inset_-3px_-3px_8px_rgba(0,0,0,0.4),0_8px_22px_rgba(255,50,50,0.4),0_1px_0_rgba(255,255,255,0.04)] before:!bg-[radial-gradient(ellipse_at_35%_25%,rgba(255,255,255,0.15)_0%,transparent_55%)]' : ''}
                  ${isBonus(i) ? '!bg-gradient-to-br !from-[#f0c420] !via-[#c49a10] !to-[#a07808] !shadow-[inset_3px_3px_8px_rgba(255,255,255,0.15),inset_-3px_-3px_8px_rgba(0,0,0,0.35),0_8px_25px_rgba(255,210,0,0.55),0_1px_0_rgba(255,255,255,0.1)] before:!bg-[radial-gradient(ellipse_at_35%_25%,rgba(255,255,255,0.3)_0%,transparent_55%)]' : ''}
                `}
                style={{ transform: 'perspective(500px) rotateX(2deg)' }}
              >
                <span className={`relative z-[2] font-extrabold text-lg text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] transition-all duration-300 ${revealedCells[i] ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                  {getCellDisplay(i)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Betting Interface */}
        <AnimatePresence>
          {!showFuturistic && (
            <motion.div
              className="w-full max-w-[720px] bg-gradient-to-b from-[#111b2b] to-[#0c131f] rounded-3xl p-5 flex flex-col gap-4 shadow-[0_12px_35px_rgba(0,0,0,0.65),0_0_25px_rgba(255,140,0,0.3)] border border-orange-400/20 relative overflow-hidden
                before:absolute before:inset-0 before:rounded-3xl before:p-[1px] before:bg-gradient-to-br before:from-orange-400/20 before:via-transparent before:to-orange-400/10 before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude] before:pointer-events-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            >
              {/* Gains Row */}
              <div className="flex justify-between items-center bg-gradient-to-b from-[#0f1826] to-[#0a1018] rounded-2xl py-4 px-5 flex-wrap gap-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-2px_4px_rgba(0,0,0,0.3)] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center font-black text-2xl text-white shadow-[0_6px_16px_rgba(255,140,0,0.5),inset_0_-2px_4px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]" style={{ transform: 'perspective(300px) rotateX(5deg)' }}>
                    <PlusIcon />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-[0.3px]">Gains maximum</div>
                    <div className="font-extrabold text-lg text-orange-400 drop-shadow-[0_0_12px_rgba(255,179,71,0.4)]">{calculateMaxGains().toLocaleString()} XOF</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-gradient-to-b from-[#131f2e] to-[#0c131f] rounded-2xl py-2.5 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-3px_6px_rgba(0,0,0,0.4)] border border-white/[0.06]">
                  <button onClick={decreaseCases} disabled={casesToReveal <= 3} className="bg-transparent border-none text-orange-400 text-lg cursor-pointer px-2.5 py-1.5 disabled:text-gray-500 disabled:opacity-35 disabled:cursor-not-allowed hover:text-white hover:scale-125 transition-all duration-300">◀</button>
                  <span className="font-bold text-sm text-blue-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">{casesToReveal} cases</span>
                  <button onClick={increaseCases} disabled={casesToReveal >= 25} className="bg-transparent border-none text-orange-400 text-lg cursor-pointer px-2.5 py-1.5 disabled:text-gray-500 disabled:opacity-35 disabled:cursor-not-allowed hover:text-white hover:scale-125 transition-all duration-300">▶</button>
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center gap-2.5 justify-center flex-wrap">
                <button onClick={decreaseBet} disabled={currentBet <= 100} className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#1a2a3d] to-[#0f1927] text-gray-300 border border-white/[0.06] text-2xl font-bold cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_10px_rgba(0,0,0,0.5)] disabled:opacity-35 disabled:cursor-not-allowed hover:bg-gradient-to-b hover:from-[#263850] hover:to-[#162030] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(0,0,0,0.6)] active:translate-y-0 transition-all duration-300">−</button>
                <div className="text-2xl font-extrabold text-orange-400 w-[100px] text-center drop-shadow-[0_0_12px_rgba(255,179,71,0.4)]">{currentBet.toLocaleString()} XOF</div>
                <button onClick={increaseBet} disabled={currentBet >= 1000} className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#1a2a3d] to-[#0f1927] text-gray-300 border border-white/[0.06] text-2xl font-bold cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_10px_rgba(0,0,0,0.5)] disabled:opacity-35 disabled:cursor-not-allowed hover:bg-gradient-to-b hover:from-[#263850] hover:to-[#162030] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(0,0,0,0.6)] active:translate-y-0 transition-all duration-300">+</button>
                <button
                  onClick={startGame}
                  disabled={walletBalance < currentBet || actionPending || walletLoading}
                  className="flex-1 min-w-[120px] h-[50px] bg-gradient-to-b from-orange-400 to-orange-600 text-white border-none rounded-2xl font-extrabold text-base cursor-pointer uppercase tracking-[0.5px] shadow-[0_10px_25px_rgba(255,140,0,0.35),inset_0_-3px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] disabled:bg-gradient-to-b disabled:from-gray-500 disabled:to-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed disabled:shadow-md hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(255,140,0,0.5),inset_0_-3px_6px_rgba(0,0,0,0.2)] active:translate-y-0 transition-all duration-300 relative overflow-hidden
                  after:absolute after:top-0 after:-left-full after:w-[60%] after:h-full after:bg-gradient-to-r after:from-transparent after:via-white/25 after:to-transparent after:skew-x-[-25deg] after:transition-all after:duration-700 hover:after:left-[150%]"
                >
                  {actionPending ? '...' : 'Jouer'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Futuristic Interface */}
        <AnimatePresence>
          {showFuturistic && (
            <motion.div
              className="w-full max-w-[720px] flex flex-col gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between bg-gradient-to-b from-[#111b2b] to-[#0c131f] py-4 px-5 rounded-3xl flex-wrap gap-3.5 shadow-[0_12px_35px_rgba(0,0,0,0.65),0_0_25px_rgba(255,140,0,0.3)] border border-orange-400/20 relative overflow-hidden
                before:absolute before:inset-0 before:rounded-3xl before:p-[1px] before:bg-gradient-to-br before:from-orange-400/20 before:via-transparent before:to-orange-400/10 before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude] before:pointer-events-none">

                <div className="flex items-center gap-3">
                  <div className="w-[46px] h-[46px] rounded-xl bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center font-black text-3xl text-white shadow-[0_8px_20px_rgba(255,140,0,0.5),inset_0_-3px_6px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]" style={{ transform: 'perspective(400px) rotateX(6deg)' }}>
                    <PlusIcon />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-400 block font-semibold drop-shadow-[0_0_8px_rgba(44,245,141,0.3)]">Etape suivante</span>
                    <span className="font-extrabold text-xl block mt-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{calculateNextStep().toLocaleString()} XOF</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {revealedValues.map((val, i) => (
                    <div
                      key={i}
                      className={`py-2 px-4 rounded-xl font-bold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_3px_8px_rgba(0,0,0,0.5)] border transition-all duration-300 hover:-translate-y-0.5 ${
                        val >= initialBet * 3
                          ? 'text-yellow-400 bg-gradient-to-b from-[#3a3a1a] to-[#24240d] border-yellow-400/15 drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]'
                          : val > 0
                          ? 'text-emerald-400 bg-gradient-to-b from-[#1a3a2a] to-[#0d2418] border-emerald-400/15 drop-shadow-[0_0_8px_rgba(76,255,77,0.3)]'
                          : 'text-red-400 bg-gradient-to-b from-[#3a1a1a] to-[#240d0d] border-red-400/15 drop-shadow-[0_0_8px_rgba(255,77,79,0.3)]'
                      }`}
                    >
                      {val > 0 ? `+${val}` : val}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="flex items-center gap-4 bg-gradient-to-b from-[#0f1826] to-[#0a1018] rounded-3xl p-5 flex-wrap shadow-[0_12px_35px_rgba(0,0,0,0.65),0_0_25px_rgba(255,140,0,0.3)] border border-orange-400/20 relative overflow-hidden
                before:absolute before:inset-0 before:rounded-3xl before:p-[1px] before:bg-gradient-to-br before:from-orange-400/20 before:via-transparent before:to-orange-400/10 before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude] before:pointer-events-none">

                <div className="flex items-center gap-3.5 bg-gradient-to-b from-[#131f2e] to-[#0c131f] rounded-2xl py-4 px-5 flex-1 justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-4px_8px_rgba(0,0,0,0.4)] border border-white/[0.06]">
                  <div>
                    <span className="text-2xl font-extrabold block drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]">{initialBet.toLocaleString()} XOF</span>
                    <small className="text-xs text-gray-400 block mt-1.5 font-medium uppercase tracking-[0.3px]">Votre mise :</small>
                  </div>
                </div>

                <button
                  onClick={collectGains}
                  disabled={revealedCount < 2 || totalGains <= 0 || actionPending}
                  className="bg-gradient-to-b from-orange-400 to-orange-600 text-white border-none rounded-2xl py-4 px-7 font-extrabold cursor-pointer shadow-[0_10px_25px_rgba(255,140,0,0.4),inset_0_-3px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] disabled:bg-gradient-to-b disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-md hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(255,140,0,0.55)] active:translate-y-0 transition-all duration-300 flex flex-col items-center gap-1.5 min-w-[120px] relative overflow-hidden
                  after:absolute after:top-0 after:-left-full after:w-[60%] after:h-full after:bg-gradient-to-r after:from-transparent after:via-white/25 after:to-transparent after:skew-x-[-25deg] after:transition-all after:duration-700 hover:after:left-[150%]"
                >
                  <span className="text-2xl">{totalGains.toLocaleString()} XOF</span>
                  <span className="text-sm uppercase tracking-[0.5px]">{actionPending ? '...' : 'Encaisser'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}