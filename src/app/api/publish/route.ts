import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ContentSchema } from '@/lib/schemas/content'
import { canPublish } from './canPublish'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const wantPublished: boolean = body.published !== false // default true

  const { data: portfolio } = await supabase
    .from('portfolios').select('id, username, content').eq('user_id', user.id).single()
  if (!portfolio) return NextResponse.json({ error: 'no portfolio' }, { status: 404 })

  const content = ContentSchema.parse(portfolio.content)
  if (wantPublished) {
    const gate = canPublish(content, portfolio.username)
    if (!gate.ok) return NextResponse.json({ error: 'incomplete', missing: gate.missing }, { status: 400 })
  }

  await supabase
    .from('portfolios')
    .update({ published: wantPublished })
    .eq('id', portfolio.id)

  if (portfolio.username) revalidatePath(`/${portfolio.username}`)

  return NextResponse.json({
    ok: true,
    published: wantPublished,
    url: portfolio.username && wantPublished
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/${portfolio.username}` : null,
  })
}
