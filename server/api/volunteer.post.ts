import { validateVolunteerInput } from '../../shared/volunteer/validate'
import { GOOGLE_FORM_ACTION, toGoogleFormBody } from '../../shared/volunteer/googleForm'
import type { VolunteerFormInput } from '../../shared/volunteer/types'

const WINDOW_MS = 15 * 60 * 1000
const MAX = 8
const MAX_BODY_BYTES = 64 * 1024

export default defineEventHandler(async (event) => {
  const body = await readJsonBodyLimited<Partial<VolunteerFormInput>>(event, MAX_BODY_BYTES)

  // Honeypot: answer like a success so a bot has nothing to adapt to.
  if (typeof body?.website === 'string' && body.website.trim()) {
    return { ok: true }
  }

  const ip = clientIp(event)
  const emailKey = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''
  if (
    rateLimited(`volunteer:ip:${ip}`, MAX, WINDOW_MS) ||
    (emailKey && rateLimited(`volunteer:email:${emailKey}`, MAX, WINDOW_MS))
  ) {
    throw createError({ statusCode: 429, statusMessage: 'Too many submissions. Try again later.' })
  }

  const result = validateVolunteerInput(body || {})
  if (!result.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: { errors: result.errors },
    })
  }

  const formBody = toGoogleFormBody({
    name: result.data.name as string,
    email: result.data.email as string,
    phone: result.data.phone as string,
    domains: result.data.domains as string[],
    portfolio_url: (result.data.portfolio_url as string | null) ?? null,
    location: (result.data.location as string | null) ?? null,
    occupation: (result.data.occupation as string | null) ?? null,
    hours_per_week: result.data.hours_per_week as string,
  })

  let res: Response
  try {
    res = await fetch(GOOGLE_FORM_ACTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Google sometimes soft-blocks bare server UAs.
        'User-Agent':
          'Mozilla/5.0 (compatible; MakerFaireKochi/1.0; +https://makerfaire.in/volunteer)',
      },
      body: formBody,
      redirect: 'manual',
    })
  } catch (err) {
    console.error('[volunteer] Google Form fetch failed', err)
    throw createError({ statusCode: 502, statusMessage: 'Could not reach the volunteer form' })
  }

  // Success is usually 200 or a 302 to the form's thank-you view.
  if (res.status >= 400) {
    console.error('[volunteer] Google Form rejected', res.status)
    throw createError({ statusCode: 502, statusMessage: 'Could not save your response' })
  }

  return { ok: true }
})
