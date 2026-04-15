"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Circle, 
  Square, 
  Pause, 
  Play, 
  Camera, 
  Video, 
  Clock,
  ShieldAlert,
  Save,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass/GlassPanel';

export function RecordingController({ 
  onTogglePresenter,
  isPresenterActive 
}: { 
  onTogglePresenter?: () => void;
  isPresenterActive?: boolean;
}) {
  const [status, setStatus] = useState<'IDLE' | 'RECORDING' | 'PAUSED'>('IDLE');
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    let interval: any;
    if (status === 'RECORDING') {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    if (status === 'IDLE') setStatus('RECORDING');
    else if (status === 'RECORDING') setStatus('PAUSED');
    else setStatus('RECORDING');
  };

  const handleStop = () => {
    setStatus('IDLE');
    setSeconds(0);
  };

  return (
    <div className="flex flex-col gap-3">
       
       <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <Video className={cn("w-3 h-3 transition-colors", status === 'RECORDING' ? "text-red-500 animate-pulse" : "text-slate-600")} />
             <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">Capture Unit</span>
          </div>
          <span className={cn("text-[9px] font-mono font-black tabular-nums transition-colors", status === 'RECORDING' ? "text-red-500" : "text-slate-800")}>
              {formatTime(seconds)}
          </span>
       </div>

       <GlassCard className={cn(
         "p-4 bg-black/40 border-white/5 transition-all duration-500",
         status === 'RECORDING' && "border-red-900/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
       )}>
          <div className="flex items-center justify-between gap-4">
             
             {/* Main Toggle (Record/Pause) */}
             <button 
               onClick={handleToggle}
               className={cn(
                 "flex-1 group flex items-center justify-center gap-3 h-10 rounded-xl border transition-all relative overflow-hidden",
                 status === 'RECORDING' 
                   ? "bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
                   : "bg-slate-900/40 border-white/5 text-slate-500 hover:border-cyan-500/40 hover:text-cyan-400"
               )}
             >
                {status === 'RECORDING' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 group-active:scale-90 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Pause_Capture</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-3.5 h-3.5 fill-current animate-pulse group-active:scale-90 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{status === 'PAUSED' ? 'Resume_Uplink' : 'Initialize_REC'}</span>
                  </>
                )}
             </button>

             {/* Stop / Save Button */}
             <button 
               onClick={handleStop}
               disabled={status === 'IDLE'}
               className={cn(
                 "w-12 h-10 flex items-center justify-center rounded-xl border transition-all",
                 status !== 'IDLE' 
                   ? "bg-slate-900/60 border-white/10 text-white hover:bg-black hover:border-red-500/60" 
                   : "opacity-0 scale-90 pointer-events-none"
               )}
             >
                <Square className="w-3.5 h-3.5 fill-current" />
             </button>

             {/* Shortcut Screenshot */}
             <button 
               onClick={() => {}} // Screenshot logic placeholder
               className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/5 bg-slate-900/40 text-slate-500 hover:text-amber-500 hover:border-amber-500/30 transition-all group"
               title="Frame Capture"
             >
                <Camera className="w-3.5 h-3.5 group-active:scale-90 transition-transform" />
             </button>

             {/* Presenter Mode Toggle */}
             <button 
               onClick={onTogglePresenter}
               className={cn(
                 "w-10 h-10 flex items-center justify-center rounded-xl border transition-all group",
                 isPresenterActive 
                   ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]" 
                   : "bg-slate-900/40 border-white/5 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30"
               )}
               title="Presenter View (Camera)"
             >
                <User className={cn("w-3.5 h-3.5 transition-transform group-active:scale-90", isPresenterActive && "animate-pulse")} />
             </button>

          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div className={cn("w-1 h-1 rounded-full", status === 'RECORDING' ? "bg-red-500 animate-ping" : "bg-slate-800")} />
                <span className="text-[7px] text-slate-700 font-bold uppercase tracking-widest">
                   {status === 'RECORDING' ? 'LIVE_FRAME_X24' : 'UPLINK_STANDBY'}
                </span>
             </div>
             <span className="text-[7px] text-slate-900 font-black">CODEC: HVEC-SOTA</span>
          </div>
       </GlassCard>
    </div>
  );
}
