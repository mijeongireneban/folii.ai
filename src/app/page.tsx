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
          .landing-feature-grid {
            grid-template-columns: 1fr !important;
          }
          .landing-why-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
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
        html[data-landing-theme="light"] .landing-feature-grid .landing-step {
          box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px !important;
          background: #fff !important;
        }
      `}</style>

      <nav style={styles.nav} className="landing-nav">
        <div style={styles.brand} className="landing-brand">folii.ai</div>
        <div style={styles.navRight}>
          <Link href="/docs" style={styles.navLink} className="landing-nav-link">
            Docs
          </Link>
          <Link href="/changelog" style={styles.navLink}>
            Changelog
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
          Ship your portfolio
          <br />
          <span style={styles.heroAccent} className="landing-hero-accent">in minutes, not weeks.</span>
        </h1>
        <p style={styles.heroSub} className="landing-hero-sub">
          folii turns your resume into a polished portfolio site. Upload a PDF,
          refine with AI chat, pick a theme, and publish at folii.ai/you.
          Built for engineers who&apos;d rather write code than fiddle with
          website builders.
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
              Upload a PDF and our AI parser extracts your experience, projects,
              skills, and links into structured content. No copy-pasting fields
              one by one.
            </p>
          </li>
          <li style={styles.step} className="landing-step">
            <div style={styles.stepNum}>02</div>
            <div style={styles.stepTitle} className="landing-step-title">Refine with AI</div>
            <p style={styles.stepBody} className="landing-step-body">
              Tell folii what to change in plain English. &quot;Tighten the bio&quot;,
              &quot;add my latest project&quot;, &quot;quantify my impact at Acme&quot;. The preview
              updates live. Revert any edit with one click.
            </p>
          </li>
          <li style={styles.step} className="landing-step">
            <div style={styles.stepNum}>03</div>
            <div style={styles.stepTitle} className="landing-step-title">Publish instantly</div>
            <p style={styles.stepBody} className="landing-step-body">
              One click and your portfolio is live at folii.ai/you. Share the
              link on LinkedIn, in job apps, or anywhere. Come back and update
              anytime.
            </p>
          </li>
        </ol>
      </section>

      <section style={styles.features} className="landing-section" aria-labelledby="features-heading">
        <h2 id="features-heading" style={styles.sectionHeading} className="landing-section-heading">
          Everything you need,
          <br />
          nothing you don&apos;t.
        </h2>
        <div style={styles.featureGrid} className="landing-feature-grid">
          <div style={styles.featureCard} className="landing-step">
            <div style={styles.featureIcon}>✦</div>
            <div style={styles.featureTitle}>AI-powered editing</div>
            <p style={styles.featureBody} className="landing-step-body">
              Chat with folii like a writing partner. It rewrites your bio,
              quantifies achievements, and polishes copy while you watch the
              preview update in real time.
            </p>
          </div>
          <div style={styles.featureCard} className="landing-step">
            <div style={styles.featureIcon}>⬡</div>
            <div style={styles.featureTitle}>GitHub project import</div>
            <p style={styles.featureBody} className="landing-step-body">
              Paste a repo URL and folii pulls in the name, description, language,
              stars, and topics. It writes a polished project entry for you
              automatically.
            </p>
          </div>
          <div style={styles.featureCard} className="landing-step">
            <div style={styles.featureIcon}>◑</div>
            <div style={styles.featureTitle}>40+ themes with dark/light</div>
            <p style={styles.featureBody} className="landing-step-body">
              Pick from dozens of color themes. Every theme supports both dark and
              light mode. Your visitors can toggle between them.
            </p>
          </div>
          <div style={styles.featureCard} className="landing-step">
            <div style={styles.featureIcon}>↗</div>
            <div style={styles.featureTitle}>Instant publishing</div>
            <p style={styles.featureBody} className="landing-step-body">
              No deploy steps, no hosting config, no DNS records. Hit publish
              and your site is live. Update it anytime with another chat message.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.whySection} className="landing-section" aria-labelledby="why-heading">
        <h2 id="why-heading" style={styles.sectionHeading} className="landing-section-heading">
          Built for engineers.
        </h2>
        <div style={styles.whyGrid} className="landing-why-grid">
          <div style={styles.whyItem}>
            <div style={styles.whyLabel}>Not a website builder</div>
            <p style={styles.whyBody} className="landing-step-body">
              No drag-and-drop, no widgets, no layout puzzles. You talk to an AI
              and it handles the design. Your content is always the focus.
            </p>
          </div>
          <div style={styles.whyItem}>
            <div style={styles.whyLabel}>Not a link-in-bio page</div>
            <p style={styles.whyBody} className="landing-step-body">
              folii is a full portfolio with structured experience, projects with
              screenshots, grouped skills, and education. It tells your whole story.
            </p>
          </div>
          <div style={styles.whyItem}>
            <div style={styles.whyLabel}>Not another template store</div>
            <p style={styles.whyBody} className="landing-step-body">
              You don&apos;t browse themes for hours. Drop your resume, pick a color
              palette, and the AI makes it look good. Five minutes, not five days.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.example} className="landing-section">
        <h2 style={styles.sectionHeading} className="landing-section-heading">See it live</h2>
        <p style={styles.exampleSub} className="landing-step-body">
          Real portfolios built with folii. Every page you see was generated from
          a resume and refined in chat.
        </p>
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
        <h2 style={styles.finalCtaTitle} className="landing-final-cta-title">
          Your work speaks
          <br />
          for itself.
        </h2>
        <p style={styles.finalCtaSub} className="landing-hero-sub">
          Stop putting off your portfolio. Upload your resume and let folii
          handle the rest.
        </p>
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
          <Link href="/changelog" style={styles.footerLink}>
            Changelog
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
  features: {
    maxWidth: MAX,
    margin: '0 auto',
    padding: '80px 32px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  } as const,
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 24,
  } as const,
  featureCard: {
    background: '#000',
    borderRadius: 12,
    padding: 32,
    boxShadow: 'rgba(0, 153, 255, 0.15) 0px 0px 0px 1px',
  } as const,
  featureIcon: {
    fontSize: 20,
    color: '#0099ff',
    marginBottom: 16,
  } as const,
  featureTitle: {
    fontFamily: "'Inter Variable', sans-serif",
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: '-0.5px',
    marginBottom: 10,
  } as const,
  featureBody: { fontSize: 15, lineHeight: 1.6, color: '#a6a6a6' } as const,

  whySection: {
    maxWidth: MAX,
    margin: '0 auto',
    padding: '80px 32px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  } as const,
  whyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
  } as const,
  whyItem: {} as const,
  whyLabel: {
    fontFamily: "'Inter Variable', sans-serif",
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: '-0.4px',
    marginBottom: 10,
    color: '#fff',
  } as const,
  whyBody: { fontSize: 15, lineHeight: 1.6, color: '#a6a6a6' } as const,

  exampleSub: {
    fontSize: 17,
    lineHeight: 1.5,
    color: '#a6a6a6',
    marginBottom: 32,
    maxWidth: 560,
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
  finalCtaSub: {
    fontSize: 18,
    lineHeight: 1.5,
    color: '#a6a6a6',
    marginBottom: 40,
    maxWidth: 480,
    marginLeft: 'auto',
    marginRight: 'auto',
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
