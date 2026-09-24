/**
 * After signup OTP: enqueue this user for owner approval (idempotent).
 * Does not grant dashboard access.
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
    .select('id, status')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.status === 'approved') {
    return { ok: true, status: 'approved' as const }
  }
  if (existing?.status === 'pending') {
    return { ok: true, status: 'pending' as const, id: existing.id }
  }
  if (existing?.status === 'rejected') {
    // Allow a fresh pending request after rejection.
    await supabase.from('organizer_access_requests').delete().eq('id', existing.id)
  }

  const { data, error } = await supabase
    .from('organizer_access_requests')
    .insert({ name, email, note: 'Signed up via /admin/login', status: 'pending' })
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
