"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Globe, 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  ArrowRight, 
  Ship, 
  DollarSign, 
  Scale,
  Zap,
  Terminal,
  Database,
  Satellite,
  Cpu,
  Target
} from 'lucide-react';
import { bus } from '@/lib/events/bus';
import { fetchIntelligenceFeeds, IntelligenceFeedItem } from '@/lib/nexus/intelligence';

const NEXUS_SECTORS = [
  { id: 'maritime', label: 'Maritime Grid', icon: Ship, color: 'text-cyan-400', bg: 'bg-cyan-500/10', alert: 'Dark Vessel P-421 Tracking', path: '/nexus/maritime' },
  { id: 'economic', label: 'Economic Core', icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10', alert: 'Brent Crude Volatility High', path: '/nexus/integration' },
  { id: 'legal', label: 'Legal Posture', icon: Scale, color: 'text-slate-400', bg: 'bg-slate-900/50', alert: 'GDPR Compliance Drift: 2.1%', path: '/nexus/security' },
  { id: 'fleet', label: 'Swarm Fleet', icon: Activity, color: 'text-slate-300', bg: 'bg-slate-800', alert: '3/43 Nodes Offline', path: '/nexus/fleet' },
  { id: 'space', label: 'Orbital Intel', icon: Satellite, color: 'text-indigo-400', bg: 'bg-indigo-500/10', alert: 'RADARSAT-3 Synthesis Active', path: '/nexus/space' },
  { id: 'control-plane', label: 'Control Plane', icon: Terminal, color: 'text-rose-400', bg: 'bg-rose-500/10', alert: 'GitOps Reconciliation Lag', path: '/nexus/control-plane' },
];

export function StrategicNexusHub() {
  const router = useRouter();
  const [feeds, setFeeds] = useState<IntelligenceFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchIntelligenceFeeds();
      setFeeds(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="w-full h-full bg-[#030712]/80 backdrop-blur-3xl border border-white/5 rounded-none overflow-hidden flex flex-col font-mono select-none shadow-2xl relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-cyan-500/10 blur-[120px] rounded-sm opacity-50 Slow" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-sm opacity-30 Slow" />
      </div>

      {/* Cinematic Header */}
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-sm border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Globe className="w-6 h-6 text-white/70 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-[0.3em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Strategic Nexus Core</h2>
            <p className="text-[10px] text-cyan-500/80 font-bold uppercase tracking-[0.2em] leading-none mt-1">Global Infrastructure Oversight // Intelligence Fusion</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
           <div className="flex gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Global Threat Level</span>
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md">
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] text-amber-500 font-bold uppercase">Elevated</span>
                </div>
              </div>
           </div>
           <div className="h-10 w-[1px] bg-white/10" />
           <div className="text-right">
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Core Health</p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-sm bg-slate-800" />
                 <span className="text-[11px] text-white font-black uppercase tracking-wider">Optimal</span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
        <div className="grid grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Sectors */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-4 h-4 text-slate-400" />
                <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Operational Sectors</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {NEXUS_SECTORS.map((sector, idx) => (
                  <motion.div
                    key={sector.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => router.push(sector.path)}
                    className="group relative flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-none text-left cursor-pointer transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex justify-between items-start">
                      <div className={`p-2.5 rounded-sm ${sector.bg} border border-white/5 shadow-inner`}>
                        <sector.icon className={`w-5 h-5 ${sector.color}`} />
                      </div>
                      <div className="p-1.5 bg-black/40 rounded border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <span className="text-[11px] font-black text-white uppercase tracking-widest">{sector.label}</span>
                      <p className="text-[9px] text-slate-500 mt-2 leading-relaxed group-hover:text-slate-400 transition-colors line-clamp-2 h-8">{sector.alert}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Predictive Anomalies Banner */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 p-6 bg-red-500/5 border border-red-500/20 rounded-none relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500">
                <AlertCircle className="w-32 h-32 text-red-500" />
              </div>
              <h3 className="text-[12px] font-black text-red-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-3">
                <AlertCircle className="w-4 h-4" />
                Predictive Drift Alert
              </h3>
              <p className="text-[10px] text-red-200/70 uppercase tracking-widest leading-relaxed max-w-[70%] mt-4 border-l-2 border-red-500/40 pl-4">
                AI Model detects potential supply-chain occlusion in Sector-7. 
                Probabilities of "Steady State" decay: 14.2% over T-Minus 4h.
                <br /><br />
                <span className="text-red-400 font-bold">RECOMMENDED ACTION: Re-route vessels via secondary maritime corridors.</span>
              </p>
            </motion.div>

          </div>

          {/* Right Column: Intelligence Feed */}
          <div className="col-span-12 lg:col-span-4 flex flex-col bg-black/40 rounded-none border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-cyan-500" />
                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Global Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-sm bg-cyan-500" />
                <span className="text-[8px] text-cyan-500/70 font-bold uppercase tracking-widest">Live</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                  <Zap className="w-8 h-8 text-cyan-500/40" />
                  <span className="text-[9px] uppercase tracking-widest font-black">Decrypting Streams...</span>
                </div>
              ) : (
                feeds.map((feed, idx) => (
                  <motion.div 
                    key={feed.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-sm hover:bg-white/[0.04] hover:border-white/10 transition-all group cursor-default"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-sm ${feed.impactScale > 0.7 ? 'bg-red-500 ' : 'bg-cyan-500 '}`} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{feed.source}</span>
                      </div>
                      <span className="text-[8px] text-slate-600 font-mono italic">{new Date(feed.ts).toLocaleTimeString()}</span>
                    </div>
                    <h4 className="text-[12px] font-black text-slate-200 uppercase leading-snug group-hover:text-cyan-100 transition-colors">{feed.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed border-l-2 border-white/5 pl-3">{feed.content}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="p-4 border-t border-white/5 bg-black/60 flex items-center justify-between relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <TrendingUp className="w-4 h-4 text-slate-300" />
          <span className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">Global Synthesis: STABLE</span>
        </div>
        <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-3">
          <span>Validating Tier-1 OSINT Channels...</span>
          <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-sm animate-spin" />
        </div>
      </div>
    </div>
  );
}
