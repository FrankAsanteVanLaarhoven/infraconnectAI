"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ListFilter, 
    ChevronDown, 
    Layers, 
    Activity, 
    Database, 
    DatabaseZap,
    Network,
    Terminal,
    Target,
    Zap,
    Cpu,
    Crosshair
} from 'lucide-react';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/LocalizationProvider';

export function LayerRegistryGrid() {
  const { t } = useTranslation();
  const [activeLayers, setActiveLayers] = useState(['LOGISTICS_FLOW', 'REALTIME_COMMS', 'ACCESS_POLICIES']);

  const toggleLayer = (l: string) => {
    setActiveLayers(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const layers = [
     { id: 'LOGISTICS_FLOW', label: 'Logistics_Flow' },
     { id: 'CAPACITY_INDEX', label: 'Capacity_Index' },
     { id: 'SATURATION_MAP', label: 'Saturation_Map' },
     { id: 'INFRA_NODES', label: 'Infra_Nodes' },
     { id: 'SYSTEM_ANOMALY', label: 'System_Anomaly' },
     { id: 'TELEMETRY_STRM', label: 'Telemetry_Strm' },
     { id: 'REALTIME_COMMS', label: 'Realtime_Comms' },
     { id: 'ENTERPRISE_ASSET', label: 'Enterprise_Asset' },
     { id: 'SEC_RESOURCES', label: 'Sec_Resources' },
     { id: 'ACCESS_POLICY', label: 'Access_Policy' },
     { id: 'COMPLIANCE_DRIFT', label: 'Compliance_Drift' },
     { id: 'GEOSPATIAL_HUB', label: 'Geospatial_Hub' },
  ];

  const presets = ['FULL_QUARTER', 'PRE_DEPLOY', 'POST_DEPLOY', 'STEADY_STATE'];

  return (
    <GlassPanel 
        glowStrong 
        scanline 
        padding="none" 
        className="w-full h-full flex flex-col font-mono select-none bg-black/40 border-white/5"
    >
      {/* 1. CINEMATIC TELEMETRY HEADER */}
      <div className="grid grid-cols-3 border-b border-white/5 bg-black/20 backdrop-blur-md relative z-10">
         <div className="p-5 border-r border-white/5 flex flex-col gap-1 hover:bg-cyan-500/5 transition-colors group">
            <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest group-hover:text-cyan-500 transition-colors">Vector_Filtered</span>
            <span className="text-2xl font-black text-white tabular-nums tracking-tighter drop-">10,317</span>
         </div>
         <div className="p-5 border-r border-white/5 flex flex-col gap-1 hover:bg-cyan-500/5 transition-colors group">
            <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest group-hover:text-cyan-500 transition-colors">Active_Nodes</span>
            <span className="text-2xl font-black text-cyan-500 tabular-nums tracking-tighter drop-">2,544</span>
         </div>
         <div className="p-5 flex flex-col gap-1 hover:bg-cyan-500/5 transition-colors group">
            <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest group-hover:text-cyan-500 transition-colors">Loaded_Trips</span>
            <span className="text-2xl font-black text-slate-700 group-hover:text-white tabular-nums tracking-tighter transition-colors">21,985</span>
         </div>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar bg-black/5">
         {/* 2. TACTICAL PRESETS */}
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Cpu className="w-4 h-4 text-cyan-500/60" />
               <span className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black">{t('panel.strategic_profiles')}</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
               {presets.map(p => (
                  <button 
                    key={p} 
                    className={cn(
                        "px-4 py-2 rounded-sm border text-[9px] font-black transition-all duration-300 uppercase tracking-widest",
                        p === 'FULL_QUARTER' 
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 ' 
                            : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10 hover:text-white'
                    )}
                  >
                     {p}
                  </button>
               ))}
            </div>
         </div>

         {/* 3. NEURAL LAYER GRID */}
         <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between border-t border-white/5 pt-6">
               <div className="flex items-center gap-3">
                   <Layers className="w-4 h-4 text-cyan-500" />
                   <span className="text-[11px] text-white uppercase tracking-[0.2em] font-black">{t('panel.intel_layers')}</span>
               </div>
               <div className="flex items-center gap-4">
                    <span className="text-[9px] text-cyan-500/60 font-black tracking-tighter uppercase whitespace-nowrap">
                        {activeLayers.length} Enabled_Modules
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-700" />
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
               {layers.map(layer => {
                  const isActive = activeLayers.includes(layer.id);
                  return (
                    <button 
                      key={layer.id}
                      onClick={() => toggleLayer(layer.id)}
                      className="group outline-none"
                    >
                       <GlassCard className={cn(
                           "p-4 border transition-all duration-300 flex flex-col items-center justify-center text-center gap-1.5 h-16 group-active:scale-95",
                           isActive 
                                ? 'bg-cyan-500/10 border-cyan-500/40 ' 
                                : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                       )}>
                          <span className={cn(
                              "text-[10px] font-black uppercase tracking-tighter transition-colors",
                              isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'
                          )}>
                             {layer.label}
                          </span>
                          {isActive && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-1 h-1 rounded-sm bg-cyan-400" />
                                <span className="text-[7px] text-cyan-500 font-bold uppercase tracking-widest">LIVE_STREAM</span>
                            </motion.div>
                          )}
                       </GlassCard>
                    </button>
                  );
               })}
            </div>
         </div>
         
         {/* 4. FILTER OVERRIDE */}
         <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-t border-white/5 pt-6">
               <div className="flex items-center gap-3">
                   <ListFilter className="w-4 h-4 text-amber-500" />
                   <span className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black">Tactical Filters</span>
               </div>
               <span className="text-[9px] text-slate-700 font-black uppercase tracking-widest">Override_Disabled</span>
            </div>
            <GlassCard className="p-5 border-dashed border-white/5 bg-transparent flex items-center justify-center">
                <span className="text-[9px] text-slate-700 uppercase font-black italic">Awaiting Global Sync Signal...</span>
            </GlassCard>
         </div>
      </div>

      {/* 5. NETWORK INTEGRITY FOOTER */}
      <div className="p-5 border-t border-white/5 bg-black/40 flex items-center justify-between relative z-20">
         <div className="flex items-center gap-4">
            <Database className="w-4 h-4 text-slate-700" />
            <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em]">Core Network Registry</span>
                <span className="text-[9px] text-white font-black uppercase tracking-tighter">Sovereign_Nodes_Connected</span>
            </div>
         </div>
         <div className="flex items-center gap-6 pr-2">
            <span className="text-[10px] text-white font-black tabular-nums tracking-tighter">124_VISIBLE</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
         </div>
      </div>
    </GlassPanel>
  );
}
