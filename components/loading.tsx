// components/loading.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface LoadingProps {
  show: boolean
  text?: string
}

export default function Loading({ show, text = 'Chargement en cours...' }: LoadingProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-[#0a0a1a]/95 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center gap-8">
          <div className="w-20 h-20 rounded-full border-[3px] border-transparent border-t-emerald-400 border-r-purple-400 border-b-orange-500 animate-spin shadow-[0_0_30px_rgba(0,200,150,0.2)]" />
          <p className="text-white/70 text-base font-medium animate-pulse">{text}</p>
        </div>
      )}
    </AnimatePresence>
  )
}