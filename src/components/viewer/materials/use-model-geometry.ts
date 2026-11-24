import * as THREE from 'three'
import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { ThreeMFLoader } from 'three/addons/loaders/3MFLoader.js'
import { MODEL_BASE } from '../../../domain/models'

export interface PreparedGeometry {
  geometry: THREE.BufferGeometry
  /** post-bake size in mm (x, y, z) */
  size: THREE.Vector3
}

/**
 * Bakes the source part's Z-up (CAD/slicer) axes into the scene's Y-up
 * convention, applies optional extra X/Y/Z rotation for parts whose axes
 * still don't line up after that, then re-centers the pivot to
 * bottom-center (x=0, z=0 at the footprint center, y=0 at the lowest point)
 * so instances can be positioned/stacked with simple offsets.
 */
function prepareGeometry(
  geo: THREE.BufferGeometry,
  extraRotY: number,
  extraRotX = 0,
  extraRotZ = 0,
): PreparedGeometry {
  geo.rotateX(-Math.PI / 2)
  if (extraRotX) geo.rotateX(extraRotX)
  if (extraRotY) geo.rotateY(extraRotY)
  if (extraRotZ) geo.rotateZ(extraRotZ)
  geo.computeBoundingBox()
  const bb = geo.boundingBox!
  const center = new THREE.Vector3()
  bb.getCenter(center)
  geo.translate(-center.x, -bb.min.y, -center.z)
  geo.computeBoundingBox()
  geo.computeVertexNormals()
  const size = new THREE.Vector3()
  geo.boundingBox!.getSize(size)
  return { geometry: geo, size }
}

/** Re-center to bottom-center and measure; shared tail of the prepare steps. */
function finishGeometry(geo: THREE.BufferGeometry): PreparedGeometry {
  geo.computeBoundingBox()
  const center = new THREE.Vector3()
  geo.boundingBox!.getCenter(center)
  geo.translate(-center.x, -geo.boundingBox!.min.y, -center.z)
  geo.computeBoundingBox()
  geo.computeVertexNormals()
  const size = new THREE.Vector3()
  geo.boundingBox!.getSize(size)
  return { geometry: geo, size }
}

function firstMeshGeometry(root: THREE.Object3D): THREE.BufferGeometry {
  root.updateWorldMatrix(true, true)
  let found: THREE.BufferGeometry | null = null
  root.traverse((obj) => {
    if (!found && (obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh
      const geo = mesh.geometry.clone()
      geo.applyMatrix4(mesh.matrixWorld)
      found = geo
    }
  })
  if (!found) throw new Error(`No mesh found in loaded model`)
  return found
}

/** Load + prepare a .stl part. `file` is relative to /public/models-3d/. */
export function useStlPart(file: string, extraRotY = 0, extraRotX = 0, extraRotZ = 0): PreparedGeometry {
  const raw = useLoader(STLLoader, MODEL_BASE + file)
  return useMemo(
    () => prepareGeometry(raw.clone(), extraRotY, extraRotX, extraRotZ),
    [raw, extraRotY, extraRotX, extraRotZ],
  )
}

/** Load + prepare a .3mf part. `file` is relative to /public/models-3d/. */
export function use3mfPart(file: string, extraRotY = 0): PreparedGeometry {
  const group = useLoader(ThreeMFLoader, MODEL_BASE + file)
  return useMemo(
    () => prepareGeometry(firstMeshGeometry(group), extraRotY),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group, extraRotY],
  )
}

/**
 * Load the support extension. It is saved print-flat and diagonal in the XY
 * plane, so rotate it square, then map: long edge -> scene Z (front to back),
 * 84mm edge -> scene Y (up), thickness -> scene X, with the thin web side
 * facing +X (outward, for the right-hand copy).
 */
export function useExtensionPart(file: string, rawRotZ: number): PreparedGeometry {
  const raw = useLoader(STLLoader, MODEL_BASE + file)
  return useMemo(() => {
    const geo = raw.clone()
    geo.rotateZ(rawRotZ)
    // (x, y, z) -> (X = -z, Y = y, Z = x): a proper rotation, no mirroring.
    geo.applyMatrix4(new THREE.Matrix4().set(0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1))
    return finishGeometry(geo)
  }, [raw, rawRotZ])
}
