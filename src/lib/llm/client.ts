import OpenAI from 'openai'

// Single shared OpenAI client. Server-only.
let _client: OpenAI | null = null

export function openai(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

// v1 model choice. Cheap enough for iterative edits, strong enough for
// JSON-mode structured output. Bump to gpt-5 for production later.
export const MODEL = 'gpt-5-mini'
