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

/** Round every coordinate in extracted peep markup to an integer. Figures are
 *  mapped to about 250 scene units tall from a roughly 2930-unit native space,
 *  so a half-unit rounding error lands at about 0.045 scene units. Measured
 *  saving: 46.8 KB off the generated component (207.7 KB down to 160.9 KB), at
 *  RMSE 0.0037 measured against visibly-different control frames of 0.228 to
 *  0.257.
 *
 *  This applies ONLY to extracted peep markup. Machine geometry lives in
 *  1920x1080 scene space where one unit IS visible on screen, and it is rounded
 *  separately by r1() in scene/geometry.cjs. Do not generalise this helper to
 *  machine geometry.
 *
 *  Audit: across all 34 extracted figures the only attributes carrying decimal
 *  numbers are d and transform, and every transform is a pure translate().
 *  There is no scale() factor that integer rounding could collapse to zero, and
 *  no fractional stroke-width. */
const roundInt = s => s.replace(/-?\d+\.\d+/g, m => String(Math.round(parseFloat(m))));

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
  const inner = roundInt(markup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, ''));
  fs.writeFileSync(path.join(OUT, `${c.id}.svg`), inner);
  manifest.push({id: c.id, bytes: inner.length});
  console.log(`${c.id.padEnd(10)} ${String(inner.length).padStart(6)} bytes  ${c.body}`);
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`\n${manifest.length}/${CAST.length} figures -> ${path.relative(process.cwd(), OUT)}`);
