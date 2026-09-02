'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/useAuth'

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [countdown, setCountdown] = useState(3)
  const router = useRouter()
  
  // Utilisation directe du hook useAuth existant
  useAuth() // Redirige automatiquement vers /connexion si non authentifié

  useEffect(() => {
    const countInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        router.push('/home') // Si on arrive ici, c'est que l'utilisateur est connecté
      }, 800)
    }, 3000)

    return () => {
      clearTimeout(timer)
      clearInterval(countInterval)
    }
  }, [router])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex justify-center items-center z-[10000] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Image de fond */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/img/bg.jpg')" }}
          />

          {/* Overlay sombre pour la lisibilité */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Contenu principal */}
          <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8">
            
            {/* Logo avec glow */}
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <div className="absolute w-[100px] h-[100px] rounded-full bg-[radial-gradient(circle,rgba(0,255,153,0.2)_0%,transparent_70%)] blur-[20px]" />
              <motion.div
                className="w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-emerald-400/15 flex items-center justify-center relative z-10"
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(0, 255, 153, 0.3)',
                    '0 0 60px rgba(0, 255, 153, 0.5)',
                    '0 0 30px rgba(0, 255, 153, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img
                  src="/img/wari.png"
                  alt="WariPlay Logo"
                  className="w-[55px] h-[55px] sm:w-[60px] sm:h-[60px] object-contain drop-shadow-[0_0_10px_rgba(0,255,153,0.3)]"
                />
              </motion.div>
            </motion.div>

            {/* Loader stylise */}
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="w-[100px] sm:w-[120px] h-[3px] bg-white/[0.08] rounded-full overflow-hidden relative">
                <motion.div
                  className="absolute top-0 h-full rounded-full bg-gradient-to-r from-transparent via-emerald-400 via-cyan-400 via-emerald-400 to-transparent w-[60%]"
                  animate={{ left: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-[5px] h-[5px] rounded-full bg-emerald-400"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Texte anime */}
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.span
                className="text-sm sm:text-base text-white/80 font-light tracking-[2px] uppercase font-['Poppins',system-ui,sans-serif]"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Chargement en cours
              </motion.span>
            </motion.div>
          </div>

          {/* Compte a rebours */}
          <motion.div
            className="absolute bottom-5 sm:bottom-8 right-5 sm:right-8 flex items-baseline gap-0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.span
              className="text-2xl sm:text-3xl font-bold text-emerald-400 drop-shadow-[0_0_20px_rgba(0,255,153,0.4)] font-['Montserrat',system-ui,sans-serif]"
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {countdown}
            </motion.span>
            <span className="text-sm text-emerald-400/50 font-medium">s</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}