import { create } from 'zustand';
import type {
  MemoryNode,
  SkillRun,
  HealthMetrics,
  MemoryLevel,
  MemoryStatus,
  SkillName,
  ActivityLog,
  GovernancePolicy,
} from '@/lib/memory/types';

interface MemoryStore {
  nodes: MemoryNode[];
  skillRuns: SkillRun[];

  policies: GovernancePolicy[];
  activityLog: ActivityLog[];
  activePanels: string[];
  selectedNodeId: string | null;
  selectedNode: MemoryNode | null;
  searchQuery: string;
  searchResults: MemoryNode[];
  isSearching: boolean;
  activeSkill: SkillName | null;
  isLoadingMemory: boolean;
  isLoadingHealth: boolean;
  
  dashboard: Record<string, any> | null;
  health: Record<string, any> | null;

  setNodes: (nodes: MemoryNode[]) => void;
  addNode: (node: MemoryNode) => void;
  updateNode: (id: string, data: Partial<MemoryNode>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  setSkillRuns: (runs: SkillRun[]) => void;
  addSkillRun: (run: SkillRun) => void;
  updateSkillRun: (id: string, data: Partial<SkillRun>) => void;
  setActiveSkill: (skill: SkillName | null) => void;

  setPolicies: (policies: GovernancePolicy[]) => void;
  addActivity: (log: ActivityLog) => void;
  setActivityLog: (logs: ActivityLog[]) => void;
  openPanel: (panel: string) => void;
  closePanel: (panel: string) => void;
  togglePanel: (panel: string) => void;
  setSearchQuery: (q: string) => void;
  setSearchResults: (results: MemoryNode[]) => void;
  setIsSearching: (v: boolean) => void;
  setLoadingMemory: (v: boolean) => void;
  setLoadingHealth: (v: boolean) => void;
  
  setDashboard: (dashboard: Record<string, any>) => void;
  setHealth: (health: Record<string, any>) => void;

  promoteNode: (id: string, toLevel: MemoryLevel, toStatus: MemoryStatus) => void;
  reset: () => void;
}

const initialState = {
  nodes: [] as MemoryNode[],
  skillRuns: [] as SkillRun[],
  policies: [] as GovernancePolicy[],
  activityLog: [] as ActivityLog[],
  activePanels: ['overview', 'skills'] as string[],
  selectedNodeId: null as string | null,
  selectedNode: null as MemoryNode | null,
  searchQuery: '',
  searchResults: [] as MemoryNode[],
  isSearching: false,
  activeSkill: null as SkillName | null,
  isLoadingMemory: false,
  isLoadingHealth: false,
  dashboard: null as Record<string, any> | null,
  health: null as Record<string, any> | null,
};

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  ...initialState,

  setNodes: (nodes) => set({ nodes }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  updateNode: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...data } : n)),
      selectedNode:
        s.selectedNode?.id === id ? { ...s.selectedNode, ...data } : s.selectedNode,
    })),
  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      selectedNode: s.selectedNode?.id === id ? null : s.selectedNode,
    })),

  selectNode: (id) => {
    const node = get().nodes.find((n) => n.id === id) ?? null;
    set({ selectedNodeId: id, selectedNode: node });
  },

  setSkillRuns: (skillRuns) => set({ skillRuns }),
  addSkillRun: (run) => set((s) => ({ skillRuns: [run, ...s.skillRuns] })),
  updateSkillRun: (id, data) =>
    set((s) => ({
      skillRuns: s.skillRuns.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),
  setActiveSkill: (skill) => set({ activeSkill: skill }),

  setDashboard: (dashboard) => set({ dashboard }),
  setHealth: (health) => set({ health }),
  setPolicies: (policies) => set({ policies }),
  addActivity: (log) =>
    set((s) => ({ activityLog: [log, ...s.activityLog].slice(0, 100) })),
  setActivityLog: (logs) => set({ activityLog: logs }),

  openPanel: (panel) =>
    set((s) => ({
      activePanels: s.activePanels.includes(panel)
        ? s.activePanels
        : [...s.activePanels, panel],
    })),
  closePanel: (panel) =>
    set((s) => ({
      activePanels: s.activePanels.filter((p) => p !== panel),
    })),
  togglePanel: (panel) =>
    set((s) => ({
      activePanels: s.activePanels.includes(panel)
        ? s.activePanels.filter((p) => p !== panel)
        : [...s.activePanels, panel],
    })),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (v) => set({ isSearching: v }),
  setLoadingMemory: (v) => set({ isLoadingMemory: v }),
  setLoadingHealth: (v) => set({ isLoadingHealth: v }),

  promoteNode: (id, toLevel, toStatus) => {
    get().updateNode(id, { level: toLevel, status: toStatus, lastValidated: new Date().toISOString() });
    get().addActivity({
      id: crypto.randomUUID(),
      action: 'promote',
      target: id,
      detail: `Promoted to ${toLevel} / ${toStatus}`,
      metadata: { toLevel, toStatus },
      createdAt: new Date().toISOString(),
    });
  },

  reset: () => set(initialState),
}));
