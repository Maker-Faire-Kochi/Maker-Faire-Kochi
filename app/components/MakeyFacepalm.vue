<script setup lang="ts">
const { view, state, mounted, init, toggle } = useMotion()
// error.vue is outside layouts, including the homepage's Save-Data header gate.
const saveData = useState<boolean | undefined>('hero-save-data')
if (import.meta.server) saveData.value = useRequestHeader('save-data') === 'on'
// The error root may mount without the normal page suspense resolving.
onMounted(() => {
  init()
  mounted.value = true
  // Start fetching the 3D code now rather than once the page is idle: the slot
  // asks for it a moment later and finds it cached, so the live Makey arrives sooner.
  if (state.value !== 'reduced' && !saveData.value) {
    import('~/three/core/stage').catch(() => {})
    import('~/three/scenes/makey404').catch(() => {})
  }
})
</script>

<template>
  <figure class="facepalm">
    <!-- The poster is rendered from this very scene at its first live frame (npm run posters makey404), so the hand-over is invisible. -->
    <ThreeSceneSlot scene="makey404" poster="/img/scenes/makey404" priority class="facepalm-slot" role="img" aria-label="Makey facepalms at the empty page, then slowly shakes his head." />
    <figcaption class="visually-hidden" aria-live="polite">Makey facepalms at the missing page, then slowly shakes his head.</figcaption>
    <button v-if="view !== 'reduced'" class="key facepalm-pause" type="button" :aria-pressed="view === 'paused'" @click="toggle">
      {{ view === 'paused' ? 'Resume' : 'Pause' }} motion
    </button>
  </figure>
</template>

<style scoped>
.facepalm { position: relative; margin: 0; min-width: 0; text-align: center; }
/* A fixed square, so the poster (one square render) and the live canvas frame Makey identically at every size. */
.facepalm-slot { width: min(100%, 30rem, 62svh); aspect-ratio: 1; margin-inline: auto; }
.facepalm-pause { margin-top: 0.75rem; }
@media (max-width: 56.25rem) {
  .facepalm-slot { width: clamp(11rem, 28svh, 18rem); }
  /* On a phone the Pause key is compact. */
  .facepalm-pause { margin-top: 0.25rem; min-height: 44px; padding: 0.6rem 1rem; font-size: 0.75rem; }
}
@media (max-height: 32rem) and (min-width: 40rem) { .facepalm-slot { width: 17rem; } }
</style>
