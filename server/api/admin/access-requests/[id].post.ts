export default defineEventHandler(async (event) => {
  const owner = await requireOwnerUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing request id' })
  }

  const body = await readBody<{ action?: string }>(event)
  const action = body?.action
  if (action !== 'approve' && action !== 'reject') {
    throw createError({ statusCode: 400, statusMessage: 'action must be approve or reject' })
  }

  const supabase = useSupabaseService()
  const { data: row, error: fetchErr } = await supabase
    .from('organizer_access_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !row) {
    throw createError({ statusCode: 404, statusMessage: 'Request not found' })
  }
  if (row.status !== 'pending') {
    throw createError({ statusCode: 409, statusMessage: `Already ${row.status}` })
  }

  if (action === 'reject') {
    const { error } = await supabase
      .from('organizer_access_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: owner.email,
      })
      .eq('id', id)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { ok: true, status: 'rejected' }
  }

  // Approve: create Auth user (or update existing) with organizer role.
  const { data: listed } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
  const existing = listed?.users?.find((u) => u.email?.toLowerCase() === row.email.toLowerCase())

  if (existing) {
    const { error: updErr } = await supabase.auth.admin.updateUserById(existing.id, {
      app_metadata: { ...existing.app_metadata, role: 'organizer' },
      email_confirm: true,
    })
    if (updErr) throw createError({ statusCode: 500, statusMessage: updErr.message })
  } else {
    const { error: createErr } = await supabase.auth.admin.createUser({
      email: row.email,
      email_confirm: true,
      user_metadata: { full_name: row.name },
      app_metadata: { role: 'organizer' },
    })
    if (createErr) throw createError({ statusCode: 500, statusMessage: createErr.message })
  }

  const { error: markErr } = await supabase
    .from('organizer_access_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: owner.email,
    })
    .eq('id', id)

  if (markErr) throw createError({ statusCode: 500, statusMessage: markErr.message })

  return { ok: true, status: 'approved', email: row.email }
})
