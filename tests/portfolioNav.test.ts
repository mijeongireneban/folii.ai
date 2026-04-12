import { describe, expect, it } from 'vitest'
import { coerceContent } from '@/lib/llm/coerce'
import {
  coerceHiddenSections,
  getVisiblePortfolioNavItems,
} from '@/components/template/v2/portfolioNav'

describe('portfolio nav hiding', () => {
  it('normalizes hidden section names from labels and aliases', () => {
    expect(coerceHiddenSections(['Projects', 'contact', 'Work Experience'])).toEqual([
      'projects',
      'contact',
      'experience',
    ])
  })

  it('filters hidden items from the shared nav config', () => {
    const visible = getVisiblePortfolioNavItems(['projects', 'contact'])
    expect(visible.map((item) => item.key)).toEqual(['profile', 'experience', 'skills'])
  })

  it('coerces hiddenSections from LLM output into hidden_sections', () => {
    const content = coerceContent({
      name: 'Ada Lovelace',
      tagline: 'Engineer',
      bio: 'I build things.',
      hiddenSections: ['Projects', 'Contact'],
    }) as { hidden_sections?: string[] }

    expect(content.hidden_sections).toEqual(['projects', 'contact'])
  })
})
