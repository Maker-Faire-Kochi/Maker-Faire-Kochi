<script setup lang="ts">
import { EVENT, EVENT_START, EVENT_END, CONTACT_EMAIL, useCountdown } from '~/composables/useCountdown'

/**
 * Timer logic lives in the composable, shared with the hero overlay, so the two
 * can never drift apart or disagree by a second.
 */
const { units, phase } = useCountdown()

/** "27 January 2027" set as "27" / "January 2027", so the range breaks as
 *  "26 – 27" over the month rather than wherever the measure runs out. */
const [endDay, ...endRest] = EVENT.rangeEnd.label.split(' ')
const endMonth = endRest.join(' ')

const fields = [
  { label: 'Opens', value: EVENT.gatesLabel },
  // Stated rather than left to inference: "Kochi, Kerala" is a city.
  { label: 'Venue', value: EVENT.venueLabel },
]

/**
 * The dates are the point of this section, and until now they existed only as
 * pixels — invisible to search results, link previews and "add to calendar".
 * Structured data is where a date is actually machine-readable.
 */
/**
 * Absolute URLs, resolved the same way app.vue resolves og:image: a relative
 * path in structured data is dropped by most consumers.
 */
const { origin: requestOrigin } = useRequestURL({ xForwardedHost: true, xForwardedProto: true })
const origin = useRuntimeConfig().public.siteUrl || requestOrigin

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: 'Maker Faire Kochi 2027',
        startDate: EVENT_START.toISOString(),
        endDate: EVENT_END.toISOString(),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        description:
          'Kerala’s first licensed Maker Faire. A festival of invention, creativity and hands-on learning in Kochi, 26–27 January 2027. Built together by TinkerHub Foundation, MakerGram and Kerala Startup Mission.',
        url: origin,
        image: [`${origin}/img/logo/mf-kochi-square-512.png`],
        /**
         * The venue is undecided, so `Place` carries the CITY and says so in its
         * name rather than inventing an address. Replace `name` with the venue
         * and add streetAddress/postalCode/geo the moment it is known -- Google
         * will not show a location in an event card without a resolvable place.
         */
        location: {
          '@type': 'Place',
          name: EVENT.venueLabel,
          address: {
            '@type': 'PostalAddress',
            addressLocality: EVENT.placeLocality,
            addressRegion: EVENT.placeRegion,
            addressCountry: EVENT.placeCountry,
          },
        },
        /**
         * Admission is free. `offers` is not decoration: Google generally will
         * not render an event rich result without it, and price '0' is how
         * "free" is expressed -- omitting offers reads as "unknown", not "free".
         */
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          validFrom: new Date().toISOString(),
          url: origin,
        },
        organizer: [
          {
            '@type': 'Organization',
            name: 'TinkerHub Foundation',
            email: CONTACT_EMAIL,
          },
          {
            '@type': 'Organization',
            name: 'MakerGram',
          },
          {
            '@type': 'Organization',
            name: 'Kerala Startup Mission',
            alternateName: 'KSUM',
          },
        ],
      }),
    },
  ],
})
</script>

<template>
  <section id="countdown" class="countdown-section enamel">
    <SheetHead n="03" label="When" />

    <h2 class="countdown-title">
      Two days in Kochi.<br />
      Makers from across Kerala.
    </h2>

    <div class="countdown-facts">
      <!-- The date leads, and it renders in every phase: it is the fact the
           section exists for, so it outranks the ticking figures below it. -->
      <p class="countdown-date">
        <time :datetime="EVENT.rangeStart.iso">{{ EVENT.rangeStart.label }}</time>
        &ndash;
        <time :datetime="EVENT.rangeEnd.iso">{{ endDay }}<br />{{ endMonth }}</time>
      </p>

      <dl class="countdown-when">
        <div v-for="f in fields" :key="f.label" class="when-field">
          <dt>{{ f.label }}</dt>
          <dd>{{ f.value }}</dd>
        </div>
      </dl>
    </div>

    <div class="instrument">
      <template v-if="phase === 'upcoming'">
        <p class="instrument-label engrave">Time remaining</p>

        <!-- No aria-live: a value that changes every second would be relentless
             noise on a screen reader. The date above carries the same fact. -->
        <div
          class="countdown-grid spec-table"
          role="group"
          aria-label="Time remaining until Maker Faire Kochi opens on 26 January 2027"
        >
          <div v-for="u in units" :key="u.key" class="time-block">
            <span class="time-number">{{ u.value }}</span>
            <span class="time-label">{{ u.label }}</span>
          </div>
        </div>
      </template>

      <p v-else-if="phase === 'live'" class="countdown-live">
        Maker Faire Kochi is open. Join us.
      </p>

      <p v-else class="countdown-live countdown-ended">
        Thank you for being part of Maker Faire Kochi 2027.
      </p>
    </div>
  </section>
