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
