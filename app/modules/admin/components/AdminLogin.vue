<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Lock } from '@lucide/vue'
import { useAdminSupabase } from '../composables/useAdminSupabase'
import { lockAdminSession } from '../composables/useAdminSession'

const email = ref('')
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const message = ref('')
const route = useRoute()

const lockReason = computed(() => {
  const r = route.query.reason
  if (r === 'forbidden') {
    return 'That account is signed in but is not an organizer. Access is locked. Ask for app_metadata.role = "organizer" in Supabase Auth, then try again.'
  }
  if (r === 'config') {
    return 'Admin is locked: Supabase URL / anon key are not configured on this deploy.'
  }
  if (r === 'signedout') {
    return 'You were signed out. Sign in again to unlock the dashboard.'
  }
  return ''
})

onMounted(async () => {
  // Consume magic-link tokens in the URL (if any) before offering a new login.
  try {
    const supabase = useAdminSupabase()
    const { data } = await supabase.auth.getSession()
    if (data.session?.user?.app_metadata?.role === 'organizer') {
      const next = typeof route.query.next === 'string' ? route.query.next : '/admin'
      await navigateTo(next.startsWith('/admin') ? next : '/admin')
    }
  } catch {
    /* config missing — form still useful for messaging */
  }
})

async function sendLink() {
  status.value = 'sending'
  message.value = ''
  try {
    const supabase = useAdminSupabase()
    const redirectTo = `${window.location.origin}/admin`
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value.trim(),
      options: { emailRedirectTo: redirectTo },
    })
    if (error) throw error
    status.value = 'sent'
    message.value = 'Check your email for the magic link. The dashboard stays locked until you open it.'
  } catch (e: unknown) {
    status.value = 'error'
    message.value = e instanceof Error ? e.message : 'Could not send magic link'
  }
}

async function forceLock() {
  try {
    await lockAdminSession()
  } catch {
    /* ignore */
  }
  message.value = 'Session cleared. Dashboard is locked.'
  status.value = 'idle'
}
</script>

<template>
  <div class="login-card">
    <div class="lock-badge">
      <Lock :size="14" :stroke-width="2.5" aria-hidden="true" />
      Locked
    </div>
    <h1>Organizer dashboard</h1>
    <p class="sub">
      Magic-link access only. The panel stays locked until a verified organizer
      session is open (<code>app_metadata.role = organizer</code>).
    </p>

    <div v-if="lockReason" class="lock-banner" role="alert">
      {{ lockReason }}
    </div>

    <form @submit.prevent="sendLink">
      <label class="lbl" for="admin-email">Organizer email</label>
      <input
        id="admin-email"
        v-model="email"
        class="inp"
        type="email"
        required
        autocomplete="email"
        placeholder="you@example.com"
      />
      <button class="btn" type="submit" :disabled="status === 'sending'">
        {{ status === 'sending' ? 'Sending…' : 'Email me an unlock link' }}
      </button>
    </form>
    <p v-if="message" class="msg" :class="{ err: status === 'error' }">{{ message }}</p>
    <button type="button" class="linkish" @click="forceLock">
      Clear any local session (re-lock)
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
.sub code {
  font-size: 0.75rem;
  background: var(--bg-grouped);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
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
