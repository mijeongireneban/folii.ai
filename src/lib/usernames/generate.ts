// Username derivation from email local part.
// Rules:
//   - lowercase
//   - strip anything after '+' (gmail plus-addressing)
//   - replace '.', '_' runs with '-'
//   - keep only [a-z0-9-]
//   - collapse runs of '-' and trim leading/trailing '-'
//   - clamp to 3..30 chars (pad short with random suffix, truncate long)
//   - reject reserved names
//
// Pure function. Uniqueness-against-DB check happens at the call site.

const RESERVED = new Set([
  'admin',
  'api',
  'app',
  'auth',
  'editor',
  'login',
  'logout',
  'signup',
  'signin',
  'settings',
  'folii',
  'www',
  'root',
  'help',
  'support',
  'about',
  'terms',
  'privacy',
  'dashboard',
  'new',
  'me',
])

const MIN_LEN = 3
const MAX_LEN = 30

export function isReservedUsername(name: string): boolean {
  return RESERVED.has(name.toLowerCase())
}

export function baseUsernameFromEmail(email: string): string {
  const at = email.indexOf('@')
  const local = (at === -1 ? email : email.slice(0, at)).toLowerCase()
  const noPlus = local.split('+')[0] ?? ''
  const normalized = noPlus
    .replace(/[._]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized
}

function randomSuffix(len: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

export function generateUsernameFromEmail(email: string): string {
  let base = baseUsernameFromEmail(email)
  if (!base || base.length < MIN_LEN) {
    base = (base + randomSuffix(MIN_LEN - base.length + 2)).slice(0, MAX_LEN)
  }
  if (base.length > MAX_LEN) {
    base = base.slice(0, MAX_LEN).replace(/-+$/, '')
  }
  if (isReservedUsername(base)) {
    base = `${base}-${randomSuffix(4)}`.slice(0, MAX_LEN)
  }
  return base
}

// Given a base username and a list of existing usernames, produce a unique one
// by appending -2, -3, ... until a free slot is found.
export function resolveUniqueUsername(
  base: string,
  taken: ReadonlySet<string>
): string {
  if (!taken.has(base)) return base
  let n = 2
  while (true) {
    const candidate = `${base}-${n}`.slice(0, MAX_LEN)
    if (!taken.has(candidate)) return candidate
    n++
  }
}
