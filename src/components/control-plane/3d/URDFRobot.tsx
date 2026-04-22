"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function URDFRobot({ url }: { url?: string }) {
  const robotRef = useRef<THREE.Group>(null);
  const lidarRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);

  // Smooth animation logic for CORE "active idle" twin behaviors
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (lidarRef.current) {
        // LiDAR spinning at 10Hz simulated
        lidarRef.current.rotation.y = time * 10;
    }
    if (robotRef.current) {
        // Micro-suspension breathing
        robotRef.current.position.y = 0.5 + Math.sin(time * 2) * 0.005;
    }
  });

  const materials = useMemo(() => ({
    chassis: new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.3, metalness: 0.8 }),
    accent: new THREE.MeshStandardMaterial({ color: "#2dd4bf", roughness: 0.4, metalness: 0.5, emissive: "#0f766e", emissiveIntensity: 0.2 }),
    tire: new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.9, metalness: 0.1 }),
    sensor: new THREE.MeshStandardMaterial({ color: "#ef4444", roughness: 0.2, emissive: "#ef4444", emissiveIntensity: 0.6 }),
  }), []);

  return (
    <group ref={robotRef} position={[0, 0.5, 0]}>
      {/* Structural Chassis Main Base */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow material={materials.chassis}>
        <boxGeometry args={[0.3, 0.08, 0.45]} />
      </mesh>

      {/* RPi5 / Compute Deck */}
      <mesh position={[0, 0.06, 0.05]} castShadow material={materials.accent}>
        <boxGeometry args={[0.15, 0.04, 0.2]} />
      </mesh>

      {/* LiDAR Tower */}
      <group position={[0, 0.12, -0.1]}>
        <mesh position={[0, 0, 0]} material={materials.chassis}>
            <cylinderGeometry args={[0.03, 0.03, 0.08, 16]} />
        </mesh>
        <group ref={lidarRef} position={[0, 0.05, 0]}>
            <mesh material={materials.tire}>
                <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
            </mesh>
            <mesh position={[0.02, 0, 0]} material={materials.sensor}>
                <boxGeometry args={[0.02, 0.015, 0.02]} />
            </mesh>
        </group>
      </group>

      {/* 6DOF Arm Rig (Resting Position) */}
      <group ref={armRef} position={[0, 0.08, 0.15]}>
          <mesh material={materials.chassis}>
              <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          </mesh>
          <mesh position={[0, 0.08, 0]} rotation={[0.4, 0, 0]} material={materials.chassis}>
              <boxGeometry args={[0.03, 0.18, 0.03]} />
          </mesh>
          <mesh position={[0, 0.18, 0.04]} rotation={[-0.2, 0, 0]} material={materials.accent}>
              <boxGeometry args={[0.025, 0.15, 0.025]} />
          </mesh>
          {/* Gripper */}
          <group position={[0, 0.28, 0.02]}>
              <mesh position={[-0.02, 0, 0]} material={materials.chassis}>
                 <boxGeometry args={[0.01, 0.06, 0.03]} />
              </mesh>
              <mesh position={[0.02, 0, 0]} material={materials.chassis}>
                 <boxGeometry args={[0.01, 0.06, 0.03]} />
              </mesh>
          </group>
      </group>

      {/* Mecanum Wheels (4x) */}
      {[
        [-0.18, -0.04, 0.18], [0.18, -0.04, 0.18],
        [-0.18, -0.04, -0.18], [0.18, -0.04, -0.18]
      ].map((pos, i) => (
        <mesh key={i} position={pos as any} rotation={[0, 0, Math.PI / 2]} castShadow material={materials.tire}>
          <cylinderGeometry args={[0.06, 0.06, 0.05, 24]} />
        </mesh>
      ))}

      {/* Front Depth Camera */}
      <mesh position={[0, 0.01, 0.23]} material={materials.sensor}>
          <boxGeometry args={[0.08, 0.02, 0.01]} />
      </mesh>
    </group>
  );
}
