<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Lock } from '@lucide/vue'
import { useAdminSupabase } from '../composables/useAdminSupabase'
import {
  authHeaders,
  isStaffUser,
  lockAdminSession,
} from '../composables/useAdminSession'

type Step = 'email' | 'otp'

const step = ref<Step>('email')
const email = ref('')
const otp = ref('')
const status = ref<'idle' | 'sending' | 'verifying' | 'error'>('idle')
const message = ref('')
const route = useRoute()

const redirectTo = () => `${window.location.origin}/admin/callback`

const lockReason = computed(() => {
  const r = route.query.reason
  if (r === 'config') {
    return 'Admin is locked: Supabase URL / anon key are not configured on this deploy.'
  }
  if (r === 'signedout') {
    return 'You were signed out. Sign up or sign in with your email for a one-time code.'
  }
  return ''
})

async function routeAfterSession() {
  const supabase = useAdminSupabase()
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    await navigateTo('/admin/login')
    return
  }
  if (isStaffUser(data.session.user)) {
    await navigateTo('/admin')
    return
  }
  try {
    const headers = await authHeaders()
    await $fetch('/api/admin/register-pending', {
      method: 'POST',
      headers,
      body: {},
    })
  } catch {
    /* still send them to waiting room */
  }
  await navigateTo('/admin/pending')
}

onMounted(async () => {
  try {
    const supabase = useAdminSupabase()
    const { data } = await supabase.auth.getSession()
    if (data.session) await routeAfterSession()
  } catch {
    /* config missing */
  }
})

async function sendOtp() {
  status.value = 'sending'
  message.value = ''
  const addr = email.value.trim().toLowerCase()
  try {
    const supabase = useAdminSupabase()
    // Signup allowed; dashboard still closed until owner Approves.
    const { error } = await supabase.auth.signInWithOtp({
      email: addr,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo(),
      },
    })
    if (error) throw error
    step.value = 'otp'
    status.value = 'idle'
    message.value = 'Check your email for a 6-digit code (and/or magic link).'
  } catch (e: unknown) {
    status.value = 'error'
    message.value = e instanceof Error ? e.message : 'Could not send code'
  }
}

async function verifyOtp() {
  status.value = 'verifying'
  message.value = ''
  try {
    const supabase = useAdminSupabase()
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.value.trim().toLowerCase(),
      token: otp.value.trim(),
      type: 'email',
    })
    if (error) throw error
    if (!data.session) {
      throw new Error('No session after code')
    }
    await routeAfterSession()
  } catch (e: unknown) {
    status.value = 'error'
    message.value = e instanceof Error ? e.message : 'Invalid or expired code'
  }
}

function backToEmail() {
  step.value = 'email'
  otp.value = ''
  message.value = ''
  status.value = 'idle'
}

async function forceLock() {
  try {
    await lockAdminSession()
  } catch {
    /* ignore */
  }
  step.value = 'email'
  otp.value = ''
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
    <h1>Organizer sign in</h1>
    <p class="sub">
      Sign up with your email and a one-time code. After signup the dashboard stays
      <strong>closed</strong> until the owner Approves you in Team.
    </p>

    <div v-if="lockReason" class="lock-banner" role="alert">
      {{ lockReason }}
    </div>

    <form v-if="step === 'email'" @submit.prevent="sendOtp">
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
      <button class="btn" type="submit" :disabled="status === 'sending'">
        {{ status === 'sending' ? 'Sending code…' : 'Continue with email' }}
      </button>
    </form>

    <form v-else @submit.prevent="verifyOtp">
      <p class="sent-to">
        Code sent to <strong>{{ email }}</strong>
        <button type="button" class="change" @click="backToEmail">Change</button>
      </p>
      <label class="lbl" for="admin-otp">One-time code</label>
      <input
        id="admin-otp"
        v-model="otp"
        class="inp otp"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="one-time-code"
        required
        maxlength="8"
        placeholder="123456"
      />
      <button class="btn" type="submit" :disabled="status === 'verifying' || otp.trim().length < 6">
        {{ status === 'verifying' ? 'Signing in…' : 'Verify code' }}
      </button>
      <button
        type="button"
        class="btn secondary"
        :disabled="status === 'sending'"
        @click="sendOtp"
      >
        Resend code
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
.sent-to {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}
.change {
  margin-left: 0.5rem;
  border: none;
  background: none;
  color: var(--color-cyan);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
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
.inp.otp {
  letter-spacing: 0.35em;
  font-size: 1.25rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: center;
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
.btn.secondary {
  margin-top: 0.5rem;
  background: var(--color-white);
  color: var(--color-ink);
  border: 1px solid var(--separator);
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
