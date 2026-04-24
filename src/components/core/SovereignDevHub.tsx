"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Binary, 
    Cpu, 
    ShieldCheck, 
    Zap, 
    Lock, 
    Unlock, 
    Terminal, 
    Layers, 
    Settings, 
    CheckCircle2,
    Activity,
    ChevronRight,
    Search
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassPanel';
import { Button } from '@/components/ui/button';

export const SovereignDevHub = () => {
    const [spec, setSpec] = useState("");
    const [missionState, setMissionState] = useState<'IDLE' | 'DRAFTING' | 'SIMULATING' | 'VALIDATING' | 'AUTHORIZED'>('IDLE');
    const [progress, setProgress] = useState(0);
    const [gates, setGates] = useState([
        { id: 'S-01', name: 'Memory Integrity', status: 'pending' },
        { id: 'P-02', name: 'Physical Node Sync', status: 'pending' },
        { id: 'G-03', name: 'Legal Compliance', status: 'pending' }
    ]);

    const handleInitialize = () => {
        if (!spec) return;
        setMissionState('DRAFTING');
        setProgress(0);
    };

    useEffect(() => {
        if (missionState === 'IDLE' || missionState === 'AUTHORIZED') return;

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    if (missionState === 'DRAFTING') setMissionState('SIMULATING');
                    if (missionState === 'SIMULATING') setMissionState('VALIDATING');
                    if (missionState === 'VALIDATING') {
                        setMissionState('AUTHORIZED');
                        clearInterval(interval);
                    }
                    return 0;
                }
                return prev + 2;
            });

            // Randomly pass gates during validation
            if (missionState === 'VALIDATING' && Math.random() > 0.9) {
                setGates(prev => {
                    const next = [...prev];
                    const pending = next.find(g => g.status === 'pending');
                    if (pending) pending.status = 'passed';
                    return next;
                });
            }
        }, 100);

        return () => clearInterval(interval);
    }, [missionState]);

    return (
        <div className="w-full h-full bg-slate-950/80 backdrop-blur-2xl border border-slate-800 rounded-none p-6 flex flex-col font-mono relative overflow-hidden">
            {/* Header: Mission Context */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/20 p-2 rounded-sm">
                        <Binary className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Sovereign Development Hub</h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Autonomous Execution Matrix // v2.035</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${missionState === 'AUTHORIZED' ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        Status: {missionState}
                    </div>
                </div>
            </div>

            {/* Spec Ingest / Stream View */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="flex flex-col gap-4">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Mission Specification</p>
                    <textarea 
                        value={spec}
                        onChange={(e) => setSpec(e.target.value)}
                        placeholder="INPUT MISSION REQUIREMENTS (e.g. 'Deploy Swarm Agent to EDGE Core with Memory Integrity check'...)"
                        disabled={missionState !== 'IDLE'}
                        className="flex-1 bg-black/40 border border-slate-800 rounded-sm p-4 text-[10px] text-indigo-300 placeholder:text-slate-800 focus:border-indigo-500 outline-none transition-all resize-none custom-scrollbar uppercase leading-relaxed tracking-wider"
                    />
                    {missionState === 'IDLE' && (
                        <Button 
                            onClick={handleInitialize}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] py-4 rounded-sm tracking-[0.2em]"
                        >
                            Initialize Mission Swarm
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Validation Ledger</p>
                    <div className="flex-1 bg-black/40 border border-slate-800 rounded-sm p-4 overflow-y-auto custom-scrollbar space-y-3">
                        {missionState === 'IDLE' ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                                <Search className="w-8 h-8 text-slate-600" />
                                <span className="text-[8px] uppercase tracking-widest font-black">Waiting for Mission Sync</span>
                            </div>
                        ) : (
                            <>
                                {gates.map(gate => (
                                    <div key={gate.id} className="flex justify-between items-center p-3 bg-slate-900/40 border border-slate-800 rounded-sm group hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="text-[8px] text-slate-600 font-black">{gate.id}</div>
                                            <div className="text-[10px] font-black text-slate-300 uppercase">{gate.name}</div>
                                        </div>
                                        {gate.status === 'passed' ? (
                                            <CheckCircle2 className="w-4 h-4 text-slate-300" />
                                        ) : (
                                            <Activity className="w-4 h-4 text-indigo-500" />
                                        )}
                                    </div>
                                ))}
                                
                                <div className="mt-8 space-y-2">
                                    <div className="flex justify-between items-center text-[8px] text-indigo-400 font-black uppercase">
                                        <span>Current Phase: {missionState}</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-sm overflow-hidden">
                                        <motion.div 
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-indigo-500"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom: Authorization Locks */}
            <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-slate-600" />
                        <span className="text-[9px] text-slate-600 uppercase font-black">Node: STABLE_CORE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-500/50" />
                        <span className="text-[9px] text-slate-600 uppercase font-black">Validation: {missionState === 'AUTHORIZED' ? 'CERTIFIED' : 'PENDING'}</span>
                    </div>
                </div>

                {missionState === 'AUTHORIZED' ? (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <Button 
                            className="bg-slate-800 hover:bg-slate-800 text-white font-black uppercase text-[11px] px-8 py-6 rounded-sm tracking-[0.3em] flex items-center gap-3 border border-slate-700"
                            onClick={() => window.dispatchEvent(new CustomEvent('infraconnect:mission-signoff'))}
                        >
                            <Unlock className="w-4 h-4" />
                            COMMANDER SHIP-IT // SIGN-OFF
                        </Button>
                    </motion.div>
                ) : (
                    <div className="flex items-center gap-3 opacity-50 grayscale">
                        <Lock className="w-4 h-4 text-slate-700" />
                        <span className="text-[10px] text-slate-700 font-extrabold uppercase tracking-widest">Awaiting Validation Lock</span>
                    </div>
                )}
            </div>

            {/* Background VFX Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
                 style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
    );
};
