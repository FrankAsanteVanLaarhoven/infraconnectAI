"use client";

import React, { useState } from 'react';
import { ShieldAlert, Trash2, Download, PowerOff, DatabaseAction, Lock } from 'lucide-react';

export default function SecurityDashboard() {
  const [dataMode, setDataMode] = useState("metadata_only");
  const [agentStatus, setAgentStatus] = useState("active");

  const exportData = async () => {
    alert("Initiating secure GDPR export pipeline...");
    await fetch("/api/gdpr/export");
  };

  const engageKillswitch = async () => {
    if(confirm("DANGER: This will immediately revoke agent identity certificates and sever the VPC edge tunnel. Proceed?")) {
      setAgentStatus("revoked");
      await fetch("/api/gdpr/delete-user", { method: "DELETE" });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto font-mono text-slate-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-widest text-white uppercase flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-indigo-400" />
          Security Command Center
        </h1>
        <p className="text-sm text-slate-500 mt-2">Manage edge telemetry constraints, compliance gates, and agent identity rotation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Data Protection Card */}
        <div className="glass-frost p-6 rounded-xl border border-indigo-900/30">
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
             Data Exposure Plane
             <Lock className="w-4 h-4 text-emerald-400" />
          </h2>
          <p className="text-xs text-slate-400 mb-6">Select the default PII masking filter engaged before edge agent transmission over mTLS.</p>
          
          <div className="flex flex-col gap-3 text-sm">
            <label className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${dataMode === 'metadata_only' ? 'bg-indigo-900/20 border-indigo-500/50' : 'border-slate-800'}`}>
              <input type="radio" value="metadata_only" checked={dataMode === 'metadata_only'} onChange={(e) => setDataMode(e.target.value)} />
              <div>
                <div className="font-semibold text-white">Metadata Only (Recommended)</div>
                <div className="text-xs text-slate-500">All PII (Names, Emails, Totals) stripped and masked.</div>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${dataMode === 'full' ? 'bg-red-900/20 border-red-500/50' : 'border-slate-800'}`}>
              <input type="radio" value="full" checked={dataMode === 'full'} onChange={(e) => setDataMode(e.target.value)} />
              <div>
                <div className="font-semibold text-white">Full Payload (Opt-In)</div>
                <div className="text-xs text-red-500">Transmits raw row data. Only for specific secure VPCs.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Compliance Card */}
        <div className="glass-frost p-6 rounded-xl border border-indigo-900/30">
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase border-b border-slate-800 pb-3 mb-4">
             GDPR / Erasure Protocols
          </h2>
          <p className="text-xs text-slate-400 mb-6">You act as the Data Controller. InfraConnect acts purely as the Processor.</p>
          
          <div className="flex flex-col gap-4">
            <button onClick={exportData} className="flex items-center justify-between p-3 border border-slate-800 rounded hover:border-slate-600 transition-colors bg-black/40 text-sm">
              <div className="flex items-center gap-2"><Download className="w-4 h-4 text-emerald-400"/> Export Processed Data & Logs</div>
              <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Access API</span>
            </button>

            <button onClick={engageKillswitch} disabled={agentStatus === 'revoked'} className="flex items-center justify-between p-3 border border-red-900/30 rounded hover:border-red-500/50 hover:bg-red-950/20 transition-colors bg-black/40 text-sm disabled:opacity-50">
              <div className="flex items-center gap-2"><PowerOff className={`w-4 h-4 ${agentStatus === 'revoked' ? 'text-slate-600' : 'text-red-500'}`}/> Terminate Edge Agents</div>
              <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Kill Switch</span>
            </button>
            {agentStatus === 'revoked' && (
              <div className="text-xs text-red-400 mt-[-4px] animate-pulse">Edges Severed. Cryptographic Identity Revoked.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
