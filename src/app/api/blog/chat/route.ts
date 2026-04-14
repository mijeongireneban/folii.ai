import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { chatBlogEdit } from '@/lib/llm/chatBlogEdit'
import { contentSchema, type Content } from '@/lib/content/schema'
import { blogPostSchema } from '@/lib/content/blogSchema'
import { PLACEHOLDER_CONTENT } from '@/lib/content/placeholder'
import { BUCKETS, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  postId: z.string().uuid().optional(),
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

  // 2. Rate limit (blog-specific buckets)
  const rl = await checkRateLimit(BUCKETS.blogChat, user.id)
  if (!rl.ok) return rateLimitResponse(rl)!
  const dailyRl = await checkRateLimit(BUCKETS.blogChatDaily, user.id)
  if (!dailyRl.ok) return rateLimitResponse(dailyRl)!

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

  // 4. Load the user's site (needed for portfolio context + site_id FK).
  const admin = createAdminClient()
  let { data: site, error: siteErr } = await admin
    .from('sites')
    .select('id, content')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (siteErr) {
    return NextResponse.json({ error: 'db_error', detail: siteErr.message }, { status: 500 })
  }
  if (!site) {
    // Auto-create site so blog-first users don't need to upload a portfolio first.
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
  const portfolioContent: Content = currentParse.data

  // 5. Load existing post if editing
  let existingPost = undefined
  if (body.postId) {
    const { data: post, error: postErr } = await admin
      .from('blog_posts')
      .select('*')
      .eq('id', body.postId)
      .eq('site_id', site.id)
      .single()
    if (postErr || !post) {
      return NextResponse.json({ error: 'post_not_found' }, { status: 404 })
    }
    const parsed = blogPostSchema.safeParse(post)
    if (parsed.success) existingPost = parsed.data
  }

  // 6. Load recent chat history for this post (for context continuity)
  let chatHistory: string | undefined
  if (body.postId) {
    const { data: messages } = await admin
      .from('chat_messages')
      .select('role, content')
      .eq('site_id', site.id)
      .eq('blog_post_id', body.postId)
      .order('created_at', { ascending: false })
      .limit(10)
    if (messages && messages.length > 0) {
      chatHistory = messages
        .reverse()
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n')
    }
  }

  // 7. Save user message
  const { error: userMsgErr } = await admin.from('chat_messages').insert({
    site_id: site.id,
    role: 'user',
    content: body.message,
    blog_post_id: body.postId ?? null,
  })
  if (userMsgErr) {
    console.error('[blog/chat] failed to save user message:', userMsgErr)
    return NextResponse.json(
      { error: 'db_error', detail: `chat_messages insert failed: ${userMsgErr.message}. Has migration 0008_chat_blog_fk.sql been applied?` },
      { status: 500 }
    )
  }

  // 8. Run the blog edit
  const result = await chatBlogEdit(
    JSON.stringify(portfolioContent),
    body.message,
    existingPost,
    chatHistory
  )
  if (!result.ok) {
    console.error('[blog/chat] edit failed:', result.reason, result.detail)
    await admin.from('chat_messages').insert({
      site_id: site.id,
      role: 'assistant',
      content: `Sorry, I couldn't do that (${result.reason}).`,
      blog_post_id: body.postId ?? null,
    })
    return NextResponse.json(
      { error: 'edit_failed', reason: result.reason, detail: result.detail },
      { status: result.reason === 'empty_request' ? 400 : 502 }
    )
  }

  // 9. Upsert the blog post
  const isReplyOnly = !!result.reply
  let postId = body.postId

  if (!isReplyOnly) {
    if (postId) {
      // Update existing post
      const { error: updateErr } = await admin
        .from('blog_posts')
        .update({
          title: result.post.title,
          slug: result.post.slug,
          body: result.post.body,
          excerpt: result.post.excerpt ?? null,
          tags: result.post.tags,
        })
        .eq('id', postId)
        .eq('site_id', site.id)
      if (updateErr) {
        return NextResponse.json(
          { error: 'db_error', detail: updateErr.message },
          { status: 500 }
        )
      }
    } else {
      // Create new draft
      const { data: created, error: createErr } = await admin
        .from('blog_posts')
        .insert({
          site_id: site.id,
          title: result.post.title,
          slug: result.post.slug,
          body: result.post.body,
          excerpt: result.post.excerpt ?? null,
          tags: result.post.tags,
          source: 'chat',
          status: 'draft',
        })
        .select('id')
        .single()
      if (createErr || !created) {
        return NextResponse.json(
          { error: 'db_error', detail: createErr?.message },
          { status: 500 }
        )
      }
      postId = created.id
    }
  }

  // 10. Save assistant message
  const assistantText =
    result.reply ?? 'Updated your post. Let me know what to change next.'
  const { data: assistantMsg, error: assistantMsgErr } = await admin
    .from('chat_messages')
    .insert({
      site_id: site.id,
      role: 'assistant',
      content: assistantText,
      blog_post_id: postId ?? null,
    })
    .select('id, created_at')
    .single()
  if (assistantMsgErr || !assistantMsg) {
    console.error('[blog/chat] failed to save assistant message:', assistantMsgErr)
    return NextResponse.json(
      { error: 'db_error', detail: `assistant message insert failed: ${assistantMsgErr?.message ?? 'no row returned'}` },
      { status: 500 }
    )
  }

  // 11. Reload the post to return current state
  let post = null
  if (postId) {
    const { data } = await admin
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single()
    post = data
  }

  return NextResponse.json({
    ok: true,
    post,
    message: {
      id: assistantMsg.id,
      role: 'assistant',
      content: assistantText,
      created_at: assistantMsg.created_at,
    },
    dailyRemaining: dailyRl.remaining,
  })
}
