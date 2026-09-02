// components/retrait/RetraitPageClient.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
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
  WifiIcon,
  SpinnerIcon
} from '@/components/icons'
import Loading from '@/components/loading'

// =====================================================
// CONSTANTES STATIQUES (hors du composant)
// =====================================================
const PAYMENT_METHODS = [
  { id: 'fedapay', name: 'Feda Pay', image: '/img/feda.png' },
  { id: 'sebpay', name: 'Seb Pay', image: '/img/sebpay.png' }
]

const AMOUNT_PRESETS = [1000, 2000, 5000, 10000, 20000, 50000]

const FEDAPAY_COUNTRIES = [
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

const SEBPAY_COUNTRIES = [
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

// =====================================================
// FONCTIONS UTILITAIRES PURES (hors du composant)
// =====================================================
function calculateFedapayFees(amt: number): number {
  if (amt <= 10000) return 150
  if (amt <= 50000) return 300
  if (amt <= 150000) return 800
  if (amt <= 500000) return 2000
  return 2500
}

function calculateInternalFees(amt: number): number {
  if (amt <= 5000) return 50
  if (amt <= 10000) return 75
  if (amt <= 25000) return 100
  if (amt <= 50000) return 150
  if (amt <= 100000) return 250
  if (amt <= 250000) return 400
  if (amt <= 500000) return 600
  return 0
}

// =====================================================
// DYNAMIC IMPORTS DES OVERLAYS
// =====================================================
const RetraitAmountOverlay = dynamic(
  () => import('@/components/retrait/overlays/RetraitAmountOverlay'),
  { ssr: false, loading: () => null }
)

const WithdrawalConfirmationModal = dynamic(
  () => import('@/components/retrait/overlays/WithdrawalConfirmationModal'),
  { ssr: false, loading: () => null }
)

export default function RetraitPageClient() {
  useAuth()
  
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

  // =====================================================
  // CALCULS DÉRIVÉS - MEMOISÉS
  // =====================================================
  const availableCountries = useMemo((): typeof FEDAPAY_COUNTRIES => {
    if (selectedMethod === 'sebpay') return SEBPAY_COUNTRIES
    if (selectedMethod === 'fedapay') return FEDAPAY_COUNTRIES
    return []
  }, [selectedMethod])

  const availableNetworks = useMemo(() => {
    const selectedCountry = availableCountries.find(c => c.countryCode === country)
    return selectedCountry?.networks || []
  }, [availableCountries, country])

  const selectedCountryName = useMemo(() => {
    return availableCountries.find(c => c.countryCode === country)?.country || ''
  }, [availableCountries, country])

  const selectedNetworkName = useMemo(() => {
    return availableNetworks.find(n => n.value === network)?.label || ''
  }, [availableNetworks, network])

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

  const handleCountryChange = (countryCode: string) => {
    setCountry(countryCode)
    setNetwork('')
  }

  const handleShowConfirmation = () => {
    if (!amount || Number(amount) < 1000) {
      return showCustomAlert('Montant invalide', 'Le montant minimum est de 1 000 FCFA', 'warning')
    }
    if (Number(amount) > 500000) {
      return showCustomAlert('Montant trop eleve', 'Le montant maximum est de 500 000 FCFA', 'warning')
    }

    if (selectedMethod === 'sebpay') {
      if (!firstName || !lastName || !phone || !network) {
        return showCustomAlert('Formulaire incomplet', 'Veuillez remplir tous les champs obligatoires pour Sebpay', 'warning')
      }
    } else {
      if (!firstName || !lastName || !email || !phone || !network) {
        return showCustomAlert('Formulaire incomplet', 'Veuillez remplir tous les champs', 'warning')
      }
    }

    const isValidNetwork = availableNetworks.some(n => n.value === network)
    if (!isValidNetwork) {
      return showCustomAlert(
        'Réseau invalide', 
        'Le réseau sélectionné n\'est pas valide pour le pays choisi. Veuillez en sélectionner un autre.',
        'warning'
      )
    }

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

  // =====================================================
  // RENDU
  // =====================================================
  return (
    <>
      {/* ============================================ */}
      {/* LOADING - Composant partagé */}
      {/* ============================================ */}
      <Loading show={showLoading} text={loadingText} />

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2.5 mb-2">
          <span className="text-emerald-400">
            <MoneyIcon />
          </span>
          Retrait
        </h1>
        <p className="text-white/50 text-sm">Retirez vos gains facilement et rapidement</p>
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
          href="/historiques"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-semibold text-sm hover:bg-gradient-to-r hover:from-emerald-400 hover:to-emerald-600 hover:text-white hover:border-transparent transition-all"
        >
          <HistoryIcon /> Historique
        </Link>
      </motion.div>

      {/* ============================================ */}
      {/* PAYMENT METHODS - Utilise PAYMENT_METHODS */}
      {/* ============================================ */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCardIcon /> Methodes de retrait
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
                <img src={method.image} alt={method.name} className="max-h-full object-contain" />
              </div>
              <div className="font-semibold text-white text-sm">{method.name}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* RETRAIT AMOUNT OVERLAY - Chargé dynamiquement */}
      {/* ============================================ */}
      <AnimatePresence>
        {showAmountOverlay && (
          <RetraitAmountOverlay
            methodName={PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name || ''}
            selectedMethod={selectedMethod}
            amount={amount}
            activeAmount={activeAmount}
            presets={AMOUNT_PRESETS}
            firstName={firstName}
            lastName={lastName}
            email={email}
            phone={phone}
            country={country}
            network={network}
            availableCountries={availableCountries}
            availableNetworks={availableNetworks}
            onAmountChange={(v) => { setAmount(v); setActiveAmount(null) }}
            onPresetSelect={setAmountPreset}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
            onCountryChange={handleCountryChange}
            onNetworkChange={setNetwork}
            onConfirm={handleShowConfirmation}
            onClose={hideAll}
          />
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* CONFIRMATION MODAL - Chargée dynamiquement */}
      {/* ============================================ */}
      <AnimatePresence>
        {showConfirmation && (
          <WithdrawalConfirmationModal
            summaryItems={[
              { label: 'Montant:', value: `${amount?.toLocaleString()} FCFA` },
              { label: 'Methode:', value: PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name },
              { label: 'Beneficiaire:', value: `${firstName} ${lastName}` },
              { label: 'Telephone:', value: phone },
              { label: 'Pays:', value: selectedCountryName },
              { label: 'Reseau:', value: selectedNetworkName },
              ...(selectedMethod === 'fedapay' ? [
                { label: 'Frais:', value: `${totalFees.toLocaleString()} FCFA` },
                { label: 'Montant recu:', value: `${totalReceived.toLocaleString()} FCFA`, highlight: true }
              ] : [])
            ]}
            onConfirm={processWithdrawal}
            onCancel={() => setShowConfirmation(false)}
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
    </>
  )
}