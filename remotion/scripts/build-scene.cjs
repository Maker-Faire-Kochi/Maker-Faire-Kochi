/**
 * Compose the figure library and the hand-authored machinery into
 * app/components/HeroScene.server.vue.
 *
 * GENERATED. Re-run after changing the cast, the placement or the machinery:
 *
 *   npm run scene        # extract -> measure -> build
 *
 * Two structural decisions worth understanding before editing:
 *
 * 1. FIGURES ARE INSTANCED. Each unique person is emitted once into <defs>
 *    and placed with <use>, and ONLY the poses actually placed are emitted --
 *    so the current 13-strong crowd costs five figures, not the cast's 19.
 *    Internal <use> references are universally supported; only external-file
 *    references are a portability problem.
 *
 * 2. IT IS A SERVER COMPONENT. The path data is hundreds of KB of markup. A
 *    normal .vue would ship it in the SSR HTML *and* again in the client chunk
 *    as a compiled render function.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const {W, H, GROUND, r1} = require('./scene/geometry.cjs');
const M = require('./scene/machinery.cjs');
const {gearTower} = require('./scene/gearTower.cjs');
const PR = require('./scene/props.cjs');
const B = require('./scene/booths.cjs');
const X = require('./scene/tech.cjs');
const A = require('./scene/art.cjs');
const {backFigure} = require('./scene/backs.cjs');
const INSTANCES = require('./scene/placement.cjs');
const {BACK_VIEWS} = INSTANCES;

const FIG = path.join(__dirname, '..', 'out', 'figures');
const manifest = JSON.parse(fs.readFileSync(path.join(FIG, 'manifest.json'), 'utf8'));
const byId = Object.fromEntries(manifest.map(m => [m.id, m]));

// `<defs>` follows first encounter, so reshuffling the seeded crowd used to
// reorder hundreds of kilobytes of path data and hide the real cast change in
// the generated diff. Sorting keeps that diff proportionate to what changed.
const used = [...new Set(INSTANCES.map(i => i.use))].sort();

/** Each unique figure, once. */
const defs = used.map(id => {
  const body = fs.readFileSync(path.join(FIG, id + '.svg'), 'utf8');
  return `    <g id="fig-${id}">${body}</g>`;
}).join('\n');

/**
 * Stand one instance on the ground line.
 *
 * The measured bbox is the only reliable source of a figure's real extent:
 * every pose carries its own internal translate() and the stock viewBox crops
 * at the thighs. This maps that box to "feet on the ground, centred on x,
 * exactly h tall", optionally mirrored about its own centre line.
 *
 * The idle bob lives on the OUTER group, which is deliberately unscaled. Put
 * it on the inner (scaled) node and a 4px bob becomes 4 * 0.11 = 0.4 scene
 * units -- mathematically present, visually nothing.
 */
function place(inst, i) {
  if (inst.walk) return placeWalker(inst, i);
  const m = byId[inst.use];
  if (!m || !m.bbox) throw new Error(`No measured bbox for "${inst.use}" -- run scene:measure`);
  const {x, y, w, h} = m.bbox;
  const s = inst.h / h;
  const sx = inst.flip ? -s : s;
  const feet = inst.y || GROUND;
  const cx = x + w / 2;
  const fade = inst.fade != null && inst.fade < 1 ? `;opacity:${inst.fade}` : '';
  return `      <g class="peep" style="--bob:${(3.2 + (i % 5) * 0.9).toFixed(1)}px;--bdur:${[3, 4, 6, 8, 12][i % 5]}s;--bdelay:-${(i * 0.7).toFixed(1)}s${fade}">` +
    `<g class="peep-at" transform="translate(${r1(inst.x)} ${r1(feet)}) scale(${r1(sx * 1000) / 1000} ${r1(s * 1000) / 1000}) translate(${r1(-cx)} ${r1(-(y + h))})">` +
    `<use href="#fig-${inst.use}"/></g></g>`;
}

/**
 * A walking visitor.
 *
 * Three nested groups, each doing exactly one job, because they cannot be
 * merged: `.walker` carries the CSS traverse (and must own no transform
 * attribute, since a CSS transform would replace it), `.stride` carries the
 * step bounce in unscaled scene units, and `.peep-at` carries the placement
 * attribute. The horizontal position comes entirely from the animation, so the
 * placement translate is x=0.
 */
