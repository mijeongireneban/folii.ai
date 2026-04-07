import { describe, it, expect } from 'vitest'
import { canPublish } from '@/app/api/publish/canPublish'
import { emptyContent } from '@/lib/schemas/content'

describe('canPublish', () => {
  it('rejects empty content', () => {
    expect(canPublish(emptyContent(), 'mijeong').ok).toBe(false)
  })
  it('rejects missing username', () => {
    const c = emptyContent(); c.profile.name = 'M'; c.profile.title = 'X'; c.profile.bio = 'b'
    expect(canPublish(c, null).ok).toBe(false)
  })
  it('accepts a minimal valid portfolio', () => {
    const c = emptyContent(); c.profile.name = 'M'; c.profile.title = 'X'; c.profile.bio = 'b'
    expect(canPublish(c, 'mijeong').ok).toBe(true)
  })
})
