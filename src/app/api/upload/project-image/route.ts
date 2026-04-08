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
  'image/gif',
])

// POST multipart/form-data:
//   file: the image
//   projectIndex: integer — which projects[] entry to attach it to
// Writes the image to project-images/<user>/<site>-<index>-<ts>.<ext>,
// updates sites.content.projects[index].screenshot with the public URL,
// and returns the updated content.
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
  const projectIndexRaw = form.get('projectIndex')
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
  const projectIndex = Number.parseInt(String(projectIndexRaw ?? ''), 10)
  if (!Number.isInteger(projectIndex) || projectIndex < 0) {
    return NextResponse.json({ error: 'invalid_project_index' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Load site
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
  if (projectIndex >= current.projects.length) {
    return NextResponse.json({ error: 'project_index_out_of_range' }, { status: 400 })
  }

  // Upload to storage
  const ext =
    file.type === 'image/png'
      ? 'png'
      : file.type === 'image/webp'
        ? 'webp'
        : file.type === 'image/gif'
          ? 'gif'
          : 'jpg'
  const path = `${user.id}/${site.id}-${projectIndex}-${Date.now()}.${ext}`
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

  // Update the project entry with the new screenshot URL.
  const nextProjects = current.projects.map((p, i) =>
    i === projectIndex ? { ...p, screenshot: publicUrl } : p
  )
  const nextContent = { ...current, projects: nextProjects }
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
