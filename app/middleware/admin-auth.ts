/**
 * Locks /admin (dashboard). Login stays public.
 * Requires a live Supabase session + app_metadata.role === 'organizer'.
 * Admin routes are SPA-only (see nuxt.config routeRules) so this always runs
 * in the browser before the panel paints.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login' || to.path.startsWith('/admin/login/')) {
    return
  }

  if (import.meta.server) {
    return
  }

  const config = useRuntimeConfig()
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    return navigateTo({
      path: '/admin/login',
      query: { reason: 'config' },
    })
  }

  const { getAdminSession, lockAdminSession } = await import(
    '~/modules/admin/composables/useAdminSession'
  )

  const { session, organizer } = await getAdminSession()

  if (!session) {
    return navigateTo({
      path: '/admin/login',
      query: { next: to.fullPath },
    })
  }

  if (!organizer) {
    // Do not leave a signed-in non-organizer session hanging around the panel.
    await lockAdminSession()
    return navigateTo({
      path: '/admin/login',
      query: { reason: 'forbidden' },
    })
  }
})
