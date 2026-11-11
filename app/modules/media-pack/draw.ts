/**
 * The media pack's share cards, drawn straight onto a 1080x1080 canvas so the
 * preview IS the download: no DOM-to-image step, nothing leaves the device.
 *
 * Three designs in the campaign's language: the yellow field, the blue poster
 * and a lanyard badge. Every design uses the real Maker Faire Kochi lockup on its
 * own plaque (never retypeset), Dela Gothic One for display and Inter for text,
 * and the facts from EVENT.
 */
import qrcode from 'qrcode-generator'
import { EVENT } from '~/composables/useCountdown'

export const SIZE = 1080

export type Design = 'field' | 'poster' | 'badge'
export type Role = 'visiting' | 'exhibiting' | 'volunteering'

export interface CardState {
  design: Design
  role: Role
  name: string
  photo: CanvasImageSource & { width: number, height: number } | null
  logo: HTMLImageElement | null
  /** 1 = the photo just covers its frame. */
  zoom: number
  /** Pan as a fraction of the slack on each axis, -1..1 (0 = centred). */
  panX: number
  panY: number
  /** Badge only, preview only: the card's swing on its lanyard (radians) and its drop (px, <= 0). */
  swing?: number
  drop?: number
  /** Easter eggs (badge): Konami gives a holographic ALL ACCESS foil; five taps, a coir rope lanyard. */
  foil?: boolean
  coir?: boolean
}

/** The badge's role line. The faire's own mascot gets its own pass. */
export function roleBadge(st: Pick<CardState, 'role' | 'name' | 'foil'>) {
  if (st.foil) return 'ALL ACCESS'
  if (st.name.trim().toUpperCase() === 'MAKEY') return 'MASCOT'
  return ROLES[st.role].badge
}

/** The QR on the badge: the site, so a shared card leads back to it. */
export const QR_URL = 'https://makerfaire.in'
let qrCache: { n: number, dark: (r: number, c: number) => boolean } | null = null
function qrMatrix() {
  if (!qrCache) {
    const qr = qrcode(0, 'M')
    qr.addData(QR_URL)
    qr.make()
    qrCache = { n: qr.getModuleCount(), dark: (r, c) => qr.isDark(r, c) }
  }
  return qrCache
}

export const ROLES: Record<Role, { label: string, word: string, joiner: string, badge: string }> = {
  visiting: { label: 'Visiting', word: 'GOING', joiner: 'TO', badge: 'VISITOR' },
  exhibiting: { label: 'Exhibiting', word: 'EXHIBITING', joiner: 'AT', badge: 'MAKER' },
  volunteering: { label: 'Volunteering', word: 'VOLUNTEERING', joiner: 'AT', badge: 'VOLUNTEER' },
}

const C = {
  yellow: '#FFE86C',
  blue: '#2B19D9',
  red: '#C4121A',
  ink: '#222222',
  paper: '#F6F6F3',
  white: '#FFFFFF',
  cyan: '#00AEEF',
  onBlueLabel: '#D8D4FF',
}

const DISPLAY = '"Dela Gothic One", "Arial Black", sans-serif'
const TEXT = 'Inter, system-ui, sans-serif'
/** The lockup's own aspect (3871 x 646). */
const LOGO_RATIO = 3871 / 646

const DATE_LONG = `${EVENT.rangeStart.label}–${EVENT.rangeEnd.label}`.toUpperCase() // 5–6 FEBRUARY 2027
const DATE_SHORT = '5–6 FEB 2027'
const VENUE = EVENT.venueLabel.toUpperCase()
const PLACE = EVENT.place.toUpperCase()

export interface Frame { x: number, y: number, w: number, h: number }

/** Where each design puts the photo. The page needs it to turn a drag into pan. */
export function photoFrame(design: Design): Frame {
  switch (design) {
    case 'field': return { x: 64, y: 452, w: 520, h: 520 }
    case 'poster': return { x: 520, y: 0, w: 560, h: SIZE }
    case 'badge': return { x: 228, y: 392, w: 270, h: 320 }
  }
}

