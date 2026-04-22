"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Monitor, 
    Cpu, 
    Terminal, 
    Zap, 
    CheckCircle2, 
    Search,
    Crosshair,
    Eye,
    Activity,
    Box,
    Globe
} from 'lucide-react';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';

interface Tool {
    name: string;
    type: string;
    detected: boolean;
    location?: string;
}

export const EnvironmentAwareness = () => {
    const [status, setStatus] = useState<'IDLE' | 'OBSERVING' | 'DECIDING' | 'ACTING'>('IDLE');
    const [tools, setTools] = useState<Tool[]>([]);
    const [sysInfo, setSysInfo] = useState<any>(null);

    useEffect(() => {
        const discover = async () => {
            setStatus('OBSERVING');
            try {
                const res = await fetch('/api/operator/discovery');
                const data = await res.json();
                if (data.success) {
                    setTools(data.detectedTools);
                    setSysInfo(data.environment);
                    setTimeout(() => setStatus('DECIDING'), 1000);
                    setTimeout(() => setStatus('ACTING'), 2000);
                }
            } catch (e) {
                setStatus('IDLE');
            }
        };

        discover();
        const interval = setInterval(discover, 30000);
        return () => clearInterval(interval);
    }, []);

    const activeTools = tools.filter(t => t.detected);

    return (
        <GlassPanel 
            glowStrong 
            scanline 
            padding="none" 
            className="w-full h-full flex flex-col font-mono relative overflow-hidden group select-none shadow-[0_0_80px_rgba(34,211,238,0.05)] bg-black/40 border-white/5"
        >
            {/* 1. CINEMATIC HEADER */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                        <Monitor className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Workspace Matrix</h2>
                        <div className="flex items-center gap-3 mt-1.5">
                             <span className="text-[8px] text-cyan-500 font-black tracking-widest uppercase">Awareness_Core_Sync</span>
                             <div className="w-1 h-1 rounded-full bg-slate-700" />
                             <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Autonomous_Active</span>
                        </div>
                    </div>
                </div>

                {/* CORE Loop Visualization */}
                <div className="flex items-center gap-6 text-[8px] font-black uppercase text-slate-600">
                    <div className={cn("flex flex-col items-center gap-1 transition-all duration-300", status === 'OBSERVING' ? 'text-cyan-400' : 'opacity-40')}>
                        <Eye className={cn("w-3.5 h-3.5", status === 'OBSERVING' && 'animate-pulse')} />
                        <span className="tracking-widest">Observe</span>
                    </div>
                    <div className="w-4 h-px bg-white/5" />
                    <div className={cn("flex flex-col items-center gap-1 transition-all duration-300", status === 'DECIDING' ? 'text-amber-500' : 'opacity-40')}>
                        <Activity className={cn("w-3.5 h-3.5", status === 'DECIDING' && 'animate-pulse')} />
                        <span className="tracking-widest">Decide</span>
                    </div>
                    <div className="w-4 h-px bg-white/5" />
                    <div className={cn("flex flex-col items-center gap-1 transition-all duration-300", status === 'ACTING' ? 'text-cyan-400' : 'opacity-40')}>
                        <Zap className={cn("w-3.5 h-3.5", status === 'ACTING' && 'animate-pulse')} />
                        <span className="tracking-widest">Act</span>
                    </div>
                </div>
            </div>

            {/* 2. NEURAL TOOL REGISTRY */}
            <div className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar relative bg-black/5">
                {activeTools.length > 0 ? (
                    activeTools.map((tool, i) => (
                        <motion.div 
                            key={tool.name}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <GlassCard className="p-4 border-white/5 bg-white/[0.02] flex justify-between items-center group hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="bg-cyan-900/40 p-2 rounded-lg group-hover:bg-cyan-500 transition-all duration-300">
                                        <Terminal className="w-4 h-4 text-cyan-400 group-hover:text-black" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[11px] font-black text-white uppercase tracking-wider">{tool.name}</div>
                                        <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2">
                                            {tool.type} <span className="text-cyan-600/60">•</span> Integrated_Module
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[8px] text-cyan-500/40 font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Ready</span>
                                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shadow-[0_0_10px_#22d3ee]" />
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-6 opacity-20">
                        <div className="relative">
                            <Box className="w-20 h-20 text-slate-700 animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Search className="w-8 h-8 text-cyan-500 animate-bounce" />
                            </div>
                        </div>
                        <div className="text-[10px] uppercase text-cyan-400 font-bold tracking-[0.5em] animate-pulse">Scanning_For_Context...</div>
                    </div>
                )}
            </div>

            {/* 3. SYSTEM SIGNATURE FOOTER */}
            {sysInfo && (
                <div className="p-5 border-t border-white/5 bg-black/40 relative z-20">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-10">
                            <div className="flex flex-col gap-1">
                                <span className="text-[7px] text-slate-600 uppercase font-black tracking-widest">Environment_OS</span>
                                <span className="text-[10px] text-white font-black uppercase">{sysInfo.os} // READY</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[7px] text-slate-600 uppercase font-black tracking-widest">Core_Arch</span>
                                <span className="text-[10px] text-white font-black uppercase">{sysInfo.arch} // LOCKED</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 px-4 py-1.5 bg-cyan-500/5 border border-cyan-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#22d3ee] animate-pulse" />
                            <span className="text-[9px] text-cyan-500 font-black uppercase tracking-[0.2em]">Autonomous_Mode: ACTIVE</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Matrix Scanline Overlay */}
            <AnimatePresence>
                {status === 'ACTING' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.05 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-cyan-500 pointer-events-none z-0"
                    />
                )}
            </AnimatePresence>
            
            <div className="absolute bottom-1 right-6 text-[8px] text-slate-800 uppercase font-black tracking-[1em] select-none z-0">
                AW_CORE_04_PULSE
            </div>
        </GlassPanel>
    );
};
