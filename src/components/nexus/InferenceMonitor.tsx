"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Activity, TrendingUp, ShieldAlert } from 'lucide-react';

export function InferenceMonitor() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchPerf() {
       try {
          const res = await fetch('/api/security/ai');
          const json = await res.json();
          setData(json);
       } catch {}
    }
    fetchPerf();
    const inv = setInterval(fetchPerf, 3000);
    return () => clearInterval(inv);
  }, []);

  if (!data) return null;

  return (
    <div className="w-full h-80 bg-slate-950/40 rounded-sm border border-indigo-500/20 p-6 font-mono relative overflow-hidden group">
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '25px 25px' }} />

       {/* Header */}
       <div className="flex justify-between items-start relative z-10 mb-8 border-b border-indigo-500/10 pb-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-sm">
                <Cpu className="w-4 h-4 text-indigo-400" />
             </div>
             <div>
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sovereign Inference Monitor</h3>
                <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Throughput & Latency Pulse // Gemma-4 Infrastructure</p>
             </div>
          </div>
          <div className="text-right">
             <span className="text-[8px] text-slate-600 block mb-1 font-black uppercase tracking-widest">Cognitive Health</span>
             <span className="text-xl font-black text-white tracking-tighter">{(data.health * 100).toFixed(1)}%</span>
          </div>
       </div>

       {/* Performance Tracks */}
       <div className="space-y-6 relative z-10">
          {data.benchmarks.slice(0, 3).map((bench: any, i: number) => (
             <div key={bench.modelId} className="space-y-2">
                <div className="flex justify-between items-end">
                   <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-200 uppercase">{bench.modelId.split('/').pop()}</span>
                      <span className="text-[7px] text-indigo-500 font-bold uppercase">x{bench.benchmarkVsCloud.toFixed(2)} vs Cloud</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-white">{bench.tokensPerSec.toFixed(1)} t/s</span>
                      <span className="text-[10px] font-black text-indigo-400">{bench.latencyMs.toFixed(0)} ms</span>
                   </div>
                </div>
                {/* Visual Pulse Bar */}
                <div className="h-1 w-full bg-slate-900 rounded-sm overflow-hidden relative">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(bench.tokensPerSec / 100) * 100}%` }}
                     className="absolute top-0 left-0 h-full bg-indigo-600"
                   />
                </div>
             </div>
          ))}
       </div>

       {/* Footer: Multi-cluster status */}
       <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-[7px] text-slate-700 uppercase font-black tracking-widest pt-3 border-t border-white/5">
          <span className="flex items-center gap-1"><ShieldAlert className="w-2.5 h-2.5" /> Intercepts Active</span>
          <span>Zero-Latency Fabric: Enabled</span>
          <span className="text-indigo-900">UDS: 821-X-PHI</span>
       </div>
    </div>
  );
}
