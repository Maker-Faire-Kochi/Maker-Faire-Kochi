<script setup lang="ts">
/**
 * The media pack: make a "see you at Maker Faire Kochi" card from your own photo.
 * Everything happens in the browser -- the photo is read with an object URL and
 * drawn to a canvas; nothing is uploaded. The canvas is the preview AND the PNG.
 *
 * Every pointer interaction has a control: drag the photo, or use the nudge keys
 * (and the arrow keys on the focused preview); pinch-free zoom is the slider.
 */
import { EVENT } from '~/composables/useCountdown'
import { drawCard, photoFit, photoFrame, ROLES, SIZE, type CardState, type Design, type Role } from '../draw'

const DESIGNS: { value: Design, label: string, note: string }[] = [
  { value: 'field', label: 'Field', note: 'Yellow, photo framed' },
  { value: 'poster', label: 'Poster', note: 'Blue, photo full height' },
  { value: 'badge', label: 'Badge', note: 'A lanyard pass' },
]
const ROLE_LIST = Object.entries(ROLES).map(([value, r]) => ({ value: value as Role, label: r.label }))
const NAME_MAX = 40

/** The official lockups, as supplied (public/media-pack/logos). PNGs are 4K-wide. */
const LOGOS = [
  { key: 'long', label: 'Long', note: 'One line, 3871 × 646', w: 960, h: 160 },
  { key: 'border', label: 'Border', note: 'One line, framed, 4092 × 859', w: 960, h: 202 },
  { key: 'square', label: 'Square', note: 'Stacked, 1667 × 1667', w: 480, h: 480 },
]

const design = ref<Design>('field')
const role = ref<Role>('visiting')
const name = ref('')
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const photo = shallowRef<HTMLImageElement | null>(null)
const logo = shallowRef<HTMLImageElement | null>(null)
const status = ref('')
const canShare = ref(false)
const busy = ref(false)

const canvas = ref<HTMLCanvasElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
let photoUrl = ''

const state = (): CardState => ({
  design: design.value,
  role: role.value,
  name: name.value.slice(0, NAME_MAX),
  photo: photo.value,
  logo: logo.value,
  zoom: zoom.value,
  panX: panX.value,
  panY: panY.value,
})

let frame = 0
function redraw() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    const ctx = canvas.value?.getContext('2d')
    if (ctx) drawCard(ctx, state())
  })
}

watch([design, role, name, zoom, panX, panY, photo, logo], redraw)

const label = computed(() => {
  const d = DESIGNS.find(x => x.value === design.value)!.label
  const who = name.value.trim() ? `, for ${name.value.trim()}` : ''
  return `Preview of the ${d} card: “I’m ${ROLES[role.value].word.toLowerCase()} ${ROLES[role.value].joiner.toLowerCase()} Maker Faire Kochi”${who}, ${photo.value ? 'with your photo' : 'with a placeholder photo'}.`
})

onMounted(async () => {
  const img = new Image()
  img.decoding = 'async'
  img.onload = () => { logo.value = img }
  img.src = '/img/logo/mf-kochi-long.png'

  redraw()
  // The fonts arrive after first paint (the print-media swap): redraw as they land.
  try {
    await Promise.all([
      document.fonts.load(`400 100px "Dela Gothic One"`),
      document.fonts.load('700 40px Inter'),
      document.fonts.load('600 40px Inter'),
    ])
  }
  catch {}
  redraw()
  document.fonts.addEventListener?.('loadingdone', redraw)

  try {
    const probe = new File([new Blob(['x'], { type: 'image/png' })], 'probe.png', { type: 'image/png' })
    canShare.value = !!navigator.canShare?.({ files: [probe] })
  }
  catch {
    canShare.value = false
  }
})

onBeforeUnmount(() => {
  document.fonts.removeEventListener?.('loadingdone', redraw)
  if (frame) cancelAnimationFrame(frame)
  if (photoUrl) URL.revokeObjectURL(photoUrl)
})

function choosePhoto() {
  fileInput.value?.click()
}

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    status.value = 'That file is not an image. Choose a JPG, PNG or WebP photo.'
    return
  }
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    photoUrl = url
    photo.value = img
    zoom.value = 1
    panX.value = 0
    panY.value = 0
    status.value = 'Photo added. Drag it in the preview, or use the arrow keys, to move it.'
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
    status.value = 'That photo could not be opened. Try a JPG or PNG.'
  }
  img.src = url
  ;(e.target as HTMLInputElement).value = ''
}

