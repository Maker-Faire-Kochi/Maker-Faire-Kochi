/**
 * Secondary machines and clutter.
 *
 * The reference frame is dense with SMALL machines, not just one big one: a
 * hand press, a bench grinder, tool rolls, open boxes, buckets. They are what
 * makes the scene read as a working faire rather than a diagram with two
 * exhibits, and they cost almost nothing next to a figure.
 */
const {GROUND, pt, on, gear, spokes, r1, spinAt} = require('./geometry.cjs');

const S = 'class="ln"';
const T = 'class="ln thin"';
const F = 'class="fill-cyan"';
const D = 'class="fill-deep"';
const P = 'class="fill-paper"';

/** A hand press: box base, column, and a spoked handwheel that turns. */
function press(x, y) {
  return `
<g class="press">
  <rect ${F} x="${x}" y="${y + 96}" width="118" height="${GROUND - y - 96}" rx="8"/>
  <rect ${D} x="${x + 22}" y="${y + 128}" width="46" height="34" rx="5"/>
  <rect ${F} x="${x + 34}" y="${y}" width="30" height="104" rx="10"/>
  <path ${S} d="M${pt(x + 49, y + 18)}L${pt(x + 104, y + 6)}"/>
  ${spinAt(x + 104, y + 6, 'cog',
      `<circle ${F} cx="${x + 104}" cy="${y + 6}" r="30"/>` +
      `<circle ${P} cx="${x + 104}" cy="${y + 6}" r="20"/>` +
      `<path ${T} d="${spokes(x + 104, y + 6, 5, 20, 4)}"/>`, '--dur:8s')}
  <rect ${D} x="${x + 20}" y="${y + 84}" width="74" height="16" rx="5"/>
</g>`;
}

/** A bench grinder: motor body and a wheel spinning fast. */
function grinder(x, y) {
  return `
<g class="grinder">
  <rect ${D} x="${x}" y="${y + 22}" width="74" height="40" rx="12"/>
  <rect ${F} x="${x + 60}" y="${y + 30}" width="20" height="24" rx="4"/>
  ${spinAt(x + 92, y + 42, 'cog',
      `<circle ${F} cx="${x + 92}" cy="${y + 42}" r="26"/>` +
      `<path ${T} d="${spokes(x + 92, y + 42, 4, 20, 3)}"/>`, '--dur:3s')
      .replace('class="cog joint"', 'class="cog joint" data-dir="-1"')}
  <path ${S} d="M${pt(x + 8, y + 62)}L${pt(x + 8, y + 74)}M${pt(x + 62, y + 62)}L${pt(x + 62, y + 74)}"/>
</g>`;
}

/** A small kiln / printer box with a glowing window. */
function kiln(x, y) {
  return `
<g class="kiln">
  <rect ${F} x="${x}" y="${y}" width="104" height="${GROUND - y}" rx="9"/>
  <rect ${P} x="${x + 18}" y="${y + 22}" width="68" height="46" rx="6"/>
  <path ${T} d="M${pt(x + 18, y + 84)}L${pt(x + 86, y + 84)}"/>
  <circle ${D} cx="${x + 30}" cy="${y + 102}" r="8"/>
  <circle class="fill-red" cx="${x + 54}" cy="${y + 102}" r="8"/>
</g>`;
}

/** An open cardboard box, flaps out — straight from the reference foreground. */
function openBox(x, y, w = 88) {
  const h = w * 0.62;
  return `
<g class="box">
  <path ${F} d="M${pt(x, y)}L${pt(x + w, y)}L${pt(x + w, y + h)}L${pt(x, y + h)}Z"/>
  <path ${S} d="M${pt(x, y)}L${pt(x - 26, y - 16)}M${pt(x + w, y)}L${pt(x + w + 26, y - 16)}"/>
  <path ${T} d="M${pt(x, y + h * 0.4)}L${pt(x + w, y + h * 0.4)}"/>
</g>`;
}

/** A bucket. */
function bucket(x, y, s = 1) {
  const w = 42 * s, h = 46 * s;
  return `
<g class="bucket">
  <path ${P} d="M${pt(x - w / 2, y - h)}L${pt(x + w / 2, y - h)}L${pt(x + w / 2 - 6, y)}L${pt(x - w / 2 + 6, y)}Z"/>
  <path ${S} d="M${pt(x - w / 2, y - h)}L${pt(x + w / 2, y - h)}L${pt(x + w / 2 - 6, y)}L${pt(x - w / 2 + 6, y)}Z"/>
  <path ${T} d="M${pt(x - w / 2 + 2, y - h + 9)}L${pt(x + w / 2 - 2, y - h + 9)}"/>
</g>`;
}

/** Tools laid across a bench top. */
function toolRoll(x, y) {
  return `
<g class="tools">
  <path ${S} d="M${pt(x, y)}L${pt(x + 46, y)}"/>
  <circle ${D} cx="${x + 54}" cy="${y - 2}" r="9"/>
  <path ${S} d="M${pt(x + 72, y + 2)}L${pt(x + 72, y - 26)}L${pt(x + 94, y - 26)}"/>
  <rect ${D} x="${x + 106}" y="${y - 18}" width="34" height="18" rx="4"/>
  <path ${T} d="M${pt(x + 150, y)}L${pt(x + 176, y - 20)}"/>
</g>`;
}

/** A stack of crates. */
function crates(x, y) {
  return `
<g class="crates">
  <rect ${F} x="${x}" y="${y}" width="80" height="66" rx="7"/>
  <path ${T} d="M${pt(x, y + 26)}L${pt(x + 80, y + 26)}M${pt(x + 40, y)}L${pt(x + 40, y + 66)}"/>
  <rect ${D} x="${x + 14}" y="${y - 44}" width="58" height="46" rx="6"/>
  <path ${T} d="M${pt(x + 14, y - 22)}L${pt(x + 72, y - 22)}"/>
</g>`;
}

module.exports = {press, grinder, kiln, openBox, bucket, toolRoll, crates};
