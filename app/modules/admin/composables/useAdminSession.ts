import type { Session, User } from '@supabase/supabase-js'
import { useAdminSupabase } from './useAdminSupabase'

/**
 * UI gate only. The real lock is RLS, which reads the same claim; the role is
 * set server-side by /api/admin/send-code and cannot be written by a client.
 */
export function isOwnerUser(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === 'owner'
}

export async function getAdminSession(): Promise<{ session: Session | null; owner: boolean }> {
  const supabase = useAdminSupabase()
  const { data, error } = await supabase.auth.getSession()
  if (error) return { session: null, owner: false }
  return { session: data.session, owner: isOwnerUser(data.session?.user) }
}

export async function lockAdminSession(): Promise<void> {
  await useAdminSupabase().auth.signOut()
}
