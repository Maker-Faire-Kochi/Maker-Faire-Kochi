<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Lock } from '@lucide/vue'
import { useAdminSupabase } from '../composables/useAdminSupabase'
import { getAdminSession, lockAdminSession } from '../composables/useAdminSession'

const email = ref('')
const password = ref('')
const status = ref<'idle' | 'signing-in' | 'error'>('idle')
const message = ref('')
const route = useRoute()

const lockReason = computed(() => {
  const r = route.query.reason
  if (r === 'config') {
    return 'Admin is locked: Supabase URL / anon key are not configured on this deploy.'
  }
  if (r === 'forbidden') {
    return 'That account does not have access to this dashboard.'
  }
  if (r === 'signedout') {
    return 'You were signed out. Sign in again.'
  }
  return ''
})

function nextPath(): string {
  const n = route.query.next
  return typeof n === 'string' && n.startsWith('/admin') ? n : '/admin'
}

onMounted(async () => {
  try {
    const { owner } = await getAdminSession()
    if (owner) await navigateTo(nextPath())
  } catch {
    /* config missing */
  }
})

async function signIn() {
  status.value = 'signing-in'
  message.value = ''
  try {
    const supabase = useAdminSupabase()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim().toLowerCase(),
      password: password.value,
    })
    if (error) throw error

    const verified = await getAdminSession()
    if (!verified.owner) {
      await lockAdminSession()
      throw new Error('Owner access required')
    }
    await navigateTo(nextPath())
  } catch {
    status.value = 'error'
    message.value = 'Invalid email or password, or this account is not the configured owner.'
  }
}

async function forceLock() {
  try {
    await lockAdminSession()
  } catch {
    /* ignore */
  }
  password.value = ''
  message.value = 'Session cleared.'
  status.value = 'idle'
}
</script>

<template>
  <div class="login-card">
    <div class="lock-badge">
      <Lock :size="14" :stroke-width="2.5" aria-hidden="true" />
      Locked
    </div>
    <h1>Admin sign in</h1>
    <p class="sub">
      This dashboard belongs to one Supabase Auth account.
    </p>

    <div v-if="lockReason" class="lock-banner" role="alert">
      {{ lockReason }}
    </div>

    <form @submit.prevent="signIn">
      <label class="lbl" for="admin-email">Email</label>
      <input
        id="admin-email"
        v-model="email"
        class="inp"
        type="email"
        required
        autocomplete="email"
        placeholder="you@example.com"
      />
      <label class="lbl" for="admin-password">Password</label>
      <input
        id="admin-password"
        v-model="password"
        class="inp"
        type="password"
        autocomplete="current-password"
        required
      />
      <button class="btn" type="submit" :disabled="status === 'signing-in'">
        {{ status === 'signing-in' ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <p v-if="message" class="msg" :class="{ err: status === 'error' }">{{ message }}</p>
    <button type="button" class="linkish" @click="forceLock">
      Clear any local session
    </button>
  </div>
</template>

<style scoped>
.login-card {
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
.lock-banner {
  background: rgba(196, 18, 26, 0.08);
  border: 1px solid rgba(196, 18, 26, 0.28);
  border-radius: 8px;
  padding: 0.75rem 0.85rem;
  margin-bottom: 1rem;
  font-size: 0.8125rem;
  color: var(--color-red-cta);
  line-height: 1.45;
}
.lbl {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.35rem;
}
.inp {
  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  border: 1px solid #cfd6e0;
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  font: inherit;
  margin-bottom: 1rem;
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
.btn:disabled {
  opacity: 0.65;
  cursor: wait;
}
.msg {
  margin: 1rem 0 0;
  font-size: 0.875rem;
  color: var(--color-muted);
}
.msg.err {
  color: #9b1c1c;
}
.linkish {
  display: block;
  margin-top: 1.25rem;
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
