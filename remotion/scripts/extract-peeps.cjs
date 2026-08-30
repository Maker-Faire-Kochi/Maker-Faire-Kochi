/**
 * Build-time extraction of Open Peeps figures to static SVG fragments.
 *
 * React is an AUTHORING dependency only. This script runs by hand, commits its
 * output, and nothing React-shaped ever reaches the browser or the Nuxt build.
 *
 *   node scripts/extract-peeps.cjs
 *
 * Two things make this less trivial than "render and save":
 *
 * 1. react-peeps is CommonJS. `import Peep from 'react-peeps'` resolves to
 *    undefined and throws React #130; the component hangs off `.default`.
 * 2. Every pose carries its OWN internal translate() -- '-276 479' for one,
 *    '-300 499' for another -- and the stock 850x1200 viewBox crops at the
 *    thighs. Figures therefore do not share a baseline out of the box. The
 *    real bounding box is measured in a browser (scripts/measure-bbox.cjs)
 *    and written alongside each fragment so the scene can stand them all on
 *    one ground line.
 */
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const fs = require('fs');
const path = require('path');
const RP = require('react-peeps');
const CAST = require('./cast.cjs');

const Peep = RP.default;
const OUT = path.join(__dirname, '..', 'out', 'figures');

/** Round every coordinate to 1dp. The viewBox is 850x1200 and figures display
 *  200-400px tall, so 1dp is comfortably sub-pixel at any DPR -- and it cuts
 *  the path data by roughly a third. */
const round1 = s => s.replace(/-?\d+\.\d+/g, m => String(Math.round(parseFloat(m) * 10) / 10));

fs.mkdirSync(OUT, {recursive: true});

const manifest = [];
for (const c of CAST) {
  let markup;
  try {
    markup = renderToStaticMarkup(
      React.createElement(Peep, {
        body: c.body,
        face: c.face,
        hair: c.hair,
        accessory: c.accessory || 'None',
        facialHair: c.facialHair || 'None',
        strokeColor: 'var(--peep-ink)',
        backgroundColor: 'var(--peep-body)',
      })
    );
  } catch (e) {
    console.error(`FAIL ${c.id} (${c.body}/${c.face}/${c.hair}): ${e.message.split('\n')[0]}`);
    process.exitCode = 1;
    continue;
  }

  // Keep only the inner content; the scene supplies its own root <svg>.
  const inner = round1(markup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, ''));
  fs.writeFileSync(path.join(OUT, `${c.id}.svg`), inner);
  manifest.push({id: c.id, bytes: inner.length});
  console.log(`${c.id.padEnd(10)} ${String(inner.length).padStart(6)} bytes  ${c.body}`);
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`\n${manifest.length}/${CAST.length} figures -> ${path.relative(process.cwd(), OUT)}`);
