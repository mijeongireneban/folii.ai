import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Landing page for signed-out visitors. Signed-in users get bounced to
// /editor so this page is only seen once. Per DESIGN.md: black background,
// Cabinet Grotesk display type, Framer Blue accent, pill CTAs.

const LIVE_EXAMPLE_URL = 'https://www.mijeong.dev/'

export default async function RootPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/editor')

  return (
    <main style={styles.main}>
      <nav style={styles.nav}>
        <div style={styles.brand}>folii.ai</div>
        <div style={styles.navRight}>
          <Link href="/auth/login" style={styles.navLink}>
            Log in
          </Link>
          <Link href="/auth/signup" style={styles.navCta}>
            Get started
          </Link>
        </div>
      </nav>

      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Your portfolio,
          <br />
          <span style={styles.heroAccent}>in a sentence.</span>
        </h1>
        <p style={styles.heroSub}>
          Upload your resume. Edit in chat. Publish at folii.ai/you. No
          drag-and-drop builders, no theme stores, no design homework.
        </p>
        <div style={styles.heroCtas}>
          <Link href="/auth/signup" style={styles.primaryCta}>
            Start for free
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

      <section style={styles.steps} aria-labelledby="how-heading">
        <h2 id="how-heading" style={styles.sectionHeading}>
          How it works
        </h2>
        <ol style={styles.stepsList}>
          <li style={styles.step}>
            <div style={styles.stepNum}>01</div>
            <div style={styles.stepTitle}>Drop your resume</div>
            <p style={styles.stepBody}>
              PDF, TXT, or Markdown. We extract your experience, projects, and
              links into structured content. No copy-pasting.
            </p>
          </li>
          <li style={styles.step}>
            <div style={styles.stepNum}>02</div>
            <div style={styles.stepTitle}>Edit in chat</div>
            <p style={styles.stepBody}>
              Say "tighten the bio" or "add a project about X". The preview
              updates live. Undo any edit from the chat history.
            </p>
          </li>
          <li style={styles.step}>
            <div style={styles.stepNum}>03</div>
            <div style={styles.stepTitle}>Publish</div>
            <p style={styles.stepBody}>
              One click. Your portfolio is live at folii.ai/your-username.
              Share the link. Update anytime.
            </p>
          </li>
        </ol>
      </section>

      <section style={styles.example}>
        <h2 style={styles.sectionHeading}>Built with folii.ai</h2>
        <a
          href={LIVE_EXAMPLE_URL}
          target="_blank"
          rel="noreferrer"
          style={styles.exampleCard}
        >
          <div style={styles.exampleHost}>mijeong.dev</div>
          <div style={styles.exampleArrow}>↗</div>
        </a>
      </section>

      <section style={styles.finalCta}>
        <h2 style={styles.finalCtaTitle}>Ship yours today.</h2>
        <Link href="/auth/signup" style={styles.primaryCta}>
          Start for free
        </Link>
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerBrand}>folii.ai</div>
        <div style={styles.footerLinks}>
          <Link href="/auth/login" style={styles.footerLink}>
            Log in
          </Link>
          <Link href="/auth/signup" style={styles.footerLink}>
            Sign up
          </Link>
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
