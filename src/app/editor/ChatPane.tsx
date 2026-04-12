'use client'

import { useRef, useEffect, useState } from 'react'
import type { Content } from '@/lib/content/schema'
import type { ChatMessage } from '@/lib/supabase/types'
import { Loader2, RotateCcw, ArrowUp } from 'lucide-react'
import { styles } from './editor-styles'
import { getSuggestions } from './suggestions'

export type Msg = Pick<ChatMessage, 'id' | 'role' | 'content' | 'created_at' | 'content_after'> & {
  error?: string
}

export function ChatPane({
  messages,
  content,
  isPlaceholder,
  isPending,
  onSend,
  onRetry,
  onRevert,
  reverting,
  uploadError,
  chatError,
  dailyRemaining,
  isFocusLayout,
}: {
  messages: Msg[]
  content: Content
  isPlaceholder: boolean
  isPending: boolean
  onSend: (text: string) => void
  onRetry: (msgId: string, text: string) => void
  onRevert: (messageId: string) => void
  reverting: string | null
  uploadError: string | null
  chatError: string | null
  dailyRemaining: number | null
  isFocusLayout: boolean
}) {
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  // Autoscroll chat
  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isPending) return
    setInput('')
    const textarea = (e.currentTarget as HTMLElement).querySelector('textarea')
    if (textarea) textarea.style.height = 'auto'
    onSend(text)
  }

  const lastRevertable = [...messages]
    .reverse()
    .find(
      (m) =>
        m.role === 'assistant' &&
        !!m.content_after &&
        !m.id.startsWith('tmp-'),
    )

  const suggestions = getSuggestions(content, isPlaceholder)

  return (
    <aside
      className="editor-chat-pane"
      style={{
        ...styles.chatPane,
        ...(isFocusLayout ? styles.chatPaneFocus : {}),
      }}
    >
      <div style={styles.chatHeader} className="editor-chat-header">
        <span style={styles.chatHeaderLabel} className="editor-chat-header-label">
          CHAT · REFINE YOUR PORTFOLIO
        </span>
        <button
          type="button"
          onClick={() => lastRevertable && onRevert(lastRevertable.id)}
          disabled={!lastRevertable || reverting === lastRevertable?.id}
          style={{
            ...styles.revertLastBtn,
            ...(!lastRevertable ? { opacity: 0.4, cursor: 'not-allowed' } : {}),
          }}
        >
          <RotateCcw size={12} />
          {reverting && lastRevertable && reverting === lastRevertable.id
            ? 'Reverting…'
            : 'Revert last'}
        </button>
      </div>

      <div ref={chatScrollRef} style={styles.chatScroll} className="editor-chat-scroll">
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
          const isUser = m.role === 'user'
          return (
            <div
              key={m.id}
              style={{
                ...styles.msg,
                ...(isUser ? styles.msgUser : styles.msgAssistant),
                ...(m.error ? styles.msgError : {}),
              }}
            >
              {!isUser && <div style={styles.msgLabel}>FOLII</div>}
              <div>{m.content}</div>
              {m.error && (
                <div style={styles.msgErrorFooter}>
                  <span style={styles.msgErrorText}>{m.error}</span>
                  <button
                    type="button"
                    onClick={() => onRetry(m.id, m.content)}
                    disabled={isPending}
                    style={styles.retryBtn}
                  >
                    <RotateCcw size={11} />
                    Retry
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {isPending && (
          <div style={styles.thinking}>
            <Loader2 size={14} className="animate-spin" />
            <span>Thinking…</span>
          </div>
        )}
        {chatError && <p style={styles.error}>{chatError}</p>}
      </div>

      {suggestions.length > 0 && !isPending && (
        <div style={styles.suggestions} className="editor-suggestions">
          {suggestions.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => onSend(text)}
              style={styles.suggestionChip}
            >
              {text}
            </button>
          ))}
        </div>
      )}

      {dailyRemaining !== null && dailyRemaining <= 10 && (
        <div style={styles.dailyLimit}>
          {dailyRemaining === 0
            ? 'Daily message limit reached. Resets in 24 hours.'
            : `${dailyRemaining} message${dailyRemaining === 1 ? '' : 's'} remaining today`}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.chatForm} className="editor-chat-form">
        <div style={styles.chatInputWrap}>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (input.trim() && !isPending) {
                  handleSubmit(e)
                }
              }
            }}
            placeholder={dailyRemaining === 0 ? 'Daily limit reached' : 'Tell folii what to change…'}
            style={styles.chatInput}
            disabled={isPending || dailyRemaining === 0}
            rows={1}
          />
          <button
            type="submit"
            style={{
              ...styles.sendBtn,
              ...(isPending || !input.trim() || dailyRemaining === 0 ? styles.btnBusy : {}),
            }}
            disabled={isPending || !input.trim() || dailyRemaining === 0}
            aria-label="Send"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ArrowUp size={16} />
            )}
          </button>
        </div>
      </form>
    </aside>
  )
}
