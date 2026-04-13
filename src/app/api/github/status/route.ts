import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/github/status — check if user has connected GitHub
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data } = await admin
    .from('integrations')
    .select('provider_username, provider_avatar')
    .eq('owner_id', user.id)
    .eq('provider', 'github')
    .maybeSingle()

  if (!data) {
    return NextResponse.json({ connected: false })
  }

  return NextResponse.json({
    connected: true,
    username: data.provider_username,
    avatar: data.provider_avatar,
  })
}

// DELETE /api/github/status — disconnect GitHub
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const admin = createAdminClient()
  await admin
    .from('integrations')
    .delete()
    .eq('owner_id', user.id)
    .eq('provider', 'github')

  return NextResponse.json({ ok: true })
}
