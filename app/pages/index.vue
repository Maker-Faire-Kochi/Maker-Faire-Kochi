<script setup lang="ts">
import NetHero from '~/components/hero/NetHero.vue'

/**
 * Scroll reveal: every direct child of a sheet (bar its sheet head, which
 * decrypts itself) rises in as it enters. The hidden state exists only once
 * this script has run, so no-JS visitors see a fully drawn page.
 */
let io: IntersectionObserver | null = null

onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') return
  const els = document.querySelectorAll<HTMLElement>('#about > :not(.sheet-head), #categories > :not(.sheet-head), #countdown > :not(.sheet-head), .maker-footer .footer-container')
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      e.target.classList.add('is-in')
      io?.unobserve(e.target)
    }
  }, { rootMargin: '0px 0px -8% 0px' })
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight) continue
    el.classList.add('reveal')
    io.observe(el)
  }
})

onUnmounted(() => io?.disconnect())
</script>

<template>
  <PageLoader />
  <BitsClickSpark />
  <main id="main" tabindex="-1">
    <NetHero />
    <MakerAbout />
    <MakerCategories />
    <MakerCountdown />
  </main>
</template>

<style>
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 700ms var(--ease-out), transform 700ms var(--ease-out);
}

.reveal.is-in {
  opacity: 1;
  transform: none;
}
</style>
