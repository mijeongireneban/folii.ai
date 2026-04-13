import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

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
