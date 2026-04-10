import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const nodes = await db.memoryNode.findMany();

    const levels = ['L0', 'L1', 'L2'] as const;
    const planes = ['execution', 'memory', 'governance'] as const;

    const byLevel: Record<string, { count: number; avgHealth: number }> = {};
    const byPlane: Record<string, { count: number; avgHealth: number }> = {};

    levels.forEach(l => {
      const ln = nodes.filter(n => n.level === l);
      byLevel[l] = {
        count: ln.length,
        avgHealth: ln.length > 0 ? ln.reduce((s, n) => s + n.healthScore, 0) / ln.length : 0,
      };
    });

    planes.forEach(p => {
      const pn = nodes.filter(n => n.plane === p);
      byPlane[p] = {
        count: pn.length,
        avgHealth: pn.length > 0 ? pn.reduce((s, n) => s + n.healthScore, 0) / pn.length : 0,
      };
    });

    // Compute metrics
    const totalConflicts = nodes.reduce((s, n) => s + n.conflictCount, 0);
    const conflictDensity = nodes.length > 0 ? Math.min(totalConflicts / nodes.length / 5, 1) : 0;

    const nodesWithContent = nodes.filter(n => n.content && n.content.length > 20).length;
    const coverage = nodes.length > 0 ? nodesWithContent / nodes.length : 0;

    const now = Date.now();
    const staleNodes = nodes.filter(n => {
      const last = n.lastValidated ? new Date(n.lastValidated).getTime() : new Date(n.createdAt).getTime();
      return (now - last) > 30 * 86400000; // 30 days
    });
    const staleness = nodes.length > 0 ? staleNodes.length / nodes.length : 0;

    // Simple redundancy estimation (nodes with similar titles)
    const titleLower = nodes.map(n => n.title.toLowerCase());
    let redundantPairs = 0;
    for (let i = 0; i < titleLower.length; i++) {
      for (let j = i + 1; j < titleLower.length; j++) {
        if (titleLower[i].includes(titleLower[j]) || titleLower[j].includes(titleLower[i])) {
          redundantPairs++;
        }
      }
    }
    const redundancy = nodes.length > 1 ? Math.min(redundantPairs / nodes.length / 2, 1) : 0;

    // Overall health
    const avgHealth = nodes.length > 0
      ? nodes.reduce((s, n) => s + n.healthScore, 0) / nodes.length
      : 0;
    const overall = (
      avgHealth * 0.4 +
      coverage * 0.25 +
      (1 - conflictDensity) * 0.15 +
      (1 - staleness) * 0.1 +
      (1 - redundancy) * 0.1
    );

    return NextResponse.json({
      overall: Math.round(overall * 100) / 100,
      conflictDensity: Math.round(conflictDensity * 100) / 100,
      coverage: Math.round(coverage * 100) / 100,
      staleness: Math.round(staleness * 100) / 100,
      redundancy: Math.round(redundancy * 100) / 100,
      nodeCount: nodes.length,
      byLevel,
      byPlane,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
