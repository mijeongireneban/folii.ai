// Shared username slug validator used by both client and server.
// Rules:
//   - lowercase, [a-z0-9-]
//   - 3..30 chars
//   - must not start or end with hyphen
//   - reserved words blocked

export const USERNAME_MIN = 3
export const USERNAME_MAX = 30

// Must match the DB check constraint on profiles.username:
//   ^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$
export const USERNAME_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/

export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  'api',
  'editor',
  'login',
  'logout',
  'signup',
  'signin',
  'auth',
  'admin',
  'www',
  'app',
  'dashboard',
  'settings',
  'account',
  'about',
  'help',
  'support',
  'terms',
  'privacy',
  'home',
  'new',
  'edit',
  'folii',
  'root',
  'me',
])

export type SlugError =
  | 'empty'
  | 'too_short'
  | 'too_long'
  | 'invalid_chars'
  | 'leading_hyphen'
  | 'trailing_hyphen'
  | 'reserved'

export const SLUG_ERROR_MESSAGE: Record<SlugError, string> = {
  empty: 'Username is required.',
  too_short: `Must be at least ${USERNAME_MIN} characters.`,
  too_long: `Must be at most ${USERNAME_MAX} characters.`,
  invalid_chars: 'Only lowercase letters, numbers, and hyphens allowed.',
  leading_hyphen: 'Cannot start with a hyphen.',
  trailing_hyphen: 'Cannot end with a hyphen.',
  reserved: 'This username is reserved.',
}

/**
 * Validate a slug string. Returns null if valid, otherwise an error code.
 * Does NOT check DB uniqueness — that's the caller's job.
 */
export function validateSlug(slug: string): SlugError | null {
  if (!slug) return 'empty'
  if (slug.length < USERNAME_MIN) return 'too_short'
  if (slug.length > USERNAME_MAX) return 'too_long'
  if (slug.startsWith('-')) return 'leading_hyphen'
  if (slug.endsWith('-')) return 'trailing_hyphen'
  if (!USERNAME_REGEX.test(slug)) return 'invalid_chars'
  if (RESERVED_USERNAMES.has(slug.toLowerCase())) return 'reserved'
  return null
}

export function slugErrorMessage(err: SlugError): string {
  return SLUG_ERROR_MESSAGE[err]
}
