import { requireUser } from '@/lib/auth/getUser'
import { createClient } from '@/lib/supabase/server'
import { emptyContent, ContentSchema } from '@/lib/schemas/content'
import { EditorShell } from '@/components/editor/EditorShell'

export default async function EditPage() {
  const user = await requireUser()
  const supabase = await createClient()
  let { data: portfolio } = await supabase
    .from('portfolios')
    .select('id, username, content, published')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!portfolio) {
    const { data: created } = await supabase
      .from('portfolios')
      .insert({ user_id: user.id, content: emptyContent() })
      .select('id, username, content, published')
      .single()
    portfolio = created!
  }

  const content = ContentSchema.parse(portfolio.content)
  return (
    <EditorShell
      portfolioId={portfolio.id}
      initialUsername={portfolio.username}
      initialContent={content}
      initialPublished={portfolio.published}
    />
  )
}
