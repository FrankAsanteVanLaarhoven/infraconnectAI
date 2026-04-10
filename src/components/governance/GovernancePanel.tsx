'use client';

import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Shield, Clock, AlertTriangle, RefreshCw, CheckCircle2, XCircle, ToggleLeft, ToggleRight, ArrowUpCircle, ArrowRight
} from 'lucide-react';
import type { GovernancePolicy } from '@/lib/memory/types';

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

export function GovernancePanel() {
  const { policies, setPolicies, feedbacks: feedbackList, nodes } = useMemoryStore();
  const activePolicies = policies.length > 0 ? policies : DEFAULT_POLICIES;

  const togglePolicy = (id: string) => {
    setPolicies(activePolicies.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const approvedCount = nodes.filter(n => n.status === 'canon').length;
  const pendingCount = nodes.filter(n => n.status === 'wiki').length;
  const scratchCount = nodes.filter(n => n.status === 'scratch').length;

  return (
    <GlassPanel variant="strong" className="h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
          <Shield className="w-4 h-4 text-governance" />
          Governance
        </h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-subtle rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-matrix tabular-nums">{approvedCount}</div>
          <div className="text-[10px] text-premium text-muted-foreground tracking-wider">CANON</div>
        </div>
        <div className="glass-subtle rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-yellow-500 tabular-nums">{pendingCount}</div>
          <div className="text-[10px] text-premium text-muted-foreground tracking-wider">WIKI</div>
        </div>
        <div className="glass-subtle rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-muted-foreground tabular-nums">{scratchCount}</div>
          <div className="text-[10px] text-premium text-muted-foreground tracking-wider">SCRATCH</div>
        </div>
      </div>

      {/* Policies */}
      <div className="space-y-2">
        <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
          Active Policies
        </h4>
        <div className="space-y-1.5">
          {activePolicies.map((policy, i) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                policy.active ? 'glass-subtle hover:glass-hover' : 'opacity-40'
              )}
            >
              <button onClick={() => togglePolicy(policy.id)} className="shrink-0">
                {policy.active ? (
                  <ToggleRight className="w-5 h-5 text-matrix" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{policy.name}</div>
                <div className="text-mono-xs text-muted-foreground/60">{policy.type}</div>
              </div>
              <div className="text-mono-xs text-muted-foreground/40">
                {policy.config && Object.entries(policy.config).map(([k, v]) => (
                  <div key={k}>{typeof v === 'number' ? `${v}` : ''}</div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Promotion Pipeline */}
      <div className="space-y-2">
        <h4 className="text-[10px] text-premium text-muted-foreground tracking-widest uppercase">
          Promotion Pipeline
        </h4>
        <div className="flex items-center gap-1">
          {['scratch', 'wiki', 'canon'].map((stage, i) => (
            <div key={stage} className="flex items-center gap-1 flex-1">
              <div className={cn(
                'flex-1 h-8 rounded-md flex items-center justify-center text-mono-xs font-medium',
                stage === 'scratch' && 'bg-l0/10 text-l0',
                stage === 'wiki' && 'bg-l1/10 text-l1',
                stage === 'canon' && 'bg-l2/10 text-l2'
              )}>
                {stage.toUpperCase()}
              </div>
              {i < 2 && (
                <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/50">
          scratch → wiki → canon (each transition requires review + validation)
        </p>
      </div>
    </GlassPanel>
  );
}
