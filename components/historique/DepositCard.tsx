// components/historique/DepositCard.tsx
'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircleIcon, MoneyIcon, CalendarIcon } from '@/components/icons'

// =====================================================
// ICÔNES SPÉCIFIQUES À LA CARTE
// =====================================================
const FileIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

// =====================================================
// TYPES
// =====================================================
interface Deposit {
  transfer_id: string
  amount: number
  method: string
  status: string
  created_at: string
  text_extrait: string
}

interface DepositCardProps {
  deposit: Deposit
}

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================
function formatExtrait(extrait: string | undefined): string {
  if (!extrait) return 'Aucun extrait disponible'
  return extrait.replace(/\n/g, '<br>')
}

// =====================================================
// COMPOSANT CARTE
// =====================================================
function DepositCard({ deposit }: DepositCardProps) {
  return (
    <motion.div
      className="rounded-2xl p-4 sm:p-5 border border-emerald-400/10 relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ 
        background: 'linear-gradient(160deg, rgba(26,26,46,0.85), rgba(22,33,62,0.75))', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)' 
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      whileHover={{ y: -3 }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />

      {/* Top Row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center flex-shrink-0">
          <span className="text-emerald-400"><CheckCircleIcon /></span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{deposit.method}</h3>
          <div className="flex items-center gap-3 text-xs text-white/50 mt-0.5">
            <span>Ref: {deposit.transfer_id}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-400/15 text-emerald-400">
              Complete
            </span>
          </div>
          <div className="font-bold text-emerald-400 text-sm mt-1 flex items-center gap-1">
            <MoneyIcon /> +{deposit.amount.toLocaleString()} FCFA
          </div>
        </div>
      </div>

      {/* Extrait */}
      <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
        <div className="text-purple-400 text-[11px] font-medium mb-1 flex items-center gap-1">
          <FileIcon /> Extrait
        </div>
        <div
          className="text-white/55 text-xs leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatExtrait(deposit.text_extrait) }}
        />
      </div>

      {/* Date */}
      <div className="text-right mt-3 text-white/40 text-[11px] flex items-center justify-end gap-1">
        <CalendarIcon /> {deposit.created_at}
      </div>
    </motion.div>
  )
}

export default memo(DepositCard)