"use client";

import DAGCanvas from "@/components/mission/DAGCanvas";
import ReasoningOverlay from "@/components/overlay/ReasoningOverlay";
import DebatePanel from "@/components/panels/DebatePanel";
import ROIPanel from "@/components/panels/ROIPanel";
import Timeline from "@/components/mission/Timeline";
import Omnibar from "@/components/omnibar/Omnibar";
import TacticalSceneWrapper from "@/components/control-plane/3d/TacticalScene";

export default function NexusPage() {
  return (
    <div className="w-screen h-screen bg-bg text-white overflow-hidden relative">

      {/* OMNIBAR */}
      <Omnibar />

      {/* MAIN GRID */}
      <div className="grid grid-cols-[300px_1fr_300px] grid-rows-[1fr_200px] h-full pt-12">

        {/* LEFT PANEL - Telemetry Parameters */}
        <div className="border-r border-[var(--border)] bg-panel p-4 flex flex-col relative z-10">
           <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-6 border-b border-[var(--border)] pb-2 flex justify-between">
              <span>System Constraints</span>
              <span className="text-green animate-pulseSlow">● LIVE</span>
           </div>
           
           <div className="space-y-4 font-mono text-xs text-white/70">
              <div className="flex justify-between p-2 bg-[#050607] border border-[var(--border)]">
                 <span>Battery Floor</span><span className="text-cyan">30%</span>
              </div>
              <div className="flex justify-between p-2 bg-[#050607] border border-[var(--border)]">
                 <span>Risk Threshold</span><span className="text-yellow">Medium</span>
              </div>
              <div className="flex justify-between p-2 bg-[#050607] border border-[var(--border)]">
                 <span>RL Bounds</span><span className="text-cyan">&lt; 0.2ms Latency</span>
              </div>
           </div>
        </div>

        {/* CENTER - Dual Layer 3D Physics and Graphic DAG */}
        <div className="relative">
          <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
             <TacticalSceneWrapper />
          </div>
          <div className="absolute inset-0 z-10 opacity-90">
             <DAGCanvas />
          </div>
        </div>

        {/* RIGHT PANEL - Edge Node Live Feeds */}
        <div className="border-l border-[var(--border)] bg-panel p-4 flex flex-col relative z-20">
           <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-6 border-b border-[var(--border)] pb-2 flex justify-between">
              <span>Edge Deployment</span>
              <span className="text-cyan">3/3 ACTIVE</span>
           </div>
           
           <div className="space-y-4 text-xs font-mono">
              <div className="border border-[var(--border)] p-3 hover:border-cyan/40 transition-colors cursor-pointer bg-[#050607] relative overflow-hidden">
                 <div className="absolute left-0 top-0 w-1 h-full bg-cyan"></div>
                 <div className="flex justify-between mb-2">
                     <span className="text-cyan font-bold">RBT-01</span>
                     <span>v1.2.4</span>
                 </div>
                 <div className="text-white/40">Status: Idle Operations</div>
              </div>
              <div className="border border-[var(--border)] p-3 hover:border-cyan/40 transition-colors cursor-pointer bg-[#050607] relative overflow-hidden opacity-50">
                 <div className="absolute left-0 top-0 w-1 h-full bg-green animate-pulseSlow"></div>
                 <div className="flex justify-between mb-2">
                     <span className="text-green font-bold">HUM-04</span>
                     <span>v1.2.8</span>
                 </div>
                 <div className="text-white/40">Status: Tracking Limits</div>
              </div>
           </div>
        </div>

        {/* TIMELINE - Full Spanning Temporal Layout */}
        <div className="col-span-3 border-t border-[var(--border)] bg-[#050607] z-30 relative shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <Timeline />
        </div>
      </div>

      {/* INTELLIGENCE OVERLAYS - Palantir Hooks */}
      <ReasoningOverlay />
      <DebatePanel />
      <ROIPanel />

    </div>
  );
}
