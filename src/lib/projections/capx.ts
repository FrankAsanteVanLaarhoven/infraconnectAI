// src/lib/projections/capx.ts

export interface CaPXBenchRunProjection {
  id: string
  runTag: string
  model: string
  agentType: string
  environment: string
  totalTasks: number
  passedTasks: number
  failedTasks: number
  errorTasks: number
  passRate: number       // 0.0-1.0
  avgSteps: number | null
  avgTokens: number | null
  notes: string | null
  startedAt: string
  completedAt: string | null
  _count: { taskResults: number }
}

export interface CaPXTaskResultProjection {
  id: string
  taskId: string
  taskFamily: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  status: 'pass' | 'fail' | 'error' | 'timeout'
  steps: number | null
  tokens: number | null
  safetyViol: boolean
  duration: number | null
  errorMsg: string | null
}

export interface CaPXDashboardProjection {
  runs: CaPXBenchRunProjection[]
  latest: (CaPXBenchRunProjection & { taskResults: CaPXTaskResultProjection[] }) | null
  familyStats: Array<{ taskFamily: string; status: string; _count: number }>
  taskSuite: Array<{
    taskId: string
    taskFamily: string
    difficulty: string
    description: string
    maxSteps: number
    timeoutSeconds: number
  }>
}
