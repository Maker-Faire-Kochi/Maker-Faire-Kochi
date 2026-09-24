<script setup lang="ts">
import { ref } from 'vue'
import { useAdminSupabase } from '../composables/useAdminSupabase'

const email = ref('')
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const message = ref('')

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
    message.value = 'Check your email for the magic link.'
  } catch (e: unknown) {
    status.value = 'error'
    message.value = e instanceof Error ? e.message : 'Could not send magic link'
  }
}
</script>

<template>
  <div class="login-card">
    <h1>Organizer dashboard</h1>
    <p class="sub">
      Magic link access to interest-form analytics and responses (Google Forms–style summary).
      Only emails with <code>app_metadata.role = organizer</code> can load data.
    </p>
    <form @submit.prevent="sendLink">
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
        {{ status === 'sending' ? 'Sending…' : 'Email me a link' }}
      </button>
    </form>
    <p v-if="message" class="msg" :class="{ err: status === 'error' }">{{ message }}</p>
  </div>
</template>

<style scoped>
.login-card {
  max-width: 24rem;
  margin: 3rem auto;
  background: #fff;
  border: 1px solid #e5e9ef;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.05);
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
</style>
