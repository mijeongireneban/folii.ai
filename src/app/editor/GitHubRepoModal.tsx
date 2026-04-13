'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Search, Star, Lock, X } from 'lucide-react'
import { styles as editorStyles } from './editor-styles'

type Repo = {
  id: number
  name: string
  fullName: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  isPrivate: boolean
  htmlUrl: string
  homepage: string | null
  topics: string[]
  updatedAt: string
}

type Props = {
  open: boolean
  onClose: () => void
  onImport: (repos: Repo[]) => void
  importing?: boolean
}

export function GitHubRepoModal({ open, onClose, onImport, importing }: Props) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)

  const fetchRepos = useCallback(async (pageNum: number, append = false) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/github/repos?page=${pageNum}&sort=updated`)
      const json = await res.json()
      if (!res.ok) {
        if (json.error === 'github_token_expired') {
          setError('GitHub connection expired. Please reconnect.')
        } else {
          setError('Failed to load repos.')
        }
        return
      }
      setRepos((prev) => append ? [...prev, ...json.repos] : json.repos)
      setHasNext(json.hasNext)
      setPage(pageNum)
    } catch {
      setError('Failed to load repos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setSelected(new Set())
      setSearch('')
      fetchRepos(1)
    }
  }, [open, fetchRepos])

  if (!open) return null

  const filtered = search
    ? repos.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
      )
    : repos

  const toggleRepo = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 5) {
        next.add(id)
      }
      return next
    })
  }

  const handleImport = () => {
    const selectedRepos = repos.filter((r) => selected.has(r.id))
    onImport(selectedRepos)
  }

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalStyles.header}>
          <div>
            <h2 style={modalStyles.title}>Import from GitHub</h2>
            <p style={modalStyles.subtitle}>Select repos to add as portfolio projects</p>
          </div>
          <button onClick={onClose} style={modalStyles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={modalStyles.searchWrap}>
          <Search size={14} style={{ color: '#666', flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repos..."
            style={modalStyles.searchInput}
            autoFocus
          />
        </div>

        {/* Repo list */}
        <div style={modalStyles.list}>
          {loading && repos.length === 0 ? (
            <div style={modalStyles.center}>
              <Loader2 size={20} className="animate-spin" style={{ color: '#666' }} />
            </div>
          ) : error ? (
            <div style={modalStyles.center}>
              <span style={{ color: '#f66', fontSize: 13 }}>{error}</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={modalStyles.center}>
              <span style={{ color: '#666', fontSize: 13 }}>
                {search ? 'No repos match your search.' : 'No repos found.'}
              </span>
            </div>
          ) : (
            <>
              {filtered.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => toggleRepo(repo.id)}
                  style={{
                    ...modalStyles.repoItem,
                    background: selected.has(repo.id)
                      ? 'rgba(0,153,255,0.1)'
                      : 'transparent',
                    borderColor: selected.has(repo.id)
                      ? 'rgba(0,153,255,0.3)'
                      : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={modalStyles.repoCheckbox}>
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      border: selected.has(repo.id)
                        ? '2px solid #0099ff'
                        : '2px solid rgba(255,255,255,0.2)',
                      background: selected.has(repo.id) ? '#0099ff' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {selected.has(repo.id) && (
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={modalStyles.repoName}>
                      {repo.isPrivate && <Lock size={11} style={{ color: '#888', flexShrink: 0 }} />}
                      <span>{repo.name}</span>
                    </div>
                    {repo.description && (
                      <div style={modalStyles.repoDesc}>{repo.description}</div>
                    )}
                    <div style={modalStyles.repoMeta}>
                      {repo.language && (
                        <span style={modalStyles.metaItem}>{repo.language}</span>
                      )}
                      {repo.stars > 0 && (
                        <span style={modalStyles.metaItem}>
                          <Star size={11} style={{ marginRight: 2 }} />
                          {repo.stars.toLocaleString()}
                        </span>
                      )}
                      {repo.topics.length > 0 && (
                        <span style={modalStyles.metaItem}>
                          {repo.topics.slice(0, 3).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {hasNext && !search && (
                <button
                  onClick={() => fetchRepos(page + 1, true)}
                  disabled={loading}
                  style={modalStyles.loadMore}
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    'Load more'
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={modalStyles.footer}>
          <span style={{ fontSize: 12, color: '#666' }}>
            {selected.size} of 5 max selected
          </span>
          <button
            onClick={handleImport}
            disabled={selected.size === 0 || importing}
            style={{
              ...editorStyles.primaryBtn,
              padding: '10px 20px',
              fontSize: 13,
              opacity: selected.size === 0 || importing ? 0.4 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {importing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Importing...
              </>
            ) : (
              `Import ${selected.size > 0 ? selected.size : ''} project${selected.size !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    backdropFilter: 'blur(4px)',
  } as const,
  modal: {
    background: '#111',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    width: '90vw',
    maxWidth: 560,
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  } as const,
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '20px 20px 0',
  } as const,
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  } as const,
  subtitle: {
    fontSize: 12,
    color: '#888',
    margin: '4px 0 0',
  } as const,
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: 4,
  } as const,
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: '16px 20px',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
  } as const,
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
  } as const,
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minHeight: 200,
  } as const,
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  } as const,
  repoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '10px 12px',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    color: '#fff',
    fontSize: 13,
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  } as const,
  repoCheckbox: {
    paddingTop: 2,
    flexShrink: 0,
  } as const,
  repoName: {
    fontWeight: 500,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } as const,
  repoDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const,
  repoMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    fontSize: 11,
    color: '#666',
  } as const,
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
  } as const,
  loadMore: {
    padding: '10px',
    background: 'none',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: '#888',
    fontSize: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontFamily: 'inherit',
  } as const,
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  } as const,
}
