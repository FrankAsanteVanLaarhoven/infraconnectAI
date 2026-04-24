"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, TrendingUp, ShieldCheck, MessageSquare, Save, History, Activity, BarChart3, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function NegotiationWarRoom({ leadEmail }: { leadEmail?: string }) {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [projectedValue, setProjectedValue] = useState(0);
  const [roiYears, setRoiYears] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [isConsulting, setIsConsulting] = useState(false);

  useEffect(() => {
    if (leadEmail) {
      fetchLeadData();
    }
  }, [leadEmail]);

  useEffect(() => {
    if (lead?.id) {
       fetchActivities();
    }
  }, [lead?.id]);

  async function fetchActivities() {
    try {
      const res = await fetch(`/api/deals/${lead.id}/tactics`);
      const data = await res.json();
      setActivities(data.activities || []);
    } catch {}
  }

  const tacticalConsult = async (type: string) => {
    setIsConsulting(true);
    try {
      const res = await fetch(`/api/deals/${lead.id}/tactics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      setSuggestion(data);
      fetchActivities(); // Refresh feed
      // Update lead score in local state
      setLead({ ...lead, score: data.newScore });
    } catch (err) {
      console.error(err);
    } finally {
      setIsConsulting(false);
    }
  };

  async function fetchLeadData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/leads/detail?email=${leadEmail}`);
      const data = await res.json();
      setLead(data.lead);
      setNotes(data.lead.notes || "");
      setProjectedValue(data.lead.projectedValue || (data.lead.score * 1200));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const saveStrategicData = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/crm/leads/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lead.email, notes, projectedValue })
      });
    } catch (err) {
        console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!leadEmail) return (
    <div className="w-full h-full bg-black/60 backdrop-blur-3xl border border-slate-800 rounded-sm flex flex-col items-center justify-center p-12 text-center space-y-4">
       <Target className="w-12 h-12 text-slate-700 opacity-50" />
       <p className="text-sm text-slate-500 uppercase font-black tracking-widest">Select a lead to enter the War Room</p>
    </div>
  );

  if (!lead && loading) return <div className="p-8 text-center text-blue-500 uppercase font-black tracking-widest">Synchronizing Intelligence...</div>;

  const estimatedSavings = (projectedValue * 2.5) * roiYears;

  return (
    <div className="w-full h-full bg-black/80 backdrop-blur-3xl border border-red-500/30 rounded-sm overflow-hidden flex flex-col font-mono select-none">
      
      {/* Header */}
      <div className="p-6 border-b border-red-500/20 bg-red-950/10 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-sm border border-red-500/40">
               <Target className="w-5 h-5 text-red-500" />
            </div>
            <div>
               <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Strategic Negotiation War Room</h3>
               <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">High-Value Execution Layer</p>
            </div>
         </div>
         <Badge className="bg-red-600 text-[8px] uppercase">{lead?.intent} Intent</Badge>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
         
         {/* Lead Context Summary */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-sm space-y-1">
               <p className="text-[8px] text-slate-600 uppercase font-bold">Primary Target</p>
               <p className="text-lg font-black text-white truncate">{lead?.email}</p>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-sm space-y-1 text-center">
               <p className="text-[8px] text-slate-600 uppercase font-bold">Projected Deal Value</p>
               <input 
                 value={projectedValue}
                 onChange={(e) => setProjectedValue(Number(e.target.value))}
                 className="bg-transparent text-xl font-black text-white w-full text-center outline-none border-b border-white/5 focus:border-red-500/50"
               />
            </div>
            <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-sm space-y-1 text-right">
               <p className="text-[8px] text-slate-600 uppercase font-bold">Mission Score</p>
               <p className="text-2xl font-black text-red-500">{lead?.score}<span className="text-xs text-slate-700">/100</span></p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ROI Simulation */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Calculator className="w-4 h-4 text-blue-500" /> ROI Simulator
               </div>
               <div className="bg-blue-950/5 border border-blue-900/20 p-6 rounded-sm space-y-6">
                  <div className="space-y-3">
                     <div className="flex justify-between text-[9px] uppercase font-bold">
                        <span className="text-slate-500">Projection Horizon</span>
                        <span className="text-blue-400">{roiYears} Years</span>
                     </div>
                     <input 
                       type="range" min="1" max="10" 
                       value={roiYears} 
                       onChange={(e) => setRoiYears(Number(e.target.value))}
                       className="w-full h-1 bg-slate-800 rounded-sm appearance-none cursor-pointer accent-blue-500" 
                     />
                  </div>
                  <div className="pt-4 border-t border-blue-900/20">
                     <p className="text-[8px] text-slate-600 uppercase font-black mb-1">Estimated Client Ecosystem Value</p>
                     <p className="text-4xl font-black text-blue-400 tracking-tighter">£{estimatedSavings.toLocaleString()}</p>
                     <p className="text-[9px] text-slate-500 mt-2 font-mono italic leading-relaxed">
                        Based on high-density architecture optimization and sim-to-real efficiency gains.
                     </p>
                  </div>
               </div>
            </div>

            {/* Strategic Notes */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <MessageSquare className="w-4 h-4 text-red-500" /> Negotiation Playbook
               </div>
               <div className="bg-[#0a0b0c] border border-slate-800 rounded-sm overflow-hidden flex flex-col h-[220px]">
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter strategic leverage points, objections, or negotiation history..."
                    className="flex-1 bg-transparent p-4 text-xs text-slate-400 font-mono outline-none resize-none"
                  />
                  <div className="p-3 bg-slate-900/50 border-t border-slate-800 flex justify-end">
                     <Button 
                       onClick={saveStrategicData}
                       disabled={isSaving}
                       className="bg-red-600 hover:bg-red-500 text-white text-[9px] font-black uppercase py-1 h-8 rounded-none px-4 flex gap-2"
                     >
                        <Save className="w-3 h-3" /> {isSaving ? 'Saving...' : 'Sync Playbook'}
                     </Button>
                  </div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tactical Execution / Rebuttals */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {/* <Cpu className="w-4 h-4 text-slate-400" /> */} Tactical Execution Engine
               </div>
               <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-sm space-y-6">
                  <div className="grid grid-cols-2 gap-2">
                     {['COST', 'SECURITY', 'VELOCITY', 'INTEGRATION'].map((type) => (
                        <button 
                          key={type}
                          onClick={() => tacticalConsult(type)}
                          disabled={isConsulting}
                          className="px-3 py-2 bg-slate-900/50 border border-slate-800 text-[8px] font-black text-slate-400 uppercase hover:border-slate-800 hover:text-white transition-all rounded"
                        >
                           Objection: {type}
                        </button>
                     ))}
                  </div>
                  
                  <AnimatePresence mode="wait">
                     {suggestion ? (
                        <motion.div 
                          key="suggestion"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 bg-slate-900/50 border border-slate-800 rounded-sm space-y-2"
                        >
                           <p className="text-[10px] text-slate-400 font-black uppercase">Suggested Rebuttal</p>
                           <p className="text-xs text-white leading-relaxed italic">"{suggestion.rebuttal}"</p>
                           <div className="pt-2 flex justify-between items-center border-t border-slate-800">
                              <span className="text-[8px] text-slate-500 uppercase font-black">Tactic: {suggestion.tactic}</span>
                              <span className="text-[8px] text-slate-300 font-black">+{suggestion.deltaScore} Magnitude</span>
                           </div>
                        </motion.div>
                     ) : (
                        <div className="p-8 text-center text-[9px] text-slate-600 uppercase font-black border border-dashed border-slate-800 rounded-sm">
                           Consult AI on specific objections to generate tactical leverage.
                        </div>
                     )}
                  </AnimatePresence>
               </div>
            </div>

            {/* Shadow History / Activity Feed */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <History className="w-4 h-4 text-slate-300" /> Chronological Activity Feed
               </div>
               <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-4 h-[250px] overflow-y-auto custom-scrollbar space-y-4">
                  {activities.length > 0 ? activities.map((act) => (
                     <div key={act.id} className="flex gap-4 items-start border-l-2 border-slate-800 pl-4 py-1">
                        <div className="pt-1">
                           {act.type === 'tactical_adjustment' ? <Zap className="w-3 h-3 text-slate-400" /> : <Activity className="w-3 h-3 text-slate-600" />}
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] text-white font-black uppercase leading-none">{act.type.replace('_', ' ')}</p>
                           <p className="text-[9px] text-slate-500 leading-relaxed font-bold">{act.description}</p>
                           <p className="text-[7px] text-slate-700 uppercase">{new Date(act.timestamp).toLocaleString()}</p>
                        </div>
                     </div>
                  )) : (
                     <div className="h-full flex items-center justify-center text-[10px] text-slate-700 uppercase font-black tracking-widest">
                        Activity Stream Empty
                     </div>
                  )}
               </div>
            </div>
         </div>

      </div>

      {/* Footer Meta */}
      <div className="p-4 bg-red-950/20 border-t border-red-900/30 flex justify-between items-center text-[8px] text-slate-500 uppercase font-bold tracking-widest">
         <div className="flex items-center gap-2">
            <BarChart3 className="w-3 h-3 text-red-500" />
            Strategic Oversight Cycle: 3.2s
         </div>
         <div>EXECUTION ENGINE V1.0</div>
      </div>
    </div>
  );
}
