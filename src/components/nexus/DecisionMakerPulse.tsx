"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Briefcase, 
    TrendingUp, 
    ShieldAlert, 
    Eye, 
    Search, 
    Activity,
    Layers
} from 'lucide-react';

export function DecisionMakerPulse() {
    const [execs, setExecs] = useState([
        { id: 1, name: 'CEO_ALPHA', company: 'NVIDIA', action: 'STRATEGIC_ACQUISITION', sentiment: 'BULLISH', status: 'ACTIVE' },
        { id: 2, name: 'CFO_BETA', company: 'TSLA', action: 'LIQUIDITY_REPOSITIONING', sentiment: 'NEUTRAL', status: 'STABLE' },
        { id: 3, name: 'CTO_GAMMA', company: 'AMZN', action: 'IP_CONSOLIDATION', sentiment: 'BULLISH', status: 'LOCKED' },
        { id: 4, name: 'DIR_DELTA', company: 'BLK', action: 'TREASURY_REBALANCING', sentiment: 'BEARISH', status: 'MONITORED' }
    ]);

    return (
        <div className="w-full h-full bg-[#020617]/80 backdrop-blur-[40px] border border-emerald-500/20 rounded-3xl p-6 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_60px_rgba(16,185,129,0.05)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <User className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Decision Maker Pulse</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Behavioral Scrutiny // High-Primacy Intel</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                </div>
            </div>

            {/* Pulsing Grid */}
            <div className="flex-1 grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pr-2">
                {execs.map((exec, i) => (
                    <motion.div
                        key={exec.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between group/exec hover:border-emerald-500/30 transition-all cursor-crosshair"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/10 group-hover/exec:border-emerald-500/50 transition-colors">
                                <Briefcase className="w-4 h-4 text-slate-400 group-hover/exec:text-emerald-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white font-black uppercase tracking-widest">{exec.name}</span>
                                <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">{exec.company} // {exec.action}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                exec.sentiment === 'BULLISH' ? 'text-emerald-400 bg-emerald-500/10' :
                                exec.sentiment === 'BEARISH' ? 'text-red-400 bg-red-500/10' : 'text-slate-400 bg-slate-500/10'
                            }`}>
                                {exec.sentiment}
                            </span>
                            <span className="text-[7px] text-slate-600 font-mono tracking-tighter">SIGNAL_CONFIDENCE_88%</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Status */}
            <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-[8px] text-white font-black uppercase tracking-[0.2em]">Institutional Churn Monitor Active</span>
                </div>
                <div className="flex gap-1 h-3 items-end">
                    {[0.4, 0.7, 0.2, 0.9, 0.5, 0.8].map((h, i) => (
                        <motion.div 
                            key={i}
                            animate={{ height: [`${h * 100}%`, `${(1 - h) * 100}%`, `${h * 100}%`] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1 bg-emerald-500/40 rounded-t-sm"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
