import { describe, expect, it } from 'vitest'
import { isBlockedIp } from '@/lib/safe-fetch'

describe('isBlockedIp', () => {
  it('blocks IPv4 loopback, private, link-local, CGNAT, and multicast', () => {
    expect(isBlockedIp('127.0.0.1')).toBe(true)
    expect(isBlockedIp('10.0.0.1')).toBe(true)
    expect(isBlockedIp('172.16.0.1')).toBe(true)
    expect(isBlockedIp('172.31.255.255')).toBe(true)
    expect(isBlockedIp('192.168.1.1')).toBe(true)
    expect(isBlockedIp('169.254.169.254')).toBe(true) // AWS/GCP metadata
    expect(isBlockedIp('100.64.0.1')).toBe(true)      // CGNAT
    expect(isBlockedIp('224.0.0.1')).toBe(true)
    expect(isBlockedIp('255.255.255.255')).toBe(true)
    expect(isBlockedIp('0.0.0.0')).toBe(true)
  })

  it('allows IPv4 public addresses', () => {
    expect(isBlockedIp('1.1.1.1')).toBe(false)
    expect(isBlockedIp('8.8.8.8')).toBe(false)
    expect(isBlockedIp('172.15.0.1')).toBe(false) // just below 172.16/12
    expect(isBlockedIp('172.32.0.1')).toBe(false) // just above 172.16/12
  })

  it('blocks IPv6 loopback, link-local, unique-local, multicast', () => {
    expect(isBlockedIp('::1')).toBe(true)
    expect(isBlockedIp('::')).toBe(true)
    expect(isBlockedIp('fe80::1')).toBe(true)
    expect(isBlockedIp('fc00::1')).toBe(true)
    expect(isBlockedIp('fd12:3456::1')).toBe(true)
    expect(isBlockedIp('ff02::1')).toBe(true)
  })

  it('blocks IPv4-mapped IPv6 addresses targeting private space', () => {
    expect(isBlockedIp('::ffff:127.0.0.1')).toBe(true)
    expect(isBlockedIp('::ffff:169.254.169.254')).toBe(true)
  })

  it('allows public IPv6 addresses', () => {
    expect(isBlockedIp('2001:4860:4860::8888')).toBe(false)
    expect(isBlockedIp('2606:4700:4700::1111')).toBe(false)
  })
})
