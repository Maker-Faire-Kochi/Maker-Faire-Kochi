import type { SupabaseClient } from '@supabase/supabase-js'

/** The ONE account allowed into /admin. Server-only; never put it in `public`. */
export function ownerEmailFromConfig(): string {
  const config = useRuntimeConfig()
  return String(config.adminOwnerEmail || '').trim().toLowerCase()
}

async function findUserIdByEmail(supabase: SupabaseClient, email: string): Promise<string | null> {
  const perPage = 200
  for (let page = 1; page <= 25; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    const hit = data.users.find((u) => u.email?.toLowerCase() === email)
    if (hit) return hit.id
    if (data.users.length < perPage) return null
  }
  return null
}

/**
 * Make sure the owner's Auth user exists and carries `app_metadata.role = owner`,
 * which is what the RLS policies read. Runs before the code is sent, so the JWT
 * issued on verify already has the role and public sign-ups can stay disabled.
 */
export async function ensureOwnerAccount(email: string): Promise<void> {
  const supabase = useSupabaseService()
  const id = await findUserIdByEmail(supabase, email)

  if (!id) {
    const { error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: { role: 'owner' },
    })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return
  }

  const { data, error } = await supabase.auth.admin.getUserById(id)
  if (error || !data.user) {
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Owner lookup failed' })
  }
  if (data.user.app_metadata?.role === 'owner') return

  const { error: updErr } = await supabase.auth.admin.updateUserById(id, {
    app_metadata: { ...data.user.app_metadata, role: 'owner' },
  })
  if (updErr) throw createError({ statusCode: 500, statusMessage: updErr.message })
}
