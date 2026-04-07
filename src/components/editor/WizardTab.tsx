'use client'
import type { Content } from '@/types/content'
export function WizardTab(_: {
  portfolioId: string; content: Content; onContentChange: (c: Content) => void; onComplete: () => void
}) {
  return <div className="text-sm text-muted-foreground">Wizard coming soon.</div>
}
