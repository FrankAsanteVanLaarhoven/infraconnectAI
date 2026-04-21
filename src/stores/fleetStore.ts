import { create } from "zustand";

type RobotNode = {
  id: string;
  position: [number, number, number];
  path: { x: number; y: number }[];
};

type FleetStore = {
  robots: RobotNode[];
  updateRobot: (id: string, data: Partial<RobotNode>) => void;
};

/**
 * Universal Native Store tracking hardware execution traces independent of Component arrays natively.
 */
export const useFleetStore = create<FleetStore>((set) => ({
  robots: [
    { id: "yahboom-m3-pro", position: [-2, 0, 1], path: [] }
  ],

  updateRobot: (id, data) =>
    set((state) => ({
      robots: state.robots.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
    })),
}));
