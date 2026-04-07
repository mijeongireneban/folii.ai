import type { Content } from '@/types/content'

export type PublishGate =
  | { ok: true }
  | { ok: false; missing: string[] }

export function canPublish(content: Content, username: string | null): PublishGate {
  const missing: string[] = []
  if (!username) missing.push('username')
  if (!content.profile.name) missing.push('profile.name')
  if (!content.profile.title) missing.push('profile.title')
  if (!content.profile.bio) missing.push('profile.bio')
  return missing.length === 0 ? { ok: true } : { ok: false, missing }
}
