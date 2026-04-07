import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { contentSchema } from '@/lib/content/schema'
import { SwePortfolio } from '@/components/template/SwePortfolio'

export const dynamic = 'force-dynamic'

async function loadSite(username: string) {
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const data = await loadSite(username)
  if (!data) return { title: 'Not found' }
  return {
    title: `${data.content.name} — folii.ai`,
    description: data.content.tagline,
  }
}

export default async function UsernamePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const data = await loadSite(username)
  if (!data) notFound()
  return <SwePortfolio content={data.content} />
}
