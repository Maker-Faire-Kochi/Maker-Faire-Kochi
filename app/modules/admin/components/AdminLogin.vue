<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Lock } from '@lucide/vue'
import { useAdminSupabase } from '../composables/useAdminSupabase'
import { lockAdminSession } from '../composables/useAdminSession'

const email = ref('')
const status = ref<'idle' | 'sending' | 'sent' | 'oauth' | 'error'>('idle')
const message = ref('')
const route = useRoute()

const redirectTo = () => `${window.location.origin}/admin/callback`

const lockReason = computed(() => {
  const r = route.query.reason
  if (r === 'forbidden') {
    return 'That Google / email account signed in, but it is not an organizer. Access stays locked. In Supabase Auth → user → App metadata set { "role": "organizer" }, then sign in again.'
  }
  if (r === 'config') {
    return 'Admin is locked: Supabase URL / anon key are not configured on this deploy.'
  }
  if (r === 'signedout') {
    return 'You were signed out. Sign in with Google (Gmail) or a magic link to unlock.'
  }
  return ''
})

onMounted(async () => {
  try {
    const supabase = useAdminSupabase()
    const { data } = await supabase.auth.getSession()
    if (data.session?.user?.app_metadata?.role === 'organizer') {
      const next = typeof route.query.next === 'string' ? route.query.next : '/admin'
      await navigateTo(next.startsWith('/admin') ? next : '/admin')
    }
  } catch {
    /* config missing */
  }
})

async function signInWithGoogle() {
  status.value = 'oauth'
  message.value = ''
  try {
    const supabase = useAdminSupabase()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo(),
        queryParams: {
          // Prefer the account picker so organizers can choose the right Gmail.
          prompt: 'select_account',
          access_type: 'online',
        },
      },
    })
    if (error) throw error
    // Browser navigates to Google; no further UI.
  } catch (e: unknown) {
    status.value = 'error'
    message.value = e instanceof Error ? e.message : 'Google sign-in failed'
  }
}

async function sendMagicLink() {
  status.value = 'sending'
  message.value = ''
  try {
    const supabase = useAdminSupabase()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value.trim(),
      options: { emailRedirectTo: redirectTo() },
    })
    if (error) throw error
    status.value = 'sent'
    message.value =
      'Check Gmail (or your inbox) for the magic link. Open it to unlock the dashboard.'
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
      Sign in with <strong>Google (Gmail)</strong> via Supabase Auth. Only accounts
      with <code>app_metadata.role = organizer</code> unlock the panel.
    </p>

    <div v-if="lockReason" class="lock-banner" role="alert">
      {{ lockReason }}
    </div>

    <button
      type="button"
      class="btn google"
      :disabled="status === 'oauth'"
      @click="signInWithGoogle"
    >
      <svg class="g-icon" viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {{ status === 'oauth' ? 'Redirecting to Google…' : 'Continue with Google' }}
    </button>

    <div class="or" role="separator"><span>or magic link</span></div>

    <form @submit.prevent="sendMagicLink">
      <label class="lbl" for="admin-email">Organizer email (Gmail OK)</label>
      <input
        id="admin-email"
        v-model="email"
        class="inp"
        type="email"
        required
        autocomplete="email"
        placeholder="you@gmail.com"
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
.btn.google {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: 100%;
  min-height: 44px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #fff;
  color: #3c4043;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  margin-bottom: 0.25rem;
}
.btn.google:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: var(--color-cyan);
}
.btn.google:disabled {
  opacity: 0.7;
  cursor: wait;
}
.g-icon {
  flex-shrink: 0;
}
.or {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.1rem 0;
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.or::before,
.or::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--separator);
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
