/**
 * Guard: every animation period must divide the 48s master cycle.
 *
 * This is the one invariant that keeps the scene loop-exact, and it is very
 * easy to break by eye -- a rotor at 0.34s looks no different from one at
 * 0.32s, but 48/0.34 is not an integer and the loop silently stops closing.
 * That is exactly the bug this catches.
 *
 * Checks both the inline --dur values in the generated component and the
 * durations declared in the stylesheet.
 *
 *   node scripts/check-periods.cjs
 */
const fs = require('fs');
const path = require('path');

const CYCLE = 48;
const ROOT = path.join(__dirname, '..', '..');
const scene = fs.readFileSync(path.join(ROOT, 'app/components/HeroScene.server.vue'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'app/assets/css/hero-scene.css'), 'utf8');

const bad = [];
const seen = new Set();

function check(sec, where, alternate) {
  const period = alternate ? sec * 2 : sec;
  const n = CYCLE / period;
  const ok = Math.abs(n - Math.round(n)) < 1e-9;
  const key = `${where}|${sec}|${alternate}`;
  if (!seen.has(key)) {
    seen.add(key);
    if (!ok) bad.push({where, sec, period, n: n.toFixed(4)});
  }
  return ok;
}

// Inline --dur on generated elements (all linear/infinite spins).
for (const m of scene.matchAll(/--dur:\s*([\d.]+)s/g)) check(parseFloat(m[1]), `scene --dur:${m[1]}s`, false);
// Inline --hover / --bdur / --sdur.
for (const m of scene.matchAll(/--hover:\s*([\d.]+)s/g)) check(parseFloat(m[1]), `scene --hover:${m[1]}s`, true);
for (const m of scene.matchAll(/--bdur:\s*([\d.]+)s/g)) check(parseFloat(m[1]), `scene --bdur:${m[1]}s`, true);

// Stylesheet shorthand: `animation: <name> <dur>s ... [alternate]`
for (const m of css.matchAll(/animation:\s*([\w-]+)\s+(?:var\([^)]*?,\s*)?([\d.]+)s[^;]*;/g)) {
  check(parseFloat(m[2]), `css ${m[1]} ${m[2]}s`, /alternate/.test(m[0]));
}
for (const m of css.matchAll(/animation-duration:\s*([\d.]+)s/g)) check(parseFloat(m[1]), `css duration ${m[1]}s`, true);

console.log(`checked ${seen.size} declared periods against the ${CYCLE}s master cycle`);
if (bad.length) {
  console.error('\nFAIL — these do not divide the cycle:');
  for (const b of bad) console.error(`  ${b.where.padEnd(30)} effective ${b.period}s -> ${CYCLE}/${b.period} = ${b.n}`);
  process.exit(1);
}
console.log('PASS — every period divides the cycle, so the loop can close.');
