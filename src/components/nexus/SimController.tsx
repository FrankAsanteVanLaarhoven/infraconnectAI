"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, 
    FastForward, 
    Rewind, 
    Play, 
    Pause, 
    History,
    FileSearch,
    Network,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SimController = () => {
    const [timeCursor, setTimeCursor] = useState(0); // -100 (Backward) to 100 (Forward)
    const [isPlaying, setIsPlaying] = useState(false);
    const [mode, setMode] = useState<'REALTIME' | 'SIMULATION'>('REALTIME');

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setTimeCursor(prev => {
                if (prev >= 100) return 0;
                return prev + 1;
            });
        }, 50);
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="w-full h-full bg-slate-950/80 backdrop-blur-2xl border border-slate-800 rounded-2xl p-6 flex flex-col font-mono relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-indigo-400" />
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Symmetric Sim-Engine</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black">Forward/Backward Modeling Core</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-tighter ${mode === 'REALTIME' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                        Mode: {mode}
                    </div>
                </div>
            </div>

            {/* Sim Visualizer Area */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <div className="w-[300px] h-[300px] border border-indigo-500 rounded-full animate-ping" />
                    <div className="absolute w-[200px] h-[200px] border border-cyan-500 rounded-full animate-pulse" />
                </div>

                <div className="z-10 text-center">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={timeCursor}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                        >
                            <div className="text-3xl font-black text-white tracking-widest">
                                {timeCursor > 0 ? `+${timeCursor}` : timeCursor}ms
                            </div>
                            <div className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em]">
                                {timeCursor > 0 ? 'Predictive Probability: 98.4%' : 'Forensic Accuracy: 99.1%'}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-6 space-y-4">
                {/* Scrubber */}
                <div className="relative h-1 bg-slate-800 rounded-full flex items-center">
                    <div className="absolute left-1/2 -top-2 w-0.5 h-5 bg-indigo-500/50" /> {/* Zero Point */}
                    <motion.div 
                        className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white] cursor-pointer"
                        style={{ left: `${(timeCursor + 100) / 2}%`, transform: 'translateX(-50%)' }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 200 }} // Custom mapping would be needed for real slider
                    />
                    <div 
                        className="h-full bg-indigo-500/30" 
                        style={{ width: `${Math.abs(timeCursor)}%`, left: timeCursor > 0 ? '50%' : `${50 + timeCursor}%` }} 
                    />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => setTimeCursor(prev => Math.max(-100, prev - 10))}
                            className="bg-slate-900 border border-slate-800 hover:text-indigo-400"
                        >
                            <Rewind className="w-4 h-4" />
                        </Button>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="bg-slate-900 border border-slate-800 hover:text-indigo-400"
                        >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => setTimeCursor(prev => Math.min(100, prev + 10))}
                            className="bg-slate-900 border border-slate-800 hover:text-indigo-400"
                        >
                            <FastForward className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button 
                        onClick={() => setMode(mode === 'REALTIME' ? 'SIMULATION' : 'REALTIME')}
                        className={`font-black uppercase text-[9px] px-6 rounded-xl tracking-widest border transition-all ${mode === 'REALTIME' ? 'bg-transparent text-slate-400 border-slate-800' : 'bg-orange-600 text-white border-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.3)]'}`}
                    >
                        {mode === 'REALTIME' ? 'Enter Sim Mode' : 'Exit Sim Mode'}
                    </Button>
                </div>
            </div>

            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                 style={{ backgroundImage: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
        </div>
    );
};
