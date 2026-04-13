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
