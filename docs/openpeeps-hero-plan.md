# Hero Scene from Scratch — Remotion + Open Peeps

**Status:** Feasibility proven, not planned in detail or approved
**Date:** 2026-08-27
**Supersedes nothing.** Sits alongside `docs/net-film-remotion-plan.md`, which covered
re-rendering the *old* net film. This is about building the **current crowd scene** as vector art.

---

## Why do this at all

Three problems with the present hero, all solved by the same move.

| Problem today | Vector rebuild |
|---|---|
| Source is **1280×720**. Stretched 1.5× on a 1920 display, 2.0× at 2560, 3.0× at 4K. Measured — no higher-res original exists. | SVG has no native resolution. Render 1080p, 1440p, 4K from the same source. |
| AI-generated footage; training provenance not documentable. The site carries a **licensed trademark**. | Open Peeps is CC0, `react-peeps` is MIT. Both auditable. |
| First and last frame are **0.174 RMSE** apart, so it needs a 520ms crossfade to hide a jump. | Author a **genuinely cyclical** loop — frame 0 *is* frame 240. Native `loop`, and ~60 lines of crossfade machinery gets deleted. |

A fourth, smaller: flat vector art compresses far better than AI video with paper grain. The
current webm needed denoise + crf 50 to reach 1.1MB. Clean vector should land well under that.

---

## What is already proven

Not theory — this was run. `remotion/src/PeepsTest.tsx` renders, output at `remotion/out/peeps-test.png`.

- **Open Peeps renders inside Remotion.** Remotion 4.0.517, React 19.2.0.
- **It recolours to the brand palette.** The teal figures in the probe are a CSS `filter` over the
  stock black line art, and they sit naturally beside the existing teal/red-on-paper look.
- **Licensing:** `react-peeps@0.1.10` is **MIT** (read from its `package.json`). Open Peeps itself is
  documented as CC0 — *confirm before ship*, see Open questions.

### Two gotchas already hit, recorded so nobody re-hits them

1. **CJS interop.** `import Peep from 'react-peeps'` yields `undefined` and throws React error #130.
   The component hangs off the namespace object:
   ```ts
   import * as ReactPeeps from 'react-peeps'
   const Peep = (ReactPeeps as any).default as FC<any>
   ```
2. **Prop values are exact keys, and a miss also throws #130** (it renders `undefined` as a
   component). Enumerate before using:
   ```js
   Object.keys(require('react-peeps').Hair)
   ```
   `ShortVolumed`, `CurlyHighTop`, `ShavedSides` are **not** real keys. `Afro`, `Bun`, `Long`,
   `FlatTop`, `Medium`, `Bald` are.

---

## The constraint that shapes everything

Enumerated from the installed package:

| Group | Variants |
|---|---|
| `StandingPose` | 26 — BlazerBW, CrossedArms, Easing, PointingFinger, Resting, RoboDance… |
| `SittingPose` | 11 — Bike, ClosedLeg, CrossedLegs, HandsBack, MediumBW, OneLegUp, WheelChair |
| `BustPose` | 28 — Shirt, Hoodie, Coffee, Device, ArmsCrossed, Explaining… |
| `Face` / `Hair` / `FacialHair` / `Accessories` | 33 / 51 / 17 / 10 |

**Not one pose is making anything.** No hammering, sawing, knotting, soldering, or bending over a
bench. In the probe render the figures are standing with arms crossed, holding a phone, holding
coffee. For a *Maker* Faire that is precisely the missing piece.

**And Open Peeps contains no objects at all.** The *cheena vala*, gear wheel, robot arm, workbenches,
vices, tools, rope and crates are all hand-authored SVG. In the current scene that machinery is
roughly 70% of what is on screen.

So: **the people are the cheap 30%. The making is the expensive 70%.** Any plan that forgets this
will look finished at 30% and stall.

---

## Approach — "peeps as visitors, machinery drawn"

Chosen over the alternatives because it plays to the library's actual strength instead of fighting
it: a **crowd attending a faire** is exactly what 26 standing poses do well.

The scene reads left to right, matching the current footage:

```
  cheena vala + net        workbenches + makers          gear machine + robot arm
  ├─ hand-drawn rig        ├─ hand-drawn benches         ├─ hand-drawn flywheel
  ├─ hand-drawn net mesh   ├─ hand-drawn tools           ├─ hand-drawn arm
  └─ 1–2 custom-arm peeps  ├─ 2–3 custom-arm peeps       └─ 2–3 stock peeps
                           └─ 4–6 stock peeps watching        (watching, pointing)
```

Stock peeps do the watching, pointing, talking, carrying. **A small number of custom-arm figures do
the actual making** — the load-bearing few, not every figure.

### Custom arms, concretely

Open Peeps parts are separate components, so a working arm is authored as its own SVG layer
positioned over a standard body. Budget **4–6 arm sets** total, reused across the crowd:

`knotting` · `hammering` · `holding-tool` · `reaching-up` · `pushing` · `carrying`

Draw them once at the library's stroke weight and they compose with any body/head/hair combination.
This is the single highest-value piece of custom art in the project.

---

## Files

