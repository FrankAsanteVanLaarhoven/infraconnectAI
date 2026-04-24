"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Cpu, 
  Globe, 
  Activity, 
  Database, 
  Lock, 
  UserCheck, 
  AlertTriangle, 
  Search, 
  ArrowLeft,
  ChevronRight,
  Terminal as TermIcon,
  HardDrive,
  Network,
  Eye,
  RotateCcw, 
  Layout, 
  Maximize, 
  Minimize2,
  List,
  AlertOctagon,
  Fingerprint,
  Users
} from 'lucide-react';
import { MatrixRain } from '@/components/ui/matrix-rain';
import { IntelligenceGlobe } from '@/components/ui/intelligence-globe';
import { useSfx } from '@/hooks/useSfx';
import { MissionObservabilityMatrix } from '@/components/admin/MissionObservabilityMatrix';
import { AdministrativeAccessGate } from '@/components/admin/AdministrativeAccessGate';
import { LeadObservatory } from '@/components/admin/LeadObservatory';
import { NexusWindowPrimitive } from '@/components/nexus/NexusWindowPrimitive';
import { InfraConnectLogo } from '@/components/ui/InfraConnectLogo';
import { StrategicCommandConsole } from '@/components/admin/StrategicCommandConsole';
import { NeuralHandshake } from '@/components/ui/NeuralHandshake';
import { useRouter } from 'next/navigation';

// --- Types ---
interface FleetNode {
  id: string;
  robotId: string;
  alias: string;
  status: string;
  lastSeen: string;
  memoryBytes: number;
  anomalyCount: number;
  latitude: number | null;
  longitude: number | null;
  region: string | null;
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string | null;
  input: string;
  validated: boolean;
  timestamp: string;
}

interface Anomaly {
  id: string;
  type: string;
  severity: string;
  description: string;
  createdAt: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  createdAt: string;
}

interface WindowState {
  id: string;
  title: string;
  icon: any;
  x: number;
  y: number;
  w: number;
  h: number;
  isCollapsed: boolean;
  zIndex: number;
}

