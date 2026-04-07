'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// Page transition wrapper — ported from abt-mj's framer-motion fade + y-slide.
// Wrap each section (Profile/Experience/etc) so route changes animate.

export function TemplateLayout({
  children,
  keyName,
}: {
  children: ReactNode
  keyName?: string
}) {
  return (
    <motion.div
      key={keyName}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex min-h-[calc(100vh-8rem)] w-full items-start justify-center px-4 pb-32 pt-12"
    >
      {children}
    </motion.div>
  )
}
