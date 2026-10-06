import { MEDIA_DOMAINS, MEDIA_HOURS, MEDIA_OCCUPATIONS } from './constants'
import type { VolunteerFormInput } from './types'

const domainSet = new Set(MEDIA_DOMAINS.map((o) => o.value))
const occupationSet = new Set(MEDIA_OCCUPATIONS.map((o) => o.value))
const hoursSet = new Set(MEDIA_HOURS.map((o) => o.value))

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Allow http(s) URLs, or bare domains people paste without a scheme. */
const urlLooseRe = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[\w\-./?%&=+#]*)?$/i

/** Character caps. The DB carries matching CHECK constraints. */
export const MAX_LEN = {
  name: 120,
  email: 254,
  phone: 32,
  portfolio: 500,
  location: 200,
} as const

export type ValidateResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; errors: string[] }

function trim(s: unknown): string {
  return typeof s === 'string' ? s.trim() : ''
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return [...new Set(v.filter((x): x is string => typeof x === 'string'))]
}

/** Shared client + server validation. Returns DB-shaped row fields on success. */
export function validateVolunteerInput(raw: Partial<VolunteerFormInput>): ValidateResult {
  const errors: string[] = []

  if (trim(raw.website)) {
    return { ok: false, errors: ['Rejected'] }
  }

  const name = trim(raw.name)
  const email = trim(raw.email).toLowerCase()
  const phone = trim(raw.phone)
  const domains = asStringArray(raw.domains)
  const portfolioUrl = trim(raw.portfolioUrl) || null
  const location = trim(raw.location) || null
  const occupation = trim(raw.occupation) || null
  const hoursPerWeek = trim(raw.hoursPerWeek)

  if (!name || name.length > MAX_LEN.name) errors.push('Enter your full name')
  if (!email || email.length > MAX_LEN.email || !emailRe.test(email)) {
    errors.push('Enter a valid email')
  }
  if (!phone || phone.length > MAX_LEN.phone) {
    errors.push('Enter a WhatsApp phone number')
  }
  if (!domains.length || domains.some((d) => !domainSet.has(d as never))) {
    errors.push('Pick at least one domain')
  }
  if (portfolioUrl) {
    if (portfolioUrl.length > MAX_LEN.portfolio || !urlLooseRe.test(portfolioUrl)) {
      errors.push('Enter a valid portfolio link')
    }
  }
  if (location && location.length > MAX_LEN.location) {
    errors.push('Location is too long')
  }
  if (occupation && !occupationSet.has(occupation as never)) {
    errors.push('Pick a valid occupation')
  }
  if (!hoursPerWeek || !hoursSet.has(hoursPerWeek as never)) {
    errors.push('Pick how many hours you can commit')
  }

  if (errors.length) return { ok: false, errors }

  return {
    ok: true,
    data: {
      name,
      email,
      phone,
      domains,
      portfolio_url: portfolioUrl,
      location,
      occupation,
      hours_per_week: hoursPerWeek,
    },
  }
}
