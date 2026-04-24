"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, BrainCircuit, Activity, Zap, X } from 'lucide-react';
import { TacticalAlert } from '@/lib/notifications/notificationEngine';

export function NotificationHub() {
  const [notifications, setNotifications] = useState<TacticalAlert[]>([]);

  useEffect(() => {
    const handleNotification = (e: any) => {
      const alert = e.detail as TacticalAlert;
      setNotifications(prev => [alert, ...prev].slice(0, 5)); // Keep last 5
      
      // Auto-clear after 8 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== alert.id));
      }, 8000);
    };

    window.addEventListener('infraconnect:notification', handleNotification);
    return () => window.removeEventListener('infraconnect:notification', handleNotification);
  }, []);

  const getIcon = (category: string) => {
    switch (category) {
      case 'SECURITY': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'COGNITIVE': return <BrainCircuit className="w-4 h-4 text-indigo-400" />;
      case 'TELEMETRY': return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'MARKET': return <Zap className="w-4 h-4 text-amber-500" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBorderColor = (category: string) => {
    switch (category) {
      case 'SECURITY': return 'border-red-500/30 shadow-red-500/10';
      case 'COGNITIVE': return 'border-indigo-500/30 shadow-indigo-500/10';
      case 'TELEMETRY': return 'border-cyan-500/30 shadow-cyan-500/10';
      case 'MARKET': return 'border-amber-500/30 shadow-amber-500/10';
      default: return 'border-slate-800 shadow-transparent';
    }
  };

  return (
    <div className="fixed top-24 right-8 z-[100] w-80 space-y-3 pointer-events-none">
       <AnimatePresence>
          {notifications.map(notif => (
             <motion.div
               key={notif.id}
               initial={{ opacity: 0, x: 50, scale: 0.9 }}
               animate={{ opacity: 1, x: 0, scale: 1 }}
               exit={{ opacity: 0, x: 20, scale: 0.95 }}
               className={`pointer-events-auto p-4 bg-slate-950/90 backdrop-blur-xl border ${getBorderColor(notif.category)} rounded-sm shadow-2xl relative overflow-hidden group`}
             >
                {/* Entrance pulse */}
                <div className={`absolute top-0 left-0 w-1 h-full ${notif.category === 'SECURITY' ? 'bg-red-500' : notif.category === 'COGNITIVE' ? 'bg-indigo-500' : 'bg-cyan-500'} `} />

                <div className="flex justify-between items-start mb-1">
                   <div className="flex items-center gap-2">
                      {getIcon(notif.category)}
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{notif.category} ALERT</span>
                   </div>
                   <button 
                     onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                     className="text-slate-600 hover:text-white transition-colors"
                   >
                      <X className="w-3 h-3" />
                   </button>
                </div>
                
                <h4 className="text-[11px] font-bold text-slate-200 mb-1">{notif.title}</h4>
                <p className="text-[9px] text-slate-500 font-mono leading-relaxed">{notif.message}</p>
                
                <div className="mt-3 flex justify-between items-center text-[7px] font-black text-slate-700 uppercase tracking-tighter">
                   <span>ID: {notif.id}</span>
                   <span>{new Date(notif.timestamp).toLocaleTimeString()}</span>
                </div>
             </motion.div>
          ))}
       </AnimatePresence>
    </div>
  );
}
