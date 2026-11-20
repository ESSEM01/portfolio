import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { CRATE } from './layout'
import { WOOD_STAINS, plankTextures } from './textures'

// Crate construction, in world units.
const T = 0.07 // slat thickness
const SLAT = 0.34 // slat height
const GAP = 0.045 // gap between slats
const BASE = 0.05 // bottom planks thickness
const POST = 0.085 // corner post side
const SIDE_SLATS = 3
const FRONT_SLATS = 2
const VARIANTS = 5

/**
 * A slatted wooden record crate, built the way a real one is: separate planks with gaps
 * between them, four corner posts they're nailed to, and a planked bottom. The front is
 * one slat lower so the covers show. Every plank gets its own grain.
 */
export function CrateModel({ x }: { x: number }) {
  const { innerWidth: w, innerDepth: d } = CRATE

  // The stain follows the page theme.
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setTheme(query.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const { planks, posts, nail } = useMemo(() => {
    const sets = Array.from({ length: VARIANTS }, (_, i) => plankTextures(i + 1, WOOD_STAINS[theme]))
    const planks = sets.map(
      ({ map, bump }) => new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 1.6, roughness: 0.88 }),
    )
    // Posts stand upright, so their grain runs vertically: same wood, turned 90°.
    const posts = sets.slice(0, 2).map(({ map, bump }) => {
      const turn = (t: THREE.Texture) => {
        const c = t.clone()
        c.center.set(0.5, 0.5)
        c.rotation = Math.PI / 2
        c.needsUpdate = true
        return c
      }
      return new THREE.MeshStandardMaterial({ map: turn(map), bumpMap: turn(bump), bumpScale: 1.6, roughness: 0.9, color: '#d9d2cc' })
    })
    const nail = new THREE.MeshStandardMaterial({ color: '#a8a39d', roughness: 0.5, metalness: 0.6 })
    return { planks, posts, nail }
  }, [theme])

  useEffect(
    () => () => {
      for (const m of [...planks, ...posts]) {
        m.map?.dispose()
        m.bumpMap?.dispose()
        m.dispose()
      }
      nail.dispose()
    },
    [planks, posts, nail],
  )

  const slatY = (k: number) => BASE + SLAT / 2 + k * (SLAT + GAP)
  const sideHeight = BASE + SIDE_SLATS * SLAT + (SIDE_SLATS - 1) * GAP
  const outerD = d + T * 2
  let n = 0
  const wood = () => planks[n++ % planks.length]

  const slats: { key: string; size: [number, number, number]; position: [number, number, number] }[] = []
  for (let k = 0; k < SIDE_SLATS; k++) {
    slats.push({ key: `l${k}`, size: [T, SLAT, outerD], position: [-(w + T) / 2, slatY(k), 0] })
    slats.push({ key: `r${k}`, size: [T, SLAT, outerD], position: [(w + T) / 2, slatY(k), 0] })
    slats.push({ key: `b${k}`, size: [w, SLAT, T], position: [0, slatY(k), -(d + T) / 2] })
  }
  for (let k = 0; k < FRONT_SLATS; k++) {
    slats.push({ key: `f${k}`, size: [w, SLAT, T], position: [0, slatY(k), (d + T) / 2] })
  }
  // Bottom: four planks across, with hairline gaps.
  const plankDepth = outerD / 4
  for (let k = 0; k < 4; k++) {
    slats.push({
      key: `floor${k}`,
      size: [w + T * 2, BASE, plankDepth - 0.012],
      position: [0, BASE / 2, -outerD / 2 + plankDepth * (k + 0.5)],
    })
  }

  // Nail heads where each visible slat meets a corner post.
  const nails: { key: string; position: [number, number, number]; rotation: [number, number, number] }[] = []
  const inset = POST / 2 + 0.01
  for (let k = 0; k < SIDE_SLATS; k++) {
    for (const dy of [-SLAT / 4, SLAT / 4]) {
      for (const side of [-1, 1]) {
        for (const end of [-1, 1]) {
          nails.push({
            key: `ns${k}${dy}${side}${end}`,
            position: [side * (w / 2 + T + 0.001), slatY(k) + dy, end * (d / 2 - inset)],
            rotation: [0, (side * Math.PI) / 2, 0],
          })
        }
      }
      if (k < FRONT_SLATS) {
        for (const end of [-1, 1]) {
          nails.push({
            key: `nf${k}${dy}${end}`,
            position: [end * (w / 2 - inset), slatY(k) + dy, d / 2 + T + 0.001],
            rotation: [0, 0, 0],
          })
        }
      }
    }
  }

  return (
    <group position={[x, 0, 0]}>
      {slats.map((slat) => (
        <mesh key={slat.key} material={wood()} position={slat.position} castShadow receiveShadow>
          <boxGeometry args={slat.size} />
        </mesh>
      ))}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`post${sx}${sz}`}
            material={posts[(sx + sz + 2) % posts.length]}
            position={[sx * (w / 2 - POST / 2), BASE + (sideHeight - BASE) / 2, sz * (d / 2 - POST / 2)]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[POST, sideHeight - BASE, POST]} />
          </mesh>
        )),
      )}
      {nails.map((n) => (
        <mesh key={n.key} material={nail} position={n.position} rotation={n.rotation}>
          <circleGeometry args={[0.014, 12]} />
        </mesh>
      ))}
    </group>
  )
}
