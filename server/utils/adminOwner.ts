import type { H3Event } from 'h3'
import type { SupabaseClient, User } from '@supabase/supabase-js'

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
async function bindOwnerUser(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data: current, error: currentErr } = await supabase
    .from('admin_owner')
    .select('user_id')
    .eq('singleton', true)
    .maybeSingle()
  if (currentErr) throw createError({ statusCode: 500, statusMessage: currentErr.message })

  const { error } = await supabase.from('admin_owner').upsert(
    {
      singleton: true,
      user_id: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'singleton' },
  )
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // The ID binding already revokes the previous owner's live JWT. Clear the
  // stale role as well so a later token refresh cannot make it look valid.
  const previousId = current?.user_id as string | undefined
  if (!previousId || previousId === userId) return
  const { data } = await supabase.auth.admin.getUserById(previousId)
  if (data.user?.app_metadata?.role !== 'owner') return
  const { role: _role, ...appMetadata } = data.user.app_metadata
  const { error: revokeErr } = await supabase.auth.admin.updateUserById(previousId, {
    app_metadata: appMetadata,
  })
  if (revokeErr) {
    console.error('[admin-owner] previous role cleanup failed', revokeErr.message)
  }
}

export async function ensureOwnerAccount(email: string): Promise<User> {
  const supabase = useSupabaseService()
  let id = await findUserIdByEmail(supabase, email)

  if (!id) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: { role: 'owner' },
    })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    id = data.user.id
  }

  const { data, error } = await supabase.auth.admin.getUserById(id)
  if (error || !data.user) {
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Owner lookup failed' })
  }
  let user = data.user
  if (user.app_metadata?.role !== 'owner') {
    const { data: updated, error: updErr } = await supabase.auth.admin.updateUserById(id, {
      app_metadata: { ...user.app_metadata, role: 'owner' },
    })
    if (updErr || !updated.user) {
      throw createError({ statusCode: 500, statusMessage: updErr?.message || 'Owner update failed' })
    }
    user = updated.user
  }

  await bindOwnerUser(supabase, id)
  return user
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
  if (
    !owner ||
    data.user.email?.toLowerCase() !== owner ||
    data.user.app_metadata?.role !== 'owner'
  ) {
    throw createError({ statusCode: 403, statusMessage: 'Owner access required' })
  }

  // Repairs an absent binding after migration and rotates it when the configured
  // owner changes. RLS then rejects the previous user's existing access token.
  await bindOwnerUser(useSupabaseService(), data.user.id)
  return data.user
}
