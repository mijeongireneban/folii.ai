'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Plus, Trash2, Eye, EyeOff, Link, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { ConfirmRequest } from '@/components/ui/confirm-dialog'

// Explicit Markdown renderers that match DESIGN.md tokens. We can't rely on
// Tailwind `prose` classes because @tailwindcss/typography isn't installed.
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1
      style={{
        fontFamily: "'Cabinet Grotesk', sans-serif",
        fontSize: 34,
        fontWeight: 500,
        color: '#ffffff',
        letterSpacing: '-1.2px',
        lineHeight: 1.1,
        margin: '36px 0 14px',
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      style={{
        fontFamily: "'Cabinet Grotesk', sans-serif",
        fontSize: 26,
        fontWeight: 500,
        color: '#ffffff',
        letterSpacing: '-0.8px',
        lineHeight: 1.15,
        margin: '32px 0 12px',
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      style={{
        fontFamily: "'Cabinet Grotesk', sans-serif",
        fontSize: 20,
        fontWeight: 500,
        color: '#ffffff',
        letterSpacing: '-0.5px',
        lineHeight: 1.2,
        margin: '28px 0 10px',
      }}
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4
      style={{
        fontFamily: 'inherit',
        fontSize: 16,
        fontWeight: 600,
        color: '#ffffff',
        letterSpacing: '-0.01em',
        margin: '22px 0 8px',
      }}
    >
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p style={{ margin: '0 0 16px', color: '#e5e5e5' }}>{children}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: '#ffffff' }}>{children}</strong>
  ),
  em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{ color: '#0099ff', textDecoration: 'underline', textUnderlineOffset: 2 }}
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: '0 0 16px', paddingLeft: 22, color: '#e5e5e5' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: '0 0 16px', paddingLeft: 22, color: '#e5e5e5' }}>{children}</ol>
  ),
  li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: '18px 0',
        padding: '2px 0 2px 16px',
        borderLeft: '2px solid rgba(0,153,255,0.4)',
        color: '#a6a6a6',
        fontStyle: 'italic',
      }}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = /language-/.test(className ?? '')
    if (isBlock) return <code className={className}>{children}</code>
    return (
      <code
        style={{
          fontFamily: "'Azeret Mono', ui-monospace, monospace",
          fontSize: '0.9em',
          padding: '2px 6px',
          borderRadius: 6,
          background: 'rgba(255,255,255,0.06)',
          color: '#e5e5e5',
        }}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre
      style={{
        margin: '18px 0',
        padding: 16,
        background: '#090909',
        borderRadius: 10,
        overflowX: 'auto',
        fontSize: 13,
        fontFamily: "'Azeret Mono', ui-monospace, monospace",
        color: '#e5e5e5',
        boxShadow: 'rgba(255,255,255,0.06) 0px 0px 0px 1px',
      }}
    >
      {children}
    </pre>
  ),
  hr: () => (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        margin: '28px 0',
      }}
    />
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src ?? ''}
      alt={alt ?? ''}
      style={{ maxWidth: '100%', borderRadius: 10, margin: '18px 0' }}
    />
  ),
}

export type BlogPostRow = {
  id: string
  slug: string
  title: string
  body: string
  excerpt: string | null
  tags: string[]
  source: string
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
}

const pillBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 100,
  padding: '6px 13px',
  color: '#e5e5e5',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'inherit',
  letterSpacing: '-0.01em',
  transition: 'background 0.15s, border-color 0.15s',
}

const dangerBtnStyle: React.CSSProperties = {
  ...pillBtnStyle,
  border: '1px solid rgba(248,113,113,0.22)',
  color: '#f87171',
}

const primaryBtnStyle: React.CSSProperties = {
  background: '#0099ff',
  color: '#fff',
  border: '1px solid #0099ff',
  borderRadius: 100,
  padding: '6px 13px',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'inherit',
  letterSpacing: '-0.01em',
}

