# Net Hero — Experience Spec

**Project:** Maker Faire Kochi 2027 — landing page redesign
**Status:** Direction agreed, not yet planned or built
**Date:** 2026-08-23
**Target component:** `app/components/hero/NetHero.vue` (new, beside existing `app/components/MakerHero.vue`)

---

## The concept

One coir thread, knotted by hand at the left edge of the screen, opening into a twenty-metre
cantilevered lift net cast over the harbour at the right — with Fort Kochi visible *through*
the mesh.

That single gesture is the whole festival: **a maker starts with one knot; a movement is what
happens when the knots hold.**

The net is the local emblem that carries it. The *cheena vala* (ചീനവല) arrived as foreign
technology around 1350 and was forked, patched and maintained locally for six centuries by the
people operating it. Nobody in Fort Kochi calls them Chinese any more. That is not a heritage
story — it is a maker story, and it is the strongest thing this site has that no other Maker
Faire has.

Supporting line if a thesis statement is needed anywhere on the page:

> **The world's longest-running open hardware project.**

---

## The experience, beat by beat

### 0.0s — The cast

Page opens on a single coir thread at the left edge, knotted tight. Then one movement: the net
is thrown. It unfurls left-to-right across the full viewport in ~900ms, opens over the water,
and settles with a real slack-rope wobble.

- Plays **once**. Skipped on repeat visits (store a flag).
- Skipped entirely under `prefers-reduced-motion`.
- Cheap enough to keep on mobile.

### 0.9s — The resting state

The whole viewport is the net, edge to edge. The story is readable in one glance because the
mesh changes as the eye travels:

| Left edge | → | Right edge |
|---|---|---|
| dense, tight, dark | | open, wide, translucent |
| hand-knotted, almost fabric | | hanging over the harbour |
| coir-coloured knots, 2px | | teal thread, 1px, low alpha |
| pinned, immovable | | slack, sagging, in water |

**The transition is the headline.** Type sits *inside* the mesh — behind the near threads, in
front of the far ones. That depth layering is what stops it reading as a background image.

### Behind the net — Fort Kochi

Thin line-art, low contrast, visible through the mesh: the cantilever A-frame and its
counterweight stones, the shoreline, the church spire, the palm line, a container crane at the
far right. This is how you actually see Fort Kochi from that beach — through a net.

### On pointer move — the hand

The mesh gathers toward the cursor like rope being lifted.

**The critical detail:** the knotted end resists and the cast end yields. Same interaction,
different response across the width of the page. Implemented as a force multiplier that scales
with the point's normalised x position (`0.10 + 0.42 * t`). This is what makes it a metaphor
rather than an effect, and it is the single biggest wow lever on the page.

### On scroll — the crank

Scrolling turns the winch.

1. The arm lowers; the net dips into the water.
2. It comes back up with **the catch** — not fish: a gear, a circuit board, a kite, a
   3D-printed bracket, a loom shuttle, a chai glass. Each is a category link.
3. As the net lifts, the Fort Kochi skyline is revealed clean behind it.

That reveal is the second wow beat.

### On CTA press — the stone drops

The primary CTA *is* the counterweight stone. Press it, the stone falls, the whole net lifts,
and the proposal form is what came up.

Nine lines of CSS, no JS:

```css
.stone { transition: transform 120ms cubic-bezier(.4,0,.6,1); }
.stone:active { transform: translateY(10px); }
.hero-net { transition: transform 420ms cubic-bezier(.2,.8,.2,1); }
.hero:has(.stone:active) .hero-net { transform: translateY(-28px); }
```

### At night — the lamps

They fish at night under kerosene lamps. Dark mode is not an inversion, it is a **different
scene**: warm light pooling on the water, knots catching it, skyline in silhouette.

Label the theme toggle **High tide / Night catch**.

---

## Where the wow actually comes from

The gap between "nice net" and "wow net" is entirely execution. Three specific things, in
priority order:

### 1. The feel of the rope — highest return

Verlet physics tuned by someone willing to spend **two full days** on damping, stiffness and
sag until it stops feeling like a spring mesh and starts feeling like wet coir. This is not a
feature to implement, it is a thing to tune.

### 2. The Fort Kochi drawing — commission it

Pay a real illustrator for the line-art skyline. If that drawing is generic, the whole hero is
generic; there is nowhere for it to hide. This is the one line item worth spending money on.

### 3. Type as strong as the net

A gorgeous net behind weak headlines reads as a tech demo.

- Lockup: `Make: കൊച്ചി` — Bungee + Anek Malayalam, **Malayalam at equal weight**, not a
  decorative echo under the English.
