'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHUDStore } from '@/store/hud-store';
import { useFleetStream } from '@/lib/hooks/useFleetStream';
import { Activity, ShieldAlert, Cpu, Zap, Radio, Target } from 'lucide-react';
import { initializeControlPlane } from '@/lib/nexus/orchestrator/init';

export function NeuralHUD() {
  const { isActive, toggleHUD, focusMode } = useHUDStore();
  const { events, lastTelemetry, lastIncident } = useFleetStream();
  const [glitchTrigger, setGlitchTrigger] = useState(false);

  // Initialize Sovereign Orchestration Loop
  useEffect(() => {
    initializeControlPlane();
  }, []);

  // Sync /hud command from bus
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.panel === 'hud') toggleHUD();
    };
    window.addEventListener('infraconnect:toggle-panel', handler);
    return () => window.removeEventListener('infraconnect:toggle-panel', handler);
  }, [toggleHUD]);

  // Keybinding: Cmd+H
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        toggleHUD();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleHUD]);

  // Handle Glitch Effect on Incidents
  useEffect(() => {
    if (lastIncident) {
      setGlitchTrigger(true);
      const t = setTimeout(() => setGlitchTrigger(false), 500);
      return () => clearTimeout(t);
    }
  }, [lastIncident]);

  if (!isActive) return null;

  return (
    <div className={`fixed inset-0 z-[100] pointer-events-none transition-all duration-700 ${focusMode ? 'backdrop-blur-sm' : ''}`}>
      
      {/* ── Cinematic Scanning Grid ── */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] animate-scan pointer-events-none opacity-40" />

      {/* ── Tactical Corners ── */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-500/20 m-6 rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-cyan-500/20 m-6 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-cyan-500/20 m-6 rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyan-500/20 m-6 rounded-br-xl" />

      {/* ── Left Metric HUD: System Vitals ── */}
      <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute left-12 top-1/2 -translate-y-1/2 space-y-8">
        <HudMetric label="SIGNAL DENSITY" value={(events?.length || 0) * 12} unit="Hz" icon={Activity} color="text-cyan-400" />
        <HudMetric label="NEURAL VELOCITY" value={84} unit="OPS/S" icon={Zap} color="text-yellow-400" />
        <HudMetric label="NODE INTEGRITY" value={98.4} unit="%" icon={Cpu} color="text-slate-300" />
      </motion.div>

      {/* ── Right Metric HUD: Safety & Compliance ── */}
      <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute right-12 top-1/2 -translate-y-1/2 space-y-8 text-right">
        <HudMetric align="right" label="POLICY COVERAGE" value={100} unit="%" icon={Radio} color="text-blue-400" />
        <HudMetric align="right" label="DETECTION RATE" value={2.4} unit="MS" icon={Target} color="text-slate-400" />
        <HudMetric 
          align="right" 
          label="THREAT INDEX" 
          value={lastIncident ? 88 : 4} 
          unit="LR" 
          icon={ShieldAlert} 
          color={lastIncident ? "text-red-500 " : "text-slate-500"} 
        />
      </motion.div>

      {/* ── Top Center: Neural Pulse Status ── */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500/50 mb-4">Neural HUD 2035 // Nexus Connected</div>
        <div className="flex gap-1 h-8 items-end">
           {(events || []).slice(0, 40).map((e, idx) => (
             <motion.div 
               key={idx}
               initial={{ height: 0 }}
               animate={{ height: e.type === 'telemetry' ? 24 : 8 }}
               className={`w-1 rounded-t-sm ${e.type === 'incident' ? 'bg-red-500' : 'bg-cyan-500/30'}`}
             />
           ))}
        </div>
      </div>

      {/* ── Incident Glitch Overlay ── */}
      <AnimatePresence>
        {glitchTrigger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, repeat: 3 }}
            className="absolute inset-0 bg-red-950/20 pointer-events-none mix-blend-overlay"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function HudMetric({ label, value, unit, icon: Icon, color, align = 'left' }: any) {
  return (
    <div className={`flex flex-col ${align === 'right' ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-2 mb-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black font-mono tracking-tighter ${color}`}>{value}</span>
        <span className="text-[10px] font-bold text-white/20 uppercase">{unit}</span>
      </div>
    </div>
  );
}
