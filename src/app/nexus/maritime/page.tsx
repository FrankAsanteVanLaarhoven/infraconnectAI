"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ship, 
  Globe, 
  MapPin, 
  ShieldAlert, 
  Activity, 
  Navigation, 
  Anchor, 
  Waves,
  Satellite,
  Compass,
  Zap,
  ChevronRight,
  TrendingUp,
  Target
} from 'lucide-react';
import { Vessel, vesselFleetEngine } from '@/lib/nexus/vesselFleetEngine';
import { MaritimeIntelligenceHub } from '@/components/nexus/MaritimeIntelligenceHub';
import { VesselDetailHub } from '@/components/nexus/VesselDetailHub';
import { MetricLensChart } from '@/components/nexus/MetricLensChart';

export default function MaritimePage() {
  const [vessels, setVessels] = useState<Vessel[]>(vesselFleetEngine.getVessels());
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(vessels[0]);
  const [riskLevel, setRiskLevel] = useState('MEDIUM');

  useEffect(() => {
    const inv = setInterval(() => {
      setVessels(vesselFleetEngine.updateFleet());
    }, 3000);
    return () => clearInterval(inv);
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 font-mono flex flex-col overflow-hidden selection:bg-cyan-500/30">
       
       {/* Global Maritime Header */}
       <header className="h-20 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-8 relative z-50">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                   <Waves className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                   <h1 className="text-xl font-black text-white uppercase tracking-[0.4em]">Maritime Control Room</h1>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Global Logistic Oversight // AIS + SAR Fusion</p>
                </div>
             </div>
             <div className="h-8 w-[1px] bg-white/10" />
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest mb-1">Active Vessels</span>
                <span className="text-sm font-black text-white tracking-widest">{vessels.length} <span className="text-[10px] text-slate-700">/ 1,248 IN_GRID</span></span>
             </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="text-right">
                <span className="text-[8px] text-slate-600 block mb-1 font-black uppercase tracking-widest">APAC Mission Status</span>
                <span className="text-xs font-black text-emerald-500 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   PIVOT_ENABLED
                </span>
             </div>
             <div className="flex gap-2">
                {['HORMUZ', 'SUEZ', 'MALACCA'].map(c => (
                   <div key={c} className="px-3 py-1 bg-white/5 border border-white/10 rounded flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{c}</span>
                   </div>
                ))}
             </div>
          </div>
       </header>

       <main className="flex-1 flex overflow-hidden">
          
          {/* Left: Global AIS Map Simulation (Grid View) */}
          <div className="flex-1 relative bg-slate-950 p-4 border-r border-white/5 overflow-hidden">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
             
             {/* Map Controls */}
             <div className="absolute top-8 left-8 z-30 flex flex-col gap-2">
                <button className="p-3 bg-black/80 border border-white/10 rounded-xl hover:bg-slate-900 transition-all text-white shadow-2xl">
                   <Target className="w-4 h-4" />
                </button>
                <button className="p-3 bg-black/80 border border-white/10 rounded-xl hover:bg-slate-900 transition-all text-white shadow-2xl">
                   <Activity className="w-4 h-4" />
                </button>
             </div>

             {/* Vessels Grid Rendering */}
             <div className="relative w-full h-full pt-12">
                <div className="grid grid-cols-12 gap-px opacity-20 relative pointer-events-none">
                   {Array.from({ length: 144 }).map((_, i) => (
                      <div key={i} className="aspect-square border border-white/5" />
                   ))}
                </div>

                {/* Animated Vessel Markers */}
                {vessels.map((v) => (
                   <motion.div
                      key={v.id}
                      animate={{ 
                        left: `${(v.lng - 50) * 10}%`, 
                        top: `${(v.lat - 20) * 8}%` 
                      }}
                      className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      onClick={() => setSelectedVessel(v)}
                   >
                      <div className={`p-1.5 rounded-sm border shadow-2xl transition-all ${
                         selectedVessel?.id === v.id ? 'bg-cyan-500 border-white scale-125' : 
                         v.status === 'DARK' ? 'bg-black border-red-500' :
                         v.status === 'DEVIATING' ? 'bg-amber-500 border-white' :
                         'bg-slate-900 border-cyan-500/40 hover:scale-110'
                      }`}>
                         <Ship className={`w-3 h-3 ${selectedVessel?.id === v.id ? 'text-black' : 'text-white'}`} />
                      </div>
                      
                      {/* Vessel Label Hover */}
                      <div className="absolute left-6 top-0 hidden group-hover:block z-50">
                         <div className="bg-black/95 border border-white/20 p-2 rounded shadow-2xl backdrop-blur-md min-w-[120px]">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">{v.name}</p>
                            <div className="flex justify-between items-center mt-1">
                               <span className="text-[8px] text-slate-500 uppercase">{v.status}</span>
                               <span className="text-[8px] text-cyan-500 font-bold">{v.speed} KN</span>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                ))}
             </div>

             {/* Bottom Map Info */}
             <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
                <div className="p-4 bg-black/60 border border-white/10 rounded-xl backdrop-blur-md pointer-events-auto max-w-sm">
                   <div className="flex items-center gap-3 mb-2">
                      <Satellite className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">RADARSAT-3 Live Feed</span>
                   </div>
                   <p className="text-[9px] text-slate-400 leading-relaxed font-bold uppercase">
                      AIS Data synthesis completed. Cross-referencing 12 SAR anomalies in Hormuz Sector-B. Dark vessel P-421 confirmed.
                   </p>
                </div>
                <div className="flex gap-4 pointer-events-auto">
                   <div className="px-6 py-3 bg-black border border-white/10 rounded-xl flex flex-col items-end">
                      <span className="text-[8px] text-slate-600 uppercase font-black mb-1">Chokepoint Load</span>
                      <span className="text-xl font-black text-red-500 tabular-nums">92%</span>
                   </div>
                   <div className="px-6 py-3 bg-black border border-white/10 rounded-xl flex flex-col items-end">
                      <span className="text-[8px] text-slate-600 uppercase font-black mb-1">Pricing Delta</span>
                      <span className="text-xl font-black text-white tabular-nums">+$1.2M</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Right: Tactical Sidebar */}
          <div className="w-96 flex flex-col gap-px bg-white/5 relative z-50 overflow-y-auto custom-scrollbar border-l border-white/5">
             
             {/* 1. Deep Asset Detail */}
             <div className="bg-[#020202] border-b border-white/5 h-[300px]">
                {selectedVessel ? (
                   <VesselDetailHub name={selectedVessel.name} type={selectedVessel.type} />
                ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center opacity-20 grayscale">
                      <Anchor className="w-12 h-12 mb-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Initialize Uplink</span>
                   </div>
                )}
             </div>

             {/* 2. Global SAR Intelligence Feed */}
             <div className="p-4 h-[400px]">
                <MaritimeIntelligenceHub />
             </div>

             {/* 3. Ripple Analysis Chart */}
             <div className="p-4 flex-1">
                <div className="bg-slate-900/10 border border-white/5 rounded-xl h-full flex flex-col">
                   <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <TrendingUp className="w-3 h-3 text-indigo-400" />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Supply Chain Ripple</span>
                      </div>
                      <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
                   </div>
                   <div className="flex-1 p-2">
                      <MetricLensChart title="TRANSIT RISK INDEX" unit="LOAD%" />
                   </div>
                </div>
             </div>

          </div>

       </main>

       {/* Global Pulse Indicator */}
       <footer className="h-8 border-t border-white/5 bg-black flex items-center justify-between px-6 text-[8px] font-black text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> SYSTEM_OS_LIVE: NODE_A21</span>
             <span>AIS_HANDSHAKE: OK</span>
             <span>SAR_DISCOVERY: ACTIVE</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-cyan-900">UDS:9B-X-LOGS</span>
             <span className="text-indigo-950">GRID:PH7-X-SYNC</span>
          </div>
       </footer>

    </div>
  );
}
