/**
 * The hand-authored machinery: everything Open Peeps cannot supply.
 *
 * Open Peeps contains no objects at all, so the cheena vala, the gear train,
 * the robot arm, the benches, the ladder and the clutter are all drawn here.
 * This is the expensive 70% of the scene; the figures are the cheap 30%.
 *
 * Conventions, so the machines sit WITH the figures rather than beside them:
 * flat cyan fills, ink line-art at the peeps' stroke weight, palette tokens
 * only. Anything that moves carries `is-animated`, because
 * animation-play-state is not inherited and the pause control has to reach
 * every animated node individually.
 *
 * Groups that are animated never carry a transform attribute of their own — a
 * CSS transform replaces such an attribute instead of composing with it. Fixed
 * angles therefore live on a plain nested <g>.
 */
const {GROUND, pt, on, gear, spokes, net} = require('./geometry.cjs');

const S = 'class="ln"';
const T = 'class="ln thin"';
const F = 'class="fill-cyan"';
const D = 'class="fill-deep"';
const P = 'class="fill-paper"';

/* ================================================================== *
 * Cheena vala — the Kochi motif and the left anchor.
 *
 * A shore-mounted cantilever: a tall A-frame, a spider of splayed arms
 * carrying the net out over the water, and counterweight stones on the
 * landward side that balance the lift.
 * ================================================================== */
function cheenaVala() {
  const apex = [366, 148];
  const boom = [548, 292];
  // A spreader bar, not a fan of arms converging on a point. Radiating every
  // arm from the apex is what made this read as a cone: the net has to hang
  // from a WIDE, roughly level edge and get its bag from sag alone.
  const bar = {y: 424, x0: 104, x1: 386};
  const hangs = [104, 198, 292, 386];

  return `
<g class="cheena">
  <!-- A-frame and bracing -->
  <path ${S} d="M${pt(230, GROUND)}L${pt(...apex)}L${pt(502, GROUND)}"/>
  <!-- planted footing. Two hairline legs under the hero scrim read as nothing,
       which is the other half of why this looked airborne. -->
  <rect ${F} x="196" y="${GROUND - 26}" width="112" height="26" rx="7"/>
  <rect ${F} x="440" y="${GROUND - 26}" width="112" height="26" rx="7"/>
  <path ${T} d="M${pt(276, 706)}L${pt(456, 706)}M${pt(310, 494)}L${pt(422, 494)}M${pt(252, 818)}L${pt(480, 818)}"/>
  <rect ${F} x="328" y="138" width="76" height="26" rx="9"/>

  <!-- landward boom carrying the counterweights -->
  <path ${S} d="M${pt(...apex)}L${pt(...boom)}"/>
  <path ${T} d="M${pt(456, 222)}L${pt(472, 300)}"/>

  <g class="rig is-animated">
    <!-- suspension lines down to the spreader -->
    <path ${T} d="${hangs.map(x => `M${pt(...apex)}L${pt(x, bar.y)}`).join('')}"/>
    <!-- the net: a wide bag slung under the spreader -->
    <path class="mesh" d="${net(bar.x0, bar.y, bar.x1, bar.y, 268)}"/>
    <!-- spreader bar, drawn last so it caps the mesh cleanly -->
    <path ${S} d="M${pt(bar.x0, bar.y)}L${pt(bar.x1, bar.y)}"/>
    <circle ${D} cx="${bar.x0}" cy="${bar.y}" r="9"/>
    <circle ${D} cx="${bar.x1}" cy="${bar.y}" r="9"/>
  </g>

  <!-- Counterweight: a bound cluster of stones on the landward rope. Drawn in
       outline over paper rather than flat cyan — as solid fills they read as
       three floating pills rather than as mass hanging on a rope. -->
  <g class="counterweight is-animated">
    <path ${S} d="M${pt(...boom)}L${pt(boom[0], 476)}"/>
    <path ${P} d="M${pt(boom[0] - 40, 516)}A40 40 0 1 1 ${pt(boom[0] + 40, 516)}
                 L${pt(boom[0] + 32, 606)}A34 34 0 1 1 ${pt(boom[0] - 32, 606)}Z"/>
    <path ${S} d="M${pt(boom[0] - 40, 516)}A40 40 0 1 1 ${pt(boom[0] + 40, 516)}
                 L${pt(boom[0] + 32, 606)}A34 34 0 1 1 ${pt(boom[0] - 32, 606)}Z"/>
    <path ${T} d="M${pt(boom[0] - 38, 542)}L${pt(boom[0] + 38, 542)}
                 M${pt(boom[0] - 34, 578)}L${pt(boom[0] + 34, 578)}"/>
  </g>
</g>`;
}

/* ================================================================== *
 * Bunting — a faire is a faire because it is dressed. This also does
 * real compositional work: it bridges the dead sky between the cheena
 * vala and the gear frame, which is otherwise the weakest part of the
 * frame.
 * ================================================================== */
