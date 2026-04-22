"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Network, 
  Zap, 
  AlertCircle, 
  Search,
  ChevronRight,
  Filter,
  BarChart3,
  Dna,
  History
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

/**
 * MissionObservabilityMatrix
 * A CORE observability suite designed to outshine Grafana and Dynatrace.
 * Focused on high-fidelity visual benchmarks and predictive telemetry.
 */
export function MissionObservabilityMatrix({ data }: { data: any }) {
  const [activeMetric, setActiveMetric] = useState<'CPU' | 'MEM' | 'NET'>('CPU');
  
  // High-frequency telemetry buffer for the chart
  const [chartBuffer, setChartBuffer] = useState<any[]>([]);
  // Summary metrics with live jitter
  const [liveStats, setLiveStats] = useState({
    CPU: 42.8,
    MEM: 61.4,
    NET: 89.2
  });
  
  // Real-time trace simulation for the HUD
  const [traces, setTraces] = useState<string[]>([]);
  
  // Initialize and stream data
  useEffect(() => {
    // 1. Initial Buffer Creation
    const initialData = [];
    const now = Date.now();
    for (let i = 20; i >= -10; i--) { // Create 10 projected future points
      initialData.push({
        t: new Date(now - i * 1500).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
        value: i > 0 ? Math.floor(Math.random() * 20 + 40) : null, // Actual for past
        projected: i <= 0 ? Math.floor(Math.random() * 20 + 40) : Math.floor(Math.random() * 20 + 40), // Both for continuity
        timestamp: now - i * 1500,
        isFuture: i < 0
      });
    }
    setChartBuffer(initialData);

    // 2. Continuous Streaming Interval
    const interval = setInterval(() => {
       const timestamp = Date.now();
       const timeStr = new Date(timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
       
       // Update Summaries with subtle jitter
       setLiveStats(prev => ({
         CPU: Math.min(100, Math.max(0, prev.CPU + (Math.random() - 0.5) * 2.5)),
         MEM: Math.min(100, Math.max(0, prev.MEM + (Math.random() - 0.5) * 0.8)),
         NET: Math.max(0, prev.NET + (Math.random() - 0.5) * 8)
       }));

       // Update Chart Buffer with PROPHETIC logic
       setChartBuffer(prev => {
         // Current point becomes 'actual'
         const lastActual = prev.find(p => !p.isFuture) || prev[0];
         const nextActualValue = Math.min(95, Math.max(10, lastActual.value ? lastActual.value + (Math.random() - 0.5) * 12 : 50));
         
         const nextBuffer = prev.map((p, idx) => {
           const isNow = idx === 19; // The current point in our rolling window
           if (idx < 20) {
             return { ...p, isFuture: false, value: p.value || p.projected };
           } else {
             // Roll everything forward and generate new future tail
             const nextFutureVal = Math.min(95, Math.max(10, (prev[idx-1].projected || 50) + (Math.random() - 0.5) * 15));
             return { 
               ...prev[idx+1] || { 
                 t: new Date(timestamp + (idx-19)*1500).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
                 projected: nextFutureVal,
                 isFuture: true,
                 value: null
               }
             };
           }
         });
         
         // Standard sliding window shift
         const shifted = [...nextBuffer.slice(1), {
            t: new Date(timestamp + 10 * 1500).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
            projected: Math.min(90, Math.max(10, (nextBuffer[nextBuffer.length-1]?.projected || 50) + (Math.random() - 0.5) * 20)),
            isFuture: true,
            value: null
         }];

         return shifted;
       });

       // Seed new traces
       if (Math.random() > 0.3) {
         const actions = ["NEURAL_OPTIMIZE", "PROPHETIC_SYNC", "SWARM_CLUSTER", "LATENCY_PREEMPT", "INTENT_FORMED", "PHYSICAL_HANDSHAKE", "REALITY_MESH_OK"];
         const nodes = ["Fleet-Prime", "Edge-Node-07", "Cognitive-Core", "Sentinel-Active", "Reality-Gateway"];
         const newTrace = `[${timeStr}] ${nodes[Math.floor(Math.random() * nodes.length)]} -> ${actions[Math.floor(Math.random() * actions.length)]} :: COMMITTED`;
         setTraces(t => [newTrace, ...t].slice(0, 15));
       }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      
      {/* 1. HIGH-DENSITY METRICS HUD */}
      <div className="grid grid-cols-12 gap-7">
         
         {/* Metric Selector & Summary */}
         <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
            <div className="bg-slate-900/40 border border-white/5 p-7 rounded-3xl backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden group">
               {/* Neural Background Glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px] rounded-full group-hover:bg-cyan-500/10 transition-colors" />
               
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-7 flex items-center gap-3">
                  <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <Activity className="w-3.5 h-3.5 text-cyan-500 animate-[pulse_2s_infinite]" />
                  </div>
                  System Saturation Matrix
               </h3>
               
               <div className="space-y-4">
                  {[
                    { id: 'CPU', label: 'Processing Intent', val: liveStats.CPU.toFixed(1) + '%', icon: Cpu },
                    { id: 'MEM', label: 'Memory Persistence', val: liveStats.MEM.toFixed(1) + '%', icon: HardDrive },
                    { id: 'NET', label: 'Mesh Propagation', val: liveStats.NET.toFixed(1) + 'k', icon: Network }
                  ].map((m) => (
                    <button 
                      key={m.id}
                      onClick={() => setActiveMetric(m.id as any)}
                      className={`w-full p-5 rounded-2xl border transition-all duration-500 flex items-center justify-between group/btn ${activeMetric === m.id ? 'bg-cyan-500/10 border-cyan-400/30 shadow-[0_0_25px_rgba(6,182,212,0.15)]' : 'bg-slate-950/40 border-slate-800/40 hover:border-slate-700/60'}`}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl transition-all duration-500 ${activeMetric === m.id ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-110' : 'bg-slate-800 text-slate-500'}`}>
                             <m.icon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                             <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{m.label}</div>
                             <div className="text-2xl font-black text-white tracking-tighter tabular-nums">{m.val}</div>
                          </div>
                       </div>
                       <ChevronRight className={`w-4 h-4 transition-all duration-500 ${activeMetric === m.id ? 'text-cyan-400 translate-x-1 opacity-100' : 'text-slate-800 opacity-30 group-hover/btn:opacity-100'}`} />
                    </button>
                  ))}
               </div>
            </div>

            {/* ANTICIPATORY CAUSALITY HUB */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-[#020202] border border-indigo-500/20 p-7 rounded-3xl relative overflow-hidden group shadow-2xl">
               <div className="absolute -top-10 -right-10 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Dna className="w-32 h-32 text-indigo-400" />
               </div>
               <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Dna className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Anticipatory Logic Core</span>
               </div>
               <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                  Current mesh trajectory suggests a <span className="text-amber-500/80 underline decoration-dotted">92% probability</span> of nodal congestion in <span className="text-cyan-400">Sector-7</span> within 4ms. <span className="text-indigo-400 font-black">AI PRE-EMPTION: ARMED.</span>
               </p>
               <div className="mt-5 pt-5 border-t border-indigo-500/10 flex justify-between items-center">
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.4em]">Prophetic Confidence</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-20 h-1 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '99.1%' }}
                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-indigo-400 font-black">99.1%</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Cinematic Chart View */}
         <div className="col-span-12 lg:col-span-8 bg-[#010101] border border-white/5 rounded-3xl p-8 lg:p-10 relative overflow-hidden flex flex-col min-h-[520px] shadow-[inset_0_20px_50px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-start mb-10 relative z-10">
               <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                     <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-[pulse_1.5s_infinite]" />
                     Prophetic {activeMetric} Stream
                  </h3>
                  <div className="flex items-center gap-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Projection Depth</span>
                      <span className="text-[9px] text-cyan-400 font-black">+15s</span>
                    </div>
                    <div className="h-[10px] w-[1px] bg-slate-800" />
                    <span className="text-[10px] text-slate-500 font-bold">MODE: ANTICIPATORY</span>
                  </div>
               </div>
               <div className="flex items-center gap-5">
                  <div className="flex flex-col items-end">
                    <div className="text-[8px] text-slate-600 font-black tracking-[0.4em] mb-1.5 uppercase text-right">Model Consistency</div>
                    <div className="px-4 py-1.5 bg-slate-900/60 border border-white/5 rounded-lg flex gap-2.5 items-baseline shadow-xl">
                       <span className="text-xs font-black text-cyan-400 tracking-tighter">99.992</span>
                       <span className="text-[8px] text-slate-500 font-black tracking-widest">INDEX</span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 w-full relative group min-h-[280px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartBuffer}>
                    <defs>
                      <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d2" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d2" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="futureGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="6 6" stroke="#1e293b" vertical={false} opacity={0.2} />
                    <XAxis 
                      dataKey="t" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 8, fill: '#475569', fontWeight: 900, letterSpacing: '0.1em' }} 
                      interval={4}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                       contentStyle={{ 
                         backgroundColor: '#020617', 
                         border: '1px solid #1e293b', 
                         fontSize: '10px', 
                         borderRadius: '16px',
                         boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
                         padding: '16px',
                         backdropFilter: 'blur(20px)'
                       }}
                       itemStyle={{ color: '#06b6d4', padding: '2px 0' }}
                       cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    {/* Ghost Line (Prophetic Projection) */}
                    <Area 
                       type="monotone" 
                       dataKey="projected" 
                       stroke="#6366f1" 
                       fillOpacity={1} 
                       fill="url(#futureGrad)" 
                       strokeWidth={1.5}
                       strokeDasharray="5 5"
                       animationDuration={1000}
                       isAnimationActive={false}
                       opacity={0.6}
                    />
                    {/* Actual Trace (Real-time Reality) */}
                    <Area 
                       type="stepAfter" 
                       dataKey="value" 
                       stroke="#06b6d2" 
                       fillOpacity={1} 
                       fill="url(#metricGrad)" 
                       strokeWidth={2.5}
                       animationDuration={300}
                       isAnimationActive={false}
                       connectNulls={false}
                    />
                  </AreaChart>
               </ResponsiveContainer>
               
               {/* Prophetic Marker */}
               <div className="absolute left-[80%] top-[10%] bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/50 via-indigo-500/10 to-transparent pointer-events-none">
                  <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
                  <div className="absolute top-2 left-2 text-[8px] text-indigo-400 font-black uppercase tracking-[0.3em] whitespace-nowrap bg-black/40 px-2 py-1 rounded border border-indigo-500/20 backdrop-blur-md">
                    Projection Horizon
                  </div>
               </div>
            </div>

            {/* BOTTOM SUMMARY ROW */}
            <div className="grid grid-cols-4 gap-6 mt-10">
               {[
                 { label: 'THROUGHPUT', val: '1.2 PB/S', icon: Network, state: 'high' },
                 { label: 'RESILIENCE', val: 'DEEP MESH', icon: Activity, state: 'nominal' },
                 { label: 'NODES', val: '4.8k UNIT', icon: Zap, state: 'active' },
                 { label: 'THREATS', val: 'PRE-EMPTED', icon: Search, state: 'secure' }
               ].map((stat) => (
                  <div key={stat.label} className="p-5 bg-slate-900/10 border border-white/5 rounded-3xl hover:bg-white/5 hover:border-white/10 transition-all duration-300 group/stat">
                     <div className="flex items-center gap-2.5 mb-2.5">
                        <stat.icon className="w-3 h-3 text-slate-600 transition-colors group-hover/stat:text-cyan-400" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">{stat.label}</span>
                     </div>
                     <div className="text-[11px] font-black text-slate-200 tracking-tight">{stat.val}</div>
                     <div className="mt-3 h-[1.5px] bg-slate-800/50 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ scaleX: [0.7, 1.1, 0.9], opacity: [0.4, 0.8, 0.6] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                          className="h-full bg-cyan-500/40 origin-left"
                        />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* 2. FLEET TRACE STREAM & TOPOLOGY PREVIEW */}
      <div className="grid grid-cols-12 gap-6">
         
         {/* TRACE TERMINAL */}
         <div className="col-span-12 xl:col-span-8 bg-black border border-slate-800 rounded-3xl p-8 flex flex-col h-[360px] shadow-2xl overflow-hidden group">
            <div className="flex justify-between items-center mb-6 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <History className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Global Telemetry Stream</h3>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest whitespace-nowrap mt-1 block">Ingesting 4.2k events / second</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[8px] text-green-500 font-black flex items-center gap-1.5 uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live Connection
                  </div>
               </div>
            </div>
            
            <div className="flex-1 bg-slate-950/20 rounded-2xl p-6 font-mono text-[10px] overflow-hidden flex flex-col gap-2.5 border border-slate-900 shadow-inner group-hover:border-slate-800 transition-colors">
               <AnimatePresence initial={false}>
                  {traces.map((trace, i) => (
                    <motion.div 
                      key={trace + i}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                      className="flex items-center gap-4 text-slate-400 group/line"
                    >
                      <span className="text-slate-700 w-6 shrink-0 font-bold">#{traces.length - i}</span>
                      <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[8px] rounded border border-green-500/20 font-black">200 OK</span>
                      <span className="flex-1 truncate tracking-tight group-hover/line:text-white transition-colors">{trace}</span>
                      <ChevronRight className="w-3 h-3 text-slate-800 opacity-0 group-hover/line:opacity-100" />
                    </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </div>

         {/* TOPOLOGY SUMMARY */}
         <div className="col-span-12 xl:col-span-4 bg-gradient-to-tr from-[#050505] to-slate-900 border border-slate-800 rounded-3xl p-8 overflow-hidden relative group">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            
            <div className="flex flex-col h-full relative z-10">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                    <Filter className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Mesh Topology</h3>
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Self-Healing Logic Active</span>
                  </div>
               </div>

               <div className="flex-1 flex flex-col items-center justify-center py-6">
                  {/* Visual schematic of nodes */}
                  <div className="flex items-center gap-8">
                     <div className="relative">
                       <motion.div 
                         animate={{ rotate: 360 }}
                         transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                         className="absolute -inset-4 border border-dashed border-cyan-500/20 rounded-full"
                       />
                       <div className="w-14 h-14 bg-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.5)] rounded-[1.5rem] flex items-center justify-center text-black relative z-10">
                          <Zap className="w-7 h-7" />
                       </div>
                     </div>
                     <div className="flex flex-col gap-4">
                       {[1,2,3].map(i => (
                          <div key={i} className="flex items-center gap-3">
                             <div className="h-[1px] w-12 bg-slate-800" />
                             <div className="w-8 h-8 border border-slate-800 bg-black rounded-lg flex items-center justify-center text-[10px] text-slate-500 font-bold group-hover:border-slate-700 transition-colors">
                                N{i}
                             </div>
                          </div>
                       ))}
                     </div>
                  </div>
               </div>

               <div className="mt-8 text-[10px] text-slate-400 font-mono leading-relaxed bg-black/40 p-4 rounded-2xl border border-slate-800/60 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-cyan-400 font-black tracking-widest">INTELLIGENCE_UPDATE</span>
                  </div>
                  Global topology re-verified. Mesh stability <span className="text-white font-black">OPTIMAL</span>. No bottlenecks in logic handovers.
               </div>
            </div>
         </div>

      </div>

    </div>
  );
}

// Mock Data Generator for the cinematic chart
function simData() {
  const data = [];
  for (let i = 0; i < 20; i++) {
    data.push({
      t: i + ":00",
      v: Math.floor(Math.random() * 40 + 30)
    });
  }
  return data;
}
