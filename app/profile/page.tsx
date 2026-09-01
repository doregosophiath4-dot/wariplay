// app/profile/page.tsx
import SiteHeader from '@/components/SiteHeader'
import SiteNav from '@/components/SiteNav'
import ProfilPageClient from '@/components/profile/ProfilPageClient'

export default function ProfilPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <SiteNav currentPath="/profile" />
      <div className="relative z-10 max-w-[680px] mx-auto px-4 sm:px-6 py-6 pb-32">
        <ProfilPageClient />
      </div>
    </div>
  )
}