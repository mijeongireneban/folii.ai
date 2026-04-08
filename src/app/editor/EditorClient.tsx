'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import type { Content } from '@/lib/content/schema'
import { PLACEHOLDER_CONTENT } from '@/lib/content/placeholder'
import type { ChatMessage } from '@/lib/supabase/types'
import { SwePortfolio, type PortfolioSection } from '@/components/template/SwePortfolio'
import { BrowserFrame } from '@/components/template/v2/BrowserFrame'
import { MenuBar, type MenuBarItem } from '@/components/template/v2/BottomMenu'
import { User, Briefcase, Wrench, FolderKanban, Mail } from 'lucide-react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { json as jsonLang } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'

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
type Msg = Pick<ChatMessage, 'id' | 'role' | 'content' | 'created_at' | 'content_after'>

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
  const [layout, setLayout] = useState<Layout>('split')
  const [mode, setMode] = useState<Mode>('preview')
  const [section, setSection] = useState<PortfolioSection>('profile')
  const [jsonDraft, setJsonDraft] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [jsonSaving, setJsonSaving] = useState(false)
  const [reverting, setReverting] = useState<string | null>(null)
  const [uploadingProjectIndex, setUploadingProjectIndex] = useState<number | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [input, setInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Load persisted layout preference
  useEffect(() => {
    const saved = localStorage.getItem(LAYOUT_KEY) as Layout | null
    if (saved === 'split' || saved === 'focus') setLayout(saved)
  }, [])
  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, layout)
  }, [layout])

  // Autoscroll chat
  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length])

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

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isPending) return
    setInput('')
    setChatError(null)

    // Optimistically append user message
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

    startTransition(async () => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const json = await res.json()
      if (!res.ok) {
        setChatError(json.error ?? 'chat_failed')
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
  }

  async function handlePublishToggle() {
    const next = !published
    setPublished(next)
    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ published: next }),
    })
    if (!res.ok) setPublished(!next)
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <main style={styles.main} data-layout={layout}>
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
        onPublishToggle={handlePublishToggle}
        onUploadClick={() => fileInputRef.current?.click()}
        uploading={uploading}
        onReset={handleReset}
        onUsernameChange={setUsername}
      />

      <div
        style={{
          ...styles.workspace,
          ...(layout === 'focus' ? styles.workspaceFocus : {}),
        }}
      >
        {/* Preview */}
        <section
          style={{
            ...styles.previewPane,
            ...(layout === 'focus' ? styles.previewPaneFocus : {}),
          }}
        >
          {mode === 'preview' ? (
            <div
              style={{
                ...styles.previewFrame,
                ...(layout === 'focus' ? { padding: 12 } : {}),
              }}
            >
              <BrowserFrame
                url={`folii.ai/${username}${SECTION_PATH[section]}`}
                fullBleed={layout === 'focus'}
              >
                <div className="dark relative flex min-h-full flex-col bg-background text-foreground">
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
                      ).map((s) => ({
                        icon: s.icon,
                        label: s.label,
                        href: s.href,
                        onClick: () => setSection(s.key),
                      }))}
                    />
                  </div>
                </div>
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
                  style={styles.sendBtn}
                  disabled={jsonSaving}
                >
                  {jsonSaving ? 'Saving…' : 'Save JSON'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Chat */}
        <aside
          style={{
            ...styles.chatPane,
            ...(layout === 'focus' ? styles.chatPaneFocus : {}),
          }}
        >
          <div ref={chatScrollRef} style={styles.chatScroll}>
            {messages.length === 0 && (
              <p style={styles.hint}>
                {isPlaceholder
                  ? 'Upload your resume to populate the preview, or start describing your portfolio in chat. Try: "I\'m a staff engineer at Acme working on developer tools".'
                  : 'Try: "tighten the bio", "add a project about X", or "rewrite my Acme impact line to quantify it".'}
              </p>
            )}
            {uploadError && (
              <p style={styles.error}>Upload failed: {uploadError}</p>
            )}
            {messages.map((m) => {
              const canRevert =
                m.role === 'assistant' && !!m.content_after && !m.id.startsWith('tmp-')
              return (
                <div
                  key={m.id}
                  style={{
                    ...styles.msg,
                    ...(m.role === 'user' ? styles.msgUser : styles.msgAssistant),
                  }}
                >
                  <div>{m.content}</div>
                  {canRevert && (
                    <button
                      onClick={() => handleRevert(m.id)}
                      disabled={reverting === m.id}
                      style={styles.revertBtn}
                    >
                      {reverting === m.id ? 'Undoing…' : '↶ Undo this edit'}
                    </button>
                  )}
                </div>
              )
            })}
            {isPending && <div style={styles.thinking}>Thinking…</div>}
            {chatError && <p style={styles.error}>{chatError}</p>}
          </div>
          <form onSubmit={handleSend} style={styles.chatForm}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe a change…"
              style={styles.chatInput}
              disabled={isPending}
            />
            <button
              type="submit"
              style={styles.sendBtn}
              disabled={isPending || !input.trim()}
            >
              Send
            </button>
          </form>
        </aside>
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
  onPublishToggle,
  onUploadClick,
  uploading,
  onReset,
  onUsernameChange,
}: {
  username: string
  layout?: Layout
  onLayoutChange?: (l: Layout) => void
  mode?: Mode
  onEnterJson?: () => void
  onExitJson?: () => void
  published?: boolean
  onPublishToggle?: () => void
  onUploadClick?: () => void
  uploading?: boolean
  onReset?: () => void
  onUsernameChange?: (u: string) => void
}) {
  return (
    <header style={styles.topbar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={styles.brand}>folii.ai</div>
        <UsernameEditor username={username} onChange={onUsernameChange} />
      </div>
      <div style={styles.topbarRight}>
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            disabled={uploading}
            style={styles.ghostBtn}
          >
            {uploading ? 'Parsing…' : 'Upload resume'}
          </button>
        )}
        {mode && onEnterJson && onExitJson && (
          <button
            onClick={mode === 'json' ? onExitJson : onEnterJson}
            style={styles.ghostBtn}
          >
            {mode === 'json' ? 'Preview' : '{ } JSON'}
          </button>
        )}
        {layout && onLayoutChange && (
          <div style={styles.segmented}>
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
        {onPublishToggle && (
          <>
            {published && username && (
              <a
                href={`/${username}`}
                target="_blank"
                rel="noreferrer"
                style={styles.liveLink}
              >
                /{username} ↗
              </a>
            )}
            <button
              onClick={onPublishToggle}
              style={{
                ...styles.publishBtn,
                ...(published ? styles.publishBtnOn : {}),
              }}
            >
              {published ? 'Unpublish' : 'Publish'}
            </button>
          </>
        )}
        {onReset && (
          <button onClick={onReset} style={styles.ghostBtn}>
            Reset
          </button>
        )}
        <form action={signOut}>
          <button type="submit" style={styles.ghostBtn}>
            Sign out
          </button>
        </form>
      </div>
    </header>
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

const styles = {
  main: {
    minHeight: '100vh',
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
  segmented: {
    display: 'flex',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 100,
    padding: 3,
  } as const,
  segBtn: {
    background: 'transparent',
    color: '#a6a6a6',
    border: 'none',
    padding: '6px 14px',
    borderRadius: 100,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
  } as const,
  segBtnActive: { background: '#fff', color: '#000' } as const,
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
  workspaceFocus: { gridTemplateColumns: '1fr' } as const,

  previewPane: {
    overflow: 'hidden',
    background: '#050505',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    minWidth: 0,
  } as const,
  previewPaneFocus: { borderRight: 'none' } as const,
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
    // Render at full fidelity; the overflow: auto above handles scrolling.
  } as const,

  chatPane: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    background: '#000',
  } as const,
  chatPaneFocus: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 320,
    borderTop: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(10,10,10,0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    zIndex: 10,
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
  msg: {
    fontSize: 14,
    lineHeight: 1.5,
    padding: '10px 14px',
    borderRadius: 12,
    maxWidth: '90%',
  } as const,
  msgUser: {
    alignSelf: 'flex-end',
    background: '#0099ff',
    color: '#fff',
  } as const,
  msgAssistant: {
    alignSelf: 'flex-start',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
  } as const,
  thinking: { fontSize: 13, color: '#666', alignSelf: 'flex-start' } as const,
  chatForm: {
    display: 'flex',
    gap: 8,
    padding: 16,
    borderTop: '1px solid rgba(255,255,255,0.06)',
  } as const,
  chatInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 100,
    padding: '10px 16px',
    color: '#fff',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
  } as const,
  sendBtn: {
    background: '#0099ff',
    color: '#fff',
    border: 'none',
    borderRadius: 100,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
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
  } as const,
}
