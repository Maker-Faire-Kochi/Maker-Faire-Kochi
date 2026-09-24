export default defineEventHandler(async (event) => {
  await requireOwnerUser(event)
  const supabase = useSupabaseService()
  const { data, error } = await supabase
    .from('organizer_access_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return { requests: data || [] }
})
