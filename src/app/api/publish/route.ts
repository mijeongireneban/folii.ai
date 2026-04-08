import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BUCKETS, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const bodySchema = z.object({ published: z.boolean() })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const rl = await checkRateLimit(BUCKETS.publish, user.id)
  if (!rl.ok) return rateLimitResponse(rl)!

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: site, error } = await admin
    .from('sites')
    .update({
      published: body.published,
      published_at: body.published ? new Date().toISOString() : null,
    })
    .eq('owner_id', user.id)
    .select('id, published, published_at')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 })
  }
  if (!site) {
    return NextResponse.json({ error: 'no_site' }, { status: 400 })
  }

  // Get the username for the public URL.
  const { data: profile } = await admin
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ ok: true, site, username: profile?.username })
}
