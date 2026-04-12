'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sun, Moon } from 'lucide-react'
import { themeStyleVars, themeColorSchemeClass } from '@/lib/themes/apply'
import { resolvePreset } from '@/lib/themes/apply'

// Wraps template content with a dark/light toggle.
// The toggle appears top-right, similar to mijeong.dev.
// State persists in localStorage so visitors keep their preference.

const STORAGE_KEY = 'folii-color-mode'

export function TemplateThemeProvider({
  presetId,
  children,
  className,
  fixedToggle = true,
}: {
  presetId: string | undefined
  children: React.ReactNode
  className?: string
  fixedToggle?: boolean
}) {
  const preset = resolvePreset(presetId)
  const hasLightVars = !!preset.lightVars

  const [mode, setMode] = useState<'dark' | 'light'>(preset.colorScheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!hasLightVars) return
    const stored = localStorage.getItem(STORAGE_KEY) as 'dark' | 'light' | null
    if (stored === 'dark' || stored === 'light') {
      setMode(stored)
    }
  }, [hasLightVars])

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  const baseClass = className ?? 'flex min-h-screen flex-col'
  const posClass = fixedToggle ? 'fixed' : 'absolute'

  return (
    <div
      className={`${themeColorSchemeClass(presetId, mode)} bg-background text-foreground ${baseClass} transition-colors duration-300`}
      style={themeStyleVars(presetId, mode)}
    >
      {hasLightVars && mounted && (
        <button
          onClick={toggle}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`bg-background/80 border-border/50 text-foreground ${posClass} top-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-sm transition-colors hover:bg-muted`}
        >
          {mode === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      )}
      {children}
    </div>
  )
}
