import { describe, expect, it } from 'vitest'
import {
  CHAT_EDIT_SYSTEM,
  PARSE_RESUME_SYSTEM,
  renderChatEditUserMessage,
  renderParseResumeUserMessage,
} from '@/lib/llm/prompts'

describe('PARSE_RESUME_SYSTEM', () => {
  it('forbids decorative fields', () => {
    expect(PARSE_RESUME_SYSTEM).toContain('icon')
    expect(PARSE_RESUME_SYSTEM).toContain('banner_image')
    expect(PARSE_RESUME_SYSTEM).toContain('illustration')
  })

  it('specifies JSON-only output', () => {
    expect(PARSE_RESUME_SYSTEM.toLowerCase()).toContain('json only')
  })

  it('mentions the not_a_resume escape hatch', () => {
    expect(PARSE_RESUME_SYSTEM).toContain('not_a_resume')
  })

  it('reminds the model about schema length caps', () => {
    expect(PARSE_RESUME_SYSTEM).toMatch(/name<=80/)
    expect(PARSE_RESUME_SYSTEM).toMatch(/bio<=1200/)
  })

  it('documents the v2 schema fields', () => {
    expect(PARSE_RESUME_SYSTEM).toContain('headline_points')
    expect(PARSE_RESUME_SYSTEM).toContain('years_experience')
    expect(PARSE_RESUME_SYSTEM).toContain('achievements')
    expect(PARSE_RESUME_SYSTEM).toContain('technologies')
    expect(PARSE_RESUME_SYSTEM).toContain('skills')
    expect(PARSE_RESUME_SYSTEM).toContain('category')
    expect(PARSE_RESUME_SYSTEM).toContain('built_with')
  })
})

describe('CHAT_EDIT_SYSTEM', () => {
  it('insists on returning the FULL content object', () => {
    expect(CHAT_EDIT_SYSTEM).toContain('FULL updated content')
    expect(CHAT_EDIT_SYSTEM).toContain('Not a diff')
  })

  it('preserves unrelated fields', () => {
    expect(CHAT_EDIT_SYSTEM).toContain('Preserve every field')
  })

  it('forbids decorative fields', () => {
    expect(CHAT_EDIT_SYSTEM).toContain('icon')
    expect(CHAT_EDIT_SYSTEM).toContain('banner_image')
  })

  it('refuses destructive requests', () => {
    expect(CHAT_EDIT_SYSTEM.toLowerCase()).toContain('delete everything')
  })
})

describe('renderParseResumeUserMessage', () => {
  it('wraps the resume text with a clear directive', () => {
    const out = renderParseResumeUserMessage('John Doe\nEngineer')
    expect(out).toContain('John Doe')
    expect(out).toContain('folii Content JSON')
  })

  it('trims whitespace', () => {
    expect(renderParseResumeUserMessage('  hi  ')).toContain('hi')
  })
})

describe('renderChatEditUserMessage', () => {
  it('labels CURRENT_CONTENT and USER_REQUEST blocks', () => {
    const out = renderChatEditUserMessage(
      '{"name":"Maya"}',
      'tighten the bio'
    )
    expect(out).toContain('CURRENT_CONTENT:')
    expect(out).toContain('USER_REQUEST:')
    expect(out).toContain('Maya')
    expect(out).toContain('tighten the bio')
  })
})
