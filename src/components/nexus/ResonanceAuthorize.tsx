"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, 
    ShieldCheck, 
    Lock, 
    Unlock, 
    Activity, 
    Fingerprint,
    Waves,
    Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ResonanceAuthorize() {
    const [resonance, setResonance] = useState(0);
    const [isSynchronizing, setIsSynchronizing] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!isSynchronizing || isAuthorized) return;

        const interval = setInterval(() => {
            setResonance(prev => {
                const next = prev + (Math.random() * 5);
                if (next >= 100) {
                    setIsAuthorized(true);
                    setIsSynchronizing(false);
                    return 100;
                }
                return next;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isSynchronizing, isAuthorized]);

    return (
        <div className="w-full h-full bg-slate-950/90 backdrop-blur-3xl border border-slate-800 rounded-2xl p-6 flex flex-col font-mono relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <Waves className="w-5 h-5 text-emerald-400" />
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Neural Resonance Matrix</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black">Intent-Reality Alignment</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isAuthorized ? 'bg-emerald-500 animate-pulse' : 'bg-slate-800'}`} />
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">
                        {isAuthorized ? 'Authorized' : 'Sync Pending'}
                    </span>
                </div>
            </div>

            {/* Resonance Wave Visualizer */}
            <div className="flex-1 flex flex-col items-center justify-center relative py-12">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Background Pulsing Rings */}
                    {[1, 2, 3].map((i) => (
                        <motion.div 
                            key={i}
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.3, 0.1],
                                border: isAuthorized ? '1px solid #10b981' : '1px solid #6366f1'
                            }}
                            transition={{ duration: 3 / i, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 rounded-full border border-indigo-500/20"
                        />
                    ))}

                    <div className="z-10 flex flex-col items-center gap-2">
                        {isAuthorized ? (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                    <Unlock className="w-8 h-8 text-emerald-400" />
                                </div>
                                <span className="text-[12px] text-emerald-400 font-black uppercase tracking-[0.3em]">Resonance Locked</span>
                            </motion.div>
                        ) : (
                            <motion.div className="flex flex-col items-center gap-3">
                                <Activity className={`w-12 h-12 ${isSynchronizing ? 'text-indigo-400 animate-pulse' : 'text-slate-800'}`} />
                                <span className="text-[14px] text-white font-black tracking-tighter">
                                    {resonance.toFixed(1)}%
                                </span>
                            </motion.div>
                        )}
                    </div>
                </div>
                {!isAuthorized && (
                    <p className="mt-8 text-[8px] text-slate-600 uppercase font-black tracking-widest text-center max-w-[200px] leading-relaxed italic">
                        Align your intent with the multiverse simulation to initialize reality collapse.
                    </p>
                )}
            </div>

            {/* Control Bridge */}
            <div className="mt-auto pt-6 border-t border-slate-800">
                {isAuthorized ? (
                    <Button 
                        onClick={() => window.dispatchEvent(new CustomEvent('infraconnect:timeline-collapse'))}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] py-6 rounded-xl tracking-[0.3em] shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-emerald-400/30 group"
                    >
                        <Zap className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                        Collapse Timeline into Reality
                    </Button>
                ) : (
                    <Button 
                        onClick={() => setIsSynchronizing(true)}
                        disabled={isSynchronizing}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 font-black uppercase text-[10px] py-6 rounded-xl tracking-[0.3em] border border-slate-800 flex items-center gap-3"
                    >
                        {isSynchronizing ? (
                            <>
                                <Fingerprint className="w-4 h-4 animate-pulse text-indigo-400" />
                                Synchronizing Intent...
                            </>
                        ) : (
                            <>
                                <Target className="w-4 h-4" />
                                Begin Neuro-Sync
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Fine Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:16px_16px]" />
        </div>
    );
}
