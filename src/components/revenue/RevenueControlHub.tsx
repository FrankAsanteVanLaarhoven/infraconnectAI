"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, Briefcase, ArrowUpRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export function RevenueControlHub() {
  return (
    <div className="w-full h-full bg-black/60 backdrop-blur-3xl border border-blue-500/30 rounded-sm overflow-hidden flex flex-col font-mono select-none">
      
      {/* Header */}
      <div className="p-6 border-b border-blue-500/20 bg-blue-950/10">
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-500/20 rounded-sm border border-blue-500/40">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
               </div>
               <div>
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Revenue Matrix Hub</h3>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Commercial Control Layer</p>
               </div>
            </div>
         </div>
      </div>

      {/* Grid Links */}
      <div className="flex-1 p-4 grid grid-cols-1 gap-3 overflow-y-auto custom-scrollbar">
         
         <Link href="/dashboard/briefing" className="group">
            <div className="bg-slate-900/40 border border-slate-800 hover:border-amber-500/30 p-4 rounded-sm flex items-center justify-between transition-all">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-600 group-hover:text-amber-500 transition-colors">
                     <Zap className="w-4 h-4" />
                  </div>
                  <div>
                     <h4 className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-amber-500 transition-colors">Founder Briefing</h4>
                     <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-0.5">High-Prob Targets</p>
                  </div>
               </div>
               <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-amber-500 transition-colors" />
            </div>
         </Link>

         <Link href="/dashboard/crm" className="group">
            <div className="bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 p-4 rounded-sm flex items-center justify-between transition-all">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-600 group-hover:text-blue-500 transition-colors">
                     <Users className="w-4 h-4" />
                  </div>
                  <div>
                     <h4 className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">Conversion Pipeline</h4>
                     <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Lead Management</p>
                  </div>
               </div>
               <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
            </div>
         </Link>

         <Link href="/dashboard/operator" className="group">
            <div className="bg-slate-900/40 border border-slate-800 hover:border-cyan-500/30 p-4 rounded-sm flex items-center justify-between transition-all">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-600 group-hover:text-cyan-500 transition-colors">
                     <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                     <h4 className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-cyan-500 transition-colors">AI Sales Operator</h4>
                     <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Decision Suite</p>
                  </div>
               </div>
               <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-500 transition-colors" />
            </div>
         </Link>

      </div>

      {/* Footer Meta */}
      <div className="p-4 bg-slate-950/50 border-t border-slate-900 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-sm bg-blue-500" />
            <span className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Commercial Sync Active</span>
         </div>
         <BarChart3 className="w-3 link-3 text-slate-700" />
      </div>
    </div>
  );
}
