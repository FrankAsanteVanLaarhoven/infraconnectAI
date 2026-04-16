import { db } from "@/lib/db";
import { generateFollowUpContent } from "./followup";
import { sendSmartEmail } from "@/lib/email";

/**
 * Runs a single cycle of the autonomous sales operator.
 * Finds leads needing follow-up and dispatches them.
 */
export async function runFollowupCycle() {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

  // 1. Find Leads: Score > 75, No reply yet, Not emailed in last 3 days
  const targetLeads = await db.lead.findMany({
    where: {
      score: { gte: 75 },
      replied: false,
      OR: [
        { lastEmailSent: null },
        { lastEmailSent: { lt: threeDaysAgo } }
      ],
      status: { not: 'closed' }
    },
    take: 10 // Limit per cycle for safety
  });

  const results = [];

  for (const lead of targetLeads) {
    try {
      console.log(`[OPERATOR_CYCLE] Processing: ${lead.email}`);
      
      // A. Generate content (or use existing template-based generator)
      // For full automation, we'll use the smart generator
      const res = await sendSmartEmail(lead);

      if (res.success) {
        // B. Update Lead State
        await db.lead.update({
          where: { id: lead.id },
          data: {
            lastEmailSent: new Date(),
            nextAction: "Automated Follow-up Dispatched",
            status: lead.status === 'new' ? 'qualified' : lead.status
          }
        });
        results.push({ email: lead.email, status: 'sent' });
      } else {
        results.push({ email: lead.email, status: 'failed', error: res.error });
      }
    } catch (err) {
      console.error(`[OPERATOR_CYCLE_FAIL] ${lead.email}`, err);
      results.push({ email: lead.email, status: 'error', error: err });
    }
  }

  return {
    timestamp: now.toISOString(),
    processedCount: targetLeads.length,
    results
  };
}
