import { smooth } from '../dog/kin'
import { ARM_L, MAKEY_GAIT, copyPose, newPose, type MakeyPose } from './gait'
import { LEG } from './ik'

// An isolated pose layer: never installed on Makey's homepage gait.
// The rig has no arm limit table; this script uses this conservative envelope
// (radians, shoulder X/Z, elbow X/Z, wrist Z) and tests every rendered blend.
export const FACEPALM_LIMITS = [[-1.5, 1.5], [0, 2.8], [-2.5, 0.1], [-1.5, 1.5], [-0.8, 0.8]] as const
export const FACEPALM = { duration: 12, smack: 3.1, shake: 4, release: 7.2 } as const
const REST = [0.05, 0.12, -0.25, 0, 0]
const OUT = [-0.85982, 1.19975, -0.84194, 0.52935, -0.04046]
const HOVER = [-0.02170, 2.39192, -0.96298, 0.72353, 0.27035]
const TOUCH = [0.37445, 2.69079, 0.05567, 0.81897, 0.56006]
const KEYS = [
  [0, REST], [1.4, REST], [2.25, OUT], [2.9, HOVER],
  [FACEPALM.smack, TOUCH], [7.2, TOUCH], [7.55, HOVER], [8.3, OUT], [9.3, REST], [12, REST],
] as const

/** Absolute loop time makes both fixed steps and poster capture reproducible. */
export function facepalmPose(time: number, p: MakeyPose) {
  const t = ((time % FACEPALM.duration) + FACEPALM.duration) % FACEPALM.duration
  p.y = MAKEY_GAIT.standH
  p.feet[0].x = LEG.hipW
  p.feet[1].x = -LEG.hipW
  const look = smooth(Math.min(1, t / 0.5)) * (1 - smooth(Math.max(0, Math.min(1, (t - 1) / 0.4))))
  p.neckYaw = -0.35 * look
  p.neckPitch = -0.22 * look
  p.headTilt = 0
  const shake = Math.max(0, Math.min(1, (t - FACEPALM.shake) / 3.2))
  if (t >= FACEPALM.shake && t < FACEPALM.release) {
    p.neckYaw = 0.27 * Math.sin(shake * Math.PI * 6) * Math.sin(Math.PI * Math.min(1, shake * 4)) * (1 - shake)
  }
  // A small recoil at contact, held below the collision-tested dome envelope.
  const beat = Math.max(0, 1 - Math.abs(t - (FACEPALM.smack + 0.08)) / 0.08)
  p.headTilt = -0.025 * beat
  const dim = smooth(Math.min(1, Math.max(0, (t - 2.9) / 0.3))) * (1 - smooth(Math.min(1, Math.max(0, (t - 8.3) / 1))))
  p.glow = 0.7 - 0.5 * dim
  for (let k = 1; k < KEYS.length; k++) {
    const [end, b] = KEYS[k]!, [start, a] = KEYS[k - 1]!
    if (t > end) continue
    const u = smooth((t - start) / (end - start))
    for (let j = 0; j < 5; j++) p.q[ARM_L + j] = a[j]! + (b[j]! - a[j]!) * u
    break
  }
  for (let j = 0; j < 5; j++) p.q[17 + j] = REST[j]! * (j === 1 ? -1 : 1)
  return p
}

/** The still the 404's poster shows, and where the live loop starts: hand on his head, a beat before the shake. */
export const FACEPALM_POSTER_T = FACEPALM.smack + 0.4

export class MakeyFacepalm {
  readonly cur: MakeyPose
  readonly prev: MakeyPose
  private ticks = 0
  /** `start` is seconds into the loop: the live scene begins on the poster's own frame, so the hand-over cannot be seen. */
  constructor(private readonly start = 0) {
    this.cur = facepalmPose(start, newPose())
    this.prev = facepalmPose(start, newPose())
  }

  step(dt: number) {
    copyPose(this.cur, this.prev)
    facepalmPose(this.start + ++this.ticks * dt, this.cur)
  }
}
