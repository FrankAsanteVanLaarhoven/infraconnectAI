"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Radio, 
    Share2, 
    Zap, 
    Link2, 
    Activity, 
    Cpu, 
    Search, 
    Wifi, 
    Globe, 
    AlertCircle,
    Orbit,
    Network,
    Crosshair,
    Terminal,
    Eye,
    Signal,
    Radar
} from 'lucide-react';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';

// --- Shared Assets ---

interface CorporateSignal {
    id: string;
    label: string;
    strength: number; // 0 to 1
    type: 'HIRING_SPIKE' | 'PATENT_FILING' | 'MERGER_WHISPER' | 'DATA_ABERRATION';
    tags: string[];
    origin: { x: number, y: number };
}

// --- Main component ---

export function SignalIntelligenceLens() {
    const [signals] = useState<CorporateSignal[]>([
        { id: '1', label: 'NVIDIA Hsinchu Fab', strength: 0.92, type: 'HIRING_SPIKE', tags: ['GAI-ADAPTERS', '3NM-YIELD'], origin: { x: 700, y: 320 } },
        { id: '2', label: 'Bacton Terminal', strength: 0.85, type: 'DATA_ABERRATION', tags: ['FLOW-ANOMALY', 'THROUGHPUT-SYNC'], origin: { x: 220, y: 160 } },
        { id: '3', label: 'McKinsey Alpha Labs', strength: 0.64, type: 'PATENT_FILING', tags: ['AGENTIC-LLM', 'DECENTRALIZED-CDD'], origin: { x: 800, y: 580 } },
        { id: '4', label: 'Tesla Giga Berlin', strength: 0.78, type: 'HIRING_SPIKE', tags: ['OPTIMUS-ASSEMBLY', 'ACTUATOR-YIELD'], origin: { x: 420, y: 300 } },
    ]);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [scanCoord, setScanCoord] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setScanCoord({
                x: Math.floor(Math.random() * 1000),
                y: Math.floor(Math.random() * 1000)
            });
        }, 200);
        return () => clearInterval(interval);
    }, []);

    return (
        <GlassPanel 
            {...{glowStrong: true} as any} 
            scanline 
            padding="none" 
            className="w-full h-full flex flex-col font-mono relative overflow-hidden group select-none border-white/5 bg-black/40"
        >
            {/* 1. CINEMATIC HEADER */}
            <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 relative z-20 bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-none group-hover:scale-110 transition-transform duration-500">
                        <Radar className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-base font-black text-white uppercase tracking-[0.4em]">Signal Intelligence Lens</h2>
                            <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-[8px] text-cyan-500 font-black tracking-widest rounded">SYSTEM</span>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-2 flex items-center gap-2">
                             Global Surveillance // <span className="text-cyan-500/60">Scanning Sub-THz Frequencies</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-12 items-center text-right">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-slate-600 uppercase font-black tracking-[0.3em] flex items-center justify-end gap-2">
                            <Activity className="w-3 h-3" /> Pulsar Density
                        </span>
                        <span className="text-2xl font-black text-cyan-500 tracking-tighter tabular-nums drop- line-clamp-1">1,244<span className="text-slate-700 text-sm ml-1">/HR</span></span>
                    </div>
                    <div className="flex flex-col gap-1 pr-2">
                        <span className="text-[9px] text-slate-600 uppercase font-black tracking-[0.3em] flex items-center justify-end gap-2">
                           <Wifi className="w-3 h-3" /> Global Sync
                        </span>
                        <div className="flex items-center gap-3 justify-end">
                            <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
                            <span className="text-xl font-black text-white tracking-tighter uppercase whitespace-nowrap">NODE_09_ONLINE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MAIN TACTICAL VISUALIZER */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black/5">
                {/* Tactical Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
                
                {/* Surveillance Geometry */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 px-20 py-20">
                    <defs>
                        <radialGradient id="signalGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    
                    {/* Synchronized Intelligence Paths */}
                    <motion.path 
                        d="M 220,160 L 420,300 L 700,320 L 800,580" 
                        stroke="#22d3ee" strokeWidth="1" fill="none"
                        initial={{ pathLength: 0 }} 
                        animate={{ pathLength: 1 }} 
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    />
                    
                    {/* Lateral Intercept Lines */}
                    <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.2" />
                    <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.2" />
                </svg>

                {/* Tactical Signal Markers */}
                {signals.map((s) => (
                    <motion.div 
                        key={s.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ left: s.origin.x, top: s.origin.y }}
                        className="absolute group/signal cursor-crosshair pointer-events-auto z-10"
                        onClick={() => setActiveId(s.id)}
                    >
                        <div className="relative">
                            <GlassCard className="p-2 border-cyan-500/40 bg-cyan-900/20 rounded-sm relative z-10 hover:scale-110 transition-transform">
                                {s.type === 'HIRING_SPIKE' && <Zap className="w-4 h-4 text-cyan-400" />}
                                {s.type === 'DATA_ABERRATION' && <Activity className="w-4 h-4 text-amber-500" />}
                                {s.type === 'PATENT_FILING' && <Share2 className="w-4 h-4 text-cyan-500" />}
                            </GlassCard>
                            
                            {/* Industrial Level Tooltip */}
                            <div className="absolute top-1/2 left-full -translate-y-1/2 ml-4 w-60 opacity-0 group-hover/signal:opacity-100 transition-all duration-300 z-50 translate-x-4 group-hover/signal:translate-x-0">
                                <GlassCard className="p-5 border-cyan-500/30 shadow-2xl backdrop-blur-3xl bg-black/90">
                                     <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-wider">{s.label}</h4>
                                        <span className="text-[8px] text-cyan-500 font-black uppercase">{(s.strength * 100).toFixed(0)}% STRENGTH</span>
                                     </div>
                                     <div className="text-[9px] text-amber-500 font-bold uppercase tracking-widest border-l-2 border-amber-500 pl-3 mb-4">
                                        {s.type.replace('_', ' ')}
                                     </div>
                                     <div className="flex flex-wrap gap-2 mb-4">
                                         {s.tags.map(t => (
                                             <span key={t} className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-[7px] text-cyan-400 uppercase font-black rounded">{t}</span>
                                         ))}
                                     </div>
                                     <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                         <span className="text-[8px] text-slate-600 uppercase font-bold">Node_Vector</span>
                                         <span className="text-[8px] text-slate-400 font-mono tracking-tighter">[{s.origin.x}, {s.origin.y}]</span>
                                     </div>
                                </GlassCard>
                            </div>

                            {/* Neural Pulse Waves */}
                            <motion.div 
                                initial={{ scale: 1, opacity: 0.8 }}
                                animate={{ scale: 6, opacity: 0 }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute inset-0 bg-cyan-500/20 rounded-sm"
                            />
                        </div>
                    </motion.div>
                ))}

                {/* Central Tactical Display (Shadow Map) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.03]">
                    <Radar className="w-[800px] h-[800px] text-cyan-500/20 animate-spin-slow" />
                </div>
                
                {/* Coordinate Counter (Technical Overlay) */}
                <div className="absolute top-8 left-10 p-5 bg-black/40 border border-white/5 rounded-none backdrop-blur-xl z-10">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                             <Crosshair className="w-4 h-4 text-cyan-500" />
                             <span className="text-[10px] text-cyan-400 font-black tracking-[0.2em] uppercase">Tactical Tracker</span>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex flex-col">
                                <span className="text-[7px] text-slate-600 font-black uppercase mb-1">X-Axis</span>
                                <span className="text-[10px] text-white font-mono tabular-nums">{scanCoord.x.toString().padStart(4, '0')}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[7px] text-slate-600 font-black uppercase mb-1">Y-Axis</span>
                                <span className="text-[10px] text-white font-mono tabular-nums">{scanCoord.y.toString().padStart(4, '0')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. ENTERPRISE ACTIVE LINKAGE HUB */}
            <div className="absolute bottom-12 right-12 w-80 z-20">
                <GlassCard {...{glowStrong: true} as any} className="p-8 border-cyan-500/30 bg-cyan-900/30 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-sm bg-cyan-500" />
                            <span className="text-[10px] text-cyan-400 uppercase font-black tracking-[0.3em]">Active Intelligence Linkage</span>
                        </div>
                        <Network className="w-4 h-4 text-cyan-400/50" />
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-black/40 border border-white/5 rounded-sm">
                            <div className="flex justify-between items-center text-[9px] uppercase font-black mb-3">
                                <span className="text-white tracking-widest">Shell → Viaro Leak</span>
                                <span className="text-cyan-400">92.4% Match</span>
                            </div>
                            <div className="h-1 bg-slate-800 rounded-sm overflow-hidden relative">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: '92.4%' }} 
                                    className="h-full bg-cyan-500" 
                                />
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-400 italic leading-relaxed font-mono px-1">
                            "Unscheduled G650 flight signals detected for Shell SNS Unit. Cross-referencing 2035 dark-repo intercepts for restructuring synergy."
                        </p>
                    </div>
                    
                    <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-slate-600 tracking-widest">
                        <span>SESSION_ID: SIG_ALPHA_99</span>
                        <div className="flex items-center gap-2">
                             <div className="w-1 h-1 rounded-sm bg-cyan-500" />
                             AUTO_VALIDATED
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Bottom Status Ticker */}
            <div className="h-8 bg-black/40 border-t border-white/5 flex items-center justify-center px-10 relative z-20">
                <div className="text-[8px] text-slate-700 uppercase font-black tracking-[1.5em] select-none text-center">
                    SIGINT_PULSE_BETA_NODE_4 // SOVEREIGN_CLEARANCE_REQUIRED // DATA_STREAM_ENCRYPT_256
                </div>
            </div>
            
            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 60s linear infinite;
                }
            `}</style>
        </GlassPanel>
    );
}
