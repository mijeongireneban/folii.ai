import { describe, it, expect } from 'vitest'
import { applyPatchValidated } from '@/lib/content/patch'
import { emptyContent } from '@/lib/schemas/content'

describe('applyPatchValidated', () => {
  it('applies a valid patch and returns the new content', () => {
    const before = emptyContent()
    const result = applyPatchValidated(before, [
      { op: 'replace', path: '/profile/name', value: 'Mijeong' },
      { op: 'replace', path: '/profile/title', value: 'SWE' },
    ])
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.content.profile.name).toBe('Mijeong')
      expect(result.content.profile.title).toBe('SWE')
    }
  })

  it('rejects a patch that produces invalid content', () => {
    const before = emptyContent()
    before.profile.name = 'M'
    // Removing a required field via JSON Patch 'remove' should fail Zod validation
    const result = applyPatchValidated(before, [
      { op: 'remove', path: '/profile/name' },
    ])
    expect(result.ok).toBe(false)
  })

  it('rejects a malformed patch operation', () => {
    const before = emptyContent()
    const result = applyPatchValidated(before, [
      // @ts-expect-error
      { op: 'nonsense', path: '/profile/name', value: 'X' },
    ])
    expect(result.ok).toBe(false)
  })

  it('does not mutate the input', () => {
    const before = emptyContent()
    applyPatchValidated(before, [
      { op: 'replace', path: '/profile/name', value: 'Mijeong' },
    ])
    expect(before.profile.name).toBe('')
  })
})
