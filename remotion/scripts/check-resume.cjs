/**
 * Guard: the off-screen suspension must PRESERVE PHASE, not restart the scene.
 *
 *   node scripts/check-resume.cjs          # the shipped behaviour, must PASS
 *   node scripts/check-resume.cjs legacy   # the pre-fix behaviour, must FAIL
 *
 *
 * The bug: `animation: none` REMOVES an animation, and a re-added CSS animation
 * starts at t=0 -- so scrolling back to the hero replayed the camera push-in
 * from the beginning and snapped every gear to its start.
 *
 * This toggles the class the IntersectionObserver toggles (the mechanism under
 * test) and reads real animation clocks:
 *
 *   running      -> record currentTime
 *   is-offscreen -> currentTime must FREEZE
 *   back on      -> currentTime must RESUME from the frozen value, not 0
 *
 * Two harness rules, both learned from this repo's own notes:
 *  - NO --virtual-time-budget. It fakes the clock being measured, which is why
 *    preview.cjs reports perf over HTTP instead of --dump-dom.
 *  - Reduced motion must be OFF: the media block carries
 *    `animation: none !important`, which wins and leaves nothing to measure.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const {spawn} = require('child_process');

const REPO = path.join(__dirname, '..', '..');

// Which class the suspension toggles. `is-offscreen` is the fix under test;
// `is-ready` reproduces what the code did BEFORE the fix, so the same harness
// can demonstrate the defect as well as its absence.
const TOGGLE = process.argv[2] === 'legacy' ? 'is-ready' : 'is-offscreen';
const LEGACY = TOGGLE === 'is-ready';
const vue = fs.readFileSync(path.join(REPO, 'app/components/HeroScene.server.vue'), 'utf8');
const css = fs.readFileSync(path.join(REPO, 'app/assets/css/hero-scene.css'), 'utf8');

/**
 * Headless Chrome reports prefers-reduced-motion: reduce and no CLI flag
 * overrides it, so the media block's `animation: none !important` would win and
 * leave nothing to measure. That block is ORTHOGONAL to what is under test
 * here -- it correctly disables all motion, and it still wins in a real browser
 * -- so the test strips it and measures the normal-motion path it cannot
 * otherwise reach. Removing it is what makes this test possible, not what makes
 * it pass: the off-screen rule is left exactly as authored.
 */
function stripReducedMotion(text) {
  const at = text.indexOf('@media (prefers-reduced-motion');
  if (at < 0) throw new Error('reduced-motion block not found -- did the CSS change?');
  let depth = 0, i = text.indexOf('{', at);
  for (let j = i; j < text.length; j++) {
    if (text[j] === '{') depth++;
    else if (text[j] === '}' && --depth === 0) return text.slice(0, at) + text.slice(j + 1);
  }
  throw new Error('unbalanced braces in reduced-motion block');
}

const svg = vue.match(/<template>([\s\S]*)<\/template>/)[1]
  .replace(/\s*:class="[^"]*"/g, '').trim();

const page = `<!doctype html><meta charset=utf-8><title>scroll-restart test</title>
<style>
:root{--color-ink:#292929;--color-cyan:#00AEEF;--color-red:#ED1C24;
--color-red-cta:#C4121A;--color-white:#fff;--hero-dim:0.58;}
html,body{margin:0;background:#EAEAEA}
.stage{position:relative;width:1440px;height:900px;overflow:hidden;background:#EAEAEA}
${stripReducedMotion(css)}
</style>
<div class="stage hero-stage is-ready" id="stage">${svg}</div>
<script>
const stage = document.getElementById('stage');
const LEGACY = ${LEGACY};
const TOGGLE = '${TOGGLE}';
const camEl = () => document.querySelector('.camera');
const camAnim = () => document.getAnimations().find(a => a.effect && a.effect.target === camEl());
const ct = () => { const a = camAnim(); return a && a.currentTime != null ? Math.round(a.currentTime) : null; };
const ps = () => { const e = camEl(); return e ? getComputedStyle(e).animationPlayState : null; };

const send = r => fetch('/__result?d=' + encodeURIComponent(JSON.stringify(r))).catch(()=>{});
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  await wait(700);
  const total = document.getAnimations().length;
  const beforeMs = ct(), playStateOn = ps();

  stage.classList[LEGACY ? 'remove' : 'add'](TOGGLE);
  await wait(350);
  const frozenA = ct(), playStateOff = ps();
  await wait(650);
  const frozenB = ct();

  stage.classList[LEGACY ? 'add' : 'remove'](TOGGLE);
  await wait(500);
  const resumedMs = ct(), playStateBack = ps();

  send({
    total, beforeMs, playStateOn, frozenA, frozenB, playStateOff,
    resumedMs, playStateBack,
    FROZEN: frozenA !== null && frozenA === frozenB,
    RESUMED_FROM_FROZEN: resumedMs !== null && frozenB !== null && resumedMs >= frozenB,
    NOT_RESET_TO_ZERO: resumedMs !== null && frozenB !== null && resumedMs > frozenB / 2,
  });
})();
</script>`;

let done;
const finished = new Promise(r => { done = r; });

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/__result')) {
    res.end('ok');
    done(JSON.parse(decodeURIComponent(req.url.split('d=')[1])));
    return;
  }
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(page);
});

server.listen(0, async () => {
  const port = server.address().port;
  const chrome = spawn('google-chrome-stable', [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
    '--force-prefers-reduced-motion=no-preference',
    '--window-size=1440,900',
    `http://localhost:${port}/`,
  ], {stdio: 'ignore'});

  const timer = setTimeout(() => done(null), 20000);
  const r = await finished;
  clearTimeout(timer);
  chrome.kill();
  server.close();

  if (!r) { console.error('  no result -- browser produced nothing'); process.exit(1); }

  console.log(`\n  mode: ${LEGACY ? 'LEGACY (toggles is-ready, the pre-fix behaviour)' : 'FIXED (toggles is-offscreen)'}`);
  console.log(`  ${r.total} running animations; camera clock in ms`);
  console.log('');
  console.log('    on screen                ', String(r.beforeMs).padStart(6), ' play-state:', r.playStateOn);
  console.log('    off screen, read 1       ', String(r.frozenA).padStart(6), ' play-state:', r.playStateOff);
  console.log('    off screen, read 2       ', String(r.frozenB).padStart(6), ' (650ms later)');
  console.log('    back on screen           ', String(r.resumedMs).padStart(6), ' play-state:', r.playStateBack);
  console.log('');

  const checks = [
    ['clock FREEZES while off-screen', r.FROZEN],
    ['clock RESUMES from the frozen value', r.RESUMED_FROM_FROZEN],
    ['clock does NOT restart at zero', r.NOT_RESET_TO_ZERO],
  ];
  let bad = 0;
  for (const [label, ok] of checks) {
    console.log('    ' + (ok ? 'PASS' : 'FAIL') + '  ' + label);
    if (!ok) bad++;
  }
  console.log('');
  process.exit(bad ? 1 : 0);
});
