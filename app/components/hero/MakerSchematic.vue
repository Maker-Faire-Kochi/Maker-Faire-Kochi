<script setup lang="ts">
/**
 * The hero drawing: a bench of working machines that visitors can run.
 *
 * Six exhibits, each a keyboard-reachable button: a cheena vala that dips its
 * net and comes up with a catch, a coconut palm that drops a nut, a restored
 * treadle sewing machine, a charkha spinning wool, a drone that flies a loop
 * a little higher on each tap (the height is random) and sometimes clips the
 * palm and crash-lands,
 * and a robot arm that follows the pointer (two-link IK) only after it is
 * clicked. A second click, or eight seconds without a pointer move, sends it
 * back to rest. While it is tracking, the target stays clamped to REACH, so
 * it can never reach over the charkha or the sewing machine.
 *
 * Ink draws the parts at two weights (2 parts, 1 annotation); cyan is the
 * annotation layer and water; red is thread and wool. Idle motion is opted in
 * by `.hero-stage.is-ready` and paused by `.is-offscreen`, both owned by
 * NetHero. A run is a visitor's own action, so it plays regardless of
 * Save-Data; `prefers-reduced-motion` still removes every animation, and a run
 * then reads through its sound and the lit hit area.
 *
 * Rotating parts use `transform-box: view-box; transform-origin: 0 0` inside a
 * translated group, so the viewBox origin must stay at 0 0.
 */
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { playMachine, type MachineSound } from '~/composables/usePanelSound'

type MachineId = 'vala' | 'palm' | 'sewing' | 'charkha' | 'drone' | 'robot'

const RUN_MS: Record<MachineId, number> = { vala: 4800, palm: 1800, sewing: 3000, charkha: 3000, drone: 3000, robot: 700 }
const CRASH_MS = 4600
const SOUND: Record<MachineId, MachineSound> = { vala: 'splash', palm: 'coconut', sewing: 'stitch', charkha: 'whirr', drone: 'rotor', robot: 'servo' }

const running = reactive<Record<MachineId, boolean>>({ vala: false, palm: false, sewing: false, charkha: false, drone: false, robot: false })
const timers: Partial<Record<MachineId, number>> = {}
/** About one flight in three. The palm shakes while this is true. */
const crashing = ref(false)
const struck = ref(false)
/** Normal flights stay above the machines. The crash vars are filled only when it clips the palm. */
const flight = reactive({
  span: '140px',
  lift: '-28px',
  hitX: '100px',
  hitY: '40px',
  landX: '110px',
  landY: '400px',
})

function px(n: number) {
  return `${n.toFixed(1)}px`
}

/** A point in the palm's drawing, expressed in the drone group's own units. */
function droneLocal(palmX: number, palmY: number) {
  const there = placed('palm', palmX, palmY)
  const home = placed('drone', ANCHOR.drone.x, ANCHOR.drone.y)
  const s = zoom('drone')
  return { x: (there.x - home.x) / s, y: (there.y - home.y) / s }
}

function rollFlight() {
  crashing.value = Math.random() < 0.34
  flight.span = px(110 + Math.random() * 60)
  flight.lift = px(-(10 + Math.random() * 26))
  if (!crashing.value) return
  const crown = palmMid.crown
  const hit = droneLocal(crown[0] - 22, crown[1] - 30)
  const land = droneLocal(crown[0] - 36, 572)
  flight.hitX = px(hit.x)
  flight.hitY = px(hit.y)
  flight.landX = px(land.x)
  flight.landY = px(land.y)
}

function run(id: MachineId) {
  if (id === 'drone') {
    rollFlight()
    struck.value = false
  }
  playMachine(id === 'drone' && crashing.value ? 'crash' : SOUND[id])
  // Restart: drop the class for one frame so the CSS animation replays.
  running[id] = false
  if (timers[id]) window.clearTimeout(timers[id])
  const ms = id === 'drone' && crashing.value ? CRASH_MS : RUN_MS[id]
  requestAnimationFrame(() => {
    running[id] = true
    if (id === 'drone') struck.value = crashing.value
    timers[id] = window.setTimeout(() => {
      running[id] = false
      if (id === 'drone') struck.value = false
    }, ms)
  })
}

function onKey(e: KeyboardEvent, id: MachineId) {
  if (e.key !== 'Enter' && e.key !== ' ') return
  e.preventDefault()
  run(id)
}

/** Balloon -> part. Numbers are the items' numbers in the domains list. */
const BALLOONS = [
  { n: '09', id: 'vala' as const, name: 'Cheena vala', x: 168, y: 250, tx: 246, ty: 348 },
  { n: '11', id: 'palm' as const, name: 'Coconut palm', x: 716, y: 190, tx: 626, ty: 236 },
  { n: '07', id: 'sewing' as const, name: 'Treadle sewing machine', x: 470, y: 322, tx: 478, ty: 378 },
  { n: '02', id: 'charkha' as const, name: 'Charkha and wool', x: 744, y: 360, tx: 712, ty: 404 },
  { n: '03', id: 'drone' as const, name: 'Drone', x: 560, y: 30, tx: 516, ty: 56 },
  { n: '01', id: 'robot' as const, name: 'Robot arm', x: 938, y: 520, tx: 893, ty: 570 },
]

/**
 * Each machine grows about its own anchor so the feet stay on the ground.
 * The cheena vala stays near its current size. Its net reaches toward the
 * other machines and stops short of the sewing machine, so a larger one
 * would cover that bench.
 * The others grow into the air. A large screen adds a short gap — much less
 * than a stretched sheet, so they read as bigger and closer, not further apart.
 */
