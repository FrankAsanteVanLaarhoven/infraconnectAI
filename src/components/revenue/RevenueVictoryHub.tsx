"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Activity, 
  Zap, 
  ChevronRight,
  Briefcase
} from 'lucide-react';

export function RevenueVictoryHub() {
  const [closures, setClosures] = useState<any[]>([]);
  const [totalROI, setTotalROI] = useState(12.4); // Million

  useEffect(() => {
    // Simulated live closure feed
    const mockClosures = [
      { id: 'c-1', company: 'Global Dynamics', value: '$4.2M', sector: 'ENERGY', status: 'TARGET_CLEARED' },
      { id: 'c-2', company: 'Nexus Capital', value: '$2.8M', sector: 'FINANCE', status: 'TARGET_CLEARED' },
      { id: 'c-3', company: 'Stellar Logistics', value: '$5.4M', sector: 'MARITIME', status: 'CLOSING_INITIATED' },
    ];
    setClosures(mockClosures);
  }, []);

  return (
    <div className="w-full h-full bg-[#020202] border border-indigo-500/20 rounded-3xl p-8 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_80px_rgba(99,102,241,0.05)]">
       {/* Victory Background VFX */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

       {/* Header */}
       <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 bg-black/40 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Trophy className="w-6 h-6 text-indigo-400" />
             </div>
             <div>
                <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Revenue Victory Hub</h2>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Autonomous Conversion Ledger</p>
             </div>
          </div>

          <div className="flex gap-12 text-right">
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em] mb-1">Total ROI Delta</span>
                <span className="text-3xl font-black text-emerald-500 tracking-tighter tabular-nums">${totalROI}M</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em] mb-1">Swarm Efficiency</span>
                <span className="text-3xl font-black text-indigo-400 tracking-tighter tabular-nums">98.4%</span>
             </div>
          </div>
       </div>

       {/* Main Content: Victory Ledger */}
       <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 relative z-10">
          
          {/* Victory Feed */}
          <div className="lg:col-span-8 space-y-4 overflow-y-auto custom-scrollbar pr-4">
             <span className="text-[9px] text-slate-600 uppercase font-black border-b border-white/5 pb-2 block">Live Target Conversion Chain</span>
             <AnimatePresence>
                {closures.map((c, i) => (
                   <motion.div 
                      key={c.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all cursor-pointer"
                   >
                      <div className="flex items-center gap-6">
                         <div className={`p-3 rounded-xl ${c.status === 'TARGET_CLEARED' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-indigo-500/10 border border-indigo-500/20'}`}>
                            {c.status === 'TARGET_CLEARED' ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <Zap className="w-5 h-5 text-indigo-400 animate-pulse" />}
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <h3 className="text-xs font-black text-white uppercase tracking-wider">{c.company}</h3>
                               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${c.status === 'TARGET_CLEARED' ? 'bg-emerald-950 text-emerald-500' : 'bg-indigo-950 text-indigo-500'}`}>
                                  {c.status}
                               </span>
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{c.sector} // CONVERSION_ID: {c.id}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-xl font-black text-white tracking-tighter">{c.value}</div>
                         <div className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-1">Autonomous_Close: 100%</div>
                      </div>
                   </motion.div>
                ))}
             </AnimatePresence>
          </div>

          {/* Right: Closing Intelligence */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             
             {/* Swarm Status */}
             <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                   <Target className="w-4 h-4 text-indigo-400" />
                   <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Active Closer Swarm</h3>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-500 uppercase font-black">Negotiations Active</span>
                      <span className="text-[10px] font-black text-white">12</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-500 uppercase font-black">Probability Delta</span>
                      <span className="text-[10px] font-black text-emerald-500">+18.4%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: '84%' }}
                        className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                      />
                   </div>
                </div>
             </div>

             {/* Strategic Quick Close */}
             <div className="p-6 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl space-y-4 group">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Tactical Re-Strike</h3>
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-800 group-hover:text-white transition-all underline" />
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                   Re-engage lost opportunities using current maritime chokepoint data as leverage.
                </p>
                <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                   Initiate Re-Strike
                </button>
             </div>

          </div>

       </div>

       {/* Bottom Status Feed */}
       <div className="mt-8 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-700 relative z-10">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>CL_ENGINE: ACTIVE</span>
             </div>
             <span>CONVERSION_RATIO: 0.92</span>
          </div>
          <span>SYNX_HUB_X01 // SOVEREIGN_VICTORY</span>
       </div>
    </div>
  );
}
