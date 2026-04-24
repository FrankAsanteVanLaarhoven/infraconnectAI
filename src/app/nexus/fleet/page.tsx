"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Terminal, 
  ShieldAlert, 
  Zap, 
  Activity, 
  Thermometer, 
  Waves, 
  HardDrive,
  Box,
  ChevronRight,
  Server
} from 'lucide-react';
import { HardwareVital, assetHealthEngine } from '@/lib/nexus/assetHealthEngine';

export default function FleetPage() {
  const [vitals, setVitals] = useState<HardwareVital[]>(assetHealthEngine.getVitals());
  const [selectedAsset, setSelectedAsset] = useState<HardwareVital | null>(vitals[0]);
  const [gridEfficiency, setGridEfficiency] = useState(1.0);

  useEffect(() => {
    const inv = setInterval(() => {
      const nextVitals = assetHealthEngine.updateVitals();
      setVitals([...nextVitals]);
      setGridEfficiency(assetHealthEngine.getHardwareDensityScore());
    }, 3000);
    return () => clearInterval(inv);
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CRITICAL': return 'text-red-500';
      case 'HOT': return 'text-amber-500';
      case 'WARM': return 'text-cyan-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="min-h-full bg-[#020202] text-slate-300 font-mono flex flex-col overflow-hidden selection:bg-cyan-500/30">
       
       {/* Fleet Header */}
       <header className="h-20 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-8 relative z-50">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 border border-slate-700 rounded-sm">
                   <Server className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                   <h1 className="text-xl font-black text-white uppercase tracking-[0.4em]">Sovereign Fleet Hub</h1>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Sim2Real Hardware Control // Orin NX Core</p>
                </div>
             </div>
             <div className="h-8 w-[1px] bg-white/10" />
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest mb-1">Grid Efficiency</span>
                <span className={`text-sm font-black tracking-widest transition-colors ${gridEfficiency < 0.9 ? 'text-amber-500' : 'text-slate-300'}`}>
                   {(gridEfficiency * 100).toFixed(1)}% <span className="text-[10px] text-slate-700">HW_AVAIL</span>
                </span>
             </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="text-right">
                <span className="text-[8px] text-slate-600 block mb-1 font-black uppercase tracking-widest">Hardware Substrate</span>
                <span className="text-xs font-black text-indigo-400 flex items-center gap-2 font-mono">
                   MULTI-REGION_EDGE
                   <div className="w-2 h-2 rounded-sm bg-indigo-500" />
                </span>
             </div>
             <div className="flex gap-2">
                {['T-DIE_MON', 'POWER_G', 'GPU_L2'].map(s => (
                   <div key={s} className="px-3 py-1 bg-white/5 border border-white/10 rounded flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-sm bg-indigo-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{s}</span>
                   </div>
                ))}
             </div>
          </div>
       </header>

       <main className="flex-1 flex overflow-hidden">
          
          {/* Left: Hardware Asset Grid */}
          <div className="flex-1 relative bg-slate-950 p-8 border-r border-white/5 overflow-y-auto custom-scrollbar">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
             
             <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                
                {/* 1. Hardware Vitallity Grid */}
                <section className="space-y-4">
                   <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-3">
                         <Cpu className="w-4 h-4 text-slate-300" />
                         <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Physical Infrastructure Stack</h2>
                      </div>
                      <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Sync: Real-Time / Sim2Real</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      {vitals.map(asset => (
                         <button 
                           key={asset.id}
                           onClick={() => setSelectedAsset(asset)}
                           className={`p-6 bg-white/[0.02] border transition-all rounded-none flex flex-col gap-6 text-left group ${
                              selectedAsset?.id === asset.id ? 'border-slate-700 bg-slate-800' : 'border-white/5 hover:border-white/10'
                           }`}
                         >
                            <div className="flex justify-between items-start">
                               <div className="p-3 bg-slate-900 rounded-sm border border-white/5 shadow-inner">
                                  <Box className={`w-5 h-5 ${getStatusColor(asset.status)}`} />
                               </div>
                               <div className="flex flex-col items-end gap-1">
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                     asset.status === 'CRITICAL' ? 'bg-red-500 text-black ' : 'bg-slate-800 text-slate-300'
                                  }`}>
                                     {asset.status}
                                  </span>
                                  <span className="text-[7px] text-slate-700 font-black uppercase tracking-widest">{asset.type}</span>
                               </div>
                            </div>
                            
                            <div>
                               <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">{asset.name}</h3>
                               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{asset.location}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <span className="text-[8px] text-slate-600 uppercase font-black block">Thermal</span>
                                  <div className="flex items-baseline gap-2">
                                     <span className="text-xl font-black text-white">{asset.metrics.thermal.toFixed(1)}</span>
                                     <span className="text-[10px] text-slate-700">°C</span>
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <span className="text-[8px] text-slate-600 uppercase font-black block">GPU Load</span>
                                  <div className="flex items-baseline gap-2">
                                     <span className="text-xl font-black text-white">{asset.metrics.gpuLoad.toFixed(1)}</span>
                                     <span className="text-[10px] text-slate-700">%</span>
                                  </div>
                               </div>
                            </div>

                            <div className="h-1 w-full bg-slate-900 rounded-sm overflow-hidden mt-2">
                               <motion.div 
                                 initial={{ width: '0%' }}
                                 animate={{ width: `${asset.metrics.gpuLoad}%` }}
                                 className={`h-full ${asset.status === 'CRITICAL' ? 'bg-red-500' : 'bg-slate-800'}`}
                               />
                            </div>
                         </button>
                      ))}
                   </div>
                </section>

                {/* 2. Sim2Real Delta Visualization (Abstract) */}
                <section className="p-8 bg-black/40 border border-white/5 rounded-3xl relative overflow-hidden group">
                   <div className="flex items-center gap-3 mb-8">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Sovereign Prediction Delta</h2>
                   </div>
                   <div className="h-[300px] flex items-center justify-center relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-64 h-64 border border-white/5 rounded-sm animate-[spin_10s_linear_infinite]" />
                         <div className="absolute w-48 h-48 border border-indigo-500/20 rounded-sm animate-[spin_6s_linear_infinite_reverse]" />
                      </div>
                      <div className="text-center z-10 space-y-4">
                         <ShieldAlert className="w-12 h-12 text-indigo-400 mx-auto" />
                         <h3 className="text-lg font-black text-white uppercase tracking-[0.3em]">Delta Sync: OPTIMAL</h3>
                         <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest max-w-[350px] mx-auto leading-relaxed">
                            Comparing model-predicted power consumption with real-time sensor feedback from Orin NX telemetry nodes. No physical tampering detected.
                         </p>
                      </div>
                   </div>
                </section>

             </div>
          </div>

          {/* Right: Asset Intelligence Sidebar */}
          <div className="w-[400px] flex flex-col gap-px bg-white/5 relative z-50 border-l border-white/5 overflow-y-auto custom-scrollbar">
             
             {/* 3. Deep Asset Analysis */}
             <div className="p-8 bg-black/40 space-y-8">
                <div className="flex items-center gap-3">
                   <Activity className="w-4 h-4 text-cyan-400" />
                   <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Physical Vitality Analysis</h2>
                </div>
                
                {selectedAsset && (
                   <div className="space-y-6">
                      <div className="p-6 bg-slate-900 border border-white/5 rounded-none relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Thermometer className="w-12 h-12 text-slate-500" />
                         </div>
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">THERMAL_SIGNATURE</h4>
                         <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-3xl font-black text-white">{selectedAsset.metrics.thermal.toFixed(1)}</span>
                            <span className="text-xs text-slate-600 uppercase font-black font-mono">DEG_CELSIUS</span>
                         </div>
                         <div className="flex gap-4 text-[8px] font-black uppercase text-slate-400">
                            <span>T-DIE: 44.2</span>
                            <span>FAN_RPM: 2400</span>
                            <span>VOLTAGE: 12.1V</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                            <span className="text-[8px] text-slate-600 uppercase font-black block mb-2">Power Draw</span>
                            <span className="text-sm font-black text-white">{selectedAsset.metrics.power.toFixed(1)}W</span>
                         </div>
                         <div className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                            <span className="text-[8px] text-slate-600 uppercase font-black block mb-2">IO Density</span>
                            <span className="text-sm font-black text-white">92.4%</span>
                         </div>
                      </div>
                   </div>
                )}
             </div>

             {/* 4. Infrastructure Maintenance Loop */}
             <div className="flex-1 p-8 bg-black/60 space-y-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                   <ShieldAlert className="w-4 h-4 text-amber-500" />
                   <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Maintenance Interlocks</h2>
                </div>
                <div className="space-y-3">
                   {[
                     { label: 'Thermal Throttle: ON', impact: '-12% Performance' },
                     { label: 'Battery Cycle: HEALTHY', impact: '14.2h Remaining' },
                     { label: 'Encrypted Storage: OK', impact: 'FIPS 140-2' }
                   ].map((item, i) => (
                      <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-sm flex items-center justify-between group hover:border-amber-500/30 transition-all cursor-pointer">
                         <div>
                            <span className="text-[9px] font-black text-white uppercase tracking-wider block mb-1">{item.label}</span>
                            <span className="text-[8px] text-amber-500 font-bold uppercase">{item.impact}</span>
                         </div>
                         <ChevronRight className="w-3 h-3 text-slate-800 group-hover:text-white transition-all underline" />
                      </div>
                   ))}
                </div>
             </div>

          </div>

       </main>

       {/* Hardware Status Footer */}
       <footer className="h-8 border-t border-white/5 bg-black flex items-center justify-between px-6 text-[8px] font-black text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-sm bg-slate-800" /> SIM2REAL_SYNC: OPTIMAL</span>
             <span>TOTAL_NODES: 42</span>
             <span>GRID_HEALTH: CORE_EXCELLENT</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-slate-300 underline">ES_HW:NODE01</span>
             <span className="text-indigo-950 underline">SHV_SUBS:ORIN_X</span>
          </div>
       </footer>

    </div>
  );
}
