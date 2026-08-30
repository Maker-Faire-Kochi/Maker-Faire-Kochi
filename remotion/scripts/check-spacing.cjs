/**
 * Guard: no two figures merge into one shape.
 *
 * The placement comb enforces MIN_SEPARATION between POOLED figures inside a
 * zone, but it knows nothing about the hand-placed ones -- the ladder figure,
 * the apron pair, the wheelchair, and the one hand-drawn back-view visitor
 * in BACK_VIEWS (scene/placement.cjs), which build-scene.cjs only renders.
 * Those are exactly the figures that break, because the pool size changes how
 * many values shuffleDeck() draws from the RNG: editing POOL or ANY zone count
 * reshuffles every zone, including ones whose counts were never touched.
 *
 * That is not hypothetical. Cutting the pool from twelve poses to five moved a
 * pooled figure to within 7 units of the fixed back-view visitor at x=340,
 * against the >=31 the source claims. Nothing else in the pipeline would have
 * caught it: scene:grounded only looks at machines, and a pose-identity check
 * is blind to two DIFFERENT poses standing on top of each other.
 *
 *   node scripts/check-spacing.cjs
 */
const INSTANCES = require('./scene/placement.cjs');

/**
 * The hand-drawn back-view visitors, read from the SAME array build-scene.cjs
 * renders. This started as a copied list of x literals; a guard whose data can
 * drift from the thing it guards is worse than no guard, because it reports
 * PASS about positions that are no longer on the page.
 */
const BACKS = INSTANCES.BACK_VIEWS.map(b => b.x);

/** A fixed figure needs this much clear air from any pooled neighbour. */
const BACK_CLEARANCE = 31;

/**
 * Two figures MERGE if they stand close in BOTH axes -- whatever poses they use.
 *
 * This deliberately does NOT test `a.use === b.use`. It used to, and that made
 * the guard blind to the very case its own docstring claims to cover: two
 * DIFFERENT poses standing on top of each other. Identical poses are the
 * loudest version of the failure (one figure reads as a ghost of the other),
 * but two different figures occupying the same spot is the same defect and is
 * harder to spot by eye, not easier.
 *
 * The y term is not padding. A bare x-distance test fails on a legitimate pair:
 * the ladder `st_pants` at x=1096, y=660 and a pooled `st_pants` at x=1141,
 * y~874 are 45 apart in x but 214 apart in y -- one is up a ladder, and nobody
 * reads them as overlapping. Exempting that pair by name would hide the reason;
 * the y term states it.
 */
const TWIN_DX = 48;
const TWIN_DY = 40;

const fail = [];

for (const x of BACKS) {
  let best = Infinity, who = null;
  for (const f of INSTANCES) {
    const d = Math.abs(f.x - x);
    if (d < best) { best = d; who = f; }
  }
  const ok = best >= BACK_CLEARANCE;
  console.log(`  back-view x=${String(x).padStart(4)}  nearest ${String(best).padStart(3)} -> ` +
    `${who.use} @${who.x}  ${ok ? 'ok' : 'TOO CLOSE'}`);
  if (!ok) {
    fail.push(`back-view visitor at x=${x} is only ${best} units from ${who.use} at x=${who.x} ` +
      `(need ${BACK_CLEARANCE}). Move it in BACK_VIEWS in scene/placement.cjs -- ` +
      `do NOT lower this bound.`);
  }
}

const sorted = [...BACKS].sort((a, b) => a - b);
for (let i = 1; i < sorted.length; i++) {
  const d = sorted[i] - sorted[i - 1];
  if (d < BACK_CLEARANCE) {
    fail.push(`back-view visitors at x=${sorted[i - 1]} and x=${sorted[i]} are ${d} units apart`);
  }
}

for (let i = 0; i < INSTANCES.length; i++) {
  for (let j = i + 1; j < INSTANCES.length; j++) {
    const a = INSTANCES[i], b = INSTANCES[j];
    if (Math.abs(a.x - b.x) < TWIN_DX &&
        Math.abs(a.y - b.y) < TWIN_DY) {
      const kind = a.use === b.use ? `twin ${a.use}` : `${a.use} over ${b.use}`;
      fail.push(`${kind}: x ${a.x}/${b.x} (dx ${Math.abs(a.x - b.x)}), ` +
        `y ${a.y}/${b.y} (dy ${Math.abs(a.y - b.y)})`);
    }
  }
}

console.log(`\nchecked ${BACKS.length} fixed back-view positions and ` +
  `${(INSTANCES.length * (INSTANCES.length - 1)) / 2} figure pairs`);

if (fail.length) {
  console.error('\nFAIL — figures merge:');
  for (const f of fail) console.error('  ' + f);
  process.exit(1);
}
console.log('PASS — no figure merges into another.');
