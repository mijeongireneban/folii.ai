'use client'
import type { Content } from '@/types/content'
export function ChatTab(_: {
  portfolioId: string; content: Content; onContentChange: (c: Content) => void
}) {
  return <div className="text-sm text-muted-foreground">Chat coming soon.</div>
}
