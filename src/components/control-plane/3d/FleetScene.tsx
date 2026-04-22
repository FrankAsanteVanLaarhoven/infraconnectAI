"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { URDFRobot } from "./URDFRobot";
import { useEffect, useState } from "react";
import { handleFollowCamera } from "@/lib/camera/cinematic";
import { avoidCollisions } from "@/lib/planning/avoidance";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

type RobotState = {
  id: string;
  position: [number, number, number];
  path: [number, number, number][];
  joints: Record<string, number>;
};

function FleetSceneContent({ initialRobots }: { initialRobots: RobotState[] }) {
  const [robots, setRobots] = useState<RobotState[]>(
      initialRobots.length > 0 ? initialRobots : [
          { id: "yahboom-m3-pro", position: [-2, 0, 1], path: [[2,0,2], [4,0,0]], joints: {} }
      ]
  );

  return (
    <>
      <FleetLogic robots={robots} setRobots={setRobots} />

      {robots.map((r) => (
        <group key={r.id} position={r.position}>
          <URDFRobot joints={r.joints} />

          {/* Visualization of intent path */}
          {r.path && r.path.length > 0 && (
             <Line
                points={r.path}
                color="#4CC9F0"
                lineWidth={1}
             />
          )}
        </group>
      ))}
    </>
  );
}

export function FleetScene({ initialRobots = [] }: { initialRobots?: RobotState[] }) {
  return (
    <Canvas camera={{ position: [8, 6, 8] }}>
      <fog attach="fog" args={["#050607", 10, 50]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#4CC9F0" />
      
      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.2} />
      </EffectComposer>

      <FleetSceneContent initialRobots={initialRobots} />

      <OrbitControls />
    </Canvas>
  );
}

function FleetLogic({ robots, setRobots }: { robots: RobotState[], setRobots: any }) {
    useFrame((state) => {
        // Simple cinematic interpolation execution
        if (robots.length > 0) {
            handleFollowCamera(state.camera, { x: robots[0].position[0], z: robots[0].position[2] });
        }

        setRobots((prev: RobotState[]) => prev.map(r => {
            let nextPos = [...r.position] as [number, number, number];
            let newPath = [...r.path];

            // Real-time obstacle avoidance loop
            const force = avoidCollisions(
                { id: r.id, pos: { x: r.position[0], y: r.position[2] } },
                prev.map(p => ({ id: p.id, pos: { x: p.position[0], y: p.position[2] } }))
            );

            // Execute Intent + Avoidance Math
            if (newPath.length > 0) {
                const target = newPath[0];
                const dx = target[0] - nextPos[0];
                const dz = target[2] - nextPos[2];
                const dist = Math.sqrt(dx*dx + dz*dz);
                
                // Interpolate speed and offset with obstacle forces
                if (dist > 0.1) {
                    nextPos[0] += (dx/dist) * 0.05 + (force.x * 0.1);
                    nextPos[2] += (dz/dist) * 0.05 + (force.y * 0.1);
                } else {
                    newPath.shift(); // Node reached
                }
            } else if (force.x !== 0 || force.y !== 0) {
                // If stopped but colliding, slide away
                nextPos[0] += force.x * 0.1;
                nextPos[2] += force.y * 0.1;
            }

            return { ...r, position: nextPos, path: newPath };
        }));
    });

    return null;
}
