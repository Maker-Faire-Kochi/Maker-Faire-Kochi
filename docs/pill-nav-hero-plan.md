# Modern Palette + Floating Pill Nav + Full-Film Hero — Implementation Plan

**Status:** Stage 1 — Codex review **passed with corrections**, awaiting user approval
**Date:** 2026-08-26
**Relates to:** `docs/net-hero-experience.md`, `docs/net-film-remotion-plan.md`

---

## Goal

Replace the bordered sticky top nav with a **floating bottom-centre glass pill nav**, rebuild the
hero around the **full 10s net film**, retoken the palette to the official Kochi logo colours in
Maker Faire Rome's structural treatment, and convert the six-card Categories grid into a
**struck-through DOMAIN statement**.

### Confirmed by user (2026-08-26)

| Question | Answer |
|---|---|
| "Domain" element | **Replaces the Categories grid.** Struck-through `DOMAIN` + "There is no domain for makers." Six domains survive as label chips. |
| Palette | **Official logo hues + Rome structure.** `#ED1C24`, `#00AEEF`, `#292929` ink, `#F3F3F3` surface, white ground. |
| Nav items | **Three for now**, more later → must be data-driven. |

### References

- **Palette:** makerfairerome.eu (measured `#ff321f`, `#009fe3`, `#292929`, `#f3f3f3`) — we take the
  *structure*, but hues come from the user's own logo files so logo and page agree.
- **Layout + nav:** user's portfolio screenshot — bottom-centre floating glass pill rail with
  per-pill icons, giant display headline, flanking letter-spaced meta labels, scroll cue.
- **HIG:** `apple-design` skill.

---

## Revisions after Codex Stage 1 review

Codex's verdict was *"do not implement unchanged."* Every checkable claim was independently
verified before acceptance. Accepted corrections:

| # | Correction | Verified how |
|---|---|---|
| R1 | **CTA contrast was wrong.** WCAG large text = 24px regular / 18.66px bold. A 14.4px bold nav label needs the full **4.5:1**; white on `#ED1C24` is **4.38:1 → fails**. | Recomputed; `#C4121A` gives 6.09:1 |
| R2 | **Full-bleed film breaks portrait.** 16:9 art in a ~9:20 viewport under `object-fit: cover` discards ~75% of the frame — the exact failure `NetHero.vue`'s own comment warns about. | Geometry + existing code comment |
| R3 | **"Clear top 22%" cannot hold the layout.** 22% of 720px ≈ 158px for logo + 2 eyebrows + 2-line headline + paragraph + scroll cue. Hand-waved. | Arithmetic |
| R4 | **Nav must be FIRST in the DOM, not last.** Overturns my own earlier "correction". | See R4 note below |
| R5 | **`viewport-fit=cover` is missing**, so `env(safe-area-inset-bottom)` resolves to 0. | `nuxt.config.ts:11` |
| R6 | **Fonts load via render-blocking `@import`**; the giant Bungee headline may be the real LCP, not the poster. | `main.css:3` |
| R7 | **`font-weight: 350` is unavailable.** Outfit is loaded as a static weight list (300;400;500;600;700;800), so 350 snaps. Cut. | `main.css:3` |
| R8 | **Footer has an email input**, so fixed-rail-over-keyboard is a real bug, not hypothetical. | `MakerFooter.vue:57` |
| R9 | **`aria-current="location"`**, not `"page"` — these are in-document anchors. | ARIA spec |
| R10 | **`body` bottom padding leaves a pale strip under the dark footer.** Pad the footer instead. | `MakerFooter.vue:92` bg is `--color-dark` |
| R11 | **`scroll-padding-bottom` is needed after all** — not for anchors, but for *sequential focus navigation*, which scrolls focused elements out from under the fixed rail. | Partially overrides my earlier note |
| R12 | **No `loop` attribute exists**, so "dropping loop" was a phantom change. | `NetHero.vue` |
| R13 | **`ended` needs an explicit overlay.** Holding the last frame is normal behaviour but not a presentation guarantee, and it is also what hides any iOS replay affordance. | HTML spec |
| R14 | **Reduced-motion still selection was unspecified.** SSR emits the first-frame `<picture>`; nothing switched it to the final still. | Read the component |
| R15 | **Reduced motion must also kill** `scroll-behavior: smooth`, `spin-slow`, `float`, and the countdown `blink`. | grepped: 4 sites |
| R16 | Declare **both** `-webkit-backdrop-filter` and `backdrop-filter`; test both in `@supports`. | Old Safari is prefix-only |
| R17 | Full-width fixed wrapper **steals clicks** → `pointer-events: none` on wrapper, `auto` on rail. | — |

