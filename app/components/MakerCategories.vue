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

/** Items drawn and ballooned in the hero schematic, by the same number. */
const keyed = new Set(['Robotics & AI', 'Textiles & Weaving', 'Electronics & IoT', 'Repair & Restoration', 'Boats, Nets & Rope', 'Green Tech & Farming'])
</script>

<template>
  <section id="categories" class="domain-section enamel">
    <SheetHead n="02" label="Domains" />

    <h2 class="domain-claim">There is no domain for makers.</h2>

    <p class="domain-quote">
      Everyone is a maker. The aunt who
      alters every hand-me-down until it fits. The uncle who has repaired the
      same mixer four times rather than replace it. The neighbour whose kite
      actually flies. None of them call it making — it is.
    </p>

    <p class="domain-support">
      <span class="domain-note" aria-hidden="true">Note</span>
      This is not a technology fair. Solder is welcome; so are dough, thread,
      clay, coir and wood. If you made it, you can show it.
    </p>

    <!-- A schedule, not a menu: plain numbered rows, not controls; they
         are not destinations. -->
    <div class="domain-schedule">
      <p class="domain-heads">
        <span aria-hidden="true">No. / Domain</span>
        <span class="domain-legend"><span class="domain-ring" aria-hidden="true"></span>Drawn on sheet 00</span>
      </p>
      <ol class="domain-list">
        <li v-for="(d, i) in domains" :key="d" class="domain-row">
          <span class="domain-n" :class="{ 'is-keyed': keyed.has(d) }" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          {{ d }}
        </li>
      </ol>
    </div>

    <div class="domain-banner">
      <h3 class="domain-banner-title">So bring the thing that doesn't fit.</h3>
      <p class="domain-banner-text">
        Tell us what you made, how you made it, and what broke on the way.
      </p>
      <a href="/interestform" class="key key-red domain-banner-cta">Get Involved</a>
    </div>
  </section>
</template>

<style scoped>
.domain-section {
  display: grid;
  grid-template-columns: var(--pn-grid);
  padding: 0 0 var(--pn-section);
}

.domain-claim {
  grid-column: 1;
  grid-row: 2;
  padding: 0 var(--pn-gutter);
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 900;
  font-size: var(--pn-d2);
  line-height: 0.9;
  text-transform: uppercase;
  color: var(--pn-ink);
}

.domain-quote {
  grid-column: 2;
  grid-row: 2;
  padding-right: var(--pn-gutter);
  max-width: 46ch;
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 700;
  line-height: 1.12;
  font-size: var(--pn-lead);
  color: var(--pn-ink);
}

/* A drafting note in the narrow bay. Its label sits on the schedule's head
   line and its rule runs on into the list's, one line across the bays. */
.domain-support {
  grid-column: 1;
  grid-row: 3;
  align-self: start;
  margin: 5rem 0 0;
  padding: 0 var(--pn-gutter) 0;
  font-family: var(--font-readout);
  font-size: 1.125rem;
  line-height: 1.65;
  line-height: 1.55;
  color: var(--pn-ink);
}

.domain-note,
.domain-heads {
  font-family: var(--font-readout);
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-label);
}

.domain-note {
  display: block;
  margin: 0 calc(-1 * var(--pn-gutter)) 0.9rem 0;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--pn-ink);
}

.domain-schedule {
  grid-column: 2;
  grid-row: 3;
  margin: 5rem var(--pn-gutter) 0 0;
}

.domain-heads {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.6rem;
}

.domain-legend {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.domain-ring {
  width: 0.75rem;
  height: 0.75rem;
  border: 1.5px solid var(--color-cyan);
  border-radius: 50%;
}

.domain-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(7, auto);
  grid-auto-flow: column;
  column-gap: var(--pn-gutter);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Column-major, so each column reads down as one list. Both columns get
   their own top rule. */
.domain-row:nth-child(7n + 1) {
  border-top: 1px solid var(--pn-ink);
}

.domain-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--pn-ink);
  font-family: var(--font-readout);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--pn-ink);
}

.domain-n {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 1.6rem;
  height: 1.6rem;
  font-family: var(--font-readout);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--pn-label);
  font-variant-numeric: tabular-nums;
}

/* The balloon from the hero drawing, on the same number. */
.domain-n.is-keyed {
  border: 1.5px solid var(--color-cyan);
  border-radius: 50%;
  font-weight: 600;
  color: var(--pn-ink);
}

.domain-banner {
  grid-column: 2;
  grid-row: 4;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: var(--pn-gutter);
  align-items: end;
  margin-top: 6rem;
  padding: 0 var(--pn-gutter) 0 0;
}

.domain-banner-title {
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 900;
  font-size: var(--pn-d3);
  line-height: 0.95;
  text-transform: uppercase;
  color: var(--pn-ink);
}

.domain-banner-text {
  grid-column: 1;
  margin-top: 0.75rem;
  font-family: var(--font-readout);
  font-size: 1.125rem;
  color: var(--pn-label);
}

.domain-banner-cta {
  grid-column: 2;
  grid-row: 1 / span 2;
}

@media (max-width: 900px) {
  .domain-section {
    grid-template-columns: minmax(0, 1fr);
    padding-bottom: 5rem;
  }

  .domain-claim,
  .domain-quote,
  .domain-support,
  .domain-schedule,
  .domain-banner {
    grid-column: 1;
    grid-row: auto;
  }

  .domain-claim,
  .domain-quote,
  .domain-banner {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .domain-quote {
    margin-top: 1.5rem;
  }

  .domain-support {
    margin: 2.5rem 1.25rem 0;
    padding: 0;
    max-width: 40ch;
  }

  .domain-note {
    margin-right: 0;
  }

  .domain-schedule {
    margin: 2.5rem 1.25rem 0;
  }

  .domain-banner {
    grid-template-columns: minmax(0, 1fr);
    margin-top: 4rem;
  }

  .domain-banner-cta {
    grid-column: 1;
    grid-row: auto;
    margin-top: 1.5rem;
    justify-self: start;
  }
}

@media (max-width: 560px) {
  .domain-list {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    grid-auto-flow: row;
  }

  .domain-row:nth-child(7n + 1) {
    border-top: 0;
  }

  .domain-row:first-child {
    border-top: 1px solid var(--pn-ink);
  }
}
</style>
