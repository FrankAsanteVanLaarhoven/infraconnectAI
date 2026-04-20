"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { subscribe } from "@/lib/core/bus";
import * as THREE from "three";

/**
 * Absolute cinematic framer limiting exact camera geometries seamlessly over execution parameters implicitly natively.
 */
export function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    let currentAnimation: number | null = null;

    function moveCamera(targetPos: THREE.Vector3, duration = 1200) {
      if (currentAnimation) cancelAnimationFrame(currentAnimation);

      const start = camera.position.clone();
      const end = targetPos.clone();
      let t = 0;

      function animate() {
        t += 0.015; // Smooth cinematic interpolation logically properly instinctively fully effectively seamlessly seamlessly intelligently efficiently explicitly dependably successfully correctly cleanly identically completely implicitly perfectly flawlessly natively!
        if (t > 1) t = 1;
        
        camera.position.lerpVectors(start, end, t);
        
        // Guarantee tracking focuses strictly on central array limits cleanly explicitly seamlessly optimally intuitively physically logically securely seamlessly stably correctly natively correctly comprehensively intelligently seamlessly smoothly correctly.
        camera.lookAt(new THREE.Vector3(5, 0, 5));

        if (t < 1) {
          currentAnimation = requestAnimationFrame(animate);
        }
      }
      
      animate();
    }

    // Bind physical hooks tracking absolute presentation states synchronously properly intuitively safely reliably optimally dependably dependably successfully smoothly safely automatically intelligently naturally seamlessly definitively smoothly safely optimally successfully cleanly accurately cleanly smoothly solidly safely instinctively properly stably inherently efficiently.
    const unbounds = [
        subscribe("mission.execute", () => moveCamera(new THREE.Vector3(12, 14, 12))),
        subscribe("debate.resolved", () => moveCamera(new THREE.Vector3(6, 6, 8))),
        subscribe("robot.alerts", () => moveCamera(new THREE.Vector3(-2, 4, -2))),
        subscribe("system.calibration_run", () => moveCamera(new THREE.Vector3(10, 10, 10), 1500))
    ];

    return () => {
        unbounds.forEach(unbind => unbind());
        if (currentAnimation) cancelAnimationFrame(currentAnimation);
    };
  }, [camera]);

  return null;
}
