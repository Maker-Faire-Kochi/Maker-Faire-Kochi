<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const note = ref('')
const status = ref<'idle' | 'sending' | 'done' | 'error'>('idle')
const message = ref('')

async function submit() {
  status.value = 'sending'
  message.value = ''
  try {
    await $fetch('/api/admin/access-request', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        email: email.value.trim(),
        note: note.value.trim(),
      },
    })
    status.value = 'done'
    message.value =
      'Request sent. The owner must Accept it before you can sign in with a one-time code.'
    name.value = ''
    email.value = ''
    note.value = ''
  } catch (e: unknown) {
    status.value = 'error'
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
    message.value = err?.data?.statusMessage || err?.statusMessage || 'Could not send request'
  }
}
</script>

<template>
  <div class="req-card">
    <h1>Request organizer access</h1>
    <p class="sub">
      Accounts are not open signup. Submit a request — only the owner account can
      Accept it. After approval, sign in at login with email OTP.
    </p>

    <form v-if="status !== 'done'" @submit.prevent="submit">
      <label class="lbl" for="req-name">Your name</label>
      <input id="req-name" v-model="name" class="inp" type="text" required autocomplete="name" />

      <label class="lbl" for="req-email">Email</label>
      <input
        id="req-email"
        v-model="email"
        class="inp"
        type="email"
        required
        autocomplete="email"
      />

      <label class="lbl" for="req-note">Why do you need access? <span class="opt">(optional)</span></label>
      <textarea id="req-note" v-model="note" class="inp area" rows="3" />

      <button class="btn" type="submit" :disabled="status === 'sending'">
        {{ status === 'sending' ? 'Sending…' : 'Submit request' }}
      </button>
    </form>

    <p v-if="message" class="msg" :class="{ err: status === 'error', ok: status === 'done' }">
      {{ message }}
    </p>
    <a href="/admin/login" class="back">Back to login</a>
  </div>
</template>

<style scoped>
.req-card {
  max-width: 24rem;
  margin: 3rem auto;
  background: #fff;
  border: 1px solid var(--separator);
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
.opt {
  font-weight: 400;
  color: var(--color-muted);
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
.area {
  min-height: 5rem;
  resize: vertical;
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
  color: var(--color-red-cta);
}
.msg.ok {
  color: #0a6b3c;
}
.back {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-ink);
}
</style>
