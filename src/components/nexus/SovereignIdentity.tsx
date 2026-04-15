"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Mail, 
    Smartphone, 
    Bell, 
    ShieldCheck, 
    Settings, 
    Check,
    Save,
    Lock,
    Eye
} from 'lucide-react';
import { SOVEREIGN_IDENTITY } from '@/lib/nexus/user-identity-hub';

export function SovereignIdentity() {
    const [isSaving, setIsSaving] = useState(false);
    const [preferences, setPreferences] = useState(SOVEREIGN_IDENTITY.notificationPreferences);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <div className="w-full h-full bg-[#020617]/90 backdrop-blur-3xl border border-blue-500/20 rounded-3xl p-8 flex flex-col font-mono relative overflow-hidden group shadow-[0_0_100px_rgba(59,130,246,0.1)]">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                        <User className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Sovereign Identity</h2>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Operator Profile // Secure Hub</p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-slate-900/60 border border-white/10 rounded-xl flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] text-white font-black uppercase">Identity_Verified</span>
                </div>
            </div>

            {/* Profile Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Operator Email</span>
                        <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center gap-4 transition-all hover:border-blue-500/30">
                            <Mail className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-white font-medium">{SOVEREIGN_IDENTITY.email}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Mobile Substrate</span>
                        <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center gap-4 transition-all hover:border-blue-500/30">
                            <Smartphone className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-white font-medium">{SOVEREIGN_IDENTITY.mobile}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col gap-4 relative">
                    <div className="absolute top-4 right-4 text-[7px] text-slate-700 font-black uppercase">Secure_Vault_v2</div>
                    <span className="text-[9px] text-slate-500 uppercase font-black border-b border-white/5 pb-2">Institutional Platform</span>
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-white">{SOVEREIGN_IDENTITY.preferredPlatform}</span>
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Lock className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-[9px] text-slate-600 italic">Mirror Mode active. Direct API injection disabled for compliance sovereignty.</p>
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="flex-1 flex flex-col gap-4">
                <span className="text-[9px] text-slate-500 uppercase font-black border-b border-white/5 pb-2">Notification Heartbeat</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-2">
                    {[
                        { label: 'High-Primacy Buy Alerts', value: preferences.buyAlerts, key: 'buyAlerts' },
                        { label: 'Institutional Sell Signals', value: preferences.sellAlerts, key: 'sellAlerts' },
                        { label: 'Daily Alpha Reports', value: preferences.dailyProfitReport, key: 'dailyProfitReport' },
                        { label: 'Sovereign Emergency SL', value: preferences.emergencyStopLoss, key: 'emergencyStopLoss' }
                    ].map((pref, i) => (
                        <div 
                            key={i}
                            className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between group/pref hover:border-blue-500/20 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <Bell className="w-3.5 h-3.5 text-slate-500 group-hover/pref:text-blue-400 transition-colors" />
                                <span className="text-[10px] text-white font-black uppercase tracking-tight">{pref.label}</span>
                            </div>
                            <div className={`w-8 h-4 rounded-full relative transition-all ${pref.value ? 'bg-blue-600' : 'bg-slate-700'}`}>
                                <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${pref.value ? 'right-1' : 'left-1'}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Actions */}
            <div className="mt-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-[9px] text-slate-600 uppercase font-black">
                    <Eye className="w-4 h-4" />
                    <span>View Private Keys</span>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase px-8 py-3 rounded-2xl flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] disabled:opacity-50"
                >
                    {isSaving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Synchronizing...' : 'Commit Changes'}
                </button>
            </div>
        </div>
    );
}
