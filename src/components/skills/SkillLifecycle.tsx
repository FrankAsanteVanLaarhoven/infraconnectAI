'use client';

import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SKILL_CONTRACTS, SKILL_LABELS } from '@/lib/memory/types';
import type { SkillName, SkillStatus } from '@/lib/memory/types';
import {
  FileText, ClipboardList, Hammer, TestTube, Eye, Rocket,
  ArrowRight, BookOpen, Pencil, Lock, Clock, CheckCircle2, XCircle, Loader2
} from 'lucide-react';

const SKILL_ICONS: Record<SkillName, React.ComponentType<{ className?: string }>> = {
  spec: FileText,
  plan: ClipboardList,
  build: Hammer,
  test: TestTube,
  review: Eye,
  ship: Rocket,
};

const SKILL_ORDER: SkillName[] = ['spec', 'plan', 'build', 'test', 'review', 'ship'];

const STATUS_ICONS: Record<SkillStatus, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
};

function SkillStep({ skill, isActive, onClick, lastRun }: {
  skill: SkillName;
  isActive: boolean;
  onClick: () => void;
  lastRun?: { status: SkillStatus; createdAt: string };
}) {
  const Icon = SKILL_ICONS[skill];
  const contract = SKILL_CONTRACTS[skill];
  const isExpanded = isActive;

  return (
    <motion.div layout className="flex flex-col">
      {/* Step button */}
      <button
        onClick={onClick}
        className={cn(
          'relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left',
          isExpanded
            ? 'glass-glow bg-matrix/10 text-matrix'
            : 'hover:bg-glass-hover text-muted-foreground hover:text-foreground'
        )}
      >
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300',
          isExpanded
            ? 'bg-matrix/20 shadow-[0_0_12px_var(--matrix-glow)]'
            : 'bg-glass-border/50'
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <code className="text-mono-sm font-semibold">/{skill}</code>
            <span className="text-xs text-muted-foreground hidden sm:inline">{SKILL_LABELS[skill]}</span>
          </div>
        </div>
        {lastRun && (
          <div className={cn(
            'w-2 h-2 rounded-full',
            lastRun.status === 'completed' ? 'bg-matrix' : lastRun.status === 'failed' ? 'bg-destructive' : 'bg-yellow-500 animate-pulse'
          )} title={lastRun.status} />
        )}
        <ArrowRight className={cn(
          'w-3 h-3 transition-transform duration-300',
          isExpanded ? 'rotate-90' : 'opacity-0'
        )} />
      </button>

      {/* Expanded contract */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-11 mt-2 mb-3 space-y-3 pr-2">
              <p className="text-xs text-muted-foreground leading-relaxed">{contract.description}</p>

              {/* Reads */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
                  <BookOpen className="w-3 h-3" /> Reads
                </div>
                {contract.reads.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 pl-1">
                    <span className="w-1 h-1 rounded-full bg-matrix/60" />
                    <code className="text-mono-xs text-foreground/80">{r}</code>
                  </div>
                ))}
              </div>

              {/* Writes */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
                  <Pencil className="w-3 h-3" /> Writes
                </div>
                {contract.writes.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 pl-1">
                    <span className="w-1 h-1 rounded-full bg-yellow-500/60" />
                    <code className="text-mono-xs text-foreground/80">{w}</code>
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
                  <Lock className="w-3 h-3" /> Constraints
                </div>
                {contract.constraints.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 pl-1">
                    <span className="w-1 h-1 rounded-full bg-destructive/60" />
                    <code className="text-mono-xs text-foreground/80">{c}</code>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connector arrow */}
      {skill !== 'ship' && (
        <div className="ml-6 flex items-center py-0.5">
          <div className="w-px h-3 bg-glass-border" />
        </div>
      )}
    </motion.div>
  );
}

export function SkillLifecycle({ onRunSkill }: { onRunSkill?: (skill: SkillName) => void }) {
  const { skillRuns, activeSkill, setActiveSkill } = useMemoryStore();

  const getLastRun = (skill: SkillName) =>
    skillRuns.find(r => r.skill === skill);

  const recentRuns = skillRuns.slice(0, 5);

  return (
    <GlassPanel variant="strong" className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-tight">Skill Lifecycle</h3>
        <span className="text-mono-xs text-muted-foreground">
          {skillRuns.filter(r => r.status === 'completed').length} completed
        </span>
      </div>

      {/* Skill pipeline */}
      <div className="flex-1 overflow-y-auto max-h-[420px] pr-1 space-y-0">
        {SKILL_ORDER.map((skill, i) => (
          <motion.div
            key={skill}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <SkillStep
              skill={skill}
              isActive={activeSkill === skill}
              onClick={() => setActiveSkill(activeSkill === skill ? null : skill)}
              lastRun={getLastRun(skill)}
            />
          </motion.div>
        ))}
      </div>

      {/* Recent runs */}
      {recentRuns.length > 0 && (
        <div className="mt-4 pt-3 border-t border-glass-border">
          <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase mb-2">
            Recent Runs
          </h4>
          <div className="space-y-1.5 max-h-24 overflow-y-auto">
            {recentRuns.map((run) => {
              const StatusIcon = STATUS_ICONS[run.status];
              return (
                <div key={run.id} className="flex items-center gap-2 text-xs">
                  <StatusIcon className={cn(
                    'w-3 h-3 shrink-0',
                    run.status === 'completed' && 'text-matrix',
                    run.status === 'failed' && 'text-destructive',
                    run.status === 'running' && 'text-yellow-500 animate-spin',
                    run.status === 'pending' && 'text-muted-foreground'
                  )} />
                  <code className="text-mono-xs text-foreground/80">/{run.skill}</code>
                  <span className="text-muted-foreground/50 flex-1" />
                  <span className="text-mono-xs text-muted-foreground/60 tabular-nums">
                    {run.duration > 0 ? `${(run.duration / 1000).toFixed(1)}s` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
