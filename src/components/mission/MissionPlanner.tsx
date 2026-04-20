"use client";

import React from "react";
import DAGCanvas from "./DAGCanvas";
import ConstraintsPanel from "./ConstraintsPanel";
import Timeline from "./Timeline";

export default function MissionPlanner() {
    return (
        <div className="flex h-full w-full">
            {/* Left Sidebar: Constraints */}
            <aside className="w-80 bg-[#0B0F12] border-r border-[#1A1F24] p-6 flex-shrink-0 z-10 relative">
                <ConstraintsPanel />
            </aside>

            {/* Main Panel: DAG canvas and telemetry execution timeline */}
            <div className="flex-1 flex text-white flex-col relative w-full h-full min-w-0">
                <div className="flex-1 relative z-0">
                    <DAGCanvas />
                </div>
                <div className="h-32 border-t border-[#1A1F24] bg-[#050607]/80 backdrop-blur-md flex-shrink-0 z-10">
                    <Timeline />
                </div>
            </div>
        </div>
    );
}
