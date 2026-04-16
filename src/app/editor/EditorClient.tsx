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
import { GitHubRepoModal } from './GitHubRepoModal'
import { BlogBrowser, type BlogPostRow } from './BlogPane'
import { THEME_PRESETS, DEFAULT_THEME_ID } from '@/lib/themes/presets'
import { themeStyleVars, themeColorSchemeClass, themeDisplayFont } from '@/lib/themes/apply'
import { TemplateThemeProvider } from '@/components/template/v2/ThemeToggle'
import { Logo } from '@/components/Logo'
import { ConfirmDialog, type ConfirmRequest } from '@/components/ui/confirm-dialog'

const SECTION_PATH: Record<PortfolioSection, string> = {
  profile: '',
  experience: '/experience',
  skills: '/skills',
  projects: '/projects',
  contact: '/contact',
}
import { signOut } from '@/app/auth/actions'
import { validateSlug, slugErrorMessage, USERNAME_MAX } from '@/lib/username'


type Mode = 'preview' | 'json'
type EditorTab = 'portfolio' | 'blog'

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

  // GitHub OAuth state
  const [ghConnected, setGhConnected] = useState(false)
  const [ghUsername, setGhUsername] = useState<string | null>(null)
  const [ghModalOpen, setGhModalOpen] = useState(false)
  const [ghImporting, setGhImporting] = useState(false)

  // Blog mode state
  const [editorTab, setEditorTab] = useState<EditorTab>('portfolio')
  const [selectedPost, setSelectedPost] = useState<BlogPostRow | null>(null)
  const [blogPosts, setBlogPosts] = useState<BlogPostRow[]>([])
  const [blogMessages, setBlogMessages] = useState<Msg[]>([])
  const [blogSiteId, setBlogSiteId] = useState<string | null>(null)
  const blogChatInputRef = useRef<HTMLTextAreaElement>(null)
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmRequest | null>(null)

  useEffect(() => {
    fetch('/api/github/status')
      .then((r) => r.json())
      .then((d) => {
        if (d.connected) {
          setGhConnected(true)
          setGhUsername(d.username ?? null)
        }
      })
      .catch(() => {})

    // Check for ?github=connected callback — open repo browser automatically
    const params = new URLSearchParams(window.location.search)
    if (params.get('github') === 'connected') {
      setGhConnected(true)
      setGhModalOpen(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function handleUpload(file: File) {
    setPendingConfirm({
      title: 'Replace portfolio with resume?',
      description: `"${file.name}" will overwrite your current portfolio content.`,
      confirmLabel: 'Replace',
      destructive: true,
      onConfirm: () => doUpload(file),
    })
  }

  async function doUpload(file: File) {
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

  function handleGitHubProfileImport() {
    setPendingConfirm({
      title: 'Import profile from GitHub?',
      description:
        'This replaces your current profile (name, bio, avatar, links) with the data from your GitHub account.',
      confirmLabel: 'Replace profile',
      destructive: true,
      onConfirm: doGitHubProfileImport,
    })
  }

  async function doGitHubProfileImport() {
    setUploading(true)
    setUploadError(null)
    try {
      const res = await fetch('/api/github/import-profile', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setUploadError(json.error === 'github_token_expired'
          ? 'GitHub connection expired. Please reconnect.'
          : json.error ?? 'import_failed')
        if (json.error === 'github_token_expired') {
          setGhConnected(false)
          setGhUsername(null)
        }
        return
      }
      setContent(json.content)
      setIsPlaceholder(false)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'import_failed')
    } finally {
      setUploading(false)
    }
  }

  function handleGitHubImport(repos: { fullName: string; name: string; description: string | null; language: string | null; stars: number; htmlUrl: string; homepage: string | null; topics: string[] }[]) {
    setPendingConfirm({
      title: `Import ${repos.length} ${repos.length === 1 ? 'project' : 'projects'} from GitHub?`,
      description:
        'This replaces the current projects in your portfolio with the selected GitHub repositories.',
      confirmLabel: 'Replace projects',
      destructive: true,
      onConfirm: () => doGitHubImport(repos),
    })
  }

  async function doGitHubImport(repos: { fullName: string; name: string; description: string | null; language: string | null; stars: number; htmlUrl: string; homepage: string | null; topics: string[] }[]) {
    setGhImporting(true)
    try {
      const res = await fetch('/api/github/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ repos }),
      })
      const json = await res.json()
      if (!res.ok) {
        setChatError(json.error ?? 'import_failed')
        return
      }
      setContent(json.content)
      setIsPlaceholder(false)
      setGhModalOpen(false)
      // Add the assistant message to chat
      setMessages((m) => [
        ...m,
        {
          id: `gh-import-${Date.now()}`,
          role: 'assistant',
          content: `Imported ${repos.length} project${repos.length > 1 ? 's' : ''} from GitHub: ${repos.map((r) => r.name).join(', ')}`,
          created_at: new Date().toISOString(),
          content_after: json.content,
        },
      ])
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'import_failed')
    } finally {
      setGhImporting(false)
    }
  }

  function handleLinkedInUpload(file: File) {
    setPendingConfirm({
      title: 'Replace portfolio with LinkedIn export?',
      description: `"${file.name}" will overwrite your current portfolio content.`,
      confirmLabel: 'Replace',
      destructive: true,
      onConfirm: () => doLinkedInUpload(file),
    })
  }

  async function doLinkedInUpload(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/wizard/linkedin', {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      if (!res.ok) {
        setUploadError(json.error === 'parse_failed' && json.reason === 'not_a_linkedin_profile'
          ? 'This doesn\'t look like a LinkedIn PDF. Please export your profile from LinkedIn.'
          : json.error ?? 'upload_failed')
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
          const reason = json.reason as string | undefined
          errorMsg = reason === 'invalid_output'
            ? 'AI returned an unexpected format. Try rephrasing your request.'
            : 'AI service is temporarily unavailable. Try again in a moment.'
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

  async function sendBlogMessage(text: string, retryId?: string) {
    if (!text || isPending) return
    setChatError(null)

    if (retryId) {
      setBlogMessages((m) => m.map((msg) => msg.id === retryId ? { ...msg, error: undefined } : msg))
    } else {
      const optimisticId = `tmp-${Date.now()}`
      setBlogMessages((m) => [
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
        res = await fetch('/api/blog/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            message: text,
            postId: selectedPost?.id ?? undefined,
          }),
        })
        json = await res.json()
      } catch {
        setBlogMessages((m) => {
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
        } else {
          errorMsg = (json.error as string) ?? 'Something went wrong. Try again.'
        }
        setBlogMessages((m) => {
          const last = [...m].reverse().find((msg) => msg.role === 'user' && msg.content === text)
          if (!last) return m
          return m.map((msg) => msg.id === last.id ? { ...msg, error: errorMsg } : msg)
        })
        return
      }

      if (typeof json.dailyRemaining === 'number') {
        setDailyRemaining(json.dailyRemaining as number)
      }

      // Update selected post with the returned data
      const post = json.post as BlogPostRow | null
      if (post) {
        setSelectedPost(post)
        // Update posts list
        setBlogPosts((prev) => {
          const exists = prev.find((p) => p.id === post.id)
          if (exists) {
            return prev.map((p) => p.id === post.id ? post : p)
          }
          return [post, ...prev]
        })
      }

      const msg = json.message as { id?: string; content?: string; created_at?: string } | undefined
      const replyText = msg?.content
      if (!replyText) {
        console.error('[blog chat] malformed response:', json)
        setBlogMessages((m) => {
          const last = [...m].reverse().find((msg) => msg.role === 'user' && msg.content === text)
          if (!last) return m
          return m.map((msg) => msg.id === last.id ? { ...msg, error: 'No reply returned. Check the server logs.' } : msg)
        })
        return
      }
      setBlogMessages((m) => [
        ...m,
        {
          id: msg?.id ?? `assistant-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          created_at: msg?.created_at ?? new Date().toISOString(),
          content_after: null,
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
      setMode('preview')
    } finally {
      setJsonSaving(false)
    }
  }

  function handleReset() {
    setPendingConfirm({
      title: 'Reset everything?',
      description:
        'This wipes your content, chat history, and unpublishes your site. This cannot be undone.',
      confirmLabel: 'Reset',
      destructive: true,
      onConfirm: doReset,
    })
  }

  async function doReset() {
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
  const linkedInFileRef = useRef<HTMLInputElement>(null)

  return (
    <main style={styles.main}>
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
      <input
        ref={linkedInFileRef}
        type="file"
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleLinkedInUpload(f)
          e.target.value = ''
        }}
      />
      <TopBar
        username={username}
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
        onLinkedInUpload={() => linkedInFileRef.current?.click()}
        ghConnected={ghConnected}
        ghUsername={ghUsername}
        onGhBrowse={() => setGhModalOpen(true)}
        onGhProfileImport={handleGitHubProfileImport}
        onGhDisconnect={() => {
          setPendingConfirm({
            title: `Disconnect GitHub${ghUsername ? ` (@${ghUsername})` : ''}?`,
            description:
              'We will remove your GitHub authorization. You can reconnect anytime, but you will need to sign in with GitHub again.',
            confirmLabel: 'Disconnect',
            destructive: true,
            onConfirm: async () => {
              await fetch('/api/github/status', { method: 'DELETE' })
              setGhConnected(false)
              setGhUsername(null)
            },
          })
        }}
      />

      <ConfirmDialog
        request={pendingConfirm}
        onOpenChange={(open) => {
          if (!open) setPendingConfirm(null)
        }}
      />

      <GitHubRepoModal
        open={ghModalOpen}
        onClose={() => setGhModalOpen(false)}
        onImport={handleGitHubImport}
        importing={ghImporting}
      />

      {/* Mode toggle: Portfolio / Blog */}
      <div style={{
        display: 'flex',
        gap: 0,
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingLeft: 16,
      }}>
        {(['portfolio', 'blog'] as EditorTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setEditorTab(tab)
              if (tab === 'blog') {
                // Load blog site ID on first switch
                if (!blogSiteId) {
                  fetch('/api/blog/posts')
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.siteId) setBlogSiteId(d.siteId)
                      setBlogPosts(d.posts ?? [])
                    })
                    .catch(() => {})
                }
              }
            }}
            style={{
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 500,
              color: editorTab === tab ? '#fff' : '#888',
              background: 'transparent',
              border: 'none',
              borderBottom: editorTab === tab ? '2px solid #0099ff' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {tab === 'portfolio' ? 'Portfolio' : 'Blog'}
          </button>
        ))}
      </div>

      <div
        className="editor-workspace"
        style={{
          ...styles.workspace,
          // Animate the right pane open when a blog post is selected.
          // Keeping two tracks (1fr {n}px) so the grid can interpolate smoothly.
          gridTemplateColumns:
            editorTab === 'blog' && !selectedPost ? '1fr 0px' : '1fr 400px',
          transition: 'grid-template-columns 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {editorTab === 'blog' ? (
          <section
            className="editor-preview-pane"
            style={styles.previewPane}
          >
            <div
              className="editor-preview-frame"
              style={styles.previewFrame}
            >
              <BrowserFrame
                url={
                  selectedPost
                    ? `folii.ai/${username}/blog/${selectedPost.slug}`
                    : `folii.ai/${username}/blog`
                }
              >
                <BlogBrowser
                  siteId={blogSiteId}
                  selectedPost={selectedPost}
                  onSelectPost={(post) => {
                    setSelectedPost(post)
                    setBlogMessages([])
                  }}
                  onPostsChange={setBlogPosts}
                  onRequestChatFocus={() => blogChatInputRef.current?.focus()}
                  onRequestConfirm={setPendingConfirm}
                />
              </BrowserFrame>
            </div>
          </section>
        ) : (
          <>
        {/* Preview */}
        <section
          className="editor-preview-pane"
          style={styles.previewPane}
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
              style={styles.previewFrame}
            >
              <BrowserFrame
                url={`folii.ai/${username}${SECTION_PATH[section]}`}

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
        />
          </>
        )}

        {/* Blog chat pane — always mounted when on the blog tab, but the
            workspace grid collapses its column to 0 on the list view. Opacity
            + overflow hide it while the grid column animates. */}
        {editorTab === 'blog' && (
          <ChatPane
            messages={blogMessages}
            content={content}
            isPlaceholder={false}
            isPending={isPending}
            onSend={sendBlogMessage}
            onRetry={(msgId, text) => sendBlogMessage(text, msgId)}
            onRevert={() => {}}
            reverting={null}
            uploadError={null}
            chatError={chatError}
            dailyRemaining={dailyRemaining}
            mode="blog"
            inputRef={blogChatInputRef}
            style={{
              minWidth: 0,
              overflow: 'hidden',
              opacity: selectedPost ? 1 : 0,
              pointerEvents: selectedPost ? 'auto' : 'none',
              transition: 'opacity 0.22s ease-in-out',
              transitionDelay: selectedPost ? '80ms' : '0ms',
            }}
          />
        )}
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
  onLinkedInUpload,
  ghConnected,
  ghUsername,
  onGhBrowse,
  onGhProfileImport,
  onGhDisconnect,
}: {
  username: string
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
  onLinkedInUpload?: () => void
  ghConnected?: boolean
  ghUsername?: string | null
  onGhBrowse?: () => void
  onGhProfileImport?: () => void
  onGhDisconnect?: () => void
}) {
  const [themeOpen, setThemeOpen] = useState(false)
  const themeRef = useRef<HTMLDivElement>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importView, setImportView] = useState<'menu' | 'github' | 'linkedin' | 'resume'>('menu')
  const [ghUrl, setGhUrl] = useState('')
  const importRef = useRef<HTMLDivElement>(null)
  const linkedInFileRef = useRef<HTMLInputElement>(null)

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

  // Close import popover on outside click
  useEffect(() => {
    if (!importOpen) return
    function handleClick(e: MouseEvent) {
      if (importRef.current && !importRef.current.contains(e.target as Node)) {
        setImportOpen(false)
        setImportView('menu')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [importOpen])

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
  const importMenuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: '#fff',
    fontSize: 13,
    cursor: 'pointer',
    textAlign: 'left' as const,
    marginBottom: 8,
    fontFamily: 'inherit',
  }

  return (
    <header style={styles.topbar} className="editor-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="editor-topbar-left">
        <a href="/" style={{ textDecoration: 'none', color: '#fff' }}>
          <Logo size={18} color="#fff" />
        </a>
        <UsernameEditor username={username} onChange={onUsernameChange} />
      </div>
      <div style={styles.topbarRight} className="editor-topbar-right">
        {(onSendChat || onLinkedInUpload || onUploadClick) && (
          <div ref={importRef} style={{ position: 'relative' }} className="editor-btn-github">
            <button
              onClick={() => {
                setImportOpen((v) => !v)
                if (importOpen) setImportView('menu')
              }}
              style={{
                ...styles.primaryBtn,
                padding: '8px 16px',
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {uploading && <Loader2 size={14} className="animate-spin" />}
              Import
            </button>
            {importOpen && (
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
                  width: importView === 'menu' ? 280 : 320,
                  zIndex: 100,
                }}
              >
                {importView === 'menu' && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
                      Import from...
                    </div>
                    {onUploadClick && (
                      <button
                        onClick={() => setImportView('resume')}
                        style={importMenuItemStyle}
                      >
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        <div>
                          <div style={{ fontWeight: 500 }}>Resume</div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Upload a PDF, TXT, or Markdown file</div>
                        </div>
                      </button>
                    )}
                    {onSendChat && (
                      <button
                        onClick={() => setImportView('github')}
                        style={importMenuItemStyle}
                      >
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                        <div>
                          <div style={{ fontWeight: 500 }}>GitHub</div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Browse repos or import your profile</div>
                        </div>
                      </button>
                    )}
                    {onLinkedInUpload && (
                      <button
                        onClick={() => setImportView('linkedin')}
                        style={importMenuItemStyle}
                      >
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        <div>
                          <div style={{ fontWeight: 500 }}>LinkedIn</div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Import your full profile from PDF</div>
                        </div>
                      </button>
                    )}
                  </>
                )}

                {importView === 'github' && (
                  <>
                    <button
                      onClick={() => setImportView('menu')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        fontSize: 12,
                        cursor: 'pointer',
                        padding: 0,
                        marginBottom: 8,
                      }}
                    >
                      &larr; Back
                    </button>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                      Import from GitHub
                    </div>

                    {ghConnected ? (
                      <>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          background: 'rgba(0,153,255,0.08)',
                          borderRadius: 8,
                          marginBottom: 12,
                          fontSize: 12,
                          color: '#aaa',
                        }}>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="#0099ff"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          <span>Connected as <strong style={{ color: '#fff' }}>{ghUsername}</strong></span>
                          <button
                            onClick={() => {
                              onGhDisconnect?.()
                              setImportOpen(false)
                              setImportView('menu')
                            }}
                            style={{ marginLeft: 'auto', color: '#888', background: 'none', border: 'none', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Disconnect
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            onGhBrowse?.()
                            setImportOpen(false)
                            setImportView('menu')
                          }}
                          style={{
                            ...styles.primaryBtn,
                            width: '100%',
                            padding: '10px 14px',
                            fontSize: 13,
                            justifyContent: 'center',
                            marginBottom: 8,
                          }}
                        >
                          Browse your repos
                        </button>
                        <button
                          onClick={() => {
                            onGhProfileImport?.()
                            setImportOpen(false)
                            setImportView('menu')
                          }}
                          disabled={uploading}
                          style={{
                            ...styles.primaryBtn,
                            width: '100%',
                            padding: '10px 14px',
                            fontSize: 13,
                            marginBottom: 12,
                            justifyContent: 'center',
                          }}
                        >
                          {uploading ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Importing profile...
                            </>
                          ) : (
                            'Import GitHub profile'
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <a
                          href="/api/auth/github"
                          style={{
                            ...styles.primaryBtn,
                            width: '100%',
                            padding: '10px 14px',
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            textDecoration: 'none',
                            marginBottom: 12,
                          }}
                        >
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                          Connect GitHub
                        </a>
                        <div style={{ fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 12 }}>or paste a URL</div>
                      </>
                    )}

                    {onSendChat && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}>
                          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                          <span style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>or</span>
                          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                        </div>
                        <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                          Paste a public repo URL to add it as a project.
                        </div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            if (!ghUrl.trim()) return
                            onSendChat(`Add this GitHub project to my portfolio: ${ghUrl.trim()}`)
                            setGhUrl('')
                            setImportOpen(false)
                            setImportView('menu')
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
                      </>
                    )}
                  </>
                )}

                {importView === 'linkedin' && onLinkedInUpload && (
                  <>
                    <button
                      onClick={() => setImportView('menu')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        fontSize: 12,
                        cursor: 'pointer',
                        padding: 0,
                        marginBottom: 8,
                      }}
                    >
                      &larr; Back
                    </button>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                      Import from LinkedIn
                    </div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>
                      Export your LinkedIn profile as PDF, then upload it here.
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 12,
                      fontSize: 12,
                      color: '#aaa',
                      lineHeight: 1.6,
                    }}>
                      <div style={{ fontWeight: 500, color: '#ccc', marginBottom: 6 }}>How to export:</div>
                      <ol style={{ margin: 0, paddingLeft: 18 }}>
                        <li>Go to your LinkedIn profile</li>
                        <li>Click <strong style={{ color: '#fff' }}>More</strong> (below your headline)</li>
                        <li>Select <strong style={{ color: '#fff' }}>Save to PDF</strong></li>
                        <li>Upload the downloaded file below</li>
                      </ol>
                    </div>
                    <button
                      onClick={() => {
                        onLinkedInUpload()
                        setImportOpen(false)
                        setImportView('menu')
                      }}
                      disabled={uploading}
                      style={{
                        ...styles.primaryBtn,
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: 13,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Parsing...
                        </>
                      ) : (
                        'Upload LinkedIn PDF'
                      )}
                    </button>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 8, textAlign: 'center' }}>
                      This will replace your current portfolio content.
                    </div>
                  </>
                )}

                {importView === 'resume' && onUploadClick && (
                  <>
                    <button
                      onClick={() => setImportView('menu')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        fontSize: 12,
                        cursor: 'pointer',
                        padding: 0,
                        marginBottom: 8,
                      }}
                    >
                      &larr; Back
                    </button>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                      Import from Resume
                    </div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>
                      Upload your resume and we&apos;ll extract your experience, skills, and projects.
                    </div>
                    <button
                      onClick={() => {
                        onUploadClick()
                        setImportOpen(false)
                        setImportView('menu')
                      }}
                      disabled={uploading}
                      style={{
                        ...styles.primaryBtn,
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: 13,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Parsing...
                        </>
                      ) : (
                        'Upload Resume'
                      )}
                    </button>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 8, textAlign: 'center' }}>
                      PDF, TXT, or Markdown up to 5 MB
                    </div>
                  </>
                )}
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
                  zIndex: 100,
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

// --- styles ------------------------------------------------------------

