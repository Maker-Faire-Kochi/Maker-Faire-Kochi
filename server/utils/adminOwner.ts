import type { H3Event } from 'h3'
import type { SupabaseClient, User } from '@supabase/supabase-js'

/** The ONE account allowed into /admin. Server-only; never put it in `public`. */
export function ownerEmailFromConfig(): string {
  const config = useRuntimeConfig()
  return String(config.adminOwnerEmail || '').trim().toLowerCase()
}

async function bindOwnerUser(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase.from('admin_owner').upsert(
    {
      singleton: true,
      user_id: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'singleton' },
  )
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
}

/** Verify the bearer token against the server-only configured owner email. */
export async function requireConfiguredOwner(event: H3Event): Promise<User> {
  const auth = getRequestHeader(event, 'authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  const { data, error } = await useSupabaseAnon().auth.getUser(token)
  if (error || !data.user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
  }

  const owner = ownerEmailFromConfig()
  if (!owner || data.user.email?.toLowerCase() !== owner) {
    throw createError({ statusCode: 403, statusMessage: 'Owner access required' })
  }

  // First successful login binds this exact Auth user ID. Changing the configured
  // email and logging in as the new owner atomically replaces the old binding.
  await bindOwnerUser(useSupabaseService(), data.user.id)
  return data.user
}
