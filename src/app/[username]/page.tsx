import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { loadPublishedSite } from './_lib'
import { Profile } from '@/components/template/v2/Profile'
import { TemplateLayout } from '@/components/template/v2/TemplateLayout'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const data = await loadPublishedSite(username)
  if (!data) return { title: 'Not found' }
  return {
    title: `${data.content.name} — folii.ai`,
    description: data.content.tagline,
  }
}

export default async function UsernameProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const data = await loadPublishedSite(username)
  if (!data) notFound()
  return (
    <TemplateLayout keyName="profile">
      <Profile content={data.content} />
    </TemplateLayout>
  )
}
