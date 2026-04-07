import { MODEL, openai } from './client'
import { CHAT_EDIT_SYSTEM, renderChatEditUserMessage } from './prompts'
import { contentSchema, type Content } from '@/lib/content/schema'

export type ChatEditResult =
  | { ok: true; content: Content; needsInfo?: string }
  | {
      ok: false
      reason: 'invalid_output' | 'llm_error' | 'empty_request'
      detail?: string
    }

export async function chatEdit(
  current: Content,
  userRequest: string
): Promise<ChatEditResult> {
  if (!userRequest.trim()) {
    return { ok: false, reason: 'empty_request' }
  }

  let raw: string
  try {
    const res = await openai().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: CHAT_EDIT_SYSTEM },
        {
          role: 'user',
          content: renderChatEditUserMessage(
            JSON.stringify(current),
            userRequest
          ),
        },
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

  // Pull out _needs_info before validating — it's not part of the schema.
  let needsInfo: string | undefined
  if (parsed && typeof parsed === 'object' && '_needs_info' in parsed) {
    const maybe = (parsed as { _needs_info?: unknown })._needs_info
    if (typeof maybe === 'string') needsInfo = maybe
    delete (parsed as { _needs_info?: unknown })._needs_info
  }

  const result = contentSchema.safeParse(parsed)
  if (!result.success) {
    return {
      ok: false,
      reason: 'invalid_output',
      detail: result.error.issues.map((i) => i.message).join('; '),
    }
  }
  return { ok: true, content: result.data, needsInfo }
}
