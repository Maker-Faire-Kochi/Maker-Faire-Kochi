<script setup lang="ts">
/**
 * Landing chrome: pill nav + footer. Form/admin use other layouts.
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
    <MakerHeader />
    <slot />
    <MakerFooter />
  </div>
</template>
