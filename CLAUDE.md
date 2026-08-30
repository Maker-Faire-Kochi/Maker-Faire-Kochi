# Maker Faire Kochi 2027 — project notes

Nuxt 4 / Vue 3 single-page site. No test runner.

The hero is a **live inline SVG scene** built from Open Peeps (CC0) — there is no hero
video. See "The hero is a live vector scene" below before touching it.

## Run

```bash
npm install       # once
npm run dev       # http://localhost:3000
```

Production check:

```bash
npm run build
node .output/server/index.mjs      # PORT=3000 by default
```

## Design system invariants

These are **contrast requirements, not preferences**. Each was measured; changing one
silently breaks WCAG. Tokens live in `app/assets/css/main.css`.

| Token | Value | Rule |
|---|---|---|
| `--color-red` | `#ED1C24` | Logo and display type **≥24px only**. On white it is 4.38:1 — it clears the 3:1 large-text bar and nothing else. |
| `--color-red-cta` | `#C4121A` | **Every red fill sitting behind a label**, and any small red text on light. White on it is 6.09:1. |
| `--color-red-on-dark` | `#FF5A5F` | Red **text on ink/charcoal**. `--color-red` on ink is only 3.32:1. |
| `--color-cyan` | `#00AEEF` | **Structural only** on light grounds — fills, rules, icons. **Never text on white** (2.53:1, fails even the large-text floor). Fine as text on dark (5.75–6.52:1). |
| `--color-muted` | `#5A6169` | Secondary text **on light only** (6.27:1). |
| `--color-muted-on-dark` | `#A8AEB5` | Secondary text **on dark** (6.50:1). `--color-muted` on ink is 2.32:1. |

Common regression: "simplify" `--color-red-cta` back to `--color-red` on a button. That
drops the CTA to 4.38:1, which fails — a 14.4px bold label is **not** WCAG large text
(that needs 18.66px bold or 24px regular).

`--color-yellow` was **retired**. Do not reintroduce it; the palette is deliberately
two-accent (red + cyan), matching the makerfairerome.eu reference.

## Gotchas worth not rediscovering

### The hero is a live vector scene, not a video

`app/components/HeroScene.server.vue` is **generated** — never hand-edit it. Regenerate with:

```bash
cd remotion && npm run scene          # extract -> measure -> build
npm run scene:verify-loop             # must report 0.000 RMSE
npm run scene:contrast                # re-measure hero contrast
```

Source of truth: `remotion/scripts/` — `cast.cjs` (figure library), `scene/placement.cjs`
(seeded crowd generator — no promenade; see "No walking crowd"), `scene/gearTower.cjs`, `scene/booths.cjs`
(stalls and exhibits), `scene/machinery.cjs`, `scene/props.cjs`.

See the motion without a browser: `npm run scene:gif` writes `out/hero-loop.gif`.
Verify invariants: `npm run scene:check` (periods), `npm run scene:spacing` (no two figures
merge) and `npm run scene:verify-loop` (0.000 RMSE — re-run a failure before believing it, it
is intermittently flaky).
Debug ONE machine alone at a pinned instant: `node scripts/isolate.cjs robotArm 6000`.

**A t=0 screenshot and the loop test both PROVE NOTHING about pivots.** The loop test compares
`rotate(0)` with `rotate(360deg)`, and t=0 is the identity frame — so a part that swings wildly
about the wrong point looks perfect in both. Every one of the disconnection bugs below was
invisible at t=0 and passed the loop check. **Always render a mid-cycle frame** (t=6000, 19000)
and prefer `isolate.cjs`, which strips every other element so a stray fragment cannot be
mistaken for a neighbour's part.

**No walking crowd.** A Maker Faire is a show and tell: people stand at a stand and
demonstrate. Visitors walking past read as a street scene and pulled attention off the
exhibits. Aerial traffic (three drones and a blimp, at different heights and rhythms) carries
the sense of movement instead.

**Keep machines' working envelopes clear of figures.** The robot arm reaches ~500 units; with
a ladder and two figures crossing it, the linkage was visually chopped into fragments and its
gripper jaws looked like debris floating in mid-air.

The constraint is **vertical, not a blanket x cutoff** — an earlier `// No zone over x>1500`
comment cost the whole right third of the frame its people. For `robotArm(1772, 902, 0.9)`,
sweeping shoulder -9..11, elbow -14..18 and wrist -16..16 to their extremes, the leftmost point
is x=1509 at y=543 and the linkage's lowest pixel per column is:

| column | linkage bottom |
|---|---|
| x ≤ 1580 | y 571 |
| x 1580–1600 | y 585 |
| x 1600–1620 | y 596 |
| x 1620–1640 | y 612 |
| x 1640–1660 | y 626 |
| x > 1660 | **unmeasured — keep figures out** |

A figure is safe only where its **head top** stays above that bottom across the figure's whole
width. That is why the apron pair is **hand-placed** in `placement.cjs` with fixed heights: the
pooled comb deals rows in random order and cannot express "front must be leftmost".

It is a PAIR, not a trio — a third figure was covered by the easel, which paints after every
crowd row. Current members and their MEASURED clearances, under the bob (`--bob` lifts a figure,
so the animated head top is `feet - h - bob`, not `feet - h`):

| figure | x | h | animated head top | clearance |
|---|---|---|---|---|
| `st_arms` front | 1448 | 268 | y 627.2 | 56.2 |
| `st_blazer` back | 1480 | 176 | y 659.2 | 88.2 |

