// components/ordre/NiveauCard.tsx
'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { HeartSmallIcon as HeartIcon, PlayIcon } from '@/components/icons'

interface NiveauData {
  niveau: number
  benefice: number
  taux: string
  vies: number
  niveauSuivant: number | string
  dureeTexte: string
  renouvellementTotalSeconds: number
  renouvellementRemaining: number // calculé dans le parent
}

interface NiveauCardProps {
  niveau: NiveauData
  onPlay: (n: number, v: number, b: number) => void
}

function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return 'Termine'

  // ✅ Arrondir pour éviter les décimales à rallonge (ex: 45.674747584785...s)
  const totalSeconds = Math.floor(seconds)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  return [days > 0 ? `${days}j` : '', `${hours}h`, `${mins}m`, `${secs}s`].filter(Boolean).join(' ')
}

const NiveauCard = memo(function NiveauCard({ niveau, onPlay }: NiveauCardProps) {
  const progress = niveau.renouvellementTotalSeconds > 0
    ? 100 - Math.round((niveau.renouvellementRemaining / niveau.renouvellementTotalSeconds) * 100)
    : 0

  return (
    <motion.div
      className="rounded-2xl p-5 border border-emerald-400/10 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-emerald-400/25"
      style={{ background: 'linear-gradient(160deg, rgba(26,26,46,0.8), rgba(22,33,62,0.7))', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}
      whileHover={{ y: -6 }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-b bg-gradient-to-r from-emerald-400 to-purple-400" />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{niveau.niveau}</h2>
        <span className="bg-emerald-400/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/25">
          Actif
        </span>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>Renouvellement : {formatRemainingTime(niveau.renouvellementRemaining)}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-purple-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { l: 'Benefice', v: `${niveau.benefice} FCFA` },
          {
            l: 'Vies restantes',
            v: (
              <span className="flex items-center justify-center gap-1">
                <span className="text-red-400"><HeartIcon /></span>
                {niveau.vies}
              </span>
            )
          },
          { l: 'Temps restant', v: niveau.dureeTexte },
          { l: 'Niveau suivant', v: niveau.niveauSuivant }
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.06]">
            <p className="text-xs text-white/50 mb-1">{s.l}</p>
            <p className="text-sm font-bold text-emerald-400">{s.v}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => onPlay(niveau.niveau, niveau.vies, niveau.benefice)}
        className="w-full py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
      >
        <PlayIcon /> Jouer
      </button>
    </motion.div>
  )
})

export default NiveauCard