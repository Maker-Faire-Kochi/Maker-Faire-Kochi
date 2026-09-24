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

  // Resolve Auth user: prefer stored user_id, else paginate by email.
  let authUserId: string | null = row.user_id || null

  if (!authUserId) {
    authUserId = await findAuthUserIdByEmail(supabase, row.email)
  }

  if (authUserId) {
    const { data: existing, error: getErr } = await supabase.auth.admin.getUserById(authUserId)
    if (getErr || !existing.user) {
      throw createError({
        statusCode: 500,
        statusMessage: getErr?.message || 'Auth user not found for this request',
      })
    }
    const { error: updErr } = await supabase.auth.admin.updateUserById(authUserId, {
      app_metadata: { ...existing.user.app_metadata, role: 'organizer' },
      email_confirm: true,
    })
    if (updErr) throw createError({ statusCode: 500, statusMessage: updErr.message })
  } else {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: row.email,
      email_confirm: true,
      user_metadata: { full_name: row.name },
      app_metadata: { role: 'organizer' },
    })
    if (createErr) throw createError({ statusCode: 500, statusMessage: createErr.message })
    authUserId = created.user?.id || null
  }

  const { error: markErr } = await supabase
    .from('organizer_access_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: owner.email,
      user_id: authUserId,
    })
    .eq('id', id)

  if (markErr) throw createError({ statusCode: 500, statusMessage: markErr.message })

  return { ok: true, status: 'approved', email: row.email }
})

async function findAuthUserIdByEmail(
  supabase: ReturnType<typeof useSupabaseService>,
  email: string,
): Promise<string | null> {
  const target = email.toLowerCase()
  let page = 1
  const perPage = 200
  // Hard cap so a runaway loop cannot hang the request.
  for (let i = 0; i < 25; i++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    const hit = data.users.find((u) => u.email?.toLowerCase() === target)
    if (hit) return hit.id
    if (!data.users.length || data.users.length < perPage) return null
    page += 1
  }
  return null
}
