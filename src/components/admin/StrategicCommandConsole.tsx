"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ShieldCheck, Zap, Activity, Cpu } from 'lucide-react';
import { useSfx } from '@/hooks/useSfx';

interface DirectiveLog {
  id: string;
  ts: string;
  command: string;
  status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'WARNING';
}

export const StrategicCommandConsole = () => {
  const { playClick, playHov } = useSfx();
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<DirectiveLog[]>([
    { id: '1', ts: new Date().toLocaleTimeString(), command: 'REBAL_SWARM_S9', status: 'SUCCESS' },
    { id: '2', ts: new Date().toLocaleTimeString(), command: 'GEO_MESH_SYNC', status: 'SUCCESS' }
  ]);
  const [isUplinkActive, setIsUplinkActive] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSendCommand = () => {
    if (!input.trim()) return;
    playClick();
    
    const newDirective: DirectiveLog = {
      id: Math.random().toString(36).substr(2, 9),
      ts: new Date().toLocaleTimeString(),
      command: input.toUpperCase(),
      status: 'PENDING'
    };
    
    setLogs(prev => [...prev, newDirective]);
    setInput('');
    setIsUplinkActive(true);

    // Simulate AI Swarm Reaction
    setTimeout(() => {
      setLogs(prev => prev.map(l => l.id === newDirective.id ? { ...l, status: 'EXECUTING' } : l));
      setTimeout(() => {
        setLogs(prev => prev.map(l => l.id === newDirective.id ? { ...l, status: 'SUCCESS' } : l));
        setIsUplinkActive(false);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#020202]/60 backdrop-blur-2xl font-mono border border-white/[0.02] shadow-2xl overflow-hidden">
      {/* Console Header */}
      <div className="px-6 py-4 border-b border-white/[0.05] flex justify-between items-center bg-black/40">
        <div className="flex items-center gap-3">
          <Activity className={`w-4 h-4 ${isUplinkActive ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">Tactical Uplink // ACTIVE</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-[8px] text-green-500 font-black">ENCRYPTED</span>
           </div>
        </div>
      </div>

      {/* Directive Feed */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide flex flex-col gap-4">
         <AnimatePresence initial={false}>
           {logs.map((log) => (
             <motion.div 
               key={log.id}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex flex-col border-l-2 border-white/[0.05] pl-4 py-1 hover:border-cyan-500/50 transition-colors group"
             >
                <div className="flex justify-between items-center mb-1">
                   <span className="text-[8px] text-slate-600 font-bold">{log.ts}</span>
                   <span className={`text-[8px] font-black px-2 py-0.5 rounded ${
                     log.status === 'SUCCESS' ? 'text-green-500 bg-green-500/10' :
                     log.status === 'PENDING' ? 'text-amber-500 bg-amber-500/10 animate-pulse' :
                     'text-cyan-500 bg-cyan-500/10'
                   }`}>
                     {log.status}
                   </span>
                </div>
                <div className="text-[11px] font-black text-white tracking-widest group-hover:text-cyan-400 transition-colors italic">
                   {'>'} {log.command}
                </div>
             </motion.div>
           ))}
         </AnimatePresence>
         <div ref={logEndRef} />
      </div>

      {/* Input Hub */}
      <div className="p-6 border-t border-white/[0.05] bg-black/40">
         <div className="relative group">
            <input 
              type="text"
              placeholder="ENTER DIRECTIVE (e.g. DEPLOY_SWARM_9)..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendCommand()}
              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-12 py-4 text-[11px] font-black text-white placeholder:text-slate-700 outline-none focus:border-cyan-500/30 transition-all uppercase tracking-widest shadow-inner"
            />
            <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-hover:text-cyan-500 transition-colors" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <span className="text-[7px] text-slate-600 font-black tracking-widest">CMD_READY</span>
               <div className="w-2 h-2 rounded bg-white/5" />
            </div>
         </div>
         
         <div className="flex items-center justify-between mt-6">
            <div className="flex gap-4">
               {[Zap, ShieldCheck, Cpu].map((Icon, i) => (
                 <button key={i} onMouseEnter={() => playHov()} className="p-2 border border-white/5 rounded-xl text-slate-600 hover:text-cyan-400 hover:bg-white/5 transition-all">
                    <Icon className="w-3.5 h-3.5" />
                 </button>
               ))}
            </div>
            <div className="text-[7px] text-slate-700 font-bold uppercase tracking-[0.4em] italic opacity-50">
               Direct Intelligence Interface v4.0.1
            </div>
         </div>
      </div>
    </div>
  );
};
