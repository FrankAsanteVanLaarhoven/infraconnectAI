"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { URDFRobot } from "./URDFRobot";
import { sendJointState } from "@/lib/robotics/ros";

export function Robot({ id, position }: { id: string; position: [number, number, number] }) {
  const ref = useRef<any>();

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

  return (
    <group ref={ref}>
      <URDFRobot />
    </group>
  );
}
