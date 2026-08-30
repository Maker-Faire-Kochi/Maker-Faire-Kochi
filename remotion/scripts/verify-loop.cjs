/**
 * Prove the scene loops exactly.
 *
 * The old film could not: its first and last frames were 0.174 RMSE apart, so
 * it needed a 520ms crossfade to disguise the jump. Here every animation period
 * divides a 48s master cycle, so frame(0) and frame(48s) must be the SAME
 * image -- not merely a similar one.
 *
 * Animations are pinned with the Web Animations API rather than by advancing
 * wall time: --virtual-time-budget does not reliably drive CSS animation clocks
 * in headless Chrome, which makes it useless as evidence.
 *
 *   node scripts/verify-loop.cjs
 */
const {execFileSync} = require('child_process');
const path = require('path');
const fs = require('fs');

const CYCLE = 48000;
const base = 'file://' + path.join(__dirname, '..', 'out', 'preview.html') + '?plain';
const dir = path.join(__dirname, '..', 'out', 'loop');
fs.rmSync(dir, {recursive: true, force: true});
fs.mkdirSync(dir, {recursive: true});

function shoot(ms, name) {
  execFileSync('google-chrome-stable', [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--virtual-time-budget=1500', `--screenshot=${path.join(dir, name)}`,
    // MUST match .stage in preview.cjs (1440x900). It used to be 1200x675,
    // which captured only the top-left of the stage: the robot arm lands at
    // stage x 1177-1503 and the turbine beyond it, so the three arm joints and
    // the turbine rotor -- some of the largest motion in the scene -- were
    // never in the compared region at all. The loop was being proven over a
    // crop that excluded the machines most likely to break it.
    '--window-size=1440,900', `${base}&t=${ms}`,
  ], {stdio: 'ignore'});
}

function rmse(a, b) {
  try {
    execFileSync('magick', ['compare', '-metric', 'RMSE',
      path.join(dir, a), path.join(dir, b), 'null:'], {encoding: 'utf8'});
    return '0 (0)';
  } catch (e) {
    return (e.stderr || e.stdout || '').toString().trim();
  }
}

const samples = [0, CYCLE / 4, CYCLE / 2, (CYCLE * 3) / 4, CYCLE];
for (const t of samples) shoot(t, `t${t}.png`);

const norm = s => parseFloat((s.match(/\(([\d.]+)\)/) || [])[1] ?? 'NaN');

const loop = rmse('t0.png', `t${CYCLE}.png`);
console.log(`\nLOOP    frame(0) vs frame(${CYCLE / 1000}s) : ${loop}`);
console.log('        ^ must be 0 -- this is the loop closing exactly\n');
console.log('CONTROL (proves the scene is actually moving)');
for (const t of samples.slice(1, -1)) {
  console.log(`        frame(0) vs frame(${String(t / 1000).padStart(2)}s) : ${rmse('t0.png', `t${t}.png`)}`);
}

const v = norm(loop);
if (!(v === 0)) { console.error(`\nFAIL: loop does not close (${v})`); process.exitCode = 1; }
else console.log('\nPASS: the loop closes exactly.');
