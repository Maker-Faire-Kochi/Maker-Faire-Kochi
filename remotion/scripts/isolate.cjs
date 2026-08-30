/**
 * Render ONE machine alone on a blank canvas, at a pinned instant.
 *
 * Debugging a machine inside the full scene is guesswork: anything that looks
 * detached might belong to a neighbour. This removes every other element so a
 * fragment either belongs to this machine or does not exist.
 *
 *   node scripts/isolate.cjs robotArm 6000
 */
const fs = require('fs');
const path = require('path');
const M = require('./scene/machinery.cjs');
const X = require('./scene/tech.cjs');
const A = require('./scene/art.cjs');
const {gearTower} = require('./scene/gearTower.cjs');

const which = process.argv[2] || 'robotArm';
const t = Number(process.argv[3] || 0);

const BUILDERS = {
  robotArm:    () => M.robotArm(960, 900, 1.3),
  gearTower:   () => gearTower(960, 700),
  drone:       () => X.drone(960, 500, 2.4),
  turbine:     () => X.turbine(960, 900, 1.7),
  printer3d:   () => X.printer3d(880, 620),
  loom:        () => `<g transform="translate(600 180) scale(2.2)">${A.loom(120, 320, 148, 200)}</g>`,
  easel:       () => `<g transform="translate(520 60) scale(2.4)">${A.easel(180, 330, 280)}</g>`,
  potShelf:    () => `<g transform="translate(500 260) scale(2.6)">${A.potShelf(120, 200)}</g>`,
};
if (!BUILDERS[which]) { console.error('choose: ' + Object.keys(BUILDERS).join(', ')); process.exit(1); }

const css = fs.readFileSync(path.join(__dirname, '..', '..', 'app/assets/css/hero-scene.css'), 'utf8');
const html = `<!doctype html><meta charset=utf-8>
<style>
:root{--color-ink:#292929;--color-cyan:#00AEEF;--color-red:#ED1C24;--color-red-cta:#C4121A;--color-white:#fff;}
html,body{margin:0;background:#fff}
.stage{width:1200px;height:760px}
${css}
/* every joint hub marked, so a detached part is obvious */
.mark{fill:none;stroke:#ff00aa;stroke-width:2}
</style>
<div class="stage hero-stage is-ready">
  <svg class="hero-scene" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax meet">
    <path class="ln ground" d="M0 900H1920"/>
    <!-- reference grid, so a drifting part is measurable not guessable -->
    <path class="ln thin" opacity="0.18" d="M960 0V1080M0 500H1920"/>
    ${BUILDERS[which]()}
  </svg>
</div>
<script>
  const t=new URLSearchParams(location.search).get('t');
  if(t!==null) document.getAnimations().forEach(a=>{a.pause();a.currentTime=Number(t)});
</script>`;
const out = path.join(__dirname, '..', 'out', 'isolate.html');
fs.writeFileSync(out, html);
console.log(out + '?t=' + t);