function placeWalker(inst, i) {
  const m = byId[inst.use];
  if (!m || !m.bbox) throw new Error(`No measured bbox for "${inst.use}"`);
  const {x, y, w, h} = m.bbox;
  const s = inst.h / h;
  const sx = inst.flip ? -s : s;
  const cx = x + w / 2;
  return `      <g class="walker"${inst.rev ? ' data-rev="1"' : ''} style="--wdelay:${inst.delay}s">` +
    `<g class="stride" style="--sdur:${inst.stride}s;--sdelay:-${(i * 0.17).toFixed(2)}s">` +
    `<g class="peep-at" transform="translate(0 ${r1(inst.y)}) scale(${r1(sx * 1000) / 1000} ${r1(s * 1000) / 1000}) translate(${r1(-cx)} ${r1(-(y + h))})">` +
    `<use href="#fig-${inst.use}"/></g></g></g>`;
}

const rows = {
  back:  INSTANCES.filter(i => i.row === 'back'),
  mid:   INSTANCES.filter(i => i.row === 'mid'),
  front: INSTANCES.filter(i => i.row === 'front'),
  walk:  INSTANCES.filter(i => i.row === 'walk'),
};
let n = 0;
const emit = list => list.map(inst => place(inst, n++)).join('\n');

/**
 * The hand-drawn back-view visitors, rendered.
 *
 * The DATA is BACK_VIEWS in scene/placement.cjs, not here -- it used to be
 * literals in this file with a second copy of the x positions in the spacing
 * guard, and two hard-coded lists drift. See the notes there for why they are
 * hand-drawn (react-peeps has no back view and both ways of faking one were
 * rendered and rejected) and why they sit at back/mid scale only.
 */
const renderBacks = row => BACK_VIEWS
  .filter(b => b.row === row)
  .map(b => backFigure(b.x, b.y, b.h, b.opts))
  .join('\n');
const BACKS_MID = renderBacks('mid');
const BACKS_BACK = renderBacks('back');

const backRow = emit(rows.back) + '\n' + BACKS_BACK;
const midRow = emit(rows.mid) + '\n' + BACKS_MID;
const frontRow = emit(rows.front);
const walkRow = emit(rows.walk);

// Kept honest by hand. It described a cheena vala for a while after the rig was
// removed, and "thirty people" after the crowd had shrunk to twenty -- a screen
// reader then gets a scene that is not the one on the page. Re-read it whenever
// the cast or the machine line-up changes.
const DESC = 'A maker faire in progress, left to right: a weaving loom with a shuttle '
  + 'crossing it under the first canopy; a stand demonstrating a 3D printer; a shelf of finished '
  + 'pots on the next stand; a tall tower of meshing gears with someone up a ladder beside it; '
  + 'an easel holding a painting in progress; a six-axis robot arm; a wind turbine at the right '
  + 'edge; and one drone overhead. Thirteen makers and visitors are gathered at the stands, one '
  + 'with their back to us and one using a wheelchair.';

