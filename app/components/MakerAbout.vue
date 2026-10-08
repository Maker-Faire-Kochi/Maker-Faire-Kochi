<script setup lang="ts">
/**
 * The three invitations are a schedule: one ruled row each, under column
 * heads, ending on its own key.
 */
const invitations = [
  {
    title: 'Show what you built',
    body: 'Inventors, engineers, students, hobbyists and hardware builders — bring the project and show how it works.',
    href: '/interestform',
    cta: 'Get involved',
    external: false,
  },
  {
    title: 'Learn by building',
    body: 'Workshops, live demos and the people already making inside Kerala’s labs. Finish something, then share it.',
    href: '#categories',
    cta: 'See who fits',
    external: false,
  },
  {
    title: 'Come for the two days',
    body: '26 and 27 January 2027, in Kochi. A public stage for the labs, campuses and workshops that already exist.',
    href: '#countdown',
    cta: 'See the dates',
    external: false,
  },
]

const stats = [
  { to: 40, suffix: '+', label: 'Countries' },
  { to: 200, suffix: '+', label: 'Licensed Faires' },
  { to: 30, suffix: '+', label: 'Featured Faires a year' },
  { to: 2006, from: 1990, label: 'Since' },
]
</script>

<template>
  <section id="about" class="about-section enamel">
    <SheetHead n="01" label="About" />

    <h2 class="about-title">What is Maker Faire?</h2>

    <div class="about-copy">
      <p class="lead-text">
        A festival of invention, creativity and hands-on learning, where people show what they have built.
      </p>
      <p class="body-text">
        Maker Faire began in the Bay Area in 2006. It is now a network of more than 200 licensed Faires in 40-plus countries. In a typical year that is 30-plus large Featured Faires and 190-plus independently run Mini Faires. The two flagship editions in the United States alone draw over 200,000 people a year.
      </p>
      <p class="body-text">
        Maker Faire Kochi 2027 brings that licensed platform to Kerala for the first time. It is India’s second Maker Faire city, after Hyderabad. TinkerHub Foundation and MakerGram are organising it. Their team has run and attended Maker Faire Hyderabad (2018, 2019) and Maker Faire Shenzhen (2018, 2023, 2025).
      </p>
    </div>

    <h3 id="ways-in" class="row-label row-label-ways">Three ways in</h3>
    <table class="schedule" aria-labelledby="ways-in">
      <thead>
        <tr>
          <th scope="col">Way in</th>
          <th scope="col">What it means</th>
          <th scope="col"><span class="visually-hidden">Action</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in invitations" :key="item.title">
          <th scope="row" class="schedule-title">{{ item.title }}</th>
          <td class="schedule-text">{{ item.body }}</td>
          <td class="schedule-action">
            <a
              v-if="item.cta"
              :href="item.href"
              :target="item.external ? '_blank' : undefined"
              :rel="item.external ? 'noopener noreferrer' : undefined"
              class="key"
            >{{ item.cta }}</a>
          </td>
        </tr>
      </tbody>
    </table>

    <h3 class="row-label">Why Kochi, why now</h3>
    <div class="wide-copy">
      <p class="kochi-text">
        Kerala already has the labs. It does not yet have a public stage where the people building inside them can see each other.
      </p>
      <p class="body-text">
        The state holds roughly 25 to 30 of India’s nearly 98 Fab Foundation network labs, 369 Atal Tinkering Labs, and 28 Centres for Early Innovation, with 70 more planned. No Maker Faire has ever been held in Kerala. Kochi, the state’s innovation and startup hub, is the place to start.
      </p>
      <p class="body-text">
        Each January-to-March season Kerala already hosts two flagship festivals: the Kerala Literature Festival, Asia’s largest literary festival, with over 600,000 visitors, and the Kochi-Muziris Biennale, India’s largest art exhibition. There is no equivalent for technology and making. Maker Faire Kochi is that missing piece, in the same season that already brings visitors and media to the state.
      </p>
    </div>

    <h3 class="row-label">The mission</h3>
    <div class="wide-copy">
      <p class="kochi-text">
        Not a one-off weekend. The start of a maker culture that lasts in Kerala.
      </p>
      <p class="body-text">
        The purpose is learning by building: a reason for makers, students and hobbyists to finish a project, show it, and leave with the next one. The Faire gives the Fab Labs, Atal Tinkering Labs and campus communities one shared public moment a year, and a path from a first workshop through incubation and Fab Academy into industry.
      </p>
    </div>

    <h3 class="row-label">2027 and beyond</h3>
    <div class="wide-copy">
      <p class="kochi-text">
        2027 is the first of an annual Faire, not the only one.
      </p>
      <p class="body-text">
        In the year leading to Maker Faire Kochi 2028, TinkerHub will run activations across its 70-plus college chapters in Kerala, extend the roadshow into an ongoing multi-city series, and grow a public Kerala Maker Directory. The exhibitor pipeline and the culture keep building between the two days on the ground.
      </p>
    </div>

    <h3 class="row-label">The global network</h3>
    <dl class="stats-bank">
      <div v-for="s in stats" :key="s.label" class="stat">
        <dt class="stat-label">{{ s.label }}</dt>
        <dd class="stat-number">
          <BitsCountUp :to="s.to" :from="s.from ?? 0" :decimals="s.decimals ?? 0" :suffix="s.suffix ?? ''" />
        </dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.about-section {
  display: grid;
  grid-template-columns: var(--pn-grid);
  padding: 0 0 var(--pn-section);
}

