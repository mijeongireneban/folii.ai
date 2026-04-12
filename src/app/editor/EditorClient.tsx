'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import type { Content } from '@/lib/content/schema'
import { PLACEHOLDER_CONTENT } from '@/lib/content/placeholder'
import type { ChatMessage } from '@/lib/supabase/types'
import { SwePortfolio, type PortfolioSection } from '@/components/template/SwePortfolio'
import { BrowserFrame } from '@/components/template/v2/BrowserFrame'
import { MenuBar, type MenuBarItem } from '@/components/template/v2/BottomMenu'
import { User, Briefcase, Wrench, FolderKanban, Mail, Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { json as jsonLang } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { styles, EDITOR_MEDIA_CSS } from './editor-styles'
import { ChatPane, type Msg } from './ChatPane'
import { THEME_PRESETS, DEFAULT_THEME_ID } from '@/lib/themes/presets'
import { themeStyleVars, themeColorSchemeClass, themeDisplayFont } from '@/lib/themes/apply'
import { TemplateThemeProvider } from '@/components/template/v2/ThemeToggle'

const SECTION_PATH: Record<PortfolioSection, string> = {
  profile: '',
  experience: '/experience',
  skills: '/skills',
  projects: '/projects',
  contact: '/contact',
}
import { signOut } from '@/app/auth/actions'
import { validateSlug, slugErrorMessage, USERNAME_MAX } from '@/lib/username'

type Layout = 'split' | 'focus'
type Mode = 'preview' | 'json'
const LAYOUT_KEY = 'folii:editor:layout'

export function EditorClient({
  initialContent,
  initialMessages,
  initialPublished,
  username: initialUsername,
}: {
  initialContent: Content | null
  initialMessages: ChatMessage[]
  initialPublished: boolean
  username: string
}) {
  const [username, setUsername] = useState(initialUsername)
  const hasRealContent = initialContent !== null
  const [content, setContent] = useState<Content>(
    initialContent ?? PLACEHOLDER_CONTENT
  )
  const [isPlaceholder, setIsPlaceholder] = useState(!hasRealContent)
  const [messages, setMessages] = useState<Msg[]>(
    initialMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      created_at: m.created_at,
      content_after: m.content_after,
    }))
  )
  const [published, setPublished] = useState(initialPublished)
  const [publishing, setPublishing] = useState(false)
  // True when content has changed since the last successful publish, so the
  // currently-live site is out of date. Used to swap the button to "Republish".
  const [publishDirty, setPublishDirty] = useState(false)
  const skipDirtyRef = useRef(true)
  const [resetting, setResetting] = useState(false)
  const [layout, setLayout] = useState<Layout>('split')
  const [mode, setMode] = useState<Mode>('preview')
  const [section, setSection] = useState<PortfolioSection>('profile')
  const [jsonDraft, setJsonDraft] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [jsonSaving, setJsonSaving] = useState(false)
  const [reverting, setReverting] = useState<string | null>(null)
  const [uploadingProjectIndex, setUploadingProjectIndex] = useState<number | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [dailyRemaining, setDailyRemaining] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  // Load persisted layout preference
  useEffect(() => {
    const saved = localStorage.getItem(LAYOUT_KEY) as Layout | null
    if (saved === 'split' || saved === 'focus') setLayout(saved)
  }, [])
  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, layout)
  }, [layout])

  async function handleUpload(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/wizard/parse', {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      if (!res.ok) {
        setUploadError(json.error ?? 'upload_failed')
        return
      }
      setContent(json.content)
      setIsPlaceholder(false)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'upload_failed')
    } finally {
      setUploading(false)
    }
  }

  async function sendMessage(text: string, retryId?: string) {
    if (!text || isPending) return
    setChatError(null)

    // If retrying, clear the error on the failed message. Otherwise append a new one.
    if (retryId) {
      setMessages((m) => m.map((msg) => msg.id === retryId ? { ...msg, error: undefined } : msg))
    } else {
      const optimisticId = `tmp-${Date.now()}`
      setMessages((m) => [
        ...m,
        {
          id: optimisticId,
          role: 'user',
          content: text,
          created_at: new Date().toISOString(),
          content_after: null,
        },
      ])
    }

    startTransition(async () => {
      let res: Response
      let json: Record<string, unknown>
      try {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message: text }),
        })
        json = await res.json()
      } catch {
        // Network error — mark the last user message as failed
        setMessages((m) => {
          const last = [...m].reverse().find((msg) => msg.role === 'user' && msg.content === text)
          if (!last) return m
          return m.map((msg) => msg.id === last.id ? { ...msg, error: 'Network error. Check your connection.' } : msg)
        })
        return
      }

      if (!res.ok) {
        let errorMsg: string
        if (res.status === 429) {
          errorMsg = (json.message as string) ?? 'Too many requests. Please try again later.'
          if (json.daily) setDailyRemaining(0)
        } else if (res.status === 502 || res.status === 503) {
          errorMsg = 'AI service is temporarily unavailable. Try again in a moment.'
        } else {
          errorMsg = (json.error as string) ?? 'Something went wrong. Try again.'
        }
        // Attach error to the last user message with this text
        setMessages((m) => {
          const last = [...m].reverse().find((msg) => msg.role === 'user' && msg.content === text)
          if (!last) return m
          return m.map((msg) => msg.id === last.id ? { ...msg, error: errorMsg } : msg)
        })
        return
      }

      if (typeof json.dailyRemaining === 'number') {
        setDailyRemaining(json.dailyRemaining as number)
      }
      setContent(json.content as Content)
      setIsPlaceholder(false)
      const msg = json.message as { id: string; content: string; created_at: string }
      setMessages((m) => [
        ...m,
        {
          id: msg.id,
          role: 'assistant',
          content: msg.content,
          created_at: msg.created_at,
          content_after: json.content as Content,
        },
      ])
    })
  }

  async function handleRevert(messageId: string) {
    setReverting(messageId)
    setChatError(null)
    try {
      const res = await fetch('/api/revert', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messageId }),
      })
      const json = await res.json()
      if (!res.ok) {
        setChatError(json.error ?? 'revert_failed')
        return
      }
      setContent(json.content)
      setIsPlaceholder(false)
      setMessages((m) => [
        ...m,
        {
          id: json.message.id,
          role: 'assistant',
          content: json.message.content,
          created_at: json.message.created_at,
          content_after: json.content,
        },
      ])
    } finally {
      setReverting(null)
    }
  }

  async function handleProjectImage(projectIndex: number, file: File) {
    if (isPlaceholder) {
      setChatError('Upload your resume or describe your portfolio first.')
      return
    }
    setUploadingProjectIndex(projectIndex)
    setChatError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('projectIndex', String(projectIndex))
      const res = await fetch('/api/upload/project-image', {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      if (!res.ok) {
        setChatError(json.error ?? 'image_upload_failed')
        return
      }
      setContent(json.content)
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'image_upload_failed')
    } finally {
      setUploadingProjectIndex(null)
    }
  }

  async function handleProfileAvatar(file: File) {
    if (isPlaceholder) {
      setChatError('Upload your resume or describe your portfolio first.')
      return
    }
    setUploadingAvatar(true)
    setChatError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      if (!res.ok) {
        setChatError(json.error ?? 'avatar_upload_failed')
        return
      }
      setContent(json.content)
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'avatar_upload_failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  function enterJsonMode() {
    setJsonDraft(JSON.stringify(content, null, 2))
    setJsonError(null)
    setMode('json')
  }

  async function handleJsonSave() {
    setJsonSaving(true)
    setJsonError(null)
    try {
      let parsed: unknown
      try {
        parsed = JSON.parse(jsonDraft)
      } catch (err) {
        setJsonError(`Invalid JSON: ${err instanceof Error ? err.message : 'parse error'}`)
        return
      }
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.issues) {
          setJsonError(
            json.issues
              .map((i: { path: string; message: string }) => `${i.path || 'root'}: ${i.message}`)
              .join('; ')
          )
        } else {
          setJsonError(json.error ?? 'save_failed')
        }
        return
      }
      setContent(json.content)
      setIsPlaceholder(false)
      setMessages((m) => [
        ...m,
        {
          id: json.message.id,
          role: 'assistant',
          content: json.message.content,
          created_at: json.message.created_at,
          content_after: json.content,
        },
      ])
      setMode('preview')
    } finally {
      setJsonSaving(false)
    }
  }

  async function handleReset() {
    if (
      !confirm(
        'Reset everything? This wipes your content, chat history, and unpublishes your site. This cannot be undone.'
      )
    )
      return
    setResetting(true)
    try {
      const res = await fetch('/api/content', { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) {
        setChatError(json.error ?? 'reset_failed')
        return
      }
      setContent(json.content)
      setIsPlaceholder(true)
      setMessages([])
      setPublished(false)
      setMode('preview')
      setSection('profile')
      setChatError(null)
      setUploadError(null)
    } finally {
      setResetting(false)
    }
  }

  // Mark the live site as stale whenever content changes after the initial
  // mount, but only while published. Skip the very first effect run so the
  // initial hydration of `content` doesn't immediately flip the flag.
  useEffect(() => {
    if (skipDirtyRef.current) {
      skipDirtyRef.current = false
      return
    }
    if (published) setPublishDirty(true)
  }, [content, published])

  async function handlePublishToggle() {
    if (publishing) return
    // If published and dirty → republish (POST published:true again).
    // If published and clean → unpublish.
    // If not published → publish.
    const republishing = published && publishDirty
    const next = republishing ? true : !published
    setPublishing(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ published: next }),
      })
      if (res.ok) {
        setPublished(next)
        setPublishDirty(false)
      }
    } finally {
      setPublishing(false)
    }
  }

  function handleThemeChange(presetId: string) {
    setContent((prev) => ({ ...prev, theme: { preset: presetId } }))
    // Persist to server
    fetch('/api/content', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...content, theme: { preset: presetId } }),
    }).catch(() => {
      // Fail silently — theme is already applied locally
    })
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <main style={styles.main} data-layout={layout}>
      <style>{EDITOR_MEDIA_CSS}</style>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleUpload(f)
          e.target.value = ''
        }}
      />
      <TopBar
        username={username}
        layout={layout}
        onLayoutChange={setLayout}
        mode={mode}
        onEnterJson={enterJsonMode}
        onExitJson={() => setMode('preview')}
        published={published}
        publishDirty={publishDirty}
        publishing={publishing}
        onPublishToggle={handlePublishToggle}
        onUploadClick={() => fileInputRef.current?.click()}
        uploading={uploading}
        onReset={handleReset}
        resetting={resetting}
        onUsernameChange={setUsername}
        themeId={content.theme?.preset}
        onThemeChange={handleThemeChange}
        onSendChat={sendMessage}
      />

      <div
        className="editor-workspace"
        style={{
          ...styles.workspace,
          ...(layout === 'focus' ? styles.workspaceFocus : {}),
        }}
      >
        {/* Preview */}
        <section
          className="editor-preview-pane"
          style={{
            ...styles.previewPane,
            ...(layout === 'focus' ? styles.previewPaneFocus : {}),
          }}
        >
          {uploading && (
            <div style={styles.parsingOverlay}>
              <Loader2 size={28} className="animate-spin" />
              <div>Parsing your resume…</div>
              <div style={styles.parsingHint}>
                Pulling out your experience, projects, and skills.
              </div>
            </div>
          )}
          {mode === 'preview' ? (
            <div
              className="editor-preview-frame"
              style={{
                ...styles.previewFrame,
                ...(layout === 'focus' ? { padding: 12 } : {}),
              }}
            >
              <BrowserFrame
                url={`folii.ai/${username}${SECTION_PATH[section]}`}
                fullBleed={layout === 'focus'}
              >
                <TemplateThemeProvider presetId={content.theme?.preset} className="relative flex min-h-full flex-col" fixedToggle={false}>
                  <SwePortfolio
                    content={content}
                    section={section}
                    editable={!isPlaceholder}
                    onUploadImage={handleProjectImage}
                    uploadingIndex={uploadingProjectIndex}
                    onUploadAvatar={handleProfileAvatar}
                    uploadingAvatar={uploadingAvatar}
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-3 z-50 flex justify-center [&>*]:pointer-events-auto">
                    <MenuBar
                      activeHref={SECTION_PATH[section] || '/'}
                      items={(
                        [
                          { key: 'profile', icon: User, label: 'About Me', href: '/' },
                          { key: 'experience', icon: Briefcase, label: 'Work Experience', href: '/experience' },
                          { key: 'skills', icon: Wrench, label: 'Skills', href: '/skills' },
                          { key: 'projects', icon: FolderKanban, label: 'Projects', href: '/projects' },
                          { key: 'contact', icon: Mail, label: 'Contact', href: '/contact' },
                        ] as { key: PortfolioSection; icon: MenuBarItem['icon']; label: string; href: string }[]
                      )
                        .filter((s) => s.key === 'profile' || !content.hidden_sections?.includes(s.key as 'experience' | 'skills' | 'projects' | 'contact'))
                        .map((s) => ({
                        icon: s.icon,
                        label: s.label,
                        href: s.href,
                        onClick: () => setSection(s.key),
                      }))}
                    />
                  </div>
                </TemplateThemeProvider>
              </BrowserFrame>
            </div>
          ) : (
            <div style={styles.jsonFrame}>
              <div style={styles.jsonEditorWrap}>
                <CodeMirror
                  value={jsonDraft}
                  onChange={(v) => setJsonDraft(v)}
                  extensions={[jsonLang(), EditorView.lineWrapping]}
                  theme={oneDark}
                  height="100%"
                  style={{ height: '100%', fontSize: 13 }}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    highlightActiveLine: true,
                    bracketMatching: true,
                    autocompletion: false,
                  }}
                />
              </div>
              {jsonError && <p style={styles.error}>{jsonError}</p>}
              <div style={styles.jsonActions}>
                <button
                  onClick={() => setMode('preview')}
                  style={styles.ghostBtn}
                  disabled={jsonSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleJsonSave}
                  style={{
                    ...styles.primaryBtn,
                    ...(jsonSaving ? styles.btnBusy : {}),
                  }}
                  disabled={jsonSaving}
                >
                  {jsonSaving && <Loader2 size={14} className="animate-spin" />}
                  {jsonSaving ? 'Saving…' : 'Save JSON'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Chat */}
        <ChatPane
          messages={messages}
          content={content}
          isPlaceholder={isPlaceholder}
          isPending={isPending}
          onSend={sendMessage}
          onRetry={(msgId, text) => sendMessage(text, msgId)}
          onRevert={handleRevert}
          reverting={reverting}
          uploadError={uploadError}
          chatError={chatError}
          dailyRemaining={dailyRemaining}
          isFocusLayout={layout === 'focus'}
        />
      </div>
    </main>
  )
}

