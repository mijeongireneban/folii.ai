'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function PublishButton({
  published, username, onChange,
}: { published: boolean; username: string | null; onChange: (p: boolean) => void }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function toggle() {
    setBusy(true); setErr(null)
    const res = await fetch('/api/publish', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    })
    setBusy(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setErr(j.missing ? `missing: ${j.missing.join(', ')}` : (j.error ?? 'failed'))
      return
    }
    onChange(!published)
  }

  return (
    <div className="flex items-center gap-2">
      {published && username && (
        <a className="text-xs underline" href={`/${username}`} target="_blank" rel="noreferrer">View live</a>
      )}
      <Button size="sm" onClick={toggle} disabled={busy || !username}>
        {published ? 'Unpublish' : 'Publish'}
      </Button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  )
}
