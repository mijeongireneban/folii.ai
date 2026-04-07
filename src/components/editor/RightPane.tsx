'use client'
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Content } from '@/types/content'
import { ChatTab } from './ChatTab'
import { WizardTab } from './WizardTab'
import { UsernameClaim } from './UsernameClaim'
import { PublishButton } from './PublishButton'

interface Props {
  portfolioId: string
  username: string | null
  content: Content
  published: boolean
  onContentChange: (c: Content) => void
  onUsernameChange: (u: string) => void
  onPublishedChange: (p: boolean) => void
}

export function RightPane(props: Props) {
  const isEmpty = !props.content.profile.name
  const [tab, setTab] = useState<'wizard' | 'chat'>(isEmpty ? 'wizard' : 'chat')

  return (
    <aside className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b p-3">
        <UsernameClaim
          portfolioId={props.portfolioId}
          username={props.username}
          onChange={props.onUsernameChange}
        />
        <PublishButton
          published={props.published}
          username={props.username}
          onChange={props.onPublishedChange}
        />
      </header>
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as 'wizard' | 'chat')}
        className="flex flex-1 flex-col"
      >
        <TabsList className="m-3 grid grid-cols-2">
          <TabsTrigger value="wizard">Wizard</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        <TabsContent value="wizard" className="flex-1 overflow-y-auto px-3 pb-3">
          <WizardTab
            portfolioId={props.portfolioId}
            content={props.content}
            onContentChange={props.onContentChange}
            onComplete={() => setTab('chat')}
          />
        </TabsContent>
        <TabsContent value="chat" className="flex-1 overflow-y-auto px-3 pb-3">
          <ChatTab
            portfolioId={props.portfolioId}
            content={props.content}
            onContentChange={props.onContentChange}
          />
        </TabsContent>
      </Tabs>
    </aside>
  )
}
