/**
 * Render the scene's motion to an animated GIF, purely so a human can SEE it.
 *
 * The scene animates in a browser; a screenshot cannot show that. This samples
 * the 48s master cycle at fixed instants using the same Web Animations pinning
 * as verify-loop.cjs, so the last frame is exactly the first frame.
 *
 *   node scripts/render-gif.cjs [frames] [cycleMs]
 */
const {execFileSync} = require('child_process');
const path = require('path');
const fs = require('fs');

const FRAMES = Number(process.argv[2] || 48);
const CYCLE = Number(process.argv[3] || 48000);
const W = 960, H = 600;

const base = 'file://' + path.join(__dirname, '..', 'out', 'preview.html') + '?plain';
const dir = path.join(__dirname, '..', 'out', 'anim');
fs.rmSync(dir, {recursive: true, force: true});
fs.mkdirSync(dir, {recursive: true});

for (let i = 0; i < FRAMES; i++) {
  const t = Math.round((CYCLE / FRAMES) * i);
  execFileSync('google-chrome-stable', [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--virtual-time-budget=1200',
    `--screenshot=${path.join(dir, `f${String(i).padStart(3, '0')}.png`)}`,
    `--window-size=${W},${H}`, `${base}&t=${t}`,
  ], {stdio: 'ignore'});
  if (i % 8 === 0) process.stdout.write(`  ${i}/${FRAMES}\r`);
}

const out = path.join(__dirname, '..', 'out', 'hero-loop.gif');
execFileSync('magick', ['-delay', '8', '-loop', '0',
  path.join(dir, 'f*.png'), '-layers', 'Optimize', out], {stdio: 'inherit'});

console.log(`\n${path.relative(process.cwd(), out)}  ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB  ${FRAMES} frames`);