function removePhoto() {
  if (photoUrl) URL.revokeObjectURL(photoUrl)
  photoUrl = ''
  photo.value = null
  status.value = 'Photo removed.'
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v))

/** Move the photo by canvas pixels, converted to pan fractions of the slack. */
function panBy(dx: number, dy: number) {
  if (!photo.value) return
  const fit = photoFit(photo.value, photoFrame(design.value), zoom.value)
  if (fit.slackX > 0.5) panX.value = clamp(panX.value + dx / fit.slackX)
  if (fit.slackY > 0.5) panY.value = clamp(panY.value + dy / fit.slackY)
}

function nudge(dx: number, dy: number) {
  panBy(dx * 40, dy * 40)
}

function resetPosition() {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
  status.value = 'Photo centred.'
}

let drag: { id: number, x: number, y: number } | null = null
function onDown(e: PointerEvent) {
  if (!photo.value) return
  drag = { id: e.pointerId, x: e.clientX, y: e.clientY }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onMove(e: PointerEvent) {
  if (!drag || drag.id !== e.pointerId || !canvas.value) return
  const scale = SIZE / canvas.value.getBoundingClientRect().width
  panBy((e.clientX - drag.x) * scale, (e.clientY - drag.y) * scale)
  drag.x = e.clientX
  drag.y = e.clientY
}
function onUp() {
  drag = null
}

function onKey(e: KeyboardEvent) {
  const step = e.shiftKey ? 3 : 1
  const keys: Record<string, [number, number]> = {
    ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
  }
  const k = keys[e.key]
  if (k && photo.value) {
    e.preventDefault()
    nudge(k[0], k[1])
  }
}

function fileName() {
  const who = name.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `maker-faire-kochi-2027-${design.value}${who ? `-${who}` : ''}.png`
}

function toBlob(): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!canvas.value) return resolve(null)
    // Draw synchronously first, so the file is never one frame behind the controls.
    const ctx = canvas.value.getContext('2d')
    if (ctx) drawCard(ctx, state())
    canvas.value.toBlob(resolve, 'image/png')
  })
}

