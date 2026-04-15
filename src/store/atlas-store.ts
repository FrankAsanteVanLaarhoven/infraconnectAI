import { create } from 'zustand'

interface AtlasStore {
  isAtlasOpen: boolean
  toggleAtlas: () => void
  setAtlas: (v: boolean) => void
}

export const useAtlasStore = create<AtlasStore>((set) => ({
  isAtlasOpen: true, // Show by default as a visual anchor
  toggleAtlas: () => set((state) => ({ isAtlasOpen: !state.isAtlasOpen })),
  setAtlas: (v) => set({ isAtlasOpen: v }),
}))
