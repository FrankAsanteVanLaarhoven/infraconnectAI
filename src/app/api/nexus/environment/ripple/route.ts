import { NextResponse } from "next/server";
import { environmentalEngine } from "@/lib/nexus/environmentalEngine";

export async function GET() {
  try {
    const metrics = environmentalEngine.getMetrics();
    const planetaryRisk = environmentalEngine.getOverallPlanetaryRisk();
    
    // Simulation logic for Sustainability Impact
    const pricingDeltaM = planetaryRisk * 45.2; // Up to +$45.2M impact on insurance/real-estate
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      planetaryRiskIndex: planetaryRisk.toFixed(2),
      pricingDeltaM: pricingDeltaM.toFixed(2),
      summary: planetaryRisk > 0.4 
        ? "CRITICAL: Environmental anomalies detected. Adjusting Real Estate Risk Premiums." 
        : "STABLE: Planetary biosphere within operating bounds.",
      sectorDeltas: [
        { sector: 'REAL_ESTATE', delta: `+${(planetaryRisk * 15.4).toFixed(1)}%` },
        { sector: 'INSURANCE', delta: `+${(planetaryRisk * 22.1).toFixed(1)}%` },
        { sector: 'AGRICULTURE', delta: `+${(planetaryRisk * 12.8).toFixed(1)}%` }
      ]
    });
  } catch (error) {
    return NextResponse.json({ error: "Ripple calculation failed" }, { status: 500 });
  }
}
