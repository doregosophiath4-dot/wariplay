'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll, getWariToken, getCsrfToken, getClientId, getJwtToken } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

// =====================================================
// SVG ICONS
// =====================================================
const HeartIcon = ({ filled = true, className = "" }: { filled?: boolean; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" width="18" height="18">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
      fill={filled ? "#E53E3E" : "none"}
      stroke={filled ? "#E53E3E" : "#4A4A6A"}
      strokeWidth="1.5"
    />
  </svg>
)

const CoinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const LightningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

// =====================================================
// FONCTION D'EXTRACTION DU NOM BRUT DU JEU DEPUIS L'URL
// =====================================================
function extractRawGameNameFromUrl(url: string): string {
  let path = url

  if (path.startsWith('/')) {
    path = path.substring(1)
  }

  if (path.endsWith('/')) {
    path = path.slice(0, -1)
  }

  return path
}

// =====================================================
// FONCTION DE NORMALISATION POUR L'AFFICHAGE
// =====================================================
function normalizeGameNameForDisplay(rawName: string): string {
  if (!rawName || rawName.length === 0) {
    return 'Jeu Inconnu'
  }

  let displayName = rawName.replace(/_/g, ' ')
  displayName = displayName
    .split(' ')
    .map((word) => {
      if (word.length === 0) return ''
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
  displayName = displayName.trim()

  if (displayName.length === 0) {
    return 'Jeu Inconnu'
  }

  return displayName
}

// =====================================================
// FONCTION POUR OBTENIR LE HOST DYNAMIQUE
// ⚠️ Aucun fallback : ne doit être appelée que côté client (dans un useEffect)
// =====================================================
function getDynamicHost(): string {
  const protocol = window.location.protocol
  const host = window.location.host
  return `${protocol}//${host}`
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export default function GamePage() {
  useAuth()

  const pathname = usePathname()

  // Nom brut extrait de l'URL (ex: "falling_tiles") — utilisé pour le routing
  const rawGameName = extractRawGameNameFromUrl(pathname)

  // Host dynamique — null tant qu'il n'a pas été résolu côté client
  const [dynamicHost, setDynamicHost] = useState<string | null>(null)

  // États
  const [gameName, setGameName] = useState<string>('Chargement...')
  const [userName, setUserName] = useState<string>('Wari User')
  const [gameImageUrl, setGameImageUrl] = useState<string>('')
  const [dataLoaded, setDataLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)

  // ✅ Nom exact du jeu tel que renvoyé par le backend (game_row[0] -> clé "game_name"
  // dans la réponse de /api/game-info). C'est CE nom-là qui doit être envoyé
  // tel quel à /api/cherif, pas le slug d'URL.
  const [dbGameName, setDbGameName] = useState<string>('')

  const SOLDE_INITIAL = 30000
  const VIES_INITIALES = 3
  const MULTIPLICATEUR = 2

  const [solde, setSolde] = useState(SOLDE_INITIAL)
  const [vies, setVies] = useState(VIES_INITIALES)
  const [showPopup, setShowPopup] = useState(false)
  const [mise, setMise] = useState(100)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  // État pour l'iframe
  const [showGameIframe, setShowGameIframe] = useState(false)
  const [gameIframeUrl, setGameIframeUrl] = useState('')

  // Ref sur l'iframe du jeu
  const gameIframeRef = useRef<HTMLIFrameElement | null>(null)

  const [inputFocused, setInputFocused] = useState(false)
  const [imageError, setImageError] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const MISES_RAPIDES = [100, 500, 1000, 2500, 5000, 10000]
  const gainPotentiel = Math.floor(mise * MULTIPLICATEUR)

  // Initialiser le host dynamique côté client (obligatoire, pas de fallback)
  useEffect(() => {
    setDynamicHost(getDynamicHost())
  }, [])

  // =====================================================
  // CHARGEMENT DU SOLDE DU JOUEUR DEPUIS LE BACKEND
  // =====================================================
  useEffect(() => {
    let cancelled = false

    async function loadPlayerBalance() {
      try {
        await initAll()

        const response = await fetchWithAllTokens('/api/get_lettricide_solde', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          throw new Error('Erreur lors du chargement du solde')
        }

        const data = await response.json()

        if (cancelled) return

        if (data.error) {
          console.error('Erreur API solde:', data.error)
        } else {
          if (data.solde !== undefined) {
            setSolde(data.solde)
          }
        }
      } catch (error) {
        console.error('Erreur chargement solde:', error)
        // On garde le solde initial par défaut
      }
    }

    loadPlayerBalance()

    return () => {
      cancelled = true
    }
  }, [])

  // =====================================================
  // CHARGEMENT DES INFOS DU JEU DEPUIS LE BACKEND
  // (récupère aussi le nom exact en base -> dbGameName, via le champ "game_name")
  // =====================================================
  useEffect(() => {
    let cancelled = false

    async function loadGameInfo() {
      if (!rawGameName || rawGameName.length === 0) {
        setGameName('Jeu Inconnu')
        setDataLoaded(true)
        return
      }

      try {
        await initAll()

        const response = await fetchWithAllTokens('/api/game-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: rawGameName })
        })

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des informations du jeu')
        }

        const data = await response.json()

        if (cancelled) return

        if (data.error) {
          console.error('Erreur API:', data.error)
          setGameName(normalizeGameNameForDisplay(rawGameName))
          setGameImageUrl(`/img/${rawGameName}.png`)
          // Fallback : on utilise le slug d'URL si le backend n'a pas confirmé le jeu
          setDbGameName(rawGameName)
        } else {
          if (data.game_name) {
            setGameName(data.game_name)
          } else {
            setGameName(normalizeGameNameForDisplay(rawGameName))
          }

          if (data.user_name) {
            setUserName(data.user_name)
          }

          if (data.image_url) {
            setGameImageUrl(data.image_url)
          } else {
            setGameImageUrl(`/img/${rawGameName}.png`)
          }

          // ✅ CORRIGÉ : /api/game-info renvoie le nom exact de la base
          // sous la clé "game_name" (= game_row[0]), pas "name".
          // C'est ce champ qui sera envoyé tel quel à /api/cherif.
          if (data.game_name) {
            setDbGameName(data.game_name)
          } else {
            setDbGameName(rawGameName)
          }
        }

        setDataLoaded(true)
      } catch (error) {
        console.error('Erreur chargement jeu:', error)
        if (!cancelled) {
          setGameName(normalizeGameNameForDisplay(rawGameName))
          setGameImageUrl(`/img/${rawGameName}.png`)
          setDbGameName(rawGameName)
          setLoadError(true)
          setDataLoaded(true)
        }
      }
    }

    loadGameInfo()

    return () => {
      cancelled = true
    }
  }, [rawGameName])

  // =====================================================
  // CANVAS BACKGROUND
  // =====================================================
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

      // Vagues
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

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      // Particules
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

  // =====================================================
  // HANDLERS
  // =====================================================
  const openPopup = () => {
    setShowPopup(true)
    setSuccess(false)
    setConfirmError(null)
  }

  const closePopup = () => {
    if (confirmLoading) return // évite de fermer pendant l'appel réseau
    setShowPopup(false)
    setConfirmError(null)
  }

  const handleMiseChange = (val: number) => {
    const clamped = Math.max(100, Math.min(val, solde))
    setMise(clamped)
  }

  // =====================================================
  // CONFIRMATION DE LA MISE -> APPEL RÉEL À /api/cherif
  // =====================================================
  const handleConfirm = async () => {
    if (mise > solde || vies <= 0 || confirmLoading) return

    // Le host dynamique doit être résolu avant de pouvoir construire l'iframe
    if (!dynamicHost) {
      setConfirmError("Initialisation en cours, réessayez dans un instant.")
      return
    }

    if (!dbGameName) {
      setConfirmError("Impossible d'identifier le jeu, veuillez recharger la page.")
      return
    }

    setConfirmError(null)
    setConfirmLoading(true)

    try {
      await initAll()

      const response = await fetchWithAllTokens('/api/cherif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bet: mise,
          name: dbGameName // ✅ nom exact reçu du backend (game_name), envoyé tel quel
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setConfirmError(data.error || "Une erreur est survenue lors de la mise.")
        setConfirmLoading(false)
        return
      }

      if (!data.token) {
        setConfirmError("Le serveur n'a pas renvoyé de token de session valide.")
        setConfirmLoading(false)
        return
      }

      // ✅ Solde à jour renvoyé par le backend
      if (data.new_solde !== undefined) {
        setSolde(data.new_solde)
      }

      setConfirmLoading(false)
      setSuccess(true)

      // Construction de l'URL de l'iframe avec le token reçu
      // Format : http://host/games/<nom_du_jeu>/<token>
      // Construction de l'URL de l'iframe avec le token reçu, en query string
      // pour ne pas casser la résolution des assets statiques par Nginx
      const iframeUrl = `${dynamicHost}/games/${rawGameName}/?token=${encodeURIComponent(data.token)}`

      // Petite pause pour l'animation de succès avant de lancer le jeu
      setTimeout(() => {
        setGameIframeUrl(iframeUrl)
        setShowGameIframe(true)
        setShowPopup(false)
      }, 2000)

    } catch (error) {
      console.error('Erreur lors de la confirmation de mise:', error)
      setConfirmError("Erreur réseau, veuillez réessayer.")
      setConfirmLoading(false)
    }
  }

  // Fermer l'iframe et revenir à la page de mise
  const closeGameIframe = () => {
    setShowGameIframe(false)
    setGameIframeUrl('')
  }

  // =====================================================
  // INJECTION DES TOKENS DANS L'IFRAME DU JEU
  // =====================================================
  const handleGameIframeLoad = () => {
    const win = gameIframeRef.current?.contentWindow as (Window & {
      __TOKENS__?: {
        wari_tok: string | null
        csrf_token: string | null
        client_id: string | null
        jwt: string | null
      }
      __TOKENS_INJECTED__?: boolean
    }) | null | undefined

    if (win) {
      win.__TOKENS__ = {
        wari_tok: getWariToken(),
        csrf_token: getCsrfToken(),
        client_id: getClientId(),
        jwt: getJwtToken()
      }
      win.__TOKENS_INJECTED__ = true
    }
  }

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showGameIframe) {
          closeGameIframe()
        } else {
          closePopup()
        }
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [showGameIframe])

  // Formater en XOF
  const formatXOF = (n: number) => {
    return n.toLocaleString("fr-FR") + " XOF"
  }

  // =====================================================
  // RENDU DE L'IFRAME DU JEU
  // =====================================================
  if (showGameIframe && gameIframeUrl) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0a0a1a]">
        {/* Bouton pour fermer l'iframe */}
        <button
          onClick={closeGameIframe}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
        >
          <CloseIcon />
        </button>

        {/* Iframe du jeu */}
        <iframe
          ref={gameIframeRef}
          src={gameIframeUrl}
          className="w-full h-full border-none"
          title={gameName}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation"
          onLoad={handleGameIframeLoad}
        />
      </div>
    )
  }

  // =====================================================
  // RENDU PRINCIPAL
  // =====================================================
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden" style={{ background: '#0a0a1a' }}>
      
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
        style={{ opacity: 0.4 }}
      />

      {/* Orbs lumineux */}
      <div
        className="fixed w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full pointer-events-none z-0 -top-[15%] -right-[10%] animate-[float1_12s_ease-in-out_infinite]"
        style={{
          background: 'radial-gradient(circle, rgba(0,200,150,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />
      <div
        className="fixed w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] rounded-full pointer-events-none z-0 -bottom-[10%] -left-[5%] animate-[float2_15s_ease-in-out_infinite]"
        style={{
          background: 'radial-gradient(circle, rgba(108,92,231,0.05) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 py-8 pb-32 flex flex-col items-center justify-center min-h-screen">
        
        {/* Stats Header - Vies et Solde */}
        <motion.div
          className="flex items-center justify-center gap-4 sm:gap-5 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Vies */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-2">
            <div className="flex gap-1">
              {Array.from({ length: 3 }, (_, i) => (
                <HeartIcon
                  key={i}
                  filled={i < vies}
                  className={`w-4 h-4 ${i < vies ? '' : 'opacity-30'}`}
                />
              ))}
            </div>
            <span className="text-white/50 text-xs font-medium ml-1">{vies}/3</span>
          </div>

          {/* Solde */}
          <div className="flex items-center gap-2 bg-emerald-400/5 border border-emerald-400/20 rounded-full px-4 py-2">
            <span className="text-emerald-400">
              <CoinIcon />
            </span>
            <span className="text-emerald-400 text-xs font-bold">{formatXOF(solde)}</span>
          </div>
        </motion.div>

        {/* Titre du jeu */}
        <motion.h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center mb-2 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {dataLoaded ? gameName : (
            <span className="inline-block w-48 h-8 bg-white/[0.04] rounded-lg animate-pulse" />
          )}
        </motion.h1>

        {/* Joueur */}
        <motion.div
          className="flex items-center gap-2 mb-6 text-white/40 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <UserIcon />
          <span>Joueur : <span className="text-white/60 font-medium">{userName}</span></span>
        </motion.div>

        {/* Game Card */}
        <motion.div
          className="relative w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Glow */}
          <div className="absolute -inset-4 bg-emerald-400/5 rounded-3xl blur-2xl" />

          <div
            className="relative rounded-2xl overflow-hidden border border-emerald-400/10 shadow-[0_0_40px_rgba(0,200,150,0.08)]"
            style={{
              background: 'linear-gradient(160deg, rgba(26,26,46,0.85), rgba(22,33,62,0.75))'
            }}
          >
            {/* Game Image Preview */}
            <div className="relative h-48 sm:h-60 bg-gradient-to-br from-[#0d1117] to-[#13131A] flex items-center justify-center overflow-hidden">
              {dataLoaded && gameImageUrl && !imageError ? (
                <img
                  src={gameImageUrl}
                  alt={gameName}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : !dataLoaded ? (
                <div className="w-full h-full bg-white/[0.02] animate-pulse flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-white/30">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="text-sm">{gameName}</span>
                </div>
              )}
            </div>

            {/* Card Bottom */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-white/40 text-[10px] tracking-wide uppercase mb-1">Mise min.</p>
                  <p className="text-emerald-400 text-sm font-bold">100 XOF</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[10px] tracking-wide uppercase mb-1">Multiplicateur</p>
                  <div className="flex items-center gap-1 justify-end">
                    <LightningIcon />
                    <p className="text-white text-sm font-bold">x{MULTIPLICATEUR}</p>
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <button
                onClick={openPopup}
                disabled={vies === 0 || solde < 100}
                className="relative w-full overflow-hidden rounded-xl py-4 font-bold text-sm tracking-widest uppercase text-[#0a0a1a] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span className="relative flex items-center justify-center gap-2">
                  <PlayIcon />
                  {vies === 0 ? "Plus de vies" : solde < 100 ? "Solde insuffisant" : "Jouer maintenant"}
                </span>
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-3">
                <span className="text-emerald-400/50">
                  <ShieldIcon />
                </span>
                <span className="text-white/25 text-[10px]">Partie securisee · Token unique</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Popup de mise */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
          >
            <motion.div
              className="relative w-full max-w-sm rounded-3xl border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)'
              }}
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />

              {success ? (
                /* Vue succès - Redirection vers l'iframe */
                <div className="p-8 flex flex-col items-center text-center">
                  <motion.div
                    className="mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-400/10 border-2 border-emerald-400 flex items-center justify-center">
                      <span className="text-emerald-400">
                        <CheckCircleIcon />
                      </span>
                    </div>
                  </motion.div>
                  <h3 className="text-lg font-bold text-white mb-1">Mise confirmee !</h3>
                  <p className="text-white/40 text-sm mb-2">
                    <span className="text-emerald-400 font-bold">{formatXOF(mise)}</span> mises
                  </p>
                  <p className="text-white/30 text-xs mb-6">Lancement du jeu en cours...</p>
                  <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-400 to-purple-400 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'linear' }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Popup Header */}
                  <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <LightningIcon />
                      <span className="text-white text-sm font-bold tracking-wide">Placer une mise</span>
                    </div>
                    <button
                      onClick={closePopup}
                      className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all"
                    >
                      <CloseIcon />
                    </button>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Message d'erreur */}
                    {confirmError && (
                      <div className="flex items-start gap-2 bg-red-400/10 border border-red-400/30 rounded-xl p-3 text-red-400 text-xs">
                        <AlertIcon />
                        <span>{confirmError}</span>
                      </div>
                    )}

                    {/* Solde & Vies */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                        <p className="text-white/40 text-[10px] tracking-wide uppercase mb-2">Solde</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400">
                            <CoinIcon />
                          </span>
                          <span className="text-emerald-400 text-sm font-bold truncate">{formatXOF(solde)}</span>
                        </div>
                      </div>
                      <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                        <p className="text-white/40 text-[10px] tracking-wide uppercase mb-2">Vies</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 3 }, (_, i) => (
                            <HeartIcon key={i} filled={i < vies} className="w-5 h-5" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Montant */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-white/40 text-[10px] tracking-wide uppercase">Montant mise</label>
                        <span className="text-emerald-400 text-xs font-bold">{formatXOF(mise)}</span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <button
                          onClick={() => handleMiseChange(mise - 100)}
                          className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-white hover:border-emerald-400/30 transition-all active:scale-95"
                        >
                          <MinusIcon />
                        </button>
                        <div className={`flex-1 bg-white/[0.04] border rounded-xl px-4 py-2.5 transition-all ${inputFocused ? 'border-emerald-400/50' : 'border-white/[0.06]'}`}>
                          <input
                            type="number"
                            value={mise}
                            onChange={(e) => handleMiseChange(Number(e.target.value))}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            className="w-full bg-transparent text-white text-center text-sm font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <button
                          onClick={() => handleMiseChange(mise + 100)}
                          className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/60 hover:text-white hover:border-emerald-400/30 transition-all active:scale-95"
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      <input
                        type="range"
                        min={100}
                        max={solde}
                        step={100}
                        value={mise}
                        onChange={(e) => handleMiseChange(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none bg-white/[0.08] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-white/20 text-[10px]">100</span>
                        <span className="text-white/20 text-[10px]">{formatXOF(solde)}</span>
                      </div>
                    </div>

                    {/* Mises rapides */}
                    <div>
                      <p className="text-white/40 text-[10px] tracking-wide uppercase mb-2">Mises rapides</p>
                      <div className="flex flex-wrap gap-2">
                        {MISES_RAPIDES.filter((m) => m <= solde).map((m) => (
                          <button
                            key={m}
                            onClick={() => setMise(m)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all active:scale-95 ${mise === m ? 'bg-emerald-400/10 border-emerald-400/50 text-emerald-400' : 'bg-white/[0.04] border-white/[0.06] text-white/40 hover:border-emerald-400/20 hover:text-white/70'}`}
                          >
                            {m >= 1000 ? `${m / 1000}k` : m}
                          </button>
                        ))}
                        <button
                          onClick={() => setMise(solde)}
                          className="px-3 py-1.5 rounded-lg border border-red-400/30 bg-red-400/5 text-red-400 text-xs font-bold hover:bg-red-400/10 transition-all active:scale-95"
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    {/* Gain potentiel */}
                    <div className="bg-gradient-to-r from-emerald-400/5 to-transparent border border-emerald-400/15 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/40 text-[10px] tracking-wide uppercase mb-1">Gain potentiel</p>
                          <p className="text-emerald-400 text-xl font-bold">{formatXOF(gainPotentiel)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/40 text-[10px] tracking-wide uppercase mb-1">Multiplicateur</p>
                          <div className="flex items-center gap-1 justify-end">
                            <LightningIcon />
                            <p className="text-white text-xl font-bold">x{MULTIPLICATEUR}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bouton confirmer */}
                    <button
                      onClick={handleConfirm}
                      disabled={confirmLoading || mise < 100 || mise > solde || !dynamicHost || !dbGameName}
                      className="relative w-full overflow-hidden rounded-xl py-4 text-sm tracking-widest uppercase text-[#0a0a1a] font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30"
                    >
                      <span className="relative flex items-center justify-center gap-2">
                        {confirmLoading ? (
                          <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                            </svg>
                            Validation...
                          </>
                        ) : (
                          <>
                            <PlayIcon />
                            Confirmer {formatXOF(mise)}
                          </>
                        )}
                      </span>
                    </button>

                    <p className="text-white/20 text-[10px] text-center">
                      En jouant, vous acceptez les conditions d&apos;utilisation
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}