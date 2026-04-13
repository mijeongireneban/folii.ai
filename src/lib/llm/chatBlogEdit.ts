import { MODEL, openai } from './client'
import { CHAT_BLOG_EDIT_SYSTEM, renderChatBlogEditUserMessage } from './prompts'
import { blogPostSchema, type BlogPost } from '@/lib/content/blogSchema'
import { coerceBlogPost } from './coerce'

export type ChatBlogEditResult =
  | { ok: true; post: BlogPost; reply?: string }
  | {
      ok: false
      reason: 'invalid_output' | 'llm_error' | 'empty_request'
      detail?: string
    }

export async function chatBlogEdit(
  portfolioJson: string,
  userRequest: string,
  existingPost?: BlogPost,
  chatHistory?: string
): Promise<ChatBlogEditResult> {
  if (!userRequest.trim()) {
    return { ok: false, reason: 'empty_request' }
  }

  let raw: string
  try {
    const res = await openai().chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: CHAT_BLOG_EDIT_SYSTEM },
        {
          role: 'user',
          content: renderChatBlogEditUserMessage(
            portfolioJson,
            userRequest,
            existingPost ? JSON.stringify(existingPost) : undefined,
            chatHistory
          ),
        },
      ],
      response_format: { type: 'json_object' },
    }, {
      timeout: 45_000,
    })
    raw = res.choices[0]?.message?.content ?? ''
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[chatBlogEdit] LLM call failed:', detail)
    return { ok: false, reason: 'llm_error', detail }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, reason: 'invalid_output', detail: 'not json' }
  }

  // Extract _reply before schema validation.
  let reply: string | undefined
  if (parsed && typeof parsed === 'object' && '_reply' in parsed) {
    const maybe = (parsed as { _reply?: unknown })._reply
    if (typeof maybe === 'string') reply = maybe
    delete (parsed as { _reply?: unknown })._reply
  }

  parsed = coerceBlogPost(parsed)

  const result = blogPostSchema.safeParse(parsed)
  if (!result.success) {
    console.error('[chatBlogEdit] schema issues:', JSON.stringify(result.error.issues, null, 2))
    console.error('[chatBlogEdit] raw LLM output (first 2000 chars):', raw.slice(0, 2000))
    return {
      ok: false,
      reason: 'invalid_output',
      detail: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    }
  }
  return { ok: true, post: result.data, reply }
}
