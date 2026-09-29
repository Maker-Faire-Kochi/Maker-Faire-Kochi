/**
 * A reload always starts at the top of the sheet. The browser would otherwise
 * restore the old scroll position, or jump to a leftover `#section` hash, and
 * land the visitor mid-page after the loader has lifted.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search)

  const top = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  top()
  nuxtApp.hook('app:mounted', top)
  let first = true
  nuxtApp.hook('page:finish', () => {
    if (first) top()
    first = false
  })
})
