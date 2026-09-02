// app/retrait/page.tsx
import SiteHeader from '@/components/SiteHeader'
import SiteNav from '@/components/SiteNav'
import RetraitPageClient from '@/components/retrait/RetraitPageClient'

export default function RetraitPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <SiteNav currentPath="/retrait" />
      <div className="relative z-10 max-w-[700px] mx-auto px-4 sm:px-6 py-6 pb-32">
        <RetraitPageClient />
      </div>
    </div>
  )
}