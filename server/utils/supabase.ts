import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function useSupabaseAnon(): SupabaseClient {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const key = config.public.supabaseAnonKey as string
  if (!url || !key) {
    throw createError({ statusCode: 500, statusMessage: 'Supabase public config missing' })
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function useSupabaseService(): SupabaseClient {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const key = config.supabaseServiceRoleKey as string
  if (!url || !key) {
    throw createError({ statusCode: 500, statusMessage: 'Supabase service config missing' })
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
