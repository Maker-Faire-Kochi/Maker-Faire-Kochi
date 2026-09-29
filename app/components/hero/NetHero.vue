<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { EVENT } from '~/composables/useCountdown'
import MakerSchematic from '~/components/hero/MakerSchematic.vue'

const [endDay, ...endRest] = EVENT.rangeEnd.label.split(' ')
const endMonth = endRest.join(' ')

/** Numbers match the balloons in MakerSchematic and the domains list. */
const parts = [
  { n: '01', label: 'Robot arm' },
  { n: '02', label: 'Charkha & wool' },
  { n: '03', label: 'Drone' },
  { n: '07', label: 'Treadle sewing machine' },
  { n: '09', label: 'Cheena vala' },
  { n: '11', label: 'Coconut palm' },
]

/**
 * The hero is one drawing sheet: the claim in the narrow bay, a working
 * drawing (MakerSchematic) in the wide bay, the event's facts in the title
 * block under both.
 *
 * WCAG 2.2.2: there is no in-page pause control (removed at the owner's
 * request). `prefers-reduced-motion` switches the drawing's motion off, and the
 * motion is kept small and local.
 */

/**
 * Save-Data, honoured on BOTH sides of hydration.
 *
 * The header is only readable on the server, so the decision is made there and
 * carried across in the payload via useState. Computing it in plain component
 * setup does NOT work: setup runs again in the browser, where
 * useRequestHeaders() returns {}, so the server's `true` silently became
 * `false` on the client and the animation started anyway -- defeating the whole
 * check. useState runs its factory on the server only and hydrates the value.
 *
 * `navigator.connection.saveData` is then consulted as well, which covers the
 * two cases the header cannot: a prerendered page (`nuxt generate` has no
 * request, so the header is never seen) and any client-side navigation.
 */
const saveData = useState('hero-save-data', () =>
  useRequestHeaders(['save-data'])['save-data'] === 'on'
)

/**
 * Animation is opted IN, never opted out. Motion has two orthogonal axes:
 * `is-ready` answers WHETHER MOTION IS ALLOWED AT ALL (mounted, and not
 * Save-Data), while `is-offscreen` answers WHETHER IT IS CURRENTLY RUNNING.
 * `is-ready` remains the single authority for whether motion is allowed.
 *
 * The scene is server-rendered, so its CSS would otherwise start animating
 * during initial paint -- including for visitors with no JavaScript. `is-ready`
 * is the single gate that lets it move, and it is added only from script.
 *
 * Honest note on WCAG 2.2.2 (Pause, Stop, Hide): there is still NO in-page
 * mechanism to stop this motion -- the pause control was removed at the owner's
 * request, and the off-screen suspension below is not a substitute, because the
 * visitor does not control it and scrolling back into view resumes the motion
 * automatically. `prefers-reduced-motion` remains the only real accommodation.
 * That gap is known and accepted; do not let this comment claim otherwise.
 */
const heroEl = ref<HTMLElement | null>(null)
const dataAllowsMotion = ref(false)
const inViewport = ref(true)

/**
 * An IntersectionObserver must never be the sole input to whether motion runs:
 * an earlier draft let it silently re-enable animation for Save-Data visitors
 * when the hero entered the viewport. That is now structurally guaranteed:
 * the observer drives only `is-offscreen` and cannot grant motion.
 */
const ready = computed(() => dataAllowsMotion.value)

let observer: IntersectionObserver | null = null

onMounted(() => {
  // Either signal is enough to suppress motion.
  const clientSaveData = Boolean((navigator as any).connection?.saveData)
  dataAllowsMotion.value = !saveData.value && !clientSaveData

  /**
   * Suspend the scene once it leaves the viewport. 112 animations otherwise keep
   * running for as long as the tab is open, however far down the page the reader
   * has gone.
   *
   * Measured honestly: the main-thread cost is ~1ms of style recalc per 1.6s,
   * i.e. below the noise floor -- this is battery insurance on real hardware,
   * not a fix for a measured regression.
   *
   * This is separate from `is-ready`: toggling `is-ready` off screen removed the
   * animations via `animation: none`, and re-adding a CSS animation restarts it
   * at t=0. Scrolling back therefore replayed the camera push-in and snapped
   * every gear back to its start. Measured before the fix: the camera clock read
   * 633ms on screen, the animation was absent off screen, and on return it read
   * 467ms instead of resuming near 1600ms. Pausing preserves phase.
   */
  if (typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry) inViewport.value = entry.isIntersecting
    },
    // Any sliver on screen counts as visible; the scene is full-bleed and a
    // threshold above 0 would stop it while part of it is still showing.
    { threshold: 0 },
  )
  if (heroEl.value) observer.observe(heroEl.value)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})

