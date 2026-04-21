"use client";

import React, { useState } from 'react';
import { Network, Activity, Cpu, ShieldAlert, CheckCircle, Terminal, Play, Loader2, RotateCcw } from 'lucide-react';
import { useSfx } from '@/hooks/useSfx';
import { useTimelineStore } from '@/lib/store/useTimelineStore';
import { replayTimeline } from '@/lib/replay';

export const EnterpriseDemoOrchestrator = () => {
  const { playClick } = useSfx();
  const [phase, setPhase] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>(['[SYS] Awaiting presentation initialization...']);
  const [isReplaying, setIsReplaying] = useState(false);
  const { events } = useTimelineStore();

  const addLog = (msg: string) => {
      setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0,-1)}] ${msg}`]);
  };

  const dispatchToRedis = async (topic: string, payload: any) => {
      fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ overrideTopic: topic, ...payload })
      }).catch(err => console.error("Redis Sync Error", err));
  };

  const executePhaseSequence = async (targetPhase: number) => {
      playClick();
      setPhase(targetPhase);

      if (targetPhase === 1) {
          addLog('Initializing Normal Operations. Simulated robots moving...');
          addLog('Routing stream:robot.telemetry -> GREEN');
          // Emit baseline telemetry to the actual backend pipeline
          dispatchToRedis("stream:robot.telemetry", {
             robot_id: "yahboom-m3-pro",
             battery: 95.0,
             cpu_load: 0.15,
             temperature: 40.0,
             position: { x: 0, y: 0, z: 0 },
             status: "ACTIVE",
             timestamp: Date.now()
          });
      }

      if (targetPhase === 2) {
          addLog('INJECT: Simulating catastrophic Mecanum wheel slip on yahboom-m3-pro...');
          // Trigger the explicit threshold (Battery < 20 && Temp > 85.0) which forces Node-level AI resolution
          setTimeout(() => {
              addLog('stream:robot.alerts [HIGH] - Mecanum wheel suspension geometry anomaly detected.');
              dispatchToRedis("stream:robot.alerts", {
                 robot_id: "yahboom-m3-pro",
                 severity: "HIGH",
                 type: "SYSTEM_FAILURE",
                 message: "Catastrophic motor resistance across primary Mecanum actuator due to slip.",
                 timestamp: Date.now()
              });

              dispatchToRedis("stream:robot.telemetry", {
                 robot_id: "yahboom-m3-pro",
                 battery: 15.0, 
                 cpu_load: 0.95,
                 temperature: 95.5,
                 status: "ERROR",
                 timestamp: Date.now()
              });
          }, 800);
      }

      if (targetPhase === 3) {
          addLog('Agent Engine is actively scanning the Redis stream...');
          setTimeout(() => {
              addLog('Wait... UI Event Bus intercepting Node-Level agent action natively...');
          }, 1000);
      }

      if (targetPhase === 5) {
          addLog('Operator Override Requested: > Reboot Orin Inference Module yahboom-m3-pro');
          setTimeout(() => {
             addLog('Executing stream:robot.commands [RESTART_ORIN]');
             dispatchToRedis("stream:robot.commands", {
                 command_id: `sys-recv-${Date.now()}`,
                 robot_id: "yahboom-m3-pro",
                 action: "RESTART_ORIN",
                 parameters: { priority: "highest", override: true },
                 issued_by: "operator:demo",
                 timestamp: Date.now()
             });
             addLog('Deployment synced securely to Edge MQTT via Redis Fabric.');
          }, 1500);
      }

      if (targetPhase === 7) {
          addLog('Confirmation Received: Dual-Model inference stabilized. Resuming Mecanum operations.');
          addLog('Global State: Fully synced to Redis Engine across the cluster.');
          
          dispatchToRedis("stream:robot.telemetry", {
             robot_id: "yahboom-m3-pro",
             battery: 88.0, 
             cpu_load: 0.35,
             temperature: 42.0,
             status: "ACTIVE",
             timestamp: Date.now()
          });
      }
  };

  const executeReplay = async () => {
     if (events.length === 0) return;
     playClick();
     setIsReplaying(true);
     setLogs(['[SYS] TIMELINE REPLAY INITIATED...', `Replaying ${events.length} historical payloads natively over Redis.`]);
     
     await replayTimeline(events);
     
     setIsReplaying(false);
     addLog('[SYS] TIMELINE REPLAY COMPLETE.');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] p-6 text-white font-mono rounded-xl border border-white/10 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative">
      <div className="flex items-center gap-3 mb-6">
          <Terminal className="text-cyan-500 w-5 h-5" />
          <h2 className="text-sm font-black tracking-widest uppercase text-cyan-400">Enterprise Pitch Orchestrator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-0">
          
          {/* Phase Control Panel */}
          <div className="flex flex-col gap-4">
              <div className="text-[10px] text-white/40 uppercase tracking-widest border-b border-white/10 pb-2">Presentation Mechanics</div>
              
              <button onClick={() => executePhaseSequence(1)} disabled={phase >= 1} className={`flex items-center justify-between p-3 rounded border text-xs font-bold transition-all ${phase >= 1 ? 'bg-emerald-900/40 border-emerald-500/40 text-emerald-500' : 'bg-white/5 border-white/10 hover:border-cyan-500/50'}`}>
                  <span>Phase 1: Normal Ops Flow</span>
                  {phase >= 1 ? <CheckCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button onClick={() => executePhaseSequence(2)} disabled={phase >= 2 || phase < 1} className={`flex items-center justify-between p-3 rounded border text-xs font-bold transition-all ${phase >= 2 ? 'bg-red-900/40 border-red-500/40 text-red-500' : 'bg-white/5 border-white/10 hover:border-cyan-500/50'}`}>
                  <span>Phase 2: Introduce Catastrophic Anomaly</span>
                  {phase >= 2 ? <ShieldAlert className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button onClick={() => executePhaseSequence(3)} disabled={phase >= 3 || phase < 2} className={`flex items-center justify-between p-3 rounded border text-xs font-bold transition-all ${phase >= 3 ? 'bg-purple-900/40 border-purple-500/40 text-purple-500' : 'bg-white/5 border-white/10 hover:border-cyan-500/50'}`}>
                  <span>Phase 3/4: Cognitive AI Diagnostics</span>
                  {phase >= 3 ? <Activity className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button onClick={() => executePhaseSequence(5)} disabled={phase >= 5 || phase < 3} className={`flex items-center justify-between p-3 rounded border text-xs font-bold transition-all ${phase >= 5 ? 'bg-cyan-900/40 border-cyan-500/40 text-cyan-500' : 'bg-white/5 border-white/10 hover:border-cyan-500/50'}`}>
                  <span>Phase 5/6: OmniBar Auto-Execute Deployment</span>
                  {phase >= 5 ? <Network className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button onClick={() => executePhaseSequence(7)} disabled={phase >= 7 || phase < 5} className={`flex items-center justify-between p-3 rounded border text-xs font-bold transition-all ${phase >= 7 ? 'bg-emerald-900/40 border-emerald-500/40 text-emerald-500' : 'bg-white/5 border-white/10 hover:border-cyan-500/50'}`}>
                  <span>Phase 7: Full Recovery Metric Stabilization</span>
                  {phase >= 7 ? <CheckCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <div className="mt-4 border-t border-white/10 pt-4">
                  <button onClick={executeReplay} disabled={isReplaying || events.length === 0} className={`w-full flex items-center justify-between p-3 rounded border text-xs font-bold transition-all bg-purple-900/40 border-purple-500/50 text-purple-400 hover:bg-purple-900/60`}>
                      <span className="flex items-center gap-2">
                         <RotateCcw className={`w-4 h-4 ${isReplaying ? 'animate-spin' : ''}`} /> 
                         {isReplaying ? 'BROADCASTING HISTORY...' : `REPLAY SESSION (${events.length} events)`}
                      </span>
                  </button>
              </div>

          </div>

          {/* Log Intercept Window */}
          <div className="bg-black/60 border border-white/5 rounded-lg p-4 flex flex-col font-mono relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Cpu className="w-24 h-24" />
             </div>
             <div className="text-[10px] text-emerald-500 mb-4 border-b border-white/10 pb-2 z-10 flex gap-2 items-center">
                <Loader2 className="w-3 h-3 animate-spin" /> Stream Watcher Active
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 z-10 text-[10px] text-white/70">
                {logs.map((L, i) => (
                    <div key={i} className={L.includes('[HIGH]') ? 'text-red-400 font-bold' : L.includes('GREEN') ? 'text-emerald-400' : ''}>
                        {L}
                    </div>
                ))}
             </div>
          </div>

      </div>
    </div>
  );
};
