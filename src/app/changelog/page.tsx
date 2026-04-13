import Link from 'next/link'

export const metadata = {
  title: 'Changelog — folii.ai',
  description: 'What\'s new in folii.ai. Feature updates, improvements, and fixes.',
}

type ChangelogEntry = {
  version: string
  date: string
  title: string
  features: string[]
  improvements?: string[]
  fixes?: string[]
}

const entries: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: 'April 12, 2026',
    title: 'v1 launch',
    features: [
      'GitHub project import — paste a public repo URL in chat or use the Import button in the topbar. folii pulls the name, description, language, stars, and topics from the GitHub API and writes a polished project entry.',
      'Improved landing page — new features section, "Why folii" differentiator, sharper hero copy, and stronger final CTA.',
      'Documentation site at /docs — getting started guide, AI editing tips, themes guide, publishing walkthrough, and FAQ.',
      'Changelog page at /changelog.',
      'Sign out button and dark/light theme toggle on the landing page.',
      'Sentry error tracking — production error monitoring with automatic Linear ticket creation.',
    ],
    improvements: [
      'Rotating chat placeholder hints — cycles through example prompts every 4 seconds to help new users.',
      'Better rate limit error messages — shows remaining count instead of misleading "try again in 60s".',
      'API timeouts — 45s on OpenAI calls, 5s on GitHub fetch, preventing silent function hangs.',
      'Error logging — LLM failures now log to console for Vercel log visibility.',
      'Smarter error messages — distinguishes "AI returned bad format" from "AI unavailable".',
    ],
    fixes: [
      'JSON editor saves no longer create "Applied direct JSON edit" chat messages.',
      'Removed split/focus layout toggle — editor always uses split view for a cleaner experience.',
    ],
  },
  {
    version: '0.0.1',
    date: 'April 12, 2026',
    title: 'Initial release',
    features: [
      'Resume upload and AI parsing — drop a PDF and get a structured portfolio in seconds.',
      'AI chat editor — edit your portfolio in natural language. Rewrite your bio, add projects, remove sections, all through conversation.',
      'Live preview — see every change in real time as you edit.',
      'One-click publish — your portfolio goes live at folii.ai/username instantly.',
      'Publish and unpublish toggle — take your site offline and back with one click.',
      '43 theme presets — dark and light variants for every theme, sourced from the tweakcn community.',
      'Dark/light mode toggle — visitors can switch between dark and light on your published site.',
      'Smart chat suggestions — context-aware chips that suggest edits based on what\'s missing in your portfolio.',
      'Undo/revert — roll back any AI edit from the chat history.',
      'JSON editor — power users can edit the raw portfolio data directly.',
      'Section hiding — hide Experience, Skills, Projects, or Contact from the nav and published page.',
      'Project images — upload screenshots for your project cards.',
      'Profile avatar — upload and crop a profile photo.',
      'SEO meta tags — Open Graph and Twitter card tags with a dynamically generated preview image.',
      'Mobile responsive — editor and published portfolios work on all screen sizes.',
    ],
    improvements: [
      'Rate limiting on AI chat and resume parsing to keep things fair.',
      'Inline error messages with retry button when AI calls fail.',
      'Navigation between editor and landing page.',
    ],
  },
]

export default function ChangelogPage() {
  return (
    <main style={styles.main}>
      <style>{RESPONSIVE_CSS}</style>

      <nav style={styles.topbar} className="changelog-topbar">
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

      <div style={styles.container} className="changelog-container">
        <h1 style={styles.title} className="changelog-title">Changelog</h1>
        <p style={styles.subtitle}>What&apos;s new in folii.ai.</p>

        {entries.map((entry) => (
          <section key={entry.version} style={styles.entry}>
            <div style={styles.entryHeader}>
              <div style={styles.version}>{entry.version}</div>
              <div style={styles.date}>{entry.date}</div>
            </div>
            <h2 style={styles.entryTitle}>{entry.title}</h2>

            {entry.features.length > 0 && (
              <>
                <div style={styles.sectionLabel}>Features</div>
                <ul style={styles.list}>
                  {entry.features.map((f, i) => (
                    <li key={i} style={styles.item}>
                      <span style={styles.dot} />
                      <span style={styles.itemText}>{f}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {entry.improvements && entry.improvements.length > 0 && (
              <>
                <div style={styles.sectionLabel}>Improvements</div>
                <ul style={styles.list}>
                  {entry.improvements.map((f, i) => (
                    <li key={i} style={styles.item}>
                      <span style={styles.dot} />
                      <span style={styles.itemText}>{f}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {entry.fixes && entry.fixes.length > 0 && (
              <>
                <div style={styles.sectionLabel}>Fixes</div>
                <ul style={styles.list}>
                  {entry.fixes.map((f, i) => (
                    <li key={i} style={styles.item}>
                      <span style={styles.dot} />
                      <span style={styles.itemText}>{f}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        ))}
      </div>

      <footer style={styles.footer} className="changelog-footer">
        <div style={styles.footerBrand}>folii.ai</div>
        <div style={styles.footerLinks}>
          <Link href="/docs" style={styles.footerLink}>Docs</Link>
          <Link href="/changelog" style={styles.footerLink}>Changelog</Link>
        </div>
      </footer>
    </main>
  )
}

const MAX = 720

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
    maxWidth: 1100,
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

  container: {
    maxWidth: MAX,
    margin: '0 auto',
    padding: '60px 32px 80px',
  } as const,
  title: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 62,
    lineHeight: 1.0,
    letterSpacing: '-3.1px',
    marginBottom: 12,
  } as const,
  subtitle: {
    fontSize: 18,
    color: '#a6a6a6',
    marginBottom: 64,
  } as const,

  entry: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: 40,
    paddingBottom: 20,
  } as const,
  entryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  } as const,
  version: {
    fontFamily: "'Azeret Mono', monospace",
    fontSize: 12,
    color: '#0099ff',
    letterSpacing: '0.5px',
    background: 'rgba(0,153,255,0.1)',
    padding: '4px 10px',
    borderRadius: 100,
  } as const,
  date: {
    fontFamily: "'Azeret Mono', monospace",
    fontSize: 12,
    color: '#666',
    letterSpacing: '0.3px',
  } as const,
  entryTitle: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 32,
    lineHeight: 1.1,
    letterSpacing: '-1.2px',
    marginBottom: 32,
  } as const,

  sectionLabel: {
    fontFamily: "'Inter Variable', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: '#a6a6a6',
    letterSpacing: '-0.2px',
    marginBottom: 12,
    marginTop: 28,
  } as const,
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  } as const,
  item: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  } as const,
  dot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#0099ff',
    flexShrink: 0,
    marginTop: 7,
  } as const,
  itemText: {
    fontSize: 15,
    lineHeight: 1.55,
    color: '#ccc',
  } as const,

  footer: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '40px 32px 60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  } as const,
  footerBrand: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 16,
    fontWeight: 500,
    color: '#a6a6a6',
  } as const,
  footerLinks: { display: 'flex', gap: 24 } as const,
  footerLink: { fontSize: 13, color: '#a6a6a6', textDecoration: 'none' } as const,
}

const RESPONSIVE_CSS = `
@media (max-width: 640px) {
  .changelog-title {
    font-size: 40px !important;
    letter-spacing: -2px !important;
  }
  .changelog-container {
    padding: 40px 20px 60px !important;
  }
  .changelog-topbar,
  .changelog-footer {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}
`
