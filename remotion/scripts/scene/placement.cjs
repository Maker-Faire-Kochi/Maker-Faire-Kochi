/**
 * The crowd, generated.
 *
 * Hand-listing every figure produced an evenly spaced line-up that read as a
 * diagram rather than a faire. This places them procedurally instead: zones
 * declare how many people stand where, and a SEEDED generator picks the pose,
 * the height, the mirroring and the jitter.
 *
 * Seeded, so it is reproducible -- same output every build, reviewable in a
 * diff. Change SEED to reshuffle the whole crowd.
 *
 * Three things break the grid, and all three matter:
 *   - depth rows: back figures are smaller and drawn first, so the crowd
 *     overlaps instead of lining up
 *   - mirroring: flipping half the instances doubles the apparent pose variety
 *     for free
 *   - height jitter: adults, teenagers and children at the same bench
 */
const {rng} = require('./geometry.cjs');
const LIBRARY = require('../cast.cjs');

const SEED = 20270126;   // the dates on the tin

/**
 * The pose POOL, cut from twelve to four.
 *
 * Each unique pose is ~20-35 KB of path data in <defs> and the crowd was 83%
 * of the generated component. Only st_easing and st_point are pool-only:
 * st_arms, st_pants and st_blazer are ALSO used by hand-placed figures (the
 * apron pair and the ladder figure), so dropping one of those would leave it
 * in <defs> and save nothing. Between the two pool-only poses, st_easing is the
 * hijab-wearing figure and is kept for representation; st_point was described
 * by gesture rather than by who it represents. Dropping st_point frees about
 * 24.9 KB of <defs>.
 *
 * cast.cjs deliberately keeps all its entries — it is the enumerated list of
 * verified react-peeps keys, and an entry nobody places emits zero bytes.
 */
const POOL = ['st_arms', 'st_pants', 'st_blazer', 'st_easing'];
const STANDING = POOL;

/**
 * Depth rows. `back` figures are drawn first and smaller; `front` last and
 * largest. Scale ranges overlap slightly so the rows read as a crowd rather
 * than three discrete bands.
 */
const ROWS = {
  // `feet` is the real depth cue. Varying only the HEIGHT put every figure on
  // the same ground line, so the crowd read as a row of differently sized
  // people rather than a crowd with depth. Standing further back means feet
  // land HIGHER on the canvas.
  // Heights are matched to the reference film's proportions: a standing adult
  // is roughly 22% of frame height there, with the machinery at ~60%. Drawing
  // people larger than that is what turns a faire into a crowded lineup and
  // buries the benches and tools behind bodies.
  back:  {h: [158, 186], feet: 842, order: 0, fade: 0.58},
  mid:   {h: [196, 232], feet: 872, order: 1, fade: 0.82},
  front: {h: [240, 280], feet: 902, order: 2, fade: 1},
};

/**
 * How close two figures in the same zone may stand, in scene units.
 *
 * Per-ROW slots do not work, and two rounds of magic constants proved it: rows
 * carry different counts, so their slot centres coincide at arbitrary zone
 * widths. That is what put two identical `st_point` figures 2 units apart, and
 * a phase expressed as a FRACTION of the zone then left the back and mid rows
 * of a 96-unit zone only 17 units apart -- close enough that their
 * heads merged into one two-headed shape.
 *
 * So a zone's figures share ONE comb of evenly spaced positions and the rows
 * are dealt onto it in seeded random order. Spacing becomes a property of the
 * zone rather than an accident of how its counts happen to divide.
 *
 * That is not self-enforcing, though: a zone narrow enough, or populated
 * enough, still drives `gap - 2 * wobble` to nothing. MIN_SEPARATION is the
 * assertion that keeps the claim honest -- widen the zone or drop a figure
 * rather than raising it, because below roughly 24 units two heads at
 * neighbouring depths merge into one two-headed shape.
 */
const MIN_SEPARATION = 24;

/**
 * How far a figure may wander from its comb position, as a fraction of the gap.
 *
 * This started at a hard cap of 9 units, which made the crowd EVENLY SPACED and
 * brought back the very thing the zones exist to avoid: measured gap spread
 * (coefficient of variation) fell from 1.25 to 0.36, i.e. a lineup. Large
 * wobble alone is no good either -- that is what let two figures land 2 units
 * apart. So the wobble is large AND a relaxation pass afterwards pushes any
 * pair closer than MIN_SEPARATION apart. Randomness and the guarantee are not
 * in conflict once the guarantee is enforced after the fact instead of by
 * shrinking the randomness.
 */
const WOBBLE = 0.45;

/**
 * Zones, with deliberate GAPS between them.
 *
 * Density is not the same thing as a wall. Thirty-two figures spread evenly
 * across the full width left no clear ground anywhere and buried the benches
 * and tools behind three layers of bodies. The reference frame is busy but
 * legible precisely because its clusters have air around them, so these zones
 * are narrower than the space they sit in and the counts are lower.
 *
 * Open Peeps' seated bodies (HandsBackWB, ClosedLegWB, WheelChair, Bike, ...)
 * carry a solid dark lap/leg mass and assume a chair that this scene never
 * provides. Under the 0.58 hero scrim they read as a person perched on a black
 * blob; three overlapping at x=430-560 became unreadable mush. Standing
 * figures only.
 */
