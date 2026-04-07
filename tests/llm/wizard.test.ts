import { describe, it, expect, vi } from 'vitest'
import { runWizardStep } from '@/lib/llm/wizard'
import { emptyContent } from '@/lib/schemas/content'

function fakeLLM(json: object) {
  return {
    chat: { completions: { create: vi.fn().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(json) } }],
    }) } },
  } as any
}

describe('runWizardStep', () => {
  it('handles identity step', async () => {
    const llm = fakeLLM({ name: 'Mijeong', title: 'SWE' })
    const r = await runWizardStep({ llm, step: 'identity', userMessage: 'I am Mijeong, SWE', content: emptyContent() })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.content.profile.name).toBe('Mijeong')
  })

  it('handles currentRole step', async () => {
    const llm = fakeLLM({
      role: 'Lead', company: 'Cipherome', location: 'SJ', duration: '2022–',
      description: 'lead', achievements: ['x'], technologies: ['ts'],
    })
    const r = await runWizardStep({ llm, step: 'currentRole', userMessage: 'lead at cipherome', content: emptyContent() })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.content.experience[0].company).toBe('Cipherome')
  })
})
