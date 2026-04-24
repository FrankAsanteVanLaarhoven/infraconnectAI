'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Cpu, X, Save, Activity, Database, Sparkles, 
  Maximize2, Minimize2, Minus, GripHorizontal, Sliders as SliderIcon, 
  ArrowRight, History, Star, Pin
} from 'lucide-react';
import { useBusEvent } from '@/lib/hooks/useBusEvent';
import { bus } from '@/lib/events/bus';
import type { EphemeralLayout, EphemeralWidget } from '@/lib/ephemeral-schema';

// Recharts Integration for CORE Analytics
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

function renderWidget(widget: EphemeralWidget) {
  switch (widget.type) {
    case 'metric':
      return (
        <div className="flex flex-col gap-2">
          <div className="text-4xl font-mono text-white font-black tracking-tight flex items-baseline gap-2">
            {widget.data.value}
            <span className="text-[10px] text-slate-500 font-bold uppercase">{widget.data.unit || '%'}</span>
          </div>
          <div className="h-10 w-full opacity-40">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={widget.data.history || []}>
                  <Area type="monotone" dataKey="val" stroke="#0ea5e9" fill="#0ea5e9" />
               </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    case 'chart':
      return (
        <div className="h-[200px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={widget.data.labels?.map((l: string, i: number) => ({ label: l, val: widget.data.datasets?.[0]?.data?.[i] || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="label" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                  itemStyle={{ color: '#0ea5e9' }}
                />
                <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                   {widget.data.datasets?.[0]?.data?.map((_: any, i: number) => (
                      <Cell key={i} fill={i % 2 === 0 ? '#0ea5e9' : '#0ea5e944'} />
                   ))}
                </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    case 'table':
      return (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-[10px] font-mono">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 uppercase tracking-widest">
                {widget.data.columns?.map((c: string, i: number) => <th key={i} className="pb-3 pr-4">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {widget.data.rows?.map((row: any[], i: number) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {row.map((cell: any, j: number) => <td key={j} className="py-2.5 pr-4 text-slate-300">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'text':
      return <div className="text-[11px] font-mono text-slate-400 leading-relaxed italic">{widget.data.content}</div>;
    default:
      return null;
  }
}

function DraggableWidget({ w, onRemove }: { w: EphemeralWidget; onRemove: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [opacity, setOpacity] = useState(100);

  return (
    <motion.div 
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: opacity / 100, scale: expanded ? 1.1 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      style={{ position: 'absolute', top: '15vh', left: '10vw' }}
      className={`shadow-[0_40px_100px_rgba(0,0,0,1)] pointer-events-auto rounded-none border border-white/10 bg-black/60 backdrop-blur-2xl flex flex-col overflow-hidden transition-all ${expanded ? "w-[600px] z-50" : "w-[400px] z-40"}`}
    >
      <div className="flex items-center justify-between p-3 cursor-grab主动:cursor-grabbing border-b border-white/5 bg-gradient-to-r from-black/20 to-transparent">
        <div className="flex items-center gap-3 px-1 w-full shrink-0">
          <GripHorizontal className="w-4 h-4 text-slate-600" />
          <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-500 truncate flex-1">{w.title}</h4>
          <div className="flex items-center gap-2" onPointerDownCapture={(e) => e.stopPropagation()}>
             <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-white/5 rounded"><Minus className="w-3.5 h-3.5 text-slate-500"/></button>
             <button onClick={onRemove} className="p-1 hover:bg-red-500/20 rounded text-red-500/60"><X className="w-3.5 h-3.5"/></button>
          </div>
        </div>
      </div>
      {!collapsed && (
        <div className="p-6 bg-slate-900/10 min-h-[100px]" onPointerDownCapture={(e) => e.stopPropagation()}>
           {renderWidget(w)}
        </div>
      )}
    </motion.div>
  );
}

export function EphemeralZone() {
  const [activeWidgets, setActiveWidgets] = useState<(EphemeralWidget & { _id: string })[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useBusEvent('infraconnect:generate-ephemeral-ui', async ({ query }) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ephemeral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      const stamped = (data.widgets || []).map((w: any) => ({ ...w, _id: `${w.id}-${Date.now()}` }));
      setActiveWidgets(prev => [...prev, ...stamped]);
      bus.emit('infraconnect:toast', { message: 'Intelligence Synthesized', type: 'info' });
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (historyOpen) {
      fetch('/api/ephemeral/persist')
        .then(res => res.json())
        .then(data => setHistory(data.layouts || []));
    }
  }, [historyOpen]);

  const loadFromHistory = (layout: any) => {
    const stamped = (layout.config.widgets || []).map((w: any) => ({ ...w, _id: `${w.id}-${Date.now()}` }));
    setActiveWidgets(prev => [...prev, ...stamped]);
    setHistoryOpen(false);
    bus.emit('infraconnect:toast', { message: `Recalling: ${layout.title}`, type: 'info' });
  };

  const saveToCanvas = async () => {
    // Collect current state for persistence
    const layoutConfig = { widgets: activeWidgets.map(({ _id, ...w }) => w) };
    try {
      await fetch('/api/ephemeral/persist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Mission Intelligence ' + new Date().toLocaleTimeString(),
          intent: 'MANUAL_PERSIST',
          config: layoutConfig
        })
      });
      bus.emit('infraconnect:toast', { message: 'Intelligence Studio: Canvas Persisted', type: 'success' });
      setActiveWidgets([]);
    } catch (e) {
      bus.emit('infraconnect:toast', { message: 'Persistence failure', type: 'error' });
    }
  };

  return (
    <>
      <AnimatePresence>
        {isGenerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
             <div className="flex flex-col items-center gap-6">
                <Sparkles className="w-16 h-16 text-cyan-400" />
                <div className="text-[10px] font-black uppercase tracking-[1em] text-cyan-500">Synthesizing Zero-UI</div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-50 pointer-events-none p-8 pt-24">
         <AnimatePresence>
            {activeWidgets.map(w => (
               <DraggableWidget key={w._id} w={w} onRemove={() => setActiveWidgets(prev => prev.filter(x => x._id !== w._id))} />
            ))}
         </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeWidgets.length > 0 && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-8 right-8 z-50 pointer-events-auto flex items-center gap-4 bg-black/80 backdrop-blur-xl border border-cyan-500/20 p-2 pl-6 rounded-sm shadow-2xl">
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500">{activeWidgets.length} Analytics Nodes</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Unsaved Ephemeral State</span>
             </div>
             <button onClick={saveToCanvas} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-sm transition-all flex items-center gap-2">
                <Save className="w-3.5 h-3.5" />
                Persist to Canvas
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Sidebar */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="fixed right-0 top-0 bottom-0 w-80 z-[60] bg-black/80 backdrop-blur-3xl border-l border-white/10 p-6 flex flex-col gap-6 shadow-2xl">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <History className="w-5 h-5 text-cyan-500" />
                   <h3 className="text-sm font-black uppercase tracking-widest text-white">Studio History</h3>
                </div>
                <button onClick={() => setHistoryOpen(false)} className="p-2 hover:bg-white/5 rounded-sm"><X className="w-4 h-4 text-slate-500" /></button>
             </div>

             <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                {history.length === 0 && (
                   <div className="text-center py-12 text-slate-600 text-[10px] uppercase font-bold tracking-widest italic">No saved intelligence found</div>
                )}
                {history.map(layout => (
                   <div key={layout.id} onClick={() => loadFromHistory(layout)} className="p-4 rounded-sm bg-white/5 border border-white/5 hover:border-cyan-500/30 cursor-pointer transition-all group">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-cyan-400">{layout.title}</span>
                         <Star className={`w-3 h-3 ${layout.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'}`} />
                      </div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold truncate">Intent: {layout.intent}</div>
                      <div className="mt-3 flex items-center justify-between">
                         <span className="text-[8px] text-slate-700 font-mono italic">{new Date(layout.createdAt).toLocaleDateString()}</span>
                         <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Recall <ArrowRight className="w-2.5 h-2.5" /></span>
                      </div>
                   </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setHistoryOpen(!historyOpen)} className="fixed top-24 right-6 z-50 bg-black/40 hover:bg-black/60 backdrop-blur border border-white/5 p-2 rounded-sm text-slate-500 hover:text-cyan-500 transition-all">
         <History className="w-5 h-5" />
      </motion.button>
    </>
  );
}
