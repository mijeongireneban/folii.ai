import { createAdminClient } from '@/lib/supabase/admin'

// Fixed-window rate limiter backed by Postgres (see migration 0002).
// Keys are opaque strings — compose them with helpers below.

export type RateLimitBucket = {
  name: string
  max: number
  windowSeconds: number
}

// v1 buckets. Tune as we learn real usage.
export const BUCKETS = {
  chat:    { name: 'chat',    max: 30, windowSeconds: 60 },   // 30 msgs/min/user
  wizard:  { name: 'wizard',  max: 20, windowSeconds: 60 },   // 20 runs/min/user
  upload:  { name: 'upload',  max: 10, windowSeconds: 60 },   // 10 uploads/min/user
  publish: { name: 'publish', max: 5,  windowSeconds: 60 },   // 5 publishes/min/user
  ipChat:  { name: 'chat-ip', max: 60, windowSeconds: 60 },   // fallback per-IP
} as const satisfies Record<string, RateLimitBucket>

export function bucketKey(bucket: RateLimitBucket, subject: string): string {
  return `${bucket.name}:${subject}`
}

export type RateLimitResult = {
  ok: boolean
  bucket: RateLimitBucket
  key: string
}

// Returns { ok: true } if the request is allowed.
// Fail-open on DB errors (we'd rather serve than 500 the whole product on a
// rate-limit outage). If this ever gets abused we tighten it up.
export async function checkRateLimit(
  bucket: RateLimitBucket,
  subject: string
): Promise<RateLimitResult> {
  const key = bucketKey(bucket, subject)
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_max: bucket.max,
      p_window_seconds: bucket.windowSeconds,
    })
    if (error) {
      console.warn('[rate-limit] rpc error, failing open:', error.message)
      return { ok: true, bucket, key }
    }
    return { ok: data === true, bucket, key }
  } catch (err) {
    console.warn('[rate-limit] exception, failing open:', err)
    return { ok: true, bucket, key }
  }
}

// Helper for Next.js route handlers: returns a Response to hand back, or null
// if the request is allowed.
export function rateLimitResponse(result: RateLimitResult): Response | null {
  if (result.ok) return null
  return new Response(
    JSON.stringify({
      error: 'rate_limited',
      message: `Too many requests. Try again in ${result.bucket.windowSeconds}s.`,
    }),
    {
      status: 429,
      headers: {
        'content-type': 'application/json',
        'retry-after': String(result.bucket.windowSeconds),
      },
    }
  )
}
