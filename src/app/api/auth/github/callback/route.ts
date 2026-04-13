import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/auth/github/callback — exchanges code for token, stores in DB
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  const editorUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/editor`

  if (error || !code) {
    console.error('[github-callback] OAuth error:', error)
    return NextResponse.redirect(`${editorUrl}?github=error`)
  }

  // Verify the user is authenticated and state matches
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== state) {
    console.error('[github-callback] state mismatch or unauthenticated')
    return NextResponse.redirect(`${editorUrl}?github=error`)
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const tokenData = await tokenRes.json()
  if (tokenData.error || !tokenData.access_token) {
    console.error('[github-callback] token exchange failed:', tokenData.error)
    return NextResponse.redirect(`${editorUrl}?github=error`)
  }

  // Fetch GitHub user info
  const ghUserRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'folii-ai',
    },
  })
  const ghUser = await ghUserRes.json()

  // Store in integrations table (upsert)
  const admin = createAdminClient()
  const { error: upsertErr } = await admin
    .from('integrations')
    .upsert(
      {
        owner_id: user.id,
        provider: 'github',
        access_token: tokenData.access_token,
        provider_user_id: String(ghUser.id ?? ''),
        provider_username: ghUser.login ?? null,
        provider_avatar: ghUser.avatar_url ?? null,
      },
      { onConflict: 'owner_id,provider' }
    )

  if (upsertErr) {
    console.error('[github-callback] upsert failed:', upsertErr.message)
    return NextResponse.redirect(`${editorUrl}?github=error`)
  }

  return NextResponse.redirect(`${editorUrl}?github=connected`)
}
