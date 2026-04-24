import { db } from '@/lib/db';

export interface PhysicsHealthResult {
  totalEpisodes: number;
  avgPhysicsRealism: number;
  avgSensorFidelity: number;
  avgLanguageGrounding: number;
  avgActionSuccess: number;
  physicsHealthScore: number;
  lowPhysicsCount: number;
  highPhysicsCount: number;
  prunedCount: number;
  keptCount: number;
  signalBreakdown: {
    physics: number;
    sensor: number;
    language: number;
    action: number;
  };
}

/**
 * InfraPhysics Engine — Deep physics-aware scoring
 * Tightly integrated with the 6-signal health system
 */
export class InfraPhysicsEngine {
  private static instance: InfraPhysicsEngine;

  static getInstance(): InfraPhysicsEngine {
    if (!InfraPhysicsEngine.instance) {
      InfraPhysicsEngine.instance = new InfraPhysicsEngine();
    }
    return InfraPhysicsEngine.instance;
  }

  /**
   * Calculate composite physics score for a run (non-pruned episodes only)
   */
  async calculatePhysicsScore(runId: string): Promise<number> {
    const episodes = await db.physicsEpisode.findMany({
      where: { runId, isPruned: false },
      select: { physicsRealism: true, sensorFidelity: true },
    });

    if (episodes.length === 0) return 0;

    const avgPhysics =
      episodes.reduce((sum, e) => sum + e.physicsRealism, 0) / episodes.length;
    const avgSensor =
      episodes.reduce((sum, e) => sum + e.sensorFidelity, 0) / episodes.length;

    return avgPhysics * 0.6 + avgSensor * 0.4;
  }

  /**
   * Get full physics health breakdown for a run
   */
  async getPhysicsHealthBreakdown(runId: string): Promise<PhysicsHealthResult> {
    const episodes = await db.physicsEpisode.findMany({
      where: { runId },
    });

    if (episodes.length === 0) {
      return {
        totalEpisodes: 0,
        avgPhysicsRealism: 0,
        avgSensorFidelity: 0,
        avgLanguageGrounding: 0,
        avgActionSuccess: 0,
        physicsHealthScore: 0,
        lowPhysicsCount: 0,
        highPhysicsCount: 0,
        prunedCount: 0,
        keptCount: 0,
        signalBreakdown: { physics: 0, sensor: 0, language: 0, action: 0 },
      };
    }

    const n = episodes.length;
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const physicsScores = episodes.map((e) => e.physicsRealism);
    const sensorScores = episodes.map((e) => e.sensorFidelity);
    const langScores = episodes.map((e) => e.languageGrounding);
    const actionScores = episodes.map((e) => e.actionSuccess);

    const kept = episodes.filter((e) => !e.isPruned);
    const keptPhysics = kept.length > 0
      ? avg(kept.map((e) => e.physicsRealism))
      : 0;
    const keptSensor = kept.length > 0
      ? avg(kept.map((e) => e.sensorFidelity))
      : 0;

    return {
      totalEpisodes: n,
      avgPhysicsRealism: avg(physicsScores),
      avgSensorFidelity: avg(sensorScores),
      avgLanguageGrounding: avg(langScores),
      avgActionSuccess: avg(actionScores),
      physicsHealthScore: keptPhysics * 0.6 + keptSensor * 0.4,
      lowPhysicsCount: episodes.filter((e) => e.physicsRealism < 0.6).length,
      highPhysicsCount: episodes.filter((e) => e.physicsRealism >= 0.85).length,
      prunedCount: episodes.filter((e) => e.isPruned).length,
      keptCount: kept.length,
      signalBreakdown: {
        physics: avg(physicsScores),
        sensor: avg(sensorScores),
        language: avg(langScores),
        action: avg(actionScores),
      },
    };
  }

  /**
   * Calculate per-episode infra physics score
   */
  calculateEpisodeScore(episode: {
    physicsRealism: number;
    sensorFidelity: number;
    languageGrounding: number;
    actionSuccess: number;
    modelLoss: number;
  }): number {
    const weightedScore =
      episode.physicsRealism * 0.35 +
      episode.sensorFidelity * 0.25 +
      episode.languageGrounding * 0.15 +
      episode.actionSuccess * 0.15 +
      Math.max(0, 1 - episode.modelLoss / 3.5) * 0.10;

    return Math.max(0, Math.min(1, weightedScore));
  }
}

export const infraPhysicsEngine = InfraPhysicsEngine.getInstance();
