import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { chatEdit } from '@/lib/llm/chatEdit'
import { contentSchema, type Content } from '@/lib/content/schema'
import { PLACEHOLDER_CONTENT } from '@/lib/content/placeholder'
import { BUCKETS, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
})

export async function POST(request: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  // 2. Rate limit
  const rl = await checkRateLimit(BUCKETS.chat, user.id)
  if (!rl.ok) return rateLimitResponse(rl)!

  // 3. Validate body
  let body: z.infer<typeof bodySchema>
  try {
    const json = await request.json()
    body = bodySchema.parse(json)
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_body', detail: err instanceof Error ? err.message : undefined },
      { status: 400 }
    )
  }

  // 4. Load the user's site + validate current content.
  //    If no site row exists yet, create one seeded with placeholder content
  //    so the user can start chatting without an upload.
  const admin = createAdminClient()
  const { data: site, error: siteErr } = await admin
    .from('sites')
    .select('id, content')
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
      .select('id, content')
      .single()
    if (createErr || !created) {
      return NextResponse.json(
        { error: 'db_error', detail: createErr?.message },
        { status: 500 }
      )
    }
    site = created
  }

  const currentParse = contentSchema.safeParse(site.content)
  if (!currentParse.success) {
    return NextResponse.json(
      { error: 'corrupt_content', detail: currentParse.error.message },
      { status: 500 }
    )
  }
  const current: Content = currentParse.data

  // 5. Persist the user message before calling the LLM (so history is honest
  //    even if the model fails).
  await admin.from('chat_messages').insert({
    site_id: site.id,
    role: 'user',
    content: body.message,
  })

  // 6. Run the edit
  const result = await chatEdit(current, body.message)
  if (!result.ok) {
    // Save an assistant error message so the user sees what happened.
    await admin.from('chat_messages').insert({
      site_id: site.id,
      role: 'assistant',
      content: `Sorry, I couldn't apply that change (${result.reason}).`,
    })
    return NextResponse.json(
      { error: 'edit_failed', reason: result.reason, detail: result.detail },
      { status: result.reason === 'empty_request' ? 400 : 502 }
    )
  }

  // 7. Write back to sites (only when this turn was an actual edit) and save
  //    the assistant message. If the model returned a meta `_reply`, treat the
  //    turn as Q&A: skip the sites update and don't snapshot content_after, so
  //    "Revert last" stays attached to the most recent real edit.
  const isReplyOnly = !!result.reply
  if (!isReplyOnly) {
    const { error: updateErr } = await admin
      .from('sites')
      .update({ content: result.content })
      .eq('id', site.id)
    if (updateErr) {
      return NextResponse.json(
        { error: 'db_error', detail: updateErr.message },
        { status: 500 }
      )
    }
  }

  const assistantText =
    result.reply ??
    result.needsInfo ??
    'Updated. Let me know what to change next.'
  const { data: assistantMsg } = await admin
    .from('chat_messages')
    .insert({
      site_id: site.id,
      role: 'assistant',
      content: assistantText,
      content_after: isReplyOnly ? null : result.content,
    })
    .select('id, created_at')
    .single()

  return NextResponse.json({
    ok: true,
    content: result.content,
    message: {
      id: assistantMsg?.id,
      role: 'assistant',
      content: assistantText,
      created_at: assistantMsg?.created_at,
    },
  })
}

// GET: fetch chat history for the current user's site.
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: site } = await admin
    .from('sites')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!site) return NextResponse.json({ messages: [] })

  const { data: messages, error } = await admin
    .from('chat_messages')
    .select('id, role, content, content_after, created_at')
    .eq('site_id', site.id)
    .order('created_at', { ascending: true })
    .limit(200)
  if (error) {
    return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 })
  }
  return NextResponse.json({ messages: messages ?? [] })
}
