// app/historique/page.tsx
import SiteHeader from '@/components/SiteHeader'
import SiteNav from '@/components/SiteNav'
import HistoriqueDepotPageClient from '@/components/historique/HistoriqueDepotPageClient'

export default function HistoriqueDepotPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <SiteNav currentPath="/historique" />
      <div className="relative z-10 w-full max-w-[700px] mx-auto px-4 sm:px-6 py-6 pb-32">
        <HistoriqueDepotPageClient />
      </div>
    </div>
  )
}