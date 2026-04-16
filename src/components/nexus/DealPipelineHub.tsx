"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Handshake, TrendingUp, Filter, Search, MoreHorizontal, ArrowUpRight, Target, Brain } from 'lucide-react';
import { DEAL_PIPELINE, Deal } from '@/lib/nexus/swarm';

const STAGES = ['ALL', 'PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED WON', 'CLOSED LOST'];

export function DealPipelineHub() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/crm/leads');
        const data = await res.json();
        setLeads(data.leads || []);
      } catch (err) {
        console.error("PIPELINE_FETCH_FAIL", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  // Map database status to pipeline stages
  const getStageFromStatus = (status: string) => {
    const map: Record<string, string> = {
      'new': 'QUALIFICATION',
      'qualified': 'PROPOSAL',
      'meeting': 'NEGOTIATION',
      'closed': 'CLOSED WON',
      'lost': 'CLOSED LOST'
    };
    return map[status] || 'PROSPECTING';
  };

  const processedLeads = leads.map(l => ({
    id: l.id,
    name: l.company || l.email.split('@')[0],
    value: l.projectedValue || (l.score * 1200), // Default heuristic if no value set
    stage: getStageFromStatus(l.status),
    agent: 'alpha-prime',
    probability: l.score
  }));
  
  const filteredDeals = activeTab === 'ALL' 
    ? processedLeads 
    : processedLeads.filter(d => d.stage === activeTab);

  const totalValue = filteredDeals.reduce((acc, d) => acc + d.value, 0);

  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="w-full h-full bg-black/60 backdrop-blur-3xl border border-blue-500/30 rounded-xl overflow-hidden flex flex-col font-mono select-none">
      
      {/* Header */}
      <div className="p-6 border-b border-blue-500/20 bg-blue-950/10">
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/40">
                  <Handshake className="w-5 h-5 text-blue-400" />
               </div>
               <div>
                  <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Strategy Deal Pipeline</h3>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Financial Conversion Hub</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Total Pipeline</p>
               <motion.p 
                 key={totalValue}
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-xl font-black text-white"
               >
                  {formatValue(totalValue)}
               </motion.p>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2 border-b border-white/5 bg-slate-900/40 overflow-x-auto no-scrollbar flex gap-2">
         {STAGES.map(stage => (
            <button
               key={stage}
               onClick={() => setActiveTab(stage)}
               className={`px-3 py-1.5 rounded-full text-[9px] font-black tracking-tighter whitespace-nowrap transition-all ${
                  activeTab === stage 
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
               }`}
            >
               {stage}
            </button>
         ))}
      </div>

      {/* Deal List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         <div className="space-y-2">
            <AnimatePresence mode="popLayout">
               {filteredDeals.length > 0 ? filteredDeals.map((deal) => (
                  <motion.div 
                    layout
                    key={deal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 p-4 rounded-lg flex items-center justify-between transition-all"
                  >
                     <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-600 group-hover:text-blue-400 transition-colors">
                           <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                           <h4 className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors uppercase">{deal.name}</h4>
                           <div className="flex items-center gap-3 mt-1">
                              <span className="text-[8px] text-slate-500 font-bold uppercase flex items-center gap-1">
                                 <Brain className="w-3 h-3" /> Agent Catalyst: {deal.agent.replace('agent-', '')}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-700" />
                              <span className="text-[8px] text-blue-500 uppercase font-black">{deal.stage}</span>
                           </div>
                        </div>
                     </div>

                     <div className="text-right flex items-center gap-6">
                        <div className="w-24 space-y-1">
                           <div className="flex justify-between text-[7px] text-slate-600 font-black uppercase">
                              <span>Probability</span>
                              <span>{deal.probability}%</span>
                           </div>
                           <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${deal.probability}%` }}
                                 className={`h-full ${deal.stage === 'CLOSED WON' ? 'bg-emerald-500' : deal.stage === 'CLOSED LOST' ? 'bg-red-500' : 'bg-blue-500'}`}
                              />
                           </div>
                        </div>
                        <div className="min-w-[100px]">
                           <p className="text-[12px] font-black text-white tracking-tighter">{formatValue(deal.value)}</p>
                           <p className="text-[7px] text-slate-600 uppercase font-bold tracking-widest mt-0.5">Est. Rev</p>
                        </div>
                        <motion.button 
                           whileHover={{ scale: 1.1 }}
                           whileTap={{ scale: 0.9 }}
                           className="p-1.5 text-slate-600 hover:text-white"
                        >
                           <ArrowUpRight className="w-4 h-4" />
                        </motion.button>
                     </div>
                  </motion.div>
               )) : (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-700">
                     <Target className="w-8 h-8 opacity-20 mb-2" />
                     <p className="text-[9px] font-black uppercase tracking-widest">No matching deals in this stage</p>
                  </div>
               )}
            </AnimatePresence>
         </div>
      </div>

      {/* Footer Meta */}
      <div className="p-4 bg-slate-950/50 border-t border-slate-900 flex justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[7px] text-slate-500 font-bold">A{i}</div>
               ))}
            </div>
            <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Global Ops Oversight Active</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Live Updates Encrypted</span>
         </div>
      </div>
    </div>
  );
}
