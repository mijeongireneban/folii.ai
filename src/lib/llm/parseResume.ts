import { MODEL, openai } from './client'
import { PARSE_RESUME_SYSTEM, renderParseResumeUserMessage } from './prompts'
import { contentSchema, type Content } from '@/lib/content/schema'

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
    return { ok: false, reason: 'invalid_output', detail: 'not json' }
  }

  if (
    parsed &&
    typeof parsed === 'object' &&
    'error' in parsed &&
    (parsed as { error: string }).error === 'not_a_resume'
  ) {
    return { ok: false, reason: 'not_a_resume' }
  }

  const result = contentSchema.safeParse(parsed)
  if (!result.success) {
    return {
      ok: false,
      reason: 'invalid_output',
      detail: result.error.issues.map((i) => i.message).join('; '),
    }
  }
  return { ok: true, content: result.data }
}