**R4 note — I was wrong twice here, so stating it plainly.** My first draft put the nav last with a
`Skip to content` link. I then "corrected" that to `Skip to navigation`, arguing WCAG 1.3.2/2.4.3.
Codex is right and both of my positions were worse: a permanently visible primary nav that a
keyboard user can only reach after traversing the entire page is a genuine failure, and it outweighs
a mild visual/DOM order mismatch. Final: **skip-link → nav → main → footer**, visual bottom
placement by CSS only. With nav first, the conventional `Skip to content` link is correct again.

### Overridden, with reasons

- **Codex: cut the active-section observer.** *Keeping it.* The reference's defining feature is one
  filled active pill; with no scroll tracking the active state is either absent or stale. But its
  brittleness point is accepted — the proposed `-45%/-45%` middle band silently fails on sections
  shorter than 10% of the viewport. Implementing instead as "last section whose top has passed 40%
  of viewport height," which cannot fail on short sections. ~20 lines.
- **Codex: cut the `.btn-maker`/`.card-maker`/`.badge-maker` restyle as scope creep.** *Keeping it* —
  replacing the brutalist 4px-border/6px-hard-shadow chrome **is** the user's actual request ("instead
  of the nav bars why not make a modern design palette"), and a glass pill rail beside hard-offset
  shadows would be incoherent. **But Codex's real point is accepted: my claim that About/Countdown/
  Footer would be "visually unregressed" was false.** They will change deliberately. The verification
  criterion changes from "unregressed" to "intentionally restyled, checked for contrast and layout
  breakage."

### Accepted cuts

- **The `+` → `×` rotation.** A `+` that expands into nothing is a false affordance. Resolved without
  contradicting the user: their newer portfolio reference uses **icons, not `+`**, and supersedes the
  Rome screenshot for layout.
- **The sliding active-indicator span.** Needs width/offset measurement across font loading, resize,
  icon-only breakpoints and zoom. A class-toggled fill per pill is simpler and more robust.
- **The DOMAIN strike observer.** The strike *carries the meaning*; if JS fails the word reads
  unstruck, i.e. the opposite. Render struck by default in CSS; animate only as progressive
  enhancement.
- **The radial legibility wash.** Made unnecessary by the R2/R3 layout change — type now sits on
  clean ground, not over artwork.
- **`font-weight: 350`** (R7).

---

## Measured facts

### Logo colours (sampled from the PNGs)

| Colour | Hex | Pixels |
|---|---|---|
| white | `#FFFFFF` | 1,468,074 |
| cyan | `#00AEEF` | 643,531 |
| red | `#ED1C24` | 359,792 |

Current `main.css` uses `--color-red: #EA002A` (the Make: brand red), which **does not match the
supplied Kochi logo**.

### Contrast audit (computed)

| Pair | Ratio | Verdict |
|---|---|---|
| `#292929` on `#FFFFFF` | 14.55:1 | ✅ |
| `#292929` on `#F3F3F3` | 13.11:1 | ✅ |
| `#292929` on `#EAEAEA` (film paper) | 12.09:1 | ✅ |
| `#00AEEF` on `#292929` | 5.75:1 | ✅ cyan text on ink ground |
| `#FFFFFF` on `#C4121A` | **6.09:1** | ✅ **CTA fill** |
| `#FFFFFF` on `#ED1C24` | 4.38:1 | ❌ fails for any label under 18.66px bold |
| `#ED1C24` on `#FFFFFF` | 4.38:1 | ⚠️ display type ≥24px only (3:1 bar) |
| `#00AEEF` on `#FFFFFF` | 2.53:1 | ❌ **never cyan text on white** |
| `#5A6169` on `#FFFFFF` | 6.27:1 | ✅ replaces `#6C757D` (4.69:1) |

**Token consequences:** `--color-red` `#ED1C24` = logo + display type ≥24px only.
`--color-red-cta` `#C4121A` = every red fill behind a label, and any small red text.
`--color-cyan` = structural only.

### Video

`net-full-web.webm` VP9 1280×720 24fps, 859 KB, 10.0s · `net-full-web.mp4` H.264, 1.42 MB, 10.0s.
Beats: knotting (0–2s) → mesh unfurls (2–5s) → *cheena vala* (5–8s) → wide shot (8–10s).

---

## Assets — staged (done)

