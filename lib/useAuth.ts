// lib/useAuth.ts
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWithAllTokens, initAll } from '@/lib/api'

interface AuthState {
  user: any | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth(redirectTo = '/connexion'): AuthState {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      setLoading(true)
      try {
        await initAll()
        const res = await fetchWithAllTokens('/api/is_logged_in')
        const data = await res.json()

        if (data.authenticated) {
          setUser(data.user || {})
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
          if (redirectTo) {
            router.replace(redirectTo)
          }
        }
      } catch (error) {
        setUser(null)
        setIsAuthenticated(false)
        if (redirectTo) {
          router.replace(redirectTo)
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [redirectTo, router])

  return { user, loading, isAuthenticated }
}