Two things about that table are load-bearing:
- **Head top is pose-independent, WIDTH is not.** `place()` maps each measured bbox to exactly
  `h` tall, so swapping a pose cannot change the head top — but it changes the width by the
  pose's `bbox.w / bbox.h`. `st_blazer` is 0.369, so at h=176 it is 65.0 wide and its right
  edge is 1512.5. The easel's ledge starts at **x=1518** (`art.cjs` draws it `cx0 - 6` wide by
  `cw + 12`), leaving 5.5 units. `st_point` at 0.493 would reach 1537.4 and was rejected for
  that reason. Re-check the right edge after ANY pose swap here.
- The two centres are only **32 units** apart, so they overlap in depth. Verified at t=6000 and
  t=19000 on a FULL-SCENE frame: the heads stay separate (they also sit 32 units apart
  vertically), so it reads as two people, not one two-headed shape. `isolate.cjs robotArm`
  cannot judge this — it strips away the very figures and easel whose overlap is in question.

Re-derive the table if the arm is moved, rescaled, or retimed.

**The scene was deliberately CUT DOWN to six machines. Do not "restore" the rest.**
It used to carry seventeen machines covering twelve machine classes, and this file used to
say that coverage "should stay complete". That is no longer true and the change was
intentional, made on the owner's instruction to reduce the scene's weight and visual load.
What survives, one per class:

| class | machine |
|---|---|
| textile | loom (left canopy) |
| additive | 3D printer |
| rotary | gear tower |
| articulated | robot arm |
| energy | wind turbine |
| aerial | drone |

plus two non-machine craft exhibits that carry no animation: the **pot shelf** (ceramic) and
the **easel** (drawing). Every machine still visibly runs.

DELETED, with their CSS: laser cutter, oscilloscope, LED matrix, pen plotter, rover,
animatronic servo, blimp, two extra drones, and the whole receding background row (second
turbine, conveyor, CNC mill, press, solar array). The builders for them still EXIST and are
still exported from `scene/tech.cjs` and `scene/props.cjs` — they are simply never called,
exactly like the unpooled `si_*` entries in `cast.cjs`, and an uncalled builder emits zero
bytes. That is a library, not dead wiring. (Contrast `placeWalker`, which IS a trap — see
"The walking machinery" below — because it is half-wired: re-adding a walker renders nothing
until an interpolation is also restored.)

**ONE ground line now.** The faded background row and its `bg()` helper are gone, along with
`BG_FEET` and the unused `at()` placement helper. `check-grounded.cjs` no longer lists 854 as
a support. If you re-add a receding row you are re-adding `bg()` too; the old fade floor was
about 0.6, because under the 0.58 scrim anything fainter simply is not there.

**A single-exhibit stand must have NO front row.** Exhibits paint after the back and mid rows
but BEFORE the front row, so a front-row visitor stands in front of whatever the stand is
showing. That was survivable when a stand carried two or three exhibits spread across its
width — one body could only cover one of them. With one exhibit per stand it hides the whole
thing: measured after the cut, the 3D printer was reduced to a flat panel behind a shoulder
and the pot shelf was about 60% covered. So `fab` and `ceramics` are `front: 0` and their
demonstrators are `mid`, which puts them BEHIND the bench where a demonstrator belongs.
Foreground scale comes from `craft`, `kinetic`, the apron pair and the wheelchair instead.

**Art was cut where it could not be read, not squeezed in.** A hand-drawn potter's wheel was
written and rewritten twice and still read as a lamp on a stool — a wheel head seen from the
side spins about a vertical axis and shows no motion, so all that mechanism bought nothing. It
was DELETED and replaced by a shelf of pots, which is legible at a glance. A kiln was planned
for the arm's apron and dropped: `PR.kiln(1652, …)` overlaps the robot's fixed base plate,
turntable and column, so paint order would only decide which one hid the other.

**The scene is composed as a FAIRE, not a tableau.** A rhythm of booths — craft, fabrication,
ceramics — each with a canopy, a sign and its own exhibit, with air
between them and visitors circulating in front. A crowd standing before machinery is a group
photo; stalls people move between is a faire. Keep that structure when adding anything.

- **It is a `.server.vue` on purpose.** The figure data is ~159KB of markup (was ~400KB
  before the pose pool was cut, and it is still the largest single thing on the page). A normal
  component would ship it in the SSR HTML *and* again in the client chunk as a compiled
  render function. It needs `experimental.componentIslands` in `nuxt.config.ts`. Verified:
  no client JS chunk contains the path data.
- **It sits in `app/components/`, not `app/components/hero/`.** Nuxt's `pathPrefix` would
  register it as `HeroHeroScene`, and server components must resolve via auto-import to get
  island treatment.
