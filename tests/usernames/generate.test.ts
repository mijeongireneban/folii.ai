import { describe, expect, it } from 'vitest'
import {
  baseUsernameFromEmail,
  generateUsernameFromEmail,
  isReservedUsername,
  resolveUniqueUsername,
} from '@/lib/usernames/generate'

describe('baseUsernameFromEmail', () => {
  it('lowercases and strips the domain', () => {
    expect(baseUsernameFromEmail('Maya@example.com')).toBe('maya')
  })

  it('drops gmail plus-addressing', () => {
    expect(baseUsernameFromEmail('maya+work@gmail.com')).toBe('maya')
  })

  it('replaces dots and underscores with dashes', () => {
    expect(baseUsernameFromEmail('maya.o_kon@example.com')).toBe('maya-o-kon')
  })

  it('strips disallowed characters', () => {
    expect(baseUsernameFromEmail('maya!!$$@example.com')).toBe('maya')
  })

  it('collapses runs of dashes and trims edges', () => {
    expect(baseUsernameFromEmail('--maya..okonkwo--@x.com')).toBe('maya-okonkwo')
  })

  it('handles input with no @ by treating whole string as local part', () => {
    expect(baseUsernameFromEmail('maya')).toBe('maya')
  })
})

describe('isReservedUsername', () => {
  it('flags reserved names', () => {
    expect(isReservedUsername('admin')).toBe(true)
    expect(isReservedUsername('editor')).toBe(true)
    expect(isReservedUsername('API')).toBe(true)
  })

  it('allows normal names', () => {
    expect(isReservedUsername('maya')).toBe(false)
  })
})

describe('generateUsernameFromEmail', () => {
  it('produces usable output for a normal email', () => {
    expect(generateUsernameFromEmail('maya.okonkwo@example.com')).toBe(
      'maya-okonkwo'
    )
  })

  it('pads too-short bases', () => {
    const out = generateUsernameFromEmail('ab@example.com')
    expect(out.length).toBeGreaterThanOrEqual(3)
    expect(out).toMatch(/^ab[a-z0-9]+/)
  })

  it('truncates too-long bases to 30 chars', () => {
    const longLocal = 'a'.repeat(60)
    const out = generateUsernameFromEmail(`${longLocal}@example.com`)
    expect(out.length).toBeLessThanOrEqual(30)
  })

  it('appends a suffix to reserved names', () => {
    const out = generateUsernameFromEmail('admin@example.com')
    expect(out).not.toBe('admin')
    expect(out.startsWith('admin-')).toBe(true)
  })
})

describe('resolveUniqueUsername', () => {
  it('returns base when free', () => {
    expect(resolveUniqueUsername('maya', new Set())).toBe('maya')
  })

  it('appends -2 on first collision', () => {
    expect(resolveUniqueUsername('maya', new Set(['maya']))).toBe('maya-2')
  })

  it('increments until a free slot is found', () => {
    const taken = new Set(['maya', 'maya-2', 'maya-3'])
    expect(resolveUniqueUsername('maya', taken)).toBe('maya-4')
  })
})
