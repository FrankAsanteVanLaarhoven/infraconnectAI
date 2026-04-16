"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Database, Brain, Cpu, Search, Activity, ChevronRight, Zap, Target, Wrench, ShieldPlus, Component } from 'lucide-react';
import { STRATEGIC_AGENTS, StrategicAgent } from '@/lib/nexus/swarm';
import { StrategicReportView } from './StrategicReportView';
import { useTranslation } from '@/components/providers/LocalizationProvider';

export function SwarmOrchestrator() {
  const { t, isRtl } = useTranslation();
  const [agents, setAgents] = useState<StrategicAgent[]>(STRATEGIC_AGENTS);
  const [phase, setPhase] = useState<'RESEARCH' | 'SYNTHESIS' | 'BOARDROOM'>('RESEARCH');
  const [risk, setRisk] = useState(0);

  useEffect(() => {
    async function fetchRisk() {
       try {
          const res = await fetch('/api/nexus/osint');
          const data = await res.json();
          setRisk(data.systemRisk || 0);
       } catch {}
    }
    fetchRisk();
    const inv = setInterval(fetchRisk, 15000);
    return () => clearInterval(inv);
  }, []);

  useEffect(() => {
    // Start parallel research simulation
    const timer = setInterval(() => {
      setAgents(prev => {
        const anyActive = prev.some(a => a.status === 'waiting' || a.status === 'in_progress');
        if (!anyActive) {
           clearInterval(timer);
           setTimeout(() => setPhase('SYNTHESIS'), 1000);
           return prev;
        }

        return prev.map(a => {
          if (a.status === 'completed') return a;
          const newProgress = Math.min(a.progress + Math.random() * 5, 100);
          const newStatus = newProgress === 100 ? 'completed' : 'in_progress';
          
          // Log W&B transitions
          if (newStatus !== a.status || newProgress % 20 < 5) {
             fetch('/api/mlops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                   action: 'logSwarmActivity',
                   payload: { agentId: a.id, status: newStatus, progress: newProgress }
                })
             }).catch(() => {});
          }

          const seconds = parseInt(a.timeElapsed.replace('s', '')) + 1;
          return { ...a, progress: newProgress, status: newStatus, timeElapsed: `${seconds}s` };
        });
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (phase === 'BOARDROOM') {
    return (
       <div className="w-full h-full relative" dir={isRtl ? 'rtl' : 'ltr'}>
          <StrategicReportView />
          <button 
            onClick={() => setPhase('RESEARCH')}
            className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-[70] px-4 py-1.5 bg-slate-900/80 border border-slate-700 text-[9px] text-slate-400 rounded-full hover:bg-slate-800 transition-all font-black uppercase tracking-widest`}
          >
             {t('swarm.back_to_orchestrator')}
          </button>
       </div>
    );
  }

  return (
    <div className="w-full h-full bg-black/60 backdrop-blur-3xl overflow-hidden flex flex-col font-mono p-6 select-none relative" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Background Grid VFX */}
      <div className={`absolute inset-0 opacity-[0.03] pointer-events-none transition-colors duration-1000 ${risk > 75 ? 'bg-red-500/10' : ''}`} 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Top Section: Strategic Mandate */}
      <div className={`relative z-10 flex ${isRtl ? 'justify-start' : 'justify-end'} mb-8`}>
         <motion.div 
           initial={{ x: isRtl ? -50 : 50, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           className={`w-96 backdrop-blur-xl p-6 rounded-2xl shadow-2xl transition-all duration-1000 ${risk > 75 ? 'bg-red-500/5 border-red-500/40 shadow-red-500/10' : 'bg-white/5 border border-white/10'}`}
         >
            <div className="flex justify-between items-center mb-2">
               <h4 className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">{t('swarm.overall_plan')}</h4>
               {risk > 75 && <span className="text-[8px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-black animate-pulse uppercase">Defensive Posture Active</span>}
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
               {t('swarm.exec_desc')}
            </p>
         </motion.div>
      </div>

      {/* Center: Orchestration Flow */}
      <div className="flex-1 relative flex items-center justify-center">
         
         {/* Agents Column */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {agents.map((agent, i) => (
               <motion.div 
                 key={agent.id}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.1 }}
                 className={`relative w-48 p-3 rounded-lg border backdrop-blur-md transition-all ${agent.status === 'completed' ? 'bg-indigo-900/10 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'bg-slate-900/40 border-slate-800'}`}
               >
                  <div className="flex justify-between items-start mb-2">
                     <div className={`p-1.5 rounded-sm ${agent.status === 'completed' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Brain className="w-3 h-3" />
                     </div>
                     <div className="flex items-center gap-2">
                        {agent.rlOptimized && (
                           <div className="bg-purple-900/30 text-purple-400 border border-purple-500/30 px-1 py-0.5 rounded text-[6px] font-black tracking-widest uppercase animate-pulse flex items-center gap-1">
                              <Zap className="w-2 h-2" /> RL
                           </div>
                        )}
                        {agent.selfHealing && (
                           <div className="bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 p-0.5 rounded text-[6px] animate-pulse">
                              <ShieldPlus className="w-2 h-2" />
                           </div>
                        )}
                        <span className="text-[8px] text-slate-500 font-bold uppercase ml-1">{agent.timeElapsed}</span>
                     </div>
                  </div>
                  <h5 className="text-[10px] font-black text-white uppercase mb-1 leading-tight line-clamp-2">{t(`swarm.agent.${agent.id.replace('agent-', '')}`)}</h5>
                  
                  {/* SOTA Benchmark Pill */}
                  <div className="bg-blue-950/20 border border-blue-900/40 rounded px-1.5 py-0.5 mb-2 inline-flex items-center gap-1">
                     <Target className="w-2 h-2 text-blue-500" />
                     <span className="text-[6px] text-blue-400 uppercase font-black tracking-tighter truncate max-w-[120px]">{agent.benchmark}</span>
                  </div>

                  {/* Domain Tools */}
                  <div className="space-y-1 mb-3">
                     {agent.tools.slice(0, 2).map((tool, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[7px] text-slate-400 font-bold uppercase tracking-wide">
                           <Wrench className="w-2 h-2 text-slate-600 shrink-0" />
                           <span className="truncate">{tool}</span>
                        </div>
                     ))}
                     {agent.tools.length > 2 && (
                        <div className="text-[6px] text-slate-600 font-black uppercase tracking-widest pl-3.5 mt-0.5">
                           + {agent.tools.length - 2} ENGINES
                        </div>
                     )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-1">
                     <motion.div 
                        animate={{ width: `${agent.progress}%` }}
                        className={`h-full ${agent.status === 'completed' ? 'bg-indigo-500 shadow-[0_0_10px_#6366f1]' : 'bg-slate-600'}`}
                     />
                  </div>
                  <div className="flex justify-between text-[7px] font-bold">
                     <span className={agent.status === 'completed' ? 'text-indigo-400 flex items-center gap-1' : 'text-slate-600'}>
                        {agent.status === 'completed' && <Component className="w-2 h-2" />} {agent.status === 'completed' ? t('status.done') : t('status.in_progress')}
                     </span>
                     <span className="text-slate-600">{Math.floor(agent.progress)}%</span>
                  </div>

                  {/* Connecting Line to Center (Calculated via logic if needed, here simplified) */}
                  {agent.status === 'completed' && (
                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 text-indigo-500/40 animate-pulse">
                        <ChevronRight className="rotate-90 w-full h-full" />
                     </div>
                  )}
               </motion.div>
            ))}
         </div>

         {/* SVG Connections (Mock for static layout) */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
               <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#6366f1" />
               </linearGradient>
            </defs>
            {/* Simple schematic lines showing the swarm convergence */}
            <path d="M100,300 Q200,300 400,400" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="5,5" className="animate-dash" />
            <path d="M100,500 Q200,500 400,400" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="5,5" className="animate-dash" />
            <path d="M900,300 Q800,300 600,400" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="5,5" className="animate-dash" />
            <path d="M900,500 Q800,500 600,400" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="5,5" className="animate-dash" />
         </svg>
      </div>

      {/* Bottom Section: Synthesis Convergence */}
      <div className="relative z-10 flex flex-col items-center gap-6 mt-6">
         
         <div className="flex items-center gap-12">
            <AnimatePresence>
               {phase !== 'RESEARCH' && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                     <div className={`p-4 rounded-full border-2 transition-all duration-1000 ${phase === 'SYNTHESIS' ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_30px_#6366f1]' : 'border-slate-800 bg-slate-900'}`}>
                        <Network className={`w-8 h-8 ${phase === 'SYNTHESIS' ? 'text-indigo-400 animate-spin-slow' : 'text-slate-600'}`} />
                     </div>
                     <span className="text-[10px] mt-2 font-black text-indigo-400 tracking-widest uppercase">{t('swarm.synthesize_results')}</span>
                     {phase === 'SYNTHESIS' && (
                        <div className="mt-1 text-[8px] text-slate-500 animate-pulse uppercase">{t('swarm.correlating_datasets')}</div>
                     )}
                  </motion.div>
               )}
            </AnimatePresence>

            {phase === 'SYNTHESIS' && (
               <motion.button 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 onClick={() => setPhase('BOARDROOM')}
                 className="px-6 py-2 bg-indigo-500 text-white rounded font-black text-[10px] tracking-widest hover:bg-indigo-400 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
               >
                  {t('swarm.initialize_boardroom')}
               </motion.button>
            )}
         </div>

         {/* Phase Indicators */}
         <div className="flex gap-4">
            {[t('swarm.agent_research'), t('swarm.system_synthesis'), t('swarm.boardroom_briefing')].map((p, idx) => (
               <div key={p} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                     (idx === 0 && phase === 'RESEARCH') || (idx === 1 && phase === 'SYNTHESIS') || (idx === 2 && phase === 'BOARDROOM') 
                     ? 'bg-indigo-500 animate-pulse' : 'bg-slate-800'
                  }`} />
                  <span className={`text-[8px] font-black tracking-widest uppercase ${
                     (idx === 0 && phase === 'RESEARCH') || (idx === 1 && phase === 'SYNTHESIS') || (idx === 2 && phase === 'BOARDROOM') 
                     ? 'text-white' : 'text-slate-600'
                  }`}>
                     {p}
                  </span>
               </div>
            ))}
         </div>
      </div>

      <style jsx global>{`
         @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
         }
         .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
         }
         @keyframes dash {
            to { stroke-dashoffset: -20; }
         }
         .animate-dash {
            animation: dash 1s linear infinite;
         }
      `}</style>
    </div>
  );
}
