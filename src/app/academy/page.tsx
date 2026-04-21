"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AcademyPanel } from "../../components/simulation/AcademyPanel";

export default function AcademyPage() {
  const router = useRouter();

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* SOTA Background matrix logic */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#000_100%)] opacity-80 pointer-events-none" />
      
      {/* 
        The AcademyPanel renders absolute full-screen inside this route. 
        Clicking 'Close' routes the operator back to the Digital Twin.
      */}
      <AcademyPanel onClose={() => router.push('/simulation')} />
    </div>
  );
}
