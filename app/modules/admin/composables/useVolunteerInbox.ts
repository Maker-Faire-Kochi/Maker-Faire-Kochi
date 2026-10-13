import { computed, type Ref } from 'vue'
import type { CountRow } from './useInterestAnalytics'
import type { VolunteerResponseRow } from '~~/shared/volunteer/types'
import {
  MEDIA_DOMAINS,
  MEDIA_HOURS,
  MEDIA_OCCUPATIONS,
} from '~~/shared/volunteer/constants'

function labelMap(opts: readonly { value: string, label: string }[]) {
  return new Map(opts.map((o) => [o.value, o.label]))
}

const domainLabels = labelMap(MEDIA_DOMAINS)
const hoursLabels = labelMap(MEDIA_HOURS)
const occupationLabels = labelMap(MEDIA_OCCUPATIONS)

function tally(
  rows: VolunteerResponseRow[],
  pick: (r: VolunteerResponseRow) => string | string[] | null | undefined,
  labels: Map<string, string>,
): CountRow[] {
  const map = new Map<string, number>()
  for (const r of rows) {
    const raw = pick(r)
    const values = Array.isArray(raw) ? raw : raw ? [raw] : []
    for (const v of values) map.set(v, (map.get(v) || 0) + 1)
  }
  const n = rows.length || 1
  return [...map.entries()]
    .map(([value, count]) => ({
      value,
      label: labels.get(value) || value,
      count,
      pct: Math.round((count / n) * 100),
    }))
    .sort((a, b) => b.count - a.count)
}

export function domainLabel(values: string[]) {
  return values.map((v) => domainLabels.get(v) || v).join(', ')
}

export function hoursLabel(value: string) {
  return hoursLabels.get(value) || value
}

export function occupationLabel(value: string | null) {
  return value ? occupationLabels.get(value) || value : '—'
}

export function useVolunteerInbox(rows: Ref<VolunteerResponseRow[]>) {
  const total = computed(() => rows.value.length)
  const newCount = computed(() => rows.value.filter((r) => r.status === 'new').length)
  const mailed = computed(() => rows.value.filter((r) => r.confirmation_sent).length)
  const week = computed(() => {
    const cut = Date.now() - 7 * 86400000
    return rows.value.filter((r) => new Date(r.created_at).getTime() >= cut).length
  })
  const domains = computed(() => tally(rows.value, (r) => r.domains, domainLabels))
  const hours = computed(() => tally(rows.value, (r) => r.hours_per_week, hoursLabels))
  return { total, newCount, mailed, week, domains, hours }
}

export function volunteerRowsToCsv(rows: VolunteerResponseRow[]): string {
  const headers = [
    'created_at',
    'status',
    'name',
    'email',
    'phone',
    'domains',
    'portfolio_url',
    'location',
    'occupation',
    'hours_per_week',
    'google_forwarded',
    'confirmation_sent',
  ] as const
  const esc = (v: unknown) => {
    if (v == null) return ''
    let s = Array.isArray(v) ? v.join('; ') : String(v)
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(headers.map((h) => esc(r[h])).join(','))
  }
  return '\uFEFF' + lines.join('\r\n')
}