</script>

<template>
  <section id="top" ref="heroEl" class="net-hero enamel">
    <picture class="hero-logo">
      <source srcset="/img/logo/mf-kochi-long@2x.webp 2x, /img/logo/mf-kochi-long.webp 1x" type="image/webp" />
      <img
        src="/img/logo/mf-kochi-long.png"
        width="320"
        height="53"
        class="net-hero-logo"
        alt="Maker Faire Kochi"
        decoding="async"
      />
    </picture>

    <h1 class="net-hero-title">
      <span class="t-heavy"><BitsSplitText :lines="['Every kind', 'of maker.']" :delay="1050" /></span>
      <span class="t-light">Every kind of making.</span>
    </h1>

    <div class="hero-copy">
      <p class="net-hero-subtitle">
        The Greatest Show (&amp; Tell) on Earth comes to Kerala for the very
        first time.
      </p>

      <div class="net-hero-actions">
        <a href="/interestform" class="key key-red">Get Involved</a>
        <a href="#about" class="key">Learn More</a>
      </div>
    </div>

    <!-- A working drawing on the page itself. The stage owns the motion
         classes (is-ready / is-offscreen); the drawing reads them by
         descendant selector. -->
    <div class="net-hero-media hero-stage" :class="{ 'is-ready': ready, 'is-offscreen': !inViewport }">
      <p class="hero-hint" aria-hidden="true"><span class="hint-dot" />Tap a machine to run it</p>
      <MakerSchematic />
    </div>

    <!-- The sheet's title block: the event's facts as filled-in fields. -->
    <dl class="hero-block">
      <div class="hb-cell hb-date">
        <dt>Date</dt>
        <dd>
          <time :datetime="EVENT.rangeStart.iso">{{ EVENT.rangeStart.label }}</time>
          &ndash;
          <time :datetime="EVENT.rangeEnd.iso">{{ endDay }}<br />{{ endMonth }}</time>
        </dd>
      </div>
      <div class="hb-cell hb-place">
        <dt>Place</dt>
        <dd>{{ EVENT.place }}</dd>
      </div>
      <div class="hb-cell hb-admission">
        <dt>Admission</dt>
        <dd>{{ EVENT.admissionLabel }}</dd>
      </div>
      <div class="hb-cell hb-key">
        <dt>Key to drawing</dt>
        <dd>
          <ol class="hero-parts">
            <li v-for="p in parts" :key="p.n"><span class="hero-part-n">{{ p.n }}</span>{{ p.label }}</li>
          </ol>
        </dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
/* Narrow bay: the mark, the claim and the actions. Wide bay: the drawing,
   full height, standing on the title block's datum at the right margin. */
.net-hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  grid-template-columns: var(--pn-grid);
  grid-template-rows: auto minmax(0, 1fr) auto auto;
  /* The pinned strip closes the title block, so the hero ends exactly on it. */
  padding: var(--pn-gutter) 0 calc(var(--rail-h) + env(safe-area-inset-bottom));
  overflow: hidden;
}

.hero-logo {
  grid-column: 1;
  grid-row: 1;
  padding-left: var(--pn-gutter);
}

.net-hero-logo {
  display: block;
  width: min(280px, 100%);
  height: auto;
}

.net-hero-title {
  grid-column: 1;
  grid-row: 2;
  align-self: end;
  display: flex;
  flex-direction: column;
  margin-top: 3.5rem;
  padding: 0 0 0 var(--pn-gutter);
  font-family: var(--font-panel);
  color: var(--pn-ink);
}

