/**
 * Booths and exhibits — the thing that makes this read as a FAIRE.
 *
 * A crowd standing in front of machinery is not a faire; it is a group photo.
 * A faire is a RHYTHM of stalls, each showing something different, with people
 * circulating between them. So the scene is now built from booths: a canopy, a
 * sign, and an exhibit underneath — tech, art, machines, robotics — with air
 * between each one.
 *
 * Signage is abstract marks rather than real letters: at this scale, under a
 * 0.58 scrim, actual text would be illegible noise. The shape of a sign is
 * what carries the meaning.
 *
 * The exhibits themselves live in scene/tech.cjs. Earlier drafts lived here and
 * were DELETED rather than left dead: they still used the broken viewBox
 * --pivot rotation, and dead code like that gets copied forward.
 */
const {GROUND, pt, on, r1, spokes} = require('./geometry.cjs');

const S = 'class="ln"';
const T = 'class="ln thin"';
const F = 'class="fill-cyan"';
const D = 'class="fill-deep"';
const P = 'class="fill-paper"';
const R = 'class="fill-red"';

/**
 * A stall canopy: posts, a pitched roof, a striped valance and a sign board.
 * `accent` swaps the stripe colour so the row of booths does not read as a
 * repeated stamp.
 */
function booth(x, w, {top = 486, accent = 'cyan', sign = true} = {}) {
  const roofH = 62, valance = 26;
  const yRoof = top, yEave = top + roofH;
  const stripeFill = accent === 'red' ? R : F;
  const nStripes = Math.max(4, Math.round(w / 46));
  const sw = w / nStripes;
  let stripes = '';
  for (let i = 0; i < nStripes; i++) {
    if (i % 2) continue;
    stripes += `<path ${stripeFill} d="M${pt(x + i * sw, yEave)}L${pt(x + (i + 1) * sw, yEave)}` +
      `L${pt(x + (i + 1) * sw - sw * 0.18, yEave + valance)}L${pt(x + i * sw + sw * 0.18, yEave + valance)}Z"/>`;
  }
  return `
<g class="booth">
  <!-- posts -->
  <path ${S} d="M${pt(x + 16, yEave)}L${pt(x + 16, GROUND)}M${pt(x + w - 16, yEave)}L${pt(x + w - 16, GROUND)}"/>
  <!-- roof -->
  <path ${P} d="M${pt(x - 14, yEave)}L${pt(x + w / 2, yRoof)}L${pt(x + w + 14, yEave)}Z"/>
  <path ${S} d="M${pt(x - 14, yEave)}L${pt(x + w / 2, yRoof)}L${pt(x + w + 14, yEave)}Z"/>
  <path ${S} d="M${pt(x - 14, yEave)}L${pt(x + w + 14, yEave)}"/>
  ${stripes}
  <path ${T} d="M${pt(x, yEave + valance)}L${pt(x + w, yEave + valance)}"/>
  ${sign ? `
  <!-- Sign board, mounted above the roof peak. Abstract marks rather than
       letters: real text at this scale under a 0.58 scrim is illegible noise,
       and the SHAPE of a sign is what carries the meaning. -->
  <g class="booth-sign">
    <path ${S} d="M${pt(x + w / 2, yRoof)}L${pt(x + w / 2, yRoof - 20)}"/>
    <rect ${P} x="${r1(x + w / 2 - 66)}" y="${r1(yRoof - 66)}" width="132" height="46" rx="8"/>
    <rect ${S} x="${r1(x + w / 2 - 66)}" y="${r1(yRoof - 66)}" width="132" height="46" rx="8" fill="none"/>
    <path ${T} d="M${pt(x + w / 2 - 46, yRoof - 50)}L${pt(x + w / 2 + 28, yRoof - 50)}
                 M${pt(x + w / 2 - 46, yRoof - 36)}L${pt(x + w / 2 + 4, yRoof - 36)}"/>
    <circle ${R} cx="${r1(x + w / 2 + 46)}" cy="${r1(yRoof - 37)}" r="7"/>
  </g>` : ''}
</g>`;
}

module.exports = {booth};
