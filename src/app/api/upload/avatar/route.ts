import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { contentSchema } from '@/lib/content/schema'
import { BUCKETS, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

const BUCKET = 'project-images'
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
])

// POST multipart/form-data:
//   file: the image
// Writes the image to project-images/<user>/<site>-avatar-<ts>.<ext>,
// updates sites.content.avatar with the public URL, and returns the
// updated content.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const rl = await checkRateLimit(BUCKETS.upload, user.id)
  if (!rl.ok) return rateLimitResponse(rl)!

  const form = await request.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'invalid_form' }, { status: 400 })
  }
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'no_file' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 413 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'unsupported_type', detail: file.type },
      { status: 415 }
    )
  }

  const admin = createAdminClient()

  const { data: site, error: siteErr } = await admin
    .from('sites')
    .select('id, content')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (siteErr || !site) {
    return NextResponse.json({ error: 'no_site' }, { status: 404 })
  }
  const currentParse = contentSchema.safeParse(site.content)
  if (!currentParse.success) {
    return NextResponse.json(
      { error: 'corrupt_content', detail: currentParse.error.message },
      { status: 500 }
    )
  }
  const current = currentParse.data

  const ext =
    file.type === 'image/png'
      ? 'png'
      : file.type === 'image/webp'
        ? 'webp'
        : 'jpg'
  const path = `${user.id}/${site.id}-avatar-${Date.now()}.${ext}`
  const bytes = new Uint8Array(await file.arrayBuffer())

  const { error: uploadErr } = await admin.storage
    .from(BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    })
  if (uploadErr) {
    return NextResponse.json(
      { error: 'upload_failed', detail: uploadErr.message },
      { status: 500 }
    )
  }

  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(path)
  const publicUrl = urlData.publicUrl

  const nextContent = { ...current, avatar: publicUrl }
  const nextParse = contentSchema.safeParse(nextContent)
  if (!nextParse.success) {
    return NextResponse.json(
      { error: 'invalid_content', detail: nextParse.error.message },
      { status: 500 }
    )
  }

  const { error: updateErr } = await admin
    .from('sites')
    .update({ content: nextParse.data })
    .eq('id', site.id)
  if (updateErr) {
    return NextResponse.json(
      { error: 'db_error', detail: updateErr.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, content: nextParse.data, url: publicUrl })
}
