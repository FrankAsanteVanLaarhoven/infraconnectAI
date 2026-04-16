import { NextResponse } from "next/server";
import { KNOWLEDGE_BASE } from "@/lib/nexus/intelligence";
import { STRATEGIC_IP_PORTFOLIO, getPortfolioResilience, getTotalIPMagnitude } from "@/lib/nexus/ipTracker";
import { checkGovernance } from "@/lib/nexus/governance";

export async function GET() {
  try {
    const governance = checkGovernance('ENERGY', 'Execute Grid Persistence Policy');
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      governance,
      ip: {
        portfolio: STRATEGIC_IP_PORTFOLIO,
        resilience: getPortfolioResilience(),
        totalMagnitude: getTotalIPMagnitude()
      },
      knowledgeBase: KNOWLEDGE_BASE.LAW,
    });
  } catch (error) {
    console.error("[API_LEGAL_ERROR]", error);
    return NextResponse.json({ error: "Sovereign Audit failure" }, { status: 500 });
  }
}