const ZONES = [
  {name: 'craft',    x: [258, 352],   back: 1, mid: 0, front: 1},
  // NO front row at the two single-exhibit stands. Exhibits paint after the back
  // and mid rows but BEFORE the front row, so a front-row visitor stands in
  // front of whatever the stand is showing. That was survivable when a stand
  // carried two or three exhibits spread across its width -- one body could
  // only cover one of them. With ONE exhibit per stand it hides the whole
  // thing: the 3D printer was reduced to a flat panel behind a shoulder and the
  // pot shelf was about 60% covered. These demonstrators are `mid` instead,
  // which puts them BEHIND the bench where a demonstrator belongs and lets the
  // exhibit paint over them. Foreground scale still comes from craft, kinetic,
  // the apron pair and the wheelchair.
  {name: 'fab',      x: [412, 606],   back: 1, mid: 1, front: 0},
  // The electronics exhibits are gone; this is the pot shelf stand now.
  {name: 'ceramics', x: [640, 880],   back: 1, mid: 1, front: 0},
  {name: 'kinetic',  x: [1030, 1270], back: 1, mid: 0, front: 1},
  // Nothing past x=1270 is pooled. The robot arm's apron is the one place in
  // the frame where WHICH ROW stands where is load-bearing (see the hand-placed
  // pair at the foot of build()), and a comb that deals rows in random order
  // cannot express that. It is placed by hand instead.
];

function build() {
  const rand = rng(SEED);
  const between = (a, b) => a + rand() * (b - a);

  // Uniform random with replacement put identical `st_point` figures at
  // x=1465 and x=1467, one a ghost of the other. A shuffled deck uses every
  // pose before repeats, and the boundary guard keeps neighbours from becoming
  // twins when one deck ends and the next begins.
  let deck = [];
  let deckIndex = 0;
  let lastPose;
  const shuffleDeck = () => {
    deck = [...STANDING];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    if (lastPose && deck.length > 1 && deck[0] === lastPose) {
      [deck[0], deck[1]] = [deck[1], deck[0]];
    }
    deckIndex = 0;
  };
  const deal = () => {
    if (deckIndex === deck.length) shuffleDeck();
    lastPose = deck[deckIndex++];
    return lastPose;
  };

  /** One figure, standing on the ground line at x in the given depth row. */
  const figure = (rowName, x, zone) => {
    const row = ROWS[rowName];
    return {
      use: deal(),
      x: Math.round(x),
      // A little jitter on the ground line too, so the row itself is not
      // a ruler-straight line of feet.
      y: Math.round(row.feet + between(-7, 7)),
      h: Math.round(between(row.h[0], row.h[1])),
      row: rowName,
      order: row.order,
      fade: row.fade,
      flip: rand() < 0.42,
      zone,
    };
  };

  const out = [];
  for (const z of ZONES) {
    // The zone's whole population, then shuffled, so the comb is not walked
    // back-to-front left-to-right -- that reads as a diagonal, not a group.
    const slots = [];
    for (const rowName of ['back', 'mid', 'front']) {
      for (let i = 0; i < z[rowName]; i++) slots.push(rowName);
    }
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    const w = z.x[1] - z.x[0];
    const gap = w / slots.length;
    if ((slots.length - 1) * MIN_SEPARATION > w) {
      throw new Error(
        `zone "${z.name}" is ${w} units wide, too narrow for ${slots.length} figures at ` +
        `${MIN_SEPARATION} apart. Widen z.x or lower a row count.`);
    }
    // Wobble first...
    const pos = slots
      .map((_, k) => z.x[0] + gap * (k + 0.5) + between(-gap * WOBBLE, gap * WOBBLE))
      .sort((a, b) => a - b);
    // ...then relax. Forward pass opens every pair to MIN_SEPARATION; if that
    // runs past the zone, shift the run back and re-open from the right. Both
    // passes are needed -- a single forward pass can only push rightwards and
    // would walk the last figure out of its zone.
    for (let i = 1; i < pos.length; i++) {
      if (pos[i] - pos[i - 1] < MIN_SEPARATION) pos[i] = pos[i - 1] + MIN_SEPARATION;
    }
    const over = pos[pos.length - 1] - z.x[1];
    if (over > 0) {
      for (let i = 0; i < pos.length; i++) pos[i] -= over;
      for (let i = pos.length - 2; i >= 0; i--) {
        if (pos[i + 1] - pos[i] < MIN_SEPARATION) pos[i] = pos[i + 1] - MIN_SEPARATION;
      }
    }
    slots.forEach((rowName, k) => out.push(figure(rowName, pos[k], z.name)));
  }

  // No promenade. A Maker Faire is a SHOW AND TELL: people stand at a stand
  // and demonstrate. Visitors walking past read as a street scene and pulled
  // attention away from the exhibits, which are the point.

  // One figure up the ladder, placed explicitly — randomising this would put
  // someone standing on air.
  out.push({use: 'st_pants', x: 1096, h: 208, y: 660, row: 'mid', order: 1, fade: 1, flip: false, zone: 'tower', ladder: true});

  /**
   * The robot arm's apron: three visitors watching, placed BY HAND.
   *
   * This is the only part of the frame where which row stands where is
   * load-bearing, so it cannot be pooled. The arm is robotArm(1772, 902, 0.9);
   * sweeping shoulder -9..11, elbow -14..18 and wrist -16..16 to their
   * extremes, its leftmost point is x=1509 at y=543 and the lowest pixel of the
   * linkage per column is:
   *
   *     x <= 1580   y 571        x 1620-1640   y 612
   *     x 1580-1600 y 585        x 1640-1660   y 626
   *     x 1600-1620 y 596        x > 1660      unmeasured
   *
   * A figure is safe only where its HEAD TOP stays above that bottom across the
   * figure's whole width -- figures crossing the linkage chop it into
   * disconnected fragments, which is the failure this rule exists to prevent.
   * So the FRONT (tallest, head y 634) stands furthest left and the BACK
   * (shortest, head y 666) further right.
   *
   * There are TWO of them, not three. The second is st_blazer at x=1480, moved
   * left from 1494 because the easel's ledge starts at x=1518 (art.cjs draws it
   * at cx0-6 by cw+12 = x 1518-1634) and the easel paints after every crowd
   * row. st_blazer measures w/h 0.369, so at h=176 it is 65.0 wide and its
   * right edge is 1512.5, leaving ~5.5 units. Head-top clearance is
   * pose-independent because place() maps each bbox to exactly h tall, but
   * WIDTH is not, so swapping this pose requires re-checking the right edge.
   */
  // Only `h` and `x` are literals -- the clearance above is computed from them.
  // Everything else is READ FROM `ROWS`: hand-copying feet, fade and paint order
  // means a later edit to the rows silently stops applying here, which breaks
  // depth layering and, worse, the arm clearance that depends on `feet`.
  const atArm = (use, x, h, rowName, flip) => {
    const row = ROWS[rowName];
    if (h < row.h[0] || h > row.h[1]) {
      throw new Error(`apron figure h=${h} is outside ROWS.${rowName}.h [${row.h}]`);
    }
    return {use, x, h, y: row.feet, row: rowName, order: row.order, fade: row.fade, flip, zone: 'apron'};
  };
  out.push(atArm('st_arms',  1448, 268, 'front', false));
  out.push(atArm('st_blazer', 1480, 176, 'back',  true));

  // Removing the seated pool also removed the crowd's only mobility
  // representation. The wheelchair carries its own visible support, so one
  // survives on clear ground between the ceramics stand and gear tower,
  // the frame's other empty patch; it is hand-placed because overlaps stop it
  // reading clearly.
  out.push({use: 'si_wheel', x: 950, h: 250, y: 902, row: 'front', order: 2, fade: 1, flip: false, zone: 'promenade'});

  // Paint back-to-front so the crowd layers correctly.
  out.sort((a, b) => a.order - b.order || a.x - b.x);
  return out;
}

