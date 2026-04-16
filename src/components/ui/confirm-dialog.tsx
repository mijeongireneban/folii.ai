'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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

export function ConfirmDialog({
  request,
  onOpenChange,
}: {
  request: ConfirmRequest | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <AlertDialog open={request !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{request?.title}</AlertDialogTitle>
          <AlertDialogDescription>{request?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{request?.cancelLabel ?? 'Cancel'}</AlertDialogCancel>
          <AlertDialogAction
            variant={request?.destructive ? 'destructive' : 'default'}
            onClick={async (e) => {
              e.preventDefault()
              await request?.onConfirm()
              onOpenChange(false)
            }}
          >
            {request?.confirmLabel ?? 'Continue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
