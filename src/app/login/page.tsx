'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setStatus('error'); setErrMsg(error.message); return }
    setStatus('sent')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Sign in to folii.ai</h1>
        <Input
          type="email" required placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={status === 'sending'} className="w-full">
          {status === 'sending' ? 'Sending…' : 'Send magic link'}
        </Button>
        {status === 'sent' && <p className="text-sm text-green-600">Check your email for the link.</p>}
        {status === 'error' && <p className="text-sm text-red-600">{errMsg}</p>}
      </form>
    </main>
  )
}
