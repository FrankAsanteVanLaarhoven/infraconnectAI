import { Line } from "@react-three/drei";
import * as THREE from "three";

export function PathLine({ path }: { path: { x: number; y: number }[] }) {
  if (!path || path.length < 2) return null;

  // Convert logical abstract 2D path geometries into pure WebGL 3D execution meshes
  const points = path.map(p => new THREE.Vector3(p.x, 0.1, p.y));

  return (
    <Line
      points={points}
      color="#A855F7" // High contrast purple tracing tracking explicit CNP geometries
      lineWidth={3}
      dashed={false}
    />
  );
}