const DEFAULT_WINDOWS: WindowState[] = [
  { id: 'registry', title: 'Planetary Neural Mesh', icon: Network, x: 260, y: 100, w: 900, h: 500, isCollapsed: false, zIndex: 10 },
  { id: 'observability', title: 'Mission Observability Matrix', icon: Activity, x: 260, y: 620, w: 900, h: 420, isCollapsed: false, zIndex: 5 },
  { id: 'leads', title: 'Global Access Queue', icon: Users, x: 100, y: 150, w: 800, h: 500, isCollapsed: false, zIndex: 11 },
  { id: 'iam', title: 'Administrative Identity Hub', icon: Lock, x: 1180, y: 100, w: 450, h: 500, isCollapsed: false, zIndex: 8 },
  { id: 'directives', title: 'Strategic Command Console', icon: TermIcon, x: 1650, y: 100, w: 320, h: 450, isCollapsed: false, zIndex: 6 },
  { id: 'radar', title: 'Global Localization Radar', icon: Globe, x: 1180, y: 620, w: 450, h: 420, isCollapsed: false, zIndex: 7 },
  { id: 'audit', title: 'System Audit Trace', icon: List, x: 1650, y: 570, w: 320, h: 470, isCollapsed: false, zIndex: 4 },
];

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { playClick, playHov } = useSfx();
  const [isMounted, setIsMounted] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>(DEFAULT_WINDOWS);
  const [data, setData] = useState<{
    fleetNodes: FleetNode[],
    subscriptions: Subscription[],
    auditLogs: AuditLog[],
    anomalies: Anomaly[],
    incidents: any[]
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [integrityHealth, setIntegrityHealth] = useState(99.98);
  const [neuralPulse, setNeuralPulse] = useState(0);
  const [isHandshaking, setIsHandshaking] = useState(false);

  // --- Live Polling & Orchestration ---
  useEffect(() => {
    setIsMounted(true);
    fetchAdminData();

    // 1. High-frequency integrity jitter
    const jittInterval = setInterval(() => {
      setIntegrityHealth(h => {
        const jitter = (Math.random() - 0.5) * 0.05;
        return Math.min(100, Math.max(99, h + jitter));
      });
    }, 1500);

    // 2. Global database sync (4s) + Neural Pulse
    const syncInterval = setInterval(() => {
      fetchAdminData();
      setNeuralPulse(p => p + 1); // Trigger global HUD pulse
    }, 4000);

    return () => {
      clearInterval(jittInterval);
      clearInterval(syncInterval);
    };
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/telemetry'); // Using telemetry for more 'Physical AI' data
      const payload = await res.json();
      if (payload.success) {
        // Map telemetry data to admin dashboard expectations
        setData({
          fleetNodes: payload.data.nodes || [],
          subscriptions: [],
          auditLogs: payload.data.intelLogs || [],
          anomalies: payload.data.incidents || [],
          incidents: []
        });
      }
    } catch (err) {
      console.warn('Mission Critical: Uplink Interrupted.', err);
    } finally {
      setLoading(false);
    }
  };

  const updateWindow = (id: string, updates: Partial<WindowState>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const focusWindow = (id: string) => {
    setWindows(prev => {
      const maxZ = Math.max(...prev.map(w => w.zIndex));
      return prev.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
    });
  };

  const resetLayout = () => {
    playClick();
    setWindows(DEFAULT_WINDOWS);
  };

  const handleNexusNavigation = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    playClick();
    setIsHandshaking(true);
    setTimeout(() => {
        router.push('/nexus');
    }, 1000);
  };

  const filteredNodes = data?.fleetNodes.filter((n: any) => 
    n.alias?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.robotId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#010101] text-white font-mono overflow-hidden selection:bg-cyan-500/30">
      <MatrixRain color="#101827" className="opacity-10 pointer-events-none fixed inset-0 z-0" />
      
      {/* NEURAL HANDSHAKE OVERLAY */}
      <NeuralHandshake isVisible={isHandshaking} />

      {/* GLOBAL NEURAL PULSE LAYER */}
      <AnimatePresence>
        <motion.div 
          key={neuralPulse}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.05, 0] }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 pointer-events-none z-[200] bg-cyan-500/10 mix-blend-screen"
        />
      </AnimatePresence>

      {/* HUD Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-indigo-500/[0.03] to-cyan-500/[0.03] opacity-50" />
        <div className="absolute top-20 left-20 w-[40rem] h-[40rem] bg-indigo-500/[0.03] blur-[150px] rounded-sm" />
        <div className="absolute bottom-20 right-20 w-[40rem] h-[40rem] bg-cyan-500/[0.03] blur-[150px] rounded-sm" />
      </div>

      {/* Top Header: Sovereign Command Arc */}
      <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/[0.02] bg-black/60 backdrop-blur-3xl px-10 h-20 flex justify-between items-center shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-10">
          <button 
            onClick={handleNexusNavigation}
            className="p-3 bg-white/[0.03] border border-white/5 rounded-none hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-slate-500 hover:text-cyan-400 group shadow-2xl"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-8">
             <InfraConnectLogo size="md" variant="flat" className="opacity-80 hover:opacity-100 transition-opacity drop-" />
             <div className="h-10 w-[1px] bg-white/[0.05]" />
             <div className="flex flex-col">
                <h1 className="text-[12px] font-black tracking-[0.6em] text-white uppercase leading-none">
                  Sovereign Operator Core
                </h1>
                <div className="flex items-center gap-2.5 mt-2.5">
                   <div className="w-1.5 h-1.5 rounded-sm bg-cyan-500" />
                   <span className="text-[8px] text-slate-500 font-bold tracking-[0.25em] uppercase">Tactical Mesh v4.0.2 // OBSIDIAN</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           {/* GLOBAL CONTROLS */}
           <button 
             onClick={resetLayout}
             onMouseEnter={() => playHov()}
             className="flex items-center gap-3 px-6 py-3 bg-white/[0.02] border border-white/[0.05] rounded-none text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all shadow-xl"
           >
             <RotateCcw className="w-3.5 h-3.5" />
             Recalibrate HUD
           </button>

           <div className="h-8 w-[1px] bg-white/[0.05]" />

           {/* STATUS HUD */}
           <div className="flex items-center gap-8 px-6 py-2.5 bg-black/40 border border-white/[0.03] rounded-3xl backdrop-blur-lg">
              <div className="flex flex-col min-w-[100px]">
                 <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[7px] text-slate-600 uppercase font-black tracking-widest">Neural Link</span>
                    <span className="text-[9px] text-cyan-400 font-mono font-black">{integrityHealth}%</span>
                 </div>
                 <div className="h-[2px] w-full bg-slate-900 rounded-sm overflow-hidden">
                    <motion.div animate={{ width: `${integrityHealth}%` }} className="h-full bg-cyan-500" />
                 </div>
              </div>
              <div className="flex flex-col border-l border-white/[0.05] pl-6">
                 <span className="text-[7px] text-slate-600 uppercase font-black tracking-widest leading-none mb-1.5">Reality Gateway</span>
                 <span className="text-[9px] text-slate-300 font-black flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-sm bg-slate-800" />
                    CONNECTED
                 </span>
              </div>
           </div>
        </div>
      </header>

      {/* Main Draggable Workspace */}
      <main className="fixed inset-0 pt-24 overflow-hidden pointer-events-none">
         
         <AnimatePresence>
            {windows.map((win) => (
               <NexusWindowPrimitive
                 key={win.id}
                 id={win.id}
                 title={win.id === 'registry' ? 'Planetary Neural Mesh' : win.title}
                 icon={<win.icon className="w-4 h-4" />}
                 zIndex={win.zIndex}
                 isCollapsed={win.isCollapsed}
                 defaultPos={{ x: win.x, y: win.y, width: win.w, height: win.h }}
                 onFocus={focusWindow}
                 onLayoutChange={(id, layout) => updateWindow(id, { ...layout })}
               >
                  <div className="w-full h-full custom-scrollbar overflow-auto p-1">
                     {win.id === 'registry' && (
                        <div className="flex flex-col h-full bg-[#020202]/40 backdrop-blur-2xl">
                           <div className="p-6 border-b border-white/[0.02] flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                 <Search className="w-4 h-4 text-slate-600" />
                                 <input 
                                   type="text"
                                   placeholder="QUERY NEURAL MESH..."
                                   value={searchTerm}
                                   onChange={e => setSearchTerm(e.target.value)}
                                   className="bg-transparent border-none text-[11px] font-black outline-none w-64 text-white placeholder:text-slate-700 tracking-widest uppercase"
                                 />
                              </div>
                              <div className="text-[9px] text-slate-500 font-black tracking-widest border border-white/5 px-4 py-1.5 rounded-sm">PLANETARY UNITS: {data?.fleetNodes.length || 0}</div>
                           </div>
                           <table className="w-full text-left">
                              <thead className="sticky top-0 bg-[#050505] z-10 border-b border-white/[0.03]">
                                 <tr className="font-mono">
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Entity Alias</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Hardware Signature</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">State</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {filteredNodes?.map((node: any) => (
                                    <tr key={node.id} className="hover:bg-cyan-500/[0.02] transition-colors border-b border-white/[0.01]">
                                       <td className="px-6 py-4">
                                          <div className="flex flex-col">
                                             <span className="text-[11px] font-black text-white uppercase tracking-tight">{node.alias || 'SOV-UNIT-X'}</span>
                                             <span className="text-[8px] text-slate-600 font-bold uppercase mt-1">Sector: {node.region || 'GLOBAL'}</span>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 text-[10px] text-slate-500 font-mono tracking-tighter opacity-70 italic">{node.robotId}</td>
                                       <td className="px-6 py-4">
                                          <div className={`text-[8px] font-black uppercase px-3 py-1 rounded-sm border w-fit shadow-2xl ${node.status === 'online' ? 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' : 'text-slate-500 border-white/5 bg-white/5'}`}>
                                             {node.status}
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                     {win.id === 'observability' && <MissionObservabilityMatrix data={data} />}
                     {win.id === 'iam' && <AdministrativeAccessGate auditLogs={data?.auditLogs || []} />}
                     {win.id === 'radar' && (
                        <div className="w-full h-full relative group shadow-[inset_0_40px_80px_rgba(0,0,0,1)]">
                           <IntelligenceGlobe />
                           <button 
                             onClick={handleNexusNavigation}
                             className="absolute inset-0 bg-cyan-500/[0.02] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[4px] w-full h-full"
                           >
                              <div className="px-8 py-3 bg-black/90 border border-cyan-500/30 rounded-none text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] shadow-2xl">Elevate to Global Worldview</div>
                           </button>
                        </div>
                     )}
                     {win.id === 'directives' && <StrategicCommandConsole />}
                     {win.id === 'leads' && <LeadObservatory />}
                     {win.id === 'audit' && (
                        <div className="p-6 flex flex-col gap-5">
                           {data?.auditLogs.map((log: any) => (
                              <div key={log.id} className="text-[11px] leading-snug border-l-2 border-slate-900 pl-5 hover:border-cyan-500 transition-colors group/log">
                                 <div className="flex justify-between mb-1.5">
                                    <div className="text-slate-600 text-[9px] uppercase font-black tracking-widest">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                    <div className="w-1.5 h-1.5 rounded-sm bg-slate-800 group-hover/log:bg-cyan-500 transition-colors" />
                                 </div>
                                 <div className="font-black text-white uppercase tracking-tight group-hover/log:text-cyan-400 transition-colors">{log.action}</div>
                                 <div className="text-slate-500 text-[10px] mt-1.5 leading-relaxed italic">{log.user} orchestrated {log.resource || 'CORE'}</div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </NexusWindowPrimitive>
            ))}
         </AnimatePresence>

      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}

// Icon Wrapper
function Brain(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function ShieldCheck(props: any) {
    return <ShieldAlert {...props}/>;
}
