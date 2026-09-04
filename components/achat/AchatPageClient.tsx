// components/achat/AchatPageClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import Loading from '@/components/loading'
import PaymentStepCard from './PaymentStepCard'
import PaymentSummaryRow from './PaymentSummaryRow'

// =====================================================
// SVG ICONS
// =====================================================
const CreditCardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)

const MoneyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export default function AchatPageClient() {
  useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const niveau = searchParams.get('niveau')
  const produit = searchParams.get('produit')
  
  const [currentStep, setCurrentStep] = useState<'step1' | 'step2a' | 'confirmation'>('step1')
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [showLoader, setShowLoader] = useState(false)
  const [loaderText, setLoaderText] = useState('Chargement en cours...')
  const [accountBalance, setAccountBalance] = useState(0)
  const [productPrice, setProductPrice] = useState(0)
  const [productName, setProductName] = useState('')
  const [productDuration, setProductDuration] = useState('')
  const [newBalance, setNewBalance] = useState(0)
  const [isLevelProduct, setIsLevelProduct] = useState(false)

  // =====================================================
  // CHARGEMENT DES DONNEES
  // =====================================================
  useEffect(() => {
    let cancelled = false

    async function init() {
      await initAll()

      if (!niveau && !produit) {
        router.push('/home')
        return
      }

      setShowLoader(true)

      if (niveau) {
        setIsLevelProduct(true)
        setLoaderText('Chargement du niveau...')
        try {
          const res = await fetchWithAllTokens(`/api/get_level_info?niveau=${niveau}`)
          if (!res.ok) throw new Error('Erreur')
          const data = await res.json()
          if (!cancelled) {
            setProductName(data.name)
            setProductPrice(parsePrice(data.prix))
            setProductDuration(data.duree)
          }
        } catch {
          if (!cancelled) router.push('/home')
          return
        }
      } else if (produit) {
        setIsLevelProduct(false)
        setLoaderText('Chargement du produit...')
        setProductName(produit)
        try {
          const res = await fetchWithAllTokens(`/api/get_product_price?produit=${encodeURIComponent(produit)}`)
          if (!res.ok) throw new Error('Erreur')
          const data = await res.json()
          if (!cancelled) {
            setProductPrice(parsePrice(data.prix))
          }
        } catch {
          if (!cancelled) router.push('/home')
          return
        }
      }

      // Charger le solde
      try {
        const res = await fetchWithAllTokens('/api/get_lettricide_solde')
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) {
            setAccountBalance(parsePrice(data.solde))
          }
        }
      } catch {}

      if (!cancelled) {
        setShowLoader(false)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [niveau, produit, router])

  // =====================================================
  // FONCTIONS UTILITAIRES
  // =====================================================
  function parsePrice(priceString: any): number {
    if (typeof priceString === 'number') return priceString
    return parseInt(priceString?.toString().replace(/,/g, '') || '0', 10)
  }

  // =====================================================
  // HANDLERS
  // =====================================================
  const selectMethod = (method: string) => {
    if (method !== 'account') return
    setSelectedMethod(method)
    setCurrentStep('step2a')
  }

  const goBackToStep1 = () => {
    setCurrentStep('step1')
    setSelectedMethod(null)
  }

  const confirmAccountPayment = async () => {
    if (accountBalance < productPrice) return

    setShowLoader(true)
    setLoaderText('Paiement en cours...')

    const endpoint = isLevelProduct ? '/api/save_purchase' : '/api/save_product_purchase'
    const purchaseData: any = {
      name: productName,
      amount: productPrice,
      operation: 'debit'
    }
    if (isLevelProduct && productDuration) {
      purchaseData.duration = productDuration
    }

    try {
      const res = await fetchWithAllTokens(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      })

      const data = await res.json()

      if (data && data.success) {
        setNewBalance(data.new_balance)
        setShowLoader(false)
        setCurrentStep('confirmation')
      } else {
        setShowLoader(false)
      }
    } catch {
      setShowLoader(false)
    }
  }

  const closeConfirmation = () => {
    router.push('/home?payment=success')
  }

  // =====================================================
  // RENDU
  // =====================================================
  return (
    <>
      {/* ============================================ */}
      {/* LOADING - Composant partagé */}
      {/* ============================================ */}
      <Loading show={showLoader} text={loaderText} />

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <div className="relative z-10 max-w-[500px] mx-auto px-4 sm:px-6 py-6 min-h-screen flex flex-col justify-center pb-32">
        <AnimatePresence mode="wait">
          
          {/* ============================================ */}
          {/* STEP 1 - CHOIX METHODE DE PAIEMENT */}
          {/* ============================================ */}
          {currentStep === 'step1' && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <PaymentStepCard>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
                  <span className="text-emerald-400">
                    <CreditCardIcon />
                  </span>
                  Moyen de paiement
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Mon compte */}
                  <motion.div
                    onClick={() => selectMethod('account')}
                    className={`rounded-2xl p-6 sm:p-8 text-center cursor-pointer border transition-all duration-300 relative overflow-hidden ${
                      selectedMethod === 'account'
                        ? 'border-emerald-400 bg-emerald-400/8 shadow-[0_0_25px_rgba(0,200,150,0.2)]'
                        : 'border-white/[0.08] bg-white/[0.03] hover:border-emerald-400/30 hover:bg-emerald-400/5'
                    }`}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="text-4xl text-emerald-400 mb-3">
                      <WalletIcon />
                    </div>
                    <div className="font-semibold text-white/80 text-sm">
                      Mon compte
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                      {accountBalance.toLocaleString()} FCFA
                    </div>
                  </motion.div>

                  {/* Wallet - Désactivé */}
                  <motion.div
                    className="rounded-2xl p-6 sm:p-8 text-center border transition-all duration-300 relative overflow-hidden opacity-40 cursor-not-allowed border-white/[0.08] bg-white/[0.02]"
                    whileHover={{ y: 0 }}
                  >
                    <div className="text-4xl text-white/30 mb-3">
                      <MoneyIcon />
                    </div>
                    <div className="font-semibold text-white/40 text-sm">
                      Wallet
                    </div>
                    <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wide text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                      Bientôt
                    </span>
                  </motion.div>
                </div>
              </PaymentStepCard>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* STEP 2a - PAIEMENT PAR COMPTE */}
          {/* ============================================ */}
          {currentStep === 'step2a' && (
            <motion.div
              key="step2a"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <button
                onClick={goBackToStep1}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/70 font-medium text-sm hover:text-white hover:bg-emerald-400/8 hover:border-emerald-400/30 transition-all mb-4"
              >
                <ArrowLeftIcon /> Retour
              </button>

              <PaymentStepCard>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
                  <span className="text-emerald-400">
                    <WalletIcon />
                  </span>
                  Paiement par compte
                </h2>

                <div className="text-center mb-4">
                  <div className="text-3xl sm:text-4xl font-bold text-emerald-400">
                    {accountBalance.toLocaleString()} FCFA
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-lg font-semibold text-white">
                    {productName}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <PaymentSummaryRow 
                    label="Prix:" 
                    value={`${productPrice.toLocaleString()} FCFA`} 
                  />
                  {productDuration && (
                    <PaymentSummaryRow 
                      label="Duree:" 
                      value={productDuration} 
                      emphasize={false} 
                    />
                  )}
                </div>

                <button
                  onClick={confirmAccountPayment}
                  disabled={accountBalance < productPrice}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <CheckIcon /> Confirmer le paiement
                </button>
              </PaymentStepCard>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* CONFIRMATION */}
          {/* ============================================ */}
          {currentStep === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            >
              <PaymentStepCard>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-center gap-2.5">
                  <span className="text-emerald-400">
                    <CheckCircleIcon />
                  </span>
                  Paiement reussi
                </h2>

                <div className="flex justify-center mb-6">
                  <div className="text-6xl text-emerald-400">
                    <CheckCircleIcon />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-lg font-semibold text-white">
                    {productName}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <PaymentSummaryRow 
                    label="Montant paye:" 
                    value={`${productPrice.toLocaleString()} FCFA`} 
                  />
                  <PaymentSummaryRow 
                    label="Nouveau solde:" 
                    value={`${newBalance.toLocaleString()} FCFA`} 
                    emphasize={false} 
                  />
                  {productDuration && (
                    <PaymentSummaryRow 
                      label="Duree:" 
                      value={productDuration} 
                      emphasize={false} 
                    />
                  )}
                </div>

                <button
                  onClick={closeConfirmation}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <CloseIcon /> Fermer
                </button>
              </PaymentStepCard>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  )
}