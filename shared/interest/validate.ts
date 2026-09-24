import {
  CONTRIBUTE_LIKE,
  EXHIBIT_LIKE,
  HAS_PROJECT,
  HEARD_FROM,
  LOCATIONS,
  ORG_COLLABORATE,
  PARTICIPATION,
  PROJECT_CATEGORIES,
  SELF_DESCRIBE,
  VOLUNTEER_AREAS,
  VOLUNTEER_TIME,
} from './constants'
import type { InterestFormInput } from './types'

const locationSet = new Set(LOCATIONS.map((o) => o.value))
const selfSet = new Set(SELF_DESCRIBE.map((o) => o.value))
const partSet = new Set(PARTICIPATION.map((o) => o.value))
const catSet = new Set(PROJECT_CATEGORIES.map((o) => o.value))
const volAreaSet = new Set(VOLUNTEER_AREAS.map((o) => o.value))
const volTimeSet = new Set(VOLUNTEER_TIME.map((o) => o.value))
const hasProjectSet = new Set(HAS_PROJECT.map((o) => o.value))
const orgCollabSet = new Set(ORG_COLLABORATE.map((o) => o.value))
const heardSet = new Set(HEARD_FROM.map((o) => o.value))

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Character caps. The DB carries matching CHECK constraints. */
export const MAX_LEN = {
  name: 120,
  email: 254,
  phone: 32,
  short: 200,
  long: 4000,
} as const

export interface InterestNeeds {
  contribute: boolean
  projectBlock: boolean
  volunteer: boolean
  org: boolean
}

export function interestNeeds(participation: string[]): InterestNeeds {
  const set = new Set(participation)
  return {
    contribute: [...CONTRIBUTE_LIKE].some((v) => set.has(v)),
    projectBlock: [...EXHIBIT_LIKE].some((v) => set.has(v)),
    volunteer: set.has('volunteer'),
    org: set.has('org_booth'),
  }
}

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
export function validateInterestInput(raw: Partial<InterestFormInput>): ValidateResult {
  const errors: string[] = []

  if (trim(raw.website)) {
    return { ok: false, errors: ['Rejected'] }
  }

  const name = trim(raw.name)
  const email = trim(raw.email).toLowerCase()
  const phone = trim(raw.phone) || null
  const location = trim(raw.location)
  const selfDescribe = trim(raw.selfDescribe)
  const selfDescribeOther = trim(raw.selfDescribeOther) || null
  const participation = asStringArray(raw.participation)
  const makePossible = trim(raw.makePossible) || null
  const contributeText = trim(raw.contributeText) || null
  const hasProject = trim(raw.hasProject) || null
  const projectDescription = trim(raw.projectDescription) || null
  const projectCategories = asStringArray(raw.projectCategories)
  const volunteerAreas = asStringArray(raw.volunteerAreas)
  const volunteerTime = trim(raw.volunteerTime) || null
  const heardFrom = trim(raw.heardFrom) || null
  const heardFromOther = trim(raw.heardFromOther) || null
  const anythingElse = trim(raw.anythingElse) || null

  let inOrganization: boolean | null = null
  if (raw.inOrganization === true || raw.inOrganization === false) {
    inOrganization = raw.inOrganization
  }
  const orgName = trim(raw.orgName) || null
  const orgCollaborate = trim(raw.orgCollaborate) || null

  const caps: [string | null, number, string][] = [
    [name, MAX_LEN.name, 'Name'],
    [email, MAX_LEN.email, 'Email'],
    [phone, MAX_LEN.phone, 'Phone'],
    [selfDescribeOther, MAX_LEN.short, '“What describes you”'],
    [orgName, MAX_LEN.short, 'Organization name'],
    [heardFromOther, MAX_LEN.short, '“How did you hear”'],
    [makePossible, MAX_LEN.long, '“What would you like to make possible”'],
    [contributeText, MAX_LEN.long, '“What would you like to contribute”'],
    [projectDescription, MAX_LEN.long, 'Project description'],
    [anythingElse, MAX_LEN.long, '“Anything else”'],
  ]
  for (const [value, max, label] of caps) {
    if (value && value.length > max) errors.push(`${label} is too long (max ${max} characters)`)
  }

  if (!name) errors.push('Name is required')
  if (!email || !emailRe.test(email)) errors.push('A valid email is required')
  if (!location || !locationSet.has(location as never)) errors.push('Where are you from? is required')
  if (!selfDescribe || !selfSet.has(selfDescribe as never)) {
    errors.push('What best describes you? is required')
  }
  if (selfDescribe === 'other' && !selfDescribeOther) {
    errors.push('Please tell us what describes you')
  }
  if (!participation.length || participation.some((p) => !partSet.has(p as never))) {
    errors.push('Pick at least one way to participate')
  }

  const needs = interestNeeds(participation)
  if (needs.contribute && !contributeText) {
    errors.push('Tell us a little about what you would like to contribute')
  }
  if (needs.projectBlock) {
    if (!hasProject || !hasProjectSet.has(hasProject as never)) {
      errors.push('Do you already have a project or idea?')
    }
    if (hasProject === 'yes') {
      if (!projectDescription) errors.push('Tell us about your project')
      if (!projectCategories.length || projectCategories.some((c) => !catSet.has(c as never))) {
        errors.push('Pick at least one project category')
      }
    }
  }
  if (needs.volunteer) {
    if (!volunteerAreas.length || volunteerAreas.some((a) => !volAreaSet.has(a as never))) {
      errors.push('Pick at least one volunteer area')
    }
    if (!volunteerTime || !volTimeSet.has(volunteerTime as never)) {
      errors.push('How much time can you contribute?')
    }
  }

  const needsOrgFields = needs.org || inOrganization === true
  if (needsOrgFields) {
    if (!orgName) errors.push('Organization / community name is required')
    if (!orgCollaborate || !orgCollabSet.has(orgCollaborate as never)) {
      errors.push('Would your organization be interested in collaborating?')
    }
  }

  if (heardFrom && !heardSet.has(heardFrom as never)) {
    errors.push('Invalid “how did you hear” value')
  }
  if (heardFrom === 'other' && !heardFromOther) {
    errors.push('Please say how you heard about us')
  }

  if (errors.length) return { ok: false, errors }

  const hasProjectDetails = needs.projectBlock && hasProject === 'yes'

  return {
    ok: true,
    data: {
      name,
      email,
      phone,
      location,
      self_describe: selfDescribe,
      self_describe_other: selfDescribeOther,
      participation,
      make_possible: makePossible,
      contribute_text: needs.contribute ? contributeText : null,
      has_project: needs.projectBlock ? hasProject : null,
      project_description: hasProjectDetails ? projectDescription : null,
      project_categories: hasProjectDetails ? projectCategories : null,
      volunteer_areas: needs.volunteer ? volunteerAreas : null,
      volunteer_time: needs.volunteer ? volunteerTime : null,
      in_organization: inOrganization,
      org_name: needsOrgFields ? orgName : null,
      org_collaborate: needsOrgFields ? orgCollaborate : null,
      heard_from: heardFrom,
      heard_from_other: heardFrom === 'other' ? heardFromOther : null,
      anything_else: anythingElse,
    },
  }
}
