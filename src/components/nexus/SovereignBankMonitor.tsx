"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, 
    Landmark, 
    TrendingUp, 
    TrendingDown, 
    ShieldCheck, 
    Activity, 
    Globe, 
    Zap,
    Lock
} from 'lucide-react';

export function SovereignBankMonitor() {
    const [banks, setBanks] = useState([
        { id: 1, name: 'FED_RESERVE', rate: '5.25%', bias: 'HAWKISH', liquidity: 'CRITICAL', status: 'MONITORED' },
        { id: 2, name: 'ECB_CENTRAL', rate: '4.00%', bias: 'DOVISH', liquidity: 'STABLE', status: 'SYNCHRONIZED' },
        { id: 3, name: 'BOE_STERLING', rate: '5.00%', bias: 'NEUTRAL', liquidity: 'TIGHT', status: 'OBSERVING' },
        { id: 4, name: 'BOJ_YEN', rate: '0.10%', bias: 'PIVOTING', liquidity: 'LIQUID', status: 'VOLATILE' }
    ]);

    return (
        <div className="w-full h-full bg-[#020617]/80 backdrop-blur-[40px] border border-blue-500/20 rounded-3xl p-6 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_60px_rgba(59,130,246,0.05)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                        <Landmark className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Sovereign Bank Monitor</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Interbank Liquidity // Policy Mirrors</p>
                    </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-blue-500/40" />
            </div>

            {/* Bank Grid */}
            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {banks.map((bank, i) => (
                    <motion.div
                        key={bank.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col gap-4 group/bank hover:border-blue-500/30 transition-all"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-white uppercase tracking-tighter">{bank.name}</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                    bank.bias === 'HAWKISH' ? 'bg-red-500/10 text-red-400' :
                                    bank.bias === 'DOVISH' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                                }`}>{bank.bias}</span>
                                <span className="text-[10px] text-white font-mono">{bank.rate}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[7px] text-slate-500 uppercase font-black tracking-widest">
                            <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-blue-400" />
                                <span>Liquidity_{bank.liquidity}</span>
                            </div>
                            <span>{bank.status}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Global Yield Curve Aesthetic */}
            <div className="mt-6 h-12 relative opacity-20">
                <div className="absolute inset-0 flex items-end gap-[2px]">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ height: ['20%', '80%', '20%'] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
                            className="flex-1 bg-blue-500/40 rounded-t-sm"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
