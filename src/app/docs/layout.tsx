import Link from 'next/link'
import type { ReactNode } from 'react'
import { DocsNav } from './DocsNav'

export const metadata = {
  title: 'Docs — folii.ai',
  description: 'Learn how to build and publish your portfolio with folii.ai.',
}

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <main style={styles.main}>
      <style>{RESPONSIVE_CSS}</style>

      <nav style={styles.topbar} className="docs-topbar">
        <Link href="/" style={styles.brand}>
          folii.ai
        </Link>
        <div style={styles.topbarRight}>
          <Link href="/docs" style={styles.topbarLink}>
            Docs
          </Link>
          <Link href="/editor" style={styles.topbarCta}>
            Open editor
          </Link>
        </div>
      </nav>

      <div style={styles.body} className="docs-body">
        <aside style={styles.sidebar} className="docs-sidebar">
          <DocsNav />
        </aside>
        <article style={styles.content} className="docs-content">
          {children}
        </article>
      </div>
    </main>
  )
}

const MAX = 1100

const styles = {
  main: {
    background: '#000',
    color: '#fff',
    minHeight: '100vh',
  } as const,

  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 32px',
    maxWidth: MAX,
    margin: '0 auto',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  } as const,
  brand: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 20,
    fontWeight: 500,
    letterSpacing: '-0.6px',
    color: '#fff',
    textDecoration: 'none',
  } as const,
  topbarRight: { display: 'flex', alignItems: 'center', gap: 16 } as const,
  topbarLink: {
    color: '#a6a6a6',
    fontSize: 14,
    textDecoration: 'none',
  } as const,
  topbarCta: {
    background: '#0099ff',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    padding: '9px 18px',
    borderRadius: 100,
    textDecoration: 'none',
  } as const,

  body: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    maxWidth: MAX,
    margin: '0 auto',
    minHeight: 'calc(100vh - 65px)',
  } as const,

  sidebar: {
    borderRight: '1px solid rgba(255,255,255,0.06)',
    padding: '32px 24px',
    position: 'sticky',
    top: 0,
    alignSelf: 'start',
    maxHeight: '100vh',
    overflowY: 'auto',
  } as const,

  content: {
    padding: '40px 48px 80px',
    maxWidth: 720,
    minWidth: 0,
  } as const,
}

const RESPONSIVE_CSS = `
@media (max-width: 768px) {
  .docs-body {
    grid-template-columns: 1fr !important;
  }
  .docs-sidebar {
    display: none !important;
  }
  .docs-content {
    padding: 24px 20px 60px !important;
  }
  .docs-topbar {
    padding: 16px 20px !important;
  }
}
`
