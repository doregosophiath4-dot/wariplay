// app/historique-retraits/page.tsx
import SiteHeader from '@/components/SiteHeader'
import SiteNav from '@/components/SiteNav'
import HistoriqueRetraitPageClient from '@/components/historiqueRetrait/HistoriqueRetraitPageClient'

export default function HistoriqueRetraitPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <SiteNav currentPath="/historique-retraits" />
      <div className="relative z-10 w-full max-w-[700px] mx-auto px-4 sm:px-6 py-6 pb-32">
        <HistoriqueRetraitPageClient />
      </div>
    </div>
  )
}