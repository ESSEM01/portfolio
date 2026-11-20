import * as THREE from 'three'
import { openLayout } from './sheetLayout'

/** Record (sleeve) size in world units. */
export const S = 2
/** Thickness of one sleeve panel. */
export const PANEL = 0.022
/** Distance between records standing in the crate. */
export const SPACING = 0.17
/** Height of the arc a record follows when it goes over the others, front to back or back to front. */
export const OVER_ARC = 2.0
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
  floor: 0.05,
}

/** z of slot i in the crate (slot 0 at the front; fractional while a record moves). */
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

/** World pose that shows a record facing the camera, `page` px wide, with its bottom centre at (originX, originY). */
function poseAt(camera: THREE.PerspectiveCamera, width: number, height: number, page: number, originX: number, originY: number) {
  const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  const pxPerUnit = height / (2 * tan * OPEN_DISTANCE)

  camera.getWorldDirection(forward)
  right.setFromMatrixColumn(camera.matrixWorld, 0)
  up.setFromMatrixColumn(camera.matrixWorld, 1)

  const position = camera.position
    .clone()
    .addScaledVector(forward, OPEN_DISTANCE)
    .addScaledVector(right, (originX - width / 2) / pxPerUnit)
    .addScaledVector(up, (height / 2 - originY) / pxPerUnit)

  return { position, quaternion: camera.quaternion.clone(), scale: page / (S * pxPerUnit) }
}

/**
 * The two poses of a record pulled out of the crate:
 * - front: closed, large and centred in front of everything, so the cover can be seen;
 * - open: where openLayout puts the book, next to the notes sheet.
 */
export function openPlacement(camera: THREE.PerspectiveCamera, width: number, height: number) {
  const layout = openLayout(width, height)
  const cover = Math.min(width * 0.78, height * 0.62, 520)
  return {
    front: poseAt(camera, width, height, cover, width / 2, height / 2 + cover / 2),
    open: poseAt(camera, width, height, layout.page, layout.originX, layout.originY),
  }
}
