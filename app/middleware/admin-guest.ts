/**
 * Login page: if an organizer session already exists, skip the form.
 */
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const config = useRuntimeConfig()
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) return

  try {
    const { getAdminSession } = await import(
      '~/modules/admin/composables/useAdminSession'
    )
    const { organizer } = await getAdminSession()
    if (organizer) {
      return navigateTo('/admin')
    }
  } catch {
    // Missing config / client — stay on login
  }
})
