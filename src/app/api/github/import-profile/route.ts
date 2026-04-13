import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { contentSchema, type Content } from '@/lib/content/schema'
import { PLACEHOLDER_CONTENT } from '@/lib/content/placeholder'
import { BUCKETS, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { MODEL, openai } from '@/lib/llm/client'
import { coerceContent } from '@/lib/llm/coerce'

export const runtime = 'nodejs'
export const maxDuration = 60

type GhRepo = {
  language: string | null
  topics: string[]
  stargazers_count: number
  fork: boolean
}

function aggregateSkills(repos: GhRepo[]): { language: string; count: number }[] {
  const langMap = new Map<string, number>()
  for (const r of repos) {
    if (r.fork || !r.language) continue
    langMap.set(r.language, (langMap.get(r.language) ?? 0) + 1)
  }
  return [...langMap.entries()]
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
}

function aggregateTopics(repos: GhRepo[]): string[] {
  const topicSet = new Set<string>()
  for (const r of repos) {
    for (const t of r.topics ?? []) {
      topicSet.add(t)
    }
  }
  return [...topicSet].slice(0, 50)
}

const PROFILE_IMPORT_SYSTEM = `You are folii.ai's GitHub profile importer. You receive a GitHub user's profile data and aggregated repository statistics. Your job is to produce a JSON object that matches the folii Content schema exactly.

Rules:
- Output a single JSON object at the top level. NOT an array, NOT wrapped.
- Output JSON only. No prose, no markdown.
- name: from GitHub profile name, or login as fallback.
- tagline: craft from their bio and top languages (<=120 chars). Be specific about what they build.
- bio: 2-4 sentences in first person ("I build..."), present tense. Synthesize from their bio, company, top languages, and notable topics. Focus on craft.
- location: from GitHub profile if present.
- timezone: IANA timezone if inferrable from location. Omit if unsure.
- email: only if provided in profile.
- avatar_initials: 1-3 uppercase letters from the name.
- headline_points: up to 4 short highlights (<=120 chars each). Use their top languages, repo count, total stars, and any notable topics.
- years_experience: infer from account creation date if possible (e.g. "10+ years on GitHub"). Omit if unclear.
- skills[]: THIS IS CRITICAL. Group all languages and technologies into logical categories:
  - Use the repo language data to determine which languages they actually use.
  - Use topics to identify frameworks and tools (e.g. "react" topic → React in Frontend).
  - Create 3-8 categories like: Languages, Frontend, Backend, Databases, Cloud/Infra, AI & ML, DevOps, Mobile.
  - icon: lucide icon name (Code2, Server, Globe, DatabaseZap, Cloud, Bot, Wrench, Palette, Smartphone, Cpu, Layers).
  - Rank by repo count — languages used in more repos should appear first.
- links: set github to profile URL. Include blog/website if present. Include twitter if present (as https://x.com/handle).
- experience[]: leave empty (we don't have employment data from GitHub).
- projects[]: leave empty (user can import specific repos separately via Browse).
- education[]: omit.

REQUIRED SHAPE: same as the folii Content schema. Top-level keys: name, tagline, bio, location, timezone, email, avatar_initials, headline_points, years_experience, links, experience, projects, skills, education.

Keep strings inside schema length caps. Never hallucinate data not present in the input.`

export async function POST() {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  // 2. Rate limit
  const rl = await checkRateLimit(BUCKETS.wizard, user.id)
  if (!rl.ok) return rateLimitResponse(rl)!
  const dailyRl = await checkRateLimit(BUCKETS.wizardDaily, user.id)
  if (!dailyRl.ok) return rateLimitResponse(dailyRl)!

  // 3. Get GitHub token
  const admin = createAdminClient()
  const { data: integration } = await admin
    .from('integrations')
    .select('access_token')
    .eq('owner_id', user.id)
    .eq('provider', 'github')
    .maybeSingle()

  if (!integration) {
    return NextResponse.json({ error: 'github_not_connected' }, { status: 400 })
  }

  const headers = {
    Authorization: `Bearer ${integration.access_token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'folii-ai',
  }

  try {
    // 4. Fetch GitHub profile
    const profileRes = await fetch('https://api.github.com/user', {
      headers,
      signal: AbortSignal.timeout(10_000),
    })
    if (!profileRes.ok) {
      if (profileRes.status === 401) {
        await admin.from('integrations').delete().eq('owner_id', user.id).eq('provider', 'github')
        return NextResponse.json({ error: 'github_token_expired' }, { status: 401 })
      }
      return NextResponse.json({ error: 'github_api_error' }, { status: 502 })
    }
    const profile = await profileRes.json()

    // 5. Fetch repos (up to 300 across 3 pages)
    const allRepos: GhRepo[] = []
    for (let page = 1; page <= 3; page++) {
      const reposRes = await fetch(
        `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&type=owner`,
        { headers, signal: AbortSignal.timeout(10_000) }
      )
      if (!reposRes.ok) break
      const repos = await reposRes.json()
      if (!Array.isArray(repos) || repos.length === 0) break
      allRepos.push(...repos)
      if (repos.length < 100) break
    }

    // 6. Aggregate
    const languages = aggregateSkills(allRepos)
    const topics = aggregateTopics(allRepos)
    const totalStars = allRepos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0)

    // 7. Build compact prompt
    const profileSummary = [
      `Name: ${profile.name ?? profile.login}`,
      `Login: ${profile.login}`,
      profile.bio && `Bio: ${profile.bio}`,
      profile.company && `Company: ${profile.company}`,
      profile.location && `Location: ${profile.location}`,
      profile.blog && `Website: ${profile.blog}`,
      profile.twitter_username && `Twitter: ${profile.twitter_username}`,
      profile.email && `Email: ${profile.email}`,
      `Profile URL: ${profile.html_url}`,
      `Account created: ${profile.created_at}`,
      `Public repos: ${profile.public_repos}`,
      `Total stars across repos: ${totalStars}`,
      `\nLanguages (by repo count):`,
      ...languages.map((l) => `  ${l.language}: ${l.count} repos`),
      topics.length > 0 && `\nTopics across repos: ${topics.join(', ')}`,
    ].filter(Boolean).join('\n')

    // 8. LLM parse
    let raw: string
    try {
      const res = await openai().chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: PROFILE_IMPORT_SYSTEM },
          { role: 'user', content: `Import this GitHub profile into the folii Content JSON shape:\n\n${profileSummary}` },
        ],
        response_format: { type: 'json_object' },
      }, { timeout: 45_000 })
      raw = res.choices[0]?.message?.content ?? ''
    } catch (err) {
      console.error('[github/import-profile] LLM error:', err)
      return NextResponse.json({ error: 'llm_error' }, { status: 502 })
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'invalid_output' }, { status: 502 })
    }

    // Unwrap common patterns
    if (Array.isArray(parsed) && parsed.length > 0) parsed = parsed[0]
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      if (obj.content && typeof obj.content === 'object' && !('name' in obj)) parsed = obj.content
    }

    parsed = coerceContent(parsed)

    // Set avatar from GitHub
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      obj.avatar = profile.avatar_url ?? undefined
    }

    const result = contentSchema.safeParse(parsed)
    if (!result.success) {
      console.error('[github/import-profile] schema mismatch:', result.error.issues)
      return NextResponse.json({ error: 'invalid_output' }, { status: 502 })
    }

    // 9. Save
    const { error: upsertErr } = await admin
      .from('sites')
      .upsert(
        { owner_id: user.id, template: 'swe', content: result.data },
        { onConflict: 'owner_id' }
      )
    if (upsertErr) {
      return NextResponse.json({ error: 'db_error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, content: result.data })
  } catch (err) {
    console.error('[github/import-profile] error:', err)
    return NextResponse.json({ error: 'import_failed' }, { status: 502 })
  }
}
