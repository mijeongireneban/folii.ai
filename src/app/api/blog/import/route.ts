import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'
import TurndownService from 'turndown'
import { BUCKETS, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { PLACEHOLDER_CONTENT } from '@/lib/content/placeholder'
import { safeFetchText } from '@/lib/safe-fetch'

export const runtime = 'nodejs'
export const maxDuration = 30

const bodySchema = z.object({
  url: z.string().url().max(2000),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200)
}

// Medium actively blocks scraping (returns 403 for most UAs), but the per-user
// RSS feed at /feed/@{user} serves full <content:encoded> HTML. We parse the feed,
// find the item with the matching article ID (the trailing 12-char hex in every
// Medium URL), and convert that to markdown.
async function tryMediumRss(
  url: string,
  turndown: TurndownService
): Promise<{ title: string; body: string; tags: string[] } | null> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.toLowerCase()
  const isMediumDomain = host === 'medium.com' || host.endsWith('.medium.com')
  if (!isMediumDomain) return null

  // Every Medium article URL ends with a 12-char hex ID (e.g. …-836869f88375).
  const idMatch = parsed.pathname.match(/([a-f0-9]{12})\/?$/)
  if (!idMatch) return null
  const articleId = idMatch[1]

  // Figure out which feed to hit:
  //   medium.com/@user/…          → /feed/@user
  //   user.medium.com/…           → /feed/@user
  //   medium.com/publication/…    → /feed/publication
  let feedPath: string | null = null
  if (host === 'medium.com') {
    if (parsed.pathname.startsWith('/@')) {
      const user = parsed.pathname.split('/')[1] // '@user'
      feedPath = `/feed/${user}`
    } else {
      const pub = parsed.pathname.split('/')[1]
      if (pub) feedPath = `/feed/${pub}`
    }
  } else {
    // {user}.medium.com
    const user = host.split('.')[0]
    feedPath = `/feed/@${user}`
  }
  if (!feedPath) return null

  try {
    const res = await safeFetchText(`https://medium.com${feedPath}`, {
      timeoutMs: 10_000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; folii.ai/1.0; +https://folii.ai)',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    })
    if (!res.ok) return null
    const rss = res.body

    // Find the <item> block containing this article's ID.
    const itemPattern = /<item>([\s\S]*?)<\/item>/g
    let match: RegExpExecArray | null
    while ((match = itemPattern.exec(rss))) {
      const block = match[1]
      if (!block.includes(articleId)) continue

      const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)
      const contentMatch = block.match(
        /<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/
      )
      const categoryMatches = [
        ...block.matchAll(/<category>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/g),
      ]

      const html = contentMatch?.[1]?.trim() ?? ''
      if (!html) return null

      return {
        title: (titleMatch?.[1] ?? '').trim(),
        body: turndown.turndown(html),
        tags: categoryMatches
          .map((m) => m[1].trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 10),
      }
    }
    return null
  } catch {
    return null
  }
}

// Try Dev.to API first (cleaner output, no scraping needed).
async function tryDevToApi(
  url: string
): Promise<{ title: string; body: string; tags: string[] } | null> {
  const match = url.match(/dev\.to\/[^/]+\/([a-z0-9-]+)/i)
  if (!match) return null

  try {
    const slug = match[1]
    // Dev.to API: {username}/{slug}, stripped of query/hash to avoid mis-parsing.
    const parsed = new URL(url)
    const [username] = parsed.pathname.split('/').filter(Boolean)
    if (!username) return null
    const res = await safeFetchText(
      `https://dev.to/api/articles/${username}/${slug}`,
      { timeoutMs: 10_000 }
    )
    if (!res.ok) return null
    const data = JSON.parse(res.body)
    return {
      title: data.title ?? '',
      body: data.body_markdown ?? '',
      tags: (data.tags ?? data.tag_list ?? []) as string[],
    }
  } catch {
    return null
  }
}

// Generic extraction: fetch HTML → Readability → Turndown.
async function extractFromUrl(
  url: string,
  turndown: TurndownService
): Promise<{ title: string; body: string; tags: string[] }> {
  const res = await safeFetchText(url, {
    timeoutMs: 15_000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; folii.ai/1.0; +https://folii.ai)',
      Accept: 'text/html,application/xhtml+xml',
    },
  })
  if (!res.ok) {
    if (res.status === 403 || res.status === 401) {
      throw new Error(
        `This site (${new URL(url).hostname}) blocks direct fetching. Try pasting the markdown into chat instead.`
      )
    }
    throw new Error(`Failed to fetch URL (${res.status})`)
  }

  const html = res.body
  const { document } = parseHTML(html)

  const reader = new Readability(document as unknown as Document)
  const article = reader.parse()
  if (!article || !article.content) {
    throw new Error(
      'Could not extract article content. Try pasting the markdown directly into the chat instead.'
    )
  }

  const markdown = turndown.turndown(article.content)

  // Try to extract tags from meta keywords.
  const metaKeywords = document.querySelector('meta[name="keywords"]')
  const tags = metaKeywords
    ? (metaKeywords.getAttribute('content') ?? '')
        .split(',')
        .map((t: string) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10)
    : []

  return {
    title: article.title ?? '',
    body: markdown,
    tags,
  }
}

