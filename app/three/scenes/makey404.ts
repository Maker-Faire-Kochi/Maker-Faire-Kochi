import * as THREE from 'three'
import { addLights, contactShadow, fitOrtho } from '../core/kit'
import type { SceneFactory } from '../core/stage'
import { FACEPALM_POSTER_T, MakeyFacepalm, facepalmPose } from '../robots/makey/facepalm'
import { NQ, lerpPose, newPose, poseJoints } from '../robots/makey/gait'
import { buildMakey, createSkeleton, poseSkeleton } from '../robots/makey/model'

const create: SceneFactory = (ctx) => {
  const scene = new THREE.Scene()
  addLights(scene)
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10)
  camera.position.set(0.65, 0.42, 1.3)
  camera.lookAt(0, 0.17, 0)
  const sk = createSkeleton()
  const parts = buildMakey(ctx.materials, 'accent', sk)
  scene.add(sk.root)
  const shadow = contactShadow(ctx.materials, 0.15)
  shadow.position.y = 0.0005
  scene.add(shadow)
  const motion = new MakeyFacepalm(FACEPALM_POSTER_T)
  const pose = newPose(), q = new Array(NQ).fill(0)
  return {
    scene, camera,
    step(dt) { if (!ctx.posterMode) motion.step(dt) },
    frame(alpha) {
      if (ctx.posterMode) facepalmPose(FACEPALM_POSTER_T, pose)
      else lerpPose(motion.prev, motion.cur, alpha, pose)
      poseJoints(pose, q)
      poseSkeleton(sk, pose, q)
      parts.rig.update()
      parts.setGlow(pose.glow)
    },
    resize(w, h) { fitOrtho(camera, w, h, Math.max(0.43, 0.38 / (w / h))) },
    dispose() {
      parts.dispose()
      shadow.geometry.dispose()
      scene.clear()
    },
  }
}
export default create