/** Drawn size and slack of the photo in a frame, for drawing and for dragging. */
export function photoFit(photo: { width: number, height: number }, f: Frame, zoom: number) {
  const s = Math.max(f.w / photo.width, f.h / photo.height) * zoom
  const w = photo.width * s
  const h = photo.height * s
  return { w, h, slackX: (w - f.w) / 2, slackY: (h - f.h) / 2 }
}

export function drawCard(ctx: CanvasRenderingContext2D, st: CardState) {
  ctx.save()
  ctx.clearRect(0, 0, SIZE, SIZE)
  ctx.textBaseline = 'alphabetic'
  if (st.design === 'field') drawField(ctx, st)
  else if (st.design === 'poster') drawPoster(ctx, st)
  else drawBadge(ctx, st)
  ctx.restore()
}

// ── Design 1: the yellow field ─────────────────────────────────────────────

function drawField(ctx: CanvasRenderingContext2D, st: CardState) {
  const role = ROLES[st.role]
  ctx.fillStyle = C.yellow
  ctx.fillRect(0, 0, SIZE, SIZE)

  drawLogo(ctx, st.logo, 64, 64, 400)

  // The dates, top right, over a blue rule.
  ctx.fillStyle = C.blue
  ctx.font = `700 34px ${TEXT}`
  ctx.textAlign = 'right'
  ctx.fillText(DATE_SHORT, SIZE - 64, 108)
  ctx.fillRect(SIZE - 64 - 260, 126, 260, 4)
  ctx.textAlign = 'left'

  // I'M GOING / TO MAKER FAIRE KOCHI
  ctx.fillStyle = C.blue
  const head = `I’M ${role.word}`
  const hs = fitSize(ctx, head, DISPLAY, '400', SIZE - 128, 150)
  ctx.font = `400 ${hs}px ${DISPLAY}`
  ctx.fillText(head, 60, 210 + hs * 0.82)
  ctx.fillStyle = C.ink
  ctx.font = `700 40px ${TEXT}`
  ctx.fillText(`${role.joiner} MAKER FAIRE KOCHI`, 64, 210 + hs + 52)

  // The photo, framed in an ink hairline with cyan corner ticks.
  const f = photoFrame('field')
  clipRect(ctx, f, () => drawPhoto(ctx, st, f, '#C9C3F5', C.white))
  ctx.strokeStyle = C.ink
  ctx.lineWidth = 3
  ctx.strokeRect(f.x, f.y, f.w, f.h)
  cornerTicks(ctx, f, C.cyan)

  // The right column: where, and who.
  const x = 632
  const w = SIZE - 64 - x
  ctx.fillStyle = C.red
  ctx.fillRect(x, f.y, 72, 8)
  ctx.fillStyle = C.ink
  ctx.font = `600 26px ${TEXT}`
  ctx.fillText('SEE YOU AT', x, f.y + 62)
  ctx.fillStyle = C.blue
  const y = wrapLines(ctx, VENUE, x, f.y + 120, w, `400 44px ${DISPLAY}`, 52)
  ctx.fillStyle = C.ink
  ctx.font = `700 28px ${TEXT}`
  ctx.fillText(PLACE, x, y + 30)

  if (st.name.trim()) {
    const who = fitBlock(ctx, st.name.trim().toUpperCase(), DISPLAY, '400', w, 2, 44)
    const lh = Math.round(who.size * 1.08)
    const last = f.y + f.h - 14
    const first = last - (who.lines.length - 1) * lh
    ctx.fillStyle = C.ink
    ctx.font = `600 22px ${TEXT}`
    ctx.fillText(roleBadge({ ...st, foil: false }), x, first - who.size - 16)
    ctx.fillStyle = C.blue
    ctx.font = `400 ${who.size}px ${DISPLAY}`
    who.lines.forEach((l, i) => ctx.fillText(l, x, first + i * lh))
  }

  // The foot: a blue band with the date and the address of the site.
  ctx.fillStyle = C.blue
  ctx.fillRect(0, SIZE - 76, SIZE, 76)
  ctx.fillStyle = C.yellow
  ctx.font = `400 30px ${DISPLAY}`
  ctx.fillText(DATE_LONG, 64, SIZE - 26)
  ctx.fillStyle = C.white
  ctx.font = `700 26px ${TEXT}`
  ctx.textAlign = 'right'
  ctx.fillText('FREE ENTRY · MAKERFAIRE.IN', SIZE - 64, SIZE - 28)
  ctx.textAlign = 'left'
}

