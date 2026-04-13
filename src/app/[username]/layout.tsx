import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { loadPublishedSite } from './_lib'
import { loadSiteForBlog } from './_blogLib'
import { BottomMenu } from '@/components/template/v2/BottomMenu'
import { TemplateThemeProvider } from '@/components/template/v2/ThemeToggle'

// Public portfolio layout. Verifies the site exists + is published once per
// request, 404s otherwise, then mounts dark surface + fixed bottom nav.
// Exception: blog pages are accessible even if the portfolio isn't published,
// as long as the user has published blog posts.

export default async function UsernameLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  // Try loading published portfolio first.
  let data = await loadPublishedSite(username)

  // If portfolio isn't published, check if blog posts exist (independent publishing).
  if (!data) {
    const blogSite = await loadSiteForBlog(username)
    if (!blogSite) notFound()
    data = blogSite
  }

  return (
    <TemplateThemeProvider presetId={data.content.theme?.preset}>
      {children}
      <footer className="text-muted-foreground pointer-events-none fixed bottom-4 right-4 z-40 text-xs">
        <span className="pointer-events-auto">
          made by{' '}
          <a
            href="https://folii.ai"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground underline underline-offset-4 transition-colors"
          >
            folii.ai
          </a>{' '}
          with 💙
        </span>
      </footer>
      <BottomMenu basePath={`/${username}`} hiddenSections={data.content.hidden_sections} />
    </TemplateThemeProvider>
  )
}
