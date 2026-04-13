import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { contentSchema, type Content } from '@/lib/content/schema'
import { chatEdit } from '@/lib/llm/chatEdit'
import { PLACEHOLDER_CONTENT } from '@/lib/content/placeholder'
import { BUCKETS, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

const bodySchema = z.object({
  repos: z.array(z.object({
    fullName: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    language: z.string().nullable(),
    stars: z.number(),
    htmlUrl: z.string(),
    homepage: z.string().nullable(),
    topics: z.array(z.string()),
  })).min(1).max(5),
})

async function fetchReadme(
  fullName: string,
  token: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${fullName}/readme`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3.raw',
          'User-Agent': 'folii-ai',
        },
        signal: AbortSignal.timeout(5_000),
      }
    )
    if (!res.ok) return null
    const text = await res.text()
    // Keep only first 1000 chars — enough for context without overloading the LLM
    return text.slice(0, 1000)
  } catch {
    return null
  }
}

function buildImportMessage(
  repos: z.infer<typeof bodySchema>['repos'],
  readmes: (string | null)[]
): string {
  const blocks = repos.map((r, i) => {
    const lines = [
      `Repository: ${r.fullName}`,
      `URL: ${r.htmlUrl}`,
      r.description && `Description: ${r.description}`,
      r.language && `Primary language: ${r.language}`,
      r.topics.length > 0 && `Topics: ${r.topics.join(', ')}`,
      `Stars: ${r.stars.toLocaleString()}`,
      r.homepage && `Homepage: ${r.homepage}`,
      readmes[i] && `README excerpt:\n${readmes[i]}`,
    ]
    return lines.filter(Boolean).join('\n')
  })

  const repoData = blocks.join('\n---\n')
  return `Add these GitHub projects to my portfolio. For each one, create a rich project entry with a polished description, tech tags from the language/topics/README, and an appropriate category. Do not remove any existing projects.\n\n[GITHUB_REPO_DATA]\n${repoData}`
}

export async function POST(request: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  // 2. Rate limit
  const rl = await checkRateLimit(BUCKETS.chat, user.id)
  if (!rl.ok) return rateLimitResponse(rl)!

  // 3. Validate body
  let body: z.infer<typeof bodySchema>
  try {
    const json = await request.json()
    body = bodySchema.parse(json)
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  // 4. Get GitHub token
  const admin = createAdminClient()
  const { data: integration } = await admin
    .from('integrations')
    .select('access_token')
    .eq('owner_id', user.id)
    .eq('provider', 'github')
    .maybeSingle()

  if (!integration) {
    return NextResponse.json({ error: 'github_not_connected' }, { status: 400 })
  }

  // 5. Load current content
  let { data: site } = await admin
    .from('sites')
    .select('id, content')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!site) {
    const { data: created, error: createErr } = await admin
      .from('sites')
      .insert({ owner_id: user.id, template: 'swe', content: PLACEHOLDER_CONTENT })
      .select('id, content')
      .single()
    if (createErr || !created) {
      return NextResponse.json({ error: 'db_error' }, { status: 500 })
    }
    site = created
  }

  const currentParse = contentSchema.safeParse(site.content)
  if (!currentParse.success) {
    return NextResponse.json({ error: 'corrupt_content' }, { status: 500 })
  }
  const current: Content = currentParse.data

  // 6. Fetch READMEs for each repo
  const readmes = await Promise.all(
    body.repos.map((r) => fetchReadme(r.fullName, integration.access_token))
  )

  // 7. Build message and run through chatEdit
  const message = buildImportMessage(body.repos, readmes)
  const result = await chatEdit(current, message)

  if (!result.ok) {
    console.error('[github/import] chatEdit failed:', result.reason, result.detail)
    return NextResponse.json(
      { error: 'import_failed', reason: result.reason, detail: result.detail },
      { status: 502 }
    )
  }

  // 8. Save updated content
  const { error: updateErr } = await admin
    .from('sites')
    .update({ content: result.content })
    .eq('id', site.id)

  if (updateErr) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // 9. Save assistant message to chat history
  await admin.from('chat_messages').insert({
    site_id: site.id,
    role: 'assistant',
    content: `Imported ${body.repos.length} project${body.repos.length > 1 ? 's' : ''} from GitHub: ${body.repos.map((r) => r.name).join(', ')}`,
    content_after: result.content,
  })

  return NextResponse.json({ ok: true, content: result.content })
}
