import { describe, it, expect, vi } from 'vitest'
import { runChatTurn } from '@/lib/llm/chat'
import { emptyContent } from '@/lib/schemas/content'

function fakeLLM(response: object) {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: JSON.stringify(response) } }],
        }),
      },
    },
  } as any
}

describe('runChatTurn', () => {
  it('applies a valid patch returned by the LLM', async () => {
    const llm = fakeLLM({
      patch: [{ op: 'replace', path: '/profile/name', value: 'Mijeong' }],
      summary: 'set name to Mijeong',
    })
    const result = await runChatTurn({
      llm, content: emptyContent(), userMessage: 'my name is Mijeong',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.content.profile.name).toBe('Mijeong')
      expect(result.summary).toContain('Mijeong')
    }
  })

  it('retries once when first patch fails validation', async () => {
    const llm = {
      chat: {
        completions: {
          create: vi.fn()
            .mockResolvedValueOnce({
              choices: [{ message: { content: JSON.stringify({
                patch: [{ op: 'remove', path: '/profile/name' }],
                summary: 'clear name',
              }) } }],
            })
            .mockResolvedValueOnce({
              choices: [{ message: { content: JSON.stringify({
                patch: [{ op: 'replace', path: '/profile/name', value: 'Mijeong' }],
                summary: 'set name',
              }) } }],
            }),
        },
      },
    } as any
    const start = emptyContent()
    start.profile.name = 'Old'
    const result = await runChatTurn({
      llm, content: start, userMessage: 'set my name to Mijeong',
    })
    expect(result.ok).toBe(true)
    expect(llm.chat.completions.create).toHaveBeenCalledTimes(2)
  })

  it('returns error when both attempts fail', async () => {
    const bad = { patch: [{ op: 'remove', path: '/profile/name' }], summary: 'x' }
    const llm = fakeLLM(bad)
    llm.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(bad) } }],
    })
    const start = emptyContent(); start.profile.name = 'Old'
    const result = await runChatTurn({ llm, content: start, userMessage: 'x' })
    expect(result.ok).toBe(false)
  })
})
