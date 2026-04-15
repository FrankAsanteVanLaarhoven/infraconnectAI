'use client';

import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Plus, FileText, ArrowUpRight, Search, Settings,
  AlertTriangle, CheckCircle2, Trash2, Command, ShieldAlert, Zap, Cpu, RefreshCw
} from 'lucide-react';
import type { ActivityLog } from '@/lib/memory/types';

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  create: Plus,
  update: FileText,
  promote: ArrowUpRight,
  search: Search,
  delete: Trash2,
  policy: Settings,
  health: Activity,
  skill: Command,
  incident: ShieldAlert,
  sync: RefreshCw,
  autonomous: Zap,
};

const ACTION_COLORS: Record<string, string> = {
  create: 'text-foreground',
  update: 'text-muted-foreground',
  promote: 'text-cyan-500',
  search: 'text-muted-foreground/60',
  delete: 'text-red-500',
  policy: 'text-foreground',
  health: 'text-foreground',
  skill: 'text-purple-400',
  incident: 'text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
  sync: 'text-blue-400',
  autonomous: 'text-cyan-400',
};

export function ActivityPanel() {
  const { activityLog } = useMemoryStore();

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <GlassPanel glow className="h-full flex flex-col pt-5">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-foreground">
          <Activity className="w-4 h-4 text-cyan-500" />
          Neural activity hub
        </h3>
        <div className="flex items-center gap-3">
           <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[8px] uppercase font-bold tracking-widest text-cyan-500">Live</span>
           </span>
           <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 tabular-nums">{activityLog.length} events</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[500px] space-y-1.5 scrollbar-hide pr-1">
        <AnimatePresence initial={false}>
          {activityLog.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Activity className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3 animate-pulse" />
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/30 text-center">Awaiting platform signals...</p>
            </motion.div>
          ) : (
            activityLog.map((log) => {
              const Icon = ACTION_ICONS[log.action] ?? Activity;
              const colorClass = ACTION_COLORS[log.action] ?? 'text-muted-foreground';
              const isIncident = log.action === 'incident';
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, scale: 0.98, x: -5 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className={cn(
                    "flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden",
                    isIncident ? "bg-red-500/5 border border-red-500/20" : "hover:bg-foreground/5 border border-transparent hover:border-border/10"
                  )}
                >
                  {/* Subtle Background Glow for Incidents */}
                  {isIncident && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />}
                  
                  <div className={cn(
                    "mt-0.5 shrink-0 w-7 h-7 flex items-center justify-center rounded border transition-colors",
                    isIncident ? "bg-red-500/10 border-red-500/30" : "bg-foreground/5 border-border/10 group-hover:border-border/30"
                  )}>
                    <Icon className={cn('w-4 h-4', colorClass)} />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2">
                       <span className={cn(
                         "text-[11px] font-bold tracking-wide uppercase",
                         isIncident ? "text-red-400" : "text-muted-foreground group-hover:text-foreground"
                       )}>
                         {log.detail}
                       </span>
                       <span className="text-[9px] uppercase font-bold tracking-[0.1em] text-muted-foreground/20 tabular-nums shrink-0">
                         {formatTime(log.createdAt)}
                       </span>
                    </div>
                    {log.target && (
                      <div className="flex items-center gap-1.5 mt-1">
                         <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                         <span className="text-[10px] font-mono text-muted-foreground/40 truncate block uppercase tracking-widest">
                           {log.target}
                         </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </GlassPanel>
  );
}
