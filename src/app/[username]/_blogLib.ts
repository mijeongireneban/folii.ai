import { createAdminClient } from '@/lib/supabase/admin'
import { contentSchema } from '@/lib/content/schema'
import type { LoadedSite } from './_lib'

// Fallback loader for the layout: returns site data even when the portfolio
// isn't published, as long as the user has at least one published blog post.
// This enables independent blog publishing.

export async function loadSiteForBlog(
  username: string
): Promise<LoadedSite | null> {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .maybeSingle()
  if (!profile) return null

  const { data: siteRow } = await admin
    .from('sites')
    .select('id, content, template')
    .eq('owner_id', profile.id)
    .maybeSingle()
  if (!siteRow) return null

  // Check if user has any published blog posts.
  const { count } = await admin
    .from('blog_posts')
    .select('id', { count: 'exact', head: true })
    .eq('site_id', siteRow.id)
    .eq('status', 'published')
  if (!count || count === 0) return null

  const parsed = contentSchema.safeParse(siteRow.content)
  if (!parsed.success) return null
  return { content: parsed.data, template: siteRow.template, profile }
}
