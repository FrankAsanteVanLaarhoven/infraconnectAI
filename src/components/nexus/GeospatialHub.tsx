"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Map as MapIcon, 
    Search, 
    Navigation, 
    Building2, 
    PieChart, 
    Activity, 
    Zap,
    Filter,
    LocateFixed,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BusinessEntity {
    id: string;
    name: string;
    category: string;
    location: string;
    coordinates: { x: number; y: number };
    growth: string;
    status: 'ACTIVE' | 'TARGET' | 'TRANSFORMED';
}

const MOCK_BUSINESSES: BusinessEntity[] = [
    { id: 'B1', name: 'NEURO_GEN SYSTEMS', category: 'Adv-Computing', location: 'London, UK', coordinates: { x: 45, y: 32 }, growth: '+124%', status: 'TARGET' },
    { id: 'B2', name: 'SMR_QUANTUM FLEET', category: 'Energy', location: 'Tokyo, JP', coordinates: { x: 78, y: 56 }, growth: '+85%', status: 'ACTIVE' },
    { id: 'B3', name: 'BIOME_INTEL CORE', category: 'Bio-Tech', location: 'San Francisco, US', coordinates: { x: 12, y: 44 }, growth: '+210%', status: 'TRANSFORMED' }
];

export function GeospatialHub() {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

    const handleSearch = () => {
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 1500);
    };

    return (
        <div className="w-full h-full bg-slate-950/90 backdrop-blur-3xl border border-slate-800 rounded-none p-6 flex flex-col font-mono relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <MapIcon className="w-5 h-5 text-slate-300" />
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Geospatial Intelligence Hub</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Gemma-9B // Apache 2.0 Sovereign Core</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded">
                        <LocateFixed className="w-3 h-3 text-indigo-400" />
                        <span className="text-[8px] text-indigo-400 font-black uppercase tracking-widest">Global Scan Active</span>
                    </div>
                </div>
            </div>

            {/* Semantic Search Entry */}
            <div className="mb-6 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[7px] font-black tracking-widest uppercase">Gemini Ask</span>
                </div>
                <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="QUERY: 'FIND HIGH-GROWTH DATA CENTERS IN SOUTHEAST ASIA'..."
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-sm py-4 pl-32 pr-4 text-[11px] text-white focus:outline-none focus:border-slate-700 transition-all font-mono placeholder:text-slate-700 uppercase"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                {isSearching && (
                    <motion.div 
                        layoutId="searchPulse"
                        className="absolute bottom-0 left-0 h-0.5 bg-slate-800"
                        animate={{ width: ['0%', '100%'] }}
                        transition={{ duration: 1.5 }}
                    />
                )}
            </div>

            {/* Main Map Interface (Abstracted) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                <div className="lg:col-span-2 relative bg-slate-900/30 border border-slate-800/50 rounded-none overflow-hidden group/map">
                    {/* Simulated Map Grid */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" 
                         style={{ backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
                    
                    {/* Map Entities */}
                    {MOCK_BUSINESSES.map((b) => (
                        <motion.div 
                            key={b.id}
                            style={{ left: `${b.coordinates.x}%`, top: `${b.coordinates.y}%` }}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setSelectedEntity(b.id)}
                            className={`absolute w-4 h-4 rounded-sm border-2 cursor-pointer z-10 ${
                                selectedEntity === b.id 
                                ? 'bg-slate-800 border-white ' 
                                : 'bg-slate-950 border-slate-700 hover:border-slate-700'
                            }`}
                        >
                            <AnimatePresence>
                                {selectedEntity === b.id && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 p-3 rounded-sm w-48 shadow-2xl z-20"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[9px] font-black text-white uppercase">{b.name}</span>
                                            <span className="text-[7px] text-slate-300 font-bold">{b.growth}</span>
                                        </div>
                                        <p className="text-[7px] text-slate-500 uppercase italic mb-2">{b.location}</p>
                                        <Button className="w-full py-1 h-auto text-[7px] bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                                            Ingest to Ontology
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}

                    {/* Coordinates Readout */}
                    <div className="absolute bottom-4 left-4 flex gap-4 text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                        <span>LAT: 51.5074 N</span>
                        <span>LON: 0.1278 W</span>
                        <span>ALT: 42k METERS</span>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="flex flex-col gap-4">
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Discovery Feed</span>
                            <Filter className="w-3 h-3 text-slate-600" />
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-[200px] custom-scrollbar pr-2">
                            {MOCK_BUSINESSES.map(b => (
                                <div 
                                    key={b.id} 
                                    onClick={() => setSelectedEntity(b.id)}
                                    className={`p-2 rounded border cursor-pointer transition-all ${
                                        selectedEntity === b.id ? 'bg-slate-800 border-slate-700' : 'bg-slate-950 border-slate-800/50 hover:bg-slate-900'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[8px] font-bold text-white uppercase truncate">{b.name}</span>
                                        <Activity className="w-2.5 h-2.5 text-slate-300" />
                                    </div>
                                    <span className="text-[7px] text-slate-500 uppercase tracking-tighter">{b.category}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-800 border border-slate-700 rounded-sm space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-slate-300" />
                            <span className="text-[9px] text-slate-300 uppercase font-black tracking-widest">Strategic Pulse</span>
                        </div>
                        <p className="text-[8px] text-slate-400 leading-relaxed uppercase italic">
                            Gemini has identified 14 high-growth business clusters in the current viewport. Recommend "Timeline Collapse" for immediate asset alignment.
                        </p>
                        <Button className="w-full bg-slate-800 hover:bg-slate-800 text-white font-black uppercase text-[9px] py-4 rounded-sm tracking-widest flex items-center justify-center gap-2">
                            <Navigation className="w-3 h-3" />
                            Auto-Calibrate Missions
                        </Button>
                    </div>
                </div>
            </div>

            {/* Background Map Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:100px_100px]" />
        </div>
    );
}
