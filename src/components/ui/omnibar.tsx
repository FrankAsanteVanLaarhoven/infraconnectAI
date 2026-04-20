'use client';

import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Network, Database, Cpu, ArrowRight, CornerDownLeft, Sparkles, TerminalSquare } from 'lucide-react';
import { parseIntent, IntentTopology } from '@/lib/dag-engine';
import { motion, AnimatePresence } from 'framer-motion';

export function Omnibar({ onExecuteTopology }: { onExecuteTopology: (t: IntentTopology) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [topologyPreview, setTopologyPreview] = useState<IntentTopology | null>(null);

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    }
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Run Semantic Parser iteratively
  useEffect(() => {
    const topology = parseIntent(query);
    setTopologyPreview(topology);
  }, [query]);

  const handleExecute = () => {
    // Intercept explicit command executions for the Control Plane (e.g. "> restart humanoid-02")
    if (query.startsWith('>')) {
      const parts = query.slice(1).trim().split(" ");
      const action = parts[0]?.toUpperCase() || 'UNKNOWN';
      const target = parts[1] || 'global';
      
      fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command_id: `cmd-ux-${Date.now()}`,
          robot_id: target,
          action: action,
          parameters: { raw_query: query },
          issued_by: "operator:ux",
          timestamp: Date.now()
        })
      }).catch(err => console.warn('[OMNIBAR] Command dispatch failure', err));
      
      setOpen(false);
      setQuery("");
      return;
    }

    // Intercept explicit agent triggers (e.g. "! stabilize fleet")
    if (query.startsWith('!')) {
      const payload = query.slice(1).trim();
      
      // We route this through the identical API for simplicity, 
      // but target the agent stream exclusively
      fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { 
          // Inject custom backend flag to route this payload down 'stream:agent.actions' 
          overrideTopic: "stream:agent.actions",
          agent: "ux-orchestrator", 
          decision: payload, 
          reason: "Manual operator trigger",
          target: "global",
          timestamp: Date.now()
        } as any
      });

      setOpen(false);
      setQuery("");
      return;
    }

    if (topologyPreview) {
      onExecuteTopology(topologyPreview);
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog 
          open={open} 
          onOpenChange={setOpen}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-2xl bg-[#0a0b0c] border border-slate-700/80 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-[#111214]">
              <Sparkles className={`w-5 h-5 mr-3 transition-colors ${topologyPreview ? 'text-green-500' : 'text-slate-500'}`} />
              <Command.Input 
                autoFocus
                placeholder="What dataset do you want to sync today?" 
                value={query}
                onValueChange={setQuery}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleExecute();
                  }
                }}
                className="flex-1 bg-transparent border-none text-white outline-none placeholder:text-slate-500 text-lg font-mono focus:ring-0"
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded tracking-widest uppercase">esc</span>
              </div>
            </div>

            {/* Semantic Layout Preview */}
            <div className="p-4 bg-black min-h-[140px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />
                
                {topologyPreview ? (
                  <div className="flex items-center gap-4 w-full px-8 animate-in fade-in zoom-in-95 duration-500">
                    {topologyPreview.nodes.map((n, i) => (
                      <React.Fragment key={n.id}>
                        <div className={`flex flex-col items-center gap-3 w-1/3 p-4 rounded-lg border border-slate-800 bg-[#111] shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${i === 0 ? 'border-l-blue-500/50' : i === 2 ? 'border-b-purple-500/50' : ''}`}>
                          {n.type === 'connector' && n.label.toLowerCase().includes('postgres') && <Database className="w-8 h-8 text-blue-500" />}
                          {n.type === 'connector' && n.label.toLowerCase().includes('legacy') && <TerminalSquare className="w-8 h-8 text-orange-500" />}
                          {n.type === 'connector' && n.label.toLowerCase().includes('event') && <Network className="w-8 h-8 text-yellow-500" />}
                          {n.type === 'ai' && <Cpu className="w-8 h-8 text-purple-500" />}
                          <span className="text-xs text-slate-300 font-bold text-center line-clamp-1">{n.label}</span>
                        </div>
                        
                        {i < topologyPreview.nodes.length - 1 && (
                          <div className="flex-1 flex justify-center text-slate-600 animate-pulse">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-600 text-sm flex flex-col items-center gap-3">
                    {query.length > 0 && !query.startsWith('>') && !query.startsWith('!') ? (
                      <span className="animate-pulse">Analyzing semantic intent...</span>
                    ) : query.startsWith('>') ? (
                      <div className="flex flex-col gap-2 w-full max-w-sm text-left p-4 bg-[#0B0D0F] border border-[#1A1D21] rounded">
                         <div className="text-[#4CC9F0] font-mono text-[10px] tracking-widest font-black uppercase flex items-center gap-2 mb-1">
                            <TerminalSquare className="w-4 h-4 animate-pulse" /> COMMAND MODE
                         </div>
                         <div className="text-[11px] text-white/80 font-mono">
                            <span className="text-[#6B7280]">Executing:</span> {query.slice(1).trim().split(" ")[0]?.toUpperCase() || '...'}
                         </div>
                         <div className="text-[11px] text-white/80 font-mono">
                            <span className="text-[#6B7280]">Target:</span> {query.slice(1).trim().split(" ")[1] || 'global'}
                         </div>
                      </div>
                    ) : query.startsWith('!') ? (
                      <div className="flex flex-col gap-2 w-full max-w-sm text-left p-4 bg-[#2e1065]/20 border border-purple-500/30 rounded">
                         <div className="text-purple-400 font-mono text-[10px] tracking-widest font-black uppercase flex items-center gap-2 mb-1">
                            <Cpu className="w-4 h-4 animate-pulse" /> AUTONOMOUS AGENT MODE
                         </div>
                         <div className="text-[11px] text-purple-200/80 font-mono">
                            <span className="text-purple-500/50">Workflow:</span> {query.slice(1).trim() || '...'}
                         </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center text-center gap-1 mb-2">
                           <span className="text-[#E6EDF3]">Enter natural language or command prefixes</span>
                           <span className="text-[10px] text-[#6B7280]">{`Use [>] for operations, [!] for agents`}</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-lg">
                           <span className="text-[10px] bg-[#0a0a0a] border border-[#1F1F1F] px-2 py-1 flex items-center gap-1.5 rounded text-[#9AA4AF] cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setQuery("> restart humanoid-02")}><span className="text-[#4CC9F0]">CMD</span> {"> restart humanoid-02"}</span>
                           <span className="text-[10px] bg-[#0a0a0a] border border-[#1F1F1F] px-2 py-1 flex items-center gap-1.5 rounded text-[#9AA4AF] cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setQuery("! stabilize fleet")}><span className="text-purple-400">AGENT</span> {"! stabilize fleet"}</span>
                           <span className="text-[10px] bg-[#0a0a0a] border border-[#1F1F1F] px-2 py-1 flex items-center gap-1.5 rounded text-[#9AA4AF] cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setQuery("Stream Postgres users")}><span className="text-[#22C55E]">DAG</span> {"Stream Postgres users"}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
            </div>

            <div className="bg-[#111214] border-t border-slate-800 p-2 flex justify-between items-center text-xs text-slate-500 px-4">
               <span>InfraConnect Semantic Engine</span>
               <div className="flex items-center gap-2">
                 <span>Press</span>
                 <span className="text-[10px] text-slate-400 border border-slate-700 bg-slate-900 px-1.5 py-0.5 rounded tracking-widest uppercase flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> Enter</span>
                 <span>to Execute</span>
               </div>
            </div>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
}
