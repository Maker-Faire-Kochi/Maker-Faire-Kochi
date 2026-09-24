<script setup lang="ts">
/**
 * After signup OTP: account exists but dashboard stays closed until owner Approves.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { Lock } from '@lucide/vue'
import { useAdminSupabase } from '../composables/useAdminSupabase'
import { authHeaders, isStaffUser, lockAdminSession } from '../composables/useAdminSession'

const email = ref('')
const status = ref<'pending' | 'rejected' | 'checking'>('checking')
const message = ref('')

async function refresh() {
  status.value = 'checking'
  try {
    const supabase = useAdminSupabase()
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      await navigateTo('/admin/login')
      return
    }
    email.value = data.session.user.email || ''
    if (isStaffUser(data.session.user)) {
      await navigateTo('/admin')
      return
    }
    // Force refresh JWT in case owner just approved
    await supabase.auth.refreshSession()
    const again = await supabase.auth.getSession()
    if (again.data.session && isStaffUser(again.data.session.user)) {
      await navigateTo('/admin')
      return
    }

    const headers = await authHeaders()
    const res = await $fetch<{ status: string }>('/api/admin/my-access', { headers })
    if (res.status === 'approved') {
      await supabase.auth.refreshSession()
      await navigateTo('/admin')
      return
    }
    status.value = res.status === 'rejected' ? 'rejected' : 'pending'
  } catch (e: unknown) {
    status.value = 'pending'
    message.value = e instanceof Error ? e.message : ''
  }
}

async function signOut() {
  await lockAdminSession()
  await navigateTo({ path: '/admin/login', query: { reason: 'signedout' } })
}

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  refresh()
  timer = setInterval(refresh, 15000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="wait-card">
    <div class="lock-badge">
      <Lock :size="14" :stroke-width="2.5" aria-hidden="true" />
      Closed
    </div>
    <h1>Waiting for approval</h1>
    <p class="sub">
      You’re signed in as <strong>{{ email || '…' }}</strong>. The dashboard stays closed
      until the owner Accepts your account.
    </p>

    <p v-if="status === 'checking'" class="state">Checking…</p>
    <p v-else-if="status === 'pending'" class="state">
      Request pending. You’ll get in after approval — tap Refresh or wait.
    </p>
    <p v-else-if="status === 'rejected'" class="state err">
      Your request was rejected. Contact the owner if that was a mistake.
    </p>
    <p v-if="message" class="state err">{{ message }}</p>

    <button type="button" class="btn" @click="refresh">Refresh status</button>
    <button type="button" class="linkish" @click="signOut">Sign out</button>
  </div>
</template>

<style scoped>
.wait-card {
  max-width: 24rem;
  margin: 3rem auto;
  background: #fff;
  border: 1px solid var(--separator);
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.05);
}
.lock-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-red-cta);
  background: rgba(196, 18, 26, 0.08);
  border: 1px solid rgba(196, 18, 26, 0.25);
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  margin-bottom: 0.85rem;
}
h1 {
  margin: 0 0 0.5rem;
  font-size: 1.35rem;
  font-weight: 700;
}
.sub {
  margin: 0 0 1.25rem;
  color: var(--color-muted);
  font-size: 0.875rem;
  line-height: 1.45;
}
.state {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: var(--color-ink);
  line-height: 1.45;
}
.state.err {
  color: var(--color-red-cta);
}
.btn {
  width: 100%;
  min-height: 44px;
  border: none;
  border-radius: 8px;
  background: var(--color-red-cta);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.linkish {
  display: block;
  margin-top: 1rem;
  width: 100%;
  border: none;
  background: transparent;
  color: var(--color-muted);
  font: inherit;
  font-size: 0.8rem;
  text-decoration: underline;
  cursor: pointer;
  text-underline-offset: 2px;
}
</style>
