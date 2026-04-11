// src/lib/vla/types.ts
// All VLA-domain UI data shapes used by the mission control dashboard

export interface ConstraintStatus {
  id: string
  name: string
  displayName: string
  formalSpec: string
  domain: 'navigation' | 'manipulation' | 'perception' | 'system'
  severity: 'hard' | 'soft'
  threshold: number
  unit: string
  status: 'active' | 'violated' | 'deprecated' | 'under_review'
  violationCount: number
  lastTestedAt: string | null
  lastViolatedAt: string | null
}

export interface ExperimentSummary {
  id: string
  runId: string
  environment: 'sim' | 'real' | 'hybrid'
  scenario: string
  robot: string
  successRate: number
  avgDeadlineMs: number
  deadlineSatisfied: boolean
  constraintsSatisfied: boolean
  totalViolations: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  completedAt: string | null
}

export interface SimRealMetric {
  metric: string
  count: number
  avgDelta: number
  acceptable: number
  trend: 'improving' | 'degrading' | 'stable'
}

export interface MissionControlData {
  constraints: ConstraintStatus[]
  recentRuns: ExperimentSummary[]
  simRealMetrics: SimRealMetric[]
  systemHealth: {
    constraintCoverage: number    // 0–1: domains covered / total domains
    transferReadiness: number     // 0–1: acceptable sim-real pairs / total
    deadlineCertified: boolean
    lastCertDate: string | null
    totalViolations24h: number
    activeConstraints: number
    hardConstraintsAtRisk: number // violationCount > 3
  }
}
