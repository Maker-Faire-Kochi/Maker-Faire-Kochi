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
</script>

<template>
  <section id="categories" class="domain-section section-padding">
    <div class="container domain-inner">
      <!-- Decorative: a screen reader must not read a word the sighted reader
           sees crossed out. The real heading is the line below it. -->
      <p class="domain-word" aria-hidden="true">
        <span class="domain-word-text">Domain</span>
      </p>

      <h2 class="domain-claim display-type">There is no domain for makers.</h2>

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

      <!-- The "Pitch Your Project" button is gone with the rest of the proposal
           CTAs (dead forms.gle link). The words stay, because they are the
           section's closing statement, not button chrome. -->
      <div class="domain-banner">
        <div>
          <h3 class="domain-banner-title subhead">So bring the thing that doesn't fit.</h3>
          <p class="domain-banner-text">
            Tell us what you made, how you made it, and what broke on the way.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Grouped ground, not white. About above it and this section were both white,
   so two distinct arguments read as one unbroken sheet. Three consecutive
   planes now: white (About) -> grouped (Domains) -> ink (Countdown). */
.domain-section {
  background-color: var(--bg-grouped);
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
     opposite things. #8D959D followed and measured 3.04:1 ON WHITE.

     It is #828A92 now, and the reason is a trap worth remembering: a contrast
     figure belongs to a PAIR, not to a colour. Moving this section to the
     grouped ground (#F7F7F7) silently dropped #8D959D to 2.83:1 — back under
     the 3:1 large-text floor — without anyone touching the text colour. The
     background moved, so the measurement moved with it.

     #828A92 on #F7F7F7 is 3.27:1, i.e. better than the 3.04:1 this ever had on
     white, and still recessive enough that the strike is what the eye lands on.
     Re-measure this pair if the section ground changes again. */
  color: #828A92;
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
  font-size: var(--text-title-1);
  line-height: var(--text-title-1-lh);
  color: var(--label);
  max-width: 20ch;
}

/* A pull quote. Same words as before, but at --color-muted (#5A6169) and 1.1rem
   the line that carries the whole argument was set at the emphasis of a caption.
   --color-gray-800 is #3A3F45 on white, 10.62:1. The narrower measure is
   deliberate: a short line is what makes a statement read as a statement. */
.domain-quote {
  margin-top: var(--sp-4);
  max-width: 46ch;
  font-size: clamp(1.15rem, 2vw, 1.45rem);
  line-height: 1.5;
  color: var(--color-gray-800);
}

.domain-support {
  margin-top: var(--sp-3);
  max-width: 56ch;
  color: var(--label-secondary);
}

.domain-emphasis {
  color: var(--color-ink);
  font-weight: 600;
}

.domain-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--sp-2);
  margin-top: var(--sp-5);
  padding: 0;
  list-style: none;
}

/* Deliberately NOT styled like the nav pills — no shadow, no hover lift, no
   pointer. These are labels, and anything button-like here would be a false
   affordance. */
/* The fill flips to white BECAUSE the section ground changed: #F3F3F3 chips on
   a #F7F7F7 ground are a 1% difference, i.e. invisible. On the grouped ground
   the lighter fill is what makes a chip read as an object. Still deliberately
   not styled like the nav pills -- no shadow, no hover lift, no pointer. */
.domain-chip {
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-pill);
  border: 1px solid var(--separator);
  background-color: var(--surface-1);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--label);
}

.domain-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-5);
  flex-wrap: wrap;
  width: 100%;
  margin-top: var(--sp-6);
  padding: var(--sp-5);
  text-align: left;
  border-radius: var(--radius-card);
  border: 1px solid var(--separator);
  background-color: var(--surface-1);
}

.domain-banner-title {
  font-size: var(--text-title-2);
  line-height: var(--text-title-2-lh);
  color: var(--label);
}

.domain-banner-text {
  margin-top: var(--sp-1);
  color: var(--label-secondary);
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
