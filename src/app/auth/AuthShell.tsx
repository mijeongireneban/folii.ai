import type { ReactNode } from 'react'

const styles = {
  main: {
    minHeight: '100vh',
    background: '#000000',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
  } as const,
  card: {
    width: '100%',
    maxWidth: 420,
  } as const,
  title: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 48,
    lineHeight: 1.0,
    letterSpacing: '-2.4px',
    marginBottom: 12,
  } as const,
  subtitle: {
    fontSize: 15,
    color: '#a6a6a6',
    marginBottom: 32,
  } as const,
  error: {
    fontSize: 13,
    color: '#ff6b6b',
    marginBottom: 16,
  } as const,
  notice: {
    fontSize: 13,
    color: '#0099ff',
    marginBottom: 16,
  } as const,
} as const

export function AuthShell({
  title,
  subtitle,
  error,
  notice,
  children,
}: {
  title: string
  subtitle?: string
  error?: string
  notice?: string
  children: ReactNode
}) {
  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        {error && <p style={styles.error}>{error}</p>}
        {notice && <p style={styles.notice}>{notice}</p>}
        {children}
      </div>
    </main>
  )
}

export const fieldStyles = {
  form: { display: 'flex', flexDirection: 'column', gap: 14 } as const,
  label: { fontSize: 13, color: '#a6a6a6' } as const,
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'inherit',
    outline: 'none',
  } as const,
  submit: {
    marginTop: 8,
    background: '#0099ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: 100,
    padding: '12px 20px',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
  } as const,
  linkRow: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
  } as const,
  link: { color: '#0099ff', textDecoration: 'none' } as const,
}
