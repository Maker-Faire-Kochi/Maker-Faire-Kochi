<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminSupabase } from '../composables/useAdminSupabase'
import {
  responsesToCsv,
  useInterestAnalytics,
} from '../composables/useInterestAnalytics'
import type { InterestResponseRow } from '~~/shared/interest/types'
import { PARTICIPATION, STATUSES } from '~~/shared/interest/constants'
import AdminBarChart from './AdminBarChart.vue'
import AdminTrendChart from './AdminTrendChart.vue'

const tab = ref<'summary' | 'responses'>('summary')
const rows = ref<InterestResponseRow[]>([])
const loading = ref(true)
const error = ref('')
const filterStatus = ref('')
const filterPart = ref('')
const search = ref('')
const openId = ref<string | null>(null)
const roleOk = ref(false)
const email = ref('')
const copied = ref(false)

const {
  summary,
  participation,
  location,
  selfDescribe,
  heardFrom,
  projectCategories,
  volunteerAreas,
  dailyTrend,
} = useInterestAnalytics(rows)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return rows.value.filter((r) => {
    if (filterStatus.value && r.status !== filterStatus.value) return false
    if (filterPart.value && !r.participation.includes(filterPart.value)) return false
    if (!q) return true
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.org_name || '').toLowerCase().includes(q)
    )
  })
})

const formUrl = computed(() => {
  if (import.meta.client) return `${window.location.origin}/interestform`
  return '/interestform'
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const supabase = useAdminSupabase()
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      await navigateTo('/admin/login')
      return
    }
    email.value = sessionData.session.user.email || ''
    const role = sessionData.session.user.app_metadata?.role
    roleOk.value = role === 'organizer'
    if (!roleOk.value) {
      error.value =
        'Signed in, but this account is not an organizer. Set app_metadata.role = "organizer" in Supabase.'
      loading.value = false
      return
    }
    const { data, error: qErr } = await supabase
      .from('interest_responses')
      .select('*')
      .order('created_at', { ascending: false })
    if (qErr) throw qErr
    rows.value = (data || []) as InterestResponseRow[]
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load'
  } finally {
    loading.value = false
  }
}

async function setStatus(id: string, status: string) {
  const supabase = useAdminSupabase()
  const { error: uErr } = await supabase
    .from('interest_responses')
    .update({ status })
    .eq('id', id)
  if (uErr) {
    error.value = uErr.message
    return
  }
  const row = rows.value.find((r) => r.id === id)
  if (row) row.status = status as InterestResponseRow['status']
}

async function signOut() {
  const supabase = useAdminSupabase()
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}

