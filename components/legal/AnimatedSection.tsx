// components/legal/AnimatedSection.tsx
'use client'

import { motion } from 'framer-motion'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  trigger?: 'onMount' | 'onScroll'
}

export default function AnimatedSection({
  children,
  className,
  trigger = 'onScroll'
}: AnimatedSectionProps) {
  const viewportProps = trigger === 'onScroll'
    ? {
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true }
      }
    : {
        animate: { opacity: 1, y: 0 }
      }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.6 }}
      {...viewportProps}
    >
      {children}
    </motion.div>
  )
}