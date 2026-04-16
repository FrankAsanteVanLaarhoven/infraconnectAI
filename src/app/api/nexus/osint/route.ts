import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchChokepointIntel, fetchMarketPulse } from "@/lib/nexus/osint-fusion";
import { calculateThreatExposure, getSystemWideRisk } from "@/lib/nexus/threatMatrix";

export async function GET() {
  try {
    const maritimeAlerts = fetchChokepointIntel();
    const marketPulses = fetchMarketPulse();
    
    // Fetch live CRM leads
    const leads = await db.lead.findMany({
      where: {
        status: { notIn: ['closed', 'archived'] }
      }
    });

    const threatenedLeads = calculateThreatExposure(leads, maritimeAlerts, marketPulses);
    const systemRisk = getSystemWideRisk(threatenedLeads);

    // Calculate total magnitude at risk (Risk Score > 50)
    const atRiskMagnitude = threatenedLeads
      .filter(l => l.riskScore > 50)
      .reduce((acc, l) => acc + l.projectedValue, 0);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      systemRisk,
      atRiskMagnitude,
      maritimeAlerts,
      marketPulses,
      threatenedLeads: threatenedLeads.sort((a, b) => b.riskScore - a.riskScore)
    });
  } catch (error) {
    console.error("[API_OSINT_ERROR]", error);
    return NextResponse.json({ error: "Intelligence fusion failure" }, { status: 500 });
  }
}