async function copyFormLink() {
  try {
    await navigator.clipboard.writeText(formUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    error.value = 'Could not copy link'
  }
}

function downloadCsv() {
  const csv = responsesToCsv(filtered.value)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `interest-responses-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function partLabel(values: string[]) {
  return values
    .map((v) => PARTICIPATION.find((p) => p.value === v)?.label || v)
    .join(', ')
}

onMounted(load)
</script>

<template>
  <div class="panel">
    <header class="hero">
      <div>
        <p class="eyebrow">Maker Faire Kochi · Organizer</p>
        <h1>Interest form</h1>
        <p class="hero-sub">
          Dashboard &amp; analytics — like Google Forms summaries, for Get Involved.
        </p>
      </div>
      <div class="hero-actions">
        <a class="btn ghost" :href="formUrl" target="_blank" rel="noopener">Open form</a>
        <button type="button" class="btn ghost" @click="copyFormLink">
          {{ copied ? 'Copied' : 'Copy form link' }}
        </button>
        <button type="button" class="btn ghost" @click="load">Refresh</button>
        <button type="button" class="btn ghost" @click="signOut">Sign out</button>
      </div>
    </header>

    <p v-if="email && roleOk" class="signed-in">Signed in as {{ email }}</p>

    <p v-if="loading" class="state">Loading responses…</p>
    <p v-else-if="error" class="state err">{{ error }}</p>

    <template v-else-if="roleOk">
      <div class="tabs" role="tablist" aria-label="Admin views">
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ active: tab === 'summary' }"
          :aria-selected="tab === 'summary'"
          @click="tab = 'summary'"
        >
          Summary
        </button>
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ active: tab === 'responses' }"
          :aria-selected="tab === 'responses'"
          @click="tab = 'responses'"
        >
          Responses
          <span class="badge">{{ summary.total }}</span>
        </button>
      </div>

      <!-- SUMMARY (GForms analytics) -->
      <div v-show="tab === 'summary'" class="summary">
        <div class="kpi-grid">
          <div class="kpi">
            <span class="kpi-n">{{ summary.total }}</span>
            <span class="kpi-l">Total responses</span>
          </div>
          <div class="kpi">
            <span class="kpi-n">{{ summary.today }}</span>
            <span class="kpi-l">Today</span>
          </div>
          <div class="kpi">
            <span class="kpi-n">{{ summary.week }}</span>
            <span class="kpi-l">Last 7 days</span>
          </div>
          <div class="kpi accent">
            <span class="kpi-n">{{ summary.newCount }}</span>
            <span class="kpi-l">New (unreviewed)</span>
          </div>
          <div class="kpi">
            <span class="kpi-n">{{ summary.exhibit }}</span>
            <span class="kpi-l">Exhibit intent</span>
          </div>
          <div class="kpi">
            <span class="kpi-n">{{ summary.volunteer }}</span>
            <span class="kpi-l">Volunteer</span>
          </div>
          <div class="kpi">
            <span class="kpi-n">{{ summary.workshop }}</span>
            <span class="kpi-l">Workshop</span>
          </div>
          <div class="kpi">
            <span class="kpi-n">{{ summary.sponsor }}</span>
            <span class="kpi-l">Sponsor / partner</span>
          </div>
        </div>

        <AdminTrendChart :days="dailyTrend" />

        <div class="charts">
          <AdminBarChart title="How would you like to participate?" :rows="participation" tone="red" />
          <AdminBarChart title="Where are you from?" :rows="location" />
          <AdminBarChart title="What best describes you?" :rows="selfDescribe" />
          <AdminBarChart title="How did you hear about us?" :rows="heardFrom" />
          <AdminBarChart title="Response status" :rows="summary.byStatus" tone="red" />
          <AdminBarChart
            v-if="projectCategories.length"
            title="Project categories"
            :rows="projectCategories"
          />
          <AdminBarChart
            v-if="volunteerAreas.length"
            title="Volunteer areas"
            :rows="volunteerAreas"
          />
        </div>

        <p class="hint">
          {{ summary.withProject }} respondent(s) said they already have a project to showcase.
        </p>
      </div>

      <!-- RESPONSES inbox -->
      <div v-show="tab === 'responses'" class="responses">
        <div class="toolbar">
          <input
            v-model="search"
            class="inp"
            type="search"
            placeholder="Search name, email, org…"
            aria-label="Search responses"
          />
          <select v-model="filterStatus" class="inp" aria-label="Filter by status">
            <option value="">All statuses</option>
            <option v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <select v-model="filterPart" class="inp" aria-label="Filter by participation">
            <option value="">All participation</option>
            <option v-for="p in PARTICIPATION" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
          <button type="button" class="btn primary" @click="downloadCsv">
            Download CSV
          </button>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Name</th>
                <th>Email</th>
                <th>Participation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="r in filtered" :key="r.id">
                <tr class="row" @click="openId = openId === r.id ? null : r.id">
                  <td>{{ new Date(r.created_at).toLocaleString() }}</td>
                  <td>{{ r.name }}</td>
                  <td>
                    <a :href="`mailto:${r.email}`" @click.stop>{{ r.email }}</a>
                  </td>
                  <td class="parts-cell">{{ partLabel(r.participation) }}</td>
                  <td @click.stop>
                    <select
                      class="status"
                      :value="r.status"
                      @change="setStatus(r.id, ($event.target as HTMLSelectElement).value)"
                    >
                      <option v-for="s in STATUSES" :key="s.value" :value="s.value">
                        {{ s.label }}
                      </option>
                    </select>
                  </td>
                </tr>
                <tr v-if="openId === r.id" class="detail">
                  <td colspan="5">
                    <dl>
                      <div><dt>Location</dt><dd>{{ r.location }}</dd></div>
                      <div>
                        <dt>Describes</dt>
                        <dd>
                          {{ r.self_describe
                          }}{{ r.self_describe_other ? ` — ${r.self_describe_other}` : '' }}
                        </dd>
                      </div>
                      <div v-if="r.make_possible">
                        <dt>Make possible</dt>
                        <dd>{{ r.make_possible }}</dd>
                      </div>
                      <div v-if="r.contribute_text">
                        <dt>Contribute</dt>
                        <dd>{{ r.contribute_text }}</dd>
                      </div>
                      <div v-if="r.project_description">
                        <dt>Project</dt>
                        <dd>{{ r.project_description }}</dd>
                      </div>
                      <div v-if="r.project_categories?.length">
                        <dt>Categories</dt>
                        <dd>{{ r.project_categories.join(', ') }}</dd>
                      </div>
                      <div v-if="r.volunteer_areas?.length">
                        <dt>Volunteer</dt>
                        <dd>
                          {{ r.volunteer_areas.join(', ') }} ({{ r.volunteer_time }})
                        </dd>
                      </div>
                      <div v-if="r.org_name">
                        <dt>Org</dt>
                        <dd>{{ r.org_name }} — collab: {{ r.org_collaborate }}</dd>
                      </div>
                      <div v-if="r.heard_from">
                        <dt>Heard from</dt>
                        <dd>
                          {{ r.heard_from
                          }}{{ r.heard_from_other ? ` — ${r.heard_from_other}` : '' }}
                        </dd>
                      </div>
                      <div v-if="r.anything_else">
                        <dt>Else</dt>
                        <dd>{{ r.anything_else }}</dd>
                      </div>
                      <div v-if="r.phone"><dt>Phone</dt><dd>{{ r.phone }}</dd></div>
                    </dl>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
          <p v-if="!filtered.length" class="empty">No responses match these filters.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.panel {
  max-width: 72rem;
  margin: 0 auto;
}
.hero {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
.eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-cyan);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
h1 {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 1.75rem);
  font-weight: 700;
  color: var(--color-ink);
}
.hero-sub {
  margin: 0.35rem 0 0;
  color: var(--color-muted);
  font-size: 0.9rem;
  max-width: 36rem;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.signed-in {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: var(--color-muted);
}
.state {
  margin: 2rem 0;
  color: var(--color-muted);
}
.state.err {
  color: var(--color-red-cta);
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 0.9rem;
  border-radius: 8px;
  font: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: none;
  color: var(--color-ink);
  border: 1px solid var(--separator);
  background: var(--color-white);
}
.btn.ghost:hover {
  border-color: var(--color-cyan);
  background: rgba(0, 174, 239, 0.06);
}
.btn.primary {
  background: var(--color-red-cta);
  border-color: var(--color-red-cta);
  color: var(--color-white);
}
.tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--separator);
  margin-bottom: 1.25rem;
}
.tab {
  appearance: none;
  border: none;
  background: transparent;
  font: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  color: var(--color-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.tab.active {
  color: var(--color-ink);
  border-bottom-color: var(--color-red-cta);
}
.badge {
  font-size: 0.7rem;
  font-weight: 700;
  background: rgba(0, 174, 239, 0.15);
  color: var(--color-ink);
  border-radius: 999px;
  padding: 0.1rem 0.45rem;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
  gap: 0.65rem;
  margin-bottom: 1rem;
}
.kpi {
  background: var(--color-white);
  border: 1px solid var(--separator);
  border-radius: 12px;
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.kpi.accent {
  border-color: rgba(196, 18, 26, 0.3);
  background: linear-gradient(180deg, rgba(196, 18, 26, 0.04), var(--color-white) 40%);
}
.kpi-n {
  font-size: 1.6rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}
.kpi-l {
  font-size: 0.75rem;
  color: var(--color-muted);
}
.charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 0.85rem;
  margin-top: 1rem;
}
.hint {
  margin: 1rem 0 0;
  font-size: 0.85rem;
  color: var(--color-muted);
}
.toolbar {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
@media (max-width: 800px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
}
.inp {
  min-height: 40px;
  border: 1px solid var(--color-gray-400);
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
  font: inherit;
  background: var(--color-white);
}
.table-wrap {
  background: var(--color-white);
  border: 1px solid var(--separator);
  border-radius: 12px;
  overflow: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
th,
td {
  text-align: left;
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid #eef1f5;
  vertical-align: top;
}
th {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-muted);
  background: #fafbfc;
  position: sticky;
  top: 0;
}
.row {
  cursor: pointer;
}
.row:hover {
  background: rgba(0, 174, 239, 0.04);
}
.parts-cell {
  max-width: 16rem;
}
.status {
  font: inherit;
  font-size: 0.8rem;
  border-radius: 6px;
  border: 1px solid var(--color-gray-400);
  padding: 0.25rem 0.35rem;
  background: var(--color-white);
}
.detail td {
  background: #f7f9fc;
}
dl {
  display: grid;
  gap: 0.65rem;
  margin: 0;
}
dl > div {
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 0.5rem;
}
dt {
  font-weight: 600;
  color: var(--color-muted);
  font-size: 0.8rem;
}
dd {
  margin: 0;
  white-space: pre-wrap;
}
.empty {
  padding: 1rem;
  color: var(--color-muted);
  margin: 0;
}
a {
  color: var(--color-red-cta);
}
</style>
