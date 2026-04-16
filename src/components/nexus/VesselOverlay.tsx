"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ship, Radio, MapPin, ChevronRight, Activity } from 'lucide-react';
import { Vessel, vesselFleetEngine } from '@/lib/nexus/vesselFleetEngine';
import Link from 'next/link';

export function VesselMapOverlay() {
  const [vessels, setVessels] = useState<Vessel[]>([]);

  useEffect(() => {
    const fetchVessels = () => {
      setVessels(vesselFleetEngine.getVessels().slice(0, 3));
    };
    fetchVessels();
    const inv = setInterval(fetchVessels, 5000);
    return () => clearInterval(inv);
  }, []);

  return (
    <div className="w-full h-full bg-[#020202] border border-white/5 rounded-xl flex flex-col font-mono overflow-hidden group">
       {/* Radar Header */}
       <div className="p-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="relative">
                <Radio className="w-3 h-3 text-cyan-400" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping" />
             </div>
             <h3 className="text-[9px] font-black text-white uppercase tracking-widest">AIS Radar Sweep</h3>
          </div>
          <Link href="/nexus/maritime" className="px-1.5 py-0.5 bg-white/5 rounded text-[7px] text-slate-500 hover:text-white transition-all flex items-center gap-1 font-black uppercase tracking-tighter">
             Full Hub <ChevronRight className="w-2 h-2" />
          </Link>
       </div>

       {/* Mini Map View */}
       <div className="flex-1 relative bg-slate-950/40 p-4 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02]" 
               style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
          
          {/* Radar Sweep VFX */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 rotate-animate" 
               style={{ animation: 'spin 10s linear infinite' }} />

          <div className="relative z-10 w-full flex flex-col gap-3">
             {vessels.map((v, i) => (
                <motion.div 
                   key={v.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-lg group/item hover:bg-white/[0.04] transition-all"
                >
                   <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${v.status === 'DARK' ? 'bg-red-500/10 border border-red-500/30' : 'bg-cyan-500/10 border border-cyan-500/30'}`}>
                         <Ship className={`w-3 h-3 ${v.status === 'DARK' ? 'text-red-500 animate-pulse' : 'text-cyan-500'}`} />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-white uppercase tracking-wider">{v.name}</p>
                         <p className="text-[7px] text-slate-600 font-bold uppercase tracking-tighter">{v.status} // {v.speed} KN</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className={`text-[7px] font-black uppercase mb-1 ${v.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-slate-700'}`}>
                         {v.riskLevel}
                      </div>
                      <div className="text-[7px] text-slate-500 font-mono tracking-tighter">
                         LAT: {v.lat.toFixed(1)}°
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
       </div>

       {/* Footer Interlock */}
       <div className="p-2.5 bg-indigo-950/10 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Activity className="w-2.5 h-2.5 text-indigo-400" />
             <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Global AIS Coverage: 98%</span>
          </div>
          <span className="text-[7px] text-indigo-500 font-black uppercase">SYNC_OK</span>
       </div>

       <style jsx>{`
          @keyframes spin {
             from { transform: rotate(0deg); }
             to { transform: rotate(360deg); }
          }
          .rotate-animate {
             transform-origin: center;
          }
       `}</style>
    </div>
  );
}
