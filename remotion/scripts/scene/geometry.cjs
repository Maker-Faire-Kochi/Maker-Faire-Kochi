/**
 * Scene geometry and small SVG helpers.
 *
 * The scene is authored in a 1920x1080 user-unit space. That is a coordinate
 * system, not a resolution -- the whole point of the vector rebuild is that
 * there is no native size. GROUND is the single shared baseline every figure
 * and machine stands on.
 */
const W = 1920, H = 1080, GROUND = 902;

const r1 = n => Math.round(n * 10) / 10;
const pt = (x, y) => `${r1(x)} ${r1(y)}`;

/** Points around a circle, angle in degrees measured from 12 o'clock. */
const on = (cx, cy, r, deg) => {
  const a = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

/**
 * A gear outline as a single closed path: alternating tooth crests and roots
 * around the pitch circle. Parametric because hand-plotting 24 teeth is both
 * error-prone and unreviewable in a diff.
 */
function gear(cx, cy, rOuter, teeth, depth = 0.16) {
  const rInner = rOuter * (1 - depth);
  const step = 360 / teeth;
  const crest = step * 0.34;   // tooth land, as a share of the pitch
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const p1 = on(cx, cy, rInner, a - crest);
    const p2 = on(cx, cy, rOuter, a - crest * 0.55);
    const p3 = on(cx, cy, rOuter, a + crest * 0.55);
    const p4 = on(cx, cy, rInner, a + crest);
    d += `${i === 0 ? 'M' : 'L'}${pt(...p1)}L${pt(...p2)}L${pt(...p3)}L${pt(...p4)}`;
    // Root arc through to the next tooth.
    const nxt = on(cx, cy, rInner, a + step - crest);
    d += `A${r1(rInner)} ${r1(rInner)} 0 0 1 ${pt(...nxt)}`;
  }
  return d + 'Z';
}

/** Evenly spaced spokes from a hub radius out to a rim radius. */
function spokes(cx, cy, rHub, rRim, count, offset = 0) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = offset + i * (360 / count);
    d += `M${pt(...on(cx, cy, rHub, a))}L${pt(...on(cx, cy, rRim, a))}`;
  }
  return d;
}

/**
 * A hanging net as a catenary-bounded mesh.
 *
 * Generated rather than plotted: the cheena vala's net is the one element the
 * eye reads as "handmade", and a mesh with regular spacing but a sagging
 * boundary is what sells it. `sag` is how far the lower edge drops below the
 * straight line between its corners.
 */
function net(x0, y0, x1, y1, sag, cols = 11, rows = 7) {
  const lerp = (a, b, t) => a + (b - a) * t;
  // Vertical drop at parameter t, zero at both ends, max at the middle.
  const drop = t => sag * Math.sin(Math.PI * t);
  const P = (u, v) => {
    const x = lerp(x0, x1, u);
    const yTop = lerp(y0, y1, u);
    return [x, yTop + drop(u) * v];
  };
  let d = '';
  for (let i = 0; i <= cols; i++) {
    const u = i / cols;
    d += `M${pt(...P(u, 0))}`;
    for (let j = 1; j <= rows; j++) d += `L${pt(...P(u, j / rows))}`;
  }
  for (let j = 0; j <= rows; j++) {
    const v = j / rows;
    d += `M${pt(...P(0, v))}`;
    for (let i = 1; i <= cols; i++) d += `L${pt(...P(i / cols, v))}`;
  }
  return d;
}

/**
 * Wrap content so it rotates about (cx, cy) REGARDLESS of any ancestor
 * transform.
 *
 * This exists because the obvious approach is broken. Setting
 * `transform-box: view-box` with `transform-origin: <cx>px <cy>px` resolves
 * those lengths against the VIEWBOX origin, not the element's local user
 * space. That is fine for a part sitting directly in the scene, and silently
 * wrong for a part nested inside a translated/scaled group -- it then spins
 * about a point far from its own hub and visibly flies off across the frame.
 *
 * Translating the pivot to the local origin and rotating about 0 0 has no such
 * dependency, so it is correct in both cases. `.joint` in hero-scene.css only
 * needs `transform-origin: 0 0`.
 */
function spinAt(cx, cy, cls, inner, style = '') {
  return `<g transform="translate(${r1(cx)} ${r1(cy)})">` +
    `<g class="${cls} joint"${style ? ` style="${style}"` : ''}>` +
    `<g transform="translate(${r1(-cx)} ${r1(-cy)})">${inner}</g></g></g>`;
}

/**
 * Seeded PRNG (mulberry32).
 *
 * The crowd needs to look unplanned, but a render that changes every time is
 * impossible to review and would churn the committed output on every rebuild.
 * So the randomness is deterministic: same seed, same scene, forever.
 */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

module.exports = {W, H, GROUND, r1, pt, on, gear, spokes, net, rng, spinAt};
