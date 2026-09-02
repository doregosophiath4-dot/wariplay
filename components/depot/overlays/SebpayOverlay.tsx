// components/depot/overlays/SebpayOverlay.tsx
'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CloseIcon, MoneyIcon, PhoneIcon, GlobeIcon, WifiIcon, CheckIcon, PaperPlaneIcon } from '@/components/icons'

interface CountryOperator {
  country: string
  flag: string
  operators: string[]
}

interface SebpayOverlayProps {
  amount: number | ''
  phone: string
  country: string
  operator: string
  activeAmount: number | null
  presets: number[]
  countries: CountryOperator[]
  onAmountChange: (v: number | '') => void
  onPhoneChange: (v: string) => void
  onCountrySelect: (v: string) => void
  onOperatorSelect: (v: string) => void
  onPresetSelect: (v: number) => void
  onConfirm: () => void
  onClose: () => void
}

export default function SebpayOverlay({
  amount,
  phone,
  country,
  operator,
  activeAmount,
  presets,
  countries,
  onAmountChange,
  onPhoneChange,
  onCountrySelect,
  onOperatorSelect,
  onPresetSelect,
  onConfirm,
  onClose
}: SebpayOverlayProps) {
  // ✅ Calcul memoïsé en interne - ne change que quand le pays change
  const selectedCountryOperators = useMemo(() => {
    return countries.find((c) => c.country === country)?.operators ?? []
  }, [countries, country])

  return (
    <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={onClose}>
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
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"
        >
          <CloseIcon />
        </button>

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

        <div className="mb-4">
          <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1.5">
            <MoneyIcon /> Montant du depot (FCFA)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value ? Number(e.target.value) : '')}
            placeholder="Ex: 5000"
            min={1000}
            className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none text-sm focus:border-emerald-400/40 placeholder:text-white/35"
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => onPresetSelect(preset)}
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

        <div className="mb-4">
          <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1.5">
            <PhoneIcon /> Numero de telephone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="Ex: 97 123 456"
            className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none text-sm focus:border-emerald-400/40 placeholder:text-white/35"
          />
        </div>

        <div className="mb-3">
          <label className="text-white/50 text-xs mb-2 flex items-center gap-1.5">
            <GlobeIcon /> Pays
          </label>
          <div className="grid grid-cols-2 gap-2">
            {countries.map((c) => (
              <button
                key={c.country}
                onClick={() => onCountrySelect(c.country)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 border text-left ${
                  country === c.country
                    ? 'border-emerald-400 bg-emerald-400/10 text-white shadow-[0_0_15px_rgba(0,200,150,0.15)]'
                    : 'border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <span className="text-lg flex-shrink-0">{c.flag}</span>
                <span className="truncate text-xs">{c.country}</span>
              </button>
            ))}
          </div>
        </div>

        {country && (
          <div className="mb-5">
            <label className="text-white/50 text-xs mb-2 flex items-center gap-1.5">
              <WifiIcon /> Operateur
            </label>
            <div className="grid grid-cols-2 gap-2">
              {selectedCountryOperators.map((op) => (
                <button
                  key={op}
                  onClick={() => onOperatorSelect(op)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 border ${
                    operator === op
                      ? 'border-emerald-400 bg-emerald-400/10 text-white shadow-[0_0_15px_rgba(0,200,150,0.15)]'
                      : 'border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  {operator === op && (
                    <span className="text-emerald-400 flex-shrink-0">
                      <CheckIcon />
                    </span>
                  )}
                  <span className={`truncate text-xs ${operator === op ? '' : 'pl-6'}`}>
                    {op}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onConfirm}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
        >
          <PaperPlaneIcon /> Initier le depot SebPay
        </button>
      </motion.div>
    </div>
  )
}