.t-heavy {
  font-stretch: 62%;
  font-weight: 900;
  font-size: var(--pn-d1);
  line-height: 0.86;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  white-space: nowrap;
}

.t-light {
  animation: hero-in 700ms var(--ease-out) 1500ms both;
  margin-top: 1.25rem;
  font-stretch: 62%;
  font-weight: 700;
  font-size: var(--pn-lead);
  line-height: 1.05;
}

.hero-copy {
  animation: hero-in 700ms var(--ease-out) 1650ms both;
  grid-column: 1;
  grid-row: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.75rem var(--pn-gutter) 2.25rem;
}

.net-hero-subtitle {
  max-width: 32ch;
  font-family: var(--font-readout);
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--pn-ink);
}

.net-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.net-hero-media {
  animation: hero-draw 1100ms var(--ease-out) 1150ms both;
  grid-column: 2;
  grid-row: 1 / 4;
  position: relative;
  min-height: 320px;
  margin: 0 var(--pn-gutter) 0 0;
}
.hero-hint {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-readout);
  font-weight: 500;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-label);
  pointer-events: none;
}

.hint-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-cyan);
  box-shadow: 0 0 0 3px rgba(0, 174, 239, 0.2);
}

.net-hero-media :deep(.schematic) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Entrance, timed to start as the opening plot lifts (PageLoader). */
@keyframes hero-in {
  from { opacity: 0; transform: translateY(14px); }
}

@keyframes hero-draw {
  from { opacity: 0; clip-path: inset(0 0 0 100%); }
  to { opacity: 1; clip-path: inset(0 0 0 0); }
}

@media (prefers-reduced-motion: reduce) {
  .t-light,
  .hero-copy,
  .net-hero-media,
  .hero-block {
    animation: none;
  }
}

/* Title block in thirds, on the page's own column lines: the date, two
   stacked fields, the key. */
.hero-block {
  animation: hero-in 700ms var(--ease-out) 1800ms both;
  grid-column: 1 / -1;
  grid-row: 4;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: auto auto;
  position: relative;
  margin: 0;
  padding-top: 12px;
  border-top: 2px solid var(--pn-ink);
}

/* The ground: hatch hangs under the datum the drawing stands on. */
.hero-block::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--pn-gutter);
  right: var(--pn-gutter);
  height: 12px;
  background-image: repeating-linear-gradient(-45deg, rgba(10, 10, 10, 0.45) 0 1px, transparent 1px 10px);
}

/* The key is its own row across the sheet. Tucked in the right third it
   wrapped to a third line and that line sat under the rail. */
.hb-date { grid-column: 1; grid-row: 1; }
.hb-place { grid-column: 2; grid-row: 1; }
.hb-admission { grid-column: 3; grid-row: 1; }
.hb-key {
  grid-column: 1 / -1;
  grid-row: 2;
  border-left: 0;
  border-top: 1px solid var(--pn-ink);
}

.hb-place,
.hb-admission {
  border-left: 1px solid var(--pn-ink);
}

.hb-cell {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
  padding: 0.9rem 1.5rem 1.1rem;
}

.hb-date {
  padding-left: var(--pn-gutter);
}

.hb-cell dt {
  font-family: var(--font-readout);
  font-weight: 500;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-label);
}

.hb-cell dd {
  margin: 0;
  font-family: var(--font-readout);
  font-weight: 500;
  font-size: 1.125rem;
  line-height: 1.3;
  color: var(--pn-ink);
}

.hb-date dd {
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 900;
  font-size: var(--pn-d3);
  line-height: 0.95;
  text-transform: uppercase;
}

.hero-parts {
  display: grid;
  /* Wraps to one column when the cell is narrow, so "Treadle sewing machine"
     stays on the sheet instead of running off the right edge. */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10.5rem), 1fr));
  gap: 0.35rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--font-readout);
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--pn-ink);
}

.hero-parts li {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  line-height: 1.25;
}

.hero-part-n {
  display: inline-grid;
  place-items: center;
  width: 1.6rem;
  height: 1.6rem;
  border: 1.5px solid var(--color-cyan);
  border-radius: 50%;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0;
}

