// components/retrait/overlays/WithdrawalConfirmationModal.tsx
'use client'

import { motion } from 'framer-motion'
import { CloseIcon, CheckCircleIcon } from '@/components/icons'

interface SummaryItem {
  label: string
  value: string | undefined
  highlight?: boolean
}

interface WithdrawalConfirmationModalProps {
  summaryItems: SummaryItem[]
  onConfirm: () => void
  onCancel: () => void
}

export default function WithdrawalConfirmationModal({
  summaryItems,
  onConfirm,
  onCancel
}: WithdrawalConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a]/85 backdrop-blur-xl z-[1000] flex items-center justify-center p-4" onClick={onCancel}>
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
          onClick={onCancel}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-red-500 hover:text-white transition-all"
        >
          <CloseIcon />
        </button>

        <div className="text-5xl text-emerald-400 mb-4">
          <CheckCircleIcon />
        </div>
        <h2 className="text-xl font-bold text-white mb-4">Confirmer le retrait</h2>

        <div className="space-y-3 text-left mb-6">
          {summaryItems.map((item, i) => (
            <div
              key={i}
              className={`flex justify-between items-center py-2 ${
                item.highlight ? 'border-t-2 border-emerald-400 mt-2 pt-3' : 'border-b border-white/[0.06]'
              }`}
            >
              <span className="text-white/50 text-sm">{item.label}</span>
              <span className="font-semibold text-sm text-emerald-400">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
          >
            <CloseIcon /> Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
          >
            <CheckCircleIcon /> Confirmer
          </button>
        </div>
      </motion.div>
    </div>
  )
}