/**
 * The tech exhibits — a Maker Faire is a SHOW AND TELL, so every machine here
 * has to visibly work.
 *
 * Deliberate coverage of machine TYPES, not just more boxes:
 *
 *   additive      3D printer (gantry sweeps, part grows)
 *   subtractive   laser cutter (head tracks, beam pulses), CNC spindle
 *   rotary        gear train (scene/gearTower.cjs), lathe spindle
 *   articulated   robot arm, animatronic servo
 *   linear        conveyor, pen plotter
 *   mobile        rover (wheels turn)
 *   aerial        drone (rotors spin, hovers)
 *   electronic    oscilloscope (trace scrolls), LED matrix (cells blink)
 *   energy        wind turbine, solar tracker
 *   pneumatic     hand press
 *
 * EVERY period divides the 48s master cycle. The conveyor is the one that
 * needs care: its items translate by exactly one item spacing per cycle, so
 * the pattern at the loop point is identical to the pattern at the start --
 * the same trick that lets a rotating gear loop without a seam.
 */
const {GROUND, pt, r1, spokes, on, spinAt} = require('./geometry.cjs');

const S = 'class="ln"';
const T = 'class="ln thin"';
const F = 'class="fill-cyan"';
const D = 'class="fill-deep"';
const P = 'class="fill-paper"';
const R = 'class="fill-red"';

/* ---------- additive: 3D printer ---------- */
function printer3d(x, y) {
  const w = 112, h = 128;
  return `
<g class="ex-printer">
  <rect ${D} x="${x}" y="${y + h - 16}" width="${w}" height="16" rx="5"/>
  <rect ${P} x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>
  <rect ${S} x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none"/>
  <path ${T} d="M${pt(x, y + 30)}L${pt(x + w, y + 30)}"/>
  <g class="gantry">
    <rect ${F} x="${x + 7}" y="${y + 38}" width="${w - 14}" height="11" rx="4"/>
    <rect ${D} x="${x + w / 2 - 11}" y="${y + 43}" width="22" height="17" rx="4"/>
  </g>
  <!-- the part being printed -->
  <path ${F} d="M${pt(x + 32, y + h - 16)}L${pt(x + 80, y + h - 16)}L${pt(x + 71, y + h - 62)}L${pt(x + 41, y + h - 62)}Z"/>
  <circle class="led" cx="${x + 16}" cy="${y + 16}" r="5" style="--bdur:2s"/>
</g>`;
}

/* ---------- subtractive: laser cutter ---------- */
function laserCutter(x, y) {
  const w = 148, h = 82;
  return `
<g class="ex-laser">
  <rect ${D} x="${x}" y="${y + h}" width="${w}" height="${GROUND - y - h}" rx="6"/>
  <rect ${P} x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>
  <rect ${S} x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none"/>
  <path ${T} d="M${pt(x + 10, y + h - 12)}L${pt(x + w - 10, y + h - 12)}"/>
  <g class="laser-head">
    <rect ${F} x="${x + w / 2 - 9}" y="${y + 8}" width="18" height="30" rx="5"/>
    <path class="laser-beam" d="M${pt(x + w / 2, y + 38)}L${pt(x + w / 2, y + h - 12)}"/>
  </g>
  <circle class="led" cx="${x + 14}" cy="${y + 66}" r="5" style="--bdur:3s"/>
</g>`;
}

/* ---------- rotary: CNC spindle on a bed ---------- */
function cncMill(x, y) {
  return `
<g class="ex-cnc">
  <rect ${D} x="${x}" y="${y + 62}" width="126" height="${GROUND - y - 62}" rx="6"/>
  <rect ${F} x="${x + 10}" y="${y + 48}" width="106" height="18" rx="5"/>
  <path ${S} d="M${pt(x + 63, y)}L${pt(x + 63, y + 26)}"/>
  ${spinAt(x + 63, y + 34, 'spindle',
      `<circle ${F} cx="${x + 63}" cy="${y + 34}" r="17"/>` +
      `<path ${T} d="${spokes(x + 63, y + 34, 3, 13, 3)}"/>`)}
  <path ${S} d="M${pt(x + 63, y + 44)}L${pt(x + 63, y + 56)}"/>
</g>`;
}

