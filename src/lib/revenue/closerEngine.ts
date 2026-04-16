import { db } from "@/lib/db";
import { generateSmartEmail } from "./aiEmail";
import { vesselFleetEngine } from "@/lib/nexus/vesselFleetEngine";
import { environmentalEngine } from "@/lib/nexus/environmentalEngine";

/**
 * Autonomous Closer Engine
 * 
 * Handles leads in the final 10% of the funnel.
 * Uses tactical aggression to force decisions based on external volatility.
 */
export async function runCloserCycle(aggressionLevel: number = 0.5) {
  const highValueLeads = await db.lead.findMany({
    where: {
      score: { gte: 90 },
      status: { notIn: ['closed', 'lost'] },
      replied: true // Only close leads that have already engaged
    }
  });

  const results = [];

  for (const lead of highValueLeads) {
    const darkVessels = vesselFleetEngine.detectDarkVessels().length;
    const planetaryRisk = environmentalEngine.getOverallPlanetaryRisk();

    // Determine if we should push a "Tactical Close"
    const shouldPush = (aggressionLevel > 0.7) || (darkVessels > 5) || (planetaryRisk > 0.4);

    if (shouldPush) {
      console.log(`[CLOSER_ENGINE] Initiating Tactical Close for: ${lead.email}`);
      
      const closingPitch = await generateSmartEmail({
        ...lead,
        intent: "TACTICAL_CLOSURE_INITIATED",
        score: 100 // Maximum urgency for the closer
      });

      // Update lead with Closure status
      await db.lead.update({
        where: { id: lead.id },
        data: {
          status: 'closing',
          nextAction: `Tactical Strike Dispatched (Aggression: ${aggressionLevel})`,
          lastEmailSent: new Date()
        }
      });

      results.push({ email: lead.email, action: 'TACTICAL_CLOSE_SENT', riskContext: planetaryRisk });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    closuresInitiated: results.length,
    results
  };
}
