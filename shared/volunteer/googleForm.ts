/**
 * MakerFaire Kochi 2027 Media Team Volunteer Call — Google Form wire-up.
 * Form: https://forms.gle/4d6BzBRYSRyT34wE7
 *
 * Labels must match the form options byte-for-byte or Google drops the answer.
 */
export const GOOGLE_FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLScmb6zAibe1f35X0jyFUSEhZjY1oeRr7zXrkYkeaDWC5KC_Sg/formResponse'

export const GOOGLE_ENTRY = {
  name: 'entry.1593317117',
  phone: 'entry.1603936145',
  domains: 'entry.1086410954',
  portfolio: 'entry.383782641',
  location: 'entry.1363834855',
  occupation: 'entry.1430187291',
  hours: 'entry.425648458',
  /** Built-in “Collect email addresses” field when that option is on. */
  email: 'emailAddress',
} as const

export const DOMAIN_TO_GOOGLE: Record<string, string> = {
  video: 'Videography and Editing',
  writing: 'Content Writing',
  design: 'Design',
  other: 'Others',
}

export const OCCUPATION_TO_GOOGLE: Record<string, string> = {
  professional: 'Professional/ Unemployed',
  student: 'Student',
}

export const HOURS_TO_GOOGLE: Record<string, string> = {
  '1_3': '1 to 3 hours',
  '3_5': '3 to 5 hours',
  '5_10': '5 to 10 hours',
  '10_plus': 'More than 10 hours',
}

export type GoogleVolunteerPayload = {
  name: string
  email: string
  phone: string
  domains: string[]
  portfolio_url: string | null
  location: string | null
  occupation: string | null
  hours_per_week: string
}

/** Build the application/x-www-form-urlencoded body Google expects. */
export function toGoogleFormBody(row: GoogleVolunteerPayload): URLSearchParams {
  const body = new URLSearchParams()
  body.set(GOOGLE_ENTRY.email, row.email)
  body.set(GOOGLE_ENTRY.name, row.name)
  body.set(GOOGLE_ENTRY.phone, row.phone)

  for (const d of row.domains) {
    const label = DOMAIN_TO_GOOGLE[d]
    if (label) body.append(GOOGLE_ENTRY.domains, label)
  }

  if (row.portfolio_url) body.set(GOOGLE_ENTRY.portfolio, row.portfolio_url)
  if (row.location) body.set(GOOGLE_ENTRY.location, row.location)

  if (row.occupation) {
    const label = OCCUPATION_TO_GOOGLE[row.occupation]
    if (label) body.set(GOOGLE_ENTRY.occupation, label)
  }

  const hours = HOURS_TO_GOOGLE[row.hours_per_week]
  if (hours) body.set(GOOGLE_ENTRY.hours, hours)

  return body
}
