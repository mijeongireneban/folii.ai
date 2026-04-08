import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { validateSlug, slugErrorMessage } from '@/lib/username'

export const runtime = 'nodejs'

// GET /api/username/check?slug=foo
// Returns { available: boolean, reason?: string }
// Validates format + reserved words + DB uniqueness.
// A user checking their own current slug is considered "available".
export async function GET(request: NextRequest) {
  const slugRaw = request.nextUrl.searchParams.get('slug') ?? ''
  const slug = slugRaw.trim().toLowerCase()

  const err = validateSlug(slug)
  if (err) {
    return NextResponse.json({ available: false, reason: slugErrorMessage(err) })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data: existing, error: dbErr } = await admin
    .from('profiles')
    .select('id')
    .eq('username', slug)
    .maybeSingle()
  if (dbErr) {
    return NextResponse.json(
      { available: false, reason: 'Database error.' },
      { status: 500 }
    )
  }

  if (existing && (!user || existing.id !== user.id)) {
    return NextResponse.json({
      available: false,
      reason: 'This username is taken.',
    })
  }

  return NextResponse.json({ available: true })
}