| Path | Notes |
|---|---|
| `public/img/logo/mf-kochi-{long,border,square}.png` | verbatim copies |
| `public/img/logo/mf-kochi-long{,@2x}.{png,webp}` | 600 / 1200px |
| `public/img/logo/mf-kochi-square-512.png` | og:image |
| `public/img/logo/apple-touch-icon.png` | 180×180 |
| `public/img/net-full-first.{jpg,webp,avif}` | frame 0 — LCP poster, seamless into playback |
| `public/img/net-full-still.{jpg,webp,avif}` | final frame — reduced-motion, `ended`, and error states |

**"copy this to private too"** read as `public/` (the only served directory in Nuxt). Flagging in
case a second location was meant.

---

## Step 1 — `app/assets/css/main.css`

1. **Palette — light-ground and dark-ground variants (revised after round 2).**

   The first draft treated colour as one flat list. It is not: this site has **both** white and
   near-black grounds, and a token that passes on one fails on the other.

   ```css
   --color-red:           #ED1C24;  /* logo + display type >=24px on LIGHT only */
   --color-red-cta:       #C4121A;  /* red fill behind any label; small red text on LIGHT  6.09:1 */
   --color-red-on-dark:   #FF5A5F;  /* red text on ink/charcoal                            4.77:1 */
   --color-cyan:          #00AEEF;  /* structural on light; as TEXT only on dark  5.75-6.52:1 */
   --color-ink:           #292929;
   --color-charcoal:      #1F1F1F;  /* kept DISTINCT from ink so panels do not flatten */
   --color-surface:       #F3F3F3;
   --color-muted:         #5A6169;  /* body-secondary on LIGHT                             6.27:1 */
   --color-muted-on-dark: #A8AEB5;  /* body-secondary on DARK                              6.50:1 */
   --color-hairline:      #E3E3E3;
   ```

   Aliases get **explicit values**, not blind remaps: `--color-dark → #292929`,
   `--color-light → #FFFFFF`, `--color-gray-600 → #5A6169`.

### Step 1a — fix the contrast failures this migration exposes

Auditing the *actual* text-on-background pairs (not just tokens) found five failures. **Three are
pre-existing bugs the site ships today** — the migration does not cause them, but it must not
preserve them either.

| Site | Pair | Ratio | Needs | Fix |
|---|---|---|---|---|
| `MakerAbout` `.stat-cyan .stat-number` | cyan on **white** | **2.53:1** | 3.0 | 🔴 *pre-existing.* All stat numbers → `--color-ink` (14.55:1); the colour rotation moves entirely into the box-shadow |
| `MakerAbout` `.stat-yellow .stat-number` | (yellow→cyan) on white | **2.53:1** | 3.0 | same as above — this is why "convert yellow to cyan" was **not** safe everywhere |
| `MakerAbout` `.lead` 20.8px/600 | red on white | **4.38:1** | 4.5 | 🔴 *pre-existing.* → `--color-red-cta` (6.09:1) |
| `MakerCountdown` `.announcement strong` 17.6px | red on ink | **3.32:1** | 4.5 | 🔴 *pre-existing.* → `--color-red-on-dark` (4.77:1) |
| `MakerFooter` `.credits` 13.6px | `#5A6169` on ink | **2.32:1** | 4.5 | → `--color-muted-on-dark` (6.50:1). Note the *current* `#6C757D` also fails here at 3.10:1 |

The yellow→cyan mapping **does** hold for the three sites that sit on dark grounds:
`.time-number` 6.52:1 ✅ · `.celebrating` 5.75:1 ✅ · `.column-title` 5.75:1 ✅.
Codex was right that the blanket claim "all converted yellow text is cyan-on-ink" was false —
one of the four is on white and fails.

2. **Retire yellow for real** — see Step 1b.

3. **Glass + motion tokens.** `--glass-bg: rgba(255,255,255,0.72)`,
   `--glass-stroke: rgba(41,41,41,0.10)`, `--glass-blur: 14px` (reduced from 20px per Codex B6),
   `--radius-pill: 999px`, `--ease-out: cubic-bezier(.22,1,.36,1)`, `--dur-fast: 160ms`.

