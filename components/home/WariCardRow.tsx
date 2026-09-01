// components/WariCardRow.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface WariCardItem {
  key: string | number
  img: string
  alt: string
  label: string
  onClick: () => void
}

interface WariCardRowProps {
  title: string
  items: WariCardItem[]
  orderMobile: number
  rowStartDesktop: number
}

const ROW_START_CLASSES: Record<number, string> = {
  3: 'lg:row-start-3',
  4: 'lg:row-start-4',
  5: 'lg:row-start-5',
}

export default function WariCardRow({ title, items, orderMobile, rowStartDesktop }: WariCardRowProps) {
  if (items.length === 0) return null
  
  const useScroll = items.length > 3
  const rowStartClass = ROW_START_CLASSES[rowStartDesktop] ?? ''

  return (
    <div className={`lg:col-span-3 ${rowStartClass} mt-8 lg:mt-0`} style={{ order: orderMobile }}>
      <h2 className="text-lg sm:text-xl font-bold text-white mb-3 lg:mb-4 relative inline-block after:absolute after:-bottom-1 after:left-0 after:w-10 after:h-0.5 after:rounded after:bg-gradient-to-r after:from-emerald-400 after:to-purple-400">
        {title}
      </h2>
      <div className={useScroll ? 'flex gap-3 lg:gap-4 overflow-x-auto pb-3 scrollbar-thin' : 'flex justify-center gap-3 lg:gap-4 pb-3'}>
        {items.map((item) => (
          <motion.div
            key={item.key}
            className={`${useScroll ? 'min-w-[130px] sm:min-w-[150px] lg:min-w-[180px] flex-shrink-0' : ''} rounded-2xl overflow-hidden border border-white/[0.06] cursor-pointer transition-all duration-300 relative`}
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
            whileHover={{ y: -5, borderColor: 'rgba(0,200,150,0.3)', boxShadow: '0 10px 30px rgba(0,200,150,0.15)' }}
            onClick={item.onClick}
          >
            <div className={`relative ${useScroll ? 'w-full' : 'w-[130px] sm:w-[150px] lg:w-[180px]'} h-24 sm:h-28 lg:h-36`}>
              <Image
                src={item.img}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 130px, (max-width: 1024px) 150px, 180px"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <p className="p-2.5 lg:p-3 text-xs sm:text-sm font-semibold text-white text-center">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}