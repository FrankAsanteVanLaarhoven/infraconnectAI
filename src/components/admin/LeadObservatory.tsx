import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Filter, CheckCircle, Clock, ShieldAlert, Crosshair } from 'lucide-react';

interface Lead {
  id: string;
  clientIdentifier: string;
  clientName: string;
  leadTier: string;
  threatLevel: string;
  status: string;
  capturedAt: string;
  intentPayload: string;
}

export function LeadObservatory() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/super-admin/leads');
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
      }
    } catch (err) {
      console.warn("Lead fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    if (filter === 'ENTERPRISE') return l.leadTier === 'HIGH_VALUE';
    if (filter === 'WAITLIST') return l.leadTier === 'GENERIC';
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-[#020202]/40 backdrop-blur-2xl text-white font-mono">
      {/* Header */}
      <div className="p-6 border-b border-white/[0.02] flex justify-between items-center bg-[#050505]/50">
        <div className="flex items-center gap-4">
          <Users className="w-5 h-5 text-cyan-400" />
          <h2 className="text-[14px] font-black uppercase tracking-widest text-cyan-400">Access Requests & Leads</h2>
        </div>
        <div className="flex bg-black/50 p-1 rounded-lg border border-white/5">
          {['ALL', 'ENTERPRISE', 'WAITLIST'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest uppercase transition-all ${
                filter === f ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        {loading && leads.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"/>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#070707] z-10 border-b border-white/[0.05] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <tr>
                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Identifier</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Classification</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Intent / Threat</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={lead.id} 
                  className="hover:bg-white/[0.02] transition-colors border-b border-white/[0.02] group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-black text-white">{lead.clientName}</span>
                      <span className="text-[10px] text-slate-500 mt-1">{lead.clientIdentifier}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                      lead.leadTier === 'HIGH_VALUE' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 border-white/10'
                    }`}>
                      {lead.leadTier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-slate-300 italic flex items-center gap-2">
                        <Crosshair className="w-3 h-3 text-slate-500"/>
                        {lead.intentPayload || 'Early Access'}
                      </span>
                      {lead.threatLevel !== 'benign' && (
                        <span className="text-[9px] text-red-400 font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3"/> Threat: {lead.threatLevel}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase flex items-center gap-1.5 w-fit ${
                      lead.status === 'cleared' ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      {lead.status === 'cleared' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {new Date(lead.capturedAt).toLocaleString()}
                    </span>
                  </td>
                </motion.tr>
              ))}
              
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-500 text-[11px] uppercase tracking-widest font-black">
                    No leads detected in this sector
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
