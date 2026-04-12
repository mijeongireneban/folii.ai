// Each preset is a complete set of CSS custom property values.
// Colors use OKLCH to match the existing globals.css convention.
// The "dark-minimal" preset reproduces the current default look exactly.

export type ThemePreset = {
  id: string
  name: string
  colorScheme: 'dark' | 'light'
  radius: string
  fontDisplay: string
  fontBody: string
  vars: Record<string, string>
}

function darkPreset(
  id: string,
  name: string,
  overrides: Partial<ThemePreset> & { vars: Record<string, string> },
): ThemePreset {
  return {
    id,
    name,
    colorScheme: 'dark',
    radius: '0.625rem',
    fontDisplay: "'Cabinet Grotesk', 'Inter Variable', -apple-system, sans-serif",
    fontBody: "'Inter Variable', -apple-system, system-ui, sans-serif",
    ...overrides,
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
      ...overrides.vars,
    },
  }
}

function lightPreset(
  id: string,
  name: string,
  overrides: Partial<ThemePreset> & { vars: Record<string, string> },
): ThemePreset {
  return {
    id,
    name,
    colorScheme: 'light',
    radius: '0.625rem',
    fontDisplay: "'Cabinet Grotesk', 'Inter Variable', -apple-system, sans-serif",
    fontBody: "'Inter Variable', -apple-system, system-ui, sans-serif",
    ...overrides,
    vars: {
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
      ...overrides.vars,
    },
  }
}

