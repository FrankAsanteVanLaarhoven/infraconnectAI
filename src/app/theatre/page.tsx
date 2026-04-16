'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Database, Network, Server, Cloud, ShieldAlert, Cpu, ArrowRight, Zap, Play, Terminal, Target, Activity, FileText, CheckCircle2, Users, TrendingUp, Presentation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DemoEngine } from '@/lib/engine/demoEngine';
import { InfraConnectLogo } from '@/components/ui/InfraConnectLogo';
import TrustPanel from '@/components/operator/TrustPanel';
import { useFleetStream } from '@/lib/hooks/useFleetStream';
import { EconomicThreatRadar } from '@/components/nexus/EconomicThreatRadar';
import { CognitiveOrchestrationMatrix } from '@/components/core/CognitiveOrchestrationMatrix';
import { SwarmOrchestrator } from '@/components/nexus/SwarmOrchestrator';
import { useCinemaEngine, playCinematicSound } from '@/lib/hooks/useCinemaEngine';
import { useLiveEvents } from '@/lib/hooks/useLiveEvents';

// --- Act-specific Sub-components ---

function Act6ClosePanel({ nodeCount }: { nodeCount: number }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1500); 
    const t2 = setTimeout(() => setStage(2), 3500); 
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const roi = (nodeCount || 1) * 1200; // SOTA calculation logic

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-12">
      <div className="space-y-4">
       <div className="space-y-4">
         <h2 className="text-3xl font-black uppercase tracking-widest text-white leading-tight">Your infrastructure is <br />now autonomous</h2>
         <p className="text-slate-400 font-mono tracking-widest uppercase text-sm">Real-time command established. Unified intelligence active.</p>
       </div>

       <div className="w-full max-w-2xl bg-black border border-slate-800 p-10 rounded-xl shadow-[0_0_100px_rgba(37,99,235,0.1)] relative overflow-hidden group">
         <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
         <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
         {stage >= 1 ? (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 mb-10">
             <div className="text-xs uppercase font-bold text-slate-500 tracking-widest">System Operational Efficiency</div>
             <div className="text-5xl font-black text-blue-400 font-mono drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">£{roi.toLocaleString()}<span className="text-3xl text-slate-600">/mo</span></div>
             <div className="text-[10px] text-slate-600 uppercase tracking-widest mt-4 bg-slate-900/50 inline-block px-4 py-1.5 rounded border border-white/5">Verifiable fleet ROI based on {nodeCount} active nodes</div>
           </motion.div>
         ) : (
           <div className="h-[120px] flex items-center justify-center text-xs text-slate-600 font-mono uppercase tracking-widest animate-pulse">Calculating systemic ROI...</div>
         )}
         {stage >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8 border-t border-white/5 flex flex-col items-center gap-6">
              <a href="/dashboard" className="w-full max-w-xs bg-white hover:bg-slate-200 text-black px-12 py-4 rounded font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all text-center">
                View Dashboard
              </a>
              <button className="text-[10px] text-slate-500 uppercase font-bold tracking-widest hover:text-white transition-colors">Request Enterprise Deployment</button>
            </motion.div>
         )}
       </div>
     </div>
    </motion.div>
  );
}

