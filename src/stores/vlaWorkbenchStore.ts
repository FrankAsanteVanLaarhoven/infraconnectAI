import { create } from 'zustand';
import { Layout } from 'react-grid-layout';

/**
 * VLA Workbench Store
 * Zustand state management for the VLA Workbench page.
 */

export interface PanelConfig {
  id: string; // unique instance ID
  type: 'overview' | 'episodes' | 'curation' | 'analytics' | 'engines' | 'ros2' | 'rviz';
  title: string;
}

export interface EpisodeData {
  id: string;
  runId: string;
  episodeIndex: number;
  physicsRealism: number;
  sensorFidelity: number;
  languageGrounding: number;
  actionSuccess: number;
  modelLoss: number;
  cleanlabConfidence: number;
  overallQualityScore: number;
  isPruned: boolean;
  pruneReason: string | null;
  replayUrl: string | null;
  memoryNodeId: string | null;
  createdAt: string;
}

export interface CurationEvent {
  id: string;
  runId: string;
  episodeIds: string;
  action: string;
  reason: string;
  confidence: number;
  agent: string;
  createdAt: string;
}

export interface IsaacRun {
  id: string;
  experimentId: string;
  status: string;
  sceneUsd: string;
  numEnvs: number;
  totalEpisodes: number;
  physicsScoreAvg: number;
  dataQualityScoreAvg: number;
  highLossCount: number;
  prunedCount: number;
  episodeCount: number;
  curationEventCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface VlaWorkbenchState {
  // Run state
  runs: IsaacRun[];
  currentRunId: string | null;
  currentRun: IsaacRun | null;
  
  // Episode state
  episodes: EpisodeData[];
  selectedEpisode: EpisodeData | null;
  episodeModalOpen: boolean;
  
  // Curation feed
  curationEvents: CurationEvent[];
  
  // Filters
  filters: {
    showPruned: boolean;
    minQuality: number;
    maxLoss: number;
  };
  
  // Dynamic Grid Layout
  activePanels: PanelConfig[];
  gridLayouts: any[];
  
  // Loading states
  isLoadingRuns: boolean;
  isLoadingEpisodes: boolean;

  // Actions
  addPanel: (type: PanelConfig['type'], title: string) => void;
  removePanel: (id: string) => void;
  updateGridLayouts: (layouts: any[]) => void;
  resetLayout: () => void;
  setRuns: (runs: IsaacRun[]) => void;
  setCurrentRun: (runId: string | null) => void;
  setEpisodes: (episodes: EpisodeData[]) => void;
  selectEpisode: (episode: EpisodeData | null) => void;
  setEpisodeModalOpen: (open: boolean) => void;
  addCurationEvent: (event: CurationEvent) => void;
  setCurationEvents: (events: CurationEvent[]) => void;
  setFilters: (filters: Partial<VlaWorkbenchState['filters']>) => void;
  setLoadingRuns: (loading: boolean) => void;
  setLoadingEpisodes: (loading: boolean) => void;
}

export const useVlaWorkbenchStore = create<VlaWorkbenchState>((set, get) => ({
  runs: [],
  currentRunId: null,
  currentRun: null,
  episodes: [],
  selectedEpisode: null,
  episodeModalOpen: false,
  curationEvents: [],
  filters: {
    showPruned: false,
    minQuality: 0,
    maxLoss: 5,
  },
  activePanels: [
    { id: 'overview-1', type: 'overview', title: 'Overview' },
    { id: 'episodes-1', type: 'episodes', title: 'Live Episodes' },
    { id: 'analytics-1', type: 'analytics', title: 'Analytics' }
  ],
  gridLayouts: [
    { i: 'overview-1', x: 0, y: 0, w: 12, h: 4 },
    { i: 'episodes-1', x: 0, y: 4, w: 8, h: 6 },
    { i: 'analytics-1', x: 8, y: 4, w: 4, h: 6 }
  ],
  isLoadingRuns: false,
  isLoadingEpisodes: false,

  addPanel: (type, title) => set((state) => {
    const id = `${type}-${Date.now()}`;
    const newPanel: PanelConfig = { id, type, title };
    // Find empty space or just append at the bottom
    const newLayout: any = { i: id, x: 0, y: Infinity, w: 6, h: 4 };
    return {
      activePanels: [...state.activePanels, newPanel],
      gridLayouts: [...state.gridLayouts, newLayout]
    };
  }),

  removePanel: (id) => set((state) => ({
    activePanels: state.activePanels.filter(p => p.id !== id),
    gridLayouts: state.gridLayouts.filter(l => l.i !== id)
  })),

  updateGridLayouts: (layouts) => set({ gridLayouts: layouts }),

  resetLayout: () => set({
    activePanels: [
      { id: 'overview-1', type: 'overview', title: 'Overview' },
      { id: 'episodes-1', type: 'episodes', title: 'Live Episodes' },
      { id: 'analytics-1', type: 'analytics', title: 'Analytics' }
    ],
    gridLayouts: [
      { i: 'overview-1', x: 0, y: 0, w: 12, h: 4 },
      { i: 'episodes-1', x: 0, y: 4, w: 8, h: 6 },
      { i: 'analytics-1', x: 8, y: 4, w: 4, h: 6 }
    ]
  }),

  setRuns: (runs) => set({ runs }),

  setCurrentRun: (runId) => {
    const run = runId ? get().runs.find(r => r.id === runId) || null : null;
    set({ currentRunId: runId, currentRun: run });
  },

  setEpisodes: (episodes) => set({ episodes }),

  selectEpisode: (episode) => set({ 
    selectedEpisode: episode, 
    episodeModalOpen: !!episode 
  }),

  setEpisodeModalOpen: (open) => set({ 
    episodeModalOpen: open,
    selectedEpisode: open ? get().selectedEpisode : null,
  }),

  addCurationEvent: (event) => set(state => ({
    curationEvents: [event, ...state.curationEvents].slice(0, 100),
  })),

  setCurationEvents: (events) => set({ curationEvents: events }),

  setFilters: (filters) => set(state => ({
    filters: { ...state.filters, ...filters },
  })),

  setLoadingRuns: (loading) => set({ isLoadingRuns: loading }),
  setLoadingEpisodes: (loading) => set({ isLoadingEpisodes: loading }),
}));
