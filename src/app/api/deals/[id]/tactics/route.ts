import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateLeadROI } from "@/lib/revenue/roiEngine";
import { generateTacticalSuggestion, logDealActivity, ObjectionType } from "@/lib/revenue/tactics";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { type, message } = body; // type is ObjectionType

    const lead = await db.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const roi = calculateLeadROI(lead.score, lead.projectedValue, lead.companySize || undefined);
    const suggestion = generateTacticalSuggestion(type as ObjectionType, roi);

    // Update lead score and log activity
    await db.lead.update({
      where: { id },
      data: {
        score: Math.min(lead.score + suggestion.deltaScore, 100),
      }
    });

    await logDealActivity(
      lead.id, 
      'tactical_adjustment', 
      `Founder consulted AI on ${type} objection. Rebuttal provided: "${suggestion.rebuttal.substring(0, 50)}..."`
    );

    return NextResponse.json({
        ...suggestion,
        newScore: Math.min(lead.score + suggestion.deltaScore, 100)
    });
  } catch (error) {
    console.error("[API_DEAL_TACTICS_ERROR]", error);
    return NextResponse.json({ error: "Tactical sync failed" }, { status: 500 });
  }
}

// GET Activity Feed
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activities = await db.dealActivity.findMany({
      where: { leadId: id },
      orderBy: { timestamp: 'desc' }
    });
    return NextResponse.json({ activities });
  } catch (error) {
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}
