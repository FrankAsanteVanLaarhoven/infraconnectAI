export type Robot = {
  id: string;
  position: [number, number, number];
  battery: number;
  status: "idle" | "busy" | "offline";
};

export type Task = {
  id: string;
  type: "inspect" | "deliver" | "charge";
  target: [number, number, number];
  priority: number;
};
