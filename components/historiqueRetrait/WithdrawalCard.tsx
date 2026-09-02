// components/historiqueRetrait/WithdrawalCard.tsx
'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MoneyIcon, PhoneIcon, CalendarIcon } from '@/components/icons'
import { getStatusColors, getStatusLabel, formatDate } from '@/lib/withdrawalFormat'

// =====================================================
// ICÔNES SPÉCIFIQUES À LA CARTE
// =====================================================
const IdIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="3" y1="14" x2="21" y2="14" />
  </svg>
)

// =====================================================
// TYPES
// =====================================================
interface Withdrawal {
  id: number
  methode: string
  statut: string
  montant: number
  contact: string
  frais: number
  created_at: string
}

interface WithdrawalCardProps {
  withdrawal: Withdrawal
}

// =====================================================
// COMPOSANT CARTE
// =====================================================
function WithdrawalCard({ withdrawal }: WithdrawalCardProps) {
  // ✅ Calculs dérivés en interne avec useMemo
  const colors = useMemo(() => getStatusColors(withdrawal.statut), [withdrawal.statut])
  const statusLabel = useMemo(() => getStatusLabel(withdrawal.statut), [withdrawal.statut])
  const formattedDate = useMemo(() => formatDate(withdrawal.created_at), [withdrawal.created_at])
  const isMobileMoney = withdrawal.methode?.toLowerCase().includes('moov') || 
                         withdrawal.methode?.toLowerCase().includes('mtn')

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
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
          <span className={colors.text}>
            {isMobileMoney ? <PhoneIcon /> : <MoneyIcon />}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">
            Retrait {withdrawal.methode}
          </h3>
          <div className="flex items-center gap-3 text-xs text-white/50 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1">
              <IdIcon /> ID: #{String(withdrawal.id).padStart(6, '0')}
            </span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <MoneyIcon /> {withdrawal.montant.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${colors.badge}`}>
          {statusLabel}
        </span>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
          <div className="text-purple-400 text-[11px] font-medium mb-1">Details</div>
          <div className="text-white/55 text-xs leading-relaxed truncate">
            Retrait vers: {withdrawal.contact}
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
          <div className="text-purple-400 text-[11px] font-medium mb-1">Frais</div>
          <div className="text-white/55 text-xs leading-relaxed">
            {withdrawal.frais.toLocaleString('fr-FR')} FCFA
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="text-right text-white/40 text-[11px] flex items-center justify-end gap-1">
        <CalendarIcon /> {formattedDate}
      </div>
    </motion.div>
  )
}

export default memo(WithdrawalCard)