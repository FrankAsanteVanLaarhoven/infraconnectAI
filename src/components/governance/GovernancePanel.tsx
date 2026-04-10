'use client';

import React, { useCallback, useState } from 'react';
import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, RefreshCw,
  ToggleLeft, ToggleRight, ArrowRight, ArrowUpRight, Play,
  FileWarning, Timer, TrendingUp, Ban, Lock, Heart
} from 'lucide-react';
import type { GovernancePolicy } from '@/lib/memory/types';
import { toast } from 'sonner';

const POLICY_DESCRIPTIONS: Record<string, string> = {
  'Scratch Auto-Prune': 'Automatically removes raw/scratch nodes after their TTL expires to keep memory lean.',
  'Tactical Lesson Decay': 'Gradually downgrades wiki decisions that haven\'t been referenced or validated.',
  'Canon Re-Validation': 'Periodically re-checks canonical knowledge against current standards and data.',
  'Conflict Detection': 'Scans for semantic contradictions between nodes and flags overlapping claims.',
  'Redundancy Check': 'Identifies near-duplicate nodes using similarity scoring and suggests merges.',
};

const POLICY_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  decay: Timer,
  promotion: TrendingUp,
  conflict: AlertTriangle,
  redundancy: FileWarning,
};

const DEFAULT_POLICIES: GovernancePolicy[] = [
  {
    id: 'p1', name: 'Scratch Auto-Prune', type: 'decay', active: true,
    config: { ttl_days: 7, level: 'scratch' },
  },
  {
    id: 'p2', name: 'Tactical Lesson Decay', type: 'decay', active: true,
    config: { ttl_days: 30, level: 'wiki', category: 'decisions' },
  },
  {
    id: 'p3', name: 'Canon Re-Validation', type: 'promotion', active: true,
    config: { interval_days: 90, requires_review: true },
  },
  {
    id: 'p4', name: 'Conflict Detection', type: 'conflict', active: true,
    config: { threshold: 0.3, auto_flag: true },
  },
  {
    id: 'p5', name: 'Redundancy Check', type: 'redundancy', active: false,
    config: { similarity_threshold: 0.85, auto_merge: false },
  },
];

/* ─── Promotion Pipeline Visualization ─── */

