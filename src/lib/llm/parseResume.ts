import { MODEL, openai } from './client'
import { PARSE_RESUME_SYSTEM, renderParseResumeUserMessage } from './prompts'
import { contentSchema, type Content } from '@/lib/content/schema'
import { coerceContent } from './coerce'

export type ParseResumeResult =
  | { ok: true; content: Content }
  | { ok: false; reason: 'not_a_resume' | 'invalid_output' | 'llm_error'; detail?: string }

// Parse a resume text blob into a validated Content object.
// Always returns a tagged result — never throws on normal failure modes.
export async function parseResume(
  resumeText: string
): Promise<ParseResumeResult> {
  if (!resumeText.trim()) {
    return { ok: false, reason: 'not_a_resume' }
  }

  let raw: string
  try {
    const res = await openai().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: PARSE_RESUME_SYSTEM },
        { role: 'user', content: renderParseResumeUserMessage(resumeText) },
      ],
      response_format: { type: 'json_object' },
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
    console.error('[parseResume] non-JSON output:', raw.slice(0, 500))
    return { ok: false, reason: 'invalid_output', detail: 'not json' }
  }

  // Defensive: some models occasionally wrap or split the object.
  // 1. If top-level is an array, try the first element.
  // 2. If top-level is { content: {...} } or { data: {...} }, unwrap.
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
    (parsed as { error: string }).error === 'not_a_resume'
  ) {
    return { ok: false, reason: 'not_a_resume' }
  }

  // Coerce common LLM mis-shapings before schema validation.
  parsed = coerceContent(parsed)

  const result = contentSchema.safeParse(parsed)
  if (!result.success) {
    console.error(
      '[parseResume] schema mismatch. raw output:',
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
