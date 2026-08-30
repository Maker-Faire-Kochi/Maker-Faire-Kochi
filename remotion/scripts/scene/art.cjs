/**
 * The ART and CRAFT exhibits.
 *
 * A Maker Faire is not only machines. The scene was composed as a pure TECH
 * faire and read as a trade show: every stall demonstrated a mechanism and
 * nothing demonstrated a MAKER. These are the craft half — textile (loom),
 * ceramic (pot shelf) and drawing (easel).
 *
 * They survived the cut to six machines precisely because they are the maker
 * half: the loom is one of the six, and the pot shelf and easel are the only
 * two exhibits kept that carry no animation at all. Cheap to draw, and without
 * them the frame is mechanisms and no makers again.
 *
 * Same conventions as the machinery: ink line-art at the peeps' stroke weight,
 * flat fills from the palette tokens only, and anything that moves carries
 * `is-animated` so the pause path can reach it.
 *
 * PERIODS: every duration here must divide the 48s master cycle or the loop
 * stops closing (`npm run scene:check` enforces it). The only moving part left
 * is the loom shuttle, and it ALTERNATES -- so its real period is twice its
 * declared 8s, i.e. 16s, and 48/16 = 3. scene:check doubles any `alternate`
 * duration before testing, but reason about the factor of two yourself too.
 */
const {GROUND, pt, r1} = require('./geometry.cjs');

const S = 'class="ln"';
const T = 'class="ln thin"';
const F = 'class="fill-cyan"';
const D = 'class="fill-deep"';
const P = 'class="fill-paper"';
const R = 'class="fill-red"';

/* ================================================================== *
 * Loom — TEXTILE. An upright frame loom with the warp under tension,
 * a woven band growing at the bottom and a shuttle crossing it.
 *
 * `base` is the surface it STANDS ON (a bench top), not the top of the
 * frame -- passing a frame Y here leaves it hanging in mid-air, which is
 * the same trap `bench(x, y, w)` documents about its own `y`.
 * ================================================================== */
function loom(x, base, w = 148, h = 196) {
  const top = base - h;
  const webTop = top + 22, webBot = base - 58;
  const warpN = 10;
  let warp = '';
  for (let i = 1; i < warpN; i++) {
    const wx = x + (w / warpN) * i;
    warp += `M${pt(wx, webTop + 4)}L${pt(wx, webBot)}`;
  }
  return `
<g class="ex-loom">
  <!-- Uprights in PAPER with an ink outline, not cyan: the first draft drew the
       whole loom in cyan on a cyan-heavy stand and the machine simply was not
       there. Contrast is doing the work at this size, not detail. -->
  <rect ${P} x="${r1(x - 12)}" y="${r1(top)}" width="24" height="${r1(h)}" rx="7"/>
  <rect ${S} x="${r1(x - 12)}" y="${r1(top)}" width="24" height="${r1(h)}" rx="7" fill="none"/>
  <rect ${P} x="${r1(x + w - 12)}" y="${r1(top)}" width="24" height="${r1(h)}" rx="7"/>
  <rect ${S} x="${r1(x + w - 12)}" y="${r1(top)}" width="24" height="${r1(h)}" rx="7" fill="none"/>
  <!-- a paper web BEHIND the warp, so the threads have something to read against -->
  <rect ${P} x="${r1(x)}" y="${r1(webTop)}" width="${r1(w)}" height="${r1(webBot - webTop)}"/>
  <path ${T} d="${warp}"/>
  <!-- beams, dark, top and bottom -->
  <rect ${D} x="${r1(x - 18)}" y="${r1(top)}" width="${r1(w + 36)}" height="20" rx="7"/>
  <rect ${D} x="${r1(x - 18)}" y="${r1(base - 26)}" width="${r1(w + 36)}" height="20" rx="7"/>
  <!-- the woven cloth: what the loom has actually made -->
  <rect ${F} x="${r1(x)}" y="${r1(webBot - 30)}" width="${r1(w)}" height="34" rx="3"/>
  <path ${T} d="M${pt(x + 4, webBot - 20)}L${pt(x + w - 4, webBot - 20)}M${pt(x + 4, webBot - 8)}L${pt(x + w - 4, webBot - 8)}"/>
  <!-- Shuttle. The custom property below is the gap it crosses; the CSS runs
       it ALTERNATE, so its real period is twice the declared duration. (Do not
       write the property name with its two leading hyphens inside an SVG
       comment — a double hyphen makes the XML invalid and strict consumers
       such as librsvg reject the whole fragment.) -->
  <g class="shuttle is-animated" style="--travel:${r1(w - 52)}px">
    <path ${D} d="M${pt(x + 6, webBot - 44)}L${pt(x + 46, webBot - 44)}L${pt(x + 39, webBot - 32)}L${pt(x + 13, webBot - 32)}Z"/>
  </g>
</g>`;
}

/* ================================================================== *
 * Easel — DRAWING. A tripod easel with a canvas in progress.
 *
 * Total height is capped by the caller for a reason: the one place with
 * floor to spare is the robot arm's apron, and the arm's linkage comes
 * down to y 596 over x 1600-1640. The canvas top must stay BELOW that.
 * ================================================================== */
