import assert from 'node:assert/strict'
import * as THREE from 'three'
import { DT, FixedClock } from '../app/three/core/clock'
import { createMaterials } from '../app/three/core/kit'
import { readPalette } from '../app/three/core/palette'
import createScene from '../app/three/scenes/makey404'
import { FACEPALM, FACEPALM_LIMITS, MakeyFacepalm, facepalmPose } from '../app/three/robots/makey/facepalm'
import { ARM_L, MAKEY_GAIT, NQ, lerpPose, newPose, poseJoints } from '../app/three/robots/makey/gait'
import { buildMakey, createSkeleton, poseSkeleton } from '../app/three/robots/makey/model'

const sk = createSkeleton(), q = new Array(NQ).fill(0), p = newPose()
// Only the radial eye/shadow textures need a DOM stand-in in this headless test.
const palette = readPalette()
Object.assign(globalThis, { document: { createElement: () => ({ getContext: () => ({
  createRadialGradient: () => ({ addColorStop() {} }), fillRect() {},
}) }) } })
const materials = createMaterials(palette)
const parts = buildMakey(materials, 'accent', sk)
const v = new THREE.Vector3(), last = new THREE.Vector3(), inv = new THREE.Matrix4()
let speed = 0, clearance = Infinity, contact = Infinity, maxYaw = 0
// Actual mitten triangles (vertices, edge midpoints and face centres), and
// cylinders enclosing both arm members. Test in the moving neck's frame.
const samples: { joint: THREE.Object3D, points: THREE.Vector3[] }[] = []
for (const [side, a] of sk.arms.entries()) {
  const points: THREE.Vector3[] = []
  const source = parts.rig.src.byMat.get('light')!.find(p => p.node === side * 3 + 2)!.pos
  for (let i = 0; i < source.length; i += 9) {
    const a = new THREE.Vector3().fromArray(source, i), b = new THREE.Vector3().fromArray(source, i + 3), c = new THREE.Vector3().fromArray(source, i + 6)
    points.push(a, b, c, a.clone().add(b).multiplyScalar(0.5), b.clone().add(c).multiplyScalar(0.5), c.clone().add(a).multiplyScalar(0.5), a.clone().add(b).add(c).divideScalar(3))
  }
  samples.push({ joint: a.wrist, points })
  for (const [joint, length, radius] of [[a.shoulder, 0.044, 0.0165], [a.elbow, 0.04, 0.0155]] as const) {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 12; i++) for (let j = 0; j < 16; j++) {
      const t = j * Math.PI / 8
      points.push(new THREE.Vector3(radius * Math.cos(t), -length * i / 12, radius * Math.sin(t)))
    }
    samples.push({ joint, points })
  }
}

// Half-step samples cover the interpolated drawing too, for two entire rounds.
for (let i = 0; i <= FACEPALM.duration * 2 / (DT / 2); i++) {
  const t = i * DT / 2
  const a = facepalmPose(Math.floor(t / DT) * DT, newPose())
  const b = facepalmPose((Math.floor(t / DT) + 1) * DT, newPose())
  lerpPose(a, b, (t / DT) % 1, p)
  poseJoints(p, q)
  poseSkeleton(sk, p, q)
  sk.root.updateMatrixWorld(true)
  inv.copy(sk.neck.matrixWorld).invert()
  for (let j = 0; j < 5; j++) {
    const [lo, hi] = FACEPALM_LIMITS[j]!
    assert(q[ARM_L + j]! >= lo && q[ARM_L + j]! <= hi, `arm joint ${j} at ${t}`)
    const right = q[17 + j]! * (j === 1 ? -1 : 1)
    assert(right >= lo && right <= hi, `resting arm joint ${j}`)
  }
  maxYaw = Math.max(maxYaw, Math.abs(p.neckYaw))
  const hand = new THREE.Vector3(0, -0.0156, 0).applyMatrix4(sk.arms[0]!.wrist.matrixWorld)
  if (i) speed = Math.max(speed, hand.distanceTo(last) / (DT / 2))
  last.copy(hand)
  for (const { joint, points } of samples) for (const point of points) {
    v.copy(point).applyMatrix4(joint.matrixWorld).applyMatrix4(inv)
    // The dome's lathed profile is INSIDE this analytic cylinder/ellipsoid.
    // Passing its conservative envelope also clears the actual polygonal dome.
    if (v.y < 0 || v.y > 0.092) continue
    const radius = v.y <= 0.04 ? 0.063 : 0.063 * Math.sqrt(Math.max(0, 1 - ((v.y - 0.04) / 0.052) ** 2))
    const gap = Math.hypot(v.x, v.z) - radius
    clearance = Math.min(clearance, gap)
    if (Math.abs(t - FACEPALM.smack) < 0.0001 && joint === sk.arms[0]!.wrist) contact = Math.min(contact, gap)
  }
}
assert(contact >= 0 && contact < 0.002, `mitten reaches dome at smack: ${contact} m`)
assert(clearance >= 0, `arm and mitten never penetrate dome: ${clearance} m`)
assert(speed <= 4, `hand speed <= 4 m/s: ${speed}`)
assert(maxYaw <= MAKEY_GAIT.neckYawLimit && maxYaw <= 0.4, `sane neck yaw: ${maxYaw}`)

