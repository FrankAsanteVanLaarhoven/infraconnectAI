'use client';

import React from 'react';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { motion } from 'framer-motion';
import { Terminal, Shield, Cpu, Activity, Zap, Layers, Globe } from 'lucide-react';

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-black text-slate-300 p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* ── Header ── */}
        <header className="space-y-4">
           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
              <div className="p-3 rounded-sm bg-cyan-500/10 border border-cyan-500/30">
                 <Shield className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                 <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Enterprise API Blueprint</h1>
                 <p className="text-cyan-500/60 font-bold tracking-[0.3em] uppercase text-[10px]">InfraConnect AI // L5 Ops Clearance Required</p>
              </div>
           </motion.div>
        </header>

        {/* ── Architecture Overview ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <DocCard icon={Cpu} title="Edge Registry" detail="Manage real-time WebSocket tunnels for distributed agent fleets." />
           <DocCard icon={Layers} title="Governance API" detail="Autonomous promotion logic and stratum-level security gates." />
           <DocCard icon={Globe} title="Fleet Stream" detail="Server-Sent Events (SSE) for sub-orbital signal monitoring." />
        </section>

        {/* ── Endpoint Specifications ── */}
        <div className="space-y-8">
           <div className="border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold uppercase tracking-widest text-white">Endpoint Registry</h2>
           </div>

           <EndpointBlock 
             method="POST" 
             path="/api/nemoclaw/run" 
             description="Dispatch mission-critical skills to the fleet."
             payload={`{
  "skillId": "hardware_audit",
  "agentId": "agent-01",
  "taskSummary": "Standard Compliance Scan"
}`}
           />

           <EndpointBlock 
             method="GET" 
             path="/api/fleet/stream" 
             description="Subscribe to the Global Neural Heartbeat (SSE)."
             payload="Connection: keep-alive\nContent-Type: text/event-stream"
           />

           <EndpointBlock 
             method="POST" 
             path="/api/governance/cycle" 
             description="Trigger an immediate autonomous stratum promotion cycle."
             payload={'{ "clearance": "L5-GodMode" }'}
           />
        </div>

        {/* ── Footer ── */}
        <footer className="pt-12 border-t border-white/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
           <span>InfraConnect OS v4.2.0-STABLE</span>
           <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-sm bg-slate-800" />
              All Systems Operational
           </span>
        </footer>
      </div>
    </div>
  );
}

function DocCard({ icon: Icon, title, detail }: any) {
  return (
    <GlassCard level="L1" className="p-6 space-y-3">
       <Icon className="w-6 h-6 text-cyan-500" />
       <h3 className="font-bold text-white uppercase tracking-wider">{title}</h3>
       <p className="text-xs text-slate-400 leading-relaxed">{detail}</p>
    </GlassCard>
  );
}

function EndpointBlock({ method, path, description, payload }: any) {
  return (
    <GlassPanel glow className="p-6 space-y-4">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <span className={`px-3 py-1 rounded-md font-black text-[10px] border ${
               method === 'POST' ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
             }`}>
               {method}
             </span>
             <code className="text-sm font-bold text-cyan-400">{path}</code>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{description}</p>
       </div>
       <pre className="p-4 bg-black/40 rounded-sm border border-white/5 text-[11px] leading-relaxed overflow-x-auto">
          {payload}
       </pre>
    </GlassPanel>
  );
}
