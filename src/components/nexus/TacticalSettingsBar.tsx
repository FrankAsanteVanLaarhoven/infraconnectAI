"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Monitor, 
  Zap, 
  Shield, 
  EyeOff, 
  Layout, 
  ChevronRight, 
  Play, 
  Database, 
  Target, 
  Brain, 
  Activity, 
  Cpu, 
  Settings2,
  Terminal,
  Crosshair,
  Lock,
  Layers,
  Box
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass/GlassPanel';
import { useTranslation } from '@/components/providers/LocalizationProvider';

interface PanelInfo {
    id: string;
    label: string;
    icon: any;
    status: string;
    description: string;
}

import { tacticalBus } from '@/lib/events/bus';
import { broadcastAlert } from '@/lib/notifications/notificationEngine';
import { sendBreachAlert } from '@/lib/notifications/breach-alert';

export function TacticalSettingsBar({ onReset }: { onReset?: () => void }) {
  const [sharpen, setSharpen] = useState([49]); // AI Aggression %
  const [isArmed, setIsArmed] = useState(false);
  const [activeLayout, setActiveLayout] = useState('Sovereign_09');
  const [isSyncing, setIsSyncing] = useState(false);
  const { t } = useTranslation();

  const handleArmToggle = () => {
     const nextState = !isArmed;
     setIsArmed(nextState);
     
     if (nextState) {
        tacticalBus.dispatch({ type: 'MISSION_ARM', payload: { level: 'YELLOW' } });
        broadcastAlert({
           category: 'SECURITY',
           severity: 'HIGH',
           title: 'SYSTEM ARMED',
           message: 'Autonomous agents are now authorized for external mission engagement.'
        });
        sendBreachAlert({
           email: 'founder@infraconnect.ai',
           type: 'NEW_DEVICE',
           fingerprint: 'ARM_TOGGLE'
        }).catch(console.error);
     } else {
        tacticalBus.dispatch({ type: 'MISSION_DISARM', payload: {} });
        broadcastAlert({
           category: 'SECURITY',
           severity: 'MEDIUM',
           title: 'SYSTEM DISARMED',
           message: 'External mission engagement has been locked to PASSIVE mode.'
        });
     }
  };

  useEffect(() => {
     // Broadcast aggression changes
     tacticalBus.dispatch({ type: 'MISSION_PIVOT', payload: { sector: 'STRATEGY', reason: `Aggression recalibrated to ${sharpen}%` } });
  }, [sharpen]);

  const panels: PanelInfo[] = [
    { id: 'awareness', label: t('p.awareness'), icon: Monitor, status: 'SYNC', description: 'Core Layout' },
    { id: 'acquisition', label: t('p.acquisition'), icon: Target, status: 'LIVE', description: 'Intel Feed' },
    { id: 'scalper', label: t('p.scalper'), icon: Zap, status: 'TRADING', description: 'Beyond Mastery' },
    { id: 'briefing', label: t('p.briefing'), icon: Play, status: 'READY', description: 'Swarm Opt' },
    { id: 'security', label: t('p.security'), icon: Lock, status: 'SECURE', description: 'Shield L9' },
    { id: 'layers', label: t('p.layers'), icon: Database, status: 'ACTIVE', description: 'Data Stack' },
    { id: 'intercepts', label: t('p.intercepts'), icon: Activity, status: 'STREAM', description: 'Live Signals' },
    { id: 'jitro', label: t('p.jitro'), icon: Brain, status: 'IDLE', description: 'Outcomes' },
  ];

  const handleToggle = (id: string) => {
    setIsSyncing(true);
    const e = new KeyboardEvent('keydown', { key: getShortCut(id) });
    window.dispatchEvent(e);
    setTimeout(() => setIsSyncing(false), 400);
  };

  const getShortCut = (id: string) => {
    const map: Record<string, string> = {
      'awareness': '=',
      'acquisition': 'a',
      'scalper': 'n',
      'briefing': 'b',
      'security': '-',
      'layers': '6',
      'intercepts': '7',
      'jitro': 'j'
    };
    return map[id] || '';
  };

  return (
    <div className="flex flex-col gap-6 w-72 font-mono select-none p-1">
      
      {/* 1. COMMAND CENTER (PREMIUM GRID) */}
      <div className="flex flex-col gap-4 relative">
         <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <div className="w-1 h-3 bg-cyan-500 shadow-[0_0_10px_#22d3ee]" />
               <span className="text-[11px] uppercase tracking-[0.4em] text-white font-black">{t('panel.command_center')}</span>
            </div>
            <span className={cn("text-[8px] font-black uppercase tracking-widest transition-colors", isSyncing ? "text-cyan-400" : "text-slate-700")}>
                {isSyncing ? t('status.sync_active') : t('status.matrix_idle')}
            </span>
         </div>

         <div className="grid grid-cols-2 gap-3">
            {panels.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => handleToggle(p.id)}
                  className="relative group outline-none"
                >
                   <GlassCard className="p-4 bg-white/[0.02] border-white/5 group-hover:bg-cyan-500/[0.03] group-hover:border-cyan-500/30 transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 rounded-xl group-active:scale-95 overflow-hidden">
                      {/* Internal corner markers */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 group-hover:border-cyan-500/50" />
                      
                      <div className="p-2.5 rounded-lg bg-slate-900/40 border border-white/5 group-hover:border-cyan-500/20 transition-all group-hover:shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                        <p.icon className="w-4 h-4 text-cyan-500/60 group-hover:text-cyan-400 group-hover:scale-110 transition-all" />
                      </div>
                      
                      <div className="space-y-1">
                         <div className="text-[9px] uppercase font-black text-slate-400 group-hover:text-white tracking-widest leading-none truncate w-full">
                              {p.label}
                         </div>
                         <div className="flex items-center justify-center gap-2">
                             <div className="w-1 h-1 rounded-full bg-slate-800 group-hover:bg-cyan-500 animate-pulse" />
                             <span className="text-[7px] text-slate-600 group-hover:text-cyan-600 font-bold uppercase tracking-tighter">
                                {p.status}
                             </span>
                         </div>
                      </div>
                      
                      {/* Active Indication Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-cyan-500/0 group-hover:bg-cyan-500/40 transition-all" />
                   </GlassCard>
                </button>
            ))}
         </div>
      </div>

      {/* 2. MISSION INTERLOCK (ARM/DISARM) */}
      <div className="flex flex-col gap-4">
         <button 
           onClick={handleArmToggle}
           className={cn(
             "w-full p-4 rounded-2xl border transition-all duration-500 relative overflow-hidden group/arm",
             isArmed 
               ? "bg-red-950/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]" 
               : "bg-emerald-950/10 border-emerald-500/30 hover:bg-emerald-500/10"
           )}
         >
            <div className="flex items-center justify-between relative z-10">
               <div className="flex items-center gap-3">
                  <div className={cn("p-1.5 rounded-lg border", isArmed ? "bg-red-500/20 border-red-500/40" : "bg-emerald-500/20 border-emerald-500/40")}>
                     <Crosshair className={cn("w-4 h-4", isArmed ? "text-red-500 animate-pulse" : "text-emerald-500")} />
                  </div>
                  <div className="text-left">
                     <span className={cn("text-[10px] font-black uppercase tracking-[0.3em]", isArmed ? "text-red-500" : "text-emerald-500")}>
                        {isArmed ? 'System Armed' : 'System Disarmed'}
                     </span>
                     <p className="text-[7px] text-slate-500 font-bold uppercase tracking-tighter">Autonomous Engagement Interlock</p>
                  </div>
               </div>
               <div className={cn("w-2 h-2 rounded-full", isArmed ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-emerald-900")} />
            </div>
         </button>
      </div>

      {/* 3. AI AGGRESSION (STRATEGIC MODULATOR) */}
      <div className="flex flex-col bg-black/40 border border-white/5 p-5 rounded-2xl backdrop-blur-md shadow-2xl space-y-5">
         <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
               <Settings2 className="w-4 h-4 text-amber-500" />
               <span className="text-[10px] uppercase tracking-[0.3em] text-slate-300 font-black">AI Aggression</span>
            </div>
            <span className="text-[10px] text-amber-500 font-mono font-black tabular-nums">{sharpen}%</span>
         </div>
         
         <div className="px-1">
            <Slider 
               value={sharpen} 
               onValueChange={setSharpen} 
               max={100} 
               step={1} 
               className="flex-1 amber-slider" 
            />
         </div>
         
         <div className="flex justify-between items-center text-[7px] text-slate-700 font-black uppercase tracking-[0.2em] pt-1">
            <span>Merciful</span>
            <span>Balanced</span>
            <span>Ruthless</span>
         </div>
      </div>

      {/* 3. INTERFACE OVERRIDE */}
      <div className="flex flex-col bg-slate-900/10 border border-white/5 p-5 rounded-2xl backdrop-blur-md group/profile">
         <div className="flex items-center gap-3 mb-5">
            <Cpu className="w-4 h-4 text-slate-600 group-hover/profile:text-cyan-400 transition-colors" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 group-hover/profile:text-slate-300 transition-colors">{t('panel.interface_profile')}</span>
         </div>
         <div className="flex items-center justify-between text-[11px] bg-black/40 border border-white/5 p-3 rounded-xl hover:border-cyan-500/40 transition-all cursor-pointer">
            <span className="text-slate-500 font-black uppercase tracking-widest">{t('panel.active_node')}</span>
            <div className="flex items-center gap-3 text-cyan-400 font-black tracking-tighter">
               <span className="uppercase">{activeLayout}</span>
               <ChevronRight className="w-3.5 h-3.5 rotate-90" />
            </div>
         </div>
      </div>

      {/* 4. EMERGENCY HARDWARE RESET */}
      <button 
        onClick={onReset}
        className="flex flex-col items-center justify-center bg-red-950/5 border border-red-900/20 p-6 rounded-2xl backdrop-blur-md hover:bg-red-900/10 hover:border-red-500/40 transition-all group/reset relative overflow-hidden"
      >
         {/* Background Danger Pattern */}
         <div className="absolute inset-0 opacity-[0.03] group-hover/reset:opacity-[0.05] transition-opacity pointer-events-none"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 0px, #ef4444 10px, transparent 10px, transparent 20px)' }} />
         
         <div className="flex items-center gap-4 mb-2 z-10">
            <Layout className="w-5 h-5 text-red-700 group-hover/reset:text-red-500 group-hover/reset:scale-110 group-hover/reset:rotate-90 transition-all duration-500" />
            <span className="text-[11px] uppercase tracking-[0.4em] text-red-800 group-hover/reset:text-red-500 font-black transition-colors">{t('panel.emergency_purge')}</span>
         </div>
         <p className="text-[8px] text-red-900 font-black tracking-widest uppercase z-10">{t('panel.purge_description')}</p>
      </button>

      <style jsx global>{`
        .amber-slider [data-orientation="horizontal"] {
           height: 4px !important;
           background: rgba(255, 255, 255, 0.05) !important;
         }
        .amber-slider [data-radix-collection-item] {
           background-color: #f59e0b !important;
           border-color: #f59e0b !important;
           box-shadow: 0 0 15px #f59e0b;
           width: 14px !important;
           height: 14px !important;
        }
      `}</style>
    </div>
  );
}