- **Figures are INSTANCED — with ONE documented exception.** Each unique Open Peeps person is
  emitted once into `<defs>`; the crowd is `<use href="#fig-…">`. The hand-drawn back-view
  visitors (`scene/backs.cjs`) are emitted INLINE instead: each is unique and used once, so
  `<use>` would save nothing, and they are ~2.6KB against ~25KB for a peep. This is a
  deliberate second convention, not an oversight — if back views ever repeat, instance them.
  12 instances cost what 6 figures cost, because only the poses actually placed are emitted. *Internal* `<use>` is
  universally supported — only external-file references are a portability problem (verified
  in Chrome; Safari's external-ref gap is why the whole scene is inline, not a sprite).
- **Gear periods are NOT written in CSS.** `gearTower.cjs` derives radius from tooth count
  (a shared module) and period from `teeth × 0.5s`, then emits `--dur` and `data-dir` inline.
  Meshed gears counter-rotate and their periods are proportional to tooth counts — hard-coding
  those in CSS guarantees the drawing and the motion eventually disagree.
- **Tooth counts are constrained to {12,16,24,32,48,96}** so every period (6/8/12/16/24/48s)
  divides the 48s master cycle. Pick 20 teeth and the loop stops closing.
- **Resize the gear tower with `MODULE_R`, NEVER with a wrapper `transform="scale()"`.** The
  tower's plinth, A-frame feet and cross-members are authored at ABSOLUTE y (806, 812, 822, 902);
  only the gear train is positioned by `wantCx`/`wantBase`. So a group scale shrinks the plinth
  too and lifts it off the ground — tried at 0.7, and `scene:grounded` correctly reported the
  tower floating 46 units above its nearest support. `MODULE_R` (scene units per tooth) shrinks
  the train in place and leaves the footing alone. It is safe because periods are
  `teeth × SEC_PER_TOOTH` and do not involve it, and centre distance stays exactly
  `rParent + rSelf` since both radii come from `radiusFor()`. It went 2.9 → **2.1**, which took
  the train from 587×619 to ~425×448 and dropped its top from y 81 to ~252, off the headline.
  What it does NOT scale: strut widths, the hub radius (clamped at 11, so the 12-tooth gear's
  spokes are now short), the plinth, and the governor — which is now larger than the `g4` it
  hangs off. All four were checked at t=6000 and t=19000 and still read as one machine, but they
  are fixed-size and will drift further if `MODULE_R` moves again.
- **The crowd is seeded, not hand-listed.** `SEED` in `placement.cjs` drives pose, height,
  mirroring and jitter. Deterministic on purpose: a scene that reshuffles every build is
  unreviewable and churns the committed output. Change `SEED` to reshuffle.
- **The pose POOL is five, and changing it RESHUFFLES THE WHOLE CROWD.** `POOL` in
  `placement.cjs` is an explicit list — `st_arms`, `st_pants`, `st_blazer`, `st_easing`,
  `st_point` — not "every `st_*` in cast.cjs" as it used to be. It was cut from twelve because
  `<defs>` was 83% of the generated component: one pose is 20–46KB of path data, and the whole
  scene body (every machine, booth and prop) is smaller than two of them. Kept for silhouette
  and for who they represent — Turban, Short, an older figure with grey hair and glasses,
  Hijab, and a pointing figure. `cast.cjs` deliberately keeps ALL its entries: it is the
  enumerated list of verified react-peeps keys and an unplaced entry emits nothing.

  **The trap:** the pool size changes how many values `shuffleDeck()` draws from the RNG, so
  editing `POOL` — or any zone count — reshuffles EVERY zone, including ones whose counts you
  did not touch. That silently moved a pooled figure to within **7 units** of a hand-placed
  back-view visitor, against a documented ≥31 requirement.

  **`npm run scene:spacing` now enforces this**, and it is wired into `npm run scene`. It is a
  guard the pipeline was missing: the placement comb enforces `MIN_SEPARATION` between POOLED
  figures inside a zone but knows nothing about the hand-placed ones (the ladder figure, the
  apron pair, the wheelchair, the single back-view visitor), and those are exactly the ones that
  break. `scene:grounded` only looks at machines, and a pose-identity check is blind to two
  DIFFERENT poses standing on top of each other — which the guard's own pair loop did **not**
  actually do until 2026-08-29: it tested `a.use === b.use`, so it only ever caught identical
  poses, exactly the blindness this paragraph claims it covers. The identity condition is gone;
  the 2D box now applies to every pair whatever poses they use. Proven with a negative test (a
  `st_arms` dropped on the wheelchair at dx=10, dy=0 now FAILs; it passed before).
  `BACKS` in `check-spacing.cjs` is **derived**
  from `INSTANCES.BACK_VIEWS` — the same array `build-scene.cjs` renders — so it cannot drift.
  (This entry used to claim the two were hand-synced lists; that was already false.) Contrast
  `scene:grounded`, which really does keep a hard-coded selector list and really does need the
  discipline.

  **The crowd is THIRTEEN, and the gaps are the point.** It was 19, and the complaint was that
  the hero looked crowded — but the machines were already cut to six and were never the cause.
  Measured: 19 figures spanned x 277–1480 with a mean neighbour gap of **67 units** and a largest
  gap of **122**, against a front-row figure ~99 units wide. The gaps were narrower than the
  people, so the crowd tiled the frame and the stalls behind it could not be read.

  The zones were not at fault. They leave real air (880→1030 is a deliberate 150-unit gap, and
  nothing is pooled past x=1270) — but **8 of the 19 were hand-placed outside the zone system**,
  and `BACK_VIEWS` aimed its figures at "the widest gaps in the crowd", which is precisely the air
  the zones exist to create. Three back views were dropped (x=890 and x=1010 plugged the 150-unit
  gap; x=1380 plugged the open right third) and one figure each came out of `fab`, `ceramics` and
  `kinetic`. Mean gap is now **100**, largest **157**. Do not re-add a figure "to fill that empty
  patch" — the empty patch is the design.

  The twin rule is **2D on purpose**. A bare x-distance test fails on a legitimate pair: the
  ladder `st_pants` at x=1096, y=660 and a pooled `st_pants` at x=1141, y≈874 are 45 apart in x
  but 214 apart in y. Exempting that one by name would be a fudge; the y term states the actual
  reason it is fine.
- **NO seated poses in the crowd.** Open Peeps' seated bodies (`HandsBackWB`, `ClosedLegWB`,
  `MediumWB`, `OneLegUpWB`, `Bike`, ...) carry a **solid dark lap/leg mass** and are drawn
  assuming a chair this scene never provides, so under the 0.58 scrim they read as a person
  perched on a black blob, not as someone sitting. Three overlapping at x 430–560 was
  unreadable mush. The `si_*` entries stay in `cast.cjs` — they are enumerated, verified
  react-peeps keys — but nothing pools them. `si_wheel` is the sole exception: the wheelchair
  carries its own visible support, so ONE is hand-placed at x=950 in the air between the
  electronics stand and the gear tower. It only reads where nothing overlaps it.
