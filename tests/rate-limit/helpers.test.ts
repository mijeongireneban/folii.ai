import { describe, expect, it } from 'vitest'
import { BUCKETS, bucketKey, rateLimitResponse } from '@/lib/rate-limit'

describe('bucketKey', () => {
  it('namespaces the subject under the bucket name', () => {
    expect(bucketKey(BUCKETS.chat, 'user-123')).toBe('chat:user-123')
    expect(bucketKey(BUCKETS.upload, '10.0.0.1')).toBe('upload:10.0.0.1')
  })
})

describe('BUCKETS', () => {
  it('defines chat/wizard/upload/publish/ipChat with sane limits', () => {
    expect(BUCKETS.chat.max).toBeGreaterThan(0)
    expect(BUCKETS.chat.windowSeconds).toBe(60)
    expect(BUCKETS.publish.max).toBeLessThan(BUCKETS.chat.max)
  })
})

describe('rateLimitResponse', () => {
  it('returns null when the request is allowed', () => {
    const res = rateLimitResponse({
      ok: true,
      bucket: BUCKETS.chat,
      key: 'chat:x',
    })
    expect(res).toBeNull()
  })

  it('returns a 429 with retry-after when blocked', async () => {
    const res = rateLimitResponse({
      ok: false,
      bucket: BUCKETS.chat,
      key: 'chat:x',
    })
    expect(res).not.toBeNull()
    expect(res!.status).toBe(429)
    expect(res!.headers.get('retry-after')).toBe('60')
    const body = await res!.json()
    expect(body.error).toBe('rate_limited')
  })
})
