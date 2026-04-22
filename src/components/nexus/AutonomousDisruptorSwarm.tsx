"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, 
    ShieldAlert, 
    RefreshCcw, 
    Database, 
    Activity, 
    Users, 
    Brain,
    Lock,
    Unlock,
    Terminal,
    ChevronRight,
    Search
} from 'lucide-react';

interface SwarmNode {
    id: string;
    target: string;
    action: string;
    status: 'ACTIVE' | 'SYNCING' | 'BREACHED';
}

export function AutonomousDisruptorSwarm() {
    const [nodes, setNodes] = useState<SwarmNode[]>([
        { id: '1', target: 'McKinsey Alpha', action: 'Shadow_API_Extraction', status: 'ACTIVE' },
        { id: '2', target: 'BCG Strategy Hub', action: 'Memo_Leak_Scrubbing', status: 'SYNCING' },
        { id: '3', target: 'Shell Portfolio', action: 'Sentiment_Correlation', status: 'ACTIVE' },
        { id: '4', target: 'Wood Mac Data', action: 'Asset_Drift_Detection', status: 'BREACHED' },
    ]);

    // Simulated Swarm Activity
    useEffect(() => {
        const interval = setInterval(() => {
            setNodes(prev => prev.map(node => ({
                ...node,
                status: Math.random() > 0.8 ? 'SYNCING' : 'ACTIVE'
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full bg-[#020617] border border-indigo-500/20 rounded-3xl p-8 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_80px_rgba(99,102,241,0.05)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                        <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Autonomous Disruptor Swarm</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Background OSINT Intelligence</p>
                    </div>
                </div>

                <div className="flex gap-8 items-center text-right">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Renewal Frequency</span>
                        <span className="text-xl font-black text-indigo-400 tracking-tighter">50ms</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Swarm Nodes</span>
                        <span className="text-xl font-black text-emerald-500 tracking-tighter">1,024</span>
                    </div>
                </div>
            </div>

            {/* Main Swarm Interface */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 relative z-10">
                {/* Node Feed */}
                <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <span className="text-[9px] text-slate-600 uppercase font-black border-b border-white/5 pb-2">Swarm Execution Log</span>
                    {nodes.map((node) => (
                        <motion.div 
                            key={node.id}
                            initial={{ x: -10 }}
                            animate={{ x: 0 }}
                            className="p-4 bg-slate-900/40 border border-white/5 rounded-xl flex items-center justify-between group/node"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    node.status === 'ACTIVE' ? 'bg-emerald-500' :
                                    node.status === 'SYNCING' ? 'bg-indigo-500 animate-pulse' : 'bg-red-500'
                                }`} />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase">{node.target}</span>
                                    <span className="text-[7px] text-slate-500 uppercase font-black font-mono">{node.action}</span>
                                </div>
                            </div>
                            <Terminal className="w-3 h-3 text-slate-700 group-hover/node:text-indigo-400 transition-colors" />
                        </motion.div>
                    ))}

                    <div className="mt-4 p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <ShieldAlert className="w-4 h-4 text-indigo-400" />
                            <span className="text-[9px] font-black text-white uppercase">Vulnerability Detected</span>
                        </div>
                        <p className="text-[8px] text-slate-500 uppercase font-black leading-relaxed">
                            McKinsey Shadow-API "T-100" exposed in North Sea Sector. Commencing deep-scrub sequence.
                        </p>
                    </div>
                </div>

                {/* Swarm Visualizer (3D Mesh Style) */}
                <div className="lg:col-span-7 bg-black/40 border border-white/5 rounded-3xl relative overflow-hidden flex items-center justify-center p-12 group/viz">
                    <div className="absolute inset-0 opacity-[0.1]" 
                         style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    
                    <div className="relative w-full h-full flex items-center justify-center">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                            className="w-64 h-64 border border-indigo-500/20 rounded-full flex items-center justify-center relative"
                        >
                            {/* Orbiting Points */}
                            {Array.from({ length: 12 }).map((_, i) => (
                                <motion.div 
                                    key={i}
                                    style={{ rotate: i * 30 }}
                                    className="absolute inset-0 flex items-start justify-center"
                                >
                                    <div className="w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]" />
                                </motion.div>
                            ))}
                            <div className="text-center z-10">
                                <Activity className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
                                <div className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Singularity Core</div>
                                <div className="text-[8px] text-indigo-500 font-black animate-pulse uppercase">renewing...</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Meta Overlay */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-600">
                        <div className="flex items-center gap-2">
                            <RefreshCcw className="w-3 h-3 text-indigo-500 animate-spin-slow" />
                            <span>CONSTANT_RENEWAL: ACTIVE</span>
                        </div>
                        <span>UID: INFRA_CORE_SM_001</span>
                    </div>

                    <div className="absolute bottom-6 right-6 flex items-center gap-2">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-md">
                            <Zap className="w-3 h-3 text-emerald-400" />
                            <span className="text-[8px] text-emerald-400 font-black uppercase">Data Freshness: 99.9%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Aesthetics */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="text-[8px] whitespace-nowrap text-indigo-500 font-mono tracking-[2em]">
                        DISRUPT_MCKINSEY_AUTONOMOUS_SWARM_IN_PROGRESS_01010101
                    </div>
                ))}
            </div>
        </div>
    );
}
