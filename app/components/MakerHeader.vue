<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Timer, Shapes, Info } from '@lucide/vue'

/**
 * Floating glass pill rail — the site's only navigation.
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
  { id: 'about', href: '#about', label: 'About', icon: Info },
  { id: 'categories', href: '#categories', label: 'Domains', icon: Shapes },
  { id: 'countdown', href: '#countdown', label: 'When', icon: Timer },
]

const activeId = ref<string>('')

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
      <a
        v-for="l in links"
        :key="l.id"
        :href="l.href"
        class="pill"
        :class="{ 'is-active': activeId === l.id }"
        :aria-current="activeId === l.id ? 'location' : undefined"
        :aria-label="l.label"
      >
        <component :is="l.icon" class="pill-icon" :size="18" :stroke-width="2" aria-hidden="true" />
        <span class="pill-label">{{ l.label }}</span>
        <span v-if="activeId === l.id" class="pill-dot" aria-hidden="true"></span>
      </a>

      <a href="/interestform" class="pill pill-cta">Get Involved</a>
    </nav>
  </div>
</template>

<style scoped>
.rail-wrap {
  position: fixed;
  left: 0;
  right: 0;
  /* Positioned, not padded — padding the rail would not clear the home indicator. */
  bottom: calc(1.25rem + env(safe-area-inset-bottom));
  z-index: 120;
  display: flex;
  justify-content: center;
  /* A full-width fixed wrapper would otherwise swallow every click in its band. */
  pointer-events: none;
}

.rail {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem;
  min-height: var(--rail-h);
  max-width: calc(100vw - 2rem);
  /* Added pills, 200% zoom and large text degrade to a scrollable rail
     instead of overflowing the viewport. */
  overflow-x: auto;
  scrollbar-width: none;
  border-radius: var(--radius-pill);
  border: 1px solid var(--glass-stroke);
  background: var(--glass-bg);
  box-shadow: var(--shadow-soft-lg);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.4);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.4);
}

.rail::-webkit-scrollbar {
  display: none;
}

/* Test BOTH forms: an unprefixed-only query misclassifies prefix-only Safari. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .rail {
    background: rgba(255, 255, 255, 0.94);
  }
}

.pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  /* HIG minimum control size. */
  min-height: 44px;
  min-width: 44px;
  padding: 0 1rem;
  flex: 0 0 auto;
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  color: var(--color-ink);
  white-space: nowrap;
  transition: background-color var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}

.pill:hover {
  background-color: var(--color-surface);
  transform: translateY(-1px);
}

.pill:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}

/* Active state changes shape AND weight, never colour alone — so it survives
   colour blindness. */
.pill.is-active {
  background-color: var(--color-surface);
}

.pill-cta {
  background-color: var(--color-red-cta);
  color: var(--color-white);
}
.pill-cta:hover {
  background-color: var(--color-red-cta);
  filter: brightness(0.95);
  transform: translateY(-1px);
}
.pill-cta .pill-label {
  color: inherit;
}

.pill-dot {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: var(--color-cyan);
}

.pill-icon {
  flex-shrink: 0;
}

@media (max-width: 480px) {
  /* Labels stay VISIBLE. An earlier version clipped them to icon-only here, but
     320px is also the reflow width a sighted low-vision user lands on at 200%
     zoom — clipping penalises exactly the people who zoomed, and aria-label only
     helps assistive tech, not them. A lone "Shapes" glyph for "Domains" is not
     guessable.

     A hidden horizontal scrollbar is the same failure: four labelled pills do
     not fit a 320–390px rail (measured overflow 70px at 390), and
     scrollbar-width: none gives no hint that "Get Involved" is off to the
     right. Stack icon over label in equal columns so every item is on screen.
     "Get Involved" wraps on the space; do not nowrap it back into a scroll. */
  :global(:root) {
    /* Measured 72px at 320 and 390. Hero, footer and scroll-padding read this
       token, so a taller phone rail stays clear of the buttons. */
    --rail-h: 72px;
  }

  .rail-wrap {
    bottom: calc(0.625rem + env(safe-area-inset-bottom));
  }

  .rail {
    width: calc(100vw - 1rem);
    max-width: none;
    gap: 0.125rem;
    padding: 0.25rem;
    overflow: visible;
    justify-content: stretch;
  }

  .pill {
    flex: 1 1 0;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
    min-height: 56px;
    padding: 0.3rem 0.2rem;
    font-size: 0.6875rem;
    letter-spacing: 0;
    line-height: 1.15;
    text-align: center;
    white-space: normal;
  }

  .pill-icon {
    width: 16px;
    height: 16px;
  }

  .pill-cta {
    /* Wider than the word columns so "Get Involved" stays one line inside the
       pill ends. Equal shares at 320px left the label 3px from each cap. */
    flex-grow: 1.45;
    padding-inline: 0.45rem;
    line-height: 1.15;
  }
}

@media (max-width: 768px) {
  /* Blur over a playing video re-samples every frame. Both properties must be
     cleared or prefix-only iOS Safari keeps paying for it. */
  .rail {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    background: rgba(255, 255, 255, 0.94);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pill {
    transition: none;
  }
}
</style>