- **Randomness is real but resolved at BUILD time.** Four `rand()` sites drive pose dealing,
  x wobble, ground-line jitter, height, mirroring and row order — but `SEED` is a fixed
  literal, so every visitor sees the same scene and every rebuild reproduces it byte-for-byte.
  That is the point: the output is committed. Per-visitor variety would mean either running the
  generator at SSR time (killing HTML caching) or shipping ~400KB of path data plus placement
  logic in client JS, which is exactly what the server component exists to prevent. To
  reshuffle, change `SEED`.
- **Wobble is LARGE and the separation guarantee is enforced AFTERWARDS.** Capping the wobble
  to buy the guarantee is the trap: a 9-unit cap made spacing nearly even and gap spread
  (coefficient of variation) fell from 1.25 to 0.36 — a lineup, the exact thing the zones exist
  to prevent. The wobble is now ±45% of the comb gap and a two-pass relaxation opens any pair
  below `MIN_SEPARATION` (forward, then shift-back-and-reopen so the last figure cannot walk
  out of its zone). CV is 0.48 with a hard 24-unit floor. Do not "fix" crowding by shrinking
  `WOBBLE`; widen the zone or drop a row count and let the guard tell you.
- **A zone's figures share ONE comb, not per-row slots.** Rows carry different counts, so
  per-row slot centres coincide at arbitrary zone widths — that is what put two identical
  `st_point` figures **2 units apart**, one a ghost of the other. Replacing it with a
  per-row phase expressed as a FRACTION of the zone then failed the same way in narrow zones:
  the 96-unit robotics zone gave back and mid only 17 units and their heads merged into one
  two-headed shape. The comb makes spacing a property of the zone, so it cannot collapse
  however narrow the zone is. Rows are dealt onto it in seeded random order, because walking
  it back-to-front left-to-right reads as a diagonal rather than a group.
- **Poses are dealt from a shuffled DECK, not picked at random.** Uniform random *with
  replacement* is what produced the twin `st_point`. The deck uses every pose once before any
  repeats and guards the reshuffle boundary, so neighbours are never twins.
- **`used` in `build-scene.cjs` is SORTED.** `<defs>` order otherwise follows first
  encounter, so any reshuffle of the crowd reorders hundreds of KB of path data and buries the
  actual cast change in the diff.
- **Depth comes from `feet`, not height.** Varying only figure height put everyone on one
  ground line and read as a lineup. Back rows have feet *higher* on the canvas, plus an
  opacity fade.
- **Figure heights track the reference film's proportions** — an adult is ~22% of frame
  height, machinery ~60%. Drawing people larger buries the benches and tools behind bodies.
- **The walking machinery still EXISTS but is UNUSED — and it is not wired up.** No instance
  sets `row: 'walk'` (see "No walking crowd"), and `walkRow` in `build-scene.cjs` is built but
  never interpolated into the template, so re-adding a walker instance renders **nothing** until
  that interpolation is restored too. `placeWalker` and `rows.walk` are kept only because the
  three constraints below are expensive to rediscover: `.walker` traverses the full width in
  exactly one master cycle and is OFF-SCREEN at both ends, so the wrap is invisible and the 48s
  loop still closes; negative delays stagger them and half run `walk-left`; and the three nested
  nodes cannot be merged — `.walker` (traverse, and it must own NO transform attribute, since a
  CSS transform would replace it), `.stride` (step bounce, unscaled scene units), `.peep-at`
  (placement attribute). Horizontal position comes entirely from the animation, so the placement
  translate is x=0.
- **`${F}`, `${D}`, `${S}` etc. ARE class attributes**, not fill values. Writing
  `<rect class="belt-item" ${F} …>` emits two `class` attributes on one element; the Vue
  compiler rejects it outright with "Duplicate attribute". Merge them: `class="belt-item fill-cyan"`.
- **`bench(x, y, w)` — `y` is the TABLE TOP**, not the canopy. Passing a canopy Y leaves the
  bench floating in mid-air on 600-unit legs.
