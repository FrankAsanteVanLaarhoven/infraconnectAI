'use client';

import { motion } from 'framer-motion';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { Leaf, Zap, Globe, Cpu } from 'lucide-react';
import { useState, useMemo } from 'react';

// Mock Energy Telemetry for visualization (maps to the new EnergyTelemetryLog DB table)
const MOCK_ENERGY_LOGS = [
  { id: '1', hardware: 'A100-Cloud (Remote)', joules: 450000, carbonGrams: 120.5 },
  { id: '2', hardware: 'Zig-WASM (Local Edge)', joules: 1500, carbonGrams: 0.2 },
  { id: '3', hardware: 'Zig-WASM (Local Edge)', joules: 1200, carbonGrams: 0.15 },
];

export function SustainabilityPanel() {
  const [activeStandard] = useState('ISO-14001:2015');

  const { totalJoules, totalCarbon, edgeSavings } = useMemo(() => {
    let joules = 0;
    let carbon = 0;
    let edgeTasks = 0;
    let cloudTasks = 0;

    MOCK_ENERGY_LOGS.forEach(log => {
      joules += log.joules;
      carbon += log.carbonGrams;
      if (log.hardware.includes('Zig')) edgeTasks++;
      else cloudTasks++;
    });

    const savings = edgeTasks > 0 ? ((edgeTasks / (edgeTasks + cloudTasks)) * 100).toFixed(1) : '0';
    return { totalJoules: (joules / 1000).toFixed(2), totalCarbon: carbon.toFixed(2), edgeSavings: savings };
  }, []);

  return (
    <GlassPanel glow className="col-span-1 h-[320px] flex flex-col relative overflow-hidden group">
      
      {/* Decorative Natural Backdrop */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none flex items-center justify-center">
        <div className="w-[300px] h-[300px] bg-emerald-600 rounded-full blur-3xl mix-blend-screen" />
      </div>

      <div className="relative z-10 flex items-center justify-between p-4 border-b border-border/5">
        <h3 className="text-sm font-semibold tracking-wider flex items-center gap-2 uppercase text-foreground/80">
          <Leaf className="w-4 h-4 text-emerald-500" />
          ESG Sustainability Audit
        </h3>
        <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-emerald-500/80 bg-emerald-500/10 px-2 py-1 rounded">
          {activeStandard}
        </div>
      </div>

      <div className="relative flex-1 z-10 flex flex-col p-4 gap-4 overflow-y-auto mt-2">
        
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-foreground/5 border border-emerald-500/20 rounded-md p-3 flex flex-col justify-center items-center text-center gap-2 relative overflow-hidden">
            <Zap className="w-4 h-4 text-emerald-400 absolute top-2 right-2 opacity-50" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 w-full text-left">Energy Draw</span>
            <span className="text-xl font-bold text-foreground w-full text-left">{totalJoules} <span className="text-xs font-normal text-muted-foreground">kJ</span></span>
          </div>
          
          <div className="bg-foreground/5 border border-border/10 rounded-md p-3 flex flex-col justify-center items-center text-center gap-2 relative overflow-hidden">
            <Globe className="w-4 h-4 text-blue-400 absolute top-2 right-2 opacity-50" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 w-full text-left">Carbon Est.</span>
            <span className="text-xl font-bold text-foreground w-full text-left">{totalCarbon} <span className="text-xs font-normal text-muted-foreground">gCO2e</span></span>
          </div>
        </div>

        {/* Edge AI Mitigation Rate */}
        <div className="flex-1 bg-foreground/5 rounded-md border border-border/10 p-4 flex items-center justify-between mt-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono text-muted-foreground">Zig Edge AI Offloading</span>
            <span className="text-sm text-foreground/90">Workloads diverted from cloud</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-orange-400" />
            <span className="text-2xl font-bold text-emerald-500">{edgeSavings}%</span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
