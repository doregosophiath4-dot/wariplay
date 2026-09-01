// components/ordre/OrdrePageClient.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll, prepareWSAuthMessage } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import {
  GamepadIcon,
  LayerIcon,
  PlayIcon,
  ClockSmallIcon as ClockIcon,
  CloseIcon,
  CoinsIcon,
  CheckCircleIcon,
  WarningIcon
} from '@/components/icons'
import Loading from '@/components/loading'
import NiveauCard from './NiveauCard'
import GameCard from './GameCard'
import OtherProductCard from './OtherProductCard'

// =====================================================
// CONSTANTES STATIQUES (hors du composant)
// =====================================================
const CATEGORIES = [
  { name: 'sport', label: 'Sport' },
  { name: 'art', label: 'Art' },
  { name: 'histoire', label: 'Histoire' },
  { name: 'musique', label: 'Musique' },
  { name: 'litterature', label: 'Litterature' },
  { name: 'science', label: 'Science' },
  { name: 'geographie', label: 'Geographie' },
  { name: 'cinema', label: 'Cinema' },
  { name: 'cuisine', label: 'Cuisine' },
  { name: 'politique', label: 'Politique' },
  { name: 'monde', label: 'Monde' }
]

// =====================================================
// FONCTIONS UTILITAIRES (hors du composant)
// =====================================================
function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return 'Termine'
  
  // ✅ Arrondir les secondes pour éviter les décimales
  const totalSeconds = Math.floor(seconds)
  
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  
  const parts = []
  if (days > 0) parts.push(`${days}j`)
  if (hours > 0) parts.push(`${hours}h`)
  if (mins > 0) parts.push(`${mins}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
  
  return parts.join(' ')
}

function createSlug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').replace(/^_|_$/g, '')
}

// =====================================================
// DYNAMIC IMPORT DU GAME OVERLAY
// =====================================================
const GameSessionOverlay = dynamic(
  () => import('@/components/ordre/GameSessionOverlay'),
  {
    ssr: false,
    loading: () => null,
  }
)

// =====================================================
// TYPES
// =====================================================
interface NiveauData {
  niveau: number
  benefice: number
  taux: string
  vies: number
  niveauSuivant: number | string
  dureeTexte: string
  renouvellementTotalSeconds: number
  renouvellementRemaining: number
  renouvellementFin: number
}

interface GameData {
  id: number
  product_name: string
  image_url: string
  vies: number
  end_timestamp: number
  renewal_timestamp: number | null
  slug: string
}

interface OtherProductData {
  id: number
  product_name: string
  image_url: string
  expires_at: string | null
  slug: string
}

interface GameMessage {
  action: string
  niveau?: number
  categorie?: string
  reponse?: boolean
  token?: string
  timestamp?: number
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export default function OrdrePageClient() {
  useAuth()
  const router = useRouter()
  
  // =====================================================
  // STATE
  // =====================================================
  const [now, setNow] = useState(() => Date.now())
  const [niveaux, setNiveaux] = useState<NiveauData[]>([])
  const [games, setGames] = useState<GameData[]>([])
  const [gameRefreshInterval, setGameRefreshInterval] = useState<number>(60)
  const [otherProducts, setOtherProducts] = useState<OtherProductData[]>([])
  const [showGameOverlay, setShowGameOverlay] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentNiveau, setCurrentNiveau] = useState<number>(0)
  const [questionActive, setQuestionActive] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [points, setPoints] = useState(0)
  const [lives, setLives] = useState(0)
  const [gain, setGain] = useState(0)
  const [gainUnitaire, setGainUnitaire] = useState(0)
  const [timer, setTimer] = useState(13)
  const [gameOver, setGameOver] = useState(false)
  const [showContinue, setShowContinue] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState({ title: '', message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' })
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState<'good' | 'bad' | 'timeout'>('good')
  const [showLoader, setShowLoader] = useState(true)
  const [loaderText, setLoaderText] = useState('Chargement en cours...')
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // =====================================================
  // REFS
  // =====================================================
  const wsRef = useRef<WebSocket | null>(null)
  const wsTokenRef = useRef<string | null>(null)
  const wsTimestampRef = useRef<number | null>(null)
  const pendingResolveRef = useRef<((data: any) => void) | null>(null)
  const pendingRejectRef = useRef<((err: any) => void) | null>(null)
  const wsReadyRef = useRef<boolean>(false)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const gameRefreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // =====================================================
  // FONCTIONS DE CHARGEMENT (SANS initAll)
  // =====================================================
  const loadNiveaux = useCallback(async () => {
    try {
      const [niveauxRes, tempsRes] = await Promise.all([
        fetchWithAllTokens('/api/niveaux-utilisateur'),
        fetchWithAllTokens('/api/temps-restant')
      ])
      if (!niveauxRes.ok || !tempsRes.ok) throw new Error('Erreur')
      const niveauxResponse = await niveauxRes.json()
      const tempsResponse = await tempsRes.json()
      if (!niveauxResponse.success) throw new Error('Donnees invalides')
      const niveauxList = Array.isArray(niveauxResponse.data) ? niveauxResponse.data : []
      const tempsList = Array.isArray(tempsResponse) ? tempsResponse : []
      const tempsMap: Record<number, any> = {}
      tempsList.forEach((item: any) => {
        if (item && item.niveau) tempsMap[item.niveau] = item
      })
      setNiveaux(niveauxList.map((n: any, i: number) => {
        const td = tempsMap[n.niveau] || {}
        const dureeRs = td.remaining_seconds || td.temps_restant_seconds || 0
        const renouvellementRemaining = td.remaining_seconds || 0
        const renouvellementFin = Date.now() / 1000 + renouvellementRemaining
        return {
          niveau: n.niveau,
          benefice: n.benefice || 0,
          taux: n.taux || '0/j',
          vies: n.vies || 0,
          niveauSuivant: i + 2 <= niveauxList.length ? i + 2 : '-',
          dureeTexte: td.temps_restant || formatRemainingTime(dureeRs),
          renouvellementRemaining: renouvellementRemaining,
          renouvellementFin: renouvellementFin,
          renouvellementTotalSeconds: td.total_seconds || 86400
        }
      }))
    } catch {
      showCustomPopup('Erreur', 'Impossible de charger les niveaux.', 'error')
    }
  }, [])

  // ✅ CORRIGÉ : loadRenouvellement ne crée des nouveaux objets que si les valeurs ont changé
  const loadRenouvellement = useCallback(async () => {
    try {
      const r = await fetchWithAllTokens('/api/renouvellement-temps')
      if (!r.ok) return
      const d = await r.json()
      if (!Array.isArray(d)) return
      
      setNiveaux(prev => prev.map(n => {
        const item = d.find((x: any) => x.niveau === n.niveau)
        if (!item) return n

        const newRemaining = item.remaining_seconds || 0
        const newTotal = item.total_seconds || 86400
        const newRenouvellementFin = Date.now() / 1000 + newRemaining

        // ✅ Si rien n'a changé, retourne l'objet EXISTANT (même référence)
        if (
          n.renouvellementRemaining === newRemaining &&
          n.renouvellementTotalSeconds === newTotal
        ) {
          return n
        }

        // ✅ Seulement si une valeur a réellement changé, on crée un nouvel objet
        return {
          ...n,
          renouvellementRemaining: newRemaining,
          renouvellementTotalSeconds: newTotal,
          renouvellementFin: newRenouvellementFin
        }
      }))
    } catch {}
  }, [])

  const loadGames = useCallback(async () => {
    try {
      const r = await fetchWithAllTokens('/api/game-settings')
      if (!r || !r.ok) return
      const d = await r.json()
      if (!d.success) return
      setGames((d.games || []).map((g: any) => ({
        id: g.id,
        product_name: g.product_name,
        image_url: g.image_url || '/img/WariPlay_Logo_Transparent.png',
        vies: g.vies || 0,
        end_timestamp: g.end_timestamp || 0,
        renewal_timestamp: g.renewal_timestamp || null,
        slug: createSlug(g.product_name)
      })))
      setGameRefreshInterval(d.refresh_interval || 60)
    } catch {}
  }, [])

  const loadOtherProducts = useCallback(async () => {
    try {
      const r = await fetchWithAllTokens('/api/get-other-products')
      if (!r || !r.ok) return
      const p = await r.json()
      if (!Array.isArray(p)) return
      setOtherProducts(p.map((x: any) => ({
        id: x.id,
        product_name: x.product_name,
        image_url: x.image_url || '/img/WariPlay_Logo_Transparent.png',
        expires_at: x.expires_at || null,
        slug: createSlug(x.product_name)
      })))
    } catch {}
  }, [])

  // =====================================================
  // FONCTIONS D'AFFICHAGE
  // =====================================================
  const showCustomPopup = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setPopupData({ title, message, type })
    setShowPopup(true)
  }, [])

  const showFeedbackMessage = useCallback((message: string, type: 'good' | 'bad' | 'timeout') => {
    setFeedbackMessage(message)
    setFeedbackType(type)
    setShowFeedbackPopup(true)
    setTimeout(() => setShowFeedbackPopup(false), 2000)
  }, [])

  // =====================================================
  // INITIALISATION - initAll() appelé UNE SEULE FOIS
  // =====================================================
  useEffect(() => {
    let cancelled = false

    async function init() {
      setShowLoader(true)
      try {
        // ✅ initAll() une seule fois, avant tout le reste
        await initAll()
        
        // Puis on charge toutes les données en parallèle
        await Promise.all([loadNiveaux(), loadGames(), loadOtherProducts()])
        await loadRenouvellement()
      } catch (err) {
        console.error('Erreur d\'initialisation:', err)
      } finally {
        if (!cancelled) setShowLoader(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [loadNiveaux, loadGames, loadOtherProducts, loadRenouvellement])

  // =====================================================
  // REFRESH DES JEUX - pas de initAll() ici non plus
  // =====================================================
  useEffect(() => {
    if (gameRefreshTimeoutRef.current) clearTimeout(gameRefreshTimeoutRef.current)
    if (gameRefreshInterval > 0) {
      gameRefreshTimeoutRef.current = setTimeout(() => {
        loadGames()
      }, gameRefreshInterval * 1000)
    }
    return () => {
      if (gameRefreshTimeoutRef.current) clearTimeout(gameRefreshTimeoutRef.current)
    }
  }, [games, gameRefreshInterval, loadGames])

  // =====================================================
  // RENOUVELLEMENT (fetch toutes les 30s)
  // =====================================================
  useEffect(() => {
    const iv = setInterval(() => {
      loadRenouvellement()
    }, 30000)
    return () => clearInterval(iv)
  }, [loadRenouvellement])

  // =====================================================
  // HORLOGE UNIQUE - UN SEUL setInterval pour toute la page
  // =====================================================
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  // =====================================================
  // WEBSOCKET - avec cleanup au démontage
  // =====================================================
  const closeWebSocket = useCallback(() => {
    wsReadyRef.current = false
    pendingResolveRef.current = null
    pendingRejectRef.current = null
    if (wsRef.current) {
      // ✅ Envoyer un message d'abandon si la socket est ouverte
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ action: 'quit' }))
        }
      } catch (_) {
        // Ignorer les erreurs d'envoi
      }
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  // ✅ CLEANUP AU DÉMONTAGE : ferme la socket si le composant est démonté
  useEffect(() => {
    return () => {
      closeWebSocket()
    }
  }, [closeWebSocket])

  const openWebSocket = useCallback((): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (wsRef.current && wsReadyRef.current) {
        resolve()
        return
      }
      closeWebSocket()
      const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
      const ws = new WebSocket(proto + window.location.host + '/ws/wari-level')
      wsRef.current = ws
      const t = setTimeout(() => {
        closeWebSocket()
        reject(new Error('Timeout'))
      }, 10000)
      ws.onopen = async () => {
        const am = await prepareWSAuthMessage()
        ws.send(JSON.stringify(am))
      }
      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data)
          if (d.type === 'auth_success') {
            clearTimeout(t)
            wsReadyRef.current = true
            resolve()
            return
          }
          if (pendingResolveRef.current) {
            const rf = pendingResolveRef.current
            pendingResolveRef.current = null
            pendingRejectRef.current = null
            rf(d)
          }
        } catch (er) {
          clearTimeout(t)
          reject(er)
        }
      }
      ws.onerror = () => {
        clearTimeout(t)
        closeWebSocket()
        reject(new Error('Erreur WS'))
      }
      ws.onclose = () => {
        wsReadyRef.current = false
        wsRef.current = null
        if (pendingRejectRef.current) {
          pendingRejectRef.current(new Error('WS ferme'))
          pendingResolveRef.current = null
          pendingRejectRef.current = null
        }
      }
    })
  }, [closeWebSocket])

  const sendWebSocketMessage = useCallback(async (msg: GameMessage): Promise<any> => {
    await openWebSocket()
    return new Promise((resolve, reject) => {
      if (!wsRef.current || !wsReadyRef.current) {
        reject(new Error('Non connecte'))
        return
      }
      const t = setTimeout(() => {
        pendingResolveRef.current = null
        pendingRejectRef.current = null
        reject(new Error('Timeout'))
      }, 10000)
      pendingResolveRef.current = (d) => {
        clearTimeout(t)
        resolve(d)
      }
      pendingRejectRef.current = (er) => {
        clearTimeout(t)
        reject(er)
      }
      wsRef.current.send(JSON.stringify(msg))
    })
  }, [openWebSocket])

  // =====================================================
  // LOGIQUE DE JEU
  // =====================================================
  const clearTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (timerTimeoutRef.current) {
      clearTimeout(timerTimeoutRef.current)
      timerTimeoutRef.current = null
    }
  }, [])

  const endGameSession = useCallback(() => {
    clearTimers()
    closeWebSocket()
    setGameStarted(false)
    setShowGameOverlay(false)
    setSelectedCategory('')
    setCurrentNiveau(0)
    setPoints(0)
    setLives(0)
    setGain(0)
    setGainUnitaire(0)
    setCurrentQuestion('')
    setQuestionActive(false)
    setGameOver(false)
    setShowContinue(false)
    wsTokenRef.current = null
    wsTimestampRef.current = null
  }, [clearTimers, closeWebSocket])

  const startTimer = useCallback((s: number) => {
    clearTimers()
    let time = s
    setTimer(time)
    timerIntervalRef.current = setInterval(() => {
      time--
      setTimer(time)
      if (time <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
        handleTimeout()
      }
    }, 1000)
    timerTimeoutRef.current = setTimeout(() => handleTimeout(), s * 1000)
  }, [clearTimers])

  const handleTimeout = useCallback(async () => {
    if (!questionActive) return
    setQuestionActive(false)
    clearTimers()
    showFeedbackMessage('TEMPS ECOULE !', 'timeout')
    try {
      const r = await sendWebSocketMessage({
        action: 'answer',
        reponse: false,
        categorie: selectedCategory,
        token: wsTokenRef.current || '',
        timestamp: wsTimestampRef.current || 0
      })
      if (r && r.fin) {
        setGain(r.gainTotal || gain)
        showFeedbackMessage(`PARTIE TERMINEE ! Gain: ${(r.gainTotal || gain).toFixed(2)} FCFA`, 'good')
        setTimeout(() => endGameSession(), 2500)
        return
      }
      if (r) {
        if (r.vies !== undefined) setLives(r.vies)
        if (r.gainTotal !== undefined) setGain(r.gainTotal)
        if (r.question) {
          setCurrentQuestion(r.question)
          setQuestionActive(true)
          setShowContinue(false)
          startTimer(r.temps || 13)
          return
        }
      }
      setShowContinue(true)
    } catch {
      setShowContinue(true)
    }
  }, [questionActive, selectedCategory, gain, sendWebSocketMessage, clearTimers, endGameSession, startTimer])

  const getNextQuestion = useCallback(async (cat: string) => {
    if (lives <= 0) {
      showFeedbackMessage(`PARTIE TERMINEE ! Gain: ${gain.toFixed(2)} FCFA`, 'good')
      setTimeout(() => endGameSession(), 2500)
      return
    }
    try {
      const r = await sendWebSocketMessage({
        action: 'get_question',
        categorie: cat,
        token: wsTokenRef.current || '',
        timestamp: wsTimestampRef.current || 0
      })
      if (r.fin) {
        setGain(r.gainTotal || gain)
        showFeedbackMessage(`PARTIE TERMINEE ! Gain: ${(r.gainTotal || gain).toFixed(2)} FCFA`, 'good')
        setTimeout(() => endGameSession(), 2500)
        return
      }
      if (!r.question) {
        showCustomPopup('Info', 'Aucune question', 'info')
        endGameSession()
        return
      }
      setCurrentQuestion(r.question)
      setQuestionActive(true)
      setShowContinue(false)
      startTimer(r.temps || 13)
    } catch {
      showCustomPopup('Erreur', 'Erreur chargement', 'error')
      endGameSession()
    }
  }, [lives, gain, sendWebSocketMessage, endGameSession, startTimer])

  const startGame = useCallback(async (cat: string) => {
    setSelectedCategory(cat)
    try {
      const r = await sendWebSocketMessage({
        action: 'start_game',
        niveau: currentNiveau
      })
      if (!r || !r.success) {
        showCustomPopup('Erreur', r?.message || 'Impossible', 'error')
        endGameSession()
        return
      }
      setGainUnitaire(r.gainUnitaire || 0)
      setLives(r.vies || 3)
      setGain(0)
      setPoints(0)
      wsTokenRef.current = r.token || null
      wsTimestampRef.current = r.timestamp || null
      setGameStarted(true)
      await getNextQuestion(cat)
    } catch {
      showCustomPopup('Erreur', 'Erreur demarrage', 'error')
      endGameSession()
    }
  }, [currentNiveau, sendWebSocketMessage, endGameSession, getNextQuestion])

  const handleAnswer = useCallback(async (rep: boolean) => {
    if (!questionActive) return
    setQuestionActive(false)
    clearTimers()
    try {
      const r = await sendWebSocketMessage({
        action: 'answer',
        reponse: rep,
        categorie: selectedCategory,
        token: wsTokenRef.current || '',
        timestamp: wsTimestampRef.current || 0
      })
      if (r.fin) {
        setGain(r.gainTotal || gain)
        showFeedbackMessage(`PARTIE TERMINEE ! Gain: ${(r.gainTotal || gain).toFixed(2)} FCFA`, 'good')
        setTimeout(() => endGameSession(), 2500)
        return
      }
      if (r.correct === true) {
        showFeedbackMessage(`BONNE REPONSE ! +${gainUnitaire.toFixed(2)} FCFA`, 'good')
        setPoints(p => p + 1)
      } else if (r.correct === false) {
        showFeedbackMessage('MAUVAISE REPONSE !', 'bad')
      }
      if (r.gainTotal !== undefined) setGain(r.gainTotal)
      if (r.vies !== undefined) setLives(r.vies)
      if (r.question) {
        setCurrentQuestion(r.question)
        setQuestionActive(true)
        setShowContinue(false)
        startTimer(r.temps || 13)
      } else {
        setShowContinue(true)
      }
    } catch {
      showFeedbackMessage('ERREUR', 'bad')
      setShowContinue(true)
    }
  }, [questionActive, selectedCategory, gain, gainUnitaire, sendWebSocketMessage, clearTimers, endGameSession, startTimer])

  const handleContinue = useCallback(() => {
    if (lives <= 0) {
      showFeedbackMessage(`PARTIE TERMINEE ! Gain: ${gain.toFixed(2)} FCFA`, 'good')
      setTimeout(() => endGameSession(), 2500)
      return
    }
    getNextQuestion(selectedCategory)
  }, [lives, gain, endGameSession, getNextQuestion, selectedCategory])

  const openGameOverlay = useCallback((n: number, v: number, b: number) => {
    setCurrentNiveau(n)
    setLives(v)
    setGain(b)
    setShowGameOverlay(true)
    setGameStarted(false)
    setPoints(0)
    setShowContinue(false)
    setGameOver(false)
  }, [])

  const closeGame = useCallback(() => {
    setPopupData({
      title: 'Quitter le jeu',
      message: 'Voulez-vous vraiment quitter ? Votre progression sera perdue.',
      type: 'warning'
    })
    setShowPopup(true)
  }, [])

  const confirmCloseGame = useCallback(() => {
    endGameSession()
    setShowPopup(false)
  }, [endGameSession])

  const handlePlayGame = useCallback((slug: string) => {
    if (window.location.pathname.includes(slug)) return
    router.push(`/${slug}1`)
  }, [router])

  // =====================================================
  // RENDU
  // =====================================================
  const nowSeconds = now / 1000

  return (
    <>
      {/* ============================================ */}
      {/* LOADER - Composant partagé */}
      {/* ============================================ */}
      <Loading show={showLoader} text={loaderText} />

      {/* ============================================ */}
      {/* NIVEAUX */}
      {/* ============================================ */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5 text-emerald-400">
          <LayerIcon /> Mes Niveaux
        </h1>
      </div>
      {niveaux.length === 0 && !showLoader ? (
        <div className="text-center py-12 text-white/50">Aucun niveau disponible</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {niveaux.map((niveau) => {
            const renouvellementRemaining = Math.max(0, niveau.renouvellementFin - nowSeconds)
            return (
              <NiveauCard
                key={niveau.niveau}
                niveau={{
                  ...niveau,
                  renouvellementRemaining
                }}
                onPlay={openGameOverlay}
              />
            )
          })}
        </div>
      )}

      {/* ============================================ */}
      {/* JEUX ACTIFS */}
      {/* ============================================ */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5 text-emerald-400">
          <GamepadIcon /> Vos Jeux Actifs
        </h1>
      </div>
      {games.length === 0 && !showLoader ? (
        <div className="text-center py-12 text-white/50">Aucun jeu disponible</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {games.map((game) => {
            const remaining = Math.max(0, game.end_timestamp - nowSeconds)
            const renewalRemaining = game.renewal_timestamp ? Math.max(0, game.renewal_timestamp - nowSeconds) : 0
            return (
              <GameCard
                key={game.id}
                game={game}
                remaining={remaining}
                renewalRemaining={renewalRemaining}
                onPlay={handlePlayGame}
              />
            )
          })}
        </div>
      )}

      {/* ============================================ */}
      {/* AUTRES PRODUITS */}
      {/* ============================================ */}
      {otherProducts.length > 0 && (
        <>
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5 text-emerald-400">
              <CoinsIcon /> Autres Produits
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherProducts.map((product) => {
              const remaining = product.expires_at
                ? Math.max(0, new Date(product.expires_at).getTime() - now)
                : 0
              return (
                <OtherProductCard
                  key={product.id}
                  product={product}
                  remaining={remaining}
                />
              )
            })}
          </div>
        </>
      )}

      {/* ============================================ */}
      {/* GAME OVERLAY - Chargé dynamiquement */}
      {/* ============================================ */}
      <AnimatePresence>
        {showGameOverlay && (
          <GameSessionOverlay
            gameStarted={gameStarted}
            selectedCategory={selectedCategory}
            currentQuestion={currentQuestion}
            points={points}
            lives={lives}
            gain={gain}
            timer={timer}
            questionActive={questionActive}
            showContinue={showContinue}
            gameOver={gameOver}
            categories={CATEGORIES}
            onStartGame={startGame}
            onAnswer={handleAnswer}
            onContinue={handleContinue}
            onClose={closeGame}
            onRestart={() => setGameStarted(false)}
          />
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* POPUP */}
      {/* ============================================ */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 bg-[#0a0a1a]/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4" onClick={() => setShowPopup(false)}>
            <motion.div
              className="relative w-full max-w-[400px] rounded-2xl p-6 text-center border border-orange-500/20 shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
              style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e)' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-0.5 rounded bg-gradient-to-r from-orange-500 to-emerald-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-white mb-3">{popupData.title}</h2>
              <p className="text-white/60 text-sm mb-5">{popupData.message}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={popupData.title === 'Quitter le jeu' ? confirmCloseGame : () => setShowPopup(false)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm uppercase shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-6 py-2.5 rounded-full bg-white/[0.05] border border-white/10 text-white/70 font-semibold text-sm hover:bg-white/[0.1] transition-all"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* FEEDBACK POPUP */}
      {/* ============================================ */}
      <AnimatePresence>
        {showFeedbackPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-[10001] pointer-events-none">
            <motion.div
              className={`px-8 py-5 rounded-2xl text-2xl sm:text-3xl font-bold text-white shadow-2xl border-4 ${
                feedbackType === 'good'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-700'
                  : feedbackType === 'bad'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-700'
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-700'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              {feedbackMessage}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* STATUS MESSAGE */}
      {/* ============================================ */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            className={`fixed top-5 right-5 z-[10000] px-5 py-3.5 rounded-full font-semibold text-sm flex items-center gap-2.5 shadow-xl backdrop-blur-xl ${
              statusMessage.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {statusMessage.type === 'success' ? <CheckCircleIcon /> : <WarningIcon />}
            {statusMessage.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}