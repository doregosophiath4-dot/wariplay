// app/achat/page.tsx
'use client'

import AchatPageClient from '@/components/achat/AchatPageClient'

export default function AchatPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="relative z-10 min-h-screen">
        <AchatPageClient />
      </div>
    </div>
  )
}