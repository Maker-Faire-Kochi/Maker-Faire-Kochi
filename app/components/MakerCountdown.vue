<script setup lang="ts">
import { EVENT, EVENT_START, EVENT_END, CONTACT_EMAIL, useCountdown } from '~/composables/useCountdown'

/**
 * Timer logic lives in the composable, shared with the hero overlay, so the two
 * can never drift apart or disagree by a second.
 */
const { units, phase } = useCountdown()

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
          'A family-friendly festival of invention, creativity and resourcefulness. The Greatest Show (& Tell) on Earth comes to Kerala for the first time.',
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
        organizer: {
          '@type': 'Organization',
          name: 'Maker Faire Kochi',
          url: origin,
          email: CONTACT_EMAIL,
        },
      }),
    },
  ],
})
</script>

<template>
  <section id="countdown" class="countdown-section section-padding">
    <div class="container countdown-inner">
      <h2 class="countdown-title display-type">
        Two days. One harbour.<br />
        <span class="countdown-title-accent">Everything anyone made.</span>
      </h2>

      <!-- The date leads, and it renders in every phase.
           It used to sit BELOW the countdown grid at 14.4px in muted grey, under
           four 52px numerals — so the number that changes every second dominated
           the section and the date the whole section exists to communicate was
           the smallest thing in it. That is the inversion this fixes. -->
      <p class="countdown-date">
        <time :datetime="EVENT.rangeStart.iso">{{ EVENT.rangeStart.label }}</time>
        &ndash;
        <time :datetime="EVENT.rangeEnd.iso">{{ EVENT.rangeEnd.label }}</time>
      </p>

      <p class="countdown-when">
        <span>{{ EVENT.gatesLabel }}</span>
        <span class="countdown-dot" aria-hidden="true"></span>
        <span>{{ EVENT.place }}</span>
        <span class="countdown-dot" aria-hidden="true"></span>
        <span>{{ EVENT.admissionLabel }}</span>
      </p>

      <!-- Stated rather than left to inference. "Kochi, Kerala" is a city, and
           without this line a reader reasonably assumes it is the venue. -->
      <p class="countdown-venue">{{ EVENT.venueLabel }}</p>

      <template v-if="phase === 'upcoming'">
        <p class="countdown-eyebrow eyebrow">Time remaining</p>

        <!-- No aria-live: a value that changes every second would be relentless
             noise on a screen reader. The date line above carries the same
             information, and is what the group's label points at. -->
        <div
          class="countdown-grid"
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
        The Faire is on. Come and see.
      </p>

      <p v-else class="countdown-live countdown-ended">
        That&rsquo;s a wrap. Thank you, Kochi.
      </p>
    </div>
  </section>
</template>

<style scoped>
/* Dark ground on purpose: it gives the page a rhythm between the white hero,
   this band, and the white DOMAIN section, rather than one unbroken sheet. */
/* This section now CLOSES the page rather than sitting under the hero, so it
   is the last thing before the footer -- and the footer is also dark. The
   hairline that keeps the two dark planes apart is owned by .maker-footer's
   border-top; declaring it on both sides stacks two 1px rules into a 2px one. */
.countdown-section {
  background-color: var(--color-ink);
  color: var(--label-on-dark);
}

/* gap:0 plus per-child margins. The stack previously used a uniform 1.5rem gap
   and then clawed three of the gaps back with negative margins (-0.5rem,
   -0.75rem, -0.75rem) -- which is a gap that was simply the wrong size, paid
   for three times. Graduated spacing states the intended rhythm directly. */
.countdown-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0;
}

.countdown-title {
  font-size: var(--text-title-1);
  line-height: var(--text-title-1-lh);
  color: var(--label-on-dark);
  max-width: 22ch;
}

.countdown-title-accent {
  color: var(--color-cyan);
}

/* Deliberately NOT var(--font-headline). Bungee is wide enough that this line
   wraps mid-date at 390px, and its weight reads shoutier than a date needs to
   be — the point here is legibility, not volume. Outfit 700 at this size is
   unmistakably the primary line without raising its voice. */
