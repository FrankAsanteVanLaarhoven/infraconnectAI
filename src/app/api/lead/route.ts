import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scoreLead } from "@/lib/revenue/aiScoring";
import { sendSmartEmail } from "@/lib/email";

import { processLeadActivity } from "@/lib/revenue/alerts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, company, role, message, source } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // 1. Calculate Autonomic Score
    const score = await scoreLead({ email, company, message });
    const intent = score > 70 ? "high" : score > 40 ? "medium" : "low";

    // 2. Persist Lead to DB
    let lead;
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      lead = {
        id: "mock_lead_" + Date.now(),
        email,
        company: company || null,
        role: role || null,
        message: message || null,
        score,
        intent,
        source: source || "landing",
        visitedDemo: body.visitedDemo || false,
        viewedSecurity: body.viewedSecurity || false,
      };
    } else {
      lead = await db.lead.upsert({
        where: { email },
        update: {
          company: company || undefined,
          role: role || undefined,
          message: message || undefined,
          score: score > 0 ? score : undefined,
          intent: intent || undefined,
          source: source || undefined,
          visitedDemo: body.visitedDemo ?? undefined,
          viewedSecurity: body.viewedSecurity ?? undefined,
          updatedAt: new Date(),
        },
        create: {
          email,
          company,
          role,
          message,
          score,
          intent,
          source: source || "landing",
          visitedDemo: body.visitedDemo || false,
          viewedSecurity: body.viewedSecurity || false,
        },
      });
    }

    // 3. Trigger Smart Email (Auto-Responder)
    // Removed score limits for testing to ensure emails are ALWAYS sent.
    if (!body.visitedDemo && !body.viewedSecurity) {
      await sendSmartEmail(lead);
    }

    // 4. FOUNDER ALERT (High Intent Monitoring)
    const activityTrigger = body.visitedDemo ? 'visitedDemo' : body.viewedSecurity ? 'viewedSecurity' : 'initial_capture';
    await processLeadActivity(lead, activityTrigger);

    console.log(`[LEAD_PROCESSED] Email: ${email}, Score: ${score}, Intent: ${intent}`);

    return NextResponse.json({ 
      success: true, 
      leadId: lead.id,
      score,
      intent 
    });
  } catch (error) {
    console.error("[API_LEAD_ERROR]", error);
    return NextResponse.json({ error: "Internal processing failure" }, { status: 500 });
  }
}
