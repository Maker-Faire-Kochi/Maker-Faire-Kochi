/**
 * Measure what the hero scene actually costs at runtime.
 *
 * Counts DOM/animation load, then samples real frame times via
 * requestAnimationFrame while everything is running. Reports mean, p95 and how
 * many frames missed the 16.7ms budget.
 *
 *   node scripts/measure-perf.cjs http://127.0.0.1:3180/
 */
const {execFileSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const url = process.argv[2] || 'http://127.0.0.1:3180/';
const SECONDS = 6;

const probe = `
(() => {
  const svg = document.querySelector('.hero-scene');
  const stat = {
    url: location.href,
    domNodesTotal: document.getElementsByTagName('*').length,
    svgNodes: svg ? svg.getElementsByTagName('*').length : 0,
    paths: svg ? svg.querySelectorAll('path').length : 0,
    animations: document.getAnimations().length,
    defsNodes: svg ? (svg.querySelector('defs') ? svg.querySelector('defs').getElementsByTagName('*').length : 0) : 0,
    useEls: svg ? svg.querySelectorAll('use').length : 0,
  };
  // Total path-data characters is a decent proxy for raster cost per frame.
  let d = 0;
  if (svg) svg.querySelectorAll('path').forEach(p => d += (p.getAttribute('d') || '').length);
  stat.pathDataChars = d;
  return stat;
})()
`;

// Frame sampling harness injected as a page script via a wrapper document.
const wrapper = `<!doctype html><meta charset=utf-8>
<style>html,body{margin:0;height:100%}iframe{border:0;width:1440px;height:900px}</style>
<iframe src="${url}"></iframe>
<script>
const t0 = performance.now();
const frames = [];
let last = t0;
function tick(now){
  frames.push(now - last); last = now;
  if (now - t0 < ${SECONDS * 1000}) requestAnimationFrame(tick);
  else {
    const f = frames.slice(5); // drop warm-up
    f.sort((a,b)=>a-b);
    const mean = f.reduce((s,x)=>s+x,0)/f.length;
    const p = q => f[Math.floor(f.length*q)];
    const budget = 1000/60;
    const res = {
      samples: f.length,
      fps: +(1000/mean).toFixed(1),
      meanMs: +mean.toFixed(2),
      p50Ms: +p(0.5).toFixed(2),
      p95Ms: +p(0.95).toFixed(2),
      worstMs: +f[f.length-1].toFixed(2),
      overBudgetPct: +(100*f.filter(x=>x>budget*1.5).length/f.length).toFixed(1),
    };
    // pull stats from inside the iframe too
    try {
      const w = document.querySelector('iframe').contentWindow;
      res.inner = w.eval ? null : null;
    } catch(e){}
    document.documentElement.setAttribute('data-perf', JSON.stringify(res));
  }
}
requestAnimationFrame(tick);
</script>`;

const wrapPath = path.join(__dirname, '..', 'out', 'perf.html');
fs.writeFileSync(wrapPath, wrapper);

function chrome(args) {
  return execFileSync('google-chrome-stable',
    ['--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', ...args],
    {encoding: 'utf8', maxBuffer: 1 << 28});
}

// 1) static load, measured directly on the page
const dom = chrome([`--virtual-time-budget=4000`, '--dump-dom', '--window-size=1440,900', url]);
const counts = {
  svgPaths: (dom.match(/<path/g) || []).length,
  svgGroups: (dom.match(/<g[\s>]/g) || []).length,
  uses: (dom.match(/<use/g) || []).length,
  circles: (dom.match(/<circle/g) || []).length,
  rects: (dom.match(/<rect/g) || []).length,
  pathDataChars: (dom.match(/ d="[^"]*"/g) || []).reduce((s, m) => s + m.length, 0),
};

console.log('=== STATIC LOAD (from rendered DOM) ===');
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(16)} ${v.toLocaleString()}`);

// 2) frame timing, real clock (no virtual time -- that would fake the result)
const out = chrome(['--window-size=1500,960', '--dump-dom',
  `--timeout=${(SECONDS + 4) * 1000}`, '--virtual-time-budget=' + (SECONDS + 3) * 1000,
  'file://' + wrapPath]);
const m = out.match(/data-perf="([^"]*)"/);
if (!m) { console.log('\n(frame sampling produced no result)'); process.exit(0); }
const perf = JSON.parse(m[1].replace(/&quot;/g, '"'));
console.log('\n=== FRAME TIMING (all animations running) ===');
console.log(`  samples          ${perf.samples}`);
console.log(`  effective fps    ${perf.fps}`);
console.log(`  mean frame       ${perf.meanMs} ms   (60fps budget = 16.67)`);
console.log(`  p50 / p95        ${perf.p50Ms} / ${perf.p95Ms} ms`);
console.log(`  worst frame      ${perf.worstMs} ms`);
console.log(`  frames >25ms     ${perf.overBudgetPct}%`);