- **NEVER write ` -- ` inside an SVG comment.** This codebase uses a double hyphen as an em
  dash all through its prose, and every `<!-- -->` block in `build-scene.cjs` and the scene
  builders is EMITTED into the generated component. A double hyphen inside an XML comment is
  invalid, so the generated SVG could not be parsed by any strict consumer (librsvg, Sharp) —
  browsers and the Vue compiler tolerate it, which is exactly why it went unnoticed in 10
  comments. They are now real em dashes and `HeroScene.server.vue` parses as strict XML; keep
  it that way. Check with:
  `python3 -c "import xml.dom.minidom,re;s=open('app/components/HeroScene.server.vue').read();xml.dom.minidom.parseString(re.sub(r'xlink:','xl_',s[s.index('<svg'):s.rindex('</svg>')+6]))"`
- **A machine's CSS class is not always its own.** `.led` is emitted by the 3D printer AND the
  drone, not only by the LED matrix it is named after — so deleting the rule with the matrix
  would have greyed out the status lights on two surviving machines. The rule carries the red
  `fill` as well as the blink, so it is not merely a motion loss. Before deleting any rule
  during a cut, enumerate what every SURVIVING builder actually emits rather than trusting the
  class name:

  ```
  node -e 'const X=require("./scripts/scene/tech.cjs");
  const all=new Set();
  for (const m of X.printer3d(0,0).matchAll(/class="([^"]+)"/g))
    m[1].split(/\s+/).forEach(c => all.add(c));
  console.log([...all].sort().join(" "))'
  ```

- **`.arm-shoulder` and `.arm-elbow` were MISSING from both motion-suppression lists.** Only
  `.arm-wrist` was listed, so the robot arm's two largest joints kept swinging for
  `prefers-reduced-motion` and no-JS visitors. Fixed. There are **TWO** exhaustive lists in
  `hero-scene.css` — `.hero-stage:not(.is-ready) …` and the `@media (prefers-reduced-motion)`
  block — and they must stay in sync; an animated class missing from either is a silent
  accessibility hole, not a visual bug you would notice.

- **`scene:grounded` has a HARD-CODED selector list.** A new exhibit is not checked for
  floating until its class is added to `sel` in `check-grounded.cjs`. Three new craft exhibits
  were silently unchecked until this was noticed in review. Add new builders to `isolate.cjs`
  too — it is the only tool that shows a part with every neighbour stripped away.
- **A CSS `alternate` animation's real period is DOUBLE its declared duration.** The loom
  shuttle is `8s alternate`, i.e. 16s, and 48/16 = 3. `scene:check` knows this and doubles any
  `alternate` duration before testing it — but if you reason about it by eye, remember the
  factor of two. A one-way translate that resets would close at 48s and still visibly jump at
  every local reset; that is why the shuttle alternates rather than repeating.
- **The preview harness reads hero-scene.css as raw text, so it will NOT catch a CSS syntax
  error.** Only `npm run build` does. After any scripted edit to that file, check brace
  balance or just build.
- **`--paper` is the scene background colour.** Anything filled with it is INVISIBLE — this
  silently erased the sculpture plinth. `.fill-paper` is deliberately a slightly different
  tint (`#DFE2E4`) so solids read as objects rather than holes.
- **Exhibits paint AFTER the seated rows.** What a booth is showing is the point of the
  booth; drawing it in structure order hid every one of them behind a body.
- **Booth canopies sit at stall height** (roof ~y480), with signage above the roof peak.
  Higher and the posts read as stilts; on the valance, the sign lands exactly at head height.
- **Zones have deliberate gaps.** Spreading figures evenly across the full width left no clear
  ground and read as a wall. Density is not the same thing as no air.
- **A CSS `transform` REPLACES an SVG `transform` attribute** rather than composing with it.
  Each figure is therefore two nested groups: `.peep-at` carries placement as an attribute,
  `.peep` carries the animated bob. Collapsing them throws every figure to the origin at
  native scale. `.peep` is also deliberately OUTSIDE the scale: inside it, a 4px bob is
  multiplied by the figure scale (~0.11) and becomes 0.4 units of nothing.
- **There is NO pause control** — removed at the owner's request, along with its `.is-paused`
  CSS. `prefers-reduced-motion` is the only mechanism a *visitor* controls. (The scene also
  suspends itself off-screen — see "The scene suspends off-screen" below — but that is not a
  visitor-controlled mechanism and does not change this entry.) WCAG 2.2.2
  asks for an in-page mechanism for motion that auto-starts and runs past five seconds; that
  is a known, accepted gap. If one is ever restored it must re-list EVERY animated class by
  name, because `animation-play-state` is not inherited and pausing an ancestor pauses nothing.

- **MEASURED runtime cost (after the six-machine cut, 2026-08-29):** **42** running
  animations, down from 112. SVG elements 928 → 598 → **492**, path data 397k → 186k →
  **181k** chars (the last step is the 19→13 crowd cut).
  The earlier contention figures still stand and still say the same thing: main-thread
  contention was 2% / −7.3% / −1.6% / 4% across four runs at 112 animations — negative meaning
  the static run was SLOWER than the animating one, i.e. the cost already sat below the
  measurement floor. Everything except the camera measured 0%. Frame sampling reports 60fps,
  p95 16.7ms, 0% jank, but treat that as weak evidence: rAF is paced to 16.67ms in headless
  regardless of paint cost, so `?contend=1` is the real signal.

  **So the machine cut was NOT a frame-rate fix and must not be described as one.** It was
  asked for as one; the measurement says the animation cost was never the bottleneck. What it
  actually bought is payload and legibility (see the payload table below). Client JS for the
  scene stays 0 KB — verified again after the cut by grepping the built chunks for `fig-st_`
  and `peep-at`: no hits.
