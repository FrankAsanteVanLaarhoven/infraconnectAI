"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Layers, 
    Database, 
    ShieldCheck, 
    Zap, 
    ArrowRight,
    Search,
    Filter,
    Activity,
    Lock
} from 'lucide-react';
import { VIRTUAL_TABLE_REGISTRY } from '@/lib/nexus/ontology';

export function MedallionRefinery() {
    const [activeStrata, setActiveStrata] = useState<'BRONZE' | 'SILVER' | 'GOLD'>('BRONZE');
    const [pulsePos, setPulsePos] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPulsePos(prev => (prev + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const tables = VIRTUAL_TABLE_REGISTRY;

    return (
        <div className="w-full h-full bg-slate-950/90 backdrop-blur-3xl border border-slate-800 rounded-none p-6 flex flex-col font-mono relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Medallion Refinery</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black">Information Operationalization Engine</p>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex gap-1">
                        {['BRONZE', 'SILVER', 'GOLD'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setActiveStrata(s as any)}
                                className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase transition-all ${
                                    activeStrata === s 
                                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 ' 
                                    : 'text-slate-600 border-slate-800'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pipeline Visualizer */}
            <div className="flex-1 flex flex-col justify-center gap-8 relative px-4">
                {/* Connection Lines */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-900 overflow-hidden">
                    <motion.div 
                        className="h-full bg-cyan-500"
                        style={{ width: '20px', marginLeft: `${pulsePos}%` }}
                    />
                </div>

                <div className="grid grid-cols-3 gap-12 relative z-10">
                    {tables.map((table, idx) => (
                        <motion.div 
                            key={table.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-4 rounded-sm border transition-all cursor-pointer ${
                                activeStrata === table.strata 
                                ? 'bg-slate-900 border-cyan-500/50 ' 
                                : 'bg-slate-950/50 border-slate-800 opacity-60'
                            }`}
                            onClick={() => setActiveStrata(table.strata)}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <Database className={`w-4 h-4 ${table.strata === 'GOLD' ? 'text-amber-500' : table.strata === 'SILVER' ? 'text-slate-300' : 'text-orange-900'}`} />
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Pool: {table.id}</span>
                            </div>
                            <h3 className="text-[10px] font-black text-white uppercase mb-1">{table.name}</h3>
                            <p className="text-[8px] text-slate-500 leading-tight mb-4">{table.description}</p>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[8px]">
                                    <span className="text-slate-600 uppercase">Rows</span>
                                    <span className="text-cyan-400 font-black">{table.rowCount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[8px]">
                                    <span className="text-slate-600 uppercase">Fidelity</span>
                                    <span className="text-white font-black">{table.strata === 'GOLD' ? '100%' : table.strata === 'SILVER' ? '92%' : '44%'}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Selected Table details */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeStrata}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-sm"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Activity className="w-3 h-3 text-cyan-500" />
                            <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Active Virtual Table Schema</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tables.find(t => t.strata === activeStrata)?.schema.map((field) => (
                                <div key={field} className="px-2 py-1 bg-slate-900 border border-slate-800/50 rounded text-[8px] text-slate-300 font-bold lowercase italic">
                                    {field}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Lock className="w-2.5 h-2.5 text-slate-300" />
                                <span className="text-[8px] text-slate-300 uppercase font-black">Autonomous Governance Active</span>
                            </div>
                            <span className="text-[8px] text-slate-600">Last Refresh: Just Now</span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Background Data Stream Effect */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none opacity-[0.02] mask-gradient-to-t space-y-1">
                {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div 
                        key={i}
                        animate={{ x: [-20, 20, -20] }}
                        transition={{ duration: 5 + i, repeat: Infinity }}
                        className="text-[8px] whitespace-nowrap"
                    >
                        {"01010101010101010101010101010101010101010101010".repeat(10)}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
