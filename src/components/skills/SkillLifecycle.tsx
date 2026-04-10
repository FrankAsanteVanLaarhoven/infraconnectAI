'use client';

import { useCallback, useState } from 'react';
import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SKILL_CONTRACTS, SKILL_LABELS } from '@/lib/memory/types';
import type { SkillName, SkillStatus, SkillRun } from '@/lib/memory/types';
import {
  FileText, ClipboardList, Hammer, TestTube, Eye, Rocket,
  BookOpen, Pencil, Lock, Clock, CheckCircle2, XCircle, Loader2,
  Play, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const SKILL_ICONS: Record<SkillName, React.ComponentType<{ className?: string }>> = {
  spec: FileText,
  plan: ClipboardList,
  build: Hammer,
  test: TestTube,
  review: Eye,
  ship: Rocket,
};

const SKILL_ORDER: SkillName[] = ['spec', 'plan', 'build', 'test', 'review', 'ship'];

const STATUS_CONFIG: Record<SkillStatus, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-muted-foreground', label: 'Pending' },
  running: { icon: Loader2, color: 'text-yellow-500', label: 'Running' },
  completed: { icon: CheckCircle2, color: 'text-matrix', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-destructive', label: 'Failed' },
};

function formatDuration(ms: number): string {
  if (ms <= 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

/* ─── Pipeline Node ─── */

function PipelineNode({ skill, index, isActive, lastRun, onClick }: {
  skill: SkillName;
  index: number;
  isActive: boolean;
  lastRun?: SkillRun;
  onClick: () => void;
}) {
  const Icon = SKILL_ICONS[skill];
  const isLast = index === SKILL_ORDER.length - 1;
  const isRunning = lastRun?.status === 'running';
  const isCompleted = lastRun?.status === 'completed';
  const isFailed = lastRun?.status === 'failed';

  return (
    <motion.div
      className="flex items-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        onClick={onClick}
        className={cn(
          'relative flex flex-col items-center gap-1.5 group cursor-pointer transition-all duration-300',
          isActive && 'scale-110'
        )}
        aria-label={`Select skill ${skill}`}
      >
        {/* Circle node */}
        <div className={cn(
          'relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300',
          isActive
            ? 'bg-matrix/20 shadow-[0_0_16px_var(--matrix-glow)] ring-1 ring-matrix/40'
            : 'bg-glass-border/60 hover:bg-glass-hover hover:shadow-[0_0_8px_var(--matrix-glow)]',
          isRunning && 'animate-pulse-glow',
        )}>
          {/* Pulse ring for running */}
          {isRunning && (
            <span className="absolute inset-0 rounded-full border-2 border-yellow-500/40 animate-ping" />
          )}

          <Icon className={cn(
            'w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300',
            isActive ? 'text-matrix' : 'text-muted-foreground group-hover:text-foreground'
          )} />

          {/* Completed checkmark overlay */}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-matrix flex items-center justify-center"
            >
              <CheckCircle2 className="w-3 h-3 text-background" />
            </motion.div>
          )}

          {/* Failed X overlay */}
          {isFailed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center"
            >
              <XCircle className="w-3 h-3 text-background" />
            </motion.div>
          )}
        </div>

        {/* Skill name */}
        <span className={cn(
          'text-mono-xs font-medium transition-colors duration-300',
          isActive ? 'text-matrix' : 'text-muted-foreground group-hover:text-foreground'
        )}>
          {skill}
        </span>
      </button>

      {/* Animated connector line */}
      {!isLast && (
        <div className="flex-1 flex items-center mx-1 sm:mx-2 min-w-[16px] sm:min-w-[24px]">
          <div className="w-full h-px relative overflow-hidden">
            <div className="absolute inset-0 border-t border-dashed border-glass-border" />
            <motion.div
              className="absolute inset-y-0 w-6 bg-gradient-to-r from-transparent via-matrix/40 to-transparent"
              animate={{ x: ['-24px', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: index * 0.3 }}
            />
          </div>
          {/* Arrow chevron */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-glass-border" />
        </div>
      )}
    </motion.div>
  );
}

/* ─── Detail Panel ─── */

function SkillDetailPanel({ skill, onRunSkill }: {
  skill: SkillName;
  onRunSkill: (skill: SkillName) => void;
}) {
  const { skillRuns, addSkillRun, updateSkillRun, addActivity, setHealth } = useMemoryStore();
  const [isRunning, setIsRunning] = useState(false);
  const contract = SKILL_CONTRACTS[skill];
  const Icon = SKILL_ICONS[skill];

  const lastRun = skillRuns.find(r => r.skill === skill && r.status !== 'pending');

  const handleRun = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);

    const runId = crypto.randomUUID();
    const newRun: SkillRun = {
      id: runId,
      skill,
      status: 'running',
      input: '',
      output: '',
      memoryRead: [],
      memoryWritten: [],
      duration: 0,
      error: '',
      createdAt: new Date().toISOString(),
    };
    addSkillRun(newRun);
    addActivity({
      id: crypto.randomUUID(),
      action: 'skill',
      target: runId,
      detail: `Running /${skill}`,
      metadata: {},
      createdAt: new Date().toISOString(),
    });

    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill, input: '' }),
      });
      const data = await res.json();

      updateSkillRun(runId, {
        status: data.success ? 'completed' : 'failed',
        output: data.output ?? '',
        duration: data.duration ?? 0,
        error: data.error ?? '',
      });

      if (data.success) {
        toast.success(`/${skill} completed successfully`);
      } else {
        toast.error(`/${skill} failed: ${data.error ?? 'Unknown error'}`);
      }

      // Refresh health data
      try {
        const healthRes = await fetch('/api/health');
        const healthData = await healthRes.json();
        setHealth(healthData);
      } catch { /* ignore health refresh error */ }

      // Notify parent
      onRunSkill?.(skill);
    } catch {
      updateSkillRun(runId, { status: 'failed', error: 'Network error' });
      toast.error(`/${skill} failed: Network error`);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, skill, addSkillRun, updateSkillRun, addActivity, setHealth, onRunSkill]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-4 p-4 rounded-xl glass-subtle space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-matrix/15 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-matrix" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <code className="text-mono-sm font-semibold text-foreground">/{skill}</code>
                <span className="text-mono-xs text-muted-foreground">{SKILL_LABELS[skill]}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">{contract.description}</p>
            </div>
          </div>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
              isRunning
                ? 'bg-matrix/10 text-matrix/60 cursor-wait'
                : 'bg-matrix/15 text-matrix hover:bg-matrix/25 hover:shadow-[0_0_12px_var(--matrix-glow)] active:scale-95'
            )}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Running</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Run Skill</span>
              </>
            )}
          </button>
        </div>

        {/* Last run info */}
        {lastRun && (
          <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-background/30 text-mono-xs">
            <div className="flex items-center gap-1.5">
              {(() => {
                const cfg = STATUS_CONFIG[lastRun.status];
                const SIcon = cfg.icon;
                return <SIcon className={cn('w-3 h-3', cfg.color, lastRun.status === 'running' && 'animate-spin')} />;
              })()}
              <span className="text-muted-foreground">{STATUS_CONFIG[lastRun.status].label}</span>
            </div>
            {lastRun.duration > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground/60" />
                <span className="text-muted-foreground">{formatDuration(lastRun.duration)}</span>
              </div>
            )}
            <span className="text-muted-foreground/50">{formatTimestamp(lastRun.createdAt)}</span>
          </div>
        )}

        {/* Memory Contract */}
        <div className="space-y-3">
          <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
            Memory Contract
          </h4>

          {/* Reads */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
              <BookOpen className="w-3 h-3" /> Reads
            </div>
            {contract.reads.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2 pl-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-matrix/70 shadow-[0_0_4px_var(--matrix-glow)]" />
                <code className="text-mono-xs text-foreground/80">{r}</code>
              </motion.div>
            ))}
          </div>

          {/* Writes */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
              <Pencil className="w-3 h-3" /> Writes
            </div>
            {contract.writes.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (contract.reads.length + i) * 0.04 }}
                className="flex items-center gap-2 pl-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/70 shadow-[0_0_4px_oklch(0.75_0.18_85)]" />
                <code className="text-mono-xs text-foreground/80">{w}</code>
              </motion.div>
            ))}
          </div>

          {/* Constraints */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
              <Lock className="w-3 h-3" /> Constraints
            </div>
            {contract.constraints.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (contract.reads.length + contract.writes.length + i) * 0.04 }}
                className="flex items-center gap-2 pl-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-destructive/70 shadow-[0_0_4px_oklch(0.65_0.22_25)]" />
                <code className="text-mono-xs text-foreground/80">{c}</code>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Recent Runs List ─── */

