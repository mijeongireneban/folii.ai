'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Content } from '@/types/content'
import { WIZARD_STEPS, type WizardStep } from '@/lib/schemas/wizard'

const PROMPTS: Record<WizardStep, string> = {
  identity: 'What\'s your name and what do you do? (e.g., "Mijeong, software engineer")',
  bio: 'Tell us about yourself in a sentence or two.',
  currentRole: 'Describe your current role: company, location, when you started, what you do, key achievements, and technologies.',
  pastRoles: 'Any past roles? Same details as above. Or say "skip".',
  projects: 'List a few projects you want to show. Title, description, tags. Or say "skip".',
  skills: 'List your skills grouped by category (e.g., Languages: TS, Python; Frameworks: React, Next.js).',
  contact: 'Contact email and a short message for the contact section.',
}

export function WizardTab({
  onContentChange, onComplete,
}: {
  portfolioId: string
  content: Content
  onContentChange: (c: Content) => void
  onComplete: () => void
}) {
  const [stepIdx, setStepIdx] = useState(0)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const step = WIZARD_STEPS[stepIdx]

  function advance() {
    setInput('')
    if (stepIdx + 1 >= WIZARD_STEPS.length) { onComplete(); return }
    setStepIdx(stepIdx + 1)
  }

  async function submit() {
    setBusy(true); setErr(null)
    if (input.trim().toLowerCase() === 'skip') {
      setBusy(false); advance(); return
    }
    const res = await fetch('/api/wizard', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ step, message: input }),
    })
    setBusy(false)
    if (!res.ok) { setErr((await res.json()).error); return }
    const { content: next } = await res.json()
    onContentChange(next); advance()
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="text-xs text-muted-foreground">Step {stepIdx + 1} of {WIZARD_STEPS.length}: {step}</div>
      <p className="text-sm">{PROMPTS[step]}</p>
      <Textarea
        rows={4} value={input} onChange={(e) => setInput(e.target.value)}
        placeholder="Type your answer (or 'skip')…"
      />
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => { setInput(''); advance() }}>Skip</Button>
        <Button onClick={submit} disabled={busy}>{busy ? '…' : 'Next'}</Button>
      </div>
    </div>
  )
}
