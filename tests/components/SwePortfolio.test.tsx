import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SwePortfolio } from '@/components/template/SwePortfolio'
import { contentSchema, type Content } from '@/lib/content/schema'

function render(content: Content): string {
  return renderToStaticMarkup(<SwePortfolio content={content} />)
}

const baseContent: Content = contentSchema.parse({
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
      impact:
        'Built the cache observability stack that caught 3 prod incidents before users noticed.',
    },
  ],
  projects: [
    {
      title: 'cachetrace',
      description: 'Visualizing Redis cache access patterns in production.',
      tech: ['go', 'redis'],
      url: 'https://github.com/maya/cachetrace',
    },
  ],
})

describe('SwePortfolio', () => {
  it('renders the hero name', () => {
    const html = render(baseContent)
    expect(html).toContain('Maya Okonkwo')
  })

  it('renders the tagline and bio', () => {
    const html = render(baseContent)
    expect(html).toContain('Staff engineer building developer tools')
    expect(html).toContain('Writes Go and Rust')
  })

  it('renders project cards with tech tags', () => {
    const html = render(baseContent)
    expect(html).toContain('cachetrace')
    expect(html).toContain('Visualizing Redis')
    expect(html).toContain('>go<')
    expect(html).toContain('>redis<')
  })

  it('wraps a project in an anchor when url is present', () => {
    const html = render(baseContent)
    expect(html).toContain('href="https://github.com/maya/cachetrace"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('renders the experience timeline with dates and company', () => {
    const html = render(baseContent)
    expect(html).toContain('Jan 2022 — Present')
    expect(html).toContain('Acme')
    expect(html).toContain('Staff Engineer')
  })

  it('renders link entries that exist in content.links', () => {
    const html = render(baseContent)
    expect(html).toContain('href="https://github.com/maya"')
    expect(html).toContain('href="https://linkedin.com/in/maya"')
    // twitter and website were not provided → must not render
    expect(html).not.toContain('>twitter<')
    expect(html).not.toContain('>website<')
  })

  it('renders the footer "Built with folii.ai" link', () => {
    const html = render(baseContent)
    expect(html).toContain('Built with folii.ai')
  })

  it('hides the Projects section entirely when there are zero projects', () => {
    const empty = contentSchema.parse({
      ...baseContent,
      projects: [],
    })
    const html = render(empty)
    expect(html).not.toContain('>Projects<')
    // Make sure we did not render the "projects-heading" id either
    expect(html).not.toContain('projects-heading')
  })

  it('hides the Experience section when there are zero roles', () => {
    const empty = contentSchema.parse({
      ...baseContent,
      experience: [],
    })
    const html = render(empty)
    expect(html).not.toContain('experience-heading')
  })

  it('hides the Elsewhere section when links is empty', () => {
    const empty = contentSchema.parse({
      ...baseContent,
      links: {},
    })
    const html = render(empty)
    expect(html).not.toContain('links-heading')
  })

  it('formats end date as "Present" when end is undefined', () => {
    const html = render(baseContent)
    expect(html).toContain('Jan 2022 — Present')
  })

  it('formats closed experience with end date', () => {
    const closed = contentSchema.parse({
      ...baseContent,
      experience: [
        {
          company: 'Stripe',
          role: 'SWE',
          start: '2018',
          end: '2021',
          impact: 'Shipped the thing.',
        },
      ],
    })
    const html = render(closed)
    expect(html).toContain('2018 — 2021')
  })

  it('does not render any decorative fields even if somehow present on input', () => {
    // Schema strips them, but belt-and-suspenders: template must not reference
    // icon, banner_image, or illustration anywhere in its output.
    const html = render(baseContent)
    expect(html).not.toContain('banner_image')
    expect(html).not.toContain('illustration')
  })

  it('applies the Framer Blue ring shadow to project cards', () => {
    const html = render(baseContent)
    expect(html).toContain('rgba(0, 153, 255, 0.15) 0px 0px 0px 1px')
  })

  it('uses Cabinet Grotesk for the hero', () => {
    const html = render(baseContent)
    expect(html).toContain('Cabinet Grotesk')
    expect(html).toContain('-5.5px')
  })
})
