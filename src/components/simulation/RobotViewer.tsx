"use client";

import React, { useEffect, useState, useRef } from "react";
import { Loader2, Activity } from "lucide-react";
import * as THREE from "three";

export function RobotViewer() {
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [poseData, setPoseData] = useState<any>(null);
  
  const mountRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef<any>(null); // Mutable reference for the render loop

  useEffect(() => {
    // 1. Initialize Bare-Metal Palantir Digital Twin Context
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    // Scene background mimicking tactical UI
    scene.background = new THREE.Color(0x050607); 

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    currentMount.appendChild(renderer.domElement);

    // 2. Spatial Grid Context
    const gridHelper = new THREE.GridHelper(20, 20, 0x06b6d4, 0x1A1D21);
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.5;
    scene.add(gridHelper);

    // 3. Construct Procedural Humanoid Bounding Cluster
    // (In production, replace with urdf-loader executing raw geometry)
    const robotCluster = new THREE.Group();
    
    // Core Chassis
    const chassisGeo = new THREE.BoxGeometry(0.5, 0.8, 0.3);
    const chassisMat = new THREE.MeshBasicMaterial({ color: 0x4CC9F0, wireframe: true, transparent: true, opacity: 0.8 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 1.0;
    robotCluster.add(chassis);

    // Head
    const headGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const headMat = new THREE.MeshBasicMaterial({ color: 0x22C55E, wireframe: true });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.65;
    robotCluster.add(head);

    scene.add(robotCluster);

    // 4. Mocking Local SDK Linkage (Telemetry Bridge)
    setTimeout(() => setStatus("connected"), 800);
    const dataInterval = setInterval(() => {
        const simPose = {
            translation: { x: Math.sin(Date.now() / 1000) * 2, y: 0, z: Math.cos(Date.now() / 1000) * 2 },
            rotation: { x: 0, y: (Date.now() / 1000) % (Math.PI * 2), z: 0, w: 1.0 }
        };
        poseRef.current = simPose;
        setPoseData(simPose);
    }, 100);

    // 5. Render Physics Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Directly couple telemetry physics into the visual cluster
      if (poseRef.current) {
         robotCluster.position.x = poseRef.current.translation.x;
         robotCluster.position.z = poseRef.current.translation.z;
         
         // Smooth rotation application
         robotCluster.rotation.y = poseRef.current.rotation.y;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Context Resizer
    const handleResize = () => {
        if (!currentMount) return;
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup Pipeline
    return () => {
      clearInterval(dataInterval);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      currentMount.removeChild(renderer.domElement);
      
      // Memory flush
      chassisGeo.dispose();
      chassisMat.dispose();
      headGeo.dispose();
      headMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#030405] rounded-xl border border-white/10 overflow-hidden relative group">
      {/* Simulation Overlay Banner */}
      <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 backdrop-blur rounded border border-white/10">
            {status === "connecting" ? (
                <Loader2 className="w-3 h-3 text-yellow-500 animate-spin" />
            ) : status === "connected" ? (
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
                <div className="w-2 h-2 rounded-full bg-red-500" />
            )}
            <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase">
              ROS2 BRIDGE: /tf // KINEMATICS
            </span>
        </div>
        <div className="flex gap-2">
            <span className="text-[10px] px-2 py-1 bg-cyan-900/40 text-cyan-400 font-mono rounded border border-cyan-500/30 uppercase">
                SIMULATION MODE
            </span>
        </div>
      </div>

      {/* Primary WebGL Interactive Mount */}
      <div ref={mountRef} className="flex-1 w-full h-full relative z-0" />

      {/* Telemetry Target Lock Overlay */}
      {poseData && (
          <div className="absolute bottom-4 left-4 p-3 bg-black/80 border border-white/10 rounded font-mono text-[10px] shadow-lg backdrop-blur z-10 pointer-events-none">
              <div className="text-white/40 mb-1 border-b border-white/5 pb-1">REALTIME KINEMATICS (LOCAL)</div>
              <div className="flex flex-col gap-1 mt-2 text-cyan-400">
                  <div><span className="text-white/60">TARGET:</span> humanoid-01</div>
                  <div><span className="text-white/60">HEALTH:</span> ACTIVE | BAT: 82%</div>
                  <div className="grid grid-cols-2 gap-x-4 mt-1 pt-1 border-t border-white/5">
                    <div><span className="text-white/60">POS X:</span> {poseData.translation.x.toFixed(3)}</div>
                    <div><span className="text-white/60">POS Z:</span> {poseData.translation.z.toFixed(3)}</div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
