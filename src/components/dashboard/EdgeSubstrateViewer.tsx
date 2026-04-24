'use client';

import { motion } from 'framer-motion';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { Activity, ShieldCheck, Database, Cpu, Lock } from 'lucide-react';

export function EdgeSubstrateViewer() {
  return (
    <GlassPanel glow className="col-span-full h-80 flex flex-col relative overflow-hidden group">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      
      {/* Decorative WebGL/WebRTC Backdrop */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-slate-800 rounded-sm blur-3xl mix-blend-screen" />
        <div className="w-[400px] h-[400px] bg-blue-500/10 rounded-sm blur-3xl mix-blend-screen absolute ml-32 mt-32" />
      </div>

      <div className="relative z-10 flex items-center justify-between p-4 border-b border-border/5">
        <h3 className="text-sm font-semibold tracking-wider flex items-center gap-2 uppercase text-foreground/80">
          <Activity className="w-4 h-4 text-slate-300" />
          Blockchain Ledger & Edge Substrate Topology
        </h3>
        <div className="flex items-center gap-3 text-[10px] uppercase font-mono tracking-widest text-muted-foreground/60">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-slate-800" /> WebRTC Duplex</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-blue-500" /> PWA Active</span>
        </div>
      </div>

      <div className="relative flex-1 z-10 flex items-center justify-center gap-12 p-8 h-full">
        
        {/* Node 1: Next.js + PWA */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-3 z-10"
        >
          <div className="w-16 h-16 rounded-none bg-foreground/5 border border-border/10 flex flex-col items-center justify-center gap-1 backdrop-blur-md">
            <Cpu className="w-6 h-6 text-foreground/80" />
          </div>
          <div className="text-center">
            <span className="block text-xs font-bold text-foreground">Mission Control</span>
            <span className="block text-[10px] text-muted-foreground font-mono">Next.js PWA / WebGL</span>
          </div>
        </motion.div>

        {/* Node 2: Rust Tauri Core */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-3 z-10"
        >
          <div className="w-16 h-16 rounded-none bg-foreground/5 border border-blue-500/20 flex flex-col items-center justify-center gap-1 backdrop-blur-md">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-center">
            <span className="block text-xs font-bold text-foreground">OS Intercept</span>
            <span className="block text-[10px] text-muted-foreground font-mono">Rust / Tauri</span>
          </div>
        </motion.div>

        {/* Node 3: Go Ingestion Firehose */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-3 z-10"
        >
          <div className="w-16 h-16 rounded-none bg-foreground/5 border border-slate-700 flex flex-col items-center justify-center gap-1 backdrop-blur-md">
            <Database className="w-6 h-6 text-slate-300" />
          </div>
          <div className="text-center">
            <span className="block text-xs font-bold text-foreground">Memory Ledger</span>
            <span className="block text-[10px] text-slate-300 font-mono">Go / PostgreSQL</span>
          </div>
        </motion.div>

        {/* Node 4: Zig Edge AI */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-3 z-10"
        >
          <div className="w-16 h-16 rounded-none bg-foreground/5 border border-orange-500/20 flex flex-col items-center justify-center gap-1 backdrop-blur-md relative overflow-hidden">
             {/* Blockchain / GDPR visual lock */}
            <div className="absolute top-1 right-1"><Lock className="w-3 h-3 text-orange-500/50" /></div>
            <Cpu className="w-6 h-6 text-orange-400" />
          </div>
          <div className="text-center">
            <span className="block text-xs font-bold text-foreground">Zero-Alloc AI</span>
            <span className="block text-[10px] text-orange-500/70 font-mono">Zig WASM (Edge)</span>
          </div>
        </motion.div>

      </div>

      {/* ISO Compliance Ticker */}
      <div className="border-t border-border/5 bg-foreground/[0.02] p-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground/50">
        <span>ISO-27001-STRICT • GDPR CRYPTOGRAPHIC ERASURE CAPABLE</span>
        <span className="flex items-center gap-2">
          LATEST HASH: <span className="text-slate-300">8f4a3...e91b2 (VERIFIED)</span>
        </span>
      </div>
    </GlassPanel>
  );
}
