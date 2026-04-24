"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Wind, 
  Thermometer, 
  Zap, 
  Activity, 
  ShieldAlert, 
  HeartPulse, 
  ChevronRight, 
  Map, 
  Satellite,
  Waves
} from 'lucide-react';
import { EcologicalMetric, environmentalEngine } from '@/lib/nexus/environmentalEngine';
import { CivilizationalPulseLens } from '@/components/nexus/CivilizationalPulseLens';
import { MetricLensChart } from '@/components/nexus/MetricLensChart';

export default function EnvironmentPage() {
  const [metrics, setMetrics] = useState<EcologicalMetric[]>(environmentalEngine.getMetrics());
  const [selectedMetric, setSelectedMetric] = useState<EcologicalMetric | null>(metrics[0]);
  const [planetaryRisk, setPlanetaryRisk] = useState(0.1);

  useEffect(() => {
    const inv = setInterval(() => {
      const nextMetrics = environmentalEngine.updateMetrics();
      setMetrics([...nextMetrics]);
      setPlanetaryRisk(environmentalEngine.getOverallPlanetaryRisk());
    }, 4000);
    return () => clearInterval(inv);
  }, []);

  const getIcon = (type: string) => {
     switch(type) {
        case 'AQI': return <Wind className="w-4 h-4 text-cyan-400" />;
        case 'THERMAL': return <Thermometer className="w-4 h-4 text-amber-500" />;
        case 'SEISMIC': return <Activity className="w-4 h-4 text-indigo-400" />;
        case 'FLOOD': return <Waves className="w-4 h-4 text-cyan-600" />;
        default: return <Zap className="w-4 h-4 text-white" />;
     }
  };

  return (
    <div className="min-h-full bg-[#020202] text-slate-300 font-mono flex flex-col overflow-hidden selection:bg-slate-800">
       
       {/* Planetary Header */}
       <header className="h-20 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-8 relative z-50">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 border border-slate-700 rounded-sm">
                   <Globe className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                   <h1 className="text-xl font-black text-white uppercase tracking-[0.4em]">Planet Scan Hub</h1>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Environmental Awareness // Civilizational Pulse</p>
                </div>
             </div>
             <div className="h-8 w-[1px] bg-white/10" />
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest mb-1">Planetary Risk</span>
                <span className={`text-sm font-black tracking-widest transition-colors ${planetaryRisk > 0.5 ? 'text-red-500' : 'text-slate-300'}`}>
                   {(planetaryRisk * 100).toFixed(1)}% <span className="text-[10px] text-slate-700">MARG_OFFSET</span>
                </span>
             </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="text-right">
                <span className="text-[8px] text-slate-600 block mb-1 font-black uppercase tracking-widest">Earth OS Version</span>
                <span className="text-xs font-black text-indigo-400 flex items-center gap-2 font-mono">
                   V20.82-X-KORE
                   <div className="w-2 h-2 rounded-sm bg-indigo-500" />
                </span>
             </div>
             <div className="flex gap-2">
                {['AQI_GRID', 'SEISMIC_M', 'THERMAL_S'].map(s => (
                   <div key={s} className="px-3 py-1 bg-white/5 border border-white/10 rounded flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-sm bg-cyan-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{s}</span>
                   </div>
                ))}
             </div>
          </div>
       </header>

       <main className="flex-1 flex overflow-hidden">
          
          {/* Left: Global Planetary Matrix */}
          <div className="flex-1 relative bg-slate-950 p-8 border-r border-white/5 overflow-y-auto custom-scrollbar">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
             
             <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                
                {/* 1. Ecological Metrics Grid */}
                <section className="space-y-4">
                   <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-3">
                         <Satellite className="w-4 h-4 text-slate-300" />
                         <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Global Ecological Pulse</h2>
                      </div>
                      <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Sync Source: Earth_OS_V20</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      {metrics.map(metric => (
                         <button 
                           key={metric.id}
                           onClick={() => setSelectedMetric(metric)}
                           className={`p-6 bg-white/[0.02] border transition-all rounded-none flex flex-col gap-4 text-left group ${
                              selectedMetric?.id === metric.id ? 'border-slate-700 bg-slate-800' : 'border-white/5 hover:border-white/10'
                           }`}
                         >
                            <div className="flex justify-between items-start">
                               <div className="p-2 bg-slate-900 rounded-sm border border-white/5">
                                  {getIcon(metric.type)}
                               </div>
                               <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                  metric.status === 'CRITICAL' ? 'bg-red-500 text-black ' : 'bg-slate-800 text-slate-300'
                               }`}>
                                  {metric.status}
                               </span>
                            </div>
                            <div>
                               <h3 className="text-xs font-black text-white uppercase tracking-wider mb-1">{metric.name}</h3>
                               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{metric.location}</p>
                            </div>
                            <div className="flex items-end justify-between">
                               <span className="text-2xl font-black text-white tracking-tighter tabular-nums">
                                  {metric.value.toFixed(1)} <span className="text-[10px] text-slate-700">{metric.unit}</span>
                               </span>
                               <div className={`flex items-center gap-1 text-[10px] font-black ${metric.trend === 'UP' ? 'text-red-500' : 'text-slate-300'}`}>
                                  {metric.trend} {metric.trend === 'UP' ? '▲' : '▼'}
                               </div>
                            </div>
                         </button>
                      ))}
                   </div>
                </section>

                {/* 2. Civilizational Health (Embedded CivilizationalPulseLens replacement) */}
                <section className="h-[500px]">
                   <CivilizationalPulseLens />
                </section>

             </div>
          </div>

          {/* Right: Risk Sidebar */}
          <div className="w-[400px] flex flex-col gap-px bg-white/5 relative z-50 border-l border-white/5 overflow-y-auto custom-scrollbar">
             
             {/* 3. Deep Metric Analysis */}
             <div className="p-8 bg-black/40 space-y-8">
                <div className="flex items-center gap-3">
                   <ShieldAlert className="w-4 h-4 text-amber-500 text-red-500" />
                   <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Sovereign Risk Correlation</h2>
                </div>
                
                {selectedMetric && (
                   <div className="space-y-6">
                      <div className="p-6 bg-red-950/10 border border-red-500/20 rounded-none relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                            <Zap className="w-12 h-12 text-red-500" />
                         </div>
                         <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Ecological Threat: {selectedMetric.type}</h4>
                         <p className="text-[11px] text-slate-300 leading-relaxed">
                            {selectedMetric.name} is currently flagged as {selectedMetric.status}. Correlation analysis suggests a 12% yield delay in the agricultural sector.
                         </p>
                         <div className="mt-4 flex gap-4 text-[8px] font-black uppercase text-red-400">
                            <span>Sector_Risk: HIGH</span>
                            <span>Revenue_At_Stake: $84M</span>
                         </div>
                      </div>

                      <div className="h-[250px] bg-slate-900/10 border border-white/5 rounded-none p-4">
                         <MetricLensChart title="PLANETARY STRESS INDEX" unit="RISK%" />
                      </div>
                   </div>
                )}
             </div>

             {/* 4. Strategic Recommendations */}
             <div className="flex-1 p-8 bg-black/60 space-y-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                   <Zap className="w-4 h-4 text-cyan-400" />
                   <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Planetary Pivot Options</h2>
                </div>
                <div className="space-y-3">
                   {[
                     { label: 'Energy Shift: LNG to Solar', impact: '+12% Sustainability' },
                     { label: 'Agricultural Hedging: APAC', impact: '-8% Exposure' },
                     { label: 'Infrastructure Hardening', impact: '+15.2% Resilience' }
                   ].map((item, i) => (
                      <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-sm flex items-center justify-between group hover:border-cyan-500/30 transition-all cursor-pointer">
                         <div>
                            <span className="text-[9px] font-black text-white uppercase tracking-wider block mb-1">{item.label}</span>
                            <span className="text-[8px] text-slate-300 font-bold uppercase">{item.impact}</span>
                         </div>
                         <ChevronRight className="w-3 h-3 text-slate-800 group-hover:text-white transition-all underline" />
                      </div>
                   ))}
                </div>
             </div>

          </div>

       </main>

       {/* Global Pulse Indicator */}
       <footer className="h-8 border-t border-white/5 bg-black flex items-center justify-between px-6 text-[8px] font-black text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-sm bg-slate-800" /> PLANETARY_OS_SYNC: EARTH-V20</span>
             <span>ATMOS_FIDELITY: 99.4%</span>
             <span>CIVILIZATIONAL_PULSE: STABLE_BETA</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-slate-300 underline">ES_LOGS:ENV01</span>
             <span className="text-indigo-950 underline">SHV_GRID:PLANET_SYNX</span>
          </div>
       </footer>

    </div>
  );
}
