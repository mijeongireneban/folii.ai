import type { Content } from '@/lib/content/schema'

// Returns up to `max` contextual suggestion strings based on content gaps.
// Priority order: missing sections > content quality > polish items.
export function getSuggestions(content: Content, isPlaceholder: boolean, max = 4): string[] {
  const s: string[] = []

  if (isPlaceholder) {
    s.push(
      "I'm a staff engineer at Acme building developer tools",
      'Use a more playful tone',
    )
    return s.slice(0, max)
  }

  const bio = content.bio ?? ''
  const exp = content.experience ?? []
  const proj = content.projects ?? []
  const skills = content.skills ?? []
  const links = content.links ?? {}
  const headlinePoints = content.headline_points ?? []

  // --- High priority: major missing sections ---
  if (exp.length === 0) s.push('Add my work experience')
  if (proj.length === 0) s.push('Add a project I shipped recently')
  if (skills.length === 0) s.push('Add my technical skills')

  // --- Medium priority: content quality gaps ---
  if (bio.length < 80) s.push('Expand my bio with more detail')
  else if (bio.length > 500) s.push('Tighten the bio')

  if (!content.tagline || content.tagline.length < 10)
    s.push('Write a punchy one-line tagline')

  // Experience quality
  const expNoAchievements = exp.find((e) => (e.achievements?.length ?? 0) === 0)
  if (expNoAchievements)
    s.push(`Add achievements for my ${expNoAchievements.role} role`)

  const expNoTech = exp.find((e) => (e.technologies?.length ?? 0) === 0)
  if (expNoTech)
    s.push(`Add technologies used at ${expNoTech.company}`)

  // Projects quality
  if (proj.length > 0 && proj.length < 3) s.push('Add another project')
  const projNoTech = proj.find((p) => (p.tech?.length ?? 0) === 0)
  if (projNoTech)
    s.push(`Add tech stack for ${projNoTech.title}`)

  // --- Lower priority: polish and completeness ---
  if (headlinePoints.length === 0) s.push('Add headline highlights about me')
  if (!content.education?.length) s.push('Add my education')
  if (!content.location) s.push('Add my location')
  if (!content.email) s.push('Add my contact email')
  if (!content.years_experience) s.push('Set my years of experience')
  if (!links.github) s.push('Add my GitHub link')
  if (!links.linkedin) s.push('Add my LinkedIn')
  if (!links.website) s.push('Add my personal website')

  // Always offer a general improvement check as fallback
  s.push('What should I improve?')

  return s.slice(0, max)
}
