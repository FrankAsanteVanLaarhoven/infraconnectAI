import { db } from '@/lib/db';

export interface RunMetrics {
  totalEpisodes: number;
  avgPhysicsScore: number;
  avgSensorFidelity: number;
  avgLanguageGrounding: number;
  avgActionSuccess: number;
  avgQualityScore: number;
  avgLoss: number;
  prunedCount: number;
  keptCount: number;
  lossTrend: { step: number; loss: number }[];
  physicsTrend: { step: number; score: number; quality: number }[];
  sensorTrend: { step: number; sensor: number }[];
  actionTrend: { step: number; action: number }[];
  qualityDistribution: {
    excellent: number;
    good: number;
    low: number;
    critical: number;
  };
  confidenceDistribution: number[];
  radarData: { metric: string; value: number; fullMark: number }[];
}

export interface RunComparison {
  runId: string;
  status: string;
  totalEpisodes: number;
  avgPhysicsScore: number;
  avgQualityScore: number;
  avgLoss: number;
  prunedCount: number;
  keptCount: number;
}

export class InfraAnalyticsEngine {
  private static instance: InfraAnalyticsEngine;

  static getInstance(): InfraAnalyticsEngine {
    if (!InfraAnalyticsEngine.instance) {
      InfraAnalyticsEngine.instance = new InfraAnalyticsEngine();
    }
    return InfraAnalyticsEngine.instance;
  }

  /**
   * Get full run metrics for analytics dashboard
   */
  async getRunMetrics(runId: string): Promise<RunMetrics> {
    const episodes = await db.physicsEpisode.findMany({
      where: { runId },
      orderBy: { episodeIndex: 'asc' },
    });

    if (episodes.length === 0) {
      return {
        totalEpisodes: 0,
        avgPhysicsScore: 0,
        avgSensorFidelity: 0,
        avgLanguageGrounding: 0,
        avgActionSuccess: 0,
        avgQualityScore: 0,
        avgLoss: 0,
        prunedCount: 0,
        keptCount: 0,
        lossTrend: [],
        physicsTrend: [],
        sensorTrend: [],
        actionTrend: [],
        qualityDistribution: { excellent: 0, good: 0, low: 0, critical: 0 },
        confidenceDistribution: [],
        radarData: [],
      };
    }

    const avgPhysics = episodes.reduce((s, e) => s + e.physicsRealism, 0) / episodes.length;
    const avgSensor = episodes.reduce((s, e) => s + e.sensorFidelity, 0) / episodes.length;
    const avgLang = episodes.reduce((s, e) => s + e.languageGrounding, 0) / episodes.length;
    const avgAction = episodes.reduce((s, e) => s + e.actionSuccess, 0) / episodes.length;
    const avgQuality = episodes.reduce((s, e) => s + e.overallQualityScore, 0) / episodes.length;
    const avgLoss = episodes.reduce((s, e) => s + e.modelLoss, 0) / episodes.length;
    const prunedCount = episodes.filter((e) => e.isPruned).length;

    const lossTrend = episodes.map((e) => ({
      step: e.episodeIndex,
      loss: parseFloat(e.modelLoss.toFixed(4)),
    }));

    const physicsTrend = episodes.map((e) => ({
      step: e.episodeIndex,
      score: parseFloat(e.physicsRealism.toFixed(4)),
      quality: parseFloat(e.overallQualityScore.toFixed(4)),
    }));

    const sensorTrend = episodes.map((e) => ({
      step: e.episodeIndex,
      sensor: parseFloat(e.sensorFidelity.toFixed(4)),
    }));

    const actionTrend = episodes.map((e) => ({
      step: e.episodeIndex,
      action: parseFloat(e.actionSuccess.toFixed(4)),
    }));

    const qualityDistribution = {
      excellent: episodes.filter((e) => e.cleanlabConfidence >= 0.8).length,
      good: episodes.filter((e) => e.cleanlabConfidence >= 0.55 && e.cleanlabConfidence < 0.8).length,
      low: episodes.filter((e) => e.cleanlabConfidence >= 0.4 && e.cleanlabConfidence < 0.55).length,
      critical: episodes.filter((e) => e.cleanlabConfidence < 0.4).length,
    };

    const confidenceDistribution = episodes.map((e) =>
      parseFloat(e.cleanlabConfidence.toFixed(3))
    );

    const radarData = [
      { metric: 'Physics', value: parseFloat((avgPhysics * 100).toFixed(1)), fullMark: 100 },
      { metric: 'Sensor', value: parseFloat((avgSensor * 100).toFixed(1)), fullMark: 100 },
      { metric: 'Language', value: parseFloat((avgLang * 100).toFixed(1)), fullMark: 100 },
      { metric: 'Action', value: parseFloat((avgAction * 100).toFixed(1)), fullMark: 100 },
      { metric: 'Quality', value: parseFloat((avgQuality * 100).toFixed(1)), fullMark: 100 },
    ];

    return {
      totalEpisodes: episodes.length,
      avgPhysicsScore: parseFloat(avgPhysics.toFixed(4)),
      avgSensorFidelity: parseFloat(avgSensor.toFixed(4)),
      avgLanguageGrounding: parseFloat(avgLang.toFixed(4)),
      avgActionSuccess: parseFloat(avgAction.toFixed(4)),
      avgQualityScore: parseFloat(avgQuality.toFixed(4)),
      avgLoss: parseFloat(avgLoss.toFixed(4)),
      prunedCount,
      keptCount: episodes.length - prunedCount,
      lossTrend,
      physicsTrend,
      sensorTrend,
      actionTrend,
      qualityDistribution,
      confidenceDistribution,
      radarData,
    };
  }

  /**
   * Compare multiple runs side-by-side
   */
  async compareRuns(runIds: string[]): Promise<RunComparison[]> {
    const results = await Promise.all(
      runIds.map(async (id) => {
        const episodes = await db.physicsEpisode.findMany({
          where: { runId: id },
        });
        const run = await db.isaacLabRun.findUnique({ where: { id } });

        return {
          runId: id.slice(0, 8),
          status: run?.status || 'UNKNOWN',
          totalEpisodes: episodes.length,
          avgPhysicsScore: episodes.length
            ? parseFloat(
                (episodes.reduce((s, e) => s + e.physicsRealism, 0) / episodes.length).toFixed(4)
              )
            : 0,
          avgQualityScore: episodes.length
            ? parseFloat(
                (
                  episodes.reduce((s, e) => s + e.overallQualityScore, 0) / episodes.length
                ).toFixed(4)
              )
            : 0,
          avgLoss: episodes.length
            ? parseFloat(
                (episodes.reduce((s, e) => s + e.modelLoss, 0) / episodes.length).toFixed(4)
              )
            : 0,
          prunedCount: episodes.filter((e) => e.isPruned).length,
          keptCount: episodes.filter((e) => !e.isPruned).length,
        };
      })
    );

    return results;
  }

  /**
   * Get all run IDs for comparison selector
   */
  async getAllRunSummaries() {
    const runs = await db.isaacLabRun.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        totalEpisodes: true,
        prunedCount: true,
        physicsScoreAvg: true,
        dataQualityScoreAvg: true,
        createdAt: true,
      },
    });

    return runs.map((r) => ({
      id: r.id,
      shortId: r.id.slice(0, 8),
      status: r.status,
      totalEpisodes: r.totalEpisodes,
      prunedCount: r.prunedCount,
      avgPhysics: r.physicsScoreAvg,
      avgQuality: r.dataQualityScoreAvg,
      createdAt: r.createdAt,
    }));
  }
}

export const infraAnalyticsEngine = InfraAnalyticsEngine.getInstance();