</template>

<style scoped>
.countdown-section {
  display: grid;
  grid-template-columns: var(--pn-grid);
  padding: 0 0 var(--pn-section);
}

/* The sheet title, set like every other sheet's. */
.countdown-title {
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

.countdown-facts {
  grid-column: 2;
  padding-right: var(--pn-gutter);
}

/* The date is the largest fact on the sheet: the hero's display step. */
.countdown-date {
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 900;
  font-size: clamp(2.75rem, 5vw, 4.75rem);
  line-height: 0.88;
  text-transform: uppercase;
  color: var(--pn-ink);
}

/* Labelled fields, as in the hero's title block. */
.countdown-when {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1.5rem;
  margin: 2.5rem 0 0;
}

.when-field dt {
  font-family: var(--font-readout);
  font-weight: 500;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-label);
}

.when-field dd {
  margin: 0.4rem 0 0;
  font-family: var(--font-readout);
  font-weight: 600;
  font-size: 1.125rem;
  line-height: 1.3;
  color: var(--pn-ink);
}

/* Ruled like every other table on the sheet. */
.instrument {
  grid-column: 2;
  margin: 4rem var(--pn-gutter) 0 0;
}

.instrument-label {
  color: var(--pn-ink);
}

/* auto-fit with a rem minimum: four equal cells normally, a clean 2x2 at
   150% text, one column at 200% -- never a ragged orphan. 3.75rem is the
   largest minimum that still seats four at 320px. .spec-table draws the
   rules so that a wrapped row never carries a stray leading one. */
.countdown-grid {
  grid-template-columns: repeat(auto-fit, minmax(3.75rem, 1fr));
  margin-top: 0.85rem;
}

/* Minutes and Seconds at 14px need about 65px. Four cells at 320px leave
   about 54px, and at 360px they still miss by a pixel, so the words clip
   against the cell wall. 8.5rem is two columns on a 320–399px sheet and
   one column once text size doubles, because the minimum grows with rem.
   The 3.75rem minimum stays above 399px, because raising it leaves a
   3+1 orphan in the band between three columns and four. */
@media (max-width: 399px) {
  .countdown-grid {
    grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
  }
}

.time-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.time-number {
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 900;
  font-size: clamp(2rem, 3.4vw, 3.25rem);
  line-height: 0.9;
  color: var(--pn-ink);
  font-variant-numeric: tabular-nums;
}

.time-label {
  font-family: var(--font-readout);
  font-size: 0.875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--pn-label);
}

.countdown-live {
  margin-top: 1rem;
  font-family: var(--font-panel);
  font-stretch: 62%;
  font-weight: 900;
  font-size: var(--pn-d3);
  text-transform: uppercase;
  color: var(--pn-ink);
}

.countdown-ended {
  color: var(--pn-label);
}

@media (max-width: 900px) {
  .countdown-section {
    grid-template-columns: minmax(0, 1fr);
    padding-bottom: 5rem;
  }

  .countdown-title,
  .countdown-facts,
  .instrument {
    grid-column: 1;
  }

  .countdown-title {
    padding: 0 1.25rem;
  }

  .countdown-facts {
    margin-top: 1.5rem;
    padding: 0 1.25rem;
  }

  .countdown-date {
    font-size: clamp(3rem, 16vw, 5.5rem);
  }

  .instrument {
    margin: 3rem 1.25rem 0;
  }

  .time-block {
    padding: 1rem 0.75rem 1.25rem;
  }
}

@media (max-width: 480px) {
  .time-block {
    padding: 0.85rem 0.5rem 1rem;
  }
}
</style>
