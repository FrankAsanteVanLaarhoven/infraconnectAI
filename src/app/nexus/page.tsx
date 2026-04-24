"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Activity, 
  Terminal, 
  Zap, 
  ShieldAlert,
  Cpu,
  Layers
} from 'lucide-react';
import ReasoningOverlay from "@/components/overlay/ReasoningOverlay";
import DebatePanel from "@/components/panels/DebatePanel";
import ROIPanel from "@/components/panels/ROIPanel";
import Timeline from "@/components/mission/Timeline";
import Omnibar from "@/components/omnibar/Omnibar";
import { StrategicNexusHub } from "@/components/nexus/StrategicNexusHub";
import { PremiumBackButton } from "@/components/navigation/PremiumBackButton";

const DAGCanvas = dynamic(
  () => import("@/components/mission/DAGCanvas"),
  { ssr: false }
);

const TacticalSceneWrapper = dynamic(
  () => import("@/components/control-plane/3d/TacticalScene"),
  { ssr: false }
);

export default function NexusPage() {
  const [viewMode, setViewMode] = useState<'strategic' | 'tactical'>('strategic');

  return (
    <div className="w-full h-full bg-[#020202] text-white overflow-hidden relative flex flex-col font-mono">
      {/* OMNIBAR */}
      <Omnibar />

      {/* BACK BUTTON */}
      <div className="absolute top-16 left-6 z-50">
        <PremiumBackButton href="/dashboard" label="Return to Dashboard" />
      </div>

      {/* TOP BAR / VIEW TOGGLE */}
      <div className="absolute top-16 right-6 z-50 flex gap-2">
        <button 
          onClick={() => setViewMode('strategic')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded flex items-center gap-2 ${
            viewMode === 'strategic' 
              ? 'bg-zinc-800 text-white border border-zinc-700' 
              : 'bg-black/50 border border-white/10 text-slate-400 hover:bg-white/5'
          }`}
        >
          <Globe className="w-3 h-3" />
          Strategic Core
        </button>
        <button 
          onClick={() => setViewMode('tactical')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded flex items-center gap-2 ${
            viewMode === 'tactical' 
              ? 'bg-slate-800 text-slate-300 border border-slate-700 ' 
              : 'bg-black/50 border border-white/10 text-slate-400 hover:bg-white/5'
          }`}
        >
          <Layers className="w-3 h-3" />
          Tactical DAG
        </button>
      </div>

      <div className="flex-1 w-full h-full pt-12 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {viewMode === 'strategic' ? (
            <motion.div 
              key="strategic"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full p-6"
            >
              <StrategicNexusHub />
            </motion.div>
          ) : (
            <motion.div 
              key="tactical"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full grid grid-cols-[320px_1fr_320px] grid-rows-[1fr_240px]"
            >
              {/* LEFT PANEL - Telemetry Parameters */}
              <div className="border-r border-white/10 bg-black/80 backdrop-blur-md p-6 flex flex-col relative z-10 shadow-2xl">
                 <div className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black mb-6 border-b border-white/10 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-zinc-400" />
                      <span>System Constraints</span>
                    </div>
                    <span className="text-slate-300 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-800 rounded-sm" /> LIVE
                    </span>
                 </div>
                 
                 <div className="space-y-4 font-mono text-xs">
                    <div className="flex flex-col gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-sm hover:border-zinc-500/30 transition-colors">
                       <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Battery Floor</span>
                       <span className="text-zinc-300 font-black text-sm">30.00%</span>
                    </div>
                    <div className="flex flex-col gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-sm hover:border-amber-500/30 transition-colors">
                       <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Risk Threshold</span>
                       <span className="text-amber-400 font-black text-sm">MEDIUM (0.42)</span>
                    </div>
                    <div className="flex flex-col gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-sm hover:border-indigo-500/30 transition-colors">
                       <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">RL Bounds</span>
                       <span className="text-indigo-400 font-black text-sm">&lt; 0.2ms Latency</span>
                    </div>
                 </div>

                 <div className="mt-auto p-4 bg-zinc-900 border border-zinc-800 rounded-sm">
                   <div className="flex items-center gap-2 mb-2">
                     <ShieldAlert className="w-4 h-4 text-zinc-400" />
                     <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Safe Envelope</span>
                   </div>
                   <p className="text-[9px] text-zinc-400/60 leading-relaxed uppercase">
                     CBF-QP constraints active. All units operating within verified probabilistic safety bounds.
                   </p>
                 </div>
              </div>

              {/* CENTER - Dual Layer 3D Physics and Graphic DAG */}
              <div className="relative overflow-hidden bg-[#050505]">
                <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                   {/* <TacticalSceneWrapper /> */}
                </div>
                <div className="absolute inset-0 z-10 opacity-90">
                   {/* <DAGCanvas /> */}
                </div>
                
                {/* Center Targeting Reticle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-sm pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border border-zinc-500/10 rounded-sm" />
                  <div className="absolute w-full h-[1px] bg-white/5" />
                  <div className="absolute h-full w-[1px] bg-white/5" />
                </div>
              </div>

              {/* RIGHT PANEL - Edge Node Live Feeds */}
              <div className="border-l border-white/10 bg-black/80 backdrop-blur-md p-6 flex flex-col relative z-20 shadow-2xl">
                 <div className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black mb-6 border-b border-white/10 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-300" />
                      <span>Edge Deployment</span>
                    </div>
                    <span className="text-slate-300">3/3 ONLINE</span>
                 </div>
                 
                 <div className="space-y-4 text-xs font-mono">
                    <div className="border border-white/10 p-4 rounded-sm hover:border-zinc-500/40 transition-colors cursor-pointer bg-white/[0.02] relative overflow-hidden group">
                       <div className="absolute left-0 top-0 w-1 h-full bg-zinc-500 group-hover:"></div>
                       <div className="flex justify-between mb-3">
                           <span className="text-zinc-300 font-black tracking-widest text-[11px]">RBT-01</span>
                           <span className="text-slate-500 text-[9px]">v1.2.4</span>
                       </div>
                       <div className="text-slate-400 text-[10px] uppercase font-bold">Status: Idle Operations</div>
                       <div className="w-full h-1 bg-black rounded-sm mt-3 overflow-hidden">
                         <div className="h-full w-full bg-zinc-500/50" />
                       </div>
                    </div>
                    
                    <div className="border border-white/10 p-4 rounded-sm hover:border-slate-700 transition-colors cursor-pointer bg-white/[0.02] relative overflow-hidden group">
                       <div className="absolute left-0 top-0 w-1 h-full bg-slate-800 Slow"></div>
                       <div className="flex justify-between mb-3">
                           <span className="text-slate-300 font-black tracking-widest text-[11px]">HUM-04</span>
                           <span className="text-slate-500 text-[9px]">v1.2.8</span>
                       </div>
                       <div className="text-slate-400 text-[10px] uppercase font-bold">Status: Tracking Limits</div>
                       <div className="w-full h-1 bg-black rounded-sm mt-3 overflow-hidden">
                         <div className="h-full w-[85%] bg-slate-800" />
                       </div>
                    </div>

                    <div className="border border-white/10 p-4 rounded-sm hover:border-rose-500/40 transition-colors cursor-pointer bg-white/[0.02] relative overflow-hidden group opacity-60">
                       <div className="absolute left-0 top-0 w-1 h-full bg-rose-500"></div>
                       <div className="flex justify-between mb-3">
                           <span className="text-rose-400 font-black tracking-widest text-[11px]">UAV-8</span>
                           <span className="text-slate-500 text-[9px]">v2.0.1</span>
                       </div>
                       <div className="text-slate-400 text-[10px] uppercase font-bold">Status: Standby Override</div>
                       <div className="w-full h-1 bg-black rounded-sm mt-3 overflow-hidden">
                         <div className="h-full w-[10%] bg-rose-500" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* TIMELINE - Full Spanning Temporal Layout */}
              <div className="col-span-3 border-t border-white/10 bg-black/90 z-30 relative shadow-[0_-20px_40px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
                <Timeline />
                
                {/* Timeline Decorators */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent" />
                <div className="absolute bottom-4 left-6 flex items-center gap-2 opacity-50">
                  <Terminal className="w-3 h-3 text-slate-500" />
                  <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">Temporal Reconciler Active</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* INTELLIGENCE OVERLAYS - Palantir Hooks */}
      <ReasoningOverlay />
      <DebatePanel />
      <ROIPanel />

    </div>
  );
}