.countdown-date {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: clamp(1.5rem, 3.4vw, 2.1rem);
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--label-on-dark);
  margin-top: var(--sp-4);
}

.countdown-when {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-top: var(--sp-2);
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--label-secondary-on-dark);
}

.countdown-venue {
  margin-top: var(--sp-1);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  color: var(--label-secondary-on-dark);
}

.countdown-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--color-cyan);
}

.countdown-eyebrow {
  margin-top: var(--sp-5);
  color: var(--label-secondary-on-dark);
}

/* ── One segmented control, not four floating cards ───────────────────────
   The four blocks were `flex-wrap` with `min-width: 5.25rem`, so on any width
   that could not seat all four they wrapped into a ragged 2x2 whose cells were
   not the same width as each other -- four separate objects that happened to
   sit near each other.

   A 4-column grid inside ONE container makes it a single instrument: the cells
   are equal by construction at every width, they cannot wrap, and the dividers
   say the four figures are one reading rather than four facts. */
.countdown-grid {
  display: grid;
  /* auto-fit + a REM minimum, not a fixed repeat(4). A rigid four-column track
     cannot reflow, so at 200% text the cells stay 1/4 of the container while
     the labels inside them double -- "SECONDS" then clips, and clipped is
     worse than the ragged wrap this replaced. Because the minimum is in rem it
     scales with the reader's text size: four across normally, dropping to two
     when a cell can no longer be 4.5rem. Cells stay equal either way, which is
     the property that made this a segmented control rather than four cards.

     3.75rem is derived, not picked: the narrowest supported viewport is 320px,
     .container eats 2 x 1.5rem, leaving 272px, and auto-fit seats
     floor((272 + gap) / (60 + gap)) = 4 columns with ~13px to spare. Raising it
     to 4.5rem drops 320px to a 3 + 1 orphan, which is exactly the ragged wrap
     this layout exists to prevent -- so re-check 320px if you change it. */
  grid-template-columns: repeat(auto-fit, minmax(3.75rem, 1fr));
  /* The dividers ARE the 1px gaps: the container paints the separator colour
     and each cell paints over it. A border-left on each cell cannot survive
     reflow (the first cell of the second row would draw a stray leading rule);
     grid gaps separate every row and column correctly however it wraps. */
  gap: 1px;
  margin-top: var(--sp-3);
  width: 100%;
  max-width: 26rem;
  overflow: hidden;
  border-radius: var(--radius-card);
  border: 1px solid var(--separator-on-dark);
  background-color: var(--separator-on-dark);
}

/* Demoted to a secondary readout. These are the ephemeral figures; the date
   above is the fact. */
.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-3) var(--sp-1);
  /* Paints over the container's separator ground, leaving only the gaps. */
  background-color: var(--color-charcoal);
  min-width: 0;
}

.time-number {
  font-family: var(--font-headline);
  font-size: clamp(1.5rem, 3.6vw, 2.15rem);
  line-height: 1;
  color: var(--color-cyan);
  /* The seconds box would jitter every tick without tabular figures. */
  font-variant-numeric: tabular-nums;
}

.time-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--label-secondary-on-dark);
}

.countdown-live {
  margin-top: var(--sp-5);
  font-family: var(--font-headline);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  color: var(--color-red-on-dark);
}

/* Past tense, so it recedes rather than announcing itself. */
.countdown-ended {
  color: var(--label-secondary-on-dark);
}

/* Same reason as the hero band: once these two facts wrap onto separate lines
   the dot between them is stranded at the end of the first line, separating
   nothing. Stack them and drop it. */
@media (max-width: 560px) {
  .countdown-when {
    flex-direction: column;
    gap: 0.4rem;
  }

  .countdown-dot {
    display: none;
  }
}

@media (max-width: 480px) {
  .time-block {
    padding: var(--sp-2) 0.25rem;
  }

  .time-label {
    font-size: 0.62rem;
    letter-spacing: 0.06em;
  }
}
</style>
