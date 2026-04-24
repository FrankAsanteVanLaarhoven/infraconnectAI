'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, Database, DatabaseZap, Clock, Play } from 'lucide-react';

export default function LiveDemoConsole() {
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState('');
  
  const query = "SELECT * FROM payments WHERE status = 'failed';";
  
  useEffect(() => {
    // Typewriter effect for the SQL query
    if (step === 0) {
      let i = 0;
      const interval = setInterval(() => {
        setTypedText(query.substring(0, i));
        i++;
        if (i > query.length) {
          clearInterval(interval);
          setTimeout(() => setStep(1), 800); // Pause before executing
        }
      }, 50);
      return () => clearInterval(interval);
    }
    
    if (step === 1) {
        setTimeout(() => setStep(2), 2000); // Show "Executing..." then results
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 p-8 font-mono flex items-center justify-center">
      <div className="w-full max-w-5xl border border-slate-800 bg-black rounded-sm overflow-hidden flex flex-col">
        
        {/* Terminal Header */}
        <div className="bg-[#111] border-b border-slate-800 px-4 py-2 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-500/50" />
            <div className="w-3 h-3 rounded-sm bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-sm bg-slate-800" />
          </div>
          <div className="text-[10px] text-slate-500 tracking-widest uppercase flex items-center gap-2">
            <DatabaseZap className="w-3 h-3" />
            Grok Direct Server Connector — Uplink Terminal
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 rounded-sm bg-slate-800" />
            <span className="text-[9px] text-slate-300 uppercase">Live (mTLS Tunnel)</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 flex-1 min-h-[400px]">
          <div className="flex gap-3 items-center mb-4 text-slate-400 text-sm">
            <span className="text-slate-300">root@grok-edge-node:~#</span>
            <span className="text-slate-400">./gdsc run --query</span>
          </div>

          <div className="mb-8 flex items-center gap-2 pl-4 border-l-2 border-slate-800">
             <span className="text-blue-400 font-bold">»</span>
             <span className="text-slate-200">{typedText}</span>
             {step === 0 && <span className="w-2 h-4 bg-slate-800 inline-block" />}
          </div>

          {step >= 1 && (
            <div className="mb-8 space-y-2 pl-4">
               <div className="flex items-center gap-2 text-yellow-500 text-xs">
                 <Clock className="w-3 h-3 animate-spin" />
                 <span>Transmitting payload to edge node...</span>
               </div>
               <div className="text-slate-500 text-xs font-mono">
                 [0.12s] Routing via NATS backbone...<br/>
                 [0.28s] Connected to PostgreSQL (grok_demo_db)...
               </div>
            </div>
          )}

          {step >= 2 && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                <div className="flex items-center justify-between bg-red-950/30 border border-red-900/50 px-4 py-2 mb-4 rounded">
                  <span className="text-red-400 text-xs uppercase font-bold tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Query Executed Successfully (1 Rows Returned)
                  </span>
                  <span className="text-slate-500 text-[10px]">Latency: 142ms</span>
                </div>

                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="py-2 px-4 font-normal">id</th>
                      <th className="py-2 px-4 font-normal">order_id</th>
                      <th className="py-2 px-4 font-normal">status</th>
                      <th className="py-2 px-4 font-normal">timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-800/50 hover:bg-slate-900 transition-colors text-slate-300">
                      <td className="py-3 px-4 font-mono text-slate-400">5</td>
                      <td className="py-3 px-4">5</td>
                      <td className="py-3 px-4"><span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-xs uppercase tracking-wider">failed</span></td>
                      <td className="py-3 px-4 text-slate-500">2026-04-10 18:32:14.000Z</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-8 flex items-center gap-2 text-slate-300 text-sm">
                  <span className="text-slate-300">root@grok-edge-node:~#</span>
                  <span className="w-2 h-4 bg-slate-800 inline-block" />
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
