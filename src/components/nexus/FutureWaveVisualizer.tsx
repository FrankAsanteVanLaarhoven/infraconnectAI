"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export function FutureWaveVisualizer() {
  const points = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      x: i * 5,
      y1: 50 + Math.sin(i * 0.5) * 20 + (Math.random() - 0.5) * 5,
      y2: 50 + Math.cos(i * 0.4) * 15 + (Math.random() - 0.5) * 10,
      y3: 50 + Math.sin(i * 0.8) * 30 + (Math.random() - 0.5) * 15,
    }));
  }, []);

  const line1 = points.map(p => `${p.x},${p.y1}`).join(' ');
  const line2 = points.map(p => `${p.x},${p.y2}`).join(' ');
  const line3 = points.map(p => `${p.x},${p.y3}`).join(' ');

  return (
    <div className="w-full h-full bg-black/20 rounded-none border border-white/5 relative overflow-hidden group">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full opacity-40">
        {/* Parallel Realities (Ghost Waves) */}
        <motion.polyline
          points={line2}
          fill="none"
          stroke="#6366f1"
          strokeWidth="0.5"
          strokeDasharray="1 1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.polyline
          points={line3}
          fill="none"
          stroke="#ef4444"
          strokeWidth="0.3"
          strokeDasharray="2 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        
        {/* Live Convergence (Primary Wave) */}
        <motion.polyline
          points={line1}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1.5"
          className="drop-"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
        />
      </svg>
      
      {/* Overlay Data */}
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <span className="text-[8px] text-white font-black uppercase tracking-widest">Convergence Delta</span>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-cyan-400">0.94</span>
          <span className="text-[10px] text-slate-700 italic font-mono">CONF_SYNC</span>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
