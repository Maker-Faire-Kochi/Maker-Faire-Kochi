import { validateInterestInput } from '../shared/interest/validate'

let failed = 0
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error('FAIL:', msg)
    failed++
  } else {
    console.log('PASS:', msg)
  }
}

const base = {
  name: 'Ada',
  email: 'ada@example.com',
  phone: '',
  location: 'kochi' as const,
  selfDescribe: 'student' as const,
  selfDescribeOther: '',
  participation: ['attend'] as ('attend')[],
  makePossible: 'Meet makers',
  contributeText: '',
  hasProject: '' as const,
  projectDescription: '',
  projectCategories: [] as [],
  volunteerAreas: [] as [],
  volunteerTime: '' as const,
  inOrganization: false as boolean | null,
  orgName: '',
  orgCollaborate: '' as const,
  heardFrom: 'instagram' as const,
  heardFromOther: '',
  anythingElse: '',
  website: '',
}

assert(validateInterestInput(base).ok === true, 'attend-only validates')

assert(
  validateInterestInput({
    ...base,
    selfDescribe: 'maker',
    participation: ['exhibit'],
  }).ok === false,
  'exhibit without contribute fails',
)

assert(
  validateInterestInput({ ...base, website: 'http://spam.test' }).ok === false,
  'honeypot rejected',
)

if (failed) {
  console.error(`\n${failed} failure(s)`)
  process.exit(1)
}
console.log('\nAll validation smoke checks passed')
