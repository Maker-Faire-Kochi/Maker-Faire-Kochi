export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string; email?: string; note?: string }>(event)
  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const note = String(body?.note || '').trim() || null

  if (!name || name.length > 120) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Valid email is required' })
  }

  const supabase = useSupabaseService()
  const { data, error } = await supabase
    .from('organizer_access_requests')
    .insert({ name, email, note, status: 'pending' })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({
        statusCode: 409,
        statusMessage: 'A pending request for that email already exists',
      })
    }
    console.error('[access-request]', error.message)
    throw createError({ statusCode: 500, statusMessage: 'Could not save request' })
  }

  return { ok: true, id: data.id }
})
