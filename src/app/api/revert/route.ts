import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { contentSchema } from '@/lib/content/schema'
import { PLACEHOLDER_CONTENT } from '@/lib/content/placeholder'
import { BUCKETS, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const bodySchema = z.object({ messageId: z.string().uuid() })

// Revert the user's site content to the snapshot stored on a specific
// assistant chat message (chat_messages.content_after). Inserts a new
// assistant message recording the revert, so history stays linear.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const rl = await checkRateLimit(BUCKETS.chat, user.id)
  if (!rl.ok) return rateLimitResponse(rl)!

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_body', detail: err instanceof Error ? err.message : undefined },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // Load the user's site
  const { data: site, error: siteErr } = await admin
    .from('sites')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (siteErr || !site) {
    return NextResponse.json({ error: 'no_site' }, { status: 404 })
  }

  // Load the target message and verify it belongs to this site
  const { data: msg, error: msgErr } = await admin
    .from('chat_messages')
    .select('id, site_id, created_at')
    .eq('id', body.messageId)
    .maybeSingle()
  if (msgErr || !msg) {
    return NextResponse.json({ error: 'message_not_found' }, { status: 404 })
  }
  if (msg.site_id !== site.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // "Revert to here" = undo this edit. Find the most recent assistant
  // snapshot BEFORE this message. If none exists (i.e. this was the first
  // edit), fall back to PLACEHOLDER_CONTENT, which is the implicit pre-edit
  // state for sites auto-created by /api/chat.
  const { data: prior } = await admin
    .from('chat_messages')
    .select('content_after')
    .eq('site_id', site.id)
    .eq('role', 'assistant')
    .lt('created_at', msg.created_at)
    .not('content_after', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const snapshot = prior?.content_after ?? PLACEHOLDER_CONTENT
  const parsed = contentSchema.safeParse(snapshot)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'corrupt_snapshot', detail: parsed.error.message },
      { status: 500 }
    )
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
      content: 'Undid that edit.',
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
      content: 'Undid that edit.',
      created_at: assistantMsg?.created_at,
    },
  })
}
