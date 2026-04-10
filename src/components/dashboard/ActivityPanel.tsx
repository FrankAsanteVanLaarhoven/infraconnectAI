'use client';

import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Activity, Plus, FileText, ArrowUpCircle, Search, Settings,
  AlertTriangle, CheckCircle2, Trash2, Zap
} from 'lucide-react';
import type { ActivityLog } from '@/lib/memory/types';

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  create: Plus,
  update: FileText,
  promote: ArrowUpCircle,
  search: Search,
  delete: Trash2,
  policy: Settings,
  health: Activity,
  skill: Zap,
};

const ACTION_COLORS: Record<string, string> = {
  create: 'text-matrix',
  update: 'text-blue-400',
  promote: 'text-purple-400',
  search: 'text-muted-foreground',
  delete: 'text-destructive',
  policy: 'text-governance',
  health: 'text-matrix',
  skill: 'text-execution',
};

export function ActivityPanel() {
  const { activityLog } = useMemoryStore();

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <GlassPanel variant="strong" className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
          <Activity className="w-4 h-4 text-matrix" />
          Activity
        </h3>
        <span className="text-mono-xs text-muted-foreground">{activityLog.length} events</span>
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
                className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-glass-hover/50 transition-colors"
              >
                <Icon className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{log.detail}</span>
                  </div>
                  {log.target && (
                    <span className="text-mono-xs text-muted-foreground/50 truncate block">
                      {log.target}
                    </span>
                  )}
                </div>
                <span className="text-mono-xs text-muted-foreground/40 tabular-nums shrink-0">
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
