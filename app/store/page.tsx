// app/store/page.tsx
import SiteHeader from '@/components/SiteHeader'
import SiteNav from '@/components/SiteNav'
import StorePageClient from '@/components/store/StorePageClient'

export default function StorePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <SiteNav currentPath="/store" />
      <div className="relative z-10 w-full px-4 sm:px-6 py-6 pb-32">
        <StorePageClient />
      </div>
    </div>
  )
}