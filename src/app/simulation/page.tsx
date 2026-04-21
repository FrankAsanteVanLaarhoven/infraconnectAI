"use client";

import React from "react";
import { RobotViewer } from "../../components/simulation/RobotViewer";

export default function SimulationPage() {
  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <RobotViewer />
    </div>
  );
}
