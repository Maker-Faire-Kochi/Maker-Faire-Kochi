import type { Session, User } from '@supabase/supabase-js'
import { useAdminSupabase } from './useAdminSupabase'

export function isStaffUser(user: User | null | undefined): boolean {
  const role = user?.app_metadata?.role
  if (role === 'organizer' || role === 'owner') return true
  // Bootstrap: NUXT_ADMIN_OWNER_EMAIL match counts as staff even before role is set.
  return isOwnerUser(user)
}

/** @deprecated use isStaffUser */
export function isOrganizerUser(user: User | null | undefined): boolean {
  return isStaffUser(user)
}

export function isOwnerUser(
  user: User | null | undefined,
  ownerEmail?: string,
): boolean {
  if (!user) return false
  if (user.app_metadata?.role === 'owner') return true
  const config = useRuntimeConfig()
  const owner = (ownerEmail ?? String(config.public.adminOwnerEmail || ''))
    .trim()
    .toLowerCase()
  if (!owner || !user.email) return false
  return user.email.toLowerCase() === owner
}

export async function getAdminSession(): Promise<{
  session: Session | null
  organizer: boolean
  owner: boolean
}> {
  const supabase = useAdminSupabase()
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    return { session: null, organizer: false, owner: false }
  }
  const session = data.session
  return {
    session,
    organizer: isStaffUser(session?.user),
    owner: isOwnerUser(session?.user),
  }
}

export async function authHeaders(): Promise<Record<string, string>> {
  const supabase = useAdminSupabase()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function lockAdminSession(): Promise<void> {
  const supabase = useAdminSupabase()
  await supabase.auth.signOut()
}
