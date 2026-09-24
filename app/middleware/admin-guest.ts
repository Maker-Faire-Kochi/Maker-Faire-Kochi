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
    const { session, organizer } = await getAdminSession()
    if (organizer) {
      return navigateTo('/admin')
    }
    if (session) {
      return navigateTo('/admin/pending')
    }
  } catch {
    // Missing config / client — stay on login
  }
})
