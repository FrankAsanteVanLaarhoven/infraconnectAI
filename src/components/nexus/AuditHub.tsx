"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Shield, Zap, Landmark, Server, ChevronRight, Search } from 'lucide-react';

export function AuditHub() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    async function fetchAudit() {
       try {
          const res = await fetch(`/api/nexus/audit?limit=20${filter !== 'ALL' ? `&category=${filter}` : ''}`);
          const json = await res.json();
          setEvents(json.events);
       } catch {} finally {
          setLoading(false);
       }
    }
    fetchAudit();
    const inv = setInterval(fetchAudit, 15000);
    return () => clearInterval(inv);
  }, [filter]);

  const getIcon = (category: string) => {
     switch(category) {
        case 'SECURITY': return <Shield className="w-3 h-3 text-red-500" />;
        case 'REVENUE': return <Landmark className="w-3 h-3 text-slate-300" />;
        case 'GOVERNANCE': return <Zap className="w-3 h-3 text-indigo-400" />;
        default: return <Server className="w-3 h-3 text-cyan-400" />;
     }
  };

  return (
    <div className="w-full h-[500px] bg-[#020202] border border-white/5 rounded-sm flex flex-col font-mono overflow-hidden shadow-2xl">
       {/* Ledger Header */}
       <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
             <History className="w-4 h-4 text-slate-500" />
             <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Sovereign Audit Ledger</h3>
          </div>
          <div className="flex gap-2">
             {['ALL', 'SECURITY', 'REVENUE', 'GOVERNANCE'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-0.5 rounded text-[7px] font-black transition-all ${filter === f ? 'bg-white text-black' : 'bg-slate-900 text-slate-500 hover:text-white'}`}
                >
                   {f}
                </button>
             ))}
          </div>
       </div>

       {/* Immutable Feed */}
       <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
          <AnimatePresence mode="popLayout">
             {events.map((e, i) => (
                <motion.div 
                   key={e.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="relative pl-6 border-l border-white/10 group pb-2"
                >
                   {/* Timeline Marker */}
                   <div className="absolute top-1 left-[-4px] w-2 h-2 rounded-sm bg-slate-800 ring-2 ring-black group-hover:bg-indigo-500 transition-colors" />
                   
                   <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                         <span className="text-[8px] text-slate-600 font-black">{new Date(e.timestamp).toLocaleTimeString()}</span>
                         <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-white/[0.03] rounded border border-white/5">
                            {getIcon(e.category)}
                            <span className="text-[7px] text-slate-400 font-black uppercase">{e.category}</span>
                         </div>
                      </div>
                      <span className={`text-[7px] font-black uppercase ${e.severity === 'HIGH' ? 'text-red-500' : 'text-slate-600'}`}>
                         {e.severity}
                      </span>
                   </div>

                   <div className="bg-white/[0.01] border border-white/5 p-3 rounded-sm group-hover:bg-white/[0.03] transition-all cursor-pointer">
                      <div className="flex justify-between items-center mb-1">
                         <h4 className="text-[10px] font-bold text-slate-200">{e.title}</h4>
                         <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-white transition-all" />
                      </div>
                      <p className="text-[9px] text-slate-500 leading-relaxed font-mono truncate">{e.action}</p>
                      
                      {/* Meta Footer */}
                      <div className="mt-3 flex gap-4 text-[7px] text-slate-700 font-bold uppercase tracking-tighter">
                         <span className="flex items-center gap-1"><Search className="w-2 h-2" /> ID: {e.id.slice(0,8)}</span>
                         <span>Actor: {e.actor}</span>
                      </div>
                   </div>
                </motion.div>
             ))}
          </AnimatePresence>

          {loading && (
             <div className="flex flex-col items-center justify-center h-40 opacity-20">
                <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-sm animate-spin mb-4" />
                <span className="text-[8px] uppercase tracking-widest font-black">Syncing Ledger...</span>
             </div>
          )}
       </div>

       {/* Footer Interlock */}
       <div className="p-3 bg-indigo-950/10 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-sm bg-indigo-500" />
             <span className="text-[7px] text-indigo-400 font-black uppercase tracking-widest">Vault Synchronized // UDS:821-X</span>
          </div>
          <button className="text-[7px] text-slate-600 hover:text-white font-black uppercase tracking-tighter">Export Proof (PDF) →</button>
       </div>
    </div>
  );
}
