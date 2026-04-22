"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Target, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  BarChart3, 
  MessageSquare, 
  Lock, 
  ArrowLeft,
  ChevronRight,
  Database,
  Search,
  Users
} from 'lucide-react';
import { MatrixRain } from '@/components/ui/matrix-rain';
import { useSfx } from '@/hooks/useSfx';
import Link from 'next/link';

// --- Mock Scoped Data ---
const ORG_FLEET = [
  { id: 'AG-01', name: 'Architect', status: 'Operational', activity: 'System Design', load: 45 },
  { id: 'AG-02', name: 'Developer', status: 'Operational', activity: 'Logic Synthesis', load: 82 },
  { id: 'AG-03', name: 'Auditor', status: 'Verifying', activity: 'Security Scan', load: 12 },
  { id: 'AG-04', name: 'Release-Bot', status: 'Standby', activity: 'Idle', load: 0 },
];

const ORG_ALERTS = [
  { id: 1, type: 'Security', msg: 'Policy violation detected in Memory Draft #491', time: '12m ago', level: 'high' },
  { id: 2, type: 'System', msg: 'Primary mission link latency > 40ms', time: '1h ago', level: 'med' },
  { id: 3, type: 'Governance', msg: 'Canon promotion request pending sign-off', time: '3h ago', level: 'low' },
];

