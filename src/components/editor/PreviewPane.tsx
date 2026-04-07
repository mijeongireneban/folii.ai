'use client'
import type { Content } from '@/types/content'
import {
  ProfileHeader, ExperienceList, ProjectsGrid, SkillsSection, ContactSection,
} from '@/components/template'

export function PreviewPane({
  username, content, previewKey,
}: { username: string | null; content: Content; previewKey: number }) {
  return (
    <div key={previewKey} className="overflow-y-auto border-r">
      <main>
        <ProfileHeader profile={content.profile} />
        <ExperienceList experience={content.experience} username={username ?? 'preview'} />
        <ProjectsGrid projects={content.projects} username={username ?? 'preview'} />
        <SkillsSection skills={content.skills} />
        <ContactSection contact={content.contact} />
      </main>
    </div>
  )
}