function readTime(body: string): string {
  const words = body.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 250))
  return `${minutes} min read`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BlogBrowser({
  siteId,
  selectedPost,
  onSelectPost,
  onPostsChange,
  onRequestChatFocus,
  onRequestConfirm,
}: {
  siteId: string | null
  selectedPost: BlogPostRow | null
  onSelectPost: (post: BlogPostRow | null) => void
  onPostsChange: (posts: BlogPostRow[]) => void
  onRequestChatFocus?: () => void
  onRequestConfirm: (request: ConfirmRequest) => void
}) {
  const [posts, setPosts] = useState<BlogPostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  useEffect(() => {
    if (!siteId) return
    setLoading(true)
    fetch('/api/blog/posts')
      .then((r) => r.json())
      .then((data) => {
        const list = (data.posts ?? []) as BlogPostRow[]
        setPosts(list)
        onPostsChange(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [siteId])

  function handleDelete(postId: string) {
    const post = posts.find((p) => p.id === postId)
    const label = post?.title?.trim() || 'Untitled'
    onRequestConfirm({
      title: 'Delete this post?',
      description: `"${label}" will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: async () => {
        setDeleting(postId)
        try {
          await fetch(`/api/blog/${postId}`, { method: 'DELETE' })
          const next = posts.filter((x) => x.id !== postId)
          setPosts(next)
          onPostsChange(next)
          if (selectedPost?.id === postId) onSelectPost(null)
        } finally {
          setDeleting(null)
        }
      },
    })
  }

  async function handleTogglePublish(post: BlogPostRow) {
    setToggling(post.id)
    const nextStatus = post.status === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const json = await res.json()
      if (json.ok && json.post) {
        const next = posts.map((x) => (x.id === post.id ? json.post : x))
        setPosts(next)
        onPostsChange(next)
        if (selectedPost?.id === post.id) onSelectPost(json.post)
      }
    } finally {
      setToggling(null)
    }
  }

  async function handleCreateNew() {
    setCreating(true)
    try {
      const res = await fetch('/api/blog/posts', { method: 'POST' })
      const json = await res.json()
      if (!res.ok || !json.ok || !json.post) return
      const post = json.post as BlogPostRow
      const next = [post, ...posts]
      setPosts(next)
      onPostsChange(next)
      onSelectPost(post)
    } finally {
      setCreating(false)
    }
  }

  function handlePostUpdated(updated: BlogPostRow) {
    const next = posts.map((p) => (p.id === updated.id ? updated : p))
    setPosts(next)
    onPostsChange(next)
    if (selectedPost?.id === updated.id) onSelectPost(updated)
  }

  async function handleImport() {
    if (!importUrl.trim()) return
    setImporting(true)
    setImportError(null)
    try {
      const res = await fetch('/api/blog/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setImportError(json.detail ?? json.error ?? 'Import failed')
        return
      }
      const post = json.post as BlogPostRow
      const next = [post, ...posts]
      setPosts(next)
      onPostsChange(next)
      onSelectPost(post)
      setImportUrl('')
      setShowImport(false)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#666',
      }}>
        <Loader2 size={22} className="animate-spin" />
      </div>
    )
  }

  // Detail view (a post is selected) — Notion-like editor.
  if (selectedPost) {
    return (
      <BlogEditor
        key={selectedPost.id}
        post={selectedPost}
        toggling={toggling === selectedPost.id}
        deleting={deleting === selectedPost.id}
        onBack={() => onSelectPost(null)}
        onUpdate={handlePostUpdated}
        onTogglePublish={() => handleTogglePublish(selectedPost)}
        onDelete={() => handleDelete(selectedPost.id)}
      />
    )
  }

  // Index view (no post selected) — also used when there are zero posts,
  // with an empty placeholder card where the list would be.
  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
    }}>
      {/* Index toolbar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '18px 40px',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          color: '#a6a6a6',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowImport((v) => !v)}
            style={pillBtnStyle}
          >
            <Link size={12} />
            Import
          </button>
          <button
            onClick={handleCreateNew}
            disabled={creating}
            style={{
              ...primaryBtnStyle,
              ...(creating ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
            }}
          >
            {creating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Plus size={12} />
            )}
            New post
          </button>
        </div>
      </div>

      {showImport && (
        <div style={{
          padding: '18px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#050505',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <ImportForm
              url={importUrl}
              setUrl={setImportUrl}
              importing={importing}
              error={importError}
              onSubmit={handleImport}
              onCancel={() => {
                setShowImport(false)
                setImportError(null)
                setImportUrl('')
              }}
            />
          </div>
        </div>
      )}

      {/* Hero */}
      <div style={{ padding: '48px 40px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: 56,
            fontWeight: 500,
            letterSpacing: '-2.5px',
            lineHeight: 0.95,
            color: '#ffffff',
            marginBottom: 10,
          }}>
            Blog
          </h1>
          <p style={{
            fontSize: 15,
            color: '#a6a6a6',
            letterSpacing: '-0.01em',
          }}>
            Your drafts and published posts.
          </p>
        </div>
      </div>

      {/* Post cards */}
      <div style={{ padding: '0 40px 80px' }}>
        <div style={{
          maxWidth: 720,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {posts.length === 0 && (
            <div
              style={{
                padding: '40px 22px',
                borderRadius: 14,
                textAlign: 'center',
                boxShadow: 'rgba(0, 153, 255, 0.12) 0px 0px 0px 1px',
              }}
            >
              <div
                style={{
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontSize: 22,
                  fontWeight: 500,
                  color: '#ffffff',
                  letterSpacing: '-0.6px',
                  marginBottom: 8,
                }}
              >
                No posts yet.
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: '#a6a6a6',
                  lineHeight: 1.55,
                  letterSpacing: '-0.005em',
                }}
              >
                Hit <span style={{ color: '#e5e5e5' }}>New post</span> to start writing,
                or <span style={{ color: '#e5e5e5' }}>Import</span> from a URL.
              </div>
            </div>
          )}
          {posts.map((post) => {
            const isPublished = post.status === 'published'
            const displayDate = isPublished && post.published_at
              ? post.published_at
              : post.updated_at
            return (
              <button
                key={post.id}
                onClick={() => onSelectPost(post)}
                style={{
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  padding: '20px 22px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  color: 'inherit',
                  boxShadow: 'rgba(0, 153, 255, 0.15) 0px 0px 0px 1px',
                  transition: 'box-shadow 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'rgba(0, 153, 255, 0.3) 0px 0px 0px 1px'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'rgba(0, 153, 255, 0.15) 0px 0px 0px 1px'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  <span style={{ color: isPublished ? '#0099ff' : '#a6a6a6' }}>
                    {isPublished ? 'Live' : 'Draft'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                  <span style={{ color: '#a6a6a6' }}>{formatDate(displayDate)}</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                  <span style={{ color: '#a6a6a6' }}>{readTime(post.body)}</span>
                </div>
                <div style={{
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontSize: 24,
                  fontWeight: 500,
                  color: '#ffffff',
                  letterSpacing: '-0.8px',
                  lineHeight: 1.15,
                  marginBottom: 8,
                }}>
                  {post.title || 'Untitled'}
                </div>
                {(post.excerpt || post.body) && (
                  <div style={{
                    fontSize: 14,
                    color: '#a6a6a6',
                    lineHeight: 1.5,
                    letterSpacing: '-0.005em',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {post.excerpt || post.body.slice(0, 200)}
                  </div>
                )}
                {post.tags.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap',
                    marginTop: 12,
                  }}>
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: "'Azeret Mono', ui-monospace, monospace",
                          fontSize: 10.4,
                          padding: '2px 8px',
                          borderRadius: 100,
                          color: '#a6a6a6',
                          boxShadow: 'rgba(255,255,255,0.1) 0px 0px 0px 1px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Notion-like inline editor for a single post. Local state for instant typing,
// debounced autosave (800ms after last keystroke), and a Saved/Saving/Failed
// indicator in the toolbar.
function BlogEditor({
  post,
  toggling,
  deleting,
  onBack,
  onUpdate,
  onTogglePublish,
  onDelete,
}: {
  post: BlogPostRow
  toggling: boolean
  deleting: boolean
  onBack: () => void
  onUpdate: (post: BlogPostRow) => void
  onTogglePublish: () => void
  onDelete: () => void
}) {
  const [title, setTitle] = useState(post.title)
  const [body, setBody] = useState(post.body)
  const [view, setView] = useState<'write' | 'preview'>('write')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const lastSavedRef = useRef({ title: post.title, body: post.body })
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  // Auto-size the body textarea on mount and on content change (write view only).
  useEffect(() => {
    if (view !== 'write') return
    const el = bodyRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [body, view])

  // Debounced autosave when title or body changes.
  useEffect(() => {
    const dirty =
      title !== lastSavedRef.current.title ||
      body !== lastSavedRef.current.body
    if (!dirty) return

    setSaveState('saving')
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/blog/${post.id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ title, body }),
        })
        const json = await res.json()
        if (res.ok && json.ok && json.post) {
          lastSavedRef.current = { title: json.post.title, body: json.post.body }
          setSaveState('saved')
          onUpdate(json.post)
        } else {
          setSaveState('error')
        }
      } catch {
        setSaveState('error')
      }
    }, 800)
    return () => clearTimeout(handle)
  }, [title, body, post.id, onUpdate])

  const isPublished = post.status === 'published'
  const canPublish = title.trim().length > 0 && body.trim().length > 0

  const statusLabel =
    saveState === 'saving' ? 'Saving…' :
    saveState === 'saved' ? 'Saved' :
    saveState === 'error' ? 'Save failed' :
    isPublished ? 'Live' : 'Draft'

  const statusColor =
    saveState === 'error' ? '#f87171' :
    isPublished && saveState !== 'saving' ? '#0099ff' :
    '#a6a6a6'

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* Toolbar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '18px 40px',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onBack} style={pillBtnStyle} title="Back to all posts">
            <ArrowLeft size={12} />
            All posts
          </button>
          {/* Write / Preview segmented toggle */}
          <div
            style={{
              display: 'inline-flex',
              padding: 2,
              borderRadius: 100,
              boxShadow: 'rgba(255,255,255,0.08) 0px 0px 0px 1px inset',
              background: '#050505',
            }}
          >
            {(['write', 'preview'] as const).map((v) => {
              const active = view === v
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  style={{
                    border: 'none',
                    borderRadius: 100,
                    padding: '4px 11px',
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: active ? '#ffffff' : 'transparent',
                    color: active ? '#000000' : '#a6a6a6',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {v === 'write' ? 'Write' : 'Preview'}
                </button>
              )
            })}
          </div>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: statusColor,
          }}>
            {statusLabel}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onTogglePublish}
            disabled={toggling || (!isPublished && !canPublish)}
            title={!isPublished && !canPublish ? 'Add a title and body before publishing' : undefined}
            style={{
              ...pillBtnStyle,
              ...((!isPublished && !canPublish) ? { opacity: 0.4, cursor: 'not-allowed' } : {}),
            }}
          >
            {toggling ? (
              <Loader2 size={11} className="animate-spin" />
            ) : isPublished ? (
              <EyeOff size={11} />
            ) : (
              <Eye size={11} />
            )}
            {isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            style={dangerBtnStyle}
          >
            {deleting ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Trash2 size={11} />
            )}
            Delete
          </button>
        </div>
      </div>

      {/* Editor surface */}
      <div style={{ padding: '56px 40px 120px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {view === 'preview' ? (
            <article>
              <h1
                style={{
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontSize: 44,
                  fontWeight: 500,
                  color: '#ffffff',
                  lineHeight: 1.05,
                  letterSpacing: '-1.8px',
                  marginBottom: 28,
                }}
              >
                {title || 'Untitled'}
              </h1>
              {body.trim() ? (
                <div
                  style={{
                    color: '#e5e5e5',
                    fontSize: 15,
                    lineHeight: 1.7,
                    letterSpacing: '-0.005em',
                  }}
                >
                  <ReactMarkdown components={markdownComponents}>{body}</ReactMarkdown>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 14,
                    color: '#666',
                    fontStyle: 'italic',
                  }}
                >
                  Nothing to preview yet. Switch to Write to start drafting.
                </div>
              )}
            </article>
          ) : (
            <>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            autoFocus={!title}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: 44,
              fontWeight: 500,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: '-1.8px',
              padding: 0,
              marginBottom: 28,
            }}
          />
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Start writing, or ask the assistant for help…"
            rows={1}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: 15,
              lineHeight: 1.7,
              letterSpacing: '-0.005em',
              color: '#e5e5e5',
              padding: 0,
              minHeight: 320,
              overflow: 'hidden',
            }}
          />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ImportForm({
  url,
  setUrl,
  importing,
  error,
  onSubmit,
  onCancel,
}: {
  url: string
  setUrl: (v: string) => void
  importing: boolean
  error: string | null
  onSubmit: () => void
  onCancel: () => void
}) {
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        style={{ display: 'flex', gap: 8 }}
      >
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://dev.to/…"
          disabled={importing}
          autoFocus
          style={{
            flex: 1,
            background: '#090909',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '9px 13px',
            color: '#fff',
            fontSize: 13,
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={importing || !url.trim()}
          style={{
            background: url.trim() && !importing ? '#0099ff' : 'rgba(255,255,255,0.06)',
            color: url.trim() && !importing ? '#fff' : '#666',
            border: 'none',
            borderRadius: 100,
            padding: '8px 18px',
            fontSize: 12,
            fontWeight: 500,
            cursor: url.trim() && !importing ? 'pointer' : 'not-allowed',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'inherit',
          }}
        >
          {importing && <Loader2 size={11} className="animate-spin" />}
          {importing ? 'Importing…' : 'Import'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={importing}
          style={pillBtnStyle}
        >
          Cancel
        </button>
      </form>
      {error && (
        <div style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>
          {error}
        </div>
      )}
    </div>
  )
}
