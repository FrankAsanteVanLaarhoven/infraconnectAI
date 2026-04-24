"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Box, 
    Cpu, 
    Network, 
    Shield, 
    Activity, 
    Zap,
    ExternalLink,
    ChevronRight,
    Filter
} from 'lucide-react';
import { ONTOLOGY_REGISTRY, OntologyObject } from '@/lib/nexus/ontology';

export function ObjectExplorer() {
    const [selectedUrn, setSelectedUrn] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const objects = ONTOLOGY_REGISTRY.filter(obj => 
        obj.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.urn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeObject = ONTOLOGY_REGISTRY.find(obj => obj.urn === selectedUrn);

    return (
        <div className="w-full h-full bg-slate-950/90 backdrop-blur-3xl border border-slate-800 rounded-none flex font-mono relative overflow-hidden group">
            {/* Left Sidebar: Object List */}
            <div className="w-1/3 border-r border-slate-800 p-4 flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Search Ontology..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-sm py-2 pl-8 pr-4 text-[10px] text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {objects.map((obj) => (
                        <div 
                            key={obj.urn}
                            onClick={() => setSelectedUrn(obj.urn)}
                            className={`p-3 rounded-sm border cursor-pointer transition-all ${
                                selectedUrn === obj.urn 
                                ? 'bg-indigo-500/10 border-indigo-500/50 ' 
                                : 'bg-transparent border-transparent hover:bg-slate-900/30'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Box className={`w-3 h-3 ${obj.category === 'ASSET' ? 'text-amber-500' : 'text-cyan-400'}`} />
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${selectedUrn === obj.urn ? 'text-white' : 'text-slate-400'}`}>
                                    {obj.displayName}
                                </span>
                            </div>
                            <div className="text-[8px] text-slate-600 truncate italic">
                                {obj.urn}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Object Inspector */}
            <div className="flex-1 p-6 relative overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activeObject ? (
                        <motion.div 
                            key={activeObject.urn}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start border-b border-slate-800 pb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded text-[7px] font-black uppercase tracking-widest">
                                            {activeObject.category}
                                        </div>
                                        <div className={`px-2 py-0.5 rounded text-[7px] font-black border uppercase tracking-widest ${
                                            activeObject.status === 'SYNCHRONIZED' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-red-500/20 text-red-400 border-red-500/30'
                                        }`}>
                                            {activeObject.status}
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">{activeObject.displayName}</h2>
                                    <p className="text-[9px] text-slate-500 font-mono italic">{activeObject.urn}</p>
                                </div>
                                <button className="p-2 bg-slate-900 border border-slate-800 rounded-sm hover:text-indigo-400 transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Attributes Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900/40 border border-slate-800/50 rounded-sm space-y-3">
                                    <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Physical Mapping</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[9px]">
                                            <span className="text-slate-600">Location</span>
                                            <span className="text-slate-300 font-bold">{activeObject.physicalMapping?.location || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px]">
                                            <span className="text-slate-600">Machine ID</span>
                                            <span className="text-indigo-400 font-mono">{activeObject.physicalMapping?.machineId || 'UNKNOWN'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px]">
                                            <span className="text-slate-600">IPv4 Stack</span>
                                            <span className="text-slate-300 font-mono">192.168.1.{Math.floor(Math.random() * 255)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-900/40 border border-slate-800/50 rounded-sm space-y-3">
                                    <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-widest">AI Digital Twin</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[9px]">
                                            <span className="text-slate-600">Agent Class</span>
                                            <span className="text-cyan-400 font-bold italic">L4 Autonomous</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px]">
                                            <span className="text-slate-600">Sync State</span>
                                            <span className="flex items-center gap-1 text-slate-300 font-bold">
                                                <Zap className="w-2.5 h-2.5" /> LIVE
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px]">
                                            <span className="text-slate-600">Refinement Log</span>
                                            <span className="text-slate-300 underline cursor-pointer">View Provenance</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Real-time Telemetry (Placeholder) */}
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-slate-300" />
                                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Sub-Latency Telemetry</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5,6,7,8].map(i => (
                                            <div key={i} className={`w-1 h-3 rounded-sm ${i % 3 === 0 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="h-1 bg-slate-900 rounded-sm overflow-hidden">
                                    <motion.div 
                                        animate={{ width: ['40%', '60%', '45%'] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="h-full bg-indigo-500/50"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <Box className="w-12 h-12 text-slate-800" />
                            <div>
                                <h3 className="text-xs font-black text-slate-500 uppercase">Select an Object</h3>
                                <p className="text-[9px] text-slate-700 uppercase">Explore the high-fidelity modeled world</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
