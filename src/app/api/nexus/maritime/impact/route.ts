import { NextResponse } from "next/server";
import { vesselFleetEngine } from "@/lib/nexus/vesselFleetEngine";

export async function GET() {
  try {
    const vessels = vesselFleetEngine.getVessels();
    const darkVessels = vessels.filter(v => v.status === 'DARK').length;
    const deviatingVessels = vessels.filter(v => v.status === 'DEVIATING').length;

    // Simulation logic for Ripple Impact
    const baseRisk = 0.15;
    const darkRisk = darkVessels * 0.12; // 12% increase per dark vessel (Hormuz risk)
    const deviationRisk = deviatingVessels * 0.08; // 8% increase per deviation (Malacca risk)
    
    const totalRisk = Math.min(0.95, baseRisk + darkRisk + deviationRisk);
    const pricingDelta = totalRisk * 12.5; // Up to +$12.5M impact

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      maritimeRiskIndex: totalRisk,
      pricingDeltaM: pricingDelta.toFixed(2),
      impactSummary: totalRisk > 0.5 
        ? "CRITICAL: Maritime chokepoints show extreme load. Pricing surge imminent." 
        : "STABLE: Standard transit patterns detected.",
      sectorImpacts: [
        { sector: 'ENERGY', delta: `+${(totalRisk * 8.4).toFixed(1)}%` },
        { sector: 'GOV', delta: `+${(totalRisk * 3.2).toFixed(1)}%` },
        { sector: 'TECH', delta: `+${(totalRisk * 5.1).toFixed(1)}%` }
      ]
    });
  } catch (error) {
    return NextResponse.json({ error: "Impact calculation failed" }, { status: 500 });
  }
}
