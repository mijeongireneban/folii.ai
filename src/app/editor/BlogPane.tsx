'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2, Plus, Trash2, Eye, EyeOff, Link } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { styles } from './editor-styles'

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

export function BlogPane({
  siteId,
  selectedPostId,
  onSelectPost,
  onPostsChange,
}: {
  siteId: string | null
  selectedPostId: string | null
  onSelectPost: (post: BlogPostRow | null) => void
  onPostsChange: (posts: BlogPostRow[]) => void
}) {
  const [posts, setPosts] = useState<BlogPostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  // Fetch all posts on mount
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

  function refreshPosts() {
    if (!siteId) return
    fetch('/api/blog/posts')
      .then((r) => r.json())
      .then((data) => {
        const list = (data.posts ?? []) as BlogPostRow[]
        setPosts(list)
        onPostsChange(list)
      })
      .catch(() => {})
  }

  async function handleDelete(postId: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setDeleting(postId)
    try {
      await fetch(`/api/blog/${postId}`, { method: 'DELETE' })
      setPosts((p) => {
        const next = p.filter((x) => x.id !== postId)
        onPostsChange(next)
        return next
      })
      if (selectedPostId === postId) onSelectPost(null)
    } finally {
      setDeleting(null)
    }
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
        setPosts((p) => {
          const next = p.map((x) => (x.id === post.id ? json.post : x))
          onPostsChange(next)
          return next
        })
        if (selectedPostId === post.id) onSelectPost(json.post)
      }
    } finally {
      setToggling(null)
    }
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
      setPosts((p) => {
        const next = [post, ...p]
        onPostsChange(next)
        return next
      })
      onSelectPost(post)
      setImportUrl('')
      setShowImport(false)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  // Called by parent when a new post is created or updated via chat
  // Re-exported so parent can trigger a refresh.
  useEffect(() => {
    // Parent can call this via a ref or by changing a key
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      width: 280,
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#e5e5e5' }}>Posts</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setShowImport((v) => !v)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              padding: '4px 8px',
              color: '#e5e5e5',
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Import from URL"
          >
            <Link size={12} />
            Import
          </button>
          <button
            onClick={() => onSelectPost(null)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              padding: '4px 8px',
              color: '#e5e5e5',
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="New post"
          >
            <Plus size={12} />
            New
          </button>
        </div>
      </div>

      {showImport && (
        <div style={{
          padding: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
            Paste a URL from Dev.to, Medium, or any blog
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleImport()
            }}
            style={{ display: 'flex', gap: 6 }}
          >
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://dev.to/..."
              disabled={importing}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                padding: '6px 10px',
                color: '#fff',
                fontSize: 12,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={importing || !importUrl.trim()}
              style={{
                background: importUrl.trim() ? '#0099ff' : 'rgba(255,255,255,0.06)',
                color: importUrl.trim() ? '#fff' : '#666',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 11,
                cursor: importUrl.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {importing && <Loader2 size={10} className="animate-spin" />}
              {importing ? '...' : 'Go'}
            </button>
          </form>
          {importError && (
            <div style={{ fontSize: 11, color: '#ff6b6b', marginTop: 6 }}>
              {importError}
            </div>
          )}
        </div>
      )}

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px',
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24, color: '#666' }}>
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            padding: '24px 12px',
            textAlign: 'center',
            color: '#666',
            fontSize: 12,
            lineHeight: 1.6,
          }}>
            No posts yet. Type a message like &quot;write a post about my latest project&quot; to get started.
          </div>
        ) : (
          posts.map((post) => {
            const isSelected = post.id === selectedPostId
            const isPublished = post.status === 'published'
            return (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  marginBottom: 4,
                  background: isSelected ? 'rgba(0,153,255,0.1)' : 'transparent',
                  border: isSelected ? '1px solid rgba(0,153,255,0.3)' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#e5e5e5',
                  lineHeight: 1.3,
                  marginBottom: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {post.title || 'Untitled'}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: '#888',
                }}>
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 500,
                    background: isPublished ? 'rgba(0,200,100,0.1)' : 'rgba(255,255,255,0.06)',
                    color: isPublished ? '#00c864' : '#888',
                  }}>
                    {isPublished ? 'Live' : 'Draft'}
                  </span>
                  <span>
                    {new Date(post.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {isSelected && (
                  <div style={{
                    display: 'flex',
                    gap: 6,
                    marginTop: 8,
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTogglePublish(post)
                      }}
                      disabled={toggling === post.id}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        padding: '4px 8px',
                        color: '#ccc',
                        fontSize: 11,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {toggling === post.id ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : isPublished ? (
                        <EyeOff size={10} />
                      ) : (
                        <Eye size={10} />
                      )}
                      {isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(post.id)
                      }}
                      disabled={deleting === post.id}
                      style={{
                        background: 'rgba(255,100,100,0.06)',
                        border: '1px solid rgba(255,100,100,0.15)',
                        borderRadius: 6,
                        padding: '4px 8px',
                        color: '#ff6b6b',
                        fontSize: 11,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {deleting === post.id ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <Trash2 size={10} />
                      )}
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Lightweight markdown preview for the editor (no Shiki, client-side only).
export function BlogPreview({ post }: { post: BlogPostRow | null }) {
  if (!post) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#666',
        fontSize: 14,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✍️</div>
          <div>Start a new post</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
            Type something like &quot;write a post about my React migration&quot;
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: '32px 24px',
      overflowY: 'auto',
      height: '100%',
    }}>
      <h1 style={{
        fontSize: 28,
        fontWeight: 700,
        color: '#e5e5e5',
        marginBottom: 8,
        lineHeight: 1.3,
      }}>
        {post.title}
      </h1>
      <div style={{
        display: 'flex',
        gap: 12,
        fontSize: 12,
        color: '#888',
        marginBottom: 24,
      }}>
        <span>{post.status === 'published' ? 'Published' : 'Draft'}</span>
        {post.tags.length > 0 && (
          <span>{post.tags.join(', ')}</span>
        )}
      </div>
      <div className="prose prose-invert prose-sm max-w-none" style={{ color: '#ccc', lineHeight: 1.8 }}>
        <ReactMarkdown>{post.body}</ReactMarkdown>
      </div>
    </div>
  )
}
