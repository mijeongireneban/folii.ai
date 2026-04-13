import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { extractResumeText } from '@/lib/resume/extract'
import { parseLinkedIn } from '@/lib/llm/parseLinkedIn'
import { BUCKETS, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(request: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  // 2. Rate limit (reuse wizard buckets)
  const rl = await checkRateLimit(BUCKETS.wizard, user.id)
  if (!rl.ok) return rateLimitResponse(rl)!
  const dailyRl = await checkRateLimit(BUCKETS.wizardDaily, user.id)
  if (!dailyRl.ok) return rateLimitResponse(dailyRl)!

  // 3. Multipart body
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'invalid_form' }, { status: 400 })
  }
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file_missing' }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'file_empty' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 413 })
  }

  // 4. Extract text from PDF
  const extracted = await extractResumeText(file)
  if (!extracted.ok) {
    return NextResponse.json(
      { error: 'extract_failed', reason: extracted.reason, detail: extracted.detail },
      { status: 400 }
    )
  }

  // 5. LLM parse with LinkedIn-specific prompt
  const parsed = await parseLinkedIn(extracted.text)
  if (!parsed.ok) {
    return NextResponse.json(
      { error: 'parse_failed', reason: parsed.reason, detail: parsed.detail },
      { status: parsed.reason === 'not_a_linkedin_profile' ? 400 : 502 }
    )
  }

  // 6. Upsert the user's site row with the parsed content.
  const admin = createAdminClient()
  const { error: upsertErr } = await admin
    .from('sites')
    .upsert(
      {
        owner_id: user.id,
        template: 'swe',
        content: parsed.content,
      },
      { onConflict: 'owner_id' }
    )
  if (upsertErr) {
    return NextResponse.json(
      { error: 'db_error', detail: upsertErr.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, content: parsed.content })
}
