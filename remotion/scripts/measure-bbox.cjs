/**
 * Measure each extracted figure's true bounding box.
 *
 * Necessary because every pose carries a different internal translate() and the
 * stock viewBox crops at the thighs, so figures share no common baseline. Real
 * geometry is only knowable from a layout engine, so this asks a browser for
 * getBBox() rather than trying to parse path data.
 *
 *   node scripts/measure-bbox.cjs      (requires google-chrome-stable)
 */
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const OUT = path.join(__dirname, '..', 'out', 'figures');
const manifest = JSON.parse(fs.readFileSync(path.join(OUT, 'manifest.json'), 'utf8'));

const page = `<!doctype html><meta charset=utf-8><body style="color:#292929">
${manifest.map(m => `<svg id="s_${m.id}" viewBox="0 0 850 1200"><g id="g_${m.id}">${
  fs.readFileSync(path.join(OUT, m.id + '.svg'), 'utf8')}</g></svg>`).join('\n')}
<script>
const out={};
${JSON.stringify(manifest.map(m => m.id))}.forEach(id=>{
  const b=document.getElementById('g_'+id).getBBox();
  out[id]={x:+b.x.toFixed(1),y:+b.y.toFixed(1),w:+b.width.toFixed(1),h:+b.height.toFixed(1)};
});
document.body.setAttribute('data-bbox', JSON.stringify(out));
</script></body>`;

const tmp = path.join(OUT, '_measure.html');
fs.writeFileSync(tmp, page);

const dom = execFileSync('google-chrome-stable',
  ['--headless', '--disable-gpu', '--no-sandbox', '--virtual-time-budget=3000',
   '--dump-dom', 'file://' + tmp], {encoding: 'utf8', maxBuffer: 1 << 28});

const match = dom.match(/data-bbox="([^"]*)"/);
if (!match) { console.error('No bbox measured -- did Chrome run?'); process.exit(1); }
const boxes = JSON.parse(match[1].replace(/&quot;/g, '"'));

for (const m of manifest) Object.assign(m, {bbox: boxes[m.id]});
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
fs.unlinkSync(tmp);

for (const m of manifest) {
  const b = m.bbox;
  console.log(`${m.id.padEnd(10)} x:${String(b.x).padStart(7)} y:${String(b.y).padStart(7)} w:${String(b.w).padStart(6)} h:${String(b.h).padStart(7)}  ${m.sitting ? 'sitting' : ''}`);
}
