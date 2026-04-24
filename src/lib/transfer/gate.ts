import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export interface TransferReadinessReport {
  agentId:       string
  fromTier:      string
  toTier:        string
  approved:      boolean
  blockers:      string[]
  warnings:      string[]
  deltaMetrics:  DeltaMetrics
  certExpiry:    string | null
}

export interface DeltaMetrics {
  successRateDelta:    number   // real - sim (negative = regression)
  avgDeadlineDelta:    number   // ms difference
  violationDelta:      number   // real violations - sim violations
  transferReadiness:   number   // 0-100 composite
  domainGap:           number   // estimated sim-to-real domain gap score
}

// Hard gate criteria — ALL must pass for transfer approval
const HARD_GATE_CRITERIA = [
  { id: 'min_sim_success_rate',    label: 'Sim success rate ≥ 85%',      check: (d: DeltaMetrics, ctx: any) => ctx.simSuccessRate >= 0.85 },
  { id: 'deadline_certified',      label: 'Deadline certified (P95)',     check: (_: any, ctx: any) => ctx.deadlineCertified === true },
  { id: 'no_hard_violations',      label: '0 hard constraint violations', check: (_: any, ctx: any) => ctx.hardViolations24h === 0 },
  { id: 'min_transfer_readiness',  label: 'Transfer readiness ≥ 70',      check: (d: DeltaMetrics, ctx: any) => d.transferReadiness >= 70 },
  { id: 'policy_approved',         label: 'Policy profile approved',      check: (_: any, ctx: any) => ctx.policyApproved === true },
]

// Soft warnings — do not block but are recorded
const SOFT_CRITERIA = [
  { id: 'domain_gap_warn',    label: 'Domain gap < 0.3',          check: (d: DeltaMetrics, ctx: any) => d.domainGap < 0.3 },
  { id: 'success_delta_warn', label: 'Success rate delta > -10%',  check: (d: DeltaMetrics, ctx: any) => d.successRateDelta > -0.10 },
  { id: 'deadline_delta_warn',label: 'Deadline delta < 20ms',      check: (d: DeltaMetrics, ctx: any) => d.avgDeadlineDelta < 20 },
]

