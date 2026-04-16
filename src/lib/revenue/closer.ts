/**
 * Victory Synthesis & Closer Engine
 * 
 * Finalizes deals and prepares the technical onboarding path.
 */

import { db } from "@/lib/db";
import { logDealActivity } from "./tactics";

export async function finalizeDeal(leadId: string) {
  try {
    const lead = await db.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error("Lead not found");

    // 1. Update Lead Status
    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: {
        status: 'closed',
        nextAction: 'Onboarding Integrated',
        score: 100
      }
    });

    // 2. Log Victory Activity
    await logDealActivity(
      leadId,
      'victory', 
      `Deal Finalized autonomously via Portal. Total Magnitude Confirmed: £${lead.projectedValue?.toLocaleString() || 'Enterprise'}.`
    );

    // 3. Generate Onboarding Brief
    const onboardingBrief = `
      WELCOME TO THE NEURAL GRID, ${lead.company || lead.email}.
      
      PHASE 1: PROVISIONING [ACTIVE]
      PHASE 2: EDGE SHARDING [PENDING]
      PHASE 3: GOVERNANCE SYNC [INITIALIZING]
      
      Your first node has been reserved in the Global Device Registry.
      Our technical team will reach out within 4 hours to verify your sovereign keys.
    `;

    return { 
      success: true, 
      lead: updatedLead,
      onboardingBrief 
    };
  } catch (error) {
    console.error("CLOSE_DEAL_FAIL", error);
    return { success: false, error: "Finalization failure" };
  }
}
