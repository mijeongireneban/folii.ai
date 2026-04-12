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

  const title = `${data.content.name} — folii.ai`
  const description = data.content.tagline
  const ogImage = `/${username}/og`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://folii.ai/${username}`,
      siteName: 'folii.ai',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${data.content.name}'s portfolio` }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
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
