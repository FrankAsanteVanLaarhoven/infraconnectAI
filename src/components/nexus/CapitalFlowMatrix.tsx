"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRightLeft, 
    ArrowUpRight, 
    ArrowDownRight, 
    Zap, 
    Activity, 
    Globe, 
    Lock,
    Unlock,
    PieChart,
    BarChart3
} from 'lucide-react';

export function CapitalFlowMatrix() {
    const [flows, setFlows] = useState([
        { id: 1, asset: 'NVDA', type: 'LONG_SWEEP', volume: '1.2B', conviction: 0.94, impact: 'HIGH' },
        { id: 2, asset: 'TSLA', type: 'SHORT_SQUEEZE', volume: '840M', conviction: 0.82, impact: 'MED' },
        { id: 3, asset: 'AAPL', type: 'DARK_POOL_ACCUM', volume: '2.4B', conviction: 0.76, impact: 'HIGH' },
        { id: 4, asset: 'AMZN', type: 'INST_CHURN', volume: '1.1B', conviction: 0.64, impact: 'LOW' }
    ]);

    return (
        <div className="w-full h-full bg-[#020617]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_50px_rgba(79,70,229,0.05)]">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <Globe className="w-24 h-24 text-indigo-500 animate-pulse" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                        <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Capital Flow Matrix</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Efficiently Inefficient // Institutional Mirrors</p>
                    </div>
                </div>
                <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
                    <span className="text-[10px] text-indigo-300 font-black uppercase">Live_Ingestion</span>
                </div>
            </div>

            {/* Flow Grid */}
            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                {flows.map((flow, i) => (
                    <motion.div
                        key={flow.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group/flow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-white">{flow.asset}</span>
                                <span className={`text-[7px] px-2 py-0.5 rounded-full font-black uppercase ${
                                    flow.type.includes('LONG') ? 'bg-emerald-500/10 text-emerald-400' :
                                    flow.type.includes('SHORT') ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'
                                }`}>
                                    {flow.type}
                                </span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono">{flow.volume}</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${flow.conviction * 100}%` }}
                                    className={`h-full ${
                                        flow.impact === 'HIGH' ? 'bg-indigo-500 shadow-[0_0_10px_#6366f1]' : 'bg-slate-600'
                                    }`}
                                />
                            </div>
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                                impact_{flow.impact}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Systematic Edge Metrics */}
            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 flex flex-col gap-1">
                    <span className="text-[7px] text-slate-500 uppercase font-black">Market Inefficiency Score</span>
                    <span className="text-lg font-black text-white">42.8%</span>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex flex-col gap-1">
                    <span className="text-[7px] text-slate-500 uppercase font-black">Alpha Capture Potential</span>
                    <span className="text-lg font-black text-emerald-400">+1.24%</span>
                </div>
            </div>

            {/* Bottom Aesthetic */}
            <div className="absolute bottom-4 left-6 right-6 opacity-[0.05] pointer-events-none">
                <div className="h-[1px] bg-indigo-500 w-full animate-pulse" />
            </div>
        </div>
    );
}
