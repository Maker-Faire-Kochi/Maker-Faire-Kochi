/**
 * Measured from the source film with ffprobe. Do not guess these.
 *
 *   sha256 b882d393902ff49f140fe81b147cac1da1da38357a09d5d5a858fc0922d0405f
 *   1280x720, h264 yuv420p, 24/1 fps, 240 frames, 10.005s, 2643784 bytes
 *
 * Recorded in ../reference/source.sha256.
 */
export const SOURCE = {
  file: 'source.mp4',
  width: 1280,
  height: 720,
  fps: 24,
  durationInFrames: 240,
} as const;

/**
 * Beats, measured by stepping frames — not estimated.
 *
 *   0-48    close on the fisherman knotting; red thread trails right
 *   48-120  camera pans right, mesh unfurls, waterline appears
 *   120-192 rope with red float-knots; cheena vala enters right
 *   192-239 pull back to wide: fisherman -> net -> rope -> cheena vala
 */
export const BEATS = {
  knot: {from: 0, to: 48},
  unfurl: {from: 48, to: 120},
  reveal: {from: 120, to: 192},
  settle: {from: 192, to: 240},
} as const;

/**
 * The hero cut: source frames 82 -> 190.
 *
 * NOT the last 4.5s. The film pans right to the cheena vala, peaks around
 * f180-190, then pans BACK left and ends on the fisherman close-up with the rig
 * clipped off frame. Cutting to f239 would have ended the hero on the weakest
 * composition in the film — verified frame by frame, see ../reference/.
 *
 * f82  fisherman at the left edge, red net, rope running right
 * f110 cheena vala enters
 * f150 red net has faded through to teal (the film's own thread->net beat)
 * f190 full rig settled, operator on the platform — the peak, and the poster
 *
 * 108 frames = 4.5s at 24fps. Under the 5s WCAG 2.2.2 threshold for auto-moving
 * content, so the hero needs no pause control.
 */
export const HERO_CUT = {
  startFrom: 82,
  durationInFrames: 108,
} as const;

/** Last frame of HERO_CUT, in the cut's own timeline. The poster still. */
export const HERO_POSTER_FRAME = HERO_CUT.durationInFrames - 1;
