<script setup lang="ts">
/**
 * OAuth / magic-link return URL. Exchanges the session from the URL hash or
 * code, then unlocks /admin only for organizers.
 */
definePageMeta({
  layout: 'admin',
  middleware: [],
})

useSeoMeta({ title: 'Signing in… — Maker Faire Kochi' })

const status = ref<'working' | 'ok' | 'fail'>('working')
const detail = ref('Finishing Google / email sign-in…')

onMounted(async () => {
  try {
    const { useAdminSupabase } = await import(
      '~/modules/admin/composables/useAdminSupabase'
    )
    const { isOrganizerUser, lockAdminSession } = await import(
      '~/modules/admin/composables/useAdminSession'
    )
    const supabase = useAdminSupabase()

    // PKCE: ?code=…  |  implicit/magic: tokens in hash (detectSessionInUrl)
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
    }

    // Give detectSessionInUrl a tick if hash tokens are present
    await new Promise((r) => setTimeout(r, 50))
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error

    if (!data.session) {
      status.value = 'fail'
      detail.value = 'No session found. Try signing in again.'
      await navigateTo({ path: '/admin/login', query: { reason: 'signedout' } })
      return
    }

    if (!isOrganizerUser(data.session.user)) {
      await lockAdminSession()
      status.value = 'fail'
      detail.value = 'Signed in, but not an organizer.'
      await navigateTo({ path: '/admin/login', query: { reason: 'forbidden' } })
      return
    }

    status.value = 'ok'
    detail.value = 'Unlocked. Opening dashboard…'
    await navigateTo('/admin')
  } catch (e: unknown) {
    status.value = 'fail'
    detail.value = e instanceof Error ? e.message : 'Sign-in failed'
    await navigateTo({
      path: '/admin/login',
      query: { reason: 'signedout' },
    })
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
