import { THEME_MAP, DEFAULT_THEME_ID, type ThemePreset } from './presets'

// Returns CSS custom properties as a style object for scoping a theme
// to a container element. Also sets font families and radius.
export function themeStyleVars(presetId: string | undefined): React.CSSProperties {
  const preset = THEME_MAP[presetId ?? DEFAULT_THEME_ID] ?? THEME_MAP[DEFAULT_THEME_ID]
  return {
    ...preset.vars,
    '--radius': preset.radius,
    fontFamily: preset.fontBody,
    colorScheme: preset.colorScheme,
  } as React.CSSProperties
}

// Returns the CSS class needed for dark/light token resolution.
// Components using `dark:` variants need the container to have the
// `dark` class when the theme is dark-schemed.
export function themeColorSchemeClass(presetId: string | undefined): string {
  const preset = THEME_MAP[presetId ?? DEFAULT_THEME_ID] ?? THEME_MAP[DEFAULT_THEME_ID]
  return preset.colorScheme === 'dark' ? 'dark' : ''
}

// Returns the display font family for the preset, used for headings.
export function themeDisplayFont(presetId: string | undefined): string {
  const preset = THEME_MAP[presetId ?? DEFAULT_THEME_ID] ?? THEME_MAP[DEFAULT_THEME_ID]
  return preset.fontDisplay
}

export function resolvePreset(presetId: string | undefined): ThemePreset {
  return THEME_MAP[presetId ?? DEFAULT_THEME_ID] ?? THEME_MAP[DEFAULT_THEME_ID]
}
