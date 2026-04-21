"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function URDFRobot({ joints }: any) {
  return (
    <group scale={[1.2, 1.2, 1.2]}>
            {/* All-Aluminum Alloy Body (M3 Pro Precise Chassis) */}
            <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[0.5, 0.15, 0.7]} />
                <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.3} />
            </mesh>
            
            {/* RPI 5 / Jetson Nano Control Board (Top deck) */}
            <mesh position={[0, 0.485, 0]}>
                <boxGeometry args={[0.3, 0.02, 0.4]} />
                <meshStandardMaterial color="#10b981" metalness={0.2} roughness={0.8} />
            </mesh>

            {/* Acrylic Baffle (Transparent Top Layer) */}
            <mesh position={[0, 0.52, 0]}>
                <boxGeometry args={[0.5, 0.01, 0.7]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.1} metalness={0.9} roughness={0.1} />
            </mesh>
            
            {/* 7-inch IPS High-Definition Touch Screen (Rear mounted, angled) */}
            <mesh position={[0, 0.65, -0.25]} rotation={[-Math.PI / 4, 0, 0]}>
                <boxGeometry args={[0.3, 0.02, 0.2]} />
                <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.6} />
            </mesh>

            {/* Pendulous Suspension Mecanum Wheels */}
            {[
              [-0.3, 0.2, 0.25], // Front Left
              [0.3, 0.2, 0.25],  // Front Right
              [-0.3, 0.2, -0.25], // Rear Left
              [0.3, 0.2, -0.25]   // Rear Right
            ].map((pos, idx) => (
               <group key={idx} position={pos as [number, number, number]}>
                   <mesh rotation={[0, 0, Math.PI / 2]}>
                       <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
                       <meshStandardMaterial color="#0f172a" roughness={0.9} />
                   </mesh>
                   <mesh rotation={[0, 0, Math.PI / 2]}>
                       <cylinderGeometry args={[0.08, 0.08, 0.105, 16]} />
                       <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
                   </mesh>
               </group>
            ))}

            {/* Rear Pendulum Suspension Mechanics */}
            <mesh position={[0, 0.2, -0.25]}>
                <boxGeometry args={[0.5, 0.05, 0.1]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
            </mesh>

            {/* Dual T-Mini Plus LiDAR (Right Front & Left Rear) */}
            {[
               [0.2, 0.55, 0.25],   // Right Front
               [-0.2, 0.55, -0.25]  // Left Rear
            ].map((pos, idx) => (
              <group key={`lidar-${idx}`} position={pos as [number, number, number]}>
                  {/* Black Base */}
                  <mesh>
                      <cylinderGeometry args={[0.06, 0.06, 0.04, 32]} />
                      <meshStandardMaterial color="#111" />
                  </mesh>
                  {/* Spinning Laser Window */}
                  <mesh position={[0, 0.02, 0]}>
                      <cylinderGeometry args={[0.05, 0.05, 0.02, 32]} />
                      <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={0.8} transparent opacity={0.8} />
                  </mesh>
              </group>
            ))}

            {/* 6DOF 3D Vision Robotic Arm (Front Center Mounted) */}
            <group position={[0, 0.53, 0.25]}>
                {/* Base Joint Aluminum (Pan) */}
                <group rotation={[0, joints?.base || 0, 0]}>
                    <mesh>
                        <cylinderGeometry args={[0.08, 0.08, 0.08, 32]} />
                        <meshStandardMaterial color="#e5e7eb" metalness={0.7} />
                    </mesh>
                    
                    {/* Link 1 Pivot (Tilt) */}
                    <group position={[0, 0.04, 0]} rotation={[joints?.link1 || 0, 0, 0]}>
                        <mesh position={[0, 0.16, 0]}>
                            <boxGeometry args={[0.05, 0.32, 0.05]} />
                            <meshStandardMaterial color="#e5e7eb" metalness={0.7} />
                        </mesh>
                        
                        {/* Link 2 Pivot (Tilt) */}
                        <group position={[0, 0.32, 0.1]} rotation={[joints?.link2 || 0, 0, 0]}>
                            <mesh position={[0, 0.15, 0]}>
                                <boxGeometry args={[0.04, 0.3, 0.04]} />
                                <meshStandardMaterial color="#e5e7eb" metalness={0.7} />
                            </mesh>
                            
                            {/* Link 3 / End Effector Pivot (Tilt) */}
                            <group position={[0, 0.3, 0.08]} rotation={[joints?.link3 || 0, 0, 0]}>
                                {/* End Effector Gripper Platform */}
                                <mesh position={[0, 0.05, 0]}>
                                    <boxGeometry args={[0.12, 0.03, 0.08]} />
                                    <meshStandardMaterial color="#111" />
                                </mesh>
                                {/* DABAI DCW2 Depth Camera (Upper Mount) */}
                                <group position={[0, 0.12, 0]} rotation={[-Math.PI/12, 0, 0]}>
                                  <mesh>
                                      <boxGeometry args={[0.15, 0.04, 0.04]} />
                                      <meshStandardMaterial color="#111" />
                                  </mesh>
                                  {/* Lenses */}
                                  <mesh position={[-0.04, 0, 0.021]} rotation={[Math.PI/2, 0, 0]}>
                                      <cylinderGeometry args={[0.015, 0.015, 0.01]} />
                                      <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" />
                                  </mesh>
                                  <mesh position={[0.04, 0, 0.021]} rotation={[Math.PI/2, 0, 0]}>
                                      <cylinderGeometry args={[0.015, 0.015, 0.01]} />
                                      <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" />
                                  </mesh>
                                </group>
                            </group>
                        </group>
                    </group>
                </group>
            </group>
        </group>
      );
}
