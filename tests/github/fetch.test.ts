import { describe, it, expect } from 'vitest'
import { extractGitHubUrls, formatRepoContext, type RepoMeta } from '@/lib/github/fetch'

describe('extractGitHubUrls', () => {
  it('extracts a single repo URL', () => {
    const result = extractGitHubUrls('check out https://github.com/vercel/next.js')
    expect(result).toEqual([{ owner: 'vercel', repo: 'next.js' }])
  })

  it('extracts multiple repo URLs', () => {
    const result = extractGitHubUrls(
      'add https://github.com/user/repo1 and https://github.com/user/repo2',
    )
    expect(result).toEqual([
      { owner: 'user', repo: 'repo1' },
      { owner: 'user', repo: 'repo2' },
    ])
  })

  it('deduplicates same repo', () => {
    const result = extractGitHubUrls(
      'https://github.com/user/repo https://github.com/user/repo',
    )
    expect(result).toEqual([{ owner: 'user', repo: 'repo' }])
  })

  it('handles trailing slash', () => {
    const result = extractGitHubUrls('https://github.com/user/repo/')
    expect(result).toEqual([{ owner: 'user', repo: 'repo' }])
  })

  it('strips .git suffix', () => {
    const result = extractGitHubUrls('https://github.com/user/repo.git')
    expect(result).toEqual([{ owner: 'user', repo: 'repo' }])
  })

  it('returns empty for non-GitHub URLs', () => {
    const result = extractGitHubUrls('check out https://gitlab.com/user/repo')
    expect(result).toEqual([])
  })

  it('returns empty for no URLs', () => {
    const result = extractGitHubUrls('add a project about my CLI tool')
    expect(result).toEqual([])
  })

  it('handles www prefix', () => {
    const result = extractGitHubUrls('https://www.github.com/user/repo')
    expect(result).toEqual([{ owner: 'user', repo: 'repo' }])
  })
})

describe('formatRepoContext', () => {
  const repo: RepoMeta = {
    owner: 'vercel',
    name: 'next.js',
    fullName: 'vercel/next.js',
    description: 'The React Framework',
    language: 'JavaScript',
    topics: ['react', 'nextjs', 'framework'],
    stars: 125000,
    forks: 26000,
    homepage: 'https://nextjs.org',
    htmlUrl: 'https://github.com/vercel/next.js',
  }

  it('formats a repo into a text block', () => {
    const result = formatRepoContext([repo])
    expect(result).toContain('[GITHUB_REPO_DATA]')
    expect(result).toContain('vercel/next.js')
    expect(result).toContain('The React Framework')
    expect(result).toContain('JavaScript')
    expect(result).toContain('react, nextjs, framework')
    expect(result).toContain('125,000')
    expect(result).toContain('https://nextjs.org')
  })

  it('returns empty string for no repos', () => {
    expect(formatRepoContext([])).toBe('')
  })
})
