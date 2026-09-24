/**
 * Emails a one-time code, but ONLY to the owner address. Any other address gets
 * the same `{ ok: true }` so the endpoint does not reveal who the owner is.
 */
const WINDOW_MS = 15 * 60 * 1000
const MAX = 5

export default defineEventHandler(async (event) => {
  if (rateLimited(`send-code:${clientIp(event)}`, MAX, WINDOW_MS)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again later.' })
  }

  const owner = ownerEmailFromConfig()
  if (!owner) {
    throw createError({ statusCode: 500, statusMessage: 'Admin is not configured on this deploy' })
  }

  const body = await readBody<{ email?: string }>(event)
  const email = String(body?.email || '').trim().toLowerCase()
  if (email !== owner) return { ok: true }

  await ensureOwnerAccount(owner)

  const { error } = await useSupabaseAnon().auth.signInWithOtp({
    email: owner,
    options: { shouldCreateUser: false },
  })
  if (error) {
    console.error('[send-code]', error.message)
    throw createError({ statusCode: 502, statusMessage: 'Could not send the code. Try again shortly.' })
  }
  return { ok: true }
})
