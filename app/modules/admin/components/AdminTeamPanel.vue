<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { authHeaders } from '../composables/useAdminSession'

export interface AccessRequest {
  id: string
  created_at: string
  name: string
  email: string
  note: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_at: string | null
  reviewed_by: string | null
}

const requests = ref<AccessRequest[]>([])
const loading = ref(true)
const error = ref('')
const busyId = ref<string | null>(null)
const filter = ref<'pending' | 'all'>('pending')

const shown = computed(() =>
  filter.value === 'pending'
    ? requests.value.filter((r) => r.status === 'pending')
    : requests.value,
)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const headers = await authHeaders()
    const res = await $fetch<{ requests: AccessRequest[] }>('/api/admin/access-requests', {
      headers,
    })
    requests.value = res.requests || []
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    error.value = err?.data?.statusMessage || err?.statusMessage || 'Failed to load requests'
  } finally {
    loading.value = false
  }
}

async function act(id: string, action: 'approve' | 'reject') {
  busyId.value = id
  error.value = ''
  try {
    const headers = await authHeaders()
    await $fetch(`/api/admin/access-requests/${id}`, {
      method: 'POST',
      headers,
      body: { action },
    })
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    error.value = err?.data?.statusMessage || err?.statusMessage || 'Action failed'
  } finally {
    busyId.value = null
  }
}

onMounted(load)
</script>

<template>
  <div class="team">
    <header class="head">
      <div>
        <h2>Team access</h2>
        <p class="sub">
          Only your owner account can accept these. Approving creates their Supabase
          login and sets <code>role: organizer</code>. They sign in with email OTP.
        </p>
      </div>
      <div class="filters">
        <button
          type="button"
          class="chip"
          :class="{ on: filter === 'pending' }"
          @click="filter = 'pending'"
        >
          Pending
        </button>
        <button
          type="button"
          class="chip"
          :class="{ on: filter === 'all' }"
          @click="filter = 'all'"
        >
          All
        </button>
        <button type="button" class="chip" @click="load">Refresh</button>
      </div>
    </header>

    <p v-if="loading" class="state">Loading…</p>
    <p v-else-if="error" class="state err">{{ error }}</p>
    <p v-else-if="!shown.length" class="state">No {{ filter === 'pending' ? 'pending ' : '' }}requests.</p>

    <ul v-else class="list">
      <li v-for="r in shown" :key="r.id" class="card">
        <div class="meta">
          <strong>{{ r.name }}</strong>
          <span class="email">{{ r.email }}</span>
          <span class="when">{{ new Date(r.created_at).toLocaleString() }}</span>
          <span class="status" :data-s="r.status">{{ r.status }}</span>
          <p v-if="r.note" class="note">{{ r.note }}</p>
        </div>
        <div v-if="r.status === 'pending'" class="actions">
          <button
            type="button"
            class="btn approve"
            :disabled="busyId === r.id"
            @click="act(r.id, 'approve')"
          >
            Accept
          </button>
          <button
            type="button"
            class="btn reject"
            :disabled="busyId === r.id"
            @click="act(r.id, 'reject')"
          >
            Reject
          </button>
        </div>
        <p v-else-if="r.reviewed_by" class="reviewed">
          {{ r.status }} by {{ r.reviewed_by }}
          <template v-if="r.reviewed_at">
            · {{ new Date(r.reviewed_at).toLocaleString() }}
          </template>
        </p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.team {
  margin-top: 0.25rem;
}
.head {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
h2 {
  margin: 0;
  font-size: 1.15rem;
}
.sub {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: var(--color-muted);
  max-width: 36rem;
  line-height: 1.45;
}
.sub code {
  font-size: 0.75rem;
  background: var(--bg-grouped);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}
.filters {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.chip {
  border: 1px solid var(--separator);
  background: var(--color-white);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-muted);
}
.chip.on {
  border-color: var(--color-cyan);
  color: var(--color-ink);
  background: rgba(0, 174, 239, 0.08);
}
.state {
  color: var(--color-muted);
}
.state.err {
  color: var(--color-red-cta);
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}
.card {
  background: var(--color-white);
  border: 1px solid var(--separator);
  border-radius: 12px;
  padding: 1rem 1.1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  justify-content: space-between;
  align-items: flex-start;
}
.meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 12rem;
}
.email {
  color: var(--color-ink);
  font-size: 0.9rem;
}
.when {
  font-size: 0.75rem;
  color: var(--color-muted);
}
.status {
  align-self: flex-start;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: var(--bg-grouped);
  color: var(--color-muted);
}
.status[data-s='pending'] {
  background: rgba(0, 174, 239, 0.12);
  color: var(--color-ink);
}
.status[data-s='approved'] {
  background: rgba(0, 140, 80, 0.12);
  color: #0a6b3c;
}
.status[data-s='rejected'] {
  background: rgba(196, 18, 26, 0.1);
  color: var(--color-red-cta);
}
.note {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: var(--color-muted);
}
.actions {
  display: flex;
  gap: 0.4rem;
}
.btn {
  min-height: 40px;
  padding: 0 0.9rem;
  border-radius: 8px;
  border: none;
  font: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.6;
  cursor: wait;
}
.btn.approve {
  background: var(--color-red-cta);
  color: #fff;
}
.btn.reject {
  background: var(--color-white);
  border: 1px solid var(--separator);
  color: var(--color-ink);
}
.reviewed {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-muted);
  width: 100%;
}
</style>
