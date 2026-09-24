import type { H3Event } from 'h3'
import type { User } from '@supabase/supabase-js'

export function ownerEmailFromConfig(): string {
  const config = useRuntimeConfig()
  return String(config.adminOwnerEmail || '').trim().toLowerCase()
}

export function isStaffRole(user: User | null | undefined): boolean {
  const role = user?.app_metadata?.role
  if (role === 'organizer' || role === 'owner') return true
  return isOwnerUser(user)
}

export function isOwnerUser(user: User | null | undefined, ownerEmail?: string): boolean {
  if (!user) return false
  if (user.app_metadata?.role === 'owner') return true
  const owner = (ownerEmail ?? ownerEmailFromConfig()).toLowerCase()
  if (!owner || !user.email) return false
  return user.email.toLowerCase() === owner
}

async function userFromBearer(event: H3Event): Promise<User> {
  const auth = getHeader(event, 'authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Sign in required' })
  }

  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const anon = config.public.supabaseAnonKey as string
  if (!url || !anon) {
    throw createError({ statusCode: 500, statusMessage: 'Supabase config missing' })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
  }
  return data.user
}

/** Any signed-in Auth user (including awaiting approval). */
export async function requireAuthUser(event: H3Event): Promise<User> {
  return userFromBearer(event)
}

export async function requireStaffUser(event: H3Event): Promise<User> {
  const user = await userFromBearer(event)
  if (!isStaffRole(user) && !isOwnerUser(user)) {
    throw createError({ statusCode: 403, statusMessage: 'Not an organizer' })
  }
  return user
}

export async function requireOwnerUser(event: H3Event): Promise<User> {
  const user = await requireStaffUser(event)
  if (!isOwnerUser(user)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only the owner account can manage organizer access',
    })
  }
  return user
}
