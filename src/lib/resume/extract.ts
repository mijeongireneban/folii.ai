import { extractText, getDocumentProxy } from 'unpdf'

export type ExtractResult =
  | { ok: true; text: string; kind: 'pdf' | 'text' }
  | { ok: false; reason: 'unsupported' | 'empty' | 'extract_failed'; detail?: string }

const MAX_CHARS = 60_000 // generous cap — a 20-page resume is ~30k chars
const MIN_CHARS = 40     // anything shorter is almost certainly junk

function normalize(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

export async function extractResumeText(file: File): Promise<ExtractResult> {
  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()

  // Plain text / markdown
  if (
    type.startsWith('text/') ||
    name.endsWith('.txt') ||
    name.endsWith('.md')
  ) {
    const raw = await file.text()
    const text = normalize(raw).slice(0, MAX_CHARS)
    if (text.length < MIN_CHARS) return { ok: false, reason: 'empty' }
    return { ok: true, text, kind: 'text' }
  }

  // PDF
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    try {
      const buf = new Uint8Array(await file.arrayBuffer())
      const doc = await getDocumentProxy(buf)
      const { text: pages } = await extractText(doc, { mergePages: true })
      const merged: string = Array.isArray(pages) ? pages.join('\n') : pages
      const text = normalize(merged).slice(0, MAX_CHARS)
      if (text.length < MIN_CHARS) return { ok: false, reason: 'empty' }
      return { ok: true, text, kind: 'pdf' }
    } catch (err) {
      return {
        ok: false,
        reason: 'extract_failed',
        detail: err instanceof Error ? err.message : String(err),
      }
    }
  }

  return { ok: false, reason: 'unsupported', detail: type || name }
}

// Exposed for tests.
export const _internal = { normalize, MAX_CHARS, MIN_CHARS }
