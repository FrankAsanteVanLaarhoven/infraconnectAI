"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Satellite, 
  Map, 
  Target, 
  Zap, 
  Activity, 
  Radar, 
  Globe, 
  Layers,
  Search,
  Crosshair,
  AlertTriangle,
  ChevronRight,
  Database
} from 'lucide-react';
import { orbitalEngine, OrbitalSignal } from '@/lib/nexus/orbitalEngine';

export default function SpacePage() {
  const [signals, setSignals] = useState<OrbitalSignal[]>(orbitalEngine.getSignals());
  const [scanning, setScanning] = useState(false);
  const [activeSignal, setActiveSignal] = useState<OrbitalSignal | null>(signals[0]);

  useEffect(() => {
    const inv = setInterval(() => {
      const nextSignals = orbitalEngine.performSweep();
      setSignals([...nextSignals]);
    }, 5000);
    return () => clearInterval(inv);
  }, []);

  const triggerSweep = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 font-mono flex flex-col overflow-hidden selection:bg-cyan-500/30">
       
       {/* Space Header */}
       <header className="h-20 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-8 relative z-50">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                   <Satellite className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                   <h1 className="text-xl font-black text-white uppercase tracking-[0.4em]">Orbital Command Center</h1>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Global Recon Layer // SAR Fusion V1</p>
                </div>
             </div>
             <div className="h-8 w-[1px] bg-white/10" />
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest mb-1">Orbital Integrity</span>
                <span className="text-sm font-black text-indigo-500 tracking-widest">
                   {(orbitalEngine.getOrbitalIntegrityScore() * 100).toFixed(1)}% <span className="text-[10px] text-slate-700">SAT_RECON</span>
                </span>
             </div>
          </div>

          <div className="flex items-center gap-8 text-right">
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-600 block mb-1 font-black uppercase tracking-widest">Constellation</span>
                <span className="text-xs font-black text-white uppercase">IC-ORBITAL-S-NET</span>
             </div>
             <button 
               onClick={triggerSweep}
               disabled={scanning}
               className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                  scanning ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'bg-indigo-600 text-black hover:bg-indigo-500 shadow-[0_0_15px_#6366f1]'
               }`}
             >
                <Radar className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                {scanning ? 'Sweeping Grid...' : 'Perform SAR Sweep'}
             </button>
          </div>
       </header>

       <main className="flex-1 flex overflow-hidden">
          
          {/* Left: Planetary Scan Visualizer */}
          <div className="flex-1 relative bg-black p-8 border-r border-white/5 overflow-y-auto custom-scrollbar">
             {/* UI Scanline */}
             <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,255,255,0.25)_50%)] bg-[length:100%_4px] z-20"></div>
             
             <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#6366f1 1.5px, transparent 1.5px)', backgroundSize: '60px 60px' }} />
             
             <div className="max-w-4xl mx-auto h-full flex flex-col gap-8 relative z-10">
                <div className="flex-1 relative bg-slate-950/40 border border-white/5 rounded-3xl overflow-hidden flex items-center justify-center group shadow-[inset_0_0_100px_rgba(99,102,241,0.05)]">
                   
                   {/* Abstract Globe Grid */}
                   <div className="relative w-[500px] h-[500px]">
                      <div className="absolute inset-0 border border-indigo-500/10 rounded-full animate-[spin_20s_linear_infinite]" />
                      <div className="absolute inset-0 border border-indigo-500/5 rounded-full scale-110 animate-[spin_30s_linear_infinite_reverse]" />
                      <Globe className="absolute inset-0 m-auto w-32 h-32 text-indigo-500/20 group-hover:text-indigo-500/40 transition-all duration-1000" />
                      
                      {/* Detection Rings */}
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-80 h-80 border border-indigo-500/20 rounded-full animate-ping opacity-20" />
                      </div>

                      {/* Active Signals */}
                      {signals.map((s, i) => (
                         <motion.div 
                           key={s.id}
                           style={{ top: `${20 + i * 25}%`, left: `${30 + i * 20}%` }}
                           className="absolute flex flex-col items-center gap-2 cursor-pointer group/node"
                           onClick={() => setActiveSignal(s)}
                         >
                            <div className={`w-3 h-3 rounded-full transition-all ${
                               s.isAnomaly ? 'bg-amber-500 animate-pulse' : 'bg-indigo-500 group-hover/node:scale-150'
                            }`} />
                            <div className="hidden group-hover/node:block absolute top-full mt-2 px-2 py-1 bg-black/80 border border-indigo-500/30 rounded text-[7px] font-black text-white whitespace-nowrap uppercase">
                               {s.target}
                            </div>
                         </motion.div>
                      ))}
                   </div>

                   {/* Scanning Bar */}
                   <AnimatePresence>
                      {scanning && (
                         <motion.div 
                            initial={{ top: '-100%' }}
                            animate={{ top: '100%' }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: 'linear' }}
                            className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_#6366f1] blur-sm z-30"
                         />
                      )}
                   </AnimatePresence>

                   {/* Visual Data Overlays */}
                   <div className="absolute top-8 left-8 p-4 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-2">
                         <Radar className="w-4 h-4 text-indigo-400" />
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Scan Hub</span>
                      </div>
                      <div className="text-[8px] text-slate-500 uppercase font-black space-y-1">
                         <div>Res: 0.25M SAR Ground-Sample</div>
                         <div>Polarization: HH + VV</div>
                         <div>Mode: Stripmap High-Res</div>
                      </div>
                   </div>

                   <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3 text-right">
                      <div className="bg-black/60 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                         <span className="text-[8px] text-slate-600 block mb-1 font-black uppercase tracking-widest">Orbital Pass</span>
                         <span className="text-xs font-black text-white uppercase">IC-SAT-4 @ T-22:42</span>
                      </div>
                      <div className="flex items-center gap-2 text-[8px] text-indigo-950 font-black uppercase tracking-widest">
                         Telemetry_Sync: <span className="text-indigo-400 underline">v1.2-SAR-GRID</span>
                      </div>
                   </div>

                </div>

                {/* Sub-Surface Site Analysis */}
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col gap-6 group hover:border-white/10 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <Layers className="w-5 h-5 text-amber-500" />
                         </div>
                         <div>
                            <span className="text-[8px] text-slate-600 uppercase font-black block mb-1">Industrial Anomalies</span>
                            <span className="text-xl font-black text-white tracking-tighter">04 <span className="text-xs opacity-40">SITE_DETECTED</span></span>
                         </div>
                      </div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                         Unmapped sub-surface energy infrastructure detected. Comparing with McKinsey 2035 projection for valuation gaps.
                      </p>
                   </div>

                   <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl flex flex-col gap-6 group hover:border-indigo-500/40 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <Crosshair className="w-5 h-5 text-indigo-400" />
                         </div>
                         <div>
                            <span className="text-[8px] text-slate-600 uppercase font-black block mb-1">Dark Vessel Cluster</span>
                            <span className="text-xl font-black text-indigo-500 tracking-tighter">12 <span className="text-xs opacity-40">AIS_MISMATCH</span></span>
                         </div>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">
                         SAR detections confirmed 12 vessels without AIS transponders in APAC sector 4. Triggering mission aggression boost.
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* Right: Orbital Signals Sidebar */}
          <div className="w-[400px] flex flex-col bg-slate-950 relative z-50 border-l border-white/5 overflow-hidden">
             
             {/* 1. Signals Feed */}
             <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Activity className="w-4 h-4 text-indigo-400 shadow-[0_0_10px_#6366f1]" />
                   <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Orbital Signals</h2>
                </div>
                <span className="text-[8px] text-slate-700 font-black uppercase tracking-widest">Live_SATA_NET</span>
             </div>
             
             <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
                {signals.map((s) => (
                   <div 
                      key={s.id} 
                      onClick={() => setActiveSignal(s)}
                      className={`p-5 bg-white/[0.02] border transition-all rounded-2xl flex flex-col gap-3 group cursor-pointer ${
                         activeSignal?.id === s.id ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5 hover:border-white/10'
                      }`}
                   >
                      <div className="flex justify-between items-center text-[8px] font-black uppercase">
                         <span className={`${s.isAnomaly ? 'text-amber-500' : 'text-slate-500'}`}>{s.type}</span>
                         <span className="text-indigo-400 font-mono tracking-tighter">{(s.confidence * 100).toFixed(1)}% CONF</span>
                      </div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{s.target}</h4>
                      <div className="flex justify-between items-center text-[7px] text-slate-600 font-black uppercase tracking-widest">
                         <span>LOC: {s.coordinates}</span>
                         <ChevronRight className="w-3 h-3 group-hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100" />
                      </div>
                   </div>
                ))}
             </div>

             {/* 2. Target Discovery Analysis */}
             <div className="p-8 border-t border-white/5 bg-black space-y-6">
                <div className="flex items-center gap-3">
                   <Search className="w-4 h-4 text-slate-500" />
                   <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Signal Detail Hub</h3>
                </div>
                
                {activeSignal ? (
                   <div className="space-y-6">
                      <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Layers className="w-12 h-12 text-indigo-500" />
                         </div>
                         <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">TELEMETRY_SOURCE</h4>
                         <span className="text-xs font-black text-white uppercase tracking-wider block mb-1">Pass ID: IC-SAR-X92</span>
                         <span className="text-[8px] text-indigo-400 font-mono">RESOLVED_LATENCY: 12.2ms</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-[8px] text-slate-600 uppercase font-black block mb-2">Type</span>
                            <span className="text-[10px] font-black text-white uppercase">{activeSignal.type}</span>
                         </div>
                         <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                            <span className="text-[8px] text-slate-600 uppercase font-black block mb-2">Anomaly</span>
                            <span className={`text-[10px] font-black uppercase ${activeSignal.isAnomaly ? 'text-amber-500' : 'text-emerald-500'}`}>
                               {activeSignal.isAnomaly ? 'TRUE' : 'FALSE'}
                            </span>
                         </div>
                      </div>

                      <button className="w-full py-4 bg-black border border-white/10 text-white text-[9px] font-black uppercase tracking-widest hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all group">
                         <div className="flex items-center justify-center gap-3">
                            <Database className="w-3.5 h-3.5 text-indigo-500 group-hover:animate-pulse" />
                            Ingest into Autonomous Mission
                         </div>
                      </button>
                   </div>
                ) : (
                   <div className="text-center py-12 opacity-20">
                      <Map className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Select Signal for deep Recon</span>
                   </div>
                )}
             </div>

          </div>

       </main>

       {/* Orbital Status Footer */}
       <footer className="h-8 border-t border-white/5 bg-black flex items-center justify-between px-6 text-[8px] font-black text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> SPACE_LAYER: CONNECTED</span>
             <span>SAR_PASSES: 14_DAILY</span>
             <span>GHOST_VESSELS_DETECTED: 12</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-indigo-900 underline">SAT_RECON: LATEST</span>
             <span className="text-indigo-950 underline">SYNX_CONTROL: ORBIT-01</span>
          </div>
       </footer>

    </div>
  );
}
