# Net Film (Remotion) — Implementation Plan (rev 2)

**Status:** Revised after Codex Stage 1 review — awaiting user approval
**Scope:** Personal use (confirmed 2026-08-25)
**Date:** 2026-08-25
**Relates to:** `docs/net-hero-experience.md`

## Goal

Rebuild the 10s Kochi net animatic (`Create_a_beautiful_minimal_s.mp4`, 1280x720, 24fps,
240 frames, 2.6MB) as a **Remotion (React/TS) composition**, render it to video, and embed
it as the landing-page hero in the existing **Nuxt 4 / Vue 3** site.

Rebuilding as vector-in-code is what delivers the upscale: the source is 720p raster, the
rebuild is resolution-independent.

**Scope note.** This delivers *the film*, explicitly not the interactive hero in
`net-hero-experience.md`. The cursor-on-mesh lever, scroll winch and counterweight CTA do
not survive rendering to video. That tradeoff was raised and accepted before planning.

## Source film, beat by beat (measured)

| Frames (24fps) | Time | Beat |
|---|---|---|
| 0-48 | 0.0-2.0s | Close on fisherman hand-knotting; red thread trails right |
| 48-120 | 2.0-5.0s | Camera pans right; mesh unfurls; waterline appears |
| 120-192 | 5.0-8.0s | Rope w/ red float-knots; cheena vala enters right |
| 192-239 | 8.0-10.0s | Pull back to wide: fisherman -> net -> rope -> cheena vala |

Measured palette: teal `#42969A`/`#51A7AB`, dark teal `#455C5C`, red `#AE3C39`,
ink `#1A1C1E`, paper `#EAEAEA`.

Recoloured to `net-hero-experience.md` brand tokens (`#0E6B6B`, `#EA002A`, `#10201F`,
`#E9EDE9`) for brand consistency. **This is not a rights mitigation** — see Risks.

## Stage 0 — Prerequisite bug fix (blocking)

`app/components/MakerHero.vue` contains **both** the site header/nav (lines 2-17) and the
hero section (line 19+). Swapping it for a new hero deletes site navigation. Line 279 also
hides nav entirely below 768px with nothing replacing it — there is currently no navigation
at all on a phone.

1. Extract lines 2-17 into `app/components/MakerHeader.vue`, mount in `app.vue` above the hero.
2. Add a working mobile nav (spec build-path item 2).
3. Only then is a hero swap safe.

## Stage A — Artwork

**Auto-tracing is not viable as the primary path.** Spike on a 400x600 fisherman crop:

| Mask | Blobs (area>4px) | Specks (<20px) |
|---|---|---|
| teal | 113 | 1338 |
| red | 101 | — |

Paper grain, AI edge wobble and `yuv420p` chroma subsampling all trace as noise. Potrace
emits filled contours, not centerlines, so thin ink strokes come back as closed double-sided
ribbons at inconsistent width. Red mask captured 24% of the crop at fuzz 30% — not discriminating.

**Approach: hand-authored stroke-based SVG, using the video frames as pen-tool reference.**

1. `sudo pacman -S potrace`. Trace large flat fills only (shirt, trousers, hull, sail-mass);
   keep the ~20 largest contours, discard the rest. This is a **positioning scaffold**, not
   the deliverable.
2. Hand-author the line work as `<path>` with `stroke`, `fill="none"` — correct centerlines,
   consistent widths, brand-token strokes.
3. Pull the cheena vala reference from **frame ~180**, not 236 — it is larger and better
   articulated there than in the final wide shot.
4. Layer deliberately: fisherman silhouette / arm+hand / rope / **near-net** / **far-net** /
   A-frame / counterweights / water. The near/far net split is what lets live HTML type sit
   inside the mesh in a later interactive version.

Budget this honestly: it is illustration work, and it is the schedule risk.

## Stage B — Remotion composition

`remotion/` at repo root, **its own `package.json` + committed lockfile**. Nuxt never imports
React; Remotion is a build-time asset pipeline, not a site dependency.

```
remotion/                     <- NOT deployed, NOT in the Nuxt build
  package.json                pinned remotion + @remotion/cli + react + react-dom
  remotion.config.ts
  src/
    index.ts                  registerRoot()
    Root.tsx                  composition registry
    NetFilm.tsx               master timeline
    scene/
      Paper.tsx  Net.tsx  Rope.tsx  Water.tsx
      Fisherman.tsx  Cheenavala.tsx  Camera.tsx
    lib/timeline.ts           single source of truth for beats
  assets/                     hand-authored SVG
  reference/                  key frames + source MP4 hash (reproducibility)
  out/                        gitignored
```

Three compositions, one artwork set:

| Composition | Size | Duration | Use |
|---|---|---|---|
| `NetHeroWeb` | 1280x720 | **4.5s** | site hero — cast + settle, **plays once, ends settled** |
| `NetHeroPortrait` | 720x1280 | 4.5s | mobile — reframed, **not** `object-fit: cover` |
| `NetFilm` | 1920x1080 | 10s | social / OG / stage loop |

**Why 4.5s for the web cut:** WCAG 2.2.2 requires auto-moving content over 5 seconds to be
pausable. Staying under 5s removes that obligation cleanly and cuts weight. The full 10s
narrative survives as the social asset.

**Why a portrait composition:** the film is a left-to-right narrative. `object-fit: cover`
on a 16:9 source in a portrait viewport crops out either the fisherman or the cheena vala —
i.e. the entire point.

`Net.tsx` generates the mesh procedurally; column spacing and stroke alpha interpolate across
normalised x, producing the spec's dense-left/open-right gradient from geometry alone.
Camera pan = one wrapper transform over a single wide world-space layout.

Run 24fps vs 30fps side by side before committing. The measured beats land clean at 24
(48/120/192/240) and 30fps costs 25% more render frames.

## Stage C — Render + verify

Local pinned CLI, never `npx` (which would fetch an undeclared latest).

```
npm --prefix remotion run render:web        # h264 + vp9
npm --prefix remotion run render:portrait
npm --prefix remotion run render:film
npm --prefix remotion run still:poster      # LAST frame of NetHeroWeb
```

**Budget per delivered codec, not combined** — the browser picks one source.
Target <=400kB per codec for the 4.5s web cut. Paper grain is expensive to encode; test
with and without the `feTurbulence` texture.

Automated `ffprobe` gate (`remotion/scripts/verify.sh`) asserting: codec, `yuv420p`,
duration, fps, dimensions, **no audio track**, `faststart`, and file-size ceiling.

## Stage D — Nuxt integration

New `app/components/hero/NetHero.vue`, behind a runtime flag for staging comparison
(a flag, not an A/B test — a real test needs stable assignment + RUM).

**LCP handling — `preload="metadata"` does not protect LCP when `autoplay` is present;
autoplay wins and preload is only a hint.** So:

- Poster is the **final settled frame**, server-rendered as a real `<img>` with explicit
  width/height and `fetchpriority="high"`. Poster == video's last frame, so the handoff has
  no visual reset. (Frame 299/frame 0 mismatch was a bug in rev 1.)
- Video sits **beneath** an opaque poster and is never `opacity: 0` — WebKit autoplay is
  visibility-sensitive.
- Video `src` attached **only after** eligibility checks and poster decode.
- Reveal on the `playing` event / resolved `play()` promise — **never `canplay`**, which
  fires even when autoplay is blocked.
- Poster remains the permanent fallback.

Eligibility gates, all server-rendered as poster-only when they fail: `prefers-reduced-motion`,
repeat visit, `navigator.connection.saveData`.

iOS Safari: Low Power Mode disables autoplay and can surface a native play button — the
poster fallback must be genuinely good on its own.

Also: `nuxt.config.ts` gets `ignore: ['remotion/**']` defensively (the real isolation boundary
is the separate package, not this), and the Google Fonts `@import` in `main.css:3` should move
to `@nuxt/fonts` — it is a render-blocking LCP risk today.

## Files touched

**New:** `remotion/**`, `app/components/MakerHeader.vue`, `app/components/hero/NetHero.vue`,
`public/video/net-hero{,-portrait}.{webm,mp4}`, `public/img/net-hero-poster.avif`
**Modified:** `app/app.vue`, `app/components/MakerHero.vue`, `nuxt.config.ts`, `.gitignore`

## Risks / open questions

**Scope: personal use.** Confirmed by the user 2026-08-25. This clears items 1 and 2 below.
Both are re-armed if this ever becomes the public-facing Maker Faire Kochi site.

1. ~~**Remotion licence**~~ — CLEARED. Free for individuals; personal use qualifies.
   Re-check if this ships under an org of more than three people.
2. ~~**Derivative asset**~~ — CLEARED for personal use. The source MP4 is AI-generated and
   this work derives from it; recolouring is not rights mitigation. Revisit before any
   public launch or distribution.
3. **Illustration effort** — hand-authoring the artwork is the real cost and the schedule risk.
4. **Interaction loss** — accepted tradeoff, see Scope note. The interactive hero stays open.
5. **Baseline unknown** — current hero image is 1.06MB with no width/height, so there is no
   trustworthy perf baseline yet. Measure before and after, on a real mid-range Android.
6. **Token migration** — `main.css` still ships cyan/yellow and has no `--color-teal`.
   Not in this plan's scope but it gates the visual result.
