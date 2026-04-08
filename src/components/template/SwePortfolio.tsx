'use client'

import type { Content } from '@/lib/content/schema'
import { Profile } from './v2/Profile'
import { ExperiencePage } from './v2/ExperiencePage'
import { SkillsPage } from './v2/SkillsPage'
import { ProjectsPage } from './v2/ProjectsPage'
import { ContactPage } from './v2/ContactPage'

// v2 switcher. The editor preview and the public pages all go through this —
// keeps section selection logic in one place. v1 monolithic hero-grid layout
// has been retired in favor of the 5-section abt-mj layout.

export type PortfolioSection =
  | 'profile'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'contact'

export function SwePortfolio({
  content,
  section = 'profile',
  editable = false,
  onUploadImage,
  uploadingIndex = null,
}: {
  content: Content
  section?: PortfolioSection
  editable?: boolean
  onUploadImage?: (index: number, file: File) => void
  uploadingIndex?: number | null
}) {
  return (
    <div className="flex min-h-full w-full flex-1 items-center justify-center p-6 md:p-10">
      {section === 'profile' && <Profile content={content} />}
      {section === 'experience' && <ExperiencePage content={content} />}
      {section === 'skills' && <SkillsPage content={content} />}
      {section === 'projects' && (
        <ProjectsPage
          content={content}
          editable={editable}
          onUploadImage={onUploadImage}
          uploadingIndex={uploadingIndex}
        />
      )}
      {section === 'contact' && <ContactPage content={content} />}
    </div>
  )
}
