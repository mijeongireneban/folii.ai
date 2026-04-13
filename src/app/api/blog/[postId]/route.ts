import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

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

  let body: { status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  if (body.status !== 'draft' && body.status !== 'published') {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: site } = await admin
    .from('sites')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!site) {
    return NextResponse.json({ error: 'no_site' }, { status: 404 })
  }

  const updates: Record<string, unknown> = { status: body.status }
  if (body.status === 'published') {
    updates.published_at = new Date().toISOString()
  } else {
    updates.published_at = null
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
