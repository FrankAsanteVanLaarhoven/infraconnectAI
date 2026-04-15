'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Database, Network, Server, Cloud, ShieldAlert, Cpu, ArrowRight, Zap, Play, Terminal, Target, Activity, FileText, CheckCircle2, Users, TrendingUp, Presentation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DemoEngine } from '@/lib/engine/demoEngine';
import { InfraConnectLogo } from '@/components/ui/InfraConnectLogo';
import TrustPanel from '@/components/operator/TrustPanel';
import { useFleetStream } from '@/lib/hooks/useFleetStream';

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
        <h2 className="text-3xl font-black uppercase tracking-widest text-white">Your infrastructure. Instantly connected.</h2>
        <p className="text-slate-400 font-mono tracking-widest uppercase text-sm">No pipelines. No APIs. Immediate command.</p>
      </div>

      <div className="w-full max-w-2xl bg-[#050505] border border-slate-800 p-8 rounded-xl shadow-[0_0_50px_rgba(37,99,235,0.1)] relative">
        <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-6" />
        {stage >= 1 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 mb-8">
            <div className="text-xs uppercase font-bold text-slate-500 tracking-widest">Projected Engineering Capital Recaptured</div>
            <div className="text-5xl font-black text-green-400 font-mono drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">£{roi.toLocaleString()}<span className="text-3xl text-slate-600">/mo</span></div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 bg-slate-900/50 inline-block px-3 py-1 rounded">Verifiable fleet ROI based on {nodeCount} active nodes</div>
          </motion.div>
        ) : (
          <div className="h-[120px] flex items-center justify-center text-xs text-slate-600 font-mono uppercase tracking-widest animate-pulse">Calculating systemic ROI...</div>
        )}
        {stage >= 2 && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8 border-t border-slate-800 flex flex-col items-center gap-4">
             <button className="bg-white hover:bg-slate-200 text-black px-8 py-3 rounded text-xs font-bold uppercase tracking-widest shadow-xl transition-all">Request Enterprise Access</button>
           </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Main Theatre Page
export default function EpicTheatre() {
  const [act, setAct] = useState(1);
  const [isInstalling, setIsInstalling] = useState(false);
  const [terminalText, setTerminalText] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [wowState, setWowState] = useState(0);
  const [isLive, setIsLive] = useState(false);
  
  const { events, lastTelemetry, lastIncident } = useFleetStream();

  // Detect live mode
  useEffect(() => {
    if (events.length > 0) setIsLive(true);
  }, [events]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") advanceAct();
      if (e.key === "ArrowLeft") setAct((a) => Math.max(1, a - 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [act]);

  const advanceAct = () => {
    if (act === 1) setAct(2);
    else if (act === 2) {
      setAct(3);
      runInstallSimulation();
    }
    else if (act === 3 && !isInstalling) {
      setAct(4);
      runWowSimulation();
    }
    else if (act === 4) setAct(5);
    else if (act === 5) setAct(6);
  };

  const runInstallSimulation = () => {
    setIsInstalling(true);
    const steps = [
      "curl -fsSL https://connect.infraconnect.ai/install.sh | bash",
      "",
      "[AUTH] SPIFFE/Hardware identity bound",
      "[TRANSPORT] Established mTLS WebSocket tunnel",
      "[INFO] Universal Protocol Engine Initialized",
      "[SYNC] Handshake complete."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setLogs(prev => [...prev, steps[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsInstalling(false), 1500);
      }
    }, 800);
  };

  const runWowSimulation = () => {
    const query = "SCAN INFRASTRUCTURE LOGS WHERE severity = 'high';";
    let i = 0;
    const interval = setInterval(() => {
      setTerminalText(query.substring(0, i));
      i++;
      if (i > query.length) {
        clearInterval(interval);
        setTimeout(() => setWowState(1), 800);
        setTimeout(() => setWowState(2), 2000);
      }
    }, 50);
  };

  return (
    <div className={`relative min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-mono overflow-hidden transition-all duration-300 ${lastIncident ? 'bg-red-950/20' : ''}`}>
      
      {/* Glitch Overlay for Incidents */}
      {lastIncident && (
        <motion.div animate={{ opacity: [0, 0.4, 0] }} transition={{ repeat: Infinity, duration: 0.2 }} className="absolute inset-0 z-[100] bg-red-600 pointer-events-none mix-blend-overlay" />
      )}

      {/* SOTA Dynamic Logo */}
      <div className="absolute top-6 left-6 z-[60] w-[200px]">
        <InfraConnectLogo size="sm" variant="flat" />
      </div>

      <div className="absolute top-6 right-6 flex items-center gap-4 z-[60]">
        <div className={`flex items-center gap-2 px-3 py-1 rounded text-[10px] uppercase font-bold tracking-widest border ${isLive ? 'border-cyan-500 text-cyan-500 animate-pulse' : 'border-slate-800 text-slate-500'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-cyan-500 shadow-[0_0_8px_cyan]' : 'bg-slate-700'}`} />
          {isLive ? 'Live Uplink Active' : 'Waiting for Signal'}
        </div>
      </div>

      {act === 1 && (
        <div className="flex flex-col items-center text-center animate-in fade-in duration-1000 max-w-4xl">
           <h1 className="text-5xl font-black mb-6 uppercase tracking-tighter">The Infrastructure Paradox</h1>
           <p className="text-slate-400 text-lg mb-12">Universal connectivity, zero API friction. Welcome to the Edge.</p>
           <button onClick={advanceAct} className="bg-red-600 px-8 py-4 rounded font-bold uppercase tracking-widest hover:bg-red-500 transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)]">Enter Theatre</button>
        </div>
      )}

      {act === 3 && (
        <div className="w-full max-w-4xl p-8 border border-slate-800 bg-[#0a0b0c] rounded shadow-2xl relative">
           <div className="text-slate-400 mb-8 border-b border-slate-800 pb-4 uppercase tracking-[0.3em] text-xs font-bold">Node Discovery Console</div>
           <div className="h-[300px] overflow-y-auto space-y-2">
              {logs.map((l, i) => <div key={i} className="text-sm">{l}</div>)}
           </div>
           {!isInstalling && <button onClick={advanceAct} className="absolute bottom-8 right-8 text-cyan-500 text-xs uppercase font-bold flex items-center gap-2">Verify Signals <ArrowRight className="w-4 h-4" /></button>}
        </div>
      )}

      {act === 4 && (
        <div className="w-full max-w-6xl p-8 animate-in slide-in-from-bottom">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
             <div className="border border-slate-800 bg-[#050505] p-6 rounded flex flex-col justify-between">
                <div>
                   <h3 className="text-xs uppercase text-slate-500 tracking-widest font-bold mb-4">Live Command Log</h3>
                   <div className="text-xl text-green-400 font-mono mb-6">{terminalText}<span className="animate-pulse">_</span></div>
                </div>
                {lastTelemetry && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-blue-950/20 border border-blue-900/50 p-4 rounded mt-auto">
                    <div className="text-[10px] text-blue-400 uppercase font-bold mb-2">Ingesting Telemetry</div>
                    <div className="text-xs font-mono text-slate-300 truncate">Agent: {lastTelemetry.agentId}</div>
                    <div className="text-xs font-mono text-slate-300">Modality: {lastTelemetry.modality || 'UNKNOWN'}</div>
                  </motion.div>
                )}
             </div>
             
             <div className="border border-slate-800 bg-black/40 rounded overflow-hidden">
               <div className="bg-[#111] border-b border-slate-800 px-4 py-2 text-[10px] text-slate-500 uppercase tracking-widest">Active Fleet Stream</div>
               <div className="p-4 overflow-y-auto max-h-full h-[450px]">
                 <AnimatePresence>
                   {(isLive ? events : []).map((ev, i) => (
                     <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={i} className="flex items-center gap-3 py-2 border-b border-slate-800/50 text-[10px] font-mono">
                       <span className={`px-1.5 py-0.5 rounded uppercase font-bold ${ev.type === 'incident' ? 'bg-red-900 text-red-100' : 'bg-slate-800 text-slate-400'}`}>{ev.type}</span>
                       <span className="flex-1 truncate text-slate-300">Target: {ev.data.agentId}</span>
                       <span className="text-slate-600">{new Date(ev.ts).toLocaleTimeString()}</span>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </div>
             </div>
           </div>
           {wowState === 2 && <button onClick={advanceAct} className="mt-8 mx-auto block bg-white text-black px-6 py-2 rounded text-xs font-bold uppercase tracking-widest shadow-xl">Transition to Mission Control</button>}
        </div>
      )}

      {act === 5 && <TrustPanel />}
      
      {act === 6 && (
         <Act6ClosePanel nodeCount={events.filter(e => e.type === 'heartbeat').length || 42} />
      )}
    </div>
  );
}