function UsernameEditor({
  username,
  onChange,
}: {
  username: string
  onChange?: (u: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(username)
  const [status, setStatus] = useState<
    | { kind: 'idle' }
    | { kind: 'checking' }
    | { kind: 'invalid'; reason: string }
    | { kind: 'available' }
    | { kind: 'unavailable'; reason: string }
    | { kind: 'saving' }
    | { kind: 'error'; reason: string }
  >({ kind: 'idle' })

  useEffect(() => {
    setDraft(username)
  }, [username])

  useEffect(() => {
    if (!editing) return
    const slug = draft.trim().toLowerCase()
    if (slug === username) {
      setStatus({ kind: 'idle' })
      return
    }
    const err = validateSlug(slug)
    if (err) {
      setStatus({ kind: 'invalid', reason: slugErrorMessage(err) })
      return
    }
    setStatus({ kind: 'checking' })
    const controller = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/username/check?slug=${encodeURIComponent(slug)}`,
          { signal: controller.signal }
        )
        const json = (await res.json()) as { available: boolean; reason?: string }
        if (json.available) setStatus({ kind: 'available' })
        else setStatus({ kind: 'unavailable', reason: json.reason ?? 'Unavailable.' })
      } catch (e) {
        if ((e as { name?: string }).name === 'AbortError') return
        setStatus({ kind: 'error', reason: 'Could not reach server.' })
      }
    }, 300)
    return () => {
      controller.abort()
      clearTimeout(t)
    }
  }, [draft, editing, username])

  const canSave = status.kind === 'available'

  async function handleSave() {
    const slug = draft.trim().toLowerCase()
    if (slug === username) {
      setEditing(false)
      return
    }
    const err = validateSlug(slug)
    if (err) {
      setStatus({ kind: 'invalid', reason: slugErrorMessage(err) })
      return
    }
    setStatus({ kind: 'saving' })
    try {
      const res = await fetch('/api/username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      const json = (await res.json()) as {
        ok?: boolean
        username?: string
        error?: string
        reason?: string
      }
      if (!res.ok || !json.ok || !json.username) {
        setStatus({
          kind: 'error',
          reason: json.reason ?? json.error ?? 'Save failed.',
        })
        return
      }
      onChange?.(json.username)
      setEditing(false)
      setStatus({ kind: 'idle' })
    } catch {
      setStatus({ kind: 'error', reason: 'Network error.' })
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(username)
          setStatus({ kind: 'idle' })
          setEditing(true)
        }}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 100,
          padding: '6px 12px',
          color: '#a6a6a6',
          fontSize: 12,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
        title="Edit username"
      >
        /{username}
      </button>
    )
  }

  const hintColor =
    status.kind === 'available'
      ? '#0099ff'
      : status.kind === 'invalid' ||
        status.kind === 'unavailable' ||
        status.kind === 'error'
      ? '#ff6b6b'
      : '#a6a6a6'
  const hintText =
    status.kind === 'checking'
      ? 'Checking…'
      : status.kind === 'available'
      ? 'Available'
      : status.kind === 'invalid' || status.kind === 'unavailable' || status.kind === 'error'
      ? status.reason
      : status.kind === 'saving'
      ? 'Saving…'
      : ''

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: '#a6a6a6', fontSize: 12 }}>folii.ai/</span>
      <input
        value={draft}
        maxLength={USERNAME_MAX}
        autoFocus
        onChange={(e) => setDraft(e.target.value.toLowerCase())}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && canSave) handleSave()
          if (e.key === 'Escape') {
            setEditing(false)
            setStatus({ kind: 'idle' })
          }
        }}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 100,
          padding: '6px 12px',
          color: '#fff',
          fontSize: 12,
          fontFamily: 'inherit',
          outline: 'none',
          width: 180,
        }}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        style={{
          background: canSave ? '#0099ff' : 'rgba(255,255,255,0.08)',
          color: canSave ? '#fff' : '#666',
          border: 'none',
          borderRadius: 100,
          padding: '6px 14px',
          fontSize: 12,
          fontFamily: 'inherit',
          cursor: canSave ? 'pointer' : 'not-allowed',
        }}
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => {
          setEditing(false)
          setDraft(username)
          setStatus({ kind: 'idle' })
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#a6a6a6',
          fontSize: 12,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>
      {hintText && (
        <span style={{ color: hintColor, fontSize: 11 }}>{hintText}</span>
      )}
    </div>
  )
}

function TopBar({
  username,
  layout,
  onLayoutChange,
  mode,
  onEnterJson,
  onExitJson,
  published,
  publishDirty,
  publishing,
  onPublishToggle,
  onUploadClick,
  uploading,
  onReset,
  resetting,
  onUsernameChange,
  themeId,
  onThemeChange,
  onSendChat,
}: {
  username: string
  layout?: Layout
  onLayoutChange?: (l: Layout) => void
  mode?: Mode
  onEnterJson?: () => void
  onExitJson?: () => void
  published?: boolean
  publishDirty?: boolean
  publishing?: boolean
  onPublishToggle?: () => void
  onUploadClick?: () => void
  uploading?: boolean
  onReset?: () => void
  resetting?: boolean
  onUsernameChange?: (u: string) => void
  themeId?: string
  onThemeChange?: (id: string) => void
  onSendChat?: (text: string) => void
}) {
  const [themeOpen, setThemeOpen] = useState(false)
  const themeRef = useRef<HTMLDivElement>(null)
  const [ghOpen, setGhOpen] = useState(false)
  const [ghUrl, setGhUrl] = useState('')
  const ghRef = useRef<HTMLDivElement>(null)

  // Close theme dropdown on outside click
  useEffect(() => {
    if (!themeOpen) return
    function handleClick(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [themeOpen])

  // Close GitHub popover on outside click
  useEffect(() => {
    if (!ghOpen) return
    function handleClick(e: MouseEvent) {
      if (ghRef.current && !ghRef.current.contains(e.target as Node)) {
        setGhOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ghOpen])

  // Arrow key navigation for theme dropdown — live preview on move
  useEffect(() => {
    if (!themeOpen || !onThemeChange) return
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'Escape' && e.key !== 'Enter') return
      e.preventDefault()
      if (e.key === 'Escape') {
        setThemeOpen(false)
        return
      }
      if (e.key === 'Enter') {
        setThemeOpen(false)
        return
      }
      const currentIdx = THEME_PRESETS.findIndex((t) => t.id === (themeId ?? DEFAULT_THEME_ID))
      const next = e.key === 'ArrowDown'
        ? (currentIdx + 1) % THEME_PRESETS.length
        : (currentIdx - 1 + THEME_PRESETS.length) % THEME_PRESETS.length
      onThemeChange!(THEME_PRESETS[next].id)
      // Scroll the active item into view
      const container = themeRef.current?.querySelector('[data-theme-list]')
      const activeBtn = container?.querySelector(`[data-theme-id="${THEME_PRESETS[next].id}"]`)
      activeBtn?.scrollIntoView({ block: 'nearest' })
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [themeOpen, themeId, onThemeChange])
  return (
    <header style={styles.topbar} className="editor-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="editor-topbar-left">
        <a href="/" style={{ ...styles.brand, textDecoration: 'none' }}>
          folii.ai
        </a>
        <UsernameEditor username={username} onChange={onUsernameChange} />
      </div>
      <div style={styles.topbarRight} className="editor-topbar-right">
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            disabled={uploading}
            className="editor-btn-upload"
            style={{
              ...styles.ghostBtn,
              ...(uploading ? styles.btnBusy : {}),
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {uploading && <Loader2 size={14} className="animate-spin" />}
            {uploading ? 'Parsing…' : 'Upload resume'}
          </button>
        )}
        {onSendChat && (
          <div ref={ghRef} style={{ position: 'relative' }} className="editor-btn-github">
            <button
              onClick={() => setGhOpen((v) => !v)}
              style={{
                ...styles.ghostBtn,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Import
            </button>
            {ghOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: 16,
                  width: 300,
                  zIndex: 50,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                  Import from GitHub
                </div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
                  Paste a public repo URL to add it as a project.
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!ghUrl.trim()) return
                    onSendChat(`Add this GitHub project to my portfolio: ${ghUrl.trim()}`)
                    setGhUrl('')
                    setGhOpen(false)
                  }}
                  style={{ display: 'flex', gap: 8 }}
                >
                  <input
                    type="url"
                    value={ghUrl}
                    onChange={(e) => setGhUrl(e.target.value)}
                    placeholder="https://github.com/user/repo"
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!ghUrl.trim()}
                    style={{
                      ...styles.primaryBtn,
                      padding: '8px 14px',
                      fontSize: 12,
                      opacity: ghUrl.trim() ? 1 : 0.4,
                    }}
                  >
                    Add
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
        {mode && onEnterJson && onExitJson && (
          <button
            onClick={mode === 'json' ? onExitJson : onEnterJson}
            className="editor-btn-json"
            style={styles.ghostBtn}
          >
            {mode === 'json' ? 'Preview' : '{ } JSON'}
          </button>
        )}
        {layout && onLayoutChange && (
          <div style={styles.segmented} className="editor-layout-toggle">
            <button
              onClick={() => onLayoutChange('split')}
              style={{
                ...styles.segBtn,
                ...(layout === 'split' ? styles.segBtnActive : {}),
              }}
            >
              Split
            </button>
            <button
              onClick={() => onLayoutChange('focus')}
              style={{
                ...styles.segBtn,
                ...(layout === 'focus' ? styles.segBtnActive : {}),
              }}
            >
              Focus
            </button>
          </div>
        )}
        {onThemeChange && (
          <div ref={themeRef} style={{ position: 'relative' }} className="editor-btn-theme">
            <button
              onClick={() => setThemeOpen((v) => !v)}
              style={{
                ...styles.ghostBtn,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: (THEME_PRESETS.find((t) => t.id === (themeId ?? DEFAULT_THEME_ID))?.vars['--primary']) ?? '#fff',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}
              />
              Theme
            </button>
            {themeOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  width: 200,
                  maxHeight: 400,
                  overflowY: 'auto',
                  zIndex: 50,
                }}
                data-theme-list
              >
                {THEME_PRESETS.map((t) => {
                  const active = (themeId ?? DEFAULT_THEME_ID) === t.id
                  return (
                    <button
                      key={t.id}
                      data-theme-id={t.id}
                      onClick={() => {
                        onThemeChange(t.id)
                        setThemeOpen(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: active ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                        background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: '#e5e5e5',
                        fontSize: 12,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          flexShrink: 0,
                          background: t.vars['--background'],
                          border: `2px solid ${t.vars['--primary']}`,
                        }}
                      />
                      {t.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
        {onPublishToggle && (
          <>
            {published && username && (
              <a
                href={`/${username}`}
                target="_blank"
                rel="noreferrer"
                className="editor-live-link"
                style={styles.liveLink}
              >
                /{username} ↗
              </a>
            )}
            <button
              onClick={onPublishToggle}
              disabled={publishing}
              style={{
                ...styles.publishBtn,
                ...(published ? styles.publishBtnOn : {}),
                ...(publishing ? styles.btnBusy : {}),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {publishing && <Loader2 size={14} className="animate-spin" />}
              {published
                ? publishDirty
                  ? 'Republish'
                  : 'Unpublish'
                : 'Publish'}
            </button>
          </>
        )}
        {onReset && (
          <button
            onClick={onReset}
            disabled={resetting}
            className="editor-btn-reset"
            style={{
              ...styles.ghostBtn,
              ...(resetting ? styles.btnBusy : {}),
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {resetting && <Loader2 size={14} className="animate-spin" />}
            {resetting ? 'Resetting…' : 'Reset'}
          </button>
        )}
        <form action={signOut}>
          <SignOutButton />
        </form>
      </div>
    </header>
  )
}

function SignOutButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        ...styles.ghostBtn,
        ...(pending ? styles.btnBusy : {}),
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {pending && <Loader2 size={14} className="animate-spin" />}
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}

function Dropzone({
  onFile,
  uploading,
}: {
  onFile: (f: File) => void
  uploading: boolean
}) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        const f = e.dataTransfer.files[0]
        if (f) onFile(f)
      }}
      onClick={() => inputRef.current?.click()}
      style={{
        ...styles.dropzone,
        ...(drag ? styles.dropzoneActive : {}),
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />
      <div style={styles.dropzoneTitle}>
        {uploading ? 'Parsing…' : 'Drop resume here'}
      </div>
      <div style={styles.dropzoneHint}>PDF, TXT, or MD · up to 5 MB</div>
    </div>
  )
}

// --- styles ------------------------------------------------------------