/* ---------- linear: conveyor with parts riding it ---------- */
function conveyor(x, y, w = 236, id = 'belt') {
  const gap = w / 4;
  // FIVE items for four slots: the extra one starts off the left end so that as
  // the pattern shifts by exactly one gap, it enters as the trailing item
  // leaves. With only four, the rightmost slid off the belt and nothing
  // replaced it -- an item visibly departing into thin air.
  let items = '';
  for (let i = -1; i < 4; i++) {
    items += `<rect class="belt-item fill-cyan" x="${r1(x + i * gap)}" y="${r1(y - 22)}" width="26" height="22" rx="4"
                style="--travel:${r1(gap)}px"/>`;
  }
  return `
<g class="ex-conveyor">
  <rect ${D} x="${x}" y="${y}" width="${w}" height="14" rx="6"/>
  <!-- clipped to the belt run, so nothing can overhang the pulleys -->
  <clipPath id="${id}-clip"><rect x="${r1(x)}" y="${r1(y - 30)}" width="${r1(w)}" height="46"/></clipPath>
  <g clip-path="url(#${id}-clip)">${items}</g>
  <circle ${P} cx="${r1(x + 10)}" cy="${r1(y + 7)}" r="12"/>
  <circle ${S} cx="${r1(x + 10)}" cy="${r1(y + 7)}" r="12" fill="none"/>
  <circle ${P} cx="${r1(x + w - 10)}" cy="${r1(y + 7)}" r="12"/>
  <circle ${S} cx="${r1(x + w - 10)}" cy="${r1(y + 7)}" r="12" fill="none"/>
  <path ${S} d="M${pt(x + 22, y + 14)}L${pt(x + 22, GROUND)}M${pt(x + w - 22, y + 14)}L${pt(x + w - 22, GROUND)}"/>
</g>`;
}

/* ---------- electronic: oscilloscope with a scrolling trace ---------- */
function oscilloscope(x, y) {
  // Two periods of a wave, so scrolling by exactly one period is seamless.
  const w = 132, h = 90, mid = y + 26 + 30;
  let d = `M${pt(x + 8, mid)}`;
  for (let i = 1; i <= 80; i++) {
    const t = i / 80;
    d += `L${pt(x + 8 + t * (w * 2 - 16), mid - Math.sin(t * Math.PI * 8) * 22)}`;
  }
  return `
<g class="ex-scope">
  <rect ${D} x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>
  <rect ${P} x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 30}" rx="4"/>
  <clipPath id="scope-clip"><rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 30}" rx="4"/></clipPath>
  <g clip-path="url(#scope-clip)">
    <path class="scope-trace" d="${d}" style="--travel:${r1(w - 16)}px"/>
  </g>
  <circle class="led" cx="${x + 18}" cy="${y + h - 11}" r="5" style="--bdur:2s"/>
  <circle ${F} cx="${x + 40}" cy="${y + h - 11}" r="6"/>
  <path ${S} d="M${pt(x + w / 2, y + h)}L${pt(x + w / 2, GROUND)}M${pt(x + w / 2 - 26, GROUND)}L${pt(x + w / 2 + 26, GROUND)}"/>
</g>`;
}

/* ---------- electronic: LED matrix panel ---------- */
function ledMatrix(x, y, cols = 7, rows = 5) {
  let cells = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      cells += `<circle class="led" cx="${r1(x + 14 + c * 15)}" cy="${r1(y + 14 + r * 15)}" r="5"
                  style="--bdur:${[2, 3, 4, 6][i % 4]}s;--bdelay:-${(i * 0.31).toFixed(2)}s"/>`;
    }
  }
  return `
<g class="ex-led">
  <rect ${D} x="${x}" y="${y}" width="${cols * 15 + 13}" height="${rows * 15 + 13}" rx="7"/>
  ${cells}
  <path ${S} d="M${pt(x + (cols * 15 + 13) / 2, y + rows * 15 + 13)}L${pt(x + (cols * 15 + 13) / 2, GROUND)}"/>
</g>`;
}

