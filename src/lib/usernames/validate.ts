import { RESERVED_USERNAMES } from './reserved'

const RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/

export type UsernameValidation =
  | { ok: true }
  | { ok: false; reason: string }

export function validateUsername(input: string): UsernameValidation {
  if (input.length < 3) return { ok: false, reason: 'too short (min 3)' }
  if (input.length > 30) return { ok: false, reason: 'too long (max 30)' }
  if (!RE.test(input)) return { ok: false, reason: 'use lowercase letters, digits, hyphens (no leading/trailing hyphen)' }
  if (RESERVED_USERNAMES.has(input)) return { ok: false, reason: 'reserved' }
  return { ok: true }
}
