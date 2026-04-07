'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Content } from '@/types/content'

interface Msg { role: 'user' | 'assistant'; text: string }

export function ChatTab({
  // portfolioId and content are typed for interface stability but the route reads
  // the current state from the DB directly, so they are unused here.
  portfolioId: _portfolioId,
  content: _content,
  onContentChange,
}: {
  portfolioId: string; content: Content; onContentChange: (c: Content) => void
}) {
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [busy, setBusy] = useState(false)

  async function onFile(file: File) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'upload failed' }))
      setMsgs((m) => [...m, { role: 'assistant', text: `upload error: ${error}` }])
      return
    }
    const { url } = await res.json()
    setInput((prev) => prev + `\nUse this image URL: ${url}`)
  }

  async function send() {
    if (!input.trim() || busy) return
    const userText = input.trim()
    setMsgs((m) => [...m, { role: 'user', text: userText }])
    setInput(''); setBusy(true)
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: userText }),
    })
    setBusy(false)
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'request failed' }))
      setMsgs((m) => [...m, { role: 'assistant', text: `error: ${error}` }])
      return
    }
    const { content: newContent, summary } = await res.json()
    onContentChange(newContent)
    setMsgs((m) => [...m, { role: 'assistant', text: summary }])
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex-1 space-y-2 overflow-y-auto">
        {msgs.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Try: &quot;Add a project called X using Next.js&quot; or &quot;Make my bio more playful&quot;.
          </p>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-sm' : 'text-sm text-muted-foreground'}>
            <strong>{m.role === 'user' ? 'You' : 'folii'}:</strong> {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Textarea
          rows={2} value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Tell folii what to change…"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
        />
        <div className="flex flex-col gap-1">
          <Button onClick={send} disabled={busy}>{busy ? '…' : 'Send'}</Button>
          <label className="text-xs text-muted-foreground cursor-pointer text-center">
            Image
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
