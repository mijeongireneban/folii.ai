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

// v1 model choice. gpt-4o-mini is cheap, fast, and has rock-solid
// json_object mode support. Bump to gpt-4o or gpt-4.1 for production.
export const MODEL = 'gpt-4o-mini'
