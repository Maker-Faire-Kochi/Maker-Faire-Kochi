/**
 * Visitors seen FROM BEHIND — hand-drawn, because Open Peeps has no back view.
 *
 * A faire is people looking AT things. Every react-peeps StandingPose is
 * front-facing (all 26 enumerated), so a crowd built only from them faces the
 * camera and reads as a lineup however it is arranged.
 *
 * THE FACE-STRIPPING TRICK WAS TRIED AND REJECTED. The face layer can be cut
 * out deterministically -- it is always `<g transform="translate(159 186)">`,
 * exactly 48 characters before the first byte that differs between two faces,
 * verified across nine body/hair combinations. The result is unshippable: the
 * BODY keeps its collar points, its button placket and its chest pocket, so a
 * featureless head over an unmistakably frontal shirt reads as an uncanny
 * faceless person staring at you, not as someone turned away. (`Face: 'Blank'`
 * is no help -- it is a neutral expression, not an empty head.)
 *
 * These are drawn instead, and they deliberately OMIT every frontal tell: no
 * eyes, nose or mouth, no collar, no placket, no pocket. What sells a back is
 * the hair mass covering crown and nape, shoulders wider than the head, and
 * arms hanging outside the torso silhouette.
 *
 * CONVENTIONS THAT MATTER HERE:
 *  - Dark parts are filled `var(--peep-ink)`, NOT `.fill-deep`. There is no ink
 *    fill class; `.fill-deep` is the machines' deep BLUE, and hair drawn with it
 *    came out cyan next to the ink-haired Open Peeps crowd. react-peeps fills
 *    its own hair with the `strokeColor` prop, which is `var(--peep-ink)` -- so
 *    this matches the crowd exactly.
 *  - Bodies are outline-over-paper, never solid ink. Solid silhouettes are far
 *    too heavy behind white hero type at --hero-dim: 0.58 (the same reason the
 *    cast uses WB pose variants and never BW).
 *  - Feet sit exactly on y=0 so `feet` means the ground line, matching
 *    `place()` in build-scene.cjs. An earlier draft ended the shoes 40 units
 *    short and every back view floated above the ground.
 *
 * Cheap, too: about 2.5KB each against ~25KB for an Open Peeps figure, which is
 * why they are emitted inline rather than instanced through <defs>.
 */
const {r1} = require('./geometry.cjs');

const S = 'class="ln"';
const T = 'class="ln thin"';
const F = 'class="fill-cyan"';
const P = 'class="fill-paper"';
const INK = 'fill="var(--peep-ink)"';

/**
 * Hair, as a mass over the crown and down the nape.
 *
 * The single strongest back-view cue, so each variant differs in SILHOUETTE
 * rather than texture: at ~260 scene units tall under a 0.58 scrim texture is
 * invisible and outline is everything. Authored about a head centred on (0,0)
 * with rx 60 / ry 66.
 */
const HAIR = {
  short: `<path ${INK} d="M-62 -8C-60 -46 -34 -70 2 -70C38 -70 62 -46 62 -6C62 14 56 30 48 40C44 12 28 0 2 0C-24 0 -42 12 -46 42C-56 32 -62 14 -62 -8Z"/>`,
  bun: `<path ${INK} d="M-60 -4C-58 -44 -32 -68 2 -68C36 -68 60 -44 60 -2C60 20 54 38 46 48C42 16 26 4 2 4C-22 4 -40 16 -44 50C-54 40 -60 18 -60 -4Z"/>
        <ellipse ${INK} cx="0" cy="-88" rx="34" ry="30"/>
        <path ${T} d="M-22 -80C-14 -96 12 -98 22 -82"/>`,
  long: `<path ${INK} d="M-66 -6C-64 -46 -36 -70 2 -70C40 -70 66 -46 66 -4C66 46 62 96 56 134C48 142 28 146 0 146C-28 146 -48 142 -56 132C-62 94 -66 44 -66 -6Z"/>
         <path ${T} d="M-30 40C-32 76 -32 108 -28 132M30 42C32 78 32 108 28 132"/>`,
  cornrows: `<path ${INK} d="M-60 -6C-58 -44 -34 -68 2 -68C38 -68 60 -44 60 -4C60 16 54 32 46 42C42 12 26 0 2 0C-22 0 -40 12 -44 44C-54 34 -60 16 -60 -6Z"/>
             <path ${T} d="M-34 -54L-38 34M-13 -64L-14 38M13 -64L15 38M34 -54L39 34"/>
             <path ${INK} d="M-30 34C-30 62 -26 88 -22 106L-8 104C-12 82 -15 58 -15 34Z"/>
             <path ${INK} d="M30 36C30 64 26 90 22 108L8 106C12 84 15 60 15 36Z"/>`,
  curls: `<path ${INK} d="M-68 -8C-66 -48 -36 -72 2 -72C40 -72 68 -48 68 -6C68 16 60 34 50 46C46 14 28 2 2 2C-24 2 -44 14 -48 48C-60 36 -68 16 -68 -8Z"/>
          <circle ${INK} cx="-52" cy="-40" r="24"/><circle ${INK} cx="-20" cy="-64" r="26"/>
          <circle ${INK} cx="20" cy="-64" r="26"/><circle ${INK} cx="52" cy="-38" r="24"/>`,
};