async function download() {
  busy.value = true
  const blob = await toBlob()
  busy.value = false
  if (!blob) {
    status.value = 'The card could not be saved in this browser.'
    return
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName()
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
  status.value = 'Card downloaded.'
}

async function share() {
  busy.value = true
  const blob = await toBlob()
  busy.value = false
  if (!blob) return
  const file = new File([blob], fileName(), { type: 'image/png' })
  try {
    await navigator.share({
      files: [file],
      title: 'Maker Faire Kochi 2027',
      text: `See you at Maker Faire Kochi, ${EVENT.rangeStart.label}–${EVENT.rangeEnd.label}, ${EVENT.venueLabel}. makerfaire.in`,
    })
    status.value = 'Card shared.'
  }
  catch (err) {
    if ((err as DOMException)?.name !== 'AbortError') status.value = 'Sharing did not work here. Download the card instead.'
  }
}
</script>

<template>
  <div class="at-shell">
    <header class="field field-yellow at-hero">
      <div class="wrap at-hero-in">
        <div class="at-title-box">
          <h1 class="display at-title mp-title">Media pack</h1>
        </div>
        <div>
          <p class="lede at-lede">
            Add your photo and tell everyone you’re coming to Maker Faire Kochi.
          </p>
          <p class="at-note">
            {{ EVENT.rangeStart.label }}–{{ EVENT.rangeEnd.label }} · {{ EVENT.venueLabel }}, {{ EVENT.place }}.
            Your photo stays on your device: nothing is uploaded.
          </p>
        </div>
      </div>
    </header>

    <div class="field field-paper at-body">
      <div class="wrap mp-grid">
        <div class="mp-preview">
          <canvas
            ref="canvas"
            class="mp-canvas"
            :class="{ 'is-draggable': !!photo }"
            :width="SIZE"
            :height="SIZE"
            role="img"
            :aria-label="label"
            :tabindex="photo ? 0 : -1"
            @pointerdown="onDown"
            @pointermove="onMove"
            @pointerup="onUp"
            @pointercancel="onUp"
            @keydown="onKey"
          />
          <p class="mp-hint">
            {{ photo ? 'Drag the photo to move it. On a keyboard, focus the card and use the arrow keys.' : 'This is a placeholder. Add your photo to make it yours.' }}
          </p>
        </div>

        <div class="mp-controls">
          <fieldset class="mp-group">
            <legend class="label mp-legend">Design</legend>
            <div class="at-choices mp-choices">
              <label v-for="d in DESIGNS" :key="d.value" class="at-choice">
                <input v-model="design" type="radio" name="design" :value="d.value" />
                <span><strong>{{ d.label }}</strong><br /><span class="mp-sub">{{ d.note }}</span></span>
              </label>
            </div>
          </fieldset>

          <fieldset class="mp-group">
            <legend class="label mp-legend">I’m…</legend>
            <div class="at-choices mp-choices">
              <label v-for="r in ROLE_LIST" :key="r.value" class="at-choice">
                <input v-model="role" type="radio" name="role" :value="r.value" />
                <span>{{ r.label }}</span>
              </label>
            </div>
          </fieldset>

          <div class="mp-group">
            <p class="label mp-legend">Your photo</p>
            <input
              ref="fileInput"
              class="visually-hidden"
              type="file"
              accept="image/*"
              tabindex="-1"
              aria-hidden="true"
              @change="onFile"
            />
            <div class="mp-row">
              <button type="button" class="key" @click="choosePhoto">
                {{ photo ? 'Change photo' : 'Add a photo' }}
              </button>
              <button v-if="photo" type="button" class="key" @click="removePhoto">Remove</button>
            </div>
          </div>

          <div class="mp-group">
            <label class="label mp-legend" for="mp-name">Your name <span class="mp-opt">(optional)</span></label>
            <input
              id="mp-name"
              v-model="name"
              class="at-input"
              type="text"
              :maxlength="NAME_MAX"
              autocomplete="name"
              placeholder="Jane Maker"
            />
          </div>

          <div class="mp-group" :class="{ 'is-off': !photo }">
            <label class="label mp-legend" for="mp-zoom">Zoom</label>
            <input
              id="mp-zoom"
              v-model.number="zoom"
              class="mp-range"
              type="range"
              min="1"
              max="3"
              step="0.01"
              :disabled="!photo"
            />
            <div class="mp-row mp-nudge" role="group" aria-label="Move the photo">
              <button type="button" class="key mp-sq" :disabled="!photo" aria-label="Move photo left" @click="nudge(-1, 0)">←</button>
              <button type="button" class="key mp-sq" :disabled="!photo" aria-label="Move photo up" @click="nudge(0, -1)">↑</button>
              <button type="button" class="key mp-sq" :disabled="!photo" aria-label="Move photo down" @click="nudge(0, 1)">↓</button>
              <button type="button" class="key mp-sq" :disabled="!photo" aria-label="Move photo right" @click="nudge(1, 0)">→</button>
              <button type="button" class="key" :disabled="!photo" @click="resetPosition">Reset</button>
            </div>
          </div>

          <div class="mp-actions">
            <button type="button" class="key key-red mp-main" :disabled="busy" @click="download">
              Download PNG
            </button>
            <button v-if="canShare" type="button" class="key mp-main" :disabled="busy" @click="share">
              Share
            </button>
          </div>
          <p class="mp-note">1080 × 1080 PNG, sized for Instagram, WhatsApp and LinkedIn.</p>
          <p class="visually-hidden" role="status" aria-live="polite">{{ status }}</p>
        </div>
      </div>

      <section class="wrap mp-logos" aria-labelledby="mp-logos-title">
        <div class="mp-logos-head">
          <h2 id="mp-logos-title" class="display-2 mp-logos-title">Logos</h2>
          <p class="copy">
            The Maker Faire Kochi lockups for posters, slides and posts. Use them as supplied:
            keep the white plaque and the cyan frame, and do not redraw, recolour or crop them.
          </p>
        </div>
        <ul class="mp-logo-list">
          <li v-for="l in LOGOS" :key="l.key" class="mp-logo" :class="`is-${l.key}`">
            <div class="mp-logo-art">
              <img
                :src="`/media-pack/logos/preview-${l.key}.webp`"
                :width="l.w"
                :height="l.h"
                :alt="`Maker Faire Kochi logo, ${l.label.toLowerCase()}`"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div class="mp-logo-foot">
              <p class="mp-logo-name">
                <strong>{{ l.label }}</strong>
                <span>{{ l.note }}</span>
              </p>
              <div class="mp-row">
                <a class="key" :href="`/media-pack/logos/maker-faire-kochi-logo-${l.key}.png`" download>
                  PNG<span class="visually-hidden">, {{ l.label }} logo</span>
                </a>
                <a class="key" :href="`/media-pack/logos/maker-faire-kochi-logo-${l.key}.pdf`" download>
                  PDF<span class="visually-hidden">, {{ l.label }} logo</span>
                </a>
              </div>
            </div>
          </li>
        </ul>
        <p class="mp-note">
          Maker Faire is a registered trademark of Make Community LLC. Maker Faire Kochi is
          independently organized and operated under license from Make Community LLC.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped src="../../interest/components/form-sheet.css"></style>

<style scoped>
/* "MEDIA PACK" is about 6.3em of Dela Gothic One; it must fit its box. */
.mp-title {
  font-size: min(8rem, 15cqi);
}

.mp-grid {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: start;
  padding-top: clamp(1rem, 3vw, 2rem);
}

.mp-preview {
  position: sticky;
  top: calc(var(--sheet-bar-h, 64px) + 1.5rem);
}

.mp-canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  border: 2px solid var(--pn-ink);
  background: var(--color-white);
  touch-action: auto;
}