function bunting(x0, y0, x1, y1, count = 14) {
  const sag = 96;
  const at = t => {
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t + sag * Math.sin(Math.PI * t);
    return [x, y];
  };
  let flags = '';
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const [x, y] = at(t);
    const w = 15, h = 30;
    flags += `<path class="${i % 2 ? 'fill-red' : 'fill-cyan'}" d="M${pt(x - w, y)}L${pt(x + w, y)}L${pt(x, y + h)}Z"/>`;
  }
  let line = `M${pt(...at(0))}`;
  for (let i = 1; i <= 24; i++) line += `L${pt(...at(i / 24))}`;
  return `
<g class="bunting">
  <path ${T} d="${line}"/>
  ${flags}
</g>`;
}

/* ================================================================== *
 * Robot arm — a SIX-AXIS industrial arm, drawn so it reads as one.
 *
 * The previous version was a stack of rectangles whose base was buried
 * behind the crowd, so all that showed was a cyan diagonal that looked
 * like a stray beam. What makes an arm legible is the chain being
 * visible: a planted base, a turntable, then shoulder -> upper arm ->
 * elbow -> forearm -> wrist -> gripper, with every joint drawn as a
 * distinct dark hub so the eye can follow the linkage.
 *
 * Parameterised so it can be placed and scaled. Authored with its base
 * at (0,0) and built upward, then positioned by the caller.
 * ================================================================== */
function robotArm(x, baseY, scale = 1, flip = false) {
  /**
   * Joints rotate about their OWN origin, using translate -> rotate -> untranslate.
   *
   * The alternative -- a --pivot in viewBox coordinates -- does not survive
   * being nested inside a translated and scaled parent, because
   * transform-origin resolves in the element's LOCAL user space, which the
   * ancestor transform has already changed. Moving the pivot to the local
   * origin sidesteps the whole problem: `.joint` just sets
   * transform-origin: 0 0 and the maths cannot drift.
   */
  const joint = (cls, px, py, inner) => `
      <g transform="translate(0 ${py})">
        <g class="${cls} joint">
          <g transform="translate(0 ${-py})">${inner}</g>
        </g>
      </g>`;

  /**
   * Gripper. The jaws must ANCHOR INTO the wrist block, not merely sit above
   * it: authored with a gap they read as two loose diamonds floating beside
   * the arm, which is exactly how this looked before. Each jaw therefore
   * starts inside the block (y > its top edge) and tapers outward.
   */
  const gripper = `
        <circle ${D} cx="0" cy="-460" r="23"/>
        <circle class="fill-paper" cx="0" cy="-460" r="9"/>
        <path ${F} d="M-15 -498L-40 -558L-22 -568L1 -504Z"/>
        <path ${S} d="M-15 -498L-40 -558L-22 -568L1 -504Z" fill="none"/>
        <path ${F} d="M15 -498L40 -558L22 -568L-1 -504Z"/>
        <path ${S} d="M15 -498L40 -558L22 -568L-1 -504Z" fill="none"/>
        <rect ${F} x="-18" y="-512" width="36" height="58" rx="11"/>
        <rect ${S} x="-18" y="-512" width="36" height="58" rx="11" fill="none"/>`;

  const forearm = `
        <!-- rotate ABOUT THE ELBOW. A bare rotate(-30) pivots about the
             robot's own origin — the base — which swung the forearm, the
             wrist and the gripper jaws off across the frame as three
             apparently unconnected fragments. -->
        <g transform="rotate(-30 0 -268)">
          <rect ${F} x="-25" y="-460" width="50" height="200" rx="20"/>
          <rect ${S} x="-25" y="-460" width="50" height="200" rx="20" fill="none"/>
          <path ${T} d="M-25 -400L25 -400M-25 -344L25 -344"/>
          <circle ${D} cx="0" cy="-268" r="27"/>
          <circle class="fill-paper" cx="0" cy="-268" r="10"/>
          ${joint('arm-wrist', 0, -460, gripper)}
        </g>`;

  const upperArm = `
        <rect ${F} x="-31" y="-268" width="62" height="204" rx="24"/>
        <rect ${S} x="-31" y="-268" width="62" height="204" rx="24" fill="none"/>
        <path ${T} d="M-31 -180L31 -180M-31 -124L31 -124"/>
        <circle ${D} cx="0" cy="-72" r="34"/>
        <circle class="fill-paper" cx="0" cy="-72" r="13"/>
        ${joint('arm-elbow', 0, -268, forearm)}`;

  return `
<g class="robot" transform="translate(${x} ${baseY}) scale(${flip ? -scale : scale} ${scale})">
  <!-- planted base and turntable: without a visible base the arm reads as a
       stray diagonal beam rather than as a machine bolted to the floor -->
  <path ${F} d="M-124 0L124 0L98 -46L-98 -46Z"/>
  <path ${S} d="M-124 0L124 0L98 -46L-98 -46Z"/>
  <rect ${D} x="-74" y="-78" width="148" height="34" rx="10"/>
  <rect ${F} x="-40" y="-118" width="80" height="46" rx="12"/>
  <rect ${S} x="-40" y="-118" width="80" height="46" rx="12" fill="none"/>
  <path ${T} d="M-54 -46L-54 -8M54 -46L54 -8"/>

  ${joint('arm-shoulder', 0, -72, upperArm)}

  <!-- cable loom back to the base -->
  <path ${T} d="M54 -92C114 -152 98 -40 64 -10"/>
</g>`;
}