// ── Design 2: the blue poster ──────────────────────────────────────────────

function drawPoster(ctx: CanvasRenderingContext2D, st: CardState) {
  const role = ROLES[st.role]
  ctx.fillStyle = C.blue
  ctx.fillRect(0, 0, SIZE, SIZE)

  // The photo fills the right, cut on a diagonal with a yellow edge.
  const f = photoFrame('poster')
  const edge = (y: number) => 660 - (y / SIZE) * 140 // x of the cut at height y
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(edge(0), 0)
  ctx.lineTo(SIZE, 0)
  ctx.lineTo(SIZE, SIZE)
  ctx.lineTo(edge(SIZE), SIZE)
  ctx.closePath()
  ctx.clip()
  drawPhoto(ctx, st, f, '#5A4BE3', '#8F86EE')
  ctx.restore()
  ctx.strokeStyle = C.yellow
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(edge(0) - 4, -10)
  ctx.lineTo(edge(SIZE) - 4, SIZE + 10)
  ctx.stroke()

  drawLogo(ctx, st.logo, 56, 56, 360)

  // I'M / GOING / TO / KOCHI!, each line fitted to the column.
  const colW = edge(SIZE) - 56 - 40
  const lines = ['I’M', role.word, role.joiner, 'KOCHI!']
  const caps = [150, 150, 90, 150]
  let y = 180
  ctx.fillStyle = C.yellow
  lines.forEach((line, i) => {
    const s = fitSize(ctx, line, DISPLAY, '400', colW, caps[i]!)
    ctx.font = `400 ${s}px ${DISPLAY}`
    ctx.fillStyle = i === 2 ? C.white : C.yellow
    y += s * 1.0
    ctx.fillText(line, 52, y)
    y += s * 0.12
  })

  // The date block: the one red, the action colour, carrying the when.
  ctx.font = `400 40px ${DISPLAY}`
  const dw = ctx.measureText(DATE_SHORT).width
  ctx.fillStyle = C.red
  ctx.fillRect(56, SIZE - 250, dw + 48, 92)
  ctx.fillStyle = C.white
  ctx.fillText(DATE_SHORT, 80, SIZE - 188)
  ctx.font = `700 24px ${TEXT}`
  ctx.fillStyle = C.white
  ctx.fillText(VENUE, 56, SIZE - 112)
  ctx.fillStyle = C.onBlueLabel
  ctx.fillText(`${PLACE} · FREE ENTRY`, 56, SIZE - 76)

  // The name, on a yellow tag over the photo.
  if (st.name.trim()) {
    const name = st.name.toUpperCase()
    ctx.font = `400 36px ${DISPLAY}`
    const s = fitSize(ctx, name, DISPLAY, '400', 400, 36)
    ctx.font = `400 ${s}px ${DISPLAY}`
    const tw = ctx.measureText(name).width
    const tx = SIZE - 56 - tw - 48
    ctx.fillStyle = C.yellow
    ctx.fillRect(tx, SIZE - 136, tw + 48, 80)
    ctx.fillStyle = C.blue
    ctx.fillText(name, tx + 24, SIZE - 82)
  }
}

// ── Design 3: the badge ────────────────────────────────────────────────────