const TOPS = {paper: P, cyan: F};

/** Authored height: the figure occupies y 0 (feet) up to about y -900. */
/**
 * Topmost y per hair variant, and the extra a raised arm adds.
 *
 * `h` MUST mean the figure's real height or every future clearance sum built
 * on it is wrong -- which is exactly the trap the robot arm's apron sets. A
 * single UNIT_H was off by -45..+12 units across the variants (the bun reaches
 * y -912, cornrows only -858), so the scale is derived per variant instead.
 */
const TOP = {short: -864, bun: -912, long: -864, cornrows: -858, curls: -884};
const ARM_UP_TOP = -887;
const UNIT_H = 900;   // nominal only -- see TOP for the real per-variant extent

/**
 * One visitor, from behind.
 *
 * Outlines are deliberately NOT mirror-symmetric -- a few units of difference
 * left to right is what stops these reading as flat icons beside the loose
 * Open Peeps linework.
 *
 * `arm: 'up'` raises the near arm toward whatever the figure is looking at. A
 * pointing gesture is what turns a standing body into someone SHOWING a thing
 * to the person beside them, which is the whole point of a show and tell.
 */
function backFigure(x, feet, h, {hair = 'short', top = 'paper', arm = 'down', trousers = 'ink', flip = false, seq = 0} = {}) {
  const s = h / Math.abs(Math.min(TOP[hair] ?? -864, arm === 'up' ? ARM_UP_TOP : 0));
  const body = TOPS[top] || P;
  const legFill = trousers === 'ink' ? INK : P;

  // Sneakers, not pills: a sole line and a slightly turned-out toe. Feet are
  // the one place a stiff shape is immediately legible as "clip art".
  const shoes = `
    <path ${P} d="M-100 -56C-110 -50 -114 -32 -112 -18C-110 -5 -99 2 -78 2L-36 1C-27 1 -22 -9 -23 -24C-24 -42 -28 -56 -37 -56Z"/>
    <path ${S} d="M-100 -56C-110 -50 -114 -32 -112 -18C-110 -5 -99 2 -78 2L-36 1C-27 1 -22 -9 -23 -24C-24 -42 -28 -56 -37 -56Z" fill="none"/>
    <path ${T} d="M-110 -14L-26 -12"/>
    <path ${P} d="M98 -53C109 -47 114 -30 112 -16C110 -6 98 0 77 -1L37 -2C28 -2 23 -12 24 -26C25 -41 29 -53 38 -53Z"/>
    <path ${S} d="M98 -53C109 -47 114 -30 112 -16C110 -6 98 0 77 -1L37 -2C28 -2 23 -12 24 -26C25 -41 29 -53 38 -53Z" fill="none"/>
    <path ${T} d="M108 -12L27 -11"/>`;

  // Legs slightly apart and not parallel. Two perfectly vertical tubes is the
  // single biggest "flat icon" tell.
  const legs = `
    <path ${legFill} d="M-74 -376C-79 -296 -87 -186 -94 -100C-95 -80 -89 -68 -70 -68C-51 -68 -42 -79 -41 -99C-37 -186 -33 -296 -30 -376Z"/>
    <path ${legFill} d="M74 -372C80 -294 87 -184 93 -98C94 -78 88 -67 69 -67C50 -67 41 -78 40 -98C37 -184 34 -294 31 -372Z"/>
    <path ${T} d="M-66 -290L-58 -146M67 -288L60 -144"/>`;

  // Torso: narrower than the first draft, tapered at the waist, hem loose and
  // NOT level. Shoulders still wider than the head -- with a yoke seam across
  // them, which is a back-of-garment detail and does real work selling the turn.
  const torso = `
    <path ${body} d="M-78 -688C-93 -679 -100 -656 -103 -626C-107 -570 -101 -474 -95 -382C-60 -374 56 -372 97 -378C102 -470 107 -568 103 -628C100 -658 92 -680 77 -690C38 -702 -40 -700 -78 -688Z"/>
    <path ${S} d="M-78 -688C-93 -679 -100 -656 -103 -626C-107 -570 -101 -474 -95 -382C-60 -374 56 -372 97 -378C102 -470 107 -568 103 -628C100 -658 92 -680 77 -690C38 -702 -40 -700 -78 -688Z" fill="none"/>
    <path ${T} d="M-92 -640C-40 -652 40 -651 92 -642"/>
    <path ${T} d="M-95 -390C-58 -382 56 -380 97 -386"/>`;

  // Arms sit OUTSIDE the torso silhouette with their own visible outline and
  // slightly different lengths -- in the first draft they shared the torso fill
  // and vanished into it completely.
  const armFar = `
    <path ${body} d="M100 -640C117 -622 128 -584 133 -538C138 -492 138 -452 136 -426L104 -424C104 -454 103 -494 99 -536C96 -576 91 -610 84 -632Z"/>
    <path ${S} d="M100 -640C117 -622 128 -584 133 -538C138 -492 138 -452 136 -426L104 -424C104 -454 103 -494 99 -536C96 -576 91 -610 84 -632Z" fill="none"/>
    <path ${T} d="M106 -436L134 -438"/>`;

  const armDown = `
    <path ${body} d="M-101 -644C-119 -625 -130 -586 -135 -540C-140 -492 -139 -450 -137 -422L-105 -420C-105 -452 -104 -492 -100 -534C-97 -576 -92 -612 -85 -634Z"/>
    <path ${S} d="M-101 -644C-119 -625 -130 -586 -135 -540C-140 -492 -139 -450 -137 -422L-105 -420C-105 -452 -104 -492 -100 -534C-97 -576 -92 -612 -85 -634Z" fill="none"/>
    <path ${T} d="M-107 -432L-135 -434"/>`;

  const armUp = `
    <path ${body} d="M-95 -658C-116 -676 -139 -708 -153 -746C-166 -780 -172 -812 -172 -838L-140 -845C-138 -820 -132 -792 -123 -764C-113 -732 -99 -704 -82 -686Z"/>
    <path ${S} d="M-95 -658C-116 -676 -139 -708 -153 -746C-166 -780 -172 -812 -172 -838L-140 -845C-138 -820 -132 -792 -123 -764C-113 -732 -99 -704 -82 -686Z" fill="none"/>
    <ellipse ${P} cx="-157" cy="-861" rx="24" ry="26"/>
    <ellipse ${S} cx="-157" cy="-861" rx="24" ry="26" fill="none"/>
    <path ${T} d="M-172 -872C-166 -880 -152 -882 -144 -874"/>`;

  const head = `
    <path ${P} d="M-21 -686L22 -689L21 -724L-20 -722Z"/>
    <path ${S} d="M-21 -686L-20 -720M22 -689L21 -722"/>
    <ellipse ${P} cx="0" cy="-788" rx="61" ry="67"/>
    <ellipse ${S} cx="0" cy="-788" rx="61" ry="67" fill="none"/>
    <g transform="translate(0 -794)">${HAIR[hair] || HAIR.short}</g>`;

  const sx = flip ? -s : s;
  return `      <g class="peep" style="--bob:${(3.1 + (seq % 5) * 0.8).toFixed(1)}px;--bdur:${[3, 4, 6, 8, 12][seq % 5]}s;--bdelay:-${(seq * 0.9).toFixed(1)}s">` +
    `<g class="peep-at back-peep" transform="translate(${r1(x)} ${r1(feet)}) scale(${r1(sx * 1000) / 1000} ${r1(s * 1000) / 1000})">` +
    `${shoes}${armFar}${legs}${torso}${arm === 'up' ? armUp : armDown}${head}` +
    `</g></g>`;
}

module.exports = {backFigure, HAIR_KINDS: Object.keys(HAIR), TOP};