.about-title {
  grid-column: 1;
  padding: 0 var(--pn-gutter);
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 900;
  font-size: var(--pn-d2);
  line-height: 0.9;
  text-transform: uppercase;
  color: var(--pn-ink);
}

.about-copy {
  grid-column: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: var(--pn-gutter);
  padding-right: var(--pn-gutter);
}

.lead-text {
  grid-column: 1 / -1;
  max-width: 36ch;
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 700;
  line-height: 1.12;
  font-size: var(--pn-lead);
  color: var(--pn-ink);
}

.body-text {
  grid-column: 1 / -1;
  margin-top: 1.5rem;
  max-width: 62ch;
  font-family: var(--font-readout);
  font-size: 1.125rem;
  line-height: 1.65;
  line-height: 1.6;
  color: var(--pn-ink);
}

/* ── Schedule: ruled rows under column heads ────────────────────────────── */
.row-label-ways {
  margin-top: 6rem;
}

.schedule {
  grid-column: 2;
  margin: 6rem var(--pn-gutter) 0 0;
  border-collapse: collapse;
  font-family: var(--font-readout);
}

.schedule thead th {
  padding: 0 1.5rem 0.6rem 0;
  font-weight: 500;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: left;
  color: var(--pn-label);
  border-bottom: 1px solid var(--pn-ink);
}

.schedule tbody th,
.schedule td {
  padding: 1.25rem 1.5rem 1.25rem 0;
  vertical-align: top;
  text-align: left;
  border-bottom: 1px solid var(--pn-ink);
}

.schedule-title {
  width: 30%;
  font-weight: 600;
  font-size: 1.125rem;
  line-height: 1.35;
  color: var(--pn-ink);
}

.schedule-text {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--pn-ink);
}

.schedule .schedule-action {
  padding-right: 0;
  text-align: right;
  white-space: nowrap;
}

/* One width for the column, so the keys stack as a bank. */
.schedule-action .key {
  width: 12.5rem;
}

/* ── Sub-sheets: a display title in the narrow bay, content in the wide ── */
.row-label {
  grid-column: 1;
  margin-top: 5rem;
  padding: 0 var(--pn-gutter);
  max-width: 14ch;
  box-sizing: content-box;
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 900;
  font-size: var(--pn-d3);
  line-height: 0.95;
  text-transform: uppercase;
  color: var(--pn-ink);
}

.wide-copy {
  grid-column: 2;
  margin-top: 5rem;
  padding-right: var(--pn-gutter);
  max-width: 62ch;
}

.wide-copy .kochi-text,
.wide-copy .body-text {
  margin-top: 0;
  padding-right: 0;
  max-width: none;
}

.wide-copy .body-text {
  margin-top: 1.25rem;
}

.kochi-text {
  grid-column: 2;
  margin-top: 5rem;
  padding-right: var(--pn-gutter);
  max-width: 44ch;
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 700;
  line-height: 1.12;
  font-size: var(--pn-lead);
  color: var(--pn-ink);
}

/* A ledger, two columns of ruled lines: label, leader, figure. */
.stats-bank {
  grid-column: 2;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: var(--pn-gutter);
  margin: 5rem var(--pn-gutter) 0 0;
  border-top: 1px solid var(--pn-ink);
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.9rem 0 0.8rem;
  border-bottom: 1px solid var(--pn-ink);
}

.stat::after {
  content: '';
  order: 1;
  flex: 1;
  border-bottom: 1px dotted var(--pn-faint);
  transform: translateY(-0.3em);
}

.stat-label { order: 0; }
.stat-number { order: 2; }

.stat-number {
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 900;
  font-size: var(--pn-d3);
  line-height: 1;
  color: var(--pn-ink);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-family: var(--font-readout);
  font-size: 0.9375rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--pn-label);
}

@media (max-width: 1100px) {
  .schedule,
  .schedule tbody,
  .schedule tr,
  .schedule tbody th,
  .schedule td {
    display: block;
  }

  .schedule thead {
    display: none;
  }

  .schedule {
    border-top: 1px solid var(--pn-ink);
  }

  .schedule tr {
    padding: 1.25rem 0 1.5rem;
    border-bottom: 1px solid var(--pn-ink);
  }

  .schedule tbody th,
  .schedule td {
    width: auto;
    padding: 0;
    border: 0;
  }

  .schedule-text {
    margin-top: 0.5rem;
  }

  .schedule .schedule-action {
    margin-top: 1.25rem;
    text-align: left;
  }
}

@media (max-width: 900px) {
  .about-section {
    grid-template-columns: minmax(0, 1fr);
    padding-bottom: 5rem;
  }

  .about-title,
  .about-copy,
  .schedule,
  .row-label,
  .wide-copy,
  .kochi-text,
  .stats-bank {
    grid-column: 1;
  }

  .about-title,
  .row-label {
    padding: 0 1.25rem;
  }

  .about-copy {
    margin-top: 2rem;
    grid-template-columns: minmax(0, 1fr);
    padding: 0 1.25rem;
  }

  .body-text {
    margin-top: 1.5rem;
  }

  .schedule,
  .stats-bank {
    margin: 3.5rem 1.25rem 0;
  }

  .wide-copy,
  .kochi-text {
    margin-top: 1rem;
    padding: 0 1.25rem;
  }

  .stats-bank {
    margin-top: 1rem;
    grid-template-columns: minmax(0, 1fr);
  }

  .row-label,
  .row-label-ways {
    margin-top: 3.5rem;
  }

  .schedule {
    margin-top: 1rem;
  }
}

</style>
