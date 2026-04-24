"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, TrendingUp, Calendar, AlertCircle, ArrowRight, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateCloseProbability } from '@/lib/revenue/closeProbability';

export default function BriefingPage() {
  const [highIntentLeads, setHighIntentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBriefing() {
      try {
        const res = await fetch('/api/crm/leads');
        const data = await res.json();
        // Filter and sort by probability
        const scoredLeads = data.leads.map((l: any) => ({
          ...l,
          probability: calculateCloseProbability(l)
        })).sort((a: any, b: any) => b.probability - a.probability);
        
        setHighIntentLeads(scoredLeads.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBriefing();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono p-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/5 pb-12 text-center">
           <h1 className="text-5xl font-black uppercase tracking-tighter text-white">Daily Focal Points</h1>
           <p className="text-xs text-slate-500 uppercase tracking-[0.5em] font-bold">Revenue Matrix // Strategic Briefing</p>
        </div>

        {/* Top 3 High Probability Deals */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 text-amber-500 mb-2">
              <Target className="w-5 h-5" />
              <h2 className="text-[10px] uppercase font-black tracking-[0.3em]">Critical Close Targets</h2>
           </div>

           <div className="grid grid-cols-1 gap-6">
              {loading ? (
                 <div className="h-40 bg-slate-900/20 border border-slate-800 rounded-sm" />
              ) : highIntentLeads.length > 0 ? highIntentLeads.map((lead, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={lead.id}
                  className="bg-[#0a0b0c] border border-slate-800 p-8 rounded-sm flex items-center justify-between group hover:border-slate-600 transition-colors"
                >
                   <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <span className="text-2xl font-black text-white">{lead.email.split('@')[1]}</span>
                         <div className="w-1 h-1 rounded-sm bg-slate-700" />
                         <span className="text-[10px] text-slate-500 uppercase font-black">{lead.company || "Enterprise Target"}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-blue-400">
                            <Brain className="w-3 h-3" /> Score {lead.score}
                         </div>
                         <div className="w-px h-3 bg-slate-800" />
                         <div className="text-[9px] font-black uppercase text-slate-500">
                            Status: {lead.status}
                         </div>
                      </div>
                   </div>

                   <div className="text-right flex items-center gap-8">
                      <div className="space-y-1">
                         <p className="text-[10px] text-slate-500 uppercase font-black">Close Prob.</p>
                         <p className="text-3xl font-black text-amber-500">{lead.probability}%</p>
                      </div>
                      <a href={`/dashboard/operator?leadId=${lead.id}`}>
                        <Button variant="ghost" className="p-2 hover:bg-slate-900 group-hover:text-amber-500">
                           <ArrowRight className="w-6 h-6" />
                        </Button>
                      </a>
                   </div>
                </motion.div>
              )) : (
                <div className="text-slate-600 text-xs italic">No high-probability deals in the current cycle.</div>
              )}
           </div>
        </div>

        {/* Daily Insights Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
           <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-sm space-y-4">
              <div className="flex items-center gap-3 text-blue-400">
                 <Zap className="w-4 h-4" />
                 <h3 className="text-[9px] uppercase font-black tracking-widest">Recently Automated</h3>
              </div>
              <div className="space-y-3">
                 {highIntentLeads.filter(l => l.lastEmailSent).slice(0, 3).map(l => (
                   <div key={l.id} className="text-[10px] flex justify-between items-center text-slate-500 font-mono">
                      <span>{l.email.split('@')[0]}@***</span>
                      <span className="text-cyan-600">Dispatched {new Date(l.lastEmailSent).toLocaleDateString()}</span>
                   </div>
                 ))}
                 {highIntentLeads.filter(l => l.lastEmailSent).length === 0 && (
                   <div className="text-[10px] text-slate-600 italic">No automated dispatches in this cycle.</div>
                 )}
              </div>
           </div>
           <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-sm space-y-4">
              <div className="flex items-center gap-3 text-cyan-400">
                 <TrendingUp className="w-4 h-4" />
                 <h3 className="text-[9px] uppercase font-black tracking-widest">Suggested Actions</h3>
              </div>
              <div className="space-y-3">
                 {highIntentLeads.filter(l => !l.lastEmailSent && l.score > 60).slice(0, 3).map(l => (
                   <div key={l.id} className="text-[10px] flex justify-between items-center text-slate-300 font-mono group cursor-pointer hover:text-white">
                      <span>Finalize ROI for {l.company || l.email.split('@')[1]}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
