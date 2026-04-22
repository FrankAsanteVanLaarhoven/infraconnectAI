"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CreditCard, 
    Home, 
    ShieldCheck, 
    PiggyBank, 
    TrendingDown, 
    TrendingUp, 
    Smartphone, 
    Activity, 
    DollarSign,
    Lock,
    Zap,
    Percent
} from 'lucide-react';

interface StackMetric {
    id: string;
    label: string;
    value: string;
    health: number; // 0 to 1
    type: 'CREDIT' | 'INSURANCE' | 'MORTGAGE' | 'PENSION';
}

export function FinancialStackMatrix() {
    const [metrics] = useState<StackMetric[]>([
        { id: '1', label: 'Mortgage Debt Wall', value: '$2.4T', health: 0.42, type: 'MORTGAGE' },
        { id: '2', label: 'Apple Pay Velocity', value: '48k tps', health: 0.98, type: 'CREDIT' },
        { id: '3', label: 'Pension Resilience', value: '88.4%', health: 0.88, type: 'PENSION' },
        { id: '4', label: 'Insurance Premiums', value: '+14.2%', health: 0.65, type: 'INSURANCE' },
        { id: '5', label: 'PayPal Settlement', value: '$840M/hr', health: 0.76, type: 'CREDIT' },
    ]);

    return (
        <div className="w-full h-full bg-[#020617] border border-blue-500/20 rounded-3xl p-8 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_80px_rgba(59,130,246,0.05)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Financial Stack Matrix</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Credit & Insurance Substrate</p>
                    </div>
                </div>

                <div className="flex gap-8 items-center text-right">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Net Credit Health</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-blue-500 tracking-tighter">0.74</span>
                            <span className="text-[10px] text-emerald-500 font-black">+2.1%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Visualizer (Stack Distribution) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 relative z-10">
                {/* Metrics Stack */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 h-fit">
                    {metrics.map((m) => (
                        <motion.div 
                            key={m.id}
                            whileHover={{ y: -4 }}
                            className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col gap-4 group/card hover:bg-slate-900/60 transition-all cursor-pointer"
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-2 rounded-xl ${
                                    m.type === 'MORTGAGE' ? 'bg-red-500/10 text-red-400' :
                                    m.type === 'CREDIT' ? 'bg-blue-500/10 text-blue-400' :
                                    m.type === 'PENSION' ? 'bg-emerald-500/10 text-emerald-400' :
                                    'bg-indigo-500/10 text-indigo-400'
                                }`}>
                                    {m.type === 'MORTGAGE' && <Home className="w-4 h-4" />}
                                    {m.type === 'CREDIT' && <Smartphone className="w-4 h-4" />}
                                    {m.type === 'PENSION' && <PiggyBank className="w-4 h-4" />}
                                    {m.type === 'INSURANCE' && <ShieldCheck className="w-4 h-4" />}
                                </div>
                                <Activity className={`w-3 h-3 ${m.health > 0.8 ? 'text-emerald-500' : m.health > 0.5 ? 'text-amber-500' : 'text-red-500'}`} />
                            </div>
                            
                            <div>
                                <h4 className="text-[9px] font-black text-slate-500 uppercase mb-1">{m.label}</h4>
                                <div className="text-xl font-black text-white tracking-tighter">{m.value}</div>
                            </div>

                            {/* Health Bar */}
                            <div className="space-y-1.5 pt-2 border-t border-white/5">
                                <div className="flex justify-between text-[7px] font-black uppercase text-slate-600">
                                    <span>Stability</span>
                                    <span>{(m.health * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${m.health * 100}%` }}
                                        className={`h-full ${m.health > 0.8 ? 'bg-emerald-500' : m.health > 0.5 ? 'bg-blue-500' : 'bg-red-500'}`} 
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Tactical Payment Monitor (Visual) */}
                <div className="lg:col-span-12 bg-black/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden h-[300px] flex items-center justify-center">
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                         style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    
                    <div className="text-center space-y-4">
                        <Lock className="w-12 h-12 text-blue-500 mx-auto opacity-50" />
                        <h3 className="text-lg font-black text-white uppercase tracking-[0.4em]">Payment Substrate: LOCKED</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest max-w-[400px] mx-auto leading-relaxed">
                            Monitoring cross-border settlements via Apple Pay and PayPal. Real-time correlation between consumer debt and interest rate trajectories.
                        </p>
                        
                        {/* Live Counter (Simulated) */}
                        <div className="flex gap-4 justify-center pt-4">
                            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                                <div className="text-[8px] text-slate-500 uppercase font-black mb-1">Apple_Pay_Sync</div>
                                <div className="text-xl font-black text-white tracking-tighter">98.4%</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                                <div className="text-[8px] text-slate-500 uppercase font-black mb-1">Global_Default_Risk</div>
                                <div className="text-xl font-black text-red-500 tracking-tighter">LOW</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Status */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[7px] text-slate-800 uppercase font-black tracking-[1em] select-none">
                FINANCIAL_STACK_SURVEILLANCE_NODE_12
            </div>
        </div>
    );
}
