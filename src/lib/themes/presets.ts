// Theme preset type and registry.
// The default preset ("dark-minimal") reproduces the current look exactly.
// Community presets are imported from tweakcn (MIT license).

import { TWEAKCN_PRESETS } from './tweakcn-presets'

export type ThemePreset = {
  id: string
  name: string
  colorScheme: 'dark' | 'light'
  radius: string
  fontDisplay: string
  fontBody: string
  vars: Record<string, string>
  lightVars?: Record<string, string>
}

// The folii default — matches .dark in globals.css exactly.
const DEFAULT_PRESET: ThemePreset = {
  id: 'default',
  name: 'Default',
  colorScheme: 'dark',
  radius: '0.625rem',
  fontDisplay: "'Cabinet Grotesk', 'Inter Variable', -apple-system, sans-serif",
  fontBody: "'Inter Variable', -apple-system, system-ui, sans-serif",
  vars: {
    '--background': 'oklch(0.145 0 0)',
    '--foreground': 'oklch(0.985 0 0)',
    '--card': 'oklch(0.205 0 0)',
    '--card-foreground': 'oklch(0.985 0 0)',
    '--popover': 'oklch(0.205 0 0)',
    '--popover-foreground': 'oklch(0.985 0 0)',
    '--primary': 'oklch(0.922 0 0)',
    '--primary-foreground': 'oklch(0.205 0 0)',
    '--secondary': 'oklch(0.269 0 0)',
    '--secondary-foreground': 'oklch(0.985 0 0)',
    '--muted': 'oklch(0.269 0 0)',
    '--muted-foreground': 'oklch(0.708 0 0)',
    '--accent': 'oklch(0.269 0 0)',
    '--accent-foreground': 'oklch(0.985 0 0)',
    '--destructive': 'oklch(0.704 0.191 22.216)',
    '--border': 'oklch(1 0 0 / 10%)',
    '--input': 'oklch(1 0 0 / 15%)',
    '--ring': 'oklch(0.556 0 0)',
  },
  lightVars: {
    '--background': 'oklch(1 0 0)',
    '--foreground': 'oklch(0.145 0 0)',
    '--card': 'oklch(1 0 0)',
    '--card-foreground': 'oklch(0.145 0 0)',
    '--popover': 'oklch(1 0 0)',
    '--popover-foreground': 'oklch(0.145 0 0)',
    '--primary': 'oklch(0.205 0 0)',
    '--primary-foreground': 'oklch(0.985 0 0)',
    '--secondary': 'oklch(0.97 0 0)',
    '--secondary-foreground': 'oklch(0.205 0 0)',
    '--muted': 'oklch(0.97 0 0)',
    '--muted-foreground': 'oklch(0.556 0 0)',
    '--accent': 'oklch(0.97 0 0)',
    '--accent-foreground': 'oklch(0.205 0 0)',
    '--destructive': 'oklch(0.577 0.245 27.325)',
    '--border': 'oklch(0.922 0 0)',
    '--input': 'oklch(0.922 0 0)',
    '--ring': 'oklch(0.708 0 0)',
  },
}

export const THEME_PRESETS: ThemePreset[] = [
  DEFAULT_PRESET,
  ...TWEAKCN_PRESETS,
]

export const THEME_MAP = Object.fromEntries(
  THEME_PRESETS.map((t) => [t.id, t]),
) as Record<string, ThemePreset>

export const DEFAULT_THEME_ID = 'default'
