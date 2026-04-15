"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    ShieldAlert, 
    Cpu, 
    Network, 
    Terminal, 
    UserX, 
    Lock,
    Eye,
    Activity,
    LockIcon,
    AlertTriangle,
    Shield
} from 'lucide-react';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/LocalizationProvider';

export function SecurityPostureGuard() {
  const { t, isRtl } = useTranslation();
  const [data, setData] = useState<{ 
    incidents: any[], 
    devices: any[], 
    stats: { blockedAttacks: number, activeDevices: number, deviceLimit: number } 
  } | null>(null);
  const [threatLevel, setThreatLevel] = useState<'normal' | 'elevated'>('normal');
  const [scanPulse, setScanPulse] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/security/stats');
      if (!res.ok) return;
      const json = await res.json();
      setData(json);
      
      const recentIncident = json.incidents?.[0];
      if (recentIncident && (new Date().getTime() - new Date(recentIncident.ts).getTime() < 300000)) {
         setThreatLevel('elevated');
      } else {
         setThreatLevel('normal');
      }
    } catch (e) {
      console.error("Security Fetch Error:", e);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    const pulseInt = setInterval(() => setScanPulse(p => (p + 1) % 100), 50);
    return () => {
        clearInterval(interval);
        clearInterval(pulseInt);
    };
  }, []);

  const incidents = data?.incidents || [];
  const stats = data?.stats || { blockedAttacks: 0, activeDevices: 0, deviceLimit: 1 };

  return (
    <GlassPanel 
        glowStrong 
        scanline 
        padding="none" 
        className="w-full h-full flex flex-col font-mono select-none shadow-[0_0_80px_rgba(34,211,238,0.05)] bg-black/40 border-white/5"
        dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 1. CINEMATIC SECURITY HEADER */}
      <div className={cn(
        "p-6 border-b border-white/5 flex items-center justify-between transition-colors duration-700",
        threatLevel === 'elevated' ? 'bg-red-500/5' : 'bg-cyan-500/5'
      )}>
         <div className="flex items-center gap-5">
            <div className={cn(
                "p-3 rounded-2xl border transition-all duration-300",
                threatLevel === 'elevated' 
                    ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse' 
                    : 'border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
            )}>
               <Shield className={cn("w-6 h-6", threatLevel === 'elevated' ? 'text-red-500' : 'text-cyan-400')} />
            </div>
            <div>
               <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">{t('security.shield_l9')}</h3>
                    <span className={cn(
                        "px-2 py-0.5 rounded text-[7px] font-black tracking-widest border uppercase backdrop-blur-md",
                        threatLevel === 'elevated' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5'
                    )}>
                        {t(`status.${threatLevel}`)} {t('security.status')}
                    </span>
               </div>
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">{t('security.hardware_protection')}</p>
            </div>
         </div>
         <div className={cn("flex flex-col gap-1 pr-2", isRtl ? 'text-left' : 'text-right')}>
            <span className={cn("text-[8px] text-slate-600 uppercase font-black tracking-[0.2em] flex items-center gap-2", isRtl ? 'justify-start' : 'justify-end')}>
                <Activity className="w-3 h-3" /> {t('panel.threat_index')}
            </span>
            <span className={cn(
                "text-2xl font-black tracking-tighter tabular-nums",
                threatLevel === 'normal' ? 'text-cyan-500' : 'text-red-500'
            )}>
                {threatLevel === 'normal' ? '0.002' : '0.842'}<span className="text-slate-700 text-sm ml-1">σ</span>
            </span>
         </div>
      </div>

      {/* 2. TACTICAL DEFENSE METRICS */}
      <div className="grid grid-cols-2 p-6 gap-6 bg-black/5">
         <GlassCard className="p-5 border-white/5 bg-white/[0.02] flex items-center justify-between group hover:border-red-500/30 transition-all">
            <div className="space-y-1">
               <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest line-clamp-1 group-hover:text-red-500 transition-colors">{t('panel.vector_intercepts')}</span>
               <div className="text-2xl font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">{stats.blockedAttacks}</div>
            </div>
            <div className="p-2.5 bg-red-500/5 rounded-xl border border-red-500/10 group-hover:bg-red-500 group-hover:text-black transition-all">
                <UserX className="w-5 h-5 text-red-500/60 group-hover:text-inherit" />
            </div>
         </GlassCard>
         
         <GlassCard className="p-5 border-white/5 bg-white/[0.02] flex items-center justify-between group hover:border-cyan-500/30 transition-all">
            <div className="space-y-1">
               <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest line-clamp-1 group-hover:text-cyan-500 transition-colors">{t('panel.verified_signatures')}</span>
               <div className="text-2xl font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                   {stats.activeDevices}<span className="text-slate-700 text-sm ml-1">/ {stats.deviceLimit}</span>
               </div>
            </div>
            <div className="p-2.5 bg-cyan-500/5 rounded-xl border border-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                <Lock className="w-5 h-5 text-cyan-400 group-hover:text-inherit" />
            </div>
         </GlassCard>
      </div>

      {/* 3. INTERCEPT LOGS (TERMINAL VIEW) */}
      <div className="flex-1 overflow-hidden flex flex-col bg-black/10">
         <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Terminal className="w-3.5 h-3.5 text-cyan-500/60" />
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{t('security.intercept_stream')}</span>
            </div>
            <span className="text-[8px] text-slate-700 font-mono tracking-widest">LOG_CAP_v4.2</span>
         </div>
         
         <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar relative">
            <AnimatePresence mode="popLayout">
               {incidents.length > 0 ? incidents.map((incident, i) => (
                  <motion.div 
                    key={incident.id} 
                    initial={{ opacity: 0, x: isRtl ? 15 : -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center justify-between text-[10px] ${isRtl ? 'border-r-2' : 'border-l-2'} border-red-500/40 bg-white/[0.02] p-4 rounded-xl hover:bg-white/[0.04] transition-colors group/log`}
                  >
                     <div className="flex items-center gap-6">
                        <span className="text-red-500/60 font-mono font-black tracking-tighter">[{new Date(incident.ts).toLocaleTimeString()}]</span>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-white font-black uppercase tracking-tight">{incident.type}</span>
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Vector_Source: {incident.fingerprint.substring(0, 12)}...</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 opacity-40 group-hover/log:opacity-100 transition-opacity">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] text-red-500 font-black tracking-widest border border-red-500/20 px-2 py-0.5 rounded">SENTINEL_LOGGED</span>
                     </div>
                  </motion.div>
               )) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 opacity-10">
                     <ShieldCheck className="w-16 h-16 text-cyan-400" />
                     <p className="text-[10px] text-cyan-400 uppercase font-bold tracking-[0.4em]">{t('security.zero_violations')}</p>
                  </div>
               )}
            </AnimatePresence>
            
            {/* Scanline Sweep */}
            <motion.div 
                className="absolute inset-x-0 h-px bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)] pointer-events-none"
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
         </div>
      </div>

      {/* 4. SHIELD CONNECTIVITY FOOTER */}
      <div className="px-6 py-4 border-t border-white/5 bg-black/40 flex justify-between items-center relative z-20">
         <div className="flex items-center gap-4 text-[9px] text-slate-600 font-black tracking-tight uppercase">
             <span>{t('security.protocol_name')}</span>
             <div className="w-1 h-3 bg-white/5" />
             <span className="text-cyan-500/60">{t('security.cluster_auth')}</span>
         </div>
         <div className="flex items-center gap-4 px-4 py-1.5 bg-cyan-500/5 border border-cyan-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#22d3ee] animate-pulse" />
            <span className="text-[9px] text-cyan-500 font-black uppercase tracking-[0.2em]">{t('security.shield_active')}</span>
         </div>
      </div>
    </GlassPanel>
  );
}
