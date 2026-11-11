/**
 * The media pack's share cards, drawn straight onto a 1080x1080 canvas so the
 * preview IS the download: no DOM-to-image step, nothing leaves the device.
 *
 * Three designs in the campaign's language: the yellow field, the blue poster
 * and a lanyard badge. Every design uses the real Maker Faire Kochi lockup on its
 * own plaque (never retypeset), Dela Gothic One for display and Inter for text,
 * and the facts from EVENT.
 */
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
    ctx.fillStyle = C.ink
    ctx.font = `600 22px ${TEXT}`
    ctx.fillText(role.badge, x, f.y + f.h - 70)
    ctx.fillStyle = C.blue
    const ns = fitSize(ctx, st.name.toUpperCase(), DISPLAY, '400', w, 44)
    ctx.font = `400 ${ns}px ${DISPLAY}`
    ctx.fillText(st.name.toUpperCase(), x, f.y + f.h - 14)
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
  // Paper with the site's dot grid.
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

  // The lanyard: a red strap to a clip.
  ctx.fillStyle = C.red
  ctx.fillRect(SIZE / 2 - 40, 0, 80, card.y + 26)
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
  ctx.strokeStyle = C.ink
  ctx.lineWidth = 4
  roundRect(ctx, card.x, card.y, card.w, card.h, 28)
  ctx.stroke()
  // The slot the clip goes through.
  ctx.fillStyle = C.paper
  roundRect(ctx, SIZE / 2 - 50, card.y + 24, 100, 18, 9)
  ctx.fill()
  ctx.stroke()

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
  ctx.fillStyle = C.red
  ctx.font = `700 24px ${TEXT}`
  ctx.fillText(name ? role.badge : 'PASS', x, f.y + 26)
  ctx.fillStyle = C.blue
  let y = wrapLines(ctx, name || role.badge, x, f.y + 84, w, `400 ${fitSize(ctx, (name || role.badge).split(' ')[0]!, DISPLAY, '400', w, 54)}px ${DISPLAY}`, 58, 2)

  y = Math.max(y + 8, f.y + 170)
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

  // I'M GOING, and a barcode under it.
  const head = `I’M ${role.word}`
  ctx.fillStyle = C.blue
  const hs = fitSize(ctx, head, DISPLAY, '400', card.w - 76, 84)
  ctx.font = `400 ${hs}px ${DISPLAY}`
  ctx.fillText(head, card.x + 38, f.y + f.h + 52 + hs * 0.8)
  barcode(ctx, card.x + 40, card.y + card.h - 112, card.w - 80, 64, `${st.role}${name}`)
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

/** Word-wrap `text` into `maxW`; returns the baseline y after the last line. */
function wrapLines(
  ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number,
  font: string, lh: number, maxLines = 4,
) {
  ctx.font = font
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > maxW) {
      lines.push(line)
      line = word
    }
    else line = next
  }
  if (line) lines.push(line)
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
