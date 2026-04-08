'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Briefcase, Wrench, FolderKanban, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

// Fixed bottom nav — ported from abt-mj/components/menu. Uses the hover-tooltip
// MenuBar pattern but with lucide icons and plain anchors (router-agnostic;
// caller passes hrefs + pathname).

export interface MenuBarItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  href: string
  onClick?: (e: React.MouseEvent) => void
}

interface MenuBarProps {
  items: MenuBarItem[]
  activeHref?: string
  className?: string
}

const springConfig = { duration: 0.3, ease: 'easeInOut' as const }

export function MenuBar({ items, activeHref, className }: MenuBarProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const [tooltipPosition, setTooltipPosition] = React.useState({ left: 0, width: 0 })

  React.useEffect(() => {
    if (activeIndex !== null && menuRef.current && tooltipRef.current) {
      const menuItem = menuRef.current.children[activeIndex] as HTMLElement
      const menuRect = menuRef.current.getBoundingClientRect()
      const itemRect = menuItem.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const left =
        itemRect.left - menuRect.left + (itemRect.width - tooltipRect.width) / 2
      setTooltipPosition({
        left: Math.max(0, Math.min(left, menuRect.width - tooltipRect.width)),
        width: tooltipRect.width,
      })
    }
  }, [activeIndex])

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={springConfig}
            className="pointer-events-none absolute -top-[36px] left-0 right-0 z-50"
          >
            <motion.div
              ref={tooltipRef}
              className={cn(
                'bg-background/95 border-border/50 inline-flex h-7 items-center justify-center overflow-hidden rounded-lg border px-3 backdrop-blur',
                'shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
              )}
              initial={{ x: tooltipPosition.left }}
              animate={{ x: tooltipPosition.left }}
              transition={springConfig}
              style={{ width: 'auto' }}
            >
              <p className="whitespace-nowrap text-[13px] font-medium leading-tight">
                {items[activeIndex].label}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={menuRef}
        className={cn(
          'bg-background/95 border-border/50 z-10 inline-flex h-10 items-center justify-center gap-[3px] overflow-hidden rounded-full border px-1.5 backdrop-blur',
          'shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_8px_16px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_16px_-4px_rgba(0,0,0,0.2)]'
        )}
      >
        {items.map((item, index) => {
          const isActive =
            item.href === activeHref ||
            (item.href !== '/' && activeHref?.startsWith(item.href))
          const Icon = item.icon
          return (
            <a
              key={index}
              href={item.href}
              className={cn(
                'flex h-8 w-8 items-center justify-center gap-2 rounded-full px-3 py-1 transition-colors',
                isActive ? 'bg-muted' : 'hover:bg-muted/80'
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault()
                  item.onClick(e)
                }
              }}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="sr-only">{item.label}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

// Convenience wrapper: builds the 5 standard items for a folii portfolio,
// scoped under /[username].
export function BottomMenu({ basePath }: { basePath: string }) {
  const pathname = usePathname()
  const items: MenuBarItem[] = [
    { icon: User, label: 'About Me', href: basePath || '/' },
    { icon: Briefcase, label: 'Work Experience', href: `${basePath}/experience` },
    { icon: Wrench, label: 'Skills', href: `${basePath}/skills` },
    { icon: FolderKanban, label: 'Projects', href: `${basePath}/projects` },
    { icon: Mail, label: 'Contact', href: `${basePath}/contact` },
  ]
  return (
    <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2">
      <MenuBar items={items} activeHref={pathname} />
    </div>
  )
}
