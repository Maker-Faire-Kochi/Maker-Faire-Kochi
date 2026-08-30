<script setup lang="ts">
/**
 * The DOMAIN section — formerly a six-card category grid.
 *
 * The six domains survive as plain labels rather than cards, because
 * de-emphasising the taxonomy is the whole point of the section. They are
 * non-interactive <li>s, not buttons: they are not destinations, so they must
 * not look tappable.
 */
/**
 * Deliberately not a tech list. The old six were robotics, 3D printing, IoT,
 * art, green tech and space — which reads as an electronics fair and quietly
 * tells a weaver, a cook or someone who repairs mixers that this is not for
 * them. Roughly half of these are now non-technical, and the order interleaves
 * them so no cluster reads as the "real" category.
 */
const domains = [
  'Robotics & AI',
  'Textiles & Weaving',
  'Electronics & IoT',
  'Cooking & Fermenting',
  '3D Printing',
  'Woodwork & Joinery',
  'Repair & Restoration',
  'Pottery & Clay',
  'Boats, Nets & Rope',
  'Music & Instruments',
  'Green Tech & Farming',
  'Toys, Kites & Games',
  'Art & Illustration',
  'Science & Space',
]

const PROPOSAL_URL = 'https://forms.gle/makerfairekochi2027'
</script>

<template>
  <section id="categories" class="domain-section section-padding">
    <div class="container domain-inner">
      <!-- Decorative: a screen reader must not read a word the sighted reader
           sees crossed out. The real heading is the line below it. -->
      <p class="domain-word" aria-hidden="true">
        <span class="domain-word-text">Domain</span>
      </p>

      <h2 class="domain-claim">There is no domain for makers.</h2>

      <!-- The section's thesis, not its footnote. It is deliberately ranked ABOVE
           the paragraph below it: two paragraphs at identical size and colour give
           the reader nothing to hold on to, and this is the one that has to land. -->
      <p class="domain-quote">
        <strong class="domain-emphasis">Everyone is a maker.</strong> The aunt who
        alters every hand-me-down until it fits. The uncle who has repaired the
        same mixer four times rather than replace it. The neighbour whose kite
        actually flies. None of them call it making — it is.
      </p>

      <p class="domain-support">
        This is not a technology fair. Solder is welcome; so are dough, thread,
        clay, coir and wood. If you made it, you can show it.
      </p>

      <ul class="domain-list">
        <li v-for="d in domains" :key="d" class="domain-chip">{{ d }}</li>
      </ul>

      <div class="domain-banner">
        <div>
          <h3 class="domain-banner-title">So bring the thing that doesn't fit.</h3>
          <p class="domain-banner-text">
            Tell us what you made, how you made it, and what broke on the way.
          </p>
        </div>
        <a
          :href="PROPOSAL_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-maker btn-maker-primary"
        >
          Pitch Your Project
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.domain-section {
  background-color: var(--color-white);
}

.domain-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.domain-word {
  position: relative;
  display: inline-block;
  font-family: var(--font-headline);
  font-size: clamp(2.75rem, 11vw, 6rem);
  line-height: 1;
  text-transform: uppercase;
  /* Recessive, but it must still be READABLE — a word you cannot read cannot be
     meaningfully struck through, and the strike is the whole point. --color-surface
     (#F3F3F3) on white is ~1.1:1 and effectively invisible.

     #AEB7C0 was the fix for that and did not go far enough: 2.03:1, which is under
     even the 3:1 large-text floor, so the comment above and the value below said
     opposite things. #8D959D is 3.04:1 — it clears that floor at this display size
     (~96px) and is still far enough back that the strike, not the word, is what the
     eye lands on. Measured, not eyeballed: a grey that LOOKS recessive enough is
     exactly how the previous value got to 2.03. */
  color: #8D959D;
  user-select: none;
}

/* Struck by DEFAULT. The strike carries the meaning, so it can never depend on
   JS or on an observer firing — if it failed to run, the word would read
   unstruck, i.e. the exact opposite of what the section says. */
.domain-word-text::after {
  content: '';
  position: absolute;
  left: -2%;
  right: -2%;
  top: 52%;
  height: clamp(4px, 0.9vw, 10px);
  background-color: var(--color-red-cta);
  transform: scaleX(1);
  transform-origin: left center;
}

/* A one-shot sweep on load, NOT a scroll-driven one.
   The previous version used `animation-timeline: view()` with a range, which
   fills to the *from* state (scaleX(0)) any time the section sits before that
   range — so the word rendered unstruck, which says the opposite of what this
   section means. Printing the page showed it plainly: no strike at all.
   This runs once, always finishes, and its end state is the struck word. */
@media (prefers-reduced-motion: no-preference) {
  .domain-word-text::after {
    animation: strike-sweep 620ms var(--ease-out) 240ms both;
  }
}

@keyframes strike-sweep {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.domain-claim {
  font-size: clamp(1.75rem, 4vw, 3rem);
  color: var(--color-ink);
  margin-top: -0.25rem;
  max-width: 20ch;
}

/* A pull quote. Same words as before, but at --color-muted (#5A6169) and 1.1rem
   the line that carries the whole argument was set at the emphasis of a caption.
   --color-gray-800 is #3A3F45 on white, 10.62:1. The narrower measure is
   deliberate: a short line is what makes a statement read as a statement. */
.domain-quote {
  margin-top: 1.5rem;
  max-width: 46ch;
  font-size: clamp(1.15rem, 2vw, 1.45rem);
  line-height: 1.5;
  color: var(--color-gray-800);
}

.domain-support {
  margin-top: 1.25rem;
  max-width: 56ch;
  color: var(--color-muted);
}

.domain-emphasis {
  color: var(--color-ink);
  font-weight: 600;
}

.domain-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2.5rem;
  padding: 0;
  list-style: none;
}

/* Deliberately NOT styled like the nav pills — no shadow, no hover lift, no
   pointer. These are labels, and anything button-like here would be a false
   affordance. */
.domain-chip {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-hairline);
  background-color: var(--color-surface);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-ink);
}

.domain-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 4rem;
  padding: 2rem;
  text-align: left;
  border-radius: 14px;
  border: 1px solid var(--color-hairline);
  background-color: var(--color-surface);
}

.domain-banner-title {
  font-size: 1.5rem;
  color: var(--color-ink);
}

.domain-banner-text {
  margin-top: 0.5rem;
  color: var(--color-muted);
}

@media (max-width: 768px) {
  .domain-banner {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .domain-banner .btn-maker {
    width: 100%;
    justify-content: center;
  }
}
</style>
