/**
 * Emails a one-time code, but ONLY to the owner address. Any other address gets
 * the same `{ ok: true }` so the endpoint does not reveal who the owner is.
 */
const WINDOW_MS = 15 * 60 * 1000
const MAX = 5
const MAX_BODY_BYTES = 1024
const MIN_RESPONSE_MS = 1200

export default defineEventHandler(async (event) => {
  const started = Date.now()
  if (rateLimited(`send-code:${clientIp(event)}`, MAX, WINDOW_MS)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again later.' })
  }

  const owner = ownerEmailFromConfig()
  if (!owner) {
    throw createError({ statusCode: 500, statusMessage: 'Admin is not configured on this deploy' })
  }

  const body = await readJsonBodyLimited<{ email?: string }>(event, MAX_BODY_BYTES)
  const email = String(body?.email || '').trim().toLowerCase()
  if (email === owner) {
    try {
      await ensureOwnerAccount(owner)
      const { error } = await useSupabaseAnon().auth.signInWithOtp({
        email: owner,
        options: { shouldCreateUser: false },
      })
      if (error) throw error
    } catch (error: unknown) {
      // Keep the public response identical for matching and non-matching email
      // addresses. Deployment logs retain the actionable failure.
      console.error('[send-code]', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const jitter = Math.floor(Math.random() * 200)
  const remaining = MIN_RESPONSE_MS + jitter - (Date.now() - started)
  if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining))
  return { ok: true }
})
