// Static inline-style tokens for EditorClient.
// Extracted to keep the component file focused on logic + JSX.

export const styles = {
  main: {
    height: '100vh',
    minHeight: 0,
    overflow: 'hidden',
    background: '#000',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  } as const,
  emptyMain: {
    minHeight: '100vh',
    background: '#000',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  } as const,
  emptyInner: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 24px',
    gap: 24,
    maxWidth: 720,
    margin: '0 auto',
    textAlign: 'center',
  } as const,
  emptyHero: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontWeight: 500,
    fontSize: 72,
    lineHeight: 0.9,
    letterSpacing: '-3.6px',
  } as const,
  emptySub: { fontSize: 17, color: '#a6a6a6', maxWidth: 520 } as const,

  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: '#000',
    flexShrink: 0,
  } as const,
  brand: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 18,
    fontWeight: 500,
    letterSpacing: '-0.5px',
  } as const,
  topbarRight: { display: 'flex', alignItems: 'center', gap: 12 } as const,
  publishBtn: {
    background: '#0099ff',
    color: '#fff',
    border: 'none',
    borderRadius: 100,
    padding: '8px 18px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  } as const,
  publishBtnOn: { background: 'rgba(0,153,255,0.15)', color: '#0099ff' } as const,
  liveLink: { color: '#0099ff', fontSize: 13, textDecoration: 'none' } as const,
  ghostBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#a6a6a6',
    borderRadius: 100,
    padding: '7px 14px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
  } as const,

  workspace: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    minHeight: 0,
  } as const,

  previewPane: {
    position: 'relative',
    overflow: 'hidden',
    background: '#050505',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    minWidth: 0,
  } as const,
  parsingOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 60,
    color: '#fff',
    fontSize: 14,
    pointerEvents: 'all',
  } as const,
  parsingHint: {
    fontSize: 12,
    color: '#8a8a8a',
  } as const,
  previewFrame: {
    flex: 1,
    padding: 24,
    display: 'flex',
    minHeight: 0,
  } as const,
  sectionTabs: {
    display: 'flex',
    gap: 4,
    marginBottom: 16,
    padding: 4,
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    width: 'fit-content',
  } as const,
  sectionTab: {
    background: 'transparent',
    color: '#a6a6a6',
    border: 'none',
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: 'inherit',
    cursor: 'pointer',
  } as const,
  sectionTabActive: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
  } as const,
  previewScale: {
    transformOrigin: 'top left',
  } as const,

  chatPane: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    background: '#000',
  } as const,
  chatScroll: {
    flex: 1,
    overflow: 'auto',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  } as const,
  hint: { fontSize: 13, color: '#666', lineHeight: 1.5 } as const,
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  } as const,
  chatHeaderLabel: {
    fontSize: 11,
    letterSpacing: '0.12em',
    color: '#8a8a8a',
    fontWeight: 500,
  } as const,
  revertLastBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#e5e5e5',
    borderRadius: 100,
    padding: '6px 12px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'inherit',
  } as const,
  msg: {
    fontSize: 14,
    lineHeight: 1.55,
    maxWidth: '82%',
  } as const,
  msgLabel: {
    fontSize: 10,
    letterSpacing: '0.14em',
    color: '#0099ff',
    fontWeight: 600,
    marginBottom: 6,
  } as const,
  msgUser: {
    alignSelf: 'flex-end',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: 18,
  } as const,
  msgAssistant: {
    alignSelf: 'flex-start',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    padding: '14px 18px',
    borderRadius: 14,
  } as const,
  msgError: {
    borderColor: 'rgba(255,107,107,0.3)',
  } as const,
  msgErrorFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  } as const,
  msgErrorText: {
    fontSize: 12,
    color: '#ff6b6b',
  } as const,
  retryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: 'transparent',
    border: '1px solid rgba(255,107,107,0.3)',
    color: '#ff6b6b',
    borderRadius: 100,
    padding: '3px 10px',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
  } as const,
  thinking: {
    fontSize: 13,
    color: '#666',
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } as const,
  btnBusy: { opacity: 0.6, cursor: 'wait' } as const,
  suggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    padding: '12px 16px 0',
  } as const,
  suggestionChip: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#cfcfcf',
    borderRadius: 100,
    padding: '6px 12px',
    fontSize: 12,
    fontFamily: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  } as const,
  chatForm: {
    display: 'flex',
    padding: 16,
    borderTop: '1px solid rgba(255,255,255,0.06)',
  } as const,
  chatInputWrap: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
  } as const,
  chatInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: '12px 52px 12px 18px',
    color: '#fff',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'none',
    overflow: 'hidden',
    lineHeight: 1.4,
  } as const,
  sendBtn: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 32,
    height: 32,
    background: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontFamily: 'inherit',
  } as const,

  dropzone: {
    border: '1.5px dashed rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: '48px 32px',
    width: '100%',
    maxWidth: 480,
    cursor: 'pointer',
    transition: 'all 150ms',
  } as const,
  dropzoneActive: {
    borderColor: '#0099ff',
    background: 'rgba(0,153,255,0.05)',
  } as const,
  dropzoneTitle: {
    fontSize: 17,
    fontWeight: 500,
    marginBottom: 6,
  } as const,
  dropzoneHint: { fontSize: 13, color: '#666' } as const,

  error: { fontSize: 13, color: '#ff6b6b' } as const,
  dailyLimit: {
    fontSize: 12,
    color: '#f5a623',
    textAlign: 'center',
    padding: '6px 16px',
    background: 'rgba(245,166,35,0.08)',
    borderTop: '1px solid rgba(245,166,35,0.15)',
  } as const,

  revertBtn: {
    marginTop: 8,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#a6a6a6',
    borderRadius: 100,
    padding: '4px 10px',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
  } as const,

  jsonFrame: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 24,
    minHeight: 0,
    minWidth: 0,
  } as const,
  jsonEditorWrap: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    background: '#0a0a0a',
  } as const,
  jsonActions: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
    padding: '12px 0 4px',
  } as const,
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#0099ff',
    color: '#fff',
    border: 'none',
    borderRadius: 100,
    padding: '8px 18px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  } as const,
}

