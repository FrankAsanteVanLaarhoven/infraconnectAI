'use client';

import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Activity, Plus, FileText, ArrowUpRight, Search, Settings,
  AlertTriangle, CheckCircle2, Trash2, Command
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
};

const ACTION_COLORS: Record<string, string> = {
  create: 'text-foreground',
  update: 'text-muted-foreground',
  promote: 'text-foreground',
  search: 'text-muted-foreground/60',
  delete: 'text-muted-foreground/50',
  policy: 'text-foreground',
  health: 'text-foreground',
  skill: 'text-muted-foreground',
};

export function ActivityPanel() {
  const { activityLog } = useMemoryStore();

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <GlassPanel glow className="h-full flex flex-col pt-5">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-foreground">
          <Activity className="w-4 h-4 text-foreground" />
          Activity Log
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">{activityLog.length} events</span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[500px] space-y-1">
        {activityLog.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2 animate-breathe" />
            <p className="text-xs text-muted-foreground/50">No activity yet</p>
          </div>
        ) : (
          activityLog.map((log, i) => {
            const Icon = ACTION_ICONS[log.action] ?? Activity;
            const color = ACTION_COLORS[log.action] ?? 'text-muted-foreground';
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-foreground/5 border border-transparent hover:border-border/10 transition-colors"
              >
                <div className="mt-0.5 shrink-0 bg-foreground/5 w-6 h-6 flex items-center justify-center rounded-md border border-border/10">
                  <Icon className={cn('w-3.5 h-3.5', color)} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span className={cn("text-xs font-medium tracking-wide", color === 'text-foreground' ? 'text-foreground' : 'text-muted-foreground/80')}>{log.detail}</span>
                  {log.target && (
                    <span className="text-[10px] font-mono text-muted-foreground/40 truncate block mt-0.5">
                      {log.target}
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground/30 tabular-nums shrink-0 mt-0.5">
                  {formatTime(log.createdAt)}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </GlassPanel>
  );
}
