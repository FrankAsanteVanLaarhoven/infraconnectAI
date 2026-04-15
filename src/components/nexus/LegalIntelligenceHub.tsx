"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Gavel, Gavel as GavelIcon, FileText, Landmark, Search, ShieldAlert } from 'lucide-react';
import { fetchLegalPulse } from '@/lib/nexus/osint-fusion';

export function LegalIntelligenceHub() {
  const judgments = [
    { id: 1, case: 'Apple vs. Masimo', court: 'US Fed Circuit', focus: 'IP/Copyright', outcome: 'PLAINTIFF VICTORY', status: 'CLOSED' },
    { id: 2, case: 'Google Antitrust', court: 'EU Commission', focus: 'Market Dominance', outcome: 'PENDING', status: 'IN REVIEW' },
    { id: 3, case: 'UK Open Law Case [X-29]', court: 'High Court', focus: 'Corporate SaaS', outcome: 'MIXED', status: 'APPEAL' },
    { id: 4, case: 'NVIDIA GPU IP', court: 'S.D.N.Y', focus: 'AI Hardware Patent', outcome: 'DEFENDANT VICTORY', status: 'CLOSED' },
  ];

  const news = fetchLegalPulse();

  return (
    <div className="w-full h-full bg-black/60 backdrop-blur-3xl border border-indigo-500/30 rounded-xl overflow-hidden flex flex-col font-mono select-none">
      {/* Header */}
      <div className="p-4 border-b border-indigo-500/20 bg-indigo-950/10 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-indigo-400" />
             <div>
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Sovereign Legal Intel Hub</h3>
                <p className="text-[8px] text-indigo-900 font-bold uppercase tracking-widest">Apache 2.0 // Open Architecture</p>
             </div>
         </div>
         <Landmark className="w-4 h-4 text-indigo-900" />
      </div>

      {/* GDPR Ticker - Live OSINT */}
      <div className="bg-indigo-900/10 px-4 py-2 flex items-center gap-3 overflow-hidden border-b border-indigo-500/10">
         <span className="text-[8px] font-black text-indigo-500 uppercase whitespace-nowrap">OSINT NEWS:</span>
         <div className="text-[9px] text-slate-400 whitespace-nowrap animate-marquee">
            {news.map(n => `● ${n.text} [${n.time}] `).join(' ')}
         </div>
      </div>

      {/* Judgments Table */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         <div className="grid grid-cols-4 text-[8px] text-slate-600 uppercase font-black mb-3 px-2">
            <span>Entity / Case</span>
            <span>Court</span>
            <span>Outcome</span>
            <span className="text-right">Status</span>
         </div>
         <div className="space-y-2">
            {judgments.map(j => (
               <motion.div 
                 key={j.id}
                 whileHover={{ x: 4, backgroundColor: 'rgba(79, 70, 229, 0.05)' }}
                 className="grid grid-cols-4 p-2 bg-slate-900/40 rounded border border-slate-800 hover:border-indigo-500/30 transition-all text-[9px]"
               >
                  <div className="flex flex-col">
                     <span className="text-white font-bold truncate">{j.case}</span>
                     <span className="text-indigo-500 text-[8px]">{j.focus}</span>
                  </div>
                  <span className="text-slate-500 mt-1">{j.court}</span>
                  <div className="mt-1">
                     <span className={`px-1.5 py-0.5 rounded-sm font-black tracking-tighter ${
                        j.outcome === 'PLAINTIFF VICTORY' ? 'bg-green-950/20 text-green-500' :
                        j.outcome === 'PENDING' ? 'bg-amber-950/20 text-amber-500' :
                        'bg-red-950/20 text-red-500'
                     }`}>
                        {j.outcome}
                     </span>
                  </div>
                  <span className="text-right text-[8px] text-slate-600 mt-1">{j.status}</span>
               </motion.div>
            ))}
         </div>
      </div>

      {/* Intelligence Feed Footer */}
      <div className="p-3 bg-indigo-950/20 border-t border-indigo-900/30 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
               <ShieldAlert className="w-3 h-3 text-indigo-500" />
               <span className="text-[8px] text-indigo-400 font-bold uppercase">Compliance Check: PASS</span>
            </div>
            <div className="w-px h-3 bg-indigo-900" />
            <span className="text-[8px] text-slate-600 uppercase">Latency: 12ms IPC</span>
         </div>
         <button className="text-[8px] bg-indigo-500 text-white px-2 py-1 rounded-sm flex items-center gap-1 hover:bg-indigo-400 transition-colors">
            <Search className="w-2.5 h-2.5" /> DEEP SEARCH
         </button>
      </div>

      <style jsx global>{`
        @keyframes marquee {
           0% { transform: translateX(0); }
           100% { transform: translateX(-50%); }
        }
        .animate-marquee {
           display: inline-block;
           animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
