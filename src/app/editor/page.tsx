import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { contentSchema, type Content } from '@/lib/content/schema'
import type { ChatMessage } from '@/lib/supabase/types'
import { EditorClient } from './EditorClient'

export const dynamic = 'force-dynamic'

export default async function EditorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/editor')

  const admin = createAdminClient()

  const [siteRes, profileRes] = await Promise.all([
    admin
      .from('sites')
      .select('id, content, published, published_at')
      .eq('owner_id', user.id)
      .maybeSingle(),
    admin.from('profiles').select('username').eq('id', user.id).single(),
  ])

  let initialContent: Content | null = null
  let messages: ChatMessage[] = []
  if (siteRes.data) {
    const parsed = contentSchema.safeParse(siteRes.data.content)
    if (parsed.success) initialContent = parsed.data
    const { data: msgs } = await admin
      .from('chat_messages')
      .select('id, site_id, role, content, content_after, created_at')
      .eq('site_id', siteRes.data.id)
      .order('created_at', { ascending: true })
      .limit(200)
    messages = (msgs ?? []) as ChatMessage[]
  }

  return (
    <EditorClient
      initialContent={initialContent}
      initialMessages={messages}
      initialPublished={siteRes.data?.published ?? false}
      username={profileRes.data?.username ?? ''}
    />
  )
}
