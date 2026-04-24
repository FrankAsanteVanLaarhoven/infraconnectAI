"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Box, 
  Activity, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  RefreshCw,
  Terminal,
  Database,
  Search,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface Pod {
  id: string;
  name: string;
  node: string;
  status: 'Running' | 'Scaling' | 'Degraded' | 'Pending';
  cpu: number;
}

export function ControlPlaneGrid() {
  const [pods, setPods] = useState<Pod[]>([]);
  const [nodes] = useState(['node-orin-01', 'node-cloud-02', 'node-edge-03', 'node-orin-04']);
  const [reconciling, setReconciling] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Initial Pod Simulation
    const initialPods: Pod[] = [
      { id: 'p1', name: 'maritime-scanner', node: 'node-orin-01', status: 'Running', cpu: 12 },
      { id: 'p2', name: 'revenue-aggregator', node: 'node-cloud-02', status: 'Running', cpu: 24 },
      { id: 'p3', name: 'threat-detector', node: 'node-orin-01', status: 'Running', cpu: 8 },
      { id: 'p4', name: 'civil-recon', node: 'node-edge-03', status: 'Scaling', cpu: 45 },
    ];
    setPods(initialPods);

    // Simulated Reconciliation Pulse
    const inv = setInterval(() => {
      setReconciling(true);
      setTimeout(() => setReconciling(false), 800);

      setPods(prev => prev.map(p => {
        const delta = (Math.random() - 0.5) * 5;
        let nextStatus = p.status;
        if (Math.random() > 0.95) nextStatus = 'Degraded';
        else if (p.status === 'Degraded') nextStatus = 'Running';

        return { ...p, cpu: Math.max(5, p.cpu + delta), status: nextStatus };
      }));
    }, 5000);

    return () => clearInterval(inv);
  }, []);

  return (
    <motion.div 
       initial={false}
       animate={{ width: isCollapsed ? 64 : 960 }}
       className="h-full bg-[#020617] border-l border-y border-cyan-500/20 rounded-l-3xl flex flex-col font-mono relative overflow-hidden group"
    >
       {/* UI scanline */}
       <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,255,255,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50"></div>

       {isCollapsed ? (
          <div 
             className="w-full h-full flex flex-col items-center py-8 gap-6 cursor-pointer hover:bg-white/5 transition-colors"
             onClick={() => setIsCollapsed(false)}
             title="Expand Control Plane"
          >
             <Box className="w-6 h-6 text-cyan-400" />
             <div 
                className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-4"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
             >
                Neural Control Plane
             </div>
             <div className="mt-auto">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
             </div>
          </div>
       ) : (
          <div className="w-[960px] h-full p-8 flex flex-col">
             {/* Header */}
             <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-none cursor-pointer hover:bg-cyan-500/20 transition-colors" onClick={() => setIsCollapsed(true)}>
                      <ChevronRight className="w-5 h-5 text-cyan-400" />
                   </div>
                   <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-none hidden">
                      <Box className="w-6 h-6 text-cyan-400" />
                   </div>
                   <div>
                <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Neural Control Plane</h2>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Declarative Orchestration // K8S Ideology</p>
             </div>
          </div>

          <div className="flex gap-8 items-center">
             <div className={`flex items-center gap-2 px-4 py-1.5 rounded-sm border transition-all ${reconciling ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/5'}`}>
                <RefreshCw className={`w-3 h-3 ${reconciling ? 'text-cyan-400 animate-spin' : 'text-slate-800'}`} />
                <span className={`text-[8px] font-black uppercase tracking-widest ${reconciling ? 'text-cyan-400' : 'text-slate-800'}`}>Reconciling</span>
             </div>
             <div className="flex flex-col text-right">
                <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest mb-1">Grid Health</span>
                <span className="text-xl font-black text-slate-300 tracking-tighter">99.8%</span>
             </div>
          </div>
       </div>

       {/* Main Content: Node & Pod Matrix */}
       <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 relative z-10">
          
          {/* Node Visualization */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pr-2">
             {nodes.map((node) => {
                const nodePods = pods.filter(p => p.node === node);
                return (
                   <div key={node} className="p-6 bg-slate-950/40 border border-white/5 rounded-3xl relative overflow-hidden group/node hover:border-cyan-500/20 transition-all">
                      <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-3">
                            <Cpu className="w-4 h-4 text-slate-500 group-hover/node:text-cyan-400 transition-colors" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">{node}</span>
                         </div>
                         <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Type: ORIN-NX</span>
                      </div>

                      <div className="flex flex-wrap gap-3">
                         <AnimatePresence>
                            {nodePods.map((p) => (
                               <motion.div 
                                  key={p.id}
                                  layout
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className={`h-12 w-12 rounded-sm flex items-center justify-center border relative group/pod cursor-pointer ${
                                     p.status === 'Running' ? 'bg-cyan-500/10 border-cyan-500/30 ' : 
                                     p.status === 'Degraded' ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'
                                  }`}
                               >
                                  <Box className={`w-5 h-5 ${p.status === 'Running' ? 'text-cyan-400' : p.status === 'Degraded' ? 'text-red-500' : 'text-slate-600'}`} />
                                  
                                  {/* Pod Tooltip Overlay */}
                                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black border border-white/10 rounded hidden group-hover/pod:block z-50 whitespace-nowrap">
                                     <div className="text-[8px] font-black text-white uppercase">{p.name}</div>
                                     <div className="text-[7px] text-cyan-500 uppercase tracking-widest mt-0.5">CPU: {p.cpu.toFixed(1)}%</div>
                                  </div>
                               </motion.div>
                            ))}
                         </AnimatePresence>
                         
                         {/* Empty Slots */}
                         {Array.from({ length: 4 - nodePods.length }).map((_, i) => (
                            <div key={i} className="h-12 w-12 rounded-sm border border-white/[0.02] bg-white/[0.01]" />
                         ))}
                      </div>

                      {/* Node Load Bar */}
                      <div className="mt-8 space-y-2">
                         <div className="flex justify-between text-[7px] font-black text-slate-600 uppercase tracking-widest">
                            <span>Resource Load</span>
                            <span>{Math.floor(Math.random() * 20 + 70)}%</span>
                         </div>
                         <div className="h-1 w-full bg-slate-900 rounded-sm overflow-hidden">
                            <motion.div 
                               initial={{ width: '0%' }}
                               animate={{ width: '78%' }}
                               className="h-full bg-cyan-500/50"
                            />
                         </div>
                      </div>
                   </div>
                );
             })}
          </div>

          {/* Controller Events & Logs */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                   <Terminal className="w-4 h-4 text-slate-500" />
                   <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Controller Events</h3>
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
                   {[
                      { type: 'SUCCESS', msg: 'Reconciled Mission: maritime-scan', time: '1s ago' },
                      { type: 'WARNING', msg: 'Node node-edge-03 high latency', time: '12s ago' },
                      { type: 'SUCCESS', msg: 'Rescheduled civil-recon pod', time: '1m ago' },
                      { type: 'INFO', msg: 'Aggression spec synced for all namespaces', time: '2m ago' }
                   ].map((ev, i) => (
                      <div key={i} className="text-[9px] font-mono leading-relaxed group">
                         <div className="flex justify-between items-center mb-1">
                            <span className={`font-black ${ev.type === 'SUCCESS' ? 'text-slate-300' : ev.type === 'WARNING' ? 'text-amber-500' : 'text-blue-500'}`}>
                               [{ev.type}]
                            </span>
                            <span className="text-slate-800">{ev.time}</span>
                         </div>
                         <div className="text-slate-500 group-hover:text-slate-300 transition-colors">{ev.msg}</div>
                      </div>
                   ))}
                </div>

                {/* Event Footer */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[7px] font-black text-slate-700 uppercase tracking-widest">
                   <span>Watched: ALL_NAMESPACES</span>
                   <span className="underline">Export_Logs</span>
                </div>
             </div>

             {/* Strategic Manifest Control */}
             <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-3xl space-y-4 group cursor-pointer hover:bg-cyan-500/10 transition-all">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="w-4 h-4 text-cyan-400" />
                   <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Apply Global Manifest</h3>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                   Sync desired state across all clusters. This will trigger a rolling restart of mission pods.
                </p>
                <div className="text-[8px] text-cyan-600 font-black uppercase tracking-widest text-right">0:00:23 Until Cooloff</div>
             </div>
          </div>
       </div>

       {/* Bottom Control Bar */}
       <div className="mt-8 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-700 relative z-10">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-800 rounded-sm" />
                <span>API_SERVER: READY</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-sm" />
                <span>ETCD_SYNC: LATEST</span>
             </div>
          </div>
           <span>NEURAL_CP_V1_ALPHA</span>
        </div>
          </div>
       )}
    </motion.div>
  );
}
