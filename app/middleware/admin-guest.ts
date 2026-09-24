/** Login page: an owner session skips straight to the dashboard. */
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const config = useRuntimeConfig()
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) return

  try {
    const { getAdminSession } = await import('~/modules/admin/composables/useAdminSession')
    const { owner } = await getAdminSession()
    if (owner) return navigateTo('/admin')
  } catch {
    // Missing config / client — stay on login
  }
})