export const THEME_PRESETS: ThemePreset[] = [
  // 1. Dark Minimal — current default, exact match of .dark in globals.css
  darkPreset('dark-minimal', 'Dark Minimal', {
    vars: {},
  }),

  // 2. Light Clean — bright, airy, professional
  lightPreset('light-clean', 'Light Clean', {
    radius: '0.75rem',
    vars: {},
  }),

  // 3. Ocean — deep navy with blue accent
  darkPreset('ocean', 'Ocean', {
    vars: {
      '--background': 'oklch(0.18 0.02 250)',
      '--foreground': 'oklch(0.95 0.01 230)',
      '--card': 'oklch(0.22 0.025 250)',
      '--card-foreground': 'oklch(0.95 0.01 230)',
      '--popover': 'oklch(0.22 0.025 250)',
      '--popover-foreground': 'oklch(0.95 0.01 230)',
      '--primary': 'oklch(0.65 0.15 240)',
      '--primary-foreground': 'oklch(0.98 0 0)',
      '--secondary': 'oklch(0.28 0.03 250)',
      '--secondary-foreground': 'oklch(0.92 0.01 230)',
      '--muted': 'oklch(0.28 0.03 250)',
      '--muted-foreground': 'oklch(0.65 0.03 240)',
      '--accent': 'oklch(0.28 0.03 250)',
      '--accent-foreground': 'oklch(0.92 0.01 230)',
      '--border': 'oklch(0.4 0.04 250 / 25%)',
      '--input': 'oklch(0.4 0.04 250 / 30%)',
      '--ring': 'oklch(0.65 0.15 240)',
    },
  }),

  // 4. Warm Earth — cream/tan with terracotta accent
  lightPreset('warm-earth', 'Warm Earth', {
    radius: '0.5rem',
    fontDisplay: "'Georgia', 'Times New Roman', serif",
    fontBody: "'Georgia', 'Times New Roman', serif",
    vars: {
      '--background': 'oklch(0.96 0.01 80)',
      '--foreground': 'oklch(0.25 0.02 50)',
      '--card': 'oklch(0.98 0.008 80)',
      '--card-foreground': 'oklch(0.25 0.02 50)',
      '--popover': 'oklch(0.98 0.008 80)',
      '--popover-foreground': 'oklch(0.25 0.02 50)',
      '--primary': 'oklch(0.55 0.14 35)',
      '--primary-foreground': 'oklch(0.98 0.005 80)',
      '--secondary': 'oklch(0.92 0.015 80)',
      '--secondary-foreground': 'oklch(0.3 0.02 50)',
      '--muted': 'oklch(0.92 0.015 80)',
      '--muted-foreground': 'oklch(0.55 0.02 50)',
      '--accent': 'oklch(0.92 0.015 80)',
      '--accent-foreground': 'oklch(0.3 0.02 50)',
      '--destructive': 'oklch(0.55 0.2 25)',
      '--border': 'oklch(0.8 0.02 70)',
      '--input': 'oklch(0.8 0.02 70)',
      '--ring': 'oklch(0.55 0.14 35)',
    },
  }),

  // 5. Emerald — dark green palette
  darkPreset('emerald', 'Emerald', {
    vars: {
      '--background': 'oklch(0.16 0.02 160)',
      '--foreground': 'oklch(0.95 0.02 150)',
      '--card': 'oklch(0.21 0.025 160)',
      '--card-foreground': 'oklch(0.95 0.02 150)',
      '--popover': 'oklch(0.21 0.025 160)',
      '--popover-foreground': 'oklch(0.95 0.02 150)',
      '--primary': 'oklch(0.7 0.15 155)',
      '--primary-foreground': 'oklch(0.15 0.02 160)',
      '--secondary': 'oklch(0.26 0.03 160)',
      '--secondary-foreground': 'oklch(0.92 0.02 150)',
      '--muted': 'oklch(0.26 0.03 160)',
      '--muted-foreground': 'oklch(0.65 0.04 155)',
      '--accent': 'oklch(0.26 0.03 160)',
      '--accent-foreground': 'oklch(0.92 0.02 150)',
      '--border': 'oklch(0.45 0.05 155 / 25%)',
      '--input': 'oklch(0.45 0.05 155 / 30%)',
      '--ring': 'oklch(0.7 0.15 155)',
    },
  }),

  // 6. Rose — soft pink light theme
  lightPreset('rose', 'Rose', {
    radius: '1rem',
    vars: {
      '--background': 'oklch(0.98 0.005 350)',
      '--foreground': 'oklch(0.2 0.03 350)',
      '--card': 'oklch(1 0.003 350)',
      '--card-foreground': 'oklch(0.2 0.03 350)',
      '--popover': 'oklch(1 0.003 350)',
      '--popover-foreground': 'oklch(0.2 0.03 350)',
      '--primary': 'oklch(0.6 0.18 350)',
      '--primary-foreground': 'oklch(0.98 0.005 350)',
      '--secondary': 'oklch(0.94 0.01 350)',
      '--secondary-foreground': 'oklch(0.25 0.03 350)',
      '--muted': 'oklch(0.94 0.01 350)',
      '--muted-foreground': 'oklch(0.5 0.03 350)',
      '--accent': 'oklch(0.94 0.01 350)',
      '--accent-foreground': 'oklch(0.25 0.03 350)',
      '--destructive': 'oklch(0.55 0.22 25)',
      '--border': 'oklch(0.88 0.02 350)',
      '--input': 'oklch(0.88 0.02 350)',
      '--ring': 'oklch(0.6 0.18 350)',
    },
  }),

  // 7. Neon — dark with vivid cyan/purple accents
  darkPreset('neon', 'Neon', {
    radius: '0.375rem',
    fontDisplay: "'Inter Variable', -apple-system, system-ui, sans-serif",
    vars: {
      '--background': 'oklch(0.12 0.015 280)',
      '--foreground': 'oklch(0.95 0.02 200)',
      '--card': 'oklch(0.17 0.02 280)',
      '--card-foreground': 'oklch(0.95 0.02 200)',
      '--popover': 'oklch(0.17 0.02 280)',
      '--popover-foreground': 'oklch(0.95 0.02 200)',
      '--primary': 'oklch(0.75 0.2 190)',
      '--primary-foreground': 'oklch(0.12 0.015 280)',
      '--secondary': 'oklch(0.22 0.025 280)',
      '--secondary-foreground': 'oklch(0.9 0.02 200)',
      '--muted': 'oklch(0.22 0.025 280)',
      '--muted-foreground': 'oklch(0.6 0.04 250)',
      '--accent': 'oklch(0.65 0.18 300)',
      '--accent-foreground': 'oklch(0.95 0.02 200)',
      '--border': 'oklch(0.5 0.1 250 / 20%)',
      '--input': 'oklch(0.5 0.1 250 / 25%)',
      '--ring': 'oklch(0.75 0.2 190)',
    },
  }),

  // 8. Monochrome — pure black/white, no color
  darkPreset('monochrome', 'Monochrome', {
    radius: '0rem',
    vars: {
      '--background': 'oklch(0 0 0)',
      '--foreground': 'oklch(1 0 0)',
      '--card': 'oklch(0.12 0 0)',
      '--card-foreground': 'oklch(1 0 0)',
      '--popover': 'oklch(0.12 0 0)',
      '--popover-foreground': 'oklch(1 0 0)',
      '--primary': 'oklch(1 0 0)',
      '--primary-foreground': 'oklch(0 0 0)',
      '--secondary': 'oklch(0.2 0 0)',
      '--secondary-foreground': 'oklch(1 0 0)',
      '--muted': 'oklch(0.2 0 0)',
      '--muted-foreground': 'oklch(0.6 0 0)',
      '--accent': 'oklch(0.2 0 0)',
      '--accent-foreground': 'oklch(1 0 0)',
      '--border': 'oklch(1 0 0 / 12%)',
      '--input': 'oklch(1 0 0 / 18%)',
      '--ring': 'oklch(0.5 0 0)',
    },
  }),
]

export const THEME_MAP = Object.fromEntries(
  THEME_PRESETS.map((t) => [t.id, t]),
) as Record<string, ThemePreset>

export const DEFAULT_THEME_ID = 'dark-minimal'