export default function EnterpriseAdminDashboard() {
  const { playClick } = useSfx();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#020202] text-white font-mono overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      <MatrixRain color="#0c2020" className="opacity-20 pointer-events-none fixed inset-0 z-0" />
      
      {/* Cinematic Pulse Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Enterprise Header */}
      <header className="sticky top-0 z-50 border-b border-cyan-900/30 bg-black/60 backdrop-blur-xl px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link 
            href="/nexus" 
            onClick={() => playClick()}
            className="p-2 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all text-slate-400 hover:text-cyan-500 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-[0.3em] text-cyan-500 uppercase flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Enterprise Command Center
            </h1>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Organizational Mission Control & Governance</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden lg:flex flex-col items-end px-4 border-r border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase tracking-tighter">Client Identity</span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest leading-none mt-1">COMMANDER_ALPHA_PRIME</span>
           </div>
           <div className="p-3 bg-cyan-500/10 border border-cyan-500/40 rounded-xl">
             <ShieldCheck className="w-5 h-5 text-cyan-500" />
           </div>
        </div>
      </header>

      <main className="relative z-10 p-8 grid grid-cols-12 gap-8 max-w-[1920px] mx-auto">
        
        {/* LEFT COLUMN: FLEET & PERFORMANCE */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-8">
           
           {/* PERFORMANCE METRICS */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Agents', val: '4/12', icon: Users, color: 'text-cyan-400' },
                { label: 'Task Success', val: '99.4%', icon: BarChart3, color: 'text-emerald-400' },
                { label: 'Mem Intensity', val: '22%', icon: Database, color: 'text-purple-400' },
                { label: 'Risk Factor', val: 'MINIMAL', icon: Lock, color: 'text-blue-400' },
              ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={stat.label}
                  className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <stat.icon className={`w-5 h-5 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-black text-white">{stat.val}</div>
                </motion.div>
              ))}
           </div>

           {/* AGENT FLEET TABLE */}
           <div className="bg-[#050505] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-black/40">
                 <div className="flex items-center gap-3">
                   <Cpu className="w-4 h-4 text-cyan-500" />
                   <h3 className="text-xs font-black uppercase tracking-[0.2em]">Organizational Fleet Matrix</h3>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <Search className="w-3 h-3 text-slate-500" />
                    <input type="text" placeholder="Filter agents..." className="bg-transparent border-none outline-none text-[10px] w-32 placeholder:text-slate-700" />
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-slate-900 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                         <th className="px-6 py-4">Agent Identifier</th>
                         <th className="px-6 py-4">Operational Status</th>
                         <th className="px-6 py-4">Active Logic Thread</th>
                         <th className="px-6 py-4">Cognitive Load</th>
                         <th className="px-6 py-4">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-900/50">
                      {ORG_FLEET.map((agent) => (
                        <tr key={agent.id} className="hover:bg-cyan-500/[0.03] transition-colors group">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-500 font-bold group-hover:border-cyan-500/50 transition-all">
                                    {agent.id.split('-')[1]}
                                 </div>
                                 <span className="text-sm font-bold">{agent.name}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`text-[10px] px-2 py-1 rounded bg-slate-900 border ${agent.status === 'Operational' ? 'border-emerald-500/30 text-emerald-400' : 'border-amber-500/30 text-amber-400'} uppercase font-black`}>
                                 {agent.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-xs text-slate-400 font-mono italic">
                              {agent.activity}
                           </td>
                           <td className="px-6 py-4">
                              <div className="w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                 <div className="h-full bg-cyan-500/50" style={{ width: `${agent.load}%` }} />
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <button className="p-2 hover:bg-cyan-500/10 rounded-lg text-slate-500 hover:text-cyan-400 transition-all">
                                 <ChevronRight className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
              </div>
           </div>

        </div>

        {/* RIGHT COLUMN: ALERTS & GOVERNANCE */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
           
           {/* SYSTEM ALERTS */}
           <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-500" />
                    Mission Alerts
                 </h3>
                 <span className="text-[10px] text-slate-500 font-mono">3 Active</span>
              </div>

              <div className="space-y-3">
                 {ORG_ALERTS.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-xl border ${alert.level === 'high' ? 'bg-red-500/[0.05] border-red-500/20' : 'bg-slate-800/40 border-slate-700/50'}`}>
                       <div className="flex justify-between items-center mb-2">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${alert.level === 'high' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                             {alert.type}
                          </span>
                          <span className="text-[8px] text-slate-500 uppercase">{alert.time}</span>
                       </div>
                       <p className="text-xs leading-relaxed text-slate-100">{alert.msg}</p>
                    </div>
                 ))}
              </div>

              <button className="w-full mt-6 py-3 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-all text-[10px] font-black uppercase rounded-xl">
                 Clear Internal Log
              </button>
           </div>

           {/* GOVERNANCE SUMMARY */}
           <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30 p-8 rounded-3xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500/50 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <ShieldCheck className="w-8 h-8 text-cyan-400" />
                 </div>
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400 mb-2">Governance Sync</h3>
                 <p className="text-[10px] leading-relaxed text-slate-400 uppercase tracking-widest mb-8">All agents compliant with regional sovereignty patterns.</p>
                 
                 <div className="w-full space-y-3 mb-8">
                    <div className="flex justify-between text-[9px] uppercase font-black text-slate-500">
                       <span>Audit Coverage</span>
                       <span>88%</span>
                    </div>
                    <div className="h-1 bg-slate-900 rounded-full border border-slate-800">
                       <div className="h-full bg-emerald-500" style={{ width: '88%' }} />
                    </div>
                 </div>

                 <button className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] uppercase rounded-xl transition-all shadow-[0_15px_40px_rgba(8,145,178,0.3)]">
                    Generate Compliance Certificate
                 </button>
              </div>
           </div>

        </div>

      </main>

      {/* FOOTER STATUS */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-black/40 backdrop-blur-md border-t border-slate-900 pointer-events-none">
         <div className="flex justify-between items-center max-w-[1800px] mx-auto opacity-40">
            <span className="text-[8px] text-slate-500 tracking-[0.4em] uppercase">Enterprise Sentinel v4.2.1</span>
            <div className="flex gap-4 items-center">
               <span className="text-[8px] text-slate-500 tracking-widest uppercase">Encryption: CORE-AES-256</span>
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            </div>
         </div>
      </footer>
    </div>
  );
}
