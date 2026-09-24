<script setup lang="ts">
/**
 * Magic-link return: finish session, then dashboard or waiting room.
 */
definePageMeta({
  layout: 'admin',
  middleware: [],
})

useSeoMeta({ title: 'Signing in… — Maker Faire Kochi' })

const status = ref<'working' | 'ok' | 'fail'>('working')
const detail = ref('Finishing sign-in…')

onMounted(async () => {
  try {
    const { useAdminSupabase } = await import(
      '~/modules/admin/composables/useAdminSupabase'
    )
    const { authHeaders, isStaffUser } = await import(
      '~/modules/admin/composables/useAdminSession'
    )
    const supabase = useAdminSupabase()

    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    const token_hash = url.searchParams.get('token_hash')
    const type = url.searchParams.get('type')

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
    } else if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'email' | 'magiclink',
      })
      if (error) throw error
    }

    await new Promise((r) => setTimeout(r, 50))
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (!data.session) {
      await navigateTo({ path: '/admin/login', query: { reason: 'signedout' } })
      return
    }

    if (isStaffUser(data.session.user)) {
      status.value = 'ok'
      await navigateTo('/admin')
      return
    }

    try {
      const headers = await authHeaders()
      await $fetch('/api/admin/register-pending', { method: 'POST', headers, body: {} })
    } catch {
      /* ignore */
    }
    status.value = 'ok'
    detail.value = 'Account created — waiting for owner approval…'
    await navigateTo('/admin/pending')
  } catch (e: unknown) {
    status.value = 'fail'
    detail.value = e instanceof Error ? e.message : 'Sign-in failed'
    await navigateTo({ path: '/admin/login', query: { reason: 'signedout' } })
  }
})
</script>

<template>
  <ClientOnly>
    <p class="boot" :class="status">{{ detail }}</p>
  </ClientOnly>
</template>

<style scoped>
.boot {
  margin: 4rem auto;
  max-width: 24rem;
  text-align: center;
  font-family: var(--font-body);
  color: var(--color-muted);
}
.boot.fail {
  color: var(--color-red-cta);
}
.boot.ok {
  color: var(--color-ink);
}
</style>
