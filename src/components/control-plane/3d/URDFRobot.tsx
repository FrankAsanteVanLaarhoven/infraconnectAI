"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function URDFRobot({ joints, url = "/robots/humanoid.urdf" }: any) {
  const robotRef = useRef<any>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    // Dynamic import to prevent SSR breakages with native node
    import("urdf-loader").then(({ default: URDFLoader }) => {
        const loader = new URDFLoader();
        
        loader.load(
            url, 
            (robot: any) => {
                robot.traverse((c: any) => {
                    if (c.isMesh) {
                        c.material = new THREE.MeshStandardMaterial({
                            color: "#4CC9F0",
                            metalness: 0.4,
                            roughness: 0.6,
                        });
                    }
                });
                robotRef.current = robot;
            },
            undefined,
            (error: any) => {
                console.warn(`URDF file missing at ${url}. Falling back to native mock mesh...`);
                setLoadFailed(true);
            }
        );
    }).catch(e => {
        console.warn("urdf-loader missing. Try npm install urdf-loader.", e);
        setLoadFailed(true);
    });
  }, [url]);

  useFrame(() => {
    if (!robotRef.current) return;

    Object.entries(joints || {}).forEach(([name, val]) => {
      const joint = robotRef.current.joints[name];
      if (joint) joint.setJointValue(val as number);
    });
  });

  // Structural Fallback if the URDF file has not been copied to /public/ yet
  if (loadFailed || !robotRef.current) {
      return (
        <group>
            {/* Body */}
            <mesh position={[0, 1, 0]}>
                <boxGeometry args={[0.5, 1, 0.3]} />
                <meshStandardMaterial color="#0ea5e9" opacity={0.6} transparent />
            </mesh>
        </group>
      );
  }

  return <primitive object={robotRef.current} />;
}
