"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Handshake, TrendingUp, Users, Target, Filter, Search, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DealPipelineHub } from '@/components/nexus/DealPipelineHub';
import { NegotiationWarRoom } from '@/components/revenue/NegotiationWarRoom';
import { X } from 'lucide-react';

const STAGES = ['new', 'qualified', 'meeting', 'negotiation', 'closed'];

export default function CRMPipelinePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState('ALL');
  const [selectedLeadEmail, setSelectedLeadEmail] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/crm/leads');
        const data = await res.json();
        setLeads(data.leads || []);
      } catch (err) {
        console.error("CRM_FETCH_FAIL", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const filteredLeads = activeStage === 'ALL' 
    ? leads 
    : leads.filter(l => (l.status === activeStage || (activeStage === 'negotiation' && l.status === 'meeting')));

  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] font-mono p-8 pt-24 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Conversion Pipeline</h1>
            <p className="text-xs text-slate-500 uppercase tracking-[0.3em] font-bold">Revenue Engine // Strategic Matrix</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-sm">
             <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Pipeline Value</p>
                <p className="text-2xl font-black text-white">£{leads.reduce((acc, l) => acc + (l.projectedValue || l.score * 500), 0).toLocaleString()}</p>
             </div>
             <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        {/* Strategic Summary Hub */}
        <div className="h-[400px]">
           <DealPipelineHub />
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-4 border-t border-white/5">
           {['ALL', ...STAGES].map(stage => (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`px-4 py-2 rounded-none text-[10px] font-black tracking-widest uppercase transition-all border ${
                  activeStage === stage 
                  ? 'bg-blue-600 border-blue-500 text-white ' 
                  : 'bg-black border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {stage}
              </button>
           ))}
        </div>

        {/* Grid / Pipeline View */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-500 uppercase text-xs tracking-[0.5em]">Syncing Intelligence...</div>
            ) : filteredLeads.length > 0 ? filteredLeads.map((lead) => (
              <motion.div 
                layout
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-[#0a0b0c] border border-slate-800 p-6 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-6 flex-1 w-full">
                  <div className={`p-4 rounded-sm border ${lead.score > 70 ? 'bg-red-950/20 border-red-900/50 text-red-500' : 'bg-slate-900 border-slate-800 text-slate-500'} transition-colors`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                       <h3 className="text-lg font-black text-white uppercase tracking-tight">{lead.email}</h3>
                       {lead.score > 70 && <Badge className="bg-red-600 text-[8px] uppercase font-black">🔥 High Priority</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                       <span>{lead.company || "Unknown Org"}</span>
                       <span className="w-1 h-1 rounded-sm bg-slate-700" />
                       <span className={lead.intent === 'high' ? 'text-blue-400' : ''}>{lead.intent} Intent</span>
                       <span className="w-1 h-1 rounded-sm bg-slate-700" />
                       <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <div className="text-right space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Projected Value</p>
                    <p className={`text-2xl font-black ${lead.projectedValue ? 'text-slate-300' : 'text-white'}`}>
                      £{(lead.projectedValue || lead.score * 1200).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-10 w-px bg-white/5 hidden md:block" />
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <Button 
                      onClick={() => setSelectedLeadEmail(lead.email)}
                      variant="outline" size="sm" className="rounded-none border-slate-700 text-[9px] uppercase font-black tracking-widest h-8 px-4"
                    >
                       Enter War Room
                    </Button>
                    <a href={`/dashboard/operator?leadId=${lead.id}`} className="block">
                      <Button size="sm" className="w-full bg-white text-black hover:bg-slate-200 rounded-none text-[9px] uppercase font-black tracking-widest h-8 px-4">
                         Run Operator
                      </Button>
                    </a>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-700 border border-dashed border-slate-800 rounded-sm">
                 <Target className="w-12 h-12 opacity-10 mb-4" />
                 <p className="text-xs font-black uppercase tracking-widest">No matching targets in this stage</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* War Room Modal */}
      <AnimatePresence>
        {selectedLeadEmail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLeadEmail(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl h-[90vh] z-10"
            >
              <button 
                onClick={() => setSelectedLeadEmail(null)}
                className="absolute -top-12 right-0 text-slate-400 hover:text-white flex items-center gap-2 text-[10px] uppercase font-black tracking-widest"
              >
                Exit War Room <X className="w-4 h-4" />
              </button>
              <NegotiationWarRoom leadEmail={selectedLeadEmail} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
