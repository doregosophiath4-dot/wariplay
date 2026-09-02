// components/depot/DepotPageClient.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { 
  WalletIcon,
  HistoryIcon,
  CreditCardIcon,
  CoinsIcon,
  MoneyIcon,
  PaperPlaneIcon,
  CloseIcon,
  CheckCircleIcon,
  WarningIcon,
  PhoneIcon,
  GlobeIcon,
  WifiIcon,
  CheckIcon
} from '@/components/icons'
import Loading from '@/components/loading'

// =====================================================
// CONSTANTES STATIQUES (hors du composant)
// =====================================================
const PAYMENT_METHODS = [
  { id: 'fedapay', name: 'FedaPay', image: '/img/feda.png' },
  { id: 'sebpay', name: 'SebPay', image: '/img/sebpay.png' }
]

const SEBPAY_COUNTRIES = [
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
    country: "Cote d'Ivoire",
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

const AMOUNT_PRESETS = [1000, 2000, 5000, 10000, 20000, 50000]

// =====================================================
// DYNAMIC IMPORTS DES OVERLAYS
// =====================================================
const AmountOverlay = dynamic(
  () => import('@/components/depot/overlays/AmountOverlay'),
  { ssr: false, loading: () => null }
)

const SebpayOverlay = dynamic(
  () => import('@/components/depot/overlays/SebpayOverlay'),
  { ssr: false, loading: () => null }
)

export default function DepotPageClient() {
  useAuth()
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
  const [fedapayReady, setFedapayReady] = useState(false)

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
    return PAYMENT_METHODS.find(m => m.id === methodId)?.name || 'Inconnu'
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
            if (fedapayReady && typeof window !== 'undefined' && (window as any).FedaPay) {
              (window as any).FedaPay.setPublicKey('pk_live_U1Ww9cFUgqkTEHl30s9leDQN')
              ;(window as any).FedaPay.checkout({ token: data.payment_token })
            } else {
              showCustomAlert('FedaPay non disponible pour le moment, veuillez patienter quelques secondes et reessayer.', 'error')
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
  // HANDLER SEBPAY
  // =====================================================
  const handleSebpayConfirmation = async () => {
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
    <>
      {/* ============================================ */}
      {/* SCRIPT FEDAPAY */}
      {/* ============================================ */}
      <Script
        src="https://cdn.fedapay.com/checkout.js?v=1.1.7"
        strategy="afterInteractive"
        onLoad={() => setFedapayReady(true)}
      />

      {/* ============================================ */}
      {/* LOADING */}
      {/* ============================================ */}
      <Loading show={showLoading} text={loadingText} />

      {/* ============================================ */}
      {/* PAGE TITLE */}
      {/* ============================================ */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2.5 mb-2">
          <span className="text-emerald-400"><MoneyIcon /></span> Depot
        </h1>
        <p className="text-white/50 text-sm">Rechargez votre compte pour jouer et gagner plus</p>
      </div>

      {/* ============================================ */}
      {/* BALANCE CARD */}
      {/* ============================================ */}
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

      {/* ============================================ */}
      {/* PAYMENT METHODS */}
      {/* ============================================ */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCardIcon /> Methodes de paiement
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {PAYMENT_METHODS.map((method) => (
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

      {/* ============================================ */}
      {/* AMOUNT OVERLAY - Chargé dynamiquement */}
      {/* ============================================ */}
      <AnimatePresence>
        {showAmountOverlay && (
          <AmountOverlay
            methodName={selectedMethod ? getMethodName(selectedMethod) : ''}
            amount={amount}
            phone={phone}
            showPhoneField={showPhoneField}
            activeAmount={activeAmount}
            presets={AMOUNT_PRESETS}
            onAmountChange={(v) => { setAmount(v); setActiveAmount(null) }}
            onPhoneChange={setPhone}
            onPresetSelect={setAmountPreset}
            onConfirm={handleShowConfirmation}
            onClose={hideAmountOverlay}
          />
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* SEBPAY OVERLAY - Chargé dynamiquement */}
      {/* ============================================ */}
      <AnimatePresence>
        {showSebpayOverlay && (
          <SebpayOverlay
            amount={sebpayAmount}
            phone={sebpayPhone}
            country={sebpayCountry}
            operator={sebpayOperator}
            activeAmount={sebpayActiveAmount}
            presets={AMOUNT_PRESETS}
            countries={SEBPAY_COUNTRIES}
            onAmountChange={(v) => { setSebpayAmount(v); setSebpayActiveAmount(null) }}
            onPhoneChange={setSebpayPhone}
            onCountrySelect={(c) => { setSebpayCountry(c); setSebpayOperator('') }}
            onOperatorSelect={setSebpayOperator}
            onPresetSelect={setSebpayAmountPreset}
            onConfirm={handleSebpayConfirmation}
            onClose={hideSebpayOverlay}
          />
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
    </>
  )
}