/**
 * Locks /admin (dashboard). Login + OAuth callback stay public.
 * Requires a live Supabase session + app_metadata.role === 'organizer'.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (
    to.path === '/admin/login' ||
    to.path.startsWith('/admin/login/') ||
    to.path === '/admin/callback' ||
    to.path.startsWith('/admin/callback/') ||
    to.path === '/admin/request' ||
    to.path.startsWith('/admin/request/')
  ) {
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
    // Do not leave a signed-in non-staff session hanging around the panel.
    await lockAdminSession()
    return navigateTo({
      path: '/admin/login',
      query: { reason: 'forbidden' },
    })
  }
})