.mp-canvas.is-draggable {
  cursor: grab;
  /* While a photo is in, a finger on the card moves the photo, not the page. */
  touch-action: none;
}

.mp-canvas.is-draggable:active {
  cursor: grabbing;
}

.mp-canvas:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 4px;
}

.mp-hint,
.mp-note {
  margin: 0.85rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--pn-label);
}

.mp-controls {
  display: grid;
  gap: 1.75rem;
  min-width: 0;
}

.mp-group {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.mp-group.is-off .mp-legend {
  color: var(--pn-label);
}

.mp-legend {
  display: block;
  margin-bottom: 0.75rem;
  padding: 0;
  color: var(--pn-ink);
}

.mp-opt {
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: none;
  color: var(--pn-label);
}

/* Tiles as wide as their own words ("Volunteering" is the longest), growing to
   fill the row and wrapping only when a word would not fit. */
.mp-choices {
  display: flex;
  flex-wrap: wrap;
}

.mp-choices .at-choice {
  flex: 1 1 auto;
}

.mp-sub {
  font-size: 0.875rem;
  opacity: 0.85;
}

.mp-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mp-nudge {
  margin-top: 1rem;
}

.mp-sq {
  min-width: 48px;
  padding-inline: 0;
  font-size: 1.125rem;
}

.key:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.mp-range {
  display: block;
  width: 100%;
  max-width: var(--field-w);
  height: 44px;
  accent-color: var(--field-blue);
}

.mp-range:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.mp-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--pn-ink);
}

.mp-main {
  min-height: 56px;
  min-width: 12rem;
  font-size: 1rem;
}

/* ── Logos ── */
.mp-logos {
  margin-top: clamp(4rem, 8vw, 7rem);
  padding-top: clamp(2rem, 4vw, 3rem);
  border-top: 2px solid var(--pn-ink);
}

.mp-logos-head {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 7fr);
  gap: 1rem clamp(2rem, 5vw, 5rem);
  align-items: start;
  margin-bottom: 2rem;
}

.mp-logos-title {
  color: var(--field-blue);
}

.mp-logo-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mp-logo {
  display: flex;
  flex-direction: column;
  border: 2px solid var(--pn-ink);
  background: var(--color-white);
}

/* The art sits on the site's dot grid, so the white plaque reads as a plaque. */
.mp-logo-art {
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 13rem;
  padding: 2rem;
  background-color: var(--pn-enamel);
  background-image: var(--pn-grain);
  background-size: 24px 24px;
  border-bottom: 2px solid var(--pn-ink);
}

.mp-logo-art img {
  display: block;
  width: 100%;
  height: auto;
}

.mp-logo.is-square .mp-logo-art img {
  width: min(100%, 10rem);
}

.mp-logo-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  padding: 1rem 1.1rem;
}

.mp-logo-name {
  margin: 0;
  display: grid;
  font-size: 1rem;
  line-height: 1.35;
}

.mp-logo-name span {
  font-size: 0.875rem;
  color: var(--pn-label);
}

/* One column: the card first, then the controls under it. */
@media (max-width: 900px), (max-height: 520px) {
  .mp-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .mp-preview {
    position: static;
  }

  .mp-logos-head {
    grid-template-columns: minmax(0, 1fr);
  }

  .mp-title {
    font-size: min(5.5rem, 15cqi);
  }
}

@media (max-width: 430px) {
  .mp-main {
    flex: 1 1 100%;
  }
}
</style>
