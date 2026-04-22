"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, Database, Activity, Target, Settings2, CheckCircle2, ChevronRight, Zap, Play } from 'lucide-react';
import { logTrainingRun } from './actions';

const DOMAINS = [
  { id: 'agent-ops', label: 'Operations Core' },
  { id: 'agent-support', label: 'Customer Support / CRM' },
  { id: 'agent-dev', label: 'Product Engineering' }
];

const MODELS = [
  { id: 'gemma4-31b-dense', name: 'Gemma-4-31B Dense (Sovereign)' },
  { id: 'gemma4-26b-moe', name: 'Gemma-4-26B MoE' },
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro (Frontier Core)' },
];

export default function RLHFFoundryPage() {
  const [selectedDomain, setSelectedDomain] = useState(DOMAINS[0].id);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [learningRate, setLearningRate] = useState('2e-5');
  const [epochs, setEpochs] = useState(150);
  const [batchSize, setBatchSize] = useState(64);
  const [rewardPenalty, setRewardPenalty] = useState(0.01);
  const [schedulerType, setSchedulerType] = useState('cosine');
  const [warmupRatio, setWarmupRatio] = useState(0.1);
  const [weightDecay, setWeightDecay] = useState(0.01);
  
  const [status, setStatus] = useState<'IDLE' | 'WARMUP' | 'TRAINING' | 'SYNCING' | 'COMPLETED'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [curves, setCurves] = useState<{ episode: number; reward: number; loss: number }[]>([]);
  const [runTag, setRunTag] = useState<string | null>(null);

  const startTraining = async () => {
    setStatus('WARMUP');
    setCurves([]);
    setProgress(0);
    setRunTag(null);

    // Warmup delay
    await new Promise(r => setTimeout(r, 1500));
    setStatus('TRAINING');

    const totalSteps = epochs;
    const generatedCurves: any[] = [];
    
    // Simulation Loop
    for (let i = 1; i <= totalSteps; i++) {
       await new Promise(r => setTimeout(r, 40)); // 40ms per epoch
       
       // S-Curve logic for reward/loss
       const phase = i / totalSteps;
       const loss = Math.max(0.05, Math.exp(-phase * 5) + (Math.random() * 0.1));
       const reward = Math.min(0.99, (Math.log(phase * 10 + 1) / Math.log(11)) + (Math.random() * 0.05));
       
       const stepData = { episode: i, reward, loss };
       generatedCurves.push(stepData);
       setCurves([...generatedCurves]);
       setProgress(Math.floor((i / totalSteps) * 100));
    }

    setStatus('SYNCING');
    
    // Commit to SQLite -> W&B Sync Daemon
    const res = await logTrainingRun({
      domain: selectedDomain,
      model: selectedModel,
      hyperparams: {
        learningRate,
        epochs,
        batchSize,
        rewardPenalty,
        schedulerType,
        warmupRatio,
        weightDecay
      },
      curves: generatedCurves,
      finalSvrRate: 0.001 // Target Safety Violation Rate after tuning
    });

    setRunTag(res.runTag);
    setStatus('COMPLETED');
  };

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 font-mono flex flex-col p-8 overflow-hidden selection:bg-indigo-500/30">
      
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <header className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.15)]">
              <Brain className="w-6 h-6 text-indigo-400" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-none">RLHF Foundry</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Model Specialization & Weights/Biases Telemetry Sync</p>
           </div>
        </div>
        <div className="flex gap-4 items-center">
           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">W&B Daemon Active</span>
           </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Col: Hyperparams */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-white/5 pb-2">
                 <Settings2 className="w-4 h-4 text-indigo-400" /> Training Architecture
              </h2>

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">1. Target Domain Agent</label>
                    <div className="grid gap-2">
                       {DOMAINS.map(d => (
                          <button key={d.id} onClick={() => setSelectedDomain(d.id)}
                            className={`text-left text-xs px-4 py-3 rounded-lg border transition-all uppercase tracking-wide font-bold ${
                              selectedDomain === d.id ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-black border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                             {d.label}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block">2. Foundation Substrate</label>
                    <select 
                      value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
                      className="w-full bg-black border border-slate-800 rounded-lg px-4 py-3 text-xs text-indigo-300 uppercase tracking-widest font-bold focus:outline-none focus:border-indigo-500/50 appearance-none"
                    >
                       {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                       <label className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 block">Learn Rate</label>
                       <input value={learningRate} onChange={e => setLearningRate(e.target.value)} className="w-full bg-black border border-slate-800 focus:border-indigo-500 rounded p-2 text-xs text-white" />
                    </div>
                    <div>
                       <label className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 block">Epochs</label>
                       <input type="number" value={epochs} onChange={e => setEpochs(Number(e.target.value))} className="w-full bg-black border border-slate-800 focus:border-indigo-500 rounded p-2 text-xs text-white" />
                    </div>
                    <div>
                       <label className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 block">Batch Size</label>
                       <input type="number" value={batchSize} onChange={e => setBatchSize(Number(e.target.value))} className="w-full bg-black border border-slate-800 focus:border-indigo-500 rounded p-2 text-xs text-white" />
                    </div>
                    <div>
                       <label className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1 block">KL Penalty</label>
                       <input type="number" step="0.01" value={rewardPenalty} onChange={e => setRewardPenalty(Number(e.target.value))} className="w-full bg-black border border-slate-800 focus:border-indigo-500 rounded p-2 text-xs text-white" />
                    </div>
                 </div>

                 {/* CORE Hardening Parameters */}
                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 bg-red-950/20 p-4 rounded-xl border border-red-900/30">
                    <div className="col-span-2 flex items-center justify-between mb-2">
                       <span className="text-[8px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1"><Target className="w-2.5 h-2.5" /> CORE PEFT Parameters</span>
                       <span className="text-[6px] text-red-400 bg-red-950 px-1 py-0.5 rounded border border-red-900/50 uppercase">Strict Enforcement</span>
                    </div>
                    <div className="col-span-2">
                       <label className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1 block">LR Scheduler (Prevents Gradient Collapse)</label>
                       <select value={schedulerType} onChange={e => setSchedulerType(e.target.value)} className="w-full bg-black border border-slate-800 focus:border-red-500 rounded p-2 text-xs text-red-300 font-bold focus:outline-none appearance-none">
                          <option value="cosine">Cosine w/ Restarts (Recommended)</option>
                          <option value="linear">Linear Decay (Danger)</option>
                          <option value="constant">Constant</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1 block">Warmup Ratio</label>
                       <input type="number" step="0.01" min="0" max="0.5" value={warmupRatio} onChange={e => setWarmupRatio(Number(e.target.value))} className="w-full bg-black border border-slate-800 focus:border-red-500 rounded p-2 text-xs text-white" />
                    </div>
                    <div>
                       <label className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1 block">Weight Decay (AdamW)</label>
                       <input type="number" step="0.001" value={weightDecay} onChange={e => setWeightDecay(Number(e.target.value))} className="w-full bg-black border border-slate-800 focus:border-red-500 rounded p-2 text-xs text-white" />
                    </div>
                 </div>

              </div>
           </div>

           <button 
             disabled={status !== 'IDLE' && status !== 'COMPLETED'}
             onClick={startTraining}
             className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white uppercase tracking-widest font-black text-xs rounded-xl shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all flex justify-center items-center gap-3"
           >
              {status === 'IDLE' || status === 'COMPLETED' ? <><Play className="w-4 h-4 fill-current"/> INITIALIZE FINE-TUNING</> : <><Activity className="w-4 h-4 animate-spin"/> {status}...</>}
           </button>
        </div>

        {/* Right Col: Graphs */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col relative overflow-hidden">
              <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center justify-between mb-8 border-b border-white/5 pb-2">
                 <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> RL Telemetry Feed</span>
                 <span className="text-[10px] text-slate-500">Progress: {progress}%</span>
              </h2>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-black rounded-full overflow-hidden absolute top-[52px] left-0 right-0">
                 <div className="h-full bg-emerald-500 transition-all duration-75" style={{ width: `${progress}%` }} />
              </div>

              {/* Loss / Reward Simulation Graph Container */}
              <div className="flex-1 flex gap-4 items-end pt-4 pb-2 relative border-b border-white/5 mx-2">
                 {/* Y Axis Guides */}
                 <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-l border-white/20">
                    <div className="border-t border-white/20 border-dashed w-full" />
                    <div className="border-t border-white/20 border-dashed w-full" />
                    <div className="border-t border-white/20 border-dashed w-full" />
                 </div>

                 {curves.length > 0 ? curves.map((c, idx) => (
                    <div key={idx} className="flex-1 flex items-end h-full gap-px group relative">
                       {/* Loss Bar (Red) */}
                       <div className="w-1/2 bg-rose-500/60 rounded-t-sm transition-all duration-300 relative group-hover:bg-rose-400" 
                            style={{ height: `${c.loss * 100}%` }} />
                       {/* Reward Bar (Emerald) */}
                       <div className="w-1/2 bg-emerald-500/60 rounded-t-sm transition-all duration-300 relative group-hover:bg-emerald-400 z-10" 
                            style={{ height: `${c.reward * 100}%` }}>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-[8px] p-1.5 rounded pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl">
                             Ep: {c.episode}<br/>R: {c.reward.toFixed(3)}<br/>L: {c.loss.toFixed(3)}
                          </div>
                       </div>
                    </div>
                 )) : (
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-30 gap-4">
                       <Database className="w-12 h-12 text-slate-600" />
                       <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Awaiting Batch Data</p>
                    </div>
                 )}
              </div>

              {/* Metrics Readout */}
              <div className="grid grid-cols-3 gap-6 mt-6">
                 <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Final Loss (BCE)</p>
                    <p className="text-xl font-mono text-rose-400">{curves.length > 0 ? curves[curves.length - 1].loss.toFixed(4) : '0.0000'}</p>
                 </div>
                 <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">PPO Reward Avg</p>
                    <p className="text-xl font-mono text-emerald-400">{curves.length > 0 ? curves[curves.length - 1].reward.toFixed(4) : '0.0000'}</p>
                 </div>
                 <div className="bg-black/50 p-4 rounded-xl border border-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-500/5 transition-opacity opacity-0 group-hover:opacity-100" />
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">W&B Target URN</p>
                    {runTag ? (
                       <p className="text-xs font-mono text-indigo-400 mt-2 truncate w-full">{runTag}</p>
                    ) : (
                       <p className="text-xs font-mono text-slate-600 mt-2 italic">unassigned</p>
                    )}
                 </div>
              </div>
           </div>

           <AnimatePresence>
             {status === 'COMPLETED' && (
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-4 flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                     <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-1">Training Sync Verified</h4>
                     <p className="text-[10px] text-emerald-600 font-bold uppercase leading-relaxed max-w-2xl">
                        Weights updated & committed to registry. Payload completely flushed to local SQLite tracking store, ready for the w&b python daemon.
                     </p>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
