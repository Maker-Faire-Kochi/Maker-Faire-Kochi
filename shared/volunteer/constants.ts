export const MEDIA_DOMAINS = [
  { value: 'video', label: 'Videography and Editing' },
  { value: 'writing', label: 'Content Writing' },
  { value: 'design', label: 'Design' },
  { value: 'other', label: 'Others' },
] as const

export const MEDIA_OCCUPATIONS = [
  { value: 'professional', label: 'Professional / Unemployed' },
  { value: 'student', label: 'Student' },
] as const

export const MEDIA_HOURS = [
  { value: '1_3', label: '1 to 3 hours' },
  { value: '3_5', label: '3 to 5 hours' },
  { value: '5_10', label: '5 to 10 hours' },
  { value: '10_plus', label: 'More than 10 hours' },
] as const
