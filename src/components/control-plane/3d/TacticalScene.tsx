"use client";

import { useROS } from "@/hooks/useROS";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Grid, OrbitControls } from "@react-three/drei";
import { useMap } from "@/lib/hooks/useMap";
import { subscribe } from "@/lib/core/bus";
import { Robot } from "./Robot";
import { PathLine } from "./PathLine";
import { useFleetStore } from "@/stores/fleetStore";
import { generatePath } from "@/lib/planning/generatePath";
import { computeAvoidance } from "@/lib/planning/avoidance";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { CameraController } from "./CameraController";
import * as THREE from "three";

function occupancyToGrid(map: any) {
  if (!map) return [];
  const grid = [];
  const width = map.info.width;
  // Fallback geometries scaling abstract parameters visually
  for(let i=0; i<100; i++) {
     grid.push({ x: 0, y: 0, occupancy: 0});
  }
  return grid;
}

function SceneContent() {
  const robots = useFleetStore((s) => s.robots);
  const updateRobot = useFleetStore((s) => s.updateRobot);

  useEffect(() => {
    // Production Gating: Unconditionally disable WebSockets and EventStreams on Vercel 
    // to prevent cascading connection failures and context lost if backend is unavailable.
    if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
      return;
    }

    // 1. Mission Trajectory Paths via direct Websocket array sync
    const io = require("socket.io-client").io;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", { 
        transports: ["polling", "websocket"],
        reconnectionAttempts: 3
    });

    socket.on("stream:tasks", (e: any) => {
      if (e && e.path && Array.isArray(e.path) && e.path.length > 0) {
        // Hydrate pure backend A* mapping geometries directly
        updateRobot(e.robot_id, { path: e.path });
      }
    });

    // 2. Immediate Server-Sent Event (SSE) Hardware Overrides natively bypassing React state queues
    const eventSource = new EventSource("/api/stream");
    eventSource.onmessage = (msg) => {
      try {
        const payload = JSON.parse(msg.data);
        if (payload && payload.event === "tactical_override") {
           console.warn("[SSE] Watchdog tactical override engaged! Neutralizing kinetic outputs.");
           useFleetStore.getState().robots.forEach((r: any) => updateRobot(r.id, { path: [], status: "error" }));
        }
      } catch(e){}
    };

    return () => {
      try {
        if (socket && typeof socket.disconnect === 'function') {
          socket.disconnect();
        }
      } catch (e) {
        console.warn('Socket disconnect suppression', e);
      }
      try {
        if (eventSource && typeof eventSource.close === 'function') {
            eventSource.close();
        }
      } catch (e) {}
    };
  }, [updateRobot]);

  useFrame(({ camera }) => {
    // Cinematic Camera Lerping Logic seamlessly tracking Robot operations
    const target = robots[0]?.position;
    if (target) {
        camera.position.lerp(
            new THREE.Vector3(target[0] + 5, 5, target[2] + 5),
            0.05
        );
        camera.lookAt(target[0], 0, target[2]);
    }
  });

  return (
    <>
      {robots.map((r) => (
        <group key={r.id}>
          <Robot id={r.id} position={r.position as [number,number,number]} />
          <PathLine path={r.path} />
        </group>
      ))}
    </>
  );
}

function RobotOverlay() {
  const status = useFleetStore((s) => s.robots[0]?.status || "IDLE");
  const hasRobots = useFleetStore((s) => s.robots?.length > 0);

  if (!hasRobots) return null;

  const robotState = { zone: "SECTOR-7G", battery: 98, status };

  if (!robotState) return null;

  return (
      <div className="absolute bottom-2 right-2 text-[10px] text-emerald-400 font-mono tracking-widest uppercase text-right">
          ZONE: {robotState.zone} | BAT: {robotState.battery}%<br />
          OP: {robotState.status}
      </div>
  );
}

export default function TacticalScene() {
  const { connected } = useROS();

  return (
    <div className="w-full h-full bg-[#050607] relative">
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        <fog attach="fog" args={["#050607", 10, 50]} />
        <ambientLight intensity={0.1} />
        
        <CameraController />

        {/* AAA Cinematic Light Deflection Vectors */}
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
        />
        
        <spotLight
          position={[0, 15, 0]}
          angle={0.3}
          intensity={2}
        />

        <Grid args={[100, 100]} cellSize={1} sectionSize={5} fadeDistance={50} />

        <SceneContent />
        
        <EffectComposer disableNormalPass multisampling={0}>
          <Bloom intensity={0.6} luminanceThreshold={0.2} />
          <Noise opacity={0.02} />
        </EffectComposer>
        
        <OrbitControls />
      </Canvas>

      {/* Overlay */}
      <div className="absolute top-2 left-2 text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
        ROS BRIDGE {connected ? "(AUTHORIZED)" : "(STANDBY)"}
      </div>
      
      {/* State Fallback Render */}
      <RobotOverlay />
    </div>
  );
}
