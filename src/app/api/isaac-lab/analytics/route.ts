import { NextRequest, NextResponse } from 'next/server';
import { infraAnalyticsEngine } from '@/lib/infraanalytics/engine';
import { infraPhysicsEngine } from '@/lib/infraphysics/engine';
import { infraCleanEngine } from '@/lib/infraclean/engine';
import { db } from '@/lib/db';

/**
 * Enhanced analytics endpoint — supports:
 * - Single run metrics (runId param)
 * - Run comparison (compare param with comma-separated IDs)
 * - All runs summary (no params)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');
  const compareIds = searchParams.get('compare');

  try {
    // Run comparison mode
    if (compareIds) {
      const ids = compareIds.split(',').filter(Boolean);
      if (ids.length < 2) {
        return NextResponse.json(
          { type: 'comparison', error: 'Provide at least 2 run IDs for comparison' },
          { status: 400 }
        );
      }
      const comparison = await infraAnalyticsEngine.compareRuns(ids);
      return NextResponse.json({ type: 'comparison', data: comparison });
    }

    // Single run detailed metrics
    if (runId) {
      const metrics = await infraAnalyticsEngine.getRunMetrics(runId);

      // Also fetch physics health breakdown from InfraPhysics
      const physicsHealth = await infraPhysicsEngine.getPhysicsHealthBreakdown(runId);

      // Also fetch episodes for batch analysis from InfraClean
      const episodes = await db.physicsEpisode.findMany({
        where: { runId },
        orderBy: { episodeIndex: 'asc' },
      });

      let batchAnalysis: any = null;
      if (episodes.length > 0) {
        batchAnalysis = infraCleanEngine.analyzeBatch(
          episodes.map((ep) => ({
            modelLoss: ep.modelLoss,
            physicsRealism: ep.physicsRealism,
            sensorFidelity: ep.sensorFidelity,
            languageGrounding: ep.languageGrounding,
            actionSuccess: ep.actionSuccess,
          }))
        );
      }

      return NextResponse.json({
        type: 'single',
        data: metrics,
        physicsHealth,
        batchAnalysis,
      });
    }

    // All runs summary (for comparison selector)
    const allRuns = await infraAnalyticsEngine.getAllRunSummaries();
    return NextResponse.json({ type: 'all-runs', data: allRuns });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { type: 'error', error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
