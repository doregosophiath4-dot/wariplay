// app/home/page.tsx
import SiteHeader from '@/components/SiteHeader'
import SiteNav from '@/components/SiteNav'
import HomePageClient from '@/components/home/HomePageClient'
import StaticFeatures from '@/components/home/StaticFeatures'
import { getWariCatalog } from '@/lib/wariCatalog'

export default function HomePage() {
  const { levels, games, paths } = getWariCatalog()

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />
      <SiteNav currentPath="/home" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 lg:pb-10">
        <HomePageClient
          staticFeatures={<StaticFeatures />}
          wariLevels={levels}
          wariGames={games}
          wariPaths={paths}
        />
      </div>
    </div>
  )
}