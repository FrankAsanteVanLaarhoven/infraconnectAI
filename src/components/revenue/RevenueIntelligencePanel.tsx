"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Brain, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';

export function RevenueIntelligencePanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/revenue/summary');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) return <div className="h-40 flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-slate-700">Syncing Financials...</div>;

  return (
    <div className="glass-subtle rounded-sm p-6 space-y-6 overflow-hidden relative group">
       
       {/* Background Accent */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-sm -translate-y-16 translate-x-16 group-hover:bg-blue-500/10 transition-colors" />

       <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-sm bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                <BarChart3 className="w-4 h-4 text-blue-400" />
             </div>
             <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Revenue Intelligence</h3>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Strategic Ecosystem Health</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-blue-400">£{data?.totalAnnualImpact?.toLocaleString()}</p>
             <p className="text-[7px] text-slate-600 uppercase font-black">Total Projected Impact</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          
          {/* Top Leveraging Targets */}
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <Target className="w-3 h-3 text-red-500" /> Top Leverage Targets
             </div>
             <div className="space-y-2">
                {data?.highLeverageLeads?.map((lead: any) => (
                   <div key={lead.email} className="bg-slate-900/40 border border-slate-800 p-2.5 rounded flex items-center justify-between group hover:border-slate-600 transition-colors">
                      <span className="text-[9px] font-mono text-slate-300 truncate w-32">{lead.email}</span>
                      <div className="text-right">
                         <span className="text-[9px] font-black text-white">£{(lead.impact / 1000).toFixed(0)}k</span>
                         <span className="text-[7px] text-slate-600 block uppercase">Impact</span>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Strategic Metrics */}
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/40 border border-slate-800 p-3 rounded space-y-1 text-center">
                   <p className="text-lg font-black text-white">{data?.activeNegotiations}</p>
                   <p className="text-[7px] text-slate-500 uppercase font-black">Active War Rooms</p>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 p-3 rounded space-y-1 text-center">
                   <p className="text-lg font-black text-slate-300">{(data?.totalAnnualImpact / 100000).toFixed(1)}x</p>
                   <p className="text-[7px] text-slate-500 uppercase font-black">Efficiency Multiplier</p>
                </div>
             </div>
             <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Brain className="w-3 h-3 text-blue-400" />
                   <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Synthesis Sync Active</span>
                </div>
                <Zap className="w-3 h-3 text-amber-500" />
             </div>
          </div>

       </div>
    </div>
  );
}
