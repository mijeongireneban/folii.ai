import { MODEL, openai } from './client'
import { CHAT_EDIT_SYSTEM, renderChatEditUserMessage } from './prompts'
import { contentSchema, type Content } from '@/lib/content/schema'
import { coerceContent } from './coerce'

export type ChatEditResult =
  | { ok: true; content: Content; needsInfo?: string; reply?: string }
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
    }, {
      timeout: 45_000, // 45s to leave buffer within 60s function limit
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

  // Pull out _needs_info and _reply before validating — they're not part of
  // the schema. _reply is set when the user asked a meta question instead of
  // requesting an edit; the model should return content unchanged in that case.
  let needsInfo: string | undefined
  if (parsed && typeof parsed === 'object' && '_needs_info' in parsed) {
    const maybe = (parsed as { _needs_info?: unknown })._needs_info
    if (typeof maybe === 'string') needsInfo = maybe
    delete (parsed as { _needs_info?: unknown })._needs_info
  }
  let reply: string | undefined
  if (parsed && typeof parsed === 'object' && '_reply' in parsed) {
    const maybe = (parsed as { _reply?: unknown })._reply
    if (typeof maybe === 'string') reply = maybe
    delete (parsed as { _reply?: unknown })._reply
  }

  parsed = coerceContent(parsed)

  const result = contentSchema.safeParse(parsed)
  if (!result.success) {
    return {
      ok: false,
      reason: 'invalid_output',
      detail: result.error.issues.map((i) => i.message).join('; '),
    }
  }
  return { ok: true, content: result.data, needsInfo, reply }
}