const ANCHOR: Record<MachineId, { x: number, y: number }> = {
  // Each one grows away from its neighbour: the vala and the sewing machine
  // grow left, the charkha and the arm grow right, the palm stays planted.
  vala: { x: 360, y: 560 },
  drone: { x: 470, y: 68 },
  sewing: { x: 560, y: 600 },
  palm: { x: 598, y: 600 },
  charkha: { x: 630, y: 600 },
  robot: { x: 830, y: 600 },
}
const SPREAD: Partial<Record<MachineId, number>> = {
  drone: 6,
  sewing: 0,
  palm: 34,
  charkha: 88,
  robot: 126,
}
/** Phone sheet has no wide gap, so the wheel still needs a step to the right of the trunk. */
const PACK: Partial<Record<MachineId, number>> = {
  charkha: 26,
  robot: 30,
}
const wide = ref(false)

function zoom(id: MachineId) {
  if (id === 'vala') return wide.value ? 1.08 : 1.04
  return wide.value ? 1.26 : 1.08
}

function offset(id: MachineId) {
  const pack = wide.value ? 0 : (PACK[id] ?? 0)
  const spread = wide.value ? (SPREAD[id] ?? 0) : 0
  // The vala grows left of its anchor, which parked the pier and the hover
  // box off the sheet. Slide the whole machine back onto the page.
  const nudge = id === 'vala' ? 36 : 0
  return pack + spread + nudge
}

/** `pose` is an SVG transform: grow about the anchor, then slide by `offset`. */
function pose(id: MachineId) {
  const a = ANCHOR[id]
  const dx = offset(id)
  const s = zoom(id)
  return `translate(${(a.x + dx).toFixed(1)} ${a.y}) scale(${s}) translate(${-a.x} ${-a.y})`
}

function placed(id: MachineId, x: number, y: number) {
  const a = ANCHOR[id]
  const s = zoom(id)
  return {
    x: a.x + offset(id) + (x - a.x) * s,
    y: a.y + (y - a.y) * s,
  }
}

const sheetWidth = computed(() => Math.max(960, Math.ceil(placed('robot', 980, 580).x + 36)))

const balloons = computed(() => BALLOONS.map((b) => {
  const at = placed(b.id, b.x, b.y)
  const tip = placed(b.id, b.tx, b.ty)
  const dx = tip.x - at.x
  const dy = tip.y - at.y
  const d = Math.hypot(dx, dy) || 1
  return {
    ...b,
    x: at.x,
    y: at.y,
    tx: tip.x,
    ty: tip.y,
    leader: `M${(at.x + (dx / d) * 16).toFixed(1)} ${(at.y + (dy / d) * 16).toFixed(1)}L${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`,
  }
}))

const hover = ref<MachineId | null>(null)

/** A round-ended link about two pivots. */
function stadium(len: number, r: number): string {
  return `M0 ${-r}H${len}A${r} ${r} 0 0 1 ${len} ${r}H0A${r} ${r} 0 0 1 0 ${-r}Z`
}

function spokes(n: number, r0: number, r1: number): string {
  let d = ''
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    d += `M${(Math.cos(a) * r0).toFixed(1)} ${(Math.sin(a) * r0).toFixed(1)}L${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1).toFixed(1)}`
  }
  return d
}

