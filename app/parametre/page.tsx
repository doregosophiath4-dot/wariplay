// app/parametre/page.tsx
import SiteHeader from '@/components/SiteHeader'
import SiteNav from '@/components/SiteNav'
import ParametrePageClient from '@/components/parametre/ParametrePageClient'

export default function ParametrePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <SiteNav currentPath="/parametre" />
      <div className="relative z-10 max-w-[600px] mx-auto px-4 sm:px-6 py-6 pb-32">
        <ParametrePageClient />
      </div>
    </div>
  )
}