- **PERFORMANCE: the camera is the whole bill, and `will-change` on it is the whole fix.**
  Measured with `?contend=1` in the preview harness — a fixed synthetic workload timed with
  the scene animating vs static:

  | | main-thread contention |
  |---|---|
  | before | **8.8%** total (camera 10.5%; the other ~107 animations ≈ 0, i.e. noise) |
  | after `will-change: transform` on `.camera` | **0%**, within noise |

  The camera transforms the ENTIRE scene, forcing a full-viewport repaint of ~390k chars of
  path geometry every frame. Promoting that ONE group to a compositing layer makes it a
  composited transform instead. **Do not blanket-apply `will-change`** — 108 layers, each with
  its own texture, costs far more memory than it saves. Frame-rate sampling in headless is
  useless here (rAF is paced to 16.67ms regardless of paint cost); use the contention harness.
- **Pause/ready classes live on `.hero-stage` in `NetHero.vue`**, not on the scene — a server
  component cannot react to client state. The CSS crosses that boundary via descendant
  selectors in `assets/css/hero-scene.css`.
- **Animation is opted IN via `is-ready`**, which is now DERIVED from three conditions
  (`mounted && inViewport && !saveData`), not simply added on mount. Without it, no-JS
  visitors would get motion they cannot stop, which is exactly what WCAG 2.2.2 prohibits.
  See "The scene suspends off-screen" below before changing how it is computed — assigning
  it from any single input has already broken the Save-Data opt-out once.
- **NEVER rotate with a `--pivot` in viewBox coordinates. Use `spinAt()`.**
  `transform-box: view-box` makes `transform-origin: <x>px <y>px` resolve against the
  **viewBox origin**, not the element's local user space. That is fine for a part sitting
  directly in the scene and silently wrong for a part nested inside any translated or scaled
  group — it spins about a point far from its own hub and visibly flies off across the frame.
  This is what caused parts to appear "flying here and there" once the receding background
  row (`bg()`) was added. `spinAt(cx, cy, cls, inner)` in `scene/geometry.cjs` translates the
  pivot to the local origin and rotates about `0 0`, which has no such dependency and is
  correct in both cases. `.joint` only needs `transform-origin: 0 0`. The robot arm's
  shoulder/elbow/wrist use the same pattern.
- **A bare `rotate(deg)` in SVG pivots about the element's LOCAL ORIGIN, not the part.** The
  robot arm's forearm used `rotate(-30)`, which pivoted about the arm's base and flung the
  forearm, wrist and gripper across the frame as three apparently unrelated fragments. Always
  give a centre: `rotate(-30 0 -268)`.
- **Parts must physically ANCHOR into each other, not merely sit near.** The gripper jaws were
  authored 56 units above the wrist block and read as two loose diamonds floating beside the
  arm. Overlap the joint rather than abutting it.
- **Thin outlines vanish; structures need fills.** The wind turbine's tower was a hairline
  triangle, so the rotor looked like it was floating unattached. Filled + outlined now.
- **A translating pattern needs a LEADING element.** The conveyor's four items shifted by one
  gap per cycle, so the rightmost slid off the belt with nothing entering behind it. There are
  now five (one starting off-belt) plus a clip path over the belt run.
- **The camera push-in CROPS the frame edges.** At the peak of the zoom the surviving band is
  about x [64, 1901] — content outside it is cut, which is what made the outermost machines
  (robot arm, cheena vala) look severed. The numbers per zoom level are documented above
  `@keyframes hero-camera`; if you raise the zoom, move those two inboard to match.
- **Every animation period must divide the 48s master cycle** — `npm run scene:check` enforces
  it, and it is wired into `npm run scene`. This is trivially easy to break by eye: a rotor at
  `0.34s` looks identical to one at `0.32s`, but `48/0.34` is not an integer and the loop
  silently stops closing. That exact mistake was caught by the guard.
- **Every `react-peeps` prop value is an exact key.** A miss renders `undefined` as a
  component and throws React #130. Enumerate with `npm run scene:enumerate`.
  `ShortVolumed` and `ShavedSides` *are* real; `CurlyHighTop` is not.
- **Use `WB` pose variants, never `BW`.** `BW` fills the body solid ink; `WB` is outline
  line-art. Solid silhouettes are far too heavy behind white type at `--hero-dim: 0.58`.
- **Poses share no baseline.** Each carries its own internal `translate()` and the stock
  850x1200 viewBox crops at the thighs (real content is ~2930 units tall). `scene:measure`
  asks a browser for `getBBox()` and writes it to `out/figures/manifest.json`; placement
  reads that. Skipping it puts every figure in the wrong place.
- **The loop closes exactly.** Every period divides a 48s master cycle, so frame(0) and
  frame(48s) are the same image — measured at **0.000 RMSE**, against mid-cycle controls of
  0.237/0.268/0.237. This is what replaced the old film's 520ms crossfade. If you retime
  anything, keep it dividing 48s and re-run `scene:verify-loop`.
- **`verify-loop` used to prove the loop over a CROP that excluded the robot arm.** Its
  screenshot window was 1200x675 while `.stage` in `preview.cjs` is **1440x900**, so it
  captured only the stage's top-left. The arm lands at stage x 1177–1503 and the turbine
  beyond it, meaning the three arm joints and the turbine rotor — some of the largest motion in
  the scene — were never in the compared image. The window now matches the stage. If you change
  `.stage`, change `shoot()` in `verify-loop.cjs` to match or the guarantee quietly shrinks.
