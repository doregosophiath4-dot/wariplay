'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

// =====================================================
// SVG ICONS
// =====================================================
const ClockIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const ConstructionIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </svg>
)

const AlertCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export default function GameUnavailablePage() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/Game')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: '#0F0F1E' }}>
      
      {/* Orbs lumineux décoratifs */}
      <div
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0 -top-[20%] -left-[10%]"
        style={{
          background: 'radial-gradient(circle, rgba(255,180,50,0.06) 0%, transparent 70%)',
          filter: 'blur(100px)'
        }}
      />
      <div
        className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0 -bottom-[15%] -right-[10%]"
        style={{
          background: 'radial-gradient(circle, rgba(255,150,30,0.04) 0%, transparent 70%)',
          filter: 'blur(100px)'
        }}
      />

      {/* Contenu principal */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 py-12">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          
          {/* Carte centrale */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-8 bg-amber-400/5 rounded-3xl blur-3xl" />
            
            <div
              className="relative rounded-3xl overflow-hidden border border-amber-400/10 shadow-2xl"
              style={{
                background: 'linear-gradient(160deg, rgba(30,30,50,0.95), rgba(25,25,45,0.95), rgba(20,20,40,0.95))'
              }}
            >
              
              {/* Badge "Indisponible" */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <motion.div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-[#0F0F1E] px-5 py-1.5 rounded-full font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  <span>INDISPONIBLE</span>
                </motion.div>
              </div>

              {/* Contenu */}
              <div className="pt-14 pb-8 px-6 sm:px-10 text-center">
                
                {/* Icône */}
                <motion.div
                  className="flex justify-center mb-5"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl" />
                    <div className="relative text-amber-400/70">
                      <ConstructionIcon />
                    </div>
                  </div>
                </motion.div>

                {/* Titre */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Jeu Indisponible
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-amber-400/50 mb-3">
                    <ClockIcon />
                  </div>
                </motion.div>

                {/* Message */}
                <motion.div
                  className="space-y-2 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                    Ce jeu n&apos;est pas disponible pour le moment.
                  </p>
                  <p className="text-white/40 text-xs sm:text-sm leading-relaxed">
                    Notre équipe travaille actuellement à son amélioration pour vous offrir la meilleure expérience possible.
                  </p>
                </motion.div>

                {/* Barre de progression */}
                <motion.div
                  className="w-full bg-white/[0.04] rounded-full h-1 mb-6 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400/50 via-orange-400/50 to-amber-400/50"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    style={{ width: '100%' }}
                  />
                </motion.div>

                {/* Info */}
                <motion.div
                  className="bg-amber-400/5 border border-amber-400/10 rounded-xl p-3 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="text-amber-400/50 mt-0.5 flex-shrink-0">
                      <AlertCircleIcon />
                    </div>
                    <p className="text-white/30 text-xs text-left leading-relaxed">
                      Nous vous invitons à réessayer ultérieurement ou à explorer nos autres jeux disponibles.
                    </p>
                  </div>
                </motion.div>

                {/* Boutons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <button
                    onClick={handleGoBack}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:border-amber-400/30 hover:bg-amber-400/5 transition-all duration-300 group"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform duration-300">
                      <ArrowLeftIcon />
                    </span>
                    <span className="text-sm font-medium">Retour</span>
                  </button>

                  <button
                    onClick={handleGoHome}
                    className="flex-1 px-5 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-[#0F0F1E] hover:from-amber-500 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Voir les jeux disponibles
                  </button>
                </motion.div>

              </div>
            </div>
          </div>

          {/* Footer */}
          <motion.p
            className="text-center text-white/15 text-xs mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Merci de votre patience et compréhension
          </motion.p>

        </motion.div>
      </div>
    </div>
  )
}