function RecentRunsList({ runs }: { runs: SkillRun[] }) {
  if (runs.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-glass-border">
      <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase mb-2">
        Recent Runs
      </h4>
      <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
        {runs.map((run, i) => {
          const cfg = STATUS_CONFIG[run.status];
          const StatusIcon = cfg.icon;

          return (
            <motion.div
              key={run.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors duration-200',
                run.status === 'running' && 'bg-yellow-500/5',
                run.status === 'failed' && 'bg-destructive/5',
              )}
            >
              <StatusIcon className={cn(
                'w-3 h-3 shrink-0',
                cfg.color,
                run.status === 'running' && 'animate-spin'
              )} />
              <code className="text-mono-xs font-medium text-foreground/80">/{run.skill}</code>
              {run.input && (
                <span className="text-muted-foreground/60 truncate text-mono-xs max-w-[80px]">{run.input}</span>
              )}
              <span className="flex-1" />
              <span className="text-mono-xs text-muted-foreground/50 tabular-nums shrink-0">
                {formatDuration(run.duration)}
              </span>
              <span className="text-mono-xs text-muted-foreground/40 tabular-nums shrink-0">
                {formatTimestamp(run.createdAt)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export function SkillLifecycle({ onRunSkill }: { onRunSkill?: (skill: SkillName) => void }) {
  const { skillRuns, activeSkill, setActiveSkill } = useMemoryStore();

  const getLastRun = (skill: SkillName) =>
    skillRuns.find(r => r.skill === skill);

  const recentRuns = skillRuns.slice(0, 10);
  const completedCount = skillRuns.filter(r => r.status === 'completed').length;
  const failedCount = skillRuns.filter(r => r.status === 'failed').length;

  return (
    <GlassPanel variant="strong" className="h-full flex flex-col" padding="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-tight">Skill Lifecycle</h3>
        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <span className="flex items-center gap-1 text-mono-xs text-matrix">
              <CheckCircle2 className="w-3 h-3" />
              {completedCount}
            </span>
          )}
          {failedCount > 0 && (
            <span className="flex items-center gap-1 text-mono-xs text-destructive">
              <XCircle className="w-3 h-3" />
              {failedCount}
            </span>
          )}
        </div>
      </div>

      {/* Visual Pipeline */}
      <div className="flex items-center justify-between px-1">
        {SKILL_ORDER.map((skill, i) => (
          <PipelineNode
            key={skill}
            skill={skill}
            index={i}
            isActive={activeSkill === skill}
            lastRun={getLastRun(skill)}
            onClick={() => setActiveSkill(activeSkill === skill ? null : skill)}
          />
        ))}
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {activeSkill && (
          <SkillDetailPanel skill={activeSkill} onRunSkill={onRunSkill ?? (() => {})} />
        )}
      </AnimatePresence>

      {/* Recent Runs */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <RecentRunsList runs={recentRuns} />
      </div>
    </GlassPanel>
  );
}
