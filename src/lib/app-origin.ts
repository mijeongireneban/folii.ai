import type { NextRequest } from 'next/server'

// Returns the origin (scheme + host) the user actually hit. Prefer this over
// NEXT_PUBLIC_APP_URL for OAuth redirects so preview/production/dev all work
// without per-environment env vars, and so the redirect_uri always matches the
// host registered in the OAuth app for the current domain.
export function getAppOrigin(request: NextRequest): string {
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (forwardedHost) {
    const proto = forwardedProto ?? (forwardedHost.startsWith('localhost') ? 'http' : 'https')
    return `${proto}://${forwardedHost}`
  }
  return request.nextUrl.origin
}
