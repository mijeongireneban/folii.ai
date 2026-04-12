import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton, ThemeToggle } from './LandingActions'

export const dynamic = 'force-dynamic'

// Landing page — visible to both signed-out and signed-in users.
// Serves as the marketing/docs hub. Per DESIGN.md: black background,
// Cabinet Grotesk display type, Framer Blue accent, pill CTAs.

const LIVE_EXAMPLE_URL = 'https://www.mijeong.dev/'

export default async function RootPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main style={styles.main} className="landing-main">
      <style>{`
        @media (max-width: 640px) {
          .landing-hero-title {
            font-size: 48px !important;
            letter-spacing: -2px !important;
          }
          .landing-section-heading {
            font-size: 32px !important;
            letter-spacing: -1.5px !important;
          }
          .landing-final-cta-title {
            font-size: 40px !important;
            letter-spacing: -2px !important;
          }
          .landing-hero {
            padding-top: 60px !important;
            padding-bottom: 80px !important;
          }
          .landing-nav,
          .landing-hero,
          .landing-section,
          .landing-final-cta,
          .landing-footer {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .landing-hero-sub {
            font-size: 16px !important;
          }
          .landing-example-host {
            font-size: 24px !important;
          }
          .landing-example-card {
            padding: 24px !important;
          }
          .landing-final-cta {
            padding-top: 80px !important;
            padding-bottom: 80px !important;
          }
          .landing-step-title {
            font-size: 18px !important;
          }
        }
        @media (max-width: 480px) {
          .landing-hero-title {
            font-size: 36px !important;
            letter-spacing: -1.5px !important;
          }
          .landing-section-heading {
            font-size: 28px !important;
            letter-spacing: -1.2px !important;
          }
          .landing-final-cta-title {
            font-size: 32px !important;
            letter-spacing: -1.5px !important;
          }
        }
        html[data-landing-theme="light"] .landing-main {
          background: #fff !important;
          color: #111 !important;
        }
        html[data-landing-theme="light"] .landing-nav-link {
          color: #666 !important;
        }
        html[data-landing-theme="light"] .landing-brand {
          color: #111 !important;
        }
        html[data-landing-theme="light"] .landing-hero-sub {
          color: #666 !important;
        }
        html[data-landing-theme="light"] .landing-hero-accent {
          color: #0077cc !important;
        }
        html[data-landing-theme="light"] .landing-step {
          box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px !important;
          background: #fff !important;
        }
        html[data-landing-theme="light"] .landing-step-body {
          color: #666 !important;
        }
        html[data-landing-theme="light"] .landing-example-card {
          box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px !important;
          background: #fff !important;
          color: #111 !important;
        }
        html[data-landing-theme="light"] .landing-section,
        html[data-landing-theme="light"] .landing-final-cta,
        html[data-landing-theme="light"] .landing-footer {
          border-color: rgba(0, 0, 0, 0.08) !important;
        }
        html[data-landing-theme="light"] .landing-footer-brand,
        html[data-landing-theme="light"] .landing-footer-link {
          color: #666 !important;
        }
        html[data-landing-theme="light"] .landing-theme-toggle {
          background: rgba(0, 0, 0, 0.05) !important;
          border-color: rgba(0, 0, 0, 0.1) !important;
          color: #333 !important;
        }
      `}</style>

      <nav style={styles.nav} className="landing-nav">
        <div style={styles.brand} className="landing-brand">folii.ai</div>
        <div style={styles.navRight}>
          <Link href="/docs" style={styles.navLink} className="landing-nav-link">
            Docs
          </Link>
          {user ? (
            <>
              <SignOutButton />
              <Link href="/editor" style={styles.navCta}>
                Open editor
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={styles.navLink} className="landing-nav-link">
                Log in
              </Link>
              <Link href="/auth/signup" style={styles.navCta}>
                Get started
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </nav>

      <section style={styles.hero} className="landing-hero">
        <h1 style={styles.heroTitle} className="landing-hero-title">
          Your portfolio,
          <br />
          <span style={styles.heroAccent} className="landing-hero-accent">in a sentence.</span>
        </h1>
        <p style={styles.heroSub} className="landing-hero-sub">
          Upload your resume. Edit in chat. Publish at folii.ai/you. No
          drag-and-drop builders, no theme stores, no design homework.
        </p>
        <div style={styles.heroCtas}>
          <Link href={user ? '/editor' : '/auth/signup'} style={styles.primaryCta}>
            {user ? 'Open editor' : 'Start for free'}
          </Link>
          <a
            href={LIVE_EXAMPLE_URL}
            target="_blank"
            rel="noreferrer"
            style={styles.secondaryCta}
          >
            See a live example ↗
          </a>
        </div>
      </section>

      <section style={styles.steps} className="landing-section" aria-labelledby="how-heading">
        <h2 id="how-heading" style={styles.sectionHeading} className="landing-section-heading">
          How it works
        </h2>
        <ol style={styles.stepsList}>
          <li style={styles.step} className="landing-step">
            <div style={styles.stepNum}>01</div>
            <div style={styles.stepTitle} className="landing-step-title">Drop your resume</div>
            <p style={styles.stepBody} className="landing-step-body">
              PDF, TXT, or Markdown. We extract your experience, projects, and
              links into structured content. No copy-pasting.
            </p>
          </li>
          <li style={styles.step} className="landing-step">
            <div style={styles.stepNum}>02</div>
            <div style={styles.stepTitle} className="landing-step-title">Edit in chat</div>
            <p style={styles.stepBody} className="landing-step-body">
              Say "tighten the bio" or "add a project about X". The preview
              updates live. Undo any edit from the chat history.
            </p>
          </li>
          <li style={styles.step} className="landing-step">
            <div style={styles.stepNum}>03</div>
            <div style={styles.stepTitle} className="landing-step-title">Publish</div>
            <p style={styles.stepBody} className="landing-step-body">
              One click. Your portfolio is live at folii.ai/your-username.
              Share the link. Update anytime.
            </p>
          </li>
        </ol>
      </section>

      <section style={styles.example} className="landing-section">
        <h2 style={styles.sectionHeading} className="landing-section-heading">Built with folii.ai</h2>
        <a
          href={LIVE_EXAMPLE_URL}
          target="_blank"
          rel="noreferrer"
          style={styles.exampleCard}
          className="landing-example-card"
        >
          <div style={styles.exampleHost} className="landing-example-host">mijeong.dev</div>
          <div style={styles.exampleArrow}>↗</div>
        </a>
      </section>

      <section style={styles.finalCta} className="landing-final-cta">
        <h2 style={styles.finalCtaTitle} className="landing-final-cta-title">Ship yours today.</h2>
        <Link href={user ? '/editor' : '/auth/signup'} style={styles.primaryCta}>
          {user ? 'Open editor' : 'Start for free'}
        </Link>
      </section>

      <footer style={styles.footer} className="landing-footer">
        <div style={styles.footerBrand} className="landing-footer-brand">folii.ai</div>
        <div style={styles.footerLinks}>
          <Link href="/docs" style={styles.footerLink} className="landing-footer-link">
            Docs
          </Link>
          {user ? (
            <Link href="/editor" style={styles.footerLink}>
              Editor
            </Link>
          ) : (
            <>
              <Link href="/auth/login" style={styles.footerLink}>
                Log in
              </Link>
              <Link href="/auth/signup" style={styles.footerLink}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </footer>
    </main>
  )
}

// --- styles ------------------------------------------------------------

const MAX = 1100

const styles = {
  main: {
    background: '#000',
    color: '#fff',
    minHeight: '100vh',
    overflowX: 'hidden',
  } as const,

  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 32px',
    maxWidth: MAX,
    margin: '0 auto',
  } as const,
  brand: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 20,
    fontWeight: 500,
    letterSpacing: '-0.6px',
  } as const,
  navRight: { display: 'flex', alignItems: 'center', gap: 16 } as const,
  navLink: {
    color: '#a6a6a6',
    fontSize: 14,
    textDecoration: 'none',
  } as const,
  navCta: {
    background: '#0099ff',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    padding: '9px 18px',
    borderRadius: 100,
    textDecoration: 'none',
  } as const,

  hero: {
    maxWidth: MAX,
    margin: '0 auto',
    padding: '120px 32px 140px',
  } as const,
  heroTitle: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 120,
    lineHeight: 0.85,
    letterSpacing: '-6px',
    marginBottom: 40,
  } as const,
  heroAccent: { color: '#0099ff' } as const,
  heroSub: {
    fontSize: 20,
    lineHeight: 1.45,
    color: '#a6a6a6',
    maxWidth: 620,
    marginBottom: 48,
  } as const,
  heroCtas: { display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' } as const,
  primaryCta: {
    background: '#0099ff',
    color: '#fff',
    fontSize: 16,
    fontWeight: 500,
    padding: '14px 28px',
    borderRadius: 100,
    textDecoration: 'none',
  } as const,
  secondaryCta: {
    color: '#0099ff',
    fontSize: 16,
    textDecoration: 'none',
  } as const,

  sectionHeading: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 62,
    lineHeight: 1.0,
    letterSpacing: '-3.1px',
    marginBottom: 48,
  } as const,

  steps: {
    maxWidth: MAX,
    margin: '0 auto',
    padding: '80px 32px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  } as const,
  stepsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 32,
  } as const,
  step: {
    background: '#000',
    borderRadius: 12,
    padding: 32,
    boxShadow: 'rgba(0, 153, 255, 0.15) 0px 0px 0px 1px',
  } as const,
  stepNum: {
    fontFamily: "'Azeret Mono', monospace",
    fontSize: 11,
    color: '#0099ff',
    marginBottom: 16,
    letterSpacing: '0.5px',
  } as const,
  stepTitle: {
    fontFamily: "'Inter Variable', sans-serif",
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.8px',
    marginBottom: 10,
  } as const,
  stepBody: { fontSize: 15, lineHeight: 1.6, color: '#a6a6a6' } as const,

  example: {
    maxWidth: MAX,
    margin: '0 auto',
    padding: '80px 32px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  } as const,
  exampleCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '32px 36px',
    borderRadius: 15,
    background: '#000',
    boxShadow: 'rgba(0, 153, 255, 0.15) 0px 0px 0px 1px',
    textDecoration: 'none',
    color: '#fff',
    maxWidth: 560,
  } as const,
  exampleHost: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 36,
    fontWeight: 500,
    letterSpacing: '-1.2px',
  } as const,
  exampleArrow: { fontSize: 28, color: '#0099ff' } as const,

  finalCta: {
    maxWidth: MAX,
    margin: '0 auto',
    padding: '140px 32px',
    textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  } as const,
  finalCtaTitle: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 96,
    lineHeight: 0.9,
    letterSpacing: '-4.8px',
    marginBottom: 40,
  } as const,

  footer: {
    maxWidth: MAX,
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
