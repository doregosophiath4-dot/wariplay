// components/retrait/overlays/RetraitAmountOverlay.tsx
'use client'

import { motion } from 'framer-motion'
import { CloseIcon, CoinsIcon, MoneyIcon, WifiIcon, PaperPlaneIcon } from '@/components/icons'

interface CountryNetwork {
  country: string
  countryCode: string
  networks: { value: string; label: string }[]
}

interface RetraitAmountOverlayProps {
  methodName: string
  selectedMethod: string | null
  amount: number | ''
  activeAmount: number | null
  presets: number[]
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  network: string
  availableCountries: CountryNetwork[]
  availableNetworks: { value: string; label: string }[]
  onAmountChange: (v: number | '') => void
  onPresetSelect: (v: number) => void
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onCountryChange: (v: string) => void
  onNetworkChange: (v: string) => void
  onConfirm: () => void
  onClose: () => void
}

export default function RetraitAmountOverlay({
  methodName,
  selectedMethod,
  amount,
  activeAmount,
  presets,
  firstName,
  lastName,
  email,
  phone,
  country,
  network,
  availableCountries,
  availableNetworks,
  onAmountChange,
  onPresetSelect,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onCountryChange,
  onNetworkChange,
  onConfirm,
  onClose
}: RetraitAmountOverlayProps) {
  const personalFields = [
    { label: 'Prenom', value: firstName, setter: onFirstNameChange, placeholder: 'Ex: Jean', type: 'text' },
    { label: 'Nom', value: lastName, setter: onLastNameChange, placeholder: 'Ex: Dupont', type: 'text' },
    ...(selectedMethod === 'fedapay' ? [
      { label: 'Adresse email', value: email, setter: onEmailChange, placeholder: 'Ex: exemple@mail.com', type: 'email' as const }
    ] : []),
    { label: 'Numero de telephone', value: phone, setter: onPhoneChange, placeholder: 'Ex: 22997000000', type: 'tel' }
  ]

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

        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          <CoinsIcon /> Montant du retrait
        </h3>
        <p className="text-white/50 text-sm mb-5">
          Methode : <strong className="text-white">{methodName}</strong>
        </p>

        {/* Montant */}
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
            max={500000}
            className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none text-sm focus:border-emerald-400/40 placeholder:text-white/35"
          />
        </div>

        {/* Champs personnels */}
        {personalFields.map((field, i) => (
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
                onClick={() => onCountryChange(c.countryCode)}
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
                  onClick={() => onNetworkChange(n.value)}
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
          <PaperPlaneIcon /> Demander le retrait
        </button>
      </motion.div>
    </div>
  )
}