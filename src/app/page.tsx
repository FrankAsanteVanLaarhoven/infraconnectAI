'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MatrixRain } from '@/components/matrix/MatrixRain';
import { IntentBar } from '@/components/chrome/IntentBar';
import { StatusBar } from '@/components/chrome/StatusBar';
import { ThemeToggle } from '@/components/chrome/ThemeToggle';
import { OverviewPanel } from '@/components/dashboard/OverviewPanel';
import { HealthPanel } from '@/components/dashboard/HealthPanel';
import { ActivityPanel } from '@/components/dashboard/ActivityPanel';
import { SkillLifecycle } from '@/components/skills/SkillLifecycle';
import { MemoryExplorer } from '@/components/explorer/MemoryExplorer';
import { GovernancePanel } from '@/components/governance/GovernancePanel';
import { SearchPanel } from '@/components/search/SearchPanel';
import { useMemoryStore } from '@/store/memory-store';
import { cn } from '@/lib/utils';
import type { IntentResult, SkillName } from '@/lib/memory/types';
import { toast } from 'sonner';
import { X, LayoutGrid, Activity, Heart, Terminal, FolderTree, Shield, Search, Clock } from 'lucide-react';

const PANEL_CONFIG: Record<string, {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  span: string;
  component: React.ComponentType<{ [key: string]: unknown }>;
}> = {
  overview: { title: 'Overview', icon: LayoutGrid, span: 'col-span-full lg:col-span-2', component: OverviewPanel },
  health: { title: 'Health', icon: Heart, span: 'col-span-1', component: HealthPanel },
  skills: { title: 'Skills', icon: Terminal, span: 'col-span-1', component: SkillLifecycle },
  explorer: { title: 'Explorer', icon: FolderTree, span: 'col-span-1', component: MemoryExplorer },
  governance: { title: 'Governance', icon: Shield, span: 'col-span-1', component: GovernancePanel },
  search: { title: 'Search', icon: Search, span: 'col-span-1', component: SearchPanel },
  activity: { title: 'Activity', icon: Clock, span: 'col-span-full', component: ActivityPanel },
};

const PANEL_NAV_ITEMS = ['overview', 'health', 'skills', 'explorer', 'governance', 'search', 'activity'];

