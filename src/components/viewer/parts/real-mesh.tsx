import * as THREE from 'three'

interface Props {
  geometry: THREE.BufferGeometry
  color: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  /** [x,y,z] scale — use -1 on an axis to mirror (e.g. left/right feet). */
  scale?: [number, number, number]
  onClick?: (e: THREE.Event) => void
}

/**
 * Renders one instance of a prepared real-part geometry with a flat colored
 * material. DoubleSide avoids backface-culling artifacts on mirrored
 * (negative-scale) instances.
 */
export function RealMesh({ geometry, color, position, rotation, scale, onClick }: Props) {
  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} side={THREE.DoubleSide} />
    </mesh>
  )
}
