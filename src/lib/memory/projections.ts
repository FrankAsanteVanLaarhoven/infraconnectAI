import { db } from '@/lib/db';
import { DomainEvent } from '@prisma/client';

export async function updateAllProjections(event?: DomainEvent) {
  try {
    const sourceEventId = event?.id || 'manual_sync';
    
    console.log(`[Projections] Running update for event: ${sourceEventId}`);

    // Query required data
    const nodes = await db.memoryNode.findMany();
    const conflicts = await db.conflict.count({ where: { status: 'open' } });
    const runs = await db.skillRun.count({ where: { status: 'passed' } });

    // Aggregate counts
    const levelCounts: Record<string, number> = { L0: 0, L1: 0, L2: 0 };
    const planeCounts: Record<string, number> = { execution: 0, memory: 0, governance: 0 };
    let canonicalKnowledge = 0;
    let scratchItems = 0;
    let wikiEntries = 0;

    nodes.forEach(n => {
      levelCounts[n.level] = (levelCounts[n.level] || 0) + 1;
      planeCounts[n.plane] = (planeCounts[n.plane] || 0) + 1;
      
      if (n.state === 'canonical') canonicalKnowledge++;
      else if (n.state === 'active') wikiEntries++;
      else scratchItems++;
    });

    // 1. Dashboard Projection
    await db.dashboardProjection.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        totalNodes: nodes.length,
        completedSkills: runs,
        canonicalKnowledge,
        scratchItems,
        wikiEntries,
        activeConflicts: conflicts,
        planeCounts,
        levelCounts,
        busStatus: 'live',
        busConnections: 2,
        sourceEventId,
      },
      update: {
        totalNodes: nodes.length,
        completedSkills: runs,
        canonicalKnowledge,
        scratchItems,
        wikiEntries,
        activeConflicts: conflicts,
        planeCounts,
        levelCounts,
        generatedAt: new Date(),
        sourceEventId,
      }
    });

    // 2. Health Projection
    const totalHealth = nodes.reduce((sum, n) => sum + (n.confidence ?? 1), 0);
    const avgHealth = nodes.length > 0 ? totalHealth / nodes.length : 1;
    
    const nodesWithContent = nodes.filter(n => (n.summary?.length || 0) > 20).length;
    const coverage = nodes.length > 0 ? nodesWithContent / nodes.length : 1;
    
    const conflictDensity = nodes.length > 0 ? Math.min(conflicts / nodes.length / 5, 1) : 0;
    
    const now = Date.now();
    const staleNodes = nodes.filter(n => {
      const last = new Date(n.updatedAt).getTime();
      return (now - last) > 30 * 86400000;
    });
    const staleness = nodes.length > 0 ? staleNodes.length / nodes.length : 0;

    const byLevelState: Record<string, any> = {};
    Object.keys(levelCounts).forEach(l => {
      const subset = nodes.filter(n => n.level === l);
      byLevelState[l] = { 
        count: subset.length, 
        avgHealth: subset.length > 0 ? subset.reduce((s, x) => s + (x.confidence ?? 1), 0) / subset.length : 1 
      };
    });

    const byPlaneState: Record<string, any> = {};
    Object.keys(planeCounts).forEach(p => {
      const subset = nodes.filter(n => n.plane === p);
      byPlaneState[p] = { 
        count: subset.length, 
        avgHealth: subset.length > 0 ? subset.reduce((s, x) => s + (x.confidence ?? 1), 0) / subset.length : 1 
      };
    });

    const overall = (avgHealth * 0.4 + coverage * 0.25 + (1 - conflictDensity) * 0.15 + (1 - staleness) * 0.1);

    await db.healthProjection.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        overall,
        policyVersion: 'v2.1',
        coverage,
        conflictDensity,
        staleness,
        redundancy: 0,
        byLevel: byLevelState,
        byPlane: byPlaneState,
        sourceEventId,
      },
      update: {
        overall,
        coverage,
        conflictDensity,
        staleness,
        byLevel: byLevelState,
        byPlane: byPlaneState,
        generatedAt: new Date(),
        sourceEventId,
      }
    });

    // 3. Activity Projection
    const recentEvents = await db.domainEvent.findMany({
      take: 20,
      orderBy: { timestamp: 'desc' }
    });
    
    await db.activityProjection.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        eventCount: recentEvents.length,
        recentEvents: JSON.stringify(recentEvents),
        sourceEventId,
      },
      update: {
        eventCount: await db.domainEvent.count(),
        recentEvents: JSON.stringify(recentEvents),
        generatedAt: new Date(),
        sourceEventId,
      }
    });

    console.log(`[Projections] Sync complete.`);
  } catch (err) {
    console.error(`[Projections] Sync failing:`, err);
  }
}
