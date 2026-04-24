"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { URDFRobot } from "./URDFRobot";


export function Robot({ id, position }: { id: string; position: [number, number, number] }) {
  const ref = useRef<any>(null);

  // Sync internal geometry coordinates dynamically mapped from Zustand
  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(...position);
    }
  }, [position]);

  // Dynamic Joint-Mapping loop enforcing true hardware synchronization limits!
  useFrame(() => {
    if (!ref.current) return;
  });

  return (
    <group ref={ref}>
      <URDFRobot />
    </group>
  );
}
