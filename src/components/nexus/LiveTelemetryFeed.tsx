"use client";

import React, { useRef, useEffect } from 'react';
import { Terminal, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { useTelemetry } from '@/lib/hooks/useTelemetry';

export const LiveTelemetryFeed = () => {
  const { telemetry, alerts, isConnected } = useTelemetry();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic to maintain the "Alive" typewriter feel
  useEffect(() => {
      if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [telemetry, alerts]);

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] text-[#9AA4AF] font-mono text-[11px] rounded-sm border border-white/5 shadow-2xl relative overflow-hidden group">
      
      {/* HEADER */}
      <div className="flex justify-between items-center p-3 border-b border-[#1A1D21] bg-[#0B0D0F]">
         <div className="flex items-center gap-2">
             <Terminal className="w-3 h-3 text-[#4CC9F0]" />
             <span className="font-bold tracking-widest uppercase text-[#4CC9F0]">Live Telemetry Stream</span>
         </div>
         <div className="flex items-center gap-2 text-[10px]">
             {isConnected ? (
                 <span className="flex items-center gap-1.5 text-[#22C55E]">
                    <span className="w-1.5 h-1.5 rounded-sm bg-[#22C55E]"></span>
                    SECURE LINK ACQUIRED
                 </span>
             ) : (
                 <span className="flex items-center gap-1.5 text-[#EF4444]">
                    <span className="w-1.5 h-1.5 rounded-sm bg-[#EF4444]"></span>
                    LINK OFFLINE
                 </span>
             )}
         </div>
      </div>

      <div className="flex flex-1 min-h-0">
          
          {/* ALERTS PANEL (Left Column inside widget) */}
          <div className="w-1/3 border-r border-[#1A1D21] bg-[#050607] flex flex-col">
              <div className="p-2 text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#1A1D21]">Critical Intercepts</div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                 {alerts.length === 0 && (
                     <div className="text-center opacity-30 mt-4 italic">No anomalies detected.</div>
                 )}
                 {alerts.map((a, i) => (
                    <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-200 border-l-[3px] border-[#EF4444] bg-[#EF4444]/5 p-2 rounded-r flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[#EF4444] font-bold text-[10px]">
                            <ShieldAlert className="w-3 h-3" />
                            {a.robot_id} - {a.severity}
                        </div>
                        <div className="text-white/80">{a.message}</div>
                        <div className="text-[9px] opacity-40">{new Date(a.timestamp).toISOString()}</div>
                    </div>
                 ))}
              </div>
          </div>

          {/* STREAM PANEL (Right Column) */}
          <div className="w-2/3 flex flex-col relative bg-[#050607]">
             <div className="p-2 text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#1A1D21] flex justify-between items-center bg-[#0B0D0F]">
                 Raw Firehose
                 <Activity className="w-3 h-3 text-[#EAB308]" />
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5 font-['JetBrains_Mono']">
                 {telemetry.map((t, i) => (
                     <div key={i} className="animate-in fade-in duration-300 flex items-start gap-3 hover:bg-white/5 p-1 rounded transition-colors group-hover:opacity-100 opacity-90">
                         <span className="text-[#6B7280] w-[65px] shrink-0">
                             [{new Date(t.timestamp).toLocaleTimeString()}]
                         </span>
                         <span className={t.status === 'DEGRADED' || (t.status as any) === 'ERROR' ? 'text-[#EAB308]' : 'text-[#4CC9F0]'}>
                             {t.robot_id}
                         </span>
                         <span className="text-white/60">
                             BAT={t.battery.toFixed(1)}% CPU={t.cpu_load.toFixed(2)} TMP={t.temperature.toFixed(1)}C
                         </span>
                     </div>
                 ))}
                 <div ref={bottomRef} className="h-2" />
             </div>
             
             <div className="absolute inset-0 pointer-events-none shadow-[inset_0_-20px_20px_#050607]"></div>
          </div>

      </div>
    </div>
  );
};
