import { ContactShadows } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { records } from '../../content/records'
import type { CrateRecord } from '../../content/records'
import { CRATE, LEAN, LIFT, OPEN_ANGLE, PANEL, S, crateX, crateZ, openPlacement, placeCamera } from './layout'
import { coverTexture, grooveTexture, innerLeftTexture, labelTexture, loadFonts, paperTexture, woodTexture } from './textures'

export interface SceneProps {
  selected: number
  open: number | null
  onSelect: (index: number) => void
  onOpen: (index: number) => void
  onClose: () => void
}

const damp = THREE.MathUtils.damp
const ease = (t: number) => t * t * (3 - 2 * t)

export function Scene({ selected, open, onSelect, onOpen, onClose }: SceneProps) {
  const { camera, size } = useThree()
  const [covers, setCovers] = useState<THREE.Texture[] | null>(null)
  const shared = useMemo(() => ({ paper: paperTexture(), groove: grooveTexture(), wood: woodTexture() }), [])

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
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 6, 5]} intensity={1.9} />
      <directionalLight position={[-4, 3, 2]} intensity={0.5} />

      <Crate x={x} wood={shared.wood} />
      <ContactShadows position={[x, 0.001, 0]} scale={9} blur={2.6} opacity={0.5} far={2.5} frames={1} />

      {records.map((record, i) => (
        <Record3D
          key={record.id}
          record={record}
          index={i}
          x={x}
          cover={covers?.[i]}
          paper={shared.paper}
          groove={shared.groove}
          selected={selected === i}
          open={open === i}
          placement={placement}
          onSelect={onSelect}
          onOpen={onOpen}
        />
      ))}

      <Backdrop active={open !== null} onClose={onClose} />
    </>
  )
}

/** A wooden record crate: floor, two sides, a tall back and a lower front. */
function Crate({ x, wood }: { x: number; wood: THREE.Texture }) {
  const { innerWidth: w, innerDepth: d, wall, backHeight, frontHeight, floor } = CRATE
  const material = useMemo(() => new THREE.MeshStandardMaterial({ map: wood, roughness: 0.85 }), [wood])
  return (
    <group position={[x, 0, 0]}>
      <mesh material={material} position={[0, floor / 2, 0]}>
        <boxGeometry args={[w + wall * 2, floor, d + wall * 2]} />
      </mesh>
      <mesh material={material} position={[-(w + wall) / 2, backHeight / 2, 0]}>
        <boxGeometry args={[wall, backHeight, d + wall * 2]} />
      </mesh>
      <mesh material={material} position={[(w + wall) / 2, backHeight / 2, 0]}>
        <boxGeometry args={[wall, backHeight, d + wall * 2]} />
      </mesh>
      <mesh material={material} position={[0, backHeight / 2, -(d + wall) / 2]}>
        <boxGeometry args={[w, backHeight, wall]} />
      </mesh>
      <mesh material={material} position={[0, frontHeight / 2, (d + wall) / 2]}>
        <boxGeometry args={[w, frontHeight, wall]} />
      </mesh>
    </group>
  )
}

interface Record3DProps {
  record: CrateRecord
  index: number
  x: number
  cover?: THREE.Texture
  paper: THREE.Texture
  groove: THREE.Texture
  selected: boolean
  open: boolean
  placement: ReturnType<typeof openPlacement>
  onSelect: (index: number) => void
  onOpen: (index: number) => void
}

const crateQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(LEAN, 0, 0))
const cratePosition = new THREE.Vector3()

/**
 * One record. Origin: bottom centre of the sleeve, facing +z.
 * In the crate it stands leaning back and lifts when selected. Opened, it flies to the
 * camera, the front cover swings left on its spine like a book, and the disc rises.
 */
function Record3D({ record, index, x, cover, paper, groove, selected, open, placement, onSelect, onOpen }: Record3DProps) {
  const group = useRef<THREE.Group>(null)
  const hinge = useRef<THREE.Group>(null)
  const disc = useRef<THREE.Group>(null)
  // lift: 0..1 out of the crate. fly: 0..1 toward the camera. fold: 0..1 cover open.
  const motion = useRef({ lift: 0, fly: 0, fold: 0 })
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
    const dt = Math.min(delta, 0.05)
    const m = motion.current

    m.lift = damp(m.lift, selected || open ? 1 : 0, 9, dt)
    if (open) {
      m.fly = damp(m.fly, 1, 5.5, dt)
      if (m.fly > 0.9) m.fold = damp(m.fold, 1, 4.5, dt)
    } else {
      m.fold = damp(m.fold, 0, 8, dt)
      if (m.fold < 0.08) m.fly = damp(m.fly, 0, 5.5, dt)
    }

    const fly = ease(Math.min(m.fly, 1))
    cratePosition.set(x, CRATE.floor + m.lift * LIFT, crateZ(index))
    g.position.lerpVectors(cratePosition, placement.position, fly)
    // Arc upward on the way, so the record clears its neighbours.
    g.position.y += Math.sin(Math.PI * fly) * 0.5
    g.quaternion.slerpQuaternions(crateQuaternion, placement.quaternion, fly)
    g.scale.setScalar(THREE.MathUtils.lerp(1, placement.scale, fly))

    const fold = ease(Math.min(m.fold, 1))
    hinge.current.rotation.y = -fold * OPEN_ANGLE
    disc.current.visible = fold > 0.01
    disc.current.position.y = S / 2 + fold * S * 0.45
    if (fold > 0.9) disc.current.rotation.z -= dt * 1.2
  })

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.nativeEvent.pointerType === 'mouse') {
      onSelect(index)
      document.body.style.cursor = 'pointer'
    }
  }
  const onPointerOut = () => {
    document.body.style.cursor = ''
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // Touch: the first tap lifts the record so its title can be read, the second opens it.
    if (!selected && (e.nativeEvent as PointerEvent).pointerType !== 'mouse') onSelect(index)
    else onOpen(index)
  }

  return (
    <>
      {/*
        The pointer target stays where the record rests in the crate. If the lifted
        record itself were the target, it would cover the ones behind it and you could
        never reach them by moving the mouse up.
      */}
      <mesh
        position={[x, CRATE.floor + S / 2, crateZ(index)]}
        rotation={[LEAN, 0, 0]}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      >
        <planeGeometry args={[S, S]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={group} raycast={noRaycast}>
      <mesh material={materials.back} position={[0, S / 2, 0]}>
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
        <mesh material={materials.cover} position={[S / 2, S / 2, 0]}>
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
  const paper = useMemo(() => getComputedStyle(document.documentElement).getPropertyValue('--color-paper').trim() || '#ffffff', [])

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
      <meshBasicMaterial ref={material} color={paper} transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}
