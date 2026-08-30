/**
 * Re-measure the hero's text contrast against the NEW artwork.
 *
 * The bands documented in main.css (ink at 0.00-0.15, white at 0.50-0.85) were
 * measured against the old AI film. Different art, different ground: those
 * numbers do not transfer, and CLAUDE.md treats them as measured requirements
 * rather than preferences. So they get measured again.
 *
 * Method: screenshot the scene with NO scrim, then composite each candidate
 * --hero-dim analytically (a black veil at alpha d takes a channel c to
 * c*(1-d)) and compute WCAG contrast for both candidate text colours over
 * every pixel the type actually covers.
 *
 *   node scripts/measure-contrast.cjs
 */
const {execFileSync} = require('child_process');
const path = require('path');

const url = 'file://' + path.join(__dirname, '..', 'out', 'preview.html') + '?plain&t=0';
const shot = path.join(__dirname, '..', 'out', 'contrast.png');

execFileSync('google-chrome-stable', [
  '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--virtual-time-budget=2500', `--screenshot=${shot}`,
  '--window-size=1440,900', url,
], {stdio: 'ignore'});

// The band the headline, subtitle, date line and buttons actually occupy.
const CROP = {w: 980, h: 470, x: 230, y: 195};
const txt = execFileSync('magick', [
  shot, '-crop', `${CROP.w}x${CROP.h}+${CROP.x}+${CROP.y}`,
  '-resize', '160x80!', 'txt:-',
], {encoding: 'utf8', maxBuffer: 1 << 26});

const px = [];
for (const line of txt.split('\n')) {
  const m = line.match(/#([0-9A-Fa-f]{6})/);
  if (m) px.push([parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)]);
}

const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const WHITE = lum([255, 255, 255]);
const INK = lum([0x29, 0x29, 0x29]);

const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.floor(s.length * p)]; };

console.log(`sampled ${px.length} pixels under the type\n`);
console.log('  dim   white:worst  white:p05   ink:worst   ink:p05');
console.log('  ----  -----------  ---------   ---------   -------');

for (const d of [0, 0.05, 0.10, 0.15, 0.20, 0.50, 0.58, 0.65, 0.72]) {
  const w = [], i = [];
  for (const p of px) {
    const L = lum(p.map(c => c * (1 - d)));
    w.push(ratio(WHITE, L));
    i.push(ratio(INK, L));
  }
  const f = n => n.toFixed(2).padStart(9);
  const flag = (worst, need = 4.5) => (worst >= need ? ' ' : '!');
  console.log(`  ${d.toFixed(2)} ${f(Math.min(...w))}${flag(Math.min(...w))} ${f(pct(w, 0.05))}  ${f(Math.min(...i))}${flag(Math.min(...i))} ${f(pct(i, 0.05))}`);
}
console.log('\n  ! = worst-case pixel falls below the 4.5:1 body-text floor');
