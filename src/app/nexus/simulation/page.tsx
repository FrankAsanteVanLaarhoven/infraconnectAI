"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  Target, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Layers,
  Search,
  Lock,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Box,
  AreaChart
} from 'lucide-react';
import { SimulationScenario, simulationEngine } from '@/lib/nexus/simulationEngine';
import { FutureWaveVisualizer } from '@/components/nexus/FutureWaveVisualizer';

export default function SimulationPage() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(simulationEngine.getScenarios());
  const [simulating, setSimulating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(scenarios[0]);

  useEffect(() => {
    const inv = setInterval(() => {
      const nextScenarios = simulationEngine.runSimulation();
      setScenarios([...nextScenarios]);
    }, 4000);
    return () => clearInterval(inv);
  }, []);

  const triggerSimulation = () => {
    setSimulating(true);
    setTimeout(() => setSimulating(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 font-mono flex flex-col overflow-hidden selection:bg-indigo-500/30">
       
       {/* Simulation Header */}
       <header className="h-20 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-8 relative z-50">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                   <AreaChart className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                   <h1 className="text-xl font-black text-white uppercase tracking-[0.4em]">Predictive Simulation Hub</h1>
                   <h2 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Isaac Sim // Physics Rehearsal</h2>
                </div>
             </div>
             <div className="h-8 w-[1px] bg-white/10" />
             <div className="flex flex-col">
                <span className="text-[8px] text-slate-600 uppercase font-black tracking-widest mb-1">Scenario Convergence</span>
                <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Distributed_Sim_V4</span>
             </div>
          </div>

          <div className="flex items-center gap-8">
             <div className={`flex items-center gap-3 px-6 py-2 rounded-xl transition-all cursor-pointer ${
                simulating ? 'bg-indigo-500/20 border border-indigo-500/50 animate-pulse' : 'bg-white/5 border border-white/10 hover:border-indigo-500/30'
             }`} onClick={triggerSimulation}>
                <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin text-indigo-400' : 'text-slate-500'}`} />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Run Isaac Sim Perturbation</span>
             </div>
             <div className="flex flex-col text-right">
                <span className="text-[8px] text-slate-600 block mb-1 font-black uppercase tracking-widest">Convergence Delta</span>
                <span className="text-sm font-black text-cyan-400 tracking-tighter">{(simulationEngine.getConvergenceCertainty() * 100).toFixed(1)}% <span className="text-[10px] text-slate-700">SIM_CONF</span></span>
             </div>
          </div>
       </header>

       <main className="flex-1 flex overflow-hidden">
          
          {/* Left: Simulation Visualizer */}
          <div className="flex-1 relative bg-black p-8 border-r border-white/5 overflow-y-auto custom-scrollbar">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#6366f1 1.5px, transparent 1.5px)', backgroundSize: '50px 50px' }} />
             
             <div className="max-w-4xl mx-auto h-full flex flex-col gap-8 relative z-10">
                
                {/* 1. Future Wave Visualizer Container */}
                <div className="flex-1 min-h-[400px]">
                   <FutureWaveVisualizer />
                </div>
                
                {/* 2. Scenario Selection Grid */}
                <section className="space-y-4">
                   <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-3">
                         <GitBranch className="w-4 h-4 text-indigo-400" />
                         <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Predictive Scenarios</h2>
                      </div>
                      <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Select for Optimization</span>
                   </div>
                   <div className="grid grid-cols-3 gap-6">
                      {scenarios.map(scenario => (
                         <button 
                           key={scenario.id}
                           onClick={() => setSelectedScenario(scenario)}
                           className={`p-6 bg-white/[0.02] border transition-all rounded-3xl flex flex-col gap-6 text-left group ${
                              selectedScenario?.id === scenario.id ? 'border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_40px_rgba(99,102,241,0.05)]' : 'border-white/5 hover:border-white/10'
                           }`}
                         >
                            <div className="flex justify-between items-start">
                               <div className="p-3 bg-slate-900 rounded-xl border border-white/5 shadow-inner group-hover:border-indigo-500/30 transition-all">
                                  <Box className={`w-5 h-5 ${scenario.isPreferred ? 'text-cyan-400' : 'text-slate-600'}`} />
                               </div>
                               <div className="flex flex-col items-end gap-1">
                                  <span className="text-[10px] font-black text-white tracking-widest">{(scenario.probability * 100).toFixed(1)}%</span>
                                  <span className="text-[7px] text-slate-600 font-black uppercase tracking-widest">Probability</span>
                               </div>
                            </div>
                            
                            <div>
                               <h3 className="text-xs font-black text-white uppercase tracking-wider mb-1 leading-tight">{scenario.name}</h3>
                               <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Collision Delta: <span className="text-emerald-500">{(scenario.metrics.collisionRate).toFixed(3)}%</span></p>
                            </div>

                            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden mt-2">
                               <motion.div 
                                 initial={{ width: '0%' }}
                                 animate={{ width: `${scenario.probability * 100}%` }}
                                 className={`h-full ${scenario.isPreferred ? 'bg-cyan-500' : 'bg-indigo-500'}`}
                               />
                            </div>
                         </button>
                      ))}
                   </div>
                </section>

             </div>
          </div>

          {/* Right: Simulation Synthesis Sidebar */}
          <div className="w-[450px] flex flex-col bg-slate-950/20 relative z-50 border-l border-white/5 overflow-y-auto custom-scrollbar">
             
             {/* 3. Deep Scenario Analysis */}
             <div className="p-8 space-y-8 bg-black/40">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                      <Target className="w-5 h-5 text-indigo-400" />
                   </div>
                   <div>
                      <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Scenario Synthesis</h2>
                      <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Converging Outcomes</span>
                   </div>
                </div>
                
                {selectedScenario && (
                   <div className="space-y-6">
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-5">
                            <TrendingUp className="w-16 h-16 text-indigo-500" />
                         </div>
                         <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-none">SIMULATED_EVENTS</h4>
                         <div className="space-y-3 mt-4">
                            {selectedScenario.events.map((ev, i) => (
                               <div key={i} className="flex items-start gap-3 group/ev">
                                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 group-hover/ev:scale-150 transition-all" />
                                  <span className="text-[10px] font-black text-slate-400 uppercase leading-relaxed font-mono italic group-hover/ev:text-white transition-colors">{ev}</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-emerald-500/30 transition-all">
                            <span className="text-[8px] text-slate-600 uppercase font-black block mb-1">Collision Rate</span>
                            <span className="text-xl font-black text-emerald-500">{selectedScenario.metrics.collisionRate.toFixed(3)}%</span>
                         </div>
                         <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-cyan-500/30 transition-all">
                            <span className="text-[8px] text-slate-600 uppercase font-black block mb-1">Kinematic Stability</span>
                            <span className="text-xl font-black text-cyan-400">{selectedScenario.metrics.stabilityIndex.toFixed(0)}%</span>
                         </div>
                      </div>

                      {/* State Steering Control */}
                      <button className="w-full py-6 bg-indigo-600 text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] flex items-center justify-center gap-4 group">
                         <Lock className="w-4 h-4 text-black group-hover:scale-110 transition-all" />
                         Apply Predictive Steering
                      </button>
                   </div>
                )}
             </div>

             {/* 4. Infrastructure Maintenance Loop */}
             <div className="flex-1 p-8 bg-black/60 space-y-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_#10b981]" />
                   <h2 className="text-[11px] font-black text-white uppercase tracking-widest">Simulation Feedback</h2>
                </div>
                <div className="space-y-4">
                   {[
                      { msg: 'Scenario Consensus: High Accuracy', time: '1s ago' },
                      { msg: 'Predictive Path: Acceleration Locked', time: '12m ago' },
                      { msg: 'Systemic Drift detection: MINIMAL', time: '1h ago' }
                   ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-600 group cursor-pointer hover:text-slate-400 transition-all">
                         <span>{log.msg}</span>
                         <span className="text-[7px] text-slate-800">{log.time}</span>
                      </div>
                   ))}
                </div>
             </div>

          </div>

       </main>

       {/* Simulation Status Footer */}
       <footer className="h-8 border-t border-white/5 bg-black flex items-center justify-between px-6 text-[8px] font-black text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-6">
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> SIM_CONVERGENCE: STABLE</span>
             <span>TOTAL_SCENARIOS: 10,000</span>
             <span>CLUSTER_NODES: 42</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-indigo-900 underline">DISTRIBUTED_CORE: LIVE</span>
             <span className="text-indigo-950 underline">SYNX_CONTROL_X28</span>
          </div>
       </footer>

    </div>
  );
}