```
remotion/src/
  scene/
    Scene.tsx            composition root; camera, ground, ordering
    palette.ts           tokens mirrored from app/assets/css/main.css
    cast.ts              seeded roster: body/face/hair/accessory/arms per figure
    Peep.tsx             wrapper: CJS interop, recolour, optional custom arms
    arms/                6 hand-authored arm SVGs
    props/
      CheenaVala.tsx     rig, pulleys, counterweight stones
      NetMesh.tsx        parametric mesh (generated, not hand-plotted)
      Workbench.tsx      bench, vice, scattered tools
      Flywheel.tsx       gear train — the loop's timing anchor
      RobotArm.tsx       jointed arm
      Clutter.tsx        crates, spools, rope, cable
```

`cast.ts` is seeded and deterministic — a random roster would change every render and make review
impossible.

**Palette must be mirrored, not re-picked.** Same values as `main.css`: ink `#292929`, cyan
`#00AEEF`, red `#ED1C24`, paper `#EAEAEA`. Drift here is what makes a rebuild look "close but off".

---

## Animation — and the seamless loop

**Every animation must be cyclical over exactly `durationInFrames`.** This is the whole reason to
rebuild rather than re-encode, so it is a hard constraint, not a nice-to-have:

- Flywheel and gears: rotation an exact multiple of 360° across the loop.
- Robot arm: out-and-back, ending where it started.
- Net: slow sway on a sine whose period divides the duration evenly.
- Peeps: tiny idle bob, staggered by index, same period rule.

Verify numerically, not by eye — render frame 0 and frame `durationInFrames`, and require
**RMSE < 0.01** (current footage is 0.174). When that passes, `NetHero.vue` drops to a native
`loop` attribute and the crossfade code comes out.

Keep motion low-amplitude. It sits at `--hero-dim: 0.58` behind white type; busy motion behind
text is noise.

---

## Render and integration

Add to `remotion/package.json` (matching the existing script style):

```json
"render:scene-webm": "remotion render HeroScene out/hero-scene.webm --codec=vp9 --crf=40 --muted",
"render:scene-mp4":  "remotion render HeroScene out/hero-scene.mp4 --codec=h264 --crf=26 --muted",
"still:scene-first": "remotion still HeroScene out/hero-scene-first.png --frame=0"
```

Then the existing pipeline is unchanged — copy to `public/video/hero-scene-web.*` and
`public/img/hero-scene-first.*`, and `NetHero.vue` needs no edit beyond removing the crossfade.

**Render at 1920×1080**, not 1280×720. The whole point is resolution, and vector costs nothing to
render larger. Re-measure filesize; if VP9 is comfortable, consider 2560×1440.

**One still is now enough.** With a true loop, first frame == last frame, so `hero-scene-still.*`
stops being a separate asset — the first-frame poster serves the reduced-motion path too.

---

## Sequencing

Ordered so the thing is presentable early and the risk lands first.

1. **Scaffold + palette + one bench, one peep.** Proves the pipeline end to end. Half a day.
2. **The custom arms.** Do the hardest, highest-value art before anything is committed to. If these
   do not read as "making", the whole approach is wrong and this is where to find that out.
3. **Machinery**, in order of load-bearing: flywheel → cheena vala → robot arm → benches → clutter.
4. **Populate the cast** and stage the composition.
5. **Cyclical animation**, then the RMSE loop check.
6. **Render, integrate, delete the crossfade.**

Steps 2 and 3 are the real work. Steps 1, 4, 5, 6 are assembly and measurement.

---

## Risks

| Risk | Mitigation |
|---|---|
| **Custom arms do not read as making.** The core bet. | Step 2, before any other art. Draw one, render it in-scene, judge it, and abandon early if it fails. |
| **Style mismatch** — Open Peeps is loose and hand-drawn, the current scene is flat and geometric. | Draw the machinery to the *peeps* weight, not the video's. Match one style; do not average two. |
| Recolour via CSS `filter` is crude and shifts hue unpredictably per pose. | Probe used `filter`. For production, pass `strokeColor` and recolour fills properly rather than filtering the whole node. |
| Scene is complex; Remotion renders slowly. | Cap DPR, keep the mesh parametric, render on the machine rather than in CI. |
| Scope creep into "one more figure". | Cast list is fixed in `cast.ts` before art starts. |

---

## Open questions

- [ ] **Confirm Open Peeps is CC0** from the source, and confirm whether Pablo Stanley requests
      attribution in practice. This is the licensing premise of the whole plan — verify it first.
- [ ] Does the Maker Faire licence constrain depicting Makey or the wordmark in illustration?
      Same open question already logged in `docs/net-hero-experience.md`.
- [ ] Final render resolution — 1080p or 1440p? Decide against measured filesize.
- [ ] Should the *cheena vala* stay? It is the strongest local motif, but the scene now has to carry
      "everyone is a maker", and the rig is a fishing story. Possibly reduce it to one element among
      several rather than the left anchor.

---

## Cleanup owed either way

Left in the tree by the feasibility probe. If this plan is **not** taken up, remove all three:

- `remotion/src/PeepsTest.tsx`
- the `PeepsTest` `<Composition>` registered in `remotion/src/Root.tsx`
- `react-peeps` in `remotion/node_modules`, installed with `--no-save` — **it is not in
  `package.json`**, so the probe will not build for anyone else until it is added properly

Unrelated but still outstanding: ~8.8MB of superseded video in `public/`
(`net-full-*`, `net-hero-*`, `net-full-hq.mp4`).

---

## Honest estimate

The scaffolding works today. The art does not exist. This is **days of illustration work, not
hours** — and the pose gap means it cannot be shortcut by picking more from the library. Worth doing
if the hero is meant to last more than one edition, and worth abandoning at step 2 if the custom
arms do not convince.