- If budget allows, commission a Kerala sign painter for brush-lettered section headers. Bus
  name-board lettering is a genuine vernacular type genre and it would make the site literally
  unrepeatable.

### The discipline

**One interaction, polished to death, beats five effects.** Ship cursor-on-mesh perfectly and
cut everything else. Every extra effect makes the page read more generated and less crafted.

---

## Design tokens

Extends the Make: brand rather than replacing it. Keep the red — it is the brand and should be
the only pure saturated hue on the page. Retire the cyan and yellow, which read as generic tech.

```css
:root {
  --color-red:      #EA002A;  /* Make: brand. CTAs only, one per screen */
  --color-teal:     #0E6B6B;  /* backwater. net lines, links, structure */
  --color-coir:     #B0762C;  /* rope, knots, badges. ornamental only */
  --color-laterite: #9E3B1C;  /* stencils, warnings */
  --color-dark:     #10201F;  /* ink — green-biased, not neutral grey */
  --color-light:    #E9EDE9;  /* sea mist — cool, not cream */
}
```

Dark theme (night catch): ground `#08110F`, surface `#0F1D1B`, ink `#E2EAE5`, teal `#48B7AC`,
coir `#D9A75C`, red lifted to `#FF3350`.

Neutrals are biased green, not grey — `#10201F` ink, `#C4CFC9` hairlines. A pure grey beside
teal reads as an accident; a green-biased grey reads as chosen.

**Discipline:** teal is structural, coir is ornamental, laterite is for stencils, red is for one
button per screen.

### Type

| Role | Face | Notes |
|---|---|---|
| Display | Bungee | already in the project. h1/h2 and one-line pull quotes only |
| Malayalam | Anek Malayalam 700 | variable width axis to optically match Bungee's density |
| Body | Outfit 350 | drop from the current 400 — at 350/1.62 it reads like a printed programme |
| Labels/data | Space Grotesk | uppercase, 0.14em tracking, `tabular-nums` |

**Malayalam rules:** never apply `letter-spacing` to Malayalam — it visually breaks conjuncts.
Add `[lang="ml"] { letter-spacing: normal; text-transform: none; }`. Mark it up with
`lang="ml"`. Give it ~0.15 more line-height than Latin at the same size. Subset the font by
`unicode-range`.

---

## Copy

Headline candidates:

- **First we knot it. Then we cast it.**
- Every net starts as one thread.
- Made by hand. Held by knots.

Supporting lines available for sections below the hero:

- Imported, forked, maintained locally for 600 years. We just call that making.
- Kochi has been open source since 1341.
- Nothing here was ever deleted.
- Repairability score: 10 / 10.

Micro-copy:

- Theme toggle: **High tide / Night catch**
- 404: **The net came up empty.**
- Form validation failure: a snapped strand; fixing the field re-knots it.

---

## Build path

Ordered so the wow never costs the audience.

1. **Token swap in `app/assets/css/main.css`** — palette + `@nuxt/fonts`. One commit, no new
   components, ~60% of the visual change. Keep `--color-cyan` / `--color-yellow` as aliases
   during migration.
2. **Fix the mobile nav.** `MakerHero.vue` currently has `.nav-links { display: none }` at
   ≤768px with nothing replacing it — there is no navigation at all on a phone.
3. **Static SVG net + counterweight CTA + cast animation.** No canvas, no physics. This alone
   already looks like a different site.
4. **Scroll reveals** via CSS scroll-driven animations behind `@supports (animation-timeline: view())`.
5. **Verlet canvas as progressive enhancement**, only if step 3 still feels flat.
6. The catch objects wired to category sections.

### Technical requirements

- **Static SVG is the LCP.** Never let `<canvas>` paint the largest element — it renders empty
  on first frame. Ship a settled net as inline SVG, hydrate the canvas over it on
  `requestIdleCallback`. Generate the SVG path data by running the sim once and dumping final
  point coordinates — do not hand-author it.
- **Verlet mesh** as `app/composables/useVerletNet.ts`. Capture rest lengths at init from
  initial point positions — that is what lets the mesh be dense at one end and open at the
  other from geometry alone, with no special-casing. Budget ~120 lines; if it passes 200 it is
  over-engineered.
- **Pause the RAF loop** with an `IntersectionObserver` when the hero scrolls off screen.
- **Clamp DPR to 2.** Cap grid density by CSS width, not `devicePixelRatio`.
- **Read colours from CSS custom properties at draw time**, re-read on
  `matchMedia('(prefers-color-scheme: dark)')` change and on `data-theme` mutation, so the
  canvas follows the theme toggle.
- **Ship behind a runtime flag** so it can be compared against `MakerHero.vue` on staging.

