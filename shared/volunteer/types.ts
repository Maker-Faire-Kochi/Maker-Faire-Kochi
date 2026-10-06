import type { MEDIA_DOMAINS, MEDIA_HOURS, MEDIA_OCCUPATIONS } from './constants'

type Val<T extends readonly { value: string }[]> = T[number]['value']

export type MediaDomainValue = Val<typeof MEDIA_DOMAINS>
export type MediaOccupationValue = Val<typeof MEDIA_OCCUPATIONS>
export type MediaHoursValue = Val<typeof MEDIA_HOURS>

export interface VolunteerFormInput {
  name: string
  email: string
  phone: string
  domains: MediaDomainValue[]
  portfolioUrl: string
  location: string
  occupation: MediaOccupationValue | ''
  hoursPerWeek: MediaHoursValue | ''
  /** Honeypot — must stay empty. */
  website: string
}

export function emptyVolunteerForm(): VolunteerFormInput {
  return {
    name: '',
    email: '',
    phone: '',
    domains: [],
    portfolioUrl: '',
    location: '',
    occupation: '',
    hoursPerWeek: '',
    website: '',
  }
}
