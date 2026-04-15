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
                    {query.length > 0 ? (
                      <span className="animate-pulse">Analyzing semantic intent...</span>
                    ) : (
                      <>
                        <span>Type an intent to generate an autonomous workflow pipeline.</span>
                        <div className="flex gap-4 mt-2">
                           <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-400 cursor-pointer hover:bg-slate-800" onClick={() => setQuery("Connect legacy as400 to AI index")}>"Connect legacy as400 to AI index"</span>
                           <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-400 cursor-pointer hover:bg-slate-800" onClick={() => setQuery("Stream Postgres users to Semantic embedding")}>"Stream Postgres users to Semantic embedding"</span>
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
