import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'file too large (max 5MB)' }, { status: 400 })
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
    return NextResponse.json({ error: 'unsupported file type' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`
  const { error: upErr } = await supabase.storage.from('assets').upload(path, file, {
    contentType: file.type, upsert: false,
  })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  const { data: pub } = supabase.storage.from('assets').getPublicUrl(path)
  await supabase.from('assets').insert({ user_id: user.id, url: pub.publicUrl, kind: 'upload' })

  return NextResponse.json({ url: pub.publicUrl })
}
