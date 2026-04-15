"use client";

import React from 'react';
import { Ship, Navigation, Anchor, ShieldAlert, MapPin, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

export function VesselDetailHub({ name = "ADVANTAGE VITAL", type = "VLCC TANKER" }) {
  const specs = [
    { label: 'STATUS', value: 'UNDERWAY [ENGINE]', color: 'text-green-500' },
    { label: 'FLAG', value: 'MARSHALL ISLANDS [MH]', color: 'text-white' },
    { label: 'SPEED / COURSE', value: '12.4 KN / 310°', color: 'text-white' },
    { label: 'DRAUGHT', value: '18.1m FULL LOAD', color: 'text-cyan-400' },
    { label: 'DESTINATION', value: 'HORMUZ PORT [HAP]', color: 'text-amber-500' },
    { label: 'ETA', value: 'APR 14, 04:30 UTC', color: 'text-white' },
  ];

  return (
    <div className="w-full h-full flex flex-col p-4 font-mono bg-[#020617]/40">
      {/* Vessel Header */}
      <div className="flex items-start justify-between mb-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 border border-slate-700 rounded shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <Ship className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-widest uppercase">{name}</h3>
            <p className="text-[9px] text-slate-500 uppercase">{type} | IMO: 9827463</p>
          </div>
        </div>
        <div className="flex -space-x-1">
          {[1,2,3].map(i => (
             <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Technical Specs Grid */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-6 flex-1">
        {specs.map((spec, i) => (
          <div key={i} className="space-y-1">
            <p className="text-[8px] text-slate-600 uppercase tracking-tighter">{spec.label}</p>
            <p className={`text-[10px] font-bold ${spec.color} uppercase truncate`}>{spec.value}</p>
          </div>
        ))}
      </div>

      {/* Real-time Telemetry Mini-Strip */}
      <div className="mt-6 space-y-3">
        <div className="flex justify-between items-center text-[9px] text-slate-500">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> LAT: 26.24 | LON: 55.08</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3" /> BEAUFORT: 3</span>
        </div>
        
        {/* Synthetic Progress View */}
        <div className="relative h-1 w-full bg-slate-900 rounded-full overflow-hidden">
           <motion.div 
             initial={{ width: '0%' }}
             animate={{ width: '75%' }}
             className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400" 
           />
        </div>
      </div>

      {/* Intelligence Risk Alert */}
      <div className="mt-4 p-3 bg-amber-950/20 border border-amber-900/50 rounded flex items-center gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-500" />
        <p className="text-[9px] text-amber-200 uppercase leading-tight">
          Deviation detected in trajectory index. Potential GPS Spoofing in Sector-H.
        </p>
      </div>
    </div>
  );
}
