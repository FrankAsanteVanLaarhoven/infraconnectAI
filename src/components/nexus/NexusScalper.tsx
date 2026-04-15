"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, 
    Target, 
    TrendingUp, 
    TrendingDown, 
    Clock, 
    ShieldAlert, 
    ArrowRightLeft,
    Activity,
    BarChart3,
    Terminal,
    Eye,
    Crosshair
} from 'lucide-react';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';

// --- Shared Assets ---

function TechnicalBadge({ children, variant = 'cyan' }: { children: React.ReactNode; variant?: 'cyan' | 'amber' | 'emerald' | 'red' }) {
    const variants = {
        cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5',
        amber: 'border-amber-500/30 text-amber-500 bg-amber-500/5',
        emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
        red: 'border-red-500/30 text-red-500 bg-red-500/5',
    };
    return (
        <span className={cn("px-2 py-0.5 rounded text-[7px] font-black tracking-widest border uppercase backdrop-blur-md whitespace-nowrap", variants[variant])}>
            {children}
        </span>
    );
}

// --- Main component ---

export function NexusScalper() {
    const [currentWin, setCurrentWin] = useState(42);
    const [isGoldenWindow, setIsGoldenWindow] = useState(false);
    const [telemetryStamp, setTelemetryStamp] = useState('SYNC_LOCKED');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const hours = now.getUTCHours();
            // London/NY Overlap: 13:00 - 16:00 UTC
            setIsGoldenWindow(hours >= 13 && hours <= 16);
            setTelemetryStamp(`TRUTH_${Math.floor(Math.random() * 9000) + 1000}`);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const picks = [
        { ticker: 'NVDA', type: 'LONG_SWEEP', conf: 0.98, target: '+2.4%', stake: 100, leverage: 30, expert: 'VELEZ' },
        { ticker: 'TSLA', type: 'FLASH_RECOVERY', conf: 0.92, target: '+1.8%', stake: 50, leverage: 50, expert: 'MARCI' },
        { ticker: 'SOL/USD', type: 'LIQUIDITY_VOID', conf: 0.96, target: '+4.2%', stake: 80, leverage: 20, expert: 'SCALPER' },
        { ticker: 'GBP/USD', type: 'REBALANCING', conf: 0.88, target: '+0.4%', stake: 100, leverage: 30, expert: 'SINGULARITY' }
    ];

    return (
        <GlassPanel 
            glowStrong 
            scanline 
            padding="none" 
            className="w-full h-full flex flex-col font-mono relative overflow-hidden group select-none shadow-[0_0_100px_rgba(34,211,238,0.05)] bg-black/40"
        >
            {/* 1. CINEMATIC HEADER */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/20 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                        <Zap className="w-6 h-6 text-cyan-400 group-hover:animate-pulse transition-all duration-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Nexus Scalper Hub</h2>
                            <TechnicalBadge variant="cyan">High-Primacy Extraction</TechnicalBadge>
                        </div>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1.5 flex items-center gap-2">
                            Strategy Fusion // <span className="text-cyan-500/60 font-bold underline underline-offset-4 decoration-cyan-500/20">Velez + Marci Active</span>
                        </p>
                    </div>
                </div>

                <div className={cn(
                    "px-5 py-2.5 rounded-xl border flex items-center gap-4 transition-all duration-700 backdrop-blur-3xl",
                    isGoldenWindow 
                        ? 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
                        : 'bg-black/40 border-white/5'
                )}>
                    <div className="relative">
                        <Clock className={cn("w-4 h-4", isGoldenWindow ? 'text-emerald-400 animate-spin-slow' : 'text-slate-600')} />
                        {isGoldenWindow && <div className="absolute inset-0 bg-emerald-400/20 blur-md rounded-full" />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-[0.2em] mb-0.5">Tactical Window</span>
                        <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none", isGoldenWindow ? 'text-emerald-400' : 'text-slate-500')}>
                            {isGoldenWindow ? 'Golden_Overlap_Active' : 'Idle_System_Monitor'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. COMPENDIUM DATA GRID */}
            <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 bg-black/5">
                
                {/* Left: Alpha Extraction Metrics */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <GlassCard glow className="p-8 border-cyan-500/20 bg-cyan-500/[0.02] flex flex-col justify-between h-[340px]">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                                <span className="text-[9px] text-slate-600 uppercase font-black tracking-[0.3em] bg-slate-900 px-2 py-0.5 rounded w-fit">Extraction Progress</span>
                                <span className="text-[11px] text-cyan-400 font-bold tracking-widest mt-1">Sovereign_Alpha_Captured</span>
                            </div>
                            <BarChart3 className="w-5 h-5 text-cyan-500/40" />
                        </div>
                        
                        <div className="relative w-48 h-48 self-center flex items-center justify-center">
                            {/* Orbital Progress */}
                            <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                                <circle cx="96" cy="96" r="80" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                                <motion.circle 
                                    cx="96" cy="96" r="80" 
                                    fill="transparent" 
                                    stroke="#22d3ee" 
                                    strokeWidth="6" 
                                    strokeDasharray="502"
                                    initial={{ strokeDashoffset: 502 }}
                                    animate={{ strokeDashoffset: 502 - (502 * (currentWin / 100)) }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center gap-1">
                                <span className="text-4xl font-black text-white tracking-tighter tabular-nums">£{currentWin}</span>
                                <span className="text-[8px] text-cyan-500 font-black uppercase tracking-[0.4em]">Current_P_L</span>
                                <div className="mt-2 text-[7px] text-slate-700 font-bold uppercase tracking-widest">Goal: £100.00</div>
                            </div>
                            
                            {/* Scanning Pulse */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="w-full h-full border border-dashed border-cyan-500/10 rounded-full"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pb-1 border-t border-white/5 pt-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Leverage Capacity</span>
                                <span className="text-xs font-black text-white uppercase tracking-tighter">30X // 50X SOTA</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Active Units</span>
                                <div className="flex gap-1 items-end h-3">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={cn("w-1 rounded-t-sm transition-all", i < 4 ? 'h-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]' : 'h-1/3 bg-slate-800')} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Operational Alert */}
                    <div className="flex-1 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex items-center gap-5 relative overflow-hidden group/alert">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/[0.03] to-amber-500/0 -translate-x-full group-hover/alert:translate-x-full transition-transform duration-1000" />
                        <div className="p-3 bg-amber-400/10 rounded-xl border border-amber-500/30">
                            <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] text-amber-500 font-black uppercase tracking-[0.3em]">Neural Verdict Engine</span>
                            <p className="text-[10px] text-slate-200 font-black uppercase italic leading-tight">
                                ULTIMATE_LONG confirmed in GBP/USD via SAR Ground Truth
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Signal Registry */}
                <div className="lg:col-span-7 flex flex-col gap-5 min-h-0">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-300 uppercase font-black tracking-[0.3em] flex items-center gap-3">
                            <Crosshair className="w-4 h-4 text-cyan-400" />
                            Elite Extraction Registry
                        </span>
                        <div className="flex items-center gap-3">
                            <span className="text-[8px] text-cyan-500/60 font-black uppercase tracking-widest">Matrix_Validation_Active</span>
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee] animate-pulse" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-3">
                        {picks.map((pick, i) => (
                            <motion.div
                                key={pick.ticker}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <GlassCard className="p-5 border-white/5 bg-white/[0.02] flex items-center justify-between hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] group transition-all duration-300 overflow-hidden">
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className={cn(
                                            "p-2.5 rounded-xl border transition-all duration-500 group-hover:bg-cyan-500 group-hover:text-black",
                                            pick.type.includes('LONG') || pick.type.includes('RECOVERY') 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                : 'bg-cyan-500/5 border-cyan-500/20 text-cyan-500'
                                        )}>
                                            <Target className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[13px] font-black text-white tracking-widest uppercase">{pick.ticker}</span>
                                                <TechnicalBadge variant="amber">{pick.expert}</TechnicalBadge>
                                            </div>
                                            <span className="text-[9px] text-slate-500 group-hover:text-slate-300 font-bold uppercase tracking-widest transition-colors">{pick.type.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-10 relative z-10">
                                        <div className="flex flex-col items-end gap-1.5">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[12px] font-black text-cyan-400 tracking-tighter tabular-nums">{pick.target}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[8px] font-mono text-slate-700 group-hover:text-cyan-600 transition-colors uppercase">
                                                <Eye className="w-2.5 h-2.5" /> CONF_{pick.conf * 100}%
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => {
                                                const setup = `TICKER: ${pick.ticker}\nTYPE: ${pick.type}\nSTAKE: $${pick.stake}\nLEVERAGE: x${pick.leverage}\nEXIT_TARGET: ${pick.target}`;
                                                navigator.clipboard.writeText(setup);
                                            }}
                                            className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl hover:bg-cyan-500 hover:text-black hover:scale-105 transition-all active:scale-95"
                                        >
                                            <ArrowRightLeft className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    {/* Sub-surface scanline */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/[0.02] to-cyan-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                    
                    <button className="w-full bg-cyan-500 text-black font-black uppercase py-4 rounded-xl text-[10px] tracking-[0.3em] shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:bg-cyan-400 hover:scale-[1.01] active:scale-[0.98] transition-all">
                        Execute all pending extractions
                    </button>
                </div>
            </div>

            {/* 3. HARDWARE TELEMETRY FOOTER */}
            <div className="h-10 border-t border-white/5 bg-black/40 flex items-center justify-between px-8 relative z-10">
                <div className="flex items-center gap-4 text-[8px] text-slate-600 font-black uppercase tracking-widest">
                   <div className="flex items-center gap-2">
                       <Terminal className="w-3 h-3" /> System_ID: SCALP_X88
                   </div>
                   <div className="w-1 h-1 rounded-full bg-slate-800" />
                   <span>Security_Layer: LEVEL_9_ENCRYPT</span>
                </div>
                <div className="text-[9px] text-cyan-500/60 font-mono tracking-[1em] select-none">
                    {telemetryStamp}
                </div>
                <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-widest">
                    <span className="text-slate-600">Sync_Status:</span>
                    <span className="text-cyan-500">Synchronized</span>
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
            `}</style>
        </GlassPanel>
    );
}
