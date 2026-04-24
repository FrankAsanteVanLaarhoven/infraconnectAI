"use client";

import React from 'react';
import { AlertCircle, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export function RiskMatrix() {
  const assets = [
    { name: 'OIL [BRENT]', price: '82.40', delta: '+1.2%', risk: 'MODERATE', color: 'text-slate-300' },
    { name: 'NAT GAS [TTF]', price: '28.15', delta: '-4.6%', risk: 'CRITICAL', color: 'text-red-500' },
    { name: 'COPPER [HG]', price: '8910.0', delta: '+0.4%', risk: 'LOW', color: 'text-cyan-400' },
    { name: 'WHEAT [CBOT]', price: '542.4', delta: '0.0%', risk: 'STABLE', color: 'text-slate-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col p-4 font-mono">
      <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 opacity-80 mb-4 flex items-center gap-2">
        <AlertCircle className="w-3 h-3" /> COMMODITY RISK MATRIX
      </div>

      <div className="flex-1 space-y-2">
        {assets.map((asset, i) => (
          <div key={i} className="group relative overflow-hidden bg-slate-900/40 border border-slate-800 hover:border-cyan-500/30 transition-all p-3 rounded flex items-center justify-between">
            <div className="relative z-10">
              <p className="text-[9px] text-slate-500 mb-0.5 tracking-tighter">{asset.name}</p>
              <p className="text-sm font-black text-white">{asset.price}</p>
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="text-right">
                <div className={`text-[10px] font-bold flex items-center justify-end gap-1 ${asset.delta.startsWith('+') ? 'text-slate-300' : asset.delta.startsWith('-') ? 'text-red-500' : 'text-slate-500'}`}>
                  {asset.delta.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : asset.delta.startsWith('-') ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {asset.delta}
                </div>
                <div className={`text-[8px] font-black tracking-widest ${asset.color}`}>{asset.risk}</div>
              </div>
            </div>
            
            {/* Background Accent */}
            <div className={`absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l opacity-5 group-hover:opacity-10 transition-opacity ${asset.color.replace('text', 'from')}`} />
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-slate-800 pt-3">
        <div className="flex justify-between items-center bg-red-950/10 border border-red-900/30 p-2 rounded">
           <span className="text-[9px] font-bold text-red-500 uppercase">SYSTEM RISK INDEX</span>
           <span className="text-xs font-black text-red-200">7.42 [HIGH]</span>
        </div>
      </div>
    </div>
  );
}
