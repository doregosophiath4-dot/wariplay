'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

// =====================================================
// SVG ICONS
// =====================================================
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const StoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
    <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
  </svg>
)

const GamepadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="6" y1="11" x2="10" y2="11" />
    <line x1="8" y1="9" x2="8" y2="13" />
    <line x1="15" y1="12" x2="15.01" y2="12" />
    <line x1="18" y1="10" x2="18.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
)

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)

const HistoryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const CreditCardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const MoneyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const PaperPlaneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const WifiIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const SpinnerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

// =====================================================
// TYPES
// =====================================================
interface PaymentMethod {
  id: string
  name: string
  image: string
}

interface CountryOperator {
  country: string
  flag: string
  operators: string[]
}

export default function DepotPage() {
  useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [showAmountOverlay, setShowAmountOverlay] = useState(false)
  const [showSebpayOverlay, setShowSebpayOverlay] = useState(false)
  const [showPhoneField, setShowPhoneField] = useState(false)
  const [amount, setAmount] = useState<number | ''>('')
  const [sebpayAmount, setSebpayAmount] = useState<number | ''>('')
  const [phone, setPhone] = useState('')
  const [sebpayPhone, setSebpayPhone] = useState('')
  const [sebpayOperator, setSebpayOperator] = useState('')
  const [sebpayCountry, setSebpayCountry] = useState('')
  const [showLoading, setShowLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Chargement en cours...')
  const [showAlert, setShowAlert] = useState(false)
  const [alertData, setAlertData] = useState({ message: '', type: 'info' as 'success' | 'error' | 'info' })
  const [activeAmount, setActiveAmount] = useState<number | null>(null)
  const [sebpayActiveAmount, setSebpayActiveAmount] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const navItems = [
    { href: '/home', icon: <HomeIcon />, label: 'Home' },
    { href: '/target', icon: <TargetIcon />, label: 'Target' },
    { href: '/ordre', icon: <ListIcon />, label: 'Ordre' },
    { href: '/profile', icon: <UserIcon />, label: 'Profil' },
    { href: '/store', icon: <StoreIcon />, label: 'Wari Store' },
    { href: '/Game', icon: <GamepadIcon />, label: 'Games' },
    { href: '/stats', icon: <ChartIcon />, label: 'Stats' },
    { href: '/parametre', icon: <SettingsIcon />, label: 'Parametres' }
  ]

  const paymentMethods: PaymentMethod[] = [
    { id: 'fedapay', name: 'FedaPay', image: '/img/feda.png' },
    { id: 'sebpay', name: 'SebPay', image: '/img/sebpay.png' }
  ]

  // =====================================================
  // OPERATEURS SEBPAY CLASSES PAR PAYS
  // =====================================================
  const sebpayCountries: CountryOperator[] = [
    {
      country: 'Benin',
      flag: '🇧🇯',
      operators: ['MTN Money', 'Moov Money', 'Celtiis Money', 'Free Money']
    },
    {
      country: 'Burkina Faso',
      flag: '🇧🇫',
      operators: ['Orange Money', 'Moov Money', 'Free Money']
    },
    {
      country: 'Cote d\'Ivoire',
      flag: '🇨🇮',
      operators: ['Orange Money', 'MTN Money', 'Moov Money', 'Wave Money']
    },
    {
      country: 'Senegal',
      flag: '🇸🇳',
      operators: ['Orange Money', 'Free Money', 'Wave Money', 'E-money']
    },
    {
      country: 'Cameroun',
      flag: '🇨🇲',
      operators: ['Orange Money', 'MTN Money']
    },
    {
      country: 'Congo Brazzaville',
      flag: '🇨🇬',
      operators: ['MTN Money', 'Airtel Money']
    },
    {
      country: 'Gabon',
      flag: '🇬🇦',
      operators: ['Airtel Money', 'Moov Money']
    }
  ]

  const amountPresets = [1000, 2000, 5000, 10000, 20000, 50000]

  // =====================================================
  // CHARGEMENT DU SOLDE
  // =====================================================
  useEffect(() => {
    let cancelled = false

    async function loadBalance() {
      try {
        await initAll()
        const res = await fetchWithAllTokens('/api/get_lettricide_solde')
        if (res.ok && !cancelled) {
          const data = await res.json()
          if (data && data.solde !== undefined) {
            setBalance(Number(data.solde).toLocaleString('fr-FR') + ' FCFA')
          }
        }
      } catch (error) {
        // Silencieux
      }
    }

    loadBalance()
    return () => { cancelled = true }
  }, [])

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

  // =====================================================
  // FONCTIONS
  // =====================================================
  const selectMethod = (methodId: string) => {
    setSelectedMethod(methodId)
    if (methodId === 'sebpay') {
      setShowSebpayOverlay(true)
      setSebpayAmount('')
      setSebpayPhone('')
      setSebpayOperator('')
      setSebpayCountry('')
      setSebpayActiveAmount(null)
    } else {
      setShowAmountOverlay(true)
      setShowPhoneField(methodId !== 'fedapay')
    }
  }

  const setAmountPreset = (value: number) => {
    setAmount(value)
    setActiveAmount(value)
  }

  const setSebpayAmountPreset = (value: number) => {
    setSebpayAmount(value)
    setSebpayActiveAmount(value)
  }

  const hideAmountOverlay = () => {
    setShowAmountOverlay(false)
    setSelectedMethod(null)
    setAmount('')
    setPhone('')
    setActiveAmount(null)
    setShowPhoneField(false)
  }

  const hideSebpayOverlay = () => {
    setShowSebpayOverlay(false)
    setSelectedMethod(null)
    setSebpayAmount('')
    setSebpayPhone('')
    setSebpayOperator('')
    setSebpayCountry('')
    setSebpayActiveAmount(null)
  }

  const showCustomAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertData({ message, type })
    setShowAlert(true)
  }

  const getMethodName = (methodId: string): string => {
    return paymentMethods.find(m => m.id === methodId)?.name || 'Inconnu'
  }

  // =====================================================
  // HANDLER FEDAPAY
  // =====================================================
  const handleShowConfirmation = async () => {
    if (!amount || Number(amount) < 1000) {
      showCustomAlert('Montant minimum : 1 000 FCFA', 'error')
      return
    }

    if (selectedMethod === 'fedapay') {
      setShowLoading(true)
      setLoadingText('Creation de la transaction...')

      try {
        const res = await fetchWithAllTokens('/api/create-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Number(amount) })
        })
        const data = await res.json()
        setShowLoading(false)

        if (data && data.status === 'success') {
          if (data.payment_url) {
            hideAmountOverlay()
            window.location.href = data.payment_url
          } else if (data.payment_token) {
            hideAmountOverlay()
            if (typeof window !== 'undefined' && (window as any).FedaPay) {
              (window as any).FedaPay.setPublicKey('pk_live_U1Ww9cFUgqkTEHl30s9leDQN')
              ;(window as any).FedaPay.checkout({ token: data.payment_token })
            } else {
              showCustomAlert('FedaPay non disponible.', 'error')
            }
          } else {
            showCustomAlert('Transaction creee avec succes', 'success')
            hideAmountOverlay()
          }
        } else {
          showCustomAlert(data?.message || 'Erreur transaction', 'error')
        }
      } catch (error) {
        setShowLoading(false)
        showCustomAlert('Impossible de creer la transaction.', 'error')
      }
      return
    }

    if (!phone || phone.length < 8) {
      showCustomAlert('Numero de telephone invalide', 'error')
      return
    }

    setShowLoading(true)
    setLoadingText('Traitement en cours...')

    setTimeout(() => {
      setShowLoading(false)
      showCustomAlert(
        `Votre demande de depot de ${Number(amount).toLocaleString()} FCFA a ete envoyee !`,
        'success'
      )
      hideAmountOverlay()
    }, 3000)
  }

  // =====================================================
  // HANDLER SEBPAY - CONNECTE AU BACKEND
  // =====================================================
  const handleSebpayConfirmation = async () => {
    // Validation des champs
    if (!sebpayAmount || Number(sebpayAmount) < 1000) {
      showCustomAlert('Montant minimum : 1 000 FCFA', 'error')
      return
    }

    if (!sebpayPhone || sebpayPhone.length < 8) {
      showCustomAlert('Numero de telephone invalide', 'error')
      return
    }

    if (!sebpayCountry) {
      showCustomAlert('Veuillez selectionner un pays', 'error')
      return
    }

    if (!sebpayOperator) {
      showCustomAlert('Veuillez selectionner un operateur', 'error')
      return
    }

    // Appel au backend
    setShowLoading(true)
    setLoadingText('Traitement SebPay en cours...')

    try {
      const response = await fetchWithAllTokens('/api/sebpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero: sebpayPhone,
          montant: sebpayAmount,
          country: sebpayCountry,
          operator: sebpayOperator
        })
      })

      const data = await response.json()
      setShowLoading(false)

      if (data.success) {
        showCustomAlert(
          `Votre depot SebPay de ${Number(sebpayAmount).toLocaleString()} FCFA via ${sebpayOperator} (${sebpayPhone}) au ${sebpayCountry} a ete initie avec succes !`,
          'success'
        )
        hideSebpayOverlay()
      } else {
        showCustomAlert(
          data.message || 'Erreur lors du traitement SebPay',
          'error'
        )
      }
    } catch (error) {
      setShowLoading(false)
      showCustomAlert(
        'Erreur de connexion au serveur. Veuillez reessayer.',
        'error'
      )
    }
  }

  // =====================================================
  // GESTION ECHAP
  // =====================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAlert) setShowAlert(false)
        if (showAmountOverlay) hideAmountOverlay()
        if (showSebpayOverlay) hideSebpayOverlay()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showAlert, showAmountOverlay, showSebpayOverlay])

  // =====================================================
  // RENDU
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

      {/* Header */}
      <motion.header
        className="relative z-10 flex items-center justify-center pt-6 pb-3"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.img
          src="/img/WariPlay_Logo_Transparent.png"
          alt="WariPlay"
          className="h-12 sm:h-14 w-auto drop-shadow-[0_0_15px_rgba(0,200,150,0.5)]"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        />
      </motion.header>

      {/* Navigation */}
      <nav className="relative z-10 flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href
          const isTarget = item.href === '/target'
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.93 }}
              className="flex-shrink-0"
            >
              <Link
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium border whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-400/20 border-emerald-400/30 text-white'
                    : isTarget
                    ? 'bg-orange-500/15 border-orange-500/30 text-white'
                    : 'bg-white/[0.04] border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-[700px] mx-auto px-4 sm:px-6 py-6 pb-32">
        
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2.5 mb-2">
            <span className="text-emerald-400">
              <MoneyIcon />
            </span>
            Depot
          </h1>
          <p className="text-white/50 text-sm">Rechargez votre compte pour jouer et gagner plus</p>
        </div>

        {/* Balance Card */}
        <motion.div
          className="rounded-2xl p-6 sm:p-7 mb-7 border border-emerald-400/10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(26,26,46,0.8), rgba(22,33,62,0.7))',
            boxShadow: '0 15px 40px rgba(0,0,0,0.3)'
          }}
          whileHover={{ y: -3 }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
          <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
            <WalletIcon /> Solde disponible
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-4">
            {balance !== null ? balance : '...'}
          </div>
          <Link
            href="/historique"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-semibold text-sm hover:bg-gradient-to-r hover:from-emerald-400 hover:to-emerald-600 hover:text-white hover:border-transparent transition-all"
          >
            <HistoryIcon /> Historique
          </Link>
        </motion.div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCardIcon /> Methodes de paiement
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                onClick={() => selectMethod(method.id)}
                className={`relative rounded-2xl p-5 text-center cursor-pointer border transition-all duration-300 ${
                  selectedMethod === method.id
                    ? 'border-emerald-400 bg-emerald-400/5 shadow-[0_0_25px_rgba(0,200,150,0.2)]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-emerald-400/25 hover:-translate-y-1'
                }`}
                style={{
                  background: selectedMethod === method.id
                    ? 'linear-gradient(160deg, rgba(0,200,150,0.08), rgba(0,200,150,0.03))'
                    : 'linear-gradient(160deg, rgba(26,26,46,0.7), rgba(22,33,62,0.6))'
                }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                {selectedMethod === method.id && (
                  <motion.div
                    className="absolute top-2 right-2 text-emerald-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircleIcon />
                  </motion.div>
                )}
                <div className="flex justify-center mb-3 h-14">
                  <img
                    src={method.image}
                    alt={method.name}
                    className="max-h-full object-contain"
                  />
                </div>
                <div className="font-semibold text-white text-sm">{method.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* FEDAPAY AMOUNT OVERLAY */}
      {/* ============================================ */}
      <AnimatePresence>
        {showAmountOverlay && (
          <div
            className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4"
            onClick={hideAmountOverlay}
          >
            <motion.div
              className="relative w-full max-w-[460px] rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
              style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              
              <button
                onClick={hideAmountOverlay}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"
              >
                <CloseIcon />
              </button>

              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <CoinsIcon /> Montant du depot
              </h3>
              <p className="text-white/50 text-sm mb-5">
                Methode : <strong className="text-white">{selectedMethod ? getMethodName(selectedMethod) : ''}</strong>
              </p>

              {/* Montant */}
              <div className="mb-4">
                <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1.5">
                  <MoneyIcon /> Entrez le montant (FCFA)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value ? Number(e.target.value) : '')
                    setActiveAmount(null)
                  }}
                  placeholder="Ex: 5000"
                  min={1000}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none text-sm focus:border-emerald-400/40 placeholder:text-white/35"
                />
              </div>

              {/* Téléphone si nécessaire */}
              {showPhoneField && (
                <div className="mb-4">
                  <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1.5">
                    <PhoneIcon /> Numero de telephone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 771234567"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none text-sm focus:border-emerald-400/40 placeholder:text-white/35"
                  />
                </div>
              )}

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                {amountPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmountPreset(preset)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                      activeAmount === preset
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/30'
                        : 'bg-white/[0.04] border-white/[0.08] text-white hover:bg-emerald-400/8 hover:border-emerald-400/25'
                    }`}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Bouton Envoyer */}
              <button
                onClick={handleShowConfirmation}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
              >
                <PaperPlaneIcon /> Envoyer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* SEBPAY OVERLAY - CONNECTE AU BACKEND */}
      {/* ============================================ */}
      <AnimatePresence>
        {showSebpayOverlay && (
          <div
            className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4"
            onClick={hideSebpayOverlay}
          >
            <motion.div
              className="relative w-full max-w-[500px] rounded-3xl p-6 sm:p-8 border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
              style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              
              <button
                onClick={hideSebpayOverlay}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"
              >
                <CloseIcon />
              </button>

              {/* En-tête SebPay */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-emerald-400/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    src="/img/sebpay.png"
                    alt="SebPay"
                    className="max-w-full max-h-full object-contain p-1.5"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">SebPay</h3>
                  <p className="text-white/50 text-xs">Depot via Mobile Money</p>
                </div>
              </div>

              {/* Montant */}
              <div className="mb-4">
                <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1.5">
                  <MoneyIcon /> Montant du depot (FCFA)
                </label>
                <input
                  type="number"
                  value={sebpayAmount}
                  onChange={(e) => {
                    setSebpayAmount(e.target.value ? Number(e.target.value) : '')
                    setSebpayActiveAmount(null)
                  }}
                  placeholder="Ex: 5000"
                  min={1000}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none text-sm focus:border-emerald-400/40 placeholder:text-white/35"
                />
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {amountPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setSebpayAmountPreset(preset)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                      sebpayActiveAmount === preset
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/30'
                        : 'bg-white/[0.04] border-white/[0.08] text-white hover:bg-emerald-400/8 hover:border-emerald-400/25'
                    }`}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Numéro de téléphone */}
              <div className="mb-4">
                <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1.5">
                  <PhoneIcon /> Numero de telephone
                </label>
                <input
                  type="tel"
                  value={sebpayPhone}
                  onChange={(e) => setSebpayPhone(e.target.value)}
                  placeholder="Ex: 97 123 456"
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none text-sm focus:border-emerald-400/40 placeholder:text-white/35"
                />
              </div>

              {/* Sélection du pays */}
              <div className="mb-3">
                <label className="text-white/50 text-xs mb-2 flex items-center gap-1.5">
                  <GlobeIcon /> Pays
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sebpayCountries.map((country) => (
                    <button
                      key={country.country}
                      onClick={() => {
                        setSebpayCountry(country.country)
                        setSebpayOperator('')
                      }}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 border text-left ${
                        sebpayCountry === country.country
                          ? 'border-emerald-400 bg-emerald-400/10 text-white shadow-[0_0_15px_rgba(0,200,150,0.15)]'
                          : 'border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:border-white/[0.15]'
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{country.flag}</span>
                      <span className="truncate text-xs">{country.country}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sélection de l'opérateur */}
              {sebpayCountry && (
                <div className="mb-5">
                  <label className="text-white/50 text-xs mb-2 flex items-center gap-1.5">
                    <WifiIcon /> Operateur
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {sebpayCountries
                      .find((c) => c.country === sebpayCountry)
                      ?.operators.map((op) => (
                        <button
                          key={op}
                          onClick={() => setSebpayOperator(op)}
                          className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 border ${
                            sebpayOperator === op
                              ? 'border-emerald-400 bg-emerald-400/10 text-white shadow-[0_0_15px_rgba(0,200,150,0.15)]'
                              : 'border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:border-white/[0.15]'
                          }`}
                        >
                          {sebpayOperator === op && (
                            <span className="text-emerald-400 flex-shrink-0">
                              <CheckIcon />
                            </span>
                          )}
                          <span className={`truncate text-xs ${sebpayOperator === op ? '' : 'pl-6'}`}>
                            {op}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Bouton d'envoi */}
              <button
                onClick={handleSebpayConfirmation}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
              >
                <PaperPlaneIcon /> Initier le depot SebPay
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* LOADING */}
      {/* ============================================ */}
      <AnimatePresence>
        {showLoading && (
          <div className="fixed inset-0 bg-[#0a0a1a]/90 backdrop-blur-xl z-[2000] flex flex-col items-center justify-center gap-6">
            <div className="w-13 h-13 border-[3px] border-emerald-400/15 border-t-emerald-400 border-r-purple-400 rounded-full animate-spin shadow-[0_0_30px_rgba(0,200,150,0.2)]" />
            <p className="text-white/80 text-sm font-medium animate-pulse">{loadingText}</p>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* ALERT */}
      {/* ============================================ */}
      <AnimatePresence>
        {showAlert && (
          <div
            className="fixed inset-0 bg-[#0a0a1a]/75 backdrop-blur-md z-[3000] flex items-center justify-center p-4"
            onClick={() => setShowAlert(false)}
          >
            <motion.div
              className={`relative w-full max-w-[420px] rounded-3xl p-6 sm:p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.5)] ${
                alertData.type === 'success'
                  ? 'border-emerald-400/40'
                  : alertData.type === 'error'
                  ? 'border-red-400/40'
                  : 'border-purple-400/40'
              }`}
              style={{
                background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAlert(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"
              >
                <CloseIcon />
              </button>

              <div
                className={`text-4xl mb-4 ${
                  alertData.type === 'success'
                    ? 'text-green-400'
                    : alertData.type === 'error'
                    ? 'text-red-400'
                    : 'text-purple-400'
                }`}
              >
                {alertData.type === 'success' ? (
                  <CheckCircleIcon />
                ) : alertData.type === 'error' ? (
                  <WarningIcon />
                ) : (
                  <CheckCircleIcon />
                )}
              </div>

              <p className="text-white text-sm mb-5 leading-relaxed">{alertData.message}</p>

              <button
                onClick={() => setShowAlert(false)}
                className="px-10 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}