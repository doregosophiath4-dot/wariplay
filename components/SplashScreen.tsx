'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './SplashScreen.module.css'

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('splashSeen')
    
    if (hasSeenSplash) {
      setShowSplash(false)
      return
    }

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
      setShowSplash(false)
      sessionStorage.setItem('splashSeen', 'true')
    }, 3000)

    return () => {
      clearTimeout(timer)
      clearInterval(countInterval)
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className={styles.splash}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            {/* Cercles décoratifs */}
            <div className={styles.bgDecor}>
              <motion.div
                className={`${styles.bgCircle} ${styles.circle1}`}
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className={`${styles.bgCircle} ${styles.circle2}`}
                animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className={`${styles.bgCircle} ${styles.circle3}`}
                animate={{ scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Étoiles scintillantes en CSS pur (pas de Math.random) */}
            <div className={styles.stars}>
              <div className={`${styles.star} ${styles.star1}`} />
              <div className={`${styles.star} ${styles.star2}`} />
              <div className={`${styles.star} ${styles.star3}`} />
              <div className={`${styles.star} ${styles.star4}`} />
              <div className={`${styles.star} ${styles.star5}`} />
              <div className={`${styles.star} ${styles.star6}`} />
              <div className={`${styles.star} ${styles.star7}`} />
              <div className={`${styles.star} ${styles.star8}`} />
              <div className={`${styles.star} ${styles.star9}`} />
              <div className={`${styles.star} ${styles.star10}`} />
              <div className={`${styles.star} ${styles.star11}`} />
              <div className={`${styles.star} ${styles.star12}`} />
            </div>

            {/* Contenu principal */}
            <div className={styles.content}>
              <motion.div
                className={styles.logoWrapper}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 }}
              >
                <div className={styles.logoGlow} />
                <motion.div
                  className={styles.logoContainer}
                  animate={{
                    boxShadow: [
                      '0 0 30px rgba(0, 255, 153, 0.3)',
                      '0 0 60px rgba(0, 255, 153, 0.5)',
                      '0 0 30px rgba(0, 255, 153, 0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <img src="/img/wari.png" alt="WariPlay Logo" className={styles.logo} />
                </motion.div>
              </motion.div>

              <motion.div
                className={styles.loaderWrapper}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className={styles.loader}>
                  <motion.div
                    className={styles.loaderBar}
                    animate={{ left: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: '60%' }}
                  />
                </div>
                <div className={styles.loaderDots}>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className={styles.dot}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                className={styles.textWrapper}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <motion.span
                  className={styles.text}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Chargement en cours
                </motion.span>
              </motion.div>

              <motion.div
                className={styles.countdownWrapper}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <motion.span
                  className={styles.countdown}
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {countdown}
                </motion.span>
                <span className={styles.countdownLabel}>s</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && children}
    </>
  )
}