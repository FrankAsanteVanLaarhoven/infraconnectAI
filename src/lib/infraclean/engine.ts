export interface EpisodeQualityInput {
  modelLoss: number;
  physicsRealism: number;
  sensorFidelity: number;
  languageGrounding: number;
  actionSuccess: number;
  redundancyScore?: number;
}

export class InfraCleanEngine {
  private static instance: InfraCleanEngine;

  static getInstance(): InfraCleanEngine {
    if (!InfraCleanEngine.instance) {
      InfraCleanEngine.instance = new InfraCleanEngine();
    }
    return InfraCleanEngine.instance;
  }

  /**
   * Proprietary confidence scoring (replaces Cleanlab)
   * Combines multiple signals with learned weights tuned for VLA + physics
   */
  calculateConfidence(input: EpisodeQualityInput): number {
    const {
      modelLoss,
      physicsRealism,
      sensorFidelity,
      languageGrounding,
      actionSuccess,
      redundancyScore = 0.8,
    } = input;

    // Custom weighted formula (tuned for VLA + physics)
    const lossPenalty = Math.min(modelLoss / 3.5, 1) * 0.28;
    const physicsScore = physicsRealism * 0.32 + sensorFidelity * 0.18;
    const vlaScore = languageGrounding * 0.12 + actionSuccess * 0.10;
    const redundancyBonus = redundancyScore * 0.08;

    const rawScore = physicsScore + vlaScore + redundancyBonus - lossPenalty;

    return Math.max(0.15, Math.min(0.98, rawScore));
  }

  /**
   * Compute quality breakdown for UI display
   */
  getQualityBreakdown(input: EpisodeQualityInput) {
    const lossPenalty = Math.min(input.modelLoss / 3.5, 1) * 0.28;
    return {
      physicsComponent: (input.physicsRealism * 0.32 + input.sensorFidelity * 0.18),
      vlaComponent: (input.languageGrounding * 0.12 + input.actionSuccess * 0.10),
      redundancyComponent: (input.redundancyScore ?? 0.8) * 0.08,
      lossPenalty,
      confidence: this.calculateConfidence(input),
    };
  }

  /**
   * Batch analysis of episodes
   */
  analyzeBatch(episodes: EpisodeQualityInput[]) {
    const results = episodes.map((ep) => ({
      confidence: this.calculateConfidence(ep),
      breakdown: this.getQualityBreakdown(ep),
    }));

    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const noisyCount = results.filter((r) => r.confidence < 0.55).length;

    return {
      results,
      avgConfidence,
      noisyCount,
      cleanCount: results.length - noisyCount,
      qualityDistribution: {
        excellent: results.filter((r) => r.confidence >= 0.8).length,
        good: results.filter((r) => r.confidence >= 0.55 && r.confidence < 0.8).length,
        low: results.filter((r) => r.confidence >= 0.4 && r.confidence < 0.55).length,
        critical: results.filter((r) => r.confidence < 0.4).length,
      },
    };
  }
}

export const infraCleanEngine = InfraCleanEngine.getInstance();
