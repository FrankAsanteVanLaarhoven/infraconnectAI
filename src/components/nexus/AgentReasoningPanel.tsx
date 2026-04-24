"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Cpu, ArrowDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTelemetry } from '@/lib/hooks/useTelemetry';
import { subscribe } from '@/lib/core/bus';

export const AgentReasoningPanel = () => {
  const { agentActions } = useTelemetry();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [bids, setBids] = useState<any[]>([]);

  // Establish continuous native listener binding Contract Net negotiations locally
  useEffect(() => {
     const unbind = subscribe("robots.bid", (bid: any) => {
         setBids(prev => [...prev.slice(-4), bid]); // Throttle arrays to max 5 items resolving UI spike lags 
     });
     
     const unbindAssigned = subscribe("tasks.assigned", (e: any) => {
         setBids(prev => [...prev.slice(-4), { robot_id: e.robot_id, task_id: "ASSIGNED", bid: 0 }]);
     });

     return () => {
         unbind();
         unbindAssigned();
     };
  }, []);

  // Maintain active visual scroll to the latest autonomous decision
  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentActions]);

  return (
    <div className="flex flex-col h-full w-full bg-[#050607] text-[#E6EDF3] font-mono text-[11px] rounded-sm border border-[#1A1D21] shadow-2xl overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-center p-3 border-b border-[#1A1D21] bg-[#0B0D0F]">
         <div className="flex items-center gap-2">
             <Cpu className="w-3 h-3 text-[#A855F7]" />
             <span className="font-bold tracking-widest uppercase text-[#A855F7]">Autonomous Operations</span>
         </div>
         <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-[#6B7280]">
            Global Event Matrix
         </div>
      </div>

      {/* REASONING LOG */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-[#050607]">

          {/* CNP NEGOTIATION AUCTION TRACKER */}
          {bids.length > 0 && (
             <div className="p-3 bg-[#0B0D0F] border-b border-[#1A1D21] mb-2 flex flex-col gap-1">
                 <div className="text-[#A855F7] font-black tracking-widest text-[9px] uppercase">Live Negotiation Engine</div>
                 {bids.map((b, i) => (
                    <div key={i} className="text-[#6B7280] text-[10px] break-all">
                        {b.robot_id} BID: <span className="text-white">{b.bid.toFixed(2)}</span> → Target: {b.task_id}
                    </div>
                 ))}
             </div>
          )}

          {agentActions.length === 0 && bids.length === 0 && (
             <div className="text-center opacity-30 mt-8 italic text-white/50">Awaiting autonomous trigger...</div>
          )}

          {agentActions.map((action, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-top-2 duration-300 border-b border-[#1A1D21] p-4 flex flex-col gap-3">
                  
                  {/* DETECT */}
                  <div className="flex gap-3">
                      <div className="flex flex-col items-center gap-1">
                          <ShieldAlert className="w-4 h-4 text-[#EAB308]" />
                          <div className="w-[1px] h-full bg-white/10 my-1"></div>
                      </div>
                      <div className="flex-1">
                          <div className="text-[#6B7280] font-bold tracking-widest uppercase text-[9px] mb-1">[ DETECTED ]</div>
                          <div className="bg-[#101317] p-2 rounded border border-[#1A1D21] text-[#9AA4AF]">
                              {action.reasonContext && Array.isArray(action.reasonContext) 
                                  ? action.reasonContext.map((r: string, idx: number) => <div key={idx}>{r}</div>) 
                                  : <div>{action.reason || "System Anomaly Isolated"}</div>
                              }
                          </div>
                      </div>
                  </div>

                  {/* DECIDE & ACT */}
                  <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                      </div>
                      <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                              <span className="text-[#6B7280] font-bold tracking-widest uppercase text-[9px]">[ DECISION & ACTION ]</span>
                              <span className="text-[#6B7280] text-[9px]">{new Date(action.timestamp || Date.now()).toISOString()}</span>
                          </div>
                          <div className="bg-[#101317] border border-[#22C55E]/30 p-2 rounded flex flex-col gap-1">
                              <div className="text-[#22C55E] font-bold">{action.decision}</div>
                              <div className="text-[#6B7280] flex items-center gap-2">
                                  Command dispatched <ArrowDown className="w-3 h-3 rotate-[-90deg] inline" /> {action.target || action.robot_id || "global_fleet"}
                              </div>
                              {/* LLM Explanation Block */}
                              {action.explanation && (
                                <div className="mt-2 text-[10px] text-white/50 border-t border-[#1A1D21] pt-2 italic">
                                  {action.explanation}
                                </div>
                              )}
                          </div>
                      </div>
                  </div>

              </div>
          ))}

          <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};
