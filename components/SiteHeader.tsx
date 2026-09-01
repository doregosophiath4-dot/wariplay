// components/SiteHeader.tsx
import Image from 'next/image'

export default function SiteHeader() {
  return (
    <header className="relative z-10 flex items-center justify-center pt-6 pb-3 animate-fade-in-down">
      <Image
        src="/img/amimatelogo.gif"
        alt="WariPlay"
        width={200}
        height={56}
        priority
        unoptimized // ⚠️ nécessaire : l'optimiseur de next/image convertit
                    // en WebP/AVIF et casserait l'animation du GIF
        className="h-12 sm:h-14 w-auto drop-shadow-[0_0_15px_rgba(0,200,150,0.5)] animate-logo-glow"
      />
    </header>
  )
}