4. **Modern chrome — sized properly (Codex was right that "restyle the 3 global classes" was
   incomplete; the fix is smaller than it feared).** Counted the actual declarations:

   | Kind | Count | How it is handled |
   |---|---|---|
   | `border: var(--border-width-thick/thin) …` | **27** | **One global lever.** Already tokenized — retuning `--border-width-thick: 4px → 1px` and `--border-width-thin: 2px → 1px` de-brutalizes all 27 with **zero component edits** |
   | hardcoded `Npx solid` borders | 5 | enumerated and edited |
   | hardcoded **dashed** borders | **2** | `MakerAbout.vue:209` (`4px dashed`), `MakerCountdown.vue:115` (`3px dashed`) |
   | hard offset shadows `Npx Npx 0px` | 33 total | 8 in `main.css` · 4 in `MakerHeader` (rewritten) · 1 in `MakerHero` (deleted) · 2 in `MakerCategories` (rewritten) → **18 real edits**: About (14), Countdown (2), Footer (2) |

   **Two count corrections from Codex round 3, both verified.** The border figure was 25, not 27,
   because my glob `app/components/*.vue` does not match `app/components/hero/NetHero.vue`
   (`NetHero.vue:134`, `:204`). And my grep matched only `solid`, missing the two **dashed** borders.
   Recounted with `hero/` included: **27**.

   **The replacement shadow token must actually exist** (Codex: "never defined"):
   ```css
   --shadow-soft:    0 1px 2px rgba(41,41,41,.06), 0 4px 12px rgba(41,41,41,.10);
   --shadow-soft-lg: 0 2px 4px rgba(41,41,41,.06), 0 12px 32px rgba(41,41,41,.14);
   ```
   The 18 edits are then one find/replace shape: `Npx Npx 0px var(--color-X)` → `var(--shadow-soft)`,
   with the hover variants → `var(--shadow-soft-lg)`.

   Honest scope: **two token changes + ~25 mechanical edits**, not a rewrite.

5. **Font loading (R6).** Delete the `@import` from `main.css`; move to `nuxt.config.ts` `head.link`
   with `preconnect` to `fonts.googleapis.com` + `fonts.gstatic.com` (crossorigin) and the
   stylesheet, so the chain is not serialized behind the CSS file.

6. **Reduced motion (R15)** — targeted, not blanket:
   ```css
   @media (prefers-reduced-motion: reduce) {
     html { scroll-behavior: auto; }
     .animate-spin-slow, .animate-float { animation: none; }
     /* + countdown blink, MakerCountdown.vue:193 */
   }
   ```

7. **`scroll-padding-bottom` on `html`** = rail height + gap + safe area (R11), for focus scrolling.

### Step 1b — retire yellow for real (the alias trick does not work)

`--color-yellow` is live in **9 declarations across three components** the plan called "untouched":

| File | Line | Use |
|---|---|---|
| `MakerAbout.vue` | 198, 201 | `.card-yellow` box-shadow |
| `MakerAbout.vue` | 259, 262, 266 | `.stat-yellow` shadow + `.stat-number` **text** |
| `MakerCountdown.vue` | 175 | `.time-number` **text**, 3.5rem |
| `MakerCountdown.vue` | 215 | `.celebrating` **text** |
| `MakerFooter.vue` | 158 | `.column-title` **text** |
| `MakerFooter.vue` | 264 | `.credits .highlight` **text** |

Aliasing fails two ways:

1. **Collapsed meaning.** `MakerAbout` runs a three-way red/cyan/yellow rotation; alias yellow→cyan
   and two of three become pixel-identical.
   > **HIG — Colour:** "Avoid using the same colour to mean different things."
2. **Contrast.** Every third-accent candidate as text on `#292929`:

   | Candidate | Ratio | Verdict |
   |---|---|---|
   | Rome deep blue `#0070CC` | **2.90:1** | ❌ fails even the 3:1 floor |
   | Rome blue `#009FE3` | 4.90:1 | ✅ |
   | logo cyan `#00AEEF` | 5.75:1 | ✅ |
   | cyan tint `#5FD0F7` | 8.21:1 | ✅ contrast, but **1.43:1 vs cyan** — indistinguishable |
   | amber `#FFD100` | 9.96:1 | ✅ but reintroduces the retired colour |

   A deep blue passes distinction and fails contrast; a cyan tint passes contrast and fails
   distinction. No alias works.

**Resolution:** rewrite the 9 declarations onto a strict **two-accent system (red + cyan)** — which
is *more* faithful to the reference, since makerfairerome.eu is itself two-accent. The four yellow
**text** sites become cyan (5.75:1 on ink ✅).

---

## Step 2 — `app/components/MakerHeader.vue` (rewrite: floating glass pill rail)

Replaces the sticky bordered top bar and **deletes the hamburger + mobile drawer (~90 lines)**.

> **HIG:** "Mobile: bottom tab bar for primary nav, not hamburger menus." One component now serves
> both breakpoints.

