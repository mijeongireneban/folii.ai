import { describe, it, expect } from 'vitest'
import { ContentSchema, emptyContent } from '@/lib/schemas/content'

describe('ContentSchema', () => {
  it('accepts an empty content object from the factory', () => {
    expect(() => ContentSchema.parse(emptyContent())).not.toThrow()
  })

  it('rejects content missing profile.name', () => {
    const c = emptyContent()
    // @ts-expect-error
    delete c.profile.name
    expect(() => ContentSchema.parse(c)).toThrow()
  })

  it('accepts a fully populated portfolio', () => {
    const c = emptyContent()
    c.profile.name = 'Mijeong'
    c.profile.title = 'Software Engineer'
    c.profile.bio = 'Hi!'
    c.experience.push({
      role: 'Lead Engineer',
      company: 'Cipherome',
      location: 'San Jose, CA',
      duration: 'Feb 2022 – Present',
      description: 'Lead a team',
      achievements: ['shipped X'],
      technologies: ['TypeScript'],
      link: '#',
      projects: [],
    })
    expect(() => ContentSchema.parse(c)).not.toThrow()
  })

  it('rejects a project with missing required fields', () => {
    const c = emptyContent()
    // @ts-expect-error
    c.projects.push({ title: 'X' })
    expect(() => ContentSchema.parse(c)).toThrow()
  })
})
