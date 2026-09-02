// app/depot/page.tsx
import SiteHeader from '@/components/SiteHeader'
import SiteNav from '@/components/SiteNav'
import DepotPageClient from '@/components/depot/DepotPageClient'

export default function DepotPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <SiteNav currentPath="/depot" />
      <div className="relative z-10 max-w-[700px] mx-auto px-4 sm:px-6 py-6 pb-32">
        <DepotPageClient />
      </div>
    </div>
  )
}