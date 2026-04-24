import { db } from '@/lib/db';
import { streamProducer } from '@/infrastructure/redis/producer';

/**
 * Data Curation Agent — Hybrid Intelligence for Episode Quality
 * 
 * Runs Cleanlab confidence + WeightsLab high-loss detection on both
 * real and synthetic data. Promotes high-value episodes to L1.5
 * "Physics Canon" memory stratum.
 * 
 * Operates on completed batches (post-LiveCurationEngine) and
 * performs deeper analysis for promotion candidates.
 */

const PROMOTION_THRESHOLD = 0.90;  // Episodes scoring above this are promotion candidates
const HIGH_LOSS_PERCENTILE = 0.95; // Top 5% loss episodes get flagged

/**
 * Analyze completed episodes in a run and promote high-value ones
 * to the Physics Canon memory stratum.
 */
export async function dataCurationAgent(runId: string) {
  console.log(`[DATA_CURATION_AGENT] Analyzing run ${runId} for promotion candidates`);

  const episodes = await db.physicsEpisode.findMany({
    where: { runId, isPruned: false },
    orderBy: { overallQualityScore: 'desc' },
  });

  if (episodes.length === 0) return;

  // Identify promotion candidates (top-tier episodes)
  const promotionCandidates = episodes.filter(e => e.overallQualityScore >= PROMOTION_THRESHOLD);

  for (const candidate of promotionCandidates) {
    // Skip if already linked to a memory node
    if (candidate.memoryNodeId) continue;

    // Create a Physics Canon memory node (L1 level, pending promotion to L2)
    try {
      const memoryNode = await db.memoryNode.create({
        data: {
          shortId: `phys-${candidate.id.slice(-8)}`,
          slug: `physics-episode-${candidate.runId.slice(-6)}-${candidate.episodeIndex}`,
          title: `Physics Episode #${candidate.episodeIndex} (Quality: ${candidate.overallQualityScore.toFixed(2)})`,
          summary: `High-quality Isaac Lab episode. Physics: ${candidate.physicsRealism.toFixed(2)}, Sensor: ${candidate.sensorFidelity.toFixed(2)}, VLA: ${candidate.languageGrounding.toFixed(2)}, Action: ${candidate.actionSuccess.toFixed(2)}, Loss: ${candidate.modelLoss.toFixed(3)}`,
          level: 'L1',
          plane: 'execution',
          kind: 'experiment',
          state: 'active',
          confidence: candidate.overallQualityScore,
          tags: JSON.stringify(['physics-canon', 'isaac-lab', 'vla', 'auto-promoted']),
          createdBy: 'agent/data-curation',
          metadata: {
            runId: candidate.runId,
            episodeIndex: candidate.episodeIndex,
            scores: {
              physics: candidate.physicsRealism,
              sensor: candidate.sensorFidelity,
              language: candidate.languageGrounding,
              action: candidate.actionSuccess,
              cleanlab: candidate.cleanlabConfidence,
            },
          },
        },
      });

      // Link episode to memory node
      await db.physicsEpisode.update({
        where: { id: candidate.id },
        data: { memoryNodeId: memoryNode.id },
      });

      // Record curation event
      await db.dataCurationEvent.create({
        data: {
          runId,
          episodeIds: JSON.stringify([candidate.episodeIndex]),
          action: 'PROMOTE_TO_CANON',
          reason: `Episode quality ${candidate.overallQualityScore.toFixed(2)} exceeds promotion threshold ${PROMOTION_THRESHOLD}`,
          confidence: candidate.overallQualityScore,
          agent: 'DataCurationAgent',
          metadata: { memoryNodeId: memoryNode.id },
        },
      });

      console.log(`[DATA_CURATION_AGENT] Promoted episode ${candidate.episodeIndex} → Memory Node ${memoryNode.shortId}`);
    } catch (e) {
      // Slug collision or other constraint violation — skip silently
      console.warn(`[DATA_CURATION_AGENT] Promotion failed for episode ${candidate.episodeIndex}:`, e);
    }
  }

  // Identify high-loss outliers for WeightsLab-style flagging
  const lossValues = episodes.map(e => e.modelLoss).sort((a, b) => a - b);
  const p95Index = Math.floor(lossValues.length * HIGH_LOSS_PERCENTILE);
  const p95Threshold = lossValues[p95Index] || Infinity;

  const highLossEpisodes = episodes.filter(e => e.modelLoss >= p95Threshold && !e.isPruned);

  if (highLossEpisodes.length > 0) {
    await db.dataCurationEvent.create({
      data: {
        runId,
        episodeIds: JSON.stringify(highLossEpisodes.map(e => e.episodeIndex)),
        action: 'FLAG_HUMAN_REVIEW',
        reason: `${highLossEpisodes.length} episodes in P95 loss tail (>= ${p95Threshold.toFixed(2)})`,
        confidence: 0.70,
        agent: 'DataCurationAgent',
        metadata: { p95Threshold, count: highLossEpisodes.length },
      },
    });
  }

  // Broadcast summary to dashboard
  await streamProducer.publish("stream:agent.actions", {
    agent: "data-curation-agent",
    decision: `ANALYSIS_COMPLETE`,
    reason: `Promoted: ${promotionCandidates.length} | High-loss flagged: ${highLossEpisodes.length} | Total: ${episodes.length}`,
    target: runId,
    timestamp: Date.now(),
  });
}
