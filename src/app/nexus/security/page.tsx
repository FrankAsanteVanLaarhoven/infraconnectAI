"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Smartphone, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Terminal, 
  Activity, 
  Hash, 
  Lock 
} from 'lucide-react';
import { MatrixRain } from '@/components/ui/matrix-rain';
import { useTranslation } from '@/components/providers/LocalizationProvider';

export default function SecurityPortal() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deauthorizing, setDeauthorizing] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/security/stats');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeauthorize = async (id: string) => {
    if (!confirm("Are you sure you want to deauthorize this hardware signature? Access from this device will be immediately terminated.")) return;
    
    setDeauthorizing(id);
    try {
      const res = await fetch(`/api/security/device/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeauthorizing(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-green-500">
      <Activity className="w-8 h-8 animate-spin mb-4" />
      <p className="text-xs uppercase tracking-widest">{t('security.accessing')}</p>
    </div>
  );

  const devices = data?.devices || [];
  const incidents = data?.incidents || [];
  const subscription = data?.subscription;

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 font-mono relative overflow-hidden p-8 pt-24">
      <MatrixRain color="#1e1b4b" className="opacity-10" />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{t('security.portal_title')}</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{t('security.portal_subtitle')}</p>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded flex items-center gap-2">
            <Hash className="w-3 h-3 text-slate-600" />
            <span className="text-[10px] font-bold">{t('security.tier')}: {subscription?.tier || 'STANDARD'}</span>
          </div>
          <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded flex items-center gap-2">
            <Lock className="w-3 h-3 text-slate-600" />
            <span className="text-[10px] font-bold">{t('security.limit')}: {data?.stats?.activeDevices} / {data?.stats?.deviceLimit} {t('security.devices')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Device Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-950/40 backdrop-blur-xl border border-slate-900 p-6 rounded-xl">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  <h2 className="text-sm font-black text-white uppercase">{t('security.authorized_hardware')}</h2>
                </div>
                <span className="text-[10px] text-slate-600">{t('security.last_seen_telemetry')}</span>
             </div>

             <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {devices.map((device: any) => (
                    <motion.div 
                      key={device.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group flex items-center justify-between p-4 bg-slate-900/20 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-800/50 rounded">
                           <Smartphone className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-100">{device.label || t('security.unknown_station')}</p>
                          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                            UDS: {device.fingerprint.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[9px] text-slate-600 uppercase">{t('security.last_contact')}</p>
                          <p className="text-[10px] font-bold text-slate-400">{new Date(device.lastSeen).toLocaleString()}</p>
                        </div>
                        <button 
                          onClick={() => handleDeauthorize(device.id)}
                          disabled={deauthorizing === device.id}
                          className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                        >
                          <Trash2 className={`w-4 h-4 ${deauthorizing === device.id ? 'animate-pulse' : ''}`} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {devices.length === 0 && (
                  <div className="py-12 text-center border-2 border-dashed border-slate-900 rounded-xl">
                    <Smartphone className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 uppercase">{t('security.no_signatures')}</p>
                  </div>
                )}
             </div>
          </div>

          <div className="bg-amber-950/10 border border-amber-900/20 p-6 rounded-xl flex gap-4">
             <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
             <div>
                <h3 className="text-sm font-bold text-amber-500 uppercase mb-1">{t('security.protocols_title')}</h3>
                <p className="text-xs text-amber-800 leading-relaxed uppercase">
                   {t('security.protocols_desc').replace('{deviceLimit}', data?.stats?.deviceLimit?.toString() || '3')}
                </p>
             </div>
          </div>
        </div>

        {/* Security Logs Sidebar */}
        <div className="bg-slate-950/40 backdrop-blur-xl border border-slate-900 flex flex-col rounded-xl overflow-hidden h-fit">
           <div className="p-4 bg-red-950/10 border-b border-red-900/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-red-500" />
                <h2 className="text-xs font-black text-red-500 uppercase">{t('security.intercept_logs')}</h2>
              </div>
              <Activity className="w-3 h-3 text-red-900 animate-pulse" />
           </div>
           
           <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {incidents.map((incident: any) => (
                <div key={incident.id} className="p-3 bg-black/40 border border-red-900/20 rounded-lg">
                   <div className="flex items-center justify-between mb-2">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${incident.severity === 'high' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className="text-[8px] text-slate-600 font-mono">{new Date(incident.ts).toLocaleTimeString()}</span>
                   </div>
                   <p className="text-[10px] font-bold text-slate-200 mb-1">{incident.type.replace(/_/g, ' ')}</p>
                   <p className="text-[9px] text-red-900 font-mono truncate">ID: {incident.fingerprint.substring(0, 12)}...</p>
                </div>
              ))}
              {incidents.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-6 h-6 text-green-900 mx-auto mb-2" />
                  <p className="text-[10px] text-slate-700 uppercase">{t('security.clear_environment')}</p>
                </div>
              )}
           </div>
           
           <div className="p-4 border-t border-slate-900 bg-slate-900/10 text-center">
              <p className="text-[8px] text-slate-600 uppercase font-bold tracking-widest">{t('security.encryption_active')}</p>
           </div>
        </div>

      </div>
    </div>
  );
}
