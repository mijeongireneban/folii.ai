import { Briefcase, FolderKanban, Mail, User, Wrench } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import type { PortfolioSection } from '@/lib/content/schema'

export type PortfolioNavItem = {
  key: PortfolioSection
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  href: string
}

export const PORTFOLIO_NAV_ITEMS: readonly PortfolioNavItem[] = [
  { key: 'profile', icon: User, label: 'About Me', href: '/' },
  { key: 'experience', icon: Briefcase, label: 'Work Experience', href: '/experience' },
  { key: 'skills', icon: Wrench, label: 'Skills', href: '/skills' },
  { key: 'projects', icon: FolderKanban, label: 'Projects', href: '/projects' },
  { key: 'contact', icon: Mail, label: 'Contact', href: '/contact' },
] as const

const SECTION_ALIASES: Record<string, PortfolioSection> = {
  profile: 'profile',
  'about me': 'profile',
  about: 'profile',
  experience: 'experience',
  'work experience': 'experience',
  skills: 'skills',
  projects: 'projects',
  contact: 'contact',
}

function normalizeSection(value: string): PortfolioSection | null {
  const cleaned = value.trim().toLowerCase()
  if (!cleaned) return null
  return SECTION_ALIASES[cleaned] ?? null
}

export function coerceHiddenSections(value: unknown): PortfolioSection[] {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
    ? value.split(/[,\n]/g)
    : []
  const seen = new Set<PortfolioSection>()
  const out: PortfolioSection[] = []
  for (const raw of rawValues) {
    if (typeof raw !== 'string') continue
    const section = normalizeSection(raw)
    if (!section || seen.has(section)) continue
    seen.add(section)
    out.push(section)
  }
  return out
}

export function getVisiblePortfolioNavItems(hiddenSections: unknown): PortfolioNavItem[] {
  const hidden = new Set(coerceHiddenSections(hiddenSections))
  return PORTFOLIO_NAV_ITEMS.filter((item) => !hidden.has(item.key))
}
