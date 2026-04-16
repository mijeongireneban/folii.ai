import { describe, expect, it } from 'vitest'
import { slugify } from '@/lib/content/slug'

describe('slugify', () => {
  it('lowercases, trims, and dasherizes whitespace', () => {
    expect(slugify('Hello World')).toBe('hello-world')
    expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces')
    expect(slugify('Snake_case_input')).toBe('snake-case-input')
  })

  it('strips punctuation and non-alphanumerics', () => {
    expect(slugify('What?! Is going on...')).toBe('what-is-going-on')
    expect(slugify('Rust 🦀 is cool')).toBe('rust-is-cool')
    expect(slugify('emoji-only: 🎉🎉🎉')).toBe('emoji-only')
  })

  it('collapses repeated and leading/trailing dashes', () => {
    expect(slugify('---weird---title---')).toBe('weird-title')
    expect(slugify('a--b--c')).toBe('a-b-c')
  })

  it('returns empty string when input has no slug-safe chars', () => {
    expect(slugify('')).toBe('')
    expect(slugify('!!!')).toBe('')
    expect(slugify('   ')).toBe('')
  })

  it('caps at 200 characters', () => {
    const long = 'a'.repeat(300)
    expect(slugify(long)).toHaveLength(200)
  })
})
