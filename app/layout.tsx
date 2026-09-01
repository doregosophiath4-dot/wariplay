import type { Metadata } from 'next'
import { Montserrat, Poppins } from 'next/font/google'
import SplashScreen from '@/components/SplashScreen'
import AnimatedBackground from '@/components/AnimatedBackground'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-montserrat'
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'WariPlay - Joue Gagne Répète',
  description: 'WariPlay - Joue - Gagne - Répète',
  icons: { icon: '/img/wari.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${montserrat.variable} ${poppins.variable} text-white`} style={{ background: '#0a0a1a' }}>
        <SplashScreen>
          <AnimatedBackground />
          <div className="relative z-10 min-h-screen overflow-x-hidden">
            {children}
          </div>
        </SplashScreen>
      </body>
    </html>
  )
}