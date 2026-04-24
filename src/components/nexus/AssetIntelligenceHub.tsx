"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Target, 
    Zap, 
    Activity, 
    Database,
    Cpu,
    TrendingUp,
    Shield,
    Globe,
    Layers,
    BarChart3,
    ArrowUpRight,
    Crosshair
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';

// --- Types ---
interface Portfolio {
    id: string;
    name: string;
    valuation: string;
    status: string;
    trend: 'UP' | 'DOWN' | 'SIDE';
    type: 'ENERGY' | 'LOGISTICS' | 'TECH' | 'ORBITAL' | 'REAL_ESTATE';
    confidence: number;
}

// --- Sub-components ---

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'warning' | 'error' | 'success' }) {
    const variants = {
        default: 'border-slate-500/30 text-slate-400 bg-slate-500/5',
        warning: 'border-amber-500/30 text-amber-500 bg-amber-500/5',
        error: 'border-red-500/30 text-red-500 bg-red-500/5',
        success: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5',
    };
    return (
        <span className={cn("px-2 py-0.5 rounded text-[8px] font-black tracking-widest border uppercase", variants[variant])}>
            {children}
        </span>
    );
}

// --- Main component ---

export function AssetIntelligenceHub() {
    const [isScanning, setIsScanning] = useState(false);
    const [activePortfolio, setActivePortfolio] = useState<Portfolio | null>(null);
    const [pulseStamp, setPulseStamp] = useState('14:42:01.002');

    const portfolios: Portfolio[] = [
        { id: 'p1', name: 'NORTH_SEA_BRENT', valuation: '$4.2B', status: 'ACCUMULATING', trend: 'UP', type: 'ENERGY', confidence: 94 },
        { id: 'p2', name: 'PERMIAN_LOGISTICS', valuation: '$1.8B', status: 'CONSOLIDATING', trend: 'SIDE', type: 'LOGISTICS', confidence: 88 },
        { id: 'p3', name: 'NORDIC_CHIPS', valuation: '$12.4B', status: 'SPOOF_DETECTED', trend: 'DOWN', type: 'TECH', confidence: 32 },
        { id: 'p4', name: 'SPACEX_BACKDOOR', valuation: '$1.75T', status: 'PRE_IPO_SIGNAL', trend: 'UP', type: 'ORBITAL', confidence: 99 }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setPulseStamp(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`);
        }, 80);
        return () => clearInterval(interval);
    }, []);

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 2800);
    };

    return (
        <GlassPanel 
            glow 
            scanline 
            padding="none" 
            className="w-full h-full flex flex-col font-mono relative overflow-hidden group select-none"
        >
            {/* Header Layer */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-md z-30">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-sm">
                        <Target className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.5em]">Asset Intelligence Hub</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] text-cyan-500/70 uppercase font-bold tracking-widest">Industrial Ground Truth</span>
                            <div className="w-1 h-1 rounded-sm bg-cyan-500/40" />
                            <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Core</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Signal Integrity</span>
                        <span className="text-[9px] text-cyan-400 font-mono font-bold tracking-widest">ACTIVE // 99.8%</span>
                    </div>
                    <Button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className={cn(
                            "relative overflow-hidden transition-all duration-500 group/btn",
                            "bg-black/40 hover:bg-cyan-500/10 text-white text-[9px] font-black uppercase px-6 py-2 rounded-sm border border-cyan-500/20 shadow-lg",
                            isScanning ? "border-amber-500/40" : "hover:border-cyan-500/40 hover:shadow-cyan-500/10"
                        )}
                    >
                        <div className="flex items-center gap-2 relative z-10">
                            <Crosshair className={cn("w-3 h-3", isScanning ? "animate-spin text-amber-500" : "text-cyan-400")} />
                            {isScanning ? 'Scrutinizing...' : 'Sovereign_Scan'}
                        </div>
                        {isScanning && (
                            <motion.div 
                                className="absolute inset-0 bg-amber-500/5"
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Workbench Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-black/10">
                {/* Left Sidebar: Asset Selection */}
                <div className="lg:col-span-4 border-r border-white/5 p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar bg-black/5">
                    <div className="flex items-center justify-between px-1 mb-1">
                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-[0.2em]">Target Portfolios</span>
                        <Database className="w-2.5 h-2.5 text-slate-600" />
                    </div>
                    {portfolios.map((p) => (
                        <GlassCard
                            key={p.id}
                            level={activePortfolio?.id === p.id ? 'L2' : 'L1'}
                            onClick={() => setActivePortfolio(p)}
                            glow={activePortfolio?.id === p.id}
                            className={cn(
                                "p-4 border group/card",
                                activePortfolio?.id === p.id 
                                    ? 'bg-cyan-500/[0.03] border-cyan-500/30' 
                                    : 'bg-transparent border-white/5 hover:border-white/10'
                            )}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className={cn(
                                    "text-[10px] font-black tracking-widest transition-colors",
                                    activePortfolio?.id === p.id ? "text-cyan-400" : "text-slate-300 group-hover/card:text-white"
                                )}>
                                    {p.name}
                                </span>
                                <Badge variant={p.trend === 'UP' ? 'success' : p.trend === 'DOWN' ? 'error' : 'default'}>
                                    {p.trend === 'UP' ? '+' : p.trend === 'DOWN' ? '−' : '≈'} {p.valuation}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="block text-[7px] text-slate-500 font-black uppercase tracking-widest">{p.type} Sector</span>
                                    <span className={cn(
                                        "text-[8px] font-black uppercase tracking-tighter",
                                        p.status === 'SPOOF_DETECTED' ? "text-red-500 " : "text-slate-400"
                                    )}>
                                        {p.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-[7px] text-slate-600 font-mono mb-1">CONF // {p.confidence}%</div>
                                    <div className="w-16 h-0.5 bg-white/5 rounded-sm overflow-hidden">
                                        <motion.div 
                                            className={cn("h-full", p.confidence > 80 ? "bg-cyan-500" : p.confidence > 50 ? "bg-amber-500" : "bg-red-500")}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${p.confidence}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Right Content View: Intelligence Breakdown */}
                <div className="lg:col-span-8 flex flex-col relative">
                    <AnimatePresence mode="wait">
                        {activePortfolio ? (
                            <motion.div 
                                key={activePortfolio.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 flex flex-col p-8"
                            >
                                {/* OSINT Overlay */}
                                {isScanning && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex flex-col items-center justify-center gap-5">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-sm border border-cyan-500/20 animate-[spin_4s_linear_infinite]" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-16 h-16 rounded-sm border border-cyan-500/40 animate-[spin_2s_linear_infinite_reverse]" />
                                            </div>
                                            <Search className="absolute inset-0 m-auto w-6 h-6 text-cyan-400" />
                                        </div>
                                        <span className="text-[9px] text-white font-black uppercase tracking-[0.6em]">Sovereign Cluster Ingestion...</span>
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-black text-white tracking-widest">{activePortfolio.name}</h3>
                                            <ArrowUpRight className="w-4 h-4 text-cyan-500" />
                                        </div>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">{activePortfolio.valuation} // Acquisition Target Vector</p>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-1.5">
                                        <div className="bg-cyan-500/5 border border-cyan-500/20 px-3 py-1.5 rounded flex items-center gap-2">
                                            <div className="w-1 h-1 bg-cyan-400 rounded-sm animate-ping" />
                                            <span className="text-[9px] text-cyan-400 font-bold font-mono tracking-widest uppercase">{pulseStamp}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                                    <GlassCard className="p-6 bg-white/[0.01] flex flex-col gap-5 border-white/5">
                                        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                                            <span className="text-[9px] text-white font-black uppercase tracking-widest">Tactical Thesis</span>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Thesis', val: 'Direct Telemetry Displacement' },
                                                { label: 'Edge', val: '70% OpEx Recalibration' },
                                                { label: 'Mechanism', val: 'Ceo-Direct Mirroring' },
                                                { label: 'Compliance', val: 'Methanol Audit System' }
                                            ].map((line, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-[7px] text-slate-500 uppercase font-black tracking-widest">
                                                        <span>{line.label}</span>
                                                        <span className="text-cyan-500/60">VALIDATED</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-300 font-mono italic leading-relaxed">
                                                        / {line.val}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                    
                                    <GlassCard className="p-6 bg-white/[0.01] flex flex-col gap-6 border-white/5">
                                        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                                            <Layers className="w-3.5 h-3.5 text-cyan-500" />
                                            <span className="text-[9px] text-white font-black uppercase tracking-widest">Network correlation</span>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            {activePortfolio.type === 'ORBITAL' ? (
                                                <div className="space-y-6">
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between text-[8px] text-slate-400 uppercase font-black">
                                                            <span>Target Exposure Score</span>
                                                            <span className="text-cyan-400">99.2%</span>
                                                        </div>
                                                        <div className="h-0.5 bg-white/5 rounded-sm relative">
                                                            <motion.div 
                                                                animate={{ width: '99.2%' }} 
                                                                className="h-full bg-cyan-500" 
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {['GOOGL_INDIRECT_STAKE', 'DXYZ_EXPOSURE', 'RKLB_PROXY'].map((node, i) => (
                                                            <div key={i} className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5">
                                                                <span className="text-[8px] text-slate-400 font-mono">NODE :: {node}</span>
                                                                <div className="w-1.5 h-1.5 rounded-sm bg-cyan-500/20 border border-cyan-500" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-[8px] text-slate-400 uppercase font-black">
                                                                <span>EIA Modeling Precision</span>
                                                                <span className="text-cyan-400">92%</span>
                                                            </div>
                                                            <div className="h-0.5 bg-white/5 rounded-sm overflow-hidden">
                                                                <motion.div animate={{ width: '92%' }} className="h-full bg-cyan-500" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-[8px] text-slate-400 uppercase font-black">
                                                                <span>Churn Predictor Correlation</span>
                                                                <span className="text-amber-500">74%</span>
                                                            </div>
                                                            <div className="h-0.5 bg-white/5 rounded-sm overflow-hidden">
                                                                <motion.div animate={{ width: '74%' }} className="h-full bg-amber-500" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <Button className="w-full mt-auto bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-black uppercase py-6 group/scan">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-3 h-3 text-cyan-500 group-hover/scan:rotate-12 transition-transform" />
                                                    Ingest Regional OSINT
                                                </div>
                                            </Button>
                                        </div>
                                    </GlassCard>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 gap-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-sm border border-slate-700 animate-ping" />
                                    <div className="absolute inset-0 m-auto w-12 h-12 bg-slate-800 rounded-sm flex items-center justify-center border border-slate-700">
                                        <Search className="w-5 h-5 text-slate-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Awaiting Target Selection</h3>
                                    <p className="text-[9px] text-slate-600 uppercase tracking-widest">Initialize Asset acquisition Link for Ingestion</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Data Bar */}
            <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between z-30">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-cyan-500 rounded-sm" />
                        <span className="text-[7px] text-slate-500 uppercase font-bold tracking-widest">System Signal: CRYPTO_SAFE</span>
                    </div>
                    <div className="w-px h-3 bg-white/5" />
                    <span className="text-[7px] text-slate-600 font-mono uppercase">NODE: ASSET_HUB_V4.1 // FRAGMENT_044</span>
                </div>
                <div className="flex items-center gap-3">
                     <span className="text-[7px] text-slate-600 uppercase font-black">Memory Overhead: 12%</span>
                     <BarChart3 className="w-3 h-3 text-slate-700" />
                </div>
            </div>

            {/* Background Aesthetic Data-Stream */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 flex flex-col overflow-hidden select-none">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className={cn(
                        "text-[8px] whitespace-nowrap text-cyan-500 font-mono tracking-[1em] py-0.5",
                        i % 2 === 0 ? "animate-[marquee_60s_linear_infinite]" : "animate-[marquee_60s_linear_infinite_reverse]"
                    )}>
                        {Array.from({ length: 15 }).map(() => "ASSET_ACQUISITION_TARGETING_MATRIX_").join("")}
                    </div>
                ))}
            </div>
            
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </GlassPanel>
    );
}