const scene = `<!--
  GENERATED FILE — do not edit by hand.
  Source: remotion/scripts/build-scene.cjs (+ scene/, cast.cjs)
  Regenerate: cd remotion && npm run scene

  A server component on purpose: hundreds of KB of SVG path data that must be
  sent once in the SSR HTML and never again in the client bundle.

  It lives at the top of app/components/ rather than in hero/ because Nuxt's
  default pathPrefix would otherwise register it as <HeroHeroScene>, and server
  components must resolve through auto-import to get island treatment.

  It takes no props and holds no state: pause and hydration are signalled by
  classes on an ancestor (.hero-stage), because a server component cannot react
  to client-side state.
-->
<template>
  <svg
    class="hero-scene"
    viewBox="0 0 ${W} ${H}"
    preserveAspectRatio="xMidYMax slice"
    role="img"
    aria-labelledby="hero-scene-title hero-scene-desc"
  >
    <title id="hero-scene-title">Makers at work across a Kochi shore</title>
    <desc id="hero-scene-desc">${DESC}</desc>

    <!-- Every unique figure, once. The crowd instances these. -->
    <defs>
${defs}
    </defs>

    <!-- Camera. The reference film pushes in and eases back out; a symmetric
         scale means frame 0 and the loop point are the same image, so it
         closes seamlessly instead of needing a crossfade. -->
    <g class="camera is-animated">
      <g class="scene-body">
        <path class="ln ground" d="M0 ${GROUND}H${W}"/>

        <!-- Paint order IS the composition.

             The frame covers exactly SIX machine classes:

               textile      loom                additive     3D printer
               rotary       gear train          articulated  robot arm
               energy       turbine             aerial       drone

             The pot shelf and easel are non-machine craft exhibits. The
             previous twelve-class coverage was deliberately abandoned to cut
             payload and visual load; do not restore it as though it were a
             bug. Every exhibit stands on one ground line. -->

${X.turbine(1884, 902, 0.8)}

        <!-- canopies over the two exhibit stands -->
${B.booth(64, 244, {top: 486, accent: 'red'})}
${B.booth(340, 300, {top: 470, accent: 'cyan'})}
${B.booth(576, 300, {top: 482, accent: 'red'})}
${M.bunting(340, 176, 1400, 250)}

        <!-- The cheena vala remains deliberately removed because it needs a
             waterline. To restore it, place M.cheenaVala() here at x 16 and
             scale 0.6, and draw a waterline under the net. The left canopy is
             the CRAFT stand. -->

        <!-- CRAFT: the loom gets the left canopy to ITSELF. Two art exhibits
             were tried here and the booth is only 244 units wide — the second
             one and the crowd both landed on top of the loom. The crowd zone
             was moved right (placement.cjs 'craft') to clear it. -->
${A.loom(84, 902, 116, 200)}


        <!-- ROTARY: the gear train, uncanopied because it is far too tall -->
${gearTower(1240, 700)}
${M.ladder(1042, 470)}

        <!-- ARTICULATED: the robot arm. Placed in clear space and scaled up —
             it is one of the two hero machines, so it must not be buried
             behind a canopy where all that shows is a diagonal beam. -->
${M.robotArm(1772, 902, 0.9)}

        <!-- back row of visitors -->
${backRow}

        <!-- the stands the exhibits sit on -->
${M.bench(376, 776, 264)}
${M.bench(588, 784, 276)}

        <!-- mid row -->
${midRow}

        <!-- ===== the exhibits, in front of their demonstrators ===== -->

        <!-- FABRICATION stand: additive -->
${X.printer3d(392, 648)}

        <!-- CERAMICS: the pot shelf takes the bench the electronics stand
             vacated. potShelf(x, y) draws its slab at y and its legs down to
             y + 44, so resting on the 784 bench top means y = 740. -->
${A.potShelf(640, 740)}

        <!-- AERIAL: one drone overhead -->
${X.drone(940, 344, 1, '0.5s', '6s')}

        <!-- front row: visitors on our side of the stands -->
${frontRow}

        <!-- DRAWING: the easel stands in the robot arm's apron, the only band
             in the frame with real floor to spare (x 1600-1640 measured at 6.7%
             ink). Its FULL FOOTPRINT is what has to clear the arm, not just
             its centre: at x 1576 / h 280 it occupies x 1518-1634, its topmost
             AUTHORED point is the leg apex at y 630, and with the 4-unit stroke
             the rendered bound is about y 628. Against the linkage bottoms per
             column — 571 out to x1580, 585, 596, then 612 at x1620-1640 —
             the tightest margin is 16 units at the canvas's top right. It was first placed at x 1592, which pushed the canvas
             corner into the x1640-1660 band where the linkage drops to y 626
             and left only ~10 units. Move it right or make it taller and the
             gripper passes through the canvas at the swing extreme. -->
${A.easel(1576, 902, 280)}


        <!-- foreground -->
${PR.crates(344, 842)}
${PR.bucket(1042, 986)}
${PR.bucket(1418, 972, 0.8)}
${M.clutter()}
      </g>
    </g>
  </svg>
</template>
`;

const OUT = path.join(__dirname, '..', '..', 'app', 'components', 'HeroScene.server.vue');
fs.writeFileSync(OUT, scene);

const bytes = Buffer.byteLength(scene);
console.log(path.relative(process.cwd(), OUT));
console.log(`  raw     ${(bytes / 1024).toFixed(1)} KB`);
console.log(`  brotli  ${(zlib.brotliCompressSync(Buffer.from(scene)).length / 1024).toFixed(1)} KB`);
const nBacks = (BACKS_MID + BACKS_BACK).split('class="peep"').length - 1;
console.log(`  figures ${INSTANCES.length} instanced + ${nBacks} hand-drawn backs = ${INSTANCES.length + nBacks} people`);
console.log(`          ${used.length} unique in <defs>`);
console.log(`  rows    back ${rows.back.length} · mid ${rows.mid.length} · front ${rows.front.length} · walking ${rows.walk.length}`);
