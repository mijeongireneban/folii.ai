'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const DOCS_NAV = [
  { href: '/docs', label: 'Getting Started' },
  { href: '/docs/editing', label: 'Editing with AI' },
  { href: '/docs/themes', label: 'Themes' },
  { href: '/docs/publishing', label: 'Publishing' },
  { href: '/docs/faq', label: 'FAQ' },
]

export function DocsNav() {
  const pathname = usePathname()

  return (
    <nav style={styles.nav}>
      <div style={styles.label}>Documentation</div>
      {DOCS_NAV.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              ...styles.link,
              ...(active ? styles.linkActive : {}),
            }}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  } as const,
  label: {
    fontFamily: "'Azeret Mono', monospace",
    fontSize: 10,
    color: '#0099ff',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: 16,
  } as const,
  link: {
    color: '#a6a6a6',
    fontSize: 14,
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: 8,
    transition: 'color 150ms, background 150ms',
  } as const,
  linkActive: {
    color: '#fff',
    background: 'rgba(255,255,255,0.06)',
  } as const,
}
