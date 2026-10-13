import { validateVolunteerInput } from '../../shared/volunteer/validate'
import {
  GOOGLE_FORM_ACTION,
  toGoogleFormBody,
  type GoogleVolunteerPayload as VolunteerRow,
} from '../../shared/volunteer/googleForm'
import type { VolunteerFormInput } from '../../shared/volunteer/types'
import { sendMail, volunteerReceivedMail } from '../utils/mailer'

const WINDOW_MS = 15 * 60 * 1000
const MAX = 8
const MAX_BODY_BYTES = 64 * 1024

async function forwardToGoogle(row: VolunteerRow): Promise<boolean> {
  try {
    const res = await fetch(GOOGLE_FORM_ACTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Google sometimes soft-blocks bare server UAs.
        'User-Agent':
          'Mozilla/5.0 (compatible; MakerFaireKochi/1.0; +https://makerfaire.in/volunteer)',
      },
      body: toGoogleFormBody(row),
      redirect: 'manual',
    })
    // Success is usually 200 or a 302 to the form's thank-you view.
    if (res.status >= 400) {
      console.error('[volunteer] Google Form rejected', res.status)
      return false
    }
    return true
  } catch (err) {
    console.error('[volunteer] Google Form fetch failed', err)
    return false
  }
}

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

  const row = result.data as unknown as VolunteerRow
  const googleOk = await forwardToGoogle(row)

  // Both stores are written; the submission counts if either one holds it.
  let rowId: string | null = null
  try {
    const supabase = useSupabaseService()
    const { data, error } = await supabase
      .from('volunteer_responses')
      .insert({ ...row, google_forwarded: googleOk })
      .select('id')
      .single()
    if (error) console.error('[volunteer] insert failed', error.message)
    else rowId = data.id as string
  } catch (err) {
    console.error('[volunteer] Supabase unavailable', err)
  }

  if (!googleOk && !rowId) {
    throw createError({ statusCode: 502, statusMessage: 'Could not save your response' })
  }

  const mail = volunteerReceivedMail(row.name)
  const sent = await sendMail({ to: row.email, ...mail })
  if (sent && rowId) {
    const { error } = await useSupabaseService()
      .from('volunteer_responses')
      .update({ confirmation_sent: true })
      .eq('id', rowId)
    if (error) console.error('[volunteer] could not mark confirmation', error.message)
  }

  return { ok: true }
})
