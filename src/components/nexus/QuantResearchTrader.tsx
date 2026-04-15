"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, 
    TrendingDown, 
    Zap, 
    Target, 
    Activity, 
    Layers, 
    BarChart3, 
    History, 
    ShieldCheck, 
    ArrowRightLeft,
    Box,
    Globe,
    ZapOff,
    PieChart
} from 'lucide-react';
import { calculateDailyAlpha, TradeSignal, getInstitutionalFlow, estimateTradeOutcome } from '@/lib/nexus/quant-strategy-engine';
import { fuseMarketSignals, FusionSignal } from '@/lib/nexus/alpha-fusion-engine';
import { GLOBAL_REGISTRY } from '@/lib/nexus/universal-crawler';

export function QuantResearchTrader() {
    const [stake, setStake] = useState(10000);
    const [activeTrades, setActiveTrades] = useState<TradeSignal[]>([]);
    const [fusionSignal, setFusionSignal] = useState<FusionSignal | null>(null);
    const [flowData, setFlowData] = useState(getInstitutionalFlow(142.50));
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        setActiveTrades(calculateDailyAlpha(stake));
        
        // Final Fusion Logic Integration
        const fusion = fuseMarketSignals(
            GLOBAL_REGISTRY[0], // NVIDIA Target
            0.65, // Yahoo Sentiment
            0.88, // Institutional Flow
            true  // SAR Discovery Prime
        );
        setFusionSignal(fusion);

        const interval = setInterval(() => {
            setFlowData(getInstitutionalFlow(142.50));
            setIsSyncing(true);
            setTimeout(() => setIsSyncing(false), 800);
        }, 5000);

        return () => clearInterval(interval);
    }, [stake]);

    return (
        <div className="w-full h-full bg-[#020617] border border-emerald-500/20 rounded-3xl p-8 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_80px_rgba(16,185,129,0.05)]">
            {/* Fusion Pulse Overlay */}
            <div className="absolute top-8 right-8 z-20 flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Neural Fusion Pulse</span>
                    <div className="h-1 w-32 bg-slate-900 rounded-full mt-1 overflow-hidden">
                        <motion.div 
                            animate={{ width: `${(fusionSignal?.confidence || 0) * 100}%` }}
                            className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                        />
                    </div>
                </div>
                <div className="bg-black/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl flex items-center gap-3 backdrop-blur-md">
                    <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] text-white font-black uppercase">Latency: {fusionSignal?.latencyMs}ms</span>
                </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Quant Research Trader</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Sovereign Alpha Matrix // SOTA 2035</p>
                    </div>
                </div>

                <div className="flex gap-8 items-center text-right mr-44">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Alpha Conviction</span>
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                             <span className="text-xl font-black text-white tracking-tighter">
                                {fusionSignal?.convictionType} // {(fusionSignal?.confidence ? fusionSignal.confidence * 100 : 0).toFixed(1)}%
                             </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Trading Substrate */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 relative z-10">
                
                {/* Order Flow & Fusion Heatmap */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl relative overflow-hidden p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Alpha Fusion Heatmap // Unseen Discovery Stream</span>
                                <span className="text-[7px] text-cyan-500 font-bold uppercase mt-1">{fusionSignal?.rationale}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[8px] text-slate-500 font-black">
                                <Activity className={`w-3 h-3 ${isSyncing ? 'text-emerald-400' : ''}`} />
                                {isSyncing ? 'FUSING_SIGNAL_TRUTH' : 'IDLE_MONITORING'}
                            </div>
                        </div>

                        {/* Interactive Heatmap Visualization */}
                        <div className="flex-1 relative flex items-center justify-center">
                            <div className="absolute inset-0 opacity-[0.05]" 
                                 style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                            
                            <div className="w-full space-y-2">
                                {flowData.map((f, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, scaleX: 0 }}
                                        animate={{ opacity: 1, scaleX: 1 }}
                                        className="h-6 flex items-center gap-4 relative group/flow"
                                    >
                                        <span className="text-[8px] text-slate-600 font-mono w-16">${f.price.toFixed(2)}</span>
                                        <div className="flex-1 h-3 bg-slate-900 rounded-full overflow-hidden relative">
                                            <motion.div 
                                                style={{ width: `${f.intensity * 100}%` }}
                                                className={`h-full ${
                                                    f.type === 'ORDER_BLOCK' ? 'bg-indigo-500 shadow-[0_0_10px_#6366f1]' :
                                                    f.type === 'STOP_HUNT' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-emerald-500/40'
                                                }`}
                                            />
                                        </div>
                                        <span className={`text-[7px] font-black uppercase w-20 ${
                                            f.type === 'ORDER_BLOCK' ? 'text-indigo-400' :
                                            f.type === 'STOP_HUNT' ? 'text-red-400' : 'text-emerald-400/60'
                                        }`}>{f.type}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daily Recommendations Grid */}
                <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <span className="text-[9px] text-slate-600 uppercase font-black border-b border-white/5 pb-2">Fused Alpha Targets</span>

                    <div className="space-y-4">
                        {activeTrades.map((trade, i) => (
                            <motion.div 
                                key={trade.ticker}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 0.98 }}
                                className={`p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col gap-4 group/trade hover:border-emerald-500/20 transition-all cursor-pointer ${
                                    trade.ticker === fusionSignal?.ticker ? 'ring-1 ring-cyan-500/30 bg-cyan-500/5' : ''
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${trade.type === 'LONG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {trade.type === 'LONG' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        </div>
                                        <span className="text-xs font-black text-white uppercase">{trade.ticker}</span>
                                    </div>
                                    <div className="text-[8px] font-black text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded">
                                        {(trade.conviction * 100).toFixed(1)}% CONVICTION
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] text-slate-600 uppercase font-black">Entry</span>
                                        <span className="text-[10px] text-white font-mono">${trade.entry.toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] text-slate-600 uppercase font-black">Target</span>
                                        <span className="text-[10px] text-emerald-400 font-mono">${trade.target.toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] text-slate-600 uppercase font-black">Collapse</span>
                                        <span className="text-[10px] text-cyan-400 font-mono">+${estimateTradeOutcome(stake, trade).toFixed(0)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {fusionSignal?.ticker && (
                        <div className="mt-auto p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-center gap-4">
                            <ArrowRightLeft className="w-6 h-6 text-indigo-400" />
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-500 uppercase font-black">Trade Execution Recommendation</span>
                                <span className="text-[9px] text-white font-black uppercase">Wait for 4H Liquidity Sweep @ ${(fusionSignal.entry ? fusionSignal.entry * 0.99 : 142).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Background Aesthetics */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="text-[10px] whitespace-nowrap text-emerald-500 font-mono tracking-[1.5em]">
                        INSTITUTIONAL_ALPHA_EXTRACTOR_QUANT_STRATEGY_
                    </div>
                ))}
            </div>
        </div>
    );
}
