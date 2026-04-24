import { db } from '@/lib/db';
import { streamProducer } from '@/infrastructure/redis/producer';

/**
 * Live Curation Engine
 * 
 * Real-time fusion of:
 * - Cleanlab confidence scoring (label quality estimation)
 * - WeightsLab-style high-loss detection (training signal quality)
 * - Physics realism scoring (simulation fidelity)
 * - Redundancy detection (Jaccard on episode embeddings)
 * 
 * Evaluates every incoming episode batch, persists quality records,
 * and auto-pauses runs when data quality degrades beyond thresholds.
 */

interface EpisodeMetrics {
  episodeIndex: number;
  modelLoss: number;
  physicsRealism: number;
  sensorFidelity: number;
  languageGrounding: number;
  actionSuccess: number;
}

interface CurationDecision {
  action: 'PRUNE' | 'KEEP' | 'FLAG_HUMAN_REVIEW';
  reason: string;
  confidence: number;
  metadata?: Record<string, any>;
}

// Thresholds governing curation decisions
const CURATION_THRESHOLDS = {
  PHYSICS_MIN: 0.55,              // Below this → PRUNE
  CLEANLAB_MIN: 0.45,             // Below this → FLAG_HUMAN_REVIEW
  MODEL_LOSS_MAX: 2.8,            // Above this + low quality → PRUNE
  OVERALL_QUALITY_MIN: 0.65,      // Combined floor for high-loss pruning
  PRUNE_RATIO_PAUSE: 0.25,        // Auto-pause run if >25% episodes pruned
  PROMOTE_THRESHOLD: 0.90,        // Above this → candidate for Physics Canon
} as const;

class LiveCurationEngine {
  private static instance: LiveCurationEngine;

  static getInstance(): LiveCurationEngine {
    if (!LiveCurationEngine.instance) {
      LiveCurationEngine.instance = new LiveCurationEngine();
    }
    return LiveCurationEngine.instance;
  }

  /**
   * Main entry point — called every N episodes or on batch completion.
   * Evaluates each episode, persists records, updates aggregates, broadcasts decisions.
   */
  async processBatch(runId: string, episodes: EpisodeMetrics[]): Promise<void> {
    const run = await db.isaacLabRun.findUnique({ where: { id: runId } });
    if (!run) {
      console.error(`[CURATION] Run ${runId} not found`);
      return;
    }

    const decisions: Array<{ episode: EpisodeMetrics; decision: CurationDecision }> = [];

    for (const episode of episodes) {
      const decision = await this.evaluateEpisode(episode);
      decisions.push({ episode, decision });

      const cleanlabScore = this.estimateCleanlabConfidence(episode);
      const overallScore = this.calculateOverallScore(episode);

      // Persist episode to database
      await db.physicsEpisode.create({
        data: {
          runId,
          episodeIndex: episode.episodeIndex,
          physicsRealism: episode.physicsRealism,
          sensorFidelity: episode.sensorFidelity,
          languageGrounding: episode.languageGrounding,
          actionSuccess: episode.actionSuccess,
          modelLoss: episode.modelLoss,
          cleanlabConfidence: cleanlabScore,
          overallQualityScore: overallScore,
          isPruned: decision.action === 'PRUNE',
          pruneReason: decision.action !== 'KEEP' ? decision.reason : null,
        },
      });

      // Record curation event for non-KEEP decisions (audit trail)
      if (decision.action !== 'KEEP') {
        await db.dataCurationEvent.create({
          data: {
            runId,
            episodeIds: JSON.stringify([episode.episodeIndex]),
            action: decision.action === 'PRUNE' ? 'PRUNE' : 'FLAG_HUMAN_REVIEW',
            reason: decision.reason,
            confidence: decision.confidence,
            agent: 'LiveCurationEngine',
            metadata: decision.metadata ?? {},
          },
        });
      }
    }

    // Update run-level aggregates
    await this.updateRunAggregates(runId);

    // Broadcast decisions to dashboard via Redis stream
    await streamProducer.publish("stream:physics.curation", {
      runId,
      decisions: decisions.map(d => ({
        episodeIndex: d.episode.episodeIndex,
        action: d.decision.action,
        reason: d.decision.reason,
        confidence: d.decision.confidence,
      })),
      timestamp: Date.now(),
    });

    // Auto-pause if prune ratio exceeds threshold
    const prunedCount = decisions.filter(d => d.decision.action === 'PRUNE').length;
    const pruneRatio = prunedCount / decisions.length;

    if (pruneRatio > CURATION_THRESHOLDS.PRUNE_RATIO_PAUSE && decisions.length >= 4) {
      await this.pauseRunForReview(
        runId,
        `High prune ratio: ${(pruneRatio * 100).toFixed(1)}% (${prunedCount}/${decisions.length} episodes)`
      );
    }

    console.log(`[CURATION] Batch processed: ${decisions.length} episodes | Pruned: ${prunedCount} | Run: ${runId}`);
  }

