// app/ordre/page.tsx
import SiteHeader from '@/components/SiteHeader'
import SiteNav from '@/components/SiteNav'
import OrdrePageClient from '@/components/ordre/OrdrePageClient'

export default function OrdrePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <SiteNav currentPath="/ordre" />
      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 py-6 pb-32">
        <OrdrePageClient />
      </div>
    </div>
  )
}