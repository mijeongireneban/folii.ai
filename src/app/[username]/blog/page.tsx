import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { loadBlogPosts } from '../_lib'
import { TemplateLayout } from '@/components/template/v2/TemplateLayout'

export const dynamic = 'force-dynamic'

function readTime(body: string): string {
  const words = body.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 250))
  return `${minutes} min read`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const { site } = await loadBlogPosts(username)
  const name = site?.content.name ?? username
  const title = `Blog — ${name}`
  const description = `Posts by ${name}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://folii.ai/${username}/blog`,
      siteName: 'folii.ai',
      type: 'website',
    },
  }
}

export default async function BlogListingPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const { posts, site } = await loadBlogPosts(username)

  // If user doesn't exist or has no site at all, 404.
  // (Empty posts list is fine, we show an empty state.)
  if (!site) notFound()

  return (
    <TemplateLayout keyName="blog">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">
            Blog
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Posts by {site.content.name}
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No posts yet.
          </p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/${username}/blog/${post.slug}`}
                className="group block"
              >
                <article className="border-border/50 hover:border-border hover:bg-muted/30 rounded-xl border p-5 transition-colors">
                  <h2 className="text-foreground group-hover:text-primary text-lg font-medium transition-colors">
                    {post.title}
                  </h2>
                  {(post.excerpt || post.body) && (
                    <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">
                      {post.excerpt || post.body.slice(0, 200)}
                    </p>
                  )}
                  <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
                    {post.published_at && (
                      <span>{formatDate(post.published_at)}</span>
                    )}
                    <span>{readTime(post.body)}</span>
                    {post.tags.length > 0 && (
                      <span className="flex gap-1.5">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-muted rounded-full px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </TemplateLayout>
  )
}
