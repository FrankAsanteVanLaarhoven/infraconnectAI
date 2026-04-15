import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dashboard = await db.dashboardProjection.findUnique({
      where: { id: "singleton" }
    });
    
    if (!dashboard) {
        return NextResponse.json({
          totalNodes: 0,
          completedSkills: 0,
          canonicalKnowledge: 0,
          scratchItems: 0,
          wikiEntries: 0,
          activeConflicts: 0,
          busStatus: 'offline',
          timestamp: new Date().toISOString()
        });
    }

    return NextResponse.json({
      totalNodes: dashboard.totalNodes,
      completedSkills: dashboard.completedSkills,
      canonicalKnowledge: dashboard.canonicalKnowledge,
      scratchItems: dashboard.scratchItems,
      wikiEntries: dashboard.wikiEntries,
      activeConflicts: dashboard.activeConflicts,
      busStatus: dashboard.busStatus,
      busConnections: dashboard.busConnections,
      timestamp: dashboard.generatedAt.toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
