import type { Session } from '@supabase/supabase-js'
import { useAdminSupabase } from './useAdminSupabase'

export async function hasOwnerAccess(accessToken: string): Promise<boolean> {
  try {
    const result = await $fetch<{ owner: boolean }>('/api/admin/session', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return result.owner === true
  } catch {
    return false
  }
}

export async function getAdminSession(): Promise<{ session: Session | null; owner: boolean }> {
  const supabase = useAdminSupabase()
  const { data, error } = await supabase.auth.getSession()
  if (error) return { session: null, owner: false }
  const session = data.session
  if (!session) return { session, owner: false }

  return { session, owner: await hasOwnerAccess(session.access_token) }
}

export async function lockAdminSession(): Promise<void> {
  await useAdminSupabase().auth.signOut()
}
