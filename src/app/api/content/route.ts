import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { contentSchema } from '@/lib/content/schema'
import { PLACEHOLDER_CONTENT } from '@/lib/content/placeholder'
import { BUCKETS, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'

// Direct JSON edit: replace the user's site content with a validated Content
// object. Escape hatch for when chat is the wrong tool. Also records the new
// state as an assistant message so the history shows the manual edit point.
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const rl = await checkRateLimit(BUCKETS.chat, user.id)
  if (!rl.ok) return rateLimitResponse(rl)!

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = contentSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'invalid_content',
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // Upsert site row if missing (parallel to /api/chat behavior).
  const { data: site, error: siteErr } = await admin
    .from('sites')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (siteErr) {
    return NextResponse.json({ error: 'db_error', detail: siteErr.message }, { status: 500 })
  }
  if (!site) {
    const { data: created, error: createErr } = await admin
      .from('sites')
      .insert({
        owner_id: user.id,
        template: 'swe',
        content: PLACEHOLDER_CONTENT,
      })
      .select('id')
      .single()
    if (createErr || !created) {
      return NextResponse.json(
        { error: 'db_error', detail: createErr?.message },
        { status: 500 }
      )
    }
    site = created
  }

  const { error: updateErr } = await admin
    .from('sites')
    .update({ content: parsed.data })
    .eq('id', site.id)
  if (updateErr) {
    return NextResponse.json({ error: 'db_error', detail: updateErr.message }, { status: 500 })
  }

  const { data: assistantMsg } = await admin
    .from('chat_messages')
    .insert({
      site_id: site.id,
      role: 'assistant',
      content: 'Applied direct JSON edit.',
      content_after: parsed.data,
    })
    .select('id, created_at')
    .single()

  return NextResponse.json({
    ok: true,
    content: parsed.data,
    message: {
      id: assistantMsg?.id,
      role: 'assistant',
      content: 'Applied direct JSON edit.',
      created_at: assistantMsg?.created_at,
    },
  })
}

// Reset: wipe the user's site back to placeholder content, unpublish, and
// clear chat history. Destructive — client should confirm first.
export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: site, error: siteErr } = await admin
    .from('sites')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (siteErr) {
    return NextResponse.json({ error: 'db_error', detail: siteErr.message }, { status: 500 })
  }

  if (site) {
    await admin.from('chat_messages').delete().eq('site_id', site.id)
    const { error: updateErr } = await admin
      .from('sites')
      .update({ content: PLACEHOLDER_CONTENT, published: false })
      .eq('id', site.id)
    if (updateErr) {
      return NextResponse.json({ error: 'db_error', detail: updateErr.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, content: PLACEHOLDER_CONTENT })
}
