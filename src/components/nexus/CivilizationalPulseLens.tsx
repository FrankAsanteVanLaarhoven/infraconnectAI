"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    ShoppingBag, 
    PlaneLanding, 
    TrendingUp, 
    Map, 
    HeartPulse, 
    ShoppingCart, 
    Store,
    Globe,
    Navigation,
    ArrowUpRight,
    LucideIcon
} from 'lucide-react';

interface ConsumerMetric {
    id: string;
    label: string;
    value: string;
    change: number;
    trend: 'UP' | 'DOWN';
    icon: LucideIcon;
}

export function CivilizationalPulseLens() {
    const [metrics] = useState<ConsumerMetric[]>([
        { id: '1', label: 'Migration Velocity', value: '1.2M/mo', change: 8.4, trend: 'UP', icon: PlaneLanding },
        { id: '2', label: 'Walmart Velocity', value: '$1.4B/hr', change: 2.1, trend: 'UP', icon: ShoppingCart },
        { id: '3', label: 'Shopify GMV', value: '$840M/hr', change: 12.5, trend: 'UP', icon: Store },
        { id: '4', label: 'Tourism Density', value: 'High', change: -1.2, trend: 'DOWN', icon: Map },
    ]);

    return (
        <div className="w-full h-full bg-[#020617] border border-slate-700 rounded-3xl p-8 flex flex-col font-mono relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 border border-slate-700 rounded-none">
                        <HeartPulse className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Civilizational Pulse</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Global Human Substrate</p>
                    </div>
                </div>

                <div className="flex gap-8 items-center text-right">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Consumer Health</span>
                        <span className="text-xl font-black text-slate-300 tracking-tighter">STABLE_BETA</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Migration Index</span>
                        <span className="text-xl font-black text-indigo-400 tracking-tighter">0.82</span>
                    </div>
                </div>
            </div>

            {/* Main Visualizer (Migration & Pulse Heatmap) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 relative z-10">
                {/* Metrics Grid */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <span className="text-[9px] text-slate-600 uppercase font-black border-b border-white/5 pb-2">Civilizational KPIs</span>
                    {metrics.map((m) => (
                        <motion.div 
                            key={m.id}
                            whileHover={{ x: 4 }}
                            className="p-5 bg-slate-900/40 border border-white/5 rounded-none flex flex-col gap-3 group/metric transition-all hover:bg-slate-900/60 cursor-pointer"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-sm">
                                        <m.icon className="w-4 h-4 text-slate-300" />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase">{m.label}</span>
                                </div>
                                <div className={`flex items-center gap-1 text-[8px] font-black ${m.trend === 'UP' ? 'text-slate-300' : 'text-red-500'}`}>
                                    {m.trend === 'UP' ? '+' : '-'}{Math.abs(m.change)}%
                                    {m.trend === 'UP' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3 rotate-90" />}
                                </div>
                            </div>
                            <div className="text-2xl font-black text-white tracking-tighter">{m.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* World Migration Map (Abstract) */}
                <div className="lg:col-span-8 bg-black/40 border border-white/5 rounded-3xl relative overflow-hidden flex items-center justify-center p-12">
                    <Globe className="absolute w-[120%] h-[120%] text-slate-300 -bottom-1/4 -right-1/4" />
                    
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Migration Flow Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <motion.path 
                                d="M 100,200 Q 250,50 400,200" 
                                stroke="url(#flowGrad)" strokeWidth="2" fill="none"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, repeat: Infinity }}
                            />
                            <motion.path 
                                d="M 500,300 Q 300,100 100,300" 
                                stroke="url(#flowGrad)" strokeWidth="2" fill="none"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                            />
                            <defs>
                                <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                                    <stop offset="50%" stopColor="#10b981" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>

                        <div className="text-center z-10 space-y-4">
                            <Navigation className="w-16 h-16 text-slate-300 mx-auto" />
                            <h3 className="text-xl font-black text-white uppercase tracking-[0.3em]">Migration Flux: ACTIVE</h3>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest max-w-[300px] mx-auto leading-relaxed">
                                Modeling global talent relocation and refugee flows across G20 borders. High sync correlation with energy price shocks.
                            </p>
                        </div>
                    </div>

                    {/* Bottom Status Feed */}
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-500">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-slate-800 rounded-sm animate-ping" />
                            <span>NODE_77_IN_HOME_VELOCITY: 0.94</span>
                        </div>
                        <span>SYNC_STATUS: EARTH_OS_V20</span>
                    </div>
                </div>
            </div>

            {/* Background Aesthetic */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.01]">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="text-[10px] whitespace-nowrap text-slate-300 font-mono tracking-[1em]">
                        CIVILIZATIONAL_PULSE_GLOBAL_HUMAN_SUBSTRATE_
                    </div>
                ))}
            </div>
        </div>
    );
}
