<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Timer, Shapes, Info, Send } from '@lucide/vue'

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
 */
const links = [
  { id: 'countdown', href: '#countdown', label: 'When', icon: Timer },
  { id: 'about', href: '#about', label: 'About', icon: Info },
  { id: 'categories', href: '#categories', label: 'Domains', icon: Shapes },
]

const PROPOSAL_URL = 'https://forms.gle/makerfairekochi2027'

const activeId = ref<string>('')
const railHidden = ref(false)

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

/**
 * The footer carries a newsletter <input>. On a phone, the on-screen keyboard
 * pins this fixed rail directly above itself, covering the field being typed in.
 *
 * This deliberately keys off visualViewport rather than focusin/focusout on the
 * form. Focus tracking looks simpler but is broken here: submitting the
 * newsletter flips `subscribed` and removes the focused button via v-if
 * (MakerFooter.vue), and removing a focused element does not reliably fire
 * focusout — so the rail would stay hidden permanently, taking the site's only
 * navigation with it.
 *
 * visualViewport measures the keyboard directly, so it self-heals no matter what
 * happens to the element that had focus. The activeElement check keeps a pinch
 * zoom, which also shrinks the visual viewport, from hiding the nav.
 */
function syncRailForKeyboard() {
  const vv = window.visualViewport
  if (!vv) return
  const el = document.activeElement
  const typing =
    !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable)
  railHidden.value = typing && vv.height < window.innerHeight * 0.75
}

onMounted(() => {
  recompute()
  window.addEventListener('scroll', onScroll, { passive: true })
  // Reuses the rAF throttle: innerHeight feeds recompute(), so orientation
  // changes, resizes and zoom would otherwise strand aria-current on the wrong
  // section until the next scroll.
  window.addEventListener('resize', onScroll, { passive: true })
  window.visualViewport?.addEventListener('resize', syncRailForKeyboard)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  window.visualViewport?.removeEventListener('resize', syncRailForKeyboard)
})
</script>

<template>
  <div class="rail-wrap" :class="{ 'is-hidden': railHidden }">
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

      <a
        :href="PROPOSAL_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="pill pill-cta"
        aria-label="Join as Maker — submit a proposal"
      >
        <Send class="pill-icon" :size="18" :stroke-width="2" aria-hidden="true" />
        <span class="pill-label">Join</span>
      </a>
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
  /* visibility is delayed until the slide-out finishes, then applied instantly.
     Without the delay `visibility: hidden` lands on frame one and the transition
     is never seen; without visibility at all, the hidden rail stays in the tab
     order and a keyboard user tabs into an invisible nav. */
  transition: transform var(--dur-mid) var(--ease-out),
    opacity var(--dur-mid) var(--ease-out),
    visibility 0s linear 0s;
}

.rail-wrap.is-hidden {
  transform: translateY(150%);
  opacity: 0;
  visibility: hidden;
  transition: transform var(--dur-mid) var(--ease-out),
    opacity var(--dur-mid) var(--ease-out),
    visibility 0s linear var(--dur-mid);
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

/* The single background-coloured control on the page. #C4121A, not the brand
   #ED1C24: a 14.4px bold label is not WCAG "large text", so it needs the full
   4.5:1 — white on #ED1C24 is 4.38:1 and fails, white on #C4121A is 6.09:1. */
.pill-cta {
  background-color: var(--color-red-cta);
  color: var(--color-white);
  margin-left: 0.25rem;
}

.pill-cta:hover {
  background-color: #A80E15;
  transform: translateY(-1px);
}

.pill-cta:focus-visible {
  outline-color: var(--color-red-cta);
}

@media (max-width: 480px) {
  /* Labels stay VISIBLE. An earlier version clipped them to icon-only here, but
     320px is also the reflow width a sighted low-vision user lands on at 200%
     zoom — clipping penalises exactly the people who zoomed, and aria-label only
     helps assistive tech, not them. A lone "Shapes" glyph for "Domains" is not
     guessable. The rail scrolls horizontally, so nothing has to be hidden. */
  .pill {
    padding: 0 0.75rem;
    font-size: 0.85rem;
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
  .rail-wrap,
  .pill {
    transition: none;
  }
}
</style>
