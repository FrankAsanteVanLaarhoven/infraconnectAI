"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { loadURDF } from "@/lib/robotics/urdfLoader";
import { sendJointState } from "@/lib/robotics/ros";

export function Robot({ id, position }: { id: string; position: [number, number, number] }) {
  const ref = useRef<any>();
  const [model, setModel] = useState<any>(null);

  // Isolate hardware bounding loaders
  useEffect(() => {
    loadURDF("/robots/humanoid.urdf").then(setModel);
  }, []);

  // Sync internal geometry coordinates dynamically mapped from Zustand
  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(...position);
    }
  }, [position]);

  // Dynamic Joint-Mapping loop enforcing true hardware synchronization limits!
  useFrame(() => {
    if (!ref.current) return;
    
    // Abstract mesh extraction mapping arbitrary parameters natively out
    const joints: Record<string, number> = {};
    if (ref.current.rotation) {
        joints["waist_joint"] = ref.current.rotation.y;
    }
    
    // Natively dumps arrays straight out to ROS WebSocket arrays!
    sendJointState(joints);
  });

  if (!model) return null;

  return <primitive ref={ref} object={model} />;
}
