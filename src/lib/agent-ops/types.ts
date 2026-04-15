// src/lib/agent-ops/types.ts
// Platform Core Engines for Future DevOps Command Center

export interface VerificationGate {
  id: string
  name: string
  displayName: string
  spec: string
  category: 'safety' | 'security' | 'performance' | 'standard'
  severity: 'critical' | 'optional'
  status: 'passed' | 'failed' | 'pending' | 'review_required'
  violationCount: number
  lastCheckAt: string | null
}

export interface ParallelTask {
  id: string
  agentId: string
  role: string
  status: 'executing' | 'verifying' | 'completed' | 'failed' | 'on_hold'
  progress: number
  taskReport: string | null
  humanSignOff: boolean
  startedAt: string
  completedAt: string | null
}

export interface BuildLogTelemetry {
  metric: string
  value: number
  unit: string
  trend: 'improving' | 'degrading' | 'stable'
  isAcceptable: boolean
}

export interface MissionSpecification {
  id: string
  title: string
  objective: string
  constraints: string[]
  physicalSyncRequired: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface AuthorizationCycle {
  id: string
  missionId: string
  stage: 'drafting' | 'simulation' | 'validation' | 'authorized'
  votedPassed: number
  votedFailed: number
  requiresCommanderSignOff: boolean
  isLocked: boolean
}

export interface MissionControlData {
  verificationGates: VerificationGate[]
  activeTasks: ParallelTask[]
  buildTelemetry: BuildLogTelemetry[]
  currentMission?: MissionSpecification
  authCycle?: AuthorizationCycle
  systemHealth: {
    gateCoverage: number       
    operationalReadiness: number 
    deadlineCertified: boolean
    lastCertDate: string | null
    totalViolations24h: number
    activeAgents: number
    criticalGatesAtRisk: number
  }
}

