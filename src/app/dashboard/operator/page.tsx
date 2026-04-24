"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, Brain, MessageSquare, ShieldCheck, ChevronRight, Activity, Terminal, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';
import { PremiumBackButton } from '@/components/navigation/PremiumBackButton';

function OperatorPageContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  
  const [lead, setLead] = useState<any>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rewrite, setRewrite] = useState("");
  const [simulation, setSimulation] = useState<any>(null);
  const [final, setFinal] = useState("");

  useEffect(() => {
    if (leadId) {
      fetch(`/api/crm/leads/${leadId}`) // I'll need to create this API
        .then(res => res.json())
        .then(data => setLead(data.lead))
        .catch(err => console.error(err));
    }
  }, [leadId]);

  const runOperator = async () => {
    if (!input || !lead) return;
    setLoading(true);
    try {
      const res = await fetch('/api/operator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, lead })
      });
      const data = await res.json();
      setRewrite(data.rewrite);
      setSimulation(data.simulation);
      setFinal(data.final);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!lead && leadId) return <div className="min-h-screen bg-black flex items-center justify-center text-slate-500 font-mono tracking-widest uppercase">Establishing Secure Connection...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] font-mono p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <PremiumBackButton href="/dashboard" label="Return to Dashboard" className="mb-8" />
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        
        {/* Left: Lead Context */}
        <div className="lg:col-span-1 space-y-6">
           <div className="space-y-4">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">AI Sales Operator</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold">Interactive Deal Execution Hub</p>
           </div>
           
           {lead ? (
             <div className="bg-[#0a0b0c] border border-slate-800 p-6 rounded-sm space-y-6">
                <div className="space-y-1">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Selected Lead</p>
                   <p className="text-lg font-black text-white">{lead.email}</p>
                   <p className="text-xs text-zinc-400 font-bold uppercase">{lead.company || "Enterprise Profile"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                   <div className="space-y-1">
                      <p className="text-[9px] text-slate-600 uppercase font-black">Score</p>
                      <p className="text-xl font-black text-white">{lead.score}/100</p>
                   </div>
                   <div className="text-right space-y-1">
                      <p className="text-[9px] text-slate-600 uppercase font-black">Intent</p>
                      <Badge className="bg-slate-900 border-slate-700 text-[8px] uppercase">{lead.intent}</Badge>
                   </div>
                </div>

                <div className="space-y-3 pt-4">
                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>Behavioral State</span>
                      <Activity className="w-3 h-3" />
                   </div>
                   <div className={`flex items-center gap-3 px-3 py-2 border rounded-sm text-[10px] uppercase font-bold tracking-widest ${lead.visitedDemo ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-800 text-slate-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-sm ${lead.visitedDemo ? 'bg-slate-800 ' : 'bg-slate-700'}`} />
                      Visited Demo
                   </div>
                   <div className={`flex items-center gap-3 px-3 py-2 border rounded-sm text-[10px] uppercase font-bold tracking-widest ${lead.viewedSecurity ? 'border-emerald-900/50 bg-emerald-950/10 text-emerald-400' : 'border-zinc-800 text-zinc-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-sm ${lead.viewedSecurity ? 'bg-emerald-500 ' : 'bg-zinc-700'}`} />
                      Viewed Security
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-sm text-center text-slate-600 text-xs uppercase tracking-widest flex flex-col items-center gap-4">
                <Brain className="w-8 h-8 opacity-20" />
                Select a lead from the CRM to begin execution.
             </div>
           )}
        </div>

        {/* Right: Operator Interface */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-[#0a0b0c] border border-slate-800 rounded-sm overflow-hidden flex flex-col h-[700px]">
              {/* Op Header */}
              <div className="bg-slate-900/40 p-4 border-b border-slate-800 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-zinc-500" />
                    <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Operational Directive Engine</span>
                 </div>
                 {loading && <div className="text-[10px] uppercase text-emerald-500 font-black">AI thinking...</div>}
              </div>

              {/* Composition Workspace */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
                 <div className="space-y-4">
                    <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest flex items-center gap-2">
                       <MessageSquare className="w-3 h-3" /> Step 1: Draft Intent
                    </label>
                    <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter the rough points of your message or outreach intent..."
                      className="w-full h-32 bg-black border border-zinc-800 rounded-sm p-4 text-sm text-zinc-300 focus:border-zinc-500 outline-none transition-colors resize-none font-mono"
                    />
                    <Button onClick={runOperator} disabled={loading || !input || !lead} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase text-xs tracking-[0.2em] rounded-none py-6 h-auto">
                       {loading ? 'Processing Operational Directives...' : 'Run Sales Operator'}
                    </Button>
                 </div>

                 <AnimatePresence>
                   {(rewrite || simulation) && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-8 border-t border-white/5">
                        
                        {/* AI Rewrite Output */}
                        <div className="space-y-4">
                           <label className="text-[10px] uppercase text-zinc-400 font-black tracking-widest flex items-center gap-2">
                              <Brain className="w-3 h-3" /> Step 2: AI Strategic Rewrite
                           </label>
                           <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-sm relative group">
                              <div className="text-sm text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap">
                                 {rewrite}
                              </div>
                              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                 <Badge variant="outline" className="text-[8px] border-zinc-700 text-zinc-400">OPTIMIZED</Badge>
                              </div>
                           </div>
                        </div>

                        {/* Buyer Simulation Output */}
                        <div className="space-y-4">
                           <label className="text-[10px] uppercase text-amber-500 font-black tracking-widest flex items-center gap-2">
                              <Zap className="w-3 h-3" /> Step 3: Neural Response Simulation
                           </label>
                           <div className="bg-slate-950 border border-slate-800 p-6 rounded-sm space-y-4">
                              {typeof simulation === 'string' ? (
                                <p className="text-xs text-slate-400 font-mono italic leading-relaxed">{simulation}</p>
                              ) : (
                                <>
                                  <div className="flex justify-between items-center bg-black/40 p-3 border border-white/5 rounded">
                                    <span className="text-[10px] text-slate-500 uppercase font-black">Probability of Reply</span>
                                    <span className="text-lg font-black text-amber-400">{simulation.likelihood}%</span>
                                  </div>
                                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                                    <span className="text-amber-500 font-bold mr-2 uppercase tracking-widest">Likely Reaction:</span>
                                    {simulation.reaction}
                                  </p>
                                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                                    <span className="text-red-500 font-bold mr-2 uppercase tracking-widest">Main Objection:</span>
                                    {simulation.objection}
                                  </p>
                                </>
                              )}
                           </div>
                        </div>

                        {/* Final Optimized Action */}
                        <div className="space-y-4 pt-4">
                          <Button className="w-full bg-slate-800 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-[0.2em] rounded-none py-6 h-auto flex gap-3">
                             Dispatch Final Payload <Send className="w-4 h-4" />
                          </Button>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

export default function OperatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] text-slate-500 flex items-center justify-center font-mono tracking-widest uppercase">Initializing Operator...</div>}>
      <OperatorPageContent />
    </Suspense>
  );
}
