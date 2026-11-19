import * as THREE from 'three'
import { openLayout } from './sheetLayout'

/** Record (sleeve) size in world units. */
export const S = 2
/** Thickness of one sleeve panel. */
export const PANEL = 0.022
/** Distance between records standing in the crate. */
export const SPACING = 0.17
/** How far a selected record rises out of the crate (enough to show its title band). */
export const LIFT = 0.8
/** Records lean back slightly, like in a real bin. */
export const LEAN = -0.11
/** How far the front cover swings when the record opens like a book. */
export const OPEN_ANGLE = Math.PI * 0.985
/** Distance from the camera at which an opened record floats. */
const OPEN_DISTANCE = 2.6

export const FOV = 35
const CAMERA_TARGET = new THREE.Vector3(0, 0.95, -0.1)
const CAMERA_DIRECTION = new THREE.Vector3(0, 2.2, 6.5).normalize()
const CAMERA_DISTANCE = 6.1

export const CRATE = {
  innerWidth: S + 0.26,
  innerDepth: 2.15,
  wall: 0.09,
  backHeight: 1.25,
  frontHeight: 0.72,
  floor: 0.06,
}

/** z of record i standing in the crate (record 0 at the front). */
export function crateZ(i: number) {
  return CRATE.innerDepth / 2 - 0.24 - i * SPACING
}

/** On wide screens the crate sits to the right, leaving the left for the text. */
export function crateX(width: number) {
  return width >= 900 ? 1.15 : 0
}

/** Place the camera so the whole crate fits, moving back on narrow screens. */
export function placeCamera(camera: THREE.PerspectiveCamera, width: number, height: number) {
  const aspect = width / height
  const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
  const neededWidth = width >= 900 ? 0 : 3.3
  const distance = Math.max(CAMERA_DISTANCE, neededWidth / (2 * tan * aspect))
  camera.position.copy(CAMERA_TARGET).addScaledVector(CAMERA_DIRECTION, distance)
  // On narrow screens look a little lower, so the crate sits in the upper part.
  camera.lookAt(CAMERA_TARGET.x, CAMERA_TARGET.y - (width >= 900 ? 0 : 0.5), CAMERA_TARGET.z)
  camera.updateMatrixWorld()
}

const forward = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3()

/** World pose that puts an opened record exactly where openLayout says, facing the camera. */
export function openPlacement(camera: THREE.PerspectiveCamera, width: number, height: number) {
  const layout = openLayout(width, height)
  const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  const pxPerUnit = height / (2 * tan * OPEN_DISTANCE)
  const scale = layout.page / (S * pxPerUnit)

  camera.getWorldDirection(forward)
  right.setFromMatrixColumn(camera.matrixWorld, 0)
  up.setFromMatrixColumn(camera.matrixWorld, 1)

  const position = camera.position
    .clone()
    .addScaledVector(forward, OPEN_DISTANCE)
    .addScaledVector(right, (layout.originX - width / 2) / pxPerUnit)
    .addScaledVector(up, (height / 2 - layout.originY) / pxPerUnit)

  return { position, quaternion: camera.quaternion.clone(), scale }
}
