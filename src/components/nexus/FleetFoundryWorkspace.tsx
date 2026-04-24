"use client";

import React, { useState, useEffect } from 'react';
import { Network, Activity, Cpu, ShieldAlert, GitBranch, Terminal } from 'lucide-react';
import { RobotTelemetry } from '@/lib/robotics/schemas/telemetry';

export const FleetFoundryWorkspace = () => {
  const [fleet, setFleet] = useState<RobotTelemetry[]>([]);
  
  // Connect to the autonomous loop (Simulation)
  useEffect(() => {
    const handleBatch = (e: any) => {
      // In a real CORE implementation, this hooks into your Zustand/store stream
      const payloads = e.detail?.payloads || [];
      if (payloads.length > 0) {
        setFleet(prev => {
          const map = new Map(prev.map(p => [p.robotId, p]));
          payloads.forEach((p: RobotTelemetry) => map.set(p.robotId, p));
          return Array.from(map.values()).slice(0, 50); // Keep max 50 for UI
        });
      }
    };

    window.addEventListener('kafka-stream:batch-flush', handleBatch);
    return () => window.removeEventListener('kafka-stream:batch-flush', handleBatch);
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] p-6 text-white font-mono rounded-sm border border-white/10 shadow-2xl overflow-hidden relative">
      {/* Background Grid Texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 z-10">
        <div className="flex items-center gap-3">
          <Network className="text-cyan-500 w-5 h-5" />
          <h2 className="text-sm font-black tracking-widest uppercase">Fleet Foundry Workspace</h2>
        </div>
        <div className="flex gap-4 text-[10px] uppercase tracking-widest text-white/50">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-sm ${fleet.length > 0 ? 'bg-slate-800 ' : 'bg-red-500'} shadow-[0_0_8px_currentColor]`} />
            Kafka Ingress
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-amber-500" />
            Active Nodes: {fleet.length}
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 z-10 min-h-0 overflow-y-auto custom-scrollbar">
        
        {/* Left Col: Robot Registry */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="text-[10px] text-white/40 uppercase tracking-widest border-b border-white/10 pb-2">Active Fleet Nodes</div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {fleet.length === 0 ? (
               <div className="col-span-3 h-32 flex items-center justify-center text-xs text-white/30 border border-dashed border-white/10 rounded-sm">
                 Awaiting Telemetry Sync...
               </div>
            ) : (
                fleet.map(node => (
                <div key={node.robotId} className="bg-black/60 border border-white/5 p-4 rounded-sm hover:border-cyan-500/50 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300">{node.robotId.split('-')[0].toUpperCase()}</div>
                    <div className={`text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-widest ${node.status === 'ONLINE' ? 'bg-slate-800 text-slate-300' : 'bg-red-500/20 text-red-500'}`}>
                      {node.status}
                    </div>
                  </div>
                  <div className="space-y-2 text-[10px] text-white/60">
                    <div className="flex justify-between">
                       <span>Inference Confidence</span>
                       <span className={node.perception.objectDetection < 0.45 ? 'text-red-400' : 'text-slate-300'}>{(node.perception.objectDetection * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                       <span>Network Latency</span>
                       <span className={node.networkLatency > 200 ? 'text-amber-400' : 'text-white/80'}>{node.networkLatency}ms</span>
                    </div>
                    <div className="flex justify-between">
                       <span>Edge GPU Load</span>
                       <span>{(node.edgeComputeLoad * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Layer 5 AI Loop Status */}
        <div className="flex flex-col gap-4">
          <div className="text-[10px] text-white/40 uppercase tracking-widest border-b border-white/10 pb-2 flex justify-between">
            <span>Autonomous Intelligence Layer</span>
            <span className="text-cyan-500">ENGAGED</span>
          </div>

          {/* Alert Stream */}
          <div className="bg-black/40 border border-red-500/20 rounded-sm p-4 flex flex-col gap-3">
             <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                <ShieldAlert className="w-4 h-4" />
                Intervention Logs
             </div>
             <div className="text-[10px] text-white/60 leading-relaxed font-mono">
               <div className="opacity-50"># Waiting for node degradation...</div>
               {fleet.filter(f => f.perception.objectDetection < 0.45).slice(0,3).map(f => (
                 <div key={f.robotId} className="mt-2 text-amber-500">
                    &gt; [WARN] Node {f.robotId.substring(0,6)} decoupled. Autonomy triggered kinematic deceleration.
                 </div>
               ))}
             </div>
          </div>

          {/* MLOps Dashboard Miniature */}
          <div className="bg-black/40 border border-white/5 rounded-sm p-4 flex-1 flex flex-col">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-4">
                <GitBranch className="w-4 h-4" />
                MLOps Retraining Pipeline
             </div>
             <div className="space-y-4 flex-1">
               {['VisionTransformer_v4.2', 'Kinematics_RL_v1.1'].map((model, i) => (
                  <div key={i} className="flex flex-col gap-1">
                     <div className="flex justify-between text-[9px] uppercase tracking-widest text-white/50">
                        <span>{model}</span>
                        <span className="text-slate-300">STABLE</span>
                     </div>
                     <div className="h-1 w-full bg-white/5 rounded-sm overflow-hidden">
                        <div className="h-full bg-slate-900/50" style={{ width: '100%' }} />
                     </div>
                  </div>
               ))}
             </div>
             
             <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-widest transition-colors rounded border border-white/10 text-white/70 mt-4 flex justify-center items-center gap-2">
                <Terminal className="w-3 h-3" /> Execute Canary Rollback
             </button>
          </div>

        </div>

      </div>
    </div>
  );
};
