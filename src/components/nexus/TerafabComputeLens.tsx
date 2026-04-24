"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cpu, 
    Microscope, 
    Zap, 
    Activity, 
    Globe, 
    Layers, 
    Database,
    Binary
} from 'lucide-react';

export function TerafabComputeLens() {
    const [nodes, setNodes] = useState([
        { id: 1, asset: 'NVDA_H100', utilization: 0.94, health: 'OPTIMAL', output: '48.2 TFLOPS' },
        { id: 2, asset: 'TSM_3NM_FAB', utilization: 0.88, health: 'NOMINAL', output: '92.4% YIELD' },
        { id: 3, asset: 'AMD_MI300', utilization: 0.76, health: 'WARM', output: '32.1 TFLOPS' },
        { id: 4, asset: 'INTEL_PHASE', utilization: 0.42, health: 'CRITICAL', output: 'CHURN_OFFLINE' }
    ]);

    return (
        <div className="w-full h-full bg-[#020617]/80 backdrop-blur-[40px] border border-cyan-500/20 rounded-3xl p-6 flex flex-col font-mono relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-none">
                        <Cpu className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Terafab Compute Lens</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Silicon Intelligence // Sovereign Compute</p>
                    </div>
                </div>
                <div className="bg-black/60 px-3 py-1 border border-cyan-500/20 rounded-sm">
                    <span className="text-[10px] text-cyan-400 font-black">COMPUTE_ACTIVE</span>
                </div>
            </div>

            {/* Compute Nodes */}
            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {nodes.map((node, i) => (
                    <motion.div
                        key={node.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 bg-slate-900/60 border border-white/5 rounded-none flex flex-col gap-4 group/node hover:border-cyan-500/30 transition-all"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-sm ${
                                    node.health === 'OPTIMAL' ? 'bg-slate-800 ' :
                                    node.health === 'NOMINAL' ? 'bg-cyan-500 ' : 'bg-red-500 '
                                }`} />
                                <span className="text-xs font-black text-white uppercase tracking-widest">{node.asset}</span>
                            </div>
                            <span className="text-[8px] text-slate-500 font-mono italic">{node.output}</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[7px] text-slate-500 uppercase font-black">
                                <span>Utilization</span>
                                <span className="text-cyan-400">{(node.utilization * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-sm overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${node.utilization * 100}%` }}
                                    className={`h-full ${
                                        node.health === 'OPTIMAL' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-red-500'
                                    }`}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Global Compute Aesthetic */}
            <div className="mt-6 flex justify-between items-center opacity-40">
                <div className="flex gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-1 h-3 bg-cyan-500/20 rounded-sm" />
                    ))}
                </div>
                <Database className="w-3 h-3 text-cyan-500" />
            </div>
        </div>
    );
}
