'use client'
import { useState } from 'react'
import type { Content } from '@/types/content'
import { PreviewPane } from './PreviewPane'
import { RightPane } from './RightPane'

interface Props {
  portfolioId: string
  initialUsername: string | null
  initialContent: Content
  initialPublished: boolean
}

export function EditorShell(props: Props) {
  const [content, setContent] = useState(props.initialContent)
  const [username, setUsername] = useState(props.initialUsername)
  const [published, setPublished] = useState(props.initialPublished)
  const [previewKey, setPreviewKey] = useState(0)

  const refreshPreview = () => setPreviewKey((k) => k + 1)

  return (
    <div className="grid h-screen grid-cols-[60%_40%]">
      <PreviewPane username={username} content={content} previewKey={previewKey} />
      <RightPane
        portfolioId={props.portfolioId}
        username={username}
        content={content}
        published={published}
        onContentChange={(c) => { setContent(c); refreshPreview() }}
        onUsernameChange={setUsername}
        onPublishedChange={setPublished}
      />
    </div>
  )
}
