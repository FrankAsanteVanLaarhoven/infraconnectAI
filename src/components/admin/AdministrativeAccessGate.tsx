"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff,
  UserPlus,
  Key,
  Shield,
  Fingerprint,
  RotateCcw,
  Terminal,
  Clock,
  ExternalLink,
  Zap
} from 'lucide-react';

/**
 * AdministrativeAccessGate
 * A Neural Strategic Intent Core designed to oversee Physical AI orchestration.
 * Transcends standard IAM by mapping AI's Chain of Thought to operational reality.
 */
export function AdministrativeAccessGate({ auditLogs }: { auditLogs: any[] }) {
  const [activeTab, setActiveTab] = useState<'neural' | 'principals' | 'policies'>('neural');
  
  // Real-time Neural Intent Stream simulation
  const [intents, setIntents] = useState<any[]>([]);
  
  React.useEffect(() => {
    const time = new Date().toLocaleTimeString();
    const initialIntents = [
      { id: 1, type: 'STRATEGIC_ALIGN', detail: 'Recalibrating Node-72 to offset predictive latency spike.', confidence: 0.98, time },
      { id: 2, type: 'MESH_HEAL', detail: 'Physical swarm vector adjusted for Sector-Alpha persistence.', confidence: 0.99, time },
      { id: 3, type: 'PROPHECY_SYNC', detail: 'Telemetry horizon extended to 15s for Core-Unit.', confidence: 0.97, time }
    ];
    setIntents(initialIntents);

    const interval = setInterval(() => {
      const types = ['NEURAL_REBAL', 'SWARM_INTENT', 'SECURITY_HARDEN', 'OPTIMIZE_FLOW', 'INTERCEPT_PREEMPT'];
      const targets = ['Fleet-Unit-01', 'Edge-Sovereign', 'Cognitive-Bridge', 'Reality-Mesh'];
      const newIntent = {
        id: Date.now(),
        type: types[Math.floor(Math.random() * types.length)],
        detail: `AI is optimizing ${targets[Math.floor(Math.random() * targets.length)]} for 2035-standard throughput.`,
        confidence: 0.95 + Math.random() * 0.04,
        time: new Date().toLocaleTimeString()
      };
      setIntents(prev => [newIntent, ...prev].slice(0, 10));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8 p-1">
      
      {/* 1. HUD HEADER: NEURAL ORCHESTRATION STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-white/5 p-5 rounded-3xl flex items-center gap-5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-[40px] rounded-sm" />
            <div className="w-12 h-12 bg-amber-500 rounded-none flex items-center justify-center text-black relative z-10 transition-transform group-hover:scale-110">
               <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="relative z-10">
               <div className="text-[9px] text-amber-500/60 font-black uppercase tracking-[0.3em] mb-1">Clearance Tier</div>
               <div className="text-sm font-black text-white uppercase tracking-tight">UNF-4 / SOVEREIGN</div>
            </div>
         </div>
         <div className="bg-slate-900/40 border border-white/5 p-5 rounded-3xl flex items-center gap-5 shadow-inner backdrop-blur-md">
            <div className="w-12 h-12 bg-slate-800/80 rounded-none flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
               <Fingerprint className="w-7 h-7" />
            </div>
            <div>
               <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">Principals</div>
               <div className="text-sm font-black text-white uppercase tracking-tight">24 UNIT / ACTIVE</div>
            </div>
         </div>
         <div className="bg-slate-900/40 border border-white/5 p-5 rounded-3xl flex items-center gap-5 shadow-inner backdrop-blur-md group">
            <div className="w-12 h-12 bg-slate-800/80 rounded-none flex items-center justify-center text-slate-400">
               <RotateCcw className="w-7 h-7 text-slate-300 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
               <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">Neural Health</div>
               <div className="text-sm font-black text-white uppercase tracking-tight">99.98% OPTIMAL</div>
            </div>
         </div>
      </div>

      {/* 2. MAIN HUB WORKSPACE */}
      <div className="bg-[#020202] border border-white/5 rounded-3xl overflow-hidden flex flex-col min-h-[580px] shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative">
         
         {/* Internal Tab Navigator */}
         <div className="flex border-b border-white/5 px-8 bg-black/40 backdrop-blur-3xl sticky top-0 z-20">
            {[
              { id: 'neural', label: 'Neural Intent Core', icon: Terminal },
              { id: 'principals', label: 'Entity Registry', icon: UserCheck },
              { id: 'policies', label: 'Reality Governance', icon: Lock }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative ${activeTab === tab.id ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <tab.icon className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'scale-110 drop-' : ''}`} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="iamTab" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-amber-500" />
                )}
              </button>
            ))}
         </div>

         <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
               {activeTab === 'neural' && (
                  <motion.div 
                    key="neural"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col gap-6"
                  >
                     <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-sm bg-cyan-500" />
                           <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">AI Chain of Thought</h4>
                        </div>
                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest border border-slate-800 px-3 py-1 rounded-sm">REAL-TIME INFERENCE</span>
                     </div>
                     
                     <div className="space-y-4">
                        {intents.map((intent) => (
                           <motion.div 
                             key={intent.id}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] hover:border-white/10 transition-all group/intent relative"
                           >
                              <div className="absolute top-0 right-0 p-4">
                                 <span className="text-[8px] text-slate-600 font-mono tracking-tighter uppercase">{intent.time}</span>
                              </div>
                              <div className="flex items-start gap-4">
                                 <div className="mt-1 p-2.5 bg-amber-500/10 rounded-sm border border-amber-500/20 text-amber-500 group-hover/intent:bg-amber-500 group-hover/intent:text-black transition-colors">
                                    <Zap className="w-4 h-4" />
                                 </div>
                                 <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                       <span className="text-[10px] font-black text-white uppercase tracking-widest">{intent.type}</span>
                                       <div className="h-[1px] w-8 bg-slate-800" />
                                       <span className="text-[8px] text-slate-500 font-black uppercase">CONFIDENCE: {(intent.confidence * 100).toFixed(1)}%</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed group-hover/intent:text-slate-200 transition-colors">
                                       {intent.detail}
                                    </p>
                                 </div>
                              </div>
                              {/* Neural Progress Indicator */}
                              <div className="mt-4 h-[1px] bg-slate-900 rounded-sm overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${intent.confidence * 100}%` }}
                                   className="h-full bg-amber-500/30"
                                 />
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  </motion.div>
               )}

               {activeTab === 'principals' && (
                  <motion.div 
                    key="principals"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-6"
                  >
                     <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-2.5 h-2.5 rounded bg-amber-500" />
                           <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Operational Unit Inventory</h4>
                        </div>
                        <button className="px-5 py-2.5 bg-amber-500 text-black rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center gap-3 shadow-2xl">
                           <UserPlus className="w-3.5 h-3.5" />
                           Provision unit
                        </button>
                     </div>

                     <div className="grid gap-4">
                        {[
                          { name: 'Admin_Operator_72', role: 'Sovereign_Admin', clearance: 'L9_SOV', status: 'SYNCHRONIZED', val: 98 },
                          { name: 'Swarm_Controller_Beta', role: 'Automated_Unit', clearance: 'L4_MESH', status: 'SYNCHRONIZED', val: 94 },
                          { name: 'Sentinel_Gateway_X', role: 'Edge_Logic', clearance: 'L2_EDGE', status: 'STANDBY', val: 0 }
                        ].map((user) => (
                           <div key={user.name} className="bg-slate-900/20 border border-white/5 p-5 rounded-3xl flex items-center justify-between group transition-all hover:bg-white/[0.03]">
                              <div className="flex items-center gap-5">
                                 <div className="w-12 h-12 rounded-none bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500">
                                    <Key className="w-5 h-5" />
                                 </div>
                                 <div className="flex flex-col">
                                    <div className="text-[12px] font-black text-white uppercase tracking-tight mb-1">{user.name}</div>
                                    <div className="flex items-center gap-3">
                                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">{user.role}</span>
                                       <div className="h-2 w-[1px] bg-slate-800" />
                                       <span className="text-[10px] text-amber-500/80 font-black uppercase tracking-widest leading-none">RANK: {user.clearance}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end gap-3">
                                 <div className={`px-4 py-1.5 rounded-sm text-[8px] font-black uppercase tracking-widest border ${user.status === 'SYNCHRONIZED' ? 'bg-slate-800 text-slate-300 border-slate-700 ' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                    {user.status}
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="w-20 h-1 bg-slate-800/40 rounded-sm overflow-hidden border border-white/5">
                                       <motion.div initial={{ width: 0 }} animate={{ width: `${user.val}%` }} className="h-full bg-amber-500/50" />
                                    </div>
                                    <span className="text-[8px] font-mono text-slate-500">STABILITY</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </motion.div>
               )}

               {activeTab === 'policies' && (
                  <motion.div 
                    key="policies"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="flex flex-col gap-6"
                  >
                     <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                           <Shield className="w-24 h-24 text-amber-500" />
                        </div>
                        <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.3em] mb-3">Sovereign Governance Active</h4>
                        <p className="text-[11px] text-slate-400 font-mono leading-relaxed max-w-xl">
                           All physical AI clusters are currently synchronized under <span className="text-white font-black underline decoration-amber-500/50">Mesh Protocol 2035</span>. Autonomous local optimization is permitted within SOVEREIGN boundaries. 
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-5">
                        {[
                          { title: 'Physical Egress', status: 'MAXIMUM', desc: 'Prevents unauthorized data relay from remote physical clusters.' },
                          { title: 'Node Sovereign', status: 'ACTIVE', desc: 'Guarantees local AI autonomy for low-latency physical reaction.' },
                          { title: 'Canon Integrity', status: 'VERIFIED', desc: 'All neural intent streams are persisted in the immutable chain.' },
                          { title: 'Neural Hardening', status: 'LEVEL 9', desc: 'Sub-pixel encryption for all administrative visual feeds.' }
                        ].map((pol) => (
                           <div key={pol.title} className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl flex flex-col gap-4 hover:bg-white/[0.03] hover:border-white/10 transition-all group/pol relative overflow-hidden">
                              <div className="flex justify-between items-start z-10">
                                 <div className="text-[11px] font-black text-white uppercase tracking-widest">{pol.title}</div>
                                 <div className="w-10 h-10 rounded-sm bg-slate-900 flex items-center justify-center text-slate-700 group-hover/pol:text-amber-500 transition-colors">
                                    <Eye className="w-4 h-4" />
                                 </div>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-mono z-10">{pol.desc}</p>
                              <div className="flex justify-between items-center mt-3 pt-4 border-t border-white/[0.02] z-10">
                                 <span className="text-[9px] text-amber-500/60 font-black uppercase tracking-widest">GATE: {pol.status}</span>
                                 <button className="text-[8px] text-slate-600 hover:text-white uppercase font-black flex items-center gap-2 group-hover/pol:translate-x-1 transition-all">
                                    AUDIT REGISTRY <ExternalLink className="w-3 h-3" />
                                 </button>
                              </div>
                              {/* Background Pulse */}
                              <div className="absolute top-0 left-0 w-2 h-full bg-amber-500/10 opacity-0 group-hover/pol:opacity-100 transition-opacity" />
                           </div>
                        ))}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>

    </div>
  );
}
