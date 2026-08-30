<script setup lang="ts">
/**
 * Explicit import, not auto-import. Nuxt's default `pathPrefix: true` registers
 * app/components/hero/NetHero.vue as `HeroNetHero`, so <NetHero /> would resolve
 * to nothing and render an empty element.
 */
import NetHero from '~/components/hero/NetHero.vue'

/**
 * Open Graph and Twitter scrapers generally require fully-qualified image URLs;
 * a relative "/img/..." is commonly dropped, so the link preview ships with no
 * image. The origin is resolved per-request rather than hardcoded, so this stays
 * correct on the production domain, on preview deploys and on localhost without
 * anyone remembering to update a constant.
 *
 * xForwardedHost/Proto so the public origin survives a reverse proxy or CDN,
 * rather than leaking an internal host.
 */
/**
 * Under `nuxt generate` there is no request at all, so useRequestURL() returns
 * `http://localhost` and that is what gets baked into the static index.html.
 * runtimeConfig.public.siteUrl (see nuxt.config.ts) carries the real origin at
 * build time when there is one; the per-request URL stays the fallback, because
 * under SSR it is the more correct answer — it follows preview deploys and
 * custom domains without anyone updating a constant.
 */
const { origin: requestOrigin } = useRequestURL({ xForwardedHost: true, xForwardedProto: true })
const origin = useRuntimeConfig().public.siteUrl || requestOrigin
const ogImage = `${origin}/img/logo/mf-kochi-square-512.png`

useHead({
  meta: [
    { property: 'og:url', content: origin },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:width', content: '512' },
    { property: 'og:image:height', content: '512' },
    { property: 'og:image:alt', content: 'Maker Faire Kochi' },
    { name: 'twitter:image', content: ogImage },
  ],
})
</script>

<template>
  <div class="maker-app">
    <NuxtRouteAnnouncer />

    <a href="#main" class="skip-link">Skip to content</a>

    <!-- First in the DOM although it renders visually at the bottom. A
         permanently visible primary nav that a keyboard user can only reach
         after tabbing the entire page is a real failure. -->
    <MakerHeader />

    <main id="main" tabindex="-1">
      <NetHero />
      <MakerCountdown />
      <MakerAbout />
      <MakerCategories />
    </main>

    <!-- Outside <main> so it is a real contentinfo landmark. -->
    <MakerFooter />
  </div>
</template>
