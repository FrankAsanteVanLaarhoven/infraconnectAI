'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldAlert, Zap, Network, Lock, Cpu, Server, Activity } from 'lucide-react';
import { MatrixRain } from "@/components/ui/matrix-rain";
import { InfraConnectLogo } from '@/components/ui/InfraConnectLogo';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f8fafc] relative overflow-hidden font-mono flex flex-col items-center">
      <MatrixRain className="opacity-20 mix-blend-screen" color="#3b82f6" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.05)_0%,#050505_100%)] opacity-90" />
      
      {/* Navbar overlay */}
      <nav className="relative z-50 w-full flex items-center justify-between p-6 md:px-12 backdrop-blur-none border-b border-white/5 bg-[#050505]/40">
        <InfraConnectLogo variant="flat" size="sm" />
        <Link href="/" className="text-[11px] uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2">
           <Zap className="w-3 h-3" /> Return to Platform
        </Link>
      </nav>

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 py-24 flex flex-col items-center">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-center space-y-6 mb-20 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 border border-slate-800 bg-black/50 px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Global Scale Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-white tracking-widest leading-tight">
            Infrastructure. <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Instantly connected.</span>
          </h1>
          <p className="text-slate-500 font-mono tracking-widest uppercase text-sm">
            No APIs. No pipelines. No rebuilds.
          </p>
        </motion.div>

        {/* Pricing Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          
          {/* Tier 1 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="bg-[#0a0b0c] border border-slate-800 rounded-xl p-8 flex flex-col gap-6 relative group hover:border-slate-700 transition-colors">
            <div>
              <h3 className="text-xl font-bold uppercase tracking-widest text-slate-200">Early Access</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">(Limited Allocation)</p>
            </div>
            <div className="text-3xl font-black text-white font-mono">£2k<span className="text-lg text-slate-600 font-normal">/yr</span></div>
            <ul className="space-y-4 text-xs font-mono text-slate-400 flex-1 mt-4">
               <li className="flex gap-3 items-start"><CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0"/> Invite-only provisioning</li>
               <li className="flex gap-3 items-start"><CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0"/> Up to 3 live systems</li>
               <li className="flex gap-3 items-start"><CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0"/> Core connective protocols</li>
               <li className="flex gap-3 items-start"><CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0"/> Slack / Notion / GitHub</li>
            </ul>
            <Link href="/" className="w-full text-center bg-slate-900 border border-slate-700 text-slate-300 py-3 text-xs uppercase tracking-widest font-bold hover:bg-slate-800 transition-colors">
              Request Invite
            </Link>
          </motion.div>

          {/* Tier 2 (Highlighted) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="bg-[#050505] border border-blue-900/50 rounded-xl p-8 flex flex-col gap-6 relative shadow-[0_0_40px_rgba(59,130,246,0.1)] scale-105 z-10 group">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0" />
            <div>
              <h3 className="text-xl font-bold uppercase tracking-widest text-blue-400">Team Platform</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Unlimited execution</p>
            </div>
            <div className="text-4xl font-black text-white font-mono drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">£6k<span className="text-xl text-slate-600 font-normal">/yr</span></div>
            <ul className="space-y-4 text-xs font-mono text-slate-300 flex-1 mt-4">
               <li className="flex gap-3 items-start"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0"/> Unlimited system tethers</li>
               <li className="flex gap-3 items-start"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0"/> Multi-user collaboration layer</li>
               <li className="flex gap-3 items-start"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0"/> Role-based access control (RBAC)</li>
               <li className="flex gap-3 items-start"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0"/> Immutable audit logs</li>
            </ul>
            <Link href="/theatre" className="w-full text-center bg-blue-600 border border-blue-500 text-white py-3 text-xs uppercase tracking-widest font-bold hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
              Initiate Deployment
            </Link>
          </motion.div>

          {/* Tier 3 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="bg-[#0a0b0c] border border-slate-800 rounded-xl p-8 flex flex-col gap-6 relative hover:border-slate-700 transition-colors">
            <div>
              <h3 className="text-xl font-bold uppercase tracking-widest text-slate-200">Enterprise</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Maximum control</p>
            </div>
            <div className="text-3xl font-black text-white font-mono">Custom<span className="text-lg text-slate-600 font-normal opacity-0">/yr</span></div>
            <ul className="space-y-4 text-xs font-mono text-slate-400 flex-1 mt-4">
               <li className="flex gap-3 items-start"><CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0"/> Private VPC deployment</li>
               <li className="flex gap-3 items-start"><CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0"/> Air-gapped secure support</li>
               <li className="flex gap-3 items-start"><CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0"/> Guaranteed SLA + Support</li>
               <li className="flex gap-3 items-start"><CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0"/> Custom legacy connectors</li>
            </ul>
            <Link href="/" className="w-full text-center bg-slate-900 border border-slate-700 text-slate-300 py-3 text-xs uppercase tracking-widest font-bold hover:bg-slate-800 transition-colors">
              Talk to Operations
            </Link>
          </motion.div>

        </div>

        {/* ROI Psychological Anchor */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="mt-20">
           <div className="flex items-center gap-4 bg-green-950/20 border border-green-900/30 px-6 py-4 rounded shadow-[0_0_30px_rgba(34,197,94,0.05)]">
             <Activity className="w-5 h-5 text-green-500 animate-pulse" />
             <span className="text-sm font-mono tracking-widest text-green-400 capitalize drop-shadow-md">
               "Most teams recover the cost in under 2 weeks."
             </span>
           </div>
        </motion.div>
      </main>
    </div>
  );
}
