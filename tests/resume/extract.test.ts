import { describe, expect, it } from 'vitest'
import { extractResumeText, _internal } from '@/lib/resume/extract'

function textFile(body: string, name = 'resume.txt', type = 'text/plain'): File {
  return new File([body], name, { type })
}

describe('normalize', () => {
  it('collapses excess whitespace and blank lines', () => {
    const out = _internal.normalize('Hello   world\n\n\n\nfoo\r\nbar  \n')
    expect(out).toBe('Hello world\n\nfoo\nbar')
  })
})

describe('extractResumeText (text branch)', () => {
  it('extracts plain text from a .txt file', async () => {
    const body = 'Maya Okonkwo\nStaff engineer\nacme — 2022 to present'
    const res = await extractResumeText(textFile(body))
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.kind).toBe('text')
      expect(res.text).toContain('Maya Okonkwo')
    }
  })

  it('rejects empty files', async () => {
    const res = await extractResumeText(textFile('hi'))
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.reason).toBe('empty')
  })

  it('rejects unsupported types', async () => {
    const file = new File(['{}'], 'data.json', { type: 'application/json' })
    const res = await extractResumeText(file)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.reason).toBe('unsupported')
  })

  it('honors .md extension even without a text/* mime', async () => {
    const body = '# Maya\n\nStaff engineer building developer tools at a Series B startup.'
    const file = new File([body], 'resume.md', { type: '' })
    const res = await extractResumeText(file)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.kind).toBe('text')
  })
})
