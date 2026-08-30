import { computed, onMounted, onUnmounted } from 'vue'

/** Maker Faire Kochi 2027 — Jan 26, 09:00 IST. */
export const EVENT_START = new Date('2027-01-26T09:00:00+05:30')

/**
 * The faire is two days, and without an end the site has no way to stop saying
 * "The Faire is on. Come and see." — it would have said that every day from
 * 26 January 2027 onward, forever.
 */
export const EVENT_END = new Date('2027-01-27T18:00:00+05:30')

/**
 * The event's facts in one place. These strings were previously typed out
 * separately in MakerCountdown.vue and hero/NetHero.vue, which is how a date
 * gets corrected in one of them and not the other.
 *
 * `nuxt.config.ts` deliberately keeps its own literals: the head config is
 * evaluated outside the app's module graph and cannot import from here.
 */
export const EVENT = {
  /**
   * One entry per day, each with its own ISO date. A range needs TWO <time>
   * elements: `<time datetime="2027-01-26T09:00">26 – 27 January 2027</time>`
   * tells a parser the whole range happens at one instant, which is a lie.
   */
  rangeStart: { iso: '2027-01-26', label: '26', heroLabel: 'Jan 26' },
  rangeEnd: { iso: '2027-01-27', label: '27 January 2027', heroLabel: '27, 2027' },
  gatesLabel: 'Gates open at 9:00 AM IST',
  place: 'Kochi, Kerala',
  placeLocality: 'Kochi',
  placeRegion: 'Kerala',
  placeCountry: 'IN',
} as const

/** upcoming → live → ended. Replaces a lone `started` boolean, which had no end. */
export type EventPhase = 'upcoming' | 'live' | 'ended'

export interface CountdownParts {
  days: string
  hours: string
  minutes: string
  seconds: string
  phase: EventPhase
}

function partsFor(startMs: number, endMs: number, now: number): CountdownParts {
  const zero = { days: '00', hours: '00', minutes: '00', seconds: '00' }
  if (now >= endMs) return { ...zero, phase: 'ended' }
  if (now >= startMs) return { ...zero, phase: 'live' }

  const distance = startMs - now
  const pad = (n: number) => String(Math.floor(n)).padStart(2, '0')
  return {
    days: pad(distance / 86400000),
    hours: pad((distance % 86400000) / 3600000),
    minutes: pad((distance % 3600000) / 60000),
    seconds: pad((distance % 60000) / 1000),
    phase: 'upcoming',
  }
}

/**
 * Shared by anything that shows the countdown, so two instances can never drift
 * apart or disagree by a second.
 *
 * Seeded through `useState` rather than starting at '00'. The server computes
 * real figures, Nuxt serialises them into the payload, and the client's first
 * render reads the same numbers back — so the markup arrives correct instead of
 * flashing four zeroes, and hydration still matches exactly. Computing directly
 * in setup would look the same on screen but mismatch on the seconds digit,
 * because the server and the browser evaluate `Date.now()` moments apart.
 */
export function useCountdown(start: Date = EVENT_START, end: Date = EVENT_END) {
  const startMs = start.getTime()
  const endMs = end.getTime()
  const state = useState<CountdownParts>(`countdown:${startMs}`, () =>
    partsFor(startMs, endMs, Date.now()),
  )

  let timer: ReturnType<typeof setInterval> | null = null

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function tick() {
    state.value = partsFor(startMs, endMs, Date.now())
    // Only 'ended' is terminal. Stopping at 'live' would strand the page mid-faire
    // and it would never reach its own closing state.
    if (state.value.phase === 'ended') stop()
  }

  onMounted(() => {
    tick()
    // Nothing left to count. The previous version always started an interval and
    // then cleared it a second later on the first tick.
    if (state.value.phase === 'ended') return
    timer = setInterval(tick, 1000)
  })

  onUnmounted(stop)

  const phase = computed(() => state.value.phase)

  return {
    days: computed(() => state.value.days),
    hours: computed(() => state.value.hours),
    minutes: computed(() => state.value.minutes),
    seconds: computed(() => state.value.seconds),
    phase,
    /** Kept as a derived alias so existing callers keep working. */
    started: computed(() => phase.value !== 'upcoming'),
    /** Plain values, ready for v-for — no refs nested inside an array. */
    units: computed(() => [
      { key: 'days', value: state.value.days, label: 'Days' },
      { key: 'hours', value: state.value.hours, label: 'Hours' },
      { key: 'minutes', value: state.value.minutes, label: 'Minutes' },
      { key: 'seconds', value: state.value.seconds, label: 'Seconds' },
    ]),
  }
}