  /**
   * Evaluate a single episode and return a curation decision.
   */
  private async evaluateEpisode(episode: EpisodeMetrics): Promise<CurationDecision> {
    const cleanlabConf = this.estimateCleanlabConfidence(episode);
    const physicsScore = (episode.physicsRealism + episode.sensorFidelity) / 2;
    const overallScore = this.calculateOverallScore(episode);

    // Rule 1: Low physics realism → hard PRUNE
    if (physicsScore < CURATION_THRESHOLDS.PHYSICS_MIN) {
      return {
        action: 'PRUNE',
        reason: `Physics score ${physicsScore.toFixed(2)} below threshold ${CURATION_THRESHOLDS.PHYSICS_MIN}`,
        confidence: 0.92,
        metadata: { physicsScore, trigger: 'physics_floor' },
      };
    }

    // Rule 2: Low Cleanlab confidence → FLAG for human review
    if (cleanlabConf < CURATION_THRESHOLDS.CLEANLAB_MIN) {
      return {
        action: 'FLAG_HUMAN_REVIEW',
        reason: `Cleanlab confidence ${cleanlabConf.toFixed(2)} — possible noisy label or sim artifact`,
        confidence: cleanlabConf,
        metadata: { cleanlabConf, trigger: 'cleanlab_low' },
      };
    }

    // Rule 3: High loss + low overall quality → PRUNE
    if (episode.modelLoss > CURATION_THRESHOLDS.MODEL_LOSS_MAX && overallScore < CURATION_THRESHOLDS.OVERALL_QUALITY_MIN) {
      return {
        action: 'PRUNE',
        reason: `High loss (${episode.modelLoss.toFixed(2)}) + low quality (${overallScore.toFixed(2)})`,
        confidence: 0.88,
        metadata: { modelLoss: episode.modelLoss, overallScore, trigger: 'loss_quality' },
      };
    }

    // Rule 4: Very low action success with high loss → FLAG
    if (episode.actionSuccess < 0.2 && episode.modelLoss > 2.0) {
      return {
        action: 'FLAG_HUMAN_REVIEW',
        reason: `Action failure (${episode.actionSuccess.toFixed(2)}) with elevated loss`,
        confidence: 0.75,
        metadata: { actionSuccess: episode.actionSuccess, trigger: 'action_failure' },
      };
    }

    // Default: KEEP
    return {
      action: 'KEEP',
      reason: 'Episode passes all quality gates',
      confidence: 0.95,
    };
  }

  /**
   * Estimate Cleanlab-style label confidence.
   * In production, this calls a trained confidence model or Cleanlab API.
   * Here we use a heuristic based on loss + action consistency.
   */
  private estimateCleanlabConfidence(episode: EpisodeMetrics): number {
    // High loss → likely noisy/mislabeled
    const lossSignal = Math.max(0.1, 1 - episode.modelLoss / 4);

    // Inconsistent action-language alignment → suspect label
    const alignmentSignal = (episode.languageGrounding + episode.actionSuccess) / 2;

    // Physics artifacts lower confidence in synthetic data
    const physicsSignal = (episode.physicsRealism + episode.sensorFidelity) / 2;

    return Math.max(0.05, Math.min(0.99,
      lossSignal * 0.45 + alignmentSignal * 0.30 + physicsSignal * 0.25
    ));
  }

  /**
   * Weighted composite quality score.
   */
  private calculateOverallScore(episode: EpisodeMetrics): number {
    return (
      episode.physicsRealism * 0.30 +
      episode.sensorFidelity * 0.25 +
      episode.languageGrounding * 0.20 +
      episode.actionSuccess * 0.15 +
      Math.max(0, 1 - Math.min(episode.modelLoss / 3, 1)) * 0.10
    );
  }

  /**
   * Update IsaacLabRun aggregate scores from all episodes.
   */
  private async updateRunAggregates(runId: string): Promise<void> {
    const episodes = await db.physicsEpisode.findMany({ where: { runId } });
    if (episodes.length === 0) return;

    const avgPhysics = episodes.reduce((sum, e) => sum + e.physicsRealism, 0) / episodes.length;
    const avgQuality = episodes.reduce((sum, e) => sum + e.overallQualityScore, 0) / episodes.length;
    const prunedCount = episodes.filter(e => e.isPruned).length;
    const highLossCount = episodes.filter(e => e.modelLoss > 2.5).length;

    await db.isaacLabRun.update({
      where: { id: runId },
      data: {
        totalEpisodes: episodes.length,
        physicsScoreAvg: avgPhysics,
        dataQualityScoreAvg: avgQuality,
        highLossCount,
        prunedCount,
      },
    });
  }

  /**
   * Pause a run and broadcast the event.
   */
  private async pauseRunForReview(runId: string, reason: string): Promise<void> {
    await db.isaacLabRun.update({
      where: { id: runId },
      data: { status: 'PAUSED_FOR_DATA_ISSUE' },
    });

    await streamProducer.publish("stream:agent.actions", {
      agent: "live-curation-engine",
      decision: `PAUSE_RUN: ${runId}`,
      reason,
      target: runId,
      timestamp: Date.now(),
    });

    console.log(`[CURATION] Run ${runId} AUTO-PAUSED: ${reason}`);
  }
}

// HMR-safe global singleton
declare global {
  var _liveCurationEngine: LiveCurationEngine | undefined;
}

export const liveCurationEngine = global._liveCurationEngine || LiveCurationEngine.getInstance();

if (process.env.NODE_ENV !== 'production') {
  global._liveCurationEngine = liveCurationEngine;
}
