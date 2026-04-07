import type { Content, Experience, Project } from '@/lib/content/schema'

// SWE v1 template. Pure server component — no props beyond the validated
// content object. Renders per DESIGN.md §4/§5/§9 and the Portfolio
// Information Architecture block in the v1 design doc (Step 11):
//
//   1. Hero (name)  — Display Hero, 110px Cabinet Grotesk -5.5px tracking
//   2. Tagline      — Body Large
//   3. Bio          — 720–860px read column
//   4. Projects     — Section Heading + cards with blue ring shadow
//   5. Experience   — timeline with Azeret Mono dates
//   6. Links        — Framer Blue inline links
//   7. Footer       — "Built with folii.ai →" Ghost link

const READ_COL_MAX = 820

const styles = {
  main: {
    background: '#000000',
    color: '#ffffff',
    minHeight: '100vh',
    padding: '120px 24px 80px',
  } as const,
  container: {
    maxWidth: 1200,
    margin: '0 auto',
  } as const,
  readColumn: {
    maxWidth: READ_COL_MAX,
  } as const,
  hero: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 110,
    lineHeight: 0.85,
    letterSpacing: '-5.5px',
    marginBottom: 28,
  } as const,
  tagline: {
    fontSize: 18,
    lineHeight: 1.3,
    color: '#a6a6a6',
    marginBottom: 48,
    maxWidth: READ_COL_MAX,
  } as const,
  bio: {
    fontSize: 18,
    lineHeight: 1.55,
    color: '#ffffff',
    maxWidth: READ_COL_MAX,
    marginBottom: 120,
  } as const,
  sectionHeading: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 62,
    lineHeight: 1.0,
    letterSpacing: '-3.1px',
    marginBottom: 32,
  } as const,
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 22,
    marginBottom: 120,
  } as const,
  card: {
    background: '#000000',
    borderRadius: 12,
    padding: 28,
    boxShadow: 'rgba(0, 153, 255, 0.15) 0px 0px 0px 1px',
  } as const,
  cardTitle: {
    fontFamily: "'Inter Variable', sans-serif",
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.8px',
    marginBottom: 8,
  } as const,
  cardDesc: {
    fontSize: 15,
    lineHeight: 1.55,
    color: '#a6a6a6',
    marginBottom: 18,
  } as const,
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  } as const,
  tag: {
    fontFamily: "'Azeret Mono', monospace",
    fontSize: 10.4,
    lineHeight: 1.6,
    color: '#a6a6a6',
    padding: '3px 8px',
    background: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
  } as const,
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
    marginBottom: 120,
    maxWidth: READ_COL_MAX,
  } as const,
  expRow: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: 24,
    alignItems: 'baseline',
  } as const,
  expDates: {
    fontFamily: "'Azeret Mono', monospace",
    fontSize: 10.4,
    lineHeight: 1.6,
    color: '#a6a6a6',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  } as const,
  expCompany: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 32,
    lineHeight: 1.13,
    letterSpacing: '-1px',
    marginBottom: 4,
  } as const,
  expRole: {
    fontSize: 14,
    color: '#a6a6a6',
    marginBottom: 8,
  } as const,
  expImpact: {
    fontSize: 15,
    lineHeight: 1.55,
    color: '#ffffff',
  } as const,
  links: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 120,
    maxWidth: READ_COL_MAX,
  } as const,
  link: {
    color: '#0099ff',
    fontSize: 15,
    textDecoration: 'none',
  } as const,
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: 40,
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    maxWidth: 1200,
    margin: '0 auto',
  } as const,
  footerLink: {
    fontSize: 14,
    color: '#a6a6a6',
    textDecoration: 'none',
  } as const,
} as const

function formatDates(start: string, end: string | undefined): string {
  return end ? `${start} — ${end}` : `${start} — Present`
}

function ProjectCard({ project }: { project: Project }) {
  const body = (
    <>
      <div style={styles.cardTitle}>{project.title}</div>
      <div style={styles.cardDesc}>{project.description}</div>
      {project.tech.length > 0 && (
        <div style={styles.tags}>
          {project.tech.map((t) => (
            <span key={t} style={styles.tag}>
              {t}
            </span>
          ))}
        </div>
      )}
    </>
  )
  // If there's a URL, the whole card is a link. Otherwise plain div.
  if (project.url) {
    return (
      <a
        href={project.url}
        style={{ ...styles.card, display: 'block', color: 'inherit' }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {body}
      </a>
    )
  }
  return <div style={styles.card}>{body}</div>
}

function ExperienceRow({ exp }: { exp: Experience }) {
  return (
    <div style={styles.expRow}>
      <div style={styles.expDates}>{formatDates(exp.start, exp.end)}</div>
      <div>
        <div style={styles.expCompany}>{exp.company}</div>
        <div style={styles.expRole}>{exp.role}</div>
        <div style={styles.expImpact}>{exp.impact}</div>
      </div>
    </div>
  )
}

export function SwePortfolio({ content }: { content: Content }) {
  const hasProjects = content.projects.length > 0
  const hasExperience = content.experience.length > 0
  const linkEntries = Object.entries(content.links).filter(
    ([, v]) => typeof v === 'string' && v.length > 0
  ) as [string, string][]

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.hero}>{content.name}</h1>
        <p style={styles.tagline}>{content.tagline}</p>
        <p style={styles.bio}>{content.bio}</p>

        {hasProjects && (
          <section aria-labelledby="projects-heading">
            <h2 id="projects-heading" style={styles.sectionHeading}>
              Projects
            </h2>
            <div style={styles.projectsGrid}>
              {content.projects.map((p) => (
                <ProjectCard key={p.title} project={p} />
              ))}
            </div>
          </section>
        )}

        {hasExperience && (
          <section aria-labelledby="experience-heading">
            <h2 id="experience-heading" style={styles.sectionHeading}>
              Experience
            </h2>
            <div style={styles.timeline}>
              {content.experience.map((e) => (
                <ExperienceRow key={`${e.company}-${e.start}`} exp={e} />
              ))}
            </div>
          </section>
        )}

        {linkEntries.length > 0 && (
          <section aria-labelledby="links-heading">
            <h2 id="links-heading" style={styles.sectionHeading}>
              Elsewhere
            </h2>
            <div style={styles.links}>
              {linkEntries.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  style={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
      <footer style={styles.footer}>
        <a href="/" style={styles.footerLink}>
          Built with folii.ai →
        </a>
      </footer>
    </main>
  )
}
