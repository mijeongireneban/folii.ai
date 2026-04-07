import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ContentSchema } from '@/lib/schemas/content'
import { runChatTurn } from '@/lib/llm/chat'
import { openai } from '@/lib/llm/openai'
import { checkAndIncrement } from '@/lib/ratelimit'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const limit = await checkAndIncrement(user.id)
  if (!limit.ok) return NextResponse.json({ error: 'daily limit reached' }, { status: 429 })

  const body = await req.json().catch(() => ({}))
  const message = String(body.message ?? '').trim()
  if (!message) return NextResponse.json({ error: 'empty message' }, { status: 400 })

  const { data: portfolio } = await supabase
    .from('portfolios').select('id, username, content').eq('user_id', user.id).single()
  if (!portfolio) return NextResponse.json({ error: 'no portfolio' }, { status: 404 })

  const content = ContentSchema.parse(portfolio.content)
  const result = await runChatTurn({ llm: openai() as any, content, userMessage: message })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  await supabase.from('portfolios').update({ content: result.content }).eq('id', portfolio.id)
  await supabase.from('chat_messages').insert([
    { portfolio_id: portfolio.id, role: 'user', content: message },
    { portfolio_id: portfolio.id, role: 'assistant', content: result.summary },
  ])

  if (portfolio.username) revalidatePath(`/${portfolio.username}`)

  return NextResponse.json({ content: result.content, summary: result.summary })
}
