"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Terminal, 
  LayoutGrid, 
  FileCode, 
  Activity, 
  Zap,
  Box,
  Cpu,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { ControlPlaneGrid } from '@/components/nexus/ControlPlaneGrid';

export default function ControlPlanePage() {
  const [activeNamespace, setActiveNamespace] = useState('maritime');
  const [manifest, setManifest] = useState(`apiVersion: infraconnect.ai/v1alpha1
kind: Mission
metadata:
  name: global-maritime-scan
  namespace: maritime
spec:
  replicas: 4
  aggression: 0.82
  priority: 100
  targetSector: APAC
  nodeSelector:
    type: ORIN-NX
`);

  return (
    <div className="min-h-full bg-[#020202] text-slate-300 font-mono flex flex-col overflow-hidden selection:bg-cyan-500/30">
       
       {/* Control Plane Header */}
       <header className="h-20 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-8 relative z-50">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-sm">
                   <Box className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                   <h1 className="text-xl font-black text-white uppercase tracking-[0.4em]">Sovereign Control Plane</h1>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Neural Orchestration // Desired State Logic</p>
                </div>
             </div>
             <div className="h-8 w-[1px] bg-white/10" />
             <div className="flex gap-4">
                {['maritime', 'revenue', 'governance', 'security'].map(ns => (
                   <button 
                     key={ns} 
                     onClick={() => setActiveNamespace(ns)}
                     className={`px-4 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all ${
                        activeNamespace === ns ? 'bg-cyan-500 text-black ' : 'bg-white/5 text-slate-600 hover:text-white'
                     }`}
                   >
                      ns/{ns}
                   </button>
                ))}
             </div>
          </div>

          <div className="flex items-center gap-8 text-right">
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-600 block mb-1 font-black uppercase tracking-widest">Active Cluster</span>
                <span className="text-xs font-black text-white uppercase">IC-CLUSTER-HQ-01</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-600 block mb-1 font-black uppercase tracking-widest">Version</span>
                <span className="text-xs font-black text-cyan-400 font-mono">v1.23-Alpha</span>
             </div>
          </div>
       </header>

       <main className="flex-1 flex overflow-hidden">
          
          {/* Left: Reconciler Visualizer */}
          <div className="flex-1 relative bg-slate-950 p-8 border-r border-white/5 overflow-y-auto custom-scrollbar">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
             
             <div className="max-w-4xl mx-auto h-full flex flex-col gap-8 relative z-10">
                <div className="flex-1 min-h-[500px]">
                   <ControlPlaneGrid />
                </div>
                
                {/* Cluster Resource Overview */}
                <div className="grid grid-cols-3 gap-6">
                   {[
                      { label: 'CPU Allocation', value: '72%', icon: Cpu, color: 'text-cyan-400' },
                      { label: 'Memory Pressure', value: '54%', icon: LayoutGrid, color: 'text-slate-300' },
                      { label: 'Reconciliation Latency', value: '42ms', icon: Activity, color: 'text-amber-400' }
                   ].map((stat, i) => (
                      <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-none flex items-center gap-6 group hover:border-white/10">
                         <div className={`p-3 bg-white/5 rounded-sm ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                         </div>
                         <div>
                            <span className="text-[8px] text-slate-600 uppercase font-black block mb-1">{stat.label}</span>
                            <span className="text-xl font-black text-white tracking-tighter">{stat.value}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Right: Manifest Editor */}
          <div className="w-[450px] flex flex-col bg-black relative z-50 border-l border-white/5 overflow-hidden">
             <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <FileCode className="w-4 h-4 text-cyan-400" />
                   <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Live Manifest Editor</h2>
                </div>
                <button className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 text-black text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-800 transition-all">
                   <RefreshCw className="w-3 h-3" /> Apply Spec
                </button>
             </div>
             
             <div className="flex-1 p-6 font-mono text-xs leading-relaxed text-slate-400 bg-[#020202] overflow-y-auto custom-scrollbar">
                <textarea 
                  value={manifest}
                  onChange={(e) => setManifest(e.target.value)}
                  spellCheck="false"
                  className="w-full h-full bg-transparent outline-none resize-none text-cyan-500/80 selection:bg-white/10"
                />
             </div>

             <div className="p-6 border-t border-white/5 bg-white/[0.01] space-y-4">
                <div className="flex items-center gap-3">
                   <Zap className="w-4 h-4 text-amber-500" />
                   <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Reconciliation Events</h3>
                </div>
                <div className="space-y-3">
                   {[
                      'ReplicaSet mismatch: target 4, current 3',
                      'ScaleUP successful on node-orin-01',
                      'Mission spec hash updated (v32)',
                      'Resilient self-healing cycle complete'
                   ].map((ev, i) => (
                      <div key={i} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-600 group hover:text-slate-400 transition-colors cursor-pointer">
                         <ChevronRight className="w-3 h-3 text-slate-800" />
                         <span>{ev}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

       </main>

       {/* Control Bar */}
       <footer className="h-8 border-t border-white/5 bg-black flex items-center justify-between px-6 text-[8px] font-black text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-6">
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-sm bg-slate-800" /> CONTROL_SERVER: ONLINE</span>
             <span>CLUSTER_NODES: 42_ACTIVE</span>
             <span>STRATEGIC_NAMESPACES: 4</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-cyan-900 underline">KORE_RECONCILER: LIVE</span>
             <span className="text-indigo-950 underline">SYNX_CONTROLLER_X22</span>
          </div>
       </footer>

    </div>
  );
}
