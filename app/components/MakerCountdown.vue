<script setup lang="ts">
import { EVENT, EVENT_START, EVENT_END, useCountdown } from '~/composables/useCountdown'

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
        location: {
          '@type': 'Place',
          name: EVENT.place,
          address: {
            '@type': 'PostalAddress',
            addressLocality: EVENT.placeLocality,
            addressRegion: EVENT.placeRegion,
            addressCountry: EVENT.placeCountry,
          },
        },
      }),
    },
  ],
})
</script>

<template>
  <section id="countdown" class="countdown-section section-padding">
    <div class="container countdown-inner">
      <h2 class="countdown-title">
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
      </p>

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
.countdown-section {
  background-color: var(--color-ink);
  color: var(--color-white);
}

.countdown-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

.countdown-title {
  font-size: clamp(1.75rem, 4vw, 3rem);
  color: var(--color-white);
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
  color: var(--color-white);
  margin-top: -0.5rem;
}

.countdown-when {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: -0.75rem;
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--color-muted-on-dark);
}

.countdown-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--color-cyan);
}

.countdown-eyebrow {
  margin-bottom: -0.75rem;
  color: var(--color-muted-on-dark);
}

.countdown-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

/* Demoted to a secondary readout. These are the ephemeral figures; the date
   above is the fact. */
.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  min-width: 5.25rem;
  padding: 1rem 0.85rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background-color: var(--color-charcoal);
}

.time-number {
  font-family: var(--font-headline);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  line-height: 1;
  color: var(--color-cyan);
  /* The seconds box would jitter every tick without tabular figures. */
  font-variant-numeric: tabular-nums;
}

.time-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-muted-on-dark);
}

.countdown-live {
  font-family: var(--font-headline);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  color: var(--color-red-on-dark);
}

/* Past tense, so it recedes rather than announcing itself. */
.countdown-ended {
  color: var(--color-muted-on-dark);
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
    min-width: 0;
    flex: 1 1 40%;
    padding: 1rem 0.5rem;
  }
}
</style>
