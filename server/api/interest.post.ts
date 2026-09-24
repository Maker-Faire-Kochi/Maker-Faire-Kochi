import { validateInterestInput } from '../../shared/interest/validate'
import type { InterestFormInput } from '../../shared/interest/types'

const WINDOW_MS = 15 * 60 * 1000
const MAX = 8
const MAX_BODY_BYTES = 64 * 1024

export default defineEventHandler(async (event) => {
  const length = Number(getRequestHeader(event, 'content-length') || 0)
  if (length > MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Submission too large' })
  }

  const body = await readBody<Partial<InterestFormInput>>(event)

  // Honeypot: answer like a success so a bot has nothing to adapt to.
  if (typeof body?.website === 'string' && body.website.trim()) {
    return { ok: true }
  }

  const ip = clientIp(event)
  const emailKey = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''
  if (
    rateLimited(`interest:ip:${ip}`, MAX, WINDOW_MS) ||
    (emailKey && rateLimited(`interest:email:${emailKey}`, MAX, WINDOW_MS))
  ) {
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
