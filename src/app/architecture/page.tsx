"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Server, ShieldCheck, Database, Cloud, Activity, Terminal, ArrowRight, CheckCircle2, Lock, Cpu, Globe } from 'lucide-react'
import TrustPanel from '@/components/operator/TrustPanel'
import { InfraConnectLogo } from '@/components/ui/InfraConnectLogo'

// --- Internal Mocks for the architecture flows ---

const flowData = [
  { id: 1, title: 'ACT 1: Chaos', desc: 'Isolated systems, brittle APIs, and latency-heavy sync methods.', icon: <Database className="w-5 h-5 text-red-500" /> },
  { id: 2, title: 'ACT 2: Integration', desc: 'Agent deployment establishing secure WSS tunneling (Outbound-only).', icon: <Server className="w-5 h-5 text-yellow-500" /> },
  { id: 3, title: 'ACT 3: Telemetry', desc: 'Continuous stream processing routing safe telemetry to the control plane.', icon: <Activity className="w-5 h-5 text-blue-500" /> },
  { id: 4, title: 'ACT 4: Intelligence', desc: 'Operator identifies anomalies and formulates autonomous decisions.', icon: <Cpu className="w-5 h-5 text-purple-500" /> },
  { id: 5, title: 'ACT 5: Validation', desc: 'Cryptographic locking sequences prove system integrity to the ledger.', icon: <ShieldCheck className="w-5 h-5 text-green-500" /> },
]

