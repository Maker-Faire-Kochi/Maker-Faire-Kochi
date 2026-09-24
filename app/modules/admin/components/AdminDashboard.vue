<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminSupabase } from '../composables/useAdminSupabase'
import type { InterestResponseRow } from '~~/shared/interest/types'
import { PARTICIPATION, STATUSES } from '~~/shared/interest/constants'

const rows = ref<InterestResponseRow[]>([])
const loading = ref(true)
const error = ref('')
const filterStatus = ref('')
const filterPart = ref('')
const search = ref('')
const openId = ref<string | null>(null)
const roleOk = ref(false)

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

const metrics = computed(() => {
  const all = rows.value
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const byPart = new Map<string, number>()
  for (const r of all) {
    for (const p of r.participation) {
      byPart.set(p, (byPart.get(p) || 0) + 1)
    }
  }
  const label = (v: string) => PARTICIPATION.find((p) => p.value === v)?.label || v
  return {
    total: all.length,
    week: all.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length,
    exhibit: all.filter((r) => r.participation.includes('exhibit')).length,
    volunteer: all.filter((r) => r.participation.includes('volunteer')).length,
    sponsor: all.filter((r) => r.participation.includes('sponsor')).length,
    topParticipation: [...byPart.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([value, count]) => ({ label: label(value), count })),
  }
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
    const role = sessionData.session.user.app_metadata?.role
    roleOk.value = role === 'organizer'
    if (!roleOk.value) {
      error.value = 'Signed in, but this account is not an organizer. Ask for app_metadata.role = organizer.'
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

onMounted(load)
</script>

<template>
  <div>
    <div class="bar">
      <h1>Interest responses</h1>
      <button type="button" class="ghost" @click="signOut">Sign out</button>
    </div>

    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="err">{{ error }}</p>

    <template v-else-if="roleOk">
      <div class="metrics">
        <div class="metric"><span class="n">{{ metrics.total }}</span><span class="l">Total</span></div>
        <div class="metric"><span class="n">{{ metrics.week }}</span><span class="l">Last 7 days</span></div>
        <div class="metric"><span class="n">{{ metrics.exhibit }}</span><span class="l">Exhibit intent</span></div>
        <div class="metric"><span class="n">{{ metrics.volunteer }}</span><span class="l">Volunteer</span></div>
        <div class="metric"><span class="n">{{ metrics.sponsor }}</span><span class="l">Sponsor</span></div>
      </div>

      <div v-if="metrics.topParticipation.length" class="parts">
        <h2>By participation</h2>
        <ul>
          <li v-for="p in metrics.topParticipation" :key="p.label">
            <span>{{ p.label }}</span>
            <strong>{{ p.count }}</strong>
          </li>
        </ul>
      </div>

      <div class="filters">
        <input v-model="search" class="inp" type="search" placeholder="Search name, email, org…" />
        <select v-model="filterStatus" class="inp">
          <option value="">All statuses</option>
          <option v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <select v-model="filterPart" class="inp">
          <option value="">All participation</option>
          <option v-for="p in PARTICIPATION" :key="p.value" :value="p.value">{{ p.label }}</option>
        </select>
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
                <td>{{ new Date(r.created_at).toLocaleDateString() }}</td>
                <td>{{ r.name }}</td>
                <td>{{ r.email }}</td>
                <td class="parts-cell">{{ r.participation.join(', ') }}</td>
                <td @click.stop>
                  <select :value="r.status" class="status" @change="setStatus(r.id, ($event.target as HTMLSelectElement).value)">
                    <option v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
                  </select>
                </td>
              </tr>
              <tr v-if="openId === r.id" class="detail">
                <td colspan="5">
                  <dl>
                    <div><dt>Location</dt><dd>{{ r.location }}</dd></div>
                    <div><dt>Describes</dt><dd>{{ r.self_describe }}{{ r.self_describe_other ? ` — ${r.self_describe_other}` : '' }}</dd></div>
                    <div v-if="r.make_possible"><dt>Make possible</dt><dd>{{ r.make_possible }}</dd></div>
                    <div v-if="r.contribute_text"><dt>Contribute</dt><dd>{{ r.contribute_text }}</dd></div>
                    <div v-if="r.project_description"><dt>Project</dt><dd>{{ r.project_description }}</dd></div>
                    <div v-if="r.project_categories?.length"><dt>Categories</dt><dd>{{ r.project_categories.join(', ') }}</dd></div>
                    <div v-if="r.volunteer_areas?.length"><dt>Volunteer</dt><dd>{{ r.volunteer_areas.join(', ') }} ({{ r.volunteer_time }})</dd></div>
                    <div v-if="r.org_name"><dt>Org</dt><dd>{{ r.org_name }} — collab: {{ r.org_collaborate }}</dd></div>
                    <div v-if="r.heard_from"><dt>Heard from</dt><dd>{{ r.heard_from }}{{ r.heard_from_other ? ` — ${r.heard_from_other}` : '' }}</dd></div>
                    <div v-if="r.anything_else"><dt>Else</dt><dd>{{ r.anything_else }}</dd></div>
                    <div v-if="r.phone"><dt>Phone</dt><dd>{{ r.phone }}</dd></div>
                  </dl>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <p v-if="!filtered.length" class="empty">No responses match.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
h1 {
  margin: 0;
  font-size: 1.35rem;
}
h2 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
}
.ghost {
  background: transparent;
  border: 1px solid #cfd6e0;
  border-radius: 8px;
  min-height: 40px;
  padding: 0 0.85rem;
  cursor: pointer;
  font: inherit;
}
.err {
  color: #9b1c1c;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}
.metric {
  background: #fff;
  border: 1px solid #e5e9ef;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.metric .n {
  font-size: 1.5rem;
  font-weight: 700;
}
.metric .l {
  font-size: 0.75rem;
  color: var(--color-muted);
}
.parts {
  background: #fff;
  border: 1px solid #e5e9ef;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.parts ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.35rem;
}
.parts li {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  gap: 1rem;
}
.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
@media (max-width: 720px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
.inp {
  min-height: 40px;
  border: 1px solid #cfd6e0;
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
  font: inherit;
  background: #fff;
}
.table-wrap {
  background: #fff;
  border: 1px solid #e5e9ef;
  border-radius: 10px;
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
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-muted);
  background: #fafbfc;
}
.row {
  cursor: pointer;
}
.row:hover {
  background: #f7f9fc;
}
.parts-cell {
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.status {
  font: inherit;
  font-size: 0.8rem;
  border-radius: 6px;
  border: 1px solid #cfd6e0;
  padding: 0.25rem 0.35rem;
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
</style>
