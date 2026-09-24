/**
 * Auth gate for /admin/*
 * - login / callback: public
 * - pending: signed-in, not yet staff
 * - dashboard (and rest): staff only
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (
    to.path === '/admin/login' ||
    to.path.startsWith('/admin/login/') ||
    to.path === '/admin/callback' ||
    to.path.startsWith('/admin/callback/')
  ) {
    return
  }

  if (import.meta.server) return

  const config = useRuntimeConfig()
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    return navigateTo({ path: '/admin/login', query: { reason: 'config' } })
  }

  const { getAdminSession } = await import('~/modules/admin/composables/useAdminSession')
  const { session, organizer } = await getAdminSession()
  const isPendingRoute = to.path === '/admin/pending' || to.path.startsWith('/admin/pending/')

  if (!session) {
    return navigateTo({ path: '/admin/login', query: { next: to.fullPath } })
  }

  if (organizer) {
    if (isPendingRoute) return navigateTo('/admin')
    return
  }

  // Signed in, not approved → waiting room only
  if (!isPendingRoute) {
    return navigateTo('/admin/pending')
  }
})
