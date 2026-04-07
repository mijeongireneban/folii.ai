import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateUsername } from '@/lib/usernames/validate'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const username = String(body.username ?? '').trim().toLowerCase()
  const v = validateUsername(username)
  if (!v.ok) return NextResponse.json({ error: v.reason }, { status: 400 })

  // Check availability (excluding self)
  const { data: existing } = await supabase
    .from('portfolios')
    .select('user_id')
    .eq('username', username)
    .maybeSingle()
  if (existing && existing.user_id !== user.id) {
    return NextResponse.json({ error: 'taken' }, { status: 409 })
  }

  const { error } = await supabase
    .from('portfolios')
    .update({ username })
    .eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, username })
}
