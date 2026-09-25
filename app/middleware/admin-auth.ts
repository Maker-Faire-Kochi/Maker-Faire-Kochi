/** /admin is owner-only. Any other session is signed out. */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const config = useRuntimeConfig()
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    return navigateTo({ path: '/admin/login', query: { reason: 'config' } })
  }

  const { getAdminSession, lockAdminSession } = await import(
    '~/modules/admin/composables/useAdminSession'
  )
  const { session, owner } = await getAdminSession()

  if (!session) {
    return navigateTo({ path: '/admin/login', query: { next: to.fullPath } })
  }
  if (!owner) {
    await lockAdminSession()
    return navigateTo({ path: '/admin/login', query: { reason: 'forbidden' } })
  }
})
