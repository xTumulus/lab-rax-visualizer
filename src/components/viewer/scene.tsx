import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, Environment, Grid, OrbitControls } from '@react-three/drei'
import { RackReal } from './rack-real'
import { useBuildStore } from '../../store/use-build-store'
import { SCALE } from '../../domain/constants'
import { FOOT_HEIGHT_MM, U_MM } from '../../domain/models'

function Loading() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  )
}

export function Scene() {
  const rackU = useBuildStore((s) => s.rackU)
  const selectPart = useBuildStore((s) => s.selectPart)

  // Grid sits at the bottom of the (origin-centered) rack, under the feet.
  const groundY = -((rackU * U_MM) / 2 + FOOT_HEIGHT_MM) / SCALE

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [3.2, 2.4, 3.6], fov: 45 }}
      onPointerMissed={() => selectPart(null)}
    >
      <color attach="background" args={['#0f1218']} />
      <hemisphereLight intensity={0.5} groundColor="#0b0d12" />
      <directionalLight
        position={[4, 6, 4]}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-4, 3, -2]} intensity={0.6} />

      <Suspense fallback={<Loading />}>
        {/* key on rackU so Bounds re-fits the camera when the rack resizes */}
        <Bounds fit clip observe margin={1.8} key={rackU}>
          <RackReal />
        </Bounds>
        <Environment preset="city" />
      </Suspense>

      <Grid
        args={[20, 20]}
        position={[0, groundY, 0]}
        cellSize={0.25}
        cellColor="#252b35"
        sectionSize={1}
        sectionColor="#333b48"
        fadeDistance={22}
        infiniteGrid
      />

      {/* No fixed `target` here on purpose: Bounds owns/updates the
          OrbitControls target on fit. A hardcoded target fights Bounds
          whenever the rendered content's true center isn't exactly origin. */}
      <OrbitControls makeDefault enablePan minDistance={1.5} maxDistance={20} />
    </Canvas>
  )
}
