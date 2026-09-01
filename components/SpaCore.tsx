'use client'

import { useEffect, useRef } from 'react'
import { initAll, detectDevTools, validateWariToken, refreshJWT } from '@/lib/api'

export default function SpaCore() {
  const validateRef = useRef<NodeJS.Timeout | null>(null)
  const devToolsRef = useRef<NodeJS.Timeout | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || initialized.current) return
    initialized.current = true

    // 1. Initialiser tout (CSRF, Fingerprint, JWT, WariToken)
    initAll()

    // 2. Événements login/register success → rafraîchir le JWT
    const handleLoginSuccess = async () => {
      await refreshJWT()
    }
    const handleRegisterSuccess = async () => {
      await refreshJWT()
    }

    document.addEventListener('login-success', handleLoginSuccess)
    document.addEventListener('register-success', handleRegisterSuccess)

    // 3. Bloquer F12 / clic droit
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault()
        return false
      }
    }
    const handleContextMenu = (e: MouseEvent) => {
      if (detectDevTools()) e.preventDefault()
    }

    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('contextmenu', handleContextMenu, true)

    // 4. Validation périodique du Wari Token (toutes les 2 minutes)
    validateRef.current = setInterval(() => {
      validateWariToken()
    }, 150000)

    // 5. DevTools monitoring toutes les secondes
    devToolsRef.current = setInterval(() => {
      detectDevTools()
    }, 1000)

    // Nettoyage
    return () => {
      document.removeEventListener('login-success', handleLoginSuccess)
      document.removeEventListener('register-success', handleRegisterSuccess)
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('contextmenu', handleContextMenu, true)
      if (validateRef.current) clearInterval(validateRef.current)
      if (devToolsRef.current) clearInterval(devToolsRef.current)
    }
  }, [])

  return null
}