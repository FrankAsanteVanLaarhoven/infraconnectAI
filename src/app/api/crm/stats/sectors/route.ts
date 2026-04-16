import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stats = await db.lead.groupBy({
      by: ['sector'],
      _sum: {
        projectedValue: true
      },
      _count: {
        id: true
      },
      where: {
        status: { not: 'archived' }
      }
    });

    // Map to a more UI-friendly format
    const formattedStats = stats.map(s => ({
      sector: s.sector || 'Unclassified',
      totalValue: s._sum.projectedValue || 0,
      count: s._count.id,
      magnitude: (s._sum.projectedValue || 0) / 1000 // Magnitude index
    }));

    const totalMagnitude = formattedStats.reduce((acc, curr) => acc + curr.totalValue, 0);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalMagnitude,
      sectors: formattedStats
    });
  } catch (error) {
    console.error("[API_SECTOR_STATS_ERROR]", error);
    return NextResponse.json({ error: "Aggregation failure" }, { status: 500 });
  }
}