### Mobile

Below ~640px the phone version is **different, not degraded**:

- Settled SVG net, scroll reveal, no physics loop. Touch-drag on a 60-node mesh on a mid-range
  Android is not worth it.
- The cast animation still plays — it is cheap.

### Accessibility

- `prefers-reduced-motion` → settle the mesh, draw one frame, skip the cast, no RAF loop.
- The canvas carries a real `aria-label` describing the scene.
- Visible focus states; the counterweight CTA is a real `<button>`.
- Content must be fully readable with JS disabled (the static SVG path covers this).

### Performance budget

Under **150 kB JS**, LCP under **2s on throttled 4G, mid-range Android**. Test on an actual
device, not a laptop on office wifi — that is what the Kerala audience is on.

---

## Explicitly out of scope

Cut list, to protect the one interaction:

- Rain effects, ambient audio, custom knot cursor, twisting link underlines, page-load net-lowering
  *in addition to* the cast. Pick the cast and the cursor. That is all.
- Metaphor creep. Nets, boats, looms, spices, mirrors and tea shops on one landing page is a
  museum gift shop. Hero plus **three** motifs maximum; the rest go to the programme booklet,
  badges and stage backdrop.

## Traps

- **The tourism brochure.** The moment this looks like a Kerala Tourism ad it stops being about
  makers. Keep every motif at the level of *mechanism* — knots, joints, counterweights — never
  scenery.
- **Net as wallpaper.** If the mesh is just a background texture behind normal cards, a great
  idea has been spent on a pattern fill. The net must hold the layout, carry the catch, and
  respond to the hand.
- **"Chinese fishing nets" in the copy.** Locally they are ചീനവല / *cheena vala*, and the whole
  thesis is that they are Kochi's now. Use the Malayalam, gloss it once, move on.
- **English-first bilingualism.** If Malayalam only ever appears as a decorative echo, every
  reader can tell. Give it at least one place where it carries the primary message.

---

## Open questions

- [ ] Maker Faire brand guidelines — confirm with the licence contact what can be done around
      the wordmark, Make: red and Makey before commissioning any lettering.
- [ ] Illustrator for the Fort Kochi line-art skyline — who, and what budget.
- [ ] Malayalam review — every string needs a native reader's sign-off before ship. Script set
      by non-readers breaks in ways invisible to whoever set it.
- [ ] Sign painter for brush-lettered headers — nice-to-have, decide before type is finalised.

---

## References

**Tone and craft**
- [Playdate](https://play.date/) — a single physical gesture becoming a brand
- [Story of Playdate](https://blog.panic.com/the-story-of-playdate/) — build-log writing
- [Teenage Engineering](https://teenage.engineering/designs/playdate) — technical type, spec discipline

**Festival-scale interactive heroes**
- [KIKK Festival 2019](https://www.awwwards.com/sites/kikk-festival-2019) ·
  [2018](https://www.awwwards.com/sites/kikk-festival-2018) ·
  [2022](https://www.awwwards.com/sites/kikk-festival-2022) — Dogstudio, repeat Awwwards winners.
  Note: their audience is on MacBooks, ours is on mid-range Android. Do not copy their weight.

**Scroll pacing**
- [Numiko, best museum sites 2026](https://numiko.com/insights/best-museum-and-gallery-websites-2026) — Nordiska Museet scroll-zoom
- [Awwwards storytelling collection](https://www.awwwards.com/awwwards/collections/storytelling/)

**Technique**
- [Scroll-driven draw animation](https://garden.bradwoods.io/notes/svg/scroll-driven-draw-animation)
- [Scroll drawing, CSS-Tricks](https://css-tricks.com/scroll-drawing/)
- [Verlet rope and cloth in JS](https://github.com/aryamancodes/Rope-and-Cloth-Simulation)

**Subject and texture**
- [Chinese fishing nets, Fort Kochi](https://www.insightguides.com/inspire-me/blog/visual/chinese-fishing-nets-fort-kochi-kerala)
- [Cheena vala on Pinterest](https://www.pinterest.com/ideas/chinese-fishing-nets-kochi/906408851802/)
- [Technical drawing aesthetic on Pinterest](https://www.pinterest.com/ideas/technical-drawing-aesthetic/958499003346/)

**Local precedent**
- [Kochi-Muziris Biennale](https://www.kochimuzirisbiennale.org/)
- [KMB mixed-script branding](https://poojasaxena.wordpress.com/2016/08/27/kochi-muziris-biennales-mixed-script-branding/) — the model for the bilingual lockup
- [Gaatha craft archive](https://gaatha.org/) — how to document making respectfully
