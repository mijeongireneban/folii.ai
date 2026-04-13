import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// GET /api/github/repos — list user's GitHub repos
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  // Get stored GitHub token
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

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') ?? '1', 10)
  const perPage = 30
  const sort = url.searchParams.get('sort') ?? 'updated'

  try {
    const ghRes = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=${sort}&direction=desc&type=owner`,
      {
        headers: {
          Authorization: `Bearer ${integration.access_token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'folii-ai',
        },
        signal: AbortSignal.timeout(10_000),
      }
    )

    if (ghRes.status === 401) {
      // Token revoked or expired — clean up
      await admin
        .from('integrations')
        .delete()
        .eq('owner_id', user.id)
        .eq('provider', 'github')
      return NextResponse.json({ error: 'github_token_expired' }, { status: 401 })
    }

    if (!ghRes.ok) {
      console.error('[github/repos] API error:', ghRes.status)
      return NextResponse.json({ error: 'github_api_error' }, { status: 502 })
    }

    const repos = await ghRes.json()

    // Extract link header for pagination
    const linkHeader = ghRes.headers.get('link')
    const hasNext = linkHeader?.includes('rel="next"') ?? false

    const mapped = repos.map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description ?? null,
      language: r.language ?? null,
      stars: r.stargazers_count ?? 0,
      forks: r.forks_count ?? 0,
      isPrivate: r.private ?? false,
      htmlUrl: r.html_url,
      homepage: r.homepage || null,
      topics: r.topics ?? [],
      updatedAt: r.updated_at,
    }))

    return NextResponse.json({ repos: mapped, hasNext, page })
  } catch (err) {
    console.error('[github/repos] fetch error:', err)
    return NextResponse.json({ error: 'github_fetch_failed' }, { status: 502 })
  }
}
