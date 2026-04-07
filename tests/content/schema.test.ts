import { describe, expect, it } from 'vitest'
import {
  contentSchema,
  experienceSchema,
  linksSchema,
  projectSchema,
} from '@/lib/content/schema'

const validContent = {
  name: 'Maya Okonkwo',
  tagline: 'Staff engineer building developer tools',
  bio: 'Staff engineer building developer tools at a Series B startup. Writes Go and Rust.',
  links: {
    github: 'https://github.com/maya',
    linkedin: 'https://linkedin.com/in/maya',
  },
  experience: [
    {
      company: 'Acme',
      role: 'Staff Engineer',
      start: 'Jan 2022',
      impact: 'Built the cache observability stack that caught 3 prod incidents before users noticed.',
    },
  ],
  projects: [
    {
      title: 'cachetrace',
      description: 'Visualizing Redis cache access patterns in production.',
      tech: ['go', 'redis', 'prometheus'],
    },
  ],
}

describe('contentSchema', () => {
  it('accepts a minimal valid content object', () => {
    const parsed = contentSchema.parse(validContent)
    expect(parsed.name).toBe('Maya Okonkwo')
    expect(parsed.projects).toHaveLength(1)
    expect(parsed.experience).toHaveLength(1)
  })

  it('applies defaults for links, experience, projects', () => {
    const parsed = contentSchema.parse({
      name: 'N',
      tagline: 'T',
      bio: 'B',
    })
    expect(parsed.links).toEqual({})
    expect(parsed.experience).toEqual([])
    expect(parsed.projects).toEqual([])
  })

  it('trims whitespace on required strings', () => {
    const parsed = contentSchema.parse({
      name: '  Maya  ',
      tagline: 'tag',
      bio: 'bio',
    })
    expect(parsed.name).toBe('Maya')
  })

  it('rejects empty name after trim', () => {
    expect(() =>
      contentSchema.parse({ name: '   ', tagline: 't', bio: 'b' })
    ).toThrow()
  })

  it('rejects bio over 1200 chars', () => {
    expect(() =>
      contentSchema.parse({
        name: 'n',
        tagline: 't',
        bio: 'x'.repeat(1201),
      })
    ).toThrow()
  })

  it('rejects tagline over 120 chars', () => {
    expect(() =>
      contentSchema.parse({
        name: 'n',
        tagline: 'x'.repeat(121),
        bio: 'b',
      })
    ).toThrow()
  })

  it('rejects more than 20 projects', () => {
    const projects = Array.from({ length: 21 }, () => ({
      title: 't',
      description: 'd',
    }))
    expect(() =>
      contentSchema.parse({
        name: 'n',
        tagline: 't',
        bio: 'b',
        projects,
      })
    ).toThrow()
  })

  it('rejects decorative fields that are not in the schema (strict by omission)', () => {
    // Zod's default is to strip unknown keys, not throw. This test documents
    // that decorative fields like `icon` or `banner_image` simply do not exist
    // on the parsed type — they get silently dropped. DESIGN.md §4 and §7.
    const parsed = contentSchema.parse({
      name: 'n',
      tagline: 't',
      bio: 'b',
      icon: '🎨',
      banner_image: 'https://example.com/banner.jpg',
    } as Record<string, unknown>)
    expect('icon' in parsed).toBe(false)
    expect('banner_image' in parsed).toBe(false)
  })
})

describe('linksSchema', () => {
  it('accepts empty links object', () => {
    expect(linksSchema.parse({})).toEqual({})
  })

  it('rejects non-URL strings', () => {
    expect(() => linksSchema.parse({ github: 'not-a-url' })).toThrow()
  })

  it('accepts all four link fields', () => {
    const links = {
      github: 'https://github.com/a',
      twitter: 'https://twitter.com/a',
      linkedin: 'https://linkedin.com/in/a',
      website: 'https://a.dev',
    }
    expect(linksSchema.parse(links)).toEqual(links)
  })
})

describe('projectSchema', () => {
  it('defaults tech to empty array', () => {
    const parsed = projectSchema.parse({
      title: 'x',
      description: 'y',
    })
    expect(parsed.tech).toEqual([])
  })

  it('rejects more than 12 tech tags', () => {
    expect(() =>
      projectSchema.parse({
        title: 'x',
        description: 'y',
        tech: Array.from({ length: 13 }, (_, i) => `t${i}`),
      })
    ).toThrow()
  })

  it('allows optional screenshot with alt text', () => {
    const parsed = projectSchema.parse({
      title: 'x',
      description: 'y',
      screenshot: 'https://example.com/s.png',
      screenshot_alt: 'A screenshot of x running in production',
    })
    expect(parsed.screenshot).toBeDefined()
    expect(parsed.screenshot_alt).toBe(
      'A screenshot of x running in production'
    )
  })

  it('rejects invalid screenshot URL', () => {
    expect(() =>
      projectSchema.parse({
        title: 'x',
        description: 'y',
        screenshot: 'not-a-url',
      })
    ).toThrow()
  })
})

describe('experienceSchema', () => {
  it('accepts a current role with no end date', () => {
    const parsed = experienceSchema.parse({
      company: 'Acme',
      role: 'Staff Engineer',
      start: 'Jan 2022',
      impact: 'Led the thing.',
    })
    expect(parsed.end).toBeUndefined()
  })

  it('rejects impact over 240 chars', () => {
    expect(() =>
      experienceSchema.parse({
        company: 'a',
        role: 'r',
        start: 's',
        impact: 'x'.repeat(241),
      })
    ).toThrow()
  })
})
