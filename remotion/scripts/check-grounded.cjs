/**
 * Detect machines that float.
 *
 * Squinting at screenshots is unreliable and slow. This asks the browser for
 * each machine group's real bounding box and compares its BOTTOM edge with the
 * ground line. Anything that should stand on the ground but does not reach it
 * is reported with the exact gap.
 *
 *   node scripts/check-grounded.cjs
 */
const {execFileSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const GROUND = 902;
const TOL = 14;               // slack for stroke width / rounding

/**
 * Valid places a machine may rest. A thing is only "floating" if its bottom
 * edge sits near NONE of them:
 *   902  the main ground line
 *   776  bench top  (M.bench(376, 776, ...))  -- the 3D printer
 *   784  bench top  (M.bench(588, 784, ...))  -- the pot shelf
 * Derived from the build, so adding a bench means adding its top here.
 *
 * There is only ONE ground line now. The receding background row and its 854
 * line went with the machine cut; nothing is drawn at that height any more.
 */
const SUPPORTS = [GROUND, 776, 784];

// Things that are SUPPOSED to be airborne.
const FLIERS = ['bunting', 'ex-drone', 'ex-blimp', 'booth-sign', 'rig', 'counterweight', 'mesh'];

const html = fs.readFileSync(path.join(__dirname, '..', 'out', 'preview.html'), 'utf8')
  .replace(/<script>[\s\S]*$/, `<script>
const GROUND=${GROUND};
const stage=document.querySelector('.hero-stage');
stage.classList.add('is-ready');
// Pin to t=0 so the camera is at identity and cannot skew the measurement.
document.getAnimations().forEach(a=>{a.pause();a.currentTime=0});
const svg=document.querySelector('.hero-scene');
const sel='.booth,.ex-turbine,.ex-printer,.ex-loom,.ex-easel,.ex-pots,.tower,.robot,.bench,.ladder,.crates,.box,.bucket,.ex-drone,.bunting';
// Convert a screen rect into viewBox units via the inverse screen CTM. This is
// the only approach that survives arbitrary nesting of translate+scale; walking
// the transform attributes by hand misses translates and reports nonsense.
const inv=svg.getScreenCTM().inverse();
const toVB=(x,y)=>{const p=svg.createSVGPoint();p.x=x;p.y=y;return p.matrixTransform(inv);};
const out=[];
document.querySelectorAll(sel).forEach(el=>{
  const r=el.getBoundingClientRect();
  if(!r.height) return;
  const bl=toVB(r.left,r.bottom);
  out.push({cls:(el.getAttribute('class')||'').split(' ')[0], bottom:+bl.y.toFixed(1)});
});
document.documentElement.setAttribute('data-ground', JSON.stringify(out));
</script>`);

const tmp = path.join(__dirname, '..', 'out', '_ground.html');
fs.writeFileSync(tmp, html);
const dom = execFileSync('google-chrome-stable',
  ['--headless', '--disable-gpu', '--no-sandbox', '--virtual-time-budget=2500', '--dump-dom',
   '--window-size=1440,900', 'file://' + tmp],
  {encoding: 'utf8', maxBuffer: 1 << 28});

const m = dom.match(/data-ground="([^"]*)"/);
if (!m) { console.error('no measurement'); process.exit(1); }
const rows = JSON.parse(m[1].replace(/&quot;/g, '"'));

const grouped = {};
for (const r of rows) {
  const key = r.cls;
  (grouped[key] = grouped[key] || []).push(r);
}

console.log(`supports = ${SUPPORTS.join(', ')}   tolerance = ${TOL}\n`);
console.log('  group             n   bottom edge   rests on   verdict');
console.log('  ----------------  --  -----------   --------   -------');
let bad = 0;
for (const [cls, list] of Object.entries(grouped).sort()) {
  const deepest = Math.max(...list.map(r => r.bottom));
  const flier = FLIERS.some(f => cls.startsWith(f));
  const near = SUPPORTS.map(v => ({v, d: Math.abs(v - deepest)})).sort((a, b) => a.d - b.d)[0];
  let verdict, on = '—';
  if (flier) verdict = 'airborne by design';
  // Below the horizon = the near foreground plane, which is closer to the
  // viewer and therefore correct, not floating.
  else if (deepest > GROUND + TOL) { on = 'foreground'; verdict = 'resting (in front of the horizon)'; }
  else if (near.d <= TOL) { on = String(near.v); verdict = 'resting'; }
  else {
    const gap = (GROUND - deepest).toFixed(0);
    verdict = `FLOATING (nearest support ${near.v}, off by ${near.d.toFixed(0)})`;
    bad++;
  }
  console.log(`  ${cls.padEnd(16)}  ${String(list.length).padStart(2)}  ${deepest.toFixed(0).padStart(11)}   ${on.padStart(8)}   ${verdict}`);
}
console.log(bad ? `\n${bad} group(s) FLOATING` : '\nNothing floats: every machine rests on a real support.');
process.exitCode = bad ? 1 : 0;
