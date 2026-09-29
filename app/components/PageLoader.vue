<script setup lang="ts">
/**
 * The opening plot: a sheet with a gear being drawn and a counter running to
 * 100, then the sheet lifts off the page. CSS only and about 1.3s end to end,
 * so it needs no JS to finish and cannot strand anyone behind it. It never
 * takes pointer events, and reduced motion skips it entirely.
 */
function gear(n: number, r: number): string {
  const tip = r + 7
  const root = r - 8
  const p = (Math.PI * 2) / n
  const pt = (rad: number, a: number) => `${(rad * Math.cos(a)).toFixed(1)} ${(rad * Math.sin(a)).toFixed(1)}`
  let d = ''
  for (let i = 0; i < n; i++) {
    const a = i * p
    d += `${i === 0 ? 'M' : 'L'}${pt(root, a - 0.28 * p)} L${pt(tip, a - 0.13 * p)} L${pt(tip, a + 0.13 * p)} L${pt(root, a + 0.28 * p)} `
  }
  return `${d}Z`
}
const outline = gear(16, 44)
</script>

<template>
  <div class="loader" aria-hidden="true">
    <div class="loader-sheet">
      <svg class="loader-gear" viewBox="-70 -70 140 140">
        <circle r="60" class="loader-pitch" />
        <path :d="outline" class="loader-draw" pathLength="100" />
        <circle r="12" class="loader-draw loader-hub" pathLength="100" />
        <path d="M-66 0H66M0 -66V66" class="loader-pitch" />
      </svg>
      <p class="loader-label">
        <span>Sht 00 / 04</span>
        <span class="loader-count" />
      </p>
      <span class="loader-bar" />
    </div>
  </div>
</template>

<style scoped>
@property --pct {
  syntax: '<integer>';
  inherits: false;
  initial-value: 0;
}

.loader {
  position: fixed;
  inset: 0;
  z-index: 300;
  pointer-events: none;
  animation: loader-lift 420ms cubic-bezier(0.7, 0, 0.3, 1) 950ms both;
}

.loader-sheet {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 1.25rem;
  background-color: #FFFFFF;
  background-image: var(--pn-grain);
  background-size: 24px 24px;
  border-bottom: 2px solid var(--pn-ink);
}

.loader-gear {
  width: 120px;
  height: 120px;
  animation: loader-turn 1.3s linear both;
}

.loader-pitch {
  fill: none;
  stroke: var(--color-cyan);
  stroke-width: 1;
  stroke-dasharray: 10 3 2 3;
}

.loader-draw {
  fill: none;
  stroke: var(--pn-ink);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-dasharray: 100;
  animation: loader-plot 800ms cubic-bezier(0.6, 0, 0.3, 1) 80ms both;
}

.loader-hub {
  stroke: var(--color-red);
  animation-delay: 420ms;
  animation-duration: 400ms;
}

.loader-label {
  display: flex;
  gap: 1.5rem;
  font-family: var(--font-readout);
  font-weight: 500;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--pn-ink);
}

.loader-count {
  width: 3ch;
  text-align: right;
  font-variant-numeric: tabular-nums;
  animation: loader-count 880ms steps(20) both;
  counter-reset: pct var(--pct);
}

.loader-count::after {
  content: counter(pct);
}

.loader-bar {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 4px;
  width: 100%;
  background: var(--color-cyan);
  transform-origin: 0 50%;
  animation: loader-bar 900ms cubic-bezier(0.6, 0, 0.3, 1) both;
}

@keyframes loader-plot { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
@keyframes loader-turn { from { transform: rotate(-40deg); } to { transform: rotate(0); } }
@keyframes loader-count { from { --pct: 0; } to { --pct: 100; } }
@keyframes loader-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes loader-lift { to { transform: translateY(-100%); visibility: hidden; } }

@media (prefers-reduced-motion: reduce) {
  .loader {
    display: none;
  }
}
</style>
