'use client'

import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export type ConfirmRequest = {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void | Promise<void>
}

const dialogStyle: React.CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 14,
  color: '#fff',
  fontFamily: "'Inter Variable', -apple-system, system-ui, sans-serif",
}

const titleStyle: React.CSSProperties = {
  fontFamily: "'Cabinet Grotesk', 'Inter Variable', sans-serif",
  fontWeight: 500,
  fontSize: 22,
  letterSpacing: '-0.6px',
  color: '#fff',
}

const descriptionStyle: React.CSSProperties = {
  color: '#a6a6a6',
  fontSize: 14,
  lineHeight: 1.5,
}

const pillBase: React.CSSProperties = {
  borderRadius: 100,
  padding: '8px 18px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  lineHeight: 1,
}

const cancelStyle: React.CSSProperties = {
  ...pillBase,
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.18)',
  color: '#fff',
}

const confirmStyle = (destructive?: boolean): React.CSSProperties => ({
  ...pillBase,
  background: destructive ? '#ff4d4f' : '#0099ff',
  border: 'none',
  color: '#fff',
})

export function ConfirmDialog({
  request,
  onOpenChange,
}: {
  request: ConfirmRequest | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <AlertDialog open={request !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent style={dialogStyle}>
        <AlertDialogHeader>
          <AlertDialogTitle style={titleStyle}>{request?.title}</AlertDialogTitle>
          <AlertDialogDescription style={descriptionStyle}>
            {request?.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogPrimitive.Cancel style={cancelStyle}>
            {request?.cancelLabel ?? 'Cancel'}
          </AlertDialogPrimitive.Cancel>
          <AlertDialogPrimitive.Action
            style={confirmStyle(request?.destructive)}
            onClick={async (e) => {
              e.preventDefault()
              await request?.onConfirm()
              onOpenChange(false)
            }}
          >
            {request?.confirmLabel ?? 'Continue'}
          </AlertDialogPrimitive.Action>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
