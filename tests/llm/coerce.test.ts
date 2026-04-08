import { describe, expect, it } from 'vitest'
import { coerceContent } from '@/lib/llm/coerce'
import { contentSchema } from '@/lib/content/schema'

describe('coerceContent: links', () => {
  it('converts an array of URLs into a platform-keyed object', () => {
    const out = coerceContent({
      name: 'Mijeong Ban',
      tagline: 'Software Engineer, Lead',
      bio: 'I lead a software development team at Cipherome.',
      links: ['github.com/mijeongireneban', 'linkedin.com/in/mijeongireneban'],
      experience: [
        { company: 'Cipherome', role: 'Lead', start: 'Feb 2022', impact: 'Shipped things.' },
      ],
      projects: [],
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.links.github).toBe('https://github.com/mijeongireneban')
    expect(parsed.links.linkedin).toBe('https://linkedin.com/in/mijeongireneban')
  })

  it('passes through a valid links object', () => {
    const out = coerceContent({
      name: 'A',
      tagline: 'B',
      bio: 'C',
      links: { github: 'https://github.com/a' },
      experience: [],
      projects: [],
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.links.github).toBe('https://github.com/a')
  })

  it('puts unclassifiable URLs into website', () => {
    const out = coerceContent({
      name: 'A',
      tagline: 'B',
      bio: 'C',
      links: ['https://maya.dev'],
      experience: [],
      projects: [],
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.links.website).toBe('https://maya.dev')
  })
})

describe('coerceContent: education', () => {
  it('drops entries missing required fields', () => {
    const out = coerceContent({
      name: 'A',
      tagline: 'B',
      bio: 'C',
      links: {},
      experience: [],
      projects: [],
      education: [{ degree: 'BS CS' }], // missing school + year
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.education).toBeUndefined()
  })

  it('accepts institution/graduation synonyms', () => {
    const out = coerceContent({
      name: 'A',
      tagline: 'B',
      bio: 'C',
      links: {},
      experience: [],
      projects: [],
      education: [
        { institution: 'UC Berkeley', degree: 'BS CS', graduation: '2018' },
      ],
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.education?.[0]).toEqual({
      school: 'UC Berkeley',
      degree: 'BS CS',
      year: '2018',
    })
  })

  it('removes education key entirely when no entries are valid', () => {
    const out = coerceContent({
      name: 'A',
      tagline: 'B',
      bio: 'C',
      links: {},
      experience: [],
      projects: [],
      education: [{ foo: 'bar' }],
    }) as { education?: unknown }
    expect('education' in out).toBe(false)
  })
})

describe('coerceContent: skills', () => {
  const base = { name: 'A', tagline: 'B', bio: 'C', links: {}, experience: [], projects: [] }

  it('wraps a flat string array into a single category', () => {
    const out = coerceContent({ ...base, skills: ['Python', 'TypeScript'] })
    const parsed = contentSchema.parse(out)
    expect(parsed.skills).toHaveLength(1)
    expect(parsed.skills[0].category).toBe('Skills')
    expect(parsed.skills[0].items).toEqual(['Python', 'TypeScript'])
  })

  it('converts an object keyed by category name into the array shape', () => {
    const out = coerceContent({
      ...base,
      skills: { Languages: ['Python', 'Go'], Backend: ['FastAPI'] },
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.skills).toHaveLength(2)
    expect(parsed.skills.find((s) => s.category === 'Languages')?.items).toEqual(['Python', 'Go'])
  })

  it('accepts items that are objects with a name field', () => {
    const out = coerceContent({
      ...base,
      skills: [{ category: 'Backend', items: [{ name: 'FastAPI' }, { name: 'Express' }] }],
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.skills[0].items).toEqual(['FastAPI', 'Express'])
  })

  it('accepts "tools" synonym for items', () => {
    const out = coerceContent({
      ...base,
      skills: [{ category: 'DevOps', tools: ['Docker', 'Terraform'] }],
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.skills[0].items).toEqual(['Docker', 'Terraform'])
  })

  it('preserves icon field when present', () => {
    const out = coerceContent({
      ...base,
      skills: [{ category: 'Languages', icon: 'Code2', items: ['Python'] }],
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.skills[0].icon).toBe('Code2')
  })
})

describe('coerceContent: experience achievements + technologies', () => {
  const base = { name: 'A', tagline: 'B', bio: 'C', links: {}, projects: [] }

  it('splits a newline-separated achievements string into an array', () => {
    const out = coerceContent({
      ...base,
      experience: [
        {
          company: 'Acme',
          role: 'Eng',
          start: '2022',
          impact: 'Shipped things.',
          achievements: '• Led migration to TypeScript.\n• Cut build time by 40%.',
        },
      ],
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.experience[0].achievements).toHaveLength(2)
    expect(parsed.experience[0].achievements[0]).toBe('Led migration to TypeScript.')
  })

  it('accepts "bullets" synonym', () => {
    const out = coerceContent({
      ...base,
      experience: [
        {
          company: 'Acme',
          role: 'Eng',
          start: '2022',
          impact: 'x',
          bullets: ['One.', 'Two.'],
        },
      ],
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.experience[0].achievements).toEqual(['One.', 'Two.'])
  })

  it('moves top-level experience.tech into technologies', () => {
    const out = coerceContent({
      ...base,
      experience: [
        {
          company: 'Acme',
          role: 'Eng',
          start: '2022',
          impact: 'x',
          tech: ['React', 'Node.js'],
        },
      ],
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.experience[0].technologies).toEqual(['React', 'Node.js'])
  })
})

describe('coerceContent: projects', () => {
  const base = { name: 'A', tagline: 'B', bio: 'C', links: {}, experience: [] }

  it('moves technologies/stack/tags into tech', () => {
    const out = coerceContent({
      ...base,
      projects: [
        { title: 'x', description: 'y', technologies: ['a'] },
        { title: 'x2', description: 'y', stack: ['b'] },
        { title: 'x3', description: 'y', tags: ['c'] },
      ],
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.projects[0].tech).toEqual(['a'])
    expect(parsed.projects[1].tech).toEqual(['b'])
    expect(parsed.projects[2].tech).toEqual(['c'])
  })

  it('renames builtWith to built_with', () => {
    const out = coerceContent({
      ...base,
      projects: [{ title: 'x', description: 'y', builtWith: 'Claude Code' }],
    })
    const parsed = contentSchema.parse(out)
    expect(parsed.projects[0].built_with).toBe('Claude Code')
  })
})

describe('coerceContent: headline_points', () => {
  const base = { name: 'A', tagline: 'B', bio: 'C', links: {}, experience: [], projects: [] }

  it('wraps a single string into an array', () => {
    const out = coerceContent({ ...base, headline_points: 'One line.\nAnother line.' })
    const parsed = contentSchema.parse(out)
    expect(parsed.headline_points.length).toBeGreaterThan(0)
  })

  it('passes through a string array', () => {
    const out = coerceContent({ ...base, headline_points: ['A', 'B'] })
    const parsed = contentSchema.parse(out)
    expect(parsed.headline_points).toEqual(['A', 'B'])
  })
})

describe('coerceContent: decorative field strip', () => {
  it('removes icon/banner_image/illustration', () => {
    const out = coerceContent({
      name: 'A',
      tagline: 'B',
      bio: 'C',
      links: {},
      experience: [],
      projects: [],
      icon: 'foo',
      banner_image: 'bar',
      illustration: 'baz',
    }) as Record<string, unknown>
    expect(out.icon).toBeUndefined()
    expect(out.banner_image).toBeUndefined()
    expect(out.illustration).toBeUndefined()
  })
})
