// src/lib/projections/nemoclaw.ts

export interface AgentProjection {
  id: string
  name: string
  model: string
  policyProfile: string
  status: 'idle' | 'running' | 'paused' | 'terminated' | 'error'
  memoryDepth: number
  canPromote: boolean
  canPublish: boolean
  createdAt: string
  _count: { skillRuns: number; sessions: number }
}

export interface SessionProjection {
  id: string
  agentId: string
  taskSummary: string | null
  turns: number
  tokensIn: number
  tokensOut: number
  outcome: 'success' | 'failed' | 'abandoned' | 'blocked_by_policy' | null
  startedAt: string
  endedAt: string | null
  agent: { name: string; model: string }
  _count: { turns_: number }
}

export interface SkillRunProjection {
  id: string
  skillId: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'blocked'
  input: Record<string, unknown> | null
  output: Record<string, unknown> | null
  policyGate: string | null
  startedAt: string
  completedAt: string | null
  durationMs: number | null
}

export interface NemoClawRunResult {
  blocked: boolean
  reason: string | null
  runId: string
  sessionId: string
  output?: Record<string, unknown>
}
