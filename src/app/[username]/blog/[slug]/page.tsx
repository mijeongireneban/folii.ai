import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { loadBlogPost } from '../../_lib'
import { BlogPostContent } from './BlogPostContent'
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
    month: 'long',
    day: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>
}): Promise<Metadata> {
  const { username, slug } = await params
  const { post, site } = await loadBlogPost(username, slug)
  if (!post) return { title: 'Not found' }

  const name = site?.content.name ?? username
  const title = `${post.title} — ${name}`
  const description = post.excerpt || post.body.slice(0, 160)
  const ogImage = `/${username}/og`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://folii.ai/${username}/blog/${slug}`,
      siteName: 'folii.ai',
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      type: 'article',
      publishedTime: post.published_at ?? undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>
}) {
  const { username, slug } = await params
  const { post, site } = await loadBlogPost(username, slug)
  if (!post) notFound()

  return (
    <TemplateLayout keyName={`blog-${slug}`}>
      <article className="w-full max-w-2xl">
        <header className="mb-8">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          <div className="text-muted-foreground mt-3 flex items-center gap-3 text-sm">
            {site?.content.name && <span>{site.content.name}</span>}
            {post.published_at && (
              <>
                <span className="text-border">·</span>
                <span>{formatDate(post.published_at)}</span>
              </>
            )}
            <span className="text-border">·</span>
            <span>{readTime(post.body)}</span>
          </div>
          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <BlogPostContent body={post.body} />

        <footer className="border-border/50 mt-12 border-t pt-6">
          <a
            href={`/${username}/blog`}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            ← Back to all posts
          </a>
        </footer>
      </article>
    </TemplateLayout>
  )
}
