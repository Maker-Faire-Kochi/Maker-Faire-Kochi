import { validateVolunteerInput } from '../shared/volunteer/validate'

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
  phone: '+91 98765 43210',
  domains: ['video'] as ('video')[],
  portfolioUrl: '',
  location: 'Kochi',
  occupation: 'student' as const,
  hoursPerWeek: '3_5' as const,
  website: '',
}

assert(validateVolunteerInput(base).ok === true, 'valid media volunteer passes')

assert(
  validateVolunteerInput({ ...base, website: 'http://spam.test' }).ok === false,
  'honeypot rejected',
)

assert(
  validateVolunteerInput({ ...base, phone: '' }).ok === false,
  'phone required',
)

assert(
  validateVolunteerInput({ ...base, domains: [] }).ok === false,
  'domain required',
)

assert(
  validateVolunteerInput({ ...base, hoursPerWeek: '' }).ok === false,
  'hours required',
)

assert(
  validateVolunteerInput({ ...base, portfolioUrl: 'not a url' }).ok === false,
  'bad portfolio url fails',
)

assert(
  validateVolunteerInput({ ...base, portfolioUrl: 'behance.net/ada' }).ok === true,
  'bare domain portfolio ok',
)

{
  const r = validateVolunteerInput({
    ...base,
    domains: ['video', 'video', 'design'] as never,
  })
  assert(
    r.ok === true && (r.data.domains as string[]).length === 2,
    'duplicate domains collapsed',
  )
}

if (failed) {
  console.error(`\n${failed} failed`)
  process.exit(1)
}
console.log('\nAll volunteer validation checks passed')
