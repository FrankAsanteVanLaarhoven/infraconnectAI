import { create } from 'zustand';

interface Episode {
  id: string;
  episodeIndex: number;
  physicsRealism: number;
  overallQualityScore: number;
  cleanlabConfidence: number;
  isPruned: boolean;
  modelLoss: number;
  runId: string;
}

interface VlaWorkbenchState {
  currentRunId: string | null;
  selectedEpisode: Episode | null;
  isTraining: boolean;

  setCurrentRun: (runId: string) => void;
  setSelectedEpisode: (episode: Episode | null) => void;
  setIsTraining: (isTraining: boolean) => void;
  clearSelection: () => void;
}

export const useVlaWorkbenchStore = create<VlaWorkbenchState>((set) => ({
  currentRunId: null,
  selectedEpisode: null,
  isTraining: false,

  setCurrentRun: (runId) => set({ currentRunId: runId }),
  setSelectedEpisode: (episode) => set({ selectedEpisode: episode }),
  setIsTraining: (isTraining) => set({ isTraining }),
  clearSelection: () => set({ selectedEpisode: null }),
}));
