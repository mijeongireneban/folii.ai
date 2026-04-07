import { notFound } from 'next/navigation'
import { loadPublishedSite } from '../_lib'
import { SkillsPage } from '@/components/template/v2/SkillsPage'
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
    <TemplateLayout keyName="skills">
      <SkillsPage content={data.content} />
    </TemplateLayout>
  )
}
