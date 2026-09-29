<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { usePanelSound } from '~/composables/usePanelSound'

/**
 * Pinned title strip — the site's only navigation. It docks along the bottom
 * of the viewport on the page's own grid and names the sheet being read.
 *
 * Replaces the old sticky bordered top bar *and* its hamburger drawer. A bottom
 * bar is the correct primary-nav pattern on phones, so one component now serves
 * every breakpoint and the drawer is gone entirely.
 *
 * Ordering note: this component is mounted FIRST in app.vue, before <main>.
 * Visual bottom placement is CSS-only. A permanently visible primary nav that a
 * keyboard user can only reach after tabbing the whole page is a real failure,
 * and it outweighs the mild visual/DOM order mismatch.
 *
 * `links` is the seam: adding the remaining sections later is a push here, not
 * a markup edit.
 *
 * KEYBOARD AVOIDANCE WAS REMOVED, and it must come back with any future form.
 * This rail used to hide itself on phones whenever an <input> was focused and
 * `visualViewport` shrank, because the on-screen keyboard pins a fixed bottom
 * rail directly over the field being typed in. The only field on the site was
 * the footer newsletter, which is gone, so the code was unreachable.
 *
 * If you add ANY input, textarea or contenteditable to this page, restore it --
 * and key it off `visualViewport`, NOT focusin/focusout. Focus tracking looks
 * simpler and is broken: removing a focused element (a v-if on submit, say)
 * does not reliably fire focusout, so the rail stays hidden forever, taking the
 * site's only navigation with it. visualViewport measures the keyboard itself
 * and self-heals. Guard it with an activeElement check so a pinch zoom, which
 * also shrinks the visual viewport, does not hide the nav.
 */
/**
 * Order MUST match the page order. This is not cosmetic: recompute() below
 * walks this array and keeps OVERWRITING `current`, so the last link whose
 * section has crossed the 40% line wins. With the old order (countdown first)
 * the countdown moving to the bottom of the page would leave "Domains"
 * highlighted while the reader was actually in the countdown.
 */
const links = [
  { id: 'about', href: '#about', label: 'About', sheet: '01' },
  { id: 'categories', href: '#categories', label: 'Domains', sheet: '02' },
  { id: 'countdown', href: '#countdown', label: 'When', sheet: '03' },
]

const activeId = ref<string>('')

/** The hero is sheet 00, the general arrangement, before any link is reached. */
const sheet = computed(() => {
  const l = links.find(x => x.id === activeId.value)
  return l ? { n: l.sheet, label: l.label } : { n: '00', label: 'General arrangement' }
})

const { enabled: soundOn, toggle: toggleSound } = usePanelSound()

/**
 * Active-section tracking.
 *
 * Deliberately NOT an IntersectionObserver. The obvious rootMargin trick for a
 * "line at 40% of the viewport" — '-40% 0px -60% 0px' — is broken: per spec,
 * rootMargin percentages resolve against the root's WIDTH, not its height. On a
 * 1920x1080 viewport that is -768px/-1152px applied to a 1080px-tall root, i.e.
 * a negative-height rectangle that never fires. Making IO correct would mean
 * pixel margins recomputed from innerHeight plus tearing down and rebuilding the
 * observer on every resize.
 *
 * A rAF-throttled passive scroll listener reading fresh rects is fewer lines and
 * handles resize for free.
 */
function recompute() {
  const line = window.innerHeight * 0.4
  let current = ''
  for (const l of links) {
    const el = document.getElementById(l.id)
    if (el && el.getBoundingClientRect().top <= line) current = l.id
  }
  activeId.value = current
}

let ticking = false
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    recompute()
    ticking = false
  })
}

onMounted(() => {
  recompute()
  window.addEventListener('scroll', onScroll, { passive: true })
  // Reuses the rAF throttle: innerHeight feeds recompute(), so orientation
  // changes, resizes and zoom would otherwise strand aria-current on the wrong
  // section until the next scroll.
  window.addEventListener('resize', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <div class="rail-wrap">
    <nav id="primary-nav" class="rail" aria-label="Primary">
      <p class="rail-sheet" aria-hidden="true">
        <span>Sht {{ sheet.n }} / 04</span>
        <span class="rail-sheet-label">{{ sheet.label }}</span>
      </p>

      <div class="rail-keys">
        <a
          v-for="l in links"
          :key="l.id"
          :href="l.href"
          class="key rail-key"
          :class="{ 'is-lit': activeId === l.id }"
          :aria-current="activeId === l.id ? 'location' : undefined"
        >{{ l.label }}</a>

        <a href="/interestform" class="key key-red rail-key rail-cta">Get Involved</a>

        <button
          type="button"
          class="key rail-key rail-sound"
          :class="{ 'is-on': soundOn }"
          role="switch"
          :aria-checked="soundOn"
          aria-label="Key sounds"
          @click="toggleSound"
        >Sound {{ soundOn ? 'on' : 'off' }}</button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.rail-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 120;
}

/* Docked on the page grid: the sheet name over the narrow bay, the keys from
   the column line. One hairline on top; the dividers are the keys' own. */
.rail {
  display: grid;
  grid-template-columns: var(--pn-grid);
  /* border-box: the safe-area padding counts toward min-height, so it has to
     be added here too or an iPhone home indicator crushes the keys. */
  min-height: calc(var(--rail-h) + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background-color: var(--pn-enamel);
  border-top: 2px solid var(--pn-ink);
}

.rail-sheet {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0 var(--pn-gutter);
  font-family: var(--font-readout);
  font-weight: 500;
  font-size: 0.9375rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-ink);
  white-space: nowrap;
  overflow: hidden;
}

.rail-sheet-label {
  color: var(--pn-label);
  overflow: hidden;
  text-overflow: ellipsis;
}

.rail-keys {
  display: flex;
  align-items: stretch;
  border-left: 1px solid var(--pn-ink);
}

.rail-key {
  min-height: 0;
  padding: 0.85rem 1.5rem 0.7rem;
  border: 0;
  border-right: 1px solid var(--pn-ink);
  box-shadow: none;
  font-size: 0.9375rem;
  white-space: nowrap;
}

.rail-key:active,
.rail-key.is-down {
  transform: translateY(1px);
  box-shadow: none;
}

.rail-key::before {
  top: 6px;
  left: 1.5rem;
  width: 1rem;
  height: 2px;
}

.rail-cta {
  margin-left: auto;
  border-left: 1px solid var(--pn-ink);
}

.rail-sound {
  border-right: 0;
}

.rail-sound.is-on::before {
  background-color: var(--color-cyan);
}

@media (max-width: 900px) {
  .rail {
    grid-template-columns: minmax(0, 1fr);
  }

  .rail-sheet {
    display: none;
  }

  .rail-keys {
    border-left: 0;
  }

  .rail-key {
    flex: 1 1 0;
    justify-content: center;
    min-width: 0;
    padding: 0.85rem 0.25rem 0.7rem;
    font-size: 0.8125rem;
    letter-spacing: 0.02em;
    white-space: normal;
    text-align: center;
    line-height: 1.15;
  }

  .rail-key::before {
    left: 50%;
    transform: translateX(-50%);
  }

  .rail-cta {
    flex-grow: 1.5;
    margin-left: 0;
    border-left: 0;
  }
}
</style>
