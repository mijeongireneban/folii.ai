import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { loadPublishedSite } from './_lib'
import { BottomMenu } from '@/components/template/v2/BottomMenu'

// Public portfolio layout. Verifies the site exists + is published once per
// request, 404s otherwise, then mounts dark surface + fixed bottom nav.
// Child pages reload the site themselves (cheap — same query, cached).

export default async function UsernameLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const data = await loadPublishedSite(username)
  if (!data) notFound()

  return (
    <div className="dark bg-background text-foreground flex min-h-screen flex-col">
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
      <BottomMenu basePath={`/${username}`} />
    </div>
  )
}