/** A carded tuft of wool: a ring of soft bumps. */
function fluff(cx: number, cy: number, r: number, bumps: number): string {
  let d = ''
  for (let i = 0; i <= bumps; i++) {
    const a = (i / bumps) * Math.PI * 2
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r * 0.8
    d += i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : `A${(r * 0.36).toFixed(1)} ${(r * 0.36).toFixed(1)} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return `${d}Z`
}

/**
 * A coconut palm. The trunk is a tapered quadratic from `base` to `crown`
 * with growth rings; the fronds are drawn about (0, 0) so the crown can sway
 * about its own top inside a translated group.
 */
function palm(base: [number, number], ctrl: [number, number], crown: [number, number], w0: number, w1: number, fronds: [number, number][]) {
  const q = (t: number, a: number, b: number, c: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c
  const L: string[] = []
  const R: string[] = []
  let rings = ''
  const N = 14
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = q(t, base[0], ctrl[0], crown[0])
    const y = q(t, base[1], ctrl[1], crown[1])
    const tx = 2 * (1 - t) * (ctrl[0] - base[0]) + 2 * t * (crown[0] - ctrl[0])
    const ty = 2 * (1 - t) * (ctrl[1] - base[1]) + 2 * t * (crown[1] - ctrl[1])
    const m = Math.hypot(tx, ty) || 1
    const w = (w0 + (w1 - w0) * t) / 2
    const nx = (-ty / m) * w
    const ny = (tx / m) * w
    L.push(`${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)}`)
    R.unshift(`${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)}`)
    if (i > 0 && i < N) rings += `M${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)}L${(x - nx).toFixed(1)} ${(y - ny + 2).toFixed(1)}`
  }
  let rib = ''
  let leaf = ''
  for (const [deg, len] of fronds) {
    const a = (deg * Math.PI) / 180
    const dx = Math.cos(a)
    const dy = Math.sin(a)
    const droop = len * (0.2 + 0.4 * Math.abs(dx))
    const c = [dx * len * 0.55, dy * len * 0.55 - len * 0.2]
    const e = [dx * len, dy * len + droop]
    rib += `M0 0Q${c[0]!.toFixed(1)} ${c[1]!.toFixed(1)} ${e[0]!.toFixed(1)} ${e[1]!.toFixed(1)}`
    for (let t = 0.16; t < 0.98; t += 0.085) {
      const bx = 2 * (1 - t) * t * c[0]! + t * t * e[0]!
      const by = 2 * (1 - t) * t * c[1]! + t * t * e[1]!
      let tx = 2 * (1 - t) * c[0]! + 2 * t * (e[0]! - c[0]!)
      let ty = 2 * (1 - t) * c[1]! + 2 * t * (e[1]! - c[1]!)
      const m = Math.hypot(tx, ty) || 1
      tx /= m
      ty /= m
      const l = len * 0.22 * (1 - 0.6 * t)
      for (const side of [1, -1]) {
        const lx = bx + (tx * 0.45 - ty * side) * l
        const ly = by + (ty * 0.45 + tx * side) * l + l * 0.5
        leaf += `M${bx.toFixed(1)} ${by.toFixed(1)}L${lx.toFixed(1)} ${ly.toFixed(1)}`
      }
    }
  }
  return { trunk: `M${L.join('L')}L${R.join('L')}Z`, rings, rib, leaf, crown }
}

const FRONDS: [number, number][] = [[-170, 78], [-138, 88], [-108, 70], [-72, 72], [-40, 90], [-8, 80], [160, 60], [22, 58]]
const palmMid = palm([598, 600], [614, 430], [592, 238], 13, 7, FRONDS)
/** From the drop nut's rest (crown + 16) to the ground, less its radius. Local units. */
const NUT_FALL = 600 - 7 - (palmMid.crown[1] + 16)

const upperArm = stadium(L1(), 13)
const forearm = stadium(L2(), 10)
function L1() { return 140 }
function L2() { return 118 }

/* ── Robot arm: two-link IK toward the pointer ─────────────────────────── */
const SHOULDER = { x: 870, y: 552 }
const REST = { x: 830, y: 470 }
/** Follow target is clamped here, so the arm cannot swing over the charkha. */
const REACH = { x0: 815, x1: 950, y0: 400, y1: 520 }

function solve(tx: number, ty: number) {
  const l1 = L1()
  const l2 = L2()
  let dx = Math.min(REACH.x1, Math.max(REACH.x0, tx)) - SHOULDER.x
  let dy = Math.min(REACH.y1, Math.max(REACH.y0, ty)) - SHOULDER.y
  let d = Math.hypot(dx, dy)
  const max = l1 + l2 - 4
  const min = Math.abs(l1 - l2) + 12
  if (d > max) { dx *= max / d; dy *= max / d; d = max }
  if (d < min) { const k = min / (d || 1); dx *= k; dy *= k; d = min }
  const a = Math.atan2(dy, dx)
  const b = Math.acos(Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))))
  // Elbow up: of the two solutions take the one whose elbow sits higher.
  const s1 = a - b
  const s2 = a + b
  const shoulder = Math.sin(s1) < Math.sin(s2) ? s1 : s2
  const ex = Math.cos(shoulder) * l1
  const ey = Math.sin(shoulder) * l1
  const fore = Math.atan2(dy - ey, dx - ex)
  const deg = 180 / Math.PI
  return { shoulder: shoulder * deg, elbow: (fore - shoulder) * deg, wrist: 90 - fore * deg }
}

const arm = reactive(solve(REST.x, REST.y))
const target = { ...solve(REST.x, REST.y) }
const grip = ref(false)
/** True only between the click that arms it and the click or timeout that parks it. */
const tracking = ref(false)
const svgEl = ref<SVGSVGElement | null>(null)
let raf = 0
let idleTimer = 0
/** Parks itself if the pointer goes quiet. A move restarts the clock. */
const TRACK_MS = 8000

function step() {
  const k = 0.18
  arm.shoulder += (target.shoulder - arm.shoulder) * k
  arm.elbow += (target.elbow - arm.elbow) * k
  arm.wrist += (target.wrist - arm.wrist) * k
  const done = Math.abs(target.shoulder - arm.shoulder) + Math.abs(target.elbow - arm.elbow) < 0.15
  raf = done ? 0 : requestAnimationFrame(step)
}

function aim(x: number, y: number) {
  Object.assign(target, solve(x, y))
  if (!raf) raf = requestAnimationFrame(step)
}

function toScene(e: MouseEvent) {
  const svg = svgEl.value
  const m = svg?.getScreenCTM()
  if (!svg || !m) return null
  return new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
}

function park() {
  tracking.value = false
  grip.value = false
  if (idleTimer) window.clearTimeout(idleTimer)
  idleTimer = 0
  aim(REST.x, REST.y)
}

function bumpIdle() {
  if (idleTimer) window.clearTimeout(idleTimer)
  idleTimer = window.setTimeout(park, TRACK_MS)
}

function onMove(e: PointerEvent) {
  if (!tracking.value) return
  const p = toScene(e)
  if (!p) return
  const local = toLocal('robot', p.x, p.y)
  aim(local.x, local.y)
  bumpIdle()
}

function onRobot(e?: Event) {
  run('robot')
  if (tracking.value) {
    park()
    return
  }
  tracking.value = true
  grip.value = true
  bumpIdle()
  if (e instanceof MouseEvent) {
    const p = toScene(e)
    if (p) {
      const local = toLocal('robot', p.x, p.y)
      aim(local.x, local.y)
    }
  }
}

/** Inverse of `pose`: a viewBox point back into the arm's unscaled drawing. */
function toLocal(id: MachineId, x: number, y: number) {
  const a = ANCHOR[id]
  const s = zoom(id)
  return {
    x: a.x + (x - (a.x + offset(id))) / s,
    y: a.y + (y - a.y) / s,
  }
}

let wideMedia: MediaQueryList | null = null
function syncWide() { wide.value = !!wideMedia?.matches }

onMounted(() => {
  svgEl.value?.addEventListener('pointermove', onMove)
  wideMedia = window.matchMedia('(min-width: 1280px) and (min-height: 700px)')
  syncWide()
  wideMedia.addEventListener('change', syncWide)
})

onUnmounted(() => {
  svgEl.value?.removeEventListener('pointermove', onMove)
  wideMedia?.removeEventListener('change', syncWide)
  if (raf) cancelAnimationFrame(raf)
  if (idleTimer) window.clearTimeout(idleTimer)
  for (const t of Object.values(timers)) window.clearTimeout(t)
})

const woolTuft = fluff(642, 374, 22, 11)
</script>

<template>
  <svg
    ref="svgEl"
    class="schematic"
    :viewBox="`0 0 ${sheetWidth} 600`"
    preserveAspectRatio="xMaxYMax meet"
    role="group"
    aria-label="A bench of working machines. Each one can be run."
  >
    <defs>
      <pattern id="sch-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0V6" class="hatch" />
      </pattern>
      <pattern id="sch-mesh" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0V8M0 0H8" class="mesh" />
      </pattern>
      <clipPath id="sch-water-clip">
        <rect x="120" y="540" width="210" height="60" />
      </clipPath>
    </defs>

    <!-- ── 09 Cheena vala over the backwater ─────────────────────────── -->
    <g
      class="machine"
      :transform="pose('vala')"
      :style="{ '--wave': `${(40 * zoom('vala')).toFixed(1)}px` }"
      :class="{ 'is-running': running.vala, 'is-hover': hover === 'vala' }"
      role="button"
      tabindex="0"
      aria-label="Run the cheena vala"
      @click="run('vala')"
      @keydown="onKey($event, 'vala')"
      @pointerenter="hover = 'vala'"
      @pointerleave="hover = null"
    >
      <rect class="hit" x="4" y="308" width="292" height="292" />
      <!-- Backwater sits under the net, between the pier and the sewing
           machine. The surface slides by exactly one wave period. -->
      <g clip-path="url(#sch-water-clip)">
        <g class="water-surface">
          <path class="water-body" d="M80 556q10-5 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0V600H80Z" />
          <path class="wave" d="M80 556q10-5 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0" />
        </g>
        <path class="current" d="M140 571H420" />
        <path class="current c2" d="M140 584H420" />
        <path class="current c3" d="M140 595H420" />
      </g>
      <path class="section" d="M8 600V552Q28 536 56 548Q78 556 90 540V600Z" />
      <path class="section" d="M48 540h128v60H48z" />
      <g transform="translate(210 560)">
        <ellipse class="ripple" rx="40" ry="6" />
      </g>
      <path class="line" d="M80 540L108 418L140 540M92 488H124M108 418V540" />
      <!-- Mirrored: the long arm and the net reach toward the other machines,
           the counterweights hang on the bank. -->
      <g transform="translate(108 418)">
        <g class="vala-boom">
          <path class="line" d="M0 0L140 -60M0 0L-28 16M0 -74V0M0 -74L140 -60M0 -74L-28 16M82 -30L0 -74" />
          <path class="rope" d="M-28 16V42" />
          <circle class="stone" cx="-20" cy="48" r="8" />
          <circle class="stone" cx="-36" cy="48" r="8" />
          <circle class="stone" cx="-28" cy="58" r="8" />
          <path class="rope" d="M-12 10V30" />
          <circle class="stone" cx="-12" cy="36" r="6" />
          <g transform="translate(82 -36)">
            <path class="rope" d="M0 0V12" />
            <path class="line" d="M-5 12h10l-1 12h-8zM-6 24h12" />
            <path class="flame" d="M0 15q3 3 0 6q-3-3 0-6z" />
          </g>
          <g transform="translate(140 -60)">
            <g class="vala-net">
              <path class="net" d="M-52 52Q0 128 52 52Z" />
              <path class="line" d="M0 0Q-34 14 -52 52M0 0Q34 14 52 52" />
              <path class="rope" d="M0 0Q-10 28 -14 78M0 0Q10 28 14 78" />
              <g class="catch">
                <path class="fish" d="M-14 84q7-6 14 0q-7 6-14 0zM0 84l5-3v6z" />
                <path class="fish f2" d="M4 94q7-6 14 0q-7 6-14 0zM18 94l5-3v6z" />
              </g>
            </g>
          </g>
          <circle r="6" class="pivot" />
        </g>
      </g>
    </g>

    <!-- ── 03 Drone ───────────────────────────────────────────────────── -->
    <g
      class="machine"
      :transform="pose('drone')"
      :class="{ 'is-running': running.drone, 'is-crash': crashing, 'is-hover': hover === 'drone' }"
      role="button"
      tabindex="0"
      aria-label="Fly the drone"
      :style="{ '--span': flight.span, '--lift': flight.lift, '--hit-x': flight.hitX, '--hit-y': flight.hitY, '--land-x': flight.landX, '--land-y': flight.landY }"
      @click="run('drone')"
      @keydown="onKey($event, 'drone')"
      @pointerenter="hover = 'drone'"
      @pointerleave="hover = null"
    >
      <rect class="hit" x="404" y="26" width="132" height="76" />
      <g transform="translate(470 68)">
        <g class="drone-fly">
          <g class="drone-bob">
            <path class="line" d="M-40 -6H40M-40 -6V-12M40 -6V-12" />
            <rect class="link" x="-22" y="-8" width="44" height="14" rx="3" />
            <circle class="led" cx="14" cy="-1" r="2.5" />
            <path class="line" d="M-8 6v6h16v-6" />
            <g transform="translate(-40 -13)"><ellipse class="rotor" rx="20" ry="3" /></g>
            <g transform="translate(40 -13)"><ellipse class="rotor" rx="20" ry="3" /></g>
          </g>
        </g>
      </g>
    </g>

    <!-- ── 11 Coconut palm: tap and a nut drops ─────────────────────────── -->
    <g
      class="machine palm"
      :transform="pose('palm')"
      :class="{ 'is-running': running.palm, 'is-struck': struck, 'is-hover': hover === 'palm' }"
      role="button"
      tabindex="0"
      aria-label="Shake the coconut palm"
      @click="run('palm')"
      @keydown="onKey($event, 'palm')"
      @pointerenter="hover = 'palm'"
      @pointerleave="hover = null"
    >
      <rect class="hit" x="508" y="150" width="172" height="186" />
      <rect class="hit hit-quiet" x="595" y="336" width="10" height="264" />
      <path :d="palmMid.trunk" class="trunk" />
      <path :d="palmMid.rings" class="ring-mark" />
      <g :transform="`translate(${palmMid.crown[0]} ${palmMid.crown[1]})`">
        <g class="palm-crown">
          <path :d="palmMid.leaf" class="leaflet" />
          <path :d="palmMid.rib" class="rib" />
          <circle cx="-8" cy="11" r="7" class="nut" />
          <circle cx="0" cy="20" r="7" class="nut" />
        </g>
        <g transform="translate(8 16)">
          <g
            class="nut-drop"
            :style="{
              '--fall': `${(NUT_FALL * zoom('palm')).toFixed(1)}px`,
              '--hop-a': `${(4 * zoom('palm')).toFixed(1)}px`,
              '--hop-b': `${(10 * zoom('palm')).toFixed(1)}px`,
              '--hop-c': `${(14 * zoom('palm')).toFixed(1)}px`,
              '--bounce': `${(16 * zoom('palm')).toFixed(1)}px`,
            }"
          >
            <circle r="7" class="nut" />
            <path class="nut-eye" d="M-2 -2h0M2 -2h0M0 2h0" />
          </g>
        </g>
      </g>
    </g>

    <!-- ── 07 Treadle sewing machine ───────────────────────────────────── -->
    <g
      class="machine"
      :transform="pose('sewing')"
      :class="{ 'is-running': running.sewing, 'is-hover': hover === 'sewing' }"
      role="button"
      tabindex="0"
      aria-label="Run the sewing machine"
      @click="run('sewing')"
      @keydown="onKey($event, 'sewing')"
      @pointerenter="hover = 'sewing'"
      @pointerleave="hover = null"
    >
      <rect class="hit" x="380" y="352" width="214" height="248" />
      <!-- Cast-iron treadle stand -->
      <path class="line" d="M402 468L390 600M402 468L420 600M520 468L508 600M520 468L538 600M396 566H528" />
      <path class="line" d="M424 594L540 584" />
      <path class="band" d="M537 400L532 525M567 400L588 525" />
      <g transform="translate(560 525)">
        <g class="spin treadle-wheel">
          <circle r="28" class="link" />
          <path :d="spokes(6, 5, 26)" class="line" />
          <circle r="5" class="pivot" />
        </g>
      </g>
      <rect class="link" x="385" y="458" width="192" height="10" />
      <!-- The machine -->
      <rect class="fabric" x="400" y="441" width="104" height="5" />
      <path class="stitch" d="M402 443.5H502" />
      <rect class="link" x="415" y="446" width="132" height="12" />
      <rect class="link" x="515" y="388" width="26" height="58" />
      <rect class="link" x="436" y="380" width="105" height="18" rx="9" />
      <rect class="link" x="428" y="378" width="30" height="52" rx="4" />
      <g transform="translate(443 430)">
        <g class="needle">
          <rect class="link" x="-3" y="-3" width="6" height="6" />
          <path class="line" d="M0 3V14" />
        </g>
      </g>
      <path class="line" d="M435 444h16" />
      <path class="thread" d="M490 367C470 352 455 358 450 382L443 432" />
      <rect class="spool" x="484" y="365" width="12" height="15" />
      <path class="line" d="M490 365V358" />
      <g transform="translate(552 400)">
        <g class="spin handwheel">
          <circle r="16" class="link" />
          <path :d="spokes(5, 4, 14)" class="line" />
        </g>
      </g>
    </g>

    <!-- ── 02 Charkha, spinning wool ──────────────────────────────────── -->
    <g
      class="machine"
      :transform="pose('charkha')"
      :class="{ 'is-running': running.charkha, 'is-hover': hover === 'charkha' }"
      role="button"
      tabindex="0"
      aria-label="Spin the charkha"
      @click="run('charkha')"
      @keydown="onKey($event, 'charkha')"
      @pointerenter="hover = 'charkha'"
      @pointerleave="hover = null"
    >
      <rect class="hit" x="604" y="340" width="176" height="260" />
      <path class="line" d="M628 556L618 600M700 556L705 600M762 552L772 600M622 544L642 392" />
      <path class="section" d="M615 544h160v12h-160z" />
      <path class="line" d="M655 544L668 452M685 544L672 452M738 544V470M764 544V470" />
      <path class="band" d="M670 386L764 461M670 514L764 475" />
      <g transform="translate(670 450)">
        <g class="spin charkha-wheel">
          <circle r="64" class="rim" />
          <circle r="58" class="line" />
          <path :d="spokes(10, 8, 58)" class="line" />
          <circle r="8" class="pivot" />
        </g>
      </g>
      <path class="line" d="M726 458H760M726 478H760M726 458V478" />
      <rect class="spool" x="732" y="462" width="24" height="12" />
      <circle r="7" cx="764" cy="468" class="link" />
      <path :d="woolTuft" class="wool" />
      <path class="yarn" d="M656 388Q700 420 726 468" />
      <g transform="translate(735 586)">
        <circle r="12" class="spool" />
        <path class="ball-line" d="M-8 -6Q0 0 -4 10M-2 -11Q8 -2 4 11M6 -8Q11 0 10 6" />
      </g>
    </g>

    <!-- ── 01 Robot arm: click to follow, click again or wait to park ──── -->
    <g
      class="machine"
      :transform="pose('robot')"
      :class="{ 'is-running': running.robot || tracking, 'is-hover': hover === 'robot' }"
      role="button"
      tabindex="0"
      :aria-pressed="tracking"
      :aria-label="tracking ? 'Park the robot arm' : 'Arm the robot arm to follow the pointer'"
      @click="onRobot($event)"
      @keydown="(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRobot() } }"
      @pointerenter="hover = 'robot'"
      @pointerleave="hover = null"
    >
      <rect class="hit" x="796" y="380" width="164" height="220" />
      <path class="section" d="M832 588h76v12h-76z" />
      <path class="link" d="M846 588L855 562H885L894 588Z" />
      <g :transform="`translate(${SHOULDER.x} ${SHOULDER.y}) rotate(${arm.shoulder.toFixed(2)})`">
        <path :d="upperArm" class="link" />
        <g :transform="`translate(${L1()} 0) rotate(${arm.elbow.toFixed(2)})`">
          <path :d="forearm" class="link" />
          <g :transform="`translate(${L2()} 0) rotate(${arm.wrist.toFixed(2)})`">
            <rect class="link" x="4" y="-12" width="14" height="24" />
            <g :class="{ 'is-grip': grip }" class="jaws">
              <path class="line jaw jaw-a" d="M18 -10H34V-4" />
              <path class="line jaw jaw-b" d="M18 10H34V4" />
            </g>
          </g>
          <circle r="4" class="pivot" />
        </g>
        <circle r="5" class="pivot" />
      </g>
      <circle :cx="SHOULDER.x" :cy="SHOULDER.y" r="6" class="pivot" />
    </g>

    <!-- ── Balloons, keyed to the parts list; the name shows on hover ──── -->
    <g
      v-for="b in balloons"
      :key="b.n"
      class="balloon"
      :class="{ 'is-on': hover === b.id || running[b.id] }"
      aria-hidden="true"
    >
      <path :d="b.leader" class="thin" />
      <circle :cx="b.tx" :cy="b.ty" r="3" class="tip" />
      <circle :cx="b.x" :cy="b.y" r="16" class="ring" />
      <text :x="b.x" :y="b.y + 4.5" text-anchor="middle">{{ b.n }}</text>
      <g class="tag" :transform="`translate(${b.x > sheetWidth - 160 ? b.x - 22 : b.x + 22} ${b.y})`">
        <rect :x="b.x > sheetWidth - 160 ? -(b.name.length * 7.6 + 16) : 0" y="-12" :width="b.name.length * 7.6 + 16" height="24" class="tag-bg" />
        <text :x="b.x > sheetWidth - 160 ? -8 : 8" y="4.5" :text-anchor="b.x > sheetWidth - 160 ? 'end' : 'start'">{{ b.name.toUpperCase() }}</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.schematic {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  font-family: var(--font-readout);
  touch-action: manipulation;
}

.line, .thin, .gear, .link, .pivot, .ring, .section, .band, .rim, .rope,
.thread, .yarn, .wool, .rotor, .wave, .ripple, .stitch, .fabric, .ball-line, .fish {
  fill: none;
  stroke: var(--color-ink);
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

/* Parts */
.line, .link, .section, .pivot, .rim { stroke-width: 2; }
.link, .pivot, .rim { fill: #FFFFFF; }
.rim { fill: none; }
.section { fill: url(#sch-hatch); }
.hatch { stroke: var(--color-ink); stroke-width: 1; }
.stone { fill: #FFFFFF; stroke: var(--color-ink); stroke-width: 2; }
.rope, .band { stroke-width: 1; }
.wool { fill: #FFFFFF; stroke-width: 1.5; }
.trunk { fill: #FFFFFF; stroke: var(--color-ink); stroke-width: 2; stroke-linejoin: round; }
.ring-mark, .leaflet { fill: none; stroke: var(--color-ink); stroke-width: 1; stroke-linecap: round; }
.rib { fill: none; stroke: var(--color-ink); stroke-width: 2; stroke-linecap: round; }
.nut { fill: #FFFFFF; stroke: var(--color-ink); stroke-width: 2; }
.nut-eye { stroke: var(--color-ink); stroke-width: 2.2; stroke-linecap: round; }
.flame { fill: var(--color-red); }
.hit-quiet { stroke: none !important; }

/* Annotation and water: cyan */
.thin, .ring { stroke-width: 1; stroke: var(--color-cyan); }
.ring { fill: #FFFFFF; }
.tip { fill: var(--color-cyan); }
.wave { stroke: var(--color-cyan); stroke-width: 1.5; }
.water-body { fill: rgba(0, 174, 239, 0.1); stroke: none; }
.current { fill: none; stroke: var(--color-cyan); stroke-width: 1; stroke-linecap: round; stroke-dasharray: 14 18; opacity: 0.7; }
.current.c2 { stroke-dasharray: 8 24; stroke-dashoffset: 11; }
.current.c3 { stroke-dasharray: 20 12; stroke-dashoffset: 5; opacity: 0.5; }
.ripple { stroke: var(--color-cyan); stroke-width: 1; opacity: 0; }
.net { fill: url(#sch-mesh); stroke: var(--color-cyan); stroke-width: 1.25; }
.mesh { stroke: var(--color-cyan); stroke-width: 0.8; }
.rotor { stroke: var(--color-cyan); stroke-width: 1.5; }
.fabric { stroke: var(--color-cyan); stroke-width: 1; fill: rgba(0, 174, 239, 0.12); }

/* Thread and wool: red */
.thread, .yarn { stroke: var(--color-red); stroke-width: 1.25; }
.stitch { stroke: var(--color-red); stroke-width: 1.5; stroke-dasharray: 4 3; stroke-linecap: butt; }
.spool { fill: var(--color-red); stroke: var(--color-ink); stroke-width: 1.5; }
.ball-line { stroke: #FFFFFF; stroke-width: 1; }
.led { fill: var(--color-red); }
.fish { fill: var(--color-red); stroke: var(--color-ink); stroke-width: 1; }

.balloon text { font-size: 13px; font-weight: 600; fill: var(--color-ink); }
.tag { opacity: 0; transition: opacity 140ms linear; }
.tag-bg { fill: var(--color-ink); }
.tag text { font-size: 12px; font-weight: 500; letter-spacing: 0.06em; fill: #FFFFFF; }
.balloon.is-on .tag { opacity: 1; }
.balloon.is-on .ring { fill: var(--color-cyan); }

/* The hit area is invisible until hovered or focused, then drawn as a
   dashed selection box: the drawing's own way of saying "this part". */
.machine { cursor: pointer; outline: none; }
.hit { fill: transparent; stroke: transparent; stroke-width: 1; stroke-dasharray: 5 4; vector-effect: non-scaling-stroke; }
.machine.is-hover .hit { stroke: var(--color-cyan); }
.machine:focus-visible .hit { stroke: var(--color-cyan); stroke-width: 2; }
.machine.is-running .hit { fill: rgba(0, 174, 239, 0.05); stroke: var(--color-cyan); }

/* ── Pivots and resting poses ─────────────────────────────────────────── */
.water-surface, .spin, .palm-crown, .nut-drop, .vala-boom, .vala-net, .needle, .drone-bob, .drone-fly, .ripple, .catch {
  transform-box: view-box;
  transform-origin: 0 0;
}
.vala-boom { transform: rotate(-8deg); }
.vala-net { transform: rotate(8deg); }
.catch { opacity: 0; }
.jaw { transition: transform 120ms var(--ease-out); }
.jaws.is-grip .jaw-a { transform: translateY(5px); }
.jaws.is-grip .jaw-b { transform: translateY(-5px); }

/* ── Idle motion: opted in by the stage ───────────────────────────────── */
/* The whole selector stays inside :global. A split `:global(.stage) .part`
   was compiling as just `.stage`, so the idle motion never reached the part. */
:global(.hero-stage.is-ready .water-surface) { animation: sch-wave 4s linear infinite; }
:global(.hero-stage.is-ready .current) { animation: sch-current 5s linear infinite; }
:global(.hero-stage.is-ready .current.c2) { animation-duration: 7s; }
:global(.hero-stage.is-ready .current.c3) { animation-duration: 9s; }
:global(.hero-stage.is-ready .vala-boom) { animation: vala-sway 6s ease-in-out infinite alternate; }
:global(.hero-stage.is-ready .vala-net) { animation: vala-sway-net 6s ease-in-out infinite alternate; }
:global(.hero-stage.is-ready .palm-crown) { animation: palm-sway 5s ease-in-out infinite alternate; }
:global(.hero-stage.is-ready .drone-bob) { animation: drone-bob 3s ease-in-out infinite alternate; }
:global(.hero-stage.is-ready .rotor) { animation: rotor 0.12s linear infinite alternate; }
:global(.hero-stage.is-ready .charkha-wheel) { animation: sch-spin 16s linear infinite; }
:global(.hero-stage.is-ready .handwheel) { animation: sch-spin 12s linear infinite; }

/* ── A run: the visitor's own action ──────────────────────────────────── */
.is-running .vala-boom { animation: vala-dip 4.8s ease-in-out both; }
.is-running .vala-net { animation: vala-dip-net 4.8s ease-in-out both; }
.is-running .catch { animation: vala-catch 4.8s linear both; }
.is-running .ripple { animation: vala-ripple 4.8s ease-out both; }
.is-running .palm-crown { animation: palm-shake 0.9s ease-out both; }
.is-struck .palm-crown { animation: palm-shake 0.9s 1.5s ease-out both; }
.is-running .nut-drop { animation: nut-fall 1.8s both; }
.is-running .drone-fly { animation: drone-loop 3s cubic-bezier(.45, 0, .55, 1) both; }
.is-running.is-crash .drone-fly { animation: drone-crash 4.6s cubic-bezier(.4, 0, .7, 1) both; }
.is-running .rotor { animation: rotor 0.06s linear infinite alternate; }
.is-running.is-crash .rotor { animation: rotor 0.05s linear 28 alternate forwards; }
.is-running .needle { animation: needle 0.16s linear infinite alternate; }
.is-running .handwheel { animation: sch-spin 0.5s linear infinite; }
.is-running .treadle-wheel { animation: sch-spin 0.9s linear infinite; }
.is-running .stitch { animation: stitch 0.5s linear infinite; }
.is-running .band { stroke-dasharray: 6 5; animation: stitch 0.3s linear infinite; }
.is-running .charkha-wheel { animation: sch-spin 0.7s linear infinite; }
.is-running .yarn { stroke-dasharray: 5 4; animation: stitch 0.4s linear infinite reverse; }

:global(.hero-stage.is-offscreen .schematic *) { animation-play-state: paused !important; }

@keyframes sch-spin { to { transform: rotate(360deg); } }
@keyframes sch-wave { to { transform: translateX(var(--wave, 40px)); } }
@keyframes sch-current { to { stroke-dashoffset: -32; } }
@keyframes vala-sway { from { transform: rotate(-7deg); } to { transform: rotate(-9.5deg); } }
@keyframes vala-sway-net { from { transform: rotate(7deg); } to { transform: rotate(9.5deg); } }
@keyframes vala-dip {
  0% { transform: rotate(-8deg); }
  35%, 52% { transform: rotate(46deg); }
  100% { transform: rotate(-8deg); }
}
@keyframes vala-dip-net {
  0% { transform: rotate(8deg); }
  35%, 52% { transform: rotate(-46deg); }
  100% { transform: rotate(8deg); }
}
@keyframes vala-catch { 0%, 50% { opacity: 0; } 58%, 92% { opacity: 1; } 100% { opacity: 0; } }
@keyframes vala-ripple {
  0%, 30% { opacity: 0; transform: scale(0.4); }
  36% { opacity: 1; transform: scale(0.8); }
  60% { opacity: 0; transform: scale(1.5); }
  100% { opacity: 0; }
}
@keyframes palm-sway { from { transform: rotate(-1.5deg); } to { transform: rotate(2deg); } }
@keyframes palm-shake {
  0% { transform: rotate(0); }
  20% { transform: rotate(-6deg); }
  45% { transform: rotate(4deg); }
  70% { transform: rotate(-2deg); }
  100% { transform: rotate(0); }
}
@keyframes nut-fall {
  0%, 12% { transform: translate(0, 0); animation-timing-function: cubic-bezier(.5, 0, 1, 1); }
  44% { transform: translate(var(--hop-a), var(--fall)); animation-timing-function: cubic-bezier(0, 0, .4, 1); }
  52% { transform: translate(var(--hop-b), calc(var(--fall) - var(--bounce))); animation-timing-function: cubic-bezier(.5, 0, 1, 1); }
  60%, 86% { transform: translate(var(--hop-c), var(--fall)); opacity: 1; }
  94% { transform: translate(var(--hop-c), var(--fall)); opacity: 0; }
  95% { transform: translate(0, 0); opacity: 0; }
  100% { transform: translate(0, 0); opacity: 1; }
}
@keyframes drone-bob { from { transform: translateY(-3px); } to { transform: translateY(3px); } }
@keyframes rotor { from { transform: scaleX(1); } to { transform: scaleX(0.35); } }
@keyframes drone-loop {
  0% { transform: translate(0, 0) rotate(0); }
  25% { transform: translate(var(--span, 140px), var(--lift, -28px)) rotate(6deg); }
  50% { transform: translate(0, calc(var(--lift, -28px) * 0.4)) rotate(0); }
  75% { transform: translate(calc(var(--span, 140px) * -1), var(--lift, -28px)) rotate(-6deg); }
  100% { transform: translate(0, 0) rotate(0); }
}
@keyframes drone-crash {
  0% { transform: translate(0, 0) rotate(0); }
  22% { transform: translate(calc(var(--hit-x) * 0.62), calc(var(--hit-y) * 0.35)) rotate(-10deg); }
  34% { transform: translate(var(--hit-x), var(--hit-y)) rotate(34deg); }
  46% { transform: translate(calc(var(--hit-x) * 0.82 + var(--land-x) * 0.18), calc(var(--hit-y) + 70px)) rotate(110deg); }
  68% { transform: translate(var(--land-x), var(--land-y)) rotate(188deg); }
  78% { transform: translate(var(--land-x), calc(var(--land-y) - 16px)) rotate(176deg); }
  88%, 100% { transform: translate(var(--land-x), var(--land-y)) rotate(188deg); }
}
@keyframes needle { from { transform: translateY(0); } to { transform: translateY(6px); } }
@keyframes stitch { to { stroke-dashoffset: -14; } }

@media (prefers-reduced-motion: reduce) {
  .schematic * { animation: none !important; transition: none !important; }
}
</style>