function run(hz: number) {
  const clock = new FixedClock(), motion = new MakeyFacepalm(), states: string[] = []
  let count = 0
  for (let now = 0; count < 4800; now += 1000 / hz) clock.advance(now, () => {
    if (count >= 4800) return
    motion.step(DT)
    states.push(JSON.stringify(motion.cur))
    count++
  })
  return states
}
assert.deepEqual(run(60), run(60), 'identical output twice')
assert.deepEqual(run(30), run(144), 'identical output across frame rates')
assert.deepEqual(facepalmPose(0, newPose()), facepalmPose(FACEPALM.duration, newPose()), 'loop closes')

parts.dispose()
// Build the actual scene and count its renderable geometry.
const scene = await createScene({ materials, palette, width: 600, height: 480, coarse: false, posterMode: false })
let calls = 0, triangles = 0
scene.frame(1)
scene.scene.traverse((o) => {
  const mesh = o as THREE.Mesh
  if (!o.visible) return
  if (mesh.isMesh || (o as THREE.LineSegments).isLineSegments || (o as THREE.Sprite).isSprite) calls++
  if (mesh.isMesh) triangles += (mesh.geometry.index?.count ?? mesh.geometry.attributes.position!.count) / 3
  if ((o as THREE.Sprite).isSprite) triangles += 2
})
assert(calls <= 70 && triangles <= 80000, `scene budget: ${calls} calls / ${triangles} triangles`)
for (let i = 0; i < FACEPALM.smack / DT; i++) scene.step(DT)
scene.frame(1)
const neck = scene.scene.getObjectByName('neck')!
inv.copy(neck.matrixWorld).invert()
const mittens = scene.scene.getObjectByName('makey-limbs:light') as THREE.Mesh
const vertices = mittens.geometry.attributes.position!
let actualContact = Infinity
for (let i = 0; i < vertices.count; i++) {
  v.fromBufferAttribute(vertices, i).applyMatrix4(mittens.matrixWorld).applyMatrix4(inv)
  if (v.y < 0 || v.y > 0.092) continue
  const radius = v.y <= 0.04 ? 0.063 : 0.063 * Math.sqrt(Math.max(0, 1 - ((v.y - 0.04) / 0.052) ** 2))
  actualContact = Math.min(actualContact, Math.hypot(v.x, v.z) - radius)
}
assert(actualContact >= 0 && actualContact < 0.002, `actual mitten surface reaches dome: ${actualContact} m`)
scene.dispose()
materials.dispose()
Reflect.deleteProperty(globalThis, 'document')
console.log(`PASS facepalm: contact ${(contact * 1000).toFixed(2)} mm; clearance ${(clearance * 1000).toFixed(2)} mm; speed ${speed.toFixed(3)} m/s; yaw ${maxYaw.toFixed(3)} rad; joint limits, interpolation, deterministic loops at 30/60/144 Hz`)
console.log(`PASS scene geometry budget: ${calls} drawables, ${triangles} triangles (headless count)`)
