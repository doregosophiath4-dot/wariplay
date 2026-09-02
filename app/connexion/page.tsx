// app/connexion/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import ConnexionPageClient from '@/components/connexion/ConnexionPageClient'

export default function ConnexionPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth('')

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, rediriger vers /home
    if (!loading && isAuthenticated) {
      router.replace('/home')
    }
  }, [isAuthenticated, loading, router])

  // Pendant le chargement, afficher un spinner
  if (loading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-[#0a0a1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Vérification en cours...</p>
        </div>
      </div>
    )
  }

  // Si l'utilisateur est déjà connecté, ne pas afficher la page
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen w-full flex justify-center items-center relative">
      <ConnexionPageClient />
    </div>
  )
}