"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Terminal, 
  Code, 
  Search, 
  FolderLock, 
  Image as ImageIcon, 
  Globe, 
  ShieldCheck, 
  Database, 
  Palette,
  Brain,
  Zap,
  Lock,
  Workflow
} from 'lucide-react';
import { WORKER_STACK, SHARED_ARCHITECTURE, COGNITIVE_MODEL } from '@/lib/nexus/swarm';
import { useTranslation } from '@/components/providers/LocalizationProvider';
import { getShortFingerprint, generateAgentFingerprint } from '@/lib/security/fingerprint';

export function AdaptiveSwarmEngine() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [viewMode, setViewMode] = useState<'ORCHESTRATION' | 'CHAIN'>('ORCHESTRATION');
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Neural Grid Primary Logic Initializing..."]);
  const steps = ['DECOMPOSE', 'MAP DEPS', 'SEQUENCE', 'ALLOCATE', 'EXECUTE'];

  // Fingerprinted Agent Stack
  const fingerprintedWorkers = WORKER_STACK.map(w => ({
    ...w,
    fingerprint: generateAgentFingerprint(w.role)
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
      
      // Dynamic log generation
      const agent = fingerprintedWorkers[Math.floor(Math.random() * fingerprintedWorkers.length)];
      const newLog = `[${new Date().toLocaleTimeString()}] ${agent.role} (${getShortFingerprint(agent.fingerprint.hash)}) ${agent.capability === 'Writing Code' ? 'Committing' : 'Validating'} node fragment...`;
      setLogs(prev => [newLog, ...prev].slice(0, 15));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-slate-950/80 backdrop-blur-3xl border border-indigo-500/30 rounded-none overflow-hidden flex flex-col font-mono select-none relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Prefrontal Cortex Header */}
      <div className="p-6 border-b border-indigo-500/20 bg-indigo-950/10 flex flex-col items-center text-center space-y-1 relative z-10">
         <div className="absolute top-4 right-6 flex gap-2">
            <button 
              onClick={() => setViewMode('ORCHESTRATION')}
              className={`text-[8px] font-black px-2 py-1 rounded transition-all ${viewMode === 'ORCHESTRATION' ? 'bg-indigo-500 text-white ' : 'bg-slate-900 text-slate-500'}`}
            >
              {t('swarm.orchestration')}
            </button>
            <button 
              onClick={() => setViewMode('CHAIN')}
              className={`text-[8px] font-black px-2 py-1 rounded transition-all ${viewMode === 'CHAIN' ? 'bg-indigo-500 text-white ' : 'bg-slate-900 text-slate-500'}`}
            >
              {t('swarm.dependency_chain')}
            </button>
         </div>

         <motion.div 
           animate={{ scale: [1, 1.05, 1] }} 
           transition={{ duration: 4, repeat: Infinity }}
           className="w-12 h-12 bg-indigo-500/10 rounded-sm flex items-center justify-center border border-indigo-500/20 mb-2"
         >
            <Brain className="w-6 h-6 text-indigo-400" />
         </motion.div>
         <h2 className="text-xl font-black text-indigo-400 tracking-[0.4em] uppercase">
           {viewMode === 'CHAIN' ? t('swarm.dependency_chain') : COGNITIVE_MODEL.header}
         </h2>
         <p className="text-[10px] text-indigo-900 font-bold tracking-[0.2em] uppercase">
           {viewMode === 'CHAIN' ? t('swarm.dependency_chain') : COGNITIVE_MODEL.subHeader}
         </p>
      </div>

      {/* Conditional Rendering based on ViewMode */}
      <div className="flex-1 flex overflow-hidden p-6 gap-8 relative z-10">
         <AnimatePresence mode="wait">
            {viewMode === 'ORCHESTRATION' ? (
              <motion.div 
                key="orchestration"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-full flex gap-8"
              >
                 {/* Master Dispatcher Column */}
                 <div className="w-1/3 flex flex-col items-center space-y-6">
                    <div className="w-full p-4 bg-indigo-950/20 rounded-sm border border-indigo-500/20 text-center relative">
                       <div className="absolute top-0 right-0 p-2"><Lock className="w-3 h-3 text-indigo-900" /></div>
                       <h3 className="text-[10px] font-black text-indigo-500 mb-1 uppercase tracking-widest">{t('swarm.master_agent')}</h3>
                       <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{t('swarm.ensures_coherence')}</p>
                       
                       {/* Decomposition State */}
                       <div className="mt-4 flex justify-between gap-1">
                          {steps.map((s, idx) => (
                             <div key={s} className="flex flex-col items-center gap-1 flex-1">
                                <div className={`w-full h-1 rounded-sm transition-colors ${idx <= activeStep ? 'bg-indigo-400 ' : 'bg-slate-800'}`} />
                                <span className={`text-[6px] font-black ${idx === activeStep ? 'text-indigo-400' : 'text-slate-700'}`}>{s}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Worker Stack */}
                    <div className="flex-1 w-full space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                       {fingerprintedWorkers.map(worker => (
                          <motion.div 
                            key={worker.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-3 bg-slate-900/40 rounded-sm border border-slate-800/50 flex flex-col gap-2 group hover:border-indigo-500/20 transition-all font-mono"
                          >
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                   <div className="p-1.5 bg-indigo-500/10 rounded border border-indigo-500/20">
                                      {worker.role === 'TERMINAL' && <Terminal className="w-3 h-3 text-indigo-400" />}
                                      {worker.role === 'CODE GEN' && <Code className="w-3 h-3 text-cyan-400" />}
                                      {worker.role === 'WEB SEARCH' && <Search className="w-3 h-3 text-amber-400" />}
                                      {worker.role === 'FILE MGMT' && <FolderLock className="w-3 h-3 text-rose-400" />}
                                      {worker.role === 'IMAGE GEN' && <ImageIcon className="w-3 h-3 text-slate-400" />}
                                      {worker.role === 'DEPLOYMENT' && <Globe className="w-3 h-3 text-slate-300" />}
                                   </div>
                                   <div>
                                      <p className="text-[9px] font-black text-white tracking-widest uppercase flex items-center gap-2">
                                         {worker.role} 
                                         <span className="text-[7px] text-indigo-600 bg-indigo-950/40 px-1 rounded">
                                            ID:{getShortFingerprint(worker.fingerprint.hash)}
                                         </span>
                                      </p>
                                      <p className="text-[7px] text-slate-500 font-bold uppercase">{worker.capability}</p>
                                   </div>
                                </div>
                                <span className="text-[9px] font-black text-indigo-400">{worker.progress}%</span>
                             </div>
                             <div className="w-full h-1 bg-slate-800 rounded-sm overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${worker.progress}%` }}
                                  transition={{ duration: 2, delay: 0.5 }}
                                  className={`h-full shadow-[0_0_10px_currentcolor] ${
                                    worker.role === 'TERMINAL' ? 'bg-indigo-400' :
                                    worker.role === 'CODE GEN' ? 'bg-cyan-400' :
                                    worker.role === 'WEB SEARCH' ? 'bg-amber-400' :
                                    'bg-indigo-400'
                                  }`}
                                />
                             </div>
                          </motion.div>
                       ))}
                    </div>

                    {/* Live Swarm Terminal */}
                    <div className="w-full h-40 bg-black/60 border border-indigo-900/40 rounded-sm p-3 font-mono overflow-hidden flex flex-col group">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Live Swarm Trace</span>
                          <span className="text-[7px] text-indigo-900 font-bold uppercase group-hover:text-indigo-600 transition-colors">Verifying IDs...</span>
                       </div>
                       <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar-mini">
                          {logs.map((log, i) => (
                             <p key={i} className="text-[8px] text-slate-500 leading-tight">
                                <span className="text-indigo-900 opacity-50 mr-2">{'>'}</span>
                                {log}
                             </p>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Shared Architecture Column */}
                 <div className="flex-1 flex flex-col space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">{t('swarm.shared_context')}</span>
                       </div>
                       <span className="text-[8px] text-indigo-500 font-black uppercase tracking-widest">{t('swarm.ensured_by_master')}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                       {SHARED_ARCHITECTURE.map(arch => (
                          <div key={arch.id} className="p-4 bg-slate-900/60 rounded-sm border border-slate-800 flex flex-col items-center text-center space-y-3 group hover:border-indigo-500/20 transition-all">
                             <div className="p-3 bg-indigo-500/5 rounded-sm border border-indigo-500/10 group-hover:bg-indigo-500/10">
                                {arch.icon === 'database' && <Database className="w-6 h-6 text-indigo-400" />}
                                {arch.icon === 'shield' && <ShieldCheck className="w-6 h-6 text-slate-300" />}
                                {arch.icon === 'palette' && <Palette className="w-6 h-6 text-amber-400" />}
                             </div>
                             <div>
                                <h4 className="text-[9px] font-black text-white mb-1 tracking-widest uppercase">{arch.title}</h4>
                                <p className="text-[7px] text-slate-600 font-bold uppercase leading-tight">{arch.desc}</p>
                             </div>
                          </div>
                       ))}
                    </div>

                    {/* Strategy Ticker */}
                    <div className="grid grid-cols-2 gap-4 mt-auto">
                       <div className="p-3 bg-slate-900/20 border border-slate-800 rounded-sm">
                          <p className="text-[8px] font-black text-indigo-400 mb-1 tracking-widest uppercase italic">{t('swarm.planning_metacognition')}</p>
                          <p className="text-[8px] text-slate-500 leading-normal">Thinking about how to think about a problem across novel domains.</p>
                       </div>
                       <div className="p-3 bg-slate-900/20 border border-slate-800 rounded-sm">
                          <p className="text-[8px] font-black text-amber-400 mb-1 tracking-widest uppercase italic">{t('swarm.multi_domain_cap')}</p>
                          <p className="text-[8px] text-slate-500 leading-normal">Broad cognitive capability across wildly different problem spaces.</p>
                       </div>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div 
                key="chain"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full h-full flex flex-col justify-center space-y-12"
              >
                 {/* Research Row */}
                 <div className="flex items-center gap-8">
                    <div className="w-48">
                       <h3 className="text-sm font-black text-indigo-400 tracking-widest flex items-center gap-2">{t('swarm.research')} &times;7</h3>
                       <p className="text-[8px] text-slate-600 font-bold uppercase">7 Parallel Agents</p>
                    </div>
                    <div className="flex-1 relative">
                       <motion.div 
                         initial={{ scaleX: 0 }}
                         animate={{ scaleX: 1 }}
                         transition={{ duration: 1.5 }}
                         className="h-10 bg-indigo-500/20 border border-indigo-500/40 rounded-sm origin-left flex items-center justify-end px-4"
                       >
                          <span className="text-[10px] text-indigo-400 font-black">100%</span>
                       </motion.div>
                       {/* Connection Arrow */}
                       <div className="absolute top-10 right-1/2 w-[2px] h-12 bg-indigo-500/20" />
                    </div>
                 </div>

                 {/* Synthesis Row */}
                 <div className="flex items-center gap-8 pl-12">
                    <div className="w-48">
                       <h3 className="text-sm font-black text-slate-300 tracking-widest">{t('swarm.synthesis')}</h3>
                       <p className="text-[8px] text-slate-600 font-bold uppercase">Waits for Research</p>
                    </div>
                    <div className="flex-1 relative">
                       <motion.div 
                         initial={{ scaleX: 0 }}
                         animate={{ scaleX: 1 }}
                         transition={{ duration: 1.5, delay: 1.5 }}
                         className="h-10 bg-slate-800 border border-slate-700 rounded-sm origin-left flex items-center justify-end px-4"
                       >
                          <span className="text-[10px] text-slate-300 font-black">100%</span>
                       </motion.div>
                       {/* Connection Arrow */}
                       <div className="absolute top-10 right-1/2 w-[2px] h-12 bg-slate-800" />
                    </div>
                 </div>

                 {/* Presentation Row */}
                 <div className="flex items-center gap-8 pl-24">
                    <div className="w-48">
                       <h3 className="text-sm font-black text-amber-400 tracking-widest">{t('swarm.presentation')}</h3>
                       <p className="text-[8px] text-slate-600 font-bold uppercase">Waits for Synthesis</p>
                    </div>
                    <div className="flex-1">
                       <motion.div 
                         initial={{ scaleX: 0 }}
                         animate={{ scaleX: 1 }}
                         transition={{ duration: 1.5, delay: 3 }}
                         className="h-10 bg-amber-500/20 border border-amber-500/40 rounded-sm origin-left flex items-center justify-end px-4"
                       >
                          <span className="text-[10px] text-amber-400 font-black">100%</span>
                       </motion.div>
                    </div>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Emergent Synthesis Footer */}
      <div className="p-4 bg-indigo-950/20 border-t border-indigo-500/10 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-3 h-3 text-slate-300" />
               <span className="text-[9px] text-slate-300 font-black uppercase">{t('swarm.security_validated')}</span>
            </div>
            <div className="flex gap-4">
               {['Synthesizer', 'Presenter', 'Scheduler'].map(role => (
                 <span key={role} className="text-[8px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-sm bg-slate-700" /> {role}
                 </span>
               ))}
            </div>
         </div>
         <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded text-[9px] font-black text-indigo-400 tracking-tighter uppercase">
            {t('swarm.strategic_active')}
         </div>
      </div>
    </div>
  );
}