function ArchitectureDiagram() {
  return (
    <div className="w-full bg-[#050505] border border-slate-800 rounded-2xl p-12 relative shadow-[0_0_80px_rgba(37,99,235,0.05)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-black to-purple-500/5 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10 w-full">
        {/* Edge Node */}
        <div className="flex-1 w-full bg-black border border-slate-700/50 p-6 rounded-xl relative group hover:border-slate-500 transition-colors">
           <div className="absolute top-4 right-4"><Terminal className="w-4 h-4 text-slate-600" /></div>
           <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">Edge Node</h3>
           <p className="text-xs text-slate-500 font-mono mt-2 uppercase">Zero-Trust Processing</p>
           
           <div className="mt-8 space-y-3">
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded text-[10px] font-mono text-slate-400 flex justify-between">
                <span>sanitizer.ts</span> <span className="text-blue-400">Mask PII</span>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded text-[10px] font-mono text-slate-400 flex justify-between">
                <span>spiffe.ident</span> <span className="text-purple-400">mTls Rotate</span>
              </div>
           </div>
        </div>

        {/* WSS Tunnel */}
        <div className="flex flex-col items-center justify-center relative w-32 shrink-0">
          <div className="h-[2px] w-full bg-gradient-to-r from-blue-900 via-blue-500 to-indigo-900 absolute top-1/2 -translate-y-1/2 -z-10" />
          <motion.div 
            animate={{ x: [-20, 20], opacity: [0.2, 1, 0.2] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10 relative"
          />
          <div className="text-[9px] uppercase font-bold tracking-widest text-blue-400 mt-4 bg-black px-2 py-1 border border-blue-900/50 rounded absolute -bottom-8">
            <Lock className="w-3 h-3 inline mr-1" /> WSS PORT:443
          </div>
        </div>

        {/* Control Plane */}
        <div className="flex-1 w-full bg-black border border-slate-700/50 p-6 rounded-xl relative group hover:border-slate-500 transition-colors">
           <div className="absolute top-4 right-4"><Cloud className="w-4 h-4 text-slate-600" /></div>
           <h3 className="text-xl font-black uppercase tracking-[0.2em] text-white">Control Plane</h3>
           <p className="text-xs text-slate-500 font-mono mt-2 uppercase">Core Validation</p>
           
           <div className="mt-8 space-y-3">
              <div className="bg-indigo-950/20 border border-indigo-900/50 p-3 rounded text-[10px] font-mono text-slate-400 flex justify-between relative overflow-hidden">
                <span className="relative z-10">AiAuditLog</span> <span className="text-indigo-400 relative z-10 italic">Immutable</span>
                <div className="absolute inset-0 bg-indigo-500/10 animate-pulse pointer-events-none" />
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded text-[10px] font-mono text-slate-400 flex justify-between">
                <span>Validation.API</span> <span className="text-green-400">Guardrails OK</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default function EpicArchitecturePage() {
  const [activeStep, setActiveStep] = useState(1);
  const [clock, setClock] = useState(0);

  // Trigger fake events to cycle the embedded Trust Panel beautifully
  useEffect(() => {
    const cycleEvents = async () => {
      const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
      
      while(true) {
        // Clear state implicitly
        window.dispatchEvent(new CustomEvent("ai_decision", { detail: null }));
        await wait(2000);
        
        // 1. Analyze
        window.dispatchEvent(new CustomEvent("ai_decision", {
          detail: { action: "Predict logical trajectory", reasoning: ["Analyzing data bounds", "Zero-trust verified"], confidence: 0.95 }
        }));
        await wait(2500);

        // 2. Act
        window.dispatchEvent(new CustomEvent("audit_log", {
          detail: { action: "Logical simulation recorded via /v1/telemetry", timestamp: new Date().toISOString() }
        }));
        await wait(1800);

        // 3. Verify
        window.dispatchEvent(new CustomEvent("verification_status", { detail: true }));
        await wait(6000);
      }
    };
    cycleEvents();

    const ticker = setInterval(() => {
       setActiveStep(s => s >= 5 ? 1 : s + 1);
       setClock(c => c + 1);
    }, 4000);

    return () => clearInterval(ticker);
  }, []);

  return (
    <div className="min-h-screen bg-black text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Header Identity */}
      <header className="fixed top-0 inset-x-0 h-20 border-b border-white/5 bg-black/60 backdrop-blur-md z-50 flex items-center px-8">
        <InfraConnectLogo variant="flat" size="sm" />
        <div className="ml-auto flex items-center gap-6 text-[10px] uppercase font-mono tracking-widest">
           <span className="text-slate-500">v-1.0.0.beta</span>
           <div className="flex items-center gap-2 text-blue-400 px-3 py-1 bg-blue-950/30 rounded border border-blue-900/40">
             <Globe className="w-3 h-3" /> LIVE SPECIFICATION
           </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div className="mb-6 mx-auto w-max text-xs font-bold font-mono uppercase tracking-[0.3em] text-slate-500 border-b border-slate-800 pb-2">
             [ CORE Architectural Spec ]
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-300 to-slate-600 drop-shadow-2xl">
            Security by Architecture,<br />Not Afterthought.
          </h1>
          <p className="text-lg text-slate-400 font-mono tracking-wide max-w-3xl mx-auto leading-relaxed border-l border-slate-800 pl-6">
            InfraConnect enforces a Zero-Trust, Edge-Native Processing Model. 
            We inject deterministic cryptographic mapping into every AI operation. You don't just see the action—you prove it.
          </p>
        </motion.div>
      </section>

      {/* Architecture Diagram Canvas */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <div className="mb-12 flex items-center gap-4">
           <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded">Topology</div>
           <div className="h-px bg-slate-800 flex-1" />
        </div>
        <ArchitectureDiagram />
      </section>

      {/* Cinematic Act Flow & Trust Emulation Panel */}
      <section className="py-20 px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* Flow visualizer */}
        <div className="space-y-4">
          <div className="mb-10 flex items-center gap-4">
             <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded">Operations Pipeline</div>
             <div className="h-px bg-slate-800 flex-1" />
          </div>

          {flowData.map((flow, idx) => (
             <div 
               key={flow.id} 
               className={`flex gap-6 p-6 rounded-xl transition-all duration-700 ${activeStep === flow.id ? 'bg-[#0a0b0d] border border-blue-900/40 shadow-[0_0_30px_rgba(37,99,235,0.1)] scale-105 relative z-10' : 'bg-black border border-slate-800/50 opacity-60 grayscale scale-100 hover:opacity-100'}`}
             >
               <div className="mt-1 shrink-0">{flow.icon}</div>
               <div>
                  <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-200">{flow.title}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-2 leading-relaxed">{flow.desc}</p>
               </div>
             </div>
          ))}
        </div>

        {/* Embedded Mock Area */}
        <div className="relative w-full aspect-square border border-slate-800 bg-[#050505] rounded-3xl p-8 lg:p-12 shadow-[inset_0_0_80px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden group">
           <div className="absolute top-6 left-6 text-[10px] font-mono uppercase tracking-[0.3em] font-bold text-slate-600 flex items-center gap-2">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Trust Injection View
           </div>

           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
           
           {/* Wrapping the embed safely */}
           <div className="w-full max-w-[340px] relative z-10">
              <TrustPanel isEmbedded={true} />
           </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 text-center mt-20">
         <div className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
           InfraConnect AI // Systemic Operating Validation
         </div>
      </footer>
    </div>
  )
}