export async function POST(request: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  // 2. Rate limit (reuse upload bucket — imports are heavy)
  const rl = await checkRateLimit(BUCKETS.upload, user.id)
  if (!rl.ok) return rateLimitResponse(rl)!

  // 3. Validate body
  let body: z.infer<typeof bodySchema>
  try {
    const json = await request.json()
    body = bodySchema.parse(json)
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_body', detail: err instanceof Error ? err.message : undefined },
      { status: 400 }
    )
  }

  // 4. Load or create user's site
  const admin = createAdminClient()
  let { data: site } = await admin
    .from('sites')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!site) {
    const { data: created, error: createErr } = await admin
      .from('sites')
      .insert({
        owner_id: user.id,
        template: 'swe',
        content: PLACEHOLDER_CONTENT,
      })
      .select('id')
      .single()
    if (createErr || !created) {
      return NextResponse.json(
        { error: 'db_error', detail: createErr?.message },
        { status: 500 }
      )
    }
    site = created
  }

  // 5. Extract content from URL
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  })
  let extracted: { title: string; body: string; tags: string[] }
  try {
    // Source-specific paths first (cleaner output, bypass anti-scraping).
    const devTo = await tryDevToApi(body.url)
    if (devTo) {
      extracted = devTo
    } else {
      const medium = await tryMediumRss(body.url, turndown)
      if (medium) {
        extracted = medium
      } else {
        extracted = await extractFromUrl(body.url, turndown)
      }
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Failed to extract content'
    return NextResponse.json({ error: 'import_failed', detail }, { status: 422 })
  }

  if (!extracted.title && !extracted.body) {
    return NextResponse.json(
      { error: 'import_failed', detail: 'Could not extract any content from this URL.' },
      { status: 422 }
    )
  }

  // 6. Create draft blog post
  const slug = slugify(extracted.title || 'imported-post')
  const excerpt = extracted.body.slice(0, 280).replace(/\n/g, ' ').trim()

  const { data: post, error: insertErr } = await admin
    .from('blog_posts')
    .insert({
      site_id: site.id,
      title: extracted.title || 'Imported Post',
      slug,
      body: extracted.body.slice(0, 50000),
      excerpt: excerpt || null,
      tags: extracted.tags.slice(0, 10),
      source: 'import',
      status: 'draft',
    })
    .select('*')
    .single()

  if (insertErr) {
    // Handle duplicate slug
    if (insertErr.code === '23505') {
      const fallbackSlug = `${slug}-${Date.now().toString(36)}`
      const { data: retry, error: retryErr } = await admin
        .from('blog_posts')
        .insert({
          site_id: site.id,
          title: extracted.title || 'Imported Post',
          slug: fallbackSlug,
          body: extracted.body.slice(0, 50000),
          excerpt: excerpt || null,
          tags: extracted.tags.slice(0, 10),
          source: 'import',
          status: 'draft',
        })
        .select('*')
        .single()
      if (retryErr || !retry) {
        return NextResponse.json(
          { error: 'db_error', detail: retryErr?.message },
          { status: 500 }
        )
      }
      return NextResponse.json({ ok: true, post: retry })
    }
    return NextResponse.json(
      { error: 'db_error', detail: insertErr.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, post })
}