- **`verify-loop` is INTERMITTENTLY FLAKY. Re-run a failure before believing it.** It reported
  0.0206 RMSE once, then 0.000 on five consecutive runs with no source change in between, and a
  same-frame-twice control was byte-identical. A single FAIL is not evidence; a repeated one
  is. Diagnose a real failure by diffing computed animation state rather than pixels — pin the
  page at both instants and compare `getComputedStyle(el).transform` for every entry in
  `document.getAnimations()`. That distinguishes a genuine phase error from a render artifact
  in one step, and it found nothing wrong here.


### Measured payload, and where the bytes actually are

Re-measured 2026-08-29 after the six-machine cut **and the 19→13 crowd cut**, with
`npm run build` + `node .output/server/index.mjs`:

| | raw | gzip | brotli |
|---|---|---|---|
| SSR HTML (inline scene included) | **237.6 KB** (was 248, 483) | **84.7 KB** | **69.9 KB** |
| client JS (3 chunks) | 189 KB | 70 KB | — |
| entry CSS | 27 KB | 5.7 KB | — |

Where the saving came from, and it is worth knowing the ratio before optimising this scene
again — the generated component went 444.8 → 217.6 → **207.7 KB**:

| | original | after machine cut | after crowd cut |
|---|---|---|---|
| `<defs>` (unique Open Peeps figures) | 368.7 KB (13 poses) | 159.1 KB (6 poses) | **159.1 KB** (6 poses) |
| scene body (every machine, booth, prop, `<use>`) | 74.4 KB | 57.9 KB | **48.6 KB** |

Note what the third column does **not** move: cutting six people saved ~10 KB and left `<defs>`
untouched, because all six poses stay in use. Removing figures is a legibility lever, not a
payload one — the payload lever is still `POOL`.

**The crowd is the payload; the machines never were.** One pose (`si_wheel`, 46 KB) costs more
than every machine in the frame put together. Cutting eleven machines saved ~16 KB; cutting
seven poses saved ~210 KB. Any future "make the hero lighter" work should start at `POOL`.

- **The node server does NOT compress.** `curl -H 'Accept-Encoding: br'` returns the full
  237.6 KB. Compression is the host's job — the deploy target is Netlify/Vercel/Cloudflare,
  which all brotli HTML automatically, so no `h3-compression` dependency was added.
  **A bare-node deploy would be a silent 3.5x regression on the largest response.**
- `public/` went **13MB → 408KB**: every file in it was verified unreferenced by grepping
  each basename against `app/` + `nuxt.config.ts` (0 hits). All of `public/video/`,
  `hero.jpg`, `net-*`, `hero-scene-first.*` and four unused logo variants are gone.
  **Kept on purpose:** `hero-scene-still.*` (see Save-Data above). What survives is
  exactly the five files `app/` actually references, plus those three stills.
  Note what this did and did not buy: it shrank the **deploy**, not the page. No visitor
  was downloading any of it.
- Google Fonts asks for `Outfit:wght@400;500;600;700`. It used to ask for 300 and 800 as
  well, which nothing in `app/` has ever used. Check before adding a weight back.

### The scene suspends off-screen — and that is NOT a WCAG fix

`is-ready` on `.hero-stage` is **derived from three conditions** in `NetHero.vue`:

    ready = mounted && inViewport && !saveData

An earlier draft assigned it straight from the IntersectionObserver entry, which
**re-enabled the animation for Save-Data visitors** the moment the hero scrolled into
view. If you touch this, keep it derived — an observer must never be the sole input.

It toggles the *existing* `is-ready` class rather than adding a second one, so the
exhaustive selector list in `hero-scene.css` stays the single authority on what animates.
`animation-play-state` is not inherited, so a parallel mechanism means maintaining that
list twice, and the second copy will drift.

Measured: `top=112 away=0 back=112` running animations. `will-change` on `.camera` is
now released too, so no compositor texture is retained for a scene standing still.

**This does not close the WCAG 2.2.2 gap.** There is still no in-page pause control. The
visitor does not control the off-screen suspension, and scrolling back re-starts the
motion automatically, which is itself auto-starting motion. `prefers-reduced-motion`
remains the only real accommodation, and the missing control is still a known, accepted
gap. Do not let a future comment claim the observer fixed it.

**The animation cost was never the problem.** Style recalc measures 0.9–1.5ms per 1.6s
window animating vs 0.1ms paused — ~0.06% of the main thread. The synthetic-contention
harness in headless reports the workload running *twice as fast* with animations on,
which is nonsense and confirms the existing warning that headless cannot measure this.
The suspension is battery insurance on real hardware, not a fix for a measured
regression. Do not "optimise" this scene on headless numbers.

### The dates are the content — rank them that way

The date was the *smallest* text in the hero (12.8px/400 at 0.88 opacity) and sat
*underneath* four 52px numerals in the countdown. That is a hierarchy inversion: the
figure that changes every second dominated, and the fact the page exists to communicate
whispered. Both are fixed, and the ranking is the point — not the specific sizes.

- `.countdown-date` is deliberately **`--font-body` 700, not `--font-headline`**. Bungee
  wraps mid-date at 390px and reads shoutier than a date needs to be.
- **A date range needs TWO `<time>` elements.** `<time datetime="2027-01-26T09:00">26 – 27
  January 2027</time>` tells a parser the whole range happens at one instant. `EVENT` in
  `useCountdown.ts` carries `rangeStart`/`rangeEnd`, each with its own ISO date.
