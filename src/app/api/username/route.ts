import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateSlug, slugErrorMessage } from '@/lib/username'

export const runtime = 'nodejs'

// PATCH /api/username  body: { slug: string }
// Updates the authenticated user's profiles.username.
// Re-validates format, checks reserved words, and relies on the UNIQUE index
// on profiles.username to guard against races (Postgres error code 23505).
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const slug =
    typeof (body as { slug?: unknown })?.slug === 'string'
      ? ((body as { slug: string }).slug).trim().toLowerCase()
      : ''

  const err = validateSlug(slug)
  if (err) {
    return NextResponse.json(
      { error: 'invalid_slug', reason: slugErrorMessage(err) },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // Fetch current username (for 200 no-op case).
  const { data: current } = await admin
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()
  if (current?.username?.toLowerCase() === slug) {
    return NextResponse.json({ ok: true, username: current.username })
  }

  const { data: updated, error: updateErr } = await admin
    .from('profiles')
    .update({ username: slug })
    .eq('id', user.id)
    .select('username')
    .single()

  if (updateErr) {
    // 23505 = unique_violation
    if (updateErr.code === '23505') {
      return NextResponse.json(
        { error: 'taken', reason: 'This username is taken.' },
        { status: 409 }
      )
    }
    // 23514 = check_violation (shape constraint)
    if (updateErr.code === '23514') {
      return NextResponse.json(
        { error: 'invalid_slug', reason: 'Invalid username format.' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'db_error', detail: updateErr.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, username: updated.username })
}
