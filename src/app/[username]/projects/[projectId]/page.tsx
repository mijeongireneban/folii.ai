import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ContentSchema } from '@/lib/schemas/content'
import { CaseStudy } from '@/components/template'

export const revalidate = 3600

export default async function CaseStudyPage(
  { params }: { params: Promise<{ username: string; projectId: string }> },
) {
  const { username, projectId } = await params
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('portfolios')
    .select('content, published')
    .eq('username', username)
    .eq('published', true)
    .maybeSingle()
  if (!data) notFound()
  const parsed = ContentSchema.safeParse(data.content)
  if (!parsed.success) notFound()

  const project =
    parsed.data.projects.find((p) => p.id === projectId) ??
    parsed.data.experience.flatMap((e) => e.projects).find((p) => p.id === projectId)
  if (!project || !project.caseStudy) notFound()

  return <CaseStudy project={project} caseStudy={project.caseStudy} />
}
