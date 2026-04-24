"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Gauge, TrendingUp } from 'lucide-react';

export function StabilityVisualizer() {
  const [metrics, setMetrics] = useState<any>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    async function fetchStability() {
      try {
        const res = await fetch('/api/fleet/stability');
        const json = await res.json();
        setMetrics(json);
      } catch (err) {
        console.error(err);
      }
    }
    fetchStability();
    const inv = setInterval(fetchStability, 3000);
    return () => clearInterval(inv);
  }, []);

  useEffect(() => {
    const p = setInterval(() => setPulse(p => p + 1), 50);
    return () => clearInterval(p);
  }, []);

  if (!metrics) return null;

  return (
    <div className="w-full h-80 bg-slate-950/50 rounded-sm border border-cyan-500/20 p-6 font-mono relative overflow-hidden group">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Header */}
      <div className="flex justify-between items-start relative z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-sm">
             <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Kinematic Stability Visualizer</h3>
            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Locomotion Benchmarking // VLA Kernel</p>
          </div>
        </div>
        <div className="text-right">
           <span className="text-[8px] text-slate-600 block mb-1 font-black uppercase tracking-widest">Global Stability</span>
           <span className="text-xl font-black text-white tracking-tighter">{(metrics.globalStability * 100).toFixed(2)}%</span>
        </div>
      </div>

      {/* 3D-ish Vector Visualization */}
      <div className="flex-1 flex items-center justify-center relative min-h-[140px]">
         <div className="relative w-40 h-40 border border-cyan-500/10 rounded-sm flex items-center justify-center">
            {/* Axis Vectors */}
            {[0, 120, 240].map((deg, i) => (
               <motion.div 
                 key={i}
                 style={{ rotate: deg }}
                 className="absolute w-full h-[1px] bg-cyan-500/10"
               />
            ))}

            {/* Live Vector Pulse */}
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 border-2 border-cyan-400/20 rounded-sm"
            />

            <div className="z-20 flex flex-col items-center">
               <ShieldCheck className="w-8 h-8 text-cyan-400 drop-" />
               <span className="text-[8px] text-cyan-400 mt-2 font-black uppercase tracking-widest">Kernel Locked</span>
            </div>
         </div>

         {/* Stats Overlays */}
         <div className="absolute top-0 right-0 space-y-4 text-right">
            <div className="bg-slate-900/40 p-3 border border-slate-800 rounded-sm backdrop-blur-md">
               <p className="text-[7px] text-slate-500 font-black uppercase mb-1">Safety Violation Rate (SVR)</p>
               <div className="flex items-center gap-2 justify-end">
                  <Gauge className="w-3 h-3 text-slate-300" />
                  <span className="text-xs font-black text-white">{(metrics.metrics[0]?.svr * 100 || 0).toFixed(3)}%</span>
               </div>
            </div>
            <div className="bg-slate-900/40 p-3 border border-slate-800 rounded-sm backdrop-blur-md">
               <p className="text-[7px] text-slate-500 font-black uppercase mb-1">Disengagement Rate (DMR)</p>
               <div className="flex items-center gap-2 justify-end">
                  <TrendingUp className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs font-black text-white">{(metrics.metrics[0]?.dmr * 100 || 0).toFixed(3)}%</span>
               </div>
            </div>
         </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-[7px] text-slate-700 uppercase font-black tracking-widest border-t border-white/5 pt-3">
         <span>Cycle: B_921_L</span>
         <span>Latency: 14ms RTL</span>
         <span className="text-cyan-900">Jetson Orin NX Optimal</span>
      </div>
    </div>
  );
}
