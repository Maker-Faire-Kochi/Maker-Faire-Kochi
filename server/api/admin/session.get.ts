/** Canonical UI gate: role plus the server-only configured owner email. */
export default defineEventHandler(async (event) => {
  const user = await requireConfiguredOwner(event)
  return { owner: true, email: user.email || '' }
})
