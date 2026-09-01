'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

// =====================================================
// SVG ICONS
// =====================================================
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const StoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
    <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
  </svg>
)

const GamepadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="11" x2="10" y2="11" />
    <line x1="8" y1="9" x2="8" y2="13" />
    <line x1="15" y1="12" x2="15.01" y2="12" />
    <line x1="18" y1="10" x2="18.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
)

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)

const HistoryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const CreditCardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)

const CoinsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
  </svg>
)

const MoneyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const PaperPlaneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const WifiIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
)

const SpinnerIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
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

interface CountryNetwork {
  country: string
  countryCode: string
  networks: { value: string; label: string }[]
}

export default function RetraitPage() {
  useAuth()
  const pathname = usePathname()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [showAmountOverlay, setShowAmountOverlay] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Chargement en cours...')
  const [showAlert, setShowAlert] = useState(false)
  const [alertData, setAlertData] = useState({ title: '', message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' })
  const [amount, setAmount] = useState<number | ''>('')
  const [activeAmount, setActiveAmount] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [network, setNetwork] = useState('')
  const [country, setCountry] = useState('BJ')
  const [payoutReference, setPayoutReference] = useState('')
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
    { id: 'fedapay', name: 'Feda Pay', image: '/img/feda.png' },
    { id: 'sebpay', name: 'Seb Pay', image: '/img/sebpay.png' }
  ]

  const amountPresets = [1000, 2000, 5000, 10000, 20000, 50000]

  // Configuration des pays et réseaux par méthode de paiement
  const fedapayCountries: CountryNetwork[] = [
    {
      country: 'Bénin',
      countryCode: 'BJ',
      networks: [
        { value: 'mtn', label: 'MTN' },
        { value: 'moov', label: 'Moov' },
        { value: 'celtiis', label: 'Celtiis' }
      ]
    },
    {
      country: 'Côte d\'Ivoire',
      countryCode: 'CI',
      networks: [
        { value: 'mtn_ci', label: 'MTN' }
      ]
    }
  ]

  const sebpayCountries: CountryNetwork[] = [
    {
      country: 'Bénin',
      countryCode: 'BJ',
      networks: [
        { value: 'mtn', label: 'MTN' },
        { value: 'moov', label: 'Moov' },
        { value: 'celtiis', label: 'Celtiis' }
      ]
    },
    {
      country: 'Burkina Faso',
      countryCode: 'BF',
      networks: [
        { value: 'mtn', label: 'MTN' },
        { value: 'moov', label: 'Moov' }
      ]
    },
    {
      country: 'Côte d\'Ivoire',
      countryCode: 'CI',
      networks: [
        { value: 'mtn', label: 'MTN' },
        { value: 'moov', label: 'Moov' }
      ]
    },
    {
      country: 'Sénégal',
      countryCode: 'SN',
      networks: [
        { value: 'orange', label: 'Orange' },
        { value: 'free', label: 'Free' }
      ]
    },
    {
      country: 'Cameroun',
      countryCode: 'CM',
      networks: [
        { value: 'mtn', label: 'MTN' },
        { value: 'orange', label: 'Orange' }
      ]
    },
    {
      country: 'Congo Brazzaville',
      countryCode: 'CG',
      networks: [
        { value: 'mtn', label: 'MTN' },
        { value: 'airtel', label: 'Airtel' }
      ]
    },
    {
      country: 'Gabon',
      countryCode: 'GA',
      networks: [
        { value: 'airtel', label: 'Airtel' },
        { value: 'moov', label: 'Moov' }
      ]
    }
  ]

  // Obtenir la liste des pays selon la méthode sélectionnée
  const getAvailableCountries = (): CountryNetwork[] => {
    if (selectedMethod === 'sebpay') return sebpayCountries
    if (selectedMethod === 'fedapay') return fedapayCountries
    return []
  }

  // Obtenir les réseaux disponibles pour le pays sélectionné
  const getAvailableNetworks = (): { value: string; label: string }[] => {
    const countries = getAvailableCountries()
    const selectedCountry = countries.find(c => c.countryCode === country)
    return selectedCountry?.networks || []
  }

  const calculateFedapayFees = (amt: number): number => {
    if (amt <= 10000) return 150
    if (amt <= 50000) return 300
    if (amt <= 150000) return 800
    if (amt <= 500000) return 2000
    return 2500
  }

  const calculateInternalFees = (amt: number): number => {
    if (amt <= 5000) return 50
    if (amt <= 10000) return 75
    if (amt <= 25000) return 100
    if (amt <= 50000) return 150
    if (amt <= 100000) return 250
    if (amt <= 250000) return 400
    if (amt <= 500000) return 600
    return 0
  }

  const totalFees = amount ? calculateFedapayFees(Number(amount)) + calculateInternalFees(Number(amount)) : 0
  const totalReceived = amount ? Number(amount) - totalFees : 0

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
            const formatted = Number(data.solde).toLocaleString('fr-FR') + ' FCFA'
            setBalance(formatted)
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
    setShowAmountOverlay(true)
    setAmount('')
    setActiveAmount(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setNetwork('')
    
    // Définir le pays par défaut selon la méthode
    setCountry('BJ')
    setPayoutReference('')
  }

  const setAmountPreset = (value: number) => {
    setAmount(value)
    setActiveAmount(value)
  }

  const hideAll = () => {
    setShowAmountOverlay(false)
    setShowConfirmation(false)
    setSelectedMethod(null)
    setAmount('')
    setActiveAmount(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setNetwork('')
    setCountry('BJ')
    setPayoutReference('')
  }

  const showCustomAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertData({ title, message, type })
    setShowAlert(true)
  }

  const hideCustomAlert = () => {
    setShowAlert(false)
  }

  // Changer le pays et réinitialiser le réseau
  const handleCountryChange = (countryCode: string) => {
    setCountry(countryCode)
    // Toujours réinitialiser le réseau quand on change de pays
    setNetwork('')
  }

  const handleShowConfirmation = () => {
    if (!amount || Number(amount) < 1000) {
      return showCustomAlert('Montant invalide', 'Le montant minimum est de 1 000 FCFA', 'warning')
    }
    if (Number(amount) > 500000) {
      return showCustomAlert('Montant trop eleve', 'Le montant maximum est de 500 000 FCFA', 'warning')
    }

    // Validation spécifique selon la méthode
    if (selectedMethod === 'sebpay') {
      if (!firstName || !lastName || !phone || !network) {
        return showCustomAlert('Formulaire incomplet', 'Veuillez remplir tous les champs obligatoires pour Sebpay', 'warning')
      }
    } else {
      if (!firstName || !lastName || !email || !phone || !network) {
        return showCustomAlert('Formulaire incomplet', 'Veuillez remplir tous les champs', 'warning')
      }
    }

    // Vérifier que le réseau correspond bien au pays sélectionné
    const availableNetworks = getAvailableNetworks()
    const isValidNetwork = availableNetworks.some(n => n.value === network)
    if (!isValidNetwork) {
      return showCustomAlert(
        'Réseau invalide', 
        'Le réseau sélectionné n\'est pas valide pour le pays choisi. Veuillez en sélectionner un autre.',
        'warning'
      )
    }

    // Vérifier le solde
    if (balance) {
      const currentBalance = parseInt(balance.replace(/\D/g, ''))
      const totalDeduction = Number(amount) + totalFees
      if (totalDeduction > currentBalance) {
        return showCustomAlert(
          'Solde insuffisant',
          `Le montant demande (${Number(amount).toLocaleString()} FCFA) + frais (${totalFees.toLocaleString()} FCFA) = ${totalDeduction.toLocaleString()} FCFA depasse votre solde disponible (${currentBalance.toLocaleString()} FCFA)`,
          'warning'
        )
      }
    }

    setShowAmountOverlay(false)
    setShowConfirmation(true)
  }

  const processWithdrawal = async () => {
    setShowConfirmation(false)

    // Si c'est Sebpay, appeler directement l'API
    if (selectedMethod === 'sebpay') {
      setShowLoading(true)
      setLoadingText('Traitement du retrait via Sebpay...')

      try {
        const res = await fetch('/api/payouts/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient_name: `${firstName} ${lastName}`,
            phone: phone,
            operator: network,
            country: country,
            amount: Number(amount),
            currency: 'XOF'
          })
        })

        const data = await res.json()
        setShowLoading(false)

        if (data.success) {
          setPayoutReference(data.external_reference || '')
          showCustomAlert(
            'Succès',
            `Retrait en cours. Référence: ${data.external_reference || 'N/A'}`,
            'success'
          )
          // Réinitialiser
          setAmount('')
          setActiveAmount(null)
          setSelectedMethod(null)
          setFirstName('')
          setLastName('')
          setEmail('')
          setPhone('')
          setNetwork('')
          setCountry('BJ')
        } else {
          showCustomAlert('Erreur', data.error || 'Une erreur est survenue lors du retrait', 'error')
        }
      } catch (error) {
        setShowLoading(false)
        showCustomAlert('Erreur', 'Erreur de connexion au serveur', 'error')
      }
    } else {
      // Pour Fedapay
      setShowLoading(true)
      setLoadingText('Creation du payout...')
      setTimeout(() => {
        setShowLoading(false)
        confirmAndStartPayout()
      }, 3000)
    }
  }

  const confirmAndStartPayout = async () => {
    setShowLoading(true)
    setLoadingText('Traitement du retrait...')

    try {
      const res = await fetchWithAllTokens('/api/create-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          firstname: firstName,
          lastname: lastName,
          email: email,
          phone: phone,
          network: network,
          country: country
        })
      })

      const data = await res.json()
      setShowLoading(false)

      if (data.success) {
        if (data.balance && data.balance.new !== undefined) {
          setBalance(Number(data.balance.new).toLocaleString('fr-FR') + ' FCFA')
        }
        showCustomAlert('Succes', 'Retrait cree avec succes', 'success')
        setAmount('')
        setActiveAmount(null)
        setSelectedMethod(null)
        setFirstName('')
        setLastName('')
        setEmail('')
        setPhone('')
        setNetwork('')
      } else {
        showCustomAlert('Erreur', data.message || 'Une erreur est survenue lors du retrait', 'error')
      }
    } catch (error) {
      setShowLoading(false)
      showCustomAlert('Erreur', 'Erreur de connexion au serveur', 'error')
    }
  }

  const availableNetworks = getAvailableNetworks()
  const availableCountries = getAvailableCountries()
  const selectedCountryName = availableCountries.find(c => c.countryCode === country)?.country || ''
  const selectedNetworkName = availableNetworks.find(n => n.value === network)?.label || ''

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
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-400/20 border-emerald-400/30 text-white'
                    : isTarget
                    ? 'bg-orange-500/15 border-orange-500/30 text-white hover:bg-orange-500/25 hover:border-orange-500/50'
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

      {/* Main Content */}
      <div className="relative z-10 max-w-[700px] mx-auto px-4 sm:px-6 py-6 pb-32">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2.5 mb-2">
            <span className="text-emerald-400">
              <MoneyIcon />
            </span>
            Retrait
          </h1>
          <p className="text-white/50 text-sm">Retirez vos gains facilement et rapidement</p>
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
            href="/historiques"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-semibold text-sm hover:bg-gradient-to-r hover:from-emerald-400 hover:to-emerald-600 hover:text-white hover:border-transparent transition-all"
          >
            <HistoryIcon /> Historique
          </Link>
        </motion.div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCardIcon /> Methodes de retrait
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
                  <img src={method.image} alt={method.name} className="max-h-full object-contain" />
                </div>
                <div className="font-semibold text-white text-sm">{method.name}</div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* Amount Overlay */}
      <AnimatePresence>
        {showAmountOverlay && (
          <div
            className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4"
            onClick={hideAll}
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
                onClick={hideAll}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"
              >
                <CloseIcon />
              </button>

              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <CoinsIcon /> Montant du retrait
              </h3>
              <p className="text-white/50 text-sm mb-5">
                Methode : <strong className="text-white">{paymentMethods.find(m => m.id === selectedMethod)?.name}</strong>
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
                  max={500000}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none text-sm focus:border-emerald-400/40 placeholder:text-white/35"
                />
              </div>

              {/* Champs personnels */}
              {[
                { label: 'Prenom', value: firstName, setter: setFirstName, placeholder: 'Ex: Jean', type: 'text' },
                { label: 'Nom', value: lastName, setter: setLastName, placeholder: 'Ex: Dupont', type: 'text' },
                // Afficher l'email seulement pour Fedapay
                ...(selectedMethod === 'fedapay' ? [
                  { label: 'Adresse email', value: email, setter: setEmail, placeholder: 'Ex: exemple@mail.com', type: 'email' as const }
                ] : []),
                { label: 'Numero de telephone', value: phone, setter: setPhone, placeholder: 'Ex: 22997000000', type: 'tel' }
              ].map((field, i) => (
                <div className="mb-4" key={i}>
                  <label className="text-white/50 text-xs mb-1.5 block">{field.label}</label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none text-sm focus:border-emerald-400/40 placeholder:text-white/35"
                  />
                </div>
              ))}

              {/* Pays */}
              <div className="mb-4">
                <label className="text-white/50 text-xs mb-2 flex items-center gap-1.5">
                  <WifiIcon /> Pays
                </label>
                <div className={`grid gap-2.5 ${
                  availableCountries.length <= 2 ? 'grid-cols-2' : 
                  availableCountries.length <= 3 ? 'grid-cols-3' : 
                  'grid-cols-2 sm:grid-cols-4'
                }`}>
                  {availableCountries.map((c) => (
                    <button
                      key={c.countryCode}
                      type="button"
                      onClick={() => handleCountryChange(c.countryCode)}
                      className={`py-2.5 rounded-xl text-xs font-medium transition-all duration-300 border ${
                        country === c.countryCode
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/30'
                          : 'bg-white/[0.04] border-white/[0.08] text-white hover:bg-emerald-400/8 hover:border-emerald-400/25'
                      }`}
                    >
                      {c.country}
                    </button>
                  ))}
                </div>
              </div>

              {/* Réseau */}
              {availableNetworks.length > 0 && (
                <div className="mb-4">
                  <label className="text-white/50 text-xs mb-2 flex items-center gap-1.5">
                    <WifiIcon /> Reseau de transfert
                  </label>
                  <div className={`grid gap-2.5 ${
                    availableNetworks.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'
                  }`}>
                    {availableNetworks.map((n) => (
                      <button
                        key={n.value}
                        type="button"
                        onClick={() => setNetwork(n.value)}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                          network === n.value
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/30'
                            : 'bg-white/[0.04] border-white/[0.08] text-white hover:bg-emerald-400/8 hover:border-emerald-400/25'
                        }`}
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
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

              <button
                onClick={handleShowConfirmation}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
              >
                <PaperPlaneIcon /> Demander le retrait
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <div
            className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              className="relative w-full max-w-[460px] rounded-3xl p-6 sm:p-8 text-center border border-emerald-400/20 shadow-[0_30px_80px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto"
              style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #1a1a2e)' }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
              <button
                onClick={() => setShowConfirmation(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"
              >
                <CloseIcon />
              </button>

              <div className="text-5xl text-emerald-400 mb-4">
                <CheckCircleIcon />
              </div>
              <h2 className="text-xl font-bold text-white mb-4">Confirmer le retrait</h2>

              <div className="space-y-3 text-left mb-6">
                {[
                  { label: 'Montant:', value: `${amount?.toLocaleString()} FCFA` },
                  { label: 'Methode:', value: paymentMethods.find(m => m.id === selectedMethod)?.name },
                  { label: 'Beneficiaire:', value: `${firstName} ${lastName}` },
                  { label: 'Telephone:', value: phone },
                  { label: 'Pays:', value: selectedCountryName },
                  { label: 'Reseau:', value: selectedNetworkName },
                  ...(selectedMethod === 'fedapay' ? [
                    { label: 'Frais:', value: `${totalFees.toLocaleString()} FCFA` },
                    { label: 'Montant recu:', value: `${totalReceived.toLocaleString()} FCFA`, highlight: true }
                  ] : [])
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center py-2 ${item.highlight ? 'border-t-2 border-emerald-400 mt-2 pt-3' : 'border-b border-white/[0.06]'}`}
                  >
                    <span className="text-white/50 text-sm">{item.label}</span>
                    <span className={`font-semibold text-sm ${item.highlight ? 'text-emerald-400' : 'text-emerald-400'}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <CloseIcon /> Annuler
                </button>
                <button
                  onClick={processWithdrawal}
                  className="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <CheckCircleIcon /> Confirmer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading */}
      <AnimatePresence>
        {showLoading && (
          <div className="fixed inset-0 bg-[#0a0a1a]/90 backdrop-blur-xl z-[2000] flex flex-col items-center justify-center gap-6">
            <div className="text-emerald-400">
              <SpinnerIcon />
            </div>
            <p className="text-white/80 text-sm font-medium animate-pulse">{loadingText}</p>
          </div>
        )}
      </AnimatePresence>

      {/* Alert */}
      <AnimatePresence>
        {showAlert && (
          <div
            className="fixed inset-0 bg-[#0a0a1a]/75 backdrop-blur-md z-[3000] flex items-center justify-center p-4"
            onClick={hideCustomAlert}
          >
            <motion.div
              className={`relative w-full max-w-[420px] rounded-3xl p-6 sm:p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.5)] ${
                alertData.type === 'success'
                  ? 'border-emerald-400/40'
                  : alertData.type === 'error'
                  ? 'border-red-400/40'
                  : alertData.type === 'warning'
                  ? 'border-orange-400/40'
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
                onClick={hideCustomAlert}
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
                    : alertData.type === 'warning'
                    ? 'text-orange-400'
                    : 'text-purple-400'
                }`}
              >
                {alertData.type === 'success' ? (
                  <CheckCircleIcon />
                ) : alertData.type === 'error' ? (
                  <CloseIcon />
                ) : (
                  <WarningIcon />
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{alertData.title}</h3>
              <p className="text-white/60 text-sm mb-5 leading-relaxed">{alertData.message}</p>
              <button
                onClick={hideCustomAlert}
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