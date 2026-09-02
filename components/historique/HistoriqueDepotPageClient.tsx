// components/historique/HistoriqueDepotPageClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { 
  MoneyIcon,
  WarningIcon,
  FolderIcon,
  RefreshIcon
} from '@/components/icons'
import Loading from '@/components/loading'
import DepositCard from './DepositCard'


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

export default function HistoriqueDepotPageClient() {
  useAuth()
  
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // =====================================================
  // CHARGEMENT DES DONNEES
  // =====================================================
  const loadDeposits = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      await initAll()
      const res = await fetchWithAllTokens('/api/historique_depots')
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`)
      const data = await res.json()

      let depositsArray: any[] = []

      if (Array.isArray(data)) {
        depositsArray = data
      } else if (data && typeof data === 'object') {
        if (data.deposits && Array.isArray(data.deposits)) {
          depositsArray = data.deposits
        } else if (data.data && Array.isArray(data.data)) {
          depositsArray = data.data
        } else {
          for (const [, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
              depositsArray = value
              break
            }
          }
        }
      }

      const loadedDeposits: Deposit[] = depositsArray.map((d: any, index: number) => ({
        transfer_id: d.transfer_id || d.id || `DEP-${index}`,
        amount: d.amount || 0,
        method: d.method || d.payment_method || 'Depot',
        status: 'completed',
        created_at: d.created_at || d.date || d.timestamp || 'Date inconnue',
        text_extrait: d.text_extrait || d.extrait || d.message || ''
      }))

      setDeposits(loadedDeposits)
    } catch (error: any) {
      setErrorMessage(error.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeposits()
  }, [])

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
            <MoneyIcon />
          </span>
          Historique des Depots
        </h1>
        <p className="text-white/50 text-sm">Retrouvez tous vos depots effectues</p>
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
            <div className="mb-4 opacity-50">
              <WarningIcon />
            </div>
            <p className="text-sm mb-4">{errorMessage}</p>
            <button
              onClick={loadDeposits}
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
        {!loading && !errorMessage && deposits.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-16 text-white/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4 opacity-50">
              <FolderIcon />
            </div>
            <p className="text-sm mb-4">Aucun depot enregistre</p>
            <button
              onClick={loadDeposits}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all"
            >
              <RefreshIcon /> Actualiser
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* DEPOSITS LIST */}
      {/* ============================================ */}
      {!loading && !errorMessage && deposits.length > 0 && (
        <div className="flex flex-col gap-3.5">
          {deposits.map((deposit) => (
            <DepositCard key={deposit.transfer_id} deposit={deposit} />
          ))}
        </div>
      )}
    </>
  )
}