### Structure & data

```
╭──────────────────────────────────────────╮
│ (⏱ When) (◈ About) (⚙ Domains)  [Join ▸] │   fixed, bottom, centred
╰──────────────────────────────────────────╯
```

- **Data-driven** `links` array (`{ id, href, label, icon }`) — the seam for adding Rome's four
  sections later.
- **Order follows document order (R/D4).** `app.vue` renders Countdown → About → Categories, so the
  pills are **WHEN** (`#countdown`) · **ABOUT** (`#about`) · **DOMAINS** (`#categories`). The earlier
  draft's "Home / About / Domains / When" was inconsistent with both the wireframe and `app.vue`.
- Icons from `@lucide/vue` 1.33.0 — **verified present** in `node_modules`, and `House`, `Shapes`,
  `Timer`, `Send` all confirmed exported. `sideEffects: false`, so named imports tree-shake.

### The glass

Functional layer, **Regular** variant (not Clear — the film ground is bright paper, and Clear over
bright content would need a dimming layer fighting the artwork).

```css
-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.4);   /* R16 */
backdrop-filter: blur(var(--glass-blur)) saturate(1.4);
background: var(--glass-bg);
border: 1px solid var(--glass-stroke);
```
```css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .rail { background: rgba(255,255,255,0.94); }
}
@media (max-width: 768px) {
  .rail {
    -webkit-backdrop-filter: none;   /* R3: without this, prefix-only Safari keeps the blur */
    backdrop-filter: none;
    background: rgba(255,255,255,0.94);
  }
}
```
Codex round 3: disabling only the unprefixed property leaves prefix-only iOS Safari — the exact
device the mobile perf rule exists for — still paying for the blur. Both must be set.
The mobile drop is a perf decision: a blurred fixed element over a *playing* video re-samples and
re-blurs every frame at 24fps. Playing the film **once** bounds that to 10s (R12/B6).

### Colour discipline

> **HIG — Liquid Glass:** "Refrain from adding colour to the background of multiple controls. Only
> one primary action per context." "For selected states, prefer colouring the foreground."

- **Active pill** → `--color-surface` fill + ink label + 3px cyan dot. Shape *and* weight change, so
  it survives colour-blindness. `aria-current="location"` (R9).
- **CTA** → the only background-coloured control: `--color-red-cta` `#C4121A`, white bold label,
  **6.09:1** (R1).
- Inactive → ink label, no fill.

### Animation

Pill background fades in on hover/focus over `--dur-fast`; label nudges 1px. Active fill is
class-toggled. No `+` rotation, no sliding indicator (both cut).

### Active-section tracking

`IntersectionObserver` over the three sections, selecting **the last section whose top has passed 40%
of viewport height** — immune to the short-section failure of a narrow middle band.

**Round-2 correction:** the observer must **not** derive state from the callback's `entries` alone.
That yields stale results on initial load and when scrolling upward, because `entries` contains only
sections whose intersection *changed*. The callback is a **trigger**; the handler recomputes the
active id from all three sections' `getBoundingClientRect().top`.

**Round-3 correction:** recomputing fixes staleness but supplies no *trigger at 40%* — a default
`IntersectionObserver` fires on viewport entry/exit, a different moment entirely.

**Round-4 correction — and this one kills the IntersectionObserver approach outright.** The obvious
fix, `rootMargin: '-40% 0px -60% 0px'`, does not work. The spec is explicit:

