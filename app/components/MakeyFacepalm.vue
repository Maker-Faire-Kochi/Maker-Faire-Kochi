<script setup lang="ts">
const { view, mounted, init, toggle } = useMotion()
// The error root may mount without the normal page suspense resolving.
onMounted(() => { init(); mounted.value = true })
// error.vue is outside layouts, including the homepage's Save-Data header gate.
const saveData = useState<boolean | undefined>('hero-save-data')
if (import.meta.server) saveData.value = useRequestHeader('save-data') === 'on'
</script>

<template>
  <figure class="facepalm">
    <ThreeSceneSlot scene="makey404" class="facepalm-slot" role="img" aria-label="Makey facepalms at the empty page, then slowly shakes his head.">
      <!-- A still, hand-drawn equivalent: no WebGL or motion required. -->
      <svg viewBox="0 0 360 360" aria-hidden="true" class="facepalm-poster">
        <ellipse cx="183" cy="326" rx="82" ry="9" fill="#222" opacity=".12" />
        <g stroke="#222" stroke-width="1.5" stroke-linejoin="round">
          <path d="M151 268v37m58-37v37" stroke="#85888C" stroke-width="18" />
          <path d="M130 302h38v22h-43q-8-12 5-22m68 0h38q14 10 8 22h-46z" fill="#C4121A" />
          <rect x="128" y="174" width="105" height="102" rx="24" fill="#C4121A" />
          <path d="M132 187l-25 30 27-70m98 39 14 53" fill="none" stroke="#85888C" stroke-width="17" />
          <circle cx="109" cy="216" r="10" fill="#222" />
          <rect x="235" y="235" width="22" height="28" rx="8" fill="#fff" />
          <rect x="168" y="162" width="26" height="16" rx="6" fill="#222" />
          <path d="M125 148v-33a55 51 0 0 1 110 0v33q-55 15-110 0z" fill="#C4121A" />
          <path d="M127 119q53 12 106 0v28q-53 13-106 0z" fill="#222" />
          <path d="M153 70l-9-29m62 29 10-29" stroke-width="5" />
          <g fill="#FFC23A"><circle cx="143" cy="40" r="7" /><circle cx="217" cy="40" r="7" /></g>
          <g fill="#A16A1A"><ellipse cx="162" cy="136" rx="10" ry="7" /><ellipse cx="203" cy="136" rx="10" ry="7" /></g>
          <path d="M125 150l-7-27q-2-9 6-12l16-5q8-1 11 7l6 26q1 8-7 11l-14 4q-8 1-11-4z" fill="#fff" />
          <circle cx="181" cy="225" r="25" fill="#fff" />
          <path d="M166 238v-26h7l8 11 8-11h7v26h-7v-14l-8 10-8-10v14z" fill="#C4121A" stroke="none" />
        </g>
      </svg>
    </ThreeSceneSlot>
    <figcaption class="visually-hidden" aria-live="polite">Makey facepalms at the missing page, then slowly shakes his head.</figcaption>
    <button v-if="view !== 'reduced'" class="key facepalm-pause" type="button" :aria-pressed="view === 'paused'" @click="toggle">
      {{ view === 'paused' ? 'Resume' : 'Pause' }} motion
    </button>
  </figure>
</template>

<style scoped>
.facepalm { position: relative; margin: 0; min-width: 0; text-align: center; }
.facepalm-slot { height: clamp(17rem, 45svh, 30rem); width: 100%; }
.facepalm-poster { display: block; width: 100%; height: 100%; }
.facepalm-pause { margin-top: 0.75rem; }
@media (max-width: 56.25rem) {
  .facepalm-slot { height: clamp(11rem, 28svh, 18rem); }
  /* On a phone the Pause key is compact. */
  .facepalm-pause { margin-top: 0.25rem; min-height: 44px; padding: 0.6rem 1rem; font-size: 0.75rem; }
}
@media (max-height: 32rem) and (min-width: 40rem) { .facepalm-slot { height: 17rem; } }
</style>
