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
        <motion.div
          className="fixed inset-0 bg-[#0a0a1a]/95 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Loader minimal */}
          <div className="relative w-12 h-12">
            <motion.div
              className="absolute inset-0 rounded-full border-[3px] border-transparent"
              style={{
                borderTopColor: '#00c896',
                borderRightColor: '#6c5ce7',
                borderBottomColor: '#00c896',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Noyau lumineux */}
            <div className="absolute inset-[6px] rounded-full bg-emerald-400/10 blur-sm" />
          </div>

          {/* Texte */}
          <motion.p
            className="text-white/50 text-sm font-medium tracking-wider"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {text}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}