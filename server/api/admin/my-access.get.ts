/** Signed-in user: am I approved yet? */
export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  if (isStaffRole(user) || isOwnerUser(user)) {
    return { status: 'approved' as const, email: user.email }
  }

  const email = (user.email || '').toLowerCase()
  const supabase = useSupabaseService()
  const { data } = await supabase
    .from('organizer_access_requests')
    .select('status, reviewed_at')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    status: (data?.status as 'pending' | 'approved' | 'rejected') || 'pending',
    email,
    reviewed_at: data?.reviewed_at || null,
  }
})