/**
 * Visitors seen FROM BEHIND, looking IN at the stands.
 *
 * The DATA lives here, with the rest of the placement, and build-scene.cjs
 * renders it through backFigure(). It used to be literals inside
 * build-scene.cjs with a copy of the x positions in the spacing guard -- two
 * hard-coded lists that drift, which is the same weakness that makes
 * `scene:grounded` silently skip an unlisted exhibit. One list now.
 *
 * Back views belong at BACK and MID row scale only: at front-row size the
 * hand-drawn linework reads as a different illustration system next to Open
 * Peeps, but once a figure is ~215 units tall under the depth fade, silhouette
 * is all that carries and they blend.
 *
 * The zones leave deliberate gaps (880-1030, and nothing pooled past x=1270),
 * and a back-view must NOT be placed to fill one. This single figure sits at
 * x=1310 in the open right third, where it adds depth without closing a gap.
 * Its x position is NOT stable across a change to POOL or a zone count -- see
 * the note on POOL above.
 * `npm run scene:spacing` is what keeps it honest.
 */
const BACK_VIEWS = [
  {x: 1310, y: 842, h: 176, row: 'back', opts: {hair: 'cornrows', top: 'paper', seq: 3, flip: true}},
];

const INSTANCES = build();
module.exports = INSTANCES;
module.exports.SEED = SEED;
module.exports.BACK_VIEWS = BACK_VIEWS;

if (require.main === module) {
  const byRow = INSTANCES.reduce((m, i) => (m[i.row] = (m[i.row] || 0) + 1, m), {});
  console.log(`${INSTANCES.length} instances from ${LIBRARY.length} unique figures`);
  console.log('rows:', byRow);
  const uniq = new Set(INSTANCES.map(i => i.use));
  console.log(`library used: ${uniq.size}/${LIBRARY.length}`);
  console.log(`mirrored: ${INSTANCES.filter(i => i.flip).length}`);
}
