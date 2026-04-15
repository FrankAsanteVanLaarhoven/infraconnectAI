"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, 
    Droplets, 
    Navigation, 
    ShieldAlert, 
    Activity, 
    Globe,
    AlertTriangle,
    TrendingUp,
    Anchor,
    Wind
} from 'lucide-react';

interface EnergyNode {
    id: string;
    label: string;
    flow: number; // in Millions b/d
    status: 'OPERATIONAL' | 'RESTRICTED' | 'PARALYZED';
    type: 'CHOKEPOINT' | 'PRODUCTION' | 'TERMINAL';
    lat: number;
    lng: number;
}

export function EnergySectorLens() {
    const [price, setPrice] = useState(118.42);
    const [lastPrice, setLastPrice] = useState(117.20);
    const [nodes] = useState<EnergyNode[]>([
        { id: 'hormuz', label: 'STRAIT OF HORMUZ', flow: 2.1, status: 'PARALYZED', type: 'CHOKEPOINT', lat: 26.5, lng: 56.2 },
        { id: 'malacca', label: 'STRAIT OF MALACCA', flow: 15.2, status: 'RESTRICTED', type: 'CHOKEPOINT', lat: 1.4, lng: 102.8 },
        { id: 'suez', label: 'SUEZ CANAL', flow: 4.5, status: 'OPERATIONAL', type: 'CHOKEPOINT', lat: 29.9, lng: 32.5 },
        { id: 'ghawar', label: 'GHAWAR FIELD', flow: 0, status: 'PARALYZED', type: 'PRODUCTION', lat: 25.5, lng: 49.3 },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLastPrice(price);
            setPrice(prev => prev + (Math.random() - 0.45) * 0.5); // Drifting upward
        }, 5000);
        return () => clearInterval(interval);
    }, [price]);

    return (
        <div className="w-full h-full bg-[#030712] border border-slate-900 rounded-3xl p-8 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_80px_rgba(0,0,0,0.9)]">
            {/* Header / Price Ticker */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                        <Droplets className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Energy Sector Lens</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Maritime Surveillance // SOTA 2035</p>
                    </div>
                </div>

                <div className="flex gap-8 items-center text-right">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Global Shut-In (b/d)</span>
                        <span className="text-xl font-black text-red-500 tracking-tighter">9.12M</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Brent Crude Surge</span>
                        <div className="flex items-baseline gap-2">
                            <motion.span 
                                key={price.toFixed(2)}
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                className={`text-2xl font-black tracking-tighter ${price > lastPrice ? 'text-amber-500' : 'text-slate-400'}`}
                            >
                                ${price.toFixed(2)}
                            </motion.span>
                            <span className="text-[10px] text-amber-500 font-black">↑ 4.2%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Visualizer */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 relative z-10">
                {/* Global Chokepoint Map - Full View */}
                <div className="lg:col-span-8 bg-black border border-white/5 rounded-3xl relative overflow-hidden">
                    {/* Abstract World Grid */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                         style={{ backgroundImage: 'radial-gradient(#amber-500 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />

                    {/* Node Markers */}
                    <div className="absolute inset-4 rounded-2xl border border-white/5 bg-slate-900/10 backdrop-blur-sm overflow-hidden flex items-center justify-center p-8">
                        {/* Static Map Image / Placeholder */}
                        <div className="text-center opacity-30 flex flex-col items-center gap-4">
                            <Globe className="w-24 h-24 text-slate-800" />
                            <span className="text-[8px] text-slate-800 uppercase font-black tracking-[1em]">Geospatial Substrate Mapping...</span>
                        </div>

                        {/* Node Tooltips (Absolute Pos based on Lng/Lat) */}
                        <div className="absolute inset-0 pointer-events-none">
                            {nodes.map((node) => (
                                <motion.div 
                                    key={node.id}
                                    style={{ 
                                        left: `${(node.lng + 180) * (100 / 360)}%`, 
                                        top: `${(90 - node.lat) * (100 / 180)}%` 
                                    }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 group/node"
                                >
                                    <div className={`p-2 rounded-full border ${
                                        node.status === 'PARALYZED' ? 'bg-red-500/20 border-red-500' : 
                                        node.status === 'RESTRICTED' ? 'bg-amber-500/20 border-amber-500' : 
                                        'bg-emerald-500/20 border-emerald-500'
                                    } animate-pulse pointer-events-auto cursor-help relative`}>
                                        {node.type === 'CHOKEPOINT' ? <Anchor className="w-3 h-3 text-white" /> : <Droplets className="w-3 h-3 text-white" />}
                                        
                                        {/* Hover Detail Card */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black/95 border border-white/10 rounded-xl p-3 opacity-0 group-hover/node:opacity-100 transition-opacity z-50">
                                            <h4 className="text-[9px] font-black text-white uppercase mb-1">{node.label}</h4>
                                            <div className="flex justify-between items-center text-[7px] text-slate-500 uppercase font-black tracking-widest border-b border-white/5 pb-1 mb-2">
                                                <span>Status: {node.status}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-2.5 h-2.5 text-indigo-400" />
                                                    <span className="text-[7px] text-slate-400">Flow: {node.flow}M b/d</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Overlay Alert */}
                    <div className="absolute top-6 left-6 pointer-events-none">
                        <div className="bg-red-500/10 border border-red-500/40 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">Global Energy Emergency</span>
                                <span className="text-[7px] text-red-400 font-bold uppercase tracking-widest">Hormuz Blockade: DAY 5</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tactical Stats / Inventory */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="flex-1 bg-slate-900/30 border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-600 uppercase font-black tracking-[0.25em]">Strategic Reserves</span>
                            <Wind className="w-4 h-4 text-slate-700" />
                        </div>
                        
                        <div className="space-y-6">
                            {[
                                { label: 'SPR US', val: 0.12, icon: ShieldAlert, color: 'text-red-500' },
                                { label: 'SPR EU', val: 0.28, icon: Activity, color: 'text-amber-500' },
                                { label: 'IEA EMERGENCY STOCK', val: 0.45, icon: Zap, color: 'text-emerald-500' }
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg bg-slate-900 border border-white/5 ${stat.color}`}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                            <span className="text-slate-400">{stat.label}</span>
                                            <span className={stat.color}>{(stat.val * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${stat.val * 100}%` }} className={`h-full ${stat.color.replace('text', 'bg')}`} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-[120px] bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-2 group/cta cursor-pointer hover:bg-amber-500/10 transition-all">
                        <TrendingUp className="w-5 h-5 text-amber-500 mb-1" />
                        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Open Energy Briefing</h4>
                        <p className="text-[8px] text-slate-600 uppercase font-bold">Review conflict-resilient plays</p>
                    </div>
                </div>
            </div>

            {/* Background Aesthetic */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_120%_-20%,rgba(245,158,11,0.1)_0%,transparent_100%)]" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[7px] text-slate-800 uppercase font-black tracking-[1em] select-none">
                SURVEILLANCE_ACTIVE_NODE_B92
            </div>
        </div>
    );
}
