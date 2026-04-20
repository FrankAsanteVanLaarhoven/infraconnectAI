// Global feature flags for controlling platform modality

export const FEATURES = {
  // Core AI
  agents: true,
  llm_reasoning: true,
  mission_planner: true,
  dag_engine: true,
  
  // Storage & State
  memory: false, // Turn on when pgvector + Prisma is fully deployed
  
  // Real World Links
  simulation: true,
  edge_sync: false, // Turn off for pure Web UI Demos
};
