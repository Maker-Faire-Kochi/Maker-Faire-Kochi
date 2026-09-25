import { computed, type Ref } from 'vue'
import type { InterestResponseRow } from '~~/shared/interest/types'
import {
  HEARD_FROM,
  LOCATIONS,
  PARTICIPATION,
  SELF_DESCRIBE,
  STATUSES,
} from '~~/shared/interest/constants'

export interface CountRow {
  value: string
  label: string
  count: number
  pct: number
}

function tally(
  rows: InterestResponseRow[],
  pick: (r: InterestResponseRow) => string | string[] | null | undefined,
  labelOf: (value: string) => string,
): CountRow[] {
  const map = new Map<string, number>()
  for (const r of rows) {
    const raw = pick(r)
    const values = Array.isArray(raw) ? raw : raw ? [raw] : []
    for (const v of values) {
      if (!v) continue
      map.set(v, (map.get(v) || 0) + 1)
    }
  }
  const total = rows.length || 1
  return [...map.entries()]
    .map(([value, count]) => ({
      value,
      label: labelOf(value),
      count,
      pct: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count)
}

/** Viewer-local calendar day. `toISOString()` is UTC, which in IST files a 00:00–05:29 entry under yesterday. */
function localDayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function labelMap(opts: readonly { value: string; label: string }[]) {
  const m = new Map(opts.map((o) => [o.value, o.label]))
  return (v: string) => m.get(v) || v
}

export function useInterestAnalytics(rows: Ref<InterestResponseRow[]>) {
  const summary = computed(() => {
    const all = rows.value
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    const weekAgo = now - 7 * day
    const todayKey = localDayKey(new Date())

    const byStatus = tally(all, (r) => r.status, labelMap(STATUSES))
    const newCount = all.filter((r) => r.status === 'new').length

    return {
      total: all.length,
      today: all.filter((r) => localDayKey(new Date(r.created_at)) === todayKey).length,
      week: all.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length,
      newCount,
      exhibit: all.filter((r) => r.participation.includes('exhibit')).length,
      volunteer: all.filter((r) => r.participation.includes('volunteer')).length,
      workshop: all.filter((r) => r.participation.includes('workshop')).length,
      sponsor: all.filter((r) => r.participation.includes('sponsor')).length,
      talk: all.filter((r) => r.participation.includes('talk')).length,
      withProject: all.filter((r) => r.has_project === 'yes').length,
      byStatus,
    }
  })

  const participation = computed(() =>
    tally(rows.value, (r) => r.participation, labelMap(PARTICIPATION)),
  )
  const location = computed(() =>
    tally(rows.value, (r) => r.location, labelMap(LOCATIONS)),
  )
  const selfDescribe = computed(() =>
    tally(rows.value, (r) => r.self_describe, labelMap(SELF_DESCRIBE)),
  )
  const heardFrom = computed(() =>
    tally(
      rows.value.filter((r) => r.heard_from),
      (r) => r.heard_from,
      labelMap(HEARD_FROM),
    ),
  )
  const projectCategories = computed(() =>
    tally(
      rows.value,
      (r) => r.project_categories,
      (v) => v.replace(/_/g, ' '),
    ),
  )
  const volunteerAreas = computed(() =>
    tally(
      rows.value,
      (r) => r.volunteer_areas,
      (v) => v.replace(/_/g, ' '),
    ),
  )

  /** Last 14 calendar days of submissions (GForms-style trend). */
  const dailyTrend = computed(() => {
    const days: { key: string; label: string; count: number }[] = []
    const now = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const key = localDayKey(d)
      days.push({
        key,
        label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        count: 0,
      })
    }
    const index = new Map(days.map((d, i) => [d.key, i]))
    for (const r of rows.value) {
      const i = index.get(localDayKey(new Date(r.created_at)))
      if (i !== undefined) days[i].count += 1
    }
    return days
  })

  return {
    summary,
    participation,
    location,
    selfDescribe,
    heardFrom,
    projectCategories,
    volunteerAreas,
    dailyTrend,
  }
}

export function responsesToCsv(rows: InterestResponseRow[]): string {
  const headers = [
    'created_at',
    'status',
    'name',
    'email',
    'phone',
    'location',
    'self_describe',
    'self_describe_other',
    'participation',
    'make_possible',
    'contribute_text',
    'has_project',
    'project_description',
    'project_categories',
    'volunteer_areas',
    'volunteer_time',
    'in_organization',
    'org_name',
    'org_collaborate',
    'heard_from',
    'heard_from_other',
    'anything_else',
  ]
  const esc = (v: unknown) => {
    if (v == null) return ''
    let s = Array.isArray(v) ? v.join('; ') : String(v)
    // Public input: a leading = + - @ would run as a formula in Excel / Sheets.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(
      headers
        .map((h) => esc((r as Record<string, unknown>)[h]))
        .join(','),
    )
  }
  // BOM so Excel opens UTF-8 (Malayalam names) correctly.
  return '\uFEFF' + lines.join('\r\n')
}
