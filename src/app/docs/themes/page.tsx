import { doc } from '../doc-styles'
import { THEME_PRESETS } from '@/lib/themes/presets'

export default function ThemesPage() {
  const darkCount = THEME_PRESETS.filter((t) => t.colorScheme === 'dark').length
  const lightCount = THEME_PRESETS.filter((t) => t.colorScheme === 'light').length

  return (
    <>
      <h1 style={doc.title}>Themes</h1>
      <p style={doc.subtitle}>
        {THEME_PRESETS.length} preset themes. Pick one, toggle between dark and
        light mode. Your visitors can switch too.
      </p>

      <h2 style={doc.h2}>Picking a theme</h2>
      <p style={doc.p}>
        Click the <strong style={{ color: '#fff' }}>Theme</strong> button in the
        editor top bar. A dropdown shows all available presets with a color
        swatch preview. Click one to apply it — the preview updates instantly.
      </p>
      <p style={doc.p}>
        You can also use keyboard arrows to browse themes while the dropdown is
        open. Each arrow press applies the theme live so you can preview without
        clicking. Press <span style={doc.code}>Enter</span> to confirm or{' '}
        <span style={doc.code}>Escape</span> to dismiss.
      </p>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Dark &amp; light mode</h2>
      <p style={doc.p}>
        Every theme includes both dark and light color variants. Your published
        portfolio shows a sun/moon toggle button in the top-right corner.
        Visitors can switch between modes, and their preference is saved in
        the browser.
      </p>
      <p style={doc.p}>
        The editor preview also has the toggle, so you can see both modes while
        editing.
      </p>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>What themes change</h2>
      <ul style={doc.ul}>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            <strong style={{ color: '#fff' }}>Colors</strong> — background,
            text, cards, buttons, borders, accents.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            <strong style={{ color: '#fff' }}>Border radius</strong> — some
            themes are sharp and angular, others are soft and rounded.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            <strong style={{ color: '#fff' }}>Fonts</strong> — body and display
            fonts vary by theme. The default uses Cabinet Grotesk and Inter.
          </span>
        </li>
      </ul>

      <div style={doc.tip}>
        <div style={doc.tipLabel}>Note</div>
        <div style={doc.tipBody}>
          Themes only affect your published portfolio. The editor itself always
          uses the folii dark UI.
        </div>
      </div>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Available themes</h2>
      <p style={doc.p}>
        {THEME_PRESETS.length} presets total — {darkCount} dark-first,{' '}
        {lightCount} light-first. Community themes sourced from{' '}
        <a href="https://tweakcn.com" target="_blank" rel="noreferrer" style={doc.link}>
          tweakcn
        </a>{' '}
        (MIT license).
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
        {THEME_PRESETS.map((t) => (
          <div key={t.id} style={styles.themeRow}>
            <span
              style={{
                ...styles.swatch,
                background: t.vars['--primary'] || t.vars['--background'] || '#333',
              }}
            />
            <span style={styles.themeName}>{t.name}</span>
            <span style={styles.themeScheme}>{t.colorScheme}</span>
          </div>
        ))}
      </div>
    </>
  )
}

const styles = {
  themeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '6px 0',
  } as const,
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 3,
    border: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0,
  } as const,
  themeName: {
    fontSize: 14,
    color: '#e5e5e5',
  } as const,
  themeScheme: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  } as const,
}
