"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Home, 
    Building2, 
    TrendingUp, 
    TrendingDown, 
    MapPin, 
    DollarSign, 
    Activity, 
    Layers, 
    Building,
    Compass,
    Landmark,
    Search
} from 'lucide-react';

interface CityProperty {
    id: string;
    city: string;
    country: string;
    residentialPrice: string;
    yield: number; // 0 to 1
    status: 'BOOM' | 'STABLE' | 'BUBBLE_RISK' | 'CORRECTING';
    sentiment: number; // 0 to 1
}

export function GlobalRealEstateRegistry() {
    const [cities] = useState<CityProperty[]>([
        { id: '1', city: 'London', country: 'UK', residentialPrice: '£740k', yield: 0.042, status: 'STABLE', sentiment: 0.65 },
        { id: '2', city: 'New York', country: 'USA', residentialPrice: '$1.2M', yield: 0.038, status: 'STABLE', sentiment: 0.72 },
        { id: '3', city: 'Mumbai', country: 'India', residentialPrice: '₹4.2Cr', yield: 0.025, status: 'BOOM', sentiment: 0.94 },
        { id: '4', city: 'Shenzhen', country: 'China', residentialPrice: '¥6.4M', yield: 0.018, status: 'CORRECTING', sentiment: 0.24 },
        { id: '5', city: 'Dubai', country: 'UAE', residentialPrice: 'AED 2.8M', yield: 0.065, status: 'BOOM', sentiment: 0.88 },
    ]);

    return (
        <div className="w-full h-full bg-[#020617] border border-amber-500/20 rounded-3xl p-8 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_80px_rgba(245,158,11,0.05)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                        <Home className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Global Real Estate Registry</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Property & Yield Substrate</p>
                    </div>
                </div>

                <div className="flex gap-8 items-center text-right">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Metropolis Yield Avg</span>
                        <span className="text-xl font-black text-amber-500 tracking-tighter">4.2%</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Commercial Debt Wall</span>
                        <span className="text-xl font-black text-red-500 tracking-tighter">$1.8T</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 relative z-10">
                {/* City List */}
                <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    <span className="text-[9px] text-slate-600 uppercase font-black border-b border-white/5 pb-2">Metropolis Index</span>
                    {cities.map((city) => (
                        <motion.div 
                            key={city.id}
                            whileHover={{ x: 4 }}
                            className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col gap-3 group/city hover:bg-slate-900 transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-white uppercase tracking-wider">{city.city}</span>
                                    <span className="text-[8px] text-slate-600 font-bold uppercase">{city.country}</span>
                                </div>
                                <div className={`px-2 py-0.5 rounded-[4px] text-[7px] font-black uppercase ${
                                    city.status === 'BOOM' ? 'bg-emerald-500/20 text-emerald-400' :
                                    city.status === 'CORRECTING' ? 'bg-red-500/20 text-red-500' :
                                    city.status === 'BUBBLE_RISK' ? 'bg-amber-500/20 text-amber-500' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>
                                    {city.status}
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[7px] text-slate-600 uppercase font-black mb-0.5">Residential Price Avg</span>
                                    <span className="text-sm font-black text-white">{city.residentialPrice}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[7px] text-slate-600 uppercase font-black mb-0.5">Rental Yield</span>
                                    <div className="text-[10px] font-black text-amber-500">{(city.yield * 100).toFixed(1)}%</div>
                                </div>
                            </div>

                            {/* Sentiment Bar */}
                            <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${city.sentiment * 100}%` }} 
                                    className={`h-full ${city.sentiment > 0.8 ? 'bg-emerald-500' : city.sentiment > 0.4 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Commercial Property Map/Visualizer */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl relative overflow-hidden p-8 flex flex-col justify-end">
                        <Building2 className="absolute w-64 h-64 text-slate-800 -top-12 -right-12 opacity-50" />
                        <Compass className="absolute w-32 h-32 text-amber-500/10 top-12 left-12 animate-spin-slow" />
                        
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-lg font-black text-white uppercase tracking-[0.2em]">Commercial Debt Wall Scrutiny</h3>
                            <p className="text-[10px] text-slate-400 font-mono leading-relaxed max-w-[380px]">
                                Tracking $1.8T in commercial real estate debt maturing in 2026. High risk concentration identified in Shenzhen and regional US markets. Real-time mapping of "Ghost Assets" vs. "Yield Fortresses."
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                    <div className="text-[7px] text-slate-500 uppercase font-black mb-1">Office_Occupancy</div>
                                    <div className="text-lg font-black text-red-500 tracking-tighter">42.4%</div>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                    <div className="text-[7px] text-slate-500 uppercase font-black mb-1">Industrial_Demand</div>
                                    <div className="text-lg font-black text-emerald-500 tracking-tighter">HIGH</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-32 bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-xl">
                                <Landmark className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-white font-black uppercase tracking-widest">Sovereign Land Registry Sync</span>
                                <span className="text-[7px] text-slate-500 uppercase font-black">Live Updates: London // Dubai // New York</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                            <span className="text-[8px] text-emerald-500 font-black">STABLE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Aesthetic */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.01]">
                <Search className="absolute w-full h-full text-amber-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
        </div>
    );
}
