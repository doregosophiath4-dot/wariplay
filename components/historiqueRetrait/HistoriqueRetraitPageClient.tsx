// components/historiqueRetrait/HistoriqueRetraitPageClient.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { 
  HistoryIcon,
  WarningIcon,
  RefreshIcon,
  FolderIcon
} from '@/components/icons'
import Loading from '@/components/loading'
import WithdrawalCard from './WithdrawalCard'

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

type FilterKey = 'all' | 'completed' | 'pending' | 'failed'

// =====================================================
// CONSTANTES STATIQUES (hors du composant)
// =====================================================
const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'completed', label: 'Completes' },
  { key: 'pending', label: 'En attente' },
  { key: 'failed', label: 'Echoues' }
] as const

export default function HistoriqueRetraitPageClient() {
  useAuth()
  
  const [filter, setFilter] = useState<FilterKey>('all')
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // =====================================================
  // CHARGEMENT DES DONNEES
  // =====================================================
  const loadWithdrawalHistory = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      await initAll()
      const response = await fetchWithAllTokens('/api/historique-retraits')

      if (!response.ok) {
        throw new Error('Erreur reseau: ' + response.status)
      }

      const data = await response.json()
      const historyData: Withdrawal[] = Array.isArray(data?.data) ? data.data : []

      setWithdrawals(historyData)
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      setErrorMessage(error.message || "Erreur lors du chargement de l'historique")
    }
  }

  useEffect(() => {
    loadWithdrawalHistory()
  }, [])

  // =====================================================
  // FILTRAGE - MEMOISÉ
  // =====================================================
  const filteredWithdrawals = useMemo(() => {
    return filter === 'all' 
      ? withdrawals 
      : withdrawals.filter(w => w.statut?.toLowerCase() === filter)
  }, [filter, withdrawals])

  // =====================================================
  // RENDU
  // =====================================================
  return (
    <>
      {/* ============================================ */}
      {/* LOADING - Composant partagé */}
      {/* ============================================ */}
      <Loading show={loading} text="Chargement en cours..." />

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2.5 mb-2">
          <span className="text-emerald-400">
            <HistoryIcon />
          </span>
          Historique des retraits
        </h1>
        <p className="text-white/50 text-sm">Consultez l&apos;historique de vos demandes de retrait</p>
      </div>

      {/* ============================================ */}
      {/* FILTERS - Utilise FILTERS constante */}
      {/* ============================================ */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none justify-center flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as FilterKey)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border whitespace-nowrap ${
              filter === f.key
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/30'
                : 'bg-white/[0.04] border-white/[0.08] text-white/70 hover:bg-white/[0.08]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ============================================ */}
      {/* ERROR STATE */}
      {/* ============================================ */}
      <AnimatePresence>
        {!loading && errorMessage && (
          <motion.div
            className="flex flex-col items-center justify-center py-16 text-white/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4 text-orange-400">
              <WarningIcon />
            </div>
            <p className="text-sm mb-4">{errorMessage}</p>
            <button
              onClick={loadWithdrawalHistory}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all"
            >
              <RefreshIcon /> Reessayer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* EMPTY STATE */}
      {/* ============================================ */}
      <AnimatePresence>
        {!loading && !errorMessage && filteredWithdrawals.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-16 text-white/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4 opacity-50">
              <FolderIcon />
            </div>
            <p className="text-sm">Aucun historique de retrait disponible</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* HISTORY LIST - Utilise WithdrawalCard */}
      {/* ============================================ */}
      {filteredWithdrawals.length > 0 && (
        <div className="flex flex-col gap-3.5">
          {filteredWithdrawals.map((withdrawal) => (
            <WithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
          ))}
        </div>
      )}
    </>
  )
}