'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

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

const SpinnerIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

export default function AchatPage() {
  useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const niveau = searchParams.get('niveau')
  const produit = searchParams.get('produit')
  const [currentStep, setCurrentStep] = useState<string>('step1')
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [walletCode, setWalletCode] = useState('')
  const [showLoader, setShowLoader] = useState(false)
  const [loaderText, setLoaderText] = useState('Chargement en cours...')
  const [accountBalance, setAccountBalance] = useState(0)
  const [productPrice, setProductPrice] = useState(0)
  const [productName, setProductName] = useState('')
  const [productDuration, setProductDuration] = useState('')
  const [newBalance, setNewBalance] = useState(0)
  const [isLevelProduct, setIsLevelProduct] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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
    setSelectedMethod(method)
    if (method === 'account') {
      setCurrentStep('step2a')
    } else if (method === 'wallet') {
      setCurrentStep('step2b')
    }
  }

  const goBackToStep1 = () => {
    setCurrentStep('step1')
    setSelectedMethod(null)
    setWalletCode('')
  }

  const goBackToWalletInput = () => {
    setCurrentStep('step2b')
  }

  const verifyWallet = () => {
    setShowLoader(true)
    setLoaderText('Verification du code...')
    setTimeout(() => {
      setShowLoader(false)
      setCurrentStep('step3')
    }, 2000)
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

  const confirmWalletPayment = () => {
    setShowLoader(true)
    setLoaderText('Traitement du paiement...')
    setTimeout(() => {
      setShowLoader(false)
      setCurrentStep('confirmation')
    }, 3000)
  }

  const closeConfirmation = () => {
    router.push('/home?payment=success')
  }

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

      {/* Main Container */}
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
              <div
                className="rounded-3xl p-6 sm:p-8 border border-emerald-400/15 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, rgba(26,26,46,0.9), rgba(22,33,62,0.85))',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,200,150,0.06) inset'
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />

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
                  </motion.div>

                  {/* Wallet */}
                  <motion.div
                    onClick={() => selectMethod('wallet')}
                    className={`rounded-2xl p-6 sm:p-8 text-center cursor-pointer border transition-all duration-300 relative overflow-hidden ${
                      selectedMethod === 'wallet'
                        ? 'border-emerald-400 bg-emerald-400/8 shadow-[0_0_25px_rgba(0,200,150,0.2)]'
                        : 'border-white/[0.08] bg-white/[0.03] hover:border-emerald-400/30 hover:bg-emerald-400/5'
                    }`}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="text-4xl text-emerald-400 mb-3">
                      <MoneyIcon />
                    </div>
                    <div className="font-semibold text-white/80 text-sm">
                      Wallet
                    </div>
                  </motion.div>
                </div>
              </div>
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

              <div
                className="rounded-3xl p-6 sm:p-8 border border-emerald-400/15 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, rgba(26,26,46,0.9), rgba(22,33,62,0.85))',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,200,150,0.06) inset'
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />

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
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Prix:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {productPrice.toLocaleString()} FCFA
                    </span>
                  </div>

                  {productDuration && (
                    <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                      <span className="text-white/50 text-sm">Duree:</span>
                      <span className="text-white font-medium text-sm">{productDuration}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={confirmAccountPayment}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <CheckIcon /> Confirmer le paiement
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* STEP 2b - PAIEMENT PAR WALLET */}
          {/* ============================================ */}
          {currentStep === 'step2b' && (
            <motion.div
              key="step2b"
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

              <div
                className="rounded-3xl p-6 sm:p-8 border border-emerald-400/15 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, rgba(26,26,46,0.9), rgba(22,33,62,0.85))',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,200,150,0.06) inset'
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
                  <span className="text-emerald-400">
                    <MoneyIcon />
                  </span>
                  Paiement par Wallet
                </h2>

                <div className="mb-5">
                  <label className="block text-white/50 text-xs mb-2 font-medium">
                    Code Wallet
                  </label>
                  <input
                    type="password"
                    value={walletCode}
                    onChange={(e) => setWalletCode(e.target.value)}
                    placeholder="Entrez votre code Wallet"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none text-sm focus:border-emerald-400/40 placeholder:text-white/35 transition-all"
                  />
                </div>

                <button
                  onClick={verifyWallet}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <CheckIcon /> Verifier
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* STEP 3 - CONFIRMATION WALLET */}
          {/* ============================================ */}
          {currentStep === 'step3' && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <button
                onClick={goBackToWalletInput}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/70 font-medium text-sm hover:text-white hover:bg-emerald-400/8 hover:border-emerald-400/30 transition-all mb-4"
              >
                <ArrowLeftIcon /> Retour
              </button>

              <div
                className="rounded-3xl p-6 sm:p-8 border border-emerald-400/15 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, rgba(26,26,46,0.9), rgba(22,33,62,0.85))',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,200,150,0.06) inset'
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
                  <span className="text-emerald-400">
                    <MoneyIcon />
                  </span>
                  Confirmation Wallet
                </h2>

                <div className="text-center mb-4">
                  <div className="text-3xl sm:text-4xl font-bold text-emerald-400">
                    15,000 FCFA
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-lg font-semibold text-white">
                    {productName}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Prix:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {productPrice.toLocaleString()} FCFA
                    </span>
                  </div>

                  {productDuration && (
                    <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                      <span className="text-white/50 text-sm">Duree:</span>
                      <span className="text-white font-medium text-sm">{productDuration}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={confirmWalletPayment}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <CheckIcon /> Confirmer le paiement
                </button>
              </div>
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
              <div
                className="rounded-3xl p-6 sm:p-8 border border-emerald-400/15 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, rgba(26,26,46,0.9), rgba(22,33,62,0.85))',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,200,150,0.06) inset'
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />

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
                  <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Montant paye:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {productPrice.toLocaleString()} FCFA
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                    <span className="text-white/50 text-sm">Nouveau solde:</span>
                    <span className="text-white font-medium text-sm">
                      {newBalance.toLocaleString()} FCFA
                    </span>
                  </div>

                  {productDuration && (
                    <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                      <span className="text-white/50 text-sm">Duree:</span>
                      <span className="text-white font-medium text-sm">{productDuration}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={closeConfirmation}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <CloseIcon /> Fermer
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Loader */}
      <AnimatePresence>
        {showLoader && (
          <div className="fixed inset-0 bg-[#0a0a1a]/95 backdrop-blur-xl z-[2000] flex flex-col items-center justify-center gap-6">
            <div className="text-emerald-400">
              <SpinnerIcon />
            </div>
            <p className="text-white/80 text-sm font-medium animate-pulse">{loaderText}</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}