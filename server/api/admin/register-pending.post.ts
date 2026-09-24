/**
 * After signup OTP: enqueue this user for owner approval (idempotent).
 * Stores auth user id so Approve can update without listUsers scans.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const email = (user.email || '').toLowerCase()
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Account has no email' })
  }

  if (isStaffRole(user) || isOwnerUser(user)) {
    return { ok: true, status: 'approved' as const }
  }

  const body = await readBody<{ name?: string }>(event)
  const name =
    String(body?.name || '').trim() ||
    String(user.user_metadata?.full_name || '').trim() ||
    email.split('@')[0]

  const supabase = useSupabaseService()

  const { data: existing } = await supabase
    .from('organizer_access_requests')
    .select('id, status, user_id')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.status === 'approved') {
    return { ok: true, status: 'approved' as const }
  }
  if (existing?.status === 'pending') {
    if (!existing.user_id) {
      await supabase
        .from('organizer_access_requests')
        .update({ user_id: user.id, name })
        .eq('id', existing.id)
    }
    return { ok: true, status: 'pending' as const, id: existing.id }
  }
  if (existing?.status === 'rejected') {
    await supabase.from('organizer_access_requests').delete().eq('id', existing.id)
  }

  const { data, error } = await supabase
    .from('organizer_access_requests')
    .insert({
      name,
      email,
      user_id: user.id,
      note: 'Signed up via /admin/login',
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { ok: true, status: 'pending' as const }
    }
    console.error('[register-pending]', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Could not register for approval' })
  }

  return { ok: true, status: 'pending' as const, id: data.id }
})
