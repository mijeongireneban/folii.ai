import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLACEHOLDER_CONTENT } from '@/lib/content/placeholder'
import { BUCKETS, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'

// Hard cap on posts per site. Well above any realistic portfolio size, but
// low enough to bound DB bloat from a runaway client.
const MAX_POSTS_PER_SITE = 500

// POST: create an empty draft post for manual editing.
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const rl = await checkRateLimit(BUCKETS.blogCreate, user.id)
  if (!rl.ok) return rateLimitResponse(rl)!

  const admin = createAdminClient()

  // Load or create the user's site (mirrors the import route).
  let { data: site } = await admin
    .from('sites')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()
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

  const { count: existingCount } = await admin
    .from('blog_posts')
    .select('id', { count: 'exact', head: true })
    .eq('site_id', site.id)
  if ((existingCount ?? 0) >= MAX_POSTS_PER_SITE) {
    return NextResponse.json(
      {
        error: 'post_cap_reached',
        message: `You've hit the limit of ${MAX_POSTS_PER_SITE} posts. Delete a draft before creating another.`,
      },
      { status: 409 }
    )
  }

  const slug = `untitled-${Date.now().toString(36)}`
  const { data: post, error } = await admin
    .from('blog_posts')
    .insert({
      site_id: site.id,
      title: '',
      slug,
      body: '',
      excerpt: null,
      tags: [],
      source: 'chat',
      status: 'draft',
    })
    .select('*')
    .single()
  if (error) {
    return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, post })
}

// GET: fetch all blog posts for the current user (drafts + published).
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
  if (!site) return NextResponse.json({ posts: [] })

  const { data: posts, error } = await admin
    .from('blog_posts')
    .select('id, slug, title, body, excerpt, tags, source, status, published_at, created_at, updated_at')
    .eq('site_id', site.id)
    .order('updated_at', { ascending: false })
    .limit(100)
  if (error) {
    return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 })
  }
  return NextResponse.json({ posts: posts ?? [], siteId: site.id })
}