function easel(x, feet = GROUND, h = 280) {
  const top = feet - h;
  const cw = 104, ch = 118;
  const cx0 = x - cw / 2, cy0 = top + 16;
  return `
<g class="ex-easel">
  <!-- tripod: two front legs and one back, so it reads as standing in space -->
  <path ${S} d="M${pt(x - 54, feet)}L${pt(x - 8, top + 8)}M${pt(x + 54, feet)}L${pt(x + 8, top + 8)}"/>
  <path ${T} d="M${pt(x + 20, feet)}L${pt(x + 4, top + 40)}"/>
  <path ${T} d="M${pt(x - 40, feet - 96)}L${pt(x + 40, feet - 96)}"/>
  <!-- canvas -->
  <rect ${P} x="${r1(cx0)}" y="${r1(cy0)}" width="${cw}" height="${ch}" rx="4"/>
  <rect ${S} x="${r1(cx0)}" y="${r1(cy0)}" width="${cw}" height="${ch}" rx="4" fill="none"/>
  <!-- the painting: abstract marks, because legible imagery at this size
       under a 0.58 scrim is noise. Colour is what carries "this is art". -->
  <path ${R} d="M${pt(cx0 + 14, cy0 + 78)}C${pt(cx0 + 30, cy0 + 34)} ${pt(cx0 + 52, cy0 + 96)} ${pt(cx0 + 70, cy0 + 44)}
               L${pt(cx0 + 78, cy0 + 62)}C${pt(cx0 + 58, cy0 + 104)} ${pt(cx0 + 34, cy0 + 60)} ${pt(cx0 + 20, cy0 + 92)}Z"/>
  <circle ${F} cx="${r1(cx0 + 68)}" cy="${r1(cy0 + 28)}" r="17"/>
  <path ${T} d="M${pt(cx0 + 12, cy0 + 104)}L${pt(cx0 + 92, cy0 + 100)}"/>
  <!-- ledge and a brush jar -->
  <rect ${D} x="${r1(cx0 - 6)}" y="${r1(cy0 + ch)}" width="${cw + 12}" height="12" rx="4"/>
  <path ${S} d="M${pt(x + 30, cy0 + ch)}L${pt(x + 26, cy0 + ch - 26)}M${pt(x + 36, cy0 + ch)}L${pt(x + 42, cy0 + ch - 30)}"/>
</g>`;
}

/* ================================================================== *
 * Pot shelf — CERAMIC.
 *
 * This replaced a hand-drawn potter's wheel that was rewritten twice and still
 * read as a lamp on a stool: a wheel head seen from the side shows no rotation,
 * so all the mechanism cost bought nothing. A ROW OF POTS is legible at a
 * glance, which is the only thing that matters at this scale.
 *
 * It sits ON A BENCH now (the one the deleted electronics stand vacated), not
 * in the foreground band where it started. NOTE the coordinate contract: `y` is
 * the shelf SLAB, and the legs run to `y + 44`. Resting on the 784 bench top
 * therefore means potShelf(640, 740) — passing 784 punches the legs 44 units
 * through the bench, which `scene:grounded` will report.
 * ================================================================== */
function potShelf(x, y) {
  const pot = (px, py, r, fill) => `
    <path ${fill} d="M${pt(px - r, py)}C${pt(px - r * 1.5, py - r * 0.9)} ${pt(px - r * 1.3, py - r * 2)} ${pt(px - r * 0.65, py - r * 2.4)}
                 L${pt(px + r * 0.65, py - r * 2.4)}C${pt(px + r * 1.3, py - r * 2)} ${pt(px + r * 1.5, py - r * 0.9)} ${pt(px + r, py)}Z"/>
    <path ${S} d="M${pt(px - r, py)}C${pt(px - r * 1.5, py - r * 0.9)} ${pt(px - r * 1.3, py - r * 2)} ${pt(px - r * 0.65, py - r * 2.4)}
                 L${pt(px + r * 0.65, py - r * 2.4)}C${pt(px + r * 1.3, py - r * 2)} ${pt(px + r * 1.5, py - r * 0.9)} ${pt(px + r, py)}Z" fill="none"/>
    <ellipse ${D} cx="${r1(px)}" cy="${r1(py - r * 2.4)}" rx="${r1(r * 0.72)}" ry="${r1(r * 0.3)}"/>`;
  return `
<g class="ex-pots">
  <rect ${D} x="${r1(x)}" y="${r1(y)}" width="164" height="15" rx="6"/>
  <path ${S} d="M${pt(x + 14, y + 15)}L${pt(x + 22, y + 44)}M${pt(x + 150, y + 15)}L${pt(x + 142, y + 44)}"/>
  ${pot(x + 34, y, 17, F)}
  ${pot(x + 84, y, 22, P)}
  ${pot(x + 133, y, 15, F)}
</g>`;
}

module.exports = {loom, easel, potShelf};
