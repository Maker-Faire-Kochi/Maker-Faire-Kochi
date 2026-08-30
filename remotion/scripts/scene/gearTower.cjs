/**
 * The gear tower — one dense mechanism, not a few gears sitting near each other.
 *
 * This is the centrepiece and the thing the reference film gets right that a
 * naive version gets wrong: it reads as a MACHINE because many wheels of
 * different sizes visibly mesh, belts tie distant wheels together, and crank
 * arms link the whole thing to a frame.
 *
 * Two hard constraints, both load-bearing:
 *
 * 1. MESHING IS GEOMETRIC. Two gears mesh only if the distance between their
 *    centres equals the sum of their pitch radii. Radius is derived from tooth
 *    count and a shared module (tooth pitch), so gears that mesh share it.
 *
 * 2. SPEED FOLLOWS TEETH. A meshed pair's periods are proportional to their
 *    tooth counts, and directions alternate. Every period must also divide the
 *    48s master cycle, which restricts tooth counts to {12,16,24,32,48,96} at
 *    MODULE 0.5s per tooth -> 6s, 8s, 12s, 16s, 24s, 48s.
 */
const {pt, on, gear, spokes, r1, spinAt} = require('./geometry.cjs');

const S = 'class="ln"';
const T = 'class="ln thin"';
const F = 'class="fill-cyan"';
const D = 'class="fill-deep"';
const P = 'class="fill-paper"';

/**
 * Scene units per tooth. Pitch radius = teeth * MODULE_R.
 *
 * Shrink the tower here rather than with a wrapper transform: the plinth,
 * A-frame feet and cross-members use ABSOLUTE y coordinates (806, 812, 822,
 * 902), while only the gear train is positioned by wantCx/wantBase. A group
 * scale() lifts the plinth off the ground and scene:grounded reports the tower
 * floating. Periods are teeth * SEC_PER_TOOTH and so are unaffected by
 * MODULE_R, and centre distance stays exactly rParent + rSelf.
 */
const MODULE_R = 2.1;
/** Seconds per tooth. Period = teeth * SEC_PER_TOOTH; all divide 48s. */
const SEC_PER_TOOTH = 0.5;

const radiusFor = teeth => teeth * MODULE_R;

/**
 * A fabricated structural member: a narrow filled bar between two points with
 * lightening holes punched along it. Drawn rather than stroked so it has real
 * width, which is what makes the frame look built instead of sketched.
 */
function strut(x1, y1, x2, y2, w = 21, holes = 4) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * (w / 2), ny = (dx / len) * (w / 2);
  const body = `M${pt(x1 + nx, y1 + ny)}L${pt(x2 + nx, y2 + ny)}L${pt(x2 - nx, y2 - ny)}L${pt(x1 - nx, y1 - ny)}Z`;
  let punched = '';
  for (let i = 1; i <= holes; i++) {
    const t = i / (holes + 1);
    punched += `<circle class="fill-paper" cx="${r1(x1 + dx * t)}" cy="${r1(y1 + dy * t)}" r="${r1(w * 0.26)}"/>`;
  }
  return `<g class="strut"><path ${F} d="${body}"/><path ${T} d="${body}"/>${punched}</g>`;
}

/**
 * The train, authored as a chain. Each entry after the first is positioned by
 * angle from its parent at exactly (rParent + rSelf), which is what makes the
 * teeth actually engage instead of merely overlapping.
 */
function buildTrain(originX, originY) {
  const spec = [
    {id: 'g0', teeth: 48, from: null, deg: 0,    spoked: true},
    {id: 'g1', teeth: 32, from: 'g0', deg: 118,  spoked: true},
    {id: 'g2', teeth: 24, from: 'g1', deg: 196,  spoked: false},
    {id: 'g3', teeth: 16, from: 'g2', deg: 268,  spoked: false},
    {id: 'g4', teeth: 12, from: 'g3', deg: 330,  spoked: false},
    {id: 'g5', teeth: 32, from: 'g0', deg: 302,  spoked: true},
    {id: 'g6', teeth: 16, from: 'g5', deg: 34,   spoked: false},
  ];

  const nodes = {};
  let dir = 1;
  for (const g of spec) {
    const r = radiusFor(g.teeth);
    let x, y, d;
    if (!g.from) {
      x = originX; y = originY; d = 1;
    } else {
      const p = nodes[g.from];
      [x, y] = on(p.x, p.y, p.r + r, g.deg);
      d = -p.dir;                     // meshed gears counter-rotate
    }
    nodes[g.id] = {...g, x, y, r, dir: d, period: g.teeth * SEC_PER_TOOTH};
  }
  return nodes;
}

/** The train's bounding box, so the tower can be positioned by its extent
 *  rather than by its arbitrary first-gear origin. */
function trainBounds(nodes) {
  const v = Object.values(nodes);
  return {
    x0: Math.min(...v.map(g => g.x - g.r)),
    x1: Math.max(...v.map(g => g.x + g.r)),
    y0: Math.min(...v.map(g => g.y - g.r)),
    y1: Math.max(...v.map(g => g.y + g.r)),
  };
}

/**
 * @param wantCx  where the mechanism's centre should land horizontally
 * @param wantBase  where its lowest gear should sit vertically
 */