/* ---------- mobile: rover ---------- */
function rover(x, y) {
  const wheel = (wx) => spinAt(wx, y + 34, 'rover-wheel',
    `<circle ${D} cx="${r1(wx)}" cy="${r1(y + 34)}" r="20"/>` +
    `<path ${T} d="${spokes(wx, y + 34, 3, 15, 4)}"/>`);
  return `
<g class="ex-rover">
  <rect ${F} x="${x}" y="${y}" width="112" height="30" rx="9"/>
  <rect ${D} x="${x + 66}" y="${y - 20}" width="30" height="22" rx="5"/>
  <path ${T} d="M${pt(x + 81, y - 20)}L${pt(x + 81, y - 40)}"/>
  <circle ${R} cx="${x + 81}" cy="${y - 44}" r="5"/>
  ${wheel(x + 24)}${wheel(x + 88)}
</g>`;
}

/* ---------- aerial: drone ---------- */
function drone(x, y, s = 1, spin = '0.5s', hover = '6s') {
  const arm = 44 * s;
  const rotor = i => {
    const dx = i % 2 ? arm : -arm, dy = (i < 2 ? -14 : 14) * s;
    return `<path ${T} d="M${pt(x, y)}L${pt(x + dx, y + dy)}"/>
            ${spinAt(x + dx, y + dy, 'rotor',
              `<ellipse class="fill-deep" cx="${r1(x + dx)}" cy="${r1(y + dy)}" rx="${r1(29 * s)}" ry="${r1(4.5 * s)}"/>`,
              `--dur:${spin}`)}
            <circle ${F} cx="${r1(x + dx)}" cy="${r1(y + dy)}" r="${r1(6 * s)}"/>`;
  };
  return `
<g class="ex-drone" style="--hover:${hover}">
  ${[0, 1, 2, 3].map(rotor).join('')}
  <rect ${F} x="${r1(x - 21 * s)}" y="${r1(y - 11 * s)}" width="${r1(42 * s)}" height="${r1(25 * s)}" rx="${r1(8 * s)}"/>
  <circle class="led" cx="${r1(x)}" cy="${r1(y + 2 * s)}" r="${r1(5 * s)}" style="--bdur:2s"/>
</g>`;
}

/* ---------- aerial: a tethered blimp, drifting on a longer rhythm ---------- */
function blimp(x, y, s = 1) {
  return `
<g class="ex-blimp">
  <ellipse ${F} cx="${r1(x)}" cy="${r1(y)}" rx="${r1(72 * s)}" ry="${r1(30 * s)}"/>
  <path ${T} d="M${pt(x - 30 * s, y - 24 * s)}L${pt(x - 30 * s, y + 24 * s)}
               M${pt(x + 6 * s, y - 28 * s)}L${pt(x + 6 * s, y + 28 * s)}"/>
  <path ${F} d="M${pt(x + 66 * s, y)}L${pt(x + 96 * s, y - 22 * s)}L${pt(x + 96 * s, y + 22 * s)}Z"/>
  <rect ${D} x="${r1(x - 16 * s)}" y="${r1(y + 28 * s)}" width="${r1(32 * s)}" height="${r1(16 * s)}" rx="5"/>
  <path ${T} d="M${pt(x, y + 44 * s)}L${pt(x - 14 * s, y + 104 * s)}"/>
</g>`;
}

/* ---------- articulated: animatronic servo arm ---------- */
function animatronic(x, y) {
  return `
<g class="ex-servo">
  <rect ${D} x="${x - 26}" y="${y}" width="52" height="${GROUND - y}" rx="7"/>
  <circle ${F} cx="${x}" cy="${y}" r="16"/>
  ${spinAt(x, y, 'servo-arm',
      `<rect ${F} x="${x - 8}" y="${y - 92}" width="16" height="96" rx="7"/>` +
      `<circle ${R} cx="${x}" cy="${r1(y - 96)}" r="10"/>`)}
</g>`;
}

/* ---------- linear: pen plotter ---------- */
function plotter(x, y) {
  const w = 138;
  return `
<g class="ex-plotter">
  <rect ${P} x="${x}" y="${y}" width="${w}" height="16" rx="5"/>
  <rect ${S} x="${x}" y="${y}" width="${w}" height="16" rx="5" fill="none"/>
  <path ${S} d="M${pt(x + 14, y + 16)}L${pt(x + 14, GROUND)}M${pt(x + w - 14, y + 16)}L${pt(x + w - 14, GROUND)}"/>
  <path ${S} d="M${pt(x, y - 34)}L${pt(x + w, y - 34)}"/>
  <g class="plot-pen">
    <rect ${D} x="${x + w / 2 - 7}" y="${y - 42}" width="14" height="26" rx="4"/>
  </g>
  <path class="plot-ink" d="M${pt(x + 22, y - 4)}C${pt(x + 52, y - 22)} ${pt(x + 84, y + 4)} ${pt(x + w - 22, y - 14)}"/>
</g>`;
}

