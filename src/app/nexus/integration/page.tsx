"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Key, 
  Globe, 
  Settings, 
  Code2, 
  Database, 
  Activity, 
  Copy, 
  Check, 
  Rocket, 
  Cpu,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function IntegrationPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [uplinks, setUplinks] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function fetchUplinks() {
       try {
          const res = await fetch('/api/nexus/integration/uplink');
          const json = await res.json();
          setUplinks(json.uplinks);
       } catch {}
    }
    fetchUplinks();
    const inv = setInterval(fetchUplinks, 10000);
    return () => clearInterval(inv);
  }, []);

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/nexus/integration/uplink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GENERATE_KEY', clientId: 'Enterprise_Alpha' })
      });
      const json = await res.json();
      setApiKey(json.apiKey);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const installCmd = `curl -sL https://install.infraconnect.ai | bash -s -- ${apiKey || 'YOUR_TOKEN'}`;

  return (
    <div className="min-h-full bg-[#020202] text-slate-300 font-mono p-8 relative overflow-hidden selection:bg-cyan-500/30">
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

       <div className="max-w-6xl mx-auto space-y-12 relative z-10">
          
          {/* Header */}
          <header className="flex justify-between items-end border-b border-white/5 pb-8">
             <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-sm">
                      <Globe className="w-5 h-5 text-indigo-400" />
                   </div>
                   <h1 className="text-xl font-black text-white uppercase tracking-[0.4em]">Enterprise Developer Hub</h1>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                   Neural Grid Integration // Sovereign SDK v1.0.2
                </p>
             </div>
             <div className="flex items-center gap-6">
                <div className="text-right">
                   <span className="text-[8px] text-slate-600 block mb-1 font-black uppercase tracking-widest">Global Status</span>
                   <span className="text-xs font-black text-slate-300 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-sm bg-slate-800" />
                      UPLINK_READY
                   </span>
                </div>
             </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             
             {/* Left Column: API & Keys */}
             <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Quick Start */}
                <section className="bg-white/[0.02] border border-white/5 p-8 rounded-none relative group">
                   <div className="flex items-center gap-3 mb-6">
                      <Rocket className="w-4 h-4 text-cyan-400" />
                      <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Quick Start Installer</h2>
                   </div>
                   <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">
                      Deploy a Sovereign Uplink Node to your infrastructure in seconds. This command initializes the identity mapping and secures the tunnel.
                   </p>
                   <div className="bg-black/60 border border-white/10 p-4 rounded-sm flex items-center justify-between group">
                      <code className="text-[10px] text-cyan-500 truncate mr-4">
                         {installCmd}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(installCmd)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-sm transition-all"
                      >
                         {copied ? <Check className="w-3.5 h-3.5 text-slate-300" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                   </div>
                </section>

                {/* 2. Uplink Registry */}
                <section className="space-y-4">
                   <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-3">
                         <Activity className="w-4 h-4 text-indigo-400" />
                         <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Uplinks</h2>
                      </div>
                      <span className="text-[8px] text-slate-700 uppercase font-black tracking-widest">Synchronized Live</span>
                   </div>
                   <div className="space-y-3">
                      {uplinks.map(uplink => (
                         <div key={uplink.id} className="p-5 bg-white/[0.01] border border-white/5 rounded-sm flex items-center justify-between hover:bg-white/[0.03] transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="p-2 bg-slate-900 rounded-sm border border-white/5">
                                  <Cpu className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                               </div>
                               <div>
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-bold text-white uppercase tracking-wider">{uplink.clientId}</span>
                                     <span className="text-[8px] text-slate-300 font-black uppercase tracking-tighter">● {uplink.status}</span>
                                  </div>
                                  <div className="text-[7px] text-slate-600 font-bold uppercase tracking-widest mt-1">UDS_ID: {uplink.id} // SECURE_HANDSHAKE: OK</div>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="text-[8px] text-slate-700 uppercase font-black mb-1">Heartbeat</div>
                               <div className="text-[9px] text-slate-400 font-black">{new Date(uplink.lastHeartbeat).toLocaleTimeString()}</div>
                            </div>
                         </div>
                      ))}
                   </div>
                </section>
             </div>

             {/* Right Column: Documentation & Logic */}
             <div className="space-y-8">
                
                {/* 3. API Key Management */}
                <section className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-none space-y-6">
                   <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-indigo-400" />
                      <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Sovereign Uplink Keys</h2>
                   </div>
                   <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase">
                      Issue master keys to authorize your platform nodes. Treat these as highly sensitive mission-critical assets.
                   </p>
                   {apiKey ? (
                      <div className="bg-black/40 border border-indigo-500/30 p-3 rounded-sm flex items-center justify-between">
                         <span className="text-[9px] text-indigo-400 truncate mr-2">{apiKey}</span>
                         <button onClick={() => copyToClipboard(apiKey)} className="text-slate-500 hover:text-white transition-colors">
                            <Copy className="w-3 h-3" />
                         </button>
                      </div>
                   ) : (
                      <button 
                        onClick={handleGenerateKey}
                        disabled={isGenerating}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-sm transition-all disabled:opacity-50"
                      >
                         {isGenerating ? 'GENERATING...' : 'Generate Master Key'}
                      </button>
                   )}
                </section>

                {/* 4. Documentation Quick Links */}
                <section className="space-y-4">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Integration Resources</h3>
                   <div className="space-y-2">
                      {[
                        { title: 'Sovereign SDK Docs', icon: Code2 },
                        { title: 'Webhook Payload Schema', icon: Terminal },
                        { title: 'mTLS Handshake Guide', icon: ShieldCheck },
                        { title: 'Telemetry Node Config', icon: Settings }
                      ].map((item, idx) => (
                         <div key={idx} className="p-4 bg-white/[0.01] border border-white/5 rounded-sm flex items-center justify-between group hover:bg-white/[0.02] cursor-pointer transition-all">
                            <div className="flex items-center gap-3">
                               <item.icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                               <span className="text-[9px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest transition-colors">{item.title}</span>
                            </div>
                            <ChevronRight className="w-3 h-3 text-slate-800 group-hover:text-white transition-all" />
                         </div>
                      ))}
                   </div>
                </section>
             </div>

          </div>

       </div>
    </div>
  );
}
