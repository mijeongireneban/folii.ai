import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ContentSchema } from '@/lib/schemas/content'
import {
  ProfileHeader, ExperienceList, ProjectsGrid, SkillsSection, ContactSection,
} from '@/components/template'
import type { Metadata } from 'next'

export const revalidate = 3600 // ISR fallback; we revalidate on demand on save

async function loadPortfolio(username: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('portfolios')
    .select('username, content, published')
    .eq('username', username)
    .eq('published', true)
    .maybeSingle()
  if (error || !data) return null
  const parsed = ContentSchema.safeParse(data.content)
  if (!parsed.success) return null
  return { username: data.username as string, content: parsed.data }
}

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> },
): Promise<Metadata> {
  const { username } = await params
  const p = await loadPortfolio(username)
  if (!p) return { title: 'Not found' }
  return {
    title: `${p.content.profile.name} — ${p.content.profile.title}`,
    description: p.content.profile.bio,
    openGraph: {
      title: p.content.profile.name,
      description: p.content.profile.bio,
      images: p.content.profile.avatar ? [p.content.profile.avatar] : [],
    },
  }
}

export default async function UsernamePage(
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  const p = await loadPortfolio(username)
  if (!p) notFound()
  const c = p.content
  return (
    <main className="min-h-screen">
      <ProfileHeader profile={c.profile} />
      <ExperienceList experience={c.experience} username={p.username} />
      <ProjectsGrid projects={c.projects} username={p.username} />
      <SkillsSection skills={c.skills} />
      <ContactSection contact={c.contact} />
    </main>
  )
}
