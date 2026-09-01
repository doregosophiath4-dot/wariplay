// app/Game/page.tsx
import SiteHeader from '@/components/SiteHeader'
import SiteNav from '@/components/SiteNav'
import GamesPageClient from '@/components/games/GamesPageClient'

export default function GamesPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <SiteNav currentPath="/Game" sticky />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
        <GamesPageClient />
      </div>
    </div>
  )
}