function gearTower(wantCx = 1300, wantBase = 690) {
  const originX = 0, originY = 0;
  const n = buildTrain(originX, originY);
  const b = trainBounds(n);
  const dx = wantCx - (b.x0 + b.x1) / 2;
  const dy = wantBase - b.y1;
  for (const g of Object.values(n)) { g.x += dx; g.y += dy; }
  const list = Object.values(n);

  const drawGear = g => {
    const rHub = Math.max(11, g.r * 0.17);
    const inner = g.r * 0.52;
    const body = `<path ${F} d="${gear(g.x, g.y, g.r, g.teeth)}"/>` +
      `<circle ${P} cx="${r1(g.x)}" cy="${r1(g.y)}" r="${r1(inner)}"/>` +
      (g.spoked
        ? `<path ${S} d="${spokes(g.x, g.y, rHub, inner, 6)}"/>`
        : `<path ${T} d="${spokes(g.x, g.y, rHub, inner, 4)}"/>`) +
      `<circle ${D} cx="${r1(g.x)}" cy="${r1(g.y)}" r="${r1(rHub)}"/>`;
    return spinAt(g.x, g.y, `cog`, body, `--dur:${g.period}s`) .replace('class="cog joint"', `class="cog joint" data-dir="${g.dir}"`);
  };

  // Belts: straight runs between distant wheels, which is what visually ties
  // the mechanism together rather than leaving it as a pile of discs.
  const belt = (a, b, off) => {
    const A = n[a], B = n[b];
    const ang = Math.atan2(B.y - A.y, B.x - A.x) * 180 / Math.PI + 90;
    const p1 = on(A.x, A.y, A.r * off, ang);
    const p2 = on(B.x, B.y, B.r * off, ang);
    const p3 = on(B.x, B.y, B.r * off, ang + 180);
    const p4 = on(A.x, A.y, A.r * off, ang + 180);
    return `<path ${T} d="M${pt(...p1)}L${pt(...p2)}M${pt(...p3)}L${pt(...p4)}"/>`;
  };

  const bb = trainBounds(n);
  const cx = (bb.x0 + bb.x1) / 2;
  // Apex only just above the train, and feet set wide. A tall narrow triangle
  // behind a dense gear cluster reads as spindly scaffolding rather than as
  // the machine's frame.
  const apex = [cx, Math.max(140, bb.y0 - 26)];
  const footL = [cx - 238, 806];
  const footR = [cx + 238, 806];

  return `
<g class="tower">
  <!-- plinth -->
  <rect ${D} x="${r1(cx - 204)}" y="822" width="408" height="80" rx="10"/>
  <rect ${F} x="${r1(cx - 186)}" y="812" width="372" height="20" rx="8"/>
  <rect ${P} x="${r1(cx - 160)}" y="846" width="96" height="34" rx="6"/>
  <path ${T} d="M${pt(cx + 44, 834)}L${pt(cx + 44, 878)}M${pt(cx + 88, 834)}L${pt(cx + 88, 878)}"/>

  <!-- A-frame: two SLIM struts with lightening holes, not one filled wedge.
       A solid triangle behind the train reads as a tent or an arrow; the
       reference frame is visibly fabricated — narrow cyan members with holes
       drilled through them, which is also what lets the gears stay legible
       against it. -->
  ${strut(footL[0], 806, apex[0] - 12, apex[1])}
  ${strut(footR[0], 806, apex[0] + 12, apex[1])}
  <path ${S} d="M${pt(cx - 152, 640)}L${pt(cx + 152, 640)}"/>
  <path ${T} d="M${pt(cx - 196, 744)}L${pt(cx + 196, 744)}"/>
  <rect ${F} x="${r1(apex[0] - 30)}" y="${r1(apex[1] - 14)}" width="60" height="30" rx="10"/>

  <!-- head pulley and the long belt down to the main wheel -->
  <circle ${D} cx="${apex[0]}" cy="${apex[1]}" r="26"/>
  <circle ${P} cx="${apex[0]}" cy="${apex[1]}" r="9"/>
  ${belt('g0', 'g5', 1.0)}
  ${belt('g1', 'g0', 1.0)}
  <path ${T} d="M${pt(apex[0] - 24, apex[1])}L${pt(n.g1.x - 10, n.g1.y - n.g1.r)}
               M${pt(apex[0] + 24, apex[1])}L${pt(n.g5.x + 8, n.g5.y - n.g5.r)}"/>

  <!-- crank arms: the linkage that makes it read as driven, not decorative -->
  ${spinAt(n.g0.x, n.g0.y, 'crank',
      `<rect ${F} x="${r1(n.g0.x - 14)}" y="${r1(n.g0.y - n.g0.r - 34)}" width="28" height="${r1(n.g0.r + 40)}" rx="12"/>` +
      `<circle ${D} cx="${r1(n.g0.x)}" cy="${r1(n.g0.y - n.g0.r - 20)}" r="13"/>`,
      `--dur:${n.g0.period}s`)}

  ${list.map(drawGear).join('')}

  <!-- governor: a small counter-rotating flywheel off the fast end -->
  ${spinAt(n.g4.x + 96, n.g4.y - 54, 'cog',
      `<circle ${F} cx="${r1(n.g4.x + 96)}" cy="${r1(n.g4.y - 54)}" r="34"/>` +
      `<circle ${P} cx="${r1(n.g4.x + 96)}" cy="${r1(n.g4.y - 54)}" r="24"/>` +
      `<path ${T} d="${spokes(n.g4.x + 96, n.g4.y - 54, 6, 24, 3)}"/>`,
      '--dur:6s').replace('class="cog joint"', 'class="cog joint" data-dir="-1"')}
  <path ${T} d="M${pt(n.g4.x, n.g4.y)}L${pt(n.g4.x + 96, n.g4.y - 54)}"/>
</g>`;
}

/** Periods for the stylesheet, so CSS and geometry cannot drift apart. */
function gearTimings() {
  const n = buildTrain(0, 0);
  return Object.values(n).map(g => ({id: g.id, teeth: g.teeth, period: g.period, dir: g.dir}));
}

module.exports = {gearTower, gearTimings, trainBounds, buildTrain, MODULE_R, SEC_PER_TOOTH};
