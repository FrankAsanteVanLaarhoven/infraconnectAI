"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Navigation, 
    Activity, 
    Zap, 
    Shield, 
    Globe,
    ExternalLink,
    ChevronRight,
    Target
} from 'lucide-react';
import { STRATEGIC_AGENTS, StrategicAgent } from '@/lib/nexus/swarm';

export function SovereignSwarmManager() {
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const activeAgent = STRATEGIC_AGENTS.find(a => a.id === selectedAgentId);

    return (
        <div className="w-full h-full bg-slate-950/90 backdrop-blur-3xl border border-slate-800 rounded-2xl p-6 flex flex-col font-mono relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Sovereign Swarm Manager</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black">Geospatial Awareness Core // SOTA 2035</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded">
                        <Globe className="w-3 h-3 text-indigo-400" />
                        <span className="text-[8px] text-indigo-400 font-black uppercase tracking-widest">Global Mesh Active</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Agent List */}
                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {STRATEGIC_AGENTS.map((agent) => (
                        <motion.div 
                            key={agent.id}
                            onClick={() => setSelectedAgentId(agent.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                selectedAgentId === agent.id 
                                ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                                : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-900 border-indigo-500/10'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Activity className={`w-3 h-3 ${agent.status === 'completed' ? 'text-emerald-500' : 'text-indigo-400 animate-pulse'}`} />
                                    <span className="text-[10px] font-black text-white uppercase">{agent.name}</span>
                                </div>
                                <span className="text-[7px] text-slate-500 font-mono italic">#{agent.id}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        animate={{ width: `${agent.progress}%` }}
                                        className="h-full bg-indigo-500"
                                    />
                                </div>
                                <span className="text-[9px] text-indigo-400 font-black">{agent.progress}%</span>
                            </div>
                            {agent.geospatial && (
                                <div className="mt-2 flex items-center gap-2">
                                    <Navigation className="w-2.5 h-2.5 text-slate-600" />
                                    <span className="text-[7px] text-slate-600 uppercase font-black truncate">Target: {agent.geospatial.targetBusiness}</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Agent Inspector */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {activeAgent ? (
                            <motion.div 
                                key={activeAgent.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="h-full flex flex-col gap-4"
                            >
                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Operational Intelligence</h3>
                                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                                    </div>
                                    <div className="space-y-2">
                                        {activeAgent.findings.map((f, i) => (
                                            <div key={i} className="flex gap-2 items-start">
                                                <ChevronRight className="w-3 h-3 text-indigo-500 mt-0.5" />
                                                <p className="text-[9px] text-slate-300 leading-relaxed font-mono italic">{f}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {activeAgent.geospatial && (
                                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Target className="w-3.5 h-3.5 text-indigo-400" />
                                                <span className="text-[9px] text-indigo-400 uppercase font-black tracking-widest">Geospatial Anchor</span>
                                            </div>
                                            <Shield className="w-3.5 h-3.5 text-emerald-500/50" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[7px] text-slate-600 uppercase font-black">Coordinates</span>
                                                <p className="text-[9px] text-slate-300 font-mono tracking-tighter">
                                                    {activeAgent.geospatial.lat.toFixed(3)}N, {activeAgent.geospatial.lng.toFixed(3)}W
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[7px] text-slate-600 uppercase font-black">Node Origin</span>
                                                <p className="text-[9px] text-indigo-400 font-mono tracking-tighter truncate">
                                                    {activeAgent.geospatial.nodeUrn}
                                                </p>
                                            </div>
                                        </div>
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[9px] py-4 rounded-lg tracking-widest mt-2">
                                            Focus HUD on Agent Location
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
                                <Users className="w-12 h-12 text-slate-700" />
                                <div>
                                    <h3 className="text-xs font-black text-slate-500 uppercase">Select an Agent</h3>
                                    <p className="text-[9px] text-slate-700 uppercase">Monitor real-world swarm activity</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Background Data Flow */}
            <div className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none opacity-[0.03] overflow-hidden">
                <motion.div 
                    animate={{ x: [-1000, 1000] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="text-[8px] whitespace-nowrap text-indigo-500 font-mono"
                >
                    {Array.from({ length: 20 }).map(() => "SWARM_DATA_PACKET_RES_SYNC_").join("")}
                </motion.div>
            </div>
        </div>
    );
}
