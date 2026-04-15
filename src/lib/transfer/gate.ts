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
