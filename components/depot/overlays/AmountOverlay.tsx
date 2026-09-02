// components/depot/overlays/AmountOverlay.tsx
'use client'

import { motion } from 'framer-motion'
import { CloseIcon, CoinsIcon, MoneyIcon, PhoneIcon, PaperPlaneIcon } from '@/components/icons'

interface AmountOverlayProps {
  methodName: string
  amount: number | ''
  phone: string
  showPhoneField: boolean
  activeAmount: number | null
  presets: number[]
  onAmountChange: (v: number | '') => void
  onPhoneChange: (v: string) => void
  onPresetSelect: (v: number) => void
  onConfirm: () => void
  onClose: () => void
}

export default function AmountOverlay({
  methodName,
  amount,
  phone,
  showPhoneField,
  activeAmount,
  presets,
  onAmountChange,
  onPhoneChange,
  onPresetSelect,
  onConfirm,
  onClose
}: AmountOverlayProps) {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={onClose}>
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
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"
        >
          <CloseIcon />
        </button>

        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <CoinsIcon /> Montant du depot
        </h3>
        <p className="text-white/50 text-sm mb-5">
          Methode : <strong className="text-white">{methodName}</strong>
        </p>

        <div className="mb-4">
          <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1.5">
            <MoneyIcon /> Entrez le montant (FCFA)
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

        {showPhoneField && (
          <div className="mb-4">
            <label className="text-white/50 text-xs mb-1.5 flex items-center gap-1.5">
              <PhoneIcon /> Numero de telephone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="Ex: 771234567"
              className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none text-sm focus:border-emerald-400/40 placeholder:text-white/35"
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 mb-5">
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

        <button
          onClick={onConfirm}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
        >
          <PaperPlaneIcon /> Envoyer
        </button>
      </motion.div>
    </div>
  )
}