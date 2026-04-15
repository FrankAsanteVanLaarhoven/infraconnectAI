"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Terminal, 
    Cpu, 
    Zap, 
    Activity, 
    Layers, 
    Code2, 
    Shapes,
    GitBranch,
    Monitor
} from 'lucide-react';

interface AgentTerminal {
    id: number;
    name: string;
    model: string;
    status: 'BOOTING' | 'SYNTHESIZING' | 'IDLE';
    log: string[];
    svgSample: string;
}

const MODELS = ['Gemma4-31B', 'Gemma4-26B (MoE)', 'Gemma4-E4B', 'Gemma4-E2B'];

export function ConcurrentMissionNexus() {
    const [tokensPerSec, setTokensPerSec] = useState(172.1);
    const [agents, setAgents] = useState<AgentTerminal[]>([]);
    const [activeAgents, setActiveAgents] = useState(10);

    // Initialize Agents
    useEffect(() => {
        const initialAgents: AgentTerminal[] = Array.from({ length: 9 }).map((_, i) => ({
            id: i + 1,
            name: `AGENT ${i + 1}`,
            model: MODELS[Math.floor(Math.random() * MODELS.length)],
            status: 'SYNTHESIZING',
            log: [
                'Establishing mission substrate...',
                'Fetching geospatial context...',
                'Synthesizing logic node...'
            ],
            svgSample: `<rect x="20" y="20" width="60" height="60" fill="none" stroke="#6366f1" stroke-width="0.5" />`
        }));
        setAgents(initialAgents);

        const interval = setInterval(() => {
            setTokensPerSec(prev => {
                const delta = (Math.random() - 0.5) * 5;
                return Math.max(150, Math.min(200, prev + delta));
            });

            setAgents(prev => prev.map(agent => ({
                ...agent,
                log: [...agent.log.slice(-5), `Sync pulse: 0x${Math.random().toString(16).slice(2, 6)}`]
            })));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full bg-[#030712] border border-slate-800 rounded-2xl p-6 flex flex-col font-mono relative overflow-hidden group">
            {/* Master Header / Performance Ticker */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-800/50 pb-6 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em]">Temporal Throughput</span>
                        <div className="flex items-baseline gap-2">
                            <motion.span 
                                key={tokensPerSec.toFixed(1)}
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-black text-[#facc15] tracking-tighter"
                            >
                                {tokensPerSec.toFixed(1)}
                            </motion.span>
                            <span className="text-[10px] text-[#facc15]/60 font-black uppercase">Tokens / sec</span>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-slate-800/50" />
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em]">Parallel Swarms</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-white">{activeAgents}</span>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest animate-pulse">Running</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                        <Activity className="w-3 h-3 text-indigo-400" />
                        <span className="text-[8px] text-indigo-400 font-black uppercase tracking-widest">Quantum Link: STABLE</span>
                    </div>
                    <Monitor className="w-4 h-4 text-slate-600" />
                </div>
            </div>

            {/* Concurrent Agent Grid */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 min-h-0 relative z-10">
                {agents.map((agent) => (
                    <motion.div 
                        key={agent.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-black/40 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col group/terminal hover:border-indigo-500/50 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                    >
                        {/* Terminal Header */}
                        <div className="p-2 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-2.5 h-2.5 text-slate-500" />
                                <span className="text-[8px] font-black text-white uppercase">{agent.name} // {agent.model}</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            </div>
                        </div>

                        {/* Terminal Body */}
                        <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
                            <div className="space-y-1">
                                {agent.log.map((line, i) => (
                                    <div key={i} className="text-[7px] text-slate-500 font-mono tracking-tighter truncate opacity-70">
                                        {`> ${line}`}
                                    </div>
                                ))}
                            </div>
                            
                            {/* SVG Synthesis Mock */}
                            <div className="flex-1 bg-slate-900/30 rounded border border-slate-800/50 flex items-center justify-center relative overflow-hidden">
                                <svg viewBox="0 0 100 100" className="w-12 h-12 opacity-40">
                                    <motion.path 
                                        d="M 20 20 L 80 20 L 80 80 L 20 80 Z"
                                        fill="none"
                                        stroke="#6366f1"
                                        strokeWidth="0.5"
                                        animate={{ pathLength: [0, 1, 0] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    />
                                    <circle cx="50" cy="50" r="10" fill="none" stroke="#6366f1" strokeWidth="0.5" opacity="0.3" />
                                    <circle cx="50" cy="50" r="2" fill="#6366f1" />
                                </svg>
                                <div className="absolute top-1 left-1 flex items-center gap-1.5">
                                    <Shapes className="w-2 h-2 text-indigo-400" />
                                    <span className="text-[6px] text-indigo-400/60 font-black uppercase">Synthesizing Asset...</span>
                                </div>
                            </div>
                        </div>

                        {/* Terminal Footer */}
                        <div className="px-3 py-1.5 bg-slate-900/10 border-t border-slate-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-2.5 h-2.5 text-slate-700" />
                                <span className="text-[7px] text-slate-700 font-black uppercase tracking-widest">TSX / SVG</span>
                            </div>
                            <span className="text-[7px] text-indigo-500 font-mono font-black italic">Active</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Background Digital Grid (Concurrent Aesthetic) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03)_0%,transparent_100%)]" />
                <div className="absolute inset-0 opacity-[0.015]" 
                     style={{ backgroundImage: 'linear-gradient(#6366f1 0.5px, transparent 0.5px), linear-gradient(90deg, #6366f1 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Bottom Scrubber Log */}
            <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[7px] text-slate-500 uppercase font-black tracking-[0.4em] relative z-10">
                <div className="flex gap-4">
                    <span>Orchestrator: ACTIVE</span>
                    <span>Substrate: INITIALIZED</span>
                </div>
                <div className="flex gap-2 text-indigo-400">
                    <GitBranch className="w-3 h-3" />
                    <span>Parallel Execution Mesh: SOTA 2035</span>
                </div>
            </div>
        </div>
    );
}
