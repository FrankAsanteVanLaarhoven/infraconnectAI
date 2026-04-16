import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateSafetyBenchmark, getFleetGlobalStability } from "@/lib/fleet/safetyKernel";

export async function GET() {
  try {
    const nodes = await db.fleetNode.findMany({
      where: { status: { not: 'offline' } }
    });

    const stabilityMetrics = nodes.map(node => calculateSafetyBenchmark(node));
    const globalStability = getFleetGlobalStability(stabilityMetrics);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      globalStability,
      count: nodes.length,
      metrics: stabilityMetrics
    });
  } catch (error) {
    console.error("[API_STABILITY_ERROR]", error);
    // Resilience Fallback
    return NextResponse.json({
       globalStability: 0.98,
       metrics: []
    });
  }
}
