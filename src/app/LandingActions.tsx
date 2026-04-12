'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sun, Moon } from 'lucide-react'

const STORAGE_KEY = 'folii-landing-mode'

export function SignOutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleSignOut() {
    setBusy(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={busy}
      style={{
        color: '#a6a6a6',
        fontSize: 14,
        background: 'transparent',
        border: 'none',
        cursor: busy ? 'wait' : 'pointer',
        fontFamily: 'inherit',
        opacity: busy ? 0.5 : 1,
      }}
    >
      Sign out
    </button>
  )
}

export function ThemeToggle() {
  const [mode, setMode] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY) as 'dark' | 'light' | null
    if (stored === 'light') {
      setMode('light')
      document.documentElement.setAttribute('data-landing-theme', 'light')
    }
  }, [])

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.setAttribute('data-landing-theme', next)
      return next
    })
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: mode === 'dark' ? '#a6a6a6' : '#333',
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {mode === 'dark' ? (
        <Sun style={{ width: 16, height: 16 }} />
      ) : (
        <Moon style={{ width: 16, height: 16 }} />
      )}
    </button>
  )
}