export default function EpicTheatre() {
  const [act, setAct] = useState(1);
  const [terminalText, setTerminalText] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isLive, setIsLive] = useState(false);
  const { lastIncident } = useFleetStream();
  
  const { controls, triggerEventBeat } = useCinemaEngine();

  // The Master Cinematic Lock
  useLiveEvents((event) => {
      setIsLive(true);
      triggerEventBeat(event.type);
      playCinematicSound(event.type);

      // Event -> Act Mapping
      if (event.type === 'NODE_CONNECTED') {
         setAct(2);
         setLogs(prev => [...prev, `[NODE_CONNECTED] ${event.nodeId}`]);
      }
      else if (event.type === 'TELEMETRY' && act <= 2) setAct(2);
      else if (event.type === 'ANOMALY_DETECTED') setAct(3);
      else if (event.type === 'DEPLOY_STARTED') setAct(4);
      else if (event.type === 'DEPLOY_COMPLETE') setAct(5);
      else if (event.type === 'TRUST_LOCK') setAct(6);
  });

  return (
    <motion.div animate={controls} className={`relative min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-mono overflow-hidden transition-all duration-300`}>
      
      {/* Glitch Overlay for Incidents */}
      {lastIncident && (
        <motion.div animate={{ opacity: [0, 0.4, 0] }} transition={{ repeat: Infinity, duration: 0.2 }} className="absolute inset-0 z-[100] bg-red-600 pointer-events-none mix-blend-overlay" />
      )}

      {/* SOTA Dynamic Logo & Status */}
      <div className="absolute top-6 left-6 z-[60] flex items-center gap-6">
        <div className="w-[180px]">
          <InfraConnectLogo size="sm" variant="flat" />
        </div>
        <div className="h-8 w-px bg-white/10 hidden md:block" />
        <div className="flex flex-col font-mono">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">System Status</p>
          <p className="text-[10px] text-green-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            Connected
          </p>
        </div>
      </div>

      {act === 1 && (
        <div className="flex flex-col items-center text-center animate-in fade-in duration-1000 max-w-4xl p-8">
           <h1 className="text-4xl font-semibold tracking-tight text-white mb-12">The Infrastructure Paradox</h1>
           <p className="text-base text-white/50 mb-16 tracking-widest">Universal connectivity, zero API friction. Waiting for Node Lock...</p>
           <button className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] text-white/50 px-8 py-4 rounded tracking-widest transition-all cursor-not-allowed">Awaiting Telemetry</button>
        </div>
      )}

      {act === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }} className="w-full max-w-6xl px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
           <div className="space-y-8">
              <div className="space-y-2 mb-12">
                 <h2 className="text-2xl font-semibold tracking-tight text-white">Synthesizing Systemic Intelligence</h2>
                 <p className="text-xs text-white/50 tracking-widest uppercase">Act 2: The Cognitive Layer</p>
              </div>
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] p-6 rounded-xl">
                 <p className="text-base text-white/80 font-mono leading-relaxed mb-6">
                    Raw data is noise. InfraConnect leverages a tiered memory architecture to filter, score, and promote fragments into canonical strategic intelligence.
                 </p>
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-[10px] text-cyan-400 font-medium tracking-widest">
                       <Zap className="w-4 h-4" /> Autonomic Synthesis: ACTIVE
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-white/50 font-medium tracking-widest">
                       <ShieldAlert className="w-4 h-4" /> Governance Entropy: 4.2% [OPTIMAL]
                    </div>
                 </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02, transition: { duration: 0.2, ease: [0.25, 0.8, 0.25, 1] } }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 text-xs font-medium tracking-widest text-white bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-4 rounded transition-all shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
              >
                 Synchronize Context <ArrowRight className="w-4 h-4" />
              </motion.button>
           </div>

           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative h-[500px] overflow-hidden rounded-xl border border-slate-800/50">
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-xl z-10 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                    <div className="h-[280px] shrink-0">
                       <EconomicThreatRadar />
                    </div>
                    <div className="h-[300px] shrink-0">
                       <CognitiveOrchestrationMatrix />
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>
      )}

      {act === 3 && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }} className="w-full h-full max-w-7xl mx-auto flex flex-col items-center p-8 relative z-10">
           <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl font-semibold tracking-tight text-white">Adaptive Swarm Orchestration</h2>
              <p className="text-xs text-white/50 tracking-widest uppercase">Act 3: The Mission Intent</p>
           </div>
           
           <div className="flex-1 w-full border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] relative group">
              <SwarmOrchestrator />
              
              {/* Overlay Prompt */}
              <div className="absolute bottom-12 right-12 z-[80]">
                 <button className="group bg-white/5 backdrop-blur-2xl border border-white/10 text-white/50 px-8 py-4 rounded-full text-xs flex items-center gap-3 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
                    System Actively Polling <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
         </motion.div>
      )}

      {act === 4 && (
        <div className="w-full max-w-4xl p-8 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] rounded-xl relative">
           <div className="text-white/50 mb-12 border-b border-white/10 pb-6 tracking-widest text-xs uppercase">Model Deployment & Sim Pipeline Active</div>
           <div className="h-[300px] overflow-y-auto space-y-4">
              {logs.map((l, i) => <div key={i} className="text-base text-white/80 font-mono tracking-tight">{l}</div>)}
           </div>
        </div>
      )}

      {act === 5 && (
        <motion.div initial={{ opacity: 0, filter: "blur(12px)" }} animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }} className="w-full max-w-6xl p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
             <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] p-8 rounded-xl flex flex-col justify-between">
                <div>
                   <h3 className="text-xs uppercase text-white/50 tracking-widest mb-6">Live Command Log</h3>
                   <div className="text-lg text-white font-mono mb-6">{terminalText}<span className="animate-pulse">_</span></div>
                </div>
                {lastTelemetry && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }} className="bg-white/5 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] p-6 rounded-xl mt-auto">
                    <div className="text-xs text-white/50 tracking-widest mb-4">Ingesting Telemetry</div>
                    <div className="text-base font-mono text-white/80 truncate">Agent: {lastTelemetry.agentId}</div>
                    <div className="text-base font-mono text-white/80">Modality: {lastTelemetry.modality || 'UNKNOWN'}</div>
                  </motion.div>
                )}
             </div>
             
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] rounded-xl overflow-hidden flex flex-col">
               <div className="bg-white/5 border-b border-white/10 px-6 py-4 text-xs text-white/50 tracking-widest">Active Execution Log</div>
               <div className="p-8 overflow-y-auto flex-1">
                  <div className="text-base font-mono text-white/80">Node Synchronized & Payload Executing.</div>
               </div>
             </div>
           </div>
        </motion.div>
      )}

      {act === 6 && <TrustPanel />}
      
      {act === 7 && (
         <Act6ClosePanel nodeCount={42} />
      )}
    </motion.div>
  );
}
