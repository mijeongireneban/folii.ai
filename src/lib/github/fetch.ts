// Fetch public GitHub repo metadata for enriching chat messages.
// Uses the unauthenticated GitHub API (60 req/hour per IP).

const GITHUB_URL_RE =
  /https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?/g

export type RepoMeta = {
  owner: string
  name: string
  fullName: string
  description: string | null
  language: string | null
  topics: string[]
  stars: number
  forks: number
  homepage: string | null
  htmlUrl: string
}

export function extractGitHubUrls(text: string): { owner: string; repo: string }[] {
  const matches: { owner: string; repo: string }[] = []
  const seen = new Set<string>()
  for (const m of text.matchAll(GITHUB_URL_RE)) {
    const owner = m[1]
    // Strip .git suffix and trailing fragments
    const repo = m[2].replace(/\.git$/, '')
    const key = `${owner}/${repo}`.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      matches.push({ owner, repo })
    }
  }
  return matches
}

export async function fetchRepoMeta(
  owner: string,
  repo: string,
): Promise<{ ok: true; data: RepoMeta } | { ok: false; status: number }> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'folii-ai',
    },
    next: { revalidate: 3600 }, // cache for 1 hour
  })

  if (!res.ok) {
    return { ok: false, status: res.status }
  }

  const json = await res.json()
  return {
    ok: true,
    data: {
      owner: json.owner?.login ?? owner,
      name: json.name ?? repo,
      fullName: json.full_name ?? `${owner}/${repo}`,
      description: json.description ?? null,
      language: json.language ?? null,
      topics: json.topics ?? [],
      stars: json.stargazers_count ?? 0,
      forks: json.forks_count ?? 0,
      homepage: json.homepage || null,
      htmlUrl: json.html_url ?? `https://github.com/${owner}/${repo}`,
    },
  }
}

// Fetch all GitHub repos mentioned in a message.
// Returns enriched data for each successfully fetched repo.
export async function fetchGitHubReposFromMessage(
  message: string,
): Promise<RepoMeta[]> {
  const urls = extractGitHubUrls(message)
  if (urls.length === 0) return []

  // Limit to 3 repos per message to stay within rate limits
  const toFetch = urls.slice(0, 3)
  const results = await Promise.all(
    toFetch.map((u) => fetchRepoMeta(u.owner, u.repo)),
  )

  return results
    .filter((r): r is { ok: true; data: RepoMeta } => r.ok)
    .map((r) => r.data)
}

// Format repo metadata as a text block to inject into the chat message.
export function formatRepoContext(repos: RepoMeta[]): string {
  if (repos.length === 0) return ''

  const blocks = repos.map((r) => {
    const lines = [
      `Repository: ${r.fullName}`,
      `URL: ${r.htmlUrl}`,
      r.description && `Description: ${r.description}`,
      r.language && `Primary language: ${r.language}`,
      r.topics.length > 0 && `Topics: ${r.topics.join(', ')}`,
      `Stars: ${r.stars.toLocaleString()}`,
      r.homepage && `Homepage: ${r.homepage}`,
    ]
    return lines.filter(Boolean).join('\n')
  })

  return `\n\n[GITHUB_REPO_DATA]\n${blocks.join('\n---\n')}`
}
