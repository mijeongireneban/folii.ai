import { z } from 'zod'
import type { Content } from '@/types/content'
import { applyPatchValidated } from '@/lib/content/patch'
import { CHAT_SYSTEM_PROMPT } from './prompts'
import type { Operation } from 'fast-json-patch'

const LLMResponseSchema = z.object({
  patch: z.array(z.any()),
  summary: z.string(),
})

interface RunArgs {
  llm: { chat: { completions: { create: (args: any) => Promise<any> } } }
  content: Content
  userMessage: string
}

export type ChatResult =
  | { ok: true; content: Content; summary: string }
  | { ok: false; error: string }

async function callLLM(llm: RunArgs['llm'], messages: any[]) {
  const res = await llm.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages,
  })
  const raw = res.choices[0].message.content
  const json = JSON.parse(raw)
  return LLMResponseSchema.parse(json)
}

export async function runChatTurn({ llm, content, userMessage }: RunArgs): Promise<ChatResult> {
  const baseMessages = [
    { role: 'system', content: CHAT_SYSTEM_PROMPT },
    { role: 'user', content: `Current portfolio JSON:\n${JSON.stringify(content)}\n\nUser request: ${userMessage}` },
  ]

  let parsed
  try { parsed = await callLLM(llm, baseMessages) }
  catch (e) { return { ok: false, error: `LLM call failed: ${(e as Error).message}` } }

  let result = applyPatchValidated(content, parsed.patch as Operation[])
  if (!result.ok) {
    const retryMessages = [
      ...baseMessages,
      { role: 'assistant', content: JSON.stringify(parsed) },
      { role: 'user', content: `That patch failed validation: ${result.error}. Try again.` },
    ]
    try { parsed = await callLLM(llm, retryMessages) }
    catch (e) { return { ok: false, error: `LLM retry failed: ${(e as Error).message}` } }
    result = applyPatchValidated(content, parsed.patch as Operation[])
    if (!result.ok) return { ok: false, error: result.error }
  }

  return { ok: true, content: result.content, summary: parsed.summary }
}
