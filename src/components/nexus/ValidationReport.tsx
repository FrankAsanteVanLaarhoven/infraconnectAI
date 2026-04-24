"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardCheck, 
  Battery, 
  Database, 
  BarChart3, 
  FileSearch, 
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { VV_CHECKLIST, generateLiveTelemetry, ResourceTelemetry, SUPER_AGENT_PRESETS } from '@/lib/nexus/meta';

export function ValidationReport() {
  const [telemetry, setTelemetry] = useState<ResourceTelemetry>(generateLiveTelemetry());
  const [isMissionComplete, setIsMissionComplete] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(generateLiveTelemetry());
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleFinishMission = () => {
     setIsMissionComplete(true);
  };

  if (isMissionComplete) {
     return (
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-full h-full bg-slate-950 border-2 border-slate-700 rounded-none p-12 flex flex-col items-center justify-center text-center font-mono relative overflow-hidden"
        >
           {/* Background Seal */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
              <ShieldCheck className="w-[400px] h-[400px] text-slate-300" />
           </div>

           <div className="relative z-10 space-y-6">
              <motion.div 
                 initial={{ y: 20 }}
                 animate={{ y: 0 }}
                 className="p-4 bg-slate-800 border border-slate-700 rounded-sm inline-block mb-4"
              >
                 <CheckCircle2 className="w-12 h-12 text-slate-300" />
              </motion.div>
              
              <div>
                 <h2 className="text-3xl font-black text-white uppercase tracking-[0.5em] mb-2 font-mono">Mission Accomplished</h2>
                 <p className="text-xs text-slate-300 font-black uppercase tracking-widest">Sovereign Validation // Cycle 821-X-PHI</p>
              </div>

              <div className="w-64 h-[2px] bg-slate-800 mx-auto" />

              <div className="grid grid-cols-3 gap-8 max-w-lg">
                 <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-black">ROI Delta</span>
                    <p className="text-xl font-black text-white">+420%</p>
                 </div>
                 <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Resilience</span>
                    <p className="text-xl font-black text-white">99.8%</p>
                 </div>
                 <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Audit Stance</span>
                    <p className="text-xl font-black text-white">IMMUTABLE</p>
                 </div>
              </div>

              <div className="pt-8 flex gap-4 justify-center">
                 <button className="px-6 py-2 bg-slate-800 hover:bg-slate-800 text-black text-[10px] font-black uppercase tracking-widest rounded transition-all">Download Audit Report</button>
                 <button 
                  onClick={() => setIsMissionComplete(false)}
                  className="px-6 py-2 bg-transparent border border-white/10 hover:border-white/20 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded transition-all"
                 >
                    Return to Mission Control
                 </button>
              </div>
           </div>
        </motion.div>
     );
  }

  return (
    <div className="w-full h-full bg-slate-950/90 backdrop-blur-3xl border border-slate-700 rounded-none overflow-hidden flex flex-col font-mono relative">
      <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5 text-slate-300" />
            <div>
               <h2 className="text-xs font-black text-slate-300 tracking-[0.3em] uppercase">V&V Core Hub</h2>
               <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none">Verification // Validation // Telemetry</p>
            </div>
         </div>
         <button 
            onClick={handleFinishMission}
            className="px-3 py-1 bg-slate-800 rounded border border-slate-700 text-[9px] font-black text-slate-300 hover:bg-slate-800 transition-all"
         >
            SYNTHESIZE MISSION
         </button>
      </div>

      <div className="flex-1 flex overflow-hidden p-6 gap-6 relative z-10">
         
         {/* Telemetry Column */}
         <div className="w-1/3 flex flex-col gap-4">
            <div className="p-4 bg-slate-900/60 rounded-sm border border-slate-800 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Database className="w-4 h-4 text-cyan-400" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Memory</span>
                  </div>
                  <span className="text-[10px] text-white font-black">{telemetry.memoryGB.toFixed(1)} GB</span>
               </div>
               <div className="h-1.5 bg-slate-800 rounded-sm overflow-hidden">
                  <motion.div 
                    animate={{ width: `${(telemetry.memoryGB / 192) * 100}%` }}
                    className="h-full bg-cyan-400"
                  />
               </div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-sm border border-slate-800 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Zap className="w-4 h-4 text-amber-400" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Energy</span>
                  </div>
                  <span className="text-[10px] text-white font-black">{telemetry.energyKWH.toFixed(0)} kW/h</span>
               </div>
               <div className="h-1.5 bg-slate-800 rounded-sm overflow-hidden">
                  <motion.div 
                    animate={{ width: `${(telemetry.energyKWH / 550) * 100}%` }}
                    className="h-full bg-amber-400"
                  />
               </div>
            </div>

            <div className="mt-auto p-4 bg-slate-800 border border-slate-700 rounded-sm">
               <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Super Agent Preset</h3>
               <div className="space-y-2">
                  {SUPER_AGENT_PRESETS.map(preset => (
                     <div key={preset.id} className="flex flex-col gap-1 p-2 bg-black/40 rounded border border-slate-800 hover:border-slate-700 transition-all cursor-pointer">
                        <span className="text-[8px] font-black text-white uppercase">{preset.name}</span>
                        <span className="text-[7px] text-slate-500 uppercase font-bold tracking-tighter">{preset.focus}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Validation Checklist Column */}
         <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-slate-300" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Specification Alignment</span>
               </div>
               <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest italic">Validated by Meta Agent</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
               {VV_CHECKLIST.map((check, idx) => (
                  <motion.div 
                    key={check.specMatchId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 bg-slate-900/40 rounded-sm border border-slate-800/50 flex items-center justify-between group hover:border-slate-700 transition-all"
                  >
                     <div className="flex items-center gap-3">
                        <div className={`p-1 rounded ${check.status === 'VERIFIED' ? 'bg-slate-800' : 'bg-amber-500/20'}`}>
                           {check.status === 'VERIFIED' ? <CheckCircle2 className="w-3 h-3 text-slate-300" /> : <AlertCircle className="w-3 h-3 text-amber-400" />}
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-white uppercase tracking-widest">{check.requirement}</p>
                           <p className="text-[7px] text-slate-500 font-bold uppercase">{check.status} // CONFIDENCE: {check.confidence}%</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="w-20 h-1 bg-slate-800 rounded-sm overflow-hidden">
                           <div className={`h-full ${check.status === 'VERIFIED' ? 'bg-slate-800' : 'bg-amber-500'}`} style={{ width: `${check.confidence}%` }} />
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>

            <div className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-sm flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <div>
                     <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">ROI Projection</p>
                     <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tight">System efficiency optimized for peak productivity.</p>
                  </div>
               </div>
               <div className="text-right">
                  <span className="text-lg font-black text-white tracking-widest">+420%</span>
               </div>
            </div>
         </div>

      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
         <div className="flex gap-6">
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-3 h-3 text-slate-300" />
               <span className="text-[9px] text-slate-300 font-black uppercase">Sovereign Security Validated</span>
            </div>
            <div className="flex items-center gap-2">
               <BarChart3 className="w-3 h-3 text-slate-300" />
               <span className="text-[9px] text-slate-300 font-black uppercase">Productivity Peak: REACHED</span>
            </div>
         </div>
         <div className="text-[8px] text-slate-600 font-bold tracking-[0.3em] uppercase italic">
            Meta Audited // Boardroom Ready
         </div>
      </div>
    </div>
  );
}
