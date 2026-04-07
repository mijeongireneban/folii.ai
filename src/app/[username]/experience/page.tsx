import { notFound } from 'next/navigation'
import { loadPublishedSite } from '../_lib'
import { ExperiencePage } from '@/components/template/v2/ExperiencePage'
import { TemplateLayout } from '@/components/template/v2/TemplateLayout'

export const dynamic = 'force-dynamic'

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const data = await loadPublishedSite(username)
  if (!data) notFound()
  return (
    <TemplateLayout keyName="experience">
      <ExperiencePage content={data.content} />
    </TemplateLayout>
  )
}
