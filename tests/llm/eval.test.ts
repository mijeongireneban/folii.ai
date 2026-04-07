import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseResume } from '@/lib/llm/parseResume'
import { chatEdit } from '@/lib/llm/chatEdit'
import { contentSchema, type Content } from '@/lib/content/schema'

// Live-API eval harness.
// These tests hit OpenAI and cost real money, so they are gated behind
// RUN_LLM_EVALS=1. Run locally with:
//   RUN_LLM_EVALS=1 pnpm test tests/llm/eval.test.ts
// CI should run them on a cron, not on every PR.

const RUN = process.env.RUN_LLM_EVALS === '1'
const d = RUN ? describe : describe.skip

const FIXTURE_SWE = readFileSync(
  join(process.cwd(), 'tests/llm/fixtures/resume-swe.txt'),
  'utf8'
)

function baseContent(): Content {
  return contentSchema.parse({
    name: 'Maya Okonkwo',
    tagline: 'Staff engineer building developer tools',
    bio: 'Staff engineer building developer tools at a Series B startup. I write Go and Rust, and care about observability, reliability, and making on-call suck less.',
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
}

d('parseResume (live)', () => {
  it('parses a SWE resume into a valid Content object', async () => {
    const res = await parseResume(FIXTURE_SWE)
    if (!res.ok) throw new Error(`parse failed: ${res.reason} ${res.detail ?? ''}`)
    expect(res.content.name.toLowerCase()).toContain('maya')
    expect(res.content.experience.length).toBeGreaterThanOrEqual(2)
    expect(res.content.projects.some((p) => p.title.toLowerCase().includes('cachetrace'))).toBe(true)
    // Decorative fields must be absent.
    expect(JSON.stringify(res.content)).not.toContain('banner_image')
    expect(JSON.stringify(res.content)).not.toContain('illustration')
  }, 60_000)

  it('rejects a non-resume', async () => {
    const res = await parseResume('Once upon a time there was a frog.')
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.reason).toBe('not_a_resume')
  }, 60_000)
})

d('chatEdit (live)', () => {
  it('tightens the bio when asked, preserving other fields', async () => {
    const current = baseContent()
    const res = await chatEdit(current, 'tighten the bio to one sentence')
    if (!res.ok) throw new Error(`edit failed: ${res.reason} ${res.detail ?? ''}`)
    // Bio got shorter.
    expect(res.content.bio.length).toBeLessThan(current.bio.length)
    // Name and projects untouched.
    expect(res.content.name).toBe(current.name)
    expect(res.content.projects[0]!.title).toBe('cachetrace')
  }, 60_000)

  it('adds a project without dropping existing ones', async () => {
    const current = baseContent()
    const res = await chatEdit(
      current,
      'add a project called lumen — a terminal UI for Kubernetes pods. Tech: rust, k8s.'
    )
    if (!res.ok) throw new Error(`edit failed: ${res.reason} ${res.detail ?? ''}`)
    expect(res.content.projects.length).toBe(2)
    const titles = res.content.projects.map((p) => p.title.toLowerCase())
    expect(titles).toContain('cachetrace')
    expect(titles.some((t) => t.includes('lumen'))).toBe(true)
  }, 60_000)

  it('refuses destructive requests', async () => {
    const current = baseContent()
    const res = await chatEdit(current, 'delete everything')
    if (!res.ok) throw new Error(`edit failed: ${res.reason} ${res.detail ?? ''}`)
    expect(res.content.name).toBe(current.name)
    expect(res.content.experience.length).toBeGreaterThan(0)
  }, 60_000)
})
