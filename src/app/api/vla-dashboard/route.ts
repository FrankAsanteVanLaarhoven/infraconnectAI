import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET() {
  try {
    const [directives, recentViolations, skillStats, health] = await Promise.all([
      prisma.safetyDirective.findMany({
        include: {
          _count: {
            select: { violations: true }
          }
        }
      }),
      prisma.operationalViolation.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.skillRun.aggregate({
        _count: { id: true },
        where: { status: 'passed' }
      }),
      prisma.healthProjection.findUnique({
        where: { id: 'singleton' }
      })
    ]);

    const totalRuns = await prisma.skillRun.count();
    const activeConstraints = directives.length;
    const hardConstraints = directives.filter(d => d.severity.toLowerCase() === 'hard' || d.severity.toLowerCase() === 'critical');
    const hardConstraintsAtRisk = hardConstraints.filter(d => d._count.violations > 3).length;

    // Mock/Derived values for fields not directly in schema
    const deadlineCertified = true; // Placeholder for certification logic
    const constraintCoverage = activeConstraints > 0 ? 0.95 : 0; 
    const transferReadiness = health ? health.overall / 100 : 0.85;

    return NextResponse.json({
      systemHealth: {
        hardConstraintsAtRisk,
        deadlineCertified,
        activeConstraints,
        totalViolations24h: recentViolations,
        constraintCoverage,
        transferReadiness,
        successRate: totalRuns > 0 ? skillStats._count.id / totalRuns : 1
      },
      directives: directives.map(d => ({
        id: d.id,
        name: d.name,
        severity: d.severity,
        domain: d.domain,
        violationCount: d._count.violations,
        lastTestedAt: d.lastTestedAt
      }))
    });
  } catch (error) {
    console.error("[VLA_DASHBOARD_ERROR]", error);
    return NextResponse.json({ 
      error: "Failed to fetch VLA dashboard data",
      details: String(error)
    }, { status: 500 });
  }
}
