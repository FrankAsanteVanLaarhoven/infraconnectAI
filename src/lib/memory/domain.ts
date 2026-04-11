// Unified Ontology Types

export type MemoryLevel = "L0" | "L1" | "L2";
export type Plane = "execution" | "memory" | "governance";
export type NodeKind = 
  | "artifact"
  | "decision"
  | "concept"
  | "project"
  | "policy"
  | "playbook"
  | "standard"
  | "entity"
  | "experiment"
  | "trace";

export interface MemoryNode {
  id: string;
  title: string;
  content: string;
  level: MemoryLevel;
  plane: Plane;
  category: NodeKind;
  status: "draft" | "verified" | "active" | "violated";
  parentId: string | null;
  tags: string[];
  healthScore: number;
  conflictCount: number;
  referenceCount: number;
  lastValidated: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CapxEpisodeProjection {
  episodeId: string;
  benchmark: string;
  suite: string;
  taskName: string;
  abstraction: string;
  success: boolean;
  violations: number;
  recoveryCount: number;
  durationSec: number | null;
  simToReal: boolean | null;
  lastImportedAt: string;
}

export interface HealthSnapshotProjection {
  overall: number;
  policyVersion: string;
  components: {
    coverage: number;
    conflictDensity: number;
    staleness: number;
    redundancy: number;
  };
  nodeCounts: {
    l0: number;
    l1: number;
    l2: number;
  };
  planeCounts: {
    execution: number;
    memory: number;
    governance: number;
  };
}
