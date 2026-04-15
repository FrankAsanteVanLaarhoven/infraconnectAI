"use client";

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  ReferenceLine
} from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';

const data = [
  { time: '00:00', price: 72.5 },
  { time: '04:00', price: 73.2 },
  { time: '08:00', price: 75.8 },
  { time: '12:00', price: 74.5 },
  { time: '16:00', price: 77.1 },
  { time: '20:00', price: 76.4 },
  { time: '23:59', price: 78.9 },
];

export function MetricLensChart({ title = "PRICE INDEX", unit = "USD/BBL" }) {
  return (
    <div className="w-full h-full flex flex-col p-4 font-mono">
      {/* Metric Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-500 opacity-60 mb-1">{title}</div>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            78.92 <span className="text-[10px] font-normal text-slate-500">{unit}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-green-500 flex items-center justify-end gap-1">
            <TrendingUp className="w-3 h-3" /> +2.4%
          </div>
          <div className="text-[10px] text-slate-600 uppercase">24H DELTA</div>
        </div>
      </div>

      {/* Chart Lens View */}
      <div className="flex-1 w-full relative min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: '#475569' }} 
            />
            <YAxis 
              hide 
              domain={['dataMin - 5', 'dataMax + 5']} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', fontSize: '10px' }}
              itemStyle={{ color: '#06b6d4' }}
              cursor={{ stroke: '#06b6d4', strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#06b6d4" 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              strokeWidth={2}
            />
            {/* Playback Lens Focus Line */}
            <ReferenceLine x="16:00" stroke="#f59e0b" strokeWidth={2} label={{ value: 'FOCUS', position: 'top', fill: '#f59e0b', fontSize: 8 }} />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Subtle Lens Overlay (CSS) */}
        <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none border-l border-r border-slate-700/20" />
      </div>

      {/* Statistical Hub */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-slate-900/40 border border-slate-800 p-2 rounded">
          <div className="text-[8px] text-slate-500 uppercase mb-1">Volatility Index</div>
          <div className="text-xs text-white font-bold">14.2% LOW</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 p-2 rounded">
          <div className="text-[8px] text-slate-500 uppercase mb-1">Signal Confidence</div>
          <div className="text-xs text-amber-500 font-bold">92.4% HIGH</div>
        </div>
      </div>
    </div>
  );
}
