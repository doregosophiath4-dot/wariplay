// components/SiteNav.tsx
'use client'

import Link from 'next/link'
import {
  HomeIcon, TargetIcon, ListIcon, UserIcon,
  StoreIcon, GamepadIcon, ChartIcon, SettingsIcon,
} from './icons'

const navItems = [
  { href: '/home', icon: <HomeIcon />, label: 'Home' },
  { href: '/target', icon: <TargetIcon />, label: 'Target' },
  { href: '/ordre', icon: <ListIcon />, label: 'Ordre' },
  { href: '/profile', icon: <UserIcon />, label: 'Profil' },
  { href: '/store', icon: <StoreIcon />, label: 'Wari Store' },
  { href: '/Game', icon: <GamepadIcon />, label: 'Games' },
  { href: '/stats', icon: <ChartIcon />, label: 'Stats' },
  { href: '/parametre', icon: <SettingsIcon />, label: 'Parametres' }
]

interface SiteNavProps {
  currentPath: string
  sticky?: boolean
}

export default function SiteNav({ currentPath, sticky = false }: SiteNavProps) {
  const stickyClasses = sticky
    ? 'sticky top-0 bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-emerald-400/10'
    : ''

  return (
    <nav className={`relative z-10 flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none ${stickyClasses}`}>
      {navItems.map((item, i) => {
        const isActive = currentPath === item.href
        const isTarget = item.href === '/target'
        return (
          <div
            key={item.href}
            className="flex-shrink-0 animate-fade-in-left"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <Link
              href={item.href}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium
                transition-all duration-300 border whitespace-nowrap
                hover:-translate-y-1 active:scale-95
                ${isActive
                  ? 'bg-emerald-400/20 border-emerald-400/30 text-white shadow-[0_0_15px_rgba(0,200,150,0.15)]'
                  : isTarget
                  ? 'bg-orange-500/15 border-orange-500/30 text-white hover:bg-orange-500/25 hover:border-orange-500/50'
                  : 'bg-white/[0.04] border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.08]'}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </div>
        )
      })}
    </nav>
  )
}