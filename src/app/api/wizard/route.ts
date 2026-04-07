import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ContentSchema } from '@/lib/schemas/content'
import { WIZARD_STEPS, type WizardStep } from '@/lib/schemas/wizard'
import { runWizardStep } from '@/lib/llm/wizard'
import { openai } from '@/lib/llm/openai'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const step = body.step as WizardStep
  const message = String(body.message ?? '').trim()
  if (!WIZARD_STEPS.includes(step)) return NextResponse.json({ error: 'bad step' }, { status: 400 })
  if (!message) return NextResponse.json({ error: 'empty message' }, { status: 400 })

  const { data: portfolio } = await supabase
    .from('portfolios').select('id, username, content').eq('user_id', user.id).single()
  if (!portfolio) return NextResponse.json({ error: 'no portfolio' }, { status: 404 })

  const content = ContentSchema.parse(portfolio.content)
  const result = await runWizardStep({ llm: openai() as any, step, userMessage: message, content })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  await supabase.from('portfolios').update({ content: result.content }).eq('id', portfolio.id)
  if (portfolio.username) revalidatePath(`/${portfolio.username}`)

  return NextResponse.json({ content: result.content })
}