function drawBadge(ctx: CanvasRenderingContext2D, st: CardState) {
  const role = ROLES[st.role]
  // Paper with the site's dot grid. It stays still; the badge swings over it.
  ctx.fillStyle = C.paper
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.fillStyle = 'rgba(34, 34, 34, 0.16)'
  for (let gx = 12; gx < SIZE; gx += 24) {
    for (let gy = 12; gy < SIZE; gy += 24) {
      ctx.beginPath()
      ctx.arc(gx, gy, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const card = { x: 190, y: 150, w: 700, h: 870 }

  // The whole lanyard hangs from a point above the frame and swings about it.
  ctx.save()
  const pivotY = -260
  ctx.translate(SIZE / 2, pivotY + (st.drop ?? 0))
  ctx.rotate(st.swing ?? 0)
  ctx.translate(-SIZE / 2, -pivotY)

  // The strap: red webbing, or (egg) a twisted coir rope.
  if (st.coir) {
    ctx.fillStyle = '#8A5A2B'
    ctx.fillRect(SIZE / 2 - 22, pivotY, 44, card.y + 26 - pivotY)
    ctx.strokeStyle = '#5C3A17'
    ctx.lineWidth = 5
    for (let y = pivotY; y < card.y + 26; y += 22) {
      ctx.beginPath()
      ctx.moveTo(SIZE / 2 - 22, y)
      ctx.lineTo(SIZE / 2 + 22, y + 16)
      ctx.stroke()
    }
  }
  else {
    ctx.fillStyle = C.red
    ctx.fillRect(SIZE / 2 - 40, pivotY, 80, card.y + 26 - pivotY)
  }
  ctx.fillStyle = C.ink
  ctx.fillRect(SIZE / 2 - 56, card.y - 22, 112, 40)

  // The card, with a hard ink shadow, in the hairline drawing style.
  ctx.fillStyle = C.ink
  roundRect(ctx, card.x + 14, card.y + 14, card.w, card.h, 28)
  ctx.fill()
  ctx.fillStyle = C.white
  roundRect(ctx, card.x, card.y, card.w, card.h, 28)
  ctx.fill()
  ctx.save()
  roundRect(ctx, card.x, card.y, card.w, card.h, 28)
  ctx.clip()
  ctx.fillStyle = C.yellow
  ctx.fillRect(card.x, card.y, card.w, 200)
  ctx.fillStyle = C.ink
  ctx.fillRect(card.x, card.y + 200, card.w, 3)
  ctx.restore()

  drawLogo(ctx, st.logo, SIZE / 2 - 260, card.y + 82, 520)

  // Photo.
  const f = photoFrame('badge')
  clipRect(ctx, f, () => drawPhoto(ctx, st, f, '#C9C3F5', C.white))
  ctx.strokeStyle = C.blue
  ctx.lineWidth = 6
  ctx.strokeRect(f.x, f.y, f.w, f.h)

  // Who: the role, the name (or the role again, big), the date pill, the venue.
  const x = f.x + f.w + 36
  const w = card.x + card.w - 40 - x
  const name = st.name.trim().toUpperCase()
  const badgeRole = roleBadge(st)
  ctx.fillStyle = C.red
  ctx.font = `700 24px ${TEXT}`
  ctx.fillText(name ? badgeRole : 'PASS', x, f.y + 26)
  ctx.fillStyle = C.blue
  const who = fitBlock(ctx, name || badgeRole, DISPLAY, '400', w, 2, 54)
  ctx.font = `400 ${who.size}px ${DISPLAY}`
  const lh = Math.round(who.size * 1.08)
  who.lines.forEach((l, i) => ctx.fillText(l, x, f.y + 34 + who.size * 0.92 + i * lh))
  let y = f.y + 34 + who.size * 0.92 + (who.lines.length - 1) * lh + 22

  y = Math.max(y, f.y + 130)
  ctx.fillStyle = C.red
  ctx.font = `700 26px ${TEXT}`
  const pw = ctx.measureText(DATE_SHORT).width + 44
  roundRect(ctx, x, y, pw, 50, 25)
  ctx.fill()
  ctx.fillStyle = C.white
  ctx.fillText(DATE_SHORT, x + 22, y + 34)

  ctx.fillStyle = C.ink
  ctx.font = `600 18px ${TEXT}`
  ctx.fillText('VENUE', x, y + 88)
  ctx.fillStyle = C.blue
  wrapLines(ctx, `${VENUE}, KOCHI`, x, y + 116, w, `700 20px ${TEXT}`, 26, 3)

  // I'M GOING across the card.
  const head = `I’M ${role.word}`
  ctx.fillStyle = C.blue
  const hs = fitSize(ctx, head, DISPLAY, '400', card.w - 76, 84)
  ctx.font = `400 ${hs}px ${DISPLAY}`
  const headBase = f.y + f.h + 40 + hs * 0.8
  ctx.fillText(head, card.x + 38, headBase)

  // The foot: a barcode and the site on the left, a working QR code on the right.
  const qs = 136
  const qx = card.x + card.w - 40 - qs
  const qy = card.y + card.h - 36 - qs
  barcode(ctx, card.x + 40, qy + 8, qx - card.x - 40 - 28, 76, `${st.role}${name}`)
  ctx.fillStyle = C.ink
  ctx.font = `700 22px ${TEXT}`
  ctx.fillText('MAKERFAIRE.IN', card.x + 40, qy + qs - 4)
  drawQr(ctx, qx, qy, qs)

  // Egg: a holographic foil over the whole card, its shine following the swing.
  if (st.foil) {
    ctx.save()
    roundRect(ctx, card.x, card.y, card.w, card.h, 28)
    ctx.clip()
    const t = (st.swing ?? 0) * 900
    const g = ctx.createLinearGradient(card.x + t, card.y, card.x + card.w + t, card.y + card.h)
    const hues = ['#FF5A5F', '#FFE86C', '#5CE1A0', '#00AEEF', '#8F86EE', '#FF5A5F']
    hues.forEach((h, i) => g.addColorStop(i / (hues.length - 1), h))
    ctx.globalAlpha = 0.28
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = g
    ctx.fillRect(card.x, card.y, card.w, card.h)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 0.35
    const sx = card.x + card.w * 0.5 + t * 0.6
    const shine = ctx.createLinearGradient(sx - 160, card.y, sx + 160, card.y + 220)
    shine.addColorStop(0, 'rgba(255,255,255,0)')
    shine.addColorStop(0.5, 'rgba(255,255,255,0.9)')
    shine.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = shine
    ctx.fillRect(card.x, card.y, card.w, card.h)
    ctx.restore()
  }

  ctx.strokeStyle = C.ink
  ctx.lineWidth = 4
  roundRect(ctx, card.x, card.y, card.w, card.h, 28)
  ctx.stroke()
  // The slot the clip goes through.
  ctx.fillStyle = C.paper
  roundRect(ctx, SIZE / 2 - 50, card.y + 24, 100, 18, 9)
  ctx.fill()
  ctx.stroke()

  ctx.restore()
}

/** A real QR code (to QR_URL), campaign blue on white with its quiet zone. */
function drawQr(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const { n, dark } = qrMatrix()
  const quiet = 2
  const cell = size / (n + quiet * 2)
  ctx.fillStyle = C.white
  ctx.fillRect(x, y, size, size)
  ctx.fillStyle = C.blue
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (dark(r, c)) {
        // Whole pixels, slightly overlapping, so no hairline seams show between modules.
        ctx.fillRect(Math.floor(x + (c + quiet) * cell), Math.floor(y + (r + quiet) * cell), Math.ceil(cell) + 0.5, Math.ceil(cell) + 0.5)
      }
    }
  }
}

// ── Pieces ─────────────────────────────────────────────────────────────────

/** The lockup on its own plaque; a plain plaque stands in until it loads. */
function drawLogo(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null, x: number, y: number, w: number) {
  const h = w / LOGO_RATIO
  if (logo?.complete && logo.naturalWidth) ctx.drawImage(logo, x, y, w, h)
  else {
    ctx.fillStyle = C.white
    ctx.fillRect(x, y, w, h)
  }
}

function drawPhoto(ctx: CanvasRenderingContext2D, st: CardState, f: Frame, ground: string, figure: string) {
  if (!st.photo) {
    // A placeholder figure, so the card reads before a photo is chosen.
    ctx.fillStyle = ground
    ctx.fillRect(f.x, f.y, f.w, f.h)
    const cx = f.x + Math.min(f.w, 560) / 2 + (f.w > 560 ? (f.w - 560) / 2 + 40 : 0)
    const u = Math.min(f.w, f.h)
    ctx.fillStyle = figure
    ctx.beginPath()
    ctx.arc(cx, f.y + f.h * 0.5 - u * 0.12, u * 0.16, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx, f.y + f.h * 0.5 + u * 0.34, u * 0.32, u * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  const fit = photoFit(st.photo, f, st.zoom)
  const dx = f.x + (f.w - fit.w) / 2 + st.panX * fit.slackX
  const dy = f.y + (f.h - fit.h) / 2 + st.panY * fit.slackY
  ctx.drawImage(st.photo, dx, dy, fit.w, fit.h)
}

function clipRect(ctx: CanvasRenderingContext2D, f: Frame, draw: () => void) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(f.x, f.y, f.w, f.h)
  ctx.clip()
  draw()
  ctx.restore()
}

function cornerTicks(ctx: CanvasRenderingContext2D, f: Frame, colour: string) {
  ctx.strokeStyle = colour
  ctx.lineWidth = 6
  const t = 34
  const o = 10
  const corners: [number, number, number, number][] = [
    [f.x - o, f.y - o, 1, 1], [f.x + f.w + o, f.y - o, -1, 1],
    [f.x - o, f.y + f.h + o, 1, -1], [f.x + f.w + o, f.y + f.h + o, -1, -1],
  ]
  for (const [x, y, sx, sy] of corners) {
    ctx.beginPath()
    ctx.moveTo(x, y + sy * t)
    ctx.lineTo(x, y)
    ctx.lineTo(x + sx * t, y)
    ctx.stroke()
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** The largest size (<= max) at which `text` fits `maxW`. */
function fitSize(ctx: CanvasRenderingContext2D, text: string, family: string, weight: string, maxW: number, max: number) {
  ctx.font = `${weight} 100px ${family}`
  const w100 = ctx.measureText(text).width || 1
  return Math.max(12, Math.min(max, Math.floor((maxW / w100) * 100)))
}

/** Break `text` into lines no wider than `maxW` in the current font (a single long word stays whole). */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > maxW) {
      lines.push(line)
      line = word
    }
    else line = next
  }
  if (line) lines.push(line)
  return lines
}

/**
 * The largest size (<= max) at which `text`, word-wrapped, takes at most `maxLines`
 * lines and EVERY line fits `maxW` -- a name's longest word, not its first, sets the size.
 */
function fitBlock(
  ctx: CanvasRenderingContext2D, text: string, family: string, weight: string,
  maxW: number, maxLines: number, max: number,
) {
  for (let size = max; size > 12; size -= 1) {
    ctx.font = `${weight} ${size}px ${family}`
    const lines = wrap(ctx, text, maxW)
    if (lines.length <= maxLines && lines.every(l => ctx.measureText(l).width <= maxW)) return { size, lines }
  }
  ctx.font = `${weight} 12px ${family}`
  return { size: 12, lines: wrap(ctx, text, maxW).slice(0, maxLines) }
}

/** Word-wrap `text` into `maxW`; returns the baseline y after the last line. */
function wrapLines(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number,
  font: string, lh: number, maxLines = 4,
) {
  ctx.font = font
  const lines = wrap(ctx, text, maxW)
  const shown = lines.slice(0, maxLines)
  if (lines.length > maxLines) shown[maxLines - 1] = `${shown[maxLines - 1]}…`
  shown.forEach((l, i) => ctx.fillText(l, x, y + i * lh))
  return y + (shown.length - 1) * lh + lh * 0.4
}

/** A decorative barcode, seeded from the card so it does not flicker as you type. */
function barcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: string) {
  let s = 2166136261
  for (const ch of seed) s = Math.imul(s ^ ch.charCodeAt(0), 16777619)
  const rnd = () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)
    return ((s >>> 0) % 1000) / 1000
  }
  ctx.fillStyle = C.blue
  let cx = x
  while (cx < x + w) {
    const bw = 3 + Math.floor(rnd() * 3) * 3
    if (cx + bw > x + w) break
    ctx.fillRect(cx, y, bw, h)
    cx += bw + 3 + Math.floor(rnd() * 3) * 3
  }
}
