import { Canvas } from '@react-three/fiber'
import { FOV } from './layout'
import { Scene } from './Scene'
import type { SceneProps } from './Scene'

/** The WebGL crate. Decorative for assistive tech: every action also exists as HTML. */
export default function Crate3D(props: SceneProps) {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      camera={{ fov: FOV, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
      className="absolute! inset-0"
    >
      <Scene {...props} />
    </Canvas>
  )
}
