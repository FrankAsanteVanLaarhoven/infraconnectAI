"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap
} from 'lucide-react';
import { bus } from '@/lib/events/bus';
import { fetchChokepointIntel, fetchMarketPulse } from '@/lib/nexus/osint-fusion';
import { fetchIntelligenceFeeds, IntelligenceFeedItem } from '@/lib/nexus/intelligence';

export function StrategicNexusHub() {
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

  const openPanel = (panel: string) => {
    bus.emit('infraconnect:toggle-panel', { panel });
  };

  const sectors = [
    { id: 'maritime', label: 'Maritime', icon: Ship, color: 'text-cyan-400', bg: 'bg-cyan-500/10', alert: 'Dark Vessel P-421 Tracking' },
    { id: 'economic', label: 'Economic', icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10', alert: 'Brent Crude Volatility High' },
    { id: 'legal', label: 'Legal', icon: Scale, color: 'text-purple-400', bg: 'bg-purple-500/10', alert: 'GDPR Compliance Drift: 2.1%' },
  ];

  return (
    <div className="w-full h-full bg-[#020617]/60 backdrop-blur-3xl border border-white/5 rounded-2xl overflow-hidden flex flex-col font-mono select-none">
      {/* Cinematic Header */}
      <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <Globe className="w-5 h-5 text-white/50 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-[0.2em] uppercase">Strategic Nexus Core</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">Global Infrastructure Oversight // OSINT Fusion</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[8px] text-slate-600 font-black uppercase">System Health</p>
              <div className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                 <span className="text-[10px] text-white font-black uppercase">Optimal</span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Sector Quick-links */}
        <div className="grid grid-cols-3 gap-4">
          {sectors.map(sector => (
            <motion.button
              key={sector.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openPanel(sector.id)}
              className="group flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl text-left transition-all hover:bg-white/[0.04] hover:border-white/10"
            >
              <div className={`p-2 w-fit rounded-lg ${sector.bg} border border-white/5`}>
                 <sector.icon className={`w-4 h-4 ${sector.color}`} />
              </div>
              <div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{sector.label}</span>
                <p className="text-[8px] text-slate-500 mt-1 leading-tight group-hover:text-slate-300 transition-colors">{sector.alert}</p>
              </div>
              <div className="mt-auto pt-2 flex items-center gap-2 text-[7px] font-black text-slate-600 uppercase group-hover:text-white transition-colors">
                <span>Access Hub</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Intelligence Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Global Intelligence Feed</span>
            </div>
            <span className="text-[8px] text-slate-600 font-bold uppercase">Live Ingest</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <Zap className="w-6 h-6 text-slate-800 animate-pulse" />
              </div>
            ) : (
              feeds.map((feed, idx) => (
                <motion.div 
                  key={feed.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-white/[0.01] border border-white/5 rounded-lg flex gap-4 hover:border-white/10 transition-colors group"
                >
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className={`w-1 h-1 rounded-full ${feed.impactScale > 0.7 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'}`} />
                    <div className="w-[1px] flex-1 bg-white/10" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{feed.source} // {feed.category}</span>
                      <span className="text-[7px] text-slate-700 font-mono italic">{new Date(feed.ts).toLocaleTimeString()}</span>
                    </div>
                    <h4 className="text-[11px] font-black text-slate-200 uppercase leading-tight group-hover:text-white transition-colors">{feed.title}</h4>
                    <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">{feed.content}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Predictive Anomalies */}
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <AlertCircle className="w-3 h-3" />
            Predictive Drift Alert
          </h3>
          <p className="text-[9px] text-red-200/60 uppercase leading-relaxed max-w-[80%]">
            AI Model detects potential supply-chain occlusion in Sector-7. 
            Probabilities of "Steady State" decay: 14.2% over T-Minus 4h.
          </p>
        </div>
      </div>

      <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <span className="text-[8px] text-emerald-500/60 font-black uppercase tracking-widest italic">Global Synthesis: STABLE</span>
        </div>
        <div className="text-[8px] text-slate-700 font-bold uppercase tracking-tighter">
          Validating Tier-1 OSINT Channels...
        </div>
      </div>
    </div>
  );
}
