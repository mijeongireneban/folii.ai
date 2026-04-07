'use client'
import type { Content } from '@/types/content'
import {
  ProfileHeader, ExperienceList, ProjectsGrid, SkillsSection, ContactSection,
} from '@/components/template'

export function PreviewPane({
  username, content, previewKey,
}: { username: string | null; content: Content; previewKey: number }) {
  return (
    <div key={previewKey} className="overflow-y-auto border-r bg-background">
      <main className="flex flex-col gap-12 pb-16">
        <ProfileHeader profile={content.profile} />
        <div className="px-6 flex flex-col gap-12 max-w-3xl w-full mx-auto">
          <ExperienceList experience={content.experience} username={username ?? 'preview'} />
          <ProjectsGrid projects={content.projects} username={username ?? 'preview'} />
          <SkillsSection skills={content.skills} />
          <ContactSection contact={content.contact} />
        </div>
      </main>
    </div>
  )
}
