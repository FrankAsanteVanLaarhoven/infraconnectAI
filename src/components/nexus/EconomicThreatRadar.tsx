"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchMarketPulse } from '@/lib/nexus/osint-fusion';

const mockData = Array.from({ length: 20 }).map((_, i) => ({
   time: i,
   oil: 70 + Math.random() * 40,
   debt: 34 + i * 0.5,
   velocity: 8 + Math.random() * 4,
}));

export function EconomicThreatRadar({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [threatLevel, setThreatLevel] = useState(6.8);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIntel() {
      try {
        const res = await fetch('/api/nexus/osint');
        const json = await res.json();
        setData(json);
        setThreatLevel(json.systemRisk / 10);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchIntel();
    const interval = setInterval(fetchIntel, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-black/60 backdrop-blur-3xl border border-amber-500/30 rounded-sm overflow-hidden flex flex-col font-mono select-none">
      {/* Header */}
      <div className="p-4 border-b border-amber-500/20 bg-amber-950/10 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${threatLevel > 7.5 ? 'text-red-500 ' : 'text-amber-500'}`} />
            <div>
               <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Economic Threat Radar</h3>
               <p className="text-[8px] text-amber-900 font-bold uppercase tracking-widest">Oil vs Debt Velocity Engine</p>
            </div>
         </div>
         <Activity className="w-4 h-4 text-amber-900" />
      </div>

      {/* Main Stats (Live Data) */}
      <div className="grid grid-cols-3 p-4 gap-4 border-b border-amber-500/10">
         <div className="bg-slate-900/40 p-3 rounded border border-slate-800">
            <p className="text-[8px] text-slate-500 uppercase mb-1">Revenue at Risk</p>
            <p className="text-sm font-black text-red-500">£{data?.atRiskMagnitude?.toLocaleString() || '0'}</p>
            <p className="text-[8px] text-slate-600 flex items-center gap-1 mt-1 uppercase font-bold">
               <TrendingUp className="w-2.5 h-2.5" /> High Exposure
            </p>
         </div>
         <div className="bg-slate-900/40 p-3 rounded border border-slate-800">
            <p className="text-[8px] text-slate-500 uppercase mb-1">System Risk</p>
            <p className="text-sm font-black text-white">{data?.systemRisk?.toFixed(1) || '0'}%</p>
            <p className="text-[8px] text-cyan-500 flex items-center gap-1 mt-1 uppercase font-bold">
               <Activity className="w-2.5 h-2.5" /> Weighted Pulse
            </p>
         </div>
         <div className="bg-slate-900/40 p-3 rounded border border-slate-800">
            <p className="text-[8px] text-slate-500 uppercase mb-1">Critical Leads</p>
            <p className="text-sm font-black text-white">{data?.threatenedLeads?.filter((l:any) => l.riskScore > 70).length || 0}</p>
            <p className="text-[8px] text-amber-500 flex items-center gap-1 mt-1 uppercase font-bold">
               <Zap className="w-2.5 h-2.5" /> DEFENSIVE ACT.
            </p>
         </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-2 min-h-[140px]">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
               <defs>
                  <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
               <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
                  itemStyle={{ fontSize: '10px' }}
               />
               <Area type="monotone" dataKey="oil" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOil)" />
               <Area type="monotone" dataKey="debt" stroke="#06b6d4" fillOpacity={1} fill="url(#colorDebt)" />
            </AreaChart>
         </ResponsiveContainer>
      </div>

      {/* Probability Gauge */}
      <div className="p-4 bg-amber-950/10 border-t border-amber-900/30">
         <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-slate-300 uppercase tracking-widest font-black">System Weighted Risk Pulse</span>
            <span className={`text-xs font-black ${threatLevel > 8 ? 'text-red-500' : 'text-amber-500'}`}>{(threatLevel * 10).toFixed(1)}%</span>
         </div>
         <div className="w-full h-2 bg-slate-900 rounded-sm overflow-hidden border border-slate-800">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${threatLevel * 10}%` }}
               className={`h-full transition-colors duration-1000 ${threatLevel > 8 ? 'bg-red-500 ' : 'bg-amber-500 '}`}
            />
         </div>
         
         {/* Live Risk Breakdown */}
         <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar-mini">
            {data?.threatenedLeads?.slice(0, 3).map((lead: any) => (
               <div key={lead.leadId} className="p-2 bg-slate-900/40 border border-slate-800/60 rounded flex justify-between items-center">
                  <div className="flex flex-col">
                     <span className="text-[8px] text-white font-black uppercase">{lead.email}</span>
                     <span className="text-[7px] text-slate-500 font-bold uppercase">{lead.threats[0] || 'Market Saturation'}</span>
                  </div>
                  <div className="text-right">
                     <span className={`text-[9px] font-black ${lead.riskScore > 70 ? 'text-red-500' : 'text-amber-500'}`}>{lead.riskScore}% Risk</span>
                  </div>
               </div>
            ))}
         </div>

         {/* OSINT Market Pulse */}
         <div className="mt-4 pt-3 border-t border-amber-900/20">
            <div className="flex items-center gap-2 mb-2">
               <TrendingUp className="w-3 h-3 text-amber-500" />
               <span className="text-[9px] text-slate-400 uppercase font-black">OSINT Market Sentiment</span>
            </div>
            <div className="space-y-1.5">
               {fetchMarketPulse().map((pulse, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-1.5 rounded border border-slate-800/50">
                     <div className="flex flex-col">
                        <span className="text-[7px] text-amber-500 font-black tracking-widest leading-none mb-0.5">{pulse.source}</span>
                        <span className="text-[8px] text-slate-300 leading-tight">{pulse.headline}</span>
                     </div>
                     <span className={`text-[8px] font-black px-1 rounded-sm ${
                        pulse.sentiment === 'BULLISH' ? 'text-slate-300 bg-slate-800' :
                        pulse.sentiment === 'BEARISH' ? 'text-red-500 bg-red-500/10' :
                        'text-slate-400 bg-slate-400/10'
                     }`}>
                        {pulse.impact}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