/* A laptop-narrow window: the 1:2 split leaves a column too thin for the
   sentence, so the sheet grows past the screen and the key is cut off.
   Even the bays, shorten the gaps, and lay the key across the bottom so
   the drawing and the key both land above the rail. */
@media (max-width: 1100px) and (min-width: 741px) and (min-height: 521px) {
  .net-hero {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.35fr);
  }

  .net-hero-title {
    margin-top: 1.25rem;
  }

  .hero-copy {
    padding: 1rem 1.25rem 0.75rem;
  }

  .net-hero-actions {
    margin-top: 1rem;
  }

  .hb-cell {
    padding: 0.7rem 1.25rem 0.8rem;
  }
}

/* A laptop that is not tall enough for the full sheet. The title block is
   the thing that was disappearing under the rail, so the gaps above it give
   way first and the headline steps down. */
@media (max-height: 920px) and (min-width: 741px) and (min-height: 521px) {
  .net-hero {
    padding-top: 1.5rem;
  }

  .net-hero-title {
    margin-top: 1rem;
  }

  .t-heavy {
    font-size: clamp(2.75rem, 5vw, 4.75rem);
  }

  .hero-copy {
    padding-top: 1rem;
    padding-bottom: 0.75rem;
  }

  .net-hero-actions {
    margin-top: 1rem;
  }

  .hb-cell {
    padding: 0.6rem 1.25rem 0.7rem;
  }
}

@media (max-height: 700px) and (min-width: 741px) and (min-height: 521px) {
  .net-hero { padding-top: 0.75rem; }
  .t-heavy { font-size: clamp(2.25rem, 4vw, 3.1rem); }
  .t-light { margin-top: 0.5rem; }
  .hero-copy { padding-top: 0.5rem; padding-bottom: 0.4rem; }
  .hb-cell { padding: 0.45rem 1.25rem 0.5rem; }
}

/* Phones, and a short landscape phone. A window around 800px wide and 740px
   tall is still a full sheet: stacking it there pushed the drawing under the
   rail and the key off the first screen. */
@media (max-width: 740px), (max-height: 520px) {
  .net-hero {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    padding: 1.25rem 0 calc(var(--rail-h) + env(safe-area-inset-bottom));
  }

  .hero-logo,
  .net-hero-title,
  .hero-copy,
  .net-hero-media,
  .hero-block {
    grid-column: 1;
    grid-row: auto;
  }

  .hero-logo {
    padding-left: 1.25rem;
  }

  .net-hero-title {
    margin-top: 2.5rem;
    padding: 0 1.25rem;
  }

  .t-heavy {
    font-size: clamp(3rem, 16vw, 5.5rem);
  }

  .hero-copy {
    padding: 1.5rem 1.25rem 0;
  }

  .net-hero-media {
    min-height: 0;
    aspect-ratio: 920 / 601;
    margin: 2rem 1.25rem 1.5rem;
  }

  .hero-block {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: none;
  }

  .hb-date,
  .hb-key {
    grid-column: 1 / -1;
    grid-row: auto;
  }

  .hb-place { grid-column: 1; grid-row: auto; border-left: 0; }
  .hb-admission { grid-column: 2; grid-row: auto; }
  .hb-cell.hb-admission { padding-top: 0.85rem; border-left: 1px solid var(--pn-ink); }

  .hb-cell,
  .hb-date {
    padding: 0.85rem 1.25rem 1rem;
  }

  .hb-place,
  .hb-admission,
  .hb-key {
    border-top: 1px solid var(--pn-ink);
  }

  .hb-key {
    border-left: 0;
  }
}

@media (max-width: 420px) {
  .net-hero-actions .key {
    flex: 1 1 100%;
  }
}

/* A short screen (landscape phone) inherits the stacked sheet above, but at
   16vw the headline alone fills it and the buttons slide under the nav. */
@media (max-height: 520px) {
  .net-hero-title { margin-top: 0.75rem; }
  .t-heavy { font-size: clamp(2.25rem, 9vw, 3.25rem); }
  .t-light { margin-top: 0.6rem; }
  .hero-copy { padding-top: 0.75rem; padding-bottom: 0; }
  .net-hero-actions { margin-top: 0.9rem; }
  .net-hero-media { margin-top: 1rem; }
}
</style>
