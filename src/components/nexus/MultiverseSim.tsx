"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GitBranch, 
    Zap, 
    Activity, 
    Eye,
    Target,
    Layers,
    Share2,
    Lock
} from 'lucide-react';

interface RealityBranch {
    id: string;
    label: string;
    probability: number;
    delta: string;
    color: string;
}

const BRANCHES: RealityBranch[] = [
    { id: 'R1', label: 'ECONOMIC ACCELERATION', probability: 0.94, delta: '+14% GDP REF', color: '#10b981' },
    { id: 'R2', label: 'SYSTEMIC STABILIZATION', probability: 0.82, delta: '0% DRIFT', color: '#6366f1' },
    { id: 'R3', label: 'ENTROPIC RISK-HIGH', probability: 0.14, delta: '-42% INTEGRITY', color: '#ef4444' }
];

export function MultiverseSim() {
    const [selectedReality, setSelectedReality] = useState<string>('R2');
    const [scannedPos, setScannedPos] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setScannedPos(prev => (prev + 1) % 100);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full bg-slate-950/90 backdrop-blur-3xl border border-slate-800 rounded-2xl p-6 flex flex-col font-mono relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Multiverse Sim-Engine</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black italic">Parallel Reality Observation Core</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span className="text-[8px] text-cyan-400 font-black uppercase tracking-widest">Observing Branches</span>
                </div>
            </div>

            {/* Multiverse Visualization */}
            <div className="flex-1 flex flex-col justify-center relative px-8">
                {/* Branching SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {/* Main Trunk */}
                    <line x1="0" y1="50%" x2="20%" y2="50%" stroke="#fff" strokeWidth="1" strokeDasharray="2 2" />
                    {/* Branches */}
                    {BRANCHES.map((b, i) => (
                        <motion.path 
                            key={b.id}
                            d={`M ${80} ${150} C 150 150, 200 ${50 + i * 100}, 400 ${50 + i * 100}`}
                            fill="none"
                            stroke={b.color}
                            strokeWidth="2"
                            filter="url(#glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: i * 0.5 }}
                        />
                    ))}
                </svg>

                <div className="space-y-6 relative z-10">
                    {BRANCHES.map((reality) => (
                        <motion.div 
                            key={reality.id}
                            onClick={() => setSelectedReality(reality.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                selectedReality === reality.id 
                                ? 'bg-slate-900 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)] scale-105' 
                                : 'bg-slate-950/50 border-slate-900 opacity-40 hover:opacity-70'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-1 h-8 rounded-full`} style={{ background: reality.color }} />
                                <div>
                                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">{reality.label}</h3>
                                    <p className="text-[8px] text-slate-500 font-mono italic">{reality.delta}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[12px] font-black tracking-tighter`} style={{ color: reality.color }}>
                                    {(reality.probability * 100).toFixed(1)}%
                                </span>
                                <p className="text-[7px] text-slate-600 uppercase font-extrabold">Probability</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Scrubber / Control */}
            <div className="mt-8 pt-6 border-t border-slate-800 relative">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[8px] text-slate-600 uppercase font-black">Reality Timeline Scrub</span>
                    <span className="text-[8px] text-indigo-400 font-mono tracking-widest">T-ZERO: COLLAPSE PENDING</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden relative">
                    <motion.div 
                        className="h-full bg-white shadow-[0_0_10px_white]"
                        style={{ width: '2px', marginLeft: `${scannedPos}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Share2 className="w-3 h-3 text-slate-600" />
                        <span className="text-[8px] text-slate-600 uppercase font-black italic">Parallel Convergence: STABLE</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-indigo-400 rounded-lg group hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                        <Target className="w-3 h-3 text-white" />
                        <span className="text-[9px] text-white font-black uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all">Select Reality</span>
                    </button>
                </div>
            </div>

            {/* Background Digital Rain Effect (Subtle) */}
            <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-[0.02] flex gap-2">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div 
                        key={i}
                        animate={{ y: [-100, 1000] }}
                        transition={{ duration: 10 + Math.random() * 20, repeat: Infinity, ease: "linear" }}
                        className="text-[8px] font-mono whitespace-nowrap orientation-vertical tracking-tight"
                    >
                        {"QUANTUM_FLUX_".repeat(20)}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
