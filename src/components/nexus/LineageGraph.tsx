"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    GitBranch, 
    Share2, 
    Database, 
    Workflow, 
    Activity, 
    Cpu,
    Shield,
    Terminal,
    Map
} from 'lucide-react';

const STAGES = [
    { id: 'source', label: 'Cloud / Local Sources', icon: <Share2 className="w-4 h-4" />, items: ['Workstation-01', 'EdgeNode-A', 'OSINT-Stream'] },
    { id: 'bronze', label: 'Bronze (Raw)', icon: <Database className="w-4 h-4 text-orange-900" />, items: ['vt_raw_telemetry'] },
    { id: 'silver', label: 'Silver (Cleaned)', icon: <Database className="w-4 h-4 text-slate-400" />, items: ['vt_clean_metrics'] },
    { id: 'gold', label: 'Gold (Ontology)', icon: <Database className="w-4 h-4 text-amber-500" />, items: ['vt_ontological_truth'] },
    { id: 'swarm', label: 'AI Swarm Ops', icon: <Workflow className="w-4 h-4 text-cyan-400" />, items: ['agent-obs-01', 'agent-dev-01'] }
];

export function LineageGraph() {
    const [hoverNode, setHoverNode] = useState<string | null>(null);

    return (
        <div className="w-full h-full bg-slate-950/90 backdrop-blur-3xl border border-slate-800 rounded-none p-6 flex flex-col font-mono relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <GitBranch className="w-5 h-5 text-indigo-400" />
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Lakehouse Data Lineage</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black">Palantir-Grade Provenance Engine</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 bg-slate-800 border border-slate-700 rounded">
                    <Shield className="w-3 h-3 text-slate-300" />
                    <span className="text-[8px] text-slate-300 font-black uppercase tracking-widest">Provenance Verified</span>
                </div>
            </div>

            {/* Lineage Flow */}
            <div className="flex-1 flex items-center justify-between gap-4 relative">
                {/* SVG Connections Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <defs>
                        <linearGradient id="lineageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>
                    </defs>
                    {STAGES.slice(0, -1).map((stage, i) => (
                        <motion.line 
                            key={i}
                            x1={`${(i * 25) + 12.5}%`}
                            y1="50%"
                            x2={`${((i + 1) * 25) + 12.5}%`}
                            y2="50%"
                            stroke="url(#lineageGradient)"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            animate={{ strokeDashoffset: [0, -20] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    ))}
                </svg>

                {STAGES.map((stage, idx) => (
                    <div key={stage.id} className="flex-1 flex flex-col items-center gap-4 relative z-10">
                        <motion.div 
                            onHoverStart={() => setHoverNode(stage.id)}
                            onHoverEnd={() => setHoverNode(null)}
                            className={`w-12 h-12 rounded-sm flex items-center justify-center border transition-all ${
                                hoverNode === stage.id 
                                ? 'bg-indigo-500 border-indigo-400 ' 
                                : 'bg-slate-900 border-slate-800'
                            }`}
                        >
                            {stage.icon}
                        </motion.div>
                        
                        <div className="text-center space-y-1">
                            <h3 className="text-[9px] font-black text-white uppercase tracking-tighter">{stage.label}</h3>
                            <div className="flex flex-col gap-1 items-center">
                                {stage.items.map((item) => (
                                    <div key={item} className="px-2 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-[7px] text-slate-500 uppercase font-bold tracking-widest">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Connection Indicators */}
                        {idx < STAGES.length - 1 && (
                            <div className="absolute right-[-10%] top-[24px] z-20">
                                <Activity className="w-3 h-3 text-indigo-500/50" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom Telemetry */}
            <div className="mt-8 grid grid-cols-4 gap-4 pt-6 border-t border-slate-800/50">
                <div className="flex flex-col">
                    <span className="text-[7px] text-slate-600 uppercase font-black">Sync Latency</span>
                    <span className="text-[10px] text-white font-black italic">42ms</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[7px] text-slate-600 uppercase font-black">Data Gravity</span>
                    <span className="text-[10px] text-cyan-400 font-black italic">HIGH</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[7px] text-slate-600 uppercase font-black">Source Count</span>
                    <span className="text-[10px] text-white font-black italic">14 Cloud / 2 Edge</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[7px] text-slate-600 uppercase font-black">Last Transform</span>
                    <span className="text-[10px] text-amber-500 font-black italic font-mono">1.2s AGO</span>
                </div>
            </div>

            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#6366f1_0.5px,transparent_0.5px)] [background-size:16px_16px]" />
        </div>
    );
}