/* ---------- energy: wind turbine ---------- */
function turbine(x, base, s = 1) {
  const hubY = base - 300 * s;
  const blade = i => `<path ${F} d="M${pt(x, hubY)}L${pt(x - 13 * s, hubY - 8 * s)}L${pt(x - 6 * s, hubY - 122 * s)}L${pt(x + 9 * s, hubY - 116 * s)}Z"
                        transform="rotate(${i * 120} ${r1(x)} ${r1(hubY)})"/>`;
  return `
<g class="ex-turbine">
  <!-- A SOLID tapered mast, filled and outlined. As a hairline triangle the
       tower all but vanished and the rotor read as floating unattached. -->
  <path ${F} d="M${pt(x - 8 * s, hubY)}L${pt(x + 8 * s, hubY)}L${pt(x + 18 * s, base)}L${pt(x - 18 * s, base)}Z"/>
  <path ${S} d="M${pt(x - 8 * s, hubY)}L${pt(x + 8 * s, hubY)}L${pt(x + 18 * s, base)}L${pt(x - 18 * s, base)}Z"/>
  <!-- nacelle -->
  <rect ${D} x="${r1(x - 16 * s)}" y="${r1(hubY - 12 * s)}" width="${r1(36 * s)}" height="${r1(24 * s)}" rx="${r1(9 * s)}"/>
  ${spinAt(x, hubY, 'turbine-rotor',
      [0, 1, 2].map(blade).join('') +
      `<circle ${D} cx="${r1(x)}" cy="${r1(hubY)}" r="${r1(12 * s)}"/>`)}
</g>`;
}

/* ---------- energy: solar tracker ---------- */
function solar(x, y) {
  return `
<g class="ex-solar">
  <!-- A SOLID tapered mast and a base plate. As a hairline the post vanished
       under the hero scrim and the panel read as floating — the same failure
       the turbine tower had. -->
  <path ${F} d="M${pt(x - 9, y + 46)}L${pt(x + 9, y + 46)}L${pt(x + 17, GROUND)}L${pt(x - 17, GROUND)}Z"/>
  <path ${S} d="M${pt(x - 9, y + 46)}L${pt(x + 9, y + 46)}L${pt(x + 17, GROUND)}L${pt(x - 17, GROUND)}Z"/>
  <rect ${D} x="${r1(x - 34)}" y="${r1(GROUND - 18)}" width="68" height="18" rx="6"/>
  ${spinAt(x, y + 46, 'solar-panel',
      `<rect ${D} x="${x - 58}" y="${y}" width="116" height="46" rx="5"/>` +
      `<path ${T} d="M${pt(x - 20, y)}L${pt(x - 20, y + 46)}M${pt(x + 20, y)}L${pt(x + 20, y + 46)}M${pt(x - 58, y + 23)}L${pt(x + 58, y + 23)}"/>`)}
</g>`;
}

/* ---------- a soldering station, with rising smoke ---------- */
function solderStation(x, y) {
  return `
<g class="ex-solder">
  <rect ${D} x="${x}" y="${y}" width="72" height="34" rx="6"/>
  <circle class="led" cx="${x + 14}" cy="${y + 17}" r="5" style="--bdur:3s"/>
  <path ${S} d="M${pt(x + 46, y)}L${pt(x + 78, y - 26)}"/>
  <path class="smoke" d="M${pt(x + 80, y - 30)}C${pt(x + 92, y - 52)} ${pt(x + 68, y - 66)} ${pt(x + 84, y - 92)}"/>
</g>`;
}

module.exports = {
  printer3d, laserCutter, cncMill, conveyor, oscilloscope, ledMatrix,
  rover, drone, blimp, animatronic, plotter, turbine, solar, solderStation,
};
