import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Partial update schema. Drafts may have empty title/body while the user types,
// so we relax the min(1) constraints from blogPostSchema. Publish enforcement
// happens below when transitioning to 'published'.
const patchSchema = z
  .object({
    title: z.string().max(200),
    body: z.string().max(50000),
    excerpt: z.string().trim().max(300).nullable(),
    tags: z.array(z.string().trim().max(40)).max(10),
    status: z.enum(['draft', 'published']),
  })
  .partial()

// DELETE /api/blog/[postId] — delete a blog post (owner only via RLS).
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params
  if (!postId) {
    return NextResponse.json({ error: 'missing_post_id' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Verify the post belongs to the user's site.
  const { data: site } = await admin
    .from('sites')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!site) {
    return NextResponse.json({ error: 'no_site' }, { status: 404 })
  }

  const { error } = await admin
    .from('blog_posts')
    .delete()
    .eq('id', postId)
    .eq('site_id', site.id)
  if (error) {
    return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// PATCH /api/blog/[postId] — toggle publish/unpublish.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params
  if (!postId) {
    return NextResponse.json({ error: 'missing_post_id' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', detail: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const body = parsed.data

  const admin = createAdminClient()

  const { data: site } = await admin
    .from('sites')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!site) {
    return NextResponse.json({ error: 'no_site' }, { status: 404 })
  }

  const updates: Record<string, unknown> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.body !== undefined) updates.body = body.body
  if (body.excerpt !== undefined) updates.excerpt = body.excerpt
  if (body.tags !== undefined) updates.tags = body.tags

  if (body.status !== undefined) {
    // Publishing requires non-empty title + body.
    if (body.status === 'published') {
      const nextTitle = (body.title ?? '').trim()
      const nextBody = (body.body ?? '').trim()
      if (!nextTitle || !nextBody) {
        // Need to check the existing row if title/body weren't sent.
        const { data: existing } = await admin
          .from('blog_posts')
          .select('title, body')
          .eq('id', postId)
          .eq('site_id', site.id)
          .maybeSingle()
        const finalTitle = (body.title ?? existing?.title ?? '').trim()
        const finalBody = (body.body ?? existing?.body ?? '').trim()
        if (!finalTitle || !finalBody) {
          return NextResponse.json(
            { error: 'cannot_publish_empty' },
            { status: 400 }
          )
        }
      }
      updates.status = 'published'
      updates.published_at = new Date().toISOString()
    } else {
      updates.status = 'draft'
      updates.published_at = null
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'no_updates' }, { status: 400 })
  }

  const { data: post, error } = await admin
    .from('blog_posts')
    .update(updates)
    .eq('id', postId)
    .eq('site_id', site.id)
    .select('*')
    .single()
  if (error) {
    return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, post })
}
