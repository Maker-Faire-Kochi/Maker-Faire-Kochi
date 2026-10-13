<script setup lang="ts">
import { computed, ref } from 'vue'
import type { VolunteerResponseRow } from '~~/shared/volunteer/types'
import { VOLUNTEER_STATUSES } from '~~/shared/volunteer/constants'
import AdminDonut from './AdminDonut.vue'
import {
  domainLabel,
  hoursLabel,
  occupationLabel,
  useVolunteerInbox,
  volunteerRowsToCsv,
} from '../composables/useVolunteerInbox'

const props = defineProps<{
  rows: VolunteerResponseRow[]
}>()

const emit = defineEmits<{
  status: [id: string, status: VolunteerResponseRow['status']]
}>()

const filterStatus = ref('')
const search = ref('')
const openId = ref<string | null>(null)

const rowsRef = computed(() => props.rows)
const { total, newCount, mailed, week, domains, hours } = useVolunteerInbox(rowsRef)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.rows.filter((r) => {
    if (filterStatus.value && r.status !== filterStatus.value) return false
    if (!q) return true
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q) ||
      (r.location || '').toLowerCase().includes(q)
    )
  })
})

function downloadCsv() {
  const csv = volunteerRowsToCsv(filtered.value)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `volunteer-responses-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="vol">
    <dl class="kpi-grid">
      <div class="kpi kpi-big">
        <dt class="kpi-l">Total applications</dt>
        <dd class="kpi-n"><BitsCountUp :to="total" :duration="900" /></dd>
      </div>
      <div class="kpi">
        <dt class="kpi-l">Last 7 days</dt>
        <dd class="kpi-n"><BitsCountUp :to="week" :duration="900" /></dd>
      </div>
      <div class="kpi" :class="{ 'kpi-alert': newCount > 0 }">
        <dt class="kpi-l">Unreviewed</dt>
        <dd class="kpi-n"><BitsCountUp :to="newCount" :duration="900" /></dd>
      </div>
      <div class="kpi">
        <dt class="kpi-l">Confirmation sent</dt>
        <dd class="kpi-n"><BitsCountUp :to="mailed" :duration="900" /></dd>
      </div>
    </dl>

    <div class="row-2">
      <AdminDonut fig="V1" title="Media domains" :rows="domains" />
      <AdminDonut fig="V2" title="Hours a week" :rows="hours" />
    </div>

    <div class="toolbar">
      <input
        v-model="search"
        class="inp"
        type="search"
        placeholder="Search name, email, phone…"
        aria-label="Search volunteer applications"
      />
      <select v-model="filterStatus" class="inp" aria-label="Filter by status">
        <option value="">All statuses</option>
        <option v-for="s in VOLUNTEER_STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <button type="button" class="key key-red" @click="downloadCsv">Download CSV</button>
    </div>
    <p class="count-line">{{ filtered.length }} of {{ rows.length }} shown</p>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>Name</th>
            <th>Email</th>
            <th>Domains</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="r in filtered" :key="r.id">
            <tr
              class="row-item"
              :class="{ open: openId === r.id }"
              @click="openId = openId === r.id ? null : r.id"
            >
              <td class="mono">{{ new Date(r.created_at).toLocaleString() }}</td>
              <td>{{ r.name }}</td>
              <td>
                <a :href="`mailto:${r.email}`" @click.stop>{{ r.email }}</a>
              </td>
              <td class="parts-cell">{{ domainLabel(r.domains) }}</td>
              <td @click.stop>
                <select
                  class="status"
                  :class="`st-${r.status}`"
                  :value="r.status"
                  :aria-label="`Status for ${r.name}`"
                  @change="emit('status', r.id, ($event.target as HTMLSelectElement).value as VolunteerResponseRow['status'])"
                >
                  <option v-for="s in VOLUNTEER_STATUSES" :key="s.value" :value="s.value">
                    {{ s.label }}
                  </option>
                </select>
              </td>
            </tr>
            <tr v-if="openId === r.id" class="detail">
              <td colspan="5">
                <dl>
                  <div><dt>Phone</dt><dd>{{ r.phone }}</dd></div>
                  <div v-if="r.location"><dt>Location</dt><dd>{{ r.location }}</dd></div>
                  <div><dt>Occupation</dt><dd>{{ occupationLabel(r.occupation) }}</dd></div>
                  <div><dt>Hours</dt><dd>{{ hoursLabel(r.hours_per_week) }}</dd></div>
                  <div v-if="r.portfolio_url">
                    <dt>Portfolio</dt>
                    <dd>
                      <a :href="r.portfolio_url.startsWith('http') ? r.portfolio_url : `https://${r.portfolio_url}`" target="_blank" rel="noopener noreferrer">
                        {{ r.portfolio_url }}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt>Google Form</dt>
                    <dd>{{ r.google_forwarded ? 'Forwarded' : 'Not forwarded' }}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{{ r.confirmation_sent ? 'Confirmation sent' : 'Not sent' }}</dd>
                  </div>
                </dl>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <p v-if="!filtered.length" class="empty">No applications match these filters.</p>
    </div>
  </div>
</template>

<style scoped>
.vol { display: grid; gap: 1.25rem; }
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10.5rem), 1fr));
  margin: 0;
  background: #fff;
  border: 1px solid var(--pn-ink);
  box-shadow: 3px 3px 0 rgba(10, 10, 10, 0.08);
  overflow: hidden;
}
.kpi {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1rem 1.1rem 1.1rem;
  box-shadow: -1px 0 0 var(--pn-ink), 0 -1px 0 var(--pn-ink);
}
.kpi-big { background: var(--pn-ink); color: #fff; }
.kpi-big .kpi-l { color: #A3A3A3; }
.kpi-big .kpi-n { color: #fff; }
.kpi-alert { box-shadow: -1px 0 0 var(--pn-ink), 0 -1px 0 var(--pn-ink), inset 0 3px 0 var(--color-red-cta); }
.kpi-l {
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-label);
}
.kpi-n {
  margin: 0;
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 900;
  font-size: 2.6rem;
  line-height: 0.95;
  color: var(--pn-ink);
}
.row-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1.25rem; }
.toolbar {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 0.5rem;
}
.count-line { margin: 0; font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--pn-label); }
@media (max-width: 800px) {
  .toolbar { grid-template-columns: 1fr; }
}
.inp {
  min-height: 44px;
  border: 1px solid var(--pn-ink);
  border-radius: 0;
  padding: 0.45rem 0.75rem;
  font: inherit;
  font-size: 1rem;
  background: #fff;
}
.inp:focus-visible { outline: 2px solid var(--color-cyan); outline-offset: 2px; }
.table-wrap {
  background: #fff;
  border: 1px solid var(--pn-ink);
  box-shadow: 3px 3px 0 rgba(10, 10, 10, 0.08);
  overflow: auto;
}
table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
th, td {
  text-align: left;
  padding: 0.7rem 0.85rem;
  border-bottom: 1px solid rgba(10, 10, 10, 0.12);
  vertical-align: top;
}
th {
  position: sticky;
  top: 0;
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-label);
  background: #fff;
  border-bottom: 1px solid var(--pn-ink);
}
.mono { white-space: nowrap; color: var(--pn-label); }
.row-item { cursor: pointer; }
.row-item:hover { background: rgba(0, 174, 239, 0.05); }
.row-item.open { background: rgba(0, 174, 239, 0.08); box-shadow: inset 3px 0 0 var(--color-cyan); }
.parts-cell { max-width: 16rem; }
.status {
  font: inherit;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px solid var(--pn-ink);
  border-radius: 0;
  padding: 0.3rem 0.4rem;
  background: #fff;
}
.status.st-new { box-shadow: inset 3px 0 0 var(--color-red-cta); }
.status.st-reviewed { box-shadow: inset 3px 0 0 var(--color-cyan); }
.status.st-contacted { box-shadow: inset 3px 0 0 var(--pn-ink); }
.status.st-archived { color: var(--pn-label); }
.detail td { background: #FAFAFA; }
.detail dl { display: grid; gap: 0.65rem; margin: 0; }
.detail dl > div { display: grid; grid-template-columns: 8rem 1fr; gap: 0.5rem; }
.detail dt { font-weight: 500; color: var(--pn-label); font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; }
.detail dd { margin: 0; white-space: pre-wrap; }
.empty { padding: 1rem; color: var(--pn-label); margin: 0; }
a { color: var(--color-red-cta); }
</style>
