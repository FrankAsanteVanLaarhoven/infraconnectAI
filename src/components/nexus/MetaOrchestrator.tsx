"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Cpu, 
  Circle, 
  ChevronDown, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Box,
  Share2,
  Lock,
  Server
} from 'lucide-react';
import { META_HIERARCHY, generateLiveTelemetry, ResourceTelemetry } from '@/lib/nexus/meta';

export function MetaOrchestrator() {
  const [telemetry, setTelemetry] = useState<ResourceTelemetry>(generateLiveTelemetry());
  const [activeSwarm, setActiveSwarm] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(generateLiveTelemetry());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-slate-950/90 backdrop-blur-3xl border border-slate-800 rounded-none overflow-hidden flex flex-col font-mono relative">
      {/* HUD Header */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900/50 rounded-sm border border-slate-800">
               <Eye className="w-5 h-5 text-slate-400" />
            </div>
            <div>
               <h2 className="text-xs font-black text-slate-400 tracking-[0.3em] uppercase">Meta Agent Oracle</h2>
               <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none">System Validation // Cross-Swarm Oversight</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="text-right">
               <p className="text-[8px] text-slate-600 font-black uppercase">Grid Load</p>
               <p className="text-[10px] text-slate-400 font-black">{telemetry.cpuLoad.toFixed(1)}%</p>
            </div>
            <div className="text-right">
               <p className="text-[8px] text-slate-600 font-black uppercase">Latency</p>
               <p className="text-[10px] text-cyan-400 font-black">{telemetry.latencyMS.toFixed(0)}ms</p>
            </div>
         </div>
      </div>

      {/* Hierarchical Tree View */}
      <div className="flex-1 p-8 relative overflow-hidden flex flex-col items-center">
         
         {/* Meta Node (The Source) */}
         <motion.div 
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           className="relative z-20"
         >
            <div className="w-20 h-20 rounded-sm bg-slate-900/50 border-2 border-slate-800 flex items-center justify-center">
               <div className="w-12 h-12 rounded-sm border border-slate-800 flex items-center justify-center animate-spin-slow">
                  <Cpu className="w-6 h-6 text-slate-400" />
               </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 text-center">
               <span className="text-[9px] font-black text-white tracking-widest uppercase">{META_HIERARCHY.meta.name}</span>
            </div>
         </motion.div>

         {/* Connection Lines (SVG) */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <line x1="50%" y1="120px" x2="20%" y2="280px" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="50%" y1="120px" x2="50%" y2="280px" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="50%" y1="120px" x2="80%" y2="280px" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
         </svg>

         {/* Swarms Row */}
         <div className="mt-40 w-full flex justify-around relative z-10">
            {META_HIERARCHY.swarms.map((swarm, sIdx) => (
               <div key={swarm.id} className="flex flex-col items-center gap-12 group">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setActiveSwarm(activeSwarm === swarm.id ? null : swarm.id)}
                    className={`w-14 h-14 rounded-sm border-2 flex items-center justify-center transition-all ${
                      activeSwarm === swarm.id 
                      ? (sIdx === 0 ? 'bg-slate-800 border-slate-700 ' :
                         sIdx === 1 ? 'bg-amber-500/20 border-amber-500 ' :
                         'bg-cyan-500/20 border-cyan-500 ')
                      : 'bg-slate-900 border-slate-700 hover:border-slate-800'
                    }`}
                  >
                     <Share2 className={`w-6 h-6 ${
                        activeSwarm === swarm.id ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'
                     }`} />
                     <div className="absolute -bottom-6 text-[8px] font-black text-slate-500 uppercase tracking-widest">{swarm.name}</div>
                  </motion.button>

                  {/* Workers Sub-Nodes */}
                  <AnimatePresence>
                    {activeSwarm === swarm.id && (
                       <motion.div 
                         initial={{ opacity: 0, y: -20 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -20 }}
                         className="flex gap-4"
                       >
                          {swarm.workers.map(worker => (
                             <div key={worker.id} className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-sm bg-slate-900 border border-slate-700 flex items-center justify-center">
                                   <Server className="w-3 h-3 text-slate-500" />
                                </div>
                                <span className="text-[6px] font-black text-slate-400 uppercase tracking-tighter">{worker.role}</span>
                             </div>
                          ))}
                       </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            ))}
         </div>
      </div>

      {/* Footer System Status */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <Activity className="w-3 h-3 text-slate-400" />
               <span className="text-[9px] text-slate-400 font-black uppercase">Validation Pulse Active</span>
            </div>
            <div className="w-32 h-1 bg-slate-900 rounded-sm overflow-hidden">
               <motion.div 
                 animate={{ x: [-128, 128] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="w-12 h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
               />
            </div>
         </div>
         <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
            Meta Logic Validated // Optimized Efficiency
         </div>
      </div>
    </div>
  );
}
