export const LOCATIONS = [
  { value: 'kochi', label: 'Kochi' },
  { value: 'kerala', label: 'Other parts of Kerala' },
  { value: 'india', label: 'Outside Kerala' },
  { value: 'outside_india', label: 'Outside India' },
] as const

export const SELF_DESCRIBE = [
  { value: 'student', label: 'Student' },
  { value: 'maker', label: 'Maker / Hobbyist' },
  { value: 'engineer', label: 'Engineer / Technologist' },
  { value: 'artist', label: 'Artist / Designer' },
  { value: 'educator', label: 'Educator / Teacher' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'entrepreneur', label: 'Entrepreneur / Startup' },
  { value: 'organization', label: 'Organization / Community' },
  { value: 'curious', label: 'Just curious!' },
  { value: 'other', label: 'Other' },
] as const

export const PARTICIPATION = [
  { value: 'attend', label: 'Attend the Faire' },
  { value: 'exhibit', label: 'Showcase a project / Maker exhibit' },
  { value: 'workshop', label: 'Conduct a workshop' },
  { value: 'talk', label: 'Give a talk / presentation' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'organize', label: 'Help organize the event' },
  { value: 'sponsor', label: 'Sponsor / Partner with the event' },
  { value: 'org_booth', label: 'Set up a community / organization booth' },
  { value: 'sell', label: 'Sell / showcase products or creations' },
  { value: 'media', label: 'Help with media / photography / videography' },
  { value: 'design', label: 'Help with design / branding / social media' },
  { value: 'other', label: 'Contribute in another way' },
] as const

export const PROJECT_CATEGORIES = [
  { value: 'art', label: 'Art & Design' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'software', label: 'Software / AI' },
  { value: 'fabrication', label: '3D Printing / Fabrication' },
  { value: 'science', label: 'Science' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'craft', label: 'Craft / Traditional Making' },
  { value: 'music', label: 'Music / Performance' },
  { value: 'diy', label: 'DIY / Hardware' },
  { value: 'other', label: 'Other' },
] as const

export const VOLUNTEER_AREAS = [
  { value: 'event_mgmt', label: 'Event management' },
  { value: 'workshops', label: 'Workshops' },
  { value: 'maker_support', label: 'Maker support' },
  { value: 'registration', label: 'Registration / Help desk' },
  { value: 'photo_video', label: 'Photography / Videography' },
  { value: 'social', label: 'Social media' },
  { value: 'design', label: 'Design' },
  { value: 'tech', label: 'Technical support' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'setup', label: 'Setup / Teardown' },
  { value: 'anything', label: 'Anything needed!' },
] as const

export const VOLUNTEER_TIME = [
  { value: 'few_hours', label: 'A few hours' },
  { value: 'one_day', label: 'One day' },
  { value: 'multiple_days', label: 'Multiple days' },
  { value: 'before_during', label: 'Before and during the event' },
  { value: 'flexible', label: "I'm flexible" },
] as const

export const HAS_PROJECT = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'figuring', label: "I'm still figuring it out" },
] as const

export const ORG_COLLABORATE = [
  { value: 'yes', label: 'Yes' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'not_sure', label: 'Not sure yet' },
] as const

export const HEARD_FROM = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'friend', label: 'Friend' },
  { value: 'college', label: 'College / School' },
  { value: 'makerspace', label: 'Makerspace / Community' },
  { value: 'website', label: 'Website' },
  { value: 'other', label: 'Other' },
] as const

export const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'archived', label: 'Archived' },
] as const

/** Participation values that unlock the project / contribute block */
export const EXHIBIT_LIKE = new Set([
  'exhibit',
  'workshop',
  'talk',
  'sell',
  'org_booth',
])

export const CONTRIBUTE_LIKE = new Set([
  ...EXHIBIT_LIKE,
  'sponsor',
  'organize',
  'media',
  'design',
  'other',
])
