import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAppOrigin } from '@/lib/app-origin'

// GET /api/auth/github — initiates GitHub OAuth flow
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'github_not_configured' }, { status: 500 })
  }

  const redirectUri = `${getAppOrigin(request)}/api/auth/github/callback`
  const state = user.id // use user ID as state to verify on callback

  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', 'read:user repo')
  url.searchParams.set('state', state)

  return NextResponse.redirect(url.toString())
}
