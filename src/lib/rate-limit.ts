import { createAdminClient } from '@/lib/supabase/admin'

// Fixed-window rate limiter backed by Postgres (see migration 0002 + 0005).
// Keys are opaque strings — compose them with helpers below.

export type RateLimitBucket = {
  name: string
  max: number
  windowSeconds: number
}

// v1 buckets. Tune as we learn real usage.
export const BUCKETS = {
  chat:        { name: 'chat',        max: 30, windowSeconds: 60 },       // 30 msgs/min/user
  chatDaily:   { name: 'chat-day',    max: 50, windowSeconds: 86400 },    // 50 msgs/day/user
  wizard:      { name: 'wizard',      max: 20, windowSeconds: 60 },       // 20 runs/min/user
  wizardDaily: { name: 'wizard-day',  max: 10, windowSeconds: 86400 },    // 10 parses/day/user
  upload:      { name: 'upload',      max: 10, windowSeconds: 60 },       // 10 uploads/min/user
  publish:     { name: 'publish',     max: 5,  windowSeconds: 60 },       // 5 publishes/min/user
  ipChat:      { name: 'chat-ip',     max: 60, windowSeconds: 60 },       // fallback per-IP
} as const satisfies Record<string, RateLimitBucket>

export function bucketKey(bucket: RateLimitBucket, subject: string): string {
  return `${bucket.name}:${subject}`
}

export type RateLimitResult = {
  ok: boolean
  bucket: RateLimitBucket
  key: string
  remaining?: number
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
    const { data, error } = await supabase.rpc('check_rate_limit_ex', {
      p_key: key,
      p_max: bucket.max,
      p_window_seconds: bucket.windowSeconds,
    })
    if (error) {
      console.warn('[rate-limit] rpc error, failing open:', error.message)
      return { ok: true, bucket, key }
    }
    const row = data?.[0] ?? data
    const allowed = row?.allowed ?? true
    const count = row?.current_count ?? 0
    return {
      ok: allowed,
      bucket,
      key,
      remaining: Math.max(0, bucket.max - count),
    }
  } catch (err) {
    console.warn('[rate-limit] exception, failing open:', err)
    return { ok: true, bucket, key }
  }
}

// Helper for Next.js route handlers: returns a Response to hand back, or null
// if the request is allowed.
export function rateLimitResponse(result: RateLimitResult): Response | null {
  if (result.ok) return null
  const isDaily = result.bucket.windowSeconds >= 86400
  const message = isDaily
    ? `You've reached your daily limit of ${result.bucket.max} messages. Resets in 24 hours.`
    : `Too many requests. Try again in ${result.bucket.windowSeconds}s.`
  return new Response(
    JSON.stringify({
      error: 'rate_limited',
      daily: isDaily,
      message,
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
