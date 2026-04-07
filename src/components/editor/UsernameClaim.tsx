'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function UsernameClaim({
  username, onChange,
}: { portfolioId: string; username: string | null; onChange: (u: string) => void }) {
  const [editing, setEditing] = useState(!username)
  const [value, setValue] = useState(username ?? '')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true); setErr(null)
    const res = await fetch('/api/username', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: value }),
    })
    setBusy(false)
    if (!res.ok) { setErr((await res.json()).error); return }
    onChange(value); setEditing(false)
  }

  if (!editing) {
    return (
      <button className="text-sm font-medium" onClick={() => setEditing(true)}>
        folii.ai/{username}
      </button>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">folii.ai/</span>
      <Input value={value} onChange={(e) => setValue(e.target.value)} className="h-8 w-40" />
      <Button size="sm" onClick={submit} disabled={busy}>Save</Button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  )
}
