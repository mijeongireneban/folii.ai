'use client'
import { Button } from '@/components/ui/button'
export function PublishButton(props: {
  published: boolean; username: string | null; onChange: (p: boolean) => void
}) {
  return <Button size="sm" disabled>{props.published ? 'Published' : 'Publish'}</Button>
}
