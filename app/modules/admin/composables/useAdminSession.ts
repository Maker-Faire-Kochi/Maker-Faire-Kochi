import type { Session, User } from '@supabase/supabase-js'
import { useAdminSupabase } from './useAdminSupabase'

export function isOrganizerUser(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === 'organizer'
}

export async function getAdminSession(): Promise<{
  session: Session | null
  organizer: boolean
}> {
  const supabase = useAdminSupabase()
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    return { session: null, organizer: false }
  }
  const session = data.session
  return {
    session,
    organizer: isOrganizerUser(session?.user),
  }
}

/** Sign out and clear local session — used when role check fails or user locks out. */
export async function lockAdminSession(): Promise<void> {
  const supabase = useAdminSupabase()
  await supabase.auth.signOut()
}
