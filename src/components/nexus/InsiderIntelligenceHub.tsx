"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Fingerprint, 
    Link, 
    FileWarning, 
    Plane, 
    Radio, 
    Search, 
    AlertTriangle, 
    ShieldAlert, 
    Activity, 
    Lock,
    EyeOff,
    Terminal
} from 'lucide-react';

interface InsiderSignal {
    id: string;
    type: 'LEAK' | 'FLIGHT' | 'SHADOW_API' | 'ANOMALY';
    source: string;
    confidence: number;
    description: string;
    timestamp: string;
    entity: string;
}

export function InsiderIntelligenceHub() {
    const [isScanning, setIsScanning] = useState(true);
    const [signals, setSignals] = useState<InsiderSignal[]>([
        { id: '1', type: 'LEAK', source: 'BREACH_ARCHIVE_X', confidence: 0.94, description: 'SNS Maintenance Memo v4 // Draft Rev. B', timestamp: '01:42:05', entity: 'Shell SNS' },
        { id: '2', type: 'FLIGHT', source: 'ADS-B_PRIVATE', confidence: 0.88, description: 'GULFSTREAM G650 // LON -> SVG // Unscheduled', timestamp: '01:38:12', entity: 'Equinor Exec' },
        { id: '3', type: 'SHADOW_API', source: 'MCKINSEY_LABS_ENDPOINT', confidence: 0.98, description: 'Unsecured RAG Endpoint: /api/v2/client_strategy_prealpha', timestamp: '01:30:45', entity: 'McKinsey' },
        { id: '4', type: 'ANOMALY', source: 'QUANTUM_PULSE', confidence: 0.76, description: 'Unusual Domain Registration: "shell-viaro-settlement.io"', timestamp: '01:22:10', entity: 'Shell/Viaro' }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsScanning(true);
            setTimeout(() => setIsScanning(false), 2000);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full bg-[#030712] border border-red-500/20 rounded-3xl p-8 flex flex-col font-mono relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-none">
                        <Fingerprint className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Insider Intelligence Hub</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Sovereign Intel // Dark-OSINT Substrate</p>
                    </div>
                </div>

                <div className="flex gap-8 items-center text-right">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Active Breaches</span>
                        <span className="text-xl font-black text-red-500 tracking-tighter">14,208</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Signal Fidelity</span>
                        <span className="text-xl font-black text-slate-300 tracking-tighter">98.4%</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 relative z-10">
                {/* Signal Stream */}
                <div className="lg:col-span-12 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                        <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Live Insider Stream</span>
                        {isScanning && (
                            <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-red-500" />
                                <span className="text-[8px] text-red-500 font-black">Scraping Dark-OSINT Clusters...</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {signals.map((s, i) => (
                            <motion.div 
                                key={s.id}
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-slate-900/40 border border-white/5 rounded-none p-5 flex flex-col gap-4 group/card hover:bg-slate-900/60 transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`p-2 rounded-sm ${
                                        s.type === 'LEAK' ? 'bg-amber-500/10 text-amber-500' :
                                        s.type === 'FLIGHT' ? 'bg-blue-500/10 text-blue-500' :
                                        s.type === 'SHADOW_API' ? 'bg-red-500/10 text-red-500' :
                                        'bg-slate-800 text-slate-300'
                                    }`}>
                                        {s.type === 'LEAK' && <FileWarning className="w-4 h-4" />}
                                        {s.type === 'FLIGHT' && <Plane className="w-4 h-4" />}
                                        {s.type === 'SHADOW_API' && <ShieldAlert className="w-4 h-4" />}
                                        {s.type === 'ANOMALY' && <Radio className="w-4 h-4" />}
                                    </div>
                                    <span className="text-[8px] text-slate-600 font-black">{s.timestamp}</span>
                                </div>
                                
                                <div>
                                    <h4 className="text-[9px] font-black text-white uppercase mb-1 truncate">{s.entity}</h4>
                                    <p className="text-[10px] text-slate-400 font-mono leading-tight bg-black/40 p-2 rounded-sm border border-white/5 min-h-[48px]">
                                        {s.description}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center text-[8px] uppercase font-black tracking-widest pt-2 border-t border-white/5">
                                    <span className="text-slate-600">Conf: {(s.confidence * 100).toFixed(0)}%</span>
                                    <span className={s.confidence > 0.9 ? 'text-slate-300' : 'text-amber-500'}>Verified</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tactical Briefing Overlay */}
            <div className="absolute top-24 right-8 w-80 pointer-events-none">
                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-red-500" />
                        <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">McKinsey Breach Report</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
                        "Shadow API" detected in QuantumBlack internal staging. Potential access to confidential client strategy vectors for Q2 2026. Data leakage verified via ADS-B flight correlation of managing directors.
                    </p>
                    <div className="flex gap-2">
                        <div className="h-1 flex-1 bg-red-500/40 rounded-sm overflow-hidden">
                            <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity }} className="h-full w-1/2 bg-red-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Aesthetic */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(circle_at_50%_120%,rgba(239,68,68,0.2)_0%,transparent_100%)]" />
            </div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-12 opacity-30 select-none">
                <div className="flex items-center gap-2">
                    <EyeOff className="w-3 h-3 text-red-500" />
                    <span className="text-[7px] text-slate-500 uppercase font-black tracking-[0.5em]">Zero_Exposure_Protocol</span>
                </div>
                <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-red-500" />
                    <span className="text-[7px] text-slate-500 uppercase font-black tracking-[0.5em]">Root_Access_Enabled</span>
                </div>
            </div>
        </div>
    );
}
