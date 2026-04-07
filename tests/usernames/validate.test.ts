import { describe, it, expect } from 'vitest'
import { validateUsername } from '@/lib/usernames/validate'

describe('validateUsername', () => {
  it.each(['mijeong', 'jane-doe', 'abc', 'user123'])(
    'accepts %s',
    (u) => expect(validateUsername(u).ok).toBe(true),
  )

  it.each([
    'ab',                  // too short
    'a'.repeat(31),        // too long
    'Mijeong',             // uppercase
    'jane_doe',            // underscore
    'jane.doe',            // dot
    '-jane',               // leading dash
    'jane-',               // trailing dash
    'edit',                // reserved
    'api',                 // reserved
    'admin',               // reserved
  ])('rejects %s', (u) => expect(validateUsername(u).ok).toBe(false))
})
