import { THEME_MAP, DEFAULT_THEME_ID, type ThemePreset } from './presets'

// Returns CSS custom properties as a style object for scoping a theme
// to a container element. Also sets font families and radius.
// When `mode` is provided, it overrides the preset's default color scheme.
export function themeStyleVars(
  presetId: string | undefined,
  mode?: 'dark' | 'light',
): React.CSSProperties {
  const preset = THEME_MAP[presetId ?? DEFAULT_THEME_ID] ?? THEME_MAP[DEFAULT_THEME_ID]
  const effectiveMode = mode ?? preset.colorScheme
  const vars = effectiveMode === 'light' && preset.lightVars ? preset.lightVars : preset.vars
  return {
    ...vars,
    '--radius': preset.radius,
    fontFamily: preset.fontBody,
    colorScheme: effectiveMode,
  } as React.CSSProperties
}

// Returns the CSS class needed for dark/light token resolution.
export function themeColorSchemeClass(
  presetId: string | undefined,
  mode?: 'dark' | 'light',
): string {
  const preset = THEME_MAP[presetId ?? DEFAULT_THEME_ID] ?? THEME_MAP[DEFAULT_THEME_ID]
  const effectiveMode = mode ?? preset.colorScheme
  return effectiveMode === 'dark' ? 'dark' : ''
}

// Returns the display font family for the preset, used for headings.
export function themeDisplayFont(presetId: string | undefined): string {
  const preset = THEME_MAP[presetId ?? DEFAULT_THEME_ID] ?? THEME_MAP[DEFAULT_THEME_ID]
  return preset.fontDisplay
}

export function resolvePreset(presetId: string | undefined): ThemePreset {
  return THEME_MAP[presetId ?? DEFAULT_THEME_ID] ?? THEME_MAP[DEFAULT_THEME_ID]
}