export default function HomePage() {
  const store = useMemoryStore();
  const { setNodes, setHealth, setSkillRuns, setActivityLog, setPolicies, openPanel, closePanel, addActivity, addSkillRun, promoteNode } = store;
  const [isProcessing, setIsProcessing] = useState(false);
  const isInitialized = useRef(false);

  // Initialize data
  const initializeData = useCallback(async () => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      const [memRes, healthRes, skillsRes, activityRes] = await Promise.all([
        fetch('/api/memory').then(r => r.json()),
        fetch('/api/health').then(r => r.json()),
        fetch('/api/skills').then(r => r.json()),
        fetch('/api/activity').then(r => r.json()),
      ]);

      setNodes(memRes.nodes ?? []);
      setHealth(healthRes);
      setSkillRuns(skillsRes.runs ?? []);
      setActivityLog(activityRes.logs ?? []);
    } catch (err) {
      console.error('Failed to initialize:', err);
      // Load seed data as fallback
      loadSeedData();
    }
  }, [setNodes, setHealth, setSkillRuns, setActivityLog]);

  const loadSeedData = useCallback(() => {
    const now = new Date().toISOString();
    const seedNodes = [
      { id: 'n1', title: 'VLA Safety Requirements v2.1', content: 'Core safety requirements for Vision-Language-Action models in autonomous driving scenarios. Covers collision avoidance, pedestrian detection, and emergency stop protocols.', level: 'L2' as const, plane: 'governance' as const, category: 'standards' as const, status: 'canon' as const, parentId: null, tags: '["safety", "vla", "autonomous"]', healthScore: 0.95, conflictCount: 0, referenceCount: 12, lastValidated: now, expiresAt: null, createdAt: now, updatedAt: now },
      { id: 'n2', title: 'Perception Pipeline Architecture', content: 'Multi-modal perception pipeline combining camera, LiDAR, and radar inputs. Uses transformer-based fusion at the feature level for robust 3D scene understanding.', level: 'L1' as const, plane: 'memory' as const, category: 'concepts' as const, status: 'wiki' as const, parentId: null, tags: '["perception", "fusion", "3d"]', healthScore: 0.88, conflictCount: 0, referenceCount: 8, lastValidated: now, expiresAt: null, createdAt: now, updatedAt: now },
      { id: 'n3', title: 'Urban Navigation Decision Log', content: 'Key decisions from urban navigation testing: 1) Use behavior prediction for dynamic obstacles. 2) Implement comfort-aware path planning. 3) Priority-based intersection negotiation.', level: 'L1' as const, plane: 'memory' as const, category: 'decisions' as const, status: 'wiki' as const, parentId: null, tags: '["navigation", "urban", "decisions"]', healthScore: 0.82, conflictCount: 1, referenceCount: 5, lastValidated: now, expiresAt: null, createdAt: now, updatedAt: now },
      { id: 'n4', title: 'Sim-to-Real Transfer Playbook', content: 'Canonical playbook for sim-to-real transfer: domain randomization strategy, reality gap metrics, progressive fine-tuning schedule, and A/B validation protocol.', level: 'L2' as const, plane: 'governance' as const, category: 'playbooks' as const, status: 'canon' as const, parentId: null, tags: '["sim2real", "transfer", "playbook"]', healthScore: 0.91, conflictCount: 0, referenceCount: 7, lastValidated: now, expiresAt: null, createdAt: now, updatedAt: now },
      { id: 'n5', title: 'Sensor Fusion Best Practices', content: 'Established patterns for fusing heterogeneous sensor data: late fusion for modular systems, early fusion for end-to-end training, attention-based fusion for adaptive weighting.', level: 'L2' as const, plane: 'memory' as const, category: 'patterns' as const, status: 'canon' as const, parentId: null, tags: '["fusion", "sensors", "patterns"]', healthScore: 0.93, conflictCount: 0, referenceCount: 15, lastValidated: now, expiresAt: null, createdAt: now, updatedAt: now },
      { id: 'n6', title: 'Build Log #2847 - Perception Module', content: 'Raw build output from perception module compilation. Duration: 4m32s. Warnings: 3 deprecation notices in lidar_preprocessor. Errors: 0.', level: 'L0' as const, plane: 'execution' as const, category: 'telemetry' as const, status: 'scratch' as const, parentId: null, tags: '["build", "perception", "telemetry"]', healthScore: 1.0, conflictCount: 0, referenceCount: 0, lastValidated: null, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), createdAt: now, updatedAt: now },
      { id: 'n7', title: 'VLA Project Alpha - Spec Draft', content: 'Initial specification for VLA Project Alpha: autonomous warehouse navigation with pick-and-place capability. Target: 99.7% safety, sub-50ms latency.', level: 'L1' as const, plane: 'execution' as const, category: 'projects' as const, status: 'wiki' as const, parentId: null, tags: '["project", "alpha", "warehouse"]', healthScore: 0.75, conflictCount: 2, referenceCount: 3, lastValidated: now, expiresAt: null, createdAt: now, updatedAt: now },
      { id: 'n8', title: 'Manipulation Arm Entity Profile', content: 'Technical specifications for the UR5e manipulation arm: 6-DOF, 850mm reach, 5kg payload, 0.1mm repeatability. Integrated force-torque sensor at wrist.', level: 'L1' as const, plane: 'memory' as const, category: 'entities' as const, status: 'wiki' as const, parentId: null, tags: '["robot", "arm", "manipulation"]', healthScore: 0.87, conflictCount: 0, referenceCount: 4, lastValidated: now, expiresAt: null, createdAt: now, updatedAt: now },
      { id: 'n9', title: 'Test Results Batch #142', content: 'Raw test telemetry from batch #142: 1,247 scenarios tested, 1,189 passed (95.3%), 42 failed (3.4%), 16 flaky (1.3%). Failure analysis pending.', level: 'L0' as const, plane: 'execution' as const, category: 'telemetry' as const, status: 'scratch' as const, parentId: null, tags: '["test", "telemetry", "batch"]', healthScore: 1.0, conflictCount: 0, referenceCount: 0, lastValidated: null, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), createdAt: now, updatedAt: now },
      { id: 'n10', title: 'Release Criteria for VLA v3.0', content: 'Mandatory release criteria for VLA v3.0: zero critical safety findings, 99.5% regression pass rate, sim-to-real gap < 5%, validated on 3 physical platforms.', level: 'L2' as const, plane: 'governance' as const, category: 'standards' as const, status: 'canon' as const, parentId: null, tags: '["release", "v3.0", "criteria"]', healthScore: 0.97, conflictCount: 0, referenceCount: 9, lastValidated: now, expiresAt: null, createdAt: now, updatedAt: now },
    ];

    const seedRuns = [
      { id: 'sr1', skill: 'spec' as SkillName, status: 'completed' as const, input: 'VLA Project Alpha', output: 'Specification generated', memoryRead: '[]', memoryWritten: '["n7"]', duration: 3200, error: '', createdAt: now },
      { id: 'sr2', skill: 'test' as SkillName, status: 'completed' as const, input: 'Batch #142', output: '95.3% pass rate', memoryRead: '["n7"]', memoryWritten: '["n9"]', duration: 45000, error: '', createdAt: now },
      { id: 'sr3', skill: 'review' as SkillName, status: 'running' as const, input: 'Safety standards review', output: '', memoryRead: '["n1", "n4"]', memoryWritten: '[]', duration: 0, error: '', createdAt: now },
    ];

    const seedActivity = [
      { id: 'a1', action: 'create', target: 'n1', detail: 'Created VLA Safety Requirements v2.1', metadata: {}, createdAt: now },
      { id: 'a2', action: 'skill', target: 'sr1', detail: 'Ran /spec for VLA Project Alpha', metadata: {}, createdAt: now },
      { id: 'a3', action: 'skill', target: 'sr2', detail: 'Ran /test — Batch #142 (95.3% pass)', metadata: {}, createdAt: now },
      { id: 'a4', action: 'promote', target: 'n5', detail: 'Promoted Sensor Fusion to L2 canon', metadata: { toLevel: 'L2', toStatus: 'canon' }, createdAt: now },
      { id: 'a5', action: 'skill', target: 'sr3', detail: 'Running /review on safety standards', metadata: {}, createdAt: now },
    ];

    const seedHealth = {
      overall: 0.89,
      conflictDensity: 0.12,
      coverage: 0.78,
      staleness: 0.15,
      redundancy: 0.08,
      nodeCount: 10,
      byLevel: {
        L0: { count: 2, avgHealth: 1.0 },
        L1: { count: 4, avgHealth: 0.83 },
        L2: { count: 4, avgHealth: 0.94 },
      },
      byPlane: {
        execution: { count: 4, avgHealth: 0.85 },
        memory: { count: 4, avgHealth: 0.90 },
        governance: { count: 2, avgHealth: 0.94 },
      },
    };

    setNodes(seedNodes);
    setHealth(seedHealth);
    setSkillRuns(seedRuns);
    setActivityLog(seedActivity);
  }, [setNodes, setHealth, setSkillRuns, setActivityLog]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Handle intents
  const handleIntent = useCallback(async (result: IntentResult) => {
    switch (result.action) {
      case 'open_panel':
        if (result.panel) {
          openPanel(result.panel);
          toast.success(result.display);
        }
        break;

      case 'run_skill':
        if (result.skill) {
          setIsProcessing(true);
          openPanel('skills');
          const runId = crypto.randomUUID();
          addSkillRun({
            id: runId,
            skill: result.skill,
            status: 'running',
            input: result.params?.project ?? '',
            output: '',
            memoryRead: [],
            memoryWritten: [],
            duration: 0,
            error: '',
            createdAt: new Date().toISOString(),
          });
          addActivity({
            id: crypto.randomUUID(),
            action: 'skill',
            target: runId,
            detail: `Running /${result.skill}${result.params?.project ? ` → ${result.params.project}` : ''}`,
            metadata: {},
            createdAt: new Date().toISOString(),
          });

          try {
            const res = await fetch('/api/skills', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ skill: result.skill, input: result.params?.project ?? '' }),
            });
            const data = await res.json();

            store.updateSkillRun(runId, {
              status: data.success ? 'completed' : 'failed',
              output: data.output ?? '',
              duration: data.duration ?? 0,
              error: data.error ?? '',
            });
            toast.success(`/${result.skill} completed`);
          } catch {
            store.updateSkillRun(runId, { status: 'failed', error: 'Network error' });
            toast.error(`/${result.skill} failed`);
          } finally {
            setIsProcessing(false);
          }
        }
        break;

      case 'search':
        if (result.query) {
          openPanel('search');
          store.setSearchQuery(result.query);
          toast(result.display);
        }
        break;

      case 'promote':
        toast.info('Promotion requires review gate');
        break;

      default:
        toast(result.display);
    }
  }, [openPanel, addSkillRun, addActivity, store, setIsProcessing]);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background layers */}
      <MatrixRain />
      <div className="fixed inset-0 grid-overlay z-0 pointer-events-none" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-background/80 via-background/60 to-background/90" />

      {/* Intent bar */}
      <IntentBar onIntent={handleIntent} isProcessing={isProcessing} />

      {/* Panel navigation */}
      <nav className="fixed top-[72px] right-4 z-40" aria-label="Panel navigation">
        <div className="glass-strong rounded-xl p-1.5 flex flex-col gap-1">
          {PANEL_NAV_ITEMS.map((panelId) => {
            const cfg = PANEL_CONFIG[panelId];
            const isActive = store.activePanels.includes(panelId);
            const Icon = cfg.icon;
            return (
              <button
                key={panelId}
                onClick={() => store.togglePanel(panelId)}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                  isActive
                    ? 'bg-matrix/15 text-matrix shadow-[0_0_10px_var(--matrix-glow)]'
                    : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-glass-hover'
                )}
                title={cfg.title}
                aria-label={`Toggle ${cfg.title} panel`}
                aria-pressed={isActive}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
          <div className="my-1 border-t border-glass-border" />
          <div className="px-0.5">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <main className="relative z-10 flex-1 pt-[80px] pb-[40px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pr-16">
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {store.activePanels.map((panelId) => {
                const cfg = PANEL_CONFIG[panelId];
                if (!cfg) return null;
                const Component = cfg.component;
                return (
                  <motion.div
                    key={panelId}
                    layout
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={cn('min-h-0', cfg.span)}
                  >
                    <div className="relative group">
                      {/* Close button */}
                      <button
                        onClick={() => closePanel(panelId)}
                        className="absolute -top-2 -right-2 z-20 w-6 h-6 rounded-full glass-strong flex items-center justify-center text-muted-foreground/50 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <Component />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Empty state */}
          {store.activePanels.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="glass-strong rounded-2xl p-8 max-w-md space-y-4 glass-glow">
                <div className="w-16 h-16 rounded-2xl bg-matrix/10 flex items-center justify-center mx-auto">
                  <LayoutGrid className="w-8 h-8 text-matrix animate-breathe" />
                </div>
                <div>
                  <h2 className="display-md mb-2">Ephemeral Interface</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    State your intent above. The interface adapts to your needs —
                    panels appear and disappear based on context.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-mono-xs text-muted-foreground/50">
                  <span className="text-matrix">/spec</span>
                  <span>·</span>
                  <span className="text-matrix">/plan</span>
                  <span>·</span>
                  <span className="text-matrix">/build</span>
                  <span>·</span>
                  <span className="text-matrix">/test</span>
                  <span>·</span>
                  <span className="text-matrix">/review</span>
                  <span>·</span>
                  <span className="text-matrix">/ship</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Status bar */}
      <StatusBar />
    </div>
  );
}


