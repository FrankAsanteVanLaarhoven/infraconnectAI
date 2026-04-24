import React from 'react';
import { Terminal, Download, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ConnectPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-16 font-mono flex items-center justify-center">
      <div className="max-w-4xl w-full border border-slate-800 bg-[#0a0b0c] p-10 relative overflow-hidden group">
        {/* Hardware Corner Aesthetics */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-slate-700 z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-slate-700 z-10 pointer-events-none" />

        <div className="flex items-center gap-3 mb-6">
          <Terminal className="w-8 h-8 text-slate-300" />
          <h1 className="text-3xl font-bold tracking-widest uppercase">Connect Infrastructure</h1>
        </div>
        
        <p className="text-slate-400 mb-10 max-w-2xl leading-relaxed">
          Deploy the Grok Direct Server Connector (GDSC) inside your VPC or isolated environment. 
          The agent utilizes purely outbound mTLS WebSocket tunnels to automatically discover 
          local database schemas without requiring inbound firewall rules or manual API keys.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Linux Quick Install */}
          <div className="bg-[#111214] border border-slate-700/50 p-6 rounded-md hover:border-slate-500 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-200 uppercase">Linux & Cloud VMs</h2>
              <Badge variant="outline" className="text-slate-300 border-slate-700 bg-slate-800">Recommended</Badge>
            </div>
            <p className="text-xs text-slate-500 mb-4">One-line installer for Debian, Ubuntu, Amazon Linux 2, and RHEL.</p>
            
            <div className="bg-black border border-slate-800 p-4 rounded text-xs text-slate-300 font-mono tracking-wider overflow-x-auto relative group-hover/code:border-slate-700 transition-colors">
              <code className="whitespace-nowrap">curl -fsSL https://connect.infraconnect.ai/install.sh | bash -s -- --token YOUR_INVITE_TOKEN</code>
            </div>
          </div>

          {/* Windows Quick Install */}
          <div className="bg-[#111214] border border-slate-700/50 p-6 rounded-md hover:border-slate-500 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-200 uppercase">Windows Server</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">PowerShell installer for Windows Server 2016+ with NSSM native backing.</p>
            
            <div className="bg-black border border-zinc-800 p-4 rounded text-xs text-white font-mono tracking-wider overflow-x-auto relative group-hover/code:border-zinc-500/50 transition-colors">
              <code className="whitespace-nowrap">Invoke-WebRequest -Uri https://connect.grok.com/install.ps1 -OutFile install.ps1; .\install.ps1 -Token YOUR_INVITE_TOKEN</code>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="border-t border-slate-800/80 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Outbound Only</h3>
            <p className="text-xs text-slate-500 leading-relaxed">True zero-trust architecture. Connection is exclusively initiated outward over secure TLS 1.3 tunnels.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Zap className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">CORE Discovery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Autonomous port and resource scanning algorithms actively map your topology for the Semantic Layer instantly.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Download className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Air-Gapped Binary</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Orchelstration runs out of an isolated Go executable smaller than 85MB. No heavy agent footprints.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
