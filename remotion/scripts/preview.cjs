/**
 * Standalone visual check for the generated scene.
 *
 * Strips the Vue wrapper off HeroScene.server.vue and drops the real
 * stylesheet next to it, so the composition can be looked at (and rasterised)
 * without booting Nuxt.
 *
 *   node scripts/preview.cjs && google-chrome-stable --headless --screenshot=...
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const vue = fs.readFileSync(path.join(ROOT, 'app/components/HeroScene.server.vue'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'app/assets/css/hero-scene.css'), 'utf8');

// Pull the <template> body and strip the Vue-only bindings.
let svg = vue.match(/<template>([\s\S]*)<\/template>/)[1]
  .replace(/\s*:class="[^"]*"/g, '')
  .trim();

// Tokens the scene references but which live in main.css.
const tokens = `:root{
  --color-ink:#292929; --color-cyan:#00AEEF; --color-red:#ED1C24;
  --color-red-cta:#C4121A; --color-white:#fff; --hero-dim:0.58;
}`;

const html = `<!doctype html><meta charset=utf-8>
<title>Hero scene preview</title>
<style>
${tokens}
html,body{margin:0;background:#EAEAEA}
.stage{position:relative;width:1440px;height:900px;overflow:hidden;background:#EAEAEA}
${css}
.hero-scene.is-ready .camera{}
.scrim{position:absolute;inset:0;background:
  radial-gradient(118% 88% at 50% 46%, rgba(0,0,0,0) 0%, rgba(0,0,0,.16) 62%, rgba(0,0,0,.30) 100%),
  rgba(0,0,0,var(--hero-dim));}
.type{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
  justify-content:center;color:#fff;font-family:system-ui,sans-serif;text-align:center}
.type h1{font-size:74px;margin:0;line-height:1.05}
.type p{opacity:.94;font-size:19px}
body.plain .scrim,body.plain .type{display:none}
</style>
<div class="stage hero-stage">${svg}</div>
<script>
  const stage = document.querySelector('.hero-stage');
  stage.classList.add('is-ready');
  // ?paused=1 exercises the real pause path: the class goes on the ANCESTOR,
  // exactly as NetHero.vue sets it, and the CSS has to reach the animated
  // descendants from there. Reported back through a data attribute so a
  // headless --dump-dom can assert on the actual playState.
  if (location.search.includes('paused')) stage.classList.add('is-paused');
  setTimeout(() => {
    const st = document.getAnimations().map(a => a.playState);
    const tally = st.reduce((m, s) => (m[s] = (m[s] || 0) + 1, m), {});
    document.documentElement.setAttribute('data-playstate', JSON.stringify(tally));
  }, 800);
  // ?t=<ms> pins every animation to an exact instant via the Web Animations
  // API. Chrome's --virtual-time-budget does NOT reliably drive CSS animation
  // clocks in headless, so loop verification uses this instead of wall time.
  // ?perf=1 samples real frame times while everything animates. Virtual time
  // must NOT be used for this -- it fakes the clock and reports a meaningless
  // frame rate.
  if (location.search.includes('perf')) {
    const t0 = performance.now(); const frames = []; let last = t0;
    const tick = now => {
      frames.push(now - last); last = now;
      if (now - t0 < 6000) requestAnimationFrame(tick);
      else {
        const f = frames.slice(8).sort((a, b) => a - b);
        const mean = f.reduce((s, x) => s + x, 0) / f.length;
        const q = v => f[Math.floor(f.length * v)];
        const payload = JSON.stringify({
          samples: f.length,
          fps: +(1000 / mean).toFixed(1),
          meanMs: +mean.toFixed(2),
          p50: +q(0.5).toFixed(2), p95: +q(0.95).toFixed(2),
          worst: +f[f.length - 1].toFixed(2),
          jankPct: +(100 * f.filter(x => x > 25).length / f.length).toFixed(1),
          animations: document.getAnimations().length,
        });
        document.documentElement.setAttribute('data-perf', payload);
        // Report over HTTP: --dump-dom fires before the sample window closes,
        // and --virtual-time-budget would fake the very clock being measured.
        fetch('/__perf?d=' + encodeURIComponent(payload)).catch(() => {});
      }
    };
    requestAnimationFrame(tick);
  }

  /**
   * ?contend=1 measures how much MAIN-THREAD time the animation actually costs.
   *
   * Frame-rate sampling in headless is useless for this: rAF is paced to
   * 16.67ms whether the work is cheap or ruinous, so it reports a flat 60fps
   * either way and says nothing about a mid-range phone. Instead this runs a
   * fixed synthetic workload with the scene ANIMATING and again with it PAUSED,
   * and compares. The ratio is the contention the animation imposes.
   */
  /**
   * ?contend=1 measures how much MAIN-THREAD time the animation costs, and
   * WHERE that cost is.
   *
   * Frame-rate sampling in headless is useless here: rAF is paced to 16.67ms
   * whether the work is cheap or ruinous, so it reports a flat 60fps either way
   * and says nothing about a mid-range phone. This instead runs a fixed
   * synthetic workload under several conditions and compares.
   *
   * The camera is broken out separately because it scales the ENTIRE scene --
   * a full-viewport transform over ~186k characters of path data every frame --
   * so it is the one animation whose cost is structurally different from the
   * rest.
   */
  if (location.search.includes('contend')) {
    const work = () => { let a = 0; for (let i = 0; i < 4e6; i++) a += Math.sqrt(i % 97); return a; };
    const median = n => {
      const ts = [];
      for (let i = 0; i < n; i++) { const s0 = performance.now(); work(); ts.push(performance.now() - s0); }
      ts.sort((x, y) => x - y); return ts[Math.floor(ts.length / 2)];
    };
    const style = document.createElement('style');
    document.head.appendChild(style);
    const setMode = css => { style.textContent = css; };

    setTimeout(() => {
      setMode('');                                             // everything runs
      const all = median(9);
      setMode('.hero-scene .camera{animation:none !important}'); // camera off only
      const noCam = median(9);
      setMode('.hero-scene *{animation:none !important}');
      const none = median(9);
      setMode('');
      const payload = JSON.stringify({
        animations: document.getAnimations().length,
        msAll: +all.toFixed(1),
        msNoCamera: +noCam.toFixed(1),
        msStatic: +none.toFixed(1),
        totalPct: +(100 * (all - none) / none).toFixed(1),
        cameraPct: +(100 * (all - noCam) / none).toFixed(1),
        everythingElsePct: +(100 * (noCam - none) / none).toFixed(1),
      });
      document.documentElement.setAttribute('data-contend', payload);
      fetch('/__contend?d=' + encodeURIComponent(payload)).catch(() => {});
    }, 1200);
  }

  const tParam = new URLSearchParams(location.search).get('t');
  if (tParam !== null) {
    const t = Number(tParam);
    document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; });
    document.documentElement.setAttribute('data-pinned', String(document.getAnimations().length));
  }
  if (location.search.includes('plain')) document.body.classList.add('plain');
  else {
    const s=document.createElement('div'); s.className='scrim';
    const t=document.createElement('div'); t.className='type';
    t.innerHTML='<h1>Every kind of maker.<br>Every kind of making.</h1><p>The Greatest Show (&amp; Tell) on Earth comes to Kerala.</p>';
    document.querySelector('.stage').append(s,t);
  }
</script>`;

const out = path.join(__dirname, '..', 'out', 'preview.html');
fs.writeFileSync(out, html);
console.log(out);
