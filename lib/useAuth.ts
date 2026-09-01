// lib/useAuth.ts
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWithAllTokens, initAll } from '@/lib/api'

export function useAuth(redirectTo = '/connexion') {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        await initAll()
        const res = await fetchWithAllTokens('/api/is_logged_in')
        const data = await res.json()

        if (!data.authenticated) {
          router.replace(redirectTo)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.replace(redirectTo)
      }
    }

    checkAuth()
  }, [redirectTo, router])
}