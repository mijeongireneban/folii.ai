// Shared inline styles for doc pages.
// Matches DESIGN.md: Cabinet Grotesk headings, Inter body,
// Framer Blue accents, pure black background.

export const doc = {
  title: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 40,
    lineHeight: 1.0,
    letterSpacing: '-2px',
    marginBottom: 12,
  } as const,
  subtitle: {
    fontSize: 16,
    lineHeight: 1.5,
    color: '#a6a6a6',
    marginBottom: 48,
  } as const,

  h2: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 26,
    lineHeight: 1.1,
    letterSpacing: '-1px',
    marginTop: 56,
    marginBottom: 20,
  } as const,
  h3: {
    fontFamily: "'Inter Variable', sans-serif",
    fontWeight: 600,
    fontSize: 18,
    lineHeight: 1.3,
    letterSpacing: '-0.4px',
    marginTop: 36,
    marginBottom: 12,
  } as const,

  p: {
    fontSize: 15,
    lineHeight: 1.65,
    color: '#ccc',
    marginBottom: 20,
  } as const,

  ol: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  } as const,
  ul: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  } as const,

  step: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
  } as const,
  stepNum: {
    fontFamily: "'Azeret Mono', monospace",
    fontSize: 11,
    color: '#0099ff',
    letterSpacing: '0.5px',
    flexShrink: 0,
    marginTop: 3,
  } as const,
  stepText: {
    fontSize: 15,
    lineHeight: 1.55,
    color: '#ccc',
  } as const,

  bullet: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  } as const,
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#0099ff',
    flexShrink: 0,
    marginTop: 7,
  } as const,
  bulletText: {
    fontSize: 15,
    lineHeight: 1.55,
    color: '#ccc',
  } as const,

  code: {
    fontFamily: "'Azeret Mono', monospace",
    fontSize: 13,
    background: 'rgba(255,255,255,0.06)',
    padding: '2px 7px',
    borderRadius: 5,
    color: '#e5e5e5',
  } as const,

  card: {
    background: '#000',
    boxShadow: 'rgba(0, 153, 255, 0.15) 0px 0px 0px 1px',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  } as const,
  cardTitle: {
    fontFamily: "'Inter Variable', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '-0.3px',
    marginBottom: 8,
  } as const,
  cardBody: {
    fontSize: 14,
    lineHeight: 1.55,
    color: '#a6a6a6',
  } as const,

  tip: {
    borderLeft: '2px solid #0099ff',
    paddingLeft: 16,
    marginBottom: 24,
  } as const,
  tipLabel: {
    fontFamily: "'Azeret Mono', monospace",
    fontSize: 10,
    color: '#0099ff',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: 6,
  } as const,
  tipBody: {
    fontSize: 14,
    lineHeight: 1.55,
    color: '#a6a6a6',
  } as const,

  link: {
    color: '#0099ff',
    textDecoration: 'none',
  } as const,

  divider: {
    border: 'none',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    margin: '48px 0',
  } as const,
}
