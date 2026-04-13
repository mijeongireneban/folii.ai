import { createAdminClient } from '@/lib/supabase/admin'
import { contentSchema, type Content } from '@/lib/content/schema'

// Shared site loader for /[username]/* routes. Only returns published sites;
// unpublished → null → notFound() at the page level.

export type LoadedSite = {
  content: Content
  template: string
  profile: { id: string; username: string }
}

export async function loadPublishedSite(
  username: string
): Promise<LoadedSite | null> {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .maybeSingle()
  if (!profile) return null

  const { data: site } = await admin
    .from('sites')
    .select('content, template, published')
    .eq('owner_id', profile.id)
    .eq('published', true)
    .maybeSingle()
  if (!site) return null

  const parsed = contentSchema.safeParse(site.content)
  if (!parsed.success) return null
  return { content: parsed.data, template: site.template, profile }
}

// ---------------------------------------------------------------------------
// Blog loaders
// ---------------------------------------------------------------------------

export type BlogPostRow = {
  id: string
  slug: string
  title: string
  body: string
  excerpt: string | null
  tags: string[]
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
}

// Load all published blog posts for a user, newest first.
export async function loadBlogPosts(
  username: string
): Promise<{ posts: BlogPostRow[]; site: LoadedSite | null }> {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .maybeSingle()
  if (!profile) return { posts: [], site: null }

  const { data: siteRow } = await admin
    .from('sites')
    .select('id, content, template, published')
    .eq('owner_id', profile.id)
    .maybeSingle()
  if (!siteRow) return { posts: [], site: null }

  const parsed = contentSchema.safeParse(siteRow.content)
  const site: LoadedSite | null = parsed.success
    ? { content: parsed.data, template: siteRow.template, profile }
    : null

  const { data: posts } = await admin
    .from('blog_posts')
    .select('id, slug, title, body, excerpt, tags, status, published_at, created_at, updated_at')
    .eq('site_id', siteRow.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(100)

  return { posts: (posts as BlogPostRow[]) ?? [], site }
}

// Load a single published blog post by slug.
export async function loadBlogPost(
  username: string,
  slug: string
): Promise<{ post: BlogPostRow | null; site: LoadedSite | null }> {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .maybeSingle()
  if (!profile) return { post: null, site: null }

  const { data: siteRow } = await admin
    .from('sites')
    .select('id, content, template, published')
    .eq('owner_id', profile.id)
    .maybeSingle()
  if (!siteRow) return { post: null, site: null }

  const parsed = contentSchema.safeParse(siteRow.content)
  const site: LoadedSite | null = parsed.success
    ? { content: parsed.data, template: siteRow.template, profile }
    : null

  const { data: post } = await admin
    .from('blog_posts')
    .select('id, slug, title, body, excerpt, tags, status, published_at, created_at, updated_at')
    .eq('site_id', siteRow.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  return { post: post as BlogPostRow | null, site }
}
