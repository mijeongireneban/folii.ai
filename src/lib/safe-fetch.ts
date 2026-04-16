import { promises as dns } from 'node:dns'
import net from 'node:net'

// SSRF-safe fetch helper for user-supplied URLs.
//
// Guards:
// 1. Only http(s) schemes are allowed.
// 2. The hostname is DNS-resolved; any record that lands in a private,
//    loopback, link-local, or reserved IP range is rejected.
// 3. Redirects are followed manually with re-validation at every hop
//    (default fetch follows 3xx silently, which bypasses host checks).
// 4. The response body is streamed with a byte cap so a hostile server
//    can't exhaust memory.
//
// There is a residual DNS-rebinding TOCTOU window between the check and
// the actual socket connect. Acceptable for v1 — our threat is a logged-in
// user probing internal services, not a sophisticated attacker.

export function isBlockedIp(ip: string): boolean {
  const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
  if (v4) {
    const a = Number(v4[1])
    const b = Number(v4[2])
    if (a === 0) return true                                // 0.0.0.0/8
    if (a === 10) return true                               // 10.0.0.0/8 private
    if (a === 127) return true                              // 127.0.0.0/8 loopback
    if (a === 169 && b === 254) return true                 // 169.254.0.0/16 link-local (incl. 169.254.169.254 metadata)
    if (a === 172 && b >= 16 && b <= 31) return true        // 172.16.0.0/12 private
    if (a === 192 && b === 168) return true                 // 192.168.0.0/16 private
    if (a === 100 && b >= 64 && b <= 127) return true       // 100.64.0.0/10 CGNAT
    if (a === 198 && (b === 18 || b === 19)) return true    // 198.18.0.0/15 benchmarking
    if (a >= 224) return true                               // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved/broadcast
    return false
  }
  const v6 = ip.toLowerCase()
  if (v6 === '::' || v6 === '::1') return true
  if (v6.startsWith('fe80:') || v6.startsWith('fe8') || v6.startsWith('fe9') || v6.startsWith('fea') || v6.startsWith('feb')) return true // fe80::/10 link-local
  if (v6.startsWith('fc') || v6.startsWith('fd')) return true // fc00::/7 unique local
  if (v6.startsWith('ff')) return true                        // ff00::/8 multicast
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isBlockedIp(mapped[1])
  return false
}

async function assertPublicUrl(urlStr: string): Promise<URL> {
  let u: URL
  try {
    u = new URL(urlStr)
  } catch {
    throw new Error('Invalid URL')
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('Only http(s) URLs are supported')
  }
  const host = u.hostname.replace(/^\[|\]$/g, '')
  if (net.isIP(host)) {
    if (isBlockedIp(host)) throw new Error('URL targets a private network')
    return u
  }
  const addresses = await dns.lookup(host, { all: true })
  if (addresses.length === 0) throw new Error('Hostname did not resolve')
  for (const a of addresses) {
    if (isBlockedIp(a.address)) throw new Error('URL targets a private network')
  }
  return u
}

async function readBodyWithLimit(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return await res.text()
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        total += value.byteLength
        if (total > maxBytes) {
          await reader.cancel().catch(() => {})
          throw new Error('Response too large')
        }
        chunks.push(value)
      }
    }
  } finally {
    reader.releaseLock?.()
  }
  const buf = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    buf.set(c, offset)
    offset += c.byteLength
  }
  return new TextDecoder('utf-8').decode(buf)
}

export type SafeFetchOptions = {
  timeoutMs?: number
  maxBytes?: number
  maxRedirects?: number
  headers?: Record<string, string>
}

export type SafeFetchResult = {
  ok: boolean
  status: number
  body: string
  finalUrl: string
}

export async function safeFetchText(
  urlStr: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResult> {
  const timeoutMs = options.timeoutMs ?? 15_000
  const maxBytes = options.maxBytes ?? 5 * 1024 * 1024
  const maxRedirects = options.maxRedirects ?? 5

  let current = await assertPublicUrl(urlStr)

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const res = await fetch(current.toString(), {
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'manual',
      headers: options.headers,
    })

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location')
      if (!loc) {
        return {
          ok: false,
          status: res.status,
          body: '',
          finalUrl: current.toString(),
        }
      }
      if (hop === maxRedirects) throw new Error('Too many redirects')
      let next: URL
      try {
        next = new URL(loc, current)
      } catch {
        throw new Error('Invalid redirect target')
      }
      current = await assertPublicUrl(next.toString())
      continue
    }

    const body = res.ok ? await readBodyWithLimit(res, maxBytes) : ''
    return {
      ok: res.ok,
      status: res.status,
      body,
      finalUrl: current.toString(),
    }
  }

  throw new Error('Too many redirects')
}
