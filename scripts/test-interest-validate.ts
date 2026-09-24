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

{
  const r = validateInterestInput({ ...base, name: 'x'.repeat(121) })
  assert(r.ok === false, 'name over 120 chars fails')
}

{
  const r = validateInterestInput({ ...base, anythingElse: 'x'.repeat(4001) })
  assert(r.ok === false, 'anything_else over 4000 chars fails')
}

{
  const r = validateInterestInput({
    ...base,
    participation: ['attend', 'attend', 'attend'] as never,
  })
  assert(
    r.ok === true && (r.data.participation as string[]).length === 1,
    'duplicate participation values are collapsed',
  )
}

{
  const r = validateInterestInput({
    ...base,
    contributeText: 'stale text from a hidden section',
    hasProject: 'yes' as never,
    projectDescription: 'stale',
  })
  assert(
    r.ok === true &&
      r.data.contribute_text === null &&
      r.data.has_project === null &&
      r.data.project_description === null,
    'attend-only drops answers from hidden sections',
  )
}

{
  const r = validateInterestInput({
    ...base,
    participation: ['exhibit'] as never,
    contributeText: 'A drone',
    hasProject: 'yes' as never,
    projectDescription: 'Quadcopter',
    projectCategories: ['robotics'] as never,
  })
  assert(
    r.ok === true && r.data.project_description === 'Quadcopter',
    'exhibit with project keeps project fields',
  )
}

if (failed) {
  console.error(`\n${failed} failure(s)`)
  process.exit(1)
}
console.log('\nAll validation smoke checks passed')
