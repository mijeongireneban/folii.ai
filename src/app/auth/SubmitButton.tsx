'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

// Shared submit button for auth server-action forms. Uses useFormStatus to
// show a pending spinner and disable double-submits without needing each
// page to become a client component.
export function SubmitButton({
  children,
  pendingLabel,
  style,
}: {
  children: ReactNode
  pendingLabel?: string
  style?: CSSProperties
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        ...style,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: pending ? 0.7 : 1,
        cursor: pending ? 'wait' : style?.cursor ?? 'pointer',
      }}
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  )
}
