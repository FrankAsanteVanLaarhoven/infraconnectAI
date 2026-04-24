"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Coins, 
    Bitcoin, 
    Layers, 
    Zap, 
    Activity, 
    Globe, 
    Cpu,
    Fingerprint,
    Lock
} from 'lucide-react';

export function DigitalMoneyMatrix() {
    const [assets, setAssets] = useState([
        { id: 1, name: 'BITCOIN', ticker: 'BTC', price: '74,408', change: '+1.46%', flow: 'INSTITUTIONAL_BUY' },
        { id: 2, name: 'ETHEREUM', ticker: 'ETH', price: '3,892', change: '+2.12%', flow: 'STAKING_INFLOW' },
        { id: 3, name: 'SOLANA', ticker: 'SOL', price: '184.20', change: '+3.45%', flow: 'NETWORK_EXPANSION' },
        { id: 4, name: 'XRP', ticker: 'XRP', price: '1.3668', change: '+1.03%', flow: 'CUSTODIAL_SETTLEMENT' }
    ]);

    return (
        <div className="w-full h-full bg-[#020617]/80 backdrop-blur-[40px] border border-amber-500/20 rounded-3xl p-6 flex flex-col font-mono relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 opacity-10 rotate-12">
                <Bitcoin className="w-48 h-48 text-amber-500" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-none">
                        <Coins className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Digital Money Matrix</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">DeFi Clusters // Sovereign Ledger</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-2 w-16 bg-slate-900 rounded-sm overflow-hidden">
                        <motion.div 
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="h-full w-1/2 bg-amber-500"
                        />
                    </div>
                </div>
            </div>

            {/* Asset List */}
            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {assets.map((asset, i) => (
                    <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-slate-900/40 border border-white/5 rounded-none flex items-center justify-between group/asset hover:border-amber-500/30 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-sm bg-black border border-white/5 flex items-center justify-center">
                                <Bitcoin className="w-5 h-5 text-amber-400/60" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-white uppercase">{asset.name}</span>
                                <span className="text-[7px] text-amber-500/60 font-bold uppercase tracking-widest">{asset.flow}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-white">${asset.price}</span>
                            <span className="text-[8px] font-black text-slate-300 font-mono tracking-tighter">{asset.change}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* DeFi Pulse */}
            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-4 relative z-10">
                {[
                    { label: 'TVL_AGGR', value: '$84.2B' },
                    { label: 'L_REWARDS', value: '12.4%' },
                    { label: 'GAS_PULSE', value: '12_GWEI' }
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center p-2 bg-amber-500/5 rounded-sm border border-amber-500/10">
                        <span className="text-[6px] text-slate-500 uppercase font-black">{stat.label}</span>
                        <span className="text-[10px] text-amber-400 font-black">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
