"use client";
import React, { useEffect } from 'react';
import { ShieldAlert, Network, Lock, Cpu, Server, Database, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { InfraConnectLogo } from '@/components/ui/InfraConnectLogo';
import { PremiumBackButton } from '@/components/navigation/PremiumBackButton';

export default function SecurityPortal() {
  // Behavioral Tracking
  useEffect(() => {
    const email = localStorage.getItem('ic_lead_email');
    if (email) {
      fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, viewedSecurity: true })
      }).catch(err => console.error("[TRACK_FAIL]", err));
    }
  }, []);
  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] font-mono selection:bg-zinc-500/30 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,transparent_0%,#050505_100%)] opacity-90" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <nav className="relative z-50 flex items-center justify-between p-6 md:px-12 backdrop-blur-md border-b border-white/5 bg-[#050505]/80">
        <div className="flex items-center gap-3">
          <InfraConnectLogo variant="flat" size="sm" />
        </div>
        <div className="hidden md:flex items-center gap-8">
          <PremiumBackButton href="/" label="Return to Platform" className="mb-0" />
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-24 flex flex-col items-center">
        <div className="text-center w-full max-w-4xl">
          <div className="inline-flex items-center justify-center px-3 py-1 mb-6 text-xs font-bold uppercase tracking-widest text-zinc-300 border border-zinc-800 bg-zinc-900/50 rounded-sm">
            <Lock className="w-3 h-3 mr-2" />
            Zero-Trust Connectivity
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter text-white uppercase">
            Security by Architecture
          </h1>
          <p className="text-xl text-slate-400 font-mono tracking-tight bg-slate-900/50 p-6 rounded border-l-2 border-zinc-500/50">
            InfraConnect runs inside your environment. No inbound access. No data exposure. Full control. 
            We ensure your infrastructure remains secure by design, not by patch.
          </p>
        </div>

        {/* Visual Architecture Matrix */}
        <div className="mt-24 w-full animate-in zoom-in-95 duration-1000 delay-300">
           <h3 className="text-center text-sm font-bold tracking-[0.3em] uppercase text-slate-500 mb-12">Enterprise Deployment Topology</h3>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-[#02050E]/80 backdrop-blur-xl border border-zinc-800 p-10 rounded-sm relative overflow-hidden group">
             {/* Sweeping radar effect underlay */}
             <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[bg-pan_10s_linear_infinite]" />
             
             {/* Customer VPC */}
             <div className="flex flex-col gap-6 relative z-10 border border-slate-800/80 bg-[#050505]/90 backdrop-blur p-6 rounded-sm shadow-2xl overflow-hidden hover:border-slate-600 transition-colors duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium flex justify-between items-center border-b border-slate-800/80 pb-3">
                  Customer Secure VPC
                  <span className="bg-slate-900/80 text-slate-500 border border-slate-800 px-2 py-0.5 rounded shadow-inner">Behind Firewall</span>
                </div>

                <div className="flex bg-slate-900/30 p-4 rounded items-center gap-4 border border-slate-800/40">
                  <Database className="w-8 h-8 text-slate-500" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200 tracking-wide">PostgreSQL / Legacy</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-0.5 tracking-wider">Logical Replication (pglogrepl)</div>
                  </div>
                </div>

                <div className="flex flex-col items-center py-2 relative">
                  <div className="absolute top-0 bottom-0 w-px bg-slate-800/80" />
                  <ArrowRight className="w-4 h-4 text-slate-600 rotate-90 z-10 bg-[#050505] rounded-sm" />
                </div>

                <div className="flex bg-zinc-900/40 border border-zinc-800 p-4 rounded items-center gap-4 relative">
                  <Cpu className="w-8 h-8 text-zinc-400 drop-" />
                  <div>
                    <div className="text-sm font-bold text-zinc-300 tracking-wide">InfraConnect Edge Node</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-0.5 tracking-wider">Compiled Binary (50MB)</div>
                  </div>
                  {/* Lock symbol marking edge exit */}
                  <Lock className="w-3 h-3 text-slate-300 absolute -right-1.5 top-1/2 -translate-y-1/2 bg-[#050505]" />
                </div>
             </div>

             {/* The Outbound Wedge Tunnel */}
             <div className="relative h-32 lg:h-full w-full flex items-center justify-center z-10">
                {/* Glowing conduits */}
                <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-zinc-900/0 via-zinc-400 to-zinc-900/0 lg:hidden" />
                <div className="absolute inset-y-0 w-[2px] bg-gradient-to-b from-zinc-900/0 via-zinc-400 to-zinc-900/0 hidden lg:block" />
                
                {/* Animated Packets */}
                <div className="absolute flex flex-col items-center justify-center bg-[#050505] p-3 rounded-sm border border-zinc-800">
                   <div className="text-[10px] text-zinc-300 font-bold tracking-[0.2em] uppercase mb-3">Outbound mTLS 1.3</div>
                   <div className="w-full flex justify-center gap-3">
                     <span className="w-2 h-2 bg-zinc-500 rounded-sm animate-ping" />
                     <span className="w-2 h-2 bg-zinc-500 rounded-sm animate-ping" style={{ animationDelay: '200ms' }} />
                     <span className="w-2 h-2 bg-zinc-500 rounded-sm animate-ping" style={{ animationDelay: '400ms' }} />
                   </div>
                   <span className="bg-red-950/60 text-red-400 border border-red-900/50 px-2.5 py-1 rounded-sm text-[9px] uppercase font-bold tracking-widest mt-4">Zero Inbound Traffic</span>
                </div>
             </div>

             {/* InfraConnect SaaS */}
             <div className="flex flex-col gap-6 relative z-10 border border-zinc-800 bg-[#050505]/90 backdrop-blur p-6 rounded-sm shadow-2xl overflow-hidden hover:border-zinc-600 transition-colors duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium flex justify-between items-center border-b border-slate-800/80 pb-3">
                  InfraConnect Platform
                  <span className="bg-zinc-900 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded shadow-inner">SaaS Control Plane</span>
                </div>

                <div className="flex bg-slate-900/30 p-4 rounded items-center gap-4 border border-slate-800/40">
                  <Network className="w-8 h-8 text-slate-400 drop-" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200 tracking-wide">Global Ingress Gateway</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-0.5 tracking-wider">SPIFFE Identity Auth</div>
                  </div>
                </div>

                <div className="flex flex-col items-center py-2 relative">
                  <div className="absolute top-0 bottom-0 w-px bg-slate-800/80" />
                  <ArrowRight className="w-4 h-4 text-slate-600 rotate-90 z-10 bg-[#050505] rounded-sm" />
                </div>

                <div className="flex bg-zinc-900/40 border border-zinc-800 p-4 rounded items-center gap-4 relative">
                  <Server className="w-8 h-8 text-zinc-400 drop-" />
                  <div>
                    <div className="text-sm font-bold text-zinc-300 tracking-wide">Semantic Engine</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-0.5 tracking-wider">DAG Workflow Controller</div>
                  </div>
                </div>
             </div>

           </div>
        </div>

        {/* Security Feature List */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 w-full animate-in fade-in duration-1000 delay-500">
          <div>
            <h4 className="text-white font-bold text-xl mb-4 font-mono">1. Cryptographic Edge Trust</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Every Edge Node receives a cryptographic SPIFFE identity with short-lived, auto-rotating certificates (4 hours). The connection communicates purely via outbound mTLS.
            </p>
            <ul className="text-xs text-slate-400 mb-6 space-y-2">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-slate-300"/> Runs deeply inside your infrastructure.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-slate-300"/> No inbound firewall rules required.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-slate-300"/> Total verifiable Auditability.</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-xl mb-4 font-mono">2. Data Processor vs Controller</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              <strong>You are the owner. We are the processor.</strong> InfraConnect never persists sensitive raw data arrays unless specifically toggled to Full Payload mode for isolated VPCs. Our default architecture utilizes <span className="text-zinc-300">Data Minimization Layer masking</span> algorithmically scrubbing PII before it even reaches the network layer.
            </p>
            <div className="flex gap-3">
              <a href="/public/dpa-template.pdf" className="inline-flex items-center text-xs text-zinc-300 font-bold uppercase tracking-wider py-2 px-4 border border-zinc-800 bg-zinc-900/20 rounded hover:bg-zinc-900/40 transition">
                Download DPA Agreement
              </a>
              <a href="/responsible-ai" className="inline-flex items-center text-xs text-slate-300 font-bold uppercase tracking-wider py-2 px-4 border border-slate-700 bg-slate-800 rounded hover:bg-slate-800 transition">
                Responsible AI Trust
              </a>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
