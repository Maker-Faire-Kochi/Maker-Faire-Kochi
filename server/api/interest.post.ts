import { validateInterestInput } from '../../shared/interest/validate'
import type { InterestFormInput } from '../../shared/interest/types'

/** Simple in-memory rate limit (per server instance). Enough for v1. */
const hits = new Map<string, { count: number; reset: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX = 8

function rateLimited(key: string): boolean {
  const now = Date.now()
  const row = hits.get(key)
  if (!row || now > row.reset) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS })
    return false
  }
  row.count += 1
  return row.count > MAX
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<InterestFormInput>>(event)
  const ip =
    getRequestHeader(event, 'cf-connecting-ip') ||
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestIP(event) ||
    'unknown'

  const emailKey = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''
  if (rateLimited(`ip:${ip}`) || (emailKey && rateLimited(`email:${emailKey}`))) {
    throw createError({ statusCode: 429, statusMessage: 'Too many submissions. Try again later.' })
  }

  const result = validateInterestInput(body || {})
  if (!result.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: { errors: result.errors },
    })
  }

  const supabase = useSupabaseService()
  const { error } = await supabase.from('interest_responses').insert(result.data)

  if (error) {
    console.error('[interest] insert failed', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Could not save your response' })
  }

  return { ok: true }
})