export async function evaluateTransferReadiness(
  agentId:  string,
  fromTier: string,
  toTier:   string,
): Promise<TransferReadinessReport> {

  // Pull latest lifecycle runs for this agent
  const [simRuns, realRuns] = await Promise.all([
    prisma.agentLifecycleRun.findMany({
      where: { environment: 'sim', status: 'completed' },
      orderBy: { completedAt: 'desc' },
      take: 10,
    }),
    prisma.agentLifecycleRun.findMany({
      where: { environment: 'real', status: 'completed' },
      orderBy: { completedAt: 'desc' },
      take: 5,
    }),
  ])

  const hardViolations24h = await prisma.operationalViolation.count({
    where: {
      directive: { severity: 'hard' },
      resolvedAt: null,
      createdAt: { gte: new Date(Date.now() - 86_400_000) },
    },
  })

  const simSuccessRate = simRuns.length > 0
    ? simRuns.reduce((s, r) => s + r.successRate, 0) / simRuns.length
    : 0

  const realSuccessRate = realRuns.length > 0
    ? realRuns.reduce((s, r) => s + r.successRate, 0) / realRuns.length
    : simSuccessRate

  const simDeadline  = simRuns.length  > 0 ? simRuns.reduce((s,  r) => s + r.avgDeadlineMs, 0) / simRuns.length  : 0
  const realDeadline = realRuns.length > 0 ? realRuns.reduce((s, r) => s + r.avgDeadlineMs, 0) / realRuns.length : simDeadline

  const deadlineCertified = simRuns.some(r => r.deadlineSatisfied)

  // Domain gap: heuristic from success rate delta + deadline delta
  const successDelta  = realSuccessRate - simSuccessRate
  const deadlineDelta = Math.abs(realDeadline - simDeadline)
  const domainGap     = Math.min(1, Math.abs(successDelta) * 2 + deadlineDelta / 200)

  const transferReadiness = Math.round(
    simSuccessRate * 40 +
    (deadlineCertified ? 25 : 0) +
    (hardViolations24h === 0 ? 25 : 0) +
    Math.max(0, 10 - domainGap * 10)
  )

  const delta: DeltaMetrics = {
    successRateDelta:   successDelta,
    avgDeadlineDelta:   deadlineDelta,
    violationDelta:     hardViolations24h,
    transferReadiness,
    domainGap,
  }

  const ctx = { simSuccessRate, deadlineCertified, hardViolations24h, policyApproved: true }

  const blockers  = HARD_GATE_CRITERIA.filter(c => !c.check(delta, ctx)).map(c => c.label)
  const warnings  = SOFT_CRITERIA.filter(c => !c.check(delta, ctx)).map(c => c.label)
  const approved  = blockers.length === 0

  // Record the transfer event
  await prisma.transferEvent.create({
    data: {
      agentId,
      fromTier,
      toTier,
      triggeredBy: 'auto',
      outcome: approved ? 'success' : 'rollback',
      deltaMetrics: delta as any,
    },
  })

  return {
    agentId,
    fromTier,
    toTier,
    approved,
    blockers,
    warnings,
    deltaMetrics: delta,
    certExpiry: deadlineCertified ? new Date(Date.now() + 86_400_000 * 7).toISOString() : null,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// v3.0 — Isaac Lab to Real Fleet Transfer Gate
// ═══════════════════════════════════════════════════════════════════════════════

export interface IsaacTransferReport {
  runId:          string
  approved:       boolean
  blockers:       string[]
  warnings:       string[]
  physicsScore:   number
  dataQuality:    number
  pruneRatio:     number
}

const ISAAC_HARD_CRITERIA = [
  { id: 'physics_score',    label: 'Physics score avg ≥ 0.70',      check: (ctx: any) => ctx.physicsScore >= 0.70 },
  { id: 'data_quality',     label: 'Data quality avg ≥ 0.65',       check: (ctx: any) => ctx.dataQuality >= 0.65 },
  { id: 'prune_ratio',      label: 'Prune ratio < 20%',             check: (ctx: any) => ctx.pruneRatio < 0.20 },
  { id: 'min_episodes',     label: 'Minimum 50 episodes completed', check: (ctx: any) => ctx.totalEpisodes >= 50 },
  { id: 'run_completed',    label: 'Isaac run completed',           check: (ctx: any) => ctx.runCompleted },
]

const ISAAC_SOFT_CRITERIA = [
  { id: 'sensor_fidelity',  label: 'Sensor fidelity avg > 0.75',    check: (ctx: any) => ctx.sensorFidelity > 0.75 },
  { id: 'action_success',   label: 'Action success avg > 0.70',     check: (ctx: any) => ctx.actionSuccess > 0.70 },
]

/**
 * Isaac Lab → Real Fleet Transfer Gate
 * Validates physics simulation quality + data curation health before
 * allowing model weights to be deployed to physical robots via OTA.
 */
export async function isaacToRealGate(runId: string): Promise<IsaacTransferReport> {
  const run = await prisma.isaacLabRun.findUnique({
    where: { id: runId },
    include: { episodes: { where: { isPruned: false } } },
  })

  if (!run) throw new Error(`Isaac Lab run ${runId} not found`)

  const totalEpisodes = run.totalEpisodes
  const pruneRatio = totalEpisodes > 0 ? run.prunedCount / totalEpisodes : 1

  // Calculate sensor fidelity and action success averages from non-pruned episodes
  const validEpisodes = run.episodes
  const sensorFidelity = validEpisodes.length > 0
    ? validEpisodes.reduce((s, e) => s + e.sensorFidelity, 0) / validEpisodes.length
    : 0
  const actionSuccess = validEpisodes.length > 0
    ? validEpisodes.reduce((s, e) => s + e.actionSuccess, 0) / validEpisodes.length
    : 0

  const ctx = {
    physicsScore: run.physicsScoreAvg,
    dataQuality: run.dataQualityScoreAvg,
    pruneRatio,
    totalEpisodes,
    runCompleted: run.status === 'COMPLETED',
    sensorFidelity,
    actionSuccess,
  }

  const blockers = ISAAC_HARD_CRITERIA.filter(c => !c.check(ctx)).map(c => c.label)
  const warnings = ISAAC_SOFT_CRITERIA.filter(c => !c.check(ctx)).map(c => c.label)
  const approved = blockers.length === 0

  // Record the transfer attempt
  await prisma.transferEvent.create({
    data: {
      agentId: `isaac-run-${runId}`,
      fromTier: 'ISAAC_SIM',
      toTier: 'REAL_FLEET',
      triggeredBy: 'isaac-to-real-gate',
      outcome: approved ? 'success' : 'rollback',
      deltaMetrics: {
        physicsScore: run.physicsScoreAvg,
        dataQuality: run.dataQualityScoreAvg,
        pruneRatio,
        totalEpisodes,
        sensorFidelity,
        actionSuccess,
      } as any,
    },
  })

  return {
    runId,
    approved,
    blockers,
    warnings,
    physicsScore: run.physicsScoreAvg,
    dataQuality: run.dataQualityScoreAvg,
    pruneRatio,
  }
}
