import { ContactShadows } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { records } from '../../content/records'
import type { CrateRecord } from '../../content/records'
import { CrateModel } from './CrateModel'
import { CRATE, LEAN, OPEN_ANGLE, OVER_ARC, PANEL, S, crateX, crateZ, openPlacement, placeCamera } from './layout'
import { coverTexture, grooveTexture, innerLeftTexture, labelTexture, loadFonts, paperTexture } from './textures'

export interface SceneProps {
  selected: number
  open: number | null
  onSelect: (index: number) => void
  onOpen: (index: number) => void
  /** Called once the opened record's cover has swung open, so the notes can appear. */
  onBookOpen: (index: number) => void
  onClose: () => void
}

const damp = THREE.MathUtils.damp
const ease = (t: number) => t * t * (3 - 2 * t)

export function Scene({ selected, open, onSelect, onOpen, onBookOpen, onClose }: SceneProps) {
  const { camera, size } = useThree()
  const [covers, setCovers] = useState<THREE.Texture[] | null>(null)
  const shared = useMemo(() => ({ paper: paperTexture(), groove: grooveTexture() }), [])

  // Covers are drawn into canvases from the same data as the rest of the site.
  useEffect(() => {
    let cancelled = false
    let made: THREE.Texture[] = []
    loadFonts()
      .then(() => Promise.all(records.map((r, i) => coverTexture(r, i + 1, records.length))))
      .then((textures) => {
        made = textures
        if (cancelled) textures.forEach((t) => t.dispose())
        else setCovers(textures)
      })
    return () => {
      cancelled = true
      made.forEach((t) => t.dispose())
    }
  }, [])

  // The camera is placed first, in the same step, because the opened record's pose is
  // measured from it. (Doing these separately left the record behind the veil after a resize.)
  const placement = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera
    placeCamera(cam, size.width, size.height)
    return openPlacement(cam, size.width, size.height)
  }, [camera, size])
  const x = crateX(size.width)

  return (
    <>
      {/* Soft sky/ground fill, plus one key light that casts real shadows into the crate. */}
      <hemisphereLight args={['#ffffff', '#c9b79f', 1.5]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[x - 2.2, 9, 5]}
        intensity={1.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={5}
      >
        <orthographicCamera attach="shadow-camera" args={[-5, 5, 5, -5, 0.5, 22]} />
      </directionalLight>
      <directionalLight position={[x + 4, 3, 3]} intensity={0.35} />

      <CrateModel x={x} />
      {/* Catches the crate's shadow on the (otherwise invisible) floor. */}
      <mesh position={[x, 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <shadowMaterial transparent opacity={0.13} />
      </mesh>
      <ContactShadows position={[x, 0.001, 0]} scale={9} blur={2.6} opacity={0.35} far={2.5} frames={1} />

      {records.map((record, i) => (
        <Record3D
          key={record.id}
          record={record}
          index={i}
          x={x}
          cover={covers?.[i]}
          paper={shared.paper}
          groove={shared.groove}
          selectedIndex={selected}
          open={open === i}
          placement={placement}
          onSelect={onSelect}
          onOpen={onOpen}
          onBookOpen={onBookOpen}
        />
      ))}

      <Backdrop active={open !== null} onClose={onClose} />
    </>
  )
}

interface Record3DProps {
  record: CrateRecord
  index: number
  x: number
  cover?: THREE.Texture
  paper: THREE.Texture
  groove: THREE.Texture
  /** Index of the record at the front of the crate. */
  selectedIndex: number
  open: boolean
  placement: ReturnType<typeof openPlacement>
  onSelect: (index: number) => void
  onOpen: (index: number) => void
  onBookOpen: (index: number) => void
}

const crateQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(LEAN, 0, 0))
const cratePosition = new THREE.Vector3()
const target = new THREE.Vector3()
/** Seconds for a record to leave the crate, open like a book and show its notes, as one movement. */
const OPEN_SECONDS = 1.0
/** Seconds to close it and put it back. */
const CLOSE_SECONDS = 0.7
/** Point of the movement (0..1) at which the notes sheet starts sliding out. */
const NOTES_AT = 0.45
/** Pace of the crate turning: 1 was the original speed, 0.8 is 20% slower. */
const SPEED = 0.8

/**
 * One record. Origin: bottom centre of the sleeve, facing +z.
 * The crate is a loop: the selected record stands in the front slot and the others follow
 * in order behind it. Going to the next record sends the front one over the top to the
 * back; going to the previous one brings the last record over to the front. Opened, a
 * record flies to the camera, the front cover swings left on its spine like a book, and the disc rises.
 */
function Record3D({ record, index, x, cover, paper, groove, selectedIndex, open, placement, onSelect, onOpen, onBookOpen }: Record3DProps) {
  const group = useRef<THREE.Group>(null)
  const hinge = useRef<THREE.Group>(null)
  const disc = useRef<THREE.Group>(null)
  const count = records.length
  // Slot 0 is the front of the crate.
  const slot = (index - selectedIndex + count) % count
  const selected = slot === 0
  // slot: current (fractional) slot, moving from `from` to `to`; wrap: this record is the one
  // going over the top. open: 0..1 clock of the pull-out-and-open movement.
  const motion = useRef({ slot, from: slot, to: slot, sel: selectedIndex, wrap: false, open: 0, announced: false })
  // The inside pages are only drawn once a record has been opened.
  const [opened, setOpened] = useState(false)
  if (open && !opened) setOpened(true)
  const inside = useMemo(
    () => (opened ? { left: innerLeftTexture(record, index + 1, records.length), label: labelTexture(record) } : null),
    [opened, record, index],
  )
  useEffect(() => () => {
    inside?.left.dispose()
    inside?.label.dispose()
  }, [inside])

  const { color } = record.cover
  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: '#e9e6df', roughness: 0.9 })
    const outside = new THREE.MeshStandardMaterial({ color, roughness: 0.75 })
    const inner = new THREE.MeshStandardMaterial({ map: paper, roughness: 0.9 })
    const front = new THREE.MeshStandardMaterial({ color: cover ? '#ffffff' : color, map: cover ?? null, roughness: 0.7 })
    const innerLeft = new THREE.MeshStandardMaterial({ color: '#eceef1', map: inside?.left ?? null, roughness: 0.9 })
    return {
      // Box faces: +x, -x, +y, -y, +z (toward the viewer), -z.
      back: [edge, edge, edge, edge, inner, outside],
      cover: [edge, edge, edge, edge, front, innerLeft],
      all: [edge, outside, inner, front, innerLeft],
    }
  }, [color, cover, paper, inside])
  useEffect(() => () => materials.all.forEach((m) => m.dispose()), [materials])

  useFrame((_, delta) => {
    const g = group.current
    if (!g || !hinge.current || !disc.current) return
    const dt = Math.min(delta, 0.25)
    const m = motion.current

    if (slot !== m.to) {
      // How far the crate turned, the short way round (+1 = next record).
      let step = (selectedIndex - m.sel + count) % count
      if (step > count / 2) step -= count
      // Every record moves `step` slots toward the front, except those that wrap around.
      m.wrap = slot - m.to !== -step
      m.from = m.slot
      m.to = slot
      m.sel = selectedIndex
    }
    m.slot = damp(m.slot, m.to, (m.wrap ? 5 : 9) * SPEED, dt)
    // One continuous movement, driven by a single clock: the record leaves the crate, its
    // cover starts opening while it is still travelling, and the notes come out before it
    // settles. No stage waits for the previous one to finish.
    m.open = THREE.MathUtils.clamp(m.open + (open ? dt / OPEN_SECONDS : -dt / CLOSE_SECONDS), 0, 1)
    if (open && m.open > NOTES_AT && !m.announced) {
      m.announced = true
      onBookOpen(index)
    }
    if (!open) m.announced = false

    const fly = ease(THREE.MathUtils.clamp(m.open / 0.7, 0, 1))
    const fold = ease(THREE.MathUtils.clamp((m.open - 0.4) / 0.6, 0, 1))
    // A wrapping record travels in an arc, over the tops of the records it passes.
    const span = m.to - m.from
    const travelled = span === 0 ? 1 : THREE.MathUtils.clamp((m.slot - m.from) / span, 0, 1)
    const arc = m.wrap ? Math.sin(Math.PI * travelled) * OVER_ARC : 0
    cratePosition.set(x, CRATE.floor + arc, crateZ(m.slot))
    // From the centred cover pose to the book pose as the cover swings open.
    target.lerpVectors(placement.front.position, placement.open.position, fold)
    g.position.lerpVectors(cratePosition, target, fly)
    // Arc upward on the way, so the record clears its neighbours.
    g.position.y += Math.sin(Math.PI * fly) * 0.5
    g.quaternion.slerpQuaternions(crateQuaternion, placement.front.quaternion, fly)
    g.scale.setScalar(THREE.MathUtils.lerp(1, THREE.MathUtils.lerp(placement.front.scale, placement.open.scale, fold), fly))

    hinge.current.rotation.y = -fold * OPEN_ANGLE
    disc.current.visible = fold > 0.01
    disc.current.position.y = S / 2 + fold * S * 0.45
    if (fold > 0.9) disc.current.rotation.z -= dt * 1.2
  })

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }
  const onPointerOut = () => {
    document.body.style.cursor = ''
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // The front record opens; any other one comes to the front first.
    if (selected) onOpen(index)
    else onSelect(index)
  }

  return (
    <>
      {/* Invisible click target at the record's slot (the visible meshes move around). */}
      <mesh
        position={[x, CRATE.floor + S / 2, crateZ(slot)]}
        rotation={[LEAN, 0, 0]}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      >
        <planeGeometry args={[S, S]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={group} raycast={noRaycast}>
      <mesh material={materials.back} position={[0, S / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[S, S, PANEL]} />
      </mesh>
      <group ref={disc} position={[0, S / 2, PANEL]} visible={false}>
        <mesh>
          <circleGeometry args={[S * 0.47, 64]} />
          <meshStandardMaterial map={groove} roughness={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.002]}>
          <circleGeometry args={[S * 0.16, 48]} />
          <meshStandardMaterial color={inside ? '#ffffff' : color} map={inside?.label ?? null} roughness={0.8} />
        </mesh>
      </group>
      {/* The front cover turns on the spine at the sleeve's left edge. */}
      <group ref={hinge} position={[-S / 2, 0, PANEL * 2]}>
        <mesh material={materials.cover} position={[S / 2, S / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[S, S, PANEL]} />
        </mesh>
      </group>
      </group>
    </>
  )
}

const noRaycast = () => null

/** A veil between the crate and an opened record; clicking it closes the record. */
function Backdrop({ active, onClose }: { active: boolean; onClose: () => void }) {
  const { camera } = useThree()
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.MeshBasicMaterial>(null)
  // The veil takes the page colour: when it comes up, and whenever the theme changes.
  useEffect(() => {
    const sync = () => {
      const paper = getComputedStyle(document.documentElement).getPropertyValue('--color-paper').trim()
      if (paper) material.current?.color.set(paper)
    }
    sync()
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [active])

  useFrame((_, delta) => {
    if (!mesh.current || !material.current) return
    material.current.opacity = damp(material.current.opacity, active ? 0.82 : 0, 6, Math.min(delta, 0.05))
    mesh.current.visible = material.current.opacity > 0.01
    // Keep it square to the camera, between the crate and the opened record.
    mesh.current.quaternion.copy(camera.quaternion)
    camera.getWorldDirection(mesh.current.position).multiplyScalar(3.4).add(camera.position)
  })

  const swallow = (e: ThreeEvent<PointerEvent>) => e.stopPropagation()
  return (
    <mesh
      ref={mesh}
      visible={false}
      // Only catches the pointer while a record is open.
      raycast={active ? THREE.Mesh.prototype.raycast : () => null}
      onPointerOver={swallow}
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial ref={material} transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}
