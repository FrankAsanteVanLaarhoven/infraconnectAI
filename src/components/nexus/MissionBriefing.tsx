"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, 
    Shield, 
    Zap, 
    Target, 
    Cpu, 
    DollarSign,
    ChevronRight,
    Search,
    AlertCircle,
    Crosshair,
    Play,
    Terminal,
    Eye,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';

// --- Shared Assets ---

function TechnicalBadge({ children, variant = 'cyan' }: { children: React.ReactNode; variant?: 'cyan' | 'amber' | 'emerald' | 'red' }) {
    const variants = {
        cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5',
        amber: 'border-amber-500/30 text-amber-500 bg-amber-500/5',
        emerald: 'border-slate-700 text-slate-300 bg-slate-800',
        red: 'border-red-500/30 text-red-500 bg-red-500/5',
    };
    return (
        <span className={cn("px-2.5 py-1 rounded text-[8px] font-black tracking-widest border uppercase backdrop-blur-md", variants[variant])}>
            {children}
        </span>
    );
}

// --- Main component ---

export function MissionBriefing() {
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [progress, setProgress] = useState(0);
    const [pulseStamp, setPulseStamp] = useState('14:52:01.002');

    const STOCK_PICK = {
        ticker: 'AAOI',
        name: 'Applied Optoelectronics',
        class: 'AI SUBSTRATE // OPTICAL INTERCONNECT',
        conviction: 94.2,
        target: '$125.00',
        current: '$82.45',
        upside: '+51.6%',
        rationale: [
            'Dominant provider of 800G/1.6T transceivers for 2026 data centers.',
            'Microsoft/Meta infrastructure spend accelerating in Q2 2026.',
            'Production shift to automated AI-aligned manufacturing hubs.',
            'Emergent convergence in 92% of Prediction Swarm simulations.'
        ]
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setIsAnalyzing(false);
                    return 100;
                }
                return prev + 1;
            });
        }, 24);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setPulseStamp(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`);
        }, 80);
        return () => clearInterval(interval);
    }, []);

    return (
        <GlassPanel 
            glowStrong 
            scanline 
            padding="none" 
            className="w-full h-full flex flex-col font-mono relative overflow-hidden group select-none"
        >
            <AnimatePresence mode="wait">
                {isAnalyzing ? (
                    <motion.div 
                        key="analyzing"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex-1 flex flex-col items-center justify-center gap-8 bg-black/5"
                    >
                        <div className="relative">
                            {/* Orbital HUD Elements */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="w-48 h-48 border-2 border-cyan-500/5 border-t-cyan-500/20 rounded-sm"
                            />
                            <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-2 border border-dashed border-cyan-500/10 rounded-sm"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Search className="w-10 h-10 text-cyan-400" />
                            </div>
                            
                            {/* Tactical Crosshair */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                                <div className="w-full h-px bg-cyan-500/10" />
                                <div className="h-full w-px bg-cyan-500/10" />
                            </div>
                        </div>
                        
                        <div className="text-center space-y-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.6em]">Neural Predictive Swarm Active</h3>
                            <div className="flex flex-col gap-2 scale-90">
                                <div className="w-64 h-1 bg-white/5 rounded-sm relative overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-cyan-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">
                                    Simulating Multi-Reality Convergence // {progress}% Complete
                                </p>
                            </div>
                        </div>
                        
                        {/* Technical Boot Params */}
                        <div className="absolute bottom-12 left-12 grid grid-cols-2 gap-x-12 gap-y-2 opacity-30 text-[7px] text-slate-500 font-black uppercase tracking-widest">
                            <span>Vector_Ingest: ACTIVE</span>
                            <span>Latency_Sync: 0.2ms</span>
                            <span>Node_Cluster_X88: LOCKED</span>
                            <span>Entropy_Delta: 0.002</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="result"
                        initial={{ opacity: 0, y: 15 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col p-8 gap-8"
                    >
                        {/* Cinematic Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-sm">
                                    <Target className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Strategic Investment Briefing</h2>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[8px] text-cyan-500 uppercase font-bold tracking-widest underline underline-offset-4 decoration-cyan-500/30">Prediction Swarm Calculated</span>
                                        <div className="w-1 h-1 rounded-sm bg-slate-700" />
                                        <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Neural Standard 2035 // 0.99A</span>
                                    </div>
                                </div>
                            </div>
                            <TechnicalBadge variant="emerald">Singularity-Grade Pick</TechnicalBadge>
                        </div>

                        {/* Central Intelligence Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
                            {/* Left: Financial Synthesis */}
                            <div className="lg:col-span-7 flex flex-col gap-6">
                                <GlassCard glow className="flex-1 p-8 border-cyan-500/20 bg-cyan-500/[0.02] flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest bg-slate-500/10 px-2 py-0.5 rounded">Primary Vector</span>
                                            <div className="flex items-baseline gap-4 mt-2">
                                                <span className="text-6xl font-black text-white tracking-tighter drop-">{STOCK_PICK.ticker}</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] text-cyan-400 font-extrabold uppercase tracking-widest leading-none">{STOCK_PICK.name}</span>
                                                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter mt-1">{STOCK_PICK.class}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="p-3 bg-slate-800 border border-slate-700 rounded-sm mb-3">
                                                <TrendingUp className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <span className="text-3xl font-black text-slate-300 tracking-tighter">{STOCK_PICK.upside}</span>
                                            <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em] mt-1">Projected Delta</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-12 pt-10 border-t border-white/5 mt-8">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                                <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest uppercase">Target Price</span>
                                                <span className="text-2xl font-black text-white">{STOCK_PICK.target}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[9px] text-slate-600 uppercase font-bold italic tracking-widest">
                                                <span className="text-cyan-500/50">→</span> Current Marker: {STOCK_PICK.current}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                                <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest uppercase">Conviction</span>
                                                <span className="text-2xl font-black text-cyan-400">{STOCK_PICK.conviction}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-white/5 rounded-sm overflow-hidden">
                                                <motion.div 
                                                    className="h-full bg-cyan-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${STOCK_PICK.conviction}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>

                            {/* Right: Swarm Rationale */}
                            <div className="lg:col-span-5 flex flex-col gap-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-slate-300 uppercase font-black tracking-[0.2em] flex items-center gap-3">
                                        <Cpu className="w-4 h-4 text-cyan-400" />
                                        Prediction Swarm Rationale
                                    </span>
                                </div>
                                <div className="space-y-4 flex-1">
                                    {STOCK_PICK.rationale.map((line, i) => (
                                        <GlassCard key={i} className="p-4 bg-white/5 border border-white/5 hover:border-cyan-500/20 group/line flex items-start gap-4 transition-all">
                                            <div className="mt-1 p-1 bg-cyan-900/40 rounded-sm group-hover/line:bg-cyan-500 transition-colors">
                                                <ChevronRight className="w-3 h-3 text-cyan-400 group-hover/line:text-black" />
                                            </div>
                                            <p className="text-[10px] text-slate-300 leading-relaxed font-mono italic group-hover/line:text-white transition-colors">{line}</p>
                                        </GlassCard>
                                    ))}
                                </div>
                                
                                <Button className="w-full bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 shadow-lg text-[9px] font-black uppercase py-7 tracking-widest group/more">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-3.5 h-3.5 text-cyan-500 group-hover/more:scale-110 transition-transform" />
                                        Request deep-dive telemetry
                                    </div>
                                </Button>
                            </div>
                        </div>

                        {/* Tactical Action Bar */}
                        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between z-10">
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5 text-slate-600" />
                                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Strategic Integrity</span>
                                    </div>
                                    <span className="text-[9px] text-cyan-500/80 font-mono tracking-widest uppercase">Verified // Risk_Neutral</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Liquidity Rating</span>
                                    </div>
                                    <span className="text-[9px] text-amber-500 font-mono tracking-widest uppercase">Class A+ // Sovereign</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <span className="text-[10px] text-slate-700 font-mono tracking-widest font-bold uppercase">{pulseStamp}</span>
                                <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-[10px] py-7 px-12 rounded-sm tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    Commit to Mission Portfolio
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Neural Background Aesthetic */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0 flex flex-col overflow-hidden">
                {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className={cn(
                        "text-[9px] whitespace-nowrap text-cyan-500 font-mono tracking-[1.5em] py-0.5",
                        i % 2 === 0 ? "animate-[marquee_90s_linear_infinite]" : "animate-[marquee_90s_linear_infinite_reverse]"
                    )}>
                        {Array.from({ length: 20 }).map(() => "SIMULATING_REALITY_CONVERGANCE_DELTA_X99_").join("")}
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>

            <div className="absolute top-2 right-6 text-[8px] text-slate-800 uppercase font-black tracking-[0.8em] select-none z-0">
                SIM_REALITY_ID_X99_ALPHA
            </div>
        </GlassPanel>
    );
}
