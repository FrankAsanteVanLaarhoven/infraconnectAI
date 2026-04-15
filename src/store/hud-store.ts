import { create } from 'zustand'

interface HUDStore {
  isActive: boolean
  focusMode: boolean
  toggleHUD: () => void
  setHUD: (v: boolean) => void
  setFocus: (v: boolean) => void
}

export const useHUDStore = create<HUDStore>((set) => ({
  isActive: false, // Start hidden to ensure clarity, toggle with /hud
  focusMode: false,
  toggleHUD: () => set((state) => ({ isActive: !state.isActive })),
  setHUD: (v) => set({ isActive: v }),
  setFocus: (v) => set({ focusMode: v }),
}))
