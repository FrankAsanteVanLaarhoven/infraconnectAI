"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, ChevronDown, Monitor, Map as MapIcon, 
  Box, ZoomIn, Compass, Layers, Info, ShieldOff, 
  Activity, Target, Satellite, Waves, Eye, Clock
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from '@/components/providers/LocalizationProvider';

export function TimelineController() {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [mapMode, setMapMode] = useState('AERIAL');
  const [speed, setSpeed] = useState('1d/s');
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [currentMission, setCurrentMission] = useState<string | null>(null);

  const missions = [
    "CEASEFIRE RESCUE // PHASE 4",
    "GULF TRAFFIC MONITOR // CARGO",
    "DEAL PIPELINE // MARITIME",
    "ENERGY INFRA // THERMAL SCAN",
    "COUNTER-PIRACY // SOCOTRA",
    "HORMUZ PASSAGE // SENSOR-NET"
  ];

  const markers = [
    { pos: 15, color: 'emerald', requirement: 'US+Israel -> Iran', detail: 'SAR Pass 028 // Optical Confirmation' },
    { pos: 28, color: 'emerald', requirement: 'Fleet Deployment', detail: 'USS Gerald R. Ford Sector Entry' },
    { pos: 35, color: 'rose', requirement: 'Iran -> US', detail: 'Ballistic Trajectory Intercept // Aegis Lock' },
    { pos: 42, color: 'rose', requirement: 'Standoff Entry', detail: 'Airspace Boundary Violation 042' },
    { pos: 55, color: 'emerald', requirement: 'Neutrality Pact', detail: 'Diplomatic Channel Alpha Active' },
    { pos: 68, color: 'cyan', requirement: 'Hormuz Closure', detail: 'Strategic Choke Point Lockdown' },
    { pos: 72, color: 'rose', requirement: 'Energy Strike', detail: 'Refinery Alpha Thermal Surge' },
    { pos: 88, color: 'cyan', requirement: 'Recon Sweep', detail: 'Global Hawk 12 High Altitude Pass' },
  ];

  const speeds = ['30m/s', '1h/s', '6h/s', '12h/s', '1d/s'];

  return (
    <div className="w-full bg-slate-950/95 backdrop-blur-3xl border-t border-cyan-500/20 font-mono select-none flex flex-col items-center py-6 px-10 relative overflow-hidden">
      {/* BACKGROUND ACTIVITY HEATMAP MESH */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 opacity-10 flex justify-around pointer-events-none">
         {[...Array(20)].map((_, i) => (
            <div key={i} className="w-px h-full bg-slate-800" />
         ))}
      </div>

      {/* TOP: TACTICAL ORBITAL HEADER */}
      <div className="w-full flex items-center justify-between mb-8 relative z-50">
         <div className="flex items-center gap-8">
            <div className="relative">
               <span className="text-[8px] text-slate-500 uppercase tracking-[0.3em] block mb-1">{t('panel.mission_scene')}</span>
               <button 
                 onClick={() => setIsMissionOpen(!isMissionOpen)}
                 className={`flex items-center gap-3 bg-slate-900/50 border px-4 py-2 rounded-lg transition-all ${isMissionOpen ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-slate-700/50 hover:border-slate-600'}`}
               >
                  <Monitor className={`w-3 h-3 ${currentMission ? 'text-cyan-400' : 'text-slate-600'}`} />
                  <span className={`text-xs font-black uppercase tracking-widest ${currentMission ? 'text-white' : 'text-slate-500 italic'}`}>
                    {currentMission || t('mission.reset_standby')}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isMissionOpen ? 'rotate-180' : ''}`} />
               </button>

               <AnimatePresence>
                 {isMissionOpen && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="absolute top-full left-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-2xl border border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden"
                   >
                     {missions.map(m => (
                       <button 
                         key={m}
                         onClick={() => {
                           setCurrentMission(m);
                           setIsMissionOpen(false);
                         }}
                         className="w-full text-left px-4 py-3 text-[10px] font-black text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/20 border-b border-slate-800/50 transition-colors uppercase tracking-widest"
                       >
                         {m}
                       </button>
                     ))}
                     <button 
                       onClick={() => {
                         setCurrentMission(null);
                         setIsMissionOpen(false);
                       }}
                       className="w-full text-left px-4 py-3 text-[10px] font-black text-rose-500/60 hover:text-rose-400 hover:bg-rose-950/20 transition-colors uppercase tracking-widest"
                     >
                       {t('mission.reset_standby')}
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            <div className="h-10 w-px bg-slate-800" />

            <div className="flex flex-col gap-1">
               <span className="text-[8px] text-slate-500 uppercase tracking-[0.3em]">{t('panel.ops_timeline')}</span>
               <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Apr 2 — Apr 8, 2026 // {t('mission.active_response')}</span>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
               <span className="text-[8px] text-slate-500 uppercase tracking-[0.3em]">{t('panel.master_clock')}</span>
               <div className="text-sm font-black text-cyan-400 tracking-[0.2em] flex items-center gap-3">
                  <Clock className="w-4 h-4" /> 20:39:52 <span className="text-slate-600">UTC</span>
               </div>
            </div>

            <div className="flex flex-col gap-1">
               <span className="text-[8px] text-slate-500 uppercase tracking-[0.3em]">Map Projection</span>
               <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
                  {['AERIAL', 'TACTICAL', 'ORBITAL'].map(m => (
                     <button 
                        key={m}
                        onClick={() => setMapMode(m)}
                        className={`px-4 py-1.5 rounded-md text-[9px] font-black transition-all ${mapMode === m ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-600 hover:text-slate-300'}`}
                     >
                        {m}
                     </button>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* MID: THE CHRONOS ARC (KINETIC TIMELINE) */}
      <div className="w-full flex items-center gap-10 mb-8 relative z-20">
         <div className="flex flex-col items-center gap-2">
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setIsPlaying(!isPlaying)}
             className={`p-5 rounded-full border transition-all shadow-2xl ${isPlaying ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'}`}
           >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
           </motion.button>
           {isRecording && (
             <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
               <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest">● REC</span>
             </div>
           )}
         </div>

         <div className="flex-1 relative h-20 group">
             {/* LIVE SENSOR ARRAY OVERLAY */}
             <div className="absolute -top-6 left-0 flex items-center gap-3">
                <div className="flex items-center gap-2 px-2 py-0.5 bg-cyan-950/30 border border-cyan-500/30 rounded text-[7px] font-black text-cyan-400 tracking-[0.2em] uppercase">
                   <Activity className="w-2.5 h-2.5 animate-pulse" /> {t('sensor.live_array')}
                </div>
                <div className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">{t('sensor.stream')}: 884.2 Mbps</div>
             </div>

             {/* SVG CHRONOS ARC */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
               <defs>
                  <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" stopColor="transparent" />
                     <stop offset="68%" stopColor="#22d3ee" stopOpacity="0.8" />
                     <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
               </defs>
               {/* Fixed Background Arc */}
               <path d="M 0 40 Q 500 20 1000 40" stroke="#1e293b" strokeWidth="2" fill="none" className="w-full" />
               {/* Dynamic Progress Arc */}
               <path d="M 0 40 Q 500 20 680 34" stroke="url(#arcGlow)" strokeWidth="3" fill="none" />
            </svg>

            {/* EVENT MARKER PORTHOLES */}
            {markers.map((m, i) => (
               <div key={i} className="absolute" style={{ left: `${m.pos}%`, top: '35%' }}>
                  <motion.div 
                    onHoverStart={() => setHoveredEvent(i)}
                    onHoverEnd={() => setHoveredEvent(null)}
                    className={`w-3 h-3 rounded-full border-2 border-black cursor-pointer shadow-[0_0_15px_currentColor] ${m.color === 'rose' ? 'bg-rose-500 text-rose-500' : m.color === 'emerald' ? 'bg-emerald-500 text-emerald-500' : 'bg-cyan-500 text-cyan-500'}`}
                  />
                  
                  <AnimatePresence>
                     {hoveredEvent === i && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 pointer-events-none"
                        >
                           <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1 font-bold">{t('timeline.event_context')}</div>
                           <h4 className={`text-[10px] font-black uppercase mb-1 ${m.color === 'rose' ? 'text-rose-400' : 'text-cyan-400'}`}>{m.requirement}</h4>
                           <p className="text-[8px] text-slate-400 leading-tight uppercase font-medium">{m.detail}</p>
                           <div className="mt-2 flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-green-500" />
                              <span className="text-[7px] text-slate-500 uppercase">{t('timeline.sensor_available')}</span>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            ))}

            {/* MAIN PLAYHEAD (GOD'S EYE) */}
            <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 z-30 cursor-pointer pointer-events-none" style={{ left: '68%' }}>
               <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full animate-pulse" />
               <div className="absolute inset-1 border-2 border-cyan-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff]" />
               </div>
            </div>
         </div>
      </div>

      {/* BOTTOM: MULTI-CAPABILITY DECK */}
      <div className="w-full grid grid-cols-4 gap-10 items-center border-t border-slate-900 pt-6 relative z-10">
         {/* Cap 1: Dynamic Playback */}
         <div className="flex flex-col gap-3">
            <span className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-black">Simulation Rate</span>
            <div className="flex bg-slate-900/50 p-1 border border-slate-800 rounded-lg">
               {speeds.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSpeed(s)}
                    className={`flex-1 py-2 text-[9px] font-black rounded transition-all ${speed === s ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}
                  >
                     {s}
                  </button>
               ))}
            </div>
         </div>

         {/* Cap 2: Orbital Dynamics */}
         <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
               <span className="text-[9px] text-slate-500 uppercase tracking-[0.3em] font-black">Orbital Sway</span>
               <span className="text-[9px] text-cyan-400 font-black">7.4° NADIR</span>
            </div>
            <div className="flex items-center gap-4">
               <Waves className="w-4 h-4 text-cyan-500 animate-pulse" />
               <Slider defaultValue={[4]} max={20} className="flex-1" />
            </div>
         </div>

         {/* Cap 3: Intelligence Toggles */}
         <div className="col-span-2 flex flex-wrap justify-end gap-2">
            {[
               { icon: Eye, label: 'SYNDICATED INTEL', active: true, color: 'text-cyan-400' },
               { icon: Target, label: 'KINETIC STRIKES', active: true, color: 'text-rose-500' },
               { icon: Satellite, label: 'SAR OVERLAYS', active: false, color: 'text-emerald-400' },
               { icon: Waves, label: 'ENERGY FLOW', active: true, color: 'text-cyan-400' },
               { icon: ShieldOff, label: 'RESTRICTIONS', active: false, color: 'text-rose-500' },
            ].map(cap => (
               <button 
                 key={cap.label}
                 className={`flex items-center gap-2 px-4 py-2 rounded border text-[9px] font-black tracking-widest transition-all ${cap.active ? 'bg-slate-900 border-white/10 ' + cap.color : 'bg-transparent border-slate-800 text-slate-700'}`}
               >
                  <cap.icon className="w-3 h-3" />
                  {cap.label}
               </button>
            ))}
         </div>
      </div>
    </div>
  );
}