/* ================================================================== *
 * Workbenches — the surface the making actually happens on, with tools
 * scattered across the top so the tables read as in use.
 * ================================================================== */
function bench(x, y, w) {
  const legs = (lx) => `M${pt(lx, y + 26)}L${pt(lx - 30, GROUND)}M${pt(lx, y + 26)}L${pt(lx + 30, GROUND)}`;
  return `
<g class="bench">
  <path ${S} d="${legs(x + 48)}${legs(x + w - 48)}"/>
  <path ${T} d="M${pt(x + 34, y + 86)}L${pt(x + w - 34, y + 86)}"/>
  <rect ${F} x="${x}" y="${y}" width="${w}" height="26" rx="8"/>
  <rect ${D} x="${x + 8}" y="${y + 26}" width="${w - 16}" height="14" rx="5"/>
  <!-- tools, sitting on the far edge so the table reads as in use -->
  <rect ${D} x="${x + 40}" y="${y - 34}" width="40" height="34" rx="5"/>
  <path ${S} d="M${pt(x + 96, y - 6)}L${pt(x + 96, y - 40)}L${pt(x + 122, y - 40)}"/>
  <circle ${D} cx="${x + w - 62}" cy="${y - 20}" r="16"/>
  <path ${S} d="M${pt(x + w - 118, y - 4)}L${pt(x + w - 92, y - 36)}"/>
</g>`;
}

/* ================================================================== *
 * A step ladder, propped against the gear frame — the reference has
 * someone up it, and it does a lot to sell the machine's scale.
 * ================================================================== */
function ladder(x, yTop) {
  const lean = 34, h = GROUND - yTop;
  let rungs = '';
  for (let i = 1; i <= 6; i++) {
    const t = i / 7;
    rungs += `M${pt(x + lean * t, yTop + h * t)}L${pt(x + 62 + lean * t, yTop + h * t)}`;
  }
  return `
<g class="ladder">
  <path ${S} d="M${pt(x, yTop)}L${pt(x + lean, GROUND)}M${pt(x + 62, yTop)}L${pt(x + 62 + lean, GROUND)}"/>
  <path ${T} d="${rungs}"/>
</g>`;
}

/* ================================================================== *
 * Foreground clutter — crates, the cable spool, and the red cable that
 * runs the whole width and ties the three zones into one shore.
 * ================================================================== */
function clutter() {
  return `
<g class="clutter">
  <!-- The band below the horizon is on screen. Without a ground tone the
       crates and buckets down there read as floating cut-outs. -->
  <rect class="fg-ground" x="-20" y="902" width="1960" height="200"/>

  <rect ${F} x="470" y="820" width="82" height="82" rx="7"/>
  <path ${T} d="M${pt(470, 852)}L${pt(552, 852)}M${pt(511, 820)}L${pt(511, 902)}"/>
  <rect ${D} x="1500" y="840" width="64" height="62" rx="7"/>
  <rect ${F} x="1046" y="856" width="52" height="46" rx="6"/>

  <!-- Foreground band. It IS on screen below the ground line, and bare ground
       reads as an unfinished drawing — but scattered marks read as debris, so
       these are whole objects: two crates and a coil of rope. -->
  <g class="fg-crate">
    <rect ${F} x="214" y="946" width="96" height="76" rx="8"/>
    <path ${T} d="M${pt(214, 978)}L${pt(310, 978)}M${pt(262, 946)}L${pt(262, 1022)}"/>
  </g>
  <g class="fg-crate">
    <rect ${D} x="1452" y="962" width="82" height="66" rx="8"/>
    <path ${T} d="M${pt(1452, 990)}L${pt(1534, 990)}"/>
  </g>
  <g class="fg-coil">
    <ellipse ${T} cx="946" cy="996" rx="58" ry="20"/>
    <ellipse ${T} cx="946" cy="982" rx="42" ry="14"/>
    <ellipse ${T} cx="946" cy="970" rx="26" ry="9"/>
  </g>

  <g class="spool">
    <circle class="fill-red" cx="742" cy="842" r="50"/>
    <circle ${P} cx="742" cy="842" r="17"/>
    <circle class="fill-red" cx="742" cy="842" r="7"/>
  </g>

  <!-- one continuous cable run, left edge to right edge -->
  <path class="cable" d="M${pt(-20, 930)}C${pt(300, 892)} ${pt(520, 964)} ${pt(742, 888)}
        S${pt(1080, 952)} ${pt(1300, 926)}S${pt(1640, 884)} ${pt(1940, 936)}"/>
</g>`;
}

module.exports = {cheenaVala, bunting, robotArm, bench, ladder, clutter};
