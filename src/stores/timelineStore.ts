import { create } from "zustand";

export interface TimelineEvent {
  type: string;
  data: any;
  ts: number;
}

type TimelineStore = {
  events: TimelineEvent[];
  pointer: number;
  addEvent: (type: string, data: any) => void;
  setPointer: (p: number) => void;
  clear: () => void;
};

export const useTimelineStore = create<TimelineStore>((set) => ({
  events: [],
  pointer: 0,

  addEvent: (type, data) => set((state) => {
    // Keep the last 100 historical events to prevent memory degradation
    const newEvents = [...state.events, { type, data, ts: Date.now() }];
    if (newEvents.length > 100) newEvents.shift();
    
    return { 
        events: newEvents,
        pointer: newEvents.length // Natively bind pointers to active head seamlessly natively.
    };
  }),

  setPointer: (p) => set({ pointer: p }),
  
  clear: () => set({ events: [], pointer: 0 })
}));

