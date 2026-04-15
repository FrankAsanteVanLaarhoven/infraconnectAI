"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Satellite, Ship, AlertCircle, Radio, MapPin, Eye, SatelliteEye } from 'lucide-react';
import { fetchChokepointIntel, MaritimeAlert } from '@/lib/nexus/osint-fusion';

export function MaritimeIntelligenceHub() {
  const [sarLogs, setSarLogs] = useState<MaritimeAlert[]>([]);

  useEffect(() => {
    const alerts = fetchChokepointIntel();
    setSarLogs(alerts);
  }, []);

  return (
    <div className="w-full h-full bg-black/60 backdrop-blur-3xl border border-cyan-500/30 rounded-xl overflow-hidden flex flex-col font-mono select-none">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20 bg-cyan-950/10 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Satellite className="w-5 h-5 text-cyan-400" />
            <div>
               <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Maritime Intel Hub</h3>
               <p className="text-[8px] text-cyan-900 font-bold uppercase tracking-widest">RADARSAT-3 // AIS FUSION</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <span className="text-[8px] text-cyan-500 font-black animate-pulse">SAR ACTIVE</span>
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
         </div>
      </div>

      {/* Global AIS Stats */}
      <div className="grid grid-cols-2 bg-slate-950/40 border-b border-cyan-900/10">
         <div className="p-3 border-r border-cyan-900/10 flex items-center justify-between">
            <span className="text-[8px] text-slate-600 uppercase font-black">Dark Vessels</span>
            <span className="text-xs font-black text-white">42 Active</span>
         </div>
         <div className="p-3 flex items-center justify-between">
            <span className="text-[8px] text-slate-600 uppercase font-black">Hormuz Gaps</span>
            <span className="text-xs font-black text-red-500">8 Critical</span>
         </div>
      </div>

      {/* Live SAR Ingest */}
      <div className="flex-1 overflow-hidden flex flex-col">
         <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Radio className="w-3 h-3 text-cyan-500" />
               <span className="text-[9px] text-slate-400 uppercase font-black">RADARSAT-3 Synthetic Aperture Log</span>
            </div>
            <Eye className="w-3 h-3 text-cyan-900 cursor-pointer hover:text-cyan-400" />
         </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            <AnimatePresence>
               {sarLogs.map(log => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col p-2 bg-slate-900/20 border border-slate-800 rounded group hover:border-cyan-500/30 transition-all font-mono"
                  >
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-white font-black tracking-tighter uppercase">{log.title}</span>
                        <span className={`text-[7px] px-1.5 py-0.5 rounded font-black ${
                           log.riskLevel === 'CRITICAL' ? 'bg-red-950 text-red-500' :
                           log.riskLevel === 'HIGH' ? 'bg-amber-950 text-amber-500' :
                           'bg-cyan-950 text-cyan-400'
                        }`}>
                           {log.riskLevel}
                        </span>
                     </div>
                     <p className="text-[8px] text-slate-500 leading-tight mb-2 line-clamp-2">
                        {log.description}
                     </p>
                     <div className="flex justify-between items-center text-[7px] text-slate-700 font-bold uppercase">
                        <span className="flex items-center gap-1"><Radio className="w-2 h-2" /> {log.type}</span>
                        <span>{log.timestamp}</span>
                     </div>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>
      </div>

      {/* Chokepoint Status Hub */}
      <div className="p-4 bg-cyan-950/10 border-t border-cyan-900/30">
         <h4 className="text-[9px] text-slate-500 uppercase font-black mb-3 text-center tracking-widest underline decoration-cyan-500/40">Transit Chokepoint Alerts</h4>
         <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-red-950/10 border border-red-900/20 rounded">
               <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span className="text-[9px] text-white font-black uppercase">Strait of Hormuz</span>
               </div>
               <span className="text-[9px] text-red-500 font-black animate-pulse uppercase">CLOSED (92%)</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-amber-950/10 border border-amber-900/20 rounded">
               <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span className="text-[9px] text-white font-black uppercase">Suez Canal</span>
               </div>
               <span className="text-[9px] text-amber-500 font-black uppercase">DELAY: 48H</span>
            </div>
         </div>
      </div>
    </div>
  );
}
