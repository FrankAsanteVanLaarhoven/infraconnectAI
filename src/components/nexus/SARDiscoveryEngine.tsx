"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Radar, 
    Scan, 
    Maximize2, 
    AlertCircle, 
    Clock, 
    Globe, 
    Layers,
    MapPin,
    Satellite,
    Crosshair,
    Table,
    Search
} from 'lucide-react';

interface Discovery {
    id: string;
    type: 'INDUSTRIAL' | 'MINERAL' | 'FAB' | 'INFRA';
    label: string;
    coordinates: string;
    certainty: number;
    timestamp: string;
}

export function SARDiscoveryEngine() {
    const [discoveries] = useState<Discovery[]>([
        { id: '1', type: 'FAB', label: 'Terafab Phase 4 Hidden Substrate', coordinates: '30.2°N, 97.6°W', certainty: 0.94, timestamp: new Date().toISOString() },
        { id: '2', type: 'MINERAL', label: 'Unmapped Rare Earth Vein', coordinates: '35.4°N, 115.4°W', certainty: 0.88, timestamp: new Date().toISOString() },
        { id: '3', type: 'INDUSTRIAL', label: 'Offshore Energy Choke Point', coordinates: '53.5°N, 1.2°E', certainty: 0.99, timestamp: new Date().toISOString() },
    ]);

    const [scanning, setScanning] = useState(false);

    const triggerScan = () => {
        setScanning(true);
        setTimeout(() => setScanning(false), 2000);
    };

    return (
        <div className="w-full h-full bg-[#020617] border border-cyan-500/20 rounded-3xl p-8 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_80px_rgba(6,182,212,0.05)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                        <Satellite className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">SAR Discovery Engine</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Satellite Intelligence // SOTA 2035</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={triggerScan}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Radar className={`w-3 h-3 ${scanning ? 'animate-spin' : ''}`} />
                        Initialize SAR Sweep
                    </button>
                </div>
            </div>

            {/* Main Visualizer */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 relative z-10">
                {/* 3D Discovery Grid */}
                <div className="lg:col-span-8 bg-black/40 border border-white/5 rounded-3xl relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-[0.2]" 
                         style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    
                    {/* Scanning Overlay */}
                    <AnimatePresence>
                        {scanning && (
                            <motion.div 
                                initial={{ top: '-100%' }} 
                                animate={{ top: '100%' }} 
                                exit={{ opacity: 0 }}
                                transition={{ duration: 2, ease: 'linear' }}
                                className="absolute left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_20px_#06b6d4] z-20"
                            />
                        )}
                    </AnimatePresence>

                    <div className="relative w-full h-full flex items-center justify-center">
                        <Crosshair className="w-32 h-32 text-cyan-500/10 animate-pulse" />
                        
                        {/* Discovery Markers */}
                        {discoveries.map((d, i) => (
                            <motion.div 
                                key={d.id}
                                style={{ top: `${20 + i * 30}%`, left: `${30 + i * 20}%` }}
                                className="absolute flex flex-col items-center gap-2 group/marker"
                            >
                                <div className="w-4 h-4 bg-cyan-500 rounded-full animate-ping opacity-50" />
                                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                                <div className="hidden group-hover/marker:block bg-black/80 border border-cyan-500/20 p-2 rounded-lg backdrop-blur-md absolute bottom-full mb-2 whitespace-nowrap">
                                    <span className="text-[8px] text-cyan-400 font-black uppercase">{d.label}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Telemetry Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest block">Live SAR Timestamp</span>
                            <div className="bg-black/60 border border-white/10 px-3 py-1.5 rounded flex items-center gap-2 backdrop-blur-md">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                <span className="text-[10px] text-cyan-400 font-black font-mono tracking-tighter">
                                    {new Date().toISOString().split('T')[1].replace('Z', '')}
                                </span>
                            </div>
                        </div>
                        <div className="bg-black/60 border border-white/10 px-3 py-1.5 rounded flex items-center gap-2 backdrop-blur-md">
                            <Layers className="w-3 h-3 text-indigo-400" />
                            <span className="text-[8px] text-white font-black uppercase tracking-widest">Multi-Pass Verification: ACTIVE</span>
                        </div>
                    </div>
                </div>

                {/* Discovery Feed */}
                <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <span className="text-[9px] text-slate-600 uppercase font-black border-b border-white/5 pb-2">New Site Discoveries</span>
                    {discoveries.map((d) => (
                        <motion.div 
                            key={d.id}
                            whileHover={{ scale: 0.98 }}
                            className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col gap-3 group/discovery hover:bg-slate-900/60 transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-center">
                                <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded ${
                                    d.type === 'FAB' ? 'bg-cyan-500/20 text-cyan-400' :
                                    d.type === 'MINERAL' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                                }`}>
                                    {d.type}
                                </span>
                                <div className="flex items-center gap-1 text-[8px] text-cyan-500 font-black">
                                    {(d.certainty * 100).toFixed(0)}% Certainty
                                </div>
                            </div>
                            <h4 className="text-xs font-black text-white uppercase tracking-tight">{d.label}</h4>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-slate-600" />
                                    <span className="text-[8px] text-slate-500 font-mono">{d.coordinates}</span>
                                </div>
                                <Search className="w-3 h-3 text-slate-700 group-hover/discovery:text-cyan-400 transition-colors" />
                            </div>
                        </motion.div>
                    ))}

                    <div className="mt-auto p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center gap-4">
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                        <p className="text-[8px] text-slate-500 uppercase font-black leading-tight">
                            Asset discovery exceeds local consultant records by 14.2%. McKinsey data lag identified.
                        </p>
                    </div>
                </div>
            </div>

            {/* Background Aesthetics */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.01]">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="text-[10px] whitespace-nowrap text-cyan-500 font-mono tracking-[1.5em]">
                        SAR_DISCOVERY_ENGINE_UNSEEEN_ASSET_ACQUISITION_
                    </div>
                ))}
            </div>
        </div>
    );
}
