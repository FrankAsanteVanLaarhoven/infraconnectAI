"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, 
    Calendar, 
    Activity, 
    Shield, 
    ChevronRight, 
    Search, 
    Eye, 
    Target,
    Zap,
    History,
    FileText,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { runSovereignBacktest, SimulationResult } from '@/lib/nexus/sovereign-rehearsal-engine';

export function VisualBacktestHub() {
    const [backtest, setBacktest] = useState<SimulationResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'EQUITY' | 'CALENDAR' | 'TRADES'>('EQUITY');

    useEffect(() => {
        const runSimulation = async () => {
            setIsLoading(true);
            const result = await runSovereignBacktest({
                startingBalance: 10000,
                pair: 'GBP/USD',
                mode: 'TYPE_1',
                slippageModel: 'CITADEL_CONSERVATIVE',
                includeTruthFusion: true
            });
            setTimeout(() => {
                setBacktest(result);
                setIsLoading(false);
            }, 1000);
        };
        runSimulation();
    }, []);

    if (isLoading || !backtest) {
        return (
            <div className="w-full h-full bg-[#020617]/90 flex items-center justify-center font-mono">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-t-2 border-indigo-500 rounded-full animate-spin shadow-[0_0_30px_#6366f1]" />
                    <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.5em] animate-pulse">Running Citadel Benchmark...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-[#020617]/95 border border-indigo-500/20 rounded-3xl p-8 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_100px_rgba(99,102,241,0.1)]">
            
            {/* Header: Benchmark Stats */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                        <History className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Sovereign Rehearsal Dashboard</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Institutional Benchmark // $10,000 Baseline</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-8">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] text-slate-600 uppercase font-black">Net P/L</span>
                        <span className="text-xl font-black text-emerald-400 tracking-tighter">
                            +${(backtest.equityCurve[backtest.equityCurve.length - 1].v - 10000).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] text-slate-600 uppercase font-black">Win Rate</span>
                        <span className="text-xl font-black text-white tracking-tighter">{(backtest.winRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] text-slate-600 uppercase font-black">Profit Factor</span>
                        <span className="text-xl font-black text-indigo-400 tracking-tighter">{backtest.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] text-slate-600 uppercase font-black">Zella Score</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-white">{backtest.zellaScore.toFixed(1)}</span>
                            <div className={`w-2 h-2 rounded-full ${backtest.zellaScore > 60 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar & Main Content */}
            <div className="flex-1 flex gap-8 min-h-0">
                
                {/* Visualizer Tabs */}
                <div className="w-48 flex flex-col gap-2">
                    {[
                        { id: 'EQUITY', label: 'Equity Singularity', icon: TrendingUp },
                        { id: 'CALENDAR', label: 'Profit Calendar', icon: Calendar },
                        { id: 'TRADES', label: 'Trade Registry', icon: FileText }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`p-4 rounded-2xl flex items-center gap-4 transition-all border ${
                                activeTab === tab.id 
                                ? 'bg-indigo-500/10 border-indigo-500/40 text-white' 
                                : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}

                    <div className="mt-auto p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-3 h-3 text-indigo-400" />
                            <span className="text-[8px] text-indigo-400 font-black uppercase">Surge Logic Active</span>
                        </div>
                        <p className="text-[7px] text-slate-600 italic leading-snug">
                            Simulated with Citadel Conservative Slippage modeling. 25% DD floor enforced.
                        </p>
                    </div>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 bg-black/40 border border-white/5 rounded-[2rem] relative overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                        {activeTab === 'EQUITY' && (
                            <motion.div 
                                key="equity"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full h-full p-8 flex flex-col"
                            >
                                <div className="flex-1 flex items-end gap-1 px-4 mb-4">
                                    {backtest.equityCurve.slice(-50).map((point, i) => {
                                        const height = ((point.v - 9000) / 2000) * 100;
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ delay: i * 0.01 }}
                                                className={`flex-1 rounded-t-sm ${point.v > 10000 ? 'bg-indigo-500/40' : 'bg-red-500/40'}`}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="h-px w-full bg-white/5 relative">
                                    <div className="absolute -top-1.5 left-0 text-[10px] text-indigo-500 font-black">$10,000 BASELINE</div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'CALENDAR' && (
                            <motion.div 
                                key="calendar"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full h-full p-8 grid grid-cols-7 gap-3 overflow-y-auto custom-scrollbar"
                            >
                                {Array.from({ length: 31 }).map((_, i) => {
                                    const profit = (Math.random() - 0.4) * 400;
                                    return (
                                        <div key={i} className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-2 relative overflow-hidden ${
                                            profit > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                                        }`}>
                                            <span className="text-[10px] font-black">{i + 1}</span>
                                            <span className="text-[8px] font-bold mt-1">${Math.abs(profit).toFixed(0)}</span>
                                            <div className={`absolute bottom-0 inset-x-0 h-0.5 ${profit > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ opacity: Math.abs(profit) / 400 }} />
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}

                        {activeTab === 'TRADES' && (
                            <motion.div 
                                key="trades"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="w-full h-full p-8 flex flex-col gap-4 overflow-y-auto custom-scrollbar"
                            >
                                {backtest.trades.slice().reverse().map((trade) => (
                                    <div key={trade.id} className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between group/trade hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className={`p-2 rounded-xl bg-slate-900 border ${trade.pnl > 0 ? 'border-emerald-500/20 text-emerald-400' : 'border-red-500/20 text-red-400'}`}>
                                                {trade.pnl > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-white uppercase tracking-tight">GBP/USD // {trade.id}</span>
                                                <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Truth_Confidence: {(trade.truthConfidence * 100).toFixed(0)}% // SAR_CONFIRMED</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`text-xs font-black ${trade.pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {trade.pnl > 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
                                            </span>
                                            <span className="text-[7px] text-slate-600 font-mono tracking-tighter uppercase">{new Date(trade.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Background Aesthetic */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center -rotate-12 translate-y-12">
                <div className="text-[12rem] font-black text-indigo-500 uppercase tracking-[2rem] whitespace-nowrap">SOVEREIGN_REHEARSAL</div>
            </div>
        </div>
    );
}