> "Percentages are resolved relative to the **width** of the undilated rectangle."
> — [W3C Intersection Observer](https://www.w3.org/TR/intersection-observer/#dom-intersectionobserver-rootmargin)

Top/bottom percentages resolve against **width**, not height. On a 1920×1080 viewport that is
−768px and −1152px applied to a 1080px-tall root → a negative-height rectangle that never fires.
(The widely-copied `-50% 0px -50% 0px` scroll-spy idiom has the same latent bug on wide viewports.)

Making IO correct would require pixel margins computed from `innerHeight` **and** tearing down and
recreating the observer on every debounced resize. At that point it is more code and more failure
modes than the direct approach, so: **use a passive `scroll` listener throttled with
`requestAnimationFrame`**, calling the same `recompute()` that reads the three
`getBoundingClientRect().top` values.

```js
let ticking = false
const onScroll = () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => { recompute(); ticking = false })
}
addEventListener('scroll', onScroll, { passive: true })
```

No percentage-resolution trap, no resize rebuild (rects are read fresh each time, so resize is
handled for free), and it is ~15 lines instead of ~30. `recompute()` once on mount for initial
state; remove the listener in `onUnmounted`.

### Layout & a11y

- `<nav id="primary-nav" aria-label="Primary">`, real `<a>` elements.
- Wrapper `position: fixed; left/right: 0; pointer-events: none`; rail `pointer-events: auto` (R17).
- Rail positioned `bottom: calc(1.25rem + env(safe-area-inset-bottom))` — *positioned*, not padded
  (R5). Requires `viewport-fit=cover` in Step 6.
- Every pill ≥ **44×44px**; ~12px gaps (HIG: "about 12 points of padding around elements that
  include a bezel").
- `:focus-visible` 2px ink outline, 2px offset.
- ≤480px: **icon-only pills**, label to `aria-label`.
- **Overflow now, not later (B10):** rail gets `max-width: calc(100vw - 2rem)` and
  `overflow-x: auto` with `scrollbar-width: none`, so added pills, 200% zoom and large text degrade
  to a scrollable rail instead of overflowing.
- **Mobile keyboard (R8):** the footer newsletter input (`MakerFooter.vue:57`) would sit under a
  rail pinned above the keyboard. Hide the rail while a form field in the footer has focus —
  `:has()` where supported, else a `focusin`/`focusout` handler on the footer form.

---

## Step 3 — `app/components/hero/NetHero.vue`

### Layout — revised after R2/R3

The earlier "full-bleed film with type overlaid in the clear top strip" is **cut**: it crops ~75% of
a 16:9 film in portrait, and 158px cannot hold six elements.

**Film becomes a full-width band; type sits on clean ground above and below it.**

```
              [ MF Kochi logo ]
  JAN 26–27, 2027                    KOCHI, KERALA     ← flanking eyebrows
 ┌────────────────────────────────────────────────┐
 │ ░░░░  the net film, full width, uncropped ░░░░ │    ← natural 16:9 band
 └────────────────────────────────────────────────┘
        FIRST WE KNOT IT. THEN WE CAST IT.             ← giant Bungee, ink on white
   The Greatest Show (& Tell) on Earth comes to
   Kerala for the very first time. …
        [ JOIN AS MAKER ]   [ LEARN MORE ]
                  ↓ SCROLL
 ╭──────────────────────────────────────────╮
 │ (⏱ When)(◈ About)(⚙ Domains)   [Join ▸] │          ← floating rail
 ╰──────────────────────────────────────────╯
```

Why this is better, not just safer: the film is **never cropped** at any breakpoint, so the
left-to-right narrative always reads; type sits at a guaranteed 14.55:1 instead of over artwork
(which also **removes the need for the radial wash**); and one layout serves portrait and landscape.
It still matches the reference, which likewise puts the subject in a band with the headline below.

### Explicit band geometry (round-2 blocker, resolved)

Codex caught that **"full-width" + "uncropped 16:9" + `max-height: 62svh` cannot all hold**: on a
16:9 viewport a full-width 16:9 film is exactly 100svh tall, so the cap forces either a crop or
gutters. That contradiction was real. Two candidate fixes were tested:

- ❌ **`object-fit: contain` with a paper-coloured letterbox.** Sampled the film's own edge pixels
  across the 10s: left runs `#E4DCDA → #DFCFCE` (warm), right runs `#E9E9E9 → #C0CBCC` (cool, as
  water enters). The ground is **not a uniform colour and it shifts during playback**, so a flat
  letterbox would show a visible seam that changes over time. Rejected on evidence.
- ✅ **Cap the band by width and centre it.** The band never crops and never letterboxes; on tall or
  landscape screens it simply narrows against the page's own white ground, reading as an
  intentional framed band — which is what the reference does with its centred subject.

```css
.net-hero-band {
  width: 100%;
  max-width: calc(58svh * 16 / 9);   /* height can never exceed 58svh */
  margin-inline: auto;
  aspect-ratio: 16 / 9;              /* never cropped, at any breakpoint */
}
```

- Hero gets explicit bottom clearance for the rail (R/B4) — `100svh` alone does not reserve it.
- **The "above the fold" requirement is dropped.** Codex is right that logo + eyebrows + film +
  headline + copy + stacked mobile CTAs + scroll cue cannot plausibly fit one viewport. The scroll
  cue exists precisely because the hero is taller than the viewport; pretending otherwise was the
  error.

### Source swap & playback

`/video/net-hero.*` → `/video/net-full-web.{webm,mp4}`. Poster → `net-full-first.*`.

**Keep the existing LCP machinery verbatim** — it is correct and hard-won: no `src` until
`onMounted`; poster is a real `<img>` with `fetchpriority="high"` and explicit dimensions (a `poster`
attribute cannot carry `fetchpriority`); video never `opacity: 0` (WebKit autoplay is
visibility-sensitive); reveal on `@playing`, never `canplay` (which fires even when autoplay was
refused). There is **no `loop` attribute to remove** (R12).

Additions:

- **`@ended` → fade in the `net-full-still` overlay (R13).** Guarantees the intended final frame,
  hides any iOS replay affordance, and survives decoder frame eviction.
- **`@error` / `@abort` → restore the still (R/A7).** Once `playing` fires it never un-fires, so a
  later failure would currently leave a blank element.
- Defensive chrome suppression:
  ```css
  .net-hero-video::-webkit-media-controls,
  .net-hero-video::-webkit-media-controls-start-playback-button { display: none !important; }
  ```
- **Reduced-motion still selection (R14)** — handled at parse time by `<picture>`, no JS, no double
  download. **Round-2 correction:** the first version media-qualified only the AVIF source, so a
  browser without AVIF fell through to the *first-frame* WebP/JPEG. **Every format needs its own
  reduced-motion source, and they must all precede the unqualified ones:**
  ```html
  <source media="(prefers-reduced-motion: reduce)" srcset="/img/net-full-still.avif" type="image/avif">
  <source media="(prefers-reduced-motion: reduce)" srcset="/img/net-full-still.webp" type="image/webp">
  <source media="(prefers-reduced-motion: reduce)" srcset="/img/net-full-still.jpg"  type="image/jpeg">
  <source srcset="/img/net-full-first.avif" type="image/avif">
  <source srcset="/img/net-full-first.webp" type="image/webp">
  <img src="/img/net-full-first.jpg" …>
  ```
  Save-Data cannot be expressed in CSS; it keeps the first frame and skips the video. Documented
  rather than silently wrong.

### Copy fix (user request)

`is back in Kerala` is factually wrong — this is the first Kochi edition. Verified it exists in
**exactly one place** (`MakerHero.vue:16`); `MakerAbout.vue` and `og:description` do not carry it.

**New:** "The Greatest Show (& Tell) on Earth comes to Kerala for the very first time. A
family-friendly festival of invention, creativity and resourcefulness, celebrating the global Maker
Movement."

### Logo

`<picture>` webp/png from `public/img/logo/`, explicit `width`/`height` (no CLS), `alt="Maker Faire
Kochi"`, `loading="eager"` but **not** `fetchpriority="high"` — the poster keeps that, or the two
compete for LCP.

---

## Step 4 — `MakerCategories.vue` → the DOMAIN section

```
        D̶O̶M̶A̶I̶N̶
   There is no domain for makers.
   If you made it, you can show it.

  ( Robotics & AI ) ( 3D Printing ) ( Electronics & IoT )
  ( Art, Craft & Design ) ( Green Tech & Agri ) ( Space & Science )

  [ existing "Pitch Your Project" banner — retained ]
```

- Six cards → **label chips**; descriptive paragraphs dropped (labels are self-describing, and
  de-emphasising the taxonomy is the point).
- Chips are **non-interactive `<li>`s, not buttons** — they are not destinations, so they must not
  look tappable. Flat surface fill, hairline, no shadow, no hover lift.
- **Struck by default in CSS**; animation is progressive enhancement only (accepted cut). The strike
  carries meaning and must never depend on JS.
- `id="categories"` **preserved** — the nav pill depends on it.
- Semantics: the real `<h2>` is "There is no domain for makers."; `DOMAIN` is `aria-hidden="true"`.
  A screen reader must not read a word the sighted user sees crossed out.

## Step 5 — `app/app.vue`

**Auto-import gotcha — verified, not assumed.** Ran `npx nuxt prepare`; `.nuxt/components.d.ts`
shows default `pathPrefix: true` registers `components/hero/NetHero.vue` as **`HeroNetHero`**:

```
export const HeroNetHero: typeof import("../app/components/hero/NetHero.vue")['default']
```

`<NetHero />` would resolve to nothing. `.nuxt/` was also stale (predating both new components).
Fix with an explicit import:

```vue
<script setup lang="ts">
import NetHero from '~/components/hero/NetHero.vue'
</script>

<template>
  <div class="maker-app">
    <NuxtRouteAnnouncer />
    <a href="#main" class="skip-link">Skip to content</a>
    <MakerHeader />                      <!-- FIRST in DOM (R4); CSS puts it at the bottom -->
    <main id="main" tabindex="-1">       <!-- tabindex for Safari focus -->
      <NetHero />
      <MakerCountdown />
      <MakerAbout />
      <MakerCategories />
    </main>
    <MakerFooter />                      <!-- outside <main>: contentinfo landmark (R/D7) -->
  </div>
</template>
```

Skip link needs visible focus styling and a `z-index` above the rail.

## Step 5b — `MakerFooter.vue` bottom clearance (R10)

The revisions table said "pad the footer instead of `body`" but no step actually did it. Explicitly:
`MakerFooter` gets

```css
padding-bottom: calc(var(--rail-h) + 1.25rem + env(safe-area-inset-bottom));
```

**`--rail-h` must be defined in `main.css` `:root` (Codex round 3).** It was referenced here and in
Step 1.7's `scroll-padding-bottom` but never declared — and an unresolved `var()` makes the whole
declaration invalid at computed-value time, silently leaving `MakerFooter.vue:95`'s existing `3rem`
padding in place. That is a fail-silent bug, not a cosmetic one. Define `--rail-h: 56px` alongside
the glass tokens, and derive the pill min-height from it so the two cannot drift apart.

This must be on the **footer**, not `body`: `body` carries `--color-light` while the footer is
`--color-dark`, so padding `body` would paint a pale strip under the dark footer.
`scroll-padding-bottom` (Step 1.7) does not cover this — it affects scrolling, not the rail
physically covering the footer credits at rest.

## Step 6 — `nuxt.config.ts`

- **`viewport` → add `viewport-fit=cover`** (R5) — without it `env(safe-area-inset-bottom)` is 0.
- Font `<link>`s with `preconnect` (R6), replacing the `main.css` `@import`.
- `og:image` / `twitter:image` → `/img/logo/mf-kochi-square-512.png` + width/height/alt.
- `apple-touch-icon` link; `theme-color: #FFFFFF`.

## Step 7 — retire `app/components/MakerHero.vue`

Superseded by `NetHero.vue`, unreferenced. **It has uncommitted modifications — confirm before
deleting.** Git history retains it.

---

## Out of scope (deliberate)

- **Dark mode / "Night catch."** The portfolio reference is a dark page, but the confirmed palette is
  a white ground and the film's own ground is light paper `#EAEAEA` — dark would need the artwork
  recoloured. Flagging the tension rather than silently resolving it. Good follow-up.
- Rome's four extra nav sections — user said 3 for now; the `links` array is the seam.
- Verlet physics / cursor-on-mesh / scroll winch / counterweight CTA — do not survive rendering the
  film to video; already accepted in `net-film-remotion-plan.md`.
- Malayalam lockup — needs a native reader's sign-off (open question in the spec).

## Risks

| Risk | Mitigation |
|---|---|
| Bungee headline becomes LCP, not the poster (R6) | preconnect + `<link>`; measure the real candidate on throttled 4G |
| `backdrop-filter` over playing video on mid-range Android | blur cut to 14px, tight rail, none below 768px, film stops after 10s |
| Site-wide chrome restyle regresses About/Countdown/Footer | **expected to change** — checked for contrast + layout breakage, not "unregressed" |
| Rail over the footer newsletter input with keyboard open (R8) | hide rail on footer form focus |
| Added pills overflow at 320px / 200% zoom | scrollable rail from day one (B10) |
| iOS replay affordance after `ended` | `net-full-still` overlay + control suppression |

## Verification (Stage 3)

No test runner exists and this is CSS/markup plus two small observers, so automated tests are low
value. Instead:

1. `npm run build` clean; `npx nuxt prepare` regenerates component types.
2. `npm run dev` at 360 / 390×844 portrait / 768 / 1280 / 1920.
3. Film plays once, holds the final frame via the overlay; poster is LCP on throttled 4G
   (**measure the waterfall — do not assume**, per R/A5).
4. Nav: active pill tracks scroll, 44×44 targets, focus ring keyboard-only, rail scrolls at 320px,
   rail hides on footer-input focus.
5. `prefers-reduced-motion` → final still (not first frame), `DOMAIN` pre-struck, no smooth scroll,
   no spin/float/blink.
6. Save-Data → no video fetched.
7. Re-run the contrast table against shipped CSS.
8. **Real-device iOS:** normal + Low Power Mode, `ended` state, keyboard open, safe area, 200% zoom.
9. About / Countdown / Footer checked for contrast and layout breakage after the restyle.
