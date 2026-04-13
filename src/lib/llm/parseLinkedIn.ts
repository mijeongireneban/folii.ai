import { MODEL, openai } from './client'
import { PARSE_LINKEDIN_SYSTEM, renderParseLinkedInUserMessage } from './prompts'
import { contentSchema, type Content } from '@/lib/content/schema'
import { coerceContent } from './coerce'

export type ParseLinkedInResult =
  | { ok: true; content: Content }
  | { ok: false; reason: 'not_a_linkedin_profile' | 'invalid_output' | 'llm_error'; detail?: string }

export async function parseLinkedIn(
  profileText: string
): Promise<ParseLinkedInResult> {
  if (!profileText.trim()) {
    return { ok: false, reason: 'not_a_linkedin_profile' }
  }

  let raw: string
  try {
    const res = await openai().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: PARSE_LINKEDIN_SYSTEM },
        { role: 'user', content: renderParseLinkedInUserMessage(profileText) },
      ],
      response_format: { type: 'json_object' },
    }, {
      timeout: 45_000,
    })
    raw = res.choices[0]?.message?.content ?? ''
  } catch (err) {
    return {
      ok: false,
      reason: 'llm_error',
      detail: err instanceof Error ? err.message : String(err),
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    console.error('[parseLinkedIn] non-JSON output:', raw.slice(0, 500))
    return { ok: false, reason: 'invalid_output', detail: 'not json' }
  }

  // Unwrap common LLM wrapping patterns.
  if (Array.isArray(parsed) && parsed.length > 0) {
    parsed = parsed[0]
  }
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    if (obj.content && typeof obj.content === 'object' && !('name' in obj)) {
      parsed = obj.content
    } else if (obj.data && typeof obj.data === 'object' && !('name' in obj)) {
      parsed = obj.data
    }
  }

  if (
    parsed &&
    typeof parsed === 'object' &&
    'error' in parsed &&
    (parsed as { error: string }).error === 'not_a_linkedin_profile'
  ) {
    return { ok: false, reason: 'not_a_linkedin_profile' }
  }

  parsed = coerceContent(parsed)

  const result = contentSchema.safeParse(parsed)
  if (!result.success) {
    console.error(
      '[parseLinkedIn] schema mismatch. raw output:',
      raw.slice(0, 1000),
      '\nissues:',
      result.error.issues
    )
    return {
      ok: false,
      reason: 'invalid_output',
      detail: result.error.issues.map((i) => i.message).join('; '),
    }
  }
  return { ok: true, content: result.data }
}
