"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function RobotTwin({ joints }: any) {
  const ref = useRef<any>(null);

  useFrame(() => {
    if (!ref.current) return;

    // Example joint mapping
    // Safe access allowing dynamic object overrides natively from ROS2
    ref.current.rotation.y = joints?.["waist"] || 0;
  });

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.5, 1, 0.3]} />
        <meshStandardMaterial color="#0ea5e9" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}
