import type {
  HAS_PROJECT,
  HEARD_FROM,
  LOCATIONS,
  ORG_COLLABORATE,
  PARTICIPATION,
  PROJECT_CATEGORIES,
  SELF_DESCRIBE,
  STATUSES,
  VOLUNTEER_AREAS,
  VOLUNTEER_TIME,
} from './constants'

type Val<T extends readonly { value: string }[]> = T[number]['value']

export type LocationValue = Val<typeof LOCATIONS>
export type SelfDescribeValue = Val<typeof SELF_DESCRIBE>
export type ParticipationValue = Val<typeof PARTICIPATION>
export type ProjectCategoryValue = Val<typeof PROJECT_CATEGORIES>
export type VolunteerAreaValue = Val<typeof VOLUNTEER_AREAS>
export type VolunteerTimeValue = Val<typeof VOLUNTEER_TIME>
export type HasProjectValue = Val<typeof HAS_PROJECT>
export type OrgCollaborateValue = Val<typeof ORG_COLLABORATE>
export type HeardFromValue = Val<typeof HEARD_FROM>
export type StatusValue = Val<typeof STATUSES>

export interface InterestFormInput {
  name: string
  email: string
  phone: string
  location: LocationValue | ''
  selfDescribe: SelfDescribeValue | ''
  selfDescribeOther: string
  participation: ParticipationValue[]
  makePossible: string
  contributeText: string
  hasProject: HasProjectValue | ''
  projectDescription: string
  projectCategories: ProjectCategoryValue[]
  volunteerAreas: VolunteerAreaValue[]
  volunteerTime: VolunteerTimeValue | ''
  inOrganization: boolean | null
  orgName: string
  orgCollaborate: OrgCollaborateValue | ''
  heardFrom: HeardFromValue | ''
  heardFromOther: string
  anythingElse: string
  /** Honeypot — must stay empty */
  website: string
}

export interface InterestResponseRow {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  location: string
  self_describe: string
  self_describe_other: string | null
  participation: string[]
  make_possible: string | null
  contribute_text: string | null
  has_project: string | null
  project_description: string | null
  project_categories: string[] | null
  volunteer_areas: string[] | null
  volunteer_time: string | null
  in_organization: boolean | null
  org_name: string | null
  org_collaborate: string | null
  heard_from: string | null
  heard_from_other: string | null
  anything_else: string | null
  status: StatusValue
}

export function emptyInterestForm(): InterestFormInput {
  return {
    name: '',
    email: '',
    phone: '',
    location: '',
    selfDescribe: '',
    selfDescribeOther: '',
    participation: [],
    makePossible: '',
    contributeText: '',
    hasProject: '',
    projectDescription: '',
    projectCategories: [],
    volunteerAreas: [],
    volunteerTime: '',
    inOrganization: null,
    orgName: '',
    orgCollaborate: '',
    heardFrom: '',
    heardFromOther: '',
    anythingElse: '',
    website: '',
  }
}