- **Event facts live in `EVENT`**, not in templates. They were typed separately into
  `MakerCountdown.vue` and `NetHero.vue`, which is how a date gets corrected in one and
  not the other. `nuxt.config.ts` keeps its own literals — head config is evaluated
  outside the app's module graph and cannot import from there.
- `Event` JSON-LD ships from `MakerCountdown.vue`. Until it did, the dates existed only
  as pixels: invisible to search results, link previews and calendar tools.
- **The event has an END.** `phase` is `upcoming | live | ended`, not a `started`
  boolean — with only a boolean the site said "The Faire is on. Come and see." every day
  from 26 Jan 2027 onward, forever. `started` survives as a derived alias. `tick()` stops
  the interval only at `ended`; stopping at `live` would strand the page mid-faire and it
  would never reach its own closing state. Verified at five simulated instants.
- **The hero date band uses a flat `rgba(0,0,0,.38)`, never `backdrop-filter`.** Blurring
  a 927-element animated SVG behind it is a real per-frame GPU cost and buys nothing the
  flat scrim does not already give.
- **A pill radius cannot hold a wrapped box.** Below 560px both the hero band and
  `.countdown-when` stack to one fact per line and drop their separator dot — left to
  wrap, the pill drew a lopsided stadium with the dot orphaned at the end of line one.
- **`@media (max-height: 560px)` is load-bearing**, not decoration: that is a laptop at
  200% zoom (1440x900 → 720x450). The taller date band pushed the CTAs under the fixed
  nav rail there until the stack was tightened.

### Emphasis is a rank, not a colour you like

The editorial statements — the DOMAIN thesis, "Why Kochi?", the About lead — were all set
at `--color-muted` or in saturated red, i.e. at the emphasis of a caption or at maximum
volume, with nothing in between. Ranking them is what makes them readable.

- `.domain-quote` (the thesis) is `--color-gray-800` at `clamp(1.15rem, 2vw, 1.45rem)`;
  the paragraph after it stays `--color-muted`. Two paragraphs at identical size and
  colour give the reader nothing to hold on to.
- `.lead-text` is ink with a red rule down its left edge, not three lines of saturated
  `--color-red-cta`. Red stays an accent *beside* the words, which is what the palette
  reserves it for.
- **Measure the grey, do not eyeball it.** `.domain-word` was `#AEB7C0` = **2.03:1**,
  under even the 3:1 large-text floor, while its own comment insisted it must stay
  readable. It is `#8D959D` = 3.04:1 now. A grey that *looks* recessive enough is exactly
  how the previous value got to 2.03. Contrast helper:
  `node` with the WCAG relative-luminance formula, not a vibe.
- `--color-gray-800` (#3A3F45) on white is **10.62:1**, not the ~9.4 an earlier note
  guessed.
- `.stat-yellow` was renamed `.stat-cyan-alt` — it painted cyan, and `--color-yellow` is
  retired.

### Still true regardless of the hero

- **The nav rail hides via `visualViewport`, not focus events.** Submitting the newsletter removes
  the focused button through `v-if`, and removing a focused element does not reliably fire
  `focusout` — focus-based hiding strands the site's only navigation off-screen.
- **`IntersectionObserver` `rootMargin` percentages resolve against WIDTH**, including top/bottom.
  `-40% 0px -60% 0px` is a negative-height root on a landscape viewport and never fires. Active
  section tracking uses a rAF-throttled scroll listener instead.
- **`viewport-fit=cover` must stay** in the viewport meta or every `env(safe-area-inset-*)`
  resolves to 0 and the rail collides with the iOS home indicator.
- **og:image is built from `useRequestURL()`** in `app.vue`, not hardcoded, so it stays correct on
  preview deploys and behind a CDN. Scrapers drop relative image URLs.
- **`app/components/hero/NetHero.vue` auto-imports as `HeroNetHero`** (Nuxt `pathPrefix`).
  `app.vue` imports it explicitly instead.

## Still open

- Real-device iOS pass: keyboard open, safe area, 200% zoom, forced-colors.
- LCP measurement on throttled 4G. The scene is inline SSR so it costs no extra request,
  but inline SVG is **not** an LCP candidate — the Bungee headline almost certainly is.
- Portrait crops to the middle ~500 scene units, which shows the bench crowd and the
  flywheel but loses the cheena vala. Acceptable, not ideal; a portrait-specific crop
  would need a second composition.
- **Save-Data visitors still download the whole scene.** `Save-Data` currently suppresses
  the *animation*, not the ~208KB of inline SVG — so the visitor who asked to save data
  saves none. The fix is a static-image hero for that request, which is why
  `public/img/hero-scene-still.{avif,webp,jpg}` was **kept** when the other orphans went
  (see below). Deleting those three forecloses it without re-rendering them.
- `remotion/src/PeepsTest.tsx` and its `<Composition>` in `Root.tsx` are the original
  feasibility probe and can go.
- Dark mode ("Night catch") is designed in `docs/net-hero-experience.md` but not built.

## Docs

- `docs/openpeeps-hero-plan.md` — the Open Peeps feasibility study this scene came from
- `docs/pill-nav-hero-plan.md` — the earlier build, incl. the original contrast audit
- `docs/net-hero-experience.md` — original hero concept and tokens
- `docs/net-film-remotion-plan.md` — how the superseded film was produced