// Responsive CSS injected via <style> tag since the editor uses inline styles.
export const EDITOR_MEDIA_CSS = `
@media (max-width: 768px) {
  .editor-workspace {
    grid-template-columns: 1fr !important;
  }
  .editor-preview-pane {
    border-right: none !important;
    max-height: calc(100vh - 50px - 320px) !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }
  .editor-chat-pane {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 320px !important;
    border-top: 1px solid rgba(255,255,255,0.06) !important;
    background: rgba(10,10,10,0.96) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    z-index: 10 !important;
  }
  .editor-topbar {
    padding: 10px 12px !important;
  }
  .editor-topbar-left {
    gap: 8px !important;
  }
  .editor-topbar-right {
    gap: 4px !important;
  }
  .editor-topbar-right button,
  .editor-topbar-right a {
    font-size: 11px !important;
    padding: 5px 8px !important;
  }
  .editor-btn-upload,
  .editor-btn-json,
  .editor-btn-reset,
  .editor-btn-theme,
  .editor-btn-github,
  .editor-live-link {
    display: none !important;
  }
  .editor-preview-frame {
    padding: 0 !important;
  }
  .editor-preview-frame > * {
    border-radius: 0 !important;
    border-left: none !important;
    border-right: none !important;
    max-width: 100% !important;
  }
  .editor-chat-header {
    padding: 8px 12px !important;
  }
  .editor-chat-header-label {
    font-size: 10px !important;
  }
  .editor-chat-scroll {
    padding: 10px 12px !important;
    gap: 8px !important;
  }
  .editor-chat-form {
    padding: 8px 10px !important;
  }
  .editor-suggestions {
    padding: 6px 10px 0 !important;
  }
}
@media (max-width: 480px) {
  .editor-chat-pane {
    height: 260px !important;
  }
  .editor-preview-pane {
    max-height: calc(100vh - 50px - 260px) !important;
  }
}
`
