import { db as prisma } from '@/lib/db'

export class TelemetryAggregator {
  /**
   * Ingests a telemetry or incident frame and updates the benchmark projection.
   */
  static async ingest(agentId: string, type: 'telemetry' | 'incident' | 'buffered', data: any) {
    console.log(`[TelemetryAggregator] Ingesting ${type} from ${agentId}`)

    // 1. Create a Benchmark Episode for the history list
    const episode = await prisma.benchmarkEpisode.create({
      data: {
        shortId: Math.random().toString(36).substring(2, 8),
        benchmark: 'IndustrialStandard',
        suite: 'AGENT_LIVE_STREAM',
        taskId: data.modality?.toUpperCase() || (type === 'incident' ? 'SAFETY_INCIDENT' : 'TELEMETRY_FRAME'),
        abstractionLayer: 'S4',
        status: type === 'incident' ? 'blocked' : 'passed',
        success: type !== 'incident',
        policyViolationCount: type === 'incident' ? 1 : 0,
        recoveryCount: 0,
        importedAt: new Date()
      }
    }).catch(() => null)

    // 2. Incrementally update the Singleton Projection
    // We do a fresh aggregation to keep it accurate, then update the projection
    await this.refreshProjection()
  }

  static async refreshProjection() {
    const episodes = await prisma.benchmarkEpisode.findMany({
      where: { benchmark: 'IndustrialStandard' },
      take: 1000,
      orderBy: { importedAt: 'desc' }
    })

    if (episodes.length === 0) return

    const total = episodes.length
    const successCount = episodes.filter(e => e.success).length
    const recoveryCount = episodes.filter(e => (e as any).recoveryCount > 0).length
    const violationCount = episodes.filter(e => (e as any).policyViolationCount > 0).length

    await prisma.benchmarkProjection.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        benchmark: 'IndustrialStandard',
        loaded: true,
        taskSuccess: successCount / total,
        policyViolations: violationCount / total,
        autoRecovery: recoveryCount / total,
        abstractionLayer: 'S4',
        episodes: episodes.slice(0, 10) as any,
        sourceEventId: `refresh-${Date.now()}`
      },
      update: {
        loaded: true,
        taskSuccess: successCount / total,
        policyViolations: violationCount / total,
        autoRecovery: recoveryCount / total,
        abstractionLayer: 'S4',
        episodes: episodes.slice(0, 10) as any,
        sourceEventId: `refresh-${Date.now()}`
      }
    })
  }
}