function PromotionPipeline({ counts }: { counts: { scratch: number; wiki: number; canon: number } }) {
  const stages = [
    { key: 'scratch', label: 'SCRATCH', count: counts.scratch, colorClass: 'bg-l0/10 text-l0 border-l0/20', dotClass: 'level-dot-l0' },
    { key: 'wiki', label: 'WIKI', count: counts.wiki, colorClass: 'bg-l1/10 text-l1 border-l1/20', dotClass: 'level-dot-l1' },
    { key: 'canon', label: 'CANON', count: counts.canon, colorClass: 'bg-l2/10 text-l2 border-l2/20', dotClass: 'level-dot-l2' },
  ];

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
        Promotion Pipeline
      </h4>
      <div className="flex items-stretch gap-0">
        {stages.map((stage, i) => (
          <div key={stage.key} className="flex items-center gap-0 flex-1">
            <div className={cn(
              'flex-1 rounded-lg border p-3 text-center transition-all duration-300',
              stage.colorClass
            )}>
              <div className={cn(
                'text-lg font-semibold tabular-nums',
                stage.key === 'scratch' && 'text-l0',
                stage.key === 'wiki' && 'text-l1',
                stage.key === 'canon' && 'text-l2',
              )}>
                {stage.count}
              </div>
              <div className="text-[10px] text-premium text-muted-foreground tracking-wider mt-0.5">
                {stage.label}
              </div>
            </div>
            {i < 2 && (
              <div className="flex flex-col items-center justify-center px-1 shrink-0">
                <div className="relative w-8 h-6 flex items-center">
                  {/* Animated arrow line */}
                  <div className="w-full h-px relative overflow-hidden">
                    <div className="absolute inset-0 border-t border-dashed border-glass-border" />
                    <motion.div
                      className="absolute inset-y-0 w-4 bg-gradient-to-r from-transparent via-matrix/30 to-transparent"
                      animate={{ x: ['-16px', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
                    />
                  </div>
                  {/* Arrow head */}
                  <ArrowRight className="absolute right-0 w-3 h-3 text-muted-foreground/50" />
                </div>
                <span className="text-mono-xs text-muted-foreground/40 mt-0.5">REVIEW</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Nodes Pending Promotion ─── */

function PendingPromotions() {
  const { nodes, promoteNode, addActivity, setHealth } = useMemoryStore();

  const promotableNodes = nodes.filter(
    n => n.status === 'wiki' && n.level === 'L1' && n.healthScore >= 0.7
  ).sort((a, b) => b.healthScore - a.healthScore);

  const handlePromote = useCallback(async (nodeId: string, title: string) => {
    try {
      await fetch('/api/memory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nodeId, level: 'L2', status: 'canon', lastValidated: new Date().toISOString() }),
      });
      promoteNode(nodeId, 'L2', 'canon');
      toast.success(`Promoted "${title}" to Canon`);
      // Refresh health
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setHealth(data);
      } catch { /* ignore */ }
    } catch {
      toast.error(`Failed to promote "${title}"`);
    }
  }, [promoteNode, addActivity, setHealth]);

  const handleReject = useCallback(async (nodeId: string, title: string) => {
    try {
      await fetch('/api/memory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nodeId, level: 'L0', status: 'scratch' }),
      });
      promoteNode(nodeId, 'L0', 'scratch');
      toast.info(`Rejected "${title}" — moved to Scratch`);
    } catch {
      toast.error(`Failed to reject "${title}"`);
    }
  }, [promoteNode]);

  if (promotableNodes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase flex items-center gap-1.5">
        <TrendingUp className="w-3 h-3" /> Pending Promotion
      </h4>
      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
        <AnimatePresence>
          {promotableNodes.slice(0, 5).map((node) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg glass-subtle"
            >
              <div className="w-1.5 h-1.5 rounded-full level-dot-l1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{node.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-mono-xs text-muted-foreground">{node.level}</span>
                  {/* Health bar */}
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-1 rounded-full bg-glass-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round(node.healthScore * 100)}%`,
                          backgroundColor: node.healthScore >= 0.8
                            ? 'var(--matrix)'
                            : node.healthScore >= 0.6
                              ? 'oklch(0.75 0.18 85)'
                              : 'var(--destructive)',
                        }}
                      />
                    </div>
                    <span className="text-mono-xs text-muted-foreground/50 tabular-nums">
                      {(node.healthScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handlePromote(node.id, node.title)}
                  className="p-1 rounded-md text-muted-foreground hover:text-matrix hover:bg-matrix/10 transition-colors duration-200"
                  title="Promote to Canon"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleReject(node.id, node.title)}
                  className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                  title="Reject to Scratch"
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Decay Policy Timeline ─── */

function DecayTimeline() {
  const { nodes } = useMemoryStore();
  const now = Date.now();

  // Scratch TTL: 7 days — expiring within 3 days
  const scratchNodes = nodes.filter(n => n.status === 'scratch' || n.level === 'L0');
  const scratchExpiring = scratchNodes.filter(n => {
    if (!n.expiresAt) return false;
    const exp = new Date(n.expiresAt).getTime();
    return exp > now && (exp - now) < 3 * 86400000;
  });
  const scratchWarning = scratchExpiring.length;

  // Tactical TTL: 30 days
  const tacticalNodes = nodes.filter(n => n.level === 'L1' && n.status === 'wiki');
  const tacticalStale = tacticalNodes.filter(n => {
    const last = n.lastValidated
      ? new Date(n.lastValidated).getTime()
      : new Date(n.createdAt).getTime();
    return (now - last) > 25 * 86400000; // approaching 30 days
  });
  const tacticalWarning = tacticalStale.length;

  // Canon re-validation: 90 days
  const canonNodes = nodes.filter(n => n.level === 'L2' && n.status === 'canon');
  const canonNeedReval = canonNodes.filter(n => {
    if (!n.lastValidated) return true;
    const last = new Date(n.lastValidated).getTime();
    return (now - last) > 80 * 86400000; // approaching 90 days
  });
  const canonWarning = canonNeedReval.length;

  const timelines = [
    { label: 'Scratch TTL', value: '7d', count: scratchWarning, total: scratchNodes.length, color: 'text-l0', dotClass: 'level-dot-l0', isWarning: scratchWarning > 0 },
    { label: 'Tactical TTL', value: '30d', count: tacticalWarning, total: tacticalNodes.length, color: 'text-l1', dotClass: 'level-dot-l1', isWarning: tacticalWarning > 0 },
    { label: 'Canon re-val', value: '90d', count: canonWarning, total: canonNodes.length, color: 'text-l2', dotClass: 'level-dot-l2', isWarning: canonWarning > 0 },
  ];

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase flex items-center gap-1.5">
        <Timer className="w-3 h-3" /> Decay Timeline
      </h4>
      <div className="space-y-1.5">
        {timelines.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors duration-200',
              t.isWarning ? 'glass-subtle' : 'bg-transparent'
            )}
          >
            <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', t.dotClass)} />
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <code className="text-mono-xs text-muted-foreground shrink-0">{t.label}</code>
              <code className="text-mono-xs text-muted-foreground/50 shrink-0">{t.value}</code>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {t.isWarning && (
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
              )}
              <span className={cn(
                'text-mono-xs font-medium tabular-nums',
                t.isWarning ? 'text-yellow-500' : 'text-muted-foreground/50'
              )}>
                {t.count}/{t.total}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Conflict Detection ─── */

function ConflictDetection() {
  const { nodes, selectNode } = useMemoryStore();

  const conflictNodes = nodes.filter(n => n.conflictCount > 0).sort((a, b) => b.conflictCount - a.conflictCount);

  if (conflictNodes.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase flex items-center gap-1.5">
        <AlertTriangle className="w-3 h-3 text-destructive" /> Conflicts
      </h4>
      <div className="space-y-1">
        {conflictNodes.slice(0, 4).map((node) => (
          <motion.button
            key={node.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => selectNode(node.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-left w-full transition-colors duration-200 hover:bg-destructive/5 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-destructive shadow-[0_0_4px_var(--destructive)] shrink-0" />
            <span className="text-xs truncate flex-1 min-w-0">{node.title}</span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive text-mono-xs font-medium shrink-0">
              {node.conflictCount}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─── Policy Item ─── */

function PolicyItem({ policy, index, onToggle }: {
  policy: GovernancePolicy;
  index: number;
  onToggle: (id: string) => void;
}) {
  const TypeIcon = POLICY_TYPE_ICONS[policy.type] ?? Lock;
  const [isRunning, setIsRunning] = useState(false);

  const handleRunNow = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    // Simulate running a policy
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    toast.success(`${policy.name} executed`);
    setIsRunning(false);
  }, [isRunning, policy.name]);

  return (
    <motion.div
      key={policy.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
        policy.active ? 'glass-subtle hover:glass-hover' : 'opacity-40'
      )}
    >
      <button onClick={() => onToggle(policy.id)} className="shrink-0 mt-0.5" aria-label={`Toggle ${policy.name}`}>
        {policy.active ? (
          <ToggleRight className="w-5 h-5 text-matrix" />
        ) : (
          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <TypeIcon className="w-3 h-3 text-muted-foreground/60" />
          <span className="text-xs font-medium">{policy.name}</span>
        </div>
        <p className="text-mono-xs text-muted-foreground/50 mt-0.5 leading-relaxed line-clamp-2">
          {POLICY_DESCRIPTIONS[policy.name] ?? policy.type}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-mono-xs text-muted-foreground/40">{policy.type}</span>
        <button
          onClick={handleRunNow}
          disabled={isRunning || !policy.active}
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded text-mono-xs transition-all duration-200',
            policy.active && !isRunning
              ? 'text-muted-foreground hover:text-matrix hover:bg-matrix/10'
              : 'text-muted-foreground/30 cursor-not-allowed'
          )}
        >
          {isRunning ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Play className="w-3 h-3" />
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─── */

export function GovernancePanel() {
  const { policies, setPolicies, health, selectNode } = useMemoryStore();
  const activePolicies = policies.length > 0 ? policies : DEFAULT_POLICIES;

  const togglePolicy = (id: string) => {
    setPolicies(activePolicies.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const canonCount = useMemoryStore(s => s.nodes.filter(n => n.status === 'canon').length);
  const wikiCount = useMemoryStore(s => s.nodes.filter(n => n.status === 'wiki').length);
  const scratchCount = useMemoryStore(s => s.nodes.filter(n => n.status === 'scratch').length);

  const healthScore = health?.overall ?? 0;

  return (
    <GlassPanel variant="strong" className="h-full flex flex-col" padding="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
          <Shield className="w-4 h-4 text-governance" />
          Governance
        </h3>
        {health && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full glass-subtle">
            <Heart className={cn(
              'w-3 h-3',
              healthScore >= 0.8 ? 'text-matrix' : healthScore >= 0.6 ? 'text-yellow-500' : 'text-destructive'
            )} />
            <code className="text-mono-xs text-muted-foreground tabular-nums">
              {(healthScore * 100).toFixed(0)}%
            </code>
          </div>
        )}
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-5">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {/* filter explorer to canon */}}
            className="glass-subtle rounded-lg p-3 text-center transition-all duration-200 hover:glass-hover cursor-pointer"
          >
            <div className="text-lg font-semibold text-matrix tabular-nums">{canonCount}</div>
            <div className="text-[10px] text-premium text-muted-foreground tracking-wider">CANON</div>
          </button>
          <button
            onClick={() => {/* filter explorer to wiki */}}
            className="glass-subtle rounded-lg p-3 text-center transition-all duration-200 hover:glass-hover cursor-pointer"
          >
            <div className="text-lg font-semibold text-l1 tabular-nums">{wikiCount}</div>
            <div className="text-[10px] text-premium text-muted-foreground tracking-wider">WIKI</div>
          </button>
          <button
            onClick={() => {/* filter explorer to scratch */}}
            className="glass-subtle rounded-lg p-3 text-center transition-all duration-200 hover:glass-hover cursor-pointer"
          >
            <div className="text-lg font-semibold text-muted-foreground tabular-nums">{scratchCount}</div>
            <div className="text-[10px] text-premium text-muted-foreground tracking-wider">SCRATCH</div>
          </button>
        </div>

        {/* Promotion Pipeline */}
        <PromotionPipeline counts={{ scratch: scratchCount, wiki: wikiCount, canon: canonCount }} />

        {/* Pending Promotions */}
        <PendingPromotions />

        {/* Decay Timeline */}
        <DecayTimeline />

        {/* Policies */}
        <div className="space-y-2">
          <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Policies
          </h4>
          <div className="space-y-1.5">
            {activePolicies.map((policy, i) => (
              <PolicyItem
                key={policy.id}
                policy={policy}
                index={i}
                onToggle={togglePolicy}
              />
            ))}
          </div>
        </div>

        {/* Conflicts */}
        <ConflictDetection />
      </div>
    </GlassPanel>
  );
}
