export type MemoryLevel = 'L0' | 'L1' | 'L2';
export type MemoryPlane = 'execution' | 'memory' | 'governance';
export type MemoryStatus = 'scratch' | 'wiki' | 'canon' | 'archived';
export type MemoryCategory =
  | 'docs' | 'code' | 'telemetry' | 'chats'
  | 'entities' | 'concepts' | 'decisions' | 'projects'
  | 'standards' | 'playbooks' | 'patterns';

export type SkillName = 'spec' | 'plan' | 'build' | 'test' | 'review' | 'ship' | 'hardware_audit' | 'safety_stop';
export type SkillStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface MemoryNode {
  id: string;
  title: string;
  content: string;
  level: MemoryLevel;
  plane: MemoryPlane;
  category: MemoryCategory;
  status: MemoryStatus;
  parentId: string | null;
  tags: string[];
  healthScore: number;
  conflictCount: number;
  referenceCount: number;
  lastValidated: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  children?: MemoryNode[];
  feedbacks?: Feedback[];
}

export interface MemoryContract {
  id: string;
  skill: SkillName;
  reads: string[];
  writes: string[];
  constraints: string[];
  description: string;
  tier?: 'control' | 'edge';
}

export interface SkillRun {
  id: string;
  skill: SkillName;
  status: SkillStatus;
  input: string;
  output: string;
  memoryRead: string[];
  memoryWritten: string[];
  duration: number;
  error: string;
  createdAt: string;
}

export interface GovernancePolicy {
  id: string;
  name: string;
  type: 'promotion' | 'decay' | 'conflict' | 'redundancy';
  config: Record<string, unknown>;
  active: boolean;
}

export interface Feedback {
  id: string;
  nodeId: string;
  type: 'approved' | 'rejected';
  reason: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  target: string;
  detail: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface HealthMetrics {
  overall: number;
  conflictDensity: number;
  coverage: number;
  staleness: number;
  redundancy: number;
  nodeCount: number;
  byLevel: Record<MemoryLevel, { count: number; avgHealth: number }>;
  byPlane: Record<MemoryPlane, { count: number; avgHealth: number }>;
}

export interface IntentResult {
  action: 'open_panel' | 'run_skill' | 'search' | 'create_node' | 'promote' | 'navigate' | 'unknown';
  panel?: string;
  skill?: SkillName;
  query?: string;
  params?: Record<string, string>;
  display: string;
}

export const SKILL_CONTRACTS: Record<SkillName, MemoryContract> = {
  spec: {
    id: 'contract-spec',
    skill: 'spec',
    reads: ['canon/standards/*', 'wiki/projects/*', 'wiki/decisions/*'],
    writes: ['wiki/projects/{project}.md', 'log.md'],
    constraints: ['may not modify canon/*', 'must link to existing standards'],
    description: 'Generate specifications by reading canonical standards and existing project knowledge',
  },
  plan: {
    id: 'contract-plan',
    skill: 'plan',
    reads: ['canon/standards/*', 'wiki/projects/*', 'wiki/entities/*', 'wiki/decisions/*'],
    writes: ['scratch/{project}-plan.md'],
    constraints: ['must reference entity dependencies', 'must include risk assessment'],
    description: 'Create execution plans based on specifications and entity relationships',
  },
  build: {
    id: 'contract-build',
    skill: 'build',
    reads: ['scratch/{project}-plan.md', 'wiki/entities/*'],
    writes: ['scratch/{project}-wip.md', 'raw/telemetry/build-logs/'],
    constraints: ['must follow plan task order', 'must log build telemetry'],
    description: 'Execute build tasks following the plan, producing work-in-progress artifacts',
  },
  test: {
    id: 'contract-test',
    skill: 'test',
    reads: ['wiki/projects/*', 'canon/standards/testing.md'],
    writes: ['raw/telemetry/test-runs/', 'wiki/decisions/{project}-test-findings.md'],
    constraints: ['must compare against canon test standards', 'must record all failures'],
    description: 'Run tests against specifications and record findings',
  },
  review: {
    id: 'contract-review',
    skill: 'review',
    reads: ['wiki/*', 'canon/*', 'scratch/*', 'governance/feedback/rejected.json'],
    writes: ['wiki/decisions/*', 'canon/patterns/*', 'governance/feedback/approved.json'],
    constraints: ['must check for repeated rejected patterns', 'promotion requires 2+ approvals'],
    description: 'Review artifacts and promote validated knowledge to canonical status',
  },
  ship: {
    id: 'contract-ship',
    skill: 'ship',
    reads: ['canon/standards/release.md'],
    writes: ['canon/standards/{project}-released.md'],
    constraints: ['must have completed review gate', 'must validate all release criteria'],
    description: 'Release validated knowledge as canonical, creating official records',
  },
  hardware_audit: {
    id: 'contract-hwa',
    skill: 'hardware_audit',
    reads: ['canon/standards/*'],
    writes: ['raw/telemetry/hardware-audits/'],
    constraints: ['must execute directly on agent hardware', 'must return raw system metrics'],
    description: 'Audit edge hardware health, temperature, and low-level subsystem logs',
    tier: 'edge',
  },
  safety_stop: {
    id: 'contract-ss',
    skill: 'safety_stop',
    reads: ['canon/standards/safety.md'],
    writes: ['log.md'],
    constraints: ['highest priority dispatch', 'must verify hardware cutoff'],
    description: 'Emergency system-wide safety stop and subsystem isolation',
    tier: 'edge',
  },
};

export const LEVEL_LABELS: Record<MemoryLevel, string> = {
  L0: 'Raw Artifacts',
  L1: 'Structured Wiki',
  L2: 'Canonical Knowledge',
};

export const PLANE_LABELS: Record<MemoryPlane, string> = {
  execution: 'Execution Plane',
  memory: 'Memory Plane',
  governance: 'Governance Plane',
};

export const SKILL_LABELS: Record<SkillName, string> = {
  spec: 'Specification',
  plan: 'Planning',
  build: 'Build',
  test: 'Testing',
  review: 'Review',
  ship: 'Release',
  hardware_audit: 'Hardware Audit',
  safety_stop: 'Safety Stop',
};
