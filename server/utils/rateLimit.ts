import type { H3Event } from 'h3'

/** Per-instance, in-memory. Enough for v1; a serverless cold start resets it. */
const buckets = new Map<string, { count: number; reset: number }>()
const PRUNE_AT = 5000

export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  if (buckets.size > PRUNE_AT) {
    for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k)
  }
  const row = buckets.get(key)
  if (!row || now > row.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return false
  }
  row.count += 1
  return row.count > max
}

/**
 * Client IP from headers the HOST sets and overwrites (Netlify, Cloudflare,
 * Vercel). `x-forwarded-for` is deliberately not read: its first entry is
 * whatever the client sent, so trusting it lets anyone reset their own limit.
 */
export function clientIp(event: H3Event): string {
  return (
    getRequestHeader(event, 'x-nf-client-connection-ip') ||
    getRequestHeader(event, 'cf-connecting-ip') ||
    getRequestHeader(event, 'x-real-ip') ||
    getRequestIP(event) ||
    'unknown'
  )
}
