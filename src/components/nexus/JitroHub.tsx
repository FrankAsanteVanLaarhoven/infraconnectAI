"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Target, 
    TrendingUp, 
    Activity, 
    Zap, 
    LayoutGrid, 
    Network,
    Cpu,
    CheckCircle2,
    ChevronRight,
    Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STRATEGIC_OUTCOMES, StrategicOutcome } from '@/lib/nexus/swarm';

export function JitroHub() {
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const activeGoal = STRATEGIC_OUTCOMES.find(g => g.id === selectedGoalId);

    return (
        <div className="w-full h-full bg-[#020617] backdrop-blur-3xl border border-slate-800 rounded-2xl p-6 flex flex-col font-mono relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-800/50 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Jitro Outcome Hub</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black">Strategic Goal Orchestration // SOTA 2035</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded">
                        <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                        <span className="text-[8px] text-cyan-400 font-black uppercase tracking-widest">Autonomous Goal-Seeking Active</span>
                    </div>
                </div>
            </div>

            {/* Goal Graph / Dashboard */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 relative z-10">
                {/* Active Outcomes List */}
                <div className="space-y-4">
                    <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Active Strategic Goals</span>
                    {STRATEGIC_OUTCOMES.map((goal) => (
                        <motion.div 
                            key={goal.id}
                            onClick={() => setSelectedGoalId(goal.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 ${
                                selectedGoalId === goal.id 
                                ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.1)]' 
                                : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-900 border-indigo-500/10'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-white uppercase truncate">{goal.goal}</span>
                                <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${
                                    goal.status === 'ACHIEVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                                }`}>
                                    {goal.status}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-[8px] text-slate-500 uppercase font-black">
                                    <span>{goal.kpi}</span>
                                    <span>{((goal.current / goal.target) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                                        className="h-full bg-cyan-500"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 py-6 text-[9px] uppercase tracking-widest text-slate-400 font-black">
                        + Initialize New Outcome
                    </Button>
                </div>

                {/* Jitro Reasoning Graph */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <AnimatePresence mode="wait">
                        {activeGoal ? (
                            <motion.div 
                                key={activeGoal.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 flex flex-col gap-6"
                            >
                                {/* KPI Visualization */}
                                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="flex flex-col items-center gap-2 z-10">
                                        <TrendingUp className="w-8 h-8 text-cyan-400 opacity-50 mb-2" />
                                        <span className="text-4xl font-black text-white tracking-widest">
                                            {activeGoal.current.toFixed(1)} / {activeGoal.target.toFixed(1)}
                                        </span>
                                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{activeGoal.kpi} Target Sync</span>
                                    </div>
                                    {/* Abstract Waveform */}
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 opacity-10 pointer-events-none">
                                        <svg viewBox="0 0 100 20" className="w-full h-full preserve-3d">
                                            <motion.path 
                                                d="M 0 10 Q 25 5, 50 10 T 100 10"
                                                fill="none"
                                                stroke="#22d3ee"
                                                strokeWidth="0.5"
                                                animate={{ d: ["M 0 10 Q 25 5, 50 10 T 100 10", "M 0 10 Q 25 15, 50 10 T 100 10"] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Autonomous Planning Log */}
                                <div className="flex-1 p-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative">
                                    <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                                        <Network className="w-4 h-4 text-cyan-400" />
                                        <span className="text-[10px] text-white uppercase font-black tracking-widest">Jitro Execution Blueprint</span>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { step: 'PLANNING', desc: 'Analyzing global fleet architecture...', done: true },
                                            { step: 'EXECUTING', desc: 'Deploying optimized Gemma-4 nodes globally...', done: true },
                                            { step: 'VALIDATING', desc: 'Measuring throughput resonance score...', done: false },
                                            { step: 'STABILIZING', desc: 'Calibrating long-horizon goal attainment...', done: false }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <div className={`mt-1 p-1 rounded-full ${item.done ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                                                    {item.done ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-[9px] font-black uppercase ${item.done ? 'text-slate-400' : 'text-cyan-400 animate-pulse'}`}>
                                                        {item.step}
                                                    </span>
                                                    <p className="text-[8px] text-slate-600 font-mono italic">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute right-6 top-6">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[24px] font-black text-white">99.1%</span>
                                            <span className="text-[8px] text-slate-500 uppercase font-black">Plan Confidence</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 gap-4">
                                <Target className="w-16 h-16 text-slate-700" />
                                <div>
                                    <h3 className="text-sm font-black text-slate-500 uppercase">Select an Outcome</h3>
                                    <p className="text-[10px] text-slate-700 uppercase">Monitor Jitro's Goal-Seeking engine</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Background Data Matrix */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,211,238,0.1)_0%,transparent_100%)]" />
                <div className="grid grid-cols-12 h-full w-full">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="border-r border-cyan-500 